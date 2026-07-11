/**
 * Làm giàu tool-trace bằng QUYẾT ĐỊNH của agent (tham số vào / kết quả ra then chốt). OWNER: Dev B.
 * Format mỗi entry: "toolName|chi tiết ngắn" — DB giữ tên tool thật, UI dịch tiếng Việt khi render.
 * Mục đích rubric AABW: "make your reasoning and multi-step action visible" — trace không chỉ nói
 * agent GỌI GÌ mà còn QUYẾT GÌ (món nào, cửa hàng nào, mã đơn nào).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyCall = { toolName: string; input?: any };
type AnyResult = { toolName: string; output?: any };

/** Rút chi tiết ngắn gọn cho 1 tool call từ args + kết quả (defensive — thiếu field thì bỏ qua). */
function extractDetail(name: string, input: any, output: any): string {
  try {
    switch (name) {
      case "add_to_cart":
        return output?.added ? `${output.added}${input?.quantity > 1 ? ` ×${input.quantity}` : ""}` : input?.itemId ?? "";
      case "remove_from_cart":
        return output?.removed ?? input?.itemId ?? "";
      case "update_cart_item":
        return input?.itemId ? `${input.itemId} → ${input.quantity}` : "";
      case "get_menu":
        return input?.query ?? input?.category ?? "toàn bộ";
      case "get_upsell_suggestions":
        return output?.suggestions?.[0]?.name ? `top: ${output.suggestions[0].name}` : "";
      case "confirm_order":
        return output?.total ? `tổng ${output.total}` : "";
      case "set_delivery_info":
        if (output?.outOfStock) return `${output.store} · món hết → đổi món`;
        return output?.store?.name ? `${output.store.name}${output.storeWasOpen === false ? " (cửa hàng gần đã đóng)" : ""}` : "";
      case "select_payment_method": {
        const method = input?.method === "cod" ? "tiền mặt" : input?.method === "qr" ? "QR" : input?.method ?? "";
        return output?.orderId ? `${output.orderId} · ${method}` : output?.error ? "bị chặn bởi guardrail" : method;
      }
      case "get_order_status":
        return output?.orderId ? `${output.orderId} · ${output.status}` : "";
      case "cancel_order":
        return output?.orderId ?? "";
      case "get_loyalty_points":
        return typeof output?.points === "number" ? `${output.points.toLocaleString("vi-VN")} điểm` : "";
      case "handoff_to_human":
        return input?.reason ?? "";
      default:
        return "";
    }
  } catch {
    return "";
  }
}

/** Ghép toolCalls + toolResults (khớp theo thứ tự tên) thành trace entries "name|detail". */
export function buildToolTrace(calls: AnyCall[], results: AnyResult[]): string[] {
  const pool = [...results];
  return calls.map((c) => {
    const idx = pool.findIndex((r) => r.toolName === c.toolName);
    const matched = idx >= 0 ? pool.splice(idx, 1)[0] : undefined;
    const detail = extractDetail(c.toolName, c.input, matched?.output).trim();
    return detail ? `${c.toolName}|${detail}` : c.toolName;
  });
}
