/** Loyalty mock theo SĐT (schema giống thật — pitch: tích hợp loyalty thật chỉ là đổi endpoint). OWNER: Dev A. */
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { loyaltyAccounts } from "@/lib/db/schema";

const maskPhone = (p: string) => (p.length >= 7 ? `${p.slice(0, 3)}***${p.slice(-4)}` : "***");

// Tra điểm; chưa có account → tạo mới với điểm random 500–2000 (demo "khách quen").
export async function getLoyaltyPoints(phone: string): Promise<{ phone: string; points: number }> {
  const rows = await db.select().from(loyaltyAccounts).where(eq(loyaltyAccounts.phone, phone)).limit(1);
  if (rows[0]) return { phone, points: rows[0].points };

  const seeded = 500 + Math.floor(Math.random() * 1501); // 500–2000
  await db.insert(loyaltyAccounts).values({ phone, points: seeded }).onConflictDoNothing();
  console.log(`loyalty: tạo account mới ${maskPhone(phone)} = ${seeded} điểm`);
  const after = await db.select().from(loyaltyAccounts).where(eq(loyaltyAccounts.phone, phone)).limit(1);
  return { phone, points: after[0]?.points ?? seeded };
}

// Cộng điểm sau khi đơn DELIVERED (1 điểm / 1000đ). Trả tổng điểm mới.
export async function earnPointsForOrder(phone: string, totalVnd: number): Promise<number> {
  const earned = Math.floor(totalVnd / 1000);
  await getLoyaltyPoints(phone); // đảm bảo account tồn tại
  const [row] = await db
    .update(loyaltyAccounts)
    .set({ points: sql`${loyaltyAccounts.points} + ${earned}` })
    .where(eq(loyaltyAccounts.phone, phone))
    .returning();
  return row?.points ?? earned;
}
