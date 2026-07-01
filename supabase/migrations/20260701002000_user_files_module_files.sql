create table if not exists public.module_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module text not null,
  scope_key text not null default 'default',
  bucket text not null default 'user-files',
  file_path text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, module, scope_key, file_path)
);

create index if not exists module_files_user_module_idx
  on public.module_files (user_id, module);

create or replace function public.set_module_files_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_module_files_updated_at on public.module_files;
create trigger set_module_files_updated_at
  before update on public.module_files
  for each row
  execute function public.set_module_files_updated_at();

alter table public.module_files enable row level security;

drop policy if exists "Users can read their own module files" on public.module_files;
create policy "Users can read their own module files"
  on public.module_files
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own module files" on public.module_files;
create policy "Users can insert their own module files"
  on public.module_files
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own module files" on public.module_files;
create policy "Users can update their own module files"
  on public.module_files
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own module files" on public.module_files;
create policy "Users can delete their own module files"
  on public.module_files
  for delete
  to authenticated
  using (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit)
values ('user-files', 'user-files', false, 10485760)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;

drop policy if exists "Users can read their own user files" on storage.objects;
create policy "Users can read their own user files"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'user-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can upload their own user files" on storage.objects;
create policy "Users can upload their own user files"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'user-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update their own user files" on storage.objects;
create policy "Users can update their own user files"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'user-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'user-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete their own user files" on storage.objects;
create policy "Users can delete their own user files"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'user-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
