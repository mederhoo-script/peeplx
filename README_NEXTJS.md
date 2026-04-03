# PeeplX — Next.js 14 Escrow Platform

> Secure peer-to-peer escrow for Nigeria · Built with Next.js 14, Supabase, Prisma, Monnify

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + GSAP |
| Database | Supabase (PostgreSQL) |
| ORM | Prisma 6 |
| Auth | JWT in httpOnly cookies |
| Payments | Monnify |
| Deploy | Vercel |

---

## Quick Start

### 1 · Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Note your **project ref** (e.g. `abcdefgh`)
3. In **Settings → Database** copy both connection strings:
   - **Transaction** mode (port **6543**) → `DATABASE_URL`
   - **Session** mode (port **5432**) → `DIRECT_URL`

### 2 · Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Supabase — pooled (runtime)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Supabase — direct (CLI / migrations only)
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

JWT_SECRET="change-me-32-chars-min"
JWT_REFRESH_SECRET="change-me-32-chars-min"

NEXT_PUBLIC_APP_URL="http://localhost:3000"

MONNIFY_API_KEY="..."
MONNIFY_SECRET_KEY="..."
MONNIFY_CONTRACT_CODE="..."
MONNIFY_BASE_URL="https://sandbox.monnify.com"
MONNIFY_WEBHOOK_SECRET="..."
```

### 3 · Install and push schema

```bash
npm install
npx prisma db push        # creates all tables in Supabase
npx prisma generate       # regenerates Prisma Client
```

### 4 · Run locally

```bash
npm run dev
```

Visit **http://localhost:3000**

---

## Deploy to Vercel

### Environment variables in Vercel

Go to your Vercel project → **Settings → Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Supabase Transaction URL (port 6543) |
| `DIRECT_URL` | Supabase Session URL (port 5432) |
| `JWT_SECRET` | random 32+ char string |
| `JWT_REFRESH_SECRET` | random 32+ char string |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |
| `MONNIFY_API_KEY` | from Monnify dashboard |
| `MONNIFY_SECRET_KEY` | from Monnify dashboard |
| `MONNIFY_CONTRACT_CODE` | from Monnify dashboard |
| `MONNIFY_BASE_URL` | `https://api.monnify.com` (live) |
| `MONNIFY_WEBHOOK_SECRET` | from Monnify dashboard |

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mederhoo-script/peeplx)

---

## Database migrations

```bash
# Push schema changes (Supabase-safe — uses DIRECT_URL)
npx prisma db push

# Or create a named migration
npx prisma migrate dev --name <description>

# View data in GUI
npx prisma studio
```

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Design tokens + utilities
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/page.tsx
│   ├── escrow/
│   │   ├── new/page.tsx          # Create escrow (3-step)
│   │   └── [id]/page.tsx         # Escrow detail + actions
│   ├── payment/
│   │   └── callback/page.tsx     # Post-payment verification
│   └── api/
│       ├── auth/                 # register · login · logout · me · refresh
│       ├── escrow/               # list · create · get · update
│       ├── payment/              # initialize · verify · webhook (Monnify)
│       └── user/                 # profile get/update
├── components/
│   ├── Navigation.tsx
│   ├── ThemeToggle.tsx
│   ├── LandingPage.tsx
│   └── ui/                       # button · card · input · label · select · textarea
├── sections/                     # GSAP-animated landing page sections
├── lib/
│   ├── prisma.ts                 # Prisma singleton (Supabase pooling)
│   ├── auth.ts                   # JWT sign/verify + cookie helpers
│   ├── monnify.ts                # Monnify API client
│   └── utils.ts
└── types/index.ts
prisma/
└── schema.prisma                 # 6 models: User · Wallet · EscrowTransaction · Payment · TrustScore · Notification
```

---

## Why two DATABASE URLs?

Supabase exposes a **connection pooler** (Supavisor, pgBouncer-compatible) on port **6543**.
Vercel serverless functions create a new process per request — without pooling you'd exhaust
Postgres connections instantly. The pooled URL (`DATABASE_URL`) is used at runtime.

Prisma CLI commands (`migrate`, `db push`, `studio`) need a **direct** Postgres connection
because they use features (advisory locks, `COPY`, DDL) that don't work through a pooler.
That's what `DIRECT_URL` is for — it's only read by the CLI, never by the running app.

---

Built with ❤️ in Lagos, Nigeria 🇳🇬
