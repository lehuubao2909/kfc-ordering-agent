/**
 * Store service — store-aware ordering (flow 11/7). OWNER: Dev A (impl bởi Lead 11/7 để unblock).
 * - resolveStoreForAddress: match alias quận từ TEXT địa chỉ (bỏ dấu + lowercase, KHÔNG geocoding API)
 *   → ưu tiên cửa hàng đang mở → không match/đóng hết → flagship (fallbackUsed=true).
 * - Giờ mở cửa tính theo Asia/Ho_Chi_Minh (server Vercel chạy UTC — không dùng getHours() trần).
 * - applyDeliveryInfo: orchestration cho tool set_delivery_info của Dev B — lưu customer, resolve store,
 *   ghi sessions.storeId, trả StoreResolution (kèm món trong giỏ bị hết) để agent relay.
 * - Cache in-memory + fallback fixtures giống menu-service.
 */
import { Cart, Store, StoreResolution, StoreSchema } from "@/lib/types";
import storesFixture from "@/fixtures/stores-sample.json";
import { getSessionCart, saveDeliveryInfo } from "./session-data-service";

const fixtureStores: Store[] = storesFixture.map((s) => StoreSchema.parse(s));

let cache: Store[] | null = null;
let cacheAt = 0;
const CACHE_TTL_MS = 60_000;

async function loadStores(): Promise<Store[]> {
  const now = Date.now();
  if (cache && now - cacheAt < CACHE_TTL_MS) return cache;
  if (!process.env.DATABASE_URL) {
    cache = fixtureStores;
    cacheAt = now;
    return cache;
  }
  try {
    const { db } = await import("@/lib/db/client");
    const { stores } = await import("@/lib/db/schema");
    const rows = await db.select().from(stores);
    cache = rows.length
      ? rows.map((r) =>
          StoreSchema.parse({
            id: r.id,
            name: r.name,
            address: r.address,
            district: r.district,
            districtAliases: r.districtAliases ?? [],
            openHour: r.openHour,
            closeHour: r.closeHour,
            active: r.active,
            unavailableItemIds: r.unavailableItemIds ?? [],
            isFlagship: r.isFlagship,
          })
        )
      : fixtureStores;
    cacheAt = now;
    return cache;
  } catch (err) {
    console.error("store-service: đọc DB lỗi, fallback fixtures:", err);
    cache = fixtureStores;
    cacheAt = now;
    return cache;
  }
}

export function invalidateStoreCache(): void {
  cache = null;
  cacheAt = 0;
}

/** Bỏ dấu tiếng Việt + lowercase — để "Quận 5", "quan 5", "Q.5" đều match được alias. */
function normalizeVietnamese(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase();
}

/** Giờ hiện tại theo Asia/Ho_Chi_Minh (server UTC). Cho phép override để demo/eval. */
export function getVietnamHour(at: Date = new Date()): number {
  return (at.getUTCHours() + 7) % 24;
}

function isStoreOpen(store: Store, hour: number): boolean {
  return store.active && hour >= store.openHour && hour < store.closeHour;
}

export async function getStoreById(id: string): Promise<Store | null> {
  return (await loadStores()).find((s) => s.id === id) ?? null;
}

export async function getFlagshipStore(): Promise<Store> {
  const all = await loadStores();
  return all.find((s) => s.isFlagship && s.active) ?? all[0];
}

/**
 * Match cửa hàng theo alias quận trong địa chỉ. Trả về:
 * - match + đang mở → store đó
 * - match nhưng đóng → cửa hàng đang mở gần nghĩa nhất (flagship nếu mở, không thì cửa hàng mở đầu tiên),
 *   storeWasOpen=false để agent báo khách "cửa hàng gần anh/chị đã đóng, đơn chuyển về X"
 * - không match → flagship, fallbackUsed=true
 */
export async function resolveStoreForAddress(address: string, at: Date = new Date()): Promise<{ store: Store; storeWasOpen: boolean; fallbackUsed: boolean }> {
  const all = (await loadStores()).filter((s) => s.active);
  const hour = getVietnamHour(at);
  const addr = normalizeVietnamese(address);

  const matched = all.filter((s) => s.districtAliases.some((alias) => addr.includes(normalizeVietnamese(alias))));

  if (matched.length) {
    const open = matched.find((s) => isStoreOpen(s, hour));
    if (open) return { store: open, storeWasOpen: true, fallbackUsed: false };
    // Cửa hàng đúng quận nhưng đã đóng → chuyển cửa hàng khác đang mở
    const alternative = all.find((s) => s.isFlagship && isStoreOpen(s, hour)) ?? all.find((s) => isStoreOpen(s, hour)) ?? matched[0];
    return { store: alternative, storeWasOpen: false, fallbackUsed: false };
  }

  const flagship = await getFlagshipStore();
  return { store: flagship, storeWasOpen: isStoreOpen(flagship, hour), fallbackUsed: true };
}

/** Món trong giỏ bị HẾT tại cửa hàng (sparse list trên store). */
export function getUnavailableCartItems(store: Store, cart: Cart): string[] {
  if (!store.unavailableItemIds.length) return [];
  const unavailable = new Set(store.unavailableItemIds);
  return cart.items.map((l) => l.itemId).filter((id) => unavailable.has(id));
}

/**
 * Orchestration cho tool `set_delivery_info` (Dev B chỉ cần gọi hàm này):
 * lưu customer → resolve store → ghi sessions.storeId → trả resolution đầy đủ.
 * unavailableItemIds.length > 0 → agent quay CONFIRMING gợi ý món thay (transition đã cho phép).
 */
export async function applyDeliveryInfo(
  psid: string,
  info: { phone: string; address: string; name?: string },
  at: Date = new Date()
): Promise<StoreResolution> {
  await saveDeliveryInfo(psid, info);
  const { store, storeWasOpen, fallbackUsed } = await resolveStoreForAddress(info.address, at);

  const { db } = await import("@/lib/db/client");
  const { sessions } = await import("@/lib/db/schema");
  const { eq } = await import("drizzle-orm");
  await db.update(sessions).set({ storeId: store.id, updatedAt: new Date() }).where(eq(sessions.psid, psid));

  const cart = await getSessionCart(psid);
  return { store, storeWasOpen, fallbackUsed, unavailableItemIds: getUnavailableCartItems(store, cart) };
}
