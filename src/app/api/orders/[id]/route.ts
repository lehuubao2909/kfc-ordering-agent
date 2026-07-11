/**
 * GET /api/orders/[id] — trang /order (tracking) & /pay đọc 1 đơn qua HTTP. OWNER: Dev A.
 * Công khai (khách chưa đăng nhập); trả full để trang tracking hiện địa chỉ/SĐT đơn của khách.
 * (Staff view nhiều khách thì mới mask — xem /api/admin/orders.)
 * TODO(Lead): thêm route này vào docs/api-contract.md.
 */
import { NextRequest } from "next/server";
import { getOrderById } from "@/lib/services/order-service";
import { getStoreById } from "@/lib/services/store-service";
import { fail, handleError, ok } from "../../_lib/route-utils";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);
    if (!order) return fail("NOT_FOUND", `Không tìm thấy đơn ${id}.`, 404);
    // Kèm cửa hàng phục vụ (store-aware flow) — null nếu đơn tạo trước khi có store layer
    const store = order.storeId ? await getStoreById(order.storeId) : null;
    return ok({ ...order, store: store ? { id: store.id, name: store.name, address: store.address, closeHour: store.closeHour } : null });
  } catch (err) {
    return handleError(err);
  }
}
