# Phase 04 — Staff Console, Admin, Tracking & Payment Pages (11/7 sáng → tối · Người 3)

## Context Links

- [plan.md](plan.md) · [phase-01](phase-01-unblock-and-foundation.md) (skeleton 4 trang sẵn) · Contract: `docs/api-contract.md`

## Overview

- **Priority:** HIGH — staff console là màn handoff (điểm production-readiness mạnh nhất), admin là màn chốt số
- **Status:** Blocked by Phase 01
- 4 surface trong 1 app Next.js: `/staff`, `/admin`, `/order/[id]`, `/pay/[orderId]` + landing QR.

## Key Insights

- **Staff console vừa là tính năng vừa là demo control:** nút advance status chính là cách "giả lập OMS" một cách chân thực — nhà hàng thật cũng bấm cập nhật trạng thái. Không cần cron simulator.
- Tracking page `/order/[id]` (link trong receipt) biến "tracking realtime" thành thứ nhìn thấy được — timeline polling 2s.
- Payment page có nút "Tôi đã thanh toán (demo)" — mock minh bạch, không giả vờ là cổng thật; slide roadmap ghi VNPay/MoMo/ZaloPay.

## Requirements

- **`/staff`:** danh sách hội thoại (badge mode agent/human), xem transcript, nút "Tiếp quản"/"Trả lại bot", ô gõ tin nhắn tay khi human-mode; panel đơn hàng với nút advance status (PLACED→PREPARING→DELIVERING→DELIVERED).
- **`/admin`:** đơn live (polling 2s) · funnel started→cart→confirmed→paid→delivered · upsell acceptance · card "NLU eval 18/20" (đọc từ file kết quả harness) · assumptions ghi rõ.
- **`/order/[id]`:** timeline trạng thái + ETA + danh sách món, tự refresh.
- **`/pay/[orderId]`:** tổng tiền + QR VietQR-style (ảnh mock) + tab "Thẻ" (form giả) + nút xác nhận demo → gọi `POST /api/payment/confirm` → redirect trang cảm ơn.
- **`/` landing:** logo + QR vào Messenger (m.me link) — trang giám khảo scan.

## Related Code Files (tạo mới)

- `src/app/staff/page.tsx` · `src/components/staff/{conversation-list,transcript-viewer,takeover-controls,order-status-advance-panel}.tsx`
- `src/app/admin/page.tsx` · `src/components/admin/{live-orders-table,order-funnel-metrics-card,nlu-eval-results-card}.tsx`
- `src/app/order/[id]/page.tsx` · `src/components/tracking/order-status-timeline.tsx`
- `src/app/pay/[orderId]/page.tsx` · `src/app/page.tsx` (landing QR)

## Implementation Steps

1. **Sáng (0–3h):** `/pay` + `/order/[id]` trước (nằm trong critical path M1/M2 của flow đặt hàng) — nối API thật thay fixtures.
2. **Sáng (3–5h):** `/staff` phần đơn hàng: bảng đơn + nút advance (gọi `/api/admin/orders/:id/advance`) → xác nhận push tới Messenger chạy (phối hợp Người 2).
3. **Chiều (5–8h):** `/staff` phần hội thoại: list + transcript (polling) + takeover/release + gõ tay (gọi API gửi qua adapter Người 2).
4. **Chiều (7–9h):** `/admin` đầy đủ 4 card + landing QR.
5. **Tối (9–10h):** polish: mobile-friendly (staff dùng điện thoại được), loading/error states, màu KFC (đỏ trắng), test trên máy chiếu demo.

## Todo List

- [ ] /pay + /order nối API thật (sáng — trước M1)
- [ ] /staff: orders + advance status + verify push (sáng)
- [ ] /staff: transcript + takeover + gõ tay (chiều)
- [ ] /admin 4 cards + landing QR (chiều)
- [ ] Polish + test máy chiếu (tối)

## Success Criteria

Màn 2 DoD chạy trơn: staff bấm advance → khách nhận push <3s; takeover → agent im, staff gõ khách nhận được; release → bot hoạt động lại. Admin hiện funnel + eval số thật.

## Risk Assessment

| Rủi ro | Mitigation |
|---|---|
| Polish ăn hết giờ | Thứ tự cứng: /pay → /order → /staff orders → /staff chat → /admin → đẹp cuối cùng |
| Phối hợp push với Người 2 lệch nhịp | Điểm sync 15:00 dành riêng test luồng này |
| Máy chiếu resolution lạ | Layout vh/vw responsive, test tối 11/7 |

## Security Considerations

`/staff` + `/admin` sau basic auth env (tránh bị phá giữa demo). Không expose SĐT đầy đủ trên admin.

## Next Steps

Phase 05: Người 3 vận hành màn staff console + admin trong demo.
