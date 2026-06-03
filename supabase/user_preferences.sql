-- Run in Supabase SQL Editor to add language + theme persistence
-- These extend the existing public.users table.

alter table public.users
  add column if not exists preferred_language text not null default 'en',
  add column if not exists preferred_theme    text not null default 'system';

-- Index so hydrateUser's SELECT * picks them up with no extra query
comment on column public.users.preferred_language is 'BCP-47 code: en | he | ar';
comment on column public.users.preferred_theme    is 'light | dark | system';
