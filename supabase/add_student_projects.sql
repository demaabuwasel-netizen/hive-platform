-- Add persisted student projects for profile previews and public profiles.
alter table public.student_profiles
  add column if not exists projects jsonb not null default '[]';
