/**
 * Session data-layer (bảng sessions + customers). OWNER: Dev A.
 * ĐÂY LÀ nơi duy nhất services đọc/ghi state funnel + cart + delivery info của 1 psid.
 * KHÁC với conversation-session-store (Dev B) lo history/lock/queue của agent — file này chỉ đụng
 * cart/state/mode/activeOrderId + customer. Cùng bảng nhưng khác cột, không tranh chấp logic.
 */
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { sessions, customers } from "@/lib/db/schema";
import { Cart, CartSchema, OrderState } from "@/lib/types";

export type SessionRow = typeof sessions.$inferSelect;

/** Lấy session theo psid, chưa có thì tạo mới (state BROWSING, giỏ rỗng). */
export async function getOrCreateSession(psid: string): Promise<SessionRow> {
  const found = await db.select().from(sessions).where(eq(sessions.psid, psid)).limit(1);
  if (found[0]) return found[0];
  const created = await db
    .insert(sessions)
    .values({ psid, state: "BROWSING", mode: "agent", cart: { items: [] } })
    .onConflictDoNothing()
    .returning();
  // Nếu race chèn trùng, đọc lại.
  return created[0] ?? (await db.select().from(sessions).where(eq(sessions.psid, psid)).limit(1))[0];
}

export async function getSessionCart(psid: string): Promise<Cart> {
  const s = await getOrCreateSession(psid);
  return CartSchema.parse(s.cart ?? { items: [] });
}

export async function saveSessionCart(psid: string, cart: Cart): Promise<Cart> {
  const parsed = CartSchema.parse(cart);
  await db
    .update(sessions)
    .set({ cart: parsed, updatedAt: new Date() })
    .where(eq(sessions.psid, psid));
  return parsed;
}

export async function setSessionState(psid: string, state: OrderState): Promise<void> {
  await db.update(sessions).set({ state, updatedAt: new Date() }).where(eq(sessions.psid, psid));
}

export async function setSessionActiveOrder(psid: string, orderId: string | null): Promise<void> {
  await db
    .update(sessions)
    .set({ activeOrderId: orderId, updatedAt: new Date() })
    .where(eq(sessions.psid, psid));
}

export async function setSessionMode(psid: string, mode: "agent" | "human"): Promise<void> {
  await db.update(sessions).set({ mode, updatedAt: new Date() }).where(eq(sessions.psid, psid));
}

// ===== Customer (delivery info + reorder) =====

export type CustomerRow = typeof customers.$inferSelect;

export async function getCustomer(psid: string): Promise<CustomerRow | null> {
  const rows = await db.select().from(customers).where(eq(customers.psid, psid)).limit(1);
  return rows[0] ?? null;
}

/** Lưu địa chỉ + SĐT (+ tên) cho psid — dùng bởi set_delivery_info & reorder. */
export async function saveDeliveryInfo(
  psid: string,
  info: { phone: string; address: string; name?: string }
): Promise<void> {
  await db
    .insert(customers)
    .values({ psid, phone: info.phone, lastAddress: info.address, name: info.name ?? null })
    .onConflictDoUpdate({
      target: customers.psid,
      set: { phone: info.phone, lastAddress: info.address, ...(info.name ? { name: info.name } : {}) },
    });
}

/** Helper cho query kết hợp — export để service khác dùng lại nếu cần. */
export { and, eq };
