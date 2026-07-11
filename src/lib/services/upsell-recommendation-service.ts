/**
 * Upsell engine — deterministic, KHÔNG LLM trong scoring. OWNER: Dev A.
 * score = w1*daypartAffinity + w2*coOccurrence(cart) + w3*promoBoost + w4*attachGap
 * attachGap: giỏ thiếu drink/dessert/snack → boost category đó (lưới an toàn chống gợi ý vô lý).
 * Mỗi suggestion kèm `reason` từ template + số thật co-occurrence ("78% khách trưa gọi kèm Pepsi").
 * Weights để trong UPSELL_WEIGHTS — tune bằng mắt với Lead ở 3 mốc giờ demo (sáng/trưa/tối).
 */
import { CartItem, MenuItem, RecommendationSuggestion } from "@/lib/types";
import { getFullMenu, getMenuItemById } from "./menu-service";
import coMatrixJson from "@/fixtures/co-occurrence-matrix.json";

export const UPSELL_WEIGHTS = { daypart: 0.35, coOccurrence: 0.35, promo: 0.1, attachGap: 0.2 };

const coMatrix = coMatrixJson as Record<string, Record<string, number>>;

type Daypart = { label: string; categories: MenuItem["category"][] };

// Daypart rules: sáng 6–10h burger/cà phê · trưa 10–14h combo cơm · xế 14–17h snack/kem · tối 17–22h combo nhóm.
function daypartOf(d: Date): Daypart {
  const h = d.getHours();
  if (h >= 6 && h < 10) return { label: "buổi sáng", categories: ["burger-rice", "drink"] };
  if (h >= 10 && h < 14) return { label: "giờ trưa", categories: ["combo", "burger-rice"] };
  if (h >= 14 && h < 17) return { label: "buổi xế", categories: ["snack", "dessert"] };
  if (h >= 17 && h < 22) return { label: "buổi tối", categories: ["combo", "chicken"] };
  return { label: "hôm nay", categories: ["drink", "dessert"] };
}

export async function getUpsellSuggestions(
  cart: CartItem[],
  timestamp?: Date
): Promise<RecommendationSuggestion[]> {
  const now = timestamp ?? new Date();
  const daypart = daypartOf(now);
  const inCart = new Set(cart.map((c) => c.itemId));

  // Category nào giỏ đang thiếu → attach-gap boost.
  const cartCategories = new Set<string>();
  for (const c of cart) {
    const it = await getMenuItemById(c.itemId);
    if (it) cartCategories.add(it.category);
  }
  const gapCategories = (["drink", "dessert", "snack"] as const).filter((c) => !cartCategories.has(c));

  const menu = await getFullMenu();
  const candidates = menu.filter((m) => !inCart.has(m.id));

  const scored = candidates
    .map((m) => {
      const daypartAffinity = daypart.categories.includes(m.category) ? 1 : 0;

      // co-occurrence: max P(candidate | itemInCart) qua các món trong giỏ.
      let coBest = 0;
      let coSourceId = "";
      for (const c of cart) {
        const p = coMatrix[c.itemId]?.[m.id] ?? 0;
        if (p > coBest) {
          coBest = p;
          coSourceId = c.itemId;
        }
      }

      const promoBoost = m.category === "combo" ? 1 : 0;
      const attachGap = gapCategories.includes(m.category as (typeof gapCategories)[number]) ? 1 : 0;

      const score =
        UPSELL_WEIGHTS.daypart * daypartAffinity +
        UPSELL_WEIGHTS.coOccurrence * coBest +
        UPSELL_WEIGHTS.promo * promoBoost +
        UPSELL_WEIGHTS.attachGap * attachGap;

      return { item: m, score, coBest, coSourceId, daypartAffinity, attachGap };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return Promise.all(
    scored.map(async (s): Promise<RecommendationSuggestion> => {
      let reason: string;
      if (s.coBest >= 0.3 && s.coSourceId) {
        const src = await getMenuItemById(s.coSourceId);
        const pct = Math.round(s.coBest * 100);
        reason = `${pct}% khách gọi ${src?.name ?? "món này"} thường lấy thêm ${s.item.name} ạ.`;
      } else if (s.daypartAffinity) {
        reason = `${cap(daypart.label)} nhiều khách chọn ${s.item.name} lắm ạ.`;
      } else if (s.attachGap) {
        reason = `Thêm ${s.item.name} cho đủ vị nha anh/chị 😋`;
      } else {
        reason = `Gợi ý thêm ${s.item.name} cho bữa ăn trọn vị ạ.`;
      }
      return { item: s.item, score: Math.round(s.score * 1000) / 1000, reason };
    })
  );
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
