# 🍗 KFC Ordering Agent — AABW 2026 (F&B Track, KFC Vietnam)

LLM agent đặt hàng KFC bằng tiếng Việt qua Facebook Messenger: tư vấn menu → chọn món → upsell theo ngữ cảnh → xác nhận → giao hàng → thanh toán → tracking realtime → cảm ơn.

## Bắt đầu (5 phút)

```bash
cp .env.example .env.local   # xin giá trị thật từ Lead
npm install
npm run dev                  # localhost:3000
```

## ĐỌC TRƯỚC KHI CODE (theo thứ tự, ~10 phút)

1. [docs/codebase-summary.md](docs/codebase-summary.md) — kiến trúc + bản đồ thư mục + ownership
2. [docs/code-standards.md](docs/code-standards.md) — quy tắc 1 trang
3. [docs/api-contract.md](docs/api-contract.md) — contract routes + agent tools

Việc của bạn: grep tag của mình — `TODO(Dev A)` / `TODO(Dev B)` / `TODO(Dev C)` / `TODO(Lead)`.

Plan tổng: [plans/260709-1803-aabw-kfc-fnb-hackathon/plan.md](plans/260709-1803-aabw-kfc-fnb-hackathon/plan.md)
