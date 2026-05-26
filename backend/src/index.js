require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const locationRoutes = require("./routes/location");
const restaurantRoutes = require("./routes/restaurants");
const adminRoutes = require("./routes/admin");
const orderRoutes = require("./routes/orders");

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.warn("Warning: JWT_SECRET not set. Using default (not for production).");
  process.env.JWT_SECRET = "dev-secret-change-in-production";
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Restaurant API running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
