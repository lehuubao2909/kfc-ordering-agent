# Payment Production — Thiết kế webhook & service (Dev A)

> Hiện tại payment là **mock** (nút "đã thanh toán" → `confirmPayment`). Tài liệu này thiết kế bản **production** thật.
> Phạm vi Dev A: `src/lib/services/payment/**`, `src/app/api/webhooks/payment/**`, schema payment. Đụng `api-contract.md`/`types.ts`/deploy/env → qua Lead.
> **Nguyên tắc:** giữ nguyên choke point `confirmPayment(orderId)`. Production chỉ đổi *trigger* (nút → webhook đã verify).

## 1. Vì sao webhook (không dùng redirect)
Thanh toán xảy ra ngoài hệ thống (app ngân hàng/ví). Server không tự biết kết quả.
- **Redirect (browser quay về):** khách sửa/giả mạo được · mất nếu đóng app/mất mạng/quét QR máy khác → **KHÔNG tin để chốt đơn**, chỉ để hiển thị UX.
- **Webhook/IPN (server→server):** cổng ký · độc lập trình duyệt · cổng **retry** tới khi nhận → **nguồn sự thật duy nhất** để `confirmPayment`.

## 2. Yêu cầu

**Chức năng:**
1. Tạo giao dịch: đơn `AWAITING_PAYMENT` → gọi cổng lấy checkout URL/QR thật + lưu `paymentRef`.
2. Nhận webhook: cổng báo kết quả → verify → `confirmPayment` (success) / flag (failed/expired).
3. Reconcile: query lại cổng cho đơn pending (phòng webhook lạc).

**Phi chức năng:**
- Bảo mật: verify chữ ký · khớp số tiền · idempotency · chống replay · secret trong env · HTTPS.
- Tin cậy: chịu được retry trùng lặp · sweeper hết-hạn · reconciliation.
- Quan sát: `payment_events` audit · log không PII/secret.
- Provider-agnostic: interface để VNPay/MoMo/Stripe hoán đổi.

## 3. Chữ ký hàm

### 3.1 Interface cổng — `src/lib/services/payment/gateway.ts`
```ts
export type CreatePaymentInput = {
  orderId: string;
  amountVnd: number;
  description: string;
  returnUrl: string;   // redirect UX (không dùng chốt đơn)
  ipnUrl: string;      // webhook server→server
  expiresInSec?: number;
};
export type CreatePaymentResult = {
  provider: string;
  paymentRef: string;  // mã giao dịch cổng
  checkoutUrl?: string;
  qrData?: string;
  expiresAt: string;   // ISO
};
export type WebhookVerifyInput = {
  rawBody: string;                       // đúng byte để verify chữ ký
  headers: Record<string, string>;
  query?: Record<string, string>;        // VNPay ký trên query params
};
export type PaymentStatus = "success" | "failed" | "pending" | "expired";
export type WebhookEvent = {
  provider: string;
  eventId: string;      // idempotency key (txn/event id của cổng)
  paymentRef: string;
  orderId: string;
  amountVnd: number;
  status: PaymentStatus;
  raw: unknown;
};

export interface PaymentGateway {
  readonly name: string;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  /** Verify chữ ký + parse. Chữ ký sai → throw PaymentSignatureError. */
  verifyAndParseWebhook(input: WebhookVerifyInput): WebhookEvent;
  /** ACK đúng định dạng cổng (VNPay {RspCode:'00'}, Stripe 200…). */
  ackResponse(ok: boolean): { status: number; body: unknown };
  /** Query trạng thái cho reconciliation. */
  queryStatus(paymentRef: string): Promise<PaymentStatus>;
}
```

### 3.2 Service orchestration — `src/lib/services/payment-service.ts`
```ts
/** Chọn cổng theo env PAYMENT_PROVIDER ("mock" | "vnpay" | "momo"…). */
export function getGateway(provider?: string): PaymentGateway;

/** Đơn AWAITING_PAYMENT → tạo giao dịch cổng, lưu payment_ref, trả link/QR. */
export async function createPaymentForOrder(orderId: string): Promise<CreatePaymentResult>;

/** Điểm vào webhook: verify → idempotency → khớp tiền → confirmPayment. Trả ACK cho cổng. */
export async function handlePaymentWebhook(
  provider: string,
  input: WebhookVerifyInput
): Promise<{ status: number; body: unknown }>;

/** Cron: quét đơn AWAITING_PAYMENT quá hạn, query cổng, confirm/expire. */
export async function reconcilePendingPayments(olderThanSec: number): Promise<{ checked: number; confirmed: number; expired: number }>;

export class PaymentSignatureError extends Error {}
```
> `confirmPayment(orderId)` **giữ nguyên** (đã idempotent) — `handlePaymentWebhook` gọi vào nó.

### 3.3 Route webhook — `src/app/api/webhooks/payment/[provider]/route.ts`
```ts
export const dynamic = "force-dynamic"; // không cache
export async function POST(req: NextRequest, { params }: { params: Promise<{ provider: string }> }): Promise<Response>;
```

## 4. Các bước trong route (đúng thứ tự — bảo mật trước)
1. `provider` từ path; không hỗ trợ → 404.
2. Đọc **raw body** (`await req.text()`) TRƯỚC khi parse (cần nguyên byte).
3. `getGateway(provider).verifyAndParseWebhook(...)` → sai chữ ký → **401**, log, dừng.
4. **Idempotency:** `SELECT payment_events WHERE event_id` → đã xử lý → trả ACK 200 ngay.
5. Load order theo `event.orderId`; không có → ghi event + trả ACK (tránh cổng retry bão), flag.
6. **Đối chiếu:** `event.amountVnd === order.totalVnd` · tiền tệ · order đang `AWAITING_PAYMENT` (hoặc `PLACED` → idempotent). Lệch → KHÔNG chốt, ghi + flag.
7. `success` → ghi `payment_events` + `confirmPayment(orderId)` (→ PLACED + push). `failed/expired` → ghi + (tùy) cancel.
8. Trả **ACK đúng định dạng cổng** (`ackResponse`).
9. Lỗi nội bộ SAU khi chữ ký hợp lệ → trả **5xx** để cổng **retry** (idempotency bảo vệ).

## 5. Bảo mật (checklist)
- ✅ **Verify chữ ký** mọi request (secret env, constant-time compare).
- ✅ **Khớp số tiền + đơn** — không tin mỗi `status` (chống báo trả thiếu).
- ✅ **Idempotency** (`payment_events.event_id` UNIQUE) + **chống replay** (loại timestamp quá cũ nếu cổng ký kèm).
- ✅ **HTTPS**; (tùy) **allowlist IP** cổng.
- ✅ Secret chỉ env, **không log PII/secret** (chỉ log eventId + quyết định).
- ✅ Mã lỗi đúng: chữ ký sai→401 · lỗi mình→5xx (retry) · OK→ACK 200.
- ✅ Trả 200 **sau khi ghi bền**.
- ✅ **Không tự nhận số thẻ** — dùng SDK/redirect cổng (PCI); form thẻ mock của Dev C thay bằng cổng.

## 6. Schema thêm (schema change → báo Lead)
```ts
// orders: thêm
paymentRef: text("payment_ref"),
paymentStatus: text("payment_status"), // pending | paid | failed | expired

// bảng mới
export const paymentEvents = pgTable("payment_events", {
  id: serial("id").primaryKey(),
  provider: text("provider").notNull(),
  eventId: text("event_id").notNull().unique(),   // idempotency
  orderId: text("order_id").notNull(),
  paymentRef: text("payment_ref"),
  amountVnd: integer("amount_vnd").notNull(),
  status: text("status").notNull(),
  signatureOk: boolean("signature_ok").notNull(),
  raw: jsonb("raw"),
  receivedAt: timestamp("received_at").notNull().defaultNow(),
}, (t) => [ index("payment_events_order_idx").on(t.orderId) ]);
```

## 7. Config webhook (deploy — với Lead)
- **Env (Vercel, mã hóa):** `PAYMENT_PROVIDER`, `PAYMENT_MERCHANT_ID`, `PAYMENT_SECRET_KEY`, `PAYMENT_WEBHOOK_SECRET`, `PAYMENT_RETURN_URL`, `PAYMENT_IPN_URL`.
- **Đăng ký IPN URL** ở dashboard cổng = `https://<prod-domain>/api/webhooks/payment/<provider>`.
- Route `force-dynamic`, phản hồi nhanh; cân nhắc `maxDuration` nhỏ.
- **Cron reconcile** (Vercel Cron) gọi `reconcilePendingPayments` mỗi 5–10 phút.
- **Sandbox trước:** test bằng simulator cổng + ngrok local; test case ký-sai / sai-tiền / trùng / replay.
- **Alert:** cảnh báo khi tỷ lệ chữ ký sai cao, hoặc đơn `AWAITING_PAYMENT` treo lâu.

## 8. Chuyển mock → production
- `PAYMENT_PROVIDER=mock` giữ luồng nút hiện tại; `=vnpay` bật cổng thật.
- `getPaymentLink` → `createPaymentForOrder` (trả checkout/QR thật).
- Nút mock → webhook cổng. **`confirmPayment` + state machine KHÔNG đổi.**

## 9. Thứ tự thi công (Dev A)
1. Schema `payment_ref` + `payment_events` (báo Lead) → `db:push`.
2. `gateway.ts` interface + types.
3. 1 provider adapter (VNPay trước).
4. `payment-service.ts` orchestration (giữ `confirmPayment`).
5. Route `webhooks/payment/[provider]`.
6. Env + đăng ký IPN + cron reconcile.
7. Test: chữ ký valid/invalid · sai tiền · trùng/replay · reconcile webhook lạc.

> **Ngoài scope hackathon** — đây là plan production. Mock hiện tại đủ cho demo.
