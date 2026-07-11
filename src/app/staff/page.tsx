import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { BrandMark } from "@/components/shared/brand-mark";
import { AdminAuthGate } from "@/components/admin/admin-auth-gate";
import { StaffConsole } from "@/components/staff/staff-console";

export const metadata: Metadata = { title: "Staff Console" };

export default function StaffConsolePage() {
  return <main id="main-content" className="premium-canvas min-h-screen px-5 py-5 sm:px-8 sm:py-7 lg:px-12 xl:px-16"><div className="mx-auto max-w-[1440px]">
    <header className="premium-card flex flex-wrap items-center justify-between gap-4 rounded-2xl px-4 py-3 sm:px-5"><BrandMark /><nav className="flex items-center gap-1 rounded-xl bg-zinc-100/80 p-1" aria-label="Khu vực vận hành"><Link href="/admin" className="pressable rounded-lg px-3.5 py-2 text-sm font-bold text-zinc-500 hover:bg-white hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-red-600">Dashboard</Link><span className="rounded-lg bg-zinc-950 px-3.5 py-2 text-sm font-bold text-white shadow-sm" aria-current="page">Staff Console</span></nav></header>
    <Reveal className="mb-8 mt-10 flex flex-wrap items-end justify-between gap-6" y={14}><div className="max-w-3xl"><div className="flex items-center gap-2"><span className="size-2 rounded-full bg-red-600 shadow-[0_0_0_5px_rgb(220_38_38_/_0.1)]" aria-hidden="true" /><p className="text-xs font-black uppercase tracking-[0.2em] text-red-700">Trung tâm vận hành</p></div><h1 className="mt-4 text-balance text-3xl font-black tracking-[-0.035em] sm:text-5xl">Phục vụ tức thì, trọn vẹn dịch vụ</h1><p className="mt-3 text-sm leading-6 text-zinc-500 sm:text-base">Trợ lý AI tự động nhận đơn siêu tốc. Nhân viên tiếp quản trực tiếp khi khách hàng cần.</p></div><div className="premium-card flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold text-emerald-800"><span className="relative flex size-3"><span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" /><span className="relative inline-flex size-3 rounded-full bg-emerald-500" /></span><div><p>Kết nối Messenger thời gian thực</p><p className="mt-0.5 font-medium text-zinc-400">Đồng bộ mỗi 3 giây</p></div></div></Reveal>
    <Reveal delay={0.06}><AdminAuthGate><StaffConsole /></AdminAuthGate></Reveal>
    <footer className="py-8 text-center text-xs text-zinc-400">Trang làm việc nhân viên · SĐT trong hội thoại được ẩn tự động</footer>
  </div></main>;
}
