# Backend Architecture — KFC Ordering Agent (Dev A)

> Bản đồ tầng backend + luồng gọi. Backend KHÔNG phải folder riêng — nó là **service layer + data layer**
> sống trong `src/lib`, còn `src/app/api` chỉ là cửa HTTP mỏng. Đây là chuẩn Next.js App Router.
> Cấu trúc & chữ ký hàm đã **freeze** (Dev B/Dev C phụ thuộc) — muốn đổi phải qua Lead.

## 1. Backend nằm ở đâu?

Next.js App Router tách 2 tầng rõ:

| Tầng | Thư mục | Vai trò |
|---|---|---|
| **Routing** | `src/app/` | Cửa vào: pages (Dev C) + API route handlers |
| **Backend** | `src/lib/` | Bộ não: business logic, data, tích hợp ngoài |

Vì dự án là **full-stack monolith 1 repo** (chốt trong decision log), backend không tách server riêng mà nằm chung repo — đúng thiết kế, đúng chuẩn Next.

## 2. Bản đồ 3 tầng

```
                 ┌─────────────────────────────────────────────┐
   HTTP (Dev C)  │  src/app/api/**  — route handlers (MỎNG)     │
   ───────────►  │  parse zod · basic auth · envelope · gọi svc │
                 └───────────────────────┬─────────────────────┘
                                          │ import trực tiếp
   Agent (Dev B) ─────────────────────────┤ (KHÔNG qua HTTP)
                                          ▼
                 ┌─────────────────────────────────────────────┐
   BỘ NÃO        │  src/lib/services/**  — business logic       │
                 │  state machine · tính tiền · voucher · upsell│
                 └───────────────────────┬─────────────────────┘
                                          ▼
                 ┌─────────────────────────────────────────────┐
   DATA          │  src/lib/db/**  — Drizzle schema + Neon      │
                 └─────────────────────────────────────────────┘

   src/lib/channels/**  (Dev B) — Messenger Send API, push notification
   src/lib/services/order-status-events.ts — cầu nối service → channel (push)
```

**Nguyên tắc vàng:** Route/tool/page chỉ là wrapper mỏng. **Mọi logic — nhất là tiền và trạng thái — chỉ nằm ở `src/lib/services`.** LLM và FE không bao giờ tự tính giá.

## 3. Chi tiết từng file service (`src/lib/services/`)

| File | Vai trò | Hàm chính |
|---|---|---|
| `menu-service.ts` | Đọc menu từ Neon + cache + fallback fixtures | `getFullMenu`, `getMenuByCategory`, `getMenuItemById`, `searchMenuItems` |
| `cart-service.ts` | Giỏ hàng; validate itemId qua menu trước khi thêm | `addToCart`, `removeFromCart`, `updateCartItemQuantity`, `getCart`, `clearCart` |
| `session-data-service.ts` | Data-layer bảng `sessions` + `customers` (state/cart/mode/delivery) | `getOrCreateSession`, `getSessionCart`, `saveSessionCart`, `setSessionState`, `setSessionMode`, `saveDeliveryInfo`, `getCustomer` |
| `order-service.ts` ⭐ | **Trái tim state machine** — tính tiền, tạo đơn, chuyển/hủy trạng thái | `calculateOrderTotals`, `createOrderFromSession`, `advanceOrderStatus`, `cancelOrder`, `getOrderById`, `getActiveOrderByPsid` |
| `promotion-voucher-service.ts` | Ưu đãi + auto-apply mã tốt nhất | `getActivePromotions`, `autoApplyBestVoucher`, `applyVoucherCode` |
| `loyalty-service.ts` | Điểm thưởng theo SĐT | `getLoyaltyPoints`, `earnPointsForOrder` |
| `upsell-recommendation-service.ts` | Gợi ý món (daypart + co-occurrence + attach-gap) | `getUpsellSuggestions` |
| `payment-mock-service.ts` | Thanh toán mock (QR/thẻ) | `getPaymentLink`, `confirmPayment` |
| `admin-metrics-service.ts` | Số liệu funnel + upsell cho `/admin` | `getOrdersOverview` |
| `conversation-admin-service.ts` | List hội thoại + transcript + log staff | `listConversations`, `getTranscript`, `logStaffOutbound` |
| `order-status-events.ts` | Event hub: service phát → channel nghe (push) | `emitOrderStatusChange`, `onOrderStatusChange` |

## 4. State machine (nằm ở service, không ở LLM)

```
BROWSING → CART → CONFIRMING → COLLECTING_DELIVERY → SELECTING_PAYMENT ─┬→ PLACED (COD)
                                                                        └→ AWAITING_PAYMENT → PLACED (QR/thẻ)
PLACED → PREPARING → DELIVERING → DELIVERED
CANCELLED: chỉ từ AWAITING_PAYMENT / PLACED. Từ PREPARING trở đi KHÔNG hủy.
```

- Bảng luật: `VALID_TRANSITIONS` trong `order-service.ts`. Chuyển sai → `throw OrderTransitionError` kèm message tiếng Việt để agent relay.
- `sessions.state` giữ trạng thái tiền-đơn (BROWSING→SELECTING_PAYMENT). `orders.status` giữ trạng thái đơn (từ PLACED).
- Mỗi lần `advanceOrderStatus` → gọi `emitOrderStatusChange` → notification-sender (Dev B) push Messenger.

## 5. Ba luồng chính (end-to-end)

**A. Đặt hàng COD**
```
addToCart ×n → calculateOrderTotals (+ autoApplyBestVoucher)
→ saveDeliveryInfo → createOrderFromSession("cod")
→ order PLACED + emitOrderStatusChange → push "đã xác nhận, 30-40 phút"
```

**B. Thanh toán QR/thẻ**
```
createOrderFromSession("qr") → AWAITING_PAYMENT + getPaymentLink → khách mở /pay/[id]
→ POST /api/payment/confirm → confirmPayment → advanceOrderStatus(PLACED) → push
```

**C. Staff chuyển trạng thái**
```
/staff bấm advance → POST /api/admin/orders/advance {orderId, to}
→ advanceOrderStatus → emit event → push khách ("đang chuẩn bị"/"đang giao"/"đã giao")
DELIVERED → earnPointsForOrder tự cộng điểm loyalty
```

## 6. API routes (`src/app/api/`) — cửa HTTP cho Dev C

| Route | Method | Gọi service |
|---|---|---|
| `/api/menu?category=&q=` | GET | menu-service |
| `/api/payment/confirm` | POST | `confirmPayment` |
| `/api/admin/orders` | GET (basic auth) | `getOrdersOverview` |
| `/api/admin/orders/advance` | POST (basic auth) | `advanceOrderStatus` |
| `/api/admin/conversations` | GET (basic auth) | `listConversations` / `getTranscript` |
| `/api/admin/conversations/takeover` | POST (basic auth) | `setSessionMode` |
| `/api/admin/conversations/send` | POST (basic auth) | messenger-adapter + `logStaffOutbound` |

- Helper chung: `src/app/api/_lib/route-utils.ts` — `ok/fail/handleError/parseBody/requireBasicAuth/maskPhone`. Thư mục `_lib` là private folder (không thành route).
- Mọi route: try/catch → envelope `{ok,data}` / `{ok,error}`, validate body bằng zod, mask SĐT khi trả admin.

## 7. Ai tiêu thụ backend?

- **Dev B (agent):** `import` thẳng hàm service (KHÔNG gọi HTTP). Ví dụ tool `add_to_cart` → `addToCart`, `confirm_order` → `calculateOrderTotals`. Map đầy đủ ở `docs/api-contract.md`.
- **Dev C (frontend):** gọi các API route ở mục 6.

## 8. Scripts dữ liệu (`scripts/`)

| Script | Lệnh | Việc |
|---|---|---|
| `seed-menu.ts` | `npm run seed` | Nạp menu (58 món) + voucher + promotion |
| `generate-mock-pos-transactions.ts` | `npm run mock-pos` | Sinh 90 ngày POS giả (theo daypart) |
| `compute-co-occurrence-matrix.ts` | `npm run co-occurrence` | Sinh `co-occurrence-matrix.json` cho upsell |
| `reset-demo-data.ts` | `npm run reset-demo` | Xóa dữ liệu giao dịch, giữ catalog |
| `smoke-test-services.ts` | `npx tsx scripts/smoke-test-services.ts` | Test vòng đời đơn (18 assertion) |
| `load-env.ts` | (import nội bộ) | Nạp `.env` trước mọi import (fix ESM hoisting) |

## 9. Bảo mật & xử lý đồng thời

**Exception:** lỗi có kiểu (`OrderTransitionError`, `CartError`) mang message VI; route `handleError` map Zod→400, nghiệp vụ→400, còn lại→500 (không lộ stack). Lỗi phụ (voucher/loyalty/push) được nuốt, không hỏng nghiệp vụ chính.

**Concurrency (đã vá):**
- **Sinh mã đơn:** retry-on-conflict (`onConflictDoNothing` + đọc lại count, tối đa 5 lần) — 2 khách đặt cùng lúc không còn trùng id.
- **`advanceOrderStatus`:** optimistic guard — `WHERE id=? AND status=<đọc lúc đầu>`; 0 row → báo lỗi thay vì double-transition.
- **Loyalty:** increment atomic `points = points + n` trong SQL.
- **Session:** `getOrCreateSession` dùng `onConflictDoNothing` + đọc lại.
- Giỏ (cùng PSID) được serialize bởi per-conversation lock/queue của Dev B (phase-03).

**Bảo mật:**
- Basic auth cho `/api/admin/**` (fail-safe khi thiếu env), **bắt buộc HTTPS** (base64).
- **Payment (mock):** `confirmPayment` chỉ verify `AWAITING_PAYMENT` + idempotent. KHÔNG token (đã cân nhắc & gỡ: bảo vệ endpoint mock sẽ bị thay bằng webhook cổng thật → giá trị ~0, lại phá luồng FE). Production: webhook cổng verify chữ ký HMAC của cổng.
- Zod validate mọi input · mask SĐT log+admin · secrets ở env, `.env` gitignored.
- Chống prompt-injection theo thiết kế: tools gated theo state + service validate id/giá → LLM không bịa giá/nhảy state.
- Còn hở (chấp nhận cho demo): 1 credential admin chung, không rate-limit; sanitize HTML là việc render của Dev C.

## 10. Trạng thái & vấn đề đã biết

- ✅ Verify: `tsc --noEmit` · `next build --webpack` (15 route) · smoke test **21/21** trên Neon.
- ⛔ **Build Turbopack fail** (bug turbopack+zod v4 ở `z.string().datetime()` trong `types.ts`) → cần Lead: đổi build sang `--webpack` hoặc sửa `z.iso.datetime()`.
- ⏸ **`session.mode`** ghi bởi cả takeover route (Dev A) lẫn tool handoff (Dev B) → cần Lead chốt hợp đồng mute/notify/release.
- ⏸ **Contract:** thêm `GET /api/orders/:id` + shape `/api/admin/orders` (`data.metrics`) vào `api-contract.md`.
- 🔲 `imageUrl` trong menu để trống — cần ảnh thật cho carousel demo.

Chi tiết 2 việc chờ Lead: [../plans/260709-1803-aabw-kfc-fnb-hackathon/dev-a-questions-for-lead.md](../plans/260709-1803-aabw-kfc-fnb-hackathon/dev-a-questions-for-lead.md)
