import { requireAdmin } from "@/lib/server/auth";
import { dbExecute, ensureDb, rowVal } from "@/lib/server/db";
import { getMenuForRestaurant } from "@/lib/server/restaurants";
import { errorResponse, jsonResponse } from "@/lib/server/utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const { error } = requireAdmin(req);
  if (error) return error;

  await ensureDb();
  const { id } = await params;
  const menu = await getMenuForRestaurant(Number(id), false);
  return jsonResponse({ menu });
}

export async function POST(req: Request, { params }: Params) {
  const { error } = requireAdmin(req);
  if (error) return error;

  await ensureDb();
  const { id } = await params;
  const body = await req.json();
  const { name, description, price, category, is_available } = body;

  if (!name || price == null) {
    return errorResponse("name and price required");
  }

  const restaurant = await dbExecute("SELECT id FROM restaurants WHERE id = ?", [Number(id)]);
  if (!restaurant.rows.length) return errorResponse("Restaurant not found", 404);

  const result = await dbExecute(
    `INSERT INTO menu_items (restaurant_id, name, description, price, category, is_available)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      Number(id),
      name,
      description ?? null,
      Number(price),
      category ?? "Main",
      is_available === false ? 0 : 1,
    ]
  );

  const itemResult = await dbExecute("SELECT * FROM menu_items WHERE id = ?", [
    Number(result.lastInsertRowid),
  ]);

  const row = itemResult.rows[0];
  return jsonResponse(
    {
      item: {
        id: Number(rowVal(row, "id")),
        restaurant_id: Number(rowVal(row, "restaurant_id")),
        name: String(rowVal(row, "name")),
        description: rowVal<string | null>(row, "description"),
        price: Number(rowVal(row, "price")),
        category: String(rowVal(row, "category")),
        is_available: Number(rowVal(row, "is_available")),
      },
    },
    201
  );
}
