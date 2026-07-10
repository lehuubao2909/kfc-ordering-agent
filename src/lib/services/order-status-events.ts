/**
 * Event hub trạng thái đơn — ranh giới giữa services (Dev A) và channel push (Dev B).
 * Dev A GỌI emitOrderStatusChange trong advanceOrderStatus.
 * Dev B ĐĂNG KÝ listener trong notification-sender để push Messenger (POST_PURCHASE_UPDATE tag).
 * In-process đủ cho serverless vì emit xảy ra trong cùng request với transition.
 */
import { Order } from "@/lib/types";

type OrderStatusListener = (order: Order) => Promise<void>;
const listeners: OrderStatusListener[] = [];

export function onOrderStatusChange(listener: OrderStatusListener): void {
  listeners.push(listener);
}

export async function emitOrderStatusChange(order: Order): Promise<void> {
  // Chạy tuần tự, nuốt lỗi từng listener — push fail không được làm hỏng transition
  for (const l of listeners) {
    try {
      await l(order);
    } catch (err) {
      console.error("order-status listener error:", err);
    }
  }
}
