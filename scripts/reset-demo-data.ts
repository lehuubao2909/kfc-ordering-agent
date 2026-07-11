/**
 * Reset data trước mỗi lần chạy demo. OWNER: Lead (impl bởi Dev A theo yêu cầu — chờ Lead review, xem
 * dev-a-questions-for-lead.md #1-2). Xóa dữ liệu giao dịch, GIỮ catalog + POS.
 * Xóa: orders, sessions, message_log, customers, loyalty_accounts.
 * Giữ: menu_items, promotions, vouchers, pos_transactions.
 * Chạy: npm run reset-demo
 */
import "./load-env";

import { db } from "../src/lib/db/client";
import { orders, sessions, messageLog, customers, loyaltyAccounts } from "../src/lib/db/schema";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Thiếu DATABASE_URL.");
  await db.delete(orders);
  await db.delete(sessions);
  await db.delete(messageLog);
  await db.delete(customers);
  await db.delete(loyaltyAccounts);
  console.log("✅ Đã reset dữ liệu demo (giữ menu/promotions/vouchers/pos_transactions).");
}

main().catch((err) => {
  console.error("❌ reset-demo lỗi:", err);
  process.exit(1);
});
