/**
 * Đếm co-occurrence từ posTransactions → xuất src/fixtures/co-occurrence-matrix.json. OWNER: Dev A.
 * Output: { "ga-gion-cay-1-mieng": { "pepsi-vua": 0.78, ... } } — P(B|A) = tỷ lệ đơn chứa A cũng chứa B.
 * upsell-recommendation-service load file này (đây là "đếm", không phải "train" — nói rõ khi pitch).
 * Chạy: npm run co-occurrence (cần DATABASE_URL + đã chạy mock-pos).
 */
import "./load-env"; // PHẢI đứng trước mọi import đụng env

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { db } from "../src/lib/db/client";
import { posTransactions } from "../src/lib/db/schema";

const OUT = resolve(__dirname, "../src/fixtures/co-occurrence-matrix.json");

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Thiếu DATABASE_URL — xin Lead giá trị Neon.");

  const rows = await db.select({ itemIds: posTransactions.itemIds }).from(posTransactions);
  console.log(`Đọc ${rows.length} giao dịch...`);

  const count: Record<string, number> = {}; // số đơn chứa A
  const pair: Record<string, Record<string, number>> = {}; // số đơn chứa cả A và B

  for (const { itemIds } of rows) {
    const uniq = [...new Set(itemIds)];
    for (const a of uniq) {
      count[a] = (count[a] ?? 0) + 1;
      pair[a] ??= {};
      for (const b of uniq) {
        if (a === b) continue;
        pair[a][b] = (pair[a][b] ?? 0) + 1;
      }
    }
  }

  // Normalize P(B|A), làm tròn 2 chữ số, bỏ cặp quá hiếm (< 5 đơn) cho reason đáng tin.
  const matrix: Record<string, Record<string, number>> = {};
  for (const a of Object.keys(pair)) {
    const entries = Object.entries(pair[a])
      .filter(([, c]) => c >= 5)
      .map(([b, c]) => [b, Math.round((c / count[a]) * 100) / 100] as const)
      .sort((x, y) => y[1] - x[1]);
    if (entries.length) matrix[a] = Object.fromEntries(entries);
  }

  writeFileSync(OUT, JSON.stringify(matrix, null, 2), "utf8");
  console.log(`✅ Ghi ${Object.keys(matrix).length} món có co-occurrence → ${OUT}`);
}

main().catch((err) => {
  console.error("❌ co-occurrence lỗi:", err);
  process.exit(1);
});
