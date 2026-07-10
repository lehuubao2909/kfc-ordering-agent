/** POST /api/admin/orders/advance {orderId, to} — staff console chuyển trạng thái → push khách. OWNER: Dev A. */
import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/types";

export async function POST(_req: NextRequest) {
  // TODO(Dev A): validate → advanceOrderStatus(orderId, to) → apiOk(order). Import notification-sender trước.
  return NextResponse.json(apiError("NOT_IMPLEMENTED", "TODO(Dev A)"), { status: 501 });
}
