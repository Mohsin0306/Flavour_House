import { ensureDb } from "@/lib/server/db";
import { createOrder } from "@/lib/server/orders";
import { errorResponse, jsonResponse } from "@/lib/server/utils";

export async function POST(req: Request) {
  await ensureDb();
  try {
    const body = await req.json();
    const order = await createOrder(body);
    return jsonResponse({ order }, 201);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not create order";
    return errorResponse(msg, 400);
  }
}
