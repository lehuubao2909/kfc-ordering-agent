/**
 * GET /api/admin/conversations        → list hội thoại (staff console)
 * GET /api/admin/conversations?psid=X → session + transcript của 1 khách
 * OWNER: Dev A. Basic auth. ⚠️ scope xác nhận với Lead (dev-a-questions-for-lead.md).
 */
import { NextRequest } from "next/server";
import { getTranscript, listConversations } from "@/lib/services/conversation-admin-service";
import { handleError, ok, requireBasicAuth } from "../../_lib/route-utils";

export async function GET(req: NextRequest) {
  const denied = requireBasicAuth(req);
  if (denied) return denied;
  try {
    const psid = req.nextUrl.searchParams.get("psid");
    if (psid) return ok({ psid, transcript: await getTranscript(psid) });
    return ok({ conversations: await listConversations() });
  } catch (err) {
    return handleError(err);
  }
}
