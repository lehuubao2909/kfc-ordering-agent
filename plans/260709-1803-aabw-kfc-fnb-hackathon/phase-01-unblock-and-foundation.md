# Phase 01 — Unblock & Foundation (hôm nay 10/7 + đêm 10/7)

## Context Links

- [plan.md](plan.md) · [Analysis report](../reports/analysis-260709-1803-aabw-kfc-evaluation.md)
- Portal: aitalent.genaifund.ai · Event: agenticaibuildweek.genaifund.ai

## Overview

- **Priority:** CRITICAL — quyết định 11/7 có build thuần được hay không
- **Status:** In progress (10/7 là ngày workshop — làm xen kẽ giờ nghỉ)
- Nguyên tắc: mọi việc chờ-bên-thứ-ba + ít-năng-lượng làm hết hôm nay; 11/7 không còn phụ thuộc bên ngoài.

## Key Insights

- Meta App dev mode không cần app review — Page + tester accounts là nhắn được ngay.
- Deploy skeleton lên Vercel ngay hôm nay → webhook chạy trên URL production, triệt tiêu rủi ro tunnel lúc demo.
- Scaffold do MỘT người (Người 1) dựng trong 1–2h, cả team review 15', rồi freeze cấu trúc — ranh giới ownership là thư mục vật lý.

## Requirements

Cuối phase: webhook echo OK trên production · scaffold + contract freeze · seed menu + mock POS sẵn · model đã chọn · mọi người clone về chạy được.

## Implementation Steps

### Sáng/trưa 10/7 — việc sống còn trước

1. **Người 2 (Gate 2 — xong trước trưa):** FB Page + Meta App + cả team làm tester → webhook verify + echo trên Vercel route (`/api/webhooks/messenger`, `maxDuration=60`) → nhắn từ điện thoại thật nhận reply. Fail >3h → họp khẩn (Plan B: quay về P2).
2. **Người 1:** tạo Neon + Vercel project, OpenAI key vào env; scaffold repo Next.js 15 + Drizzle: skeleton đủ thư mục ownership + file placeholder + `.env.example` + deploy hello-world.
3. Đọc **Guide + submission requirements trên portal** (format nộp: video? repo? quy định code trước Kick-Off?). Tạo project track F&B, ghi rõ chọn **P4**.

### Chiều/tối 10/7

4. **Người 1:** schema DB: `customers (psid, phone, address), sessions (state, mode agent|human, processing_lock), orders (+status enum), order_items, menu_items (alias[], image_url), combos, promotions, vouchers, loyalty_accounts, pos_transactions, message_log`; viết `docs/api-contract.md` + `src/lib/types.ts` (zod) — **contract freeze tối nay**, kèm fixtures JSON mẫu.
5. **Người 2 (Gate 3):** prototype agent Vercel AI SDK + 2 tools stub (get_menu, add_to_cart) → chạy 10 câu transcript tiếng Việt qua 2 model ứng viên → chốt `OPENAI_MODEL` (tiêu chí: hiểu "2 miếng gà giòn cay 1 pepsi lớn", tool call đúng, <3–4s).
6. **Người 3:** đọc contract; dựng skeleton 4 trang trên fixtures tĩnh: `/staff` (console), `/admin`, `/order/[id]` (tracking), `/pay/[orderId]` (QR mock + nút "Đã thanh toán (demo)").
7. **Người 4:** crawl/nhập menu KFC VN công khai (~50–80 món: category, giá, ảnh, alias, combo) đúng schema; script `generate-mock-pos-transactions.ts` 90 ngày pattern daypart + precompute co-occurrence; phác outline pitch 3'/7' theo KPI P4 (order completion, NLU accuracy, voucher, loyalty).

### Đêm 10/7 (nhẹ)

8. Review scaffold cả team 15' → freeze cấu trúc. Smoke test: webhook echo + agent prototype trả lời 1 câu có tool call + trang skeleton mở được.
9. Checklist demo day: 2 điện thoại tester, hotspot 4G, HDMI adapter, standee QR.

## Todo List

- [ ] Gate 2: webhook echo production URL (trưa)
- [ ] Portal: đọc Guide + tạo project P4 (sáng)
- [ ] Scaffold + deploy hello-world + .env.example (chiều)
- [ ] Schema + contract + fixtures — FREEZE (tối)
- [ ] Gate 3: chốt OPENAI_MODEL bằng transcript test (tối)
- [ ] Skeleton 4 trang FE trên fixtures (tối)
- [ ] Menu seed + mock POS + co-occurrence (tối)
- [ ] Outline pitch + review scaffold + smoke test (đêm)

## Success Criteria

Nhắn vào Page → nhận echo từ production. Agent prototype tool-call OK với model đã chốt. Contract freeze, 4 người làm song song từ sáng 11/7 không ai chờ ai.

## Risk Assessment

| Rủi ro | Mitigation |
|---|---|
| Meta webhook trục trặc | Làm sớm nhất; kẹt >3h → escalate cả team |
| OpenAI key/quota vấn đề | Test transcript ngay tối nay lộ liền; credit đã có |
| Workshop chiếm giờ | Việc #1–#3 làm được trong giờ nghỉ bằng laptop |
| Crawl menu bị chặn | Nhập tay 40 món chủ lực (1–2h) |

## Security Considerations

Secrets trong Vercel env + `.env.local`, không commit. Verify webhook `X-Hub-Signature-256`. Mask SĐT trong log.

## Next Steps

Phase 02/03/04 song song từ sáng 11/7. Người 4 tại Kick-Off hỏi KFC: lượng tin nhắn fanpage/tháng, thời gian phản hồi hiện tại, đội CSKH bao nhiêu người, OMS/loyalty API — số thật cho slide ROI + tên người để cite.
