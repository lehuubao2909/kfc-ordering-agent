/**
 * Trang thanh toán mock — minh bạch là demo. OWNER: Dev C.
 * TODO(Dev C): tổng tiền + QR VietQR-style (ảnh tĩnh) + tab thẻ (form giả) +
 * nút "Tôi đã thanh toán (demo)" → POST /api/payment/confirm → màn cảm ơn.
 */
export default async function PaymentPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Thanh toán đơn {orderId}</h1>
      <p className="text-gray-500">TODO(Dev C): QR + nút xác nhận demo</p>
    </main>
  );
}
