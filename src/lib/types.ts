/**
 * NGUỒN SỰ THẬT DUY NHẤT cho types & schemas toàn dự án.
 * OWNER: Lead. Muốn thêm/sửa field → nhắn Lead, không tự sửa.
 * Mirror của docs/api-contract.md — sửa 1 chỗ phải sửa cả 2.
 */
import { z } from "zod";

// ===== Order state machine =====
export const ORDER_STATES = [
  "BROWSING", // đang xem menu / tư vấn
  "CART", // có món trong giỏ
  "CONFIRMING", // bot đã đọc lại đơn, chờ khách xác nhận
  "COLLECTING_DELIVERY", // hỏi địa chỉ + SĐT
  "SELECTING_PAYMENT", // chọn COD / QR / thẻ
  "AWAITING_PAYMENT", // đã gửi link /pay, chờ thanh toán (chỉ QR/thẻ)
  "PLACED", // đơn chốt, đã vào bếp
  "PREPARING",
  "DELIVERING",
  "DELIVERED",
  "CANCELLED", // chỉ hủy được trước PREPARING
] as const;
export const OrderStateSchema = z.enum(ORDER_STATES);
export type OrderState = z.infer<typeof OrderStateSchema>;

export const SESSION_MODES = ["agent", "human"] as const; // human = staff đã tiếp quản, agent mute
export type SessionMode = (typeof SESSION_MODES)[number];

export const PAYMENT_METHODS = ["cod", "qr", "card"] as const;
export const PaymentMethodSchema = z.enum(PAYMENT_METHODS);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

// ===== Menu =====
export const MenuItemSchema = z.object({
  id: z.string(), // vd "ga-ran-gion-cay-1-mieng"
  name: z.string(),
  aliases: z.array(z.string()).default([]), // "pepsi", "gà cay"... phục vụ NLU match
  category: z.enum(["combo", "chicken", "burger-rice", "snack", "dessert", "drink"]),
  priceVnd: z.number().int().positive(),
  description: z.string().default(""),
  imageUrl: z.string().default(""),
  comboItemIds: z.array(z.string()).optional(), // chỉ có khi category = combo
  available: z.boolean().default(true),
});
export type MenuItem = z.infer<typeof MenuItemSchema>;

// ===== Cart =====
export const CartItemSchema = z.object({
  itemId: z.string(),
  quantity: z.number().int().positive(),
  note: z.string().optional(), // "ít cay", "không đá"
});
export type CartItem = z.infer<typeof CartItemSchema>;

export const CartSchema = z.object({
  items: z.array(CartItemSchema).default([]),
  voucherCode: z.string().optional(),
});
export type Cart = z.infer<typeof CartSchema>;

// ===== Upsell recommendation =====
export const RecommendationRequestSchema = z.object({
  cart: z.array(CartItemSchema),
  timestamp: z.iso.datetime().optional(), // zod v4 API (z.string().datetime() làm Turbopack build fail); default = now, override để demo daypart
  channel: z.enum(["messenger", "eval"]).default("messenger"),
});
export const RecommendationSuggestionSchema = z.object({
  item: MenuItemSchema,
  score: z.number(),
  reason: z.string(), // "78% khách trưa gọi kèm Pepsi" — sinh từ template + số thật
});
export type RecommendationSuggestion = z.infer<typeof RecommendationSuggestionSchema>;

// ===== Order =====
// Dòng đơn snapshot giá tại thời điểm đặt (duyệt 11/7, đề xuất Dev A #5d) — hóa đơn không đổi khi giá menu đổi.
// unitPriceVnd optional TẠM để main xanh; TODO(Dev A): wire createOrderFromSession luôn set giá → báo Lead flip required.
export const OrderLineSchema = CartItemSchema.extend({
  unitPriceVnd: z.number().int().nonnegative().optional(),
});
export type OrderLine = z.infer<typeof OrderLineSchema>;

export const OrderSchema = z.object({
  id: z.string(),
  psid: z.string(), // Messenger sender id
  items: z.array(OrderLineSchema),
  subtotalVnd: z.number().int(),
  discountVnd: z.number().int().default(0),
  shippingFeeVnd: z.number().int().default(15000),
  totalVnd: z.number().int(),
  voucherCode: z.string().nullable().default(null),
  paymentMethod: PaymentMethodSchema.nullable().default(null),
  status: OrderStateSchema,
  deliveryAddress: z.string().nullable().default(null),
  deliveryPhone: z.string().nullable().default(null),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Order = z.infer<typeof OrderSchema>;

// ===== API envelope thống nhất mọi route =====
export type ApiEnvelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

export function apiOk<T>(data: T): ApiEnvelope<T> {
  return { ok: true, data };
}
export function apiError(code: string, message: string): ApiEnvelope<never> {
  return { ok: false, error: { code, message } };
}
