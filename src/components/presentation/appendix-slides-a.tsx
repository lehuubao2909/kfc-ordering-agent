/** Appendix A1–A4 + slide ngăn cách. "Answer first — appendix chỉ là bằng chứng hỗ trợ" (BTC Playbook tr.17). */
import { Slide, Eyebrow, Title, Card, CardLabel, FlowRow } from "./slide-frame";

export const appendixSlidesA = [
  // ── Divider ───────────────────────────────────────────────────
  <Slide key="div" footer="Appendix" dark>
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <p className="text-[14px] font-black uppercase tracking-[0.3em] text-[#F2A33C]">Appendix · A1–A8</p>
      <h2 className="mt-4 text-[52px] font-black tracking-[-0.02em] text-white">Bằng chứng cho Q&A</h2>
      <p className="mt-4 max-w-[700px] text-[18px] text-white/60">Trả lời trước — chiếu appendix chỉ khi cần bằng chứng hỗ trợ.</p>
    </div>
  </Slide>,

  // ── A1. Agentic workflow chi tiết ─────────────────────────────
  <Slide key="a1" footer="A1 · Agentic Workflow">
    <Eyebrow>A1 — Agentic workflow</Eyebrow>
    <Title>State machine 11 trạng thái điều khiển vòng đời đơn</Title>
    <div className="mt-6 rounded-xl border border-[#1A2233]/10 bg-white p-5 font-mono text-[15px] font-bold leading-[2]">
      <p>BROWSING → CART ⇄ CONFIRMING → COLLECTING_DELIVERY → SELECTING_PAYMENT</p>
      <p className="pl-8 text-[#1A2233]/70">├─ COD → <span className="text-[#C8102E]">PLACED</span> → PREPARING → DELIVERING → DELIVERED</p>
      <p className="pl-8 text-[#1A2233]/70">└─ QR/thẻ → AWAITING_PAYMENT → <span className="text-[#C8102E]">PLACED</span> → …</p>
    </div>
    <div className="mt-5 grid grid-cols-3 gap-4">
      <Card><CardLabel>Tools khoá theo state</CardLabel><p className="mt-2 text-[14.5px] leading-relaxed">Mỗi trạng thái chỉ mở subset trong 14 tools — LLM không thể checkout khi chưa xác nhận đơn, kể cả bị prompt injection.</p></Card>
      <Card><CardLabel>Đồng bộ 2 chiều</CardLabel><p className="mt-2 text-[14.5px] leading-relaxed">Staff chuyển trạng thái đơn → session agent tự sync → khách nhận push; session lệch → tự self-heal ở lượt kế.</p></Card>
      <Card><CardLabel>Nhiều khách đồng thời</CardLabel><p className="mt-2 text-[14.5px] leading-relaxed">Per-conversation lock (CAS) + queue + dedupe theo mid + gom tin nhắn liên tiếp thành 1 lượt LLM.</p></Card>
    </div>
  </Slide>,

  // ── A2. Technical architecture ────────────────────────────────
  <Slide key="a2" footer="A2 · Technical Architecture">
    <Eyebrow>A2 — Technical architecture</Eyebrow>
    <Title>Kiến trúc là bằng chứng — không phải nhân vật chính</Title>
    <div className="mt-6">
      <FlowRow
        steps={[
          { label: "Messenger", note: "Khách nhắn fanpage thật (Meta dev mode)" },
          { label: "Webhook (Vercel)", note: "Verify chữ ký HMAC · dedupe mid · lock/queue" },
          { label: "Agent — gpt-5.4", note: "Vercel AI SDK · 14 tools state-gated · retry + graceful" },
          { label: "Service layer (TS thuần)", note: "Order state machine · store · voucher · loyalty · upsell" },
          { label: "Neon Postgres", note: "Toàn bộ state — serverless stateless 100%" },
        ]}
      />
    </div>
    <div className="mt-5 grid grid-cols-3 gap-4">
      <Card><CardLabel>Portable by design</CardLabel><p className="mt-2 text-[14.5px] leading-relaxed">Lõi là module TypeScript thuần không dính framework — đóng container vào hạ tầng chuẩn của KFC (Azure) ≈ 1 ngày, chỉ thay lớp route mỏng.</p></Card>
      <Card><CardLabel>Đúng policy Meta</CardLabel><p className="mt-2 text-[14.5px] leading-relaxed">Push ngoài 24h window dùng đúng tag POST_PURCHASE_UPDATE; marketing push qua Recurring Notifications opt-in (roadmap).</p></Card>
      <Card><CardLabel>Upsell không LLM</CardLabel><p className="mt-2 text-[14.5px] leading-relaxed">Gợi ý = daypart + co-occurrence đếm từ 4.964 giao dịch POS + ngưỡng voucher — deterministic, giải thích được từng gợi ý.</p></Card>
    </div>
  </Slide>,

  // ── A3. Safety + human oversight ──────────────────────────────
  <Slide key="a3" footer="A3 · Safety + Human Oversight">
    <Eyebrow>A3 — Safety + human oversight</Eyebrow>
    <Title>Tự động hoá có phanh</Title>
    <div className="mt-7 grid flex-1 grid-cols-2 gap-4">
      {[
        ["Tiền không qua tay LLM", "Giá/tổng/voucher chỉ do service tính từ DB. Tool validate item tồn tại trước khi thêm giỏ. Nói “đã đặt” bắt buộc có mã đơn thật từ tool."],
        ["Con người giám sát", "Khiếu nại/nhạy cảm (dị ứng, hoàn tiền) → handoff. Staff tiếp quản 1 nút — bot im lập tức; khách được báo rõ đang nói chuyện với người hay bot."],
        ["Dữ liệu khách", "SĐT mask ở admin/log · webhook verify chữ ký, từ chối request không ký ở production · secrets trong env · privacy policy công khai."],
        ["Chịu lỗi", "LLM lỗi → retry rồi xin lỗi gracefully, tin nhắn không mất (peek/mark-after) · thanh toán idempotent · trang /pay chặn đơn đã xử lý."],
      ].map(([t, d]) => (
        <Card key={t}><p className="text-[17px] font-black">{t}</p><p className="mt-2 text-[14.5px] leading-relaxed text-[#1A2233]/75">{d}</p></Card>
      ))}
    </div>
  </Slide>,

  // ── A4. User research (thành thật = chiều sâu) ────────────────
  <Slide key="a4" footer="A4 · User Research">
    <Eyebrow>A4 — User research · observed tasks trên Messenger thật</Eyebrow>
    <Title>Test thật, tìm ra bug thật, fix trong ngày</Title>
    <div className="mt-6 grid grid-rows-3 gap-3">
      {[
        ["Đơn giao xong, khách đặt tiếp bị từ chối", "Session kẹt trạng thái cũ + giỏ không xoá sau khi tạo đơn", "Self-healing session + sync trạng thái 2 chiều + clear giỏ — smoke test 6/6"],
        ["Bot nói “em đặt hàng ngay” nhưng không tạo đơn", "LLM “nói mà không làm” — thiếu ràng buộc nói=làm", "Rule NÓI=LÀM + ưu tiên tuyệt đối tool giao hàng — thêm case eval tái hiện, pass"],
        ["Bot bịa giá combo từ lịch sử chat cũ", "Ở trạng thái kẹt, agent mất tools nên diễn bằng lời", "TOOL > LỊCH SỬ trong prompt + mở đủ tools mọi trạng thái hợp lệ"],
      ].map(([bug, cause, fix]) => (
        <div key={bug} className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-[#C8102E]/25 bg-[#C8102E]/5 p-3.5"><p className="text-[11.5px] font-black uppercase tracking-[0.1em] text-[#C8102E]">Quan sát được</p><p className="mt-1 text-[13.5px] font-semibold leading-snug">{bug}</p></div>
          <div className="rounded-xl border border-[#1A2233]/10 bg-white p-3.5"><p className="text-[11.5px] font-black uppercase tracking-[0.1em] text-[#2563EB]">Root cause</p><p className="mt-1 text-[13.5px] font-semibold leading-snug">{cause}</p></div>
          <div className="rounded-xl border border-emerald-600/25 bg-emerald-50 p-3.5"><p className="text-[11.5px] font-black uppercase tracking-[0.1em] text-emerald-700">Fix + verify</p><p className="mt-1 text-[13.5px] font-semibold leading-snug">{fix}</p></div>
        </div>
      ))}
    </div>
    <p className="mt-4 text-center text-[14px] font-bold text-[#1A2233]/55">Mỗi bug thành 1 case trong eval suite — hệ không lặp lại lỗi cũ.</p>
  </Slide>,
];
