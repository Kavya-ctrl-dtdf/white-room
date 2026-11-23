-- White Room: roles and profiles. Run once in Supabase, SQL Editor.

-- Roles
create type public.user_role as enum ('guest', 'host', 'admin');

-- One profile per auth user
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  role        public.user_role not null default 'guest',
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "Read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update their own name and phone, but not their role
create policy "Update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

-- Create a profile automatically on sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- After your first sign-in, make yourself admin (put your own email in):
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'you@example.com');
