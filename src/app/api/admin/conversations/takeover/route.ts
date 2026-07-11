/**
 * POST /api/admin/conversations/takeover {psid, mode} — staff tiếp quản ("human") / trả lại bot ("agent").
 * OWNER: Dev A. Basic auth. ⚠️ semantics mode thống nhất với Dev B (handoff_to_human) — chờ Lead.
 */
import { NextRequest } from "next/server";
import { z } from "zod";
import { setSessionMode } from "@/lib/services/session-data-service";
import { sendTextMessage } from "@/lib/channels/messenger-adapter";
import { logStaffOutbound } from "@/lib/services/conversation-admin-service";
import { handleError, ok, parseBody, requireBasicAuth } from "../../../_lib/route-utils";

const BodySchema = z.object({ psid: z.string().min(1), mode: z.enum(["agent", "human"]) });

export async function POST(req: NextRequest) {
  const denied = requireBasicAuth(req);
  if (denied) return denied;
  try {
    const { psid, mode } = await parseBody(req, BodySchema);
    await setSessionMode(psid, mode);

    // Minh bạch với khách: đang chat với người hay bot (UX + chuẩn disclosure của Meta)
    const notice =
      mode === "human"
        ? "👩‍💼 Nhân viên KFC đã tham gia và hỗ trợ anh/chị trực tiếp ạ."
        : "🤖 Trợ lý ảo KFC tiếp tục hỗ trợ anh/chị ạ. Anh/chị cần đặt món hay kiểm tra đơn cứ nhắn em nhé!";
    await sendTextMessage(psid, notice).catch((err) => console.error("takeover notice lỗi (bỏ qua):", err));
    await logStaffOutbound(psid, notice).catch(() => {});

    return ok({ psid, mode });
  } catch (err) {
    return handleError(err);
  }
}
