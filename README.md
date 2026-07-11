# 🍗 KFC Ordering Agent

**AI agent đặt hàng KFC bằng tiếng Việt qua Facebook Messenger** — khách trò chuyện tự nhiên, agent tư vấn menu, gợi ý món theo ngữ cảnh, chốt đơn, thanh toán và cập nhật giao hàng theo thời gian thực.

> Bài dự thi **Agentic AI Build Week 2026** (GenAI Fund) · Track **"F&B powered by KFC"** · Problem 4: **"AI-powered conversational ordering via chat"** · Team **GOKU**

---

## 🔗 Demo & liên kết

| | URL |
|---|---|
| 🌐 Landing + QR đặt hàng | https://kfc-ordering-agent.vercel.app |
| 💬 Chat với agent | Nhắn page **AABW GOKU DEMO** trên Messenger *(app ở Development Mode — tài khoản cần role Tester)* |
| 📊 Admin dashboard | `/admin` — funnel, AOV uplift, upsell acceptance, NLU eval, đơn live |
| 🧑‍💼 Staff console | `/staff` — hội thoại + **nhật ký quyết định của agent**, tiếp quản chat, chuyển trạng thái đơn |
| 🎞️ Pitch deck (web) | `/presentation` — ←/→ chuyển slide · F fullscreen |
| 📄 Pitch deck (PDF nộp) | [`/kfc-ordering-agent-slides.pdf`](https://kfc-ordering-agent.vercel.app/kfc-ordering-agent-slides.pdf) — 7 trang, kết thúc ở Thanks |
| 🔒 Privacy policy | `/privacy-policy` |

*`/admin` và `/staff`: form đăng nhập đã **điền sẵn tài khoản demo** (**kfc / demo2026**) — chỉ cần bấm "Vào trang quản trị". Đổi credentials: env `ADMIN_BASIC_AUTH` + `NEXT_PUBLIC_DEMO_ADMIN_AUTH`.*

## ✨ Vì sao đây là agent, không phải chatbot

- **Vòng lặp đa bước có kế hoạch** — mỗi lượt chat, agent tự quyết chuỗi tool (tối đa 6 bước): resolve cửa hàng → phát hiện món hết → đổi kế hoạch, quay lại gợi ý món thay.
- **14 tools khoá theo 11 trạng thái đơn** — chưa xác nhận đơn thì tool thanh toán không tồn tại với LLM; service layer validate lần hai. *LLM giữ hội thoại, state machine giữ tiền.*
- **Nhật ký quyết định hiển thị** — mỗi lượt agent chạy, staff console hiện: `🔧 Thêm vào giỏ (Gà Giòn Cay ×2) → Lưu địa chỉ · chọn cửa hàng (KFC Nguyễn Trãi) → Tạo đơn & thanh toán (KFC-0009 · tiền mặt)`.
- **Store-aware** — route đơn về đúng cửa hàng theo địa chỉ (match quận, không cần geocoding), check giờ mở cửa + tồn món per-store trước khi nhận đơn.
- **Upsell deterministic** — daypart + co-occurrence đếm từ 4.964 giao dịch POS mô phỏng + gợi ý theo ngưỡng voucher ("thêm 11k nữa là freeship, lợi 20k") — không LLM trong đường tính tiền.
- **Human oversight** — khiếu nại/nhạy cảm → chuyển nhân viên; staff tiếp quản 1 nút; khách luôn biết đang nói chuyện với bot hay người.
- **Đo được** — eval suite 26 kịch bản tiếng Việt (có case bẫy): **26/26**.

## 🏗️ Kiến trúc

```
Khách (Messenger) ──► Webhook /api/webhooks/messenger        Staff console /staff ◄── polling
                      verify chữ ký · dedupe · lock · queue   Admin dashboard /admin
                            │                                        │
                            ▼                                        ▼
                      Agent core (OpenAI · Vercel AI SDK)      API routes (Basic auth)
                      14 tools khoá theo trạng thái                  │
                            │ gọi thẳng hàm (không HTTP nội bộ)      │
                            ▼                                        ▼
                      Service layer (TypeScript thuần) ────────────────
                      order state machine · store · voucher · loyalty · upsell
                            │
                            ▼
                      Neon Postgres (toàn bộ state — serverless stateless)
```

**Stack:** Next.js 16 (App Router) · TypeScript · Neon Postgres + Drizzle · Vercel AI SDK + OpenAI · Vercel deploy. Lõi nghiệp vụ là module TS thuần không dính framework — đóng container vào hạ tầng doanh nghiệp ≈ 1 ngày.

## 🚀 Chạy local

```bash
git clone https://github.com/lehuubao2909/kfc-ordering-agent && cd kfc-ordering-agent
cp .env.example .env.local   # điền giá trị thật (bảng dưới)
npm install
npm run db:push && npm run seed && npm run mock-pos && npm run co-occurrence
npm run dev                  # http://localhost:3000
```

| Biến env | Vai trò |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string |
| `OPENAI_API_KEY` · `OPENAI_MODEL` | LLM cho agent (đang dùng `gpt-5.4`) |
| `MESSENGER_VERIFY_TOKEN` · `MESSENGER_PAGE_ACCESS_TOKEN` · `META_APP_SECRET` | Webhook + Send API Messenger — xem [docs/messenger-webhook-setup-guide.md](docs/messenger-webhook-setup-guide.md) |
| `ADMIN_BASIC_AUTH` | `user:pass` cho `/admin`, `/staff` |
| `NEXT_PUBLIC_APP_URL` · `NEXT_PUBLIC_MESSENGER_URL` | Link tracking/thanh toán trong chat · QR landing |

**Scripts hữu ích:** `npm run eval` (NLU eval 26 case, ghi `src/fixtures/eval-results.json`) · `npm run reset-demo` (dọn data demo, giữ catalog) · `npx tsx scripts/smoke-test-services.ts` (25 test service) · `npx tsx scripts/smoke-test-store-resolution.ts` · `npx tsx scripts/smoke-test-session-heal.ts` · `bash scripts/export-slides-pdf.sh` (xuất lại 2 PDF deck: bản nộp + bản nội bộ).

## 📚 Tài liệu

**Kỹ thuật ([docs/](docs/)):** [codebase-summary](docs/codebase-summary.md) — kiến trúc + bản đồ thư mục · [api-contract](docs/api-contract.md) — routes, agent tools, state machine · [database-schema](docs/database-schema.md) — 11 bảng + fixtures · [code-standards](docs/code-standards.md) — quy ước + git workflow · [backend-architecture](docs/backend-architecture.md) · [payment-production-plan](docs/payment-production-plan.md) · [messenger-webhook-setup-guide](docs/messenger-webhook-setup-guide.md).

**Thuyết trình & nộp bài:**

| Cần gì | Ở đâu |
|---|---|
| Slide trình chiếu (18 trang: 7 deck chính + A1–A8 + Q&A prep · tiếng Anh, nội dung theo bản của thành viên thuyết trình) | [`/presentation`](https://kfc-ordering-agent.vercel.app/presentation) · nguồn: `src/components/presentation/` |
| PDF **nộp BTC** (7 trang deck chính, kết thúc ở Demo + Thanks) | [`public/kfc-ordering-agent-slides.pdf`](public/kfc-ordering-agent-slides.pdf) |
| PDF **nội bộ** (full 18 trang: + appendix A1–A8 + Q&A prep) | [`public/kfc-ordering-agent-slides-internal-qa.pdf`](public/kfc-ordering-agent-slides-internal-qa.pdf) |
| Kịch bản pitch 5' + Q&A drill 9 câu + checklist nộp portal từng field | [plans/…/phase-05](plans/260709-1803-aabw-kfc-fnb-hackathon/phase-05-integration-demo-pitch-submission.md) |
| Phân tích đề bài, rubric, lý do chọn P4 | [plans/reports/analysis…](plans/reports/analysis-260709-1803-aabw-kfc-evaluation.md) |
| Số liệu evidence (eval, backtest) | `src/fixtures/eval-results.json` · `src/fixtures/funnel-backtest.json` |
| Nhật ký kỹ thuật (bug tìm-và-fix — nội dung slide A4) | [docs/journals/](docs/journals/) |

## 👥 Quy trình team

4 người · ownership theo thư mục (Lead: contract/types/merge · Dev A: services/data · Dev B: agent/channels · Dev C: frontend) · branch-per-dev, Lead merge vào `main` (auto-deploy Vercel) · mọi thay đổi agent phải qua eval trước khi push.

## ⚠️ Disclosure

Sản phẩm hackathon xây trong khuôn khổ AABW 2026: dữ liệu menu/cửa hàng/POS là **synthetic** (theo hướng dẫn BTC khi chưa có data doanh nghiệp); thanh toán là **mock minh bạch** (production = webhook VNPay/MoMo); kế hoạch và scaffold khung dự án được chuẩn bị từ 09–10/07 trước Kick-Off và khai báo theo yêu cầu. Thương hiệu "KFC" thuộc chủ sở hữu tương ứng, sử dụng trong phạm vi trình diễn cuộc thi.
