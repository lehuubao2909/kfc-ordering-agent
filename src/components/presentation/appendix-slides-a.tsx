/**
 * Appendix divider + A1–A4. "Answer first — appendix chỉ là bằng chứng hỗ trợ" (BTC Playbook tr.17).
 * Nội dung tiếng Anh theo bản của thành viên thuyết trình (12/7).
 */
import { Slide, Eyebrow, Title, Card, CardLabel, FlowRow } from "./slide-frame";

export const appendixSlidesA = [
  // ── Divider ───────────────────────────────────────────────────
  <Slide key="div" footer="Appendix" dark>
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <p className="text-[14px] font-black uppercase tracking-[0.3em] text-[#F2A33C]">Appendix · A1–A8</p>
      <h2 className="mt-4 text-[52px] font-black tracking-[-0.02em] text-white">Evidence for Q&A</h2>
      <p className="mt-4 max-w-[720px] text-[18px] text-white/60">We answer first — and show an appendix slide only when a claim needs support.</p>
    </div>
  </Slide>,

  // ── A1. Agentic workflow chi tiết ─────────────────────────────
  <Slide key="a1" footer="A1 · Agentic Workflow">
    <Eyebrow>A1 — Agentic workflow</Eyebrow>
    <Title>An 11-state machine drives the order lifecycle</Title>
    <div className="mt-6 rounded-xl border border-[#1A2233]/10 bg-white p-5 font-mono text-[15px] font-bold leading-[2]">
      <p>BROWSING → CART ⇄ CONFIRMING → COLLECTING_DELIVERY → SELECTING_PAYMENT</p>
      <p className="pl-8 text-[#1A2233]/70">├─ COD → <span className="text-[#C8102E]">PLACED</span> → PREPARING → DELIVERING → DELIVERED</p>
      <p className="pl-8 text-[#1A2233]/70">└─ QR/card → AWAITING_PAYMENT → <span className="text-[#C8102E]">PLACED</span> → …</p>
    </div>
    <div className="mt-5 grid grid-cols-3 gap-4">
      <Card><CardLabel>Tools locked by state</CardLabel><p className="mt-2 text-[14.5px] leading-relaxed">Each state opens only a subset of the 14 tools — the LLM can't check out before an order is confirmed, even under prompt injection.</p></Card>
      <Card><CardLabel>Two-way sync</CardLabel><p className="mt-2 text-[14.5px] leading-relaxed">Staff change the order state → the agent session syncs → the customer gets a push; a drifted session self-heals on the next turn.</p></Card>
      <Card><CardLabel>Many customers at once</CardLabel><p className="mt-2 text-[14.5px] leading-relaxed">Per-conversation lock (CAS) + queue + dedupe by mid + consecutive messages merged into one LLM turn.</p></Card>
    </div>
  </Slide>,

  // ── A2. Technical architecture ────────────────────────────────
  <Slide key="a2" footer="A2 · Technical Architecture">
    <Eyebrow>A2 — Technical architecture</Eyebrow>
    <Title>Architecture is evidence — not the main character</Title>
    <div className="mt-6">
      <FlowRow
        steps={[
          { label: "Messenger", note: "Customers message the real fanpage (Meta dev mode)" },
          { label: "Webhook · Vercel", note: "Verify HMAC signature · dedupe mid · lock / queue" },
          { label: "Agent · GPT-5.4", note: "Vercel AI SDK · 14 state-gated tools · retry + graceful" },
          { label: "Service layer · TS", note: "Order state machine · store · voucher · loyalty · upsell" },
          { label: "Neon Postgres", note: "All state — serverless, 100% stateless app" },
        ]}
      />
    </div>
    <div className="mt-5 grid grid-cols-3 gap-4">
      <Card><CardLabel>Portable by design</CardLabel><p className="mt-2 text-[14.5px] leading-relaxed">The core is framework-free TypeScript — containerize onto KFC's standard infra (Azure) in ≈ 1 day, swapping only a thin route layer.</p></Card>
      <Card><CardLabel>Meta-policy correct</CardLabel><p className="mt-2 text-[14.5px] leading-relaxed">Push outside the 24h window uses POST_PURCHASE_UPDATE; marketing push goes via Recurring Notifications opt-in (roadmap).</p></Card>
      <Card><CardLabel>Upsell without the LLM</CardLabel><p className="mt-2 text-[14.5px] leading-relaxed">Suggestions = daypart + co-occurrence counted from 4,964 POS transactions + voucher thresholds — deterministic, explainable.</p></Card>
    </div>
  </Slide>,

  // ── A3. Safety + human oversight ──────────────────────────────
  <Slide key="a3" footer="A3 · Safety + Human Oversight">
    <Eyebrow>A3 — Safety + human oversight</Eyebrow>
    <Title>Automation with brakes</Title>
    <div className="mt-7 grid flex-1 grid-cols-2 gap-4">
      {[
        ["Money never touches the LLM", "Price, total and voucher are computed only by the service from the DB. Tools validate an item exists before adding to cart. Saying “ordered” requires a real order code from a tool."],
        ["Human oversight", "Complaints and sensitive cases (allergy, refund) hand off. Staff take over in one tap — the bot goes silent instantly, and the customer is told clearly whether they're talking to a person or a bot."],
        ["Customer data", "Phone numbers masked in admin and logs · webhook verifies signatures and rejects unsigned requests in production · secrets in env · public privacy policy."],
        ["Fault tolerance", "LLM error → retry, then apologize gracefully; messages are never lost (peek / mark-after) · idempotent payments · the /pay page blocks already-processed orders."],
      ].map(([t, d]) => (
        <Card key={t}><p className="text-[17px] font-black">{t}</p><p className="mt-2 text-[14.5px] leading-relaxed text-[#1A2233]/75">{d}</p></Card>
      ))}
    </div>
  </Slide>,

  // ── A4. User research (thành thật = chiều sâu) ────────────────
  <Slide key="a4" footer="A4 · User Research">
    <Eyebrow>A4 — User research · observed tasks on real Messenger</Eyebrow>
    <Title>Tested for real, found real bugs, fixed same-day</Title>
    <div className="mt-6 grid grid-rows-3 gap-3">
      {[
        ["After delivery, the customer's next order is rejected", "Session stuck in the old state + cart not cleared after the order", "Self-healing session + two-way state sync + cart clear — smoke test 6/6"],
        ["Bot says “I'll order now” but creates no order", "LLM “says but doesn't do” — missing a say=do constraint", "SAY=DO rule + absolute priority for the order tool — reproducing eval case passes"],
        ["Bot makes up a combo price from old chat history", "In a stuck state the agent loses tools, so it acts in words", "TOOL > HISTORY in the prompt + enough tools open in every valid state"],
      ].map(([bug, cause, fix]) => (
        <div key={bug} className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-[#C8102E]/25 bg-[#C8102E]/5 p-3.5"><p className="text-[11.5px] font-black uppercase tracking-[0.1em] text-[#C8102E]">Observed</p><p className="mt-1 text-[13.5px] font-semibold leading-snug">{bug}</p></div>
          <div className="rounded-xl border border-[#1A2233]/10 bg-white p-3.5"><p className="text-[11.5px] font-black uppercase tracking-[0.1em] text-[#2563EB]">Root cause</p><p className="mt-1 text-[13.5px] font-semibold leading-snug">{cause}</p></div>
          <div className="rounded-xl border border-emerald-600/25 bg-emerald-50 p-3.5"><p className="text-[11.5px] font-black uppercase tracking-[0.1em] text-emerald-700">Fix + verify</p><p className="mt-1 text-[13.5px] font-semibold leading-snug">{fix}</p></div>
        </div>
      ))}
    </div>
    <p className="mt-4 text-center text-[14px] font-bold text-[#1A2233]/55">Every bug becomes a case in the eval suite — the system never repeats an old error.</p>
  </Slide>,
];
