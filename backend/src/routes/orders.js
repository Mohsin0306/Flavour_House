const express = require("express");
const db = require("../db");

const router = express.Router();

function generateOrderNumber() {
  const n = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `FH-${n.slice(-6)}${r}`;
}

router.post("/", (req, res) => {
  const {
    restaurant_id,
    customer_name,
    customer_phone,
    delivery_address,
    notes,
    items,
  } = req.body;

  if (!restaurant_id || !customer_name || !customer_phone || !delivery_address) {
    return res.status(400).json({
      error: "restaurant_id, customer_name, customer_phone, and delivery_address are required",
    });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "At least one item is required" });
  }

  const branch = db
    .prepare("SELECT id, name, city FROM restaurants WHERE id = ? AND is_active = 1")
    .get(restaurant_id);

  if (!branch) {
    return res.status(404).json({ error: "Branch not found" });
  }

  let subtotal = 0;
  const lineItems = [];

  for (const item of items) {
    const menuItem = db
      .prepare("SELECT * FROM menu_items WHERE id = ? AND restaurant_id = ? AND is_available = 1")
      .get(item.menu_item_id, restaurant_id);

    if (!menuItem) {
      return res.status(400).json({ error: `Invalid menu item: ${item.menu_item_id}` });
    }

    const qty = Math.max(1, Number(item.quantity) || 1);
    subtotal += menuItem.price * qty;
    lineItems.push({
      menu_item_id: menuItem.id,
      item_name: menuItem.name,
      item_price: menuItem.price,
      quantity: qty,
    });
  }

  const delivery_fee = 150;
  const total = subtotal + delivery_fee;
  const order_number = generateOrderNumber();

  const insertOrder = db.prepare(
    `INSERT INTO orders (order_number, restaurant_id, customer_name, customer_phone, delivery_address, notes, subtotal, delivery_fee, total, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')`
  );

  const insertItem = db.prepare(
    `INSERT INTO order_items (order_id, menu_item_id, item_name, item_price, quantity) VALUES (?, ?, ?, ?, ?)`
  );

  const tx = db.transaction(() => {
    const result = insertOrder.run(
      order_number,
      restaurant_id,
      customer_name.trim(),
      customer_phone.trim(),
      delivery_address.trim(),
      notes?.trim() || null,
      subtotal,
      delivery_fee,
      total
    );
    const orderId = result.lastInsertRowid;
    for (const li of lineItems) {
      insertItem.run(orderId, li.menu_item_id, li.item_name, li.item_price, li.quantity);
    }
    return orderId;
  });

  const orderId = tx();
  const order = getOrderById(orderId);
  res.status(201).json({ order });
});

router.get("/:id", (req, res) => {
  const order = getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json({ order });
});

function getOrderById(id) {
  const order = db
    .prepare(
      `SELECT o.*, r.name as branch_name, r.city as branch_city, r.address as branch_address, r.phone as branch_phone
       FROM orders o
       JOIN restaurants r ON r.id = o.restaurant_id
       WHERE o.id = ?`
    )
    .get(id);

  if (!order) return null;

  const items = db
    .prepare("SELECT * FROM order_items WHERE order_id = ?")
    .all(order.id);

  return { ...order, items };
}

module.exports = router;
