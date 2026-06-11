# Blueberry E-Commerce

Next.js ecommerce platform using **Supabase only** — Auth, PostgreSQL database, and Storage. No Prisma required.

## Prerequisites

- Node.js 20+
- Supabase project ([supabase.com](https://supabase.com))

## Environment Variables

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (Auth, client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server DB + uploads) |
| `NEXT_PUBLIC_APP_URL` | App URL, e.g. `http://localhost:3000` |

The Next.js app only needs the 3 Supabase keys above. For `yarn db:seed`, also add your **database password**:

```env
SUPABASE_DB_PASSWORD="your-database-password"
# Optional — speeds up seed (copy from Dashboard → Database → Session pooler host):
# SUPABASE_DB_HOST="aws-1-ap-northeast-1.pooler.supabase.com"
```

Find the password in **Supabase Dashboard → Settings → Database → Database password**.

> **Note:** The direct host `db.[ref].supabase.co` is IPv6-only. If seed fails with `ENETUNREACH`, the script auto-discovers the IPv4 Session pooler, or you can paste the Session pooler URI as `DATABASE_URL`.

The seed script will **auto-create all tables** and then insert sample data.

## Setup

### 1. Create Supabase project

Copy URL and keys into `.env.local`.

### 2. Enable Auth

**Authentication → Providers** → enable Email.

### 3. Storage bucket (auto-created)

Product image uploads use a public Supabase bucket named `product-images`. The upload action and seed script create it automatically when `SUPABASE_SERVICE_ROLE_KEY` is set.

To create it manually:

```bash
yarn db:setup-storage
```

Or in the Supabase dashboard: **Storage** → create public bucket `product-images`.

### 4. Seed data (creates tables + sample data)

```bash
npm install
npm run db:seed
```

### 5. Create auth users (for login)

In **Authentication → Users**, create users matching seed emails, or sign up via `/register`.

For admin access, set the user's `role` in the `users` table to `ADMIN` after first login.

### 6. Run dev server

```bash
npm run dev
```

## Architecture

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15 App Router |
| Database | Supabase PostgreSQL (via `@supabase/supabase-js`) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| State | Redux Toolkit (cart, wishlist) |
| UI | Tailwind CSS + shadcn/ui |

## Key Routes

| Route | Description |
| --- | --- |
| `/` | Storefront homepage |
| `/shop` | Product listing |
| `/account` | Customer dashboard |
| `/console` | Admin CMS |
| `/login` | Authentication |
