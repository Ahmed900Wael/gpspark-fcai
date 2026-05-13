-- Add department, linkedin_url, and github_url columns to profiles table
-- Run this SQL in your Supabase SQL Editor if you already have the profiles table

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department TEXT DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_url TEXT;
