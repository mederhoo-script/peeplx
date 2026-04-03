# PeeplX Next.js Setup Instructions

## What's Been Created

### ✅ Root Configuration Files
- `package.json` - All dependencies configured
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind with exact design tokens
- `tsconfig.json` - TypeScript configuration
- `middleware.ts` - Auth middleware
- `.env.example` - Environment variables template
- `vercel.json` - Vercel deployment config

### ✅ Database & Schema
- `prisma/schema.prisma` - Complete Prisma schema with all models

### ✅ Core Libraries
- `src/lib/prisma.ts` - Prisma client singleton
- `src/lib/auth.ts` - JWT authentication utilities
- `src/lib/monnify.ts` - Complete Monnify API client
- `src/lib/utils.ts` - Utility functions
- `src/types/index.ts` - TypeScript types

### ✅ Sections (Partially Created)
- `src/sections/HeroSection.tsx` ✅
- `src/sections/HowItWorksSection.tsx` ✅

## What Needs to Be Created

You need to create the remaining files by copying from the existing frontend and converting them:

### Sections (Copy from `/frontend/src/sections/`)
1. FeatureHighlightSection.tsx - Add 'use client' at top
2. TrustProfileSection.tsx - Add 'use client' at top
3. SafetySection.tsx - Add 'use client' at top
4. VerificationSection.tsx - Add 'use client' at top
5. TrustScoreSection.tsx - Add 'use client' at top
6. TestimonialsSection.tsx - Add 'use client' at top
7. FooterSection.tsx - Add 'use client' at top, convert links to Next.js Link

### Components
1. `src/components/Navigation.tsx` - Update with auth links
2. `src/components/ThemeToggle.tsx` - Use next-themes

### App Routes

#### Pages
- `src/app/layout.tsx` - Root layout with ThemeProvider
- `src/app/page.tsx` - Landing page with all sections
- `src/app/auth/login/page.tsx` - Login page
- `src/app/auth/register/page.tsx` - Register page
- `src/app/dashboard/layout.tsx` - Dashboard layout
- `src/app/dashboard/page.tsx` - Dashboard page
- `src/app/escrow/new/page.tsx` - Create escrow page
- `src/app/escrow/[id]/page.tsx` - Escrow details page

#### API Routes
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/app/api/auth/me/route.ts`
- `src/app/api/auth/refresh/route.ts`
- `src/app/api/escrow/route.ts`
- `src/app/api/escrow/[id]/route.ts`
- `src/app/api/payment/initialize/route.ts`
- `src/app/api/payment/verify/route.ts`
- `src/app/api/payment/webhook/route.ts`
- `src/app/api/user/profile/route.ts`

## Installation & Setup

```bash
# Install dependencies
npm install

# Setup database
# 1. Create PostgreSQL database
# 2. Copy .env.example to .env and fill in values
cp .env.example .env

# 3. Run Prisma migrations
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

## Key Conversion Notes

### For All Section Files:
1. Add `'use client'` at the very top
2. Replace any anchor tags with `<Link>` from `next/link`
3. Keep all GSAP animations exactly as is

### For Navigation Component:
- Replace "Log in" and "Get started" buttons with actual auth links:
  - `/auth/login` for login
  - `/auth/register` for registration

### For API Routes:
- Use Next.js 13+ App Router route handlers
- Return `NextResponse.json()`
- Handle errors properly
- Use the auth utilities from `src/lib/auth.ts`

## File Templates

See the files already created for examples of the pattern to follow.
