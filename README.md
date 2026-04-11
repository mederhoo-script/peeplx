# 🛡️ PeeplX — Africa's Secure Escrow Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black.svg)](https://vercel.com/)

**PeeplX** is a production-ready fintech escrow platform that makes online transactions between strangers safe across Africa. Built as a single full-stack Next.js application with a Portable Trust Score™ system.

---

## ✨ Key Features

### Core Escrow System
- **Secure Escrow Transactions** — Funds held safely until delivery confirmation
- **Multi-Party Workflow** — Buyer, seller, and admin roles
- **Real-Time Status Tracking** — Live transaction updates
- **Auto-Cancellation** — Expired transactions handled automatically

### Portable Trust Score™
- **Dynamic Reputation System** — Score 0–100 based on transaction history
- **Public Trader Profiles** — Shareable reputation at `peeplx.com/trader/:username`
- **Trust Badges** — Visual indicators of trader reliability
- **Cross-Marketplace Verification** — Use your PeeplX reputation anywhere

### Security & Compliance
- **BVN/NIN Identity Verification** — Nigerian identity verification
- **JWT Authentication** — Secure httpOnly cookie-based auth with refresh tokens
- **Rate Limiting** — API protection against abuse
- **Fraud Detection** — Automated suspicious activity monitoring

### Payment Integration
- **Monnify** — Nigerian payment processing (cards, bank transfers, USSD)
- **Wallet System** — Internal balance management
- **Webhook Verification** — Secure payment callbacks

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16.2 (App Router, Turbopack) |
| **Language** | TypeScript 5.7 |
| **Styling** | Tailwind CSS 3.4, GSAP animations |
| **UI Components** | shadcn/ui (50+ Radix UI components) |
| **Forms & Validation** | React Hook Form, Zod |
| **Database** | PostgreSQL via Supabase (`@supabase/supabase-js`) |
| **Auth** | JWT tokens (`jose` for Edge Runtime, `jsonwebtoken` for Node.js), password hashing (`bcryptjs`) |
| **Payments** | Monnify API |
| **Deploy** | Vercel |

---

## 📂 Project Structure

```
peeplx/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── api/                 # API Route Handlers
│   │   │   ├── auth/            # login · logout · register · refresh · me
│   │   │   ├── escrow/          # create · list · get by id
│   │   │   ├── payment/         # initialize · verify · webhook
│   │   │   └── user/            # profile
│   │   ├── auth/                # Login & Register pages
│   │   ├── dashboard/           # User dashboard
│   │   ├── escrow/              # Create & view escrow transactions
│   │   ├── payment/             # Payment callback page
│   │   ├── globals.css          # Global styles
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Landing page
│   ├── components/
│   │   ├── ui/                  # 50+ shadcn/ui components
│   │   ├── LandingPage.tsx      # Landing page composition
│   │   ├── Navigation.tsx       # Site navigation
│   │   └── ThemeToggle.tsx      # Light/dark mode toggle
│   ├── hooks/
│   │   └── use-mobile.ts        # Responsive breakpoint hook
│   ├── lib/
│   │   ├── auth.ts              # JWT helpers
│   │   ├── monnify.ts           # Monnify API client
│   │   ├── supabase.ts          # Supabase JS client (browser + server)
│   │   └── utils.ts             # Tailwind class utilities (cn)
│   ├── sections/                # Landing page sections (Hero, HowItWorks, …)
│   └── types/                   # Shared TypeScript types
├── public/                      # Static assets
├── middleware.ts                # Auth middleware (protects dashboard & API routes)
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── vercel.json                  # Vercel deployment configuration
└── .env.example                 # Environment variable template
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **npm** 9+
- A [Supabase](https://supabase.com) project (PostgreSQL)
- A [Monnify](https://monnify.com) sandbox account

### 1. Clone & Install

```bash
git clone https://github.com/mederhoo-script/peeplx.git
cd peeplx
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your values (see [Environment Variables](#-environment-variables) below).

### 3. Set Up Database

Create the required tables in your Supabase project. You can run the SQL migration from the [Supabase SQL editor](https://supabase.com/dashboard/project/_/sql) or use the Supabase CLI (`supabase db push`).

Tables required: `User`, `Wallet`, `EscrowTransaction`, `Payment`, `TrustScore`, `Notification`.


### 4. Start Development Server

```bash
npm run dev
# → http://localhost:3000
```

---

## 🔧 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 🗺️ Application Routes

### Pages
| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/auth/login` | User login |
| `/auth/register` | User registration |
| `/dashboard` | User dashboard (protected) |
| `/escrow/new` | Create new escrow (protected) |
| `/escrow/[id]` | View escrow details (protected) |
| `/payment/callback` | Monnify payment callback |

### API Routes
| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login & set cookie |
| `POST` | `/api/auth/logout` | Clear auth cookie |
| `POST` | `/api/auth/refresh` | Refresh JWT token |
| `GET`  | `/api/auth/me` | Get current user |
| `POST` | `/api/escrow` | Create escrow transaction |
| `GET`  | `/api/escrow` | List user's escrows |
| `GET`  | `/api/escrow/[id]` | Get escrow by ID |
| `POST` | `/api/payment/initialize` | Initialize Monnify payment |
| `POST` | `/api/payment/verify` | Verify payment status |
| `POST` | `/api/payment/webhook` | Monnify webhook handler |
| `GET`  | `/api/user/profile` | Get user profile |

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Supabase JS client (used by @supabase/supabase-js in both browser and server code)
NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<your-anon-public-key>"
SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"   # server-side only

# JWT Authentication
JWT_SECRET="your-long-random-secret-min-32-chars"
JWT_REFRESH_SECRET="your-other-long-random-secret-min-32-chars"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Monnify Payment Gateway
MONNIFY_API_KEY="your-monnify-api-key"
MONNIFY_SECRET_KEY="your-monnify-secret-key"
MONNIFY_CONTRACT_CODE="your-monnify-contract-code"
MONNIFY_BASE_URL="https://sandbox.monnify.com"
MONNIFY_WEBHOOK_SECRET="your-monnify-webhook-hash-secret"
```

**Where to get these:**
- **Supabase URL & keys**: Dashboard → Settings → API
- **Monnify**: [Monnify Dashboard](https://app.monnify.com) → API Keys
- **JWT secrets**: `openssl rand -base64 64`

---

## 🗄️ Database Schema

The Supabase database (PostgreSQL) uses these tables:

| Model | Description |
|-------|-------------|
| `User` | User accounts, KYC, trust score |
| `Wallet` | User wallet balances (available, escrow-locked, pending) |
| `EscrowTransaction` | Escrow transactions linking buyer and seller |
| `Payment` | Monnify payment records |
| `TrustScore` | Portable trust score data |
| `Notification` | User notifications |

### Trust Score Levels
| Range | Badge |
|-------|-------|
| 0–30 | 🌱 New Trader |
| 30–60 | ✅ Verified Trader |
| 60–85 | 🌟 Trusted Trader |
| 85–100 | 👑 Elite Trader |

---

## 🚢 Deployment

The project is configured for one-click deployment on **Vercel**.

1. Fork/clone this repo
2. Import into [Vercel](https://vercel.com/new)
3. Add the environment variables listed below as **Vercel project secrets** (Settings → Environment Variables)
4. Deploy — Vercel auto-detects Next.js and uses `vercel.json` config

### Required Vercel Environment Variables

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server-side only) | Supabase → Settings → API |
| `JWT_SECRET` | HS256 secret for access tokens (min 32 chars) | `openssl rand -base64 64` |
| `JWT_REFRESH_SECRET` | HS256 secret for refresh tokens (min 32 chars) | `openssl rand -base64 64` |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL (e.g. `https://peeplx.vercel.app`) | Vercel project URL |
| `MONNIFY_API_KEY` | Monnify API key | [Monnify Dashboard](https://app.monnify.com) → API Keys |
| `MONNIFY_SECRET_KEY` | Monnify secret key | Monnify Dashboard → API Keys |
| `MONNIFY_CONTRACT_CODE` | Monnify contract code | Monnify Dashboard → Contracts |
| `MONNIFY_WEBHOOK_SECRET` | Monnify webhook hash secret | Monnify Dashboard → Webhook settings |

> **Note:** `MONNIFY_BASE_URL` defaults to `https://sandbox.monnify.com` for testing.  
> Set it to `https://api.monnify.com` for production.

The `vercel.json` maps each variable to a Vercel secret reference (e.g. `@database_url`). Create matching secrets in your Vercel team/project settings before deploying.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

## 🆘 Support

- 📧 Email: support@peeplx.com
- 💬 Discord: [discord.gg/peeplx](https://discord.gg/peeplx)
- 📖 Docs: [docs.peeplx.com](https://docs.peeplx.com)

---

Built with ❤️ in Lagos, Nigeria 🇳🇬 · **PeeplX** — Building Trust in Digital Commerce
