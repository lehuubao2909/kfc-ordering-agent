/**
 * Seed menu + vouchers + promotions vào Neon. OWNER: Dev A. Idempotent (upsert).
 * Chạy: npm run seed   (cần DATABASE_URL trong .env / .env.local)
 * TODO(Dev A): mở rộng fixtures lên ~50-80 món thật từ website KFC VN (kèm ảnh) rồi chạy lại.
 */
import "./load-env"; // PHẢI đứng trước mọi import đụng env

import { db } from "../src/lib/db/client";
import { menuItems, vouchers, promotions, stores, loyaltyAccounts } from "../src/lib/db/schema";
import { MenuItemSchema, StoreSchema } from "../src/lib/types";
import menuFixture from "../src/fixtures/menu-sample.json";
import storesFixture from "../src/fixtures/stores-sample.json";
// Loyalty demo: SĐT dùng trong kịch bản demo phải có sẵn điểm (beat "anh có 1.250 điểm").
// Chung fixture với reset-demo-data để reset xong điểm demo vẫn còn.
import LOYALTY_DEMO_SEED from "../src/fixtures/loyalty-demo-accounts.json";

// 3–4 mã mẫu — autoApplyBestVoucher sẽ chọn mã giảm nhiều nhất trong số thỏa minOrder.
const VOUCHER_SEED = [
  { code: "KFC20", description: "Giảm 20% tối đa cho đơn từ 100.000đ", discountType: "percent", discountValue: 20, minOrderVnd: 100_000, active: true },
  { code: "GIAM30K", description: "Giảm 30.000đ cho đơn từ 150.000đ", discountType: "fixed", discountValue: 30_000, minOrderVnd: 150_000, active: true },
  { code: "FREESHIP", description: "Miễn phí giao hàng cho đơn từ 120.000đ", discountType: "freeship", discountValue: 15_000, minOrderVnd: 120_000, active: true },
  { code: "COMBO50", description: "Giảm 50.000đ cho đơn nhóm từ 250.000đ", discountType: "fixed", discountValue: 50_000, minOrderVnd: 250_000, active: true },
];

const PROMOTION_SEED = [
  { title: "Thứ Ba Vui Vẻ", description: "Mua 1 tặng 1 gà giòn mỗi thứ Ba", discountType: "percent", discountValue: 50, active: true },
  { title: "Combo Trưa Tiết Kiệm", description: "Combo cơm gà chỉ từ 45.000đ giờ trưa 10h-14h", discountType: "fixed", discountValue: 10_000, active: true },
  { title: "Ưu Đãi Nhóm Bạn", description: "Combo nhóm giảm ngay 50.000đ với mã COMBO50", discountType: "fixed", discountValue: 50_000, active: true },
];

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Thiếu DATABASE_URL — xin Lead giá trị Neon.");

  const items = menuFixture.map((m) => MenuItemSchema.parse(m));
  console.log(`Seeding ${items.length} món...`);
  for (const it of items) {
    await db
      .insert(menuItems)
      .values({
        id: it.id,
        name: it.name,
        aliases: it.aliases,
        category: it.category,
        priceVnd: it.priceVnd,
        description: it.description,
        imageUrl: it.imageUrl,
        comboItemIds: it.comboItemIds ?? null,
        available: it.available,
      })
      .onConflictDoUpdate({
        target: menuItems.id,
        set: {
          name: it.name,
          aliases: it.aliases,
          category: it.category,
          priceVnd: it.priceVnd,
          description: it.description,
          imageUrl: it.imageUrl,
          comboItemIds: it.comboItemIds ?? null,
          available: it.available,
        },
      });
  }

  console.log(`Seeding ${VOUCHER_SEED.length} voucher...`);
  for (const v of VOUCHER_SEED) {
    await db.insert(vouchers).values(v).onConflictDoUpdate({ target: vouchers.code, set: v });
  }

  console.log(`Seeding ${PROMOTION_SEED.length} promotion...`);
  // promotions.id là serial → xóa hết rồi insert lại cho idempotent.
  await db.delete(promotions);
  for (const p of PROMOTION_SEED) {
    await db.insert(promotions).values(p);
  }

  const storeRows = storesFixture.map((s) => StoreSchema.parse(s));
  console.log(`Seeding ${storeRows.length} cửa hàng...`);
  for (const s of storeRows) {
    const values = {
      id: s.id,
      name: s.name,
      address: s.address,
      district: s.district,
      districtAliases: s.districtAliases,
      openHour: s.openHour,
      closeHour: s.closeHour,
      active: s.active,
      unavailableItemIds: s.unavailableItemIds,
      isFlagship: s.isFlagship ?? false,
    };
    await db.insert(stores).values(values).onConflictDoUpdate({ target: stores.id, set: values });
  }

  console.log(`Seeding ${LOYALTY_DEMO_SEED.length} loyalty demo account...`);
  for (const l of LOYALTY_DEMO_SEED) {
    await db.insert(loyaltyAccounts).values(l).onConflictDoUpdate({ target: loyaltyAccounts.phone, set: { points: l.points } });
  }

  console.log("✅ Seed xong.");
}

main().catch((err) => {
  console.error("❌ Seed lỗi:", err);
  process.exit(1);
});
