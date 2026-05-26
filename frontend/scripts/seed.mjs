import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, "restaurant.db"));

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

const tables = [
  `CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT,
    phone TEXT,
    image_url TEXT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    cuisine TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT DEFAULT 'Main',
    is_available INTEGER DEFAULT 1,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS user_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    accuracy REAL,
    user_agent TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE NOT NULL,
    restaurant_id INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'pending',
    subtotal REAL NOT NULL,
    delivery_fee REAL DEFAULT 150,
    total REAL NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
  )`,
  `CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    menu_item_id INTEGER,
    item_name TEXT NOT NULL,
    item_price REAL NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  )`,
];

for (const sql of tables) db.exec(sql);

const email = process.env.ADMIN_EMAIL || "admin@restaurant.com";
const password = process.env.ADMIN_PASSWORD || "admin123";
const existing = db.prepare("SELECT id FROM admins WHERE email = ?").get(email);
if (!existing) {
  const hash = bcrypt.hashSync(password, 10);
  db.prepare("INSERT INTO admins (email, password_hash, name) VALUES (?, ?, ?)").run(email, hash, "Admin");
  console.log(`Admin: ${email} / ${password}`);
}

db.exec("DELETE FROM order_items; DELETE FROM orders; DELETE FROM menu_items; DELETE FROM restaurants;");

const insertRestaurant = db.prepare(
  `INSERT INTO restaurants (name, description, address, city, phone, latitude, longitude, cuisine)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
);
const insertMenu = db.prepare(
  `INSERT INTO menu_items (restaurant_id, name, description, price, category) VALUES (?, ?, ?, ?, ?)`
);

for (const b of BRANCHES) {
  const r = insertRestaurant.run(
    `${BRAND} — ${b.city}`,
    `Premium dining at our ${b.city} branch.`,
    b.address,
    b.city,
    b.phone,
    b.lat,
    b.lng,
    "Pakistani & Fast Food"
  );
  for (const [name, desc, price, cat] of SHARED_MENU) {
    insertMenu.run(r.lastInsertRowid, name, desc, price, cat);
  }
}

console.log(`Seeded ${BRANCHES.length} branches.`);
db.close();
