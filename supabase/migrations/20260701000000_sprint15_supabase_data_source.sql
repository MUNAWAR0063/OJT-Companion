create table if not exists public.app_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_key text not null,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, storage_key)
);

alter table public.app_state enable row level security;

drop policy if exists "Users can read their own app state" on public.app_state;
create policy "Users can read their own app state"
  on public.app_state
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own app state" on public.app_state;
create policy "Users can insert their own app state"
  on public.app_state
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own app state" on public.app_state;
create policy "Users can update their own app state"
  on public.app_state
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own app state" on public.app_state;
create policy "Users can delete their own app state"
  on public.app_state
  for delete
  to authenticated
  using (auth.uid() = user_id);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'app_state'
  ) then
    alter publication supabase_realtime add table public.app_state;
  end if;
end $$;

insert into storage.buckets (id, name, public, file_size_limit)
values ('ojt-attachments', 'ojt-attachments', false, 10485760)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;

drop policy if exists "Users can read their own OJT attachments" on storage.objects;
create policy "Users can read their own OJT attachments"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'ojt-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can upload their own OJT attachments" on storage.objects;
create policy "Users can upload their own OJT attachments"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'ojt-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update their own OJT attachments" on storage.objects;
create policy "Users can update their own OJT attachments"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'ojt-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'ojt-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete their own OJT attachments" on storage.objects;
create policy "Users can delete their own OJT attachments"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'ojt-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
