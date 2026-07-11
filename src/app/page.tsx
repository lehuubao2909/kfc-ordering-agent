import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { BrandMark } from "@/components/shared/brand-mark";

export const metadata: Metadata = { title: "Đặt món bằng Messenger" };

const steps = [
  ["01", "Quét mã QR", "Mở Messenger trên điện thoại và quét mã để bắt đầu."],
  ["02", "Nhắn món yêu thích", "Trò chuyện tự nhiên bằng tiếng Việt, Trợ lý AI hiểu ngay ý bạn."],
  ["03", "Thưởng thức nóng hổi", "Xác nhận đơn hàng, thanh toán và theo dõi hành trình giao hàng trực tiếp."],
] as const;

export default async function LandingPage() {
  // Fallback = page id AABW GOKU DEMO thật; production nên set NEXT_PUBLIC_MESSENGER_URL trên Vercel
  const messengerUrl = process.env.NEXT_PUBLIC_MESSENGER_URL ?? "https://m.me/1158293564041042?ref=aabw-demo";
  const qrDataUrl = await QRCode.toDataURL(messengerUrl, { width: 360, margin: 2, color: { dark: "#18181b", light: "#ffffff" } });

  return (
    <main id="main-content" className="min-h-screen bg-zinc-950 text-white">
      <section className="dot-grid relative isolate overflow-hidden px-5 pb-16 pt-6 sm:px-8 lg:min-h-[78vh] lg:px-12">
        <div className="absolute inset-x-0 top-0 -z-10 h-1.5 bg-red-600" />
        <div className="ambient-orb absolute -right-28 top-24 -z-10 size-80 rounded-full bg-red-700/30 blur-3xl" aria-hidden="true" />
        <nav className="mx-auto flex max-w-7xl items-center justify-between" aria-label="Điều hướng chính">
          <BrandMark inverse />
          <Link href="/staff" className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold text-white transition-colors duration-200 hover:border-white/50 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white">Staff Console</Link>
        </nav>

        <div className="mx-auto mt-14 grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_420px] lg:gap-20">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-red-200"><span className="size-2 animate-pulse rounded-full bg-red-500" aria-hidden="true" />Trợ lý Đặt món AI · Phục vụ 24/7</p>
            <h1 className="text-pretty text-5xl font-black leading-[0.98] tracking-[-0.05em] sm:text-6xl lg:text-8xl">Đói là nhắn.<br /><span className="text-red-500">Gà giòn tới ngay!</span></h1>
            <p className="mt-7 max-w-xl text-pretty text-lg leading-8 text-zinc-300 sm:text-xl">Đặt KFC qua Messenger dễ dàng như trò chuyện cùng người bạn thân. Trải nghiệm đặt món siêu tốc, chuẩn gu và bắt trọn mọi ưu đãi hấp dẫn!</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href={messengerUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-red-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-red-950/50 transition-colors duration-200 hover:bg-red-500 focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950">Đặt món trên Messenger ↗</a>
              <Link href="/admin" className="rounded-xl bg-white/10 px-6 py-3.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white">Xem Dashboard quản trị</Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm rounded-[2rem] bg-white p-5 text-zinc-950 shadow-2xl shadow-black/40">
            <div className="rounded-2xl border border-zinc-200 p-4"><Image src={qrDataUrl} width={360} height={360} priority alt="Mã QR mở trợ lý đặt món KFC trên Messenger" className="aspect-square size-full" unoptimized /></div>
            <div className="flex items-center gap-3 px-2 pb-1 pt-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-600 text-xl text-white" aria-hidden="true">✦</span><div><p className="font-black">Quét mã đặt ngay</p><p className="text-sm text-zinc-500">Không cần cài app, đặt món siêu tốc</p></div></div>
          </div>
        </div>
      </section>

      <section className="bg-stone-100 px-5 py-16 text-zinc-950 sm:px-8" aria-labelledby="how-it-works">
        <div className="mx-auto max-w-7xl"><p className="text-xs font-black uppercase tracking-[0.2em] text-red-700">Đặt món nhanh như một tin nhắn</p><h2 id="how-it-works" className="mt-3 text-balance text-3xl font-black tracking-tight sm:text-4xl">3 bước đơn giản chạm tới bữa ngon</h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">{steps.map(([number, title, description]) => <li key={number} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"><span className="font-mono text-sm font-black text-red-700">{number}</span><h3 className="mt-8 text-xl font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p></li>)}</ol>
        </div>
      </section>
    </main>
  );
}
