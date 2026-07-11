/** Smoke test trace builder + Việt hoá (feedback 11/7 tối). Chạy: npx tsx scripts/smoke-test-trace-format.ts */
import { buildToolTrace } from "../src/lib/agent/agent-trace-detail";
import { formatTraceLine } from "../src/components/staff/tool-trace-labels";

const calls = [
  { toolName: "add_to_cart", input: { itemId: "ga-gion-cay-1-mieng", quantity: 2 } },
  { toolName: "set_delivery_info", input: { address: "350 THĐ Q5", phone: "0901234567" } },
  { toolName: "select_payment_method", input: { method: "cod" } },
];
const results = [
  { toolName: "add_to_cart", output: { ok: true, added: "Gà Giòn Cay (1 Miếng)", quantity: 2 } },
  { toolName: "set_delivery_info", output: { ok: true, store: { name: "KFC Nguyễn Trãi", closeHour: 22 }, storeWasOpen: true } },
  { toolName: "select_payment_method", output: { ok: true, orderId: "KFC-0009" } },
];

const trace = buildToolTrace(calls, results);
const line = trace.join(" → ");
const { display, raw } = formatTraceLine(line);
console.log("DB   :", line);
console.log("HIỂN :", display);
console.log("RAW  :", raw);

let fail = 0;
const expect = (name: string, ok: boolean) => { if (!ok) fail++; console.log(`${ok ? "✅" : "❌"} ${name}`); };
expect("có tên món + số lượng", display.includes("Thêm vào giỏ (Gà Giòn Cay (1 Miếng) ×2)"));
expect("có cửa hàng", display.includes("Lưu địa chỉ · chọn cửa hàng (KFC Nguyễn Trãi)"));
expect("có mã đơn + phương thức", display.includes("Tạo đơn & thanh toán (KFC-0009 · tiền mặt)"));
expect("raw giữ tên tool thật", raw === "add_to_cart → set_delivery_info → select_payment_method");
process.exit(fail === 0 ? 0 : 1);
