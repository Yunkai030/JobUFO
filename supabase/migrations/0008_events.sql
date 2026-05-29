-- 0008_events.sql
-- Lightweight product analytics. Every meaningful action writes one row here.
-- You own all the raw data — query it with SQL or export it for analysis.

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_name text not null,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- RLS on, with NO policies: regular clients (anon/auth) can neither read nor
-- write this table. Only the service-role key (used by the server-side track()
-- helper) can insert, and you query the raw data from the Supabase SQL editor
-- (which runs as a privileged role and bypasses RLS).
alter table public.events enable row level security;

-- Indexes for the common analytics queries.
create index if not exists events_name_created_idx
  on public.events (event_name, created_at desc);
create index if not exists events_user_created_idx
  on public.events (user_id, created_at desc);
create index if not exists events_created_idx
  on public.events (created_at desc);
