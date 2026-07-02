create table if not exists public.discipline_templates (
  id uuid primary key default gen_random_uuid(),
  discipline text not null check (discipline in ('Operator', 'Instrument', 'Mechanical', 'Electrical', 'HSE')),
  category text not null default 'technical'
    check (category in ('safety', 'operation', 'technical', 'maintenance', 'review')),
  phase text not null check (phase in ('foundation', 'operation', 'advanced')),
  competency_text text not null default '',
  competency_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (discipline, category, phase, competency_text)
);

alter table public.discipline_templates
  add column if not exists category text not null default 'technical'
    check (category in ('safety', 'operation', 'technical', 'maintenance', 'review')),
  add column if not exists competency_text text not null default '';

alter table public.roadmaps
  add column if not exists discipline text not null default 'Electrical'
    check (discipline in ('Operator', 'Instrument', 'Mechanical', 'Electrical', 'HSE')),
  add column if not exists "group" text not null default 'A'
    check ("group" in ('A', 'B')),
  add column if not exists status text not null default 'not-started'
    check (status in ('not-started', 'in-progress', 'completed')),
  add column if not exists mode text not null default 'manual'
    check (mode in ('auto', 'manual')),
  add column if not exists variation_seed text not null default '';

create table if not exists public.roadmap_trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  roadmap_id uuid not null references public.roadmaps(id) on delete cascade,
  trip_number int not null check (trip_number between 1 and 6),
  site text not null check (site in ('Grissik', 'Sokka')),
  focus text not null default '',
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (roadmap_id, trip_number)
);

alter table public.roadmap_weeks
  add column if not exists trip_id uuid references public.roadmap_trips(id) on delete set null,
  add column if not exists status text not null default 'not-started'
    check (status in ('not-started', 'in-progress', 'completed')),
  add column if not exists phase text not null default 'foundation'
    check (phase in ('foundation', 'operation', 'advanced')),
  add column if not exists variation_seed text not null default '';

create table if not exists public.weekly_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_id uuid not null references public.roadmap_weeks(id) on delete cascade,
  title text not null,
  category text not null default 'technical'
    check (category in ('safety', 'operation', 'technical', 'maintenance', 'review')),
  description text not null default '',
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority text not null default 'normal' check (priority in ('normal', 'high', 'follow_up')),
  source text not null default 'roadmap' check (source in ('roadmap', 'journal')),
  weekly_objective_id uuid references public.weekly_objectives(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_checklists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid not null references public.weekly_tasks(id) on delete cascade,
  description text not null,
  status text not null default 'todo' check (status in ('todo', 'done')),
  objective_checklist_id uuid references public.objective_checklists(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.journal_followups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  journal_id text not null,
  task_id uuid not null references public.weekly_tasks(id) on delete cascade,
  follow_up_action_id uuid references public.follow_up_actions(id) on delete set null,
  status text not null default 'todo' check (status in ('todo', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists weekly_tasks_no_duplicate_roadmap_source_idx
  on public.weekly_tasks (week_id, lower(title), source);

create index if not exists discipline_templates_lookup_idx
  on public.discipline_templates (discipline, phase, category);

create index if not exists roadmap_trips_user_roadmap_idx
  on public.roadmap_trips (user_id, roadmap_id, trip_number);

create index if not exists weekly_tasks_user_week_idx
  on public.weekly_tasks (user_id, week_id, status);

create index if not exists task_checklists_user_task_idx
  on public.task_checklists (user_id, task_id);

create index if not exists journal_followups_user_journal_idx
  on public.journal_followups (user_id, journal_id);

drop trigger if exists set_discipline_templates_updated_at on public.discipline_templates;
create trigger set_discipline_templates_updated_at
  before update on public.discipline_templates
  for each row
  execute function public.set_roadmap_planner_updated_at();

drop trigger if exists set_roadmap_trips_updated_at on public.roadmap_trips;
create trigger set_roadmap_trips_updated_at
  before update on public.roadmap_trips
  for each row
  execute function public.set_roadmap_planner_updated_at();

drop trigger if exists set_weekly_tasks_updated_at on public.weekly_tasks;
create trigger set_weekly_tasks_updated_at
  before update on public.weekly_tasks
  for each row
  execute function public.set_roadmap_planner_updated_at();

drop trigger if exists set_task_checklists_updated_at on public.task_checklists;
create trigger set_task_checklists_updated_at
  before update on public.task_checklists
  for each row
  execute function public.set_roadmap_planner_updated_at();

drop trigger if exists set_journal_followups_updated_at on public.journal_followups;
create trigger set_journal_followups_updated_at
  before update on public.journal_followups
  for each row
  execute function public.set_roadmap_planner_updated_at();

alter table public.discipline_templates enable row level security;
alter table public.roadmap_trips enable row level security;
alter table public.weekly_tasks enable row level security;
alter table public.task_checklists enable row level security;
alter table public.journal_followups enable row level security;

drop policy if exists "Authenticated users can read discipline templates" on public.discipline_templates;
create policy "Authenticated users can read discipline templates"
  on public.discipline_templates
  for select
  to authenticated
  using (true);

drop policy if exists "Users can manage their own roadmap trips" on public.roadmap_trips;
create policy "Users can manage their own roadmap trips"
  on public.roadmap_trips
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage their own weekly tasks" on public.weekly_tasks;
create policy "Users can manage their own weekly tasks"
  on public.weekly_tasks
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage their own task checklists" on public.task_checklists;
create policy "Users can manage their own task checklists"
  on public.task_checklists
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage their own journal followups" on public.journal_followups;
create policy "Users can manage their own journal followups"
  on public.journal_followups
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
