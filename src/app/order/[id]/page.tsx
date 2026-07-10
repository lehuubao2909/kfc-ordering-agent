import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/reveal";
import { BrandMark } from "@/components/shared/brand-mark";
import { StatusBadge } from "@/components/shared/status-badge";
import { OrderSummary } from "@/components/order/order-summary";
import { OrderStatusTimeline } from "@/components/tracking/order-status-timeline";
import { getOrder, orders } from "@/lib/mock/mock-data";

export const metadata: Metadata = { title: "Theo dõi đơn hàng" };
export function generateStaticParams() { return orders.map((order) => ({ id: order.id })); }
const etaByStatus = { AWAITING_PAYMENT: "Chờ thanh toán", PLACED: "Dự kiến 30–40 phút", PREPARING: "Dự kiến 25–30 phút", DELIVERING: "Dự kiến 10–15 phút", DELIVERED: "Đã giao thành công" } as const;

export default async function OrderTrackingPage({ params }: PageProps<"/order/[id]">) {
  const { id } = await params;
  const order = getOrder(id);
  if (!order) notFound();
  const eta = etaByStatus[order.status as keyof typeof etaByStatus] ?? "Đang cập nhật";

  return <main id="main-content" className="premium-canvas min-h-screen px-5 py-5 sm:px-8 sm:py-8 lg:px-12"><div className="mx-auto max-w-5xl"><header className="premium-card flex items-center justify-between gap-4 rounded-2xl px-4 py-3 sm:px-5"><BrandMark /><Link href="/" className="pressable rounded-lg px-3 py-2 text-sm font-bold text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-red-600">Đặt đơn mới</Link></header>
    <Reveal><section className="mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 to-zinc-800 text-white shadow-[0_20px_60px_rgb(24_24_27_/_0.2)]"><div className="dot-grid grid gap-6 p-6 sm:p-9 md:grid-cols-[1fr_auto] md:items-end"><div><div className="flex flex-wrap items-center gap-3"><StatusBadge status={order.status} /><span className="text-xs font-semibold text-zinc-400">Cập nhật trực tiếp mỗi 2 giây</span></div><h1 className="mt-6 max-w-xl text-balance text-3xl font-black tracking-[-0.035em] sm:text-5xl">Món ngon nóng hổi đang trên đường tới bạn!</h1><p className="mt-3 text-sm text-zinc-400">Mã đơn <span className="font-mono font-bold text-white" translate="no">{order.id}</span></p></div><div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm md:min-w-48"><p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">Thời gian dự kiến</p><p className="mt-2 text-2xl font-black text-white">{eta}</p></div></div></section></Reveal>
    <Reveal className="mt-6 grid items-start gap-6 lg:grid-cols-[1.08fr_0.92fr]" delay={0.07}><div className="space-y-6"><OrderStatusTimeline status={order.status} /><section className="premium-card rounded-2xl p-6"><h2 className="font-black">Địa chỉ giao hàng</h2><p className="mt-3 break-words text-sm leading-6 text-zinc-600">{order.deliveryAddress}</p><p className="mt-1 text-sm font-semibold text-zinc-500">{order.deliveryPhone}</p></section></div><div className="space-y-4"><OrderSummary order={order} compact />{order.status === "AWAITING_PAYMENT" ? <Link href={`/pay/${order.id}`} className="pressable block rounded-xl bg-red-700 px-5 py-3.5 text-center text-sm font-black text-white shadow-lg shadow-red-900/15 hover:bg-red-600 focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2">Thanh toán ngay →</Link> : null}<p className="text-center text-xs leading-5 text-zinc-400">Cần hỗ trợ? Nhắn “gặp nhân viên” trong cuộc trò chuyện Messenger để được hỗ trợ tức thì.</p></div></Reveal>
  </div></main>;
}
