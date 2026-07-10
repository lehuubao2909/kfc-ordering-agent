# Dev A — Worklist chi tiết (Services & Data)

> Bản đồ thi công cá nhân cho Dev A. Nguồn: [phase-02](phase-02-core-services-and-data.md) · Contract: [api-contract.md](../../docs/api-contract.md) (freeze) · Standards: [code-standards.md](../../docs/code-standards.md)
>
> **✅ MÔI TRƯỜNG OK (10/7):** `.env` đã có `DATABASE_URL` + đủ key; `npm install` xong; native SWC đã sửa. `db:push` + `seed` (12 món/4 voucher/3 promo) + `mock-pos` (4911 giao dịch) + `co-occurrence` (matrix thật) đã chạy. **Smoke test `scripts/smoke-test-services.ts`: 18/18 pass** trên Neon thật — cart/totals/voucher/upsell/order state machine/loyalty đều đúng.
> **Mục tiêu M1 (trưa 11/7):** đặt đơn COD end-to-end. **Freeze:** 22:00 11/7.
>
> **⏸ 3 mục CHỜ LEAD xác nhận** (xem `dev-a-questions-for-lead.md`): 4.5 admin/conversations · 5.2 reset-demo-data · path của route advance. Không code tới khi Lead chốt.

## Quy tắc bất di bất dịch (mọi task đều tuân)

- Business logic CHỈ ở `src/lib/services/`. Route = wrapper mỏng, trả envelope `apiOk/apiError`, try/catch, không throw 500 trần.
- Giá / phí ship / tổng tiền CHỈ service tính từ menu-service. LLM & FE không tự tính.
- Input ngoài (API body) validate bằng zod trước khi dùng. Mask SĐT trong log (`090***4567`).
- Không sửa `types.ts` / `api-contract.md` / schema mà chưa báo Lead.
- File < 200 dòng, kebab-case tên dài rõ nghĩa. Commit nhỏ, `npm run build` pass mới push.
- **Đọc `node_modules/next/dist/docs/` cho route handler trước khi viết API route** (Next.js bản này có breaking changes).

---

## Giai đoạn 1 — Data foundation (làm TRƯỚC, mọi thứ phụ thuộc)

- [x] **1.1 `scripts/seed-menu.ts`** ✅ code xong (chờ DATABASE_URL để chạy thật) — đọc `src/fixtures/menu-sample.json` → `MenuItemSchema.parse` từng món → upsert `menuItems`. Seed thêm 3–4 `vouchers` (VD `KFC20` percent 20% minOrder 100k, `FREESHIP` freeship minOrder 150k, `GIAM30K` fixed 30k minOrder 200k) + 2–3 `promotions` active. Idempotent (chạy lại không nhân đôi). Verify: `npm run seed` xong query đếm rows.
- [ ] **1.2 Mở rộng menu** `menu-sample.json` 12 → ~60 món thật từ web KFC VN, có `imageUrl` thật (carousel demo cần ảnh). Giữ đúng `MenuItemSchema`, alias tiếng Việt phong phú cho NLU. Chạy lại `npm run seed`.
- [x] **1.2 Mở rộng menu 12 → 58 món** ✅ (6 category, alias VI, comboItemIds hợp lệ; `imageUrl` để trống — cần điền ảnh thật cho carousel demo)
- [x] **1.3 `menu-service.ts` → đọc DB** ✅ (import động + cache + fallback fixtures khi thiếu DB) — thay `menuFixture` bằng query `menuItems`, **giữ nguyên 5 chữ ký hàm**. Cache in-memory theo instance (chống Neon latency) + đọc lỗi thì fallback fixtures. `searchMenuItems` giữ logic alias match.
- [x] **1.4 `scripts/generate-mock-pos-transactions.ts`** ✅ code xong (daypart + cuối tuần) — sinh ~90 ngày giao dịch POS (phân bố theo daypart: sáng burger/cà phê, trưa combo cơm, xế snack/kem, tối combo nhóm) → insert `posTransactions`. `npm run mock-pos`.
- [x] **1.5 `scripts/compute-co-occurrence-matrix.ts`** ✅ code xong + seed tay `co-occurrence-matrix.json` để chạy trước khi có POS thật — query `posTransactions` → đếm cặp itemId đồng xuất hiện → normalize (P(B|A)) → ghi JSON (VD `src/fixtures/co-occurrence.json`) cho upsell load. `npm run co-occurrence`.

## Giai đoạn 2 — Core state machine (sáng 11/7 — đường tới M1, ưu tiên #1)

- [x] **2.1 `cart-service.ts`** (5 hàm) ✅ + tách `session-data-service.ts` làm data-layer sessions/customers — mỗi hàm: đọc `sessions.cart` theo psid → thao tác → validate itemId tồn tại & `available` qua `getMenuItemById` TRƯỚC khi thêm → save session → trả `Cart`. `addToCart` cộng dồn quantity nếu trùng itemId + note. `getCart` tạo session rỗng nếu chưa có.
- [x] **2.2 `order-service.ts` — `calculateOrderTotals(cart)`** ✅ (kèm auto-voucher qua computeTotals nội bộ) — lấy giá từng món từ menu-service, subtotal, +ship flat 15k, discount = 0 ở bước này (voucher áp riêng). Trả `{subtotalVnd, discountVnd, shippingFeeVnd, totalVnd}`.
- [x] **2.3 `createOrderFromSession(psid, paymentMethod)`** ✅ (COD→PLACED / QR-thẻ→AWAITING_PAYMENT, id KFC-xxxx, emit event) — đọc session (state phải ≥ CONFIRMING), tính totals + `autoApplyBestVoucher`, sinh id `KFC-xxxx` (đếm/sequence), insert `orders`, set `sessions.activeOrderId`. Trả `Order`.
- [x] **2.4 `advanceOrderStatus(orderId, to)`** ✅ (validate transition + emit + earn loyalty khi DELIVERED) — đọc order, check `to ∈ VALID_TRANSITIONS[current]`, sai → `throw OrderTransitionError(msg tiếng Việt)`; update DB + `updatedAt` → **gọi `emitOrderStatusChange(order)`** → trả order.
- [x] **2.5 `cancelOrder(orderId)`** ✅ (chặn ≥ PREPARING kèm message VN) — hợp lệ khi status ∈ {AWAITING_PAYMENT, PLACED}; từ PREPARING trở đi → `throw OrderTransitionError("Đơn đã vào bếp, không thể hủy...")`. Dùng advanceOrderStatus → CANCELLED.
- [x] **2.6 `getOrderById` / `getActiveOrderByPsid`** ✅ — query DB, map row → `OrderSchema`. Active = order chưa DELIVERED/CANCELLED, mới nhất.
- [x] **2.7 Unit test ~8 case transition** ✅ `scripts/smoke-test-services.ts` (18 assertion, 18/18 pass trên DB thật) (script test đơn giản hoặc `scripts/`): checkout giỏ rỗng bị chặn · hủy sau PREPARING bị chặn · transition nhảy cóc bị chặn · COD → PLACED thẳng · QR → AWAITING_PAYMENT → PLACED · mỗi advance phát đúng 1 event · calculateOrderTotals đúng số · voucher auto-apply chọn giảm nhiều nhất.

## Giai đoạn 3 — Business services (sáng → chiều)

- [x] **3.1 `promotion-voucher-service.ts`** ✅ (percent cap 50k / fixed / freeship, explanation VN)
  - `getActivePromotions()` — query `promotions.active` → `{title, description}[]`.
  - `autoApplyBestVoucher(cart, subtotalVnd)` — thử mọi voucher active thỏa `minOrderVnd` → tính discount từng loại (percent/fixed/freeship) → chọn max → trả `VoucherResult` kèm `explanation` tiếng Việt ("Đã áp KFC20 giảm 20% (−30.000đ) cho đơn của bạn"). Không mã nào thỏa → `null`.
  - `applyVoucherCode(cart, code, subtotalVnd)` — mã cụ thể khách đưa; sai/hết hạn/không đủ minOrder → message thân thiện (throw hoặc trả lỗi).
- [x] **3.2 `loyalty-service.ts`** ✅ (getLoyaltyPoints tạo random 500–2000; earn 1đ/1000đ; mask SĐT)
  - `getLoyaltyPoints(phone)` — query `loyaltyAccounts`; chưa có → insert điểm random 500–2000 (demo khách quen). Mask phone khi log.
  - `earnPointsForOrder(phone, totalVnd)` — cộng `floor(totalVnd/1000)` điểm, trả tổng mới. Gọi khi order DELIVERED.
- [x] **3.3 `upsell-recommendation-service.ts` — `getUpsellSuggestions(cart, timestamp?)`** ✅ (daypart+co-occurrence+attach-gap, top 3, reason có số thật)
  - Load co-occurrence JSON (task 1.5), cache in-memory.
  - `score = 0.35*daypartAffinity + 0.35*coOccurrence(cart) + 0.1*promoBoost + 0.2*attachGap` (dùng `UPSELL_WEIGHTS`).
  - Daypart rules: 6–10h burger/cà phê · 10–14h combo cơm · 14–17h snack/kem · 17–22h combo nhóm.
  - attach-gap: giỏ thiếu drink/dessert/snack → boost category đó.
  - Loại món đã có trong giỏ, trả **top 2–3** kèm `reason` có **số thật** ("78% khách trưa gọi kèm Pepsi").

## Giai đoạn 4 — Payment + API routes (chiều)

- [x] **4.1 `payment-mock-service.ts` — `confirmPayment(orderId)`** ✅ (verify AWAITING_PAYMENT→PLACED, idempotent) — verify order đang `AWAITING_PAYMENT` (khác → lỗi) → `advanceOrderStatus(orderId, "PLACED")`. `getPaymentLink` đã xong.
- [x] **4.2 `POST /api/payment/confirm`** ✅ (zod + envelope + register push tại request-time) — zod parse `{orderId}` → `confirmPayment` → `apiOk`. **Import notification-sender (Dev B)** để listener event gắn khi route load.
- [x] **4.3 `GET /api/admin/orders`** ✅ (basic auth + funnel/upsell metrics qua admin-metrics-service, mask SĐT) — basic auth (`ADMIN_BASIC_AUTH` env) → orders mới nhất + funnel metrics (started → cart → confirmed → paid, upsell acceptance từ `orders.upsellAccepted`). `apiOk`.
- [x] **4.4 `POST /api/admin/orders/advance`** ✅ (basic auth + zod + advanceOrderStatus + push) — basic auth → zod `{orderId, to}` → `advanceOrderStatus` → `apiOk`. Import notification-sender.
- [x] **4.5 Admin conversations** ✅ code xong (GET list/transcript, takeover, send qua messenger-adapter) — ⚠️ semantics `session.mode` VẪN cần Lead xác nhận với Dev B:
  - `GET /api/admin/conversations` — list sessions + transcript từ `messageLog`.
  - `POST /api/admin/conversations/takeover` — `{psid, mode}` set `sessions.mode` (human/agent).
  - `POST /api/admin/conversations/send` — `{psid, text}` → gọi messenger-adapter (Dev B) gửi + log `messageLog` direction=out.

## Giai đoạn 5 — Support (tối)

- [ ] **5.1 Error handling** — rà mọi route: try/catch, envelope, zod, không lộ stack. `OrderTransitionError` → 400 message tiếng Việt.
- [x] **5.2 `scripts/reset-demo-data.ts`** ✅ code xong (xóa orders/sessions/message_log/customers/loyalty, giữ catalog+pos) — ⚠️ OWNER plan.md:56 là Lead; đã impl theo yêu cầu Dev A, chờ Lead review spec.

## ⚠️ BLOCKER build (10/7) — cần Lead
- `npm run build` mặc định (**Turbopack**) FAIL ở "collect page data": `ReferenceError: Cannot access 'am' before initialization` khi evaluate `z.string().datetime()` trong `types.ts` (bug turbopack + zod v4). **`next build --webpack` PASS toàn bộ route** · `tsc --noEmit` PASS · smoke 18/18 PASS.
- Ảnh hưởng Vercel deploy (dùng turbopack). Fix cần đụng vùng Lead: (A) đổi build script sang `next build --webpack`, hoặc (B) `types.ts`: `z.string().datetime()` → `z.iso.datetime()`. Chờ Lead quyết.
- [ ] **5.3 Tune upsell** cùng Lead ở 3 mốc giờ demo (sáng/trưa/tối) — chỉnh `UPSELL_WEIGHTS`.
- [ ] **5.4 Hỗ trợ tích hợp** Dev B (tools map 1-1 vào service) & Dev C (FE gọi API routes).

---

## Thứ tự thi công đề xuất (theo phụ thuộc)

```
1.1 seed → 1.3 menu DB          (data nền)
   → 2.1 cart → 2.2/2.3 totals+createOrder → 2.4/2.5 transitions → 2.6 getters → 2.7 tests   ⇒ M1 COD
   → 3.1 voucher → 3.2 loyalty                (bổ trợ createOrder/confirm)
1.4 mock-pos → 1.5 co-occurrence → 3.3 upsell (nhánh song song)
   → 4.1 payment → 4.2 confirm route → 4.3/4.4 admin orders → 4.5 conversations
   → 5.x polish + freeze
```

## Success Criteria (từ phase-02)

Chạy đủ vòng đời đơn bằng curl/tests: cart → confirm → delivery → COD/QR → PLACED → PREPARING → DELIVERING → DELIVERED, **mỗi transition phát event**. Upsell trả 2–3 món kèm reason đổi theo giờ. Transition sai bị chặn kèm message rõ. `npm run build` pass.
