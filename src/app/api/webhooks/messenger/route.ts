/**
 * Messenger webhook. OWNER: Lead (config/env) + Dev B (logic).
 * Pipeline 1 tin: verify chữ ký → parse event (text/postback/quick-reply) → dedupe(mid)
 *   → enqueue → acquire lock? → drain batch → ordering-agent-core → gửi reply (text + carousel + quick replies).
 * Push trạng thái đơn: notification-sender đăng ký listener (import side-effect bên dưới).
 */
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  sendTextMessage,
  sendTypingIndicator,
  sendMenuCarousel,
  sendQuickReplies,
} from "@/lib/channels/messenger-adapter";
import { registerOrderStatusNotifications } from "@/lib/channels/notification-sender";
import { runOrderingAgentTurn } from "@/lib/agent/ordering-agent-core";
import {
  getSession,
  tryAcquireProcessingLock,
  releaseProcessingLock,
} from "@/lib/agent/conversation-session-store";
import {
  recordIncomingMessage,
  peekUnprocessedMessages,
  markMessagesProcessed,
  recordOutgoingMessage,
} from "@/lib/agent/incoming-message-queue";
import { getMenuItemById } from "@/lib/services/menu-service";
import { OrderState } from "@/lib/types";

export const maxDuration = 60;

// Gắn listener push trạng thái đơn 1 lần khi module load (idempotent).
registerOrderStatusNotifications();

// Payload nút → câu người dùng tương đương, để agent xử lý qua tools (1 đường duy nhất).
const QUICK_REPLY_TEXT: Record<string, string> = {
  VIEW_MENU: "Cho em xem menu",
  PROMOS: "Có ưu đãi gì không",
  VIEW_CART: "Xem giỏ hàng của tôi",
  ORDER_STATUS: "Đơn của tôi tới đâu rồi",
  TALK_HUMAN: "Tôi muốn gặp nhân viên",
  PAY_COD: "Tôi thanh toán tiền mặt",
  PAY_QR: "Tôi thanh toán chuyển khoản QR",
  PAY_CARD: "Tôi thanh toán bằng thẻ",
};

// Meta xác minh webhook bằng GET: trả lại hub.challenge nếu verify_token khớp
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  if (p.get("hub.mode") === "subscribe" && p.get("hub.verify_token") === process.env.MESSENGER_VERIFY_TOKEN) {
    return new Response(p.get("hub.challenge") ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

/** Verify X-Hub-Signature-256 (HMAC SHA256 body với App Secret). Chưa set secret (dev) → cho qua. */
function verifySignature(req: NextRequest, rawBody: string): boolean {
  const secret = process.env.META_APP_SECRET;
  if (!secret) {
    // Prod PHẢI có secret — thiếu = từ chối (webhook không được để hở). Dev thì cho qua.
    if (process.env.NODE_ENV === "production") {
      console.error("META_APP_SECRET chưa set ở production — từ chối webhook.");
      return false;
    }
    return true;
  }
  const sig = req.headers.get("x-hub-signature-256");
  if (!sig) return false;
  const expected = "sha256=" + crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

type ParsedEvent = { psid: string; mid: string; text: string };

type MessagingEvent = {
  sender?: { id?: string };
  message?: { mid?: string; text?: string; is_echo?: boolean; quick_reply?: { payload?: string } };
  postback?: { mid?: string; payload?: string };
};
type WebhookBody = { object?: string; entry?: { messaging?: MessagingEvent[] }[] };

/** Chuẩn hoá 1 messaging event về {psid, mid, text}. null = event không xử lý được. */
async function parseEvent(event: MessagingEvent): Promise<ParsedEvent | null> {
  const psid: string | undefined = event.sender?.id;
  if (!psid) return null;
  const mid: string = event.message?.mid ?? event.postback?.mid ?? "";

  const qr: string | undefined = event.message?.quick_reply?.payload;
  if (qr && QUICK_REPLY_TEXT[qr]) return { psid, mid, text: QUICK_REPLY_TEXT[qr] };

  const pb: string | undefined = event.postback?.payload;
  if (pb?.startsWith("ADD_ITEM:")) {
    const item = await getMenuItemById(pb.slice("ADD_ITEM:".length));
    return { psid, mid, text: item ? `Cho em thêm 1 ${item.name}` : "Cho em thêm món vừa chọn ở menu" };
  }
  if (pb && QUICK_REPLY_TEXT[pb]) return { psid, mid, text: QUICK_REPLY_TEXT[pb] };

  const text: string | undefined = event.message?.text;
  if (text) return { psid, mid, text };
  return null;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  if (!verifySignature(req, rawBody)) return new Response("Invalid signature", { status: 403 });

  let body: WebhookBody;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: true });
  }
  if (body.object !== "page") return NextResponse.json({ ok: true });

  for (const entry of body.entry ?? []) {
    for (const event of entry.messaging ?? []) {
      if (event.message?.is_echo) continue; // tin do chính page gửi
      const parsed = await parseEvent(event);
      if (parsed) await handleIncoming(parsed);
    }
  }
  // LUÔN trả 200 — Meta retry dồn dập và có thể vô hiệu webhook nếu lỗi kéo dài
  return NextResponse.json({ ok: true });
}

async function handleIncoming({ psid, mid, text }: ParsedEvent): Promise<void> {
  await sendTypingIndicator(psid);

  // Dedupe: mid đã ghi (Meta gửi trùng) → bỏ qua, tránh double-reply.
  const fresh = await recordIncomingMessage(psid, mid, text);
  if (mid && !fresh) return;

  await getSession(psid); // đảm bảo row session tồn tại trước khi khoá
  if (!(await tryAcquireProcessingLock(psid))) return; // instance khác đang xử lý, sẽ drain gộp tin này

  try {
    const { ids, texts } = await peekUnprocessedMessages(psid);
    const messages = texts.length ? texts : [text];
    const reply = await runOrderingAgentTurn(psid, messages);
    // Turn xong mới đánh dấu processed — lỗi giữa chừng thì tin còn nguyên để xử lý lại (không mất tin).
    await markMessagesProcessed(ids);

    if (reply.text) {
      const state = (await getSession(psid)).state;
      const quick = quickRepliesForState(state);
      if (quick.length) await sendQuickReplies(psid, reply.text, quick);
      else await sendTextMessage(psid, reply.text);
      await recordOutgoingMessage(psid, reply.text);
    }
    if (reply.carouselItemIds?.length) await sendMenuCarousel(psid, reply.carouselItemIds);
  } catch (err) {
    console.error("handleIncoming lỗi:", err);
    await sendTextMessage(psid, "Dạ em bị lỗi xíu, anh/chị nhắn lại giúp em ạ 🙏");
  } finally {
    await releaseProcessingLock(psid);
  }
}

/** Quick replies gợi ý theo state — ở bước thanh toán đổi sang lựa chọn phương thức. */
function quickRepliesForState(state: OrderState): { title: string; payload: string }[] {
  if (state === "SELECTING_PAYMENT") {
    return [
      { title: "Tiền mặt", payload: "PAY_COD" },
      { title: "Chuyển khoản QR", payload: "PAY_QR" },
      { title: "Thẻ", payload: "PAY_CARD" },
      { title: "Gặp nhân viên", payload: "TALK_HUMAN" },
    ];
  }
  return [
    { title: "Xem menu", payload: "VIEW_MENU" },
    { title: "Ưu đãi", payload: "PROMOS" },
    { title: "Giỏ hàng", payload: "VIEW_CART" },
    { title: "Đơn của tôi", payload: "ORDER_STATUS" },
    { title: "Gặp nhân viên", payload: "TALK_HUMAN" },
  ];
}
