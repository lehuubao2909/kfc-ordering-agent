/** Sanity check: đếm row các bảng trên Neon. Chạy: npx tsx scripts/check-db-counts.ts */
import "./load-env";

import { count } from "drizzle-orm";
import { db } from "../src/lib/db/client";
import { menuItems, stores, vouchers, promotions, loyaltyAccounts, posTransactions, orders, sessions, messageLog, customers } from "../src/lib/db/schema";

async function main() {
  const tables = { menuItems, stores, vouchers, promotions, loyaltyAccounts, posTransactions, orders, sessions, messageLog, customers } as const;
  for (const [name, table] of Object.entries(tables)) {
    const [{ n }] = await db.select({ n: count() }).from(table);
    console.log(`${name.padEnd(16)} ${n}`);
  }
}

main().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
