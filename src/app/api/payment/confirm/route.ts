/** POST /api/payment/confirm {orderId} — trang /pay gọi khi bấm "Đã thanh toán (demo)". OWNER: Dev A. */
import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/types";

export async function POST(_req: NextRequest) {
  // TODO(Dev A): parse {orderId} → confirmPayment(orderId) → apiOk; nhớ import notification-sender để listener gắn
  return NextResponse.json(apiError("NOT_IMPLEMENTED", "TODO(Dev A)"), { status: 501 });
}
