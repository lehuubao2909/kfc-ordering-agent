/**
 * Promotion & voucher. OWNER: Dev A.
 * Điểm khác biệt pitch: autoApplyBestVoucher — bot TỰ áp mã tốt nhất và giải thích, không bắt khách nhớ mã.
 */
import { Cart } from "@/lib/types";

export type VoucherResult = { code: string; description: string; discountVnd: number; explanation: string };

// TODO(Dev A): list promotion active (cho agent giới thiệu khi khách hỏi ưu đãi)
export async function getActivePromotions(): Promise<{ title: string; description: string }[]> {
  throw new Error("TODO(Dev A): getActivePromotions");
}

// TODO(Dev A): thử mọi voucher active thỏa minOrderVnd → chọn discount lớn nhất → trả kèm explanation tiếng Việt
export async function autoApplyBestVoucher(_cart: Cart, _subtotalVnd: number): Promise<VoucherResult | null> {
  throw new Error("TODO(Dev A): autoApplyBestVoucher");
}

// TODO(Dev A): áp mã cụ thể khách đưa; sai/hết hạn → trả lỗi message thân thiện
export async function applyVoucherCode(_cart: Cart, _code: string, _subtotalVnd: number): Promise<VoucherResult> {
  throw new Error("TODO(Dev A): applyVoucherCode");
}
