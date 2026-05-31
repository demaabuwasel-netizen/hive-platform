-- ============================================================
-- Hive — Supabase schema (Milestone 2)
-- Run this in the Supabase SQL editor to set up the database.
-- ============================================================

-- ── 1. users ────────────────────────────────────────────────
-- Extends auth.users. One row per Hive account.
create table if not exists public.users (
  id                  uuid primary key references auth.users(id) on delete cascade,
  name                text not null default '',
  email               text not null,
  avatar_url          text,
  role                text check (role in ('student', 'ngo')),          -- null until role-selection
  onboarding_complete boolean not null default false,
  provider            text not null default 'email',                    -- 'email' | 'google'
  created_at          timestamptz not null default now()
);

-- ── 2. student_profiles ──────────────────────────────────────
create table if not exists public.student_profiles (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null unique references public.users(id) on delete cascade,
  field        text,
  university   text,
  skills       text[]  not null default '{}',
  courses      text[]  not null default '{}',
  interests    text[]  not null default '{}',
  experience   text,
  goals        text,
  languages    jsonb   not null default '[]',   -- [{lang: string, level: string}]
  availability text,
  links        jsonb   not null default '{}',   -- {linkedin, github, portfolio}
  bio          text,
  phone        text,
  updated_at   timestamptz not null default now()
);

-- ── 3. ngo_profiles ─────────────────────────────────────────
create table if not exists public.ngo_profiles (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null unique references public.users(id) on delete cascade,
  name         text,
  location     text,
  phone        text,
  description  text,
  help_needed  text,
  image_url    text,
  tags         text[] not null default '{}',
  website      text,
  instagram    text,
  twitter      text,
  updated_at   timestamptz not null default now()
);

-- ── 4. opportunities ────────────────────────────────────────
create table if not exists public.opportunities (
  id               uuid primary key default gen_random_uuid(),
  ngo_id           uuid not null references public.users(id) on delete cascade,
  title            text not null,
  org_name         text not null,
  category         text,
  field            text,
  description      text,
  mission_impact   text,
  skills           text[] not null default '{}',
  languages        text[] not null default '{}',
  weekly_hours     text,
  duration         text,
  location         text,
  work_mode        text check (work_mode in ('remote', 'hybrid', 'onsite')),
  deadline         date,
  status           text not null default 'draft'
                   check (status in ('draft', 'active', 'paused', 'closed')),
  applicant_count  integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── 5. applications ─────────────────────────────────────────
create table if not exists public.applications (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references public.users(id) on delete cascade,
  opportunity_id   uuid references public.opportunities(id) on delete set null,
  ngo_id           uuid not null references public.users(id),
  message          text,
  availability     text,
  links            jsonb not null default '{}',   -- {linkedin, github, portfolio}
  status           text not null default 'submitted'
                   check (status in (
                     'submitted', 'under_review', 'shortlisted',
                     'interview', 'accepted', 'rejected'
                   )),
  submitted_at     timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Prevent duplicate applications from the same student to the same opportunity
create unique index if not exists applications_student_opp_unique
  on public.applications(student_id, opportunity_id)
  where opportunity_id is not null;

-- ── 6. saved_opportunities ──────────────────────────────────
create table if not exists public.saved_opportunities (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references public.users(id) on delete cascade,
  opportunity_id   uuid not null references public.opportunities(id) on delete cascade,
  saved_at         timestamptz not null default now(),
  unique (student_id, opportunity_id)
);


-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.users               enable row level security;
alter table public.student_profiles    enable row level security;
alter table public.ngo_profiles        enable row level security;
alter table public.opportunities       enable row level security;
alter table public.applications        enable row level security;
alter table public.saved_opportunities enable row level security;

-- users: anyone authenticated can read; only own row can be updated
create policy "users_select" on public.users
  for select using (auth.role() = 'authenticated');
create policy "users_insert" on public.users
  for insert with check (auth.uid() = id);
create policy "users_update" on public.users
  for update using (auth.uid() = id);

-- student_profiles: any authenticated user can read; only owner can write
create policy "student_profiles_select" on public.student_profiles
  for select using (auth.role() = 'authenticated');
create policy "student_profiles_insert" on public.student_profiles
  for insert with check (auth.uid() = user_id);
create policy "student_profiles_update" on public.student_profiles
  for update using (auth.uid() = user_id);

-- ngo_profiles: any authenticated user can read; only owner can write
create policy "ngo_profiles_select" on public.ngo_profiles
  for select using (auth.role() = 'authenticated');
create policy "ngo_profiles_insert" on public.ngo_profiles
  for insert with check (auth.uid() = user_id);
create policy "ngo_profiles_update" on public.ngo_profiles
  for update using (auth.uid() = user_id);

-- opportunities: any authenticated user can read active ones;
-- NGO can manage their own
create policy "opportunities_select" on public.opportunities
  for select using (
    auth.role() = 'authenticated'
    and (status = 'active' or ngo_id = auth.uid())
  );
create policy "opportunities_insert" on public.opportunities
  for insert with check (auth.uid() = ngo_id);
create policy "opportunities_update" on public.opportunities
  for update using (auth.uid() = ngo_id);
create policy "opportunities_delete" on public.opportunities
  for delete using (auth.uid() = ngo_id);

-- applications: student sees own; NGO sees apps to their opportunities
create policy "applications_select_student" on public.applications
  for select using (auth.uid() = student_id);
create policy "applications_select_ngo" on public.applications
  for select using (
    exists (
      select 1 from public.opportunities o
      where o.id = opportunity_id and o.ngo_id = auth.uid()
    )
    or auth.uid() = ngo_id
  );
create policy "applications_insert" on public.applications
  for insert with check (auth.uid() = student_id);
create policy "applications_update_ngo" on public.applications
  for update using (
    exists (
      select 1 from public.opportunities o
      where o.id = opportunity_id and o.ngo_id = auth.uid()
    )
    or auth.uid() = ngo_id
  );

-- saved_opportunities: only the student who saved can read/write
create policy "saved_opportunities_all" on public.saved_opportunities
  for all using (auth.uid() = student_id)
  with check (auth.uid() = student_id);


-- ============================================================
-- Trigger: create public.users row when auth.users row is created
-- Runs as security definer so it bypasses RLS on public.users.
-- This handles both email sign-up (no session yet) and Google OAuth.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, name, email, role, onboarding_complete, provider)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', ''),
    new.email,
    null,
    false,
    coalesce(new.raw_app_meta_data->>'provider', 'email')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- Trigger: auto-increment applicant_count when application inserted
-- ============================================================
create or replace function increment_applicant_count()
returns trigger language plpgsql security definer as $$
begin
  if new.opportunity_id is not null then
    update public.opportunities
    set applicant_count = applicant_count + 1
    where id = new.opportunity_id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_application_insert on public.applications;
create trigger on_application_insert
  after insert on public.applications
  for each row execute function increment_applicant_count();
