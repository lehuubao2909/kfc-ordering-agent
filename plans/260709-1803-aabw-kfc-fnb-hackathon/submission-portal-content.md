# Nội dung điền portal AABW — copy từng khối (bản chốt 11/7 đêm)

## Project title
```
KFC Ordering Agent
```

## Elevator pitch
```
An AI agent that turns Facebook Messenger conversations into completed KFC orders. It plans, calls real ordering tools, and verifies every step — so customers order in natural Vietnamese, get context-aware upsells, pay, and track delivery without ever leaving the chat.
```

## Project Story — "About the project" (Markdown)
```markdown
## Inspiration
KFC Vietnam's brief (Problem 4) says customers increasingly treat messaging apps as their primary channel, yet ordering still forces them to switch to an app or website — and today 100% of fanpage messages are answered manually. We discovered the real bottleneck isn't demand: high-intent customers are already in the chat. The ceiling is the speed of the human running the inbox. So we built the missing piece — an agent that can take a conversation all the way to a paid, tracked order.

## What it does
Customers chat naturally in Vietnamese on Messenger ("cho anh 2 miếng gà giòn cay, giao về Quận 5, trả tiền mặt"). The agent:
- shows the menu with a visual poster + product carousel (67 items)
- builds the cart and makes context-aware upsells: daypart rules + co-occurrence mined from 4,964 simulated POS transactions + voucher-threshold nudges ("add 11,000đ more to unlock free shipping — you save 20,000đ")
- auto-applies the best voucher and reads back an itemized order for confirmation
- resolves the right store out of 250+ from the delivery address (district matching, no geocoding API), checking opening hours and per-store stock BEFORE accepting the order
- takes COD or QR/card (transparent mock gateway), then pushes real-time status updates (placed → preparing → delivering → delivered) with loyalty points earned
- hands off to a human for complaints or sensitive topics; staff take over with one click, and the customer is always told whether they're talking to the bot or a person.

Operations get a staff console with a per-turn **agent decision log** ("🔧 Add to cart (Gà Giòn Cay ×2) → Resolve store (KFC Nguyễn Trãi) → Create order (KFC-0009 · COD)") and an admin dashboard with funnel, AOV uplift and NLU accuracy.

## How we built it
Hybrid architecture: **the LLM owns the conversation; a state machine owns the money.** GPT-5.4 (OpenAI) via the Vercel AI SDK runs a multi-step tool loop (up to 6 steps per turn) over **14 tools gated by 11 order states** — the checkout tool literally does not exist for the model until the order is confirmed. A pure-TypeScript service layer (order state machine, store resolution, vouchers, loyalty, deterministic upsell engine) validates everything a second time; the model never generates a price. Next.js 16 + Neon Postgres (Drizzle) + Vercel; the Messenger webhook does signature verification, message dedupe, per-conversation locking and message batching so many customers can order concurrently. All state lives in Postgres — fully stateless serverless.

## Challenges we ran into
Our hardest bug: sessions stuck in stale order states. After an order was delivered, the agent silently lost most of its tools — so it "roleplayed" ordering with words, even inventing a price, instead of acting. We found it by reading the decision log, fixed it with self-healing session reconciliation plus a "TOOLS beat CHAT HISTORY" prompt rule, and turned the exact failure into new eval cases. The other recurring fight: making an LLM never say "order placed" unless a real order id came back from a tool (our "say = do" rule).

## Accomplishments we're proud of
A 26/26 automated Vietnamese NLU evaluation suite (including fabrication traps like ordering a dish that doesn't exist) that runs against the real agent, real services and real database after every change. It caught two regressions on build day before they reached production, and it doubles as the measurable NLU-accuracy KPI the brief asks for.

## What we learned
Agent quality is an evaluation problem, not a prompting problem. Every production bug became an eval case; our prompt got smaller and stricter over time, not bigger.

## What's next
Pilot on KFC's real fanpage: connect POS/OMS and loyalty APIs (our schemas already mirror them), real payment webhooks (VNPay/MoMo), delivery-radius checks, per-store menu overlays, Zalo through the same agent core, and the same upsell engine powering self-ordering kiosks (Problem 2).

---
**Disclosure:** menu/store/POS data is synthetic per organizer guidance; payment is a transparent mock; the project plan and repo scaffold were prepared on Jul 9–10, before the official kick-off.
```

## Built with (tags — gõ từng cái, Enter để thêm)
```
OpenAI · GPT-5.4 · Next.js · TypeScript · Vercel AI SDK · Vercel · Neon · PostgreSQL · Drizzle ORM · Facebook Messenger Platform · Zod · Tailwind CSS
```

## Partner tools — chọn + giải thích
Chọn: **OpenAI** (+ kiểm tra dropdown có **Vercel**/**Neon** thì tick thêm — chỉ tick cái THẬT SỰ có trong list).
```
OpenAI (GPT-5.4 via the Vercel AI SDK) powers the core ordering agent. Every customer turn runs a multi-step tool loop in which the model plans and executes up to 6 of our 14 state-gated ordering tools (menu lookup, cart, store resolution, voucher application, checkout, human handoff). The model orchestrates; it never generates prices or order data — our service layer returns the facts and validates every action a second time. OpenAI also runs our 26-case automated Vietnamese NLU evaluation suite, which we use as a regression gate before every deploy (26/26 passing).
```
Nếu tick Vercel: `Vercel hosts the entire product (Next.js app, Messenger webhook on a stable production URL, serverless scaling for concurrent conversations); the Vercel AI SDK provides the tool-calling loop.`
Nếu tick Neon: `Neon (serverless Postgres) stores all state — orders, sessions, per-store inventory, message log — enabling a fully stateless webhook with per-conversation locking.`

## Links & Media
- Demo URL: `https://kfc-ordering-agent.vercel.app` (test incognito trước khi bấm nộp)
- GitHub: `https://github.com/lehuubao2909/kfc-ordering-agent` — **chuyển PUBLIC trước khi dán**
- Video: link video 2–3' (product working)
- Gallery: 5 ảnh 3:2 — chat đặt hàng · staff console (chip 🔧) · admin funnel · tracking · /pay
```
