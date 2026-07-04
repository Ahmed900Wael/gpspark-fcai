-- ============================================
-- GPspark Database Schema
-- Run this single file in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  university_email TEXT NOT NULL DEFAULT '',
  gpa TEXT DEFAULT '',
  academic_year TEXT DEFAULT '',
  department TEXT DEFAULT '',
  interests TEXT[] DEFAULT '{}',
  career_goals TEXT DEFAULT '',
  avatar_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger: Create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, university_email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 2. TEAMS TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  project_domain TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_members INT DEFAULT 4,
  status TEXT DEFAULT 'recruiting' CHECK (status IN ('recruiting', 'full', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

CREATE TABLE IF NOT EXISTS team_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view teams" ON teams;
CREATE POLICY "Anyone can view teams"
  ON teams FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create teams" ON teams;
CREATE POLICY "Users can create teams"
  ON teams FOR INSERT
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Team creators can update their teams" ON teams;
CREATE POLICY "Team creators can update their teams"
  ON teams FOR UPDATE
  USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Team creators can delete their teams" ON teams;
CREATE POLICY "Team creators can delete their teams"
  ON teams FOR DELETE
  USING (auth.uid() = created_by);

-- RLS for team_members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view team members" ON team_members;
CREATE POLICY "Anyone can view team members"
  ON team_members FOR SELECT
  USING (true);

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

-- RLS for team_requests
ALTER TABLE team_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own requests" ON team_requests;
CREATE POLICY "Users can view their own requests"
  ON team_requests FOR SELECT
  USING (auth.uid() = from_user_id);

DROP POLICY IF EXISTS "Team creators can view requests" ON team_requests;
CREATE POLICY "Team creators can view requests"
  ON team_requests FOR SELECT
  USING (auth.uid() IN (SELECT created_by FROM teams WHERE id = team_requests.team_id));

DROP POLICY IF EXISTS "Users can send requests" ON team_requests;
CREATE POLICY "Users can send requests"
  ON team_requests FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

DROP POLICY IF EXISTS "Team creators can update requests" ON team_requests;
CREATE POLICY "Team creators can update requests"
  ON team_requests FOR UPDATE
  USING (auth.uid() IN (SELECT created_by FROM teams WHERE id = team_requests.team_id));

DROP POLICY IF EXISTS "Users can delete their own requests" ON team_requests;
CREATE POLICY "Users can delete their own requests"
  ON team_requests FOR DELETE
  USING (auth.uid() = from_user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_teams_status ON teams(status);
CREATE INDEX IF NOT EXISTS idx_teams_domain ON teams(project_domain);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_requests_team ON team_requests(team_id);

-- ============================================
-- 3. PROJECTS TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  domain TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_phases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_number INT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'current', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS milestone_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phase_id UUID NOT NULL REFERENCES project_phases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  due_date DATE,
  assets_count INT DEFAULT 0,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS milestone_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES milestone_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_text TEXT,
  file_url TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mentor_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES milestone_submissions(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feedback_text TEXT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view projects" ON projects;
CREATE POLICY "Anyone can view projects"
  ON projects FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create projects" ON projects;
CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Project owners can update projects" ON projects;
CREATE POLICY "Project owners can update projects"
  ON projects FOR UPDATE
  USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Project owners can delete projects" ON projects;
CREATE POLICY "Project owners can delete projects"
  ON projects FOR DELETE
  USING (auth.uid() = created_by);

-- RLS for project_phases
ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view phases" ON project_phases;
CREATE POLICY "Anyone can view phases"
  ON project_phases FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Project creators can manage phases" ON project_phases;
CREATE POLICY "Project creators can manage phases"
  ON project_phases FOR ALL
  USING (auth.uid() IN (SELECT created_by FROM projects WHERE id = project_phases.project_id));

-- RLS for milestone_tasks
ALTER TABLE milestone_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view tasks" ON milestone_tasks;
CREATE POLICY "Anyone can view tasks"
  ON milestone_tasks FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Project creators can manage tasks" ON milestone_tasks;
CREATE POLICY "Project creators can manage tasks"
  ON milestone_tasks FOR ALL
  USING (
    auth.uid() IN (
      SELECT created_by FROM projects p
      JOIN project_phases ph ON p.id = ph.project_id
      WHERE ph.id = milestone_tasks.phase_id
    )
  );

-- RLS for milestone_submissions
ALTER TABLE milestone_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own submissions" ON milestone_submissions;
CREATE POLICY "Users can view their own submissions"
  ON milestone_submissions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create submissions" ON milestone_submissions;
CREATE POLICY "Users can create submissions"
  ON milestone_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their submissions" ON milestone_submissions;
CREATE POLICY "Users can update their submissions"
  ON milestone_submissions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their submissions" ON milestone_submissions;
CREATE POLICY "Users can delete their submissions"
  ON milestone_submissions FOR DELETE
  USING (auth.uid() = user_id);

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

-- RLS for mentor_feedback
ALTER TABLE mentor_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view feedback on their submissions" ON mentor_feedback;
CREATE POLICY "Users can view feedback on their submissions"
  ON mentor_feedback FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM milestone_submissions WHERE id = mentor_feedback.submission_id)
    OR auth.uid() = mentor_id
  );

DROP POLICY IF EXISTS "Mentors can create feedback" ON mentor_feedback;
CREATE POLICY "Mentors can create feedback"
  ON mentor_feedback FOR INSERT
  WITH CHECK (auth.uid() = mentor_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_team ON projects(team_id);
CREATE INDEX IF NOT EXISTS idx_project_phases_project ON project_phases(project_id);
CREATE INDEX IF NOT EXISTS idx_milestone_tasks_phase ON milestone_tasks(phase_id);
CREATE INDEX IF NOT EXISTS idx_milestone_submissions_task ON milestone_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_milestone_submissions_user ON milestone_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_feedback_submission ON mentor_feedback(submission_id);

-- ============================================
-- 4. PROJECT ACCESS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS project_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- RLS disabled (app-controlled)
ALTER TABLE project_access DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_project_access_project ON project_access(project_id);
CREATE INDEX IF NOT EXISTS idx_project_access_user ON project_access(user_id);

-- ============================================
-- 5. NOTIFICATIONS TABLE
-- ============================================

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

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);

-- ============================================
-- 6. GP LIBRARY TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS library_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  domain TEXT NOT NULL,
  tech_stack TEXT[] DEFAULT '{}',
  uniqueness_score DECIMAL(3,1) NOT NULL,
  release_date DATE,
  honors TEXT,
  image_url TEXT,
  case_study_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES library_projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

ALTER TABLE library_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view library projects" ON library_projects;
CREATE POLICY "Anyone can view library projects"
  ON library_projects FOR SELECT
  USING (true);

ALTER TABLE project_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own favorites" ON project_favorites;
CREATE POLICY "Users can view their own favorites"
  ON project_favorites FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add favorites" ON project_favorites;
CREATE POLICY "Users can add favorites"
  ON project_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove their favorites" ON project_favorites;
CREATE POLICY "Users can remove their favorites"
  ON project_favorites FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_library_projects_domain ON library_projects(domain);
CREATE INDEX IF NOT EXISTS idx_library_projects_uniqueness ON library_projects(uniqueness_score DESC);
CREATE INDEX IF NOT EXISTS idx_project_favorites_user ON project_favorites(user_id);

-- ============================================
-- 7. BRAINSTORM TABLES
-- ============================================

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

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES brainstorm_sessions(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE brainstorm_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

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

CREATE TRIGGER set_brainstorm_updated_at
  BEFORE UPDATE ON brainstorm_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_brainstorm_sessions_user_id ON brainstorm_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);

-- ============================================
-- 8. STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('milestones', 'milestones', false, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'application/zip'])
ON CONFLICT (id) DO NOTHING;

-- NOTE: Storage policies must be added via Supabase Dashboard
-- AVATARS BUCKET (public):
--   SELECT: USING (bucket_id = 'avatars')
--   INSERT: WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text)
--   UPDATE: USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text)
--   DELETE: USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text)
--
-- MILESTONES BUCKET (private):
--   SELECT: USING (bucket_id = 'milestones' AND auth.uid() IS NOT NULL)
--   INSERT: WITH CHECK (bucket_id = 'milestones' AND auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text)
--   UPDATE: USING (bucket_id = 'milestones' AND auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text)
--   DELETE: USING (bucket_id = 'milestones' AND auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text)

-- ============================================
-- 9. SEED DATA: Library Projects
-- ============================================

INSERT INTO library_projects (title, description, domain, tech_stack, uniqueness_score, release_date, honors) VALUES
('NeuroSync: BCI-Powered Smart Home Controller', 'Brain-computer interface using EEG headsets to control IoT devices through thought patterns and neural signals.', 'AI & Neurotech', ARRAY['Python', 'TensorFlow', 'C++', 'MQTT'], 9.6, '2024-05-15', 'Best Innovation Award'),
('AquaGuard: Autonomous Water Quality Drone', 'Solar-powered surface drone that monitors water quality parameters in real-time across reservoirs and rivers.', 'Environmental Tech', ARRAY['ROS', 'Python', 'Arduino', 'LoRa'], 8.9, '2024-06-20', NULL),
('CodeVerse: AI-Powered Code Review Platform', 'Automated code review system using LLMs to detect bugs, suggest optimizations, and enforce best practices.', 'DevTools', ARRAY['TypeScript', 'React', 'Node.js', 'OpenAI API'], 8.3, '2024-04-10', NULL),
('MediChain: Decentralized Clinical Trial Platform', 'Blockchain-based platform for transparent, tamper-proof clinical trial data management and patient consent.', 'HealthTech & Blockchain', ARRAY['Solidity', 'React', 'IPFS', 'Ethers.js'], 9.1, '2024-07-01', 'Academic Honors'),
('FarmBot AI: Precision Agriculture Robot', 'Autonomous ground robot using computer vision to detect crop diseases and apply targeted pesticide treatment.', 'Agritech & Robotics', ARRAY['Python', 'OpenCV', 'ROS', 'Jetson Nano'], 8.7, '2024-03-15', NULL),
('SoundScape: 3D Audio Spatializer for VR', 'Real-time 3D audio rendering engine for virtual reality environments with dynamic acoustic simulation.', 'VR & Audio', ARRAY['C++', 'WebAudio', 'Unity', 'HRTF'], 8.5, '2024-08-22', NULL),
('CrowdFlow: Pedestrian Traffic Prediction System', 'ML-powered system predicting crowd density and movement patterns in urban spaces using CCTV feeds.', 'Smart Cities', ARRAY['Python', 'PyTorch', 'OpenCV', 'FastAPI'], 7.8, '2024-02-28', NULL),
('EcoPrint: Sustainable 3D Printing Material', 'Biodegradable filament made from recycled ocean plastics with optimized thermal properties for FDM printing.', 'Sustainability & Manufacturing', ARRAY['Python', 'CAD', 'Material Science'], 8.2, '2024-09-05', 'Green Tech Award'),
('SignLang AR: Real-Time Sign Language Translator', 'Augmented reality app that translates sign language gestures to text/speech in real-time using pose estimation.', 'Accessibility & AR', ARRAY['Swift', 'ARKit', 'CoreML', 'Python'], 9.3, '2024-05-30', 'Best Social Impact'),
('DataVault: Zero-Knowledge Cloud Storage', 'End-to-end encrypted cloud storage with zero-knowledge proofs for secure file sharing and collaboration.', 'Cybersecurity', ARRAY['Rust', 'WebAssembly', 'React', 'AWS'], 8.6, '2024-04-18', NULL),
('PulseAI: Cardiac Arrhythmia Detection', 'Deep learning model analyzing ECG signals for early detection of cardiac arrhythmias with 97% accuracy.', 'HealthTech & AI', ARRAY['Python', 'TensorFlow', 'Flutter', 'Firebase'], 9.0, '2024-06-12', 'Medical Innovation Prize'),
('GridMind: Smart Energy Distribution Optimizer', 'AI-driven system optimizing power grid distribution using reinforcement learning and real-time demand forecasting.', 'Energy & AI', ARRAY['Python', 'PyTorch', 'Grafana', 'InfluxDB'], 8.4, '2024-07-25', NULL),
('ArtForge: AI-Assisted Digital Art Studio', 'Generative AI platform that helps artists create, iterate, and refine digital artwork through natural language prompts.', 'Creative Tech & AI', ARRAY['Python', 'Stable Diffusion', 'React', 'GPU Computing'], 7.9, '2024-03-08', NULL),
('SafeRoute: Pedestrian Safety Navigation App', 'Mobile app routing pedestrians through safest paths using crime data, lighting analysis, and real-time alerts.', 'Mobile & Safety', ARRAY['Flutter', 'Dart', 'Node.js', 'PostGIS'], 8.1, '2024-08-14', NULL),
('AeroSense: Drone-Based Air Quality Mapping', 'Fleet of drones creating real-time 3D air quality maps of urban areas with pollution source identification.', 'Environmental & IoT', ARRAY['Python', 'ROS', 'MQTT', 'React'], 8.8, '2024-05-20', NULL),
('LearnLens: AR Chemistry Lab Simulator', 'Augmented reality chemistry lab allowing students to conduct virtual experiments with realistic reactions.', 'EdTech & AR', ARRAY['Unity', 'ARCore', 'C#', 'Firebase'], 8.0, '2024-09-10', NULL),
('TradeBot: Algorithmic Crypto Trading Platform', 'AI-powered cryptocurrency trading bot using sentiment analysis and technical indicators for automated trading.', 'FinTech & AI', ARRAY['Python', 'TensorFlow', 'WebSocket', 'React'], 7.5, '2024-02-15', NULL),
('HabitatVR: Virtual Wildlife Conservation Training', 'VR simulation training platform for wildlife conservationists with realistic ecosystem and animal behavior modeling.', 'VR & Conservation', ARRAY['Unity', 'C#', 'Blender', 'Oculus SDK'], 8.3, '2024-07-08', NULL),
('VoiceGuard: Deepfake Audio Detection', 'Machine learning system detecting AI-generated voice deepfakes using spectral analysis and neural fingerprinting.', 'Cybersecurity & AI', ARRAY['Python', 'PyTorch', 'Librosa', 'FastAPI'], 9.2, '2024-06-28', 'Security Research Award'),
('ParkSense: Smart Parking Management System', 'IoT-based parking system using ultrasonic sensors and computer vision to guide drivers to available spots.', 'Smart Cities & IoT', ARRAY['Python', 'OpenCV', 'ESP32', 'React Native'], 7.6, '2024-04-05', NULL),
('NutriScan: Food Nutrition Analysis App', 'Mobile app using computer vision to analyze food photos and estimate nutritional content and caloric value.', 'HealthTech & AI', ARRAY['Python', 'TensorFlow Lite', 'Flutter', 'Firebase'], 7.7, '2024-08-30', NULL),
('CodeCollab: Real-Time Pair Programming IDE', 'Browser-based collaborative IDE with real-time code editing, video chat, and AI-assisted code suggestions.', 'DevTools & Collaboration', ARRAY['TypeScript', 'WebRTC', 'Monaco Editor', 'Node.js'], 8.0, '2024-03-22', NULL),
('TerraScan: Satellite-Based Deforestation Monitor', 'Satellite imagery analysis system detecting illegal deforestation activities using change detection algorithms.', 'Environmental & AI', ARRAY['Python', 'Google Earth Engine', 'React', 'PostgreSQL'], 8.9, '2024-05-12', 'Environmental Tech Award'),
('MindMap AI: Intelligent Study Planner', 'AI-powered study planner that creates personalized learning paths based on course material and learning style analysis.', 'EdTech & AI', ARRAY['Python', 'React', 'Neo4j', 'OpenAI API'], 7.4, '2024-09-18', NULL),
('ShipTrack: Maritime Route Optimization System', 'AI system optimizing shipping routes based on weather patterns, fuel consumption, and port congestion data.', 'Logistics & AI', ARRAY['Python', 'PyTorch', 'D3.js', 'PostgreSQL'], 8.5, '2024-07-15', NULL),
('BioPrint: 3D Bioprinting Tissue Simulator', 'Simulation software for 3D bioprinting processes, modeling cell behavior and tissue formation during printing.', 'Biotech & Simulation', ARRAY['Python', 'MATLAB', 'CUDA', 'React'], 9.4, '2024-06-05', 'Biotech Innovation Prize'),
('EventSync: Decentralized Event Ticketing', 'Blockchain-based ticketing platform preventing fraud and scalping with NFT-based ticket ownership.', 'Blockchain & Events', ARRAY['Solidity', 'React', 'IPFS', 'Ethers.js'], 7.8, '2024-04-25', NULL),
('CropCast: Yield Prediction Platform', 'Satellite and weather data analysis platform predicting crop yields with 90% accuracy for farmers and insurers.', 'Agritech & AI', ARRAY['Python', 'TensorFlow', 'Google Earth Engine', 'React'], 8.6, '2024-08-08', NULL),
('RescueNet: Disaster Response Coordination Platform', 'Real-time platform coordinating rescue efforts during natural disasters with offline mesh network support.', 'Emergency Tech', ARRAY['React Native', 'Node.js', 'WebRTC', 'LoRa'], 9.0, '2024-05-28', 'Humanitarian Tech Award'),
('StyleGen: AI Fashion Design Assistant', 'Generative AI tool creating fashion designs based on trend analysis, body measurements, and style preferences.', 'Fashion Tech & AI', ARRAY['Python', 'Stable Diffusion', 'React', 'Three.js'], 7.9, '2024-09-02', NULL);
