/**
 * Messenger Send API adapter. OWNER: Dev B (Lead own env/Meta config).
 * sendTextMessage đã HOẠT ĐỘNG — webhook echo dùng ngay.
 * TODO(Dev B): carousel, quick replies, receipt — theo docs/api-contract.md mục Channel.
 */

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

// TODO(Dev B): carousel menu — generic template ≤10 cards (ảnh, giá, nút postback "Thêm món này")
export async function sendMenuCarousel(_recipientPsid: string, _itemIds: string[]): Promise<void> {
  throw new Error("TODO(Dev B): sendMenuCarousel");
}

// TODO(Dev B): quick replies theo state (Xem menu · Ưu đãi · Giỏ hàng · Trạng thái đơn · Gặp nhân viên)
export async function sendQuickReplies(_recipientPsid: string, _text: string, _replies: { title: string; payload: string }[]): Promise<void> {
  throw new Error("TODO(Dev B): sendQuickReplies");
}
