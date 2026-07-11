import type { OrderState, PaymentMethod } from "@/lib/types";

export const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  hour: "2-digit",
  minute: "2-digit",
  day: "2-digit",
  month: "2-digit",
});

export const statusLabels: Record<OrderState, string> = {
  BROWSING: "Đang tham khảo menu",
  CART: "Đang chọn món",
  CONFIRMING: "Chờ khách xác nhận",
  COLLECTING_DELIVERY: "Điền địa chỉ giao hàng",
  SELECTING_PAYMENT: "Chọn phương thức thanh toán",
  AWAITING_PAYMENT: "Chờ thanh toán",
  PLACED: "Đã nhận đơn",
  PREPARING: "Đang chuẩn bị món",
  DELIVERING: "Đang giao hàng",
  DELIVERED: "Đã giao thành công",
  CANCELLED: "Đã hủy đơn",
};

export const paymentLabels: Record<PaymentMethod, string> = {
  cod: "Thanh toán khi nhận hàng (COD)",
  qr: "Chuyển khoản QR siêu tốc",
  card: "Thẻ ATM / Thẻ quốc tế",
};
