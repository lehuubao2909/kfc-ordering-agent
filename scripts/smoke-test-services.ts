/**
 * Smoke test service layer end-to-end trên DB thật (Dev A). Chạy: npx tsx scripts/smoke-test-services.ts
 * Kiểm: cart → totals → voucher → upsell → createOrder(COD) → advance ...→ DELIVERED → loyalty,
 * + các case transition sai bị chặn. Tự dọn dữ liệu test sau khi chạy.
 */
import "./load-env";

import { eq } from "drizzle-orm";
import { db } from "../src/lib/db/client";
import { orders, sessions, customers, loyaltyAccounts } from "../src/lib/db/schema";
import { addToCart, getCart, clearCart } from "../src/lib/services/cart-service";
import { calculateOrderTotals, createOrderFromSession, advanceOrderStatus, cancelOrder, getOrderById } from "../src/lib/services/order-service";
import { getPaymentLink, confirmPayment } from "../src/lib/services/payment-mock-service";
import { getOrdersOverview } from "../src/lib/services/admin-metrics-service";
import { autoApplyBestVoucher } from "../src/lib/services/promotion-voucher-service";
import { getUpsellSuggestions } from "../src/lib/services/upsell-recommendation-service";
import { getLoyaltyPoints } from "../src/lib/services/loyalty-service";
import { saveDeliveryInfo } from "../src/lib/services/session-data-service";

const PSID = "SMOKE_TEST_PSID";
const PHONE = "0900000001";
const ADDRESS = "123 Test, Q1, HCM";

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, extra = "") {
  if (cond) { pass++; console.log(`  ✅ ${name} ${extra}`); }
  else { fail++; console.error(`  ❌ ${name} ${extra}`); }
}
async function expectThrow(name: string, fn: () => Promise<unknown>) {
  try { await fn(); check(name, false, "(không throw như mong đợi)"); }
  catch (e) { check(name, e instanceof Error, `→ "${(e as Error).message}"`); }
}

async function cleanup() {
  await db.delete(orders).where(eq(orders.psid, PSID));
  await db.delete(sessions).where(eq(sessions.psid, PSID));
  await db.delete(customers).where(eq(customers.psid, PSID));
  await db.delete(loyaltyAccounts).where(eq(loyaltyAccounts.phone, PHONE));
}

async function main() {
  await cleanup();

  console.log("\n1) Cart + validate itemId");
  await expectThrow("addToCart món không tồn tại bị chặn", () => addToCart(PSID, { itemId: "mon-ma", quantity: 1 }));
  await addToCart(PSID, { itemId: "combo-nhom-ban-be", quantity: 1 });
  await addToCart(PSID, { itemId: "pepsi-vua", quantity: 1 });
  const cart = await getCart(PSID);
  check("giỏ có 2 dòng", cart.items.length === 2);

  console.log("\n2) Totals + auto voucher");
  const totals = await calculateOrderTotals(cart);
  check("subtotal = 250.000", totals.subtotalVnd === 250_000, `(=${totals.subtotalVnd})`);
  check("ship = 15.000", totals.shippingFeeVnd === 15_000);
  const voucher = await autoApplyBestVoucher(cart, totals.subtotalVnd);
  check("auto-apply có voucher", !!voucher, `→ ${voucher?.code} −${voucher?.discountVnd}đ`);
  check("total = subtotal + ship − discount", totals.totalVnd === totals.subtotalVnd + totals.shippingFeeVnd - totals.discountVnd, `(=${totals.totalVnd})`);

  console.log("\n3) Upsell theo daypart (giả lập 12h trưa)");
  const noon = new Date(); noon.setHours(12, 0, 0, 0);
  const sugg = await getUpsellSuggestions(cart.items, noon);
  check("trả 1–3 gợi ý, loại món đã có", sugg.length >= 1 && sugg.length <= 3 && !sugg.some((s) => ["combo-nhom-ban-be", "pepsi-vua"].includes(s.item.id)));
  sugg.forEach((s) => console.log(`     • ${s.item.name} (score ${s.score}) — ${s.reason}`));

  console.log("\n4) createOrderFromSession chặn khi thiếu delivery info");
  await expectThrow("thiếu địa chỉ/SĐT bị chặn", () => createOrderFromSession(PSID, "cod"));
  await saveDeliveryInfo(PSID, { phone: PHONE, address: ADDRESS, name: "Khách Test" });

  console.log("\n5) COD → PLACED thẳng");
  const order = await createOrderFromSession(PSID, "cod");
  check("order tạo với id KFC-*", /^KFC-\d{4}$/.test(order.id), `(${order.id})`);
  check("COD → PLACED", order.status === "PLACED");
  check("lưu địa chỉ + SĐT vào order", order.deliveryAddress === ADDRESS && order.deliveryPhone === PHONE);

  console.log("\n6) Vòng đời trạng thái + chặn transition sai");
  await expectThrow("PLACED → DELIVERED (nhảy cóc) bị chặn", () => advanceOrderStatus(order.id, "DELIVERED"));
  const s1 = await advanceOrderStatus(order.id, "PREPARING"); check("PLACED → PREPARING", s1.status === "PREPARING");
  await expectThrow("hủy sau PREPARING bị chặn", () => cancelOrder(order.id));
  const s2 = await advanceOrderStatus(order.id, "DELIVERING"); check("PREPARING → DELIVERING", s2.status === "DELIVERING");
  const s3 = await advanceOrderStatus(order.id, "DELIVERED"); check("DELIVERING → DELIVERED", s3.status === "DELIVERED");

  console.log("\n7) Loyalty cộng điểm sau DELIVERED (1đ/1000đ)");
  const loy = await getLoyaltyPoints(PHONE);
  const expectedEarn = Math.floor(order.totalVnd / 1000);
  check("điểm ≥ điểm kiếm được từ đơn", loy.points >= expectedEarn, `(points=${loy.points}, earn≥${expectedEarn})`);

  console.log("\n8) Hủy hợp lệ khi còn PLACED (đơn mới)");
  await clearCart(PSID);
  await addToCart(PSID, { itemId: "combo-ga-ran-1-nguoi", quantity: 1 });
  const order2 = await createOrderFromSession(PSID, "cod");
  const cancelled = await cancelOrder(order2.id);
  check("PLACED → CANCELLED", cancelled.status === "CANCELLED");

  console.log("\n9) Thanh toán QR mock");
  await clearCart(PSID);
  await addToCart(PSID, { itemId: "burger-zinger", quantity: 1 });
  const qrOrder = await createOrderFromSession(PSID, "qr");
  check("QR → AWAITING_PAYMENT", qrOrder.status === "AWAITING_PAYMENT");
  check("getPaymentLink trỏ /pay/{id}", getPaymentLink(qrOrder.id).endsWith(`/pay/${qrOrder.id}`));
  await confirmPayment(qrOrder.id);
  const paid = await getOrderById(qrOrder.id);
  check("confirmPayment → PLACED", paid?.status === "PLACED");

  console.log("\n10) Admin metrics (SQL aggregate funnel)");
  const ov = await getOrdersOverview();
  const f = ov.metrics.funnel;
  check("funnel là số", [f.conversationsStarted, f.reachedCart, f.confirmed, f.paid, f.delivered].every((n) => typeof n === "number"), `(${JSON.stringify(f)})`);
  check("upsell acceptanceRatePct là số", typeof ov.metrics.upsell.acceptanceRatePct === "number");
  check("aov có assumption", typeof ov.metrics.aov.assumption === "string" && ov.metrics.aov.assumption.length > 0);
  check("order có upsellAccepted", ov.orders.length === 0 || typeof ov.orders[0].upsellAccepted === "boolean");

  await cleanup();
  console.log(`\n=== KẾT QUẢ: ${pass} pass / ${fail} fail ===`);
  process.exit(fail ? 1 : 0);
}

main().catch(async (err) => {
  console.error("❌ Smoke test lỗi:", err);
  await cleanup().catch(() => {});
  process.exit(1);
});
