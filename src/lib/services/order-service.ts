/**
 * Order service — TRÁI TIM STATE MACHINE. OWNER: Dev A.
 * Mọi transition trạng thái đơn đi qua đây. LLM/route KHÔNG tự đổi state.
 * Transition sai → throw OrderTransitionError với message tiếng Việt để agent relay cho khách.
 */
import { Cart, Order, OrderState, PaymentMethod } from "@/lib/types";

export class OrderTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderTransitionError";
  }
}

/** Các transition hợp lệ. Nguồn sự thật: docs/api-contract.md mục State machine. */
export const VALID_TRANSITIONS: Record<string, OrderState[]> = {
  BROWSING: ["CART"],
  CART: ["CONFIRMING", "BROWSING"],
  CONFIRMING: ["COLLECTING_DELIVERY", "CART"], // quay lại CART nếu khách sửa món
  COLLECTING_DELIVERY: ["SELECTING_PAYMENT"],
  SELECTING_PAYMENT: ["AWAITING_PAYMENT", "PLACED"], // COD → PLACED thẳng
  AWAITING_PAYMENT: ["PLACED", "CANCELLED"],
  PLACED: ["PREPARING", "CANCELLED"],
  PREPARING: ["DELIVERING"], // từ đây không hủy được nữa
  DELIVERING: ["DELIVERED"],
};

// TODO(Dev A): implement — tính subtotal/discount/total từ cart (giá CHỈ từ menu-service, cộng phí ship flat 15k)
export async function calculateOrderTotals(_cart: Cart): Promise<{ subtotalVnd: number; discountVnd: number; shippingFeeVnd: number; totalVnd: number }> {
  throw new Error("TODO(Dev A): calculateOrderTotals");
}

// TODO(Dev A): tạo order từ session (state CONFIRMING trở đi), sinh id "KFC-xxxx"
export async function createOrderFromSession(_psid: string, _paymentMethod: PaymentMethod): Promise<Order> {
  throw new Error("TODO(Dev A): createOrderFromSession");
}

// TODO(Dev A): validate transition qua VALID_TRANSITIONS, update DB, gọi emitOrderStatusChange (order-status-events)
export async function advanceOrderStatus(_orderId: string, _to: OrderState): Promise<Order> {
  throw new Error("TODO(Dev A): advanceOrderStatus");
}

// TODO(Dev A): hủy — chỉ hợp lệ trước PREPARING, ngược lại throw OrderTransitionError("Đơn đã vào bếp...")
export async function cancelOrder(_orderId: string): Promise<Order> {
  throw new Error("TODO(Dev A): cancelOrder");
}

export async function getOrderById(_orderId: string): Promise<Order | null> {
  throw new Error("TODO(Dev A): getOrderById");
}

export async function getActiveOrderByPsid(_psid: string): Promise<Order | null> {
  throw new Error("TODO(Dev A): getActiveOrderByPsid");
}
