/**
 * Order service — TRÁI TIM STATE MACHINE. OWNER: Dev A.
 * Mọi transition trạng thái đơn đi qua đây. LLM/route KHÔNG tự đổi state.
 * Transition sai → throw OrderTransitionError với message tiếng Việt để agent relay cho khách.
 */
import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { orders } from "@/lib/db/schema";
import { Cart, Order, OrderSchema, OrderState, PaymentMethod } from "@/lib/types";
import { getMenuItemById } from "./menu-service";
import { autoApplyBestVoucher } from "./promotion-voucher-service";
import { earnPointsForOrder } from "./loyalty-service";
import { emitOrderStatusChange } from "./order-status-events";
import { getCustomer, getOrCreateSession, setSessionActiveOrder, setSessionState } from "./session-data-service";

export class OrderTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderTransitionError";
  }
}

export const SHIPPING_FEE_VND = 15_000;

/** Các transition hợp lệ. Nguồn sự thật: docs/api-contract.md mục State machine. */
export const VALID_TRANSITIONS: Record<string, OrderState[]> = {
  BROWSING: ["CART"],
  CART: ["CONFIRMING", "BROWSING"],
  CONFIRMING: ["COLLECTING_DELIVERY", "CART"], // quay lại CART nếu khách sửa món
  COLLECTING_DELIVERY: ["SELECTING_PAYMENT"],
  SELECTING_PAYMENT: ["AWAITING_PAYMENT", "PLACED"], // COD → PLACED thẳng
  AWAITING_PAYMENT: ["PLACED", "CANCELLED"],
  PLACED: ["PREPARING", "CANCELLED"],
  PREPARING: ["DELIVERING"], // từ đây không hủy được nữa
  DELIVERING: ["DELIVERED"],
};

const CANCELLABLE: OrderState[] = ["AWAITING_PAYMENT", "PLACED"];

function rowToOrder(r: typeof orders.$inferSelect): Order {
  return OrderSchema.parse({
    id: r.id,
    psid: r.psid,
    items: r.items,
    subtotalVnd: r.subtotalVnd,
    discountVnd: r.discountVnd,
    shippingFeeVnd: r.shippingFeeVnd,
    totalVnd: r.totalVnd,
    voucherCode: r.voucherCode,
    paymentMethod: r.paymentMethod,
    status: r.status,
    storeId: r.storeId,
    deliveryAddress: r.deliveryAddress,
    deliveryPhone: r.deliveryPhone,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  });
}

/** Tính đầy đủ có kèm voucher — dùng nội bộ createOrderFromSession. */
async function computeTotals(cart: Cart) {
  let subtotalVnd = 0;
  for (const line of cart.items) {
    const item = await getMenuItemById(line.itemId);
    if (!item) throw new OrderTransitionError(`Món "${line.itemId}" không còn trong menu ạ.`);
    subtotalVnd += item.priceVnd * line.quantity;
  }
  const shippingFeeVnd = cart.items.length ? SHIPPING_FEE_VND : 0;

  let discountVnd = 0;
  let voucherCode: string | null = null;
  try {
    const best = await autoApplyBestVoucher(cart, subtotalVnd);
    if (best) {
      discountVnd = best.discountVnd;
      voucherCode = best.code;
    }
  } catch (err) {
    console.error("computeTotals: voucher lỗi, bỏ qua:", err);
  }

  const totalVnd = Math.max(0, subtotalVnd + shippingFeeVnd - discountVnd);
  return { subtotalVnd, discountVnd, shippingFeeVnd, totalVnd, voucherCode };
}

// Giá CHỈ từ menu-service + ship flat; voucher auto-apply mã tốt nhất.
export async function calculateOrderTotals(
  cart: Cart
): Promise<{ subtotalVnd: number; discountVnd: number; shippingFeeVnd: number; totalVnd: number }> {
  const { subtotalVnd, discountVnd, shippingFeeVnd, totalVnd } = await computeTotals(cart);
  return { subtotalVnd, discountVnd, shippingFeeVnd, totalVnd };
}

async function generateOrderId(): Promise<string> {
  const [{ n }] = await db.select({ n: count() }).from(orders);
  return `KFC-${String(Number(n) + 1).padStart(4, "0")}`;
}

// Tạo order từ session. COD → PLACED thẳng; QR/thẻ → AWAITING_PAYMENT (chờ /pay).
export async function createOrderFromSession(psid: string, paymentMethod: PaymentMethod): Promise<Order> {
  const session = await getOrCreateSession(psid);
  const cart = (session.cart ?? { items: [] }) as Cart;
  if (!cart.items.length) throw new OrderTransitionError("Giỏ hàng đang trống, mình chưa đặt được ạ.");

  const customer = await getCustomer(psid);
  if (!customer?.phone || !customer?.lastAddress) {
    throw new OrderTransitionError("Em cần địa chỉ và số điện thoại trước khi đặt đơn ạ.");
  }

  const totals = await computeTotals(cart);
  const status: OrderState = paymentMethod === "cod" ? "PLACED" : "AWAITING_PAYMENT";

  // Retry-on-conflict: 2 khách đặt cùng lúc có thể sinh trùng id → insert onConflictDoNothing,
  // trùng thì đọc lại count sinh id mới, thử tối đa 5 lần. Chống race, giữ mã đẹp KFC-xxxx.
  let row: typeof orders.$inferSelect | undefined;
  for (let attempt = 0; attempt < 5 && !row; attempt++) {
    const id = await generateOrderId();
    const inserted = await db
      .insert(orders)
      .values({
        id,
        psid,
        items: cart.items,
        subtotalVnd: totals.subtotalVnd,
        discountVnd: totals.discountVnd,
        shippingFeeVnd: totals.shippingFeeVnd,
        totalVnd: totals.totalVnd,
        voucherCode: totals.voucherCode,
        paymentMethod,
        status,
        storeId: session.storeId ?? null, // cửa hàng resolve từ địa chỉ (store-service); null → chưa qua flow store
        deliveryAddress: customer.lastAddress,
        deliveryPhone: customer.phone,
      })
      .onConflictDoNothing()
      .returning();
    row = inserted[0];
  }
  if (!row) throw new OrderTransitionError("Hệ thống đang bận, chưa tạo được đơn. Anh/chị thử lại giúp em nhé.");

  await setSessionActiveOrder(psid, row.id);
  await setSessionState(psid, status);

  const order = rowToOrder(row);
  await emitOrderStatusChange(order); // COD → push xác nhận ngay; AWAITING_PAYMENT → notification bỏ qua
  return order;
}

// Validate transition qua VALID_TRANSITIONS → update DB → emit event (push Messenger do Dev B nghe).
export async function advanceOrderStatus(orderId: string, to: OrderState): Promise<Order> {
  const current = await getOrderById(orderId);
  if (!current) throw new OrderTransitionError(`Không tìm thấy đơn ${orderId}.`);
  const allowed = VALID_TRANSITIONS[current.status] ?? [];
  if (!allowed.includes(to)) {
    throw new OrderTransitionError(`Đơn ${orderId} đang "${current.status}", không thể chuyển sang "${to}".`);
  }

  // Optimistic guard: chỉ update nếu status VẪN đúng như lúc đọc (chống double-transition TOCTOU
  // khi 2 lệnh advance chạy song song). Nếu ai đó vừa đổi trước → 0 row → báo lỗi thay vì nhảy 2 bước.
  const [row] = await db
    .update(orders)
    .set({ status: to, updatedAt: new Date() })
    .where(and(eq(orders.id, orderId), eq(orders.status, current.status)))
    .returning();
  if (!row) throw new OrderTransitionError(`Trạng thái đơn ${orderId} vừa thay đổi, anh/chị thử lại giúp em nhé.`);
  const order = rowToOrder(row);

  if (to === "DELIVERED" && order.deliveryPhone) {
    try {
      await earnPointsForOrder(order.deliveryPhone, order.totalVnd);
    } catch (err) {
      console.error("earnPointsForOrder lỗi (bỏ qua):", err);
    }
  }

  await emitOrderStatusChange(order);
  return order;
}

// Hủy — chỉ hợp lệ trước PREPARING.
export async function cancelOrder(orderId: string): Promise<Order> {
  const current = await getOrderById(orderId);
  if (!current) throw new OrderTransitionError(`Không tìm thấy đơn ${orderId}.`);
  if (!CANCELLABLE.includes(current.status)) {
    throw new OrderTransitionError("Đơn đã vào bếp nên mình không hủy được nữa ạ. Anh/chị thông cảm giúp em nhé.");
  }
  return advanceOrderStatus(orderId, "CANCELLED");
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const rows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return rows[0] ? rowToOrder(rows[0]) : null;
}

export async function getActiveOrderByPsid(psid: string): Promise<Order | null> {
  const rows = await db.select().from(orders).where(eq(orders.psid, psid)).orderBy(desc(orders.createdAt));
  const active = rows.find((r) => r.status !== "DELIVERED" && r.status !== "CANCELLED");
  return active ? rowToOrder(active) : null;
}
