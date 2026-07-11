/**
 * Messenger Send API adapter. OWNER: Dev B (Lead own env/Meta config).
 * sendTextMessage đã HOẠT ĐỘNG — webhook echo dùng ngay.
 * carousel (generic template), quick replies (theo state), typing indicator, message tag push.
 */
import { getMenuItemById } from "@/lib/services/menu-service";

const GRAPH_URL = "https://graph.facebook.com/v23.0/me/messages";

async function callSendApi(payload: Record<string, unknown>): Promise<void> {
  const token = process.env.MESSENGER_PAGE_ACCESS_TOKEN;
  if (!token) {
    console.error("MESSENGER_PAGE_ACCESS_TOKEN chưa được set");
    return;
  }
  const res = await fetch(`${GRAPH_URL}?access_token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) console.error("Send API error:", res.status, await res.text());
}

export async function sendTextMessage(recipientPsid: string, text: string): Promise<void> {
  await callSendApi({
    recipient: { id: recipientPsid },
    message: { text },
    messaging_type: "RESPONSE",
  });
}

/** Typing indicator — gọi NGAY khi nhận message để che latency LLM */
export async function sendTypingIndicator(recipientPsid: string): Promise<void> {
  await callSendApi({ recipient: { id: recipientPsid }, sender_action: "typing_on" });
}

/** Push chủ động ngoài 24h window (cập nhật đơn) — bắt buộc dùng tag theo policy Meta */
export async function sendOrderUpdateMessage(recipientPsid: string, text: string): Promise<void> {
  await callSendApi({
    recipient: { id: recipientPsid },
    message: { text },
    messaging_type: "MESSAGE_TAG",
    tag: "POST_PURCHASE_UPDATE",
  });
}

/** Gửi 1 ảnh (URL public) — dùng cho poster menu khi khách xem menu tổng. */
export async function sendImageMessage(recipientPsid: string, imageUrl: string): Promise<void> {
  await callSendApi({
    recipient: { id: recipientPsid },
    message: { attachment: { type: "image", payload: { url: imageUrl, is_reusable: true } } },
    messaging_type: "RESPONSE",
  });
}

/** Carousel menu — generic template ≤10 cards (ảnh, giá, nút postback "Thêm món này"). */
export async function sendMenuCarousel(recipientPsid: string, itemIds: string[]): Promise<void> {
  const resolved = await Promise.all(itemIds.slice(0, 10).map((id) => getMenuItemById(id)));
  const items = resolved.filter((m): m is NonNullable<typeof m> => m !== null);
  if (!items.length) return;
  const elements = items.map((m) => ({
    title: `${m.name} — ${m.priceVnd.toLocaleString("vi-VN")}đ`,
    ...(m.description ? { subtitle: m.description } : {}),
    ...(m.imageUrl ? { image_url: m.imageUrl } : {}),
    buttons: [{ type: "postback", title: "Thêm món này", payload: `ADD_ITEM:${m.id}` }],
  }));
  await callSendApi({
    recipient: { id: recipientPsid },
    message: { attachment: { type: "template", payload: { template_type: "generic", elements } } },
    messaging_type: "RESPONSE",
  });
}

/** Quick replies theo state — Messenger giới hạn 13 nút. */
export async function sendQuickReplies(recipientPsid: string, text: string, replies: { title: string; payload: string }[]): Promise<void> {
  await callSendApi({
    recipient: { id: recipientPsid },
    message: { text, quick_replies: replies.slice(0, 13).map((r) => ({ content_type: "text", title: r.title, payload: r.payload })) },
    messaging_type: "RESPONSE",
  });
}
