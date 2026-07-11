/**
 * Reset data trước mỗi lần chạy demo. OWNER: Lead (Dev A impl, Lead duyệt 11/7).
 * Xóa: orders, sessions, message_log, customers, loyalty_accounts — rồi RE-SEED loyalty demo
 * (SĐT demo phải luôn có sẵn điểm cho beat "anh có 1.250 điểm").
 * Giữ: menu_items, promotions, vouchers, stores, pos_transactions.
 * Chạy: npm run reset-demo
 */
import "./load-env";

import { db } from "../src/lib/db/client";
import { orders, sessions, messageLog, customers, loyaltyAccounts } from "../src/lib/db/schema";
import LOYALTY_DEMO_SEED from "../src/fixtures/loyalty-demo-accounts.json";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Thiếu DATABASE_URL.");
  await db.delete(orders);
  await db.delete(sessions);
  await db.delete(messageLog);
  await db.delete(customers);
  await db.delete(loyaltyAccounts);
  for (const l of LOYALTY_DEMO_SEED) {
    await db.insert(loyaltyAccounts).values(l);
  }
  console.log("✅ Đã reset dữ liệu demo (giữ menu/voucher/promo/stores/POS; loyalty demo re-seed).");
}

main().catch((err) => {
  console.error("❌ reset-demo lỗi:", err);
  process.exit(1);
});
