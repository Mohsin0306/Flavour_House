import { dbExecute, ensureDb } from "@/lib/server/db";
import { errorResponse, jsonResponse } from "@/lib/server/utils";

export async function POST(req: Request) {
  await ensureDb();
  const body = await req.json();
  const { latitude, longitude, accuracy } = body;

  if (latitude == null || longitude == null) {
    return errorResponse("latitude and longitude required");
  }

  const lat = Number(latitude);
  const lng = Number(longitude);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return errorResponse("Invalid coordinates");
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return errorResponse("Coordinates out of range");
  }

  const result = await dbExecute(
    `INSERT INTO user_locations (latitude, longitude, accuracy, user_agent)
     VALUES (?, ?, ?, ?)`,
    [lat, lng, accuracy ?? null, req.headers.get("user-agent") ?? null]
  );

  return jsonResponse(
    {
      success: true,
      id: Number(result.lastInsertRowid),
      coordinates: { latitude: lat, longitude: lng },
    },
    201
  );
}
