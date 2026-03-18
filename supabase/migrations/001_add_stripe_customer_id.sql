-- Add stripe_customer_id to profiles for linking Supabase users to Stripe
alter table public.profiles add column if not exists stripe_customer_id text;

-- Index for webhook lookups by stripe_customer_id
create index if not exists idx_profiles_stripe_customer_id on public.profiles(stripe_customer_id);
