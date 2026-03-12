-- ThoroughByte Database Schema
-- Run this in the Supabase SQL Editor after creating your project.

-- ===============================================================
-- 1. User profiles table (extends Supabase auth.users)
-- ===============================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text check (role in ('agent', 'trainer', 'owner', 'farm', 'other', 'admin')),
  plan text not null default 'free' check (plan in ('free', 'pro')),
  credits_remaining integer not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update their own profile (but not credits or plan â those are server-side)
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ===============================================================
-- 2. Generated profiles table (tracks which cards a user has generated)
-- ===============================================================
create table public.generated_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  hip integer not null,
  sale_id text not null default 'obs-march-2026',
  card_data jsonb,          -- snapshot of horse data at generation time
  card_image_url text,      -- URL to stored PNG in Supabase Storage
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.generated_profiles enable row level security;

-- Users can read their own generated profiles
create policy "Users can view own generated profiles"
  on public.generated_profiles for select
  using (auth.uid() = user_id);

-- Only server (service role) inserts â no client-side insert policy
-- This prevents users from bypassing credit checks

-- ===============================================================
-- 3. Auto-create profile on signup (trigger)
-- ===============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===============================================================
-- 4. Atomic credit decrement function (called from API route)
-- ===============================================================
-- Returns true if credit was successfully consumed, false if none left.
create or replace function public.consume_credit(p_user_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  user_plan text;
  remaining integer;
begin
  select plan into user_plan from public.profiles where id = p_user_id;

  -- Pro users get unlimited generation
  if user_plan = 'pro' then
    return true;
  end if;

  update public.profiles
  set credits_remaining = credits_remaining - 1,
      updated_at = now()
  where id = p_user_id
    and credits_remaining > 0
  returning credits_remaining into remaining;

  return found;
end;
$$;

-- ===============================================================
-- 5. Indexes
-- ===============================================================
create index idx_generated_profiles_user_id on public.generated_profiles(user_id);
create index idx_generated_profiles_hip on public.generated_profiles(hip);

-- ===============================================================
-- 6. Storage bucket for profile card PNGs
-- ===============================================================
-- Run this separately in Supabase Dashboard > Storage:
-- Create bucket: "profile-cards" (public access for generated PNGs)
-- Or via SQL:
-- insert into storage.buckets (id, name, public) values ('profile-cards', 'profile-cards', true);
