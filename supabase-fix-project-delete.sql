-- Fix: Add DELETE policy for projects and fix cascade delete RLS
-- Run this in Supabase SQL Editor

-- 1. Allow project creators to delete their own projects
DROP POLICY IF EXISTS "Project creators can delete their projects" ON projects;
CREATE POLICY "Project creators can delete their projects"
  ON projects FOR DELETE
  USING (auth.uid() = created_by);

-- 2. Allow project creators to delete phases (needed for cascade)
DROP POLICY IF EXISTS "Project creators can delete phases" ON project_phases;
CREATE POLICY "Project creators can delete phases"
  ON project_phases FOR DELETE
  USING (
    auth.uid() IN (SELECT created_by FROM projects WHERE id = project_phases.project_id)
  );

-- 3. Allow project creators to delete tasks (needed for cascade)
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

-- 4. Allow users to delete their own submissions (needed for cascade)
DROP POLICY IF EXISTS "Users can delete their submissions" ON milestone_submissions;
CREATE POLICY "Users can delete their submissions"
  ON milestone_submissions FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Allow project creators to delete any submission in their project (for cascade)
DROP POLICY IF EXISTS "Project creators can delete submissions" ON milestone_submissions;
CREATE POLICY "Project creators can delete submissions"
  ON milestone_submissions FOR DELETE
  USING (
    auth.uid() IN (
      SELECT created_by FROM projects p
      JOIN project_phases ph ON p.id = ph.project_id
      JOIN milestone_tasks t ON ph.id = t.phase_id
      WHERE t.id = milestone_submissions.task_id
    )
  );
