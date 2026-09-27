-- AppSumo lifetime-deal redemption codes.
-- Seeded by scripts/generate-appsumo-codes.mjs, redeemed via
-- POST /api/appsumo/redeem. A redeemed code grants a distinct
-- `appsumo_ltd` entitlement (see route.ts) rather than being folded
-- into the regular Pro subscription plan — keeps it separable if the
-- normal Pro plan's feature set or costs change later.

create table if not exists appsumo_codes (
  code          text primary key,
  status        text not null default 'unused' check (status in ('unused', 'redeemed')),
  clerk_user_id text,
  redeemed_at   timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists idx_appsumo_codes_user
  on appsumo_codes(clerk_user_id) where clerk_user_id is not null;

-- Service role bypasses RLS automatically
alter table appsumo_codes enable row level security;
