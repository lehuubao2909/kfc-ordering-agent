/**
 * Upsell engine — deterministic, KHÔNG LLM trong scoring. OWNER: Dev A.
 * score = w1*dayparAffinity + w2*coOccurrence(cart) + w3*promoBoost + w4*attachGap
 * attachGap: giỏ thiếu drink/dessert/snack → boost category đó (lưới an toàn chống gợi ý vô lý).
 * Mỗi suggestion kèm `reason` từ template + số thật co-occurrence ("78% khách trưa gọi kèm Pepsi").
 * Weights để trong UPSELL_WEIGHTS — tune bằng mắt với Lead ở 3 mốc giờ demo (sáng/trưa/tối).
 */
import { CartItem, RecommendationSuggestion } from "@/lib/types";

export const UPSELL_WEIGHTS = { daypart: 0.35, coOccurrence: 0.35, promo: 0.1, attachGap: 0.2 };

// TODO(Dev A): load co-occurrence matrix (sinh bởi scripts/compute-co-occurrence-matrix.ts) — cache in-memory
// TODO(Dev A): daypart rules: sáng 6–10h burger/cà phê, trưa 10–14h combo cơm, xế 14–17h snack/kem, tối 17–22h combo nhóm
export async function getUpsellSuggestions(
  _cart: CartItem[],
  _timestamp?: Date
): Promise<RecommendationSuggestion[]> {
  throw new Error("TODO(Dev A): getUpsellSuggestions — trả top 2-3, loại món đã có trong giỏ");
}
