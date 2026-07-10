# AABW 2026 — Kế hoạch Team: F&B Track (KFC Vietnam)

> Tài liệu tổng hợp toàn bộ thông tin cuộc thi, yêu cầu chi tiết của track/problem đã chốt, chiến lược và lộ trình thực thi 24h cho team 4 người.

---

## 1. Tổng quan cuộc thi

| Hạng mục | Thông tin |
|---|---|
| Tên sự kiện | **Agentic AI Build Week 2026 (AABW 2026)** |
| Đơn vị tổ chức | GenAI Fund |
| Địa điểm & thời gian | TP. Hồ Chí Minh · **8–12/07/2026** |
| Quy mô đề bài | **65 problem statements · 11 tracks** — toàn bộ là bài toán thật từ doanh nghiệp đối tác |
| Portal | aitalent.genaifund.ai (Event Hub / Hackathon / Tracks / Guide / Prizes / Leaderboard) |
| Ghi chú | Danh sách problem statement chính thức publish từ 01/07/2026; tạo project trên portal theo từng track |

**11 tracks & sponsor:** Financial Services II (GoTymeX) · Founder Mode (GenAI Fund) · Mobility (Tasco/VETC) · **F&B (KFC Vietnam)** · Aviation (Galaxy Holdings — free track) · Built with AWS (AWS — track cộng thêm) · Physical AI & Robotics (GenAI Fund) · Retail (Phong Vu) · Retail & Hospitality (Guardian/The Anam) · Gaming (VNG Games) · Financial Services I (Shinhan Future's Lab).

**Track "Built with AWS"** không phải track riêng — bất kỳ project nào dùng AWS AI/ML làm thành phần lõi (không chỉ hosting) đều auto-qualify thêm giải này. Có thể cân nhắc chèn 1 dịch vụ AWS AI/ML vào pipeline để "double-dip" giải thưởng.

---

## 2. Track đã chốt: F&B Track — KFC Vietnam

### Vì sao chọn F&B (kết luận từ quá trình phân tích)

- Track nhỏ (chỉ 4 problem statements) → ít cạnh tranh trực diện hơn các track lớn (Gaming 12 PS, Mobility 12 PS).
- KFC mô tả bài toán với **số liệu vận hành nội bộ rất cụ thể** (255 hợp đồng, ~300 payment request/tháng, 3+ năm dữ liệu POS, 250+ cửa hàng, hàng triệu khách/tháng) — dấu hiệu bài toán đã được discovery kỹ, khả năng pilot thật sau hackathon cao.
- Các bài toán có KPI định lượng rõ ràng → dễ xây dựng câu chuyện ROI thuyết phục khi pitch.
- Demo trực quan (kiosk, chatbot) — dạng demo "nhìn thấy được, chạm được" ăn điểm mạnh trong vài phút pitch.

### Tóm tắt 4 problem statements của track

| # | Tên | Bản chất | Đánh giá cho hackathon |
|---|---|---|---|
| P1 | Recurring payment processing (250+ store) | Document AI (OCR e-invoice XML/PDF) + workflow phê duyệt 5 cấp + duplicate/anomaly detection | ❌ **Bỏ qua** — ROI mạnh nhất nhưng cần Entra ID, chữ ký số, tích hợp kế toán legacy → quá nhiều hạ tầng phải giả lập trong 24h |
| P2 | AI recommendation cho kiosk tự đặt hàng | Contextual recommendation engine (giờ, ngày, cart, khuyến mãi) | ✅ **ANCHOR CHÍNH** — khả thi cao, KPI rõ, demo trực quan |
| P3 | Sales forecasting & anomaly detection | Forecast MAPE ≤10% + anomaly precision ≥80% + driver analysis | ❌ Bỏ qua phần build — KPI quá chặt, khó chứng minh không có data thật; chỉ nhắc như roadmap Phase 2 nếu bị hỏi |
| P4 | Conversational ordering qua chat | Chatbot đặt hàng Messenger/Zalo: order, voucher, loyalty | ✅ **MỞ RỘNG** — ghép chung engine với P2 |

---

## 3. Yêu cầu chi tiết 2 problem sẽ làm

### 3.1. P2 — AI-powered product recommendation engine for self-ordering kiosks

**Problem statement (nguyên văn từ KFC):**
KFC Vietnam vận hành 250+ nhà hàng với kiosk tự đặt hàng phục vụ hàng triệu khách mỗi tháng. Kiosk hiện hiển thị menu tĩnh, không cá nhân hoá. Khách không được gợi ý upsell/cross-sell theo ngữ cảnh (giờ trong ngày, món đang chọn, combo affinity). KFC ước tính tiềm năng tăng **15–20% giá trị đơn trung bình (AOV)** nếu gợi ý đúng món, đúng thời điểm.

**Hiện trạng:** Kiosk có mục "You may also like" tĩnh, do marketing curate thủ công, cập nhật hàng tháng — giống nhau cho mọi khách, mọi giờ, mọi địa điểm.

- **Công nghệ AI liên quan:** Generative AI · Predictive Analytics/Forecasting · Recommendation Systems/Personalization
- **KPI thành công:** Tăng AOV **10–15%** qua upsell/cross-sell theo ngữ cảnh tại kiosk
- **Người dùng/đội hưởng lợi:** Khách hàng (trải nghiệm nhanh, phù hợp hơn) · Marketing (kênh upsell động thay curate tay) · Vận hành (tăng AOV không thêm nhân sự)
- **Dữ liệu sẵn có:** POS transaction cấp item toàn 250+ cửa hàng · Menu catalog có cấu trúc (category, giá, combo, dinh dưỡng) trong DB quan hệ · Tín hiệu ngữ cảnh: vị trí cửa hàng, giờ, thứ, lịch khuyến mãi
- **Yêu cầu tích hợp:** Engine phải tích hợp với nền tảng kiosk hiện hữu
- **Build direction (từ đề):** Xây contextual recommendation engine dùng lịch sử đơn hàng cấp item, menu catalog, vị trí, thời gian, khuyến mãi và cart context để gợi ý sản phẩm phù hợp

### 3.2. P4 — AI-powered conversational ordering via chat

**Problem statement (nguyên văn từ KFC):**
Khách hàng KFC Vietnam ngày càng ưa dùng messaging app (Facebook Messenger, Zalo) làm kênh liên lạc chính, nhưng luồng đặt hàng hiện tại buộc họ chuyển sang app/website riêng. Chưa có trải nghiệm đặt hàng hội thoại — khách không thể đặt món, áp voucher, tra điểm loyalty bằng ngôn ngữ tự nhiên trong chat. Điều này gây friction và mất chuyển đổi từ nhóm khách high-intent đang sẵn trong chat.

**Hiện trạng:** Chưa có giải pháp conversational ordering nào — xử lý hiện tại **100% dựa vào nhân viên**.

- **Công nghệ AI liên quan:** Generative AI · Voice AI · Conversational AI/Chatbots
- **KPI thành công (đề nêu các chiều đo):** Order completion · Voucher application · Độ chính xác NLU · Loyalty point inquiry · Order theo kênh
- **Người dùng/đội hưởng lợi:** Khách hàng · Nhân viên call center
- **Dữ liệu sẵn có:** APIs are available (KFC xác nhận có API)
- **Yêu cầu tích hợp:** Messenger · Mobile App · Zalo · OMS (Order Management System) · Loyalty integration
- **Build direction (từ đề):** Xây trợ lý đặt hàng hội thoại cho Messenger/Zalo: đặt món, áp voucher, tra điểm loyalty, và handoff sang nhân viên khi cần

---

## 4. Chiến lược team: "1 AI Engine — 3 điểm chạm"

### Ý tưởng cốt lõi

Không làm 2 sản phẩm rời — build **một recommendation + ordering engine duy nhất** phục vụ nhiều giao diện:

```
                    ┌─────────────────────────────┐
                    │   CORE ENGINE (backend)      │
                    │  · Menu/Combo/Promotion DB   │
                    │  · Context: giờ/ngày/cart    │
                    │  · Recommendation logic      │
                    │  · Order + Voucher + Loyalty │
                    └──────────┬──────────────────┘
              ┌────────────────┼────────────────────┐
              ▼                ▼                    ▼
      ┌──────────────┐ ┌──────────────┐  ┌──────────────────┐
      │  KIOSK UI    │ │  MESSENGER   │  │  ZALO OA         │
      │ (web app,    │ │ (kết nối     │  │ (kết nối thật    │
      │  touchscreen)│ │  THẬT, dev   │  │  nếu OA kịp duyệt│
      │              │ │  mode)       │  │  — nếu không: UI │
      │              │ │              │  │  mô phỏng)       │
      └──────────────┘ └──────────────┘  └──────────────────┘
```

Lý do 2 problem ghép được tự nhiên: cả P2 và P4 đều cần **cùng lớp dữ liệu nền** (menu catalog, context giờ/ngày/khuyến mãi, cart hiện tại) và cùng logic gợi ý. Câu chuyện pitch "1 engine — nhiều điểm chạm" thể hiện tư duy platform, mạnh hơn hẳn "một con chatbot".

### Nguyên tắc phạm vi (với AI-assisted coding, 4 người, 24h)

- **Messenger: kết nối THẬT** — Page + App dev mode, webhook HTTPS, test bằng tài khoản admin/tester, không cần app review. Điểm cộng pitch lớn: giám khảo quét QR và đặt hàng ngay trên điện thoại.
- **Zalo: tuỳ tình trạng OA** — đăng ký Official Account cần Zalo duyệt (1–3 ngày). Nếu team đã có OA → gắn adapter thật; nếu không → UI mô phỏng + slide "kiến trúc adapter giống hệt Messenger, chỉ đổi webhook".
- **Kiosk: web app thuần** — không phụ thuộc bên thứ ba, chắc chắn hoàn thành.
- **Recommendation logic: rule-based context + ranking đơn giản là đủ** — giám khảo chấm kết quả hợp lý và giải thích được, không chấm độ phức tạp thuật toán.
- **Loyalty/voucher/OMS: mock API** có schema giống thật — thể hiện hiểu tích hợp mà không tốn thời gian vào hệ thống không truy cập được.

---

## 5. Lộ trình 24h — chia việc 4 người

### Người 1 — Core Engine + Backend (xương sống)

| Giờ | Việc |
|---|---|
| 0–8 | Schema menu/combo/promotion + mock POS history · Recommendation engine (context: giờ, ngày, cart) · API nội bộ cho các client |
| 8–16 | Order flow: tạo đơn, áp voucher, loyalty points (mock) · Endpoint thống kê AOV trước/sau cho màn admin |
| 16–24 | Hỗ trợ tích hợp 2 client, fix bug, hardening |

### Người 2 — Messenger Integration (rủi ro cao nhất → bắt đầu SỚM NHẤT)

| Giờ | Việc |
|---|---|
| 0–2 | **Việc đầu tiên tuyệt đối:** tạo FB Page + Meta App, dựng webhook qua tunnel (ngrok/Cloudflare Tunnel), xác nhận nhận được message. Vướng ở đây phải biết ngay để đổi kế hoạch |
| 2–12 | Hội thoại đặt hàng NLU (hiểu "cho mình 2 gà rán + pepsi, có voucher gì không") · Gắn engine Người 1 |
| 12–24 | Quick replies, product card, luồng thanh toán mock, handoff nhân viên |

### Người 3 — Kiosk UI + Zalo Backup

| Giờ | Việc |
|---|---|
| 0–10 | Kiosk touchscreen UI: chọn món → panel gợi ý real-time đổi theo giờ/cart |
| 10–16 | Zalo: nếu OA sẵn → gắn adapter thật; nếu không → UI mô phỏng chat Zalo dùng chung engine |
| 16–24 | Polish, animation, màn admin nhỏ hiển thị live "AOV trước/sau" |

### Người 4 — Data, Demo Scenario & Pitch

| Giờ | Việc |
|---|---|
| 0–8 | Mock data thuyết phục: menu KFC VN thật (từ website công khai) · transaction history có pattern theo daypart để gợi ý trông "thông minh" |
| 8–16 | Kịch bản demo end-to-end · **quay video demo dự phòng** (phòng lỗi live) |
| 16–24 | Slide pitch: "1 engine, 3 điểm chạm — tích hợp thật — KPI bám số KFC: AOV +10–15%" · 1 slide roadmap Phase 2 (P1 payment, P3 forecasting) phòng giám khảo hỏi vision |

### Buffer bắt buộc

Dành **20% thời gian cuối (~5h chót)** cho integration debugging (webhook không nhận event, token hết hạn, tunnel rớt) thay vì thêm tính năng. AI viết code nhanh nhưng debug tích hợp bên thứ ba vẫn ăn thời gian thật.

---

## 6. Định nghĩa "Hoàn thành" (Definition of Done)

**MỘT kịch bản demo duy nhất chạy mượt** — mọi quyết định cắt scope quy về câu hỏi: *"có phục vụ kịch bản này không?"*

> Khách nhắn Messenger → hỏi menu bằng ngôn ngữ tự nhiên → đặt combo → nhận gợi ý upsell đúng ngữ cảnh (giờ/cart) → áp voucher → xác nhận đơn → (song song) màn kiosk thể hiện cùng engine gợi ý trên giao diện chạm → màn admin hiện delta AOV.

Một kịch bản mượt > 5 tính năng dở dang.

---

## 7. Rủi ro & Fallback

| Rủi ro | Xác suất | Fallback |
|---|---|---|
| Zalo OA không kịp duyệt | Cao (nếu chưa có OA) | UI mô phỏng Zalo + slide kiến trúc adapter; nhấn mạnh Messenger đã chạy thật |
| Webhook Messenger trục trặc lúc demo live | Trung bình | Video demo quay sẵn (Người 4, giờ 8–16) |
| Gợi ý trông "ngu" vì data mỏng | Trung bình | Người 4 chăm chút pattern daypart trong mock data từ đầu; rule-based dễ kiểm soát hơn ML |
| Phình scope (thêm voice, thêm personalization sâu) | Cao | Bám Definition of Done; mọi tính năng ngoài kịch bản demo → cắt |
| Cả 4 người bị block chờ API engine | Thấp | Chốt spec API + schema NGAY từ giờ 0 để làm song song (xem checklist) |

---

## 8. Checklist NGAY HÔM NAY (trước khi code)

- [ ] **Check Zalo OA**: team có ai sở hữu OA đã duyệt chưa? Nếu chưa → nộp đăng ký ngay, chấp nhận rủi ro không kịp
- [ ] **Tạo FB Page + Meta App** (30 phút) — xác nhận webhook nhận được message trước khi đầu tư thêm bất kỳ dòng code nào
- [ ] **Chốt spec API giữa engine ↔ 2 client** (schema menu, context, recommendation request/response, order flow) để 4 người làm song song không chờ nhau
- [ ] **Tạo project trên portal** (Create project → track F&B) nếu chưa tạo
- [ ] Thu thập menu KFC VN công khai làm seed data
- [ ] Thống nhất Definition of Done + kịch bản demo với cả team

---

*Tổng hợp từ portal AABW 2026 (aitalent.genaifund.ai) và thảo luận chiến lược team — 09/07/2026.*
