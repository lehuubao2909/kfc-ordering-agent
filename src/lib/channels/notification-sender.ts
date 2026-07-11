/**
 * Đăng ký push Messenger khi trạng thái đơn đổi. OWNER: Dev B.
 * Import file này 1 lần (side-effect) từ webhook route + admin advance route để listener được gắn.
 */
import { onOrderStatusChange } from "@/lib/services/order-status-events";
import { sendOrderUpdateMessage } from "./messenger-adapter";
import { recordOutgoingMessage } from "@/lib/agent/incoming-message-queue";
import { getLoyaltyPoints } from "@/lib/services/loyalty-service";
import { Order } from "@/lib/types";

const STATUS_MESSAGES: Partial<Record<Order["status"], (o: Order) => string>> = {
  PLACED: (o) => `✅ Đơn ${o.id} đã được xác nhận! Tổng ${o.totalVnd.toLocaleString("vi-VN")}đ. Dự kiến giao trong 30–40 phút ạ.`,
  PREPARING: (o) => `👨‍🍳 Đơn ${o.id} đang được chuẩn bị. Em sẽ báo anh/chị ngay khi shipper lấy hàng ạ!`,
  DELIVERING: (o) => `🛵 Đơn ${o.id} đang trên đường giao, khoảng 15–20 phút nữa tới nơi ạ!`,
  DELIVERED: (o) => `🍗 Đơn ${o.id} đã giao thành công! Chúc anh/chị ngon miệng. Cảm ơn đã đặt KFC ạ ❤️`,
};

let registered = false;
export function registerOrderStatusNotifications(): void {
  if (registered) return;
  registered = true;
  onOrderStatusChange(async (order) => {
    const template = STATUS_MESSAGES[order.status];
    if (!template) return;
    let text = template(order);

    // DELIVERED: báo luôn điểm loyalty vừa cộng (order-service đã earn 1đ/1000đ trước khi emit event)
    if (order.status === "DELIVERED" && order.deliveryPhone) {
      try {
        const earned = Math.floor(order.totalVnd / 1000);
        const { points } = await getLoyaltyPoints(order.deliveryPhone);
        text += ` Anh/chị vừa được cộng ${earned} điểm thành viên (tổng ${points.toLocaleString("vi-VN")} điểm) 🎁`;
      } catch (err) {
        console.error("loyalty trong push DELIVERED lỗi (bỏ qua):", err);
      }
    }

    await sendOrderUpdateMessage(order.psid, text);
    // Ghi vào message_log để transcript staff console đầy đủ (khách thấy gì, staff thấy nấy)
    await recordOutgoingMessage(order.psid, text).catch((err) => console.error("log push lỗi (bỏ qua):", err));
  });
}
