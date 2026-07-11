/**
 * Dữ liệu cho staff console: list hội thoại + transcript + log tin nhắn staff gõ tay. OWNER: Dev A.
 * ⚠️ CHỜ LEAD xác nhận (xem dev-a-questions-for-lead.md): sessions.mode bị cả takeover (đây) lẫn
 * tool handoff_to_human (Dev B) cùng ghi — thống nhất semantics trước khi tích hợp.
 */
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { customers, messageLog, sessions } from "@/lib/db/schema";

import { getStoreById } from "./store-service";

export type ConversationSummary = {
  psid: string;
  customerName: string; // từ customers.name; chưa có → "Khách •••1234"
  state: string;
  mode: string;
  activeOrderId: string | null;
  storeName: string | null; // cửa hàng phục vụ — staff biết hội thoại thuộc cửa hàng nào (route-by-store)
  cartCount: number;
  lastMessage: string; // tin cuối trong sessions.history (preview ở list)
  updatedAt: string;
};

export async function listConversations(): Promise<ConversationSummary[]> {
  const rows = await db
    .select({ s: sessions, customerName: customers.name })
    .from(sessions)
    .leftJoin(customers, eq(customers.psid, sessions.psid))
    .orderBy(desc(sessions.updatedAt));
  const result: ConversationSummary[] = [];
  for (const { s, customerName } of rows) {
    const store = s.storeId ? await getStoreById(s.storeId) : null; // cached in-memory, không tốn query
    result.push({
      psid: s.psid,
      customerName: customerName ?? `Khách •••${s.psid.slice(-4)}`,
      state: s.state,
      mode: s.mode,
      activeOrderId: s.activeOrderId,
      storeName: store?.name ?? null,
      cartCount: s.cart?.items?.length ?? 0,
      lastMessage: s.history?.at(-1)?.content ?? "",
      updatedAt: s.updatedAt.toISOString(),
    });
  }
  return result;
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
