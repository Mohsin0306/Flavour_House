import bcrypt from "bcryptjs";
import { dbExecute } from "./db";

const BRAND = "Flavor House";
const SHARED_MENU = [
  ["Chicken Biryani", "Aromatic basmati rice with tender chicken", 850, "Main"],
  ["Beef Karahi", "Traditional wok-style beef karahi", 1200, "Main"],
  ["Chicken Tikka", "Charcoal grilled marinated chicken", 750, "Main"],
  ["Zinger Burger", "Crispy chicken fillet burger", 650, "Fast Food"],
  ["Loaded Fries", "Cheese & herb seasoned fries", 350, "Sides"],
  ["Mango Lassi", "Fresh yogurt mango drink", 250, "Drinks"],
  ["Chocolate Brownie", "Warm brownie with ice cream", 550, "Dessert"],
];

const BRANCHES = [
  { city: "Lahore", address: "Main Boulevard, Gulberg III, Lahore", lat: 31.5204, lng: 74.3587, phone: "+92 300 1110001" },
  { city: "Sialkot", address: "Paris Road, Sialkot Cantt", lat: 32.4945, lng: 74.5229, phone: "+92 300 1110002" },
  { city: "Gujranwala", address: "GT Road, Civil Lines, Gujranwala", lat: 32.1877, lng: 74.1945, phone: "+92 300 1110003" },
  { city: "Bahawalpur", address: "Circular Road, Model Town, Bahawalpur", lat: 29.3956, lng: 71.6836, phone: "+92 300 1110004" },
  { city: "Okara", address: "Depot Chowk, Faisalabad Road, Okara", lat: 30.8081, lng: 73.4458, phone: "+92 300 1110005" },
  { city: "Kasur", address: "Railway Road, Kasur City", lat: 31.1177, lng: 74.4503, phone: "+92 300 1110006" },
];

export async function runFullSeed() {
  await dbExecute("DELETE FROM order_items");
  await dbExecute("DELETE FROM orders");
  await dbExecute("DELETE FROM menu_items");
  await dbExecute("DELETE FROM restaurants");

  const email = process.env.ADMIN_EMAIL || "admin@restaurant.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const existing = await dbExecute("SELECT id FROM admins WHERE email = ?", [email]);
  if (!existing.rows.length) {
    const hash = bcrypt.hashSync(password, 10);
    await dbExecute("INSERT INTO admins (email, password_hash, name) VALUES (?, ?, ?)", [
      email,
      hash,
      "Admin",
    ]);
  }

  for (const b of BRANCHES) {
    const r = await dbExecute(
      `INSERT INTO restaurants (name, description, address, city, phone, latitude, longitude, cuisine)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `${BRAND} — ${b.city}`,
        `Premium dining at our ${b.city} branch.`,
        b.address,
        b.city,
        b.phone,
        b.lat,
        b.lng,
        "Pakistani & Fast Food",
      ]
    );
    const restaurantId = Number(r.lastInsertRowid);
    for (const [name, desc, price, cat] of SHARED_MENU) {
      await dbExecute(
        "INSERT INTO menu_items (restaurant_id, name, description, price, category) VALUES (?, ?, ?, ?, ?)",
        [restaurantId, name, desc, price, cat]
      );
    }
  }

  return { branches: BRANCHES.length, admin: email };
}
