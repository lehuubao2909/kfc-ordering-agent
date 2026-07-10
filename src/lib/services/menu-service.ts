/**
 * Menu service. OWNER: Dev A.
 * Đọc từ Neon (bảng menu_items) + cache in-memory theo instance (chống Neon latency).
 * Fallback fixtures khi chưa có DATABASE_URL hoặc DB lỗi → build/dev/eval vẫn chạy.
 * Chữ ký hàm giữ nguyên như scaffold (agent tools + FE phụ thuộc).
 */
import { MenuItem, MenuItemSchema } from "@/lib/types";
import menuFixture from "@/fixtures/menu-sample.json";

const fixtureMenu: MenuItem[] = menuFixture.map((m) => MenuItemSchema.parse(m));

// Cache 1 instance — menu gần như tĩnh trong 1 phiên demo.
let cache: MenuItem[] | null = null;
let cacheAt = 0;
const CACHE_TTL_MS = 60_000;

/** Đọc toàn bộ menu (kèm món hết hàng) — dùng nội bộ. */
async function loadMenu(): Promise<MenuItem[]> {
  const now = Date.now();
  if (cache && now - cacheAt < CACHE_TTL_MS) return cache;

  if (!process.env.DATABASE_URL) {
    cache = fixtureMenu;
    cacheAt = now;
    return cache;
  }

  try {
    // Import động để build không cần DATABASE_URL khi module chỉ dùng fixtures.
    const { db } = await import("@/lib/db/client");
    const { menuItems } = await import("@/lib/db/schema");
    const rows = await db.select().from(menuItems);
    if (rows.length === 0) {
      // DB trống (chưa seed) → dùng fixtures thay vì trả menu rỗng.
      cache = fixtureMenu;
    } else {
      cache = rows.map((r) =>
        MenuItemSchema.parse({
          id: r.id,
          name: r.name,
          aliases: r.aliases ?? [],
          category: r.category,
          priceVnd: r.priceVnd,
          description: r.description ?? "",
          imageUrl: r.imageUrl ?? "",
          comboItemIds: r.comboItemIds ?? undefined,
          available: r.available,
        })
      );
    }
    cacheAt = now;
    return cache;
  } catch (err) {
    console.error("menu-service: đọc DB lỗi, fallback fixtures:", err);
    cache = fixtureMenu;
    cacheAt = now;
    return cache;
  }
}

/** Xóa cache — gọi sau khi seed lại menu trong cùng process. */
export function invalidateMenuCache(): void {
  cache = null;
  cacheAt = 0;
}

export async function getFullMenu(): Promise<MenuItem[]> {
  return (await loadMenu()).filter((m) => m.available);
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
  if (!q) return [];
  return (await getFullMenu()).filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.aliases.some((a) => a.toLowerCase().includes(q) || q.includes(a.toLowerCase()))
  );
}
