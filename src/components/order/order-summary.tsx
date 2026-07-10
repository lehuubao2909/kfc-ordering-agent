import type { MockOrder } from "@/lib/mock/mock-data-types";
import { menuById } from "@/lib/mock/mock-data";
import { currencyFormatter } from "@/components/shared/formatters";

export function OrderSummary({ order, compact = false }: { order: MockOrder; compact?: boolean }) {
  return (
    <section aria-labelledby="order-summary-title" className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">Tóm tắt đơn hàng</p><h2 id="order-summary-title" className="mt-1 font-black" translate="no">{order.id}</h2></div><span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-600">{order.items.reduce((sum, item) => sum + item.quantity, 0)} món</span></div>
      <ul className={`${compact ? "my-4" : "my-6"} divide-y divide-zinc-100`}>
        {order.items.map((item) => {
          const menuItem = menuById.get(item.itemId);
          return <li key={`${item.itemId}-${item.note ?? ""}`} className="flex min-w-0 gap-3 py-3 first:pt-0 last:pb-0"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-red-50 text-sm font-black text-red-700">{item.quantity}×</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{menuItem?.name ?? item.itemId}</p>{item.note ? <p className="text-xs text-zinc-500">Yêu cầu thêm: {item.note}</p> : null}</div><span className="shrink-0 text-sm font-semibold tabular-nums">{currencyFormatter.format((menuItem?.priceVnd ?? 0) * item.quantity)}</span></li>;
        })}
      </ul>
      <dl className="space-y-2 border-t border-dashed border-zinc-200 pt-4 text-sm"><div className="flex justify-between"><dt className="text-zinc-500">Tạm tính</dt><dd className="font-semibold tabular-nums">{currencyFormatter.format(order.subtotalVnd)}</dd></div>{order.discountVnd > 0 ? <div className="flex justify-between text-emerald-700"><dt>Khuyến mãi {order.voucherCode ? `· ${order.voucherCode}` : ""}</dt><dd className="font-semibold tabular-nums">−{currencyFormatter.format(order.discountVnd)}</dd></div> : null}<div className="flex justify-between"><dt className="text-zinc-500">Phí vận chuyển</dt><dd className="font-semibold tabular-nums">{order.shippingFeeVnd === 0 ? "Miễn phí" : currencyFormatter.format(order.shippingFeeVnd)}</dd></div><div className="flex justify-between border-t border-zinc-200 pt-3 text-base"><dt className="font-black">Tổng thanh toán</dt><dd className="font-black text-red-700 tabular-nums">{currencyFormatter.format(order.totalVnd)}</dd></div></dl>
    </section>
  );
}
