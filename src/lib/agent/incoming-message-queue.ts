/**
 * Dedupe + queue + batch tin nhắn đến. OWNER: Dev B.
 * Khách Việt hay nhắn 3 câu ngắn liên tiếp → gom các tin chưa xử lý thành 1 lượt LLM (rẻ + tự nhiên hơn).
 */

// TODO(Dev B): insert message_log với mid unique — conflict = tin trùng (Meta retry) → trả false, bỏ qua
export async function recordIncomingMessage(_psid: string, _mid: string, _text: string): Promise<boolean> {
  throw new Error("TODO(Dev B): recordIncomingMessage");
}

// TODO(Dev B): lấy mọi tin processed=false của psid (theo thứ tự), đánh dấu processed, trả mảng text
export async function drainUnprocessedMessages(_psid: string): Promise<string[]> {
  throw new Error("TODO(Dev B): drainUnprocessedMessages");
}
