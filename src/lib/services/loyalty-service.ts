/** Loyalty mock theo SĐT (schema giống thật — pitch: tích hợp loyalty thật chỉ là đổi endpoint). OWNER: Dev A. */

// TODO(Dev A): tra điểm; chưa có account → tạo mới với điểm random 500–2000 (demo khách quen)
export async function getLoyaltyPoints(_phone: string): Promise<{ phone: string; points: number }> {
  throw new Error("TODO(Dev A): getLoyaltyPoints");
}

// TODO(Dev A): cộng điểm sau khi đơn DELIVERED (1 điểm / 1000đ)
export async function earnPointsForOrder(_phone: string, _totalVnd: number): Promise<number> {
  throw new Error("TODO(Dev A): earnPointsForOrder");
}
