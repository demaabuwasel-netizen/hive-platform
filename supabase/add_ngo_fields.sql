-- Add missing NGO profile fields
ALTER TABLE public.ngo_profiles
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS mission text,
ADD COLUMN IF NOT EXISTS communities text,
ADD COLUMN IF NOT EXISTS org_size text,
ADD COLUMN IF NOT EXISTS preferred_skills text[] NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS project_types text[] NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS registration_number text,
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS contact_name text,
ADD COLUMN IF NOT EXISTS contact_role text;
