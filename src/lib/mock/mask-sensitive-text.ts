export function maskSensitiveText(text: string) {
  return text.replace(/\b(0\d{3})\d{3}(\d{3})\b/g, "$1***$2");
}
