/**
 * POST /api/admin/conversations/takeover {psid, mode} — staff tiếp quản ("human") / trả lại bot ("agent").
 * OWNER: Dev A. Basic auth. ⚠️ semantics mode thống nhất với Dev B (handoff_to_human) — chờ Lead.
 */
import { NextRequest } from "next/server";
import { z } from "zod";
import { setSessionMode } from "@/lib/services/session-data-service";
import { handleError, ok, parseBody, requireBasicAuth } from "../../../_lib/route-utils";

const BodySchema = z.object({ psid: z.string().min(1), mode: z.enum(["agent", "human"]) });

export async function POST(req: NextRequest) {
  const denied = requireBasicAuth(req);
  if (denied) return denied;
  try {
    const { psid, mode } = await parseBody(req, BodySchema);
    await setSessionMode(psid, mode);
    return ok({ psid, mode });
  } catch (err) {
    return handleError(err);
  }
}
