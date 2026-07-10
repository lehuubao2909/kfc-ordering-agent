/** Tracking page — link trong receipt chat. OWNER: Dev C. TODO: timeline trạng thái + ETA, polling 2s. */
export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Theo dõi đơn {id}</h1>
      <p className="text-gray-500">TODO(Dev C): order-status-timeline component</p>
    </main>
  );
}
