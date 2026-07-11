/** POST /api/payment/confirm {orderId} — trang /pay gọi khi bấm "Đã thanh toán (demo)". OWNER: Dev A. */
import { NextRequest } from "next/server";
import { z } from "zod";
import { confirmPayment } from "@/lib/services/payment-mock-service";
import { getOrderById } from "@/lib/services/order-service";
import { registerOrderStatusNotifications } from "@/lib/channels/notification-sender";
import { handleError, ok, parseBody } from "../../_lib/route-utils";

const BodySchema = z.object({ orderId: z.string().min(1) });

export async function POST(req: NextRequest) {
  registerOrderStatusNotifications(); // gắn listener push Messenger (idempotent), tại request-time
  try {
    const { orderId } = await parseBody(req, BodySchema);
    await confirmPayment(orderId);
    const order = await getOrderById(orderId);
    return ok(order);
  } catch (err) {
    return handleError(err);
  }
}
