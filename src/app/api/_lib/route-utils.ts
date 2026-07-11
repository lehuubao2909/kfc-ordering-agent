/**
 * Helper dùng chung cho API routes (Dev A). Thư mục _lib là "private folder" của Next → KHÔNG thành route.
 * Giữ route mỏng: parse+auth+gọi service+envelope. Business logic vẫn nằm ở src/lib/services.
 */
import { NextRequest, NextResponse } from "next/server";
import { ZodError, ZodType } from "zod";
import { apiError, apiOk, ApiEnvelope } from "@/lib/types";

// Nhận diện lỗi nghiệp vụ qua name (không import service → tránh circular import trong route graph).
const BUSINESS_ERROR_NAMES = new Set(["OrderTransitionError", "CartError"]);

export function ok<T>(data: T): NextResponse<ApiEnvelope<T>> {
  return NextResponse.json(apiOk(data));
}

export function fail(code: string, message: string, status: number): NextResponse {
  return NextResponse.json(apiError(code, message), { status });
}

/** Map lỗi service → envelope + status. Lỗi nghiệp vụ (transition/cart/validate) = 400, còn lại 500. */
export function handleError(err: unknown): NextResponse {
  if (err instanceof ZodError) {
    return fail("BAD_REQUEST", "Dữ liệu gửi lên không hợp lệ.", 400);
  }
  if (err instanceof Error && BUSINESS_ERROR_NAMES.has(err.name)) {
    return fail("BUSINESS_RULE", err.message, 400);
  }
  console.error("route error:", err);
  return fail("INTERNAL", "Có lỗi hệ thống, thử lại giúp em nhé.", 500);
}

/** Parse + validate JSON body bằng zod (throw ZodError nếu sai → handleError bắt). */
export async function parseBody<T>(req: NextRequest, schema: ZodType<T>): Promise<T> {
  const json = await req.json().catch(() => ({}));
  return schema.parse(json);
}

/**
 * Basic auth cho /api/admin/**. ADMIN_BASIC_AUTH dạng "user:password".
 * Trả null nếu hợp lệ; trả NextResponse 401 nếu sai/thiếu (route return luôn response đó).
 */
export function requireBasicAuth(req: NextRequest): NextResponse | null {
  const expected = process.env.ADMIN_BASIC_AUTH;
  const unauthorized = () =>
    NextResponse.json(apiError("UNAUTHORIZED", "Cần đăng nhập admin."), {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="admin"' },
    });

  if (!expected) return unauthorized(); // chưa cấu hình → từ chối cho an toàn
  const header = req.headers.get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");
  if (scheme !== "Basic" || !encoded) return unauthorized();
  let decoded = "";
  try {
    decoded = Buffer.from(encoded, "base64").toString("utf8");
  } catch {
    return unauthorized();
  }
  return decoded === expected ? null : unauthorized();
}

/** Che SĐT trước khi trả admin/log: 0901234567 → 090***4567. */
export function maskPhone(phone: string | null): string | null {
  if (!phone) return phone;
  return phone.length >= 7 ? `${phone.slice(0, 3)}***${phone.slice(-4)}` : "***";
}
