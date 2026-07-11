/**
 * CLI eval harness — thay web widget để test agent. OWNER: Dev B.
 * Chạy: npm run eval → mỗi case trong eval-transcripts-vi.json chạy qua runOrderingAgentTurn
 * (psid giả "EVAL-<id>"), tự chấm pass/fail (expectAny keyword không dấu / forbidAny / expectState /
 * expectHandoff), in reply, ghi src/fixtures/eval-results.json { passed, total, comment, generatedAt }.
 * Cũng dùng CHỌN MODEL: chạy 2 lần OPENAI_MODEL khác nhau, so pass rate + latency.
 *
 * Cần DATABASE_URL + OPENAI_API_KEY (như service thật). Thiếu key → phần lớn case fail (báo rõ).
 */
import "./load-env";

import { writeFileSync } from "fs";
import { join } from "path";
import { eq } from "drizzle-orm";
import { db } from "../src/lib/db/client";
import { orders, sessions, customers, messageLog } from "../src/lib/db/schema";
import { addToCart } from "../src/lib/services/cart-service";
import { getOrCreateSession } from "../src/lib/services/session-data-service";
import { runOrderingAgentTurn } from "../src/lib/agent/ordering-agent-core";
import transcripts from "./eval-transcripts-vi.json";

type EvalCase = {
  id: string;
  category?: string;
  setup?: { cartItemIds?: string[] };
  turns: string[];
  expectAny?: string[];
  forbidAny?: string[];
  expectState?: string;
  expectHandoff?: boolean;
};

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").toLowerCase();

async function cleanup(psid: string) {
  await db.delete(orders).where(eq(orders.psid, psid));
  await db.delete(sessions).where(eq(sessions.psid, psid));
  await db.delete(customers).where(eq(customers.psid, psid));
  await db.delete(messageLog).where(eq(messageLog.psid, psid));
}

async function runCase(c: EvalCase): Promise<{ pass: boolean; reason: string; reply: string }> {
  const psid = `EVAL-${c.id}`;
  await cleanup(psid);
  await getOrCreateSession(psid);

  for (const id of c.setup?.cartItemIds ?? []) {
    await addToCart(psid, { itemId: id, quantity: 1 });
    if ((await getOrCreateSession(psid)).state === "BROWSING") {
      // add_to_cart tool thường set CART; ở setup ta set thủ công cho đúng gating.
      await db.update(sessions).set({ state: "CART" }).where(eq(sessions.psid, psid));
    }
  }

  let lastReply = "";
  let handedOff = false;
  for (const turn of c.turns) {
    const r = await runOrderingAgentTurn(psid, [turn]);
    lastReply = r.text || lastReply;
    handedOff = handedOff || r.handedOff;
  }

  const nReply = norm(lastReply);
  const checks: string[] = [];
  if (c.expectAny && !c.expectAny.some((k) => nReply.includes(norm(k)))) checks.push(`thiếu keyword [${c.expectAny.join("|")}]`);
  if (c.forbidAny && c.forbidAny.some((k) => nReply.includes(norm(k)))) checks.push(`chứa cụm cấm`);
  if (c.expectHandoff && !handedOff) checks.push("không handoff");
  if (c.expectState) {
    const state = (await getOrCreateSession(psid)).state;
    if (state !== c.expectState) checks.push(`state=${state}≠${c.expectState}`);
  }

  await cleanup(psid);
  return { pass: checks.length === 0, reason: checks.join("; "), reply: lastReply };
}

async function main() {
  const cases = (transcripts.cases as EvalCase[]) ?? [];
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  console.log(`\n🧪 Eval agent — ${cases.length} case · model=${model}\n`);

  let passed = 0;
  const started = Date.now();
  for (const c of cases) {
    try {
      const { pass, reason, reply } = await runCase(c);
      if (pass) passed++;
      const icon = pass ? "✅" : "❌";
      console.log(`${icon} [${c.id}] ${pass ? "" : "(" + reason + ") "}→ ${reply.slice(0, 90).replace(/\n/g, " ")}`);
    } catch (e) {
      console.error(`❌ [${c.id}] LỖI: ${(e as Error).message}`);
    }
  }

  const total = cases.length;
  const rate = total ? Math.round((passed / total) * 100) : 0;
  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  const comment = `NLU eval ${passed}/${total} (${rate}%) · model ${model} · ${elapsed}s`;
  console.log(`\n${comment}\n`);

  const out = { passed, total, comment, generatedAt: new Date().toISOString() };
  writeFileSync(join(process.cwd(), "src/fixtures/eval-results.json"), JSON.stringify(out, null, 2) + "\n");
  console.log("→ đã ghi src/fixtures/eval-results.json");
  process.exit(0);
}

main().catch((e) => {
  console.error("eval harness lỗi:", e);
  process.exit(1);
});
