-- 0007_subscription.sql
-- Extends profiles with Stripe subscription details so the webhook can record
-- the full state of a customer's subscription. `subscription_status` and
-- `stripe_customer_id` already exist from 0001_profiles.sql.

alter table public.profiles
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_price_id text,
  add column if not exists subscription_plan text,                       -- 'monthly' | 'yearly'
  add column if not exists subscription_current_period_end timestamptz,
  add column if not exists subscription_cancel_at_period_end boolean not null default false;

-- Fast lookup from a Stripe customer id (used by the webhook).
create index if not exists profiles_stripe_customer_id_idx
  on public.profiles (stripe_customer_id);

create index if not exists profiles_stripe_subscription_id_idx
  on public.profiles (stripe_subscription_id);

-- Note on security: the Stripe webhook writes to these columns using the
-- service-role key (bypasses RLS) because it runs server-to-server with no
-- user session. Clients can still only SELECT their own row via the existing
-- RLS policy, and the UPDATE policy from 0001 only lets users edit their own
-- profile — but subscription columns should only ever be changed by the
-- webhook, never the client.
