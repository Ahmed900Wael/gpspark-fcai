# GPspark - Product Requirements Document

## 1. Product Overview

**GPspark** is a comprehensive graduation project management platform designed for FCAI-CU (Faculty of Computers and Artificial Intelligence - Cairo University) students. It provides tools for project ideation, team formation, milestone tracking, and AI-powered brainstorming.

### 1.1 Vision
To empower students to collaborate effectively, track their graduation project progress, and leverage AI assistance for better project outcomes.

### 1.2 Target Users
- FCAI-CU graduation students
- Project team members
- Project supervisors/mentors (future)

---

## 2. Core Features

### 2.1 Authentication & User Management

| Feature | Description |
|---------|-------------|
| Email Signup | Standard email registration with confirmation |
| Email Confirmation | Supabase email verification with custom redirect URL |
| Resend Confirmation | Users can request new confirmation email if expired |
| Session Persistence | LocalStorage caching for faster page loads |
| Profile Management | Full user profile with academic info, interests, career goals |

**Technical Implementation:**
- Supabase Auth with email confirmation
- Custom `/auth/callback` route for email verification redirects
- `resendConfirmationEmail()` function in auth context

### 2.2 Dashboard

**Features:**
- Real-time project progress tracking
- Team status overview
- Upcoming milestones display
- Quick action buttons
- Responsive design for mobile/tablet

**Data Sources:**
- Projects owned by user
- Projects with explicit access via `project_access` table
- Team memberships

### 2.3 Projects Management

| Feature | Description |
|---------|-------------|
| Create Project | Title, description, domain, auto-generated phases |
| Cascade Delete | Automatically deletes phases, tasks, submissions |
| Team Linking | Link project to team for collaboration |
| Access Control | Explicit `project_access` table for granular permissions |
| View-Only Access | Team members can view milestones but not edit |

**Default Phases (auto-created):**
1. Proposal
2. Literature Review
3. Development
4. Market Analysis
5. Final Prep

### 2.4 Milestones & Task Tracking

**Features:**
- Phase-based project structure
- Task management within phases
- Task status tracking (pending, in_progress, completed)
- Due date management
- File attachments
- Milestone submissions
- Phase advancement

**Access Control:**
- Project owners: Full access (add/edit/delete tasks, advance phases)
- Team members with access: View-only (read tasks, phases, progress)

### 2.5 Team Formation

| Tab | Functionality |
|-----|---------------|
| Discover | Browse students, filter by interests/department, connect |
| My Teams | View owned/joined teams, manage members |
| Requests | Accept/reject join requests |

**Team Features:**
- Create team with name, description, domain, max members
- Apply to join teams
- Owner can accept/reject requests
- Owner can revoke members
- Members can leave teams
- Student status badges (RECRUITING, IN-TEAM, NOT-IN-TEAM)

**Connect Modal:**
- Academic info (Department, GPA, Academic Year)
- Contact info (Email, LinkedIn, GitHub)
- Interests and career goals

### 2.6 GP Library

**Features:**
- Browse past graduation projects
- Search and filter by domain
- View project details
- Uniqueness score display
- Tech stack information

**Seed Data:** 30 diverse projects across multiple domains

### 2.7 AI Brainstorm

**Powered by:** OpenCode AI API (`deepseek-v4-flash`)

| Endpoint | Purpose |
|----------|---------|
| `/api/brainstorm` | Main chat with AI tutor |
| `/api/brainstorm/analysis` | Market gaps + technical challenges |
| `/api/brainstorm/feasibility` | Scored feasibility evaluation (0-100) |

**AI Capabilities:**
- Project ideation and refinement
- Feasibility analysis across 5 dimensions
- Market gap identification
- Technical challenge assessment
- Tech stack recommendations
- Milestone planning

**Feasibility Dimensions:**
1. Technical Depth (0-20)
2. Market Analysis (0-20)
3. Implementation Plan (0-20)
4. Innovation (0-20)
5. Resource Feasibility (0-20)

### 2.8 Notifications

**Types:**
- `team_request` - New join request
- `team_accepted` - Accepted to team
- `team_rejected` - Request declined/removed
- `project_assigned` - Project linked to team
- `milestone_submitted` - Milestone submission
- `milestone_approved` - Submission approved
- `milestone_rejected` - Submission rejected
- `info` - General information

**Delivery:**
- Real-time via Supabase subscriptions
- Polling fallback (10-second interval)
- Bell dropdown in navbar
- Manual refresh button

---

## 3. Technical Architecture

### 3.1 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.2.6 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui, Radix UI |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| AI | OpenCode AI API |
| Deployment | Vercel |

### 3.2 Project Structure

```
gpspark/
├── app/
│   ├── api/
│   │   ├── ai/
│   │   │   ├── chat/          # Qwen service chat endpoint
│   │   │   └── tools/         # Structured tool execution
│   │   └── brainstorm/
│   │       ├── route.ts       # Main AI chat
│   │       ├── analysis/      # Market/tech analysis
│   │       └── feasibility/   # Feasibility scoring
│   ├── auth/
│   │   └── callback/          # Email confirmation handler
│   ├── brainstorm/            # AI brainstorming page
│   ├── dashboard/             # User dashboard
│   ├── library/               # GP Library
│   ├── milestones/            # Milestone tracking
│   ├── projects/              # Project management
│   ├── profile/               # User profiles
│   ├── signin/                # Sign in page
│   ├── signup/                # Sign up page
│   └── team/                  # Team formation
├── components/
│   ├── navbar.tsx             # Navigation with notifications
│   ├── sidebar.tsx            # Side navigation
│   ├── footer.tsx             # Footer
│   ├── protected-route.tsx    # Auth guard
│   └── command-palette.tsx    # Ctrl+K search
├── contexts/
│   ├── auth-context.tsx       # Auth state management
│   └── notification-context.tsx # Notifications
├── lib/
│   ├── supabase.ts            # Supabase client
│   ├── qwen-service.ts        # AI service class
│   ├── gpspark-ai.ts          # High-level AI wrapper
│   └── upload.ts              # File upload utilities
├── supabase-*.sql             # Database schemas
└── vercel.json                # Deployment config
```

### 3.3 Database Schema

#### Core Tables

**profiles**
```sql
- id (UUID, PK, references auth.users)
- full_name (TEXT)
- university_email (TEXT)
- gpa (TEXT)
- academic_year (TEXT)
- department (TEXT)
- interests (TEXT[])
- career_goals (TEXT)
- avatar_url (TEXT)
- linkedin_url (TEXT)
- github_url (TEXT)
- created_at, updated_at (TIMESTAMPTZ)
```

**teams**
```sql
- id (UUID, PK)
- name (TEXT)
- description (TEXT)
- project_domain (TEXT)
- created_by (UUID, FK)
- max_members (INT)
- status (TEXT: recruiting, full, completed)
- created_at, updated_at
```

**team_members**
```sql
- id (UUID, PK)
- team_id (UUID, FK)
- user_id (UUID, FK)
- role (TEXT: owner, member)
- joined_at (TIMESTAMPTZ)
```

**team_requests**
```sql
- id (UUID, PK)
- team_id (UUID, FK)
- from_user_id (UUID, FK)
- status (TEXT: pending, accepted, rejected)
- message (TEXT)
- created_at, updated_at
```

**projects**
```sql
- id (UUID, PK)
- title (TEXT)
- description (TEXT)
- domain (TEXT)
- created_by (UUID, FK)
- team_id (UUID, FK, nullable)
- status (TEXT: active, completed, archived)
- created_at, updated_at
```

**project_phases**
```sql
- id (UUID, PK)
- project_id (UUID, FK)
- phase_number (INT)
- name (TEXT)
- description (TEXT)
- start_date, end_date (DATE)
- status (TEXT: pending, current, completed)
- created_at
```

**milestone_tasks**
```sql
- id (UUID, PK)
- phase_id (UUID, FK)
- title (TEXT)
- description (TEXT)
- status (TEXT: pending, in_progress, completed)
- due_date (DATE)
- assets_count (INT)
- file_url (TEXT)
- created_at, updated_at
```

**milestone_submissions**
```sql
- id (UUID, PK)
- task_id (UUID, FK)
- user_id (UUID, FK)
- submission_text (TEXT)
- file_url (TEXT)
- status (TEXT: submitted, under_review, approved, rejected)
- submitted_at, updated_at
```

**project_access**
```sql
- id (UUID, PK)
- project_id (UUID, FK)
- user_id (UUID, FK)
- granted_by (UUID, FK)
- created_at (TIMESTAMPTZ)
- UNIQUE(project_id, user_id)
```

**notifications**
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- type (TEXT)
- title (TEXT)
- message (TEXT)
- read (BOOLEAN)
- related_team_id (UUID, FK)
- related_project_id (UUID, FK)
- created_at
```

**library_projects**
```sql
- id (UUID, PK)
- title (TEXT)
- description (TEXT)
- domain (TEXT)
- tech_stack (TEXT[])
- uniqueness_score (DECIMAL)
- release_date (DATE)
- honors (TEXT)
- image_url (TEXT)
- case_study_url (TEXT)
- created_at, updated_at
```

**brainstorm_sessions**
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- project_focus (TEXT)
- created_at
```

**chat_messages**
```sql
- id (UUID, PK)
- session_id (UUID, FK)
- role (TEXT: user, assistant)
- content (TEXT)
- created_at
```

### 3.4 RLS Policies

**Key Policies:**

| Table | Policy | Access |
|-------|--------|--------|
| projects | SELECT | Public (USING true) |
| projects | UPDATE | Owner only |
| projects | DELETE | Owner only |
| project_access | ALL | RLS disabled (app-controlled) |
| team_members | DELETE | Owner OR self |
| notifications | SELECT/UPDATE/DELETE | Own notifications |

---

## 4. API Endpoints

### 4.1 Brainstorm AI

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/brainstorm` | POST | Main AI chat (non-streaming) |
| `/api/brainstorm/analysis` | POST | Market gaps + technical challenges |
| `/api/brainstorm/feasibility` | POST | Feasibility scoring |

### 4.2 AI Service

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ai/chat` | POST/GET | Qwen service with tools |
| `/api/ai/tools` | POST/GET | Structured tool execution |

### 4.3 Auth

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/callback` | GET | Email confirmation redirect |

---

## 5. AI Integration

### 5.1 OpenCode AI Configuration

```typescript
API_URL: https://opencode.ai/zen/go/v1/chat/completions
MODEL: deepseek-v4-flash
Authentication: Bearer token
```

### 5.2 AI Service Classes

**QwenService** (`lib/qwen-service.ts`)
- Core service class for AI interactions
- Supports streaming and non-streaming
- Tool call handling
- Conversation persistence

**GPsparkAI** (`lib/gpspark-ai.ts`)
- High-level wrapper
- Session management
- Built-in tools execution

### 5.3 Available Tools

| Tool | Description |
|------|-------------|
| `search_library` | Search GP Library for similar projects |
| `analyze_feasibility` | Analyze project feasibility |
| `suggest_tech_stack` | Recommend technology stack |
| `generate_milestones` | Create milestone plan |
| `brainstorm_ideas` | Generate project ideas |
| `evaluate_project` | Multi-dimension evaluation |

---

## 6. Deployment

### 6.1 Vercel Configuration

**vercel.json:**
```json
{
  "buildCommand": "next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

### 6.2 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `OPENCODE_API_KEY` | OpenCode AI API key | Yes |
| `NEXT_PUBLIC_APP_URL` | Production URL | Yes |

### 6.3 Supabase Configuration

**Required Settings:**
- Site URL: `https://gpspark-fcai.vercel.app`
- Redirect URLs: `https://gpspark-fcai.vercel.app/auth/callback`

---

## 7. Key Technical Decisions

### 7.1 Project Access Control

**Problem:** Team members couldn't view milestones for team-linked projects.

**Solution:** 
- Created `project_access` junction table
- Explicit access grants instead of implicit team membership
- RLS disabled on `project_access` to prevent recursion
- App-level access control

### 7.2 Email Confirmation

**Problem:** Confirmation email redirect not working.

**Solution:**
- Created `/auth/callback` route
- Added `emailRedirectTo` option in signup
- Handles forwarded hosts for Vercel deployment

### 7.3 AI Response Quality

**Problem:** Streaming responses produced garbled text.

**Solution:**
- Switched from streaming to non-streaming JSON responses
- More reliable, complete responses
- Simpler frontend parsing

### 7.4 Page Reload Data Loss

**Problem:** Data disappeared on page reload.

**Solution:**
- Set `isLoading=false` immediately after localStorage restore
- Don't clear cached user if `getSession()` returns null
- Pages depend on `[user]` instead of `[]` for re-fetching

### 7.5 Project Delete Not Working

**Problem:** Delete button didn't actually delete from database.

**Solution:**
- Added missing DELETE RLS policies
- Database cascade handles child records
- Simplified frontend delete logic

---

## 8. Current Status

### 8.1 Completed Features
- [x] Authentication with email confirmation
- [x] Dashboard with real data
- [x] Project management with team linking
- [x] Milestone tracking with phases/tasks
- [x] Team formation with requests
- [x] GP Library with seed data
- [x] AI brainstorm with OpenCode AI
- [x] Notifications system
- [x] Project access control
- [x] Responsive design
- [x] Vercel deployment ready

### 8.2 Known Limitations
- Mentors page disabled (backend not ready)
- File upload limited to 50MB
- No real-time collaboration on tasks
- No mentor feedback system yet

### 8.3 Future Enhancements
- Mentor portal and feedback system
- Real-time task collaboration
- File versioning
- Progress analytics
- Export reports (PDF)
- Mobile app

---

## 9. Development Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
# Run SQL files in Supabase SQL Editor in order:
# 1. supabase-schema.sql
# 2. supabase-additional-schema.sql
# 3. supabase-brainstorm-schema.sql
# 4. supabase-notifications-schema.sql
# 5. supabase-project-access.sql
# 6. supabase-library-seed.sql
```

---

## 10. Repository

**GitHub:** https://github.com/Ahmed900Wael/gpspark-fcai

**Production:** https://gpspark-fcai.vercel.app

---

*Document Version: 1.0*  
*Last Updated: 2026-05-14*
