# Phase 05 — Integration, Demo, Pitch & Submission (đêm 11/7 → Demo Day 12/7 · Cả team)

## Context Links

- [plan.md](plan.md) (DoD + kịch bản demo) · Phases 02–04

## Overview

- **Priority:** CRITICAL
- **Status:** Blocked by Phases 02–04
- Từ 22:00 đêm 11/7: **FEATURE FREEZE**. Chỉ còn: kịch bản demo, video, slides, nộp bài, ngủ theo ca.

## Timeline đêm 11/7 → sáng 12/7

| Giờ | Việc | Ai |
|---|---|---|
| 22:00–00:00 | Chạy kịch bản DoD end-to-end ×5 (cả nhánh COD lẫn QR), fix bug THEO KỊCH BẢN | Cả 4 |
| 00:00–01:00 | `reset-demo-data` chạy sạch; chạy lại ×2; test 2 khách nhắn song song | Người 1+2 |
| 00:00–02:00 | **Quay video demo ≤2'** (đặt hàng → push trạng thái → handoff → admin), thuyết minh | Người 4+3 |
| 02:00–04:00 | Slides final 2 bản (3'/7') · README + architecture diagram vào repo | Người 4 (+1) |
| 02:00–05:00 / 04:00–06:30 | Ngủ ca 1 (Người 2,3) / ca 2 (Người 1,4 — Người 4 pitch, ưu tiên ngủ đủ) | Chia ca |
| 06:30–07:30 | Rehearsal ×3 bản 3' bấm giờ + 1 lần bản 7' · Q&A drill | Cả 4 |
| 07:30–08:00 | Build production cuối + smoke test, KHÔNG đụng code nữa | Người 1 |
| **08:00–08:30** | **NỘP PORTAL** + screenshot xác nhận | Người 4 |
| 08:30–09:00 | Setup booth: điện thoại, QR standee, hotspot 4G test, máy chiếu | Cả 4 |

## Pitch (CẬP NHẬT 11/7 chiều theo Pitching Guide chính thức)

**Round 1 = 8' total: 5' pitch + 2' Q&A + 1' chuyển tiếp. Round 2 = 12'. Rehearse tới 4:45.**
Lịch Demo Day: 09:00 check-in (BẮT BUỘC ≥1 người, vắng = loại) · 10:15–12:15 R1 · 13:15 R2 (top 5) · 14:45 Finals (top 1) · 16:00 Awards.

**Deck 6 slides theo guide (Five-Minute Map):**
1. **0:00–0:40 TEAM + PROMISE:** "Với khách KFC đang chat sẵn trên Messenger, chúng tôi biến hội thoại thành đơn hàng hoàn chỉnh bằng AI agent tự lập kế hoạch và hành động." + credibility line team.
2. **0:40–1:20 PROBLEM INSIGHT:** "We discovered..." không lặp brief — insight: khách high-intent NHẮN TIN trước khi mở app; hiện 100% trả lời tay → nghẽn ở tốc độ người trực page. 1 insight > 5 số liệu.
3. **1:20–2:20 AGENTIC WORKFLOW (slide sống còn):** Goal → Plan → Tools → Act → Verify trên flow thật: khách nhắn → agent chọn tool (14 tools state-gated) → resolve cửa hàng/tồn kho → verify bằng service layer → tạo đơn. **Chiếu tool-trace 🔧 trên staff console làm bằng chứng thị giác** — "đây không phải chatbot trả lời, đây là agent hành động".
4. **2:20–3:05 WHY IT WINS:** state machine giữ tiền + LLM giữ hội thoại (không bịa giá) · store-aware 250 cửa hàng · handoff người thật · dịch mọi feature sang giá trị: "khách chốt đơn trong chat chưa đầy 2 phút, không cần app".
5. **3:05–3:50 EVIDENCE + IMPACT (dán nhãn level trung thực theo guide):** Level 2 Benchmark: **eval 24/24 NLU tiếng Việt** (có case bẫy chống bịa) · Level 1 Assumption (ghi rõ): AOV +2.7% backtest thận trọng, KFC ước tính 10–15% · công thức ROI.
6. **3:50–4:50 DEMO 60" theo storyline guide:** Goal (khách đói nhắn tin) → Trigger → Agent Acts (chiếu song song điện thoại + staff console tool-trace) → Outcome (mã đơn + push) → Proof (admin funnel). KHÔNG show login/setup. Kết ở outcome khách.

**Q&A 2': dùng chiến thuật guide — "Cho phép em gom câu hỏi trước ạ?" (0:20 gom, 1:20 trả lời theo nhóm).**
Công thức mỗi câu (15–25s): **Answer** (kết luận trước) → **Support** (1 fact: eval 24/24, tool-trace, state machine) → **Connect** (về giá trị khách/KFC). Bị hỏi thứ chưa có: "chưa validated — cái chúng tôi biết là X, sẽ test bằng Y ở pilot."

**Appendix slides A1–A8 (Playbook trang 17 — Round 2/Q&A, "answer first, appendix là bằng chứng"):**
A1 Agentic workflow (Goal→Plan→Tools→Act→Verify trên flow thật + ảnh tool-trace) · A2 Technical architecture (1 sơ đồ: Messenger → agent state-gated → services → DB; "architecture is evidence, not the main character") · A3 Safety + human oversight (guardrails giá-từ-DB, validate 2 lớp, handoff, mask SĐT, 24h policy) · A4 User research (transcript test thật + các bug tìm được & fix — thành thật là điểm cộng) · A5 ROI calculation (công thức + assumptions dán nhãn) · A6 Alternatives (vì sao không rule-bot/không general assistant) · A7 Evaluation results (24/24, có case bẫy) · A8 Roadmap + limitations (per-store menu overlay, distance API, VNPay webhook, Recurring Notifications opt-in, blacklist bom hàng).

**Bài tập 6 câu 1-dòng (cả team, 15'):** mỗi tiêu chí rubric 1 câu thuộc lòng — đặc biệt Difference: "General assistant không cầm được tiền — state machine + tools khoá theo bước nên LLM không bao giờ tự quyết giá/đơn."

**Round 2 (12'):** mở rộng — giám khảo quét QR tự đặt trên điện thoại họ (Người 2 hỗ trợ), staff advance → push nổi máy giám khảo, handoff live, kiến trúc sâu, business case, roadmap P2 kiosk/P1/P3.

## Checklist NỘP PORTAL (mỗi field = 1 mục thật trên form)

- [ ] **Track confirmation** — deadline 15:00 11/7 (⚠️ VERIFY NGAY, miss = không được chấm)
- [ ] Demo URL: test **incognito** ngay trước khi nộp (landing phải tự giải thích; ghi creds admin demo vào description/README)
- [ ] **Repo chuyển PUBLIC** + README hướng dẫn chạy đầy đủ + rà secrets lần cuối trước khi flip
- [ ] **3–5 screenshots tỷ lệ 3:2** (chat đặt hàng, tool-trace staff console, admin funnel, tracking page, /pay)
- [ ] **Video 2–3 phút** product working (KHÔNG narrate slides) — dùng luôn làm video backup R1
- [ ] **Partner tools**: tick đúng những gì THẬT SỰ dùng (OpenAI, Vercel, Neon nếu có trong list) + mô tả cụ thể vai trò từng tool
- [ ] Official Rules checkbox (đọc rồi mới tick) · Public visibility checkbox · Review màn final trước khi confirm
- [ ] Phân công người check-in on-site 09:00 sáng 12/7

**Q&A drill:**
1. "Mock data chứng minh gì?" → Kiến trúc thật + Messenger thật + payment/OMS là contract sẵn; pilot chỉ là đổi endpoint.
2. "Sao không chọn P2 kiosk?" → P4 đúng chủ đề Agentic AI nhất + hiện trạng 100% manual nên impact rõ nhất; engine upsell trong bot chính là lõi P2 — roadmap.
3. "Agent bịa giá/món thì sao?" → State-gated tools + service validate + giá chỉ từ DB; eval suite 20 câu có case bẫy.
4. "Scale bao nhiêu khách?" → Stateless serverless + state trong Postgres + per-conversation lock/queue → hàng nghìn hội thoại song song; bottleneck là rate limit LLM, giải bằng queue + model tier.
5. "Thanh toán thật?" → Mock minh bạch có chủ đích; tích hợp VNPay/MoMo/ZaloPay là webhook chuẩn, 1–2 ngày.
6. "Ngoài 24h window Messenger cấm nhắn?" → Đã dùng POST_PURCHASE_UPDATE tag đúng policy cho order update.
7. "Chi phí LLM/đơn?" → ~X đ/hội thoại (điền số từ eval run); rẻ hơn nhiều phút nhân viên.
8. "Zalo đâu?" → Cùng agent core, chỉ thêm adapter webhook; Messenger thật đã chứng minh pattern.
9. "Next.js làm backend — production/scale được không?" → Next chỉ là vỏ HTTP; lõi là module TS thuần stateless, state trong Postgres. Tải chat 250 cửa hàng (vài chục event/s giờ đỉnh) serverless scale ngang tự động; bottleneck thật là LLM rate limit + DB connection (đã có queue + pooling, không phụ thuộc framework). Cần vào hạ tầng KFC (Azure) → đóng container, thay lớp route mỏng ~1 ngày, services không đổi dòng nào.

## Todo List

- [ ] 22:00 công bố freeze
- [ ] Kịch bản DoD pass ×5 (cả COD + QR) + test song song 2 khách
- [ ] Video ≤2' xong trước 02:00
- [ ] Slides 3'/7' + README + diagram
- [ ] Rehearsal ×3 + Q&A drill
- [ ] **Nộp portal trước 08:30 + screenshot**
- [ ] Booth setup + hotspot test

## Success Criteria

Nộp xác nhận trước 8:30. Round 1 đúng 3' không tràn. Demo không chết trên sân khấu (video backup 1 click trong slide).

## Risk Assessment

| Rủi ro | Mitigation |
|---|---|
| Wifi venue chết | Hotspot 4G test sẵn; production URL; video offline trong slide |
| Nộp portal lỗi phút chót | Nộp 8:00, screenshot từng bước |
| Bug mới 7:00 sáng | Ngoài kịch bản → không sửa; trong kịch bản → sửa tối thiểu + retest toàn kịch bản |
| Người pitch kiệt sức | Người 4 ngủ ca ưu tiên; script in giấy |

## Next Steps

Vào top 5 → Round 2 live full. Sau event: KFC quan tâm → repo đã có README + contract làm tài liệu handover.
