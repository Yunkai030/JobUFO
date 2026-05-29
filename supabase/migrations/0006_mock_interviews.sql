-- 0006_mock_interviews.sql
-- Mock interview sessions and conversation turns

create table if not exists public.mock_interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  resume_id uuid not null references public.resumes(id) on delete cascade,
  company text not null,
  role text not null,
  job_description text,
  status text not null default 'in_progress',
  current_round int not null default 0,
  rounds jsonb not null default '[]',
  report jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- status: in_progress, completed
-- rounds: array of { type, title, questions: [{ question, answer, feedback, score }] }
-- report: { overall_score, strengths, weaknesses, suggestions, round_scores }

create index mock_interviews_user_id_idx on public.mock_interviews(user_id);

alter table public.mock_interviews enable row level security;

create policy "Users can view own mock_interviews"
  on public.mock_interviews for select using (auth.uid() = user_id);
create policy "Users can insert own mock_interviews"
  on public.mock_interviews for insert with check (auth.uid() = user_id);
create policy "Users can update own mock_interviews"
  on public.mock_interviews for update using (auth.uid() = user_id);
create policy "Users can delete own mock_interviews"
  on public.mock_interviews for delete using (auth.uid() = user_id);

create trigger mock_interviews_set_updated_at
  before update on public.mock_interviews
  for each row execute function public.set_updated_at();
