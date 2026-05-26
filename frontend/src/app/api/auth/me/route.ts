import { getAdminFromRequest } from "@/lib/server/auth";
import { errorResponse, jsonResponse } from "@/lib/server/utils";

export async function GET(req: Request) {
  const admin = getAdminFromRequest(req);
  if (!admin) return errorResponse("Login required", 401);
  return jsonResponse({ admin });
}
