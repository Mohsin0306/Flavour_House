const express = require("express");
const db = require("../db");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

// Stats
router.get("/stats", (req, res) => {
  const restaurants = db.prepare("SELECT COUNT(*) as c FROM restaurants").get().c;
  const menuItems = db.prepare("SELECT COUNT(*) as c FROM menu_items").get().c;
  const locations = db.prepare("SELECT COUNT(*) as c FROM user_locations").get().c;
  const recentLocations = db
    .prepare(
      `SELECT latitude, longitude, accuracy, created_at
       FROM user_locations ORDER BY created_at DESC LIMIT 10`
    )
    .all();

  res.json({ restaurants, menuItems, locations, recentLocations });
});

// Restaurants CRUD
router.get("/restaurants", (req, res) => {
  const rows = db
    .prepare(
      `SELECT r.*,
        (SELECT COUNT(*) FROM menu_items m WHERE m.restaurant_id = r.id) as menu_count
       FROM restaurants r ORDER BY r.created_at DESC`
    )
    .all();
  res.json({
    restaurants: rows.map((r) => ({ ...r, is_active: Boolean(r.is_active) })),
  });
});

router.post("/restaurants", (req, res) => {
  const { name, description, address, phone, image_url, latitude, longitude, cuisine, is_active } =
    req.body;

  if (!name || !address || latitude == null || longitude == null) {
    return res.status(400).json({ error: "name, address, latitude, longitude required" });
  }

  const result = db
    .prepare(
      `INSERT INTO restaurants (name, description, address, phone, image_url, latitude, longitude, cuisine, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      name,
      description ?? null,
      address,
      phone ?? null,
      image_url ?? null,
      Number(latitude),
      Number(longitude),
      cuisine ?? null,
      is_active === false ? 0 : 1
    );

  const restaurant = db.prepare("SELECT * FROM restaurants WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ restaurant: { ...restaurant, is_active: Boolean(restaurant.is_active) } });
});

router.put("/restaurants/:id", (req, res) => {
  const existing = db.prepare("SELECT id FROM restaurants WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Restaurant not found" });

  const { name, description, address, phone, image_url, latitude, longitude, cuisine, is_active } =
    req.body;

  db.prepare(
    `UPDATE restaurants SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      address = COALESCE(?, address),
      phone = COALESCE(?, phone),
      image_url = COALESCE(?, image_url),
      latitude = COALESCE(?, latitude),
      longitude = COALESCE(?, longitude),
      cuisine = COALESCE(?, cuisine),
      is_active = COALESCE(?, is_active),
      updated_at = datetime('now')
     WHERE id = ?`
  ).run(
    name ?? null,
    description ?? null,
    address ?? null,
    phone ?? null,
    image_url ?? null,
    latitude != null ? Number(latitude) : null,
    longitude != null ? Number(longitude) : null,
    cuisine ?? null,
    is_active != null ? (is_active ? 1 : 0) : null,
    req.params.id
  );

  const restaurant = db.prepare("SELECT * FROM restaurants WHERE id = ?").get(req.params.id);
  res.json({ restaurant: { ...restaurant, is_active: Boolean(restaurant.is_active) } });
});

router.delete("/restaurants/:id", (req, res) => {
  const result = db.prepare("DELETE FROM restaurants WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Restaurant not found" });
  res.json({ success: true });
});

// Menu CRUD
router.get("/restaurants/:id/menu", (req, res) => {
  const menu = db
    .prepare("SELECT * FROM menu_items WHERE restaurant_id = ? ORDER BY category, name")
    .all(req.params.id);
  res.json({ menu });
});

router.post("/restaurants/:id/menu", (req, res) => {
  const restaurant = db.prepare("SELECT id FROM restaurants WHERE id = ?").get(req.params.id);
  if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });

  const { name, description, price, category, is_available } = req.body;
  if (!name || price == null) {
    return res.status(400).json({ error: "name and price required" });
  }

  const result = db
    .prepare(
      `INSERT INTO menu_items (restaurant_id, name, description, price, category, is_available)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      req.params.id,
      name,
      description ?? null,
      Number(price),
      category ?? "Main",
      is_available === false ? 0 : 1
    );

  const item = db.prepare("SELECT * FROM menu_items WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json({ item });
});

router.put("/menu/:id", (req, res) => {
  const existing = db.prepare("SELECT id FROM menu_items WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Menu item not found" });

  const { name, description, price, category, is_available } = req.body;
  db.prepare(
    `UPDATE menu_items SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      price = COALESCE(?, price),
      category = COALESCE(?, category),
      is_available = COALESCE(?, is_available)
     WHERE id = ?`
  ).run(
    name ?? null,
    description ?? null,
    price != null ? Number(price) : null,
    category ?? null,
    is_available != null ? (is_available ? 1 : 0) : null,
    req.params.id
  );

  const item = db.prepare("SELECT * FROM menu_items WHERE id = ?").get(req.params.id);
  res.json({ item });
});

router.delete("/menu/:id", (req, res) => {
  const result = db.prepare("DELETE FROM menu_items WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Menu item not found" });
  res.json({ success: true });
});

module.exports = router;
