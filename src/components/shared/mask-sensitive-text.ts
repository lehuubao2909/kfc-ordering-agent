/** Che SĐT trong text hiển thị (staff console): 0901234567 → 0901***567. Dùng được cả client lẫn server. */
export function maskSensitiveText(text: string) {
  return text.replace(/\b(0\d{3})\d{3}(\d{3})\b/g, "$1***$2");
}
