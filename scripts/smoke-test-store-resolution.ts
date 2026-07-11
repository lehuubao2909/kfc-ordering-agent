/** Smoke test store-service (Lead 11/7): match quận, giờ mở, fallback flagship, món hết. Chạy: npx tsx scripts/smoke-test-store-resolution.ts */
import "./load-env";

import { resolveStoreForAddress, getUnavailableCartItems } from "../src/lib/services/store-service";

async function main() {
  const noon = new Date("2026-07-11T12:00:00+07:00");
  const cases = [
    ["123 Nguyễn Trãi P2 Q5 HCM", "KFC Nguyễn Trãi"],
    ["45 Le Loi quan 1", "KFC Lê Lai"],
    ["88 Phan Xích Long Phú Nhuận", "KFC Phan Xích Long"],
    ["1 duong so 7 Vinh Long", "KFC Lê Lai"], // không match → flagship
  ] as const;

  let fail = 0;
  for (const [addr, expected] of cases) {
    const r = await resolveStoreForAddress(addr, noon);
    const pass = r.store.name === expected;
    if (!pass) fail++;
    console.log(`${pass ? "✅" : "❌"} "${addr}" → ${r.store.name} (open:${r.storeWasOpen}, fallback:${r.fallbackUsed})`);
  }

  // PXL đóng 21h → 21h30 phải chuyển cửa hàng khác đang mở, storeWasOpen=false
  const late = await resolveStoreForAddress("88 Phan Xích Long Phú Nhuận", new Date("2026-07-11T21:30:00+07:00"));
  const latePass = late.store.name !== "KFC Phan Xích Long" && late.storeWasOpen === false;
  if (!latePass) fail++;
  console.log(`${latePass ? "✅" : "❌"} PXL 21h30 → chuyển ${late.store.name}, wasOpen=${late.storeWasOpen}`);

  // Bánh trứng hết tại Nguyễn Trãi Q5
  const q5 = await resolveStoreForAddress("Q5", noon);
  const missing = getUnavailableCartItems(q5.store, { items: [{ itemId: "banh-trung-tan", quantity: 1 }] });
  const missPass = missing.includes("banh-trung-tan");
  if (!missPass) fail++;
  console.log(`${missPass ? "✅" : "❌"} Món hết tại ${q5.store.name}: [${missing.join(", ")}]`);

  console.log(fail === 0 ? "=== STORE RESOLUTION: ALL PASS ===" : `=== FAIL: ${fail} case ===`);
  process.exit(fail === 0 ? 0 : 1);
}

main();
