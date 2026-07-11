/**
 * Agent core — 1 hàm duy nhất mọi channel gọi vào. OWNER: Dev B.
 *
 * Flow 1 turn:
 * 1. Load session (state, mode, cart, history) từ DB
 * 2. mode=human → KHÔNG gọi LLM, chỉ log để staff console hiển thị
 * 3. buildSystemPrompt(state, cart, khách quen) + history 12 tin gần nhất
 * 4. generateText({ model: openai(OPENAI_MODEL), tools: getToolsForState(state), stopWhen: stepCountIs(6) })
 * 5. Save history + trả text (+ carousel item ids nếu gọi get_menu) cho channel adapter gửi đi
 *
 * Retry 1 lần khi LLM lỗi; lỗi tiếp → trả câu graceful.
 */
import { openai } from "@ai-sdk/openai";
import { generateText, stepCountIs, type ModelMessage } from "ai";
import { getSession, saveSession } from "./conversation-session-store";
import { getToolsForState } from "./agent-tools-by-state";
import { buildSystemPrompt } from "./agent-system-prompt-vi";
import { getCustomer } from "@/lib/services/session-data-service";

export type AgentReply = { text: string; handedOff: boolean; carouselItemIds?: string[] };

const GRACEFUL = "Dạ em bị chậm xíu, anh/chị nhắn lại giúp em ạ 🙏";
const DEFAULT_MODEL = "gpt-4o-mini";

export async function runOrderingAgentTurn(psid: string, userMessages: string[]): Promise<AgentReply> {
  const session = await getSession(psid);

  // Handoff đang bật → bot im, staff console lo tiếp (webhook vẫn log tin để hiển thị).
  if (session.mode === "human") return { text: "", handedOff: true };

  const customer = await getCustomer(psid);
  const system = buildSystemPrompt(session.state, session.cart, {
    lastAddress: customer?.lastAddress ?? null,
    customerName: customer?.name ?? null,
  });

  const messages: ModelMessage[] = [
    ...session.history.slice(-12).map((h): ModelMessage => ({
      role: h.role === "assistant" ? "assistant" : "user",
      content: h.content,
    })),
    ...userMessages.map((content): ModelMessage => ({ role: "user", content })),
  ];

  const model = openai(process.env.OPENAI_MODEL || DEFAULT_MODEL);
  const tools = getToolsForState(session.state, psid);

  let result: Awaited<ReturnType<typeof generateText>> | undefined;
  for (let attempt = 0; attempt < 2 && !result; attempt++) {
    try {
      result = await generateText({ model, system, messages, tools, stopWhen: stepCountIs(6) });
    } catch (err) {
      console.error(`agent turn lỗi (lần ${attempt + 1}):`, err);
    }
  }
  if (!result) return { text: GRACEFUL, handedOff: false };

  // Gom mọi tool call/result qua các step để phát hiện handoff + carousel.
  const steps = result.steps ?? [];
  const toolCalls = steps.flatMap((s) => s.toolCalls ?? []);
  const toolResults = steps.flatMap((s) => s.toolResults ?? []);

  const handedOff = toolCalls.some((c) => c.toolName === "handoff_to_human");

  let carouselItemIds: string[] | undefined;
  for (const r of toolResults) {
    if (r.toolName !== "get_menu") continue;
    const items = (r.output as { items?: { id: string }[] } | undefined)?.items;
    if (Array.isArray(items) && items.length) carouselItemIds = items.slice(0, 10).map((i) => i.id);
  }

  const text =
    (result.text || "").trim() ||
    (handedOff ? "Dạ em kết nối anh/chị với nhân viên hỗ trợ ngay ạ." : "Dạ em chưa rõ ý, anh/chị nói lại giúp em nhé.");

  const newHistory = [
    ...session.history,
    ...userMessages.map((content) => ({ role: "user", content })),
    { role: "assistant", content: text },
  ].slice(-12);
  await saveSession({ ...session, history: newHistory });

  return { text, handedOff, carouselItemIds };
}
