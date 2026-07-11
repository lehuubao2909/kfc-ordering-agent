import adminMetricsFixture from "@/fixtures/sample-admin-metrics.json";
import conversationsFixture from "@/fixtures/sample-conversations.json";
import menuFixture from "@/fixtures/menu-sample.json";
import ordersFixture from "@/fixtures/sample-orders.json";
import { MenuItemSchema, OrderSchema } from "@/lib/types";
import type { AdminMetrics, MockConversation, MockOrder } from "./mock-data-types";
export { maskSensitiveText } from "./mask-sensitive-text";

export const menuItems = MenuItemSchema.array().parse(menuFixture);

export const orders = ordersFixture.map((item) => ({
  ...OrderSchema.parse(item),
  upsellAccepted: item.upsellAccepted,
})) satisfies MockOrder[];

export const conversations = conversationsFixture as MockConversation[];
export const adminMetrics = adminMetricsFixture as AdminMetrics;
export const menuById = new Map(menuItems.map((item) => [item.id, item]));

export function getOrder(orderId: string) {
  return orders.find((order) => order.id === orderId);
}
