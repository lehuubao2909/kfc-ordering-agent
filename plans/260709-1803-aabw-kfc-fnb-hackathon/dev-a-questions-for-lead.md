# Dev A → Lead: các việc cần chốt (cập nhật 11/7)

> Trả lời theo số cho nhanh. Backend Dev A đã xong & verify (tsc · webpack build · smoke 23/23 trên Neon).

## 🔴 1. Chặn deploy — quyết NGAY
`npm run build` mặc định (**Turbopack**) FAIL: lỗi `z.string().datetime()` trong `types.ts` (bug turbopack+zod v4). `next build --webpack` thì PASS hết.
→ **Anh chọn:** (A) đổi script `"build": "next build --webpack"` *hoặc* (B) sửa `types.ts` thành `z.iso.datetime()`. Cả 2 thuộc vùng anh nên em không tự đụng.

## 📄 2. Cập nhật `api-contract.md` (Dev C đang chờ shape)
| # | Đổi gì | Ghi chú |
|---|---|---|
| 2a | **Thêm** `GET /api/orders/:id` | Route MỚI (em đã build). Trang /order + /pay cần; contract cũ thiếu. Trả `order` full (không auth). |
| 2b | `GET /api/admin/orders` shape | Trả `data.{orders(+upsellAccepted), metrics:{funnel, aov, upsell}}` — đã đặt tên field khớp Dev C. `metrics.nluEval` **chưa có** (chờ Dev B). |
| 2c | Chốt kiểu `advance` | contract = body `{orderId,to}`; phase docs = path `/:id/advance`. Skeleton đang theo **body**. |
| ~~2d~~ | ~~payment token~~ | **ĐÃ GỠ** — `confirm` nhận lại `{orderId}` (token là over-engineering, xem conflicts note). |

## 🤝 3. `session.mode` — Dev A ↔ Dev B
`takeover` route (em) và tool `handoff_to_human` (Dev B) **cùng ghi** `sessions.mode` (agent/human).
→ **Chốt:** webhook Dev B có bỏ qua LLM khi `mode=human` không? "notify staff" và "release (trả bot)" cụ thể làm gì?

## ⚙️ 4. Script
- **4a.** `reset-demo-data.ts`: plan gán anh, em đã viết sẵn (xóa `orders/sessions/message_log/customers/loyalty`, giữ `menu/voucher/promo/pos`). Anh review — **`loyalty_accounts` giữ hay xóa?**
- **4b.** `metrics.aov` lấy từ `npm run backtest` (giả định 20% acceptance → uplift **2.7%**, số thật thấp). Anh/Người 4 muốn tune model/assumption không?

## 🔵 5. DB nâng cao — quyết theo nghiệp vụ (không gấp)
- **5a.** Bảng `order_status_events` (audit timeline): làm nếu trang /order cần **timestamp từng bước**; không thì bỏ.
- **5b.** Transaction: `createOrderFromSession` chạy 3 lệnh rời, driver `neon-http` không bọc transaction. Đổi sang pooled + `db.transaction()`? (rủi ro demo thấp)
- **5c.** Foreign Key (orders.psid, sessions.activeOrderId, message_log.psid): thêm không?
- **5d. 🟠 Snapshot giá dòng đơn (cần sửa `types.ts` — vùng anh).** `OrderSchema.items = CartItemSchema` không có giá → hóa đơn itemize lại theo giá menu HIỆN TẠI, sai nếu giá đổi sau khi đặt. Đề xuất: thêm `OrderLineSchema = CartItemSchema.extend({ unitPriceVnd: z.number().int().nonnegative() })` cho `OrderSchema.items`. Anh duyệt → em wire `schema.ts` `$type` + `createOrderFromSession` (đóng băng giá lúc tạo đơn). Không sửa `types.ts` sẽ bị zod strip mất.

## ✅ Đã xử lý — không cần làm gì
`.env`/`DATABASE_URL` đã có · `npm install` xong · 5 index đã push+verify Neon · 3 route `/api/admin/conversations*` đã tạo (scope Dev A) · import chéo `send` → `messenger-adapter` (Dev B) đang dùng — báo em nếu sai luật.
