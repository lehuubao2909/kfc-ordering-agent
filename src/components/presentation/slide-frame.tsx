/**
 * Khung slide 16:9 (thiết kế cứng 1280×720, viewer/print tự scale) + primitives dùng chung.
 * Theme light theo phong cách tài liệu BTC: nền kem ấm, chữ navy đậm, accent đỏ KFC.
 */
import type { ReactNode } from "react";

export const SLIDE_W = 1280;
export const SLIDE_H = 720;
export const TEAM_NAME = "GOKU Team"; // ← sửa tên team/thành viên tại đây

export function Slide({ children, footer, dark = false }: { children: ReactNode; footer?: string; dark?: boolean }) {
  return (
    <section
      className={`relative flex flex-col overflow-hidden ${dark ? "bg-[#101828] text-[#F4F1EA]" : "bg-[#FAF7F2] text-[#1A2233]"}`}
      style={{ width: SLIDE_W, height: SLIDE_H }}
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#C8102E] via-[#E4572E] to-[#F2A33C]" />
      <div className="flex min-h-0 flex-1 flex-col px-16 pb-10 pt-12">{children}</div>
      <div className={`flex items-center justify-between px-16 pb-6 text-[11px] font-bold uppercase tracking-[0.18em] ${dark ? "text-white/40" : "text-[#1A2233]/35"}`}>
        <span>KFC Ordering Agent · AABW 2026 · F&B Track</span>
        <span>{footer ?? ""}</span>
      </div>
    </section>
  );
}

export function Eyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return <p className={`text-[13px] font-black uppercase tracking-[0.22em] ${dark ? "text-[#F2A33C]" : "text-[#C8102E]"}`}>{children}</p>;
}

export function Title({ children }: { children: ReactNode }) {
  return <h2 className="mt-2 text-[40px] font-black leading-[1.08] tracking-[-0.02em]">{children}</h2>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-[#1A2233]/10 bg-white p-5 shadow-[0_2px_12px_rgb(26_34_51_/_0.05)] ${className}`}>{children}</div>;
}

export function CardLabel({ children, color = "text-[#C8102E]" }: { children: ReactNode; color?: string }) {
  return <p className={`text-[12px] font-black uppercase tracking-[0.14em] ${color}`}>{children}</p>;
}

/** Hàng pipeline có mũi tên — dùng cho flow Goal→Plan→Tools→Act→Verify và kiến trúc. */
export function FlowRow({ steps, highlight = -1 }: { steps: { label: string; note: string }[]; highlight?: number }) {
  return (
    <div className="flex items-stretch gap-2">
      {steps.map((s, i) => (
        <div key={s.label} className="flex min-w-0 flex-1 items-center gap-2">
          <div className={`flex h-full min-w-0 flex-1 flex-col justify-center rounded-xl border p-3.5 ${i === highlight ? "border-[#2563EB] bg-[#2563EB] text-white" : "border-[#1A2233]/10 bg-white"}`}>
            <p className="text-[15px] font-black leading-tight">{s.label}</p>
            <p className={`mt-1 text-[12.5px] leading-snug ${i === highlight ? "text-white/85" : "text-[#1A2233]/65"}`}>{s.note}</p>
          </div>
          {i < steps.length - 1 ? <span className="shrink-0 text-lg font-black text-[#1A2233]/30">→</span> : null}
        </div>
      ))}
    </div>
  );
}

export function Callout({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <div className={`rounded-xl px-5 py-3.5 text-center text-[16px] font-bold ${dark ? "bg-white/10 text-white" : "bg-[#101828] text-white"}`}>
      {children}
    </div>
  );
}
