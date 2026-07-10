/**
 * Menu service. OWNER: Dev A.
 * HIỆN TẠI: đọc từ fixtures để mọi người build song song ngay.
 * TODO(Dev A): chuyển sang đọc DB sau khi chạy scripts/seed-menu.ts (giữ nguyên chữ ký hàm).
 */
import { MenuItem, MenuItemSchema } from "@/lib/types";
import menuFixture from "@/fixtures/menu-sample.json";

const menu: MenuItem[] = menuFixture.map((m) => MenuItemSchema.parse(m));

export async function getFullMenu(): Promise<MenuItem[]> {
  return menu.filter((m) => m.available);
}

export async function getMenuByCategory(category: MenuItem["category"]): Promise<MenuItem[]> {
  return (await getFullMenu()).filter((m) => m.category === category);
}

export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  return (await getFullMenu()).find((m) => m.id === id) ?? null;
}

/** Tìm món theo tên/alias — dùng cho NLU match ("pepsi" → Pepsi vừa/lớn). Trả nhiều kết quả để agent hỏi lại size. */
export async function searchMenuItems(query: string): Promise<MenuItem[]> {
  const q = query.toLowerCase().trim();
  return (await getFullMenu()).filter(
    (m) => m.name.toLowerCase().includes(q) || m.aliases.some((a) => a.toLowerCase().includes(q) || q.includes(a.toLowerCase()))
  );
}
