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
| history | jsonb | `[{role, content}]` — do Dev B (agent) ghi. **KHÔNG dùng cho transcript staff** (xem message_log) |
| processingUntil | timestamp? | lock chống xử lý song song (Dev B), steal sau 60s |
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

> Envelope mọi route: `{ ok:true, data }` hoặc `{ ok:false, error:{code,message} }`.
> 🔒 = cần **Basic auth** header `Authorization: Basic base64(user:pass)` (env `ADMIN_BASIC_AUTH`) — thiếu → 401.

| Trang | Gọi API | Trả về (data) |
|---|---|---|
| menu carousel | `GET /api/menu?category=&q=` | `MenuItem[]` ✅ đang chạy |
| /order/[id] (tracking) | `GET /api/orders/{id}` | 1 `order` (SĐT + địa chỉ **đã mask**) |
| /pay/[orderId] | `GET /api/orders/{id}` để hiện tổng tiền/món; rồi `POST /api/payment/confirm` `{orderId, token}` | order sau khi PLACED |
| /admin | 🔒 `GET /api/admin/orders` | `{ orders[] (SĐT masked), funnel, upsell }` |
| /staff (list) | 🔒 `GET /api/admin/conversations` | `{ conversations: [{psid,state,mode,activeOrderId,cartCount,updatedAt}] }` |
| /staff (transcript) | 🔒 `GET /api/admin/conversations?psid=X` | `{ psid, transcript: [{direction,text,createdAt}] }` — **nguồn `message_log`, KHÔNG phải sessions.history** |
| /staff (takeover) | 🔒 `POST /api/admin/conversations/takeover` `{psid, mode}` | `{psid, mode}` |
| /staff (gõ tay) | 🔒 `POST /api/admin/conversations/send` `{psid, text}` | `{psid, sent}` |
| /staff (advance) | 🔒 `POST /api/admin/orders/advance` `{orderId, to}` | order sau khi chuyển trạng thái |

**Lưu ý quan trọng cho Dev C:**
- **Payment token:** link `/pay/[id]` do backend sinh kèm `?t=<token>`; trang /pay phải đọc `t` từ URL và gửi trong body `POST /api/payment/confirm` (thiếu/sai → 403).
- **PII đã mask:** `deliveryPhone` (`090***4567`) và `deliveryAddress` bị che ở `GET /api/orders/{id}` và `/api/admin/orders` — đừng mong số/địa chỉ đầy đủ.

Fixtures mẫu khớp shape: `src/fixtures/` — import trực tiếp render UI, đổi sang fetch API thật (giữ nguyên component).
