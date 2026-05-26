import { ensureDb } from "@/lib/server/db";
import { listRestaurants } from "@/lib/server/restaurants";
import { jsonResponse } from "@/lib/server/utils";

export async function GET(req: Request) {
  try {
    await ensureDb();
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = Number(searchParams.get("radius") ?? 500);

    const restaurants = await listRestaurants(
      lat != null ? Number(lat) : undefined,
      lng != null ? Number(lng) : undefined,
      radius
    );

    return jsonResponse({ restaurants });
  } catch (e) {
    console.error("GET /api/restaurants", e);
    return jsonResponse(
      { error: e instanceof Error ? e.message : "Database error" },
      500
    );
  }
}
