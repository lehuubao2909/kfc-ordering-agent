/**
 * Admin metrics — số cho dashboard /admin. OWNER: Dev A.
 * funnel + upsell: LIVE từ orders/sessions. aov: từ backtest 90 ngày POS (ổn định, có assumption) — `npm run backtest`.
 * Shape gói trong `metrics` khớp AdminMetrics của Dev C (funnel/aov/upsell). `nluEval` do Dev B cấp (chưa có).
 * Quy mô demo nhỏ → fetch rồi tính trong JS.
 */
import { desc, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { orders, sessions } from "@/lib/db/schema";
import { Order } from "@/lib/types";
import backtest from "@/fixtures/funnel-backtest.json";

export type AdminOrder = Order & { upsellAccepted: boolean };
export type AdminMetrics = {
  funnel: { conversationsStarted: number; reachedCart: number; confirmed: number; paid: number; delivered: number };
  aov: { withoutUpsellVnd: number; withUpsellVnd: number; upliftPct: number; assumption: string };
  upsell: { offered: number; accepted: number; acceptanceRatePct: number };
};
export type OrdersOverview = { orders: AdminOrder[]; metrics: AdminMetrics };

export async function getOrdersOverview(limit = 50): Promise<OrdersOverview> {
  // Funnel/upsell = aggregate COUNT trên TOÀN bảng (chính xác + không ship jsonb); list = limit cho bảng.
  const [orderRows, sessAgg, ordAgg] = await Promise.all([
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit),
    db
      .select({
        started: sql<number>`count(*)::int`,
        reachedCart: sql<number>`(count(*) filter (where jsonb_typeof(${sessions.cart} -> 'items') = 'array' and jsonb_array_length(${sessions.cart} -> 'items') > 0))::int`,
      })
      .from(sessions),
    db
      .select({
        confirmed: sql<number>`count(*)::int`,
        paid: sql<number>`(count(*) filter (where ${orders.status} in ('PLACED','PREPARING','DELIVERING','DELIVERED')))::int`,
        delivered: sql<number>`(count(*) filter (where ${orders.status} = 'DELIVERED'))::int`,
        accepted: sql<number>`(count(*) filter (where ${orders.upsellAccepted}))::int`,
      })
      .from(orders),
  ]);

  const s = sessAgg[0];
  const o = ordAgg[0];
  const offered = o.confirmed;
  const accepted = o.accepted;

  const orderList: AdminOrder[] = orderRows.map((r) => ({
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
    upsellAccepted: r.upsellAccepted,
  }));

  return {
    orders: orderList,
    metrics: {
      funnel: {
        conversationsStarted: s.started,
        reachedCart: s.reachedCart,
        confirmed: o.confirmed,
        paid: o.paid,
        delivered: o.delivered,
      },
      aov: {
        withoutUpsellVnd: backtest.baselineAovVnd,
        withUpsellVnd: backtest.withUpsellAovVnd,
        upliftPct: backtest.upliftPct,
        assumption: backtest.assumption,
      },
      upsell: {
        offered,
        accepted,
        acceptanceRatePct: offered ? Math.round((accepted / offered) * 1000) / 10 : 0,
      },
    },
  };
}
