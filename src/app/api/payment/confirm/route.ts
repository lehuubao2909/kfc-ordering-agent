/** POST /api/payment/confirm {orderId} — trang /pay gọi khi bấm "Đã thanh toán (demo)". OWNER: Dev A. */
import { NextRequest } from "next/server";
import { z } from "zod";
import { confirmPayment, verifyPaymentToken } from "@/lib/services/payment-mock-service";
import { getOrderById } from "@/lib/services/order-service";
import { registerOrderStatusNotifications } from "@/lib/channels/notification-sender";
import { fail, handleError, ok, parseBody } from "../../_lib/route-utils";

// token bắt buộc: trang /pay lấy từ query ?t= trong link do getPaymentLink sinh.
const BodySchema = z.object({ orderId: z.string().min(1), token: z.string().optional() });

export async function POST(req: NextRequest) {
  registerOrderStatusNotifications(); // gắn listener push Messenger (idempotent), tại request-time
  try {
    const { orderId, token } = await parseBody(req, BodySchema);
    if (!verifyPaymentToken(orderId, token)) {
      return fail("FORBIDDEN", "Link thanh toán không hợp lệ hoặc đã hết hạn.", 403);
    }
    await confirmPayment(orderId);
    const order = await getOrderById(orderId);
    return ok(order);
  } catch (err) {
    return handleError(err);
  }
}
