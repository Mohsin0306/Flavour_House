import { dbExecute, rowVal, type Row } from "./db";

function generateOrderNumber() {
  const n = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `FH-${n.slice(-6)}${r}`;
}

export async function getOrderById(id: number) {
  const result = await dbExecute(
    `SELECT o.*, r.name as branch_name, r.city as branch_city, r.address as branch_address, r.phone as branch_phone
     FROM orders o
     JOIN restaurants r ON r.id = o.restaurant_id
     WHERE o.id = ?`,
    [id]
  );
  if (!result.rows.length) return null;

  const order = result.rows[0];
  const itemsResult = await dbExecute("SELECT * FROM order_items WHERE order_id = ?", [id]);

  return {
    id: Number(rowVal(order, "id")),
    order_number: String(rowVal(order, "order_number")),
    restaurant_id: Number(rowVal(order, "restaurant_id")),
    customer_name: String(rowVal(order, "customer_name")),
    customer_phone: String(rowVal(order, "customer_phone")),
    delivery_address: String(rowVal(order, "delivery_address")),
    notes: rowVal<string | null>(order, "notes"),
    status: String(rowVal(order, "status")),
    subtotal: Number(rowVal(order, "subtotal")),
    delivery_fee: Number(rowVal(order, "delivery_fee")),
    total: Number(rowVal(order, "total")),
    created_at: String(rowVal(order, "created_at")),
    branch_name: String(rowVal(order, "branch_name")),
    branch_city: rowVal<string | null>(order, "branch_city"),
    branch_address: String(rowVal(order, "branch_address")),
    branch_phone: rowVal<string | null>(order, "branch_phone"),
    items: itemsResult.rows.map((row: Row) => ({
      id: Number(rowVal(row, "id")),
      menu_item_id: rowVal<number | null>(row, "menu_item_id"),
      item_name: String(rowVal(row, "item_name")),
      item_price: Number(rowVal(row, "item_price")),
      quantity: Number(rowVal(row, "quantity")),
    })),
  };
}

export async function createOrder(payload: {
  restaurant_id: number;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  notes?: string;
  items: { menu_item_id: number; quantity: number }[];
}) {
  const branchResult = await dbExecute(
    "SELECT id, name, city FROM restaurants WHERE id = ? AND is_active = 1",
    [payload.restaurant_id]
  );
  if (!branchResult.rows.length) throw new Error("Branch not found");

  let subtotal = 0;
  const lineItems: {
    menu_item_id: number;
    item_name: string;
    item_price: number;
    quantity: number;
  }[] = [];

  for (const item of payload.items) {
    const menuResult = await dbExecute(
      "SELECT * FROM menu_items WHERE id = ? AND restaurant_id = ? AND is_available = 1",
      [item.menu_item_id, payload.restaurant_id]
    );
    if (!menuResult.rows.length) throw new Error(`Invalid menu item: ${item.menu_item_id}`);
    const menuItem = menuResult.rows[0];
    const qty = Math.max(1, Number(item.quantity) || 1);
    const price = Number(rowVal(menuItem, "price"));
    subtotal += price * qty;
    lineItems.push({
      menu_item_id: Number(rowVal(menuItem, "id")),
      item_name: String(rowVal(menuItem, "name")),
      item_price: price,
      quantity: qty,
    });
  }

  const delivery_fee = 150;
  const total = subtotal + delivery_fee;
  const order_number = generateOrderNumber();

  const orderResult = await dbExecute(
    `INSERT INTO orders (order_number, restaurant_id, customer_name, customer_phone, delivery_address, notes, subtotal, delivery_fee, total, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')`,
    [
      order_number,
      payload.restaurant_id,
      payload.customer_name.trim(),
      payload.customer_phone.trim(),
      payload.delivery_address.trim(),
      payload.notes?.trim() || null,
      subtotal,
      delivery_fee,
      total,
    ]
  );

  const orderId = Number(orderResult.lastInsertRowid);

  for (const li of lineItems) {
    await dbExecute(
      `INSERT INTO order_items (order_id, menu_item_id, item_name, item_price, quantity) VALUES (?, ?, ?, ?, ?)`,
      [orderId, li.menu_item_id, li.item_name, li.item_price, li.quantity]
    );
  }

  const order = await getOrderById(orderId);
  if (!order) throw new Error("Order create failed");
  return order;
}
