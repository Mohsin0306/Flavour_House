require("dotenv").config();
const db = require("./db");

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
  {
    city: "Lahore",
    address: "Main Boulevard, Gulberg III, Lahore",
    lat: 31.5204,
    lng: 74.3587,
    phone: "+92 300 1110001",
  },
  {
    city: "Sialkot",
    address: "Paris Road, Sialkot Cantt",
    lat: 32.4945,
    lng: 74.5229,
    phone: "+92 300 1110002",
  },
  {
    city: "Gujranwala",
    address: "GT Road, Civil Lines, Gujranwala",
    lat: 32.1877,
    lng: 74.1945,
    phone: "+92 300 1110003",
  },
  {
    city: "Bahawalpur",
    address: "Circular Road, Model Town, Bahawalpur",
    lat: 29.3956,
    lng: 71.6836,
    phone: "+92 300 1110004",
  },
  {
    city: "Okara",
    address: "Depot Chowk, Faisalabad Road, Okara",
    lat: 30.8081,
    lng: 73.4458,
    phone: "+92 300 1110005",
  },
  {
    city: "Kasur",
    address: "Railway Road, Kasur City",
    lat: 31.1177,
    lng: 74.4503,
    phone: "+92 300 1110006",
  },
];

db.exec("DELETE FROM order_items; DELETE FROM orders; DELETE FROM menu_items; DELETE FROM restaurants;");

const insertRestaurant = db.prepare(
  `INSERT INTO restaurants (name, description, address, city, phone, image_url, latitude, longitude, cuisine)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
);
const insertMenu = db.prepare(
  `INSERT INTO menu_items (restaurant_id, name, description, price, category) VALUES (?, ?, ?, ?, ?)`
);

for (const b of BRANCHES) {
  const r = insertRestaurant.run(
    `${BRAND} — ${b.city}`,
    `Premium dining at our ${b.city} branch. Fresh ingredients, authentic flavors, and fast delivery across ${b.city}.`,
    b.address,
    b.city,
    b.phone,
    null,
    b.lat,
    b.lng,
    "Pakistani & Fast Food"
  );
  for (const [name, desc, price, cat] of SHARED_MENU) {
    insertMenu.run(r.lastInsertRowid, name, desc, price, cat);
  }
}

console.log(`Seeded ${BRANCHES.length} branches: ${BRANCHES.map((b) => b.city).join(", ")}`);
