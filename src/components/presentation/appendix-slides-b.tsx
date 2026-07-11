/** Appendix A5–A8 + 2 slide Q&A prep (công thức trả lời + 6 câu 1-dòng theo rubric). */
import { Slide, Eyebrow, Title, Card, CardLabel, Callout } from "./slide-frame";

export const appendixSlidesB = [
  // ── A5. ROI ───────────────────────────────────────────────────
  <Slide key="a5" footer="A5 · Impact / ROI">
    <Eyebrow>A5 — ROI calculation · assumptions dán nhãn rõ</Eyebrow>
    <Title>Công thức trước, con số sau</Title>
    <div className="mt-6 rounded-2xl bg-[#101828] p-6 text-center">
      <p className="font-mono text-[22px] font-black text-white">Giá trị/năm = Đơn kênh chat/tháng × AOV × uplift × 12 <span className="text-[#F2A33C]">+</span> chuyển đổi thu hồi từ chat <span className="text-[#F2A33C]">+</span> giờ công đội trực page</p>
    </div>
    <div className="mt-5 grid grid-cols-3 gap-4">
      <Card><CardLabel>Đã đo (mock, minh bạch)</CardLabel><p className="mt-2 text-[14.5px] leading-relaxed">Backtest 4.964 giao dịch POS: AOV +2.7% với acceptance 20% · upsell ngưỡng voucher tăng giá trị giỏ ngay trong demo.</p></Card>
      <Card><CardLabel>Từ đề bài KFC</CardLabel><p className="mt-2 text-[14.5px] leading-relaxed">KFC ước tính upsell đúng ngữ cảnh tăng AOV 10–15% · kênh chat hiện chuyển đổi ≈ 0 vì 100% xử lý tay.</p></Card>
      <Card><CardLabel>Pilot đo thật</CardLabel><p className="mt-2 text-[14.5px] leading-relaxed">A/B trên fanpage thật: completion rate, AOV delta, thời gian phản hồi, CSAT — 2 tuần có số thật thay mọi giả định.</p></Card>
    </div>
    <div className="mt-5"><Callout>Chi phí LLM &lt;2% giá trị đơn — và chỉ kênh chat dùng LLM, upsell engine chạy deterministic miễn phí.</Callout></div>
  </Slide>,

  // ── A6. Alternatives ──────────────────────────────────────────
  <Slide key="a6" footer="A6 · Alternatives">
    <Eyebrow>A6 — Alternatives · vì sao cách này</Eyebrow>
    <Title>So với hai lối đi quen thuộc</Title>
    <div className="mt-6 grid flex-1 grid-cols-3 gap-4">
      {[
        ["Rule-based bot (menu nút bấm)", "Không hiểu “cho anh 2 gà cay ít cay giao Q5 trả tiền mặt” trong 1 câu · mỗi thay đổi flow = code lại cây nút", "❌ Cứng, không tự nhiên"],
        ["General LLM assistant", "Trả lời hay nhưng không được phép cầm tiền: không state machine, không tool gating → bịa giá, đặt nhầm là chuyện chắc chắn xảy ra", "❌ Không kiểm soát"],
        ["Hybrid của chúng tôi", "LLM lo ngôn ngữ tự nhiên · state machine + 14 tools khoá theo bước lo tiền và đơn · handoff lo ngoại lệ", "✅ Tự nhiên + an toàn"],
      ].map(([t, d, verdict], i) => (
        <Card key={t} className={i === 2 ? "border-2 !border-[#C8102E]" : ""}>
          <p className="text-[17px] font-black leading-tight">{t}</p>
          <p className="mt-2.5 text-[14.5px] leading-relaxed text-[#1A2233]/75">{d}</p>
          <p className="mt-3 text-[15px] font-black">{verdict}</p>
        </Card>
      ))}
    </div>
    <p className="mt-4 text-center text-[14.5px] font-bold text-[#1A2233]/55">“GenAI ở chỗ cần ngôn ngữ — deterministic ở chỗ đụng đến tiền.”</p>
  </Slide>,

  // ── A7. Evaluation results ────────────────────────────────────
  <Slide key="a7" footer="A7 · Evaluation Results">
    <Eyebrow>A7 — Evaluation results</Eyebrow>
    <Title>Eval tự động — không tin cảm giác</Title>
    <div className="mt-7 grid grid-cols-[0.9fr_1.1fr] gap-5">
      <Card className="flex flex-col items-center justify-center text-center">
        <p className="text-[72px] font-black leading-none text-[#C8102E]">26/26</p>
        <p className="mt-2 text-[16px] font-bold">NLU eval tiếng Việt · gpt-5.4</p>
        <p className="mt-1 text-[13.5px] text-[#1A2233]/60">Chạy tự động qua agent thật + services thật + DB thật</p>
      </Card>
      <div className="grid grid-rows-4 gap-2.5">
        {[
          ["NLU (9 case)", "gọi món tự nhiên, số lượng, size mơ hồ → hỏi lại, gộp nhiều ý 1 câu"],
          ["Flow (8 case)", "confirm → giao hàng → COD/QR → tracking → huỷ đúng luật"],
          ["Guardrail (6 case)", "món không tồn tại → không bịa · nói COD sớm → vẫn tạo đơn thật"],
          ["Store-aware (3 case)", "resolve đúng quận · cửa hàng đóng → chuyển · món hết → gợi ý thay"],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center gap-3 rounded-xl border border-[#1A2233]/10 bg-white px-4 py-2">
            <span className="w-[150px] shrink-0 text-[13px] font-black text-[#2563EB]">{k}</span>
            <span className="text-[13.5px] font-semibold leading-snug text-[#1A2233]/80">{v}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="mt-5"><Callout>Eval là phanh hồi quy: hôm nay từng tụt 21/24 sau 1 thay đổi — bắt được và sửa TRƯỚC khi deploy.</Callout></div>
  </Slide>,

  // ── A8. Roadmap + limitations ─────────────────────────────────
  <Slide key="a8" footer="A8 · Roadmap + Limitations">
    <Eyebrow>A8 — Roadmap + limitations · nói thật</Eyebrow>
    <Title>Biết rõ mình đang ở đâu</Title>
    <div className="mt-6 grid flex-1 grid-cols-2 gap-5">
      <Card>
        <CardLabel>Giới hạn hiện tại (demo)</CardLabel>
        <ul className="mt-3 space-y-2.5 text-[14.5px] font-semibold leading-snug text-[#1A2233]/80">
          <li>• Data synthetic (BTC xác nhận hướng đúng khi chưa có data thật)</li>
          <li>• Thanh toán mock minh bạch — chưa nối cổng thật</li>
          <li>• Cửa hàng match theo quận, chưa check bán kính giao</li>
          <li>• Messenger dev mode — người dùng cần role tester</li>
        </ul>
      </Card>
      <Card>
        <CardLabel color="text-emerald-700">Roadmap sau pilot</CardLabel>
        <ul className="mt-3 space-y-2.5 text-[14.5px] font-semibold leading-snug text-[#1A2233]/80">
          <li>• Nối POS/OMS + loyalty thật của KFC (schema đã mirror sẵn)</li>
          <li>• VNPay/MoMo webhook · distance API · menu overlay per-store</li>
          <li>• Zalo cùng agent core (chỉ thêm adapter) · kiosk P2 cùng engine upsell</li>
          <li>• Recurring Notifications opt-in · chống bom hàng (COD limit, blacklist)</li>
        </ul>
      </Card>
    </div>
  </Slide>,

  // ── Q&A prep 1: công thức ─────────────────────────────────────
  <Slide key="qa1" footer="Q&A Prep · nội bộ" dark>
    <Eyebrow dark>Q&A · công thức 15–25 giây mỗi câu</Eyebrow>
    <Title>Answer → Support → Connect</Title>
    <div className="mt-8 grid grid-cols-3 gap-4">
      {[
        ["1 · ANSWER", "Kết luận trước, không rào đón", "“Có — agent xử lý được nhiều khách cùng lúc.”"],
        ["2 · SUPPORT", "Đúng 1 fact/bằng chứng", "“Per-conversation lock + queue, đã test 2 máy nhắn song song.”"],
        ["3 · CONNECT", "Quay về giá trị người dùng", "“Nên giờ cao điểm trưa không khách nào phải chờ.”"],
      ].map(([t, d, ex]) => (
        <div key={t} className="rounded-2xl bg-white/10 p-5">
          <p className="text-[15px] font-black uppercase tracking-[0.12em] text-[#F2A33C]">{t}</p>
          <p className="mt-2 text-[15px] font-bold text-white">{d}</p>
          <p className="mt-3 text-[13.5px] italic leading-snug text-white/65">{ex}</p>
        </div>
      ))}
    </div>
    <div className="mt-6"><Callout dark>Bị hỏi thứ chưa có: “Chưa validated — cái chúng tôi biết là X, và sẽ test bằng Y ở pilot.” · Mở đầu Q&A: “Cho phép em gom câu hỏi trước ạ?” (0:20 gom · 1:20 trả lời)</Callout></div>
  </Slide>,

  // ── Q&A prep 2: 6 câu 1-dòng ──────────────────────────────────
  <Slide key="qa2" footer="Q&A Prep · nội bộ" dark>
    <Eyebrow dark>6 câu 1-dòng theo rubric — cả team thuộc lòng</Eyebrow>
    <Title>Mỗi tiêu chí, một câu</Title>
    <div className="mt-6 grid flex-1 grid-rows-6 gap-2">
      {[
        ["AGENTIC AI", "Agent lập kế hoạch và hành động qua 14 tools khoá theo trạng thái — tool-trace hiện từng quyết định theo thời gian thực."],
        ["TRACK FIT", "Giải đúng P4 của KFC: kênh chat đang 100% xử lý tay, chúng tôi biến nó thành kênh bán hàng tự động đầu tiên."],
        ["EXECUTION", "Flow 11 bước chạy thật trên Messenger: đặt → thanh toán → tracking → giao — eval 26/26, smoke 25/25."],
        ["IMPACT", "Đơn chốt trong chat <2 phút, upsell theo ngưỡng voucher tăng AOV, đội trực page thoát việc lặp lại."],
        ["CREATIVITY", "Hybrid: LLM giữ hội thoại, state machine giữ tiền — general assistant không được phép cầm tiền, hệ này thì có, an toàn."],
        ["CLARITY", "Một câu kể lại được: “Nhắn tin cho KFC như nhắn bạn — và đơn hàng tự chạy tới cửa.”"],
      ].map(([k, v]) => (
        <div key={k} className="flex items-center gap-4 rounded-xl bg-white/8 px-5 py-2.5">
          <span className="w-[130px] shrink-0 text-[12.5px] font-black uppercase tracking-[0.1em] text-[#F2A33C]">{k}</span>
          <span className="text-[15px] font-semibold leading-snug text-white">{v}</span>
        </div>
      ))}
    </div>
  </Slide>,
];
