import { ensureDb } from "@/lib/server/db";
import { getMenuForRestaurant, getRestaurantById } from "@/lib/server/restaurants";
import { errorResponse, jsonResponse } from "@/lib/server/utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  await ensureDb();
  const { id } = await params;
  const restaurant = await getRestaurantById(Number(id));
  if (!restaurant) return errorResponse("Restaurant not found", 404);

  const menu = await getMenuForRestaurant(restaurant.id);
  return jsonResponse({ restaurant, menu });
}
