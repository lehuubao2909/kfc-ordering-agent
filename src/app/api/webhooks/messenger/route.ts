/**
 * Messenger webhook. OWNER: Lead (config/env) + Dev B (logic).
 * GIAI ĐOẠN HIỆN TẠI: echo — xác nhận Gate 2.
 * TODO(Dev B): thay handleIncomingText echo bằng agent (dedupe mid → queue → lock → ordering-agent-core).
 */
import { NextRequest, NextResponse } from "next/server";
import { sendTextMessage, sendTypingIndicator } from "@/lib/channels/messenger-adapter";

export const maxDuration = 60;

// Meta xác minh webhook bằng GET: trả lại hub.challenge nếu verify_token khớp
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  if (p.get("hub.mode") === "subscribe" && p.get("hub.verify_token") === process.env.MESSENGER_VERIFY_TOKEN) {
    return new Response(p.get("hub.challenge") ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.object !== "page") return NextResponse.json({ ok: true });

  for (const entry of body.entry ?? []) {
    for (const event of entry.messaging ?? []) {
      // Bỏ qua echo do chính page gửi — thiếu dòng này bot tự reply chính nó vô hạn
      if (event.message?.is_echo) continue;
      const senderId: string | undefined = event.sender?.id;
      const text: string | undefined = event.message?.text;
      if (senderId && text) await handleIncomingText(senderId, text);
    }
  }
  // LUÔN trả 200 — Meta retry dồn dập và có thể vô hiệu webhook nếu lỗi kéo dài
  return NextResponse.json({ ok: true });
}

async function handleIncomingText(senderPsid: string, text: string): Promise<void> {
  await sendTypingIndicator(senderPsid);
  // TODO(Dev B): dedupe theo mid (message_log) → enqueue → acquire lock session → gọi agent → reply
  await sendTextMessage(senderPsid, `Echo: ${text}`);
}
