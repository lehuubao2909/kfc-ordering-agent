# Dev A → Lead: cần chốt trước khi code (10/7)

## ⛔ Blocker gấp (chặn seed/db:push/chạy thật)
- **`.env` đang RỖNG** — chưa có `DATABASE_URL` (Neon). Không có `.env.local` / `.env.example`.
  → Anh gửi em `DATABASE_URL` + các env cần (`ADMIN_BASIC_AUTH`, `NEXT_PUBLIC_APP_URL`, `MESSENGER_PAGE_ACCESS_TOKEN`...) và tạo `.env.example` để cả team `cp` được không?
- (Đã tự chạy `npm install` xong — cái này không chặn.)

## 🔴 BLOCKER BUILD/DEPLOY (gấp — chặn Vercel)
`npm run build` mặc định (**Turbopack**) FAIL ở bước "collect page data":
`ReferenceError: Cannot access 'am' before initialization` → khi turbopack evaluate `z.string().datetime()` trong `src/lib/types.ts` (bug turbopack + zod v4). Lộ ra khi API routes import service graph.
- Đã xác nhận: **`next build --webpack` PASS toàn bộ 14 route** · `tsc --noEmit` PASS · smoke test 18/18 PASS. Lỗi thuần toolchain, không phải logic.
- Ảnh hưởng: Vercel deploy dùng turbopack → sẽ fail y hệt. **Phải sửa trước khi deploy.**
- 2 phương án (em KHÔNG tự đụng vì cả 2 thuộc vùng anh):
  - **(A)** Đổi `package.json` script: `"build": "next build --webpack"` — đã chứng minh pass, 1 dòng, không đụng types.ts.
  - **(B)** `types.ts`: `z.string().datetime()` → `z.iso.datetime()` (idiom zod v4 chuẩn) — em test được nếu anh cho phép sửa file này.
- Anh chọn A hay B? Em áp ngay khi có ý anh.

## reset-demo-data.ts (ownership lệch)
1. plan.md:56 ghi `scripts/reset-demo-data.ts` là **việc Lead**, nhưng nó truncate `orders/sessions/message_log` (đất em). **Anh tự viết hay để em viết** (anh review spec)?
2. Nếu em viết: reset bảng nào / giữ bảng nào? Em đề xuất: **giữ** `menu_items / vouchers / promotions / pos_transactions`; **xóa** `orders / sessions / message_log`. `loyalty_accounts` giữ hay reset?

## admin/conversations (chưa có skeleton)
3. 3 route `/api/admin/conversations*` **chưa được scaffold** (các route khác thì có stub 501). Anh **cố tình hoãn hay sót**? Xác nhận em tạo mới trong scope Dev A?
4. `sessions.mode` bị **cả `takeover` route (em) lẫn tool `handoff_to_human` (Dev B) cùng ghi**. Chốt: nguồn ghi chuẩn là ai? "notify staff" + "release trả bot" cụ thể làm gì (ghi/xóa field nào)?
5. `/conversations/send` phải **import `sendTextMessage` từ `messenger-adapter.ts` (đất Dev B)** — import chéo vậy đúng luật ownership chứ?
6. `/api/admin/**` (gồm conversations) dùng chung env auth nào? Xác nhận tên: `ADMIN_BASIC_AUTH`?

## Contract nhỏ (khỏi lệch lúc tích hợp)
7. contract:24 = `POST /api/admin/orders/advance` (body `{orderId,to}`), nhưng phase-02/04 viết `/api/admin/orders/:id/advance` (path param). Skeleton hiện theo **contract** (`/advance` + body). Chốt Dev C gọi kiểu body nhé?

---
**Trong lúc chờ:** em đẩy Giai đoạn 1–3 (seed script, menu-service DB + fallback fixtures, cart, order state machine, voucher/loyalty/upsell) — không dính mấy điểm trên. Chỉ kẹt ở chạy thật vì thiếu `DATABASE_URL`.
