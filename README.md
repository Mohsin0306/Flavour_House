# Flavour_House

Restaurant website (Flavor House) — Next.js full stack with location-based branches, menu, cart, and orders.

Single **Next.js** app: frontend + API routes. Deploy once on **Vercel** — no separate backend server.

## Features

- Location popup → nearest branch (Lahore, Sialkot, Gujranwala, Bahawalpur, Okara, Kasur)
- Menu, cart, checkout, order tracking
- Admin panel at `/admin_login`

## Local development

```bash
cd frontend
npm install
cp .env.example .env.local
npm run seed
npm run dev
```

Open http://localhost:3000

**Admin:** `admin@restaurant.com` / `admin123`

## Deploy on Vercel

1. Push project to GitHub
2. Import repo in [Vercel](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Add environment variables:

| Variable | Local | Production (Vercel) |
|----------|--------|---------------------|
| `LIBSQL_URL` | `file:./data/restaurant.db` | Turso URL `libsql://...` |
| `LIBSQL_AUTH_TOKEN` | (empty) | Turso auth token |
| `JWT_SECRET` | long random string | same |
| `ADMIN_EMAIL` | optional | optional |
| `ADMIN_PASSWORD` | optional | optional |

### Turso database (free, ~2 min)

1. Sign up at [turso.tech](https://turso.tech)
2. Create a database
3. Copy **Database URL** → `LIBSQL_URL`
4. Create token → `LIBSQL_AUTH_TOKEN`
5. After deploy, run seed once locally pointing at Turso:

```bash
cd frontend
LIBSQL_URL=libsql://your-db.turso.io LIBSQL_AUTH_TOKEN=xxx npm run seed
```

Or use Turso CLI: `turso db shell` and run migrations manually.

## Project structure

```
frontend/          ← deploy this folder to Vercel
  src/app/api/     ← all backend APIs (replaces Express)
  src/app/         ← pages
  data/            ← local SQLite (gitignored)
backend/           ← legacy Express (optional, not needed for Vercel)
```

## API routes

Same paths as before, now under Next.js:

- `POST /api/location`
- `GET /api/restaurants`
- `GET /api/restaurants/:id`
- `POST /api/orders`
- `GET /api/orders/:id`
- `POST /api/auth/login`
- `/api/admin/*`
