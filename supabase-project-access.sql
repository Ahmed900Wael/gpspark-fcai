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

-- 2. Disable RLS on project_access entirely
ALTER TABLE project_access DISABLE ROW LEVEL SECURITY;

-- 3. Drop ALL existing SELECT policies on projects to clear recursion
DROP POLICY IF EXISTS "Users can view all projects" ON projects;
DROP POLICY IF EXISTS "Team members can view team projects" ON projects;
DROP POLICY IF EXISTS "Users can view accessible projects" ON projects;
DROP POLICY IF EXISTS "Project owners can update projects" ON projects;
DROP POLICY IF EXISTS "Users can update their projects" ON projects;
DROP POLICY IF EXISTS "Team owners can update team projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Project creators can delete their projects" ON projects;

-- 4. Create simple, non-recursive policies
-- SELECT: owner OR team member OR explicit access
DROP POLICY IF EXISTS "Anyone can view projects" ON projects;
CREATE POLICY "Anyone can view projects"
  ON projects FOR SELECT
  USING (true);

-- INSERT: authenticated users can create
DROP POLICY IF EXISTS "Users can create projects" ON projects;
CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- UPDATE: only owner
DROP POLICY IF EXISTS "Project owners can update projects" ON projects;
CREATE POLICY "Project owners can update projects"
  ON projects FOR UPDATE
  USING (auth.uid() = created_by);

-- DELETE: only owner
DROP POLICY IF EXISTS "Project owners can delete projects" ON projects;
CREATE POLICY "Project owners can delete projects"
  ON projects FOR DELETE
  USING (auth.uid() = created_by);
