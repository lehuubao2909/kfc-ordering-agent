/** Soi nhanh sessions + orders trên Neon (debug session kẹt state). Chạy: npx tsx scripts/inspect-sessions-orders.ts */
import "./load-env";

import { db } from "../src/lib/db/client";
import { sessions, orders } from "../src/lib/db/schema";

async function main() {
  const s = await db.select().from(sessions);
  const o = await db.select().from(orders);
  for (const r of s) console.log("SESSION", `…${r.psid.slice(-6)}`, `state=${r.state}`, `activeOrder=${r.activeOrderId}`, `cartItems=${r.cart?.items?.length ?? 0}`, `mode=${r.mode}`);
  for (const r of o) console.log("ORDER", r.id, r.status, `psid=…${r.psid.slice(-6)}`, `total=${r.totalVnd}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
