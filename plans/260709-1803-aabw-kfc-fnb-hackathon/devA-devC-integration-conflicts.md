# Tích hợp Dev A (backend) ↔ Dev C (frontend) — conflicts & việc cần làm

> Cập nhật 11/7. **Bối cảnh:** Dev C đang render bằng mock; sẽ **conform theo schema/API của Dev A**.
> ⇒ **Dev A = nguồn sự thật.** Việc chính: Dev A **ổn định + expose contract rõ**; Dev C **map theo**.
> Rà `origin/devC` vs `dev-a` (không merge). Dev C mới chỉ `fetch` thật ở `payment-panel`; còn lại dùng mock.

## 🔄 Đã xử lý bởi Dev A (11/7) — verify tsc·smoke 21/21·webpack build
- **C2 xong:** gỡ token, `POST /api/payment/confirm` nhận lại `{orderId}` → payment-panel Dev C chạy nguyên trạng (chỉ cần bỏ nhánh `status===501`).
- **C5 xong:** `GET /api/orders/[id]` trả **full** địa chỉ/SĐT (tracking hiện đúng); chỉ `/api/admin/orders` mask.
- **C7 xong:** `orders` trong `/api/admin/orders` giờ có `upsellAccepted`.
- **C3 phần lớn xong:** `/api/admin/orders` trả `data.{orders, metrics:{funnel, aov, upsell}}` — **đã đặt tên field khớp AdminMetrics của Dev C** (`conversationsStarted/reachedCart/confirmed/paid/delivered`, `aov{withoutUpsellVnd,withUpsellVnd,upliftPct,assumption}` từ backtest, `upsell{offered,accepted,acceptanceRatePct}`). **Còn `nluEval`** → chờ Dev B.
- **Còn lại:** C1 (merge menu), C4 (nguồn transcript — chờ Dev B), C6 (Dev C bỏ static→fetch).

## Nguyên tắc
- Shape do **Dev A** chốt (types.ts + API envelope `{ok,data}`). Dev C đổi mock → fetch, map field theo Dev A.
- Bỏ 2 thứ over-engineering (token, mask ở /orders/:id) để giảm ma sát tích hợp — xem C2, C5.

## Bảng tổng hợp

| # | Vấn đề | Mức | Hướng xử lý | Ai |
|---|---|---|---|---|
| C1 | `menu-sample.json` sửa ở cả 2 nhánh → conflict git | 🟠 | Giữ 58 món dev-a (canonical) + ghép câu chữ marketing Dev C | Merge (A+C) |
| C2 | payment token → 403 | ✅ Gỡ | **Dev A gỡ token** → confirm nhận lại `{orderId}` | Dev A |
| C3 | Admin metrics thiếu `aov`, tên field khác, thiếu `nluEval` | 🟠 | Dev A: thêm `aov` + expose `upsellAccepted`, chốt tên field. `nluEval` do Dev B cấp hoặc Dev C bỏ card | Dev A + Lead/B |
| C4 | Transcript: nguồn & shape chưa nhất quán | 🟠 | Chốt nguồn `sessions.history` hay `message_log` (theo cái Dev B ghi ĐẦY ĐỦ); Dev A expose shape cuối | Dev A + Dev B |
| C5 | /orders/:id mask PII, tracking cần full | ✅ Bỏ mask | **Dev A bỏ mask ở /orders/:id**, chỉ mask ở /admin | Dev A |
| C6 | /order & /pay build static từ mock → 404 đơn thật | 🔴 | Dev C: bỏ `generateStaticParams`, đổi `getOrder` → `fetch /api/orders/[id]` | Dev C |
| C7 | `upsellAccepted` chưa expose ra API | 🟢 | Dev A: thêm vào map (feed AOV) | Dev A |

---

## Việc Dev A (ổn định contract — làm trước để Dev C có đích map)
1. **Gỡ payment token** (C2): `payment-mock-service` bỏ `paymentToken/verifyPaymentToken`, `getPaymentLink` về URL thường; route `confirm` nhận `{orderId}`; gỡ test/doc token. → luồng thanh toán Dev C `{orderId}` chạy luôn.
2. **Bỏ mask ở `GET /api/orders/[id]`** (C5): trả `deliveryAddress/deliveryPhone` full (khách xem đơn mình). Giữ mask ở `/api/admin/orders`. `maskAddress` thành dead-code → xoá.
3. **Mở rộng `admin-metrics-service`** (C3+C7): thêm `aov {withoutUpsellVnd, withUpsellVnd, upliftPct, assumption}` (tính từ orders theo `upsellAccepted`); expose `upsellAccepted` trong order map; chốt tên funnel (đề xuất giữ tên hiện tại, Dev C map). `nluEval` chờ Dev B.
4. **Chốt nguồn transcript** (C4) với Dev B → expose shape cuối cho `/api/admin/conversations?psid=`.

## Việc Dev C (conform theo Dev A)
5. Đổi mọi page từ `@/lib/mock/mock-data` → `fetch` API thật, đọc envelope `{ok,data}`.
6. (C6) Bỏ `generateStaticParams` ở `/order/[id]` & `/pay/[orderId]`; fetch `GET /api/orders/[id]` runtime.
7. `payment-panel`: giữ body `{orderId}` (token đã gỡ); bỏ nhánh đặc biệt `status===501`.
8. Map field theo Dev A: funnel (tên Dev A), transcript (`direction/text` nếu chốt message_log; hoặc `role/content` nếu chốt sessions.history), thêm `customerName` nếu Dev A cấp.

## Việc Merge
9. (C1) `menu-sample.json`: lấy bản 58 món dev-a, ghép tên/mô tả marketing của Dev C cho món trùng; KHÔNG lấy `comboItemIds:[]` của Dev C.

## Cần Lead/Dev B chốt
- `nluEval` (C3): Dev B xuất eval ra đâu, hay Dev C bỏ card này?
- Nguồn transcript (C4): `sessions.history` (Dev B ghi đủ user+bot?) hay `message_log` (Dev B có ghi reply bot không?).
- Tên field funnel: giữ của Dev A hay đổi theo Dev C (`conversationsStarted`...)?

## Điểm tốt (không đụng)
- Dev C import type chuẩn `@/lib/types` → enum/shape gốc khớp.
- `GET /api/menu` khớp → carousel chạy ngay.
- Fixtures Dev C shape sát type gốc → chỉ đổi nguồn, giữ component.
