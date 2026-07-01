insert into public.user_module_data (user_id, module, scope_key, data, created_at, updated_at)
select user_id, 'profile', scope_key, data, created_at, updated_at
from public.user_module_data
where module = 'user_profile'
on conflict (user_id, module, scope_key)
do update set
  data = public.user_module_data.data || excluded.data,
  updated_at = greatest(public.user_module_data.updated_at, excluded.updated_at);

delete from public.user_module_data
where module = 'user_profile';
