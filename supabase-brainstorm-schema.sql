-- Brainstorm Sessions & Chat Messages Tables
-- Run this SQL in your Supabase SQL Editor

-- Brainstorm Sessions Table
CREATE TABLE IF NOT EXISTS brainstorm_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  project_focus TEXT DEFAULT 'General Brainstorming',
  feasibility_score DECIMAL(5,2),
  market_gaps JSONB,
  technical_challenges JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES brainstorm_sessions(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE brainstorm_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for brainstorm_sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON brainstorm_sessions;
CREATE POLICY "Users can view own sessions"
  ON brainstorm_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sessions" ON brainstorm_sessions;
CREATE POLICY "Users can insert own sessions"
  ON brainstorm_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sessions" ON brainstorm_sessions;
CREATE POLICY "Users can update own sessions"
  ON brainstorm_sessions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own sessions" ON brainstorm_sessions;
CREATE POLICY "Users can delete own sessions"
  ON brainstorm_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for chat_messages
DROP POLICY IF EXISTS "Users can view messages from own sessions" ON chat_messages;
CREATE POLICY "Users can view messages from own sessions"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brainstorm_sessions
      WHERE brainstorm_sessions.id = chat_messages.session_id
      AND brainstorm_sessions.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert messages to own sessions" ON chat_messages;
CREATE POLICY "Users can insert messages to own sessions"
  ON chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM brainstorm_sessions
      WHERE brainstorm_sessions.id = chat_messages.session_id
      AND brainstorm_sessions.user_id = auth.uid()
    )
  );

-- Trigger for updated_at on brainstorm_sessions
CREATE OR REPLACE TRIGGER set_brainstorm_updated_at
  BEFORE UPDATE ON brainstorm_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_brainstorm_sessions_user_id ON brainstorm_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);
