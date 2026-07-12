/**
 * POST /api/admin/conversations/send {psid, text} — staff gõ tay → gửi qua Messenger + log transcript.
 * OWNER: Dev A. Basic auth. Dùng sendTextMessage của messenger-adapter (Dev B) — chỉ import, không sửa.
 */
import { NextRequest } from "next/server";
import { z } from "zod";
import { sendTextMessage } from "@/lib/channels/messenger-adapter";
import { logStaffOutbound } from "@/lib/services/conversation-admin-service";
import { refreshHandoffActivity } from "@/lib/services/session-data-service";
import { handleError, ok, parseBody, requireBasicAuth } from "../../../_lib/route-utils";

const BodySchema = z.object({ psid: z.string().min(1), text: z.string().min(1) });

export async function POST(req: NextRequest) {
  const denied = requireBasicAuth(req);
  if (denied) return denied;
  try {
    const { psid, text } = await parseBody(req, BodySchema);
    await sendTextMessage(psid, text);
    await logStaffOutbound(psid, text);
    await refreshHandoffActivity(psid); // staff đang chat tay → gia hạn cửa sổ human, bot không chen vào
    return ok({ psid, sent: true });
  } catch (err) {
    return handleError(err);
  }
}
