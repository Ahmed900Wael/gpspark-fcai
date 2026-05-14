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

-- 2. RLS for project_access
ALTER TABLE project_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own project access" ON project_access;
CREATE POLICY "Users can view their own project access"
  ON project_access FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Project creators can manage project access" ON project_access;
CREATE POLICY "Project creators can manage project access"
  ON project_access FOR ALL
  USING (
    auth.uid() IN (SELECT created_by FROM projects WHERE id = project_access.project_id)
  );

-- 3. Update projects RLS to include project_access
DROP POLICY IF EXISTS "Team members can view team projects" ON projects;
CREATE POLICY "Team members can view team projects"
  ON projects FOR SELECT
  USING (
    auth.uid() = created_by
    OR auth.uid() IN (
      SELECT user_id FROM project_access WHERE project_id = projects.id
    )
  );

DROP POLICY IF EXISTS "Team owners can update team projects" ON projects;
CREATE POLICY "Team owners can update team projects"
  ON projects FOR UPDATE
  USING (auth.uid() = created_by);
