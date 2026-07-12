/**
 * Smoke test handoff timeout (fix 12/7 sáng): mode=human quá 10' không staff trả lời
 * → bot tự tiếp quản lại + mở đầu bằng thông báo "nhân viên bận". Staff nhắn tay → gia hạn mốc.
 * Chạy: npx tsx scripts/smoke-test-handoff-timeout.ts (gọi 1 lượt LLM thật ở case 3)
 */
import "./load-env";

import { eq } from "drizzle-orm";
import { db } from "../src/lib/db/client";
import { sessions, messageLog } from "../src/lib/db/schema";
import { runOrderingAgentTurn } from "../src/lib/agent/ordering-agent-core";
import { refreshHandoffActivity, setSessionMode } from "../src/lib/services/session-data-service";

const PSID = "SMOKE-HANDOFF-01";
let passed = 0;
let failed = 0;

function check(name: string, ok: boolean, detail = "") {
  if (ok) { passed++; console.log(`  ✅ ${name}`); }
  else { failed++; console.log(`  ❌ ${name} ${detail}`); }
}

async function cleanup() {
  await db.delete(sessions).where(eq(sessions.psid, PSID));
  await db.delete(messageLog).where(eq(messageLog.psid, PSID));
}

async function setHandoff(minutesAgo: number | null) {
  await db
    .update(sessions)
    .set({ mode: "human", handedOffAt: minutesAgo === null ? null : new Date(Date.now() - minutesAgo * 60_000) })
    .where(eq(sessions.psid, PSID));
}

async function main() {
  await cleanup();
  await db.insert(sessions).values({ psid: PSID });

  // 1. Handoff MỚI (2') → bot phải im lặng như cũ
  await setHandoff(2);
  const fresh = await runOrderingAgentTurn(PSID, ["alo có ai không"]);
  check("handoff 2 phút → bot im lặng", fresh.text === "" && fresh.handedOff === true, JSON.stringify(fresh.text));

  // 2. setSessionMode ghi/xoá mốc + refreshHandoffActivity gia hạn
  await setSessionMode(PSID, "human");
  let row = (await db.select().from(sessions).where(eq(sessions.psid, PSID)))[0];
  check("setSessionMode(human) ghi handedOffAt", row.handedOffAt !== null);
  const before = row.handedOffAt!.getTime();
  await new Promise((r) => setTimeout(r, 1100));
  await refreshHandoffActivity(PSID);
  row = (await db.select().from(sessions).where(eq(sessions.psid, PSID)))[0];
  check("refreshHandoffActivity gia hạn mốc", (row.handedOffAt?.getTime() ?? 0) > before);
  await setSessionMode(PSID, "agent");
  row = (await db.select().from(sessions).where(eq(sessions.psid, PSID)))[0];
  check("setSessionMode(agent) xoá mốc", row.handedOffAt === null);

  // 3. Handoff QUÁ HẠN (11') → bot tiếp quản lại, mở đầu bằng thông báo nhân viên bận (LLM thật)
  await setHandoff(11);
  const expired = await runOrderingAgentTurn(PSID, ["cho em xem menu"]);
  check("quá 11 phút → bot trả lời lại", expired.text.length > 0, JSON.stringify(expired.text.slice(0, 80)));
  check("mở đầu bằng thông báo nhân viên bận", expired.text.startsWith("Dạ nhân viên bên em đang bận"));
  row = (await db.select().from(sessions).where(eq(sessions.psid, PSID)))[0];
  check("mode đã trả về agent", row.mode === "agent");

  // 4. Mốc null (session human cũ trước deploy) → coi như quá hạn, tự giải cứu
  await setHandoff(null);
  const legacy = await runOrderingAgentTurn(PSID, ["còn combo nào không"]);
  check("mốc null (session cũ) → bot cũng tiếp quản lại", legacy.text.startsWith("Dạ nhân viên bên em đang bận"));

  await cleanup();
  console.log(`\nKết quả: ${passed}/${passed + failed} pass`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => { console.error(err); process.exit(1); });
