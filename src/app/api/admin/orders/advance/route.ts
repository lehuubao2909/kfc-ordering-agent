/** POST /api/admin/orders/advance {orderId, to} — staff console chuyển trạng thái → push khách. OWNER: Dev A. */
import { NextRequest } from "next/server";
import { z } from "zod";
import { OrderStateSchema } from "@/lib/types";
import { advanceOrderStatus } from "@/lib/services/order-service";
import { registerOrderStatusNotifications } from "@/lib/channels/notification-sender";
import { handleError, ok, parseBody, requireBasicAuth } from "../../../_lib/route-utils";

const BodySchema = z.object({ orderId: z.string().min(1), to: OrderStateSchema });

export async function POST(req: NextRequest) {
  const denied = requireBasicAuth(req);
  if (denied) return denied;
  registerOrderStatusNotifications(); // gắn listener push Messenger (idempotent), tại request-time
  try {
    const { orderId, to } = await parseBody(req, BodySchema);
    const order = await advanceOrderStatus(orderId, to);
    return ok(order);
  } catch (err) {
    return handleError(err);
  }
}
