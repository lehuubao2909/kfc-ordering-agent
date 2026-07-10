/** GET /api/admin/orders — danh sách đơn cho admin/staff (polling 2s). OWNER: Dev A. Basic auth env. */
import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/types";

export async function GET(_req: NextRequest) {
  // TODO(Dev A): check basic auth (ADMIN_BASIC_AUTH) → trả orders mới nhất + funnel metrics
  return NextResponse.json(apiError("NOT_IMPLEMENTED", "TODO(Dev A)"), { status: 501 });
}
