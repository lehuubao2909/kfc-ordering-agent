/**
 * Cart service — cart sống trong sessions.cart (DB), không sống trong chat history. OWNER: Dev A.
 * Mọi hàm validate itemId tồn tại qua menu-service trước khi đụng cart (guardrail chống LLM bịa món).
 */
import { Cart, CartItem } from "@/lib/types";

// TODO(Dev A): validate item tồn tại + available → thêm/cộng dồn quantity → save session → trả cart mới
export async function addToCart(_psid: string, _item: CartItem): Promise<Cart> {
  throw new Error("TODO(Dev A): addToCart");
}

export async function removeFromCart(_psid: string, _itemId: string): Promise<Cart> {
  throw new Error("TODO(Dev A): removeFromCart");
}

export async function updateCartItemQuantity(_psid: string, _itemId: string, _quantity: number): Promise<Cart> {
  throw new Error("TODO(Dev A): updateCartItemQuantity");
}

export async function getCart(_psid: string): Promise<Cart> {
  throw new Error("TODO(Dev A): getCart");
}

export async function clearCart(_psid: string): Promise<void> {
  throw new Error("TODO(Dev A): clearCart");
}
