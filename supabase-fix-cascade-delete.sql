-- Fix cascade delete permissions for projects
-- Run this in Supabase SQL Editor

-- Allow users to delete their own milestone submissions
DROP POLICY IF EXISTS "Users can delete their submissions" ON milestone_submissions;
CREATE POLICY "Users can delete their submissions"
  ON milestone_submissions FOR DELETE
  USING (auth.uid() = user_id);

-- Allow project creators to delete phases
DROP POLICY IF EXISTS "Project creators can delete phases" ON project_phases;
CREATE POLICY "Project creators can delete phases"
  ON project_phases FOR DELETE
  USING (auth.uid() IN (SELECT created_by FROM projects WHERE id = project_phases.project_id));

-- Allow project creators to delete tasks
DROP POLICY IF EXISTS "Project creators can delete tasks" ON milestone_tasks;
CREATE POLICY "Project creators can delete tasks"
  ON milestone_tasks FOR DELETE
  USING (
    auth.uid() IN (
      SELECT created_by FROM projects p
      JOIN project_phases ph ON p.id = ph.project_id
      WHERE ph.id = milestone_tasks.phase_id
    )
  );

-- Allow project creators to delete their projects
DROP POLICY IF EXISTS "Users can delete their projects" ON projects;
CREATE POLICY "Users can delete their projects"
  ON projects FOR DELETE
  USING (auth.uid() = created_by);
