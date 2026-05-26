import { requireAdmin } from "@/lib/server/auth";
import { dbExecute, ensureDb, rowVal } from "@/lib/server/db";
import { jsonResponse } from "@/lib/server/utils";

export async function GET(req: Request) {
  const { admin, error } = requireAdmin(req);
  if (error || !admin) return error!;

  await ensureDb();

  const restaurants = await dbExecute("SELECT COUNT(*) as c FROM restaurants");
  const menuItems = await dbExecute("SELECT COUNT(*) as c FROM menu_items");
  const locations = await dbExecute("SELECT COUNT(*) as c FROM user_locations");
  const recentLocations = await dbExecute(
    `SELECT latitude, longitude, accuracy, created_at
     FROM user_locations ORDER BY created_at DESC LIMIT 10`
  );

  return jsonResponse({
    restaurants: Number(rowVal(restaurants.rows[0], "c")),
    menuItems: Number(rowVal(menuItems.rows[0], "c")),
    locations: Number(rowVal(locations.rows[0], "c")),
    recentLocations: recentLocations.rows.map((row) => ({
      latitude: Number(rowVal(row, "latitude")),
      longitude: Number(rowVal(row, "longitude")),
      accuracy: rowVal<number | null>(row, "accuracy"),
      created_at: String(rowVal(row, "created_at")),
    })),
  });
}
