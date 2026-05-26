import { ensureDb } from "@/lib/server/db";
import { jsonResponse } from "@/lib/server/utils";

export async function GET() {
  await ensureDb();
  return jsonResponse({ status: "ok", message: "Restaurant API running" });
}
