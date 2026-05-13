-- Supabase Storage Buckets for GPSpark
-- Run this SQL in your Supabase SQL Editor
-- NOTE: Storage policies must be added via Dashboard (see instructions below)

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('milestones', 'milestones', false, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'application/zip'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE POLICIES: Add these via Supabase Dashboard
-- ============================================================
-- 1. Go to Supabase Dashboard → Storage → Select bucket → Policies
-- 2. Click "New policy" → "For full customization" → Apply settings below:
--
-- AVATARS BUCKET (public):
--   SELECT:  "allow public read"  → USING (bucket_id = 'avatars')
--   INSERT:  "allow authenticated" → WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text)
--   UPDATE:  "allow owner"        → USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text)
--   DELETE:  "allow owner"        → USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text)
--
-- MILESTONES BUCKET (private):
--   SELECT:  "allow authenticated" → USING (bucket_id = 'milestones' AND auth.uid() IS NOT NULL)
--   INSERT:  "allow owner"        → WITH CHECK (bucket_id = 'milestones' AND auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text)
--   UPDATE:  "allow owner"        → USING (bucket_id = 'milestones' AND auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text)
--   DELETE:  "allow owner"        → USING (bucket_id = 'milestones' AND auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text)
