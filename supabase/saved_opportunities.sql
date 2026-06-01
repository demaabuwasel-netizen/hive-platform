-- Run this in Supabase SQL Editor → New query → Run

create table if not exists public.saved_opportunities (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  created_at     timestamptz not null default now(),
  unique (user_id, opportunity_id)
);

alter table public.saved_opportunities enable row level security;

create policy "select_own_saved"
  on public.saved_opportunities for select
  using (auth.uid() = user_id);

create policy "insert_own_saved"
  on public.saved_opportunities for insert
  with check (auth.uid() = user_id);

create policy "delete_own_saved"
  on public.saved_opportunities for delete
  using (auth.uid() = user_id);
