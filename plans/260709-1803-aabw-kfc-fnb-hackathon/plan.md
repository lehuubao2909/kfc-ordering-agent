# Plan: AABW 2026 — F&B Track — P4 "KFC Ordering Agent" (Messenger)

> LLM agent đặt hàng tiếng Việt end-to-end trên Facebook Messenger: tư vấn → chọn món → upsell → xác nhận → giao hàng → thanh toán → tracking → cảm ơn. Nộp portal **trước 8:30 sáng 12/07**.

- Đánh giá đề & ý tưởng: [analysis report](../reports/analysis-260709-1803-aabw-kfc-evaluation.md) · Game plan gốc: [research/original-game-plan.md](research/original-game-plan.md)

## Decision log (chốt qua debate 09–10/07)

1. BTC yêu cầu chọn **1 problem** → chốt **P4 Conversational Ordering**. P2 kiosk bỏ; upsell contextual giữ làm *feature trong hội thoại*; roadmap slide: "cùng engine cắm vào kiosk = P2".
2. LLM provider: **OpenAI** (credit sẵn) qua **Vercel AI SDK** — bỏ AWS Bedrock track. Model chọn bằng test transcript, config qua env `OPENAI_MODEL`.
3. Cắt hẳn: Zalo (kể cả mock), web chat widget, kiosk UI. Test agent bằng **CLI eval harness** (20 câu transcript — số pass thành metric "NLU accuracy" trên slide).
4. Không train gì: upsell = daypart rules + co-occurrence đếm từ mock POS. LLM chỉ ở tầng hội thoại. "GenAI ở chỗ cần ngôn ngữ, deterministic ở chỗ đụng tiền."
5. Kiến trúc: **hybrid state machine + LLM** — trạng thái đơn nằm DB, tools bị giới hạn theo state, service layer validate lần 2.

## Order flow (state machine)

```
KHÁM PHÁ → GIỎ HÀNG → XÁC NHẬN → GIAO HÀNG → THANH TOÁN → ĐÃ ĐẶT → CHUẨN BỊ → ĐANG GIAO → HOÀN TẤT
 menu card   thêm/bớt,   đọc lại đơn  địa chỉ+SĐT   COD: chốt      mã đơn     push        push + ETA   cảm ơn +
 tư vấn,     size/SL,    + tổng +     (loyalty tự   QR/thẻ: link   + ETA                               chúc ngon
 ưu đãi      upsell ×1   auto voucher  nhận diện)    /pay → paid                                        miệng
```

Mọi lúc: hỏi trạng thái · sửa/huỷ đơn (trước CHUẨN BỊ) · câu ngoài phạm vi → handoff (agent mute, staff tiếp quản qua console, release trả lại bot).

## Definition of Done — kịch bản demo master

1. **Đặt hàng (2'):** khách nhắn "đói quá, có gì ngon?" → tư vấn + carousel menu ảnh thật → thêm 2 món → upsell theo giờ (khách nhận) → xác nhận đơn itemized → địa chỉ + SĐT → "anh có 1.250 điểm..." → chọn QR → trang /pay → paid → push "đã nhận thanh toán, 30–40 phút".
2. **Tracking + Handoff (60"):** "đơn tới đâu rồi?" → bot trả lời; staff console chuyển trạng thái → khách nhận push; khách hỏi câu lạ → handoff → staff gõ tay → release.
3. **Admin (30"):** funnel started→cart→confirmed→paid, upsell acceptance, NLU eval 18/20, đơn live.

Round 1 (3'): video nén 90". Round 2 (7'): live, giám khảo tự đặt trên điện thoại họ.

## Phases

| Phase | Thời gian | Người | Status |
|---|---|---|---|
| [01 — Unblock & Foundation](phase-01-unblock-and-foundation.md) | Hôm nay 10/7 + đêm | Cả 4 | 🟡 Scaffold ✅ (build pass) · webhook config đang làm (Lead) · còn: model test, seed mở rộng, đọc docs |
| [02 — Core Services & Data](phase-02-core-services-and-data.md) | 11/7 sáng→tối | Dev A | ⬜ Chữ ký hàm + schema sẵn, grep TODO(Dev A) |
| [03 — Agent + Messenger](phase-03-conversational-agent-messenger.md) | 11/7 sáng→tối | Dev B | ⬜ Prompt + tools map + adapter sẵn, grep TODO(Dev B) |
| [04 — Staff Console, Admin, Tracking & Pay](phase-04-staff-console-admin-tracking-frontend.md) | 11/7 sáng→tối | Dev C | ⬜ 5 trang skeleton sẵn, grep TODO(Dev C) |
| [05 — Integration, Pitch & Submission](phase-05-integration-demo-pitch-submission.md) | Đêm 11/7 → 8:30 sáng 12/7 | Cả 4 (Lead điều phối) | ⬜ |

## Mốc cứng & Gates

- **Gate 2 (trưa 10/7 — SỐNG CÒN):** webhook Messenger echo OK trên production URL. Fail không cứu được → họp khẩn, Plan B quay về P2.
- **Gate 3 (tối 10/7):** chọn `OPENAI_MODEL` qua 10 câu transcript. · **M1 (trưa 11/7):** đặt đơn end-to-end COD qua Messenger. · **M2 (15:00):** payment + tracking + push đủ. · **M3 (19:00):** staff console + admin đủ. · **Gate 4 (22:00 11/7): FEATURE FREEZE.** · **8:00–8:30 sáng 12/7: NỘP.**

## Phân công (CHỐT 10/7 — ownership theo thư mục, chỉ chủ sở hữu được sửa)

**Việc chỉ LEAD (bạn) làm — không chia:**
- Meta App + webhook config + tokens + Vercel env/deploy (✅ đang làm)
- Scaffold + `src/lib/types.ts` + `docs/api-contract.md` — mọi thay đổi contract/schema phải qua Lead (✅ scaffold xong 10/7, build pass)
- Review, merge, fix conflict — main luôn deploy được
- Integration QA: chạy kịch bản demo trên production từ chiều 11/7, phân loại bug "chặn/không chặn kịch bản"
- `scripts/reset-demo-data.ts`, nộp portal, điều phối pitch + hỏi KFC tại Kick-Off

**Chia độc lập cho 3 dev** (grep `TODO(Dev X)` trong code là ra hết việc, chữ ký hàm đã viết sẵn):

| Ai | Module sở hữu | Việc chính 11/7 |
|---|---|---|
| **Dev A — Services & Data** | `src/lib/services/**`, `src/lib/db/**`, `src/app/api/**` (trừ webhooks), scripts seed/POS/co-occurrence | Sáng: cart + order state machine + voucher/loyalty. Chiều: upsell engine + payment + admin API. Kèm: mở rộng menu ~60 món + mock POS |
| **Dev B — Agent & Channels** | `src/lib/agent/**`, `src/lib/channels/**`, `src/app/api/webhooks/**`, eval harness | Sáng: agent core + 14 tools + session/lock/queue, eval ≥18/20. Chiều: carousel/quick replies/receipt + status push + handoff |
| **Dev C — Frontend** | `src/app/**` pages, `src/components/**` | Sáng: /pay + /order (critical path). Chiều: /staff (takeover + advance status) + /admin 4 cards + landing QR. Tối: polish + video demo cùng Lead |

**Việc CẢ 4 cùng làm** (ngoài ra không họp): ① tối 10/7 — đọc docs 10' + review scaffold 15' ② 15:00 11/7 — integration check 30' (đặc biệt luồng staff advance → push) ③ 22:00 11/7 — freeze + chạy kịch bản ×5 ④ 6:30 sáng 12/7 — rehearsal pitch.

> Phase files viết trước khi chốt vai trò dùng tên cũ — remap: Người 1→Dev A, Người 2→Dev B, Người 3→Dev C, Người 4→(data → Dev A, pitch/QA/demo → Lead).

## Stack (chốt)

Next.js 15 App Router + TS, 1 repo · Neon Postgres + Drizzle (toàn bộ state trong DB — serverless stateless) · Vercel AI SDK + `@ai-sdk/openai` · Deploy Vercel (`maxDuration=60` cho webhook) · cloudflared chỉ dùng dev local.

## Rủi ro chính

| Rủi ro | Fallback |
|---|---|
| Webhook fail lúc demo | Production URL (không tunnel) + 4G hotspot + video backup xong trước 2:00 |
| LLM chậm/lỗi giữa demo | Typing indicator + retry 1 lần + câu xin lỗi graceful; prewarm; model đã test transcript |
| Khách nhắn dồn dập/2 người demo cùng lúc | Per-conversation lock + queue + dedupe (thiết kế sẵn phase 03) |
| Phình scope (reorder, pickup, voice...) | Stretch list riêng — chỉ đụng khi DoD xong trước 20:00 11/7 |
