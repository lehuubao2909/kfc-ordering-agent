"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import type { Order } from "@/lib/types";
import { currencyFormatter } from "@/components/shared/formatters";

type PaymentTab = "qr" | "card";

export function PaymentPanel({ order, qrDataUrl }: { order: Order; qrDataUrl: string }) {
  const [tab, setTab] = useState<PaymentTab>(order.paymentMethod === "card" ? "card" : "qr");
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function confirmPayment(event?: FormEvent) {
    event?.preventDefault();
    setState("submitting");
    try {
      const response = await fetch("/api/payment/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: order.id }) });
      if (!response.ok) throw new Error("PAYMENT_CONFIRM_FAILED");
      setState("success");
    } catch { setState("error"); }
  }

  if (state === "success") {
    return <section className="grid min-h-[520px] place-items-center rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center" aria-live="polite"><div><span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-600 text-3xl text-white" aria-hidden="true">✓</span><h2 className="mt-5 text-2xl font-black text-emerald-950">Thanh toán thành công!</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-emerald-800">Nhà hàng KFC đã nhận đơn hàng <span translate="no">{order.id}</span> của bạn và đang chuẩn bị những món ngon nóng hổi nhất. Hãy theo dõi hành trình giao hàng ngay nhé!</p><Link href={`/order/${order.id}`} className="mt-7 inline-flex rounded-xl bg-zinc-950 px-5 py-3 text-sm font-black text-white transition-colors duration-200 hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2">Theo dõi đơn hàng →</Link></div></section>;
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="payment-title">
      <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">Thanh toán an toàn</p><h2 id="payment-title" className="mt-1 text-xl font-black">Lựa chọn phương thức</h2></div><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-200">Demo</span></div>
      <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-zinc-100 p-1" role="tablist" aria-label="Phương thức thanh toán">
        <button type="button" role="tab" aria-selected={tab === "qr"} onClick={() => setTab("qr")} className={`rounded-lg px-3 py-2.5 text-sm font-bold transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-red-600 ${tab === "qr" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-800"}`}>Chuyển khoản QR</button>
        <button type="button" role="tab" aria-selected={tab === "card"} onClick={() => setTab("card")} className={`rounded-lg px-3 py-2.5 text-sm font-bold transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-red-600 ${tab === "card" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-800"}`}>Thẻ ATM / Thẻ quốc tế</button>
      </div>

      {tab === "qr" ? <div role="tabpanel" className="mt-6 text-center"><div className="mx-auto w-full max-w-[260px] rounded-2xl border border-zinc-200 p-3"><Image src={qrDataUrl} width={280} height={280} alt={`Mã QR thanh toán ${currencyFormatter.format(order.totalVnd)} cho đơn ${order.id}`} className="size-full" unoptimized /></div><p className="mt-4 text-sm font-bold">Quét mã QR bằng ứng dụng ngân hàng của bạn</p><p className="mt-1 text-xs text-zinc-500">Cú pháp chuyển khoản: <span className="font-mono font-bold" translate="no">KFC {order.id}</span></p><button type="button" disabled={state === "submitting"} onClick={() => confirmPayment()} className="mt-6 w-full rounded-xl bg-red-700 px-5 py-3.5 text-sm font-black text-white transition-colors duration-200 hover:bg-red-600 focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">{state === "submitting" ? "Đang xử lý thanh toán…" : "Xác nhận đã thanh toán"}</button></div> : <form role="tabpanel" className="mt-6 space-y-4" onSubmit={confirmPayment}><label className="block text-sm font-bold" htmlFor="card-number">Số thẻ thanh toán<input id="card-number" name="cardNumber" inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" required className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 font-mono text-sm focus-visible:border-red-600 focus-visible:ring-2 focus-visible:ring-red-200" /></label><div className="grid grid-cols-2 gap-3"><label className="block text-sm font-bold" htmlFor="expiry">Ngày hết hạn<input id="expiry" name="expiry" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" required className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus-visible:border-red-600 focus-visible:ring-2 focus-visible:ring-red-200" /></label><label className="block text-sm font-bold" htmlFor="cvv">CVV<input id="cvv" name="cvv" type="password" inputMode="numeric" autoComplete="cc-csc" placeholder="123" required className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm focus-visible:border-red-600 focus-visible:ring-2 focus-visible:ring-red-200" /></label></div><button disabled={state === "submitting"} className="w-full rounded-xl bg-red-700 px-5 py-3.5 text-sm font-black text-white transition-colors duration-200 hover:bg-red-600 focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">{state === "submitting" ? "Đang xử lý thanh toán…" : `Xác nhận thanh toán ${currencyFormatter.format(order.totalVnd)}`}</button></form>}
      {state === "error" ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-800" role="alert">Giao dịch chưa được xác nhận. Vui lòng kiểm tra lại tài khoản hoặc chuyển sang hình thức Thanh toán khi nhận hàng (COD).</p> : null}
      <p className="mt-4 text-center text-xs leading-5 text-zinc-400">Lưu ý: Đây là màn hình thử nghiệm. Mọi giao dịch đều được bảo mật và không phát sinh chi phí thực tế.</p>
    </section>
  );
}
