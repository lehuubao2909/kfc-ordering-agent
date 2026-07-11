# PROJECT ANALYSIS

Tài liệu này ghi lại những gì đã đọc trong repository và cách nó được dùng để tạo bộ slide.

## 1. Phạm vi đã đọc

### Root files
- `README.md`
- `package.json`
- `AGENTS.md`
- `docs/*`
- `plans/*`

### Source frontend
- `src/app/page.tsx`
- `src/app/admin/page.tsx`
- `src/app/staff/page.tsx`
- `src/app/order/[id]/page.tsx`
- `src/app/pay/[orderId]/page.tsx`
- `src/components/*`
- `src/app/globals.css`

### Backend và service layer
- `src/lib/types.ts`
- `src/lib/db/schema.ts`
- `src/lib/db/client.ts`
- `src/lib/services/*`
- `src/lib/agent/*`
- `src/lib/channels/*`
- `src/app/api/*`

### Fixtures và scripts
- `src/fixtures/*`
- `scripts/*`

### Docs quan trọng
- `docs/codebase-summary.md`
- `docs/backend-architecture.md`
- `docs/api-contract.md`
- `docs/database-schema.md`
- `docs/code-standards.md`
- `docs/payment-production-plan.md`
- `docs/messenger-webhook-setup-guide.md`

## 2. Cấu trúc rút ra từ source

- Đây là một repo Next.js full-stack monorepo, không tách backend riêng.
- Backend logic sống trong `src/lib/services`.
- `src/app/api` đóng vai trò route wrapper mỏng.
- Frontend pages có các màn landing, admin, staff, order tracking, payment.
- `src/lib/agent` và `src/lib/channels` là lớp chuẩn bị cho Messenger bot thật.
- `src/fixtures` giữ demo data để UI chạy ổn định ngay cả khi DB live chưa đầy đủ.

## 3. Các module đã xác nhận

- Menu service, cart service, session service, order service.
- Voucher, loyalty, upsell recommendation, admin metrics.
- Payment mock service.
- Order status event hub và Messenger notification sender.
- API routes cho menu, payment confirm, admin orders, admin conversations, order detail, messenger webhook.

## 4. Kiến trúc suy ra từ source

1. Messenger hoặc browser tạo input.
2. API route hoặc agent wrapper nhận input.
3. Service layer xử lý nghiệp vụ.
4. Database hoặc fixture giữ trạng thái.
5. External channel push ngược ra Messenger.

Mô hình này nhất quán giữa docs và code:
- state machine nằm ở service
- UI không tự tính tiền
- LLM không tự quyết giá
- order status chỉ được phép đi theo transition hợp lệ

## 5. Tính năng đã hoàn thiện hoặc có bằng chứng mạnh

- `GET /api/menu` hoạt động.
- `order-service.ts` có state machine và transition guard.
- `payment-mock-service.ts` có confirmPayment idempotent.
- `admin-metrics-service.ts` có số liệu funnel và upsell.
- `src/app/page.tsx` tạo landing page và QR tự động.
- `src/app/order/[id]/page.tsx` và `src/app/pay/[orderId]/page.tsx` hiển thị tracking và payment mock.
- `src/app/api/webhooks/messenger/route.ts` đã có webhook echo.

## 6. Tính năng còn partial hoặc mock

- Messenger webhook vẫn đang echo thay vì vào agent loop thật.
- Nhiều trang UI admin/staff/order/pay đang dùng mock data để ổn định demo.
- Payment vẫn là mock thay vì webhook cổng thật.
- `src/lib/agent/*` và `src/lib/channels/*` còn nhiều TODO.

## 7. Mock hoặc placeholder

- `src/lib/mock/mock-data.ts`
- `src/fixtures/*`
- `payment-mock-service.ts`
- `src/app/api/webhooks/messenger/route.ts` hiện echo text
- Một số file agent/channel chỉ có signature hoặc TODO

## 8. Rủi ro kỹ thuật

- Thiếu lớp webhook payment production và reconciliation.
- Thiếu agent turn thật và queue/lock hoàn chỉnh.
- UI demo phụ thuộc mock data ở vài màn chính.
- Không thấy `.env.example` trong root.
- Không thấy `Dockerfile` hoặc `docker-compose` trong repo hiện tại.

## 9. Dependency và tích hợp ngoài

- Next.js 16 và React 19.
- Drizzle ORM + Neon Postgres.
- Zod để validate.
- Motion cho animation UI.
- QRCode để sinh mã QR.
- OpenAI/Vercel AI SDK theo docs và TODO agent.
- Meta Messenger Send API.

## 10. Các file phân tích chính được dùng cho slide

- `README.md`
- `docs/codebase-summary.md`
- `docs/backend-architecture.md`
- `docs/api-contract.md`
- `docs/database-schema.md`
- `src/lib/types.ts`
- `src/lib/services/order-service.ts`
- `src/lib/services/admin-metrics-service.ts`
- `src/lib/services/menu-service.ts`
- `src/lib/services/upsell-recommendation-service.ts`
- `src/app/api/webhooks/messenger/route.ts`
- `src/app/admin/page.tsx`
- `src/app/staff/page.tsx`
- `src/app/order/[id]/page.tsx`
- `src/app/pay/[orderId]/page.tsx`

## 11. Kết luận ngắn

Source cho thấy dự án đã có lõi backend đáng tin cậy và một lớp trình diễn khá hoàn thiện. Điểm còn thiếu chủ yếu nằm ở agent loop thật, payment production, và việc thay mock UI bằng live data ở các màn vận hành.
