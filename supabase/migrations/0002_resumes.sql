-- 0002_resumes.sql
-- Resume builder tables: resumes, personal_info, work_experience, education, skills, projects

-- ============================================================
-- 1. resumes (master table)
-- ============================================================
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Untitled Resume',
  target_role text,
  template text not null default 'clean',
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index resumes_user_id_idx on public.resumes(user_id);

alter table public.resumes enable row level security;

create policy "Users can view own resumes"
  on public.resumes for select using (auth.uid() = user_id);
create policy "Users can insert own resumes"
  on public.resumes for insert with check (auth.uid() = user_id);
create policy "Users can update own resumes"
  on public.resumes for update using (auth.uid() = user_id);
create policy "Users can delete own resumes"
  on public.resumes for delete using (auth.uid() = user_id);

create trigger resumes_set_updated_at
  before update on public.resumes
  for each row execute function public.set_updated_at();

-- ============================================================
-- 2. personal_info (1-to-1 with resume)
-- ============================================================
create table if not exists public.personal_info (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null unique references public.resumes(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  location text,
  linkedin_url text,
  github_url text,
  portfolio_url text,
  summary text
);

alter table public.personal_info enable row level security;

create policy "Users can manage own personal_info"
  on public.personal_info for all
  using (
    resume_id in (select id from public.resumes where user_id = auth.uid())
  );

-- ============================================================
-- 3. work_experience
-- ============================================================
create table if not exists public.work_experience (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  company text,
  role text,
  location text,
  start_date text,
  end_date text,
  is_current boolean not null default false,
  description text,
  sort_order int not null default 0
);

create index work_experience_resume_id_idx on public.work_experience(resume_id);

alter table public.work_experience enable row level security;

create policy "Users can manage own work_experience"
  on public.work_experience for all
  using (
    resume_id in (select id from public.resumes where user_id = auth.uid())
  );

-- ============================================================
-- 4. education
-- ============================================================
create table if not exists public.education (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  institution text,
  degree text,
  field_of_study text,
  location text,
  start_date text,
  end_date text,
  gpa text,
  description text,
  sort_order int not null default 0
);

create index education_resume_id_idx on public.education(resume_id);

alter table public.education enable row level security;

create policy "Users can manage own education"
  on public.education for all
  using (
    resume_id in (select id from public.resumes where user_id = auth.uid())
  );

-- ============================================================
-- 5. skills
-- ============================================================
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  category text,
  items text,
  sort_order int not null default 0
);

create index skills_resume_id_idx on public.skills(resume_id);

alter table public.skills enable row level security;

create policy "Users can manage own skills"
  on public.skills for all
  using (
    resume_id in (select id from public.resumes where user_id = auth.uid())
  );

-- ============================================================
-- 6. projects
-- ============================================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  name text,
  url text,
  technologies text,
  description text,
  sort_order int not null default 0
);

create index projects_resume_id_idx on public.projects(resume_id);

alter table public.projects enable row level security;

create policy "Users can manage own projects"
  on public.projects for all
  using (
    resume_id in (select id from public.resumes where user_id = auth.uid())
  );
