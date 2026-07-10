/**
 * Payment mock — minh bạch là demo, KHÔNG giả vờ cổng thật. OWNER: Dev A.
 * Flow: SELECTING_PAYMENT chọn qr/card → order sang AWAITING_PAYMENT + trả link /pay/[orderId]
 * → trang /pay bấm "Tôi đã thanh toán (demo)" → confirmPayment → PLACED + event push.
 * Roadmap slide: VNPay/MoMo/ZaloPay là webhook chuẩn thay hàm confirm này.
 *
 * Bảo mật: order id (KFC-xxxx) là tuần tự/đoán được → link /pay kèm PAYMENT TOKEN (HMAC của id).
 * Route /api/payment/confirm bắt buộc verify token trước khi chốt → không ai đoán id mà confirm hộ được.
 * Không cần cột DB mới: token tính lại từ id + secret (stateless).
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { advanceOrderStatus, getOrderById, OrderTransitionError } from "./order-service";

function tokenSecret(): string {
  const s = process.env.PAYMENT_TOKEN_SECRET ?? process.env.META_APP_SECRET;
  if (!s) console.warn("payment: thiếu PAYMENT_TOKEN_SECRET/META_APP_SECRET → dùng secret fallback (chỉ dev).");
  return s ?? "kfc-demo-fallback-secret";
}

/** Token gắn vào link /pay để chống confirm bằng id đoán mò. */
export function paymentToken(orderId: string): string {
  return createHmac("sha256", tokenSecret()).update(orderId).digest("base64url").slice(0, 24);
}

/** So khớp token an toàn theo thời gian (chống timing attack). */
export function verifyPaymentToken(orderId: string, token: string | undefined): boolean {
  if (!token) return false;
  const a = Buffer.from(paymentToken(orderId));
  const b = Buffer.from(token);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// Trả URL trang thanh toán (kèm token) cho agent gửi khách.
export function getPaymentLink(orderId: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/pay/${orderId}?t=${paymentToken(orderId)}`;
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
