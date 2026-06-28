-- 0009_interview_experiences.sql
-- Community interview experiences ("面经"), contributed by users. Shared as a
-- knowledge base: everyone can read, but you can only edit your own submissions.
-- Powers company insights and company-flavored mock interviews.

create table if not exists public.interview_experiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  company_key text not null,            -- lower(trim(company)) for grouping
  role text,
  language text not null default 'en',  -- 'en' | 'zh'
  outcome text,                         -- 'offer' | 'rejected' | 'pending' | null
  content text not null,                -- the raw experience the user wrote
  ai_summary jsonb,                     -- AI-extracted essence (format, questions, tips)
  created_at timestamptz not null default now()
);

alter table public.interview_experiences enable row level security;

-- Shared knowledge base: any authenticated user may read all experiences.
drop policy if exists "Authenticated can read experiences" on public.interview_experiences;
create policy "Authenticated can read experiences"
  on public.interview_experiences for select
  to authenticated
  using (true);

-- Users may only create/edit/delete their own submissions.
drop policy if exists "Users insert own experiences" on public.interview_experiences;
create policy "Users insert own experiences"
  on public.interview_experiences for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users update own experiences" on public.interview_experiences;
create policy "Users update own experiences"
  on public.interview_experiences for update
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users delete own experiences" on public.interview_experiences;
create policy "Users delete own experiences"
  on public.interview_experiences for delete
  to authenticated
  using (auth.uid() = user_id);

create index if not exists experiences_company_key_idx
  on public.interview_experiences (company_key, created_at desc);

-- Cached per-company AI synthesis, keyed by company + language. Written by the
-- server (service-role); readable by any authenticated user.
create table if not exists public.company_insights (
  company_key text not null,
  language text not null default 'en',
  company text not null,
  summary jsonb not null,        -- { overview, rounds[], common_questions[], tips[] }
  source_count int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (company_key, language)
);

alter table public.company_insights enable row level security;

drop policy if exists "Authenticated can read insights" on public.company_insights;
create policy "Authenticated can read insights"
  on public.company_insights for select
  to authenticated
  using (true);
-- No client write policies: only the service-role server code writes here.
