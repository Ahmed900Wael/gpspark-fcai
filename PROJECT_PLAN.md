# GPSpark Project Plan

## Project Overview
GPSpark is a graduation project management platform that bridges the gap between academic theory and market reality. It provides AI-driven insights, team formation tools, and project management features for FCAI students.

**Repository:** https://github.com/Ahmed900Wael/gpspark-fcai
**Status:** Active Development
**Last Updated:** 2026-05-10 (OpenAI Integration Added)

---

## Technology Stack

- **Frontend:** Next.js 16.2.6 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui components
- **Backend:** Next.js API Routes + Server Actions
- **Database:** Supabase (PostgreSQL + Auth + Real-time)
- **Authentication:** Supabase Auth (Email/Password)
- **State Management:** React Context API (Auth Context)
- **Storage:** localStorage for session persistence + Supabase for data
- **UI Components:** shadcn/ui + Lucide React icons
- **Deployment:** Vercel (frontend) + Supabase Cloud

---

## Project Structure

```
gpspark/
├── app/
│   ├── layout.tsx              # Root layout with Providers
│   ├── page.tsx                # Landing page (public)
│   ├── globals.css             # Global styles
│   ├── api/
│   │   └── brainstorm/route.ts # OpenAI API route (streaming)
│   ├── dashboard/page.tsx      # Dashboard (protected)
│   ├── brainstorm/page.tsx     # Brainstorming AI (protected)
│   ├── library/page.tsx        # GP Library (protected)
│   ├── team/page.tsx           # Team Formation (protected)
│   ├── milestones/page.tsx     # Milestones (protected)
│   ├── mentors/page.tsx        # Mentors (protected)
│   ├── onboarding/page.tsx     # Onboarding info (public)
│   ├── signin/page.tsx         # Sign In (public)
│   ├── signup/page.tsx         # Sign Up (public)
│   ├── profile/page.tsx        # User's own profile (protected)
│   └── profile/[userId]/page.tsx # Other user profiles (protected)
├── components/
│   ├── ui/                     # shadcn/ui components
│   │   └── button.tsx
│   ├── navbar.tsx              # SimpleHeader component
│   ├── sidebar.tsx             # Responsive sidebar with mobile menu
│   ├── providers.tsx           # Auth provider wrapper
│   └── protected-route.tsx     # Route protection wrapper
```

---

## Completed Features

### ✅ 1. Landing Page (Public)
- [x] Hero section with CTA buttons
- [x] Feature showcase (AI Brainstorming, Market Analysis, Team Building)
- [x] Project library preview section
- [x] CTA section with "Create Free Account" and "Talk to an Advisor"
- [x] Footer with dynamic year and links
- [x] Responsive design (mobile-first)
- [x] Dynamic year in "Industry Trends" section
- [x] Navigation links removed (clean design)
- [x] Sign In button links to /signin

### ✅ 2. Authentication System
- [x] Supabase integration with email/password auth
- [x] Sign Up page (/signup) with form validation
- [x] Sign In page (/signin) with password visibility toggle
- [x] Auth Context with full state management
- [x] Session persistence via localStorage
- [x] Auto-redirect to onboarding for unauthenticated users
- [x] Protected routes wrapper component
- [x] Logout functionality in sidebar
- [x] Profile auto-creation on signup via database trigger
- [x] Console logging for all auth events ([CLIENT]/[SERVER])

### ✅ 3. Onboarding Flow
- [x] Onboarding info page (/onboarding) with 3-step overview
- [x] Sign Up redirects to dashboard after completion
- [x] Profile data synced with Supabase database
- [x] Form validation on each step

### ✅ 4. Dashboard (Protected)
- [x] Stats cards (Project Progress, Tasks, Deadline, Uniqueness Score)
- [x] Current project card with progress bar
- [x] Quick actions panel
- [x] Recent activity feed
- [x] Upcoming milestones list
- [x] Responsive grid layouts

### ✅ 5. Brainstorming AI (Protected)
- [x] Chat interface with AI tutor messages
- [x] Project feasibility score (circular progress)
- [x] Market gaps identification cards
- [x] Technical challenges with severity indicators
- [x] Suggestion chips for next topics
- [x] Export Research Summary button
- [x] Message input with attachment option
- [x] OpenAI API integration with streaming responses
- [x] Real-time chat with GPT-4o-mini
- [x] Loading states and error handling
- [x] Auto-scroll to latest message
- [x] Enter key to send messages

### ✅ 6. GP Library (Protected)
- [x] Search and filter functionality
- [x] Featured project card with uniqueness score
- [x] Project grid with tech stack tags
- [x] "Analyze Architecture" buttons
- [x] Empty state with uniqueness audit CTA
- [x] Tabs for All Projects / My Favorites

### ✅ 7. Team Formation (Protected)
- [x] Student profile cards with skills
- [x] Skill-based search with active filters
- [x] Teams seeking members sidebar
- [x] Apply to team functionality
- [x] Tips for teams section
- [x] Create Team button

### ✅ 8. Milestones (Protected)
- [x] Roadmap overview with phase progression
- [x] Current phase task list with status indicators
- [x] Next phase preview
- [x] Mentor feedback card
- [x] Need Help discussion section
- [x] Review archive section
- [x] Submit Milestone button

### ✅ 9. Mentors (Protected)
- [x] Mentor cards with expertise tags
- [x] Availability status indicators
- [x] Search and filter by expertise
- [x] Stats section (Available Mentors, Sessions, Avg Rating)
- [x] Feedback requests list
- [x] Message and Book Session buttons

### ✅ 10. User Profiles
- [x] Own profile page (/profile) with full edit access
- [x] Other user profiles (/profile/[userId]) with limited access
- [x] Edit mode with save/cancel functionality
- [x] Interest toggle buttons
- [x] Email privacy (partial masking for other users)
- [x] Avatar with initials
- [x] Member since date display

### ✅ 11. Navigation & Layout
- [x] Responsive sidebar with mobile hamburger menu
- [x] Fixed sidebar on desktop, slide-in on mobile
- [x] SimpleHeader component with user avatar
- [x] ProtectedRoute wrapper for auth-gated pages
- [x] Consistent navigation across all pages
- [x] Mobile-responsive grids and layouts
- [x] Safe area support for notched devices

### ✅ 12. UI/UX Polish
- [x] GPSpark logo in sidebar and footer
- [x] Dynamic year in footer copyright
- [x] Cursor pointer on all buttons
- [x] Navigation links on all buttons
- [x] "Talk to an Advisor" button with transparent hover
- [x] Footer links: About, Privacy Policy, Terms, Contact Support
- [x] FCAI-CU 2026 branding in footer

---

## Pending Features

### 🔄 Authentication & Profiles
- [ ] Email verification flow
- [ ] Password reset functionality
- [ ] OAuth integration (Google, GitHub)
- [ ] Profile picture upload
- [ ] Email notifications

### 🔄 Brainstorming AI
- [x] OpenAI API integration
- [x] Real-time chat with streaming responses
- [ ] Chat history persistence to database
- [ ] PDF export functionality
- [ ] Context window management
- [ ] Save brainstorm sessions

### 🔄 GP Library
- [ ] Real project data from database
- [ ] Advanced search with full-text search
- [ ] Project detail pages
- [ ] Favorites system
- [ ] Uniqueness scoring algorithm

### 🔄 Team Formation
- [ ] Real team data from database
- [ ] Team creation workflow
- [ ] Team member management
- [ ] Real-time messaging between users
- [ ] Skill matching algorithm

### 🔄 Milestones
- [ ] Real project data from database
- [ ] Task CRUD operations
- [ ] File upload for submissions
- [ ] Real mentor feedback system
- [ ] Calendar integration

### 🔄 Mentors
- [ ] Real mentor data from database
- [ ] Booking system with calendar
- [ ] Video call integration
- [ ] Rating and review system
- [ ] Mentor availability management

### 🔄 Additional Features
- [ ] Dark mode toggle
- [ ] Notifications system
- [ ] Analytics dashboard
- [ ] Export functionality (PDF, CSV)
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Admin panel

---

## Database Schema (Supabase)

### Current Tables

#### `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  university_email TEXT NOT NULL DEFAULT '',
  gpa TEXT DEFAULT '',
  academic_year TEXT DEFAULT '',
  interests TEXT[] DEFAULT '{}',
  career_goals TEXT DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Row Level Security Policies
- Users can view own profile (full access)
- Users can view all profiles (limited access in app)
- Users can insert own profile
- Users can update own profile

#### Triggers
- `on_auth_user_created`: Auto-creates profile on signup
- `set_updated_at`: Updates timestamp on profile changes

### Planned Tables

#### `projects`
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  domain TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  uniqueness_score DECIMAL(3,1),
  release_year INTEGER,
  case_study_url TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `teams`
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'seeking',
  max_members INTEGER DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `team_members`
```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);
```

#### `milestones`
```sql
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  phase_name TEXT NOT NULL,
  phase_number INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  progress_percentage INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `tasks`
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  milestone_id UUID REFERENCES milestones(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  due_date DATE,
  assigned_to UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `brainstorm_sessions`
```sql
CREATE TABLE brainstorm_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_focus TEXT,
  feasibility_score DECIMAL(5,2),
  market_gaps JSONB,
  technical_challenges JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `chat_messages`
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES brainstorm_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

#### `mentor_feedback`
```sql
CREATE TABLE mentor_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  milestone_id UUID REFERENCES milestones(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES profiles(id),
  feedback_text TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tlocxrrjiuflhxvzayyy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable__56AJJsqggYySnFyWLrgKg_kC-o7aRY

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Other (Pending)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Key Technical Decisions

### 1. Authentication Flow
- Supabase Auth handles user authentication
- Profiles table extends auth.users with additional fields
- Auto-profile creation via database trigger on signup
- Session synced with localStorage for client-side authorization
- Protected routes redirect unauthenticated users to /onboarding

### 2. Profile Privacy
- Own profile: Full edit access to all fields
- Other profiles: Limited view (email partially masked, GPA hidden if empty, career goals truncated)
- Row Level Security ensures users can only edit their own data

### 3. Responsive Design
- Mobile-first approach with Tailwind CSS
- Sidebar: Fixed on desktop (lg:), slide-in overlay on mobile
- Hamburger menu with touch-optimized button
- Safe area support for notched devices
- Grid layouts adapt from 1 column (mobile) to multi-column (desktop)

### 4. State Management
- React Context API for auth state
- localStorage for session persistence
- Supabase for data persistence
- Client-side logging with [CLIENT]/[SERVER] prefixes

### 5. Component Architecture
- Reusable Sidebar component with active page highlighting
- SimpleHeader component with user avatar
- ProtectedRoute wrapper for auth-gated pages
- shadcn/ui for consistent UI components

---

## Known Issues & Fixes

### Fixed Issues
1. **Duplicate key error on signup** - Changed `.insert()` to `.update()` since trigger auto-creates profile
2. **Missing icon imports** - Added all required Lucide icons to each page
3. **Unterminated regexp literal** - Removed extra closing div tag in team page
4. **Brain not defined** - Added missing Brain icon import to dashboard
5. **Mobile hamburger not working** - Fixed z-index layering (button: z-[70], sidebar: z-[60])
6. **Navbar spacing** - Added `pl-16 lg:pl-6` to prevent overlap with hamburger button

### Current Issues
- None reported

---

## Development Phases Status

### Phase 1: Foundation ✅ COMPLETE
- [x] Project setup (Next.js, TypeScript, Tailwind)
- [x] Supabase integration & authentication
- [x] Base UI components (shadcn/ui)
- [x] Navigation & layout structure
- [x] Landing page implementation
- [x] Responsive design
- [x] Logo integration

### Phase 2: Core Features 🔄 IN PROGRESS
- [x] User onboarding flow (info page)
- [x] Sign up / Sign in pages
- [x] Profile management (own & others)
- [x] Authentication context
- [x] Protected routes
- [x] Logout functionality
- [x] Brainstorming AI chat interface (UI + API)
- [x] OpenAI API integration with streaming
- [ ] Chat message persistence to database

### Phase 3: Library & Teams 🔄 IN PROGRESS
- [x] GP Library UI
- [x] Project card components
- [ ] Real project data from database
- [ ] Uniqueness scoring algorithm
- [x] Team Formation UI
- [x] Student profile cards
- [ ] Team creation & management
- [ ] Real-time messaging

### Phase 4: Project Management 🔄 IN PROGRESS
- [x] Milestones UI
- [x] Roadmap visualization
- [ ] Task management system
- [ ] Progress tracking
- [ ] Mentor feedback system
- [ ] Submission workflow
- [ ] File uploads

### Phase 5: Polish & Launch ⏳ PENDING
- [ ] Performance optimization
- [ ] Testing (unit + integration)
- [ ] Bug fixes
- [ ] Documentation
- [ ] Deployment to Vercel
- [ ] SEO optimization
- [ ] Analytics integration

---

## API Integration Plan

### OpenAI Integration ✅ COMPLETE
- [x] Install `openai` package
- [x] Create API route `/api/brainstorm`
- [x] Implement streaming responses with GPT-4o-mini
- [x] Add rate limiting headers
- [ ] Store chat history in database
- [ ] Implement context window management
- [ ] Add session persistence

### Supabase Storage (Pending)
- [ ] Enable storage in Supabase
- [ ] Create `avatars` bucket
- [ ] Implement profile picture upload
- [ ] Add file upload for milestone submissions

---

## Testing Strategy

### Manual Testing Checklist
- [ ] Sign up flow (new user)
- [ ] Sign in flow (existing user)
- [ ] Logout functionality
- [ ] Protected route redirection
- [ ] Profile edit and save
- [ ] View other user profiles
- [ ] Mobile responsiveness
- [ ] Sidebar navigation
- [ ] Form validation

### Automated Testing (Pending)
- [ ] Unit tests for auth context
- [ ] Integration tests for sign up/in
- [ ] E2E tests with Playwright
- [ ] Component tests with React Testing Library

---

## Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database schema applied
- [ ] RLS policies verified
- [ ] Email confirmation enabled
- [ ] Custom email templates configured
- [ ] CORS configured for production domain
- [ ] Error handling implemented
- [ ] Loading states implemented

### Vercel Deployment
- [ ] Connect GitHub repository
- [ ] Configure environment variables
- [ ] Set build command: `npm run build`
- [ ] Set output directory: `.next`
- [ ] Configure custom domain
- [ ] Enable HTTPS
- [ ] Set up monitoring

### Post-Deployment
- [ ] Test full auth flow on production
- [ ] Verify database connections
- [ ] Test mobile responsiveness
- [ ] Monitor error logs
- [ ] Set up analytics

---

## Resources & References

- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **shadcn/ui:** https://ui.shadcn.com
- **Lucide Icons:** https://lucide.dev

---

## Notes for Future Sessions

### Current State
- All UI pages are built and responsive
- Authentication is fully functional with Supabase
- Database schema is created with RLS policies
- Profile system works (own + others with limited access)
- Sidebar navigation is consistent across all pages
- Mobile hamburger menu works correctly

### Next Steps
1. Add your OpenAI API key to `.env.local` to enable the Brainstorming AI chat
2. Add real data to GP Library from database
3. Implement team creation and management
4. Add task CRUD operations for Milestones
5. Implement mentor booking system
6. Add file upload functionality
7. Set up email notifications
8. Deploy to Vercel

### Important Context
- Supabase project URL: https://tlocxrrjiuflhxvzayyy.supabase.co
- Database trigger auto-creates profiles on signup
- Use `.update()` not `.insert()` for profile creation in signUp
- All protected pages use `<ProtectedRoute>` wrapper
- Auth state is synced with localStorage for persistence
- Console uses `[CLIENT]` and `[SERVER]` prefixes for logging
- Brainstorming API route: `/api/brainstorm` uses GPT-4o-mini with streaming
- OpenAI API key required in `.env.local` for chat to work

---

## Estimated Timeline
- **Total Duration:** 12 weeks
- **Team Size:** 2-4 developers recommended
- **MVP Ready:** Week 8 (core features)
- **Current Progress:** ~65% complete (UI done, OpenAI API integrated, backend integration in progress)
