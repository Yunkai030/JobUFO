-- 0004_applications.sql
-- Application tracker table

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  resume_id uuid references public.resumes(id) on delete set null,
  company text not null,
  role text not null,
  url text,
  channel text,
  location text,
  salary_range text,
  status text not null default 'applied',
  notes text,
  applied_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- status values: applied, screening, phone, interview, final, offer, rejected, withdrawn

create index applications_user_id_idx on public.applications(user_id);
create index applications_status_idx on public.applications(status);

alter table public.applications enable row level security;

create policy "Users can view own applications"
  on public.applications for select using (auth.uid() = user_id);
create policy "Users can insert own applications"
  on public.applications for insert with check (auth.uid() = user_id);
create policy "Users can update own applications"
  on public.applications for update using (auth.uid() = user_id);
create policy "Users can delete own applications"
  on public.applications for delete using (auth.uid() = user_id);

create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();
