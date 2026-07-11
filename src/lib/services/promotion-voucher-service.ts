/**
 * Promotion & voucher. OWNER: Dev A.
 * Điểm khác biệt pitch: autoApplyBestVoucher — bot TỰ áp mã tốt nhất và giải thích, không bắt khách nhớ mã.
 */
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { promotions, vouchers } from "@/lib/db/schema";
import { Cart } from "@/lib/types";

export type VoucherResult = { code: string; description: string; discountVnd: number; explanation: string };

type VoucherRow = typeof vouchers.$inferSelect;

const PERCENT_CAP_VND = 50_000; // trần cho voucher %, khớp mô tả "giảm tối đa"
const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

/** Tính discount 1 voucher trên subtotal; trả 0 nếu không đủ điều kiện. */
function discountOf(v: VoucherRow, subtotalVnd: number): number {
  if (subtotalVnd < v.minOrderVnd) return 0;
  switch (v.discountType) {
    case "percent":
      return Math.min(Math.round((subtotalVnd * v.discountValue) / 100), PERCENT_CAP_VND);
    case "fixed":
      return Math.min(v.discountValue, subtotalVnd);
    case "freeship":
      return v.discountValue; // = phí ship, áp như discount trên tổng
    default:
      return 0;
  }
}

function explain(v: VoucherRow, discountVnd: number): string {
  if (v.discountType === "freeship") return `Đã áp mã ${v.code}: miễn phí giao hàng (giảm ${fmt(discountVnd)}) 🎉`;
  if (v.discountType === "percent") return `Đã áp mã ${v.code}: giảm ${v.discountValue}% (−${fmt(discountVnd)}) cho đơn của mình ạ.`;
  return `Đã áp mã ${v.code}: giảm ${fmt(discountVnd)} cho đơn của mình ạ.`;
}

export async function getActivePromotions(): Promise<{ title: string; description: string }[]> {
  const rows = await db.select().from(promotions).where(eq(promotions.active, true));
  return rows.map((p) => ({ title: p.title, description: p.description }));
}

// Thử mọi voucher active thỏa minOrder → chọn discount lớn nhất → kèm explanation tiếng Việt.
export async function autoApplyBestVoucher(_cart: Cart, subtotalVnd: number): Promise<VoucherResult | null> {
  const rows = await db.select().from(vouchers).where(eq(vouchers.active, true));
  let best: VoucherResult | null = null;
  for (const v of rows) {
    const d = discountOf(v, subtotalVnd);
    if (d > 0 && (!best || d > best.discountVnd)) {
      best = { code: v.code, description: v.description, discountVnd: d, explanation: explain(v, d) };
    }
  }
  return best;
}

export type VoucherOpportunity = { code: string; gapVnd: number; extraBenefitVnd: number; hint: string };

/**
 * Smart threshold upsell (11/7 chiều): tìm mã CHƯA đạt mà chỉ cần thêm ít tiền là lợi hơn hẳn
 * → agent gợi ý "thêm 1 món ~Xđ nữa là được freeship". Deterministic — service tính, LLM chỉ relay.
 * Chỉ gợi khi gap ≤ 60k (khuyên thêm 200k là phản cảm) và lợi ích TĂNG THÊM > 5k so với mã đang áp.
 */
export async function findVoucherOpportunity(subtotalVnd: number): Promise<VoucherOpportunity | null> {
  const MAX_GAP_VND = 60_000;
  const MIN_EXTRA_BENEFIT_VND = 5_000;
  const rows = await db.select().from(vouchers).where(eq(vouchers.active, true));

  // Lợi ích hiện tại (mã tốt nhất đang đạt được)
  let currentBest = 0;
  for (const v of rows) currentBest = Math.max(currentBest, discountOf(v, subtotalVnd));

  let best: VoucherOpportunity | null = null;
  for (const v of rows) {
    if (subtotalVnd >= v.minOrderVnd) continue; // đã đạt rồi
    const gap = v.minOrderVnd - subtotalVnd;
    if (gap > MAX_GAP_VND) continue;
    const benefitAtThreshold = discountOf(v, v.minOrderVnd);
    const extra = benefitAtThreshold - currentBest;
    if (extra < MIN_EXTRA_BENEFIT_VND) continue;
    // Ưu tiên: lợi thêm nhiều nhất, hoà thì gap nhỏ nhất
    if (!best || extra > best.extraBenefitVnd || (extra === best.extraBenefitVnd && gap < best.gapVnd)) {
      const benefitText = v.discountType === "freeship" ? `miễn phí ship (lợi ${fmt(benefitAtThreshold)})` : `giảm ${fmt(benefitAtThreshold)}`;
      best = {
        code: v.code,
        gapVnd: gap,
        extraBenefitVnd: extra,
        hint: `Đơn thêm ${fmt(gap)} nữa là đạt mã ${v.code} — ${benefitText}, lợi thêm ${fmt(extra)} so với hiện tại.`,
      };
    }
  }
  return best;
}

// Áp mã cụ thể khách đưa; sai/hết hạn/không đủ điều kiện → message thân thiện.
export async function applyVoucherCode(_cart: Cart, code: string, subtotalVnd: number): Promise<VoucherResult> {
  const normalized = code.trim().toUpperCase();
  const rows = await db.select().from(vouchers).where(eq(vouchers.code, normalized)).limit(1);
  const v = rows[0];
  if (!v || !v.active) throw new Error(`Mã "${normalized}" không tồn tại hoặc đã hết hạn ạ.`);
  if (subtotalVnd < v.minOrderVnd) {
    throw new Error(`Mã ${normalized} áp dụng cho đơn từ ${fmt(v.minOrderVnd)}. Đơn hiện tại chưa đủ ạ.`);
  }
  const d = discountOf(v, subtotalVnd);
  return { code: v.code, description: v.description, discountVnd: d, explanation: explain(v, d) };
}
