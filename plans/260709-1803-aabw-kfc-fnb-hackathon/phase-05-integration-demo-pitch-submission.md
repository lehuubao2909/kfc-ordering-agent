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

## Pitch

**Round 1 (3' + 1' Q&A):**
- 0:00–0:20 Hook: ảnh fanpage KFC tin nhắn khách chờ — "hôm nay, 100% trả lời tay".
- 0:20–0:50 Problem (đề bài): khách high-intent ở sẵn trong chat nhưng phải rời app để đặt → mất chuyển đổi; KFC xác nhận có API.
- 0:50–2:20 **Video 90"**: đặt hàng tiếng Việt → upsell → QR thanh toán → push trạng thái → handoff nhân viên → admin funnel.
- 2:20–3:00 KPI khớp đề (completion, NLU 18/20, voucher, loyalty) + kiến trúc 1 slide + roadmap (kiosk P2 cùng engine, VNPay/MoMo, Zalo cùng adapter).

**Round 2 (7' + 3' Q&A):** live toàn bộ — giám khảo quét QR **tự đặt trên điện thoại họ** (Người 2 hỗ trợ), staff console advance status → push nổi lên máy giám khảo (khoảnh khắc mạnh nhất), handoff live, admin live; slide kiến trúc sâu (state machine + LLM hybrid, guardrails, per-user lock/queue, message tags); business case; roadmap.

**Q&A drill:**
1. "Mock data chứng minh gì?" → Kiến trúc thật + Messenger thật + payment/OMS là contract sẵn; pilot chỉ là đổi endpoint.
2. "Sao không chọn P2 kiosk?" → P4 đúng chủ đề Agentic AI nhất + hiện trạng 100% manual nên impact rõ nhất; engine upsell trong bot chính là lõi P2 — roadmap.
3. "Agent bịa giá/món thì sao?" → State-gated tools + service validate + giá chỉ từ DB; eval suite 20 câu có case bẫy.
4. "Scale bao nhiêu khách?" → Stateless serverless + state trong Postgres + per-conversation lock/queue → hàng nghìn hội thoại song song; bottleneck là rate limit LLM, giải bằng queue + model tier.
5. "Thanh toán thật?" → Mock minh bạch có chủ đích; tích hợp VNPay/MoMo/ZaloPay là webhook chuẩn, 1–2 ngày.
6. "Ngoài 24h window Messenger cấm nhắn?" → Đã dùng POST_PURCHASE_UPDATE tag đúng policy cho order update.
7. "Chi phí LLM/đơn?" → ~X đ/hội thoại (điền số từ eval run); rẻ hơn nhiều phút nhân viên.
8. "Zalo đâu?" → Cùng agent core, chỉ thêm adapter webhook; Messenger thật đã chứng minh pattern.

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
