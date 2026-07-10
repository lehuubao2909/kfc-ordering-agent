# Đánh giá đề bài, cuộc thi & ý tưởng — AABW 2026 F&B Track (KFC Vietnam)

> Report ngày 09/07/2026 18:00. Nguồn: game plan gốc (`../260709-1803-aabw-kfc-fnb-hackathon/research/original-game-plan.md`) + portal aitalent.genaifund.ai + event page agenticaibuildweek.genaifund.ai (fetch 09/07).

## 1. Facts mới từ portal (thay đổi cách lập kế hoạch)

| Fact | Nguồn | Hệ quả |
|---|---|---|
| Lịch: 8–10/7 workshops only; **11/7 Official Kick-Off + build overnight**; 12/7 Demo Day | Event page | Khung "2 ngày 2 đêm, đầu ít việc" của team khớp chính xác lịch thật. 10/7 = prep; 11/7 + đêm = sprint |
| **Deadline nộp: 9:00 sáng 12/7, qua portal. Sau 9:00 không được review** | Event page | Phải nộp trước 8:30, freeze content trước 8:00. Đêm 11/7 là final stretch, không phải "buffer" |
| Pitch Round 1: **3 phút + 1 phút Q&A** (song song theo track). Round 2 (top 5/track): **7 phút + 3 phút Q&A** | Event page | Cần 2 phiên bản pitch. Round 1 quá ngắn để giám khảo quét QR tự đặt hàng → demo video/live siêu gọn; màn "giám khảo tự đặt trên điện thoại" để dành Round 2 |
| Tiêu chí: **production-readiness, not just demo quality** — technical implementation, chất lượng giải pháp, khả thi triển khai thật, business impact, pitch clarity | Event page | Ưu tiên: deployed URL thật, error handling, kiến trúc tích hợp OMS/loyalty rõ, guardrails, README + diagram trong repo |
| Kick-Off 11/7: **meet enterprises** (KFC có mặt) | Event page | Cơ hội vàng: hỏi trực tiếp KFC (kiosk platform, POS, API, ưu tiên P2/P4) → cite trong pitch |
| **Bonus prizes từ technology partners** khi dùng tool cụ thể | Event page | Xác nhận AWS Bedrock double-dip đúng. Check thêm partner khác tại kick-off |
| Prize chi tiết công bố tại Kick-Off 11/7 | Event page | Không ảnh hưởng plan |

Chưa xác minh được (portal cần login): rubric có trọng số, format nộp (video? repo?), quy định code trước kick-off. → Việc #1 tối nay: đọc Guide trong portal.

## 2. Đánh giá lựa chọn track & problem: GIỮ NGUYÊN — đúng

- F&B 4 PS, ít cạnh tranh trực diện; KPI định lượng (AOV +10–15%); demo trực quan → lập luận vững.
- Bỏ P1 (hạ tầng nặng: Entra ID, chữ ký số, kế toán legacy) và P3 (MAPE ≤10% không chứng minh được với mock data): đúng. Giữ cả 2 làm slide roadmap.
- Ghép P2+P4 chung 1 engine: đúng — chung menu catalog, context, logic gợi ý. Câu chuyện platform mạnh hơn 2 sản phẩm rời.

## 3. Đánh giá ý tưởng "1 engine — 3 điểm chạm": GIỮ CORE, 7 điểm cần sửa

1. **Thiếu lớp "agentic" — rủi ro lớn nhất.** Plan gốc: "rule-based context + ranking đơn giản là đủ". Cuộc thi tên là *Agentic AI* Build Week, tiêu chí có "technical implementation" — chatbot scripted intent sẽ thua. Sửa: chatbot = **LLM agent tool-calling thật** (get_menu, add_to_cart, apply_voucher, get_loyalty, checkout, handoff). Recommendation engine giữ deterministic (rules daypart + co-occurrence từ mock POS + promo boost) — giải thích được, không hallucinate giá; LLM chỉ điều phối hội thoại + diễn đạt gợi ý. Hybrid này vừa "agentic" vừa production-credible.
2. **AWS double-dip được nhắc nhưng không có action.** Sửa: LLM chạy qua **AWS Bedrock (Claude)** → "AWS AI/ML as core component" gần như miễn phí. Xin model access ngay tối nay (có thể chờ duyệt). Fallback: bất kỳ LLM tool-calling nào; không để chặn critical path.
3. **Lịch 24h liên tục ≠ thực tế.** Thực tế: 10/7 ít việc (workshop) + đêm 10; 11/7 kick-off → đêm 11 → deadline 9:00 sáng 12/7. Sửa: mọi việc chờ-bên-thứ-ba và ít-năng-lượng (FB App + webhook echo, Zalo OA, Bedrock access, crawl menu, API contract, scaffold + deploy skeleton) dồn hết vào 10/7; 11/7 chỉ còn build thuần.
4. **Zalo để "tuỳ tình trạng OA" = quyết định treo.** OA duyệt 1–3 ngày, còn 2 ngày. Sửa: chốt ngay tối nay — nếu team chưa có OA đã duyệt → **mock UI** (web chat widget skin Zalo, dùng chung agent). Web chat widget đằng nào cũng cần làm để test agent → skin Zalo gần như 0 giờ công.
5. **Màn "AOV trước/sau" trên mock data dễ bị bắt bẻ ở Q&A.** Sửa: đổi thành **backtest replay** minh bạch: replay mock transactions qua engine, đo uplift giả định với disclaimer; con số 10–15% cite từ chính ước tính của KFC trong đề. Trung thực = ăn điểm production-readiness.
6. **Tunnel (ngrok) lúc demo = rủi ro vô ích.** Sửa: deploy backend + webhook lên URL public (Vercel) từ 10/7; tunnel chỉ dùng dev local. Demo chạy trên production URL + 4G hotspot dự phòng wifi venue.
7. **Pitch chưa khớp format 2 vòng.** Sửa: Round 1 (3'): hook 20s → problem 30s → demo 90s (video dự phòng quay sẵn) → impact + roadmap 40s. Round 2 (7'): demo live giám khảo quét QR đặt hàng thật qua Messenger + time-travel kiosk + kiến trúc + business case + roadmap P1/P3.

## 4. Điểm mạnh giữ nguyên

- Definition of Done = 1 kịch bản demo duy nhất; mọi cắt scope quy về "có phục vụ kịch bản không".
- Messenger kết nối THẬT (dev mode, không cần app review) là differentiator chính.
- Kiosk web app thuần = chắc chắn hoàn thành. Thêm demo trick: **time-travel slider** (kéo giờ 8h→12h→20h, gợi ý đổi live) — thể hiện context-awareness trong 15 giây.
- Mock loyalty/voucher/OMS API có schema giống thật → khớp tiêu chí "feasibility of real-world deployment".
- Video demo dự phòng + 20% buffer cuối.

## 5. Business impact (chuẩn bị cho pitch)

Công thức cho slide (điền số thật nếu KFC confirm tại kick-off): `Uplift/năm = Số đơn kiosk/tháng × AOV × 10–15% × 12`. Ví dụ thận trọng: 2M đơn kiosk/tháng × 100k VND × 10% = **+20 tỷ VND/tháng GMV tăng thêm**. Chi phí vận hành engine ~vài chục triệu/tháng → ROI hiển nhiên. Cộng thêm P4: thu hồi conversion từ khách high-intent trong chat (hiện 100% manual).

## 6. Kết luận

Ý tưởng gốc tốt (7/10), sau chỉnh đạt ~9/10 về độ khớp tiêu chí chấm. Thay đổi cốt lõi: (a) thêm lớp agentic thật bằng LLM tool-calling qua Bedrock, (b) re-sequence theo lịch thật 10–12/7, (c) chốt Zalo = mock ngay, (d) deploy public sớm, (e) pitch 2 phiên bản 3'/7'. Plan chi tiết: `plans/260709-1803-aabw-kfc-fnb-hackathon/plan.md`.

## Unresolved questions

1. Portal Guide (cần login): rubric trọng số? Format nộp (video bắt buộc? độ dài? repo public?)? Quy định về code viết trước Kick-Off 11/7?
2. Team đã có Zalo OA duyệt sẵn chưa? (quyết định Gate 1)
3. Team có AWS account + Bedrock access chưa? Region nào có Claude?
4. KFC menu crawl: kfcvietnam.com.vn có chặn bot không? (fallback: nhập tay ~40 món chủ lực)
5. Số liệu thật cho slide ROI: chờ hỏi KFC tại Kick-Off 11/7.
