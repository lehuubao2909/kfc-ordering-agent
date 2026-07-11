/** GET /api/admin/orders — danh sách đơn cho admin/staff (polling 2s) + funnel metrics. OWNER: Dev A. Basic auth. */
import { NextRequest } from "next/server";
import { getOrdersOverview } from "@/lib/services/admin-metrics-service";
import { handleError, maskPhone, ok, requireBasicAuth } from "../../_lib/route-utils";

export async function GET(req: NextRequest) {
  const denied = requireBasicAuth(req);
  if (denied) return denied;
  try {
    const overview = await getOrdersOverview();
    // Che SĐT trước khi trả ra admin.
    const orders = overview.orders.map((o) => ({ ...o, deliveryPhone: maskPhone(o.deliveryPhone) }));
    return ok({ ...overview, orders });
  } catch (err) {
    return handleError(err);
  }
}
