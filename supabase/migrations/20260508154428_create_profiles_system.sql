-- =========================
-- ENABLE EXTENSIONS
-- =========================

create extension if not exists "uuid-ossp";

-- =========================
-- CREATE ROLE TYPE
-- =========================

create type public.user_role as enum (
  'buyer',
  'seller',
  'admin'
);

-- =========================
-- CREATE PROFILES TABLE
-- =========================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  full_name text,

  email text unique not null,

  avatar_url text,

  role public.user_role not null default 'buyer',

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);

-- =========================
-- CREATE UPDATED_AT FUNCTION
-- =========================

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================
-- CREATE UPDATED_AT TRIGGER
-- =========================

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.handle_updated_at();

-- =========================
-- ENABLE RLS
-- =========================

alter table public.profiles enable row level security;

-- =========================
-- RLS POLICIES
-- =========================

create policy "Users can view own profile"
on public.profiles
for select
using (
  auth.uid() = id
);

create policy "Users can insert own profile"
on public.profiles
for insert
with check (
  auth.uid() = id
);

create policy "Users can update own profile"
on public.profiles
for update
using (
  auth.uid() = id
);

-- =========================
-- AUTO PROFILE CREATION
-- =========================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    avatar_url,
    role
  )
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    'buyer'
  );

  return new;
end;
$$;

-- =========================
-- TRIGGER AFTER SIGNUP
-- =========================

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();