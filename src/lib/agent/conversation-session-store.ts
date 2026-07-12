/**
 * Session store + per-conversation lock. OWNER: Dev B.
 * Phân vai với session-data-service (Dev A): file NÀY chỉ đụng history + lock (cột processing_until);
 * cart/state/mode/activeOrderId do session-data-service ghi. Cùng bảng sessions, khác cột, không tranh chấp.
 *
 * Lock chống 2 serverless instance xử lý cùng 1 khách: UPDATE ... SET processing_until = now()+60s
 * WHERE psid=? AND (processing_until IS NULL OR processing_until < now()) — update được (RETURNING có row) = giành lock.
 */
import { and, eq, isNull, lt, or } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { sessions } from "@/lib/db/schema";
import { Cart, CartSchema, OrderState, SessionMode } from "@/lib/types";
import { getOrCreateSession, saveSessionCart, setSessionState } from "@/lib/services/session-data-service";
import { getOrderById } from "@/lib/services/order-service";

export type ConversationSession = {
  psid: string;
  state: OrderState;
  mode: SessionMode;
  handedOffAt: Date | null; // mốc chuyển human — core dùng để hết-hạn handoff khi không ai trực
  cart: Cart;
  activeOrderId: string | null;
  history: { role: string; content: string }[];
};

const LOCK_MS = 60_000; // steal lock sau 60s (instance trước treo/chết)
const HISTORY_LIMIT = 12; // token bounded — chỉ giữ 12 tin gần nhất

// State thuộc vòng đời ĐƠN HÀNG — hợp lệ CHỈ khi đơn gắn kèm đang thật sự ở trạng thái đó.
const ORDER_LIFECYCLE_STATES: OrderState[] = ["AWAITING_PAYMENT", "PLACED", "PREPARING", "DELIVERING"];

/**
 * Đọc session đầy đủ (tạo mới nếu chưa có) + SELF-HEAL (fix 11/7 chiều):
 * session kẹt ở state vòng-đời-đơn nhưng đơn thật đã DELIVERED/CANCELLED/không tồn tại
 * → đồng bộ lại state + clear giỏ cũ. Chữa cả session hỏng sẵn trong DB lẫn mọi desync tương lai
 * (bug production: session kẹt AWAITING_PAYMENT → agent mất sạch tools menu/giỏ → bịa flow bằng lời).
 */
export async function getSession(psid: string): Promise<ConversationSession> {
  const row = await getOrCreateSession(psid);
  let state = row.state as OrderState;
  let cart = CartSchema.parse(row.cart ?? { items: [] });

  if (ORDER_LIFECYCLE_STATES.includes(state)) {
    const order = row.activeOrderId ? await getOrderById(row.activeOrderId) : null;
    const actual = order?.status ?? null;
    let healed: OrderState | null = null;
    if (!order) healed = "BROWSING"; // state đơn-hàng mà không gắn đơn nào → về đầu
    else if (actual === "DELIVERED" || actual === "CANCELLED") healed = actual; // đơn xong → mở bộ tools đặt-mới
    else if (actual && actual !== state) healed = actual as OrderState; // lệch tiến độ → sync theo đơn

    if (healed) {
      state = healed;
      await setSessionState(psid, healed);
      if (cart.items.length) {
        // Giỏ ở các state này là giỏ của đơn ĐÃ tạo (pre-fix) — clear để đơn mới sạch
        cart = { items: [] };
        await saveSessionCart(psid, cart);
      }
    }
  }

  return {
    psid: row.psid,
    state,
    mode: row.mode as SessionMode,
    handedOffAt: row.handedOffAt ?? null,
    cart,
    activeOrderId: row.activeOrderId ?? null,
    history: (row.history as { role: string; content: string }[]) ?? [],
  };
}

/** Compare-and-set: giành lock nếu chưa ai giữ hoặc lock cũ đã hết hạn. true = được xử lý. */
export async function tryAcquireProcessingLock(psid: string): Promise<boolean> {
  const now = new Date();
  const until = new Date(now.getTime() + LOCK_MS);
  const rows = await db
    .update(sessions)
    .set({ processingUntil: until })
    .where(
      and(
        eq(sessions.psid, psid),
        or(isNull(sessions.processingUntil), lt(sessions.processingUntil, now))
      )
    )
    .returning({ psid: sessions.psid });
  return rows.length > 0;
}

export async function releaseProcessingLock(psid: string): Promise<void> {
  await db.update(sessions).set({ processingUntil: null }).where(eq(sessions.psid, psid));
}

/** Chỉ ghi history (12 tin cuối) — cart/state/mode đã được tools ghi qua session-data-service. */
export async function saveSession(session: ConversationSession): Promise<void> {
  const history = session.history.slice(-HISTORY_LIMIT);
  await db
    .update(sessions)
    .set({ history, updatedAt: new Date() })
    .where(eq(sessions.psid, session.psid));
}
