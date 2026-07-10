/**
 * Định nghĩa 14 tools + state gating. OWNER: Dev B.
 * Nguyên tắc: tool = wrapper mỏng gọi THẲNG service functions (không qua HTTP nội bộ).
 * getToolsForState(state) chỉ trả tools hợp lệ — LLM không thể checkout khi chưa CONFIRMING
 * (service layer của Dev A validate lần 2, đây là lớp 1).
 */
import { OrderState } from "@/lib/types";

// TODO(Dev B): dùng `tool()` của Vercel AI SDK + zod inputSchema, execute gọi services của Dev A:
// get_menu, get_promotions, get_upsell_suggestions, add_to_cart, remove_from_cart, update_cart_item,
// view_cart, confirm_order, set_delivery_info, get_loyalty_points, select_payment_method,
// get_order_status, cancel_order, handoff_to_human

/** Tool nào được phép ở state nào — mirror docs/api-contract.md mục State machine */
export const TOOLS_BY_STATE: Record<OrderState, string[]> = {
  BROWSING: ["get_menu", "get_promotions", "add_to_cart", "get_order_status", "handoff_to_human"],
  CART: ["get_menu", "get_promotions", "get_upsell_suggestions", "add_to_cart", "remove_from_cart", "update_cart_item", "view_cart", "confirm_order", "handoff_to_human"],
  CONFIRMING: ["view_cart", "add_to_cart", "remove_from_cart", "set_delivery_info", "handoff_to_human"],
  COLLECTING_DELIVERY: ["set_delivery_info", "get_loyalty_points", "handoff_to_human"],
  SELECTING_PAYMENT: ["select_payment_method", "get_loyalty_points", "handoff_to_human"],
  AWAITING_PAYMENT: ["get_order_status", "cancel_order", "handoff_to_human"],
  PLACED: ["get_order_status", "cancel_order", "get_menu", "handoff_to_human"],
  PREPARING: ["get_order_status", "get_menu", "handoff_to_human"],
  DELIVERING: ["get_order_status", "get_menu", "handoff_to_human"],
  DELIVERED: ["get_menu", "get_promotions", "add_to_cart", "handoff_to_human"],
  CANCELLED: ["get_menu", "get_promotions", "add_to_cart", "handoff_to_human"],
};

// TODO(Dev B): export function getToolsForState(state: OrderState): ToolSet
