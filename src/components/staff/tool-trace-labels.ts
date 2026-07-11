/**
 * Việt hoá tool-trace cho staff console (feedback team 11/7: tên hàm khó đọc).
 * DB lưu tên tool thật (entry "toolName|detail") — đây chỉ là tầng hiển thị.
 */

const TOOL_LABELS_VI: Record<string, string> = {
  get_menu: "Tra menu",
  get_promotions: "Tra ưu đãi",
  get_upsell_suggestions: "Tính gợi ý món kèm",
  add_to_cart: "Thêm vào giỏ",
  remove_from_cart: "Bỏ khỏi giỏ",
  update_cart_item: "Đổi số lượng",
  view_cart: "Xem giỏ & tổng tiền",
  confirm_order: "Chốt đơn — đọc lại cho khách",
  set_delivery_info: "Lưu địa chỉ · chọn cửa hàng",
  get_loyalty_points: "Tra điểm thành viên",
  select_payment_method: "Tạo đơn & thanh toán",
  get_order_status: "Kiểm tra đơn",
  cancel_order: "Hủy đơn",
  handoff_to_human: "Chuyển nhân viên",
};

/** "set_delivery_info|KFC Nguyễn Trãi" → "Lưu địa chỉ · chọn cửa hàng (KFC Nguyễn Trãi)" */
export function formatTraceEntry(entry: string): string {
  const [name, ...detailParts] = entry.split("|");
  const label = TOOL_LABELS_VI[name.trim()] ?? name.trim();
  const detail = detailParts.join("|").trim();
  return detail ? `${label} (${detail})` : label;
}

/** Cả chuỗi trace "a|x → b|y" → nhãn Việt; kèm bản raw cho tooltip. */
export function formatTraceLine(text: string): { display: string; raw: string } {
  const entries = text.split("→").map((s) => s.trim()).filter(Boolean);
  return {
    display: entries.map(formatTraceEntry).join("  →  "),
    raw: entries.map((e) => e.split("|")[0].trim()).join(" → "),
  };
}
