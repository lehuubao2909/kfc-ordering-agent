/**
 * Agent core — 1 hàm duy nhất mọi channel gọi vào. OWNER: Dev B.
 *
 * Flow 1 turn:
 * 1. Load session (state, mode, cart, history) từ DB
 * 2. mode=human → KHÔNG gọi LLM, chỉ log để staff console hiển thị
 * 3. buildSystemPrompt(state, cart) + history 12 tin gần nhất
 * 4. generateText({ model: openai(process.env.OPENAI_MODEL), tools: getToolsForState(state), stopWhen: stepCountIs(6) })
 * 5. Save history + trả text cho channel adapter gửi đi
 *
 * Retry 1 lần khi LLM lỗi; lỗi tiếp → trả câu graceful "Dạ em bị chậm xíu, anh/chị nhắn lại giúp em ạ".
 */

export type AgentReply = { text: string; handedOff: boolean };

// TODO(Dev B): implement theo flow trên
export async function runOrderingAgentTurn(_psid: string, _userMessages: string[]): Promise<AgentReply> {
  throw new Error("TODO(Dev B): runOrderingAgentTurn");
}
