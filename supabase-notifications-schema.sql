-- Notifications & Team-Project Collaboration Schema
-- Run this in Supabase SQL Editor
-- 1. Add team_id to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_projects_team ON projects(team_id);
-- 2. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'team_request', 'team_accepted', 'team_rejected',
    'project_assigned', 'milestone_submitted', 'milestone_approved', 'milestone_rejected',
    'milestone_comment', 'info'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  related_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  related_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
-- RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);
-- 3. Fix team RLS for collaboration
DROP POLICY IF EXISTS "Users can view their own requests" ON team_requests;
CREATE POLICY "Users can view their own requests"
  ON team_requests FOR SELECT
  USING (auth.uid() = from_user_id);
DROP POLICY IF EXISTS "Team owners can add members" ON team_members;
CREATE POLICY "Team owners can add members"
  ON team_members FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT created_by FROM teams WHERE id = team_members.team_id)
    OR auth.uid() = user_id
  );
DROP POLICY IF EXISTS "Team owners can remove members" ON team_members;
CREATE POLICY "Team owners can remove members"
  ON team_members FOR DELETE
  USING (
    auth.uid() IN (SELECT created_by FROM teams WHERE id = team_members.team_id)
    OR auth.uid() = user_id
  );
-- 4. Allow team members to view team projects
DROP POLICY IF EXISTS "Team members can view team projects" ON projects;
CREATE POLICY "Team members can view team projects"
  ON projects FOR SELECT
  USING (
    auth.uid() = created_by
    OR auth.uid() IN (
      SELECT user_id FROM team_members WHERE team_id = projects.team_id
    )
  );
-- 5. Allow team owners to update team projects
DROP POLICY IF EXISTS "Team owners can update team projects" ON projects;
CREATE POLICY "Team owners can update team projects"
  ON projects FOR UPDATE
  USING (
    auth.uid() = created_by
    OR auth.uid() IN (
      SELECT created_by FROM teams WHERE id = projects.team_id
    )
  );