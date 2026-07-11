import type { OrderState } from "@/lib/types";
import { statusLabels } from "./formatters";

const styles: Partial<Record<OrderState, string>> = {
  AWAITING_PAYMENT: "bg-amber-50 text-amber-800 ring-amber-200",
  PLACED: "bg-sky-50 text-sky-800 ring-sky-200",
  PREPARING: "bg-orange-50 text-orange-800 ring-orange-200",
  DELIVERING: "bg-violet-50 text-violet-800 ring-violet-200",
  DELIVERED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  CANCELLED: "bg-zinc-100 text-zinc-600 ring-zinc-200",
};

export function StatusBadge({ status }: { status: OrderState }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${styles[status] ?? "bg-red-50 text-red-800 ring-red-200"}`}>
      <span className="mr-1.5 size-1.5 rounded-full bg-current" aria-hidden="true" />
      {statusLabels[status]}
    </span>
  );
}
