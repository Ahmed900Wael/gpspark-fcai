-- Complete team RLS policy fixes
-- Run this in Supabase SQL Editor

-- Allow users to view their own team requests
DROP POLICY IF EXISTS "Users can view their own requests" ON team_requests;
CREATE POLICY "Users can view their own requests"
  ON team_requests FOR SELECT
  USING (auth.uid() = from_user_id);

-- Allow team owners to add members (when accepting requests)
DROP POLICY IF EXISTS "Team owners can add members" ON team_members;
CREATE POLICY "Team owners can add members"
  ON team_members FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT created_by FROM teams WHERE id = team_members.team_id)
    OR auth.uid() = user_id
  );

-- Allow team owners to remove members
DROP POLICY IF EXISTS "Team owners can remove members" ON team_members;
CREATE POLICY "Team owners can remove members"
  ON team_members FOR DELETE
  USING (
    auth.uid() IN (SELECT created_by FROM teams WHERE id = team_members.team_id)
    OR auth.uid() = user_id
  );

-- Allow users to delete their own team requests
DROP POLICY IF EXISTS "Users can delete their own requests" ON team_requests;
CREATE POLICY "Users can delete their own requests"
  ON team_requests FOR DELETE
  USING (auth.uid() = from_user_id);
