-- =============================================================================
-- PeeplX — Supabase Database Schema
-- Run this once in: Supabase Dashboard → SQL Editor → New Query → Run
-- =============================================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ── USER ─────────────────────────────────────────────────────────────────────
create table if not exists "User" (
  id                     text        primary key default gen_random_uuid()::text,
  email                  text        not null unique,
  "passwordHash"         text        not null,
  "firstName"            text        not null,
  "lastName"             text        not null,
  username               text        unique,
  phone                  text,
  role                   text        not null default 'USER',        -- USER | ADMIN
  status                 text        not null default 'ACTIVE',      -- ACTIVE | SUSPENDED | BANNED
  "loginAttempts"        integer     not null default 0,
  "lockedUntil"          timestamptz,
  "lastLoginAt"          timestamptz,
  "isEmailVerified"      boolean     not null default false,
  "idVerificationStatus" text        not null default 'UNVERIFIED',  -- UNVERIFIED | PENDING | VERIFIED | REJECTED
  "createdAt"            timestamptz not null default now(),
  "updatedAt"            timestamptz not null default now()
);

-- ── WALLET ───────────────────────────────────────────────────────────────────
create table if not exists "Wallet" (
  id                    text        primary key default gen_random_uuid()::text,
  "userId"              text        not null references "User"(id) on delete cascade,
  "availableBalance"    numeric     not null default 0,
  "escrowLockedBalance" numeric     not null default 0,
  "pendingBalance"      numeric     not null default 0,
  currency              text        not null default 'NGN',
  "createdAt"           timestamptz not null default now(),
  "updatedAt"           timestamptz not null default now()
);

-- ── TRUST SCORE ──────────────────────────────────────────────────────────────
create table if not exists "TrustScore" (
  id                      text        primary key default gen_random_uuid()::text,
  "userId"                text        not null references "User"(id) on delete cascade,
  score                   numeric     not null default 0,
  "totalTransactions"     integer     not null default 0,
  "completedTransactions" integer     not null default 0,
  "disputeCount"          integer     not null default 0,
  "cancelledCount"        integer     not null default 0,
  "emailVerified"         boolean     not null default false,
  "phoneVerified"         boolean     not null default false,
  "idVerified"            boolean     not null default false,
  "lastCalculatedAt"      timestamptz not null default now(),
  "createdAt"             timestamptz not null default now(),
  "updatedAt"             timestamptz not null default now()
);

-- ── ESCROW TRANSACTION ───────────────────────────────────────────────────────
create table if not exists "EscrowTransaction" (
  id                 text        primary key default gen_random_uuid()::text,
  title              text        not null,
  description        text,
  "buyerId"          text        not null references "User"(id),
  "sellerId"         text        not null references "User"(id),
  amount             numeric     not null,
  currency           text        not null default 'NGN',
  status             text        not null default 'PENDING',  -- PENDING | FUNDED | IN_PROGRESS | COMPLETED | DISPUTED | CANCELLED | REFUNDED
  "transactionType"  text        not null default 'GOODS',   -- GOODS | SERVICES | DIGITAL | OTHER
  "deliveryDays"     integer,
  "deliveryDeadline" timestamptz,
  terms              text,
  "fundedAt"         timestamptz,
  "completedAt"      timestamptz,
  "disputedAt"       timestamptz,
  "cancelledAt"      timestamptz,
  "createdAt"        timestamptz not null default now(),
  "updatedAt"        timestamptz not null default now()
);

-- ── PAYMENT ──────────────────────────────────────────────────────────────────
create table if not exists "Payment" (
  id                  text        primary key default gen_random_uuid()::text,
  "escrowId"          text        not null references "EscrowTransaction"(id),
  "userId"            text        not null references "User"(id),
  amount              numeric     not null,
  reference           text        not null unique,
  "monnifyReference"  text,
  status              text        not null default 'PENDING', -- PENDING | PROCESSING | COMPLETED | FAILED | REFUNDED
  channel             text,                                   -- BANK_TRANSFER | CARD | USSD | WALLET
  "paidAt"            timestamptz,
  "createdAt"         timestamptz not null default now(),
  "updatedAt"         timestamptz not null default now()
);

-- ── NOTIFICATION ─────────────────────────────────────────────────────────────
create table if not exists "Notification" (
  id          text        primary key default gen_random_uuid()::text,
  "userId"    text        not null references "User"(id) on delete cascade,
  type        text        not null,
  title       text        not null,
  message     text        not null,
  read        boolean     not null default false,
  "readAt"    timestamptz,
  "createdAt" timestamptz not null default now()
);

-- ── AUTO-UPDATE updatedAt TRIGGER ────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$;

create trigger trg_user_updated_at
  before update on "User"
  for each row execute function update_updated_at();

create trigger trg_wallet_updated_at
  before update on "Wallet"
  for each row execute function update_updated_at();

create trigger trg_trust_updated_at
  before update on "TrustScore"
  for each row execute function update_updated_at();

create trigger trg_escrow_updated_at
  before update on "EscrowTransaction"
  for each row execute function update_updated_at();

create trigger trg_payment_updated_at
  before update on "Payment"
  for each row execute function update_updated_at();

-- ── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
-- The app uses service_role key server-side (bypasses RLS).
-- Enable RLS to prevent any accidental direct browser/anon access.
alter table "User"              enable row level security;
alter table "Wallet"            enable row level security;
alter table "TrustScore"        enable row level security;
alter table "EscrowTransaction" enable row level security;
alter table "Payment"           enable row level security;
alter table "Notification"      enable row level security;
