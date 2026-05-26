import { requireAdmin } from "@/lib/server/auth";
import { dbExecute, ensureDb } from "@/lib/server/db";
import { mapRestaurant } from "@/lib/server/restaurants";
import { errorResponse, jsonResponse } from "@/lib/server/utils";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const { error } = requireAdmin(req);
  if (error) return error;

  await ensureDb();
  const { id } = await params;
  const body = await req.json();
  const { name, description, address, phone, image_url, latitude, longitude, cuisine, city, is_active } =
    body;

  const existing = await dbExecute("SELECT id FROM restaurants WHERE id = ?", [Number(id)]);
  if (!existing.rows.length) return errorResponse("Restaurant not found", 404);

  await dbExecute(
    `UPDATE restaurants SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      address = COALESCE(?, address),
      city = COALESCE(?, city),
      phone = COALESCE(?, phone),
      image_url = COALESCE(?, image_url),
      latitude = COALESCE(?, latitude),
      longitude = COALESCE(?, longitude),
      cuisine = COALESCE(?, cuisine),
      is_active = COALESCE(?, is_active),
      updated_at = datetime('now')
     WHERE id = ?`,
    [
      name ?? null,
      description ?? null,
      address ?? null,
      city ?? null,
      phone ?? null,
      image_url ?? null,
      latitude != null ? Number(latitude) : null,
      longitude != null ? Number(longitude) : null,
      cuisine ?? null,
      is_active != null ? (is_active ? 1 : 0) : null,
      Number(id),
    ]
  );

  const restaurant = await dbExecute("SELECT * FROM restaurants WHERE id = ?", [Number(id)]);
  return jsonResponse({ restaurant: mapRestaurant(restaurant.rows[0]) });
}

export async function DELETE(req: Request, { params }: Params) {
  const { error } = requireAdmin(req);
  if (error) return error;

  await ensureDb();
  const { id } = await params;
  const result = await dbExecute("DELETE FROM restaurants WHERE id = ?", [Number(id)]);

  if (!result.rowsAffected) return errorResponse("Restaurant not found", 404);
  return jsonResponse({ success: true });
}
