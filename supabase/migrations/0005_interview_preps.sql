-- 0005_interview_preps.sql
-- Interview preparation results

create table if not exists public.interview_preps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  resume_id uuid not null references public.resumes(id) on delete cascade,
  job_title text,
  company text,
  job_description text not null,
  questions jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create index interview_preps_user_id_idx on public.interview_preps(user_id);

alter table public.interview_preps enable row level security;

create policy "Users can view own interview_preps"
  on public.interview_preps for select using (auth.uid() = user_id);
create policy "Users can insert own interview_preps"
  on public.interview_preps for insert with check (auth.uid() = user_id);
create policy "Users can delete own interview_preps"
  on public.interview_preps for delete using (auth.uid() = user_id);
