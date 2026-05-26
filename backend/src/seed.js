require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./db");

const email = process.env.ADMIN_EMAIL || "admin@restaurant.com";
const password = process.env.ADMIN_PASSWORD || "admin123";

const existing = db.prepare("SELECT id FROM admins WHERE email = ?").get(email);
if (!existing) {
  const hash = bcrypt.hashSync(password, 10);
  db.prepare("INSERT INTO admins (email, password_hash, name) VALUES (?, ?, ?)").run(
    email,
    hash,
    "Admin"
  );
  console.log(`Admin created: ${email} / ${password}`);
} else {
  console.log("Admin already exists");
}

const count = db.prepare("SELECT COUNT(*) as c FROM restaurants").get().c;
if (count === 0) {
  const insertRestaurant = db.prepare(
    `INSERT INTO restaurants (name, description, address, phone, image_url, latitude, longitude, cuisine)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertMenu = db.prepare(
    `INSERT INTO menu_items (restaurant_id, name, description, price, category) VALUES (?, ?, ?, ?, ?)`
  );

  const samples = [
    {
      name: "Spice Garden",
      description: "Authentic Pakistani & Indian cuisine",
      address: "Main Boulevard, Lahore",
      phone: "+92 300 1234567",
      image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
      lat: 31.5204,
      lng: 74.3587,
      cuisine: "Pakistani",
      menu: [
        ["Chicken Biryani", "Aromatic basmati rice", 850, "Main"],
        ["Karahi Gosht", "Traditional wok-style mutton", 1200, "Main"],
        ["Mango Lassi", "Fresh yogurt drink", 250, "Drinks"],
      ],
    },
    {
      name: "Burger Hub",
      description: "Gourmet burgers & fast food",
      address: "Gulberg III, Lahore",
      phone: "+92 321 9876543",
      image_url: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800",
      lat: 31.5102,
      lng: 74.3441,
      cuisine: "Fast Food",
      menu: [
        ["Classic Beef Burger", "Angus patty with cheese", 650, "Main"],
        ["Crispy Fries", "Golden seasoned fries", 300, "Sides"],
        ["Chocolate Shake", "Rich hand-spun shake", 450, "Drinks"],
      ],
    },
    {
      name: "Cafe Delight",
      description: "Coffee, desserts & light meals",
      address: "DHA Phase 5, Lahore",
      phone: "+92 333 5551212",
      image_url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
      lat: 31.4697,
      lng: 74.4104,
      cuisine: "Cafe",
      menu: [
        ["Cappuccino", "Double shot espresso", 450, "Drinks"],
        ["Chocolate Brownie", "Warm with ice cream", 550, "Dessert"],
        ["Club Sandwich", "Triple decker classic", 750, "Main"],
      ],
    },
  ];

  for (const s of samples) {
    const r = insertRestaurant.run(
      s.name,
      s.description,
      s.address,
      s.phone,
      s.image_url,
      s.lat,
      s.lng,
      s.cuisine
    );
    for (const [name, desc, price, cat] of s.menu) {
      insertMenu.run(r.lastInsertRowid, name, desc, price, cat);
    }
  }
  console.log("Sample restaurants seeded");
} else {
  console.log("Restaurants already exist, skipping seed");
}

console.log("Seed complete");
