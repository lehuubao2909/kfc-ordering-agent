/**
 * Dedupe + queue + batch tin nhắn đến. OWNER: Dev B.
 * Khách Việt hay nhắn 3 câu ngắn liên tiếp → gom các tin chưa xử lý thành 1 lượt LLM (rẻ + tự nhiên hơn).
 * message_log cũng là NGUỒN TRANSCRIPT cho staff console (C4): ghi CẢ inbound + outbound.
 */
import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { messageLog } from "@/lib/db/schema";

/** Insert inbound; mid trùng (Meta retry) → onConflictDoNothing → trả false để bỏ qua. */
export async function recordIncomingMessage(psid: string, mid: string, text: string): Promise<boolean> {
  if (!mid) {
    // Không có mid (postback/quick-reply) → không dedupe được, cứ ghi vào queue.
    await db.insert(messageLog).values({ psid, mid: null, direction: "in", text });
    return true;
  }
  const inserted = await db
    .insert(messageLog)
    .values({ psid, mid, direction: "in", text })
    .onConflictDoNothing()
    .returning({ id: messageLog.id });
  return inserted.length > 0;
}

/**
 * Xem (KHÔNG đánh dấu) mọi tin inbound chưa xử lý của psid, theo thứ tự.
 * Đánh dấu processed để RIÊNG (markMessagesProcessed) — chỉ gọi SAU khi agent turn thành công,
 * tránh mất tin nếu LLM/turn lỗi giữa chừng (message-loss race).
 */
export async function peekUnprocessedMessages(psid: string): Promise<{ ids: number[]; texts: string[] }> {
  const rows = await db
    .select()
    .from(messageLog)
    .where(and(eq(messageLog.psid, psid), eq(messageLog.direction, "in"), eq(messageLog.processed, false)))
    .orderBy(asc(messageLog.createdAt));
  return { ids: rows.map((r) => r.id), texts: rows.map((r) => r.text) };
}

/** Đánh dấu các tin đã xử lý xong (gọi sau khi turn thành công). */
export async function markMessagesProcessed(ids: number[]): Promise<void> {
  if (!ids.length) return;
  await db.update(messageLog).set({ processed: true }).where(inArray(messageLog.id, ids));
}

/** Ghi reply của bot vào transcript (dùng bởi staff console). Outbound không cần dedupe. */
export async function recordOutgoingMessage(psid: string, text: string): Promise<void> {
  await db.insert(messageLog).values({ psid, mid: null, direction: "out", text, processed: true });
}

/** Ghi chuỗi tools agent đã gọi trong 1 turn (direction "trace") — staff console render thành chip
 * "🔧 get_menu → add_to_cart" để giám khảo THẤY hành động agentic (rubric AABW). */
export async function recordAgentTrace(psid: string, toolNames: string[]): Promise<void> {
  if (!toolNames.length) return;
  await db.insert(messageLog).values({ psid, mid: null, direction: "trace", text: toolNames.join(" → "), processed: true });
}
