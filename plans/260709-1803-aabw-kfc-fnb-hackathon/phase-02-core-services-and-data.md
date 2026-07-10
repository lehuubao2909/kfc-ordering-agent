# Phase 02 — Core Services & Data (11/7 sáng → tối · Người 1 + Người 4)

## Context Links

- [plan.md](plan.md) · [phase-01](phase-01-unblock-and-foundation.md) · Contract: `docs/api-contract.md` (freeze từ 10/7)

## Overview

- **Priority:** HIGH — toàn bộ tools của agent và data của FE đều gọi vào đây
- **Status:** Blocked by Phase 01
- Service layer = bộ não duy nhất. Agent tools và API routes đều là wrapper mỏng gọi thẳng service functions — không logic nào viết 2 lần.

## Key Insights

- **Order state machine nằm ở service, không nằm ở LLM.** Transition không hợp lệ (checkout khi giỏ rỗng, sửa đơn khi đang giao) → service từ chối kèm message để agent relay. Double enforcement: state-gated tools (phase 03) + service validation.
- Giá, phí ship, tổng tiền: chỉ service tính. LLM không bao giờ sinh số tiền.
- Push notification: service phát event `onOrderStatusChange` — Người 2 đăng ký callback gửi Messenger. Ranh giới ownership sạch.

## Requirements

State machine: `BROWSING → CART → CONFIRMING → COLLECTING_DELIVERY → SELECTING_PAYMENT → AWAITING_PAYMENT? → PLACED → PREPARING → DELIVERING → DELIVERED` (+`CANCELLED` trước PREPARING, `HANDOFF` mode song song). Auto-apply voucher tốt nhất. Upsell suggestions theo daypart + co-occurrence. Loyalty theo SĐT. Payment mock (QR/thẻ) đổi trạng thái qua `/pay` page.

## Related Code Files (tạo mới)

- `src/lib/services/menu-service.ts` (search theo alias/category) · `cart-service.ts` · `order-service.ts` (state machine + transitions + phí ship flat) · `promotion-voucher-service.ts` (list + auto-apply best) · `loyalty-service.ts` · `upsell-recommendation-service.ts` · `payment-mock-service.ts` · `order-status-events.ts`
- `src/app/api/orders/**`, `api/payment/**`, `api/admin/**` routes
- `scripts/compute-co-occurrence-matrix.ts` · `scripts/run-funnel-backtest.ts` · `scripts/reset-demo-data.ts`

## Implementation Steps

1. **Sáng (0–3h):** menu + cart + order-service với state machine đầy đủ transitions & validations; unit test ~8 case transition (checkout giỏ rỗng bị chặn, huỷ sau PREPARING bị chặn...).
2. **Sáng (3–5h):** promotion/voucher (3–4 mã mẫu; auto-apply best + trả về lời giải thích), loyalty (tra/tích điểm theo SĐT), upsell service (daypart affinity + co-occurrence + attach-gap: giỏ thiếu drink/dessert → boost; kèm `reason` có số thật, ví dụ "78% khách trưa gọi kèm Pepsi").
3. **Chiều (5–7h):** payment-mock: tạo payment intent → `/pay/[orderId]` (Người 3 làm UI) gọi `POST /api/payment/confirm` → order sang PLACED + phát event. COD thì PLACED ngay khi chọn.
4. **Chiều (7–8h):** order-status: staff console gọi `POST /api/admin/orders/:id/advance` → transition + event; ETA đơn giản theo status.
5. **Chiều — Người 4:** funnel backtest script (số cho slide: completion rate, upsell acceptance giả định có ghi rõ assumptions) + ngồi tune upsell với Người 1 ở 3 mốc giờ demo (sáng/trưa/tối).
6. **Tối (8–10h):** admin API (orders live polling, funnel metrics, upsell acceptance) · error handling mọi route (envelope `{ok,data,error}`) · `reset-demo-data.ts` · hỗ trợ Người 2/3 tích hợp.

## Todo List

- [ ] Order state machine + tests (sáng)
- [ ] Voucher auto-apply + loyalty + upsell service (sáng)
- [ ] Payment mock flow + events (chiều)
- [ ] Status advance API cho staff console (chiều)
- [ ] Funnel backtest + tune upsell (chiều — Người 4)
- [ ] Admin API + error handling + reset script (tối)

## Success Criteria

Chạy đủ vòng đời đơn bằng curl/service tests: cart → confirm → delivery info → COD/QR → PLACED → ... → DELIVERED, mỗi transition phát event. Upsell trả 2–3 món kèm reason, đổi theo giờ. Transition sai bị chặn kèm message rõ.

## Risk Assessment

| Rủi ro | Mitigation |
|---|---|
| State machine phức tạp hoá | Chỉ 1 đường thẳng + 2 nhánh (COD/online, cancel); không làm pickup/multi-order (stretch) |
| Upsell "ngu" | Người 4 review bằng mắt 3 daypart; attach-gap là lưới an toàn |
| Neon latency | Cache menu + co-occurrence in-memory theo instance |

## Security Considerations

Zod validate mọi input. Mask SĐT trong log. `/api/admin/**` sau basic auth env đơn giản.

## Next Steps

Agent tools (phase 03) map 1-1 vào services. Freeze 22:00.
