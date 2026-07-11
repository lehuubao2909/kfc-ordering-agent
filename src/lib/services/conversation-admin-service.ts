/**
 * Dữ liệu cho staff console: list hội thoại + transcript + log tin nhắn staff gõ tay. OWNER: Dev A.
 * ⚠️ CHỜ LEAD xác nhận (xem dev-a-questions-for-lead.md): sessions.mode bị cả takeover (đây) lẫn
 * tool handoff_to_human (Dev B) cùng ghi — thống nhất semantics trước khi tích hợp.
 */
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { messageLog, sessions } from "@/lib/db/schema";

export type ConversationSummary = {
  psid: string;
  state: string;
  mode: string;
  activeOrderId: string | null;
  cartCount: number;
  updatedAt: string;
};

export async function listConversations(): Promise<ConversationSummary[]> {
  const rows = await db.select().from(sessions).orderBy(desc(sessions.updatedAt));
  return rows.map((s) => ({
    psid: s.psid,
    state: s.state,
    mode: s.mode,
    activeOrderId: s.activeOrderId,
    cartCount: s.cart?.items?.length ?? 0,
    updatedAt: s.updatedAt.toISOString(),
  }));
}

export type TranscriptEntry = { direction: string; text: string; createdAt: string };

export async function getTranscript(psid: string, limit = 100): Promise<TranscriptEntry[]> {
  const rows = await db
    .select()
    .from(messageLog)
    .where(eq(messageLog.psid, psid))
    .orderBy(desc(messageLog.createdAt))
    .limit(limit);
  return rows
    .reverse() // trả theo thứ tự thời gian tăng dần cho dễ đọc
    .map((m) => ({ direction: m.direction, text: m.text, createdAt: m.createdAt.toISOString() }));
}

/** Log tin outbound do staff gõ tay (mid null). Việc GỬI thật do route gọi messenger-adapter (Dev B). */
export async function logStaffOutbound(psid: string, text: string): Promise<void> {
  await db.insert(messageLog).values({ psid, direction: "out", text, processed: true });
}
