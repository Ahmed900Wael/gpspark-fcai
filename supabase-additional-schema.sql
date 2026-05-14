-- GPspark Additional Tables: Library, Teams, Milestones

-- ==========================================
-- 1. GP LIBRARY TABLE
-- ==========================================
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

-- Favorites junction table
CREATE TABLE IF NOT EXISTS project_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES library_projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- RLS for library_projects (public read)
ALTER TABLE library_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view library projects" ON library_projects;
CREATE POLICY "Anyone can view library projects"
  ON library_projects FOR SELECT
  USING (true);

-- RLS for project_favorites
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_library_projects_domain ON library_projects(domain);
CREATE INDEX IF NOT EXISTS idx_library_projects_uniqueness ON library_projects(uniqueness_score DESC);
CREATE INDEX IF NOT EXISTS idx_project_favorites_user ON project_favorites(user_id);

-- ==========================================
-- 2. TEAM FORMATION TABLE
-- ==========================================
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

DROP POLICY IF EXISTS "Users can join teams" ON team_members;
CREATE POLICY "Users can join teams"
  ON team_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave teams" ON team_members;
CREATE POLICY "Users can leave teams"
  ON team_members FOR DELETE
  USING (auth.uid() = user_id);

-- RLS for team_requests
ALTER TABLE team_requests ENABLE ROW LEVEL SECURITY;

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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_teams_status ON teams(status);
CREATE INDEX IF NOT EXISTS idx_teams_domain ON teams(project_domain);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_requests_team ON team_requests(team_id);

-- ==========================================
-- 3. MILESTONES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  domain TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

DROP POLICY IF EXISTS "Users can view all projects" ON projects;
CREATE POLICY "Users can view all projects"
  ON projects FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can create projects" ON projects;
CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their projects" ON projects;
CREATE POLICY "Users can update their projects"
  ON projects FOR UPDATE
  USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Project creators can delete their projects" ON projects;
CREATE POLICY "Project creators can delete their projects"
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

DROP POLICY IF EXISTS "Project creators can delete phases" ON project_phases;
CREATE POLICY "Project creators can delete phases"
  ON project_phases FOR DELETE
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
CREATE INDEX IF NOT EXISTS idx_project_phases_project ON project_phases(project_id);
CREATE INDEX IF NOT EXISTS idx_milestone_tasks_phase ON milestone_tasks(phase_id);
CREATE INDEX IF NOT EXISTS idx_milestone_submissions_task ON milestone_submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_milestone_submissions_user ON milestone_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_feedback_submission ON mentor_feedback(submission_id);

-- ==========================================
-- SEED DATA: Library Projects
-- ==========================================
INSERT INTO library_projects (title, description, domain, tech_stack, uniqueness_score, release_date, honors) VALUES
('SecureLink: Quantum-Resistant P2P Mesh Network', 'A decentralized communication platform leveraging post-quantum cryptography to ensure long-term privacy in peer-to-peer networks.', 'AI & Cybersecurity', ARRAY['Rust', 'Libp2p', 'WebAssembly'], 9.4, '2024-06-01', 'Academic Honors'),
('MicroWealth: Fractional Real Estate for Gen Z', 'Blockchain-backed ownership model for commercial properties with automated dividend distribution.', 'Fintech', ARRAY['Solidity', 'React Native'], 8.8, '2024-04-15', NULL),
('YieldSense: LoRaWAN Soil Monitoring', 'Low-power wide-area network sensors for remote farm monitoring with predictive irrigation alerts.', 'Agritech', ARRAY['Python', 'LoRa', 'AWS IoT'], 7.2, '2024-03-20', NULL),
('MindFlow: EEG-Based Focus Tracker', 'Using wearable EEG sensors to provide real-time audio feedback for enhanced study sessions.', 'Edtech', ARRAY['TensorFlow', 'Swift'], 8.1, '2024-05-10', 'Best Innovation Award');
