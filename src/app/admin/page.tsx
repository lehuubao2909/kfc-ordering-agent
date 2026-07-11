import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/shared/brand-mark";
import { AdminAuthGate } from "@/components/admin/admin-auth-gate";
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default function AdminDashboardPage() {
  return <main id="main-content" className="premium-canvas min-h-screen px-5 py-5 sm:px-8 sm:py-7 lg:px-12 xl:px-16"><div className="mx-auto max-w-[1440px]">
    <header className="premium-card flex flex-wrap items-center justify-between gap-4 rounded-2xl px-4 py-3 sm:px-5"><BrandMark /><nav className="flex items-center gap-1 rounded-xl bg-zinc-100/80 p-1" aria-label="Khu vực vận hành"><span className="rounded-lg bg-zinc-950 px-3.5 py-2 text-sm font-bold text-white shadow-sm" aria-current="page">Dashboard</span><Link href="/staff" className="pressable rounded-lg px-3.5 py-2 text-sm font-bold text-zinc-500 hover:bg-white hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-red-600">Staff Console</Link></nav></header>
    <AdminAuthGate><AdminDashboardClient /></AdminAuthGate>
    <footer className="py-8 text-center text-xs text-zinc-400">Dữ liệu trực tiếp từ hệ thống · Cập nhật mỗi 3 giây</footer>
  </div></main>;
}
