/**
 * Appendix A5–A8 + 2 slide Q&A prep (chỉ có trong bản PDF NỘI BỘ, không nằm trong bản nộp).
 * Nội dung tiếng Anh theo bản thành viên (12/7) — sửa số cũ: eval 24/24 → 26/26, Guardrail 4 → 6 case.
 */
import { Slide, Eyebrow, Title, Card, CardLabel, Callout } from "./slide-frame";

export const appendixSlidesB = [
  // ── A5. ROI ───────────────────────────────────────────────────
  <Slide key="a5" footer="A5 · Impact / ROI">
    <Eyebrow>A5 — Impact / ROI · assumptions labeled</Eyebrow>
    <Title>Formula first, numbers second</Title>
    <div className="mt-6 rounded-2xl bg-[#101828] p-6 text-center">
      <p className="font-mono text-[22px] font-black text-white">Value / year = chat orders per month × AOV × uplift × 12 <span className="text-[#F2A33C]">+</span> recovered chat conversion <span className="text-[#F2A33C]">+</span> page-operator hours</p>
    </div>
    <div className="mt-5 grid grid-cols-3 gap-4">
      <Card><CardLabel>Measured (mock, transparent)</CardLabel><p className="mt-2 text-[14.5px] leading-relaxed">Backtest of 4,964 POS transactions: AOV +2.7% at 20% acceptance · voucher-threshold upsell lifts basket value right in the demo.</p></Card>
      <Card><CardLabel>From the KFC brief</CardLabel><p className="mt-2 text-[14.5px] leading-relaxed">KFC estimates context-right upsell lifts AOV 10–15% · the chat channel currently converts ≈ 0 because 100% is hand-handled.</p></Card>
      <Card><CardLabel>Pilot measures for real</CardLabel><p className="mt-2 text-[14.5px] leading-relaxed">A/B on the real fanpage: completion rate, AOV delta, response time, CSAT — 2 weeks of real numbers replace every assumption.</p></Card>
    </div>
    <div className="mt-5"><Callout>LLM cost is under 2% of order value — and only the chat channel uses the LLM; the upsell engine runs deterministically, for free.</Callout></div>
  </Slide>,

  // ── A6. Alternatives ──────────────────────────────────────────
  <Slide key="a6" footer="A6 · Alternatives">
    <Eyebrow>A6 — Alternatives · why this path</Eyebrow>
    <Title>Compared with two familiar paths</Title>
    <div className="mt-6 grid flex-1 grid-cols-3 gap-4">
      {[
        ["Rule-based bot (button menus)", "Can't parse “2 spicy chickens, mild, deliver D5, pay cash” in one sentence · every flow change means recoding the button tree", "❌ Rigid, unnatural"],
        ["General LLM assistant", "Answers well but isn't allowed to handle money: no state machine, no tool gating → made-up prices and mis-orders are a certainty", "❌ Uncontrolled"],
        ["Our hybrid", "The LLM handles natural language · a state machine + 14 step-locked tools handle money and orders · handoff handles exceptions", "✅ Natural + safe"],
      ].map(([t, d, verdict], i) => (
        <Card key={t} className={i === 2 ? "border-2 !border-[#C8102E]" : ""}>
          <p className="text-[17px] font-black leading-tight">{t}</p>
          <p className="mt-2.5 text-[14.5px] leading-relaxed text-[#1A2233]/75">{d}</p>
          <p className="mt-3 text-[15px] font-black">{verdict}</p>
        </Card>
      ))}
    </div>
    <p className="mt-4 text-center text-[14.5px] font-bold text-[#1A2233]/55">“GenAI where language is needed — deterministic where money is touched.”</p>
  </Slide>,

  // ── A7. Evaluation results ────────────────────────────────────
  <Slide key="a7" footer="A7 · Evaluation Results">
    <Eyebrow>A7 — Evaluation results</Eyebrow>
    <Title>Automated eval — we don't trust vibes</Title>
    <div className="mt-7 grid grid-cols-[0.9fr_1.1fr] gap-5">
      <Card className="flex flex-col items-center justify-center text-center">
        <p className="text-[72px] font-black leading-none text-[#C8102E]">26/26</p>
        <p className="mt-2 text-[16px] font-bold">Vietnamese NLU eval · gpt-5.4</p>
        <p className="mt-1 text-[13.5px] text-[#1A2233]/60">Run through the real agent + real services + real DB</p>
      </Card>
      <div className="grid grid-rows-4 gap-2.5">
        {[
          ["NLU (9 cases)", "natural item ordering, quantity, ambiguous size → re-ask, multiple intents in one sentence"],
          ["Flow (8 cases)", "confirm → delivery → COD / QR → tracking → cancel, all by the rules"],
          ["Guardrail (6 cases)", "nonexistent item → no fabrication · early COD mention → still creates a real order"],
          ["Store-aware (3 cases)", "resolve the right district · store closed → switch · sold out → suggest an alternative"],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center gap-3 rounded-xl border border-[#1A2233]/10 bg-white px-4 py-2">
            <span className="w-[150px] shrink-0 text-[13px] font-black text-[#2563EB]">{k}</span>
            <span className="text-[13.5px] font-semibold leading-snug text-[#1A2233]/80">{v}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="mt-5"><Callout>The eval is a regression brake: it once dropped to 21/24 after a change — caught and fixed BEFORE deploy.</Callout></div>
  </Slide>,

  // ── A8. Roadmap + limitations ─────────────────────────────────
  <Slide key="a8" footer="A8 · Roadmap + Limitations">
    <Eyebrow>A8 — Roadmap + limitations · honest</Eyebrow>
    <Title>Knowing exactly where we stand</Title>
    <div className="mt-6 grid flex-1 grid-cols-2 gap-5">
      <Card>
        <CardLabel>Current limits (demo)</CardLabel>
        <ul className="mt-3 space-y-2.5 text-[14.5px] font-semibold leading-snug text-[#1A2233]/80">
          <li>• Synthetic data — the brief confirmed the direction is right absent real data</li>
          <li>• Transparent mock payments — no real gateway connected yet</li>
          <li>• Stores matched by district, no delivery-radius check yet</li>
          <li>• Messenger dev mode — users need a tester role</li>
        </ul>
      </Card>
      <Card>
        <CardLabel color="text-emerald-700">Roadmap after pilot</CardLabel>
        <ul className="mt-3 space-y-2.5 text-[14.5px] font-semibold leading-snug text-[#1A2233]/80">
          <li>• Connect KFC's real POS / OMS + loyalty (schema already mirrored)</li>
          <li>• VNPay / MoMo webhook · distance API · per-store menu overlay</li>
          <li>• Zalo on the same agent core (just add an adapter) · P2 kiosk on the same upsell engine</li>
          <li>• Recurring Notifications opt-in · anti-fraud (COD limit, blacklist)</li>
        </ul>
      </Card>
    </div>
  </Slide>,

  // ── Q&A prep 1: công thức ─────────────────────────────────────
  <Slide key="qa1" footer="Q&A Prep · internal" dark>
    <Eyebrow dark>Q&A · 15–25 seconds per answer</Eyebrow>
    <Title>Q&A — Answer → Support → Connect</Title>
    <div className="mt-8 grid grid-cols-3 gap-4">
      {[
        ["1 · ANSWER", "Conclusion first, no hedging.", "“Yes — the agent handles many customers at once.”"],
        ["2 · SUPPORT", "Exactly one fact.", "“Per-conversation lock + queue, tested with two phones in parallel.”"],
        ["3 · CONNECT", "Back to user value.", "“So at the lunch peak, no customer waits.”"],
      ].map(([t, d, ex]) => (
        <div key={t} className="rounded-2xl bg-white/10 p-5">
          <p className="text-[15px] font-black uppercase tracking-[0.12em] text-[#F2A33C]">{t}</p>
          <p className="mt-2 text-[15px] font-bold text-white">{d}</p>
          <p className="mt-3 text-[13.5px] italic leading-snug text-white/65">{ex}</p>
        </div>
      ))}
    </div>
    <div className="mt-6"><Callout dark>Asked something we don't have: “Not validated yet — what we know is X, and we'll test it with Y in the pilot.” · Opening Q&A: “May I gather the questions first?” (0:20 gather · 1:20 answer)</Callout></div>
  </Slide>,

  // ── Q&A prep 2: 6 câu 1-dòng ──────────────────────────────────
  <Slide key="qa2" footer="Q&A Prep · internal" dark>
    <Eyebrow dark>One line per rubric criterion — the whole team knows these by heart</Eyebrow>
    <Title>Six one-line answers, one per rubric criterion</Title>
    <div className="mt-6 grid flex-1 grid-rows-6 gap-2">
      {[
        ["AGENTIC AI", "The agent plans and acts through 14 state-locked tools — the tool-trace shows each decision in real time."],
        ["TRACK FIT", "Solves KFC's P4 exactly: the chat channel is 100% hand-handled; we turn it into the first automated sales channel."],
        ["EXECUTION", "An 11-step flow live on Messenger: order → pay → track → deliver — eval 26/26, smoke 25/25."],
        ["IMPACT", "Orders close in chat in under 2 minutes, voucher-threshold upsell lifts AOV, the page team is freed from repetitive work."],
        ["CREATIVITY", "Hybrid: the LLM holds the conversation, the state machine holds the money — a general assistant can't handle money; this system can, safely."],
        ["CLARITY", "One sentence to retell: “Text KFC like texting a friend — and the order runs itself to your door.”"],
      ].map(([k, v]) => (
        <div key={k} className="flex items-center gap-4 rounded-xl bg-white/8 px-5 py-2.5">
          <span className="w-[130px] shrink-0 text-[12.5px] font-black uppercase tracking-[0.1em] text-[#F2A33C]">{k}</span>
          <span className="text-[15px] font-semibold leading-snug text-white">{v}</span>
        </div>
      ))}
    </div>
  </Slide>,
];
