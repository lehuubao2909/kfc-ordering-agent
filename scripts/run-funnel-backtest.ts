/**
 * Funnel/AOV backtest — số cho slide + feed metric `aov` của admin. OWNER: Dev A (Người 4).
 * Tính AOV uplift của upsell trên 90 ngày POS THẬT (phân bố giỏ thật), dùng 1 giả định minh bạch:
 * tỉ lệ khách chấp nhận gợi ý (attach-gap: giỏ thiếu drink/dessert) = ACCEPTANCE_RATE.
 * Deterministic (kỳ vọng, không random) → chạy lại ra cùng số. Ghi fixture cho admin đọc.
 * Chạy: npm run backtest
 */
import "./load-env";

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "../src/lib/db/client";
import { posTransactions } from "../src/lib/db/schema";
import { getFullMenu } from "../src/lib/services/menu-service";

const ACCEPTANCE_RATE = 0.2; // giả định ngành F&B ~20% khách nhận gợi ý món kèm
const ATTACH_CATEGORIES = ["drink", "dessert"] as const;

async function main() {
  const menu = await getFullMenu();
  const priceOf = new Map(menu.map((m) => [m.id, m.priceVnd]));
  const catOf = new Map(menu.map((m) => [m.id, m.category]));
  const avgPriceByCat = (cat: string) => {
    const items = menu.filter((m) => m.category === cat);
    return items.length ? Math.round(items.reduce((s, m) => s + m.priceVnd, 0) / items.length) : 0;
  };
  const attachAvg = Object.fromEntries(ATTACH_CATEGORIES.map((c) => [c, avgPriceByCat(c)]));

  const txs = await db.select().from(posTransactions);
  if (!txs.length) throw new Error("Chưa có pos_transactions — chạy npm run mock-pos trước.");

  let baseSum = 0;
  let upsellSum = 0;
  for (const tx of txs) {
    const items = tx.itemIds ?? [];
    const basket = items.reduce((s, id) => s + (priceOf.get(id) ?? 0), 0);
    const cats = new Set(items.map((id) => catOf.get(id)));
    const missing = ATTACH_CATEGORIES.filter((c) => !cats.has(c));
    const expectedAdd = missing.reduce((s, c) => s + ACCEPTANCE_RATE * attachAvg[c], 0);
    baseSum += basket;
    upsellSum += basket + expectedAdd;
  }

  const baselineAovVnd = Math.round(baseSum / txs.length);
  const withUpsellAovVnd = Math.round(upsellSum / txs.length);
  const upliftPct = Math.round(((withUpsellAovVnd - baselineAovVnd) / baselineAovVnd) * 1000) / 10;

  const result = {
    ordersAnalyzed: txs.length,
    baselineAovVnd,
    withUpsellAovVnd,
    upliftPct,
    assumedAcceptanceRatePct: ACCEPTANCE_RATE * 100,
    assumption: `Backtest trên ${txs.length} giỏ POS 90 ngày. Giả định ${ACCEPTANCE_RATE * 100}% khách nhận gợi ý món kèm (drink/dessert) khi giỏ còn thiếu — theo chuẩn ngành F&B.`,
  };

  const out = join(process.cwd(), "src/fixtures/funnel-backtest.json");
  writeFileSync(out, JSON.stringify(result, null, 2) + "\n");
  console.log("✅ Backtest:", JSON.stringify(result, null, 2));
  console.log("→ ghi", out);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
