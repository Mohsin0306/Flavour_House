const express = require("express");
const db = require("../db");

const router = express.Router();

router.post("/", (req, res) => {
  const { latitude, longitude, accuracy } = req.body;

  if (latitude == null || longitude == null) {
    return res.status(400).json({ error: "latitude and longitude required" });
  }

  const lat = Number(latitude);
  const lng = Number(longitude);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ error: "Invalid coordinates" });
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({ error: "Coordinates out of range" });
  }

  const result = db
    .prepare(
      `INSERT INTO user_locations (latitude, longitude, accuracy, user_agent)
       VALUES (?, ?, ?, ?)`
    )
    .run(lat, lng, accuracy ?? null, req.headers["user-agent"] ?? null);

  res.status(201).json({
    success: true,
    id: result.lastInsertRowid,
    coordinates: { latitude: lat, longitude: lng },
  });
});

module.exports = router;
