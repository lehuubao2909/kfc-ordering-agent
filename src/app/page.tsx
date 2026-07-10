/** Landing — QR vào Messenger cho giám khảo scan. OWNER: Dev C. */
export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-red-700 text-white">
      <h1 className="text-4xl font-bold">🍗 KFC Ordering Agent</h1>
      <p className="text-lg">Nhắn tin đặt hàng KFC bằng tiếng Việt — AABW 2026</p>
      {/* TODO(Dev C): QR code m.me/<page-id>?ref=demo + hướng dẫn 3 bước */}
      <p className="rounded bg-white/10 px-4 py-2">TODO(Dev C): QR m.me link</p>
    </main>
  );
}
