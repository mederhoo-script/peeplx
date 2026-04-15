# PeeplX — Supabase Migrations

Run each migration **in order** in your Supabase project:
**Supabase Dashboard → SQL Editor → New Query → paste the file → Run**

| File | Description |
|------|-------------|
| `001_seller_listings_trust_score.sql` | Adds `sellerInitiated` + `buyerLinkToken` columns to `EscrowTransaction`, makes `buyerId` nullable (required for seller-initiated listings), and adds extended trust-score verification fields (`bvnVerified`, `ninVerified`, `faceVerified`, `addressVerified`) to `TrustScore`. |

## Symptoms of missing migration 001

If you see **"Failed to create listing"** when clicking *Publish Listing* on `/sell/new`, it almost certainly means migration 001 has not been applied.  The `sellerInitiated` and/or `buyerLinkToken` columns are missing from the `EscrowTransaction` table, or the `buyerId` column still has a NOT NULL constraint from an older schema version.

**Fix:** run `001_seller_listings_trust_score.sql` in the Supabase SQL editor.
