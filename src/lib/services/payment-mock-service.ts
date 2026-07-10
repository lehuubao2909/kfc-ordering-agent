/**
 * Payment mock — minh bạch là demo, KHÔNG giả vờ cổng thật. OWNER: Dev A.
 * Flow: SELECTING_PAYMENT chọn qr/card → order sang AWAITING_PAYMENT + trả link /pay/[orderId]
 * → trang /pay bấm "Tôi đã thanh toán (demo)" → confirmPayment → PLACED + event push.
 * Roadmap slide: VNPay/MoMo/ZaloPay là webhook chuẩn thay hàm confirm này.
 */
import { advanceOrderStatus, getOrderById, OrderTransitionError } from "./order-service";

// TODO(Dev A): trả URL trang thanh toán cho agent gửi khách
export function getPaymentLink(orderId: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/pay/${orderId}`;
}

// Verify order đang AWAITING_PAYMENT → advanceOrderStatus(PLACED) → event push.
export async function confirmPayment(orderId: string): Promise<void> {
  const order = await getOrderById(orderId);
  if (!order) throw new OrderTransitionError(`Không tìm thấy đơn ${orderId}.`);
  if (order.status !== "AWAITING_PAYMENT") {
    if (order.status === "PLACED") return; // đã thanh toán rồi (double-confirm) — idempotent
    throw new OrderTransitionError(`Đơn ${orderId} không ở trạng thái chờ thanh toán ạ.`);
  }
  await advanceOrderStatus(orderId, "PLACED");
}
