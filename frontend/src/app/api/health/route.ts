import { ensureDb, getDbMode } from "@/lib/server/db";
import { dbExecute } from "@/lib/server/db";
import { errorResponse, jsonResponse } from "@/lib/server/utils";

export const runtime = "nodejs";

export async function GET() {
  try {
    await ensureDb();
    const admins = await dbExecute("SELECT COUNT(*) as c FROM admins");
    const restaurants = await dbExecute("SELECT COUNT(*) as c FROM restaurants");
    return jsonResponse({
      status: "ok",
      db: getDbMode(),
      admins: Number(admins.rows[0]?.c ?? 0),
      restaurants: Number(restaurants.rows[0]?.c ?? 0),
    });
  } catch (e) {
    console.error("GET /api/health", e);
    return errorResponse(e instanceof Error ? e.message : "Database error", 500);
  }
}
