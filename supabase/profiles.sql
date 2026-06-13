-- ── profiles table ──────────────────────────────────────────────────────────
-- Stores the authoritative role + onboarding_completed for each user.
-- Read by hydrateUser (Step 2.5) on every sign-in — takes priority over the
-- users table so returning Google users skip role-selection and onboarding.
-- Written by updateRole() and completeOnboarding() in AppContext.
--
-- Run this in the Supabase SQL editor once.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  role                 text check (role in ('student', 'ngo')),
  onboarding_completed boolean not null default false,
  updated_at           timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select" on public.profiles
  for select using (auth.role() = 'authenticated');

create policy "profiles_insert" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update" on public.profiles
  for update using (auth.uid() = id);

-- ── Optional: backfill existing users ───────────────────────────────────────
-- If you already have users who completed onboarding via the old flow, run
-- this to populate the profiles table from the existing users table so they
-- won't be forced through role-selection again.
--
-- insert into public.profiles (id, role, onboarding_completed)
-- select id, role, onboarding_complete
-- from public.users
-- where role is not null
-- on conflict (id) do update
--   set role                 = excluded.role,
--       onboarding_completed = excluded.onboarding_completed;
