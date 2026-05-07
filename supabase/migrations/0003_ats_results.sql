-- 0003_ats_results.sql
-- ATS check results table

create table if not exists public.ats_results (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  job_title text,
  company text,
  job_description text not null,
  overall_score int not null,
  keyword_score int not null,
  experience_score int not null,
  achievement_score int not null,
  format_score int not null,
  matched_keywords jsonb not null default '[]',
  missing_keywords jsonb not null default '[]',
  suggestions jsonb not null default '[]',
  raw_response jsonb,
  created_at timestamptz not null default now()
);

create index ats_results_resume_id_idx on public.ats_results(resume_id);
create index ats_results_user_id_idx on public.ats_results(user_id);

alter table public.ats_results enable row level security;

create policy "Users can view own ats_results"
  on public.ats_results for select
  using (auth.uid() = user_id);

create policy "Users can insert own ats_results"
  on public.ats_results for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own ats_results"
  on public.ats_results for delete
  using (auth.uid() = user_id);
