/**
 * GET /api/orders/[id] — trang /order (tracking) & /pay đọc 1 đơn qua HTTP. OWNER: Dev A.
 * Công khai (khách chưa đăng nhập) nhưng id đoán được → MASK deliveryPhone + deliveryAddress
 * để dò id không lộ PII khách khác. Hành động đổi tiền/trạng thái vẫn token-gated ở /payment/confirm.
 * TODO(Lead): thêm route này vào docs/api-contract.md.
 */
import { NextRequest } from "next/server";
import { getOrderById } from "@/lib/services/order-service";
import { fail, handleError, maskAddress, maskPhone, ok } from "../../_lib/route-utils";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);
    if (!order) return fail("NOT_FOUND", `Không tìm thấy đơn ${id}.`, 404);
    return ok({
      ...order,
      deliveryPhone: maskPhone(order.deliveryPhone),
      deliveryAddress: maskAddress(order.deliveryAddress),
    });
  } catch (err) {
    return handleError(err);
  }
}
