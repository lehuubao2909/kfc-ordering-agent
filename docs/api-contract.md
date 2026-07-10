# API Contract — KFC Ordering Agent

> **OWNER: Lead.** Nguồn sự thật thứ 2 sau `src/lib/types.ts`. Muốn đổi → nhắn Lead. Freeze từ tối 10/7.

## Envelope thống nhất

Mọi API route trả: `{ ok: true, data: T }` hoặc `{ ok: false, error: { code, message } }` (helper `apiOk/apiError` trong types.ts).

## State machine (nguồn: order-service.ts VALID_TRANSITIONS)

```
BROWSING → CART ⇄ CONFIRMING → COLLECTING_DELIVERY → SELECTING_PAYMENT ─┬→ PLACED (cod)
                                                                        └→ AWAITING_PAYMENT → PLACED (qr/card)
PLACED → PREPARING → DELIVERING → DELIVERED
CANCELLED: được phép từ AWAITING_PAYMENT, PLACED. Từ PREPARING trở đi: KHÔNG hủy.
```

## HTTP routes

| Route | Method | Owner | Mô tả |
|---|---|---|---|
| `/api/menu?category=&q=` | GET | Dev A | ✅ Hoạt động (fixtures). Trả `MenuItem[]` |
| `/api/payment/confirm` | POST `{orderId}` | Dev A | Trang /pay gọi → order PLACED + push |
| `/api/admin/orders` | GET | Dev A | Orders mới nhất + funnel metrics (basic auth) |
| `/api/admin/orders/advance` | POST `{orderId, to}` | Dev A | Staff chuyển trạng thái → event → push khách |
| `/api/admin/conversations` | GET | Dev A | List sessions + transcript (từ message_log) |
| `/api/admin/conversations/takeover` | POST `{psid, mode}` | Dev A | mode: "human" (tiếp quản) / "agent" (trả bot) |
| `/api/admin/conversations/send` | POST `{psid, text}` | Dev A | Staff gõ tay → gửi qua messenger-adapter |
| `/api/webhooks/messenger` | GET/POST | Lead + Dev B | Verify + nhận event Messenger |

FE (Dev C) CHỈ gọi các route trên. Agent tools (Dev B) KHÔNG gọi HTTP — import service functions trực tiếp.

**Dev C build trên fixtures trước** (khớp shape response, import trực tiếp, đổi sang fetch API thật khi Dev A xong):
- `src/fixtures/menu-sample.json` → GET /api/menu (`data`)
- `src/fixtures/sample-orders.json` → GET /api/admin/orders (`data.orders`) + tracking /order/[id] + /pay/[orderId]
- `src/fixtures/sample-conversations.json` → GET /api/admin/conversations (`data`)
- `src/fixtures/sample-admin-metrics.json` → GET /api/admin/orders (`data.metrics`) — 4 card admin
- Chi tiết bảng/cột: [database-schema.md](database-schema.md)

## Agent tools (Dev B) → service functions (Dev A)

| Tool | Gọi service |
|---|---|
| get_menu | `searchMenuItems` / `getMenuByCategory` / `getFullMenu` |
| get_promotions | `getActivePromotions` |
| get_upsell_suggestions | `getUpsellSuggestions(cart, now)` |
| add_to_cart / remove_from_cart / update_cart_item / view_cart | cart-service (validate itemId qua menu-service) |
| confirm_order | `calculateOrderTotals` + `autoApplyBestVoucher` → chuyển state CONFIRMING |
| set_delivery_info | lưu customers + session → COLLECTING_DELIVERY → SELECTING_PAYMENT |
| get_loyalty_points | `getLoyaltyPoints(phone)` |
| select_payment_method | cod → `createOrderFromSession` PLACED; qr/card → AWAITING_PAYMENT + `getPaymentLink` |
| get_order_status | `getActiveOrderByPsid` |
| cancel_order | `cancelOrder` (throw nếu ≥ PREPARING) |
| handoff_to_human | session.mode = "human" + notify staff |

## Quy tắc vàng

1. Giá/tổng tiền CHỈ do service tính. LLM và FE không tự tính.
2. Client (FE, agent) không chứa business logic — mọi logic trong `src/lib/services/`.
3. Đổi schema DB/types → thông báo Lead TRƯỚC khi push.
