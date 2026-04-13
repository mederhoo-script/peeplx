-- =============================================================================
-- Migration 001: Seller Listings, Extended Trust Score, and User trustScore
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- =============================================================================

-- ── USER: add denormalised trustScore ────────────────────────────────────────
alter table "User" add column if not exists "trustScore" integer not null default 0;

-- ── ESCROW: seller-initiated listings ────────────────────────────────────────
-- Allow seller-initiated listings where no buyer is assigned yet
alter table "EscrowTransaction" alter column "buyerId" drop not null;

-- Flag to distinguish seller-initiated listings from buyer-initiated escrows
alter table "EscrowTransaction"
  add column if not exists "sellerInitiated" boolean not null default false;

-- Unique shareable token for the buyer link  (e.g. /product/<token>)
alter table "EscrowTransaction"
  add column if not exists "buyerLinkToken" text unique;

-- ── TRUST SCORE: extended verification fields ────────────────────────────────
alter table "TrustScore" add column if not exists "bvnVerified"     boolean not null default false;
alter table "TrustScore" add column if not exists "ninVerified"     boolean not null default false;
alter table "TrustScore" add column if not exists "faceVerified"    boolean not null default false;
alter table "TrustScore" add column if not exists "addressVerified" boolean not null default false;
