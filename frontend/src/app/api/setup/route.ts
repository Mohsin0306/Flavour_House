import { ensureDb, getDbMode } from "@/lib/server/db";
import { runFullSeed } from "@/lib/server/seed";
import { errorResponse, jsonResponse } from "@/lib/server/utils";

export const runtime = "nodejs";

/** One-time production seed. POST with header: x-setup-secret: YOUR_SETUP_SECRET */
export async function POST(req: Request) {
  try {
    const secret = req.headers.get("x-setup-secret");
    const expected = process.env.SETUP_SECRET || process.env.JWT_SECRET;
    if (!expected || secret !== expected) {
      return errorResponse("Unauthorized", 401);
    }

    await ensureDb();
    const result = await runFullSeed();

    return jsonResponse({
      success: true,
      message: "Database seeded",
      db: getDbMode(),
      ...result,
    });
  } catch (e) {
    console.error("POST /api/setup", e);
    return errorResponse(e instanceof Error ? e.message : "Setup failed", 500);
  }
}

export async function GET() {
  return jsonResponse({
    db: getDbMode(),
    vercel: Boolean(process.env.VERCEL),
    tursoConfigured: Boolean(
      process.env.LIBSQL_URL?.startsWith("libsql://") ||
        process.env.LIBSQL_URL?.startsWith("https://")
    ),
    hint: "POST /api/setup with x-setup-secret header to seed production DB",
  });
}
