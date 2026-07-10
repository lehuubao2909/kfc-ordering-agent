/**
 * Session store + per-conversation lock. OWNER: Dev B.
 * Lock chống 2 serverless instance xử lý cùng 1 khách: UPDATE sessions SET processing_until = now()+60s
 * WHERE psid=? AND (processing_until IS NULL OR processing_until < now()) — update được = giành lock.
 */
import { Cart, OrderState, SessionMode } from "@/lib/types";

export type ConversationSession = {
  psid: string;
  state: OrderState;
  mode: SessionMode;
  cart: Cart;
  activeOrderId: string | null;
  history: { role: string; content: string }[];
};

// TODO(Dev B): get-or-create session
export async function getSession(_psid: string): Promise<ConversationSession> {
  throw new Error("TODO(Dev B): getSession");
}

// TODO(Dev B): acquire lock kiểu compare-and-set như mô tả trên; true = được xử lý
export async function tryAcquireProcessingLock(_psid: string): Promise<boolean> {
  throw new Error("TODO(Dev B): tryAcquireProcessingLock");
}

export async function releaseProcessingLock(_psid: string): Promise<void> {
  throw new Error("TODO(Dev B): releaseProcessingLock");
}

// TODO(Dev B): update state/mode/cart/history (giữ 12 tin cuối)
export async function saveSession(_session: ConversationSession): Promise<void> {
  throw new Error("TODO(Dev B): saveSession");
}
