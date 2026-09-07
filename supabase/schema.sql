-- IT QUEST production schema
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null, role text not null default 'moderator'
);
create table if not exists worlds (id text primary key, number int not null, title text not null, description text not null, level_range jsonb not null, icon text);
create table if not exists levels (id text primary key, number int not null, world_id text references worlds(id), title text not null, description text not null, difficulty text not null, estimated_hours int not null, status text not null default 'PUBLISHED', lessons jsonb not null default '[]', prerequisites jsonb not null default '[]', xp_reward int not null default 50);
create table if not exists lessons (id text primary key, level_id text references levels(id), data jsonb not null, status text not null default 'DRAFT', version int not null default 1, updated_at timestamptz not null default now());
create table if not exists quizzes (id text primary key, lesson_id text references lessons(id) on delete cascade, data jsonb not null);
create table if not exists visualizers (id text primary key, data jsonb not null);
create table if not exists problems (id text primary key, data jsonb not null, status text not null default 'DRAFT');
create table if not exists achievements (id text primary key, data jsonb not null);
create table if not exists trackers (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users on delete cascade, data jsonb not null);
create table if not exists themes (id text primary key, data jsonb not null);
create table if not exists settings (id text primary key, data jsonb not null);
create table if not exists content_snapshot (id text primary key, data jsonb not null, updated_at timestamptz not null default now());

create or replace function current_role_name() returns text language sql stable security definer as
$$ select role from profiles where id = auth.uid() $$;

alter table profiles enable row level security;
alter table worlds enable row level security;
alter table levels enable row level security;
alter table lessons enable row level security;
alter table quizzes enable row level security;
alter table visualizers enable row level security;
alter table problems enable row level security;
alter table achievements enable row level security;
alter table trackers enable row level security;
alter table themes enable row level security;
alter table settings enable row level security;
alter table content_snapshot enable row level security;

do $$ declare t text;
begin
  foreach t in array array['worlds','levels','lessons','quizzes','visualizers','problems','achievements','themes','settings','content_snapshot'] loop
    execute format('create policy read_%s on %I for select using (true)', t, t);
    execute format('create policy write_%s on %I for all using (current_role_name() in (''super-admin'',''content-admin'')) with check (current_role_name() in (''super-admin'',''content-admin''))', t, t);
  end loop;
end $$;

create policy profiles_self on profiles for select using (id = auth.uid());
create policy profiles_admin on profiles for all using (current_role_name() = 'super-admin') with check (current_role_name() = 'super-admin');
create policy trackers_self on trackers for all using (user_id = auth.uid()) with check (user_id = auth.uid());
