-- 0002: real accounts, role model, draft visibility, published snapshot.
-- Never disables RLS. Only tightens policies.

-- 1) Normalize role names to the target model
update public.profiles set role = case role
  when 'super-admin' then 'super_admin'
  when 'content-admin' then 'content_admin'
  when 'moderator' then 'reviewer'
  else coalesce(role, 'student') end;

alter table public.profiles alter column role set default 'student';
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_role_valid') then
    alter table public.profiles add constraint profiles_role_valid
      check (role in ('student','reviewer','content_admin','super_admin'));
  end if;
end $$;

-- 2) Role helper defaults to student (no profile row yet = student)
create or replace function public.current_role_name() returns text
language sql stable security definer as
$$ select coalesce((select role from public.profiles where id = auth.uid()), 'student') $$;

-- 3) Auto-create a profile for every new auth user
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer as
$$ begin
  insert into public.profiles (id, email, role) values (new.id, new.email, 'student')
  on conflict (id) do nothing;
  return new; end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4) Users may never change their own role; only super_admin may
create or replace function public.protect_profile_role() returns trigger
language plpgsql security definer as
$$ begin
  if new.role is distinct from old.role and public.current_role_name() <> 'super_admin' then
    new.role := old.role;
  end if;
  return new; end $$;
drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role before update on public.profiles
  for each row execute function public.protect_profile_role();

-- 5) Students only read PUBLISHED content; staff see drafts
do $$ declare t text;
begin
  foreach t in array array['lessons','problems'] loop
    execute format('drop policy if exists read_%s on public.%I', t, t);
    execute format('create policy read_%s on public.%I for select using (status = ''PUBLISHED'' or public.current_role_name() in (''reviewer'',''content_admin'',''super_admin''))', t, t);
  end loop;
end $$;
drop policy if exists read_levels on public.levels;
create policy read_levels on public.levels for select using (status = 'PUBLISHED' or public.current_role_name() in ('reviewer','content_admin','super_admin'));
drop policy if exists read_quizzes on public.quizzes;
create policy read_quizzes on public.quizzes for select using (
  exists (select 1 from public.lessons l where l.id = quizzes.lesson_id and l.status = 'PUBLISHED')
  or public.current_role_name() in ('reviewer','content_admin','super_admin'));

-- 6) content_snapshot: 'published' row is public, 'main' (with drafts) is admin-only
drop policy if exists read_content_snapshot on public.content_snapshot;
create policy read_content_snapshot on public.content_snapshot for select using (
  id = 'published' or public.current_role_name() in ('content_admin','super_admin'));
drop policy if exists write_content_snapshot on public.content_snapshot;
create policy write_content_snapshot on public.content_snapshot for all using (
  public.current_role_name() in ('content_admin','super_admin'))
  with check (public.current_role_name() in ('content_admin','super_admin'));

-- 7) Rewrite write policies for the new role names (0001 used old names)
do $$ declare t text;
begin
  foreach t in array array['worlds','levels','lessons','quizzes','visualizers','problems','achievements','themes','settings'] loop
    execute format('drop policy if exists write_%s on public.%I', t, t);
    execute format('create policy write_%s on public.%I for all using (public.current_role_name() in (''content_admin'',''super_admin'')) with check (public.current_role_name() in (''content_admin'',''super_admin''))', t, t);
  end loop;
end $$;

-- 8) Profiles: own read/update, staff read, super_admin full
drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles for select using (
  id = auth.uid() or public.current_role_name() in ('content_admin','super_admin'));
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update using (id = auth.uid());
drop policy if exists profiles_admin on public.profiles;
create policy profiles_admin on public.profiles for all using (public.current_role_name() = 'super_admin')
  with check (public.current_role_name() = 'super_admin');

-- 9) Trackers = per-user progress store (one row per user, sync-safe)
alter table public.trackers add column if not exists updated_at timestamptz not null default now();
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'trackers_user_unique') then
    alter table public.trackers add constraint trackers_user_unique unique (user_id);
  end if;
end $$;
drop policy if exists trackers_self on public.trackers;
create policy trackers_self on public.trackers for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create index if not exists trackers_user_idx on public.trackers (user_id);
