import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

export type Row = Record<string, unknown>;

export type DbResult = {
  rows: Row[];
  lastInsertRowid?: number | bigint;
  rowsAffected?: number;
};

let sqlite: import("better-sqlite3").Database | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let libsql: any = null;
let initialized = false;

function isVercel() {
  return Boolean(process.env.VERCEL);
}

function useTurso() {
  const url = process.env.LIBSQL_URL ?? "";
  return url.startsWith("libsql://") || url.startsWith("https://");
}

function assertDbConfig() {
  if (isVercel() && !useTurso()) {
    throw new Error(
      "Database not configured for Vercel. Set LIBSQL_URL and LIBSQL_AUTH_TOKEN (Turso) in project Environment Variables."
    );
  }
}

function getSqlitePath() {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  return path.join(dataDir, "restaurant.db");
}

async function getSqlite() {
  if (!sqlite) {
    const Database = (await import("better-sqlite3")).default;
    sqlite = new Database(getSqlitePath());
    sqlite.pragma("journal_mode = WAL");
  }
  return sqlite;
}

async function getLibsql() {
  if (!libsql) {
    if (!process.env.LIBSQL_URL) {
      throw new Error("LIBSQL_URL is not set");
    }
    const { createClient } = await import("@libsql/client");
    libsql = createClient({
      url: process.env.LIBSQL_URL,
      authToken: process.env.LIBSQL_AUTH_TOKEN,
    });
  }
  return libsql;
}

function normalizeRows(rows: unknown[]): Row[] {
  return rows.map((row) => {
    if (row && typeof row === "object" && !Array.isArray(row)) {
      const out: Row = {};
      for (const [k, v] of Object.entries(row as Record<string, unknown>)) {
        out[k] = v;
      }
      return out;
    }
    return row as Row;
  });
}

const SCHEMA = [
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

export async function dbExecute(
  sql: string,
  args: (string | number | null)[] = []
): Promise<DbResult> {
  assertDbConfig();

  if (useTurso()) {
    const client = await getLibsql();
    const result = await client.execute({ sql, args });
    return {
      rows: normalizeRows(result.rows as unknown[]),
      lastInsertRowid: result.lastInsertRowid,
      rowsAffected: result.rowsAffected,
    };
  }

  const db = await getSqlite();
  const trimmed = sql.trim().toUpperCase();
  if (trimmed.startsWith("SELECT")) {
    const rows = db.prepare(sql).all(...args) as Row[];
    return { rows, rowsAffected: rows.length };
  }
  const info = db.prepare(sql).run(...args);
  return {
    rows: [],
    lastInsertRowid: info.lastInsertRowid,
    rowsAffected: info.changes,
  };
}

async function seedAdminIfNeeded() {
  const count = await dbExecute("SELECT COUNT(*) as c FROM admins");
  if (Number(rowVal(count.rows[0], "c")) > 0) return;

  const email = process.env.ADMIN_EMAIL || "admin@restaurant.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const hash = bcrypt.hashSync(password, 10);
  await dbExecute("INSERT INTO admins (email, password_hash, name) VALUES (?, ?, ?)", [
    email,
    hash,
    "Admin",
  ]);
}

export async function initDb() {
  if (initialized) return;
  assertDbConfig();
  for (const sql of SCHEMA) {
    await dbExecute(sql);
  }
  await seedAdminIfNeeded();
  initialized = true;
}

export async function ensureDb() {
  await initDb();
}

export function rowVal<T>(row: Row, key: string): T {
  return row[key] as T;
}

export function getDbMode() {
  if (useTurso()) return "turso";
  if (isVercel()) return "vercel-unconfigured";
  return "local-sqlite";
}
