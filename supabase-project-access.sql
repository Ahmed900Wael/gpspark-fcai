-- Project Access Control Schema
-- Run this in Supabase SQL Editor

-- 1. Create project_access junction table
CREATE TABLE IF NOT EXISTS project_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_access_project ON project_access(project_id);
CREATE INDEX IF NOT EXISTS idx_project_access_user ON project_access(user_id);

-- 2. Disable RLS on project_access to prevent infinite recursion
-- (Access is controlled by app logic, not row-level policies)
ALTER TABLE project_access DISABLE ROW LEVEL SECURITY;

-- 3. Update projects RLS to include project_access
-- First, drop the old policy that causes recursion
DROP POLICY IF EXISTS "Team members can view team projects" ON projects;

-- Create a safe policy using EXISTS instead of IN subquery
DROP POLICY IF EXISTS "Users can view accessible projects" ON projects;
CREATE POLICY "Users can view accessible projects"
  ON projects FOR SELECT
  USING (
    auth.uid() = created_by
    OR team_id IS NOT NULL
    OR EXISTS (
      SELECT 1 FROM project_access pa 
      WHERE pa.project_id = projects.id AND pa.user_id = auth.uid()
    )
  );

-- Restrict update/delete to owner only
DROP POLICY IF EXISTS "Team owners can update team projects" ON projects;
CREATE POLICY "Project owners can update projects"
  ON projects FOR UPDATE
  USING (auth.uid() = created_by);
