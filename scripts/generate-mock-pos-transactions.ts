/**
 * Sinh mock POS 90 ngày có pattern daypart. OWNER: Dev A.
 * Pattern: sáng 6-10h burger/cà phê · trưa 10-14h combo cơm văn phòng (đỉnh) · xế 14-17h snack/kem
 * · tối 17-22h combo nhóm/bucket. Chạy: npm run mock-pos (cần DATABASE_URL).
 * Số này quyết định upsell "trông thông minh" — chăm chút cặp món hay đi cùng (gà+pepsi, combo+kem).
 */
import "./load-env"; // PHẢI đứng trước mọi import đụng env

import { db } from "../src/lib/db/client";
import { posTransactions } from "../src/lib/db/schema";
import menuFixture from "../src/fixtures/menu-sample.json";
import type { MenuItem } from "../src/lib/types";

const menu = menuFixture as MenuItem[];
const byCategory = (c: string) => menu.filter((m) => m.category === c).map((m) => m.id);

const DRINKS = byCategory("drink");
const DESSERTS = byCategory("dessert");
const SNACKS = byCategory("snack");
const CHICKEN = byCategory("chicken");
const COMBOS = byCategory("combo");
const BURGER_RICE = byCategory("burger-rice");

// Trọng số "món chính" + xác suất attach theo daypart (khớp daypart rules của upsell-service).
const DAYPARTS = [
  { name: "morning", hours: [6, 10], mains: [...BURGER_RICE, ...CHICKEN], attach: { drink: 0.7, dessert: 0.2, snack: 0.3 } },
  { name: "lunch", hours: [10, 14], mains: [...COMBOS, ...BURGER_RICE], attach: { drink: 0.85, dessert: 0.25, snack: 0.4 } },
  { name: "afternoon", hours: [14, 17], mains: [...SNACKS, ...CHICKEN], attach: { drink: 0.5, dessert: 0.55, snack: 0.6 } },
  { name: "evening", hours: [17, 22], mains: [...COMBOS, ...CHICKEN], attach: { drink: 0.75, dessert: 0.35, snack: 0.5 } },
];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const maybe = (p: number) => Math.random() < p;

function buildBasket(daypart: (typeof DAYPARTS)[number]): string[] {
  const basket = new Set<string>();
  if (daypart.mains.length) basket.add(pick(daypart.mains));
  if (daypart.mains.length && maybe(0.3)) basket.add(pick(daypart.mains)); // đôi khi 2 món chính
  if (DRINKS.length && maybe(daypart.attach.drink)) basket.add(pick(DRINKS));
  if (DESSERTS.length && maybe(daypart.attach.dessert)) basket.add(pick(DESSERTS));
  if (SNACKS.length && maybe(daypart.attach.snack)) basket.add(pick(SNACKS));
  return [...basket];
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Thiếu DATABASE_URL — xin Lead giá trị Neon.");

  await db.delete(posTransactions); // idempotent
  const rows: { storeId: string; ts: Date; itemIds: string[] }[] = [];
  const now = Date.now();
  const DAYS = 90;
  const STORES = ["store-hn-01", "store-hcm-01", "store-dn-01"];

  for (let d = 0; d < DAYS; d++) {
    const weekend = new Date(now - d * 86_400_000).getDay() % 6 === 0;
    for (const dp of DAYPARTS) {
      const base = 8 + Math.floor(Math.random() * 10); // 8–17 đơn / daypart / ngày
      const perDaypart = weekend ? Math.floor(base * 1.4) : base; // cuối tuần đông hơn
      for (let i = 0; i < perDaypart; i++) {
        const hour = dp.hours[0] + Math.floor(Math.random() * (dp.hours[1] - dp.hours[0]));
        const ts = new Date(now - d * 86_400_000);
        ts.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
        const basket = buildBasket(dp);
        if (basket.length >= 1) rows.push({ storeId: pick(STORES), ts, itemIds: basket });
      }
    }
  }

  console.log(`Insert ${rows.length} giao dịch POS...`);
  const CHUNK = 500;
  for (let i = 0; i < rows.length; i += CHUNK) {
    await db.insert(posTransactions).values(rows.slice(i, i + CHUNK));
  }
  console.log("✅ Mock POS xong.");
}

main().catch((err) => {
  console.error("❌ mock-pos lỗi:", err);
  process.exit(1);
});
