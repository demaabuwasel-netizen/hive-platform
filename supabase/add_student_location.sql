-- Migration: Add country and city to student_profiles
-- The onboarding flow already collects both — this makes them persist.
-- Run this in Supabase SQL editor.

ALTER TABLE public.student_profiles
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS city text;
