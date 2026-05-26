import { requireAdmin } from "@/lib/server/auth";
import { dbExecute, ensureDb, rowVal } from "@/lib/server/db";
import { errorResponse, jsonResponse } from "@/lib/server/utils";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const { error } = requireAdmin(req);
  if (error) return error;

  await ensureDb();
  const { id } = await params;
  const body = await req.json();
  const { name, description, price, category, is_available } = body;

  const existing = await dbExecute("SELECT id FROM menu_items WHERE id = ?", [Number(id)]);
  if (!existing.rows.length) return errorResponse("Menu item not found", 404);

  await dbExecute(
    `UPDATE menu_items SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      price = COALESCE(?, price),
      category = COALESCE(?, category),
      is_available = COALESCE(?, is_available)
     WHERE id = ?`,
    [
      name ?? null,
      description ?? null,
      price != null ? Number(price) : null,
      category ?? null,
      is_available != null ? (is_available ? 1 : 0) : null,
      Number(id),
    ]
  );

  const itemResult = await dbExecute("SELECT * FROM menu_items WHERE id = ?", [Number(id)]);
  const row = itemResult.rows[0];
  return jsonResponse({
    item: {
      id: Number(rowVal(row, "id")),
      restaurant_id: Number(rowVal(row, "restaurant_id")),
      name: String(rowVal(row, "name")),
      description: rowVal<string | null>(row, "description"),
      price: Number(rowVal(row, "price")),
      category: String(rowVal(row, "category")),
      is_available: Number(rowVal(row, "is_available")),
    },
  });
}

export async function DELETE(req: Request, { params }: Params) {
  const { error } = requireAdmin(req);
  if (error) return error;

  await ensureDb();
  const { id } = await params;
  const result = await dbExecute("DELETE FROM menu_items WHERE id = ?", [Number(id)]);

  if (!result.rowsAffected) return errorResponse("Menu item not found", 404);
  return jsonResponse({ success: true });
}
