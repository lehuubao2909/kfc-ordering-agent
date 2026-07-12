/** Dump transcript (in/out/trace) của các psid gần nhất — debug hành vi agent trên data thật.
 * Chạy: npx tsx scripts/inspect-conversation-transcript.ts [đuôi-psid] [số-tin] */
import "./load-env";

import { desc, eq } from "drizzle-orm";
import { db } from "../src/lib/db/client";
import { messageLog } from "../src/lib/db/schema";

async function main() {
  const suffix = process.argv[2];
  const limit = Number(process.argv[3] ?? 40);
  const rows = await db.select().from(messageLog).orderBy(desc(messageLog.createdAt)).limit(600);
  const filtered = suffix ? rows.filter((r) => r.psid.endsWith(suffix)) : rows;
  for (const r of filtered.slice(0, limit).reverse()) {
    const t = r.createdAt.toISOString().slice(11, 19);
    const tag = r.direction === "in" ? "👤" : r.direction === "out" ? "🤖" : "🔧";
    console.log(`${t} …${r.psid.slice(-4)} ${tag} ${r.text.slice(0, 150)}`);
  }
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
