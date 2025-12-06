-- Fix missing columns for Onboarding Flow
-- Run this script in your Supabase SQL Editor

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS personality_profile JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
