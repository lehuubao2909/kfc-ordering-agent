import type { OrderState } from "@/lib/types";

const timeline = [
  ["PLACED", "Đã tiếp nhận đơn", "Hệ thống KFC đã ghi nhận đơn hàng của bạn"],
  ["PREPARING", "Đang chuẩn bị món", "Bếp đang chế biến món ngon nóng giòn"],
  ["DELIVERING", "Đang giao hàng", "Shipper đang giao món ngon nóng hổi tới bạn"],
  ["DELIVERED", "Đã giao thành công", "Món ngon đã sẵn sàng. Chúc bạn ngon miệng cùng KFC!"],
] as const;

export function OrderStatusTimeline({ status }: { status: OrderState }) {
  const currentIndex = timeline.findIndex(([value]) => value === status);
  return (
    <section aria-labelledby="timeline-title" className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
      <h2 id="timeline-title" className="text-lg font-black">Hành trình đơn hàng</h2>
      {status === "AWAITING_PAYMENT" ? <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="font-bold text-amber-900">Đang chờ thanh toán</p><p className="mt-1 text-sm text-amber-800">Nhà hàng sẽ chuẩn bị món ngay khi giao dịch thanh toán thành công.</p></div> : null}
      <ol className="mt-6 space-y-0">
        {timeline.map(([value, label, description], index) => {
          const complete = currentIndex >= index;
          const active = currentIndex === index;
          return <li key={value} className="relative flex gap-4 pb-7 last:pb-0">{index < timeline.length - 1 ? <span className={`absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5 ${complete && currentIndex > index ? "bg-red-600" : "bg-zinc-200"}`} aria-hidden="true" /> : null}<span className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-full border-2 text-xs font-black ${complete ? "border-red-600 bg-red-600 text-white" : "border-zinc-200 bg-white text-zinc-400"}`} aria-hidden="true">{complete && !active ? "✓" : index + 1}</span><div className="pt-0.5"><p className={`font-bold ${active ? "text-red-700" : complete ? "text-zinc-950" : "text-zinc-400"}`}>{label}{active ? <span className="ml-2 text-xs font-bold uppercase tracking-wide">Hiện tại</span> : null}</p><p className={`mt-1 text-sm ${complete ? "text-zinc-500" : "text-zinc-400"}`}>{description}</p></div></li>;
        })}
      </ol>
    </section>
  );
}
