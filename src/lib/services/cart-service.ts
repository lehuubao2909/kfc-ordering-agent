/**
 * Cart service — cart sống trong sessions.cart (DB), không sống trong chat history. OWNER: Dev A.
 * Mọi hàm validate itemId tồn tại qua menu-service trước khi đụng cart (guardrail chống LLM bịa món).
 */
import { Cart, CartItem } from "@/lib/types";
import { getMenuItemById } from "./menu-service";
import { getSessionCart, saveSessionCart } from "./session-data-service";

export class CartError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CartError";
  }
}

// Cộng dồn nếu trùng itemId; note mới (nếu có) ghi đè note cũ của dòng đó.
export async function addToCart(psid: string, item: CartItem): Promise<Cart> {
  const menuItem = await getMenuItemById(item.itemId);
  if (!menuItem) throw new CartError(`Xin lỗi, bên em không có món này ạ.`);
  if (!menuItem.available) throw new CartError(`Món "${menuItem.name}" tạm hết, anh/chị chọn món khác giúp em nhé.`);
  if (item.quantity <= 0) throw new CartError("Số lượng phải lớn hơn 0 ạ.");

  const cart = await getSessionCart(psid);
  const existing = cart.items.find((i) => i.itemId === item.itemId);
  if (existing) {
    existing.quantity += item.quantity;
    if (item.note) existing.note = item.note;
  } else {
    cart.items.push({ itemId: item.itemId, quantity: item.quantity, ...(item.note ? { note: item.note } : {}) });
  }
  return saveSessionCart(psid, cart);
}

export async function removeFromCart(psid: string, itemId: string): Promise<Cart> {
  const cart = await getSessionCart(psid);
  cart.items = cart.items.filter((i) => i.itemId !== itemId);
  return saveSessionCart(psid, cart);
}

export async function updateCartItemQuantity(psid: string, itemId: string, quantity: number): Promise<Cart> {
  const cart = await getSessionCart(psid);
  const line = cart.items.find((i) => i.itemId === itemId);
  if (!line) throw new CartError("Món này chưa có trong giỏ ạ.");
  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i.itemId !== itemId); // set 0 = xóa
  } else {
    line.quantity = quantity;
  }
  return saveSessionCart(psid, cart);
}

export async function getCart(psid: string): Promise<Cart> {
  return getSessionCart(psid);
}

export async function clearCart(psid: string): Promise<void> {
  await saveSessionCart(psid, { items: [] });
}
