/**
 * Định nghĩa 14 tools + state gating. OWNER: Dev B.
 * Nguyên tắc: tool = wrapper mỏng gọi THẲNG service functions (không qua HTTP nội bộ).
 * getToolsForState(state) chỉ trả tools hợp lệ — LLM không thể checkout khi chưa CONFIRMING
 * (service layer của Dev A validate lần 2, đây là lớp 1).
 *
 * Guardrail F&B: giá/tổng chỉ từ service · resolve id chống bịa món · quantity bound 1..20 ·
 * 1 active order/psid (chặn conflict) · voucher re-validate ở confirm + lúc tạo order (service tự làm).
 */
import { tool, type ToolSet } from "ai";
import { z } from "zod";
import { OrderState } from "@/lib/types";
import { fmtVnd, resolveMenuItem, buildOrderSummary } from "./agent-tool-helpers";
import { getFullMenu, getMenuByCategory, searchMenuItems } from "@/lib/services/menu-service";
import { addToCart, removeFromCart, updateCartItemQuantity, getCart } from "@/lib/services/cart-service";
import { getActivePromotions } from "@/lib/services/promotion-voucher-service";
import { getUpsellSuggestions } from "@/lib/services/upsell-recommendation-service";
import { createOrderFromSession, cancelOrder, getActiveOrderByPsid } from "@/lib/services/order-service";
import { applyDeliveryInfo, getStoreById, getUnavailableCartItems } from "@/lib/services/store-service";
import { getPaymentLink } from "@/lib/services/payment-mock-service";
import { getLoyaltyPoints } from "@/lib/services/loyalty-service";
import { getCustomer, getOrCreateSession, setSessionState, setSessionMode } from "@/lib/services/session-data-service";

/** Tool nào được phép ở state nào — mirror docs/api-contract.md mục State machine */
export const TOOLS_BY_STATE: Record<OrderState, string[]> = {
  BROWSING: ["get_menu", "get_promotions", "add_to_cart", "get_order_status", "handoff_to_human"],
  CART: ["get_menu", "get_promotions", "get_upsell_suggestions", "add_to_cart", "remove_from_cart", "update_cart_item", "view_cart", "confirm_order", "handoff_to_human"],
  CONFIRMING: ["view_cart", "add_to_cart", "remove_from_cart", "get_upsell_suggestions", "set_delivery_info", "handoff_to_human"],
  COLLECTING_DELIVERY: ["set_delivery_info", "get_loyalty_points", "handoff_to_human"],
  SELECTING_PAYMENT: ["select_payment_method", "get_loyalty_points", "view_cart", "handoff_to_human"],
  AWAITING_PAYMENT: ["get_order_status", "cancel_order", "handoff_to_human"],
  PLACED: ["get_order_status", "cancel_order", "get_menu", "handoff_to_human"],
  PREPARING: ["get_order_status", "get_menu", "handoff_to_human"],
  DELIVERING: ["get_order_status", "get_menu", "handoff_to_human"],
  DELIVERED: ["get_menu", "get_promotions", "add_to_cart", "handoff_to_human"],
  CANCELLED: ["get_menu", "get_promotions", "add_to_cart", "handoff_to_human"],
};

const errMsg = (e: unknown) => (e instanceof Error ? e.message : "Có lỗi xảy ra ạ.");
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/** Dựng toàn bộ tool đã bind psid. getToolsForState lọc theo state. */
function buildAllTools(psid: string): ToolSet {
  return {
    get_menu: tool({
      description: "Tra cứu menu KFC. Truyền query (tên/từ khoá món) hoặc category. Kết quả kèm carousel ảnh gửi cho khách.",
      inputSchema: z.object({
        query: z.string().optional().describe("từ khoá tên món, vd 'gà rán', 'pepsi'"),
        category: z.enum(["combo", "chicken", "burger-rice", "snack", "dessert", "drink"]).optional(),
      }),
      execute: async ({ query, category }) => {
        const items = query ? await searchMenuItems(query) : category ? await getMenuByCategory(category) : await getFullMenu();
        return {
          items: items.slice(0, 10).map((m) => ({ id: m.id, name: m.name, price: fmtVnd(m.priceVnd), category: m.category, description: m.description })),
          note: items.length ? "Đã gửi kèm carousel ảnh. Giới thiệu ngắn gọn 1-2 món nổi bật." : "Không tìm thấy món khớp, hỏi lại khách hoặc gợi ý món khác.",
        };
      },
    }),

    get_promotions: tool({
      description: "Danh sách ưu đãi/khuyến mãi đang chạy. Dùng khi khách hỏi 'có ưu đãi gì'.",
      inputSchema: z.object({}),
      execute: async () => ({ promotions: await getActivePromotions() }),
    }),

    get_upsell_suggestions: tool({
      description: "Gợi ý món kèm theo giỏ hiện tại (theo giờ + món hay đi cùng). Chỉ upsell TỐI ĐA 1 lần/đơn.",
      inputSchema: z.object({}),
      execute: async () => {
        const cart = await getCart(psid);
        const s = await getUpsellSuggestions(cart.items);
        return { suggestions: s.map((x) => ({ id: x.item.id, name: x.item.name, price: fmtVnd(x.item.priceVnd), reason: x.reason })) };
      },
    }),

    add_to_cart: tool({
      description: "Thêm món vào giỏ. itemId lấy từ get_menu; nếu chỉ có tên cũng được (hệ thống tự khớp).",
      inputSchema: z.object({
        itemId: z.string().describe("id hoặc tên món"),
        quantity: z.number().int().min(1).max(20).default(1),
        note: z.string().optional().describe("ghi chú, vd 'ít cay', 'không đá'"),
      }),
      execute: async ({ itemId, quantity, note }) => {
        const r = await resolveMenuItem(itemId);
        if (r.ambiguous) return { needClarification: true, options: r.ambiguous.map((m) => ({ id: m.id, name: m.name, price: fmtVnd(m.priceVnd) })), note: "Nhiều món khớp, hỏi khách chọn cái nào." };
        if (!r.item) return { error: "Xin lỗi, bên em không có món này ạ. Anh/chị xem menu chọn giúp em nhé." };
        try {
          await addToCart(psid, { itemId: r.item.id, quantity, ...(note ? { note } : {}) });
          const session = await getOrCreateSession(psid);
          if (session.state === "BROWSING") await setSessionState(psid, "CART");
          const cart = await getCart(psid);
          return { ok: true, added: r.item.name, quantity, cartItemCount: cart.items.reduce((n, i) => n + i.quantity, 0) };
        } catch (e) {
          return { error: errMsg(e) };
        }
      },
    }),

    remove_from_cart: tool({
      description: "Bỏ 1 món khỏi giỏ.",
      inputSchema: z.object({ itemId: z.string().describe("id hoặc tên món cần bỏ") }),
      execute: async ({ itemId }) => {
        const r = await resolveMenuItem(itemId);
        const id = r.item?.id ?? itemId;
        try {
          await removeFromCart(psid, id);
          return { ok: true, removed: r.item?.name ?? itemId };
        } catch (e) {
          return { error: errMsg(e) };
        }
      },
    }),

    update_cart_item: tool({
      description: "Đổi số lượng 1 món trong giỏ. quantity=0 = xoá món đó.",
      inputSchema: z.object({ itemId: z.string(), quantity: z.number().int().min(0).max(20) }),
      execute: async ({ itemId, quantity }) => {
        const r = await resolveMenuItem(itemId);
        const id = r.item?.id ?? itemId;
        try {
          await updateCartItemQuantity(psid, id, quantity);
          return { ok: true, item: r.item?.name ?? itemId, quantity };
        } catch (e) {
          return { error: errMsg(e) };
        }
      },
    }),

    view_cart: tool({
      description: "Xem lại giỏ hàng + tổng tiền hiện tại.",
      inputSchema: z.object({}),
      execute: async () => {
        const s = await buildOrderSummary(psid);
        if (!s.itemCount) return { empty: true, note: "Giỏ trống, mời khách chọn món." };
        return s;
      },
    }),

    confirm_order: tool({
      description: "Chốt đơn để đọc lại itemized cho khách xác nhận TRƯỚC khi hỏi giao hàng. Gọi khi khách nói xong món.",
      inputSchema: z.object({}),
      execute: async () => {
        const cart = await getCart(psid);
        if (!cart.items.length) return { error: "Giỏ hàng đang trống, mình chưa chốt được ạ." };
        const summary = await buildOrderSummary(psid);
        await setSessionState(psid, "CONFIRMING");
        return { ...summary, note: "Đọc lại đơn + tổng cho khách xác nhận, rồi xin ĐỊA CHỈ và SỐ ĐIỆN THOẠI." };
      },
    }),

    set_delivery_info: tool({
      description: "Lưu địa chỉ + SĐT khách và xác định cửa hàng KFC phục vụ. Gọi khi khách đã cho ĐỦ địa chỉ VÀ số điện thoại.",
      inputSchema: z.object({
        address: z.string().min(5).describe("địa chỉ giao hàng đầy đủ"),
        phone: z.string().min(9).describe("số điện thoại khách"),
        name: z.string().optional(),
      }),
      execute: async ({ address, phone, name }) => {
        const digits = phone.replace(/\D/g, "");
        if (digits.length < 9 || digits.length > 11) return { error: "Số điện thoại chưa đúng, anh/chị cho em xin lại số 10 chữ số nhé." };
        const res = await applyDeliveryInfo(psid, { phone: digits, address, name });

        if (res.unavailableItemIds.length) {
          await setSessionState(psid, "CONFIRMING");
          const names = await Promise.all(res.unavailableItemIds.map(async (id) => (await resolveMenuItem(id)).item?.name ?? id));
          const cart = await getCart(psid);
          const remaining = cart.items.filter((i) => !res.unavailableItemIds.includes(i.itemId));
          const suggestions = await getUpsellSuggestions(remaining);
          return {
            outOfStock: true,
            store: res.store.name,
            unavailableItems: names,
            suggestions: suggestions.slice(0, 3).map((s) => ({ id: s.item.id, name: s.item.name, price: fmtVnd(s.item.priceVnd) })),
            note: "Xin lỗi khách vì món trên vừa hết tại cửa hàng phục vụ, gợi ý đổi món cùng loại rồi XÁC NHẬN LẠI đơn.",
          };
        }
        await setSessionState(psid, "SELECTING_PAYMENT");
        return {
          ok: true,
          store: { name: res.store.name, closeHour: res.store.closeHour },
          storeWasOpen: res.storeWasOpen,
          note: res.storeWasOpen
            ? `Báo khách: "${res.store.name}" (mở đến ${res.store.closeHour}h) sẽ chuẩn bị đơn. Rồi hỏi cách thanh toán (tiền mặt/QR/thẻ).`
            : `Cửa hàng gần nhất đã đóng, đơn chuyển về "${res.store.name}". Báo khách nhẹ nhàng rồi hỏi cách thanh toán.`,
        };
      },
    }),

    get_loyalty_points: tool({
      description: "Tra điểm tích luỹ của khách theo SĐT đã lưu.",
      inputSchema: z.object({}),
      execute: async () => {
        const c = await getCustomer(psid);
        if (!c?.phone) return { error: "Em chưa có SĐT của anh/chị để tra điểm ạ." };
        const p = await getLoyaltyPoints(c.phone);
        return { points: p.points, note: "Báo số điểm khách đang có, gợi ý nhẹ nếu đủ đổi ưu đãi." };
      },
    }),

    select_payment_method: tool({
      description: "Khách chọn cách thanh toán. cod = tiền mặt (chốt đơn ngay); qr/card = gửi link thanh toán.",
      inputSchema: z.object({ method: z.enum(["cod", "qr", "card"]) }),
      execute: async ({ method }) => {
        // Guardrail conflict: 1 active order/psid — chặn tạo đơn chồng đơn.
        const active = await getActiveOrderByPsid(psid);
        if (active) return { error: `Anh/chị đang có đơn ${active.id} (${active.status}) chưa xong. Em xử lý xong đơn này rồi mình đặt tiếp nhé.` };

        // Guardrail tồn kho (C1): re-check món hết tại cửa hàng phục vụ NGAY trước khi tạo đơn —
        // chặn trường hợp khách/LLM đi tiếp mà chưa đổi món hết. Voucher cũng được service tính lại lúc tạo đơn.
        const session = await getOrCreateSession(psid);
        if (session.storeId) {
          const store = await getStoreById(session.storeId);
          const cart = await getCart(psid);
          const unavailable = store ? getUnavailableCartItems(store, cart) : [];
          if (unavailable.length) {
            await setSessionState(psid, "CONFIRMING");
            const names = await Promise.all(unavailable.map(async (id) => (await resolveMenuItem(id)).item?.name ?? id));
            return { error: `Món ${names.join(", ")} vừa hết tại cửa hàng phục vụ. Anh/chị đổi giúp em món khác rồi mình thanh toán nhé.` };
          }
        }
        try {
          const order = await createOrderFromSession(psid, method);
          if (method === "cod") {
            return { ok: true, orderId: order.id, total: fmtVnd(order.totalVnd), trackingUrl: `${APP_URL}/order/${order.id}`, note: "Đơn COD đã đặt. Báo mã đơn + tổng + link theo dõi + dự kiến 30–40 phút." };
          }
          return { ok: true, orderId: order.id, total: fmtVnd(order.totalVnd), payUrl: getPaymentLink(order.id), note: "Gửi link thanh toán cho khách, báo chờ khách thanh toán xong sẽ vào bếp." };
        } catch (e) {
          return { error: errMsg(e) };
        }
      },
    }),

    get_order_status: tool({
      description: "Xem trạng thái đơn đang xử lý của khách.",
      inputSchema: z.object({}),
      execute: async () => {
        const o = await getActiveOrderByPsid(psid);
        if (!o) return { note: "Khách chưa có đơn nào đang xử lý." };
        return { orderId: o.id, status: o.status, total: fmtVnd(o.totalVnd), trackingUrl: `${APP_URL}/order/${o.id}` };
      },
    }),

    cancel_order: tool({
      description: "Huỷ đơn hiện tại (chỉ được trước khi vào bếp/PREPARING).",
      inputSchema: z.object({}),
      execute: async () => {
        const o = await getActiveOrderByPsid(psid);
        if (!o) return { error: "Không có đơn nào để huỷ ạ." };
        try {
          const c = await cancelOrder(o.id);
          return { ok: true, orderId: c.id, note: "Đã huỷ đơn, xác nhận nhẹ nhàng với khách." };
        } catch (e) {
          return { error: errMsg(e) };
        }
      },
    }),

    handoff_to_human: tool({
      description: "Chuyển hội thoại cho nhân viên khi khách khiếu nại, hỏi ngoài phạm vi đặt hàng, hoặc yêu cầu gặp người thật.",
      inputSchema: z.object({ reason: z.string().optional() }),
      execute: async ({ reason }) => {
        await setSessionMode(psid, "human");
        return { handedOff: true, reason: reason ?? "khách yêu cầu", note: "Báo khách sẽ có nhân viên hỗ trợ ngay, dừng lại chờ nhân viên." };
      },
    }),
  };
}

/** Trả subset tools hợp lệ với state hiện tại, đã bind psid. */
export function getToolsForState(state: OrderState, psid: string): ToolSet {
  const all = buildAllTools(psid);
  const allowed = new Set(TOOLS_BY_STATE[state] ?? []);
  return Object.fromEntries(Object.entries(all).filter(([name]) => allowed.has(name)));
}
