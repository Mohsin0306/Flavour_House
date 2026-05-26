import { requireAdmin } from "@/lib/server/auth";
import { dbExecute, ensureDb } from "@/lib/server/db";
import { mapRestaurant } from "@/lib/server/restaurants";
import { errorResponse, jsonResponse } from "@/lib/server/utils";

export async function GET(req: Request) {
  const { error } = requireAdmin(req);
  if (error) return error;

  await ensureDb();
  const result = await dbExecute(
    `SELECT r.*,
      (SELECT COUNT(*) FROM menu_items m WHERE m.restaurant_id = r.id) as menu_count
     FROM restaurants r ORDER BY r.created_at DESC`
  );

  return jsonResponse({
    restaurants: result.rows.map((row) => mapRestaurant(row)),
  });
}

export async function POST(req: Request) {
  const { error } = requireAdmin(req);
  if (error) return error;

  await ensureDb();
  const body = await req.json();
  const { name, description, address, phone, image_url, latitude, longitude, cuisine, city, is_active } =
    body;

  if (!name || !address || latitude == null || longitude == null) {
    return errorResponse("name, address, latitude, longitude required");
  }

  const result = await dbExecute(
    `INSERT INTO restaurants (name, description, address, city, phone, image_url, latitude, longitude, cuisine, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      description ?? null,
      address,
      city ?? null,
      phone ?? null,
      image_url ?? null,
      Number(latitude),
      Number(longitude),
      cuisine ?? null,
      is_active === false ? 0 : 1,
    ]
  );

  const restaurant = await dbExecute("SELECT * FROM restaurants WHERE id = ?", [
    Number(result.lastInsertRowid),
  ]);

  return jsonResponse({ restaurant: mapRestaurant(restaurant.rows[0]) }, 201);
}
