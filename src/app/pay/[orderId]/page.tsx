import type { Metadata } from "next";
import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/reveal";
import { BrandMark } from "@/components/shared/brand-mark";
import { OrderSummary } from "@/components/order/order-summary";
import { PaymentPanel } from "@/components/payment/payment-panel";
import { getOrderById } from "@/lib/services/order-service";
import { getFullMenu } from "@/lib/services/menu-service";

export const metadata: Metadata = { title: "Thanh toán" };
// Đơn thật sinh lúc runtime → dynamic, KHÔNG generateStaticParams từ mock.
export const dynamic = "force-dynamic";

export default async function PaymentPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);
  if (!order) notFound();
  const menu = await getFullMenu();
  const payload = `KFC|${order.id}|${order.totalVnd}|AABW-DEMO`;
  const qrDataUrl = await QRCode.toDataURL(payload, { width: 280, margin: 2, color: { dark: "#18181b", light: "#ffffff" } });

  return <main id="main-content" className="premium-canvas min-h-screen px-5 py-5 sm:px-8 sm:py-8 lg:px-12"><div className="mx-auto max-w-5xl"><header className="premium-card flex items-center justify-between rounded-2xl px-4 py-3 sm:px-5"><BrandMark /><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">Thanh toán bảo mật</span></header><Reveal className="mt-10"><p className="text-sm font-bold text-red-700">Chỉ còn một bước nữa</p><h1 className="mt-2 text-balance text-3xl font-black tracking-[-0.035em] sm:text-5xl">Hoàn tất thanh toán đơn hàng</h1><p className="mt-3 text-sm text-zinc-500">Hệ thống giữ đơn hàng <span className="font-mono font-bold text-zinc-700" translate="no">{order.id}</span> của bạn trong 10 phút để đảm bảo chất lượng phục vụ.</p></Reveal><Reveal className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_1.08fr]" delay={0.06}><OrderSummary order={order} menu={menu} /><PaymentPanel order={order} qrDataUrl={qrDataUrl} /></Reveal></div></main>;
}
