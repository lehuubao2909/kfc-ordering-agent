/**
 * Drizzle schema — Neon Postgres.
 * OWNER: Dev A (Core Services & Data). Migration: `npm run db:push`.
 * Đổi schema ảnh hưởng types.ts/contract → báo Lead trước khi push.
 */
import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  serial,
  index,
} from "drizzle-orm/pg-core";

// Menu: 1 bảng duy nhất, combo phân biệt bằng category + comboItemIds (KISS)
export const menuItems = pgTable("menu_items", {
  id: text("id").primaryKey(), // slug: "ga-ran-gion-cay-1-mieng"
  name: text("name").notNull(),
  aliases: jsonb("aliases").$type<string[]>().notNull().default([]),
  category: text("category").notNull(), // combo | chicken | burger-rice | snack | dessert | drink
  priceVnd: integer("price_vnd").notNull(),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  comboItemIds: jsonb("combo_item_ids").$type<string[]>(),
  available: boolean("available").notNull().default(true),
});

export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  discountType: text("discount_type").notNull(), // percent | fixed
  discountValue: integer("discount_value").notNull(),
  active: boolean("active").notNull().default(true),
});

export const vouchers = pgTable("vouchers", {
  code: text("code").primaryKey(), // "KFC20", "FREESHIP"
  description: text("description").notNull(),
  discountType: text("discount_type").notNull(), // percent | fixed | freeship
  discountValue: integer("discount_value").notNull(),
  minOrderVnd: integer("min_order_vnd").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

// Khách theo PSID Messenger; lưu địa chỉ/SĐT lần gần nhất để reorder nhanh
export const customers = pgTable("customers", {
  psid: text("psid").primaryKey(),
  name: text("name"),
  phone: text("phone"),
  lastAddress: text("last_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Session hội thoại: state machine + cart + lock chống xử lý song song
export const sessions = pgTable("sessions", {
  psid: text("psid").primaryKey(),
  state: text("state").notNull().default("BROWSING"), // OrderState
  mode: text("mode").notNull().default("agent"), // agent | human (handoff)
  cart: jsonb("cart").$type<{ items: { itemId: string; quantity: number; note?: string }[]; voucherCode?: string }>().notNull().default({ items: [] }),
  activeOrderId: text("active_order_id"),
  history: jsonb("history").$type<{ role: string; content: string }[]>().notNull().default([]),
  processingUntil: timestamp("processing_until"), // lock: đang xử lý tới thời điểm này, steal sau 60s
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("sessions_updated_idx").on(t.updatedAt.desc()), // listConversations
]);

export const orders = pgTable("orders", {
  id: text("id").primaryKey(), // "KFC-0001"
  psid: text("psid").notNull(),
  items: jsonb("items").$type<{ itemId: string; quantity: number; note?: string }[]>().notNull(),
  subtotalVnd: integer("subtotal_vnd").notNull(),
  discountVnd: integer("discount_vnd").notNull().default(0),
  shippingFeeVnd: integer("shipping_fee_vnd").notNull().default(15000),
  totalVnd: integer("total_vnd").notNull(),
  voucherCode: text("voucher_code"),
  paymentMethod: text("payment_method"), // cod | qr | card
  status: text("status").notNull(), // OrderState từ PLACED trở đi (+ AWAITING_PAYMENT, CANCELLED)
  deliveryAddress: text("delivery_address"),
  deliveryPhone: text("delivery_phone"),
  upsellAccepted: boolean("upsell_accepted").notNull().default(false), // metric cho admin
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("orders_psid_created_idx").on(t.psid, t.createdAt.desc()), // getActiveOrderByPsid
  index("orders_created_idx").on(t.createdAt.desc()),              // admin polling ORDER BY createdAt
]);

export const loyaltyAccounts = pgTable("loyalty_accounts", {
  phone: text("phone").primaryKey(),
  points: integer("points").notNull().default(0),
});

// Mock POS 90 ngày — nguồn cho co-occurrence matrix (script sinh)
export const posTransactions = pgTable("pos_transactions", {
  id: serial("id").primaryKey(),
  storeId: text("store_id").notNull(),
  ts: timestamp("ts").notNull(),
  itemIds: jsonb("item_ids").$type<string[]>().notNull(),
});

// Log message 2 chiều: dedupe theo mid + transcript cho staff console
export const messageLog = pgTable("message_log", {
  id: serial("id").primaryKey(),
  psid: text("psid").notNull(),
  mid: text("mid").unique(), // Messenger message id — dedupe; null với tin outbound
  direction: text("direction").notNull(), // in | out
  text: text("text").notNull(),
  processed: boolean("processed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("message_log_psid_created_idx").on(t.psid, t.createdAt), // getTranscript theo psid
]);
