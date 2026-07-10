# Codebase Summary — đọc file này trước khi code

## Sản phẩm
**KFC Ordering Agent** — LLM agent đặt hàng tiếng Việt qua Facebook Messenger (AABW 2026, problem P4 của KFC Vietnam). Flow: tư vấn → chọn món → upsell → xác nhận → địa chỉ+SĐT → thanh toán (COD/QR mock) → tracking push → cảm ơn. Deadline nộp: **8:30 sáng 12/7**.

## Kiến trúc 1 câu
**State machine (DB) quản tiền và trạng thái; LLM (OpenAI qua Vercel AI SDK) chỉ quản hội thoại** — tools bị giới hạn theo state (agent-tools-by-state), service validate lần 2 (order-service).

```
Messenger webhook ──> queue/lock/dedupe ──> ordering-agent-core (LLM + tools theo state)
                                                    │ tools gọi thẳng ↓
/staff /admin /order /pay (FE) ──HTTP──> api routes ──> src/lib/services (BỘ NÃO DUY NHẤT) ──> Neon DB
                                                    │
                        order-status-events ──> notification-sender ──> push Messenger
```

## Bản đồ thư mục
```
src/lib/types.ts            ← types + zod, NGUỒN SỰ THẬT (Lead)
src/lib/db/                 ← schema Drizzle + client Neon (Dev A)
src/lib/services/           ← menu, cart, order (state machine), voucher, loyalty, upsell, payment, events (Dev A)
src/lib/agent/              ← agent core, tools-by-state, system prompt VI, session store, queue (Dev B)
src/lib/channels/           ← messenger-adapter (Send API), notification-sender (Dev B)
src/app/api/webhooks/       ← webhook Messenger — hiện là ECHO, Dev B thay bằng agent (Lead + Dev B)
src/app/api/                ← menu ✅ / payment / admin routes (Dev A)
src/app/{staff,admin}/      ← console + dashboard (Dev C)
src/app/{order,pay}/[id]    ← tracking + payment page (Dev C)
src/fixtures/               ← menu-sample.json (12 món mẫu — Dev A mở rộng ~60 món)
scripts/                    ← seed, mock POS, co-occurrence, eval harness, reset demo
docs/api-contract.md        ← contract routes + tools (ĐỌC TRƯỚC KHI CODE)
docs/code-standards.md      ← quy tắc 1 trang (ĐỌC TRƯỚC KHI CODE)
```

## Trạng thái hiện tại (10/7)
- ✅ Chạy được ngay: `GET /api/menu` (fixtures), webhook echo, send text/typing/order-update qua Messenger, order-status event hub, system prompt VI, TOOLS_BY_STATE map, VALID_TRANSITIONS map.
- 🔨 TODO có chữ ký sẵn: grep `TODO(Dev A)`, `TODO(Dev B)`, `TODO(Dev C)`, `TODO(Lead)` — mỗi người grep tag của mình là ra hết việc.

## Nguyên tắc phối hợp
1. Không sửa file ngoài vùng ownership (xem code-standards.md).
2. Bị block bởi service chưa xong? Code trước trên fixtures/stub — chữ ký hàm đã freeze.
3. Đổi types/contract → qua Lead.
4. `npm run build` pass rồi mới push. Main phải luôn deploy được.
