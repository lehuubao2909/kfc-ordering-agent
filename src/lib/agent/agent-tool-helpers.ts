/**
 * Helper dùng chung cho agent tools. OWNER: Dev B.
 * Giữ tools file gọn (<200 dòng) + DRY phần format tiền, resolve món, dựng hoá đơn.
 */
import { MenuItem } from "@/lib/types";
import { getMenuItemById, searchMenuItems } from "@/lib/services/menu-service";
import { getCart } from "@/lib/services/cart-service";
import { calculateOrderTotals } from "@/lib/services/order-service";
import { autoApplyBestVoucher, findVoucherOpportunity } from "@/lib/services/promotion-voucher-service";

export const fmtVnd = (n: number): string => n.toLocaleString("vi-VN") + "đ";

/**
 * Resolve món từ id HOẶC tên/alias (LLM có thể truyền tên thay id).
 * Guardrail chống bịa món: không match → {} (tool trả lỗi thân thiện, KHÔNG tự chế).
 */
export async function resolveMenuItem(
  idOrName: string
): Promise<{ item?: MenuItem; ambiguous?: MenuItem[] }> {
  const byId = await getMenuItemById(idOrName);
  if (byId) return { item: byId };
  const matches = await searchMenuItems(idOrName);
  if (matches.length === 1) return { item: matches[0] };
  if (matches.length > 1) return { ambiguous: matches.slice(0, 5) };
  return {};
}

export type OrderSummary = {
  lines: { name: string; quantity: number; unitPrice: string; lineTotal: string }[];
  subtotal: string;
  shipping: string;
  discount: string | null;
  voucherExplanation: string | null;
  voucherHint: string | null; // "thêm Xđ nữa đạt mã Y" — threshold upsell
  total: string;
  itemCount: number;
};

/** Dựng hoá đơn itemized từ cart hiện tại — giá/tổng CHỈ từ service (không LLM tính). */
export async function buildOrderSummary(psid: string): Promise<OrderSummary> {
  const cart = await getCart(psid);
  const totals = await calculateOrderTotals(cart);

  const lines = await Promise.all(
    cart.items.map(async (i) => {
      const m = await getMenuItemById(i.itemId);
      const unit = m?.priceVnd ?? 0;
      return {
        name: m?.name ?? i.itemId,
        quantity: i.quantity,
        unitPrice: fmtVnd(unit),
        lineTotal: fmtVnd(unit * i.quantity),
      };
    })
  );

  let voucherExplanation: string | null = null;
  if (totals.discountVnd > 0) {
    try {
      const v = await autoApplyBestVoucher(cart, totals.subtotalVnd);
      voucherExplanation = v?.explanation ?? null;
    } catch {
      voucherExplanation = null;
    }
  }

  // Threshold upsell: "thêm Xđ nữa là freeship" — deterministic từ service, agent relay 1 lần
  let voucherHint: string | null = null;
  try {
    voucherHint = (await findVoucherOpportunity(totals.subtotalVnd))?.hint ?? null;
  } catch {
    voucherHint = null;
  }

  return {
    lines,
    subtotal: fmtVnd(totals.subtotalVnd),
    shipping: fmtVnd(totals.shippingFeeVnd),
    discount: totals.discountVnd > 0 ? "-" + fmtVnd(totals.discountVnd) : null,
    voucherExplanation,
    voucherHint,
    total: fmtVnd(totals.totalVnd),
    itemCount: cart.items.reduce((n, i) => n + i.quantity, 0),
  };
}
