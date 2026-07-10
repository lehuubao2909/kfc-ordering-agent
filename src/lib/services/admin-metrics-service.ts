/**
 * Admin metrics — số cho dashboard /admin (funnel + upsell acceptance). OWNER: Dev A.
 * Quy mô demo nhỏ → fetch rồi tính trong JS cho dễ đọc, không tối ưu SQL sớm.
 */
import { desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { orders, sessions } from "@/lib/db/schema";
import { Order } from "@/lib/types";

const PAID_STATES = ["PLACED", "PREPARING", "DELIVERING", "DELIVERED"];

export type OrdersOverview = {
  orders: Order[]; // đã map row → shape Order (SĐT sẽ được che ở route)
  funnel: { started: number; cart: number; ordered: number; paid: number; delivered: number; cancelled: number };
  upsell: { accepted: number; total: number; rate: number };
};

export async function getOrdersOverview(limit = 50): Promise<OrdersOverview> {
  const [orderRows, sessionRows] = await Promise.all([
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit),
    db.select().from(sessions),
  ]);

  const started = sessionRows.length;
  const cart = sessionRows.filter((s) => (s.cart?.items?.length ?? 0) > 0).length;
  const ordered = orderRows.length;
  const paid = orderRows.filter((o) => PAID_STATES.includes(o.status)).length;
  const delivered = orderRows.filter((o) => o.status === "DELIVERED").length;
  const cancelled = orderRows.filter((o) => o.status === "CANCELLED").length;

  const upsellAccepted = orderRows.filter((o) => o.upsellAccepted).length;
  const rate = ordered ? Math.round((upsellAccepted / ordered) * 100) / 100 : 0;

  const mapped: Order[] = orderRows.map((r) => ({
    id: r.id,
    psid: r.psid,
    items: r.items,
    subtotalVnd: r.subtotalVnd,
    discountVnd: r.discountVnd,
    shippingFeeVnd: r.shippingFeeVnd,
    totalVnd: r.totalVnd,
    voucherCode: r.voucherCode,
    paymentMethod: r.paymentMethod as Order["paymentMethod"],
    status: r.status as Order["status"],
    deliveryAddress: r.deliveryAddress,
    deliveryPhone: r.deliveryPhone,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return {
    orders: mapped,
    funnel: { started, cart, ordered, paid, delivered, cancelled },
    upsell: { accepted: upsellAccepted, total: ordered, rate },
  };
}
