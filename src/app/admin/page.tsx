import type { Metadata } from "next";
import Link from "next/link";
import { MetricCards } from "@/components/admin/metric-cards";
import { OrderFunnel } from "@/components/admin/order-funnel";
import { LiveOrdersTable } from "@/components/admin/live-orders-table";
import { Reveal } from "@/components/motion/reveal";
import { BrandMark } from "@/components/shared/brand-mark";
import { adminMetrics, orders } from "@/lib/mock/mock-data";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default function AdminDashboardPage() {
  return <main id="main-content" className="premium-canvas min-h-screen px-5 py-5 sm:px-8 sm:py-7 lg:px-12 xl:px-16"><div className="mx-auto max-w-[1440px]">
    <header className="premium-card flex flex-wrap items-center justify-between gap-4 rounded-2xl px-4 py-3 sm:px-5"><BrandMark /><nav className="flex items-center gap-1 rounded-xl bg-zinc-100/80 p-1" aria-label="Khu vực vận hành"><span className="rounded-lg bg-zinc-950 px-3.5 py-2 text-sm font-bold text-white shadow-sm" aria-current="page">Dashboard</span><Link href="/staff" className="pressable rounded-lg px-3.5 py-2 text-sm font-bold text-zinc-500 hover:bg-white hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-red-600">Staff Console</Link></nav></header>

    <Reveal className="mb-8 mt-10 flex flex-wrap items-end justify-between gap-6" y={14}><div className="max-w-3xl"><div className="flex items-center gap-2"><span className="size-2 rounded-full bg-red-600 shadow-[0_0_0_5px_rgb(220_38_38_/_0.1)]" aria-hidden="true" /><p className="text-xs font-black uppercase tracking-[0.2em] text-red-700">Hệ thống phân tích Realtime</p></div><h1 className="mt-4 text-balance text-3xl font-black tracking-[-0.035em] text-zinc-950 sm:text-5xl">Thấu hiểu từng hội thoại, nâng tầm dịch vụ</h1><p className="mt-3 text-sm leading-6 text-zinc-500 sm:text-base">Theo dõi hiệu quả vận hành và hiệu suất của Trợ lý AI trên một giao diện trực quan.</p></div><div className="premium-card rounded-2xl px-5 py-4 text-right"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">Doanh thu hôm nay</p><p className="mt-1 text-2xl font-black tracking-tight tabular-nums">775.000₫</p><p className="mt-1 text-xs font-bold text-emerald-700">Tăng 12.4% so với hôm qua</p></div></Reveal>

    <Reveal delay={0.06}><MetricCards metrics={adminMetrics} /></Reveal>
    <div className="mt-6 grid gap-6 xl:grid-cols-[0.82fr_1.18fr]"><Reveal><OrderFunnel metrics={adminMetrics} /></Reveal><Reveal delay={0.08}><section className="relative h-full overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6 shadow-[0_12px_40px_rgb(120_53_15_/_0.06)] sm:p-7" aria-labelledby="insight-title"><div className="absolute -right-10 -top-10 size-36 rounded-full bg-amber-300/20 blur-2xl" aria-hidden="true" /><p className="relative text-xs font-bold uppercase tracking-[0.16em] text-amber-800">AI Insights</p><h2 id="insight-title" className="relative mt-2 max-w-xl text-balance text-2xl font-black tracking-tight text-amber-950">Gợi ý món ăn kèm (Upsell) mang lại hiệu quả vượt trội</h2><p className="relative mt-4 max-w-2xl text-sm leading-7 text-amber-900">Các đơn hàng áp dụng gợi ý từ AI ghi nhận giá trị trung bình (AOV) tăng <strong>{adminMetrics.aov.upliftPct}%</strong>. Trong khung giờ vàng (11h - 13h), Pepsi và các món ăn kèm là nhóm gợi ý mang lại tỷ lệ chốt đơn cao nhất.</p><div className="relative mt-7 rounded-xl border border-white/80 bg-white/70 p-4 shadow-sm"><p className="text-xs font-bold text-amber-900">Cơ sở đánh giá</p><p className="mt-1 text-xs leading-5 text-amber-800">{adminMetrics.aov.assumption}</p></div></section></Reveal></div>
    <Reveal className="mt-6" delay={0.06}><LiveOrdersTable orders={orders} /></Reveal>
    <footer className="py-8 text-center text-xs text-zinc-400">Dữ liệu mô phỏng · Cập nhật theo thời gian thực</footer>
  </div></main>;
}
