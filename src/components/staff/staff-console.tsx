"use client";

/**
 * Staff console — DATA THẬT từ /api/admin/** (polling 3s), KHÔNG mock.
 * - Tiếp quản/Bàn giao: POST takeover {psid, mode} → bot mute/unmute (contract mode=human).
 * - Gõ tay: POST send {psid, text} → gửi Messenger thật + log message_log.
 * - Chuyển trạng thái đơn: POST orders/advance {orderId, to} → khách nhận push.
 * Phải nằm trong <AdminAuthGate> (useAdminFetch gắn Basic auth).
 */
import { FormEvent, useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { ConversationSummary } from "@/lib/services/conversation-admin-service";
import type { AdminOrder } from "@/lib/services/admin-metrics-service";
import type { OrderState } from "@/lib/types";
import { useAdminFetch } from "@/components/admin/admin-auth-gate";
import { ConversationList } from "./conversation-list";
import { TranscriptViewer, TranscriptEntry } from "./transcript-viewer";
import { OrderStatusAdvancePanel } from "./order-status-advance-panel";

type StaffTab = "conversations" | "orders";
const POLL_MS = 3000;

export function StaffConsole() {
  const adminFetch = useAdminFetch();
  const [tab, setTab] = useState<StaffTab>("conversations");
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedPsid, setSelectedPsid] = useState("");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState("");
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);

  const selected = conversations.find((item) => item.psid === selectedPsid) ?? conversations[0] ?? null;
  const liveOrderCount = orders.filter((order) => ["PLACED", "PREPARING", "DELIVERING"].includes(order.status)).length;

  const refresh = useCallback(async () => {
    try {
      const [convRes, ordersRes] = await Promise.all([
        adminFetch("/api/admin/conversations"),
        adminFetch("/api/admin/orders"),
      ]);
      if (convRes.ok) {
        const json = await convRes.json();
        if (json.ok) setConversations(json.data.conversations);
      }
      if (ordersRes.ok) {
        const json = await ordersRes.json();
        if (json.ok) setOrders(json.data.orders);
      }
      setLoaded(true);
    } catch (err) {
      console.error("staff refresh lỗi:", err);
    }
  }, [adminFetch]);

  const refreshTranscript = useCallback(async (psid: string) => {
    try {
      const res = await adminFetch(`/api/admin/conversations?psid=${encodeURIComponent(psid)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.ok) setTranscript(json.data.transcript);
      }
    } catch (err) {
      console.error("transcript lỗi:", err);
    }
  }, [adminFetch]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, POLL_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  const activePsid = selected?.psid ?? "";
  useEffect(() => {
    if (!activePsid) return;
    setTranscript([]);
    refreshTranscript(activePsid);
    const timer = setInterval(() => refreshTranscript(activePsid), POLL_MS);
    return () => clearInterval(timer);
  }, [activePsid, refreshTranscript]);

  function flashNotice(text: string) {
    setNotice(text);
    setTimeout(() => setNotice(""), 3000);
  }

  async function toggleMode() {
    if (!selected) return;
    const nextMode = selected.mode === "agent" ? "human" : "agent";
    const res = await adminFetch("/api/admin/conversations/takeover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ psid: selected.psid, mode: nextMode }),
    });
    if (!res.ok) return flashNotice("Không đổi được chế độ, thử lại.");
    setConversations((current) => current.map((item) => (item.psid === selected.psid ? { ...item, mode: nextMode } : item)));
    flashNotice(nextMode === "human" ? "Bạn đã tiếp quản cuộc trò chuyện — bot tạm dừng." : "Đã bàn giao lại cho Trợ lý AI.");
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const form = event.currentTarget;
    const text = String(new FormData(form).get("message") ?? "").trim();
    if (!text) return;
    const res = await adminFetch("/api/admin/conversations/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ psid: selected.psid, text }),
    });
    if (!res.ok) return flashNotice("Gửi thất bại — kiểm tra kết nối Messenger.");
    setTranscript((current) => [...current, { direction: "out", text, createdAt: new Date().toISOString() }]);
    form.reset();
    flashNotice("Đã gửi tin nhắn tới khách qua Messenger.");
  }

  async function advanceOrder(id: string, status: OrderState) {
    setBusyOrderId(id);
    const res = await adminFetch("/api/admin/orders/advance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: id, to: status }),
    });
    setBusyOrderId(null);
    if (!res.ok) {
      const json = await res.json().catch(() => null);
      return flashNotice(json?.error?.message ?? "Không chuyển được trạng thái.");
    }
    setOrders((current) => current.map((order) => (order.id === id ? { ...order, status, updatedAt: new Date().toISOString() } : order)));
    flashNotice(`Đơn ${id} đã cập nhật — khách nhận thông báo Messenger.`);
  }

  if (!loaded) return <div className="premium-card rounded-2xl p-8 text-center text-sm text-zinc-400">Đang tải dữ liệu vận hành…</div>;

  return <div className="relative"><div className="mb-4 grid grid-cols-2 gap-1 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-sm" role="tablist" aria-label="Khu vực Staff Console"><button id="conversations-tab" type="button" role="tab" aria-selected={tab === "conversations"} aria-controls="conversations-panel" onClick={() => setTab("conversations")} className={`rounded-xl px-3 py-3 text-sm font-black focus-visible:ring-2 focus-visible:ring-red-600 ${tab === "conversations" ? "bg-zinc-950 text-white shadow-sm" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"}`}>Tin nhắn / Chat <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] ${tab === "conversations" ? "bg-white/15" : "bg-zinc-200"}`}>{conversations.length}</span></button><button id="orders-tab" type="button" role="tab" aria-selected={tab === "orders"} aria-controls="orders-panel" onClick={() => setTab("orders")} className={`rounded-xl px-3 py-3 text-sm font-black focus-visible:ring-2 focus-visible:ring-red-600 ${tab === "orders" ? "bg-zinc-950 text-white shadow-sm" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"}`}>Quản lý đơn hàng <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] ${tab === "orders" ? "bg-white/15" : "bg-red-100 text-red-700"}`}>{liveOrderCount}</span></button></div>

    <AnimatePresence mode="wait" initial={false}>{tab === "conversations" ? <motion.section key="conversations" id="conversations-panel" role="tabpanel" aria-labelledby="conversations-tab" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} className="premium-card overflow-hidden rounded-2xl">{!selected ? <p className="p-10 text-center text-sm text-zinc-400">Chưa có hội thoại nào — sẽ hiện khi khách nhắn vào page Messenger.</p> : <div className="grid lg:min-h-[650px] lg:grid-cols-[300px_1fr]"><ConversationList conversations={conversations} selectedPsid={selected.psid} onSelect={setSelectedPsid} /><div className="flex min-h-0 flex-col"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 bg-white/80 px-4 py-4 sm:px-6"><div className="min-w-0"><div className="flex items-center gap-2"><h2 className="truncate font-black">{selected.customerName}</h2><span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${selected.mode === "human" ? "bg-amber-100 text-amber-800" : "bg-blue-50 text-blue-700"}`}>{selected.mode === "human" ? "Nhân viên trực" : "Trợ lý AI"}</span></div><p className="truncate text-xs text-zinc-400">PSID <span translate="no">••••{selected.psid.slice(-4)}</span>{selected.activeOrderId ? ` · ${selected.activeOrderId}` : ""}</p></div><motion.button whileTap={{ scale: 0.96 }} type="button" onClick={toggleMode} className={`rounded-xl px-4 py-2.5 text-xs font-black shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 max-[420px]:w-full ${selected.mode === "human" ? "bg-zinc-900 text-white hover:bg-zinc-700 focus-visible:ring-zinc-900" : "bg-red-700 text-white hover:bg-red-600 focus-visible:ring-red-700"}`}>{selected.mode === "human" ? "Bàn giao cho AI" : "Tiếp quản chat"}</motion.button></header><TranscriptViewer customerName={selected.customerName} entries={transcript} /><form onSubmit={sendMessage} className="border-t border-zinc-200 bg-white p-3 sm:p-4"><label htmlFor="staff-message" className="sr-only">Tin nhắn trả lời khách hàng</label><div className="flex gap-2 rounded-2xl bg-zinc-100 p-1.5 focus-within:ring-2 focus-within:ring-red-100"><input id="staff-message" name="message" autoComplete="off" placeholder={selected.mode === "human" ? "Nhập nội dung tin nhắn..." : "Tiếp quản cuộc trò chuyện để phản hồi..."} disabled={selected.mode !== "human"} className="min-w-0 flex-1 rounded-xl border-0 bg-white px-3 py-3 text-sm shadow-sm disabled:cursor-not-allowed disabled:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-red-500 sm:px-4" /><motion.button whileTap={{ scale: 0.94 }} disabled={selected.mode !== "human"} className="shrink-0 rounded-xl bg-red-700 px-4 py-3 text-sm font-black text-white hover:bg-red-600 focus-visible:ring-2 focus-visible:ring-red-700 disabled:cursor-not-allowed disabled:bg-zinc-300 sm:px-5">Gửi tin</motion.button></div></form></div></div>}</motion.section> : <motion.div key="orders" id="orders-panel" role="tabpanel" aria-labelledby="orders-tab" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}><OrderStatusAdvancePanel orders={orders} onAdvance={advanceOrder} busyOrderId={busyOrderId} /></motion.div>}</AnimatePresence>

    <AnimatePresence mode="wait">{notice ? <motion.div key={notice} initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6 }} className="fixed inset-x-4 bottom-4 z-50 rounded-xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white shadow-2xl sm:left-auto sm:right-5 sm:max-w-sm" role="status">✓ {notice}</motion.div> : null}</AnimatePresence>
  </div>;
}
