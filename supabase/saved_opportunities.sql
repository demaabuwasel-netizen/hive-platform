-- Run this in Supabase SQL Editor → New query → Run
--
-- NOTE: If saved_opportunities already exists with columns student_id / saved_at
-- (created manually before this script), only run the RLS section below.

-- ── Table (skip if already exists with student_id / saved_at columns) ────────
create table if not exists public.saved_opportunities (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid not null references auth.users(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  saved_at       timestamptz not null default now(),
  unique (student_id, opportunity_id)
);

alter table public.saved_opportunities enable row level security;

-- ── RLS policies (always run — drops and recreates to ensure correct column) ──
drop policy if exists "select_own_saved" on public.saved_opportunities;
drop policy if exists "insert_own_saved" on public.saved_opportunities;
drop policy if exists "delete_own_saved" on public.saved_opportunities;

create policy "select_own_saved"
  on public.saved_opportunities for select
  using (auth.uid() = student_id);

create policy "insert_own_saved"
  on public.saved_opportunities for insert
  with check (auth.uid() = student_id);

create policy "delete_own_saved"
  on public.saved_opportunities for delete
  using (auth.uid() = student_id);
