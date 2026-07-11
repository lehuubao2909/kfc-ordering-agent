# Dev A → Lead: các việc cần chốt (cập nhật 11/7)

> Trả lời theo số cho nhanh. Backend Dev A đã xong & verify (tsc · webpack build · smoke 23/23 trên Neon).

## 🔴 1. Chặn deploy — quyết NGAY
`npm run build` mặc định (**Turbopack**) FAIL: lỗi `z.string().datetime()` trong `types.ts` (bug turbopack+zod v4). `next build --webpack` thì PASS hết.
→ **Anh chọn:** (A) đổi script `"build": "next build --webpack"` *hoặc* (B) sửa `types.ts` thành `z.iso.datetime()`. Cả 2 thuộc vùng anh nên em không tự đụng.

## 📄 2. Cập nhật `api-contract.md` (Dev C đang chờ shape)
| # | Đổi gì | Ghi chú |
|---|---|---|
| 2a | **Thêm** `GET /api/orders/:id` | Route MỚI (em đã build). Trang /order + /pay cần; contract cũ thiếu. Trả `order`, SĐT+địa chỉ **đã mask**, không cần auth. |
| 2b | `POST /api/payment/confirm` nay nhận `{orderId, token}` | Do vá bảo mật (token HMAC). Dev C phải đọc `?t=` từ link /pay gửi kèm. |
| 2c | Chốt kiểu `advance` | contract = body `{orderId,to}`; phase docs = path `/:id/advance`. Skeleton đang theo **body**. |

## 🤝 3. `session.mode` — Dev A ↔ Dev B
`takeover` route (em) và tool `handoff_to_human` (Dev B) **cùng ghi** `sessions.mode` (agent/human).
→ **Chốt:** webhook Dev B có bỏ qua LLM khi `mode=human` không? "notify staff" và "release (trả bot)" cụ thể làm gì?

## ⚙️ 4. Env & script
- **4a.** Set env `PAYMENT_TOKEN_SECRET` (chưa có sẽ fallback `META_APP_SECRET`).
- **4b.** `reset-demo-data.ts`: plan gán anh, em đã viết sẵn (xóa `orders/sessions/message_log/customers/loyalty`, giữ `menu/voucher/promo/pos`). Anh review — **`loyalty_accounts` giữ hay xóa?**

## 🔵 5. DB nâng cao — quyết theo nghiệp vụ (không gấp)
- **5a.** Bảng `order_status_events` (audit timeline): làm nếu trang /order cần **timestamp từng bước**; không thì bỏ.
- **5b.** Transaction: `createOrderFromSession` chạy 3 lệnh rời, driver `neon-http` không bọc transaction. Đổi sang pooled + `db.transaction()`? (rủi ro demo thấp)
- **5c.** Foreign Key (orders.psid, sessions.activeOrderId, message_log.psid): thêm không?

## ✅ Đã xử lý — không cần làm gì
`.env`/`DATABASE_URL` đã có · `npm install` xong · 5 index đã push+verify Neon · 3 route `/api/admin/conversations*` đã tạo (scope Dev A) · import chéo `send` → `messenger-adapter` (Dev B) đang dùng — báo em nếu sai luật.
