const express = require("express");
const db = require("../db");
const { haversineKm } = require("../utils");

const router = express.Router();

router.get("/", (req, res) => {
  const { lat, lng, radius = 50 } = req.query;
  const rows = db
    .prepare(
      `SELECT r.*,
        (SELECT COUNT(*) FROM menu_items m WHERE m.restaurant_id = r.id AND m.is_available = 1) as menu_count
       FROM restaurants r WHERE r.is_active = 1`
    )
    .all();

  let restaurants = rows.map((r) => ({
    ...r,
    city: r.city ?? null,
    is_active: Boolean(r.is_active),
    menu_count: r.menu_count,
  }));

  if (lat != null && lng != null) {
    const userLat = Number(lat);
    const userLng = Number(lng);
    const maxRadius = Number(radius);

    restaurants = restaurants
      .map((r) => ({
        ...r,
        distance_km: haversineKm(userLat, userLng, r.latitude, r.longitude),
      }))
      .filter((r) => r.distance_km <= maxRadius)
      .sort((a, b) => a.distance_km - b.distance_km);
  }

  res.json({ restaurants });
});

router.get("/:id", (req, res) => {
  const restaurant = db
    .prepare("SELECT * FROM restaurants WHERE id = ? AND is_active = 1")
    .get(req.params.id);

  if (!restaurant) {
    return res.status(404).json({ error: "Restaurant not found" });
  }

  const menu = db
    .prepare(
      "SELECT * FROM menu_items WHERE restaurant_id = ? AND is_available = 1 ORDER BY category, name"
    )
    .all(restaurant.id);

  res.json({
    restaurant: { ...restaurant, city: restaurant.city ?? null, is_active: Boolean(restaurant.is_active) },
    menu,
  });
});

module.exports = router;
