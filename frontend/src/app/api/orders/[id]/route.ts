import { ensureDb } from "@/lib/server/db";
import { getOrderById } from "@/lib/server/orders";
import { errorResponse, jsonResponse } from "@/lib/server/utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  await ensureDb();
  const { id } = await params;
  const order = await getOrderById(Number(id));
  if (!order) return errorResponse("Order not found", 404);
  return jsonResponse({ order });
}
