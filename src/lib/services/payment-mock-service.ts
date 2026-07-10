/**
 * Payment mock — minh bạch là demo, KHÔNG giả vờ cổng thật. OWNER: Dev A.
 * Flow: SELECTING_PAYMENT chọn qr/card → order sang AWAITING_PAYMENT + trả link /pay/[orderId]
 * → trang /pay bấm "Tôi đã thanh toán (demo)" → confirmPayment → PLACED + event push.
 * Roadmap slide: VNPay/MoMo/ZaloPay là webhook chuẩn thay hàm confirm này.
 */

// TODO(Dev A): trả URL trang thanh toán cho agent gửi khách
export function getPaymentLink(orderId: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/pay/${orderId}`;
}

// TODO(Dev A): verify order đang AWAITING_PAYMENT → advanceOrderStatus(PLACED)
export async function confirmPayment(_orderId: string): Promise<void> {
  throw new Error("TODO(Dev A): confirmPayment");
}
