-- Migration: Add bio, about, and education_history to student_profiles
-- Run this in Supabase SQL editor if you already have existing student_profiles

ALTER TABLE public.student_profiles
ADD COLUMN IF NOT EXISTS about text,
ADD COLUMN IF NOT EXISTS education_history jsonb NOT NULL DEFAULT '[]';
