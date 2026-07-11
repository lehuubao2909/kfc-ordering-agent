import Link from "next/link";

export function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-3 rounded-lg focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2" aria-label="KFC AI Ordering — Trang chủ">
      <span className="grid size-10 place-items-center rounded-xl bg-red-700 text-lg font-black text-white shadow-sm transition-transform duration-200 group-hover:-rotate-3" aria-hidden="true">K</span>
      <span className={`leading-tight ${inverse ? "text-white" : "text-zinc-950"}`}>
        <span className="block text-sm font-black tracking-[0.16em]">KFC AI</span>
        <span className={`block text-[10px] font-semibold uppercase tracking-[0.12em] ${inverse ? "text-red-100" : "text-zinc-500"}`}>Ordering Agent</span>
      </span>
    </Link>
  );
}
