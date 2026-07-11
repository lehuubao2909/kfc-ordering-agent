/** Deck chính 6 slides theo khung BTC (Team+Promise → Demo+Close). Nội dung khớp Five-Minute Map. */
import { Slide, Eyebrow, Title, Card, CardLabel, FlowRow, Callout, TEAM_NAME } from "./slide-frame";

export const mainDeckSlides = [
  // ── 1. TEAM + PROMISE (0:00–0:40) ─────────────────────────────
  <Slide key="s1" footer="01 · Team + Promise">
    <div className="flex flex-1 flex-col justify-center">
      <Eyebrow>{TEAM_NAME} · Agentic AI Build Week 2026</Eyebrow>
      <h1 className="mt-3 text-[64px] font-black leading-[1.02] tracking-[-0.03em]">
        KFC Ordering <span className="text-[#C8102E]">Agent</span>
      </h1>
      <p className="mt-7 max-w-[900px] text-[26px] font-semibold leading-[1.4]">
        Với khách KFC đang nhắn tin sẵn trên Messenger, chúng tôi biến <em>hội thoại</em> thành <em>đơn hàng hoàn chỉnh</em> — bằng AI agent tự lập kế hoạch, hành động qua tools và tự kiểm chứng.
      </p>
      <div className="mt-10 flex gap-3">
        {["Domain F&B", "AI Engineering", "Product"].map((c) => (
          <span key={c} className="rounded-full border border-[#1A2233]/15 bg-white px-4 py-2 text-[14px] font-black">{c}</span>
        ))}
        <span className="rounded-full bg-[#C8102E] px-4 py-2 text-[14px] font-black text-white">F&B powered by KFC · Problem 4: AI-powered conversational ordering via chat</span>
      </div>
    </div>
  </Slide>,

  // ── 2. PROBLEM INSIGHT (0:40–1:20) ────────────────────────────
  <Slide key="s2" footer="02 · Problem Insight">
    <Eyebrow>Problem Insight — “We discovered…”</Eyebrow>
    <Title>Khách đã ở trong chat. Người trực page là nút thắt.</Title>
    <div className="mt-7 grid flex-1 grid-cols-[1.15fr_0.85fr] gap-5">
      <div className="grid grid-rows-5 gap-2.5">
        {[
          ["WHO", "Khách KFC high-intent — nhắn fanpage TRƯỚC khi nghĩ tới việc mở app/web"],
          ["GOAL", "Đặt món xong ngay trong cuộc chat, không chuyển kênh"],
          ["FRICTION", "Đặt hàng phải rời chat sang app → rơi rớt chuyển đổi giữa đường"],
          ["ROOT CAUSE", "100% tin nhắn xử lý tay — tốc độ người trực = trần của doanh số kênh chat"],
          ["EVIDENCE", "Đề bài KFC: 250+ cửa hàng, hàng triệu khách/tháng, chưa có conversational ordering"],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center gap-4 rounded-xl border border-[#1A2233]/10 bg-white px-4 py-2.5">
            <span className="w-[118px] shrink-0 text-[12px] font-black uppercase tracking-[0.12em] text-[#2563EB]">{k}</span>
            <span className="text-[15.5px] font-semibold leading-snug">{v}</span>
          </div>
        ))}
      </div>
      {/* div thuần thay Card: tránh xung đột bg-white của Card với nền tối (bug PDF lần 1) */}
      <div className="flex flex-col justify-center rounded-2xl bg-[#101828] p-5">
        <p className="text-[13px] font-black uppercase tracking-[0.18em] text-[#F2A33C]">One insight</p>
        <p className="mt-3 text-[24px] font-black leading-[1.3] text-white">
          Kênh chat của KFC không thiếu khách — thiếu <span className="text-[#F2A33C]">người chốt đơn 24/7</span>.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-white/70">Agent không tạo demand mới — nó thu hoạch demand đang rơi rớt mỗi ngày.</p>
      </div>
    </div>
  </Slide>,

  // ── 3. AGENTIC WORKFLOW (1:20–2:20) ───────────────────────────
  <Slide key="s3" footer="03 · Agentic Workflow">
    <Eyebrow>Agentic Workflow — agent làm việc, không chỉ trả lời</Eyebrow>
    <Title>Goal → Plan → Tools → Act → Verify, trên một câu nhắn thật</Title>
    <p className="mt-3 rounded-lg bg-white px-4 py-2 font-mono text-[15px] font-bold text-[#1A2233]/80">
      Khách: “giao 350 Trần Hưng Đạo Q5, sđt 090…, thanh toán tiền mặt luôn nhé”
    </p>
    <div className="mt-5">
      <FlowRow
        highlight={3}
        steps={[
          { label: "GOAL", note: "Hiểu: chốt đơn COD về địa chỉ Q5" },
          { label: "PLAN", note: "Resolve cửa hàng → check món hết → chốt COD" },
          { label: "TOOLS", note: "set_delivery_info · select_payment_method (trong 14 tools)" },
          { label: "ACT", note: "Route về KFC Nguyễn Trãi (mở đến 22h) · tạo đơn KFC-0001" },
          { label: "VERIFY", note: "State machine + service validate 2 lớp · sai bước = tool bị khoá" },
        ]}
      />
    </div>
    <div className="mt-5 grid grid-cols-[1fr_1fr] gap-4">
      <Card>
        <CardLabel>Nhìn thấy được — không phải hộp đen</CardLabel>
        <p className="mt-2 text-[15px] leading-relaxed">Staff console hiện <b>nhật ký quyết định từng lượt</b>: <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[12px] font-bold text-violet-700">🔧 Lưu địa chỉ · chọn cửa hàng (KFC Nguyễn Trãi) → Tạo đơn & thanh toán (KFC-0001 · tiền mặt)</span> — giám khảo xem agent quyết định theo thời gian thực.</p>
      </Card>
      <Card>
        <CardLabel>Kỷ luật công cụ</CardLabel>
        <p className="mt-2 text-[15px] leading-relaxed"><b>14 tools bị khoá theo 11 trạng thái đơn</b> — chưa xác nhận đơn thì tool thanh toán không tồn tại với LLM. Muốn nói “đã đặt hàng” phải có mã đơn thật từ tool.</p>
      </Card>
    </div>
  </Slide>,

  // ── 4. WHY IT WINS (2:20–3:05) ────────────────────────────────
  <Slide key="s4" footer="04 · Why It Wins">
    <Eyebrow>Why it wins — mỗi feature dịch thành giá trị</Eyebrow>
    <Title>LLM giữ hội thoại. State machine giữ tiền.</Title>
    <div className="mt-7 grid flex-1 grid-cols-3 gap-4">
      {[
        ["Hybrid agent + state machine", "LLM không bao giờ tự quyết giá/đơn — mọi con số từ DB qua tools, validate 2 lớp.", "→ Khách chốt đơn <2 phút, không một giá bịa."],
        ["Store-aware 250 cửa hàng", "Đơn route đúng cửa hàng theo địa chỉ, biết giờ mở cửa và món hết TRƯỚC khi nhận đơn.", "→ Không nhận đơn không giao được — vận hành tin được."],
        ["Con người đúng chỗ", "Khiếu nại/nhạy cảm → handoff; staff tiếp quản 1 nút, khách luôn biết đang nói với ai.", "→ Tự động hoá có kiểm soát — tiêu chuẩn enterprise."],
      ].map(([t, d, so]) => (
        <Card key={t} className="flex flex-col">
          <p className="text-[18px] font-black leading-tight">{t}</p>
          <p className="mt-2.5 flex-1 text-[14.5px] leading-relaxed text-[#1A2233]/75">{d}</p>
          <p className="mt-3 border-t border-dashed border-[#1A2233]/15 pt-2.5 text-[14.5px] font-bold text-[#C8102E]">{so}</p>
        </Card>
      ))}
    </div>
    <div className="mt-5">
      <Callout>“Vì sao general assistant không làm được?” — Vì nó không được phép cầm tiền. Hệ này thì có, một cách an toàn.</Callout>
    </div>
  </Slide>,

  // ── 5. EVIDENCE + IMPACT (3:05–3:50) ──────────────────────────
  <Slide key="s5" footer="05 · Evidence + Impact">
    <Eyebrow>Evidence — dán nhãn trung thực theo chuẩn BTC</Eyebrow>
    <Title>Số nào đo được, số nào giả định — nói rõ</Title>
    <div className="mt-7 grid grid-cols-3 gap-4">
      <Card className="border-l-4 !border-l-[#2563EB]">
        <CardLabel color="text-[#2563EB]">Level 2 · Benchmark — ĐO ĐƯỢC</CardLabel>
        <p className="mt-2 text-[44px] font-black leading-none">26/26</p>
        <p className="mt-2 text-[14.5px] leading-snug text-[#1A2233]/75">NLU eval tiếng Việt tự động, có case bẫy chống bịa món · chạy lại sau mỗi thay đổi (bắt được 2 regression trong ngày)</p>
      </Card>
      <Card className="border-l-4 !border-l-[#F2A33C]">
        <CardLabel color="text-[#B45309]">Level 1 · Assumption — DÁN NHÃN</CardLabel>
        <p className="mt-2 text-[44px] font-black leading-none">+2.7%</p>
        <p className="mt-2 text-[14.5px] leading-snug text-[#1A2233]/75">AOV uplift backtest trên 4.964 giao dịch POS mô phỏng, acceptance 20% — thận trọng so với 10–15% KFC ước tính trong đề</p>
      </Card>
      <Card className="border-l-4 !border-l-[#C8102E]">
        <CardLabel>Impact khi scale</CardLabel>
        <p className="mt-2 text-[20px] font-black leading-snug">Đơn chat/tháng × AOV × uplift</p>
        <p className="mt-2 text-[14.5px] leading-snug text-[#1A2233]/75">+ Thu hồi chuyển đổi kênh chat (hiện = 0 vì xử lý tay) + giảm tải đội trực page · pilot đo thật bằng A/B</p>
      </Card>
    </div>
    <div className="mt-5 grid grid-cols-4 gap-3">
      {[["Order completion", "flow 11 bước chạy thật"], ["NLU accuracy", "26/26 · gpt-5.4"], ["Upsell theo ngưỡng", "“thêm 11k → freeship, lợi 20k”"], ["Voucher tự áp", "mã tốt nhất, không cần nhớ"]].map(([k, v]) => (
        <div key={k} className="rounded-xl border border-[#1A2233]/10 bg-white px-4 py-3">
          <p className="text-[12.5px] font-black uppercase tracking-[0.1em] text-[#2563EB]">{k}</p>
          <p className="mt-1 text-[13.5px] font-semibold text-[#1A2233]/75">{v}</p>
        </div>
      ))}
    </div>
  </Slide>,

  // ── 6. DEMO + CLOSE (3:50–4:50) ───────────────────────────────
  <Slide key="s6" footer="06 · Demo + Close">
    <Eyebrow>Demo 60 giây — kết ở outcome của khách</Eyebrow>
    <Title>Xem agent chốt một đơn thật</Title>
    <div className="mt-6">
      <FlowRow
        highlight={2}
        steps={[
          { label: "0–10s · GOAL", note: "Khách đói, nhắn fanpage như nhắn bạn" },
          { label: "10–20s · TRIGGER", note: "“Cho anh combo gà rán + pepsi”" },
          { label: "20–45s · AGENT ACTS", note: "Tool-trace chạy: cart → upsell mốc voucher → store → COD" },
          { label: "45–55s · OUTCOME", note: "Mã đơn KFC-xxxx + link tracking về máy khách" },
          { label: "55–60s · PROOF", note: "Admin: funnel + AOV + NLU 26/26 nhảy số live" },
        ]}
      />
    </div>
    <div className="mt-6 grid grid-cols-[1.2fr_0.8fr] gap-4">
      <Card className="flex items-center">
        <p className="text-[17px] font-bold leading-relaxed">Màn hình đôi khi demo: <b>điện thoại</b> (trải nghiệm khách) + <b>staff console</b> (não agent qua tool-trace) — giám khảo thấy cả hai phía của cùng một hội thoại.</p>
      </Card>
      <div className="rounded-2xl bg-[#101828] p-5 text-center">
        <p className="text-[13px] font-black uppercase tracking-[0.18em] text-[#F2A33C]">Close</p>
        <p className="mt-2 text-[19px] font-black leading-snug text-white">Từ 100% trả lời tay → agent bán hàng 24/7. Pilot được ngay trên fanpage thật của KFC.</p>
      </div>
    </div>
  </Slide>,
];
