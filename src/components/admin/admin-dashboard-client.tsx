"use client";

/**
 * Dashboard admin — DATA THẬT từ GET /api/admin/orders (polling 3s). Trong <AdminAuthGate>.
 * Doanh thu = tổng totalVnd các đơn đã thanh toán/chốt (PLACED trở đi, trừ CANCELLED).
 */
import { useCallback, useEffect, useState } from "react";
import { MetricCards } from "./metric-cards";
import { OrderFunnel } from "./order-funnel";
import { LiveOrdersTable } from "./live-orders-table";
import { Reveal } from "@/components/motion/reveal";
import { useAdminFetch } from "./admin-auth-gate";
import { currencyFormatter } from "@/components/shared/formatters";
import type { OrdersOverview } from "@/lib/services/admin-metrics-service";

const POLL_MS = 3000;
const PAID_STATUSES = new Set(["PLACED", "PREPARING", "DELIVERING", "DELIVERED"]);

export function AdminDashboardClient() {
  const adminFetch = useAdminFetch();
  const [overview, setOverview] = useState<OrdersOverview | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await adminFetch("/api/admin/orders");
      if (!res.ok) return;
      const json = await res.json();
      if (json.ok) setOverview(json.data);
    } catch (err) {
      console.error("admin refresh lỗi:", err);
    }
  }, [adminFetch]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, POLL_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  if (!overview) return <div className="premium-card mt-10 rounded-2xl p-10 text-center text-sm text-zinc-400">Đang tải dữ liệu trực tiếp…</div>;

  const { orders, metrics } = overview;
  const revenueVnd = orders.filter((o) => PAID_STATUSES.has(o.status)).reduce((sum, o) => sum + o.totalVnd, 0);

  return (
    <>
      <Reveal className="mb-8 mt-10 flex flex-wrap items-end justify-between gap-6" y={14}><div className="max-w-3xl"><div className="flex items-center gap-2"><span className="size-2 rounded-full bg-red-600 shadow-[0_0_0_5px_rgb(220_38_38_/_0.1)]" aria-hidden="true" /><p className="text-xs font-black uppercase tracking-[0.2em] text-red-700">Hệ thống phân tích Realtime</p></div><h1 className="mt-4 text-balance text-3xl font-black tracking-[-0.035em] text-zinc-950 sm:text-5xl">Thấu hiểu từng hội thoại, nâng tầm dịch vụ</h1><p className="mt-3 text-sm leading-6 text-zinc-500 sm:text-base">Theo dõi hiệu quả vận hành và hiệu suất của Trợ lý AI trên một giao diện trực quan.</p></div><div className="premium-card rounded-2xl px-5 py-4 text-right"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">Doanh thu ghi nhận</p><p className="mt-1 text-2xl font-black tracking-tight tabular-nums">{currencyFormatter.format(revenueVnd)}</p><p className="mt-1 text-xs font-bold text-emerald-700">{orders.length} đơn trên hệ thống</p></div></Reveal>

      <Reveal delay={0.06}><MetricCards metrics={metrics} /></Reveal>
      <div className="mt-6 grid gap-6 xl:grid-cols-[0.82fr_1.18fr]"><Reveal><OrderFunnel metrics={metrics} /></Reveal><Reveal delay={0.08}><section className="relative h-full overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6 shadow-[0_12px_40px_rgb(120_53_15_/_0.06)] sm:p-7" aria-labelledby="insight-title"><div className="absolute -right-10 -top-10 size-36 rounded-full bg-amber-300/20 blur-2xl" aria-hidden="true" /><p className="relative text-xs font-bold uppercase tracking-[0.16em] text-amber-800">AI Insights</p><h2 id="insight-title" className="relative mt-2 max-w-xl text-balance text-2xl font-black tracking-tight text-amber-950">Gợi ý món ăn kèm (Upsell) mang lại hiệu quả vượt trội</h2><p className="relative mt-4 max-w-2xl text-sm leading-7 text-amber-900">Các đơn hàng áp dụng gợi ý từ AI ghi nhận giá trị trung bình (AOV) tăng <strong>{metrics.aov.upliftPct}%</strong> theo backtest trên dữ liệu POS mô phỏng. Trong khung giờ vàng (11h–13h), Pepsi và các món ăn kèm là nhóm gợi ý có tỷ lệ chốt cao nhất.</p><div className="relative mt-7 rounded-xl border border-white/80 bg-white/70 p-4 shadow-sm"><p className="text-xs font-bold text-amber-900">Cơ sở đánh giá</p><p className="mt-1 text-xs leading-5 text-amber-800">{metrics.aov.assumption}</p></div></section></Reveal></div>
      <Reveal className="mt-6" delay={0.06}><LiveOrdersTable orders={orders} /></Reveal>
    </>
  );
}
