import type { Metadata } from "next";
import Link from "next/link";
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

  // Guard vòng đời (fix 11/7): đơn KHÔNG còn chờ thanh toán → không hiện form thanh toán nữa.
  // Idempotency server-side đã chặn double-charge; đây là chặn ở tầng UX cho sạch.
  if (order.status !== "AWAITING_PAYMENT") {
    const cancelled = order.status === "CANCELLED";
    return <main id="main-content" className="premium-canvas grid min-h-screen place-items-center px-5 py-10"><div className="w-full max-w-lg"><header className="mb-6 flex justify-center"><BrandMark /></header><section className={`rounded-2xl border p-8 text-center shadow-sm ${cancelled ? "border-zinc-200 bg-white" : "border-emerald-200 bg-emerald-50"}`}><span className={`mx-auto grid size-16 place-items-center rounded-full text-3xl text-white ${cancelled ? "bg-zinc-400" : "bg-emerald-600"}`} aria-hidden="true">{cancelled ? "✕" : "✓"}</span><h1 className={`mt-5 text-2xl font-black ${cancelled ? "text-zinc-900" : "text-emerald-950"}`}>{cancelled ? "Đơn hàng đã hủy" : "Đơn đã được thanh toán"}</h1><p className={`mx-auto mt-2 max-w-sm text-sm leading-6 ${cancelled ? "text-zinc-500" : "text-emerald-800"}`}>{cancelled ? <>Đơn <span translate="no" className="font-bold">{order.id}</span> đã được hủy trước đó. Anh/chị đặt đơn mới qua Messenger nhé!</> : <>Đơn <span translate="no" className="font-bold">{order.id}</span> đã xác nhận thanh toán và đang được xử lý — không cần thanh toán lại ạ.</>}</p>{!cancelled ? <Link href={`/order/${order.id}`} className="mt-7 inline-flex rounded-xl bg-zinc-950 px-5 py-3 text-sm font-black text-white transition-colors duration-200 hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2">Theo dõi đơn hàng →</Link> : <Link href="/" className="mt-7 inline-flex rounded-xl bg-red-700 px-5 py-3 text-sm font-black text-white hover:bg-red-600">Đặt đơn mới</Link>}</section></div></main>;
  }

  const payload = `KFC|${order.id}|${order.totalVnd}|AABW-DEMO`;
  const qrDataUrl = await QRCode.toDataURL(payload, { width: 280, margin: 2, color: { dark: "#18181b", light: "#ffffff" } });

  return <main id="main-content" className="premium-canvas min-h-screen px-5 py-5 sm:px-8 sm:py-8 lg:px-12"><div className="mx-auto max-w-5xl"><header className="premium-card flex items-center justify-between rounded-2xl px-4 py-3 sm:px-5"><BrandMark /><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">Thanh toán bảo mật</span></header><Reveal className="mt-10"><p className="text-sm font-bold text-red-700">Chỉ còn một bước nữa</p><h1 className="mt-2 text-balance text-3xl font-black tracking-[-0.035em] sm:text-5xl">Hoàn tất thanh toán đơn hàng</h1><p className="mt-3 text-sm text-zinc-500">Hệ thống giữ đơn hàng <span className="font-mono font-bold text-zinc-700" translate="no">{order.id}</span> của bạn trong 10 phút để đảm bảo chất lượng phục vụ.</p></Reveal><Reveal className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_1.08fr]" delay={0.06}><OrderSummary order={order} menu={menu} /><PaymentPanel order={order} qrDataUrl={qrDataUrl} /></Reveal></div></main>;
}
