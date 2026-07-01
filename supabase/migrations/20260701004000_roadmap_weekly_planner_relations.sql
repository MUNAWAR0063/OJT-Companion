create table if not exists public.roadmaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'OJT Learning Roadmap',
  trainee_name text not null default '',
  company_name text not null default '',
  start_date date not null,
  end_date date,
  total_weeks int not null default 18,
  progress int not null default 0 check (progress between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roadmap_weeks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  roadmap_id uuid not null references public.roadmaps(id) on delete cascade,
  week_number int not null check (week_number > 0),
  title text not null,
  trip_name text not null default '',
  location text not null default '',
  reflection text not null default '',
  progress int not null default 0 check (progress between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (roadmap_id, week_number)
);

create table if not exists public.weekly_objectives (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  roadmap_id uuid not null references public.roadmaps(id) on delete cascade,
  roadmap_week_id uuid not null references public.roadmap_weeks(id) on delete cascade,
  title text not null,
  description text not null default '',
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low', 'follow_up')),
  status text not null default 'not-started' check (status in ('not-started', 'in-progress', 'completed')),
  equipment text[] not null default '{}',
  notes text not null default '',
  progress int not null default 0 check (progress between 0 and 100),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.objective_checklists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  roadmap_id uuid not null references public.roadmaps(id) on delete cascade,
  roadmap_week_id uuid not null references public.roadmap_weeks(id) on delete cascade,
  weekly_objective_id uuid not null references public.weekly_objectives(id) on delete cascade,
  text text not null,
  done boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.follow_up_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  journal_entry_id text not null,
  weekly_objective_id uuid references public.weekly_objectives(id) on delete set null,
  title text not null,
  status text not null default 'not-started' check (status in ('not-started', 'in-progress', 'completed')),
  priority text not null default 'follow_up' check (priority = 'follow_up'),
  due_week_id uuid references public.roadmap_weeks(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists roadmap_weeks_user_roadmap_idx
  on public.roadmap_weeks (user_id, roadmap_id, week_number);

create index if not exists weekly_objectives_user_week_idx
  on public.weekly_objectives (user_id, roadmap_week_id, status);

create index if not exists objective_checklists_user_objective_idx
  on public.objective_checklists (user_id, weekly_objective_id);

create index if not exists follow_up_actions_user_journal_idx
  on public.follow_up_actions (user_id, journal_entry_id);

create or replace function public.set_roadmap_planner_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_roadmaps_updated_at on public.roadmaps;
create trigger set_roadmaps_updated_at
  before update on public.roadmaps
  for each row
  execute function public.set_roadmap_planner_updated_at();

drop trigger if exists set_roadmap_weeks_updated_at on public.roadmap_weeks;
create trigger set_roadmap_weeks_updated_at
  before update on public.roadmap_weeks
  for each row
  execute function public.set_roadmap_planner_updated_at();

drop trigger if exists set_weekly_objectives_updated_at on public.weekly_objectives;
create trigger set_weekly_objectives_updated_at
  before update on public.weekly_objectives
  for each row
  execute function public.set_roadmap_planner_updated_at();

drop trigger if exists set_objective_checklists_updated_at on public.objective_checklists;
create trigger set_objective_checklists_updated_at
  before update on public.objective_checklists
  for each row
  execute function public.set_roadmap_planner_updated_at();

drop trigger if exists set_follow_up_actions_updated_at on public.follow_up_actions;
create trigger set_follow_up_actions_updated_at
  before update on public.follow_up_actions
  for each row
  execute function public.set_roadmap_planner_updated_at();

alter table public.roadmaps enable row level security;
alter table public.roadmap_weeks enable row level security;
alter table public.weekly_objectives enable row level security;
alter table public.objective_checklists enable row level security;
alter table public.follow_up_actions enable row level security;

drop policy if exists "Users can manage their own roadmaps" on public.roadmaps;
create policy "Users can manage their own roadmaps"
  on public.roadmaps
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage their own roadmap weeks" on public.roadmap_weeks;
create policy "Users can manage their own roadmap weeks"
  on public.roadmap_weeks
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage their own weekly objectives" on public.weekly_objectives;
create policy "Users can manage their own weekly objectives"
  on public.weekly_objectives
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage their own objective checklists" on public.objective_checklists;
create policy "Users can manage their own objective checklists"
  on public.objective_checklists
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage their own follow up actions" on public.follow_up_actions;
create policy "Users can manage their own follow up actions"
  on public.follow_up_actions
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
