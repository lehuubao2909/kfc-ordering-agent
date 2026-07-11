/**
 * Deck chính 6 slides + closing "Thanks for watching" (7 trang — bản NỘP kết thúc tại đây).
 * Nội dung tiếng Anh theo bản của thành viên thuyết trình (12/7) — chỉ sửa số liệu cũ:
 * eval 24/24 → 26/26 (số đã verify trong src/fixtures/eval-results.json).
 */
import { Slide, Eyebrow, Title, Card, CardLabel, FlowRow, Callout, TEAM_NAME } from "./slide-frame";

export const mainDeckSlides = [
  // ── 1. TEAM + PROMISE (0:00–0:40) ─────────────────────────────
  <Slide key="s1" footer="01 · Team + Promise">
    <div className="flex flex-1 flex-col justify-center">
      <Eyebrow>{TEAM_NAME} · Agentic AI Build Week 2026</Eyebrow>
      <h1 className="mt-3 text-[64px] font-black leading-[1.02] tracking-[-0.03em]">
        KFC Ordering <span className="text-[#C8102E]">Agent</span>
      </h1>
      <p className="mt-7 max-w-[920px] text-[26px] font-semibold leading-[1.4]">
        KFC customers are already messaging on Messenger. We turn the conversation into a <em>completed order</em> — with an AI agent that plans, acts through tools, and verifies itself.
      </p>
      <div className="mt-10 flex gap-3">
        {["F&B", "AI Engineering", "Product"].map((c) => (
          <span key={c} className="rounded-full border border-[#1A2233]/15 bg-white px-4 py-2 text-[14px] font-black">{c}</span>
        ))}
        <span className="rounded-full bg-[#C8102E] px-4 py-2 text-[14px] font-black text-white">Problem 4 — AI-powered conversational ordering via chat</span>
      </div>
    </div>
  </Slide>,

  // ── 2. PROBLEM INSIGHT (0:40–1:20) ────────────────────────────
  <Slide key="s2" footer="02 · Problem Insight">
    <Eyebrow>01 · Problem Insight</Eyebrow>
    <Title>Customers are already in chat. The operator is the ceiling.</Title>
    <div className="mt-7 grid flex-1 grid-cols-[1.15fr_0.85fr] gap-5">
      <div className="grid grid-rows-5 gap-2.5">
        {[
          ["WHO", "High-intent customers who message the fanpage before opening the app"],
          ["GOAL", "Finish the order inside the chat, no channel switch"],
          ["FRICTION", "Ordering means leaving chat for the app — conversion leaks midway"],
          ["ROOT CAUSE", "100% handled by hand — the operator's speed caps chat revenue"],
          ["EVIDENCE", "KFC brief: 250+ stores, millions of customers a month, no conversational ordering"],
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
          KFC's chat channel isn't short on customers — it's short on <span className="text-[#F2A33C]">someone to close orders 24/7</span>.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-white/70">The agent doesn't create new demand. It harvests demand that leaks away every day.</p>
      </div>
    </div>
  </Slide>,

  // ── 3. AGENTIC WORKFLOW (1:20–2:20) ───────────────────────────
  <Slide key="s3" footer="03 · Agentic Workflow">
    <Eyebrow>02 · Agentic Workflow</Eyebrow>
    <Title>Goal → Plan → Tools → Act → Verify, on one real message</Title>
    <p className="mt-3 rounded-lg bg-white px-4 py-2 font-mono text-[15px] font-bold text-[#1A2233]/80">
      Customer: “deliver to 350 Tran Hung Dao, D5, phone 090…, pay cash please”
    </p>
    <div className="mt-5">
      <FlowRow
        highlight={3}
        steps={[
          { label: "GOAL", note: "Understand — close a COD order to a District 5 address" },
          { label: "PLAN", note: "Resolve store → check sold-out items → close COD" },
          { label: "TOOLS", note: "set_delivery_info · select_payment_method (2 of 14 tools)" },
          { label: "ACT", note: "Route to KFC Nguyen Trai (open to 22:00) · create order KFC-0001" },
          { label: "VERIFY", note: "State machine + service validate, two layers — wrong step = tool locked" },
        ]}
      />
    </div>
    <div className="mt-5 grid grid-cols-[1fr_1fr] gap-4">
      <Card>
        <CardLabel>Not a black box</CardLabel>
        <p className="mt-2 text-[15px] leading-relaxed">The staff console shows the <b>decision log each turn</b>: <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[12px] font-bold text-violet-700">🔧 Save address · resolve store (KFC Nguyen Trai) → Create order & pay (KFC-0001 · cash)</span> — judges watch the agent decide in real time.</p>
      </Card>
      <Card>
        <CardLabel>Tool discipline</CardLabel>
        <p className="mt-2 text-[15px] leading-relaxed"><b>14 tools locked across 11 order states</b> — the payment tool doesn't exist to the LLM until an order is confirmed. Saying “ordered” requires a real order code from a tool.</p>
      </Card>
    </div>
  </Slide>,

  // ── 4. WHY IT WINS (2:20–3:05) ────────────────────────────────
  <Slide key="s4" footer="04 · Why It Wins">
    <Eyebrow>03 · Why It Wins</Eyebrow>
    <Title>The LLM holds the conversation. The state machine holds the money.</Title>
    <div className="mt-7 grid flex-1 grid-cols-3 gap-4">
      {[
        ["Hybrid agent + state machine", "The LLM never decides price or order on its own — every number comes from the DB through tools, validated twice.", "→ Orders close in under 2 minutes, never a made-up price."],
        ["Store-aware, 250 stores", "Orders route to the right store by address, knowing opening hours and sold-out items before accepting.", "→ Never accepts an order it can't deliver — operations you can trust."],
        ["Humans in the right place", "Complaints and sensitive cases hand off; staff take over in one tap, and the customer always knows who they're talking to.", "→ Controlled automation — enterprise-grade."],
      ].map(([t, d, so]) => (
        <Card key={t} className="flex flex-col">
          <p className="text-[18px] font-black leading-tight">{t}</p>
          <p className="mt-2.5 flex-1 text-[14.5px] leading-relaxed text-[#1A2233]/75">{d}</p>
          <p className="mt-3 border-t border-dashed border-[#1A2233]/15 pt-2.5 text-[14.5px] font-bold text-[#C8102E]">{so}</p>
        </Card>
      ))}
    </div>
    <div className="mt-5">
      <Callout>Why can't a general assistant do this? Because it isn't allowed to handle money. This system is — safely.</Callout>
    </div>
  </Slide>,

  // ── 5. EVIDENCE + IMPACT (3:05–3:50) ──────────────────────────
  <Slide key="s5" footer="05 · Evidence + Impact">
    <Eyebrow>04 · Evidence + Impact</Eyebrow>
    <Title>What's measured, what's assumed — labeled honestly</Title>
    <div className="mt-7 grid grid-cols-3 gap-4">
      <Card className="border-l-4 !border-l-[#2563EB]">
        <CardLabel color="text-[#2563EB]">Level 2 · Benchmark — measured</CardLabel>
        <p className="mt-2 text-[44px] font-black leading-none">26/26</p>
        <p className="mt-2 text-[14.5px] leading-snug text-[#1A2233]/75">Vietnamese NLU auto-eval with trap cases against fabricated items · re-run after every change (caught 2 regressions in a day)</p>
      </Card>
      <Card className="border-l-4 !border-l-[#F2A33C]">
        <CardLabel color="text-[#B45309]">Level 1 · Assumption — labeled</CardLabel>
        <p className="mt-2 text-[44px] font-black leading-none">+2.7%</p>
        <p className="mt-2 text-[14.5px] leading-snug text-[#1A2233]/75">AOV uplift, backtested on 4,964 simulated POS transactions at 20% acceptance — conservative vs. KFC's 10–15% brief estimate</p>
      </Card>
      <Card className="border-l-4 !border-l-[#C8102E]">
        <CardLabel>Impact at scale</CardLabel>
        <p className="mt-2 text-[20px] font-black leading-snug">Chat orders/mo × AOV × uplift</p>
        <p className="mt-2 text-[14.5px] leading-snug text-[#1A2233]/75">+ recovered chat conversion (now 0, hand-handled) + reduced operator load · pilot measures via A/B</p>
      </Card>
    </div>
    <div className="mt-5 grid grid-cols-4 gap-3">
      {[["11-step", "Order completion flow, running live"], ["26/26", "NLU accuracy · gpt-5.4"], ["Threshold", "Upsell: “+11k → free ship, save 20k”"], ["Auto", "Best voucher applied, nothing to memorize"]].map(([k, v]) => (
        <div key={k} className="rounded-xl border border-[#1A2233]/10 bg-white px-4 py-3">
          <p className="text-[15px] font-black text-[#C8102E]">{k}</p>
          <p className="mt-1 text-[13.5px] font-semibold text-[#1A2233]/75">{v}</p>
        </div>
      ))}
    </div>
  </Slide>,

  // ── 6. DEMO + CLOSE (3:50–4:50) ───────────────────────────────
  <Slide key="s6" footer="06 · Demo + Close">
    <Eyebrow>05 · Demo + Close</Eyebrow>
    <Title>60-second demo — ending on the customer's outcome</Title>
    <div className="mt-6">
      <FlowRow
        highlight={2}
        steps={[
          { label: "0–10s · GOAL", note: "Hungry customer messages the fanpage like texting a friend" },
          { label: "10–20s · TRIGGER", note: "“Get me a fried-chicken combo + Pepsi.”" },
          { label: "20–45s · AGENT ACTS", note: "Tool-trace runs: cart → voucher-threshold upsell → store → COD" },
          { label: "45–55s · OUTCOME", note: "Order code KFC-xxxx + tracking link back to the customer" },
          { label: "55–60s · PROOF", note: "Admin: funnel + AOV + NLU 26/26 tick live" },
        ]}
      />
    </div>
    <div className="mt-6 grid grid-cols-[1.2fr_0.8fr] gap-4">
      <Card className="flex items-center">
        <p className="text-[17px] font-bold leading-relaxed">Dual screen: <b>the phone</b> shows the customer experience, <b>the staff console</b> shows the agent's brain via tool-trace — judges see both sides of one conversation.</p>
      </Card>
      <div className="rounded-2xl bg-[#101828] p-5 text-center">
        <p className="text-[13px] font-black uppercase tracking-[0.18em] text-[#F2A33C]">Close</p>
        <p className="mt-2 text-[19px] font-black leading-snug text-white">From 100% hand-answered → a sales agent that works 24/7. Pilotable today on KFC's real fanpage.</p>
      </div>
    </div>
  </Slide>,

  // ── 7. THANKS (bản nộp kết thúc ở đây) ────────────────────────
  <Slide key="s7" footer="Thanks" dark>
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <Eyebrow dark>KFC Ordering Agent · {TEAM_NAME}</Eyebrow>
      <h2 className="mt-5 text-[68px] font-black leading-none tracking-[-0.02em] text-white">Thanks for watching!</h2>
      <p className="mt-6 max-w-[780px] text-[21px] font-semibold leading-relaxed text-white/70">
        “Text KFC like texting a friend — and the order runs itself to your door.”
      </p>
      <p className="mt-9 font-mono text-[17px] font-bold text-[#F2A33C]">kfc-ordering-agent.vercel.app</p>
    </div>
  </Slide>,
];
