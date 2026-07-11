/**
 * Smoke test self-healing session (fix 11/7 chiều): session kẹt state vòng-đời-đơn
 * → getSession phải tự sync state + clear giỏ. Chạy: npx tsx scripts/smoke-test-session-heal.ts
 */
import "./load-env";

import { eq } from "drizzle-orm";
import { db } from "../src/lib/db/client";
import { sessions, orders } from "../src/lib/db/schema";
import { getSession } from "../src/lib/agent/conversation-session-store";

const PSID = "SMOKE-HEAL-01";
const ORDER_ID = "KFC-SMOKE-HEAL";

async function cleanup() {
  await db.delete(sessions).where(eq(sessions.psid, PSID));
  await db.delete(orders).where(eq(orders.id, ORDER_ID));
}

async function main() {
  let fail = 0;
  const check = (name: string, ok: boolean, detail = "") => {
    if (!ok) fail++;
    console.log(`${ok ? "✅" : "❌"} ${name}${detail ? ` (${detail})` : ""}`);
  };

  // Case 1: session kẹt AWAITING_PAYMENT + giỏ cũ, đơn gắn kèm đã DELIVERED (đúng bug production)
  await cleanup();
  await db.insert(orders).values({
    id: ORDER_ID, psid: PSID, items: [{ itemId: "pepsi-vua", quantity: 1 }],
    subtotalVnd: 15000, discountVnd: 0, shippingFeeVnd: 15000, totalVnd: 30000,
    status: "DELIVERED", paymentMethod: "qr",
  });
  await db.insert(sessions).values({
    psid: PSID, state: "AWAITING_PAYMENT", mode: "agent",
    cart: { items: [{ itemId: "combo-ga-ran-1-nguoi", quantity: 1 }] }, activeOrderId: ORDER_ID,
  });
  const healed1 = await getSession(PSID);
  check("kẹt AWAITING_PAYMENT + đơn DELIVERED → state DELIVERED", healed1.state === "DELIVERED", `state=${healed1.state}`);
  check("giỏ cũ được clear", healed1.cart.items.length === 0, `items=${healed1.cart.items.length}`);
  const row1 = (await db.select().from(sessions).where(eq(sessions.psid, PSID)))[0];
  check("DB cũng được ghi lại", row1.state === "DELIVERED" && (row1.cart?.items?.length ?? 0) === 0);

  // Case 2: state PLACED nhưng không gắn đơn nào → về BROWSING
  await db.update(sessions).set({ state: "PLACED", activeOrderId: null }).where(eq(sessions.psid, PSID));
  const healed2 = await getSession(PSID);
  check("PLACED không có đơn → BROWSING", healed2.state === "BROWSING", `state=${healed2.state}`);

  // Case 3: state lệch tiến độ (AWAITING_PAYMENT nhưng đơn đã PREPARING) → sync theo đơn
  await db.update(orders).set({ status: "PREPARING" }).where(eq(orders.id, ORDER_ID));
  await db.update(sessions).set({ state: "AWAITING_PAYMENT", activeOrderId: ORDER_ID }).where(eq(sessions.psid, PSID));
  const healed3 = await getSession(PSID);
  check("lệch tiến độ → sync PREPARING", healed3.state === "PREPARING", `state=${healed3.state}`);

  // Case 4: state hợp lệ (CART) → KHÔNG đụng gì
  await db.update(sessions).set({ state: "CART", cart: { items: [{ itemId: "pepsi-vua", quantity: 2 }] } }).where(eq(sessions.psid, PSID));
  const healed4 = await getSession(PSID);
  check("state CART hợp lệ → giữ nguyên giỏ", healed4.state === "CART" && healed4.cart.items.length === 1);

  await cleanup();
  console.log(fail === 0 ? "\n=== SESSION HEAL: ALL PASS ===" : `\n=== FAIL: ${fail} ===`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  await cleanup();
  process.exit(1);
});
