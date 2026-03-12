-- ============================================================
-- Admin Migration: RLS policies, audit log, grant_credits
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Admin RLS policies for profiles
create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update all profiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 2. Admin RLS policy for generated_profiles
create policy "Admins can view all generated profiles"
  on public.generated_profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 3. Admin actions audit log table
create table if not exists public.admin_actions (
  id uuid default gen_random_uuid() primary key,
  admin_id uuid references public.profiles(id) not null,
  target_user_id uuid references public.profiles(id),
  action text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

alter table public.admin_actions enable row level security;

create policy "Admins can view admin actions"
  on public.admin_actions for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can insert admin actions"
  on public.admin_actions for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create index if not exists idx_admin_actions_admin_id on public.admin_actions(admin_id);
create index if not exists idx_admin_actions_target_user_id on public.admin_actions(target_user_id);

-- 4. Grant credits function
create or replace function public.grant_credits(p_user_id uuid, p_amount integer)
returns integer
language plpgsql
security definer
as $$
declare
  new_credits integer;
begin
  update public.profiles
  set credits_remaining = credits_remaining + p_amount,
      updated_at = now()
  where id = p_user_id
  returning credits_remaining into new_credits;

  return new_credits;
end;
$$;

-- 5. Set your account as admin (replace with your actual email)
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'graham.gochneaur@gmail.com';
