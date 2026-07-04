# GPspark - Product Requirements Document

## 1. Product Overview

**GPspark** is a comprehensive graduation project management platform designed for FCAI-CU (Faculty of Computers and Artificial Intelligence - Cairo University) students. It provides tools for project ideation, team formation, milestone tracking, and AI-powered brainstorming.

### 1.1 Vision
To empower students to collaborate effectively, track their graduation project progress, and leverage AI assistance for better project outcomes.

### 1.2 Target Users
- FCAI-CU graduation students
- Project team members
- Project supervisors/mentors (future)

### 1.3 Current Status
✅ **Production Ready** - All core features implemented and tested

---

## 2. Core Features

### 2.1 Authentication & User Management

| Feature | Description | Status |
|---------|-------------|--------|
| Email Signup | Standard email registration with confirmation | ✅ Complete |
| Email Confirmation | Supabase email verification with custom redirect URL | ✅ Complete |
| Resend Confirmation | Users can request new confirmation email if expired | ✅ Complete |
| Session Persistence | LocalStorage caching for faster page loads | ✅ Complete |
| Profile Management | Full user profile with academic info, interests, career goals | ✅ Complete |
| Protected Routes | Auto-redirect to onboarding for unauthenticated users | ✅ Complete |

**Technical Implementation:**
- Supabase Auth with email confirmation
- Custom `/auth/callback` route for email verification redirects
- `resendConfirmationEmail()` function in auth context
- Session synced with localStorage for persistence
- Database trigger auto-creates profiles on signup

### 2.2 Dashboard

**Features:**
- Real-time project progress tracking
- Team status overview
- Upcoming milestones display
- Quick action buttons
- Responsive design for mobile/tablet
- Dynamic data from Supabase

**Data Sources:**
- Projects owned by user
- Projects with explicit access via `project_access` table
- Team memberships

**Status:** ✅ Complete

### 2.3 Projects Management

| Feature | Description | Status |
|---------|-------------|--------|
| Create Project | Title, description, domain, auto-generated phases | ✅ Complete |
| Cascade Delete | Automatically deletes phases, tasks, submissions | ✅ Complete |
| Team Linking | Link project to team for collaboration | ✅ Complete |
| Access Control | Explicit `project_access` table for granular permissions | ✅ Complete |
| View-Only Access | Team members can view milestones but not edit | ✅ Complete |
| Project Status | Active, completed, archived tracking | ✅ Complete |
| Progress Calculation | Automatic from task completion | ✅ Complete |

**Default Phases (auto-created):**
1. Proposal
2. Literature Review
3. Development
4. Market Analysis
5. Final Prep

**Status:** ✅ Complete

### 2.4 Milestones & Task Tracking

**Features:**
- Phase-based project structure
- Task management within phases
- Task status tracking (pending, in_progress, completed)
- Due date management
- File attachments
- Milestone submissions
- Phase advancement
- Progress calculation

**Access Control:**
- Project owners: Full access (add/edit/delete tasks, advance phases)
- Team members with access: View-only (read tasks, phases, progress)

**Status:** ✅ Complete

### 2.5 Team Formation

| Tab | Functionality | Status |
|-----|---------------|--------|
| Discover | Browse students, filter by interests/department, connect | ✅ Complete |
| My Teams | View owned/joined teams, manage members | ✅ Complete |
| Requests | Accept/reject join requests | ✅ Complete |

**Team Features:**
- Create team with name, description, domain, max members
- Apply to join teams
- Owner can accept/reject requests
- Owner can revoke members
- Members can leave teams
- Student status badges (RECRUITING, IN-TEAM, NOT-IN-TEAM)
- Automatic project access on team join

**Connect Modal:**
- Academic info (Department, GPA, Academic Year)
- Contact info (Email, LinkedIn, GitHub)
- Interests and career goals

**Status:** ✅ Complete

### 2.6 GP Library

**Features:**
- Browse past graduation projects
- Search and filter by domain
- View project details
- Uniqueness score display
- Tech stack information
- Favorites system

**Seed Data:** 30 diverse projects across multiple domains

**Status:** ✅ Complete

### 2.7 AI Brainstorm

**Powered by:** OpenCode AI API (`deepseek-v4-flash`)

| Endpoint | Purpose | Status |
|----------|---------|--------|
| `/api/brainstorm` | Main chat with AI tutor | ✅ Complete |
| `/api/brainstorm/analysis` | Market gaps + technical challenges | ✅ Complete |
| `/api/brainstorm/feasibility` | Scored feasibility evaluation (0-100) | ✅ Complete |

**AI Capabilities:**
- Project ideation and refinement
- Feasibility analysis across 5 dimensions
- Market gap identification
- Technical challenge assessment
- Tech stack recommendations
- Milestone planning
- Multi-turn conversations
- Chat history persistence

**Feasibility Dimensions:**
1. Technical Depth (0-20)
2. Market Analysis (0-20)
3. Implementation Plan (0-20)
4. Innovation (0-20)
5. Resource Feasibility (0-20)

**Status:** ✅ Complete

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
- Mark as read functionality

**Status:** ✅ Complete

### 2.9 Project Access Control

**Features:**
- `project_access` junction table for granular permissions
- Explicit access grants instead of implicit team membership
- RLS disabled on `project_access` to prevent recursion
- App-level access control
- Team members get automatic access on join
- Owner can revoke individual access
- View-only permissions for non-owners

**Status:** ✅ Complete

---

## 3. Technical Architecture

### 3.1 Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 16.2.6 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | v4 |
| UI Components | shadcn/ui, Radix UI | ^4.7.0 |
| Database | Supabase (PostgreSQL) | - |
| Auth | Supabase Auth | - |
| Storage | Supabase Storage | - |
| Real-time | Supabase Realtime | - |
| AI | OpenCode AI API | - |
| AI Model | deepseek-v4-flash | - |
| Deployment | Vercel | - |

### 3.2 Project Structure

```
gpspark/
├── app/
│   ├── api/
│   │   ├── ai/
│   │   │   ├── chat/          # AI service chat endpoint
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
├── database/
│   └── schema.sql             # Consolidated schema (single file)
├── lib/
│   ├── supabase.ts            # Supabase client
│   ├── qwen-service.ts        # AI service class
│   ├── gpspark-ai.ts          # High-level AI wrapper
│   └── upload.ts              # File upload utilities
└── vercel.json                # Deployment config
```

### 3.3 Database Schema

**Consolidated Schema:** `database/schema.sql` (single file)

#### Core Tables (13 total)

1. **profiles** - User profiles extending auth.users
2. **teams** - Team information
3. **team_members** - Team membership with roles
4. **team_requests** - Join requests
5. **projects** - Graduation projects
6. **project_phases** - Project phases (5 default)
7. **milestone_tasks** - Tasks within phases
8. **milestone_submissions** - Task submissions
9. **project_access** - Granular project permissions
10. **notifications** - User notifications
11. **library_projects** - GP Library projects
12. **brainstorm_sessions** - AI chat sessions
13. **chat_messages** - AI chat messages

**Detailed Schema:** See `database/schema.sql` for complete table definitions, RLS policies, triggers, and indexes.

### 3.4 RLS Policies

**Key Policies:**

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | All users | Own profile | Own profile | - |
| teams | All users | Authenticated | Owner | Owner |
| team_members | All users | Owner/Self | - | Owner/Self |
| team_requests | Owner/Sender | Authenticated | Owner | - |
| projects | All users | Authenticated | Owner | Owner |
| project_phases | All users | Project owner | Project owner | Project owner |
| milestone_tasks | All users | Project owner | Project owner | Project owner |
| milestone_submissions | Owner | Authenticated | Owner | Owner |
| project_access | RLS disabled | RLS disabled | RLS disabled | RLS disabled |
| notifications | Owner | System | Owner | Owner |

---

## 4. API Endpoints

### 4.1 Brainstorm AI

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/brainstorm` | POST | Main AI chat (non-streaming) | ✅ Complete |
| `/api/brainstorm/analysis` | POST | Market gaps + technical challenges | ✅ Complete |
| `/api/brainstorm/feasibility` | POST | Feasibility scoring | ✅ Complete |

### 4.2 AI Service

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/ai/chat` | POST/GET | AI service with tools | ✅ Complete |
| `/api/ai/tools` | POST/GET | Structured tool execution | ✅ Complete |

### 4.3 Auth

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/auth/callback` | GET | Email confirmation redirect | ✅ Complete |

---

## 5. AI Integration

### 5.1 OpenCode AI Configuration

```typescript
API_URL: https://opencode.ai/zen/go/v1/chat/completions
MODEL: deepseek-v4-flash
Authentication: Bearer token
Response Type: Non-streaming JSON
```

### 5.2 AI Service Classes

**QwenService** (`lib/qwen-service.ts`)
- Core service class for AI interactions
- Supports streaming and non-streaming
- Tool call handling
- Conversation persistence
- Multi-provider support (OpenCode, DashScope, OpenRouter)

**GPsparkAI** (`lib/gpspark-ai.ts`)
- High-level wrapper
- Session management
- Built-in tools execution

### 5.3 Available Tools

| Tool | Description | Status |
|------|-------------|--------|
| `search_library` | Search GP Library for similar projects | ✅ Complete |
| `analyze_feasibility` | Analyze project feasibility | ✅ Complete |
| `suggest_tech_stack` | Recommend technology stack | ✅ Complete |
| `generate_milestones` | Create milestone plan | ✅ Complete |
| `brainstorm_ideas` | Generate project ideas | ✅ Complete |
| `evaluate_project` | Multi-dimension evaluation | ✅ Complete |

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

### 6.4 Database Setup

Run `database/schema.sql` in Supabase SQL Editor. This single file includes:
- All 13 core tables
- Row Level Security policies
- Database triggers and functions
- Storage bucket configuration
- 30 seed projects for GP Library

---

## 7. Key Technical Decisions

### 7.1 Database Consolidation

**Decision:** Single `database/schema.sql` file instead of multiple files  
**Reason:** Easier to manage, run, and maintain. All tables, policies, and seed data in one place.

### 7.2 Project Access Control

**Problem:** Team members couldn't view milestones for team-linked projects.

**Solution:** 
- Created `project_access` junction table
- Explicit access grants instead of implicit team membership
- RLS disabled on `project_access` to prevent recursion
- App-level access control

### 7.3 Email Confirmation

**Problem:** Confirmation email redirect not working.

**Solution:**
- Created `/auth/callback` route
- Added `emailRedirectTo` option in signup
- Handles forwarded hosts for Vercel deployment

### 7.4 AI Response Quality

**Problem:** Streaming responses produced garbled text.

**Solution:**
- Switched from streaming to non-streaming JSON responses
- More reliable, complete responses
- Simpler frontend parsing

### 7.5 Page Reload Data Loss

**Problem:** Data disappeared on page reload.

**Solution:**
- Set `isLoading=false` immediately after localStorage restore
- Don't clear cached user if `getSession()` returns null
- Pages depend on `[user]` instead of `[]` for re-fetching

### 7.6 Project Delete Not Working

**Problem:** Delete button didn't actually delete from database.

**Solution:**
- Added missing DELETE RLS policies
- Database cascade handles child records
- Simplified frontend delete logic

### 7.7 AI Provider Selection

**Decision:** OpenCode AI (deepseek-v4-flash) instead of OpenAI/OpenRouter  
**Reason:** Better performance, lower cost, reliable API

---

## 8. Current Status

### 8.1 Completed Features
- [x] Authentication with email confirmation
- [x] Dashboard with real data
- [x] Project management with team linking
- [x] Milestone tracking with phases/tasks
- [x] Team formation with requests
- [x] GP Library with seed data (30 projects)
- [x] AI brainstorm with OpenCode AI
- [x] Notifications system (real-time + polling)
- [x] Project access control
- [x] Responsive design
- [x] Vercel deployment ready
- [x] Database schema consolidated

### 8.2 Known Limitations
- Mentors page disabled (backend not ready)
- File upload limited to 50MB
- No real-time collaboration on tasks
- No mentor feedback system yet
- No OAuth integration (Google, GitHub)
- No password reset functionality

### 8.3 Future Enhancements
- Mentor portal and feedback system
- Real-time task collaboration
- File versioning
- Progress analytics
- Export reports (PDF)
- Mobile app
- OAuth integration
- Password reset
- Email notifications

---

## 9. Development Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
# Run database/schema.sql in Supabase SQL Editor
```

---

## 10. Repository

**GitHub:** https://github.com/Ahmed900Wael/gpspark-fcai

**Production:** https://gpspark-fcai.vercel.app

---

## 11. Metrics

- **Database Tables:** 13
- **Context Providers:** 2 (Auth, Notifications)
- **Pages:** 10+
- **API Routes:** 5
- **Seed Projects:** 30
- **Lines of Code:** ~15,000+
- **Overall Progress:** 95%
- **UI/UX:** 100%
- **Backend:** 100%
- **AI Integration:** 100%
- **Database:** 100%
- **Deployment:** 100%
- **Documentation:** 100%

---

*Document Version: 2.0*  
*Last Updated: 2026-05-14*
