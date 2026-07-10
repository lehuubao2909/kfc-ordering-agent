# Database Schema — KFC Ordering Agent

> Tài liệu đọc-được cho người. Nguồn code: `src/lib/db/schema.ts` (Drizzle) + `src/lib/types.ts` (zod). **Đổi schema → nhắn Lead.**
> Dev C: KHÔNG cần chờ DB thật — dùng fixtures trong `src/fixtures/` (shape khớp đúng bảng dưới đây) để dựng UI trước.

## Enums quan trọng (dùng khắp UI)

**OrderState** (trạng thái đơn — quyết định badge/timeline trên UI):
```
BROWSING → CART → CONFIRMING → COLLECTING_DELIVERY → SELECTING_PAYMENT
  ├─ (COD)  → PLACED
  └─ (QR/thẻ) → AWAITING_PAYMENT → PLACED
PLACED → PREPARING → DELIVERING → DELIVERED
CANCELLED (từ AWAITING_PAYMENT hoặc PLACED; ≥ PREPARING KHÔNG hủy được)
```
UI tracking (/order) hiển thị timeline: PLACED → PREPARING → DELIVERING → DELIVERED.

**SessionMode**: `agent` (bot trả lời) | `human` (staff đã tiếp quản, bot im) — staff console dùng để bật/tắt takeover.

**PaymentMethod**: `cod` | `qr` | `card`.

**category** (menu): `combo` | `chicken` | `burger-rice` | `snack` | `dessert` | `drink`.

## Các bảng

### menu_items — món ăn (Dev C: menu carousel, order line items)
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | text PK | slug: `ga-gion-cay-1-mieng` |
| name | text | "Gà Giòn Cay (1 miếng)" |
| aliases | jsonb string[] | NLU match, UI không cần |
| category | text | xem enum trên |
| priceVnd | int | 35000 (đơn vị đồng, format "35.000đ") |
| description | text | |
| imageUrl | text | ảnh card |
| comboItemIds | jsonb string[]? | chỉ combo mới có |
| available | bool | false → ẩn khỏi UI |

### orders — đơn hàng (Dev C: admin table, tracking page, receipt)
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | text PK | "KFC-0001" |
| psid | text | id khách Messenger |
| items | jsonb | `[{itemId, quantity, note?}]` |
| subtotalVnd / discountVnd / shippingFeeVnd / totalVnd | int | tiền; ship flat 15000 |
| voucherCode | text? | |
| paymentMethod | text? | cod/qr/card |
| status | text | OrderState (từ PLACED trở đi) |
| deliveryAddress / deliveryPhone | text? | |
| upsellAccepted | bool | metric admin: khách có nhận gợi ý không |
| createdAt / updatedAt | timestamp | |

### sessions — hội thoại (Dev C: staff console list + trạng thái)
| Cột | Kiểu | Ghi chú |
|---|---|---|
| psid | text PK | |
| state | text | OrderState hiện tại |
| mode | text | agent/human |
| cart | jsonb | `{items:[{itemId,quantity,note?}], voucherCode?}` |
| activeOrderId | text? | |
| history | jsonb | `[{role, content}]` — transcript hiển thị |
| updatedAt | timestamp | sort list theo cột này |

### customers
`psid PK, name?, phone?, lastAddress?, createdAt` — prefill địa chỉ khách quen.

### vouchers
`code PK, description, discountType(percent|fixed|freeship), discountValue, minOrderVnd, active`.

### promotions
`id PK, title, description, discountType, discountValue, active` — agent giới thiệu khi khách hỏi ưu đãi.

### loyalty_accounts
`phone PK, points` — tra điểm theo SĐT.

### message_log (Dev B: dedupe + transcript)
`id, psid, mid unique, direction(in|out), text, processed, createdAt`.

### pos_transactions (Dev A only: sinh co-occurrence, UI không dùng)
`id, storeId, ts, itemIds jsonb`.

## Dev C dùng gì (API → shape)

| Trang | Gọi API | Trả về |
|---|---|---|
| /admin | GET /api/admin/orders | `orders[]` + funnel metrics |
| /staff | GET /api/admin/conversations | sessions[] + history (transcript) |
| /order/[id] | (tracking) | 1 `order` theo status |
| /pay/[orderId] | (payment) | 1 `order` + totals |
| menu carousel | GET /api/menu | `menuItems[]` ✅ đang chạy |

Fixtures mẫu khớp shape: `src/fixtures/` — import trực tiếp render UI, đổi sang fetch API thật khi Dev A xong (giữ nguyên component).
