# Slide Content

Tài liệu này chứa nội dung chữ của bộ slide để đội thi dễ chỉnh sửa mà không cần mở trực tiếp HTML.

## Slide 1 — Cover
- KFC Ordering Agent
- Trợ lý đặt món tiếng Việt qua Messenger, kết hợp LLM, state machine, service layer và dashboard vận hành cho đội GOKU.
- Team: Sơn Phước Lộc, Lê Hữu Bảo, Nguyễn Trọng Hùng, Nguyễn Anh Tuấn, Nguyễn Đức Thịnh
- Loại sản phẩm: F&B ordering agent
- Trạng thái: demo-ready core, một số lớp hội thoại vẫn mock/echo

## Slide 2 — Problem
- Đặt món qua chat dễ nhầm món, số lượng và địa chỉ nếu không có state rõ ràng.
- Upsell thủ công không đồng nhất và khó đo bằng dữ liệu.
- Nhân viên cần một màn hình nhìn được transcript, đơn hàng và takeover.
- Thanh toán thật và webhook thật cần một thiết kế an toàn; demo cần ổn định và minh bạch.

## Slide 3 — Proposed Solution
- LLM lo hội thoại.
- Service layer lo menu, cart, voucher, loyalty, payment và state machine.
- Route và UI chỉ là wrapper mỏng.
- Event hub phát cập nhật trạng thái sang Messenger.

## Slide 4 — Target Users / Use Cases
- Khách đặt món qua Messenger bằng tiếng Việt tự nhiên.
- Khách theo dõi đơn và thanh toán mock.
- Nhân viên takeover hoặc gửi tin trực tiếp.
- Ban giám khảo xem demo flow end-to-end.

## Slide 5 — Product Overview
- Frontend: landing, admin, staff, tracking, pay.
- API routes: menu, payment confirm, admin orders, conversation routes, order details.
- Service layer: menu, cart, session, order, voucher, loyalty, upsell, metrics.
- Agent/channels: agent core, tools, Messenger adapter, notification sender.
- Data/scripts: fixtures, seed, mock POS, backtest, eval harness.

## Slide 6 — Core Features
- READY: menu API, order state machine, admin metrics, order detail API.
- PARTIAL: webhook echo, typing indicator, notification push path.
- MOCK: admin/staff UI data, payment UI flow, demo QR.
- PLANNED: agent turn, tool wrappers, production payment webhook.

## Slide 7 — User Flow
- User mở landing hoặc Messenger.
- Agent hiểu ý, chọn món, upsell.
- Service tính tiền và xác nhận.
- DB giữ trạng thái và order.
- Messenger push cập nhật kết quả.

## Slide 8 — System Architecture
- Client: Messenger, browser, staff console, admin dashboard.
- Frontend: Next.js App Router.
- Backend: service layer trong `src/lib/services`.
- Database: Drizzle schema + Neon + fixtures fallback.
- External: Messenger Send API, OpenAI, payment gateway roadmap.

## Slide 9 — Technology Stack
- Next.js 16
- React 19
- TypeScript
- Drizzle ORM
- Neon Postgres
- Zod
- Motion
- Tailwind CSS v4
- Vercel AI SDK / OpenAI
- QR code generation

## Slide 10 — Key Technical Highlights
- State machine có luật rõ.
- Service validates lại.
- Fallback fixture an toàn.
- Event push tách lớp.
- Mask dữ liệu nhạy cảm.
- Upsell deterministic.

## Slide 11 — Demo Scenario
1. Mở landing page.
2. Nhắn món trong Messenger.
3. Chọn món, xác nhận, điền thông tin.
4. Thanh toán mock.
5. Theo dõi trạng thái đơn.

## Slide 12 — Current Progress
- Core service layer: READY.
- Route handlers: READY.
- Frontend pages: PARTIAL.
- Messenger integration: PARTIAL.
- Payment production integration: PLANNED.
- Build/config completeness: UNKNOWN.

## Slide 13 — Challenges and Solutions
- Messenger thật cần verify token, replay protection và dedupe.
- Payment thật cần signature, idempotency và reconcile.
- Đồng thời nhiều request có thể gây double transition.
- Fallback sang fixtures để demo không phụ thuộc DB live.

## Slide 14 — Roadmap
- Sau cuộc thi: agent turn, tool wrapper, webhook thật.
- MVP: admin/staff chuyển từ mock sang live.
- Production: payment webhook, retry, alarm, observability.
- Mở rộng: store-aware routing, loyalty thật, thêm kênh chat.

## Slide 15 — Business Value / Impact
- Đặt món nhanh hơn, tự nhiên hơn.
- Trải nghiệm rõ ràng hơn cho khách.
- Dữ liệu vận hành tập trung hơn.
- Nền tảng tốt cho upsell, loyalty và mở rộng chi nhánh.

## Slide 16 — Closing
- LLM lo hội thoại.
- Service layer lo tiền và trạng thái.
- UI lo trình bày.
- Roadmap lo con đường sang production.
- Team GOKU: Sơn Phước Lộc, Lê Hữu Bảo, Nguyễn Trọng Hùng, Nguyễn Anh Tuấn, Nguyễn Đức Thịnh.
