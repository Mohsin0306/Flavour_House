import { dbExecute, rowVal, type Row } from "./db";
import { haversineKm } from "./utils";

export function mapRestaurant(row: Row) {
  return {
    id: Number(rowVal(row, "id")),
    name: String(rowVal(row, "name")),
    description: rowVal<string | null>(row, "description"),
    address: String(rowVal(row, "address")),
    city: rowVal<string | null>(row, "city"),
    phone: rowVal<string | null>(row, "phone"),
    image_url: rowVal<string | null>(row, "image_url"),
    latitude: Number(rowVal(row, "latitude")),
    longitude: Number(rowVal(row, "longitude")),
    cuisine: rowVal<string | null>(row, "cuisine"),
    is_active: Boolean(rowVal(row, "is_active")),
    menu_count: row.menu_count != null ? Number(rowVal(row, "menu_count")) : undefined,
    distance_km: row.distance_km != null ? Number(rowVal(row, "distance_km")) : undefined,
    created_at: rowVal<string | undefined>(row, "created_at"),
    updated_at: rowVal<string | undefined>(row, "updated_at"),
  };
}

export async function listRestaurants(lat?: number, lng?: number, radius = 100) {
  const result = await dbExecute(
    `SELECT r.*,
      (SELECT COUNT(*) FROM menu_items m WHERE m.restaurant_id = r.id AND m.is_available = 1) as menu_count
     FROM restaurants r WHERE r.is_active = 1`
  );

  let restaurants = result.rows.map(mapRestaurant);

  if (lat != null && lng != null) {
    restaurants = restaurants
      .map((r) => ({
        ...r,
        distance_km: haversineKm(lat, lng, r.latitude, r.longitude),
      }))
      .sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0));

    const withinRadius = restaurants.filter((r) => (r.distance_km ?? 0) <= radius);
    if (withinRadius.length > 0) {
      restaurants = withinRadius;
    }
  }

  return restaurants;
}

export async function getRestaurantById(id: number) {
  const result = await dbExecute(
    "SELECT * FROM restaurants WHERE id = ? AND is_active = 1",
    [id]
  );
  if (!result.rows.length) return null;
  return mapRestaurant(result.rows[0]);
}

export async function getMenuForRestaurant(restaurantId: number, availableOnly = true) {
  const sql = availableOnly
    ? "SELECT * FROM menu_items WHERE restaurant_id = ? AND is_available = 1 ORDER BY category, name"
    : "SELECT * FROM menu_items WHERE restaurant_id = ? ORDER BY category, name";
  const result = await dbExecute(sql, [restaurantId]);
  return result.rows.map((row) => ({
    id: Number(rowVal(row, "id")),
    restaurant_id: Number(rowVal(row, "restaurant_id")),
    name: String(rowVal(row, "name")),
    description: rowVal<string | null>(row, "description"),
    price: Number(rowVal(row, "price")),
    category: String(rowVal(row, "category") ?? "Main"),
    is_available: Number(rowVal(row, "is_available")),
  }));
}
