# GPspark Project Plan

## Technology Stack

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui components
- **Backend:** Next.js API Routes + Server Actions
- **Database:** Supabase (PostgreSQL + Auth + Real-time)
- **AI Integration:** OpenAI GPT-4 API
- **Deployment:** Vercel (frontend) + Supabase Cloud

---

## Core Features & Modules

### 1. Landing Page (Public)
- Hero section with CTA
- Feature showcase (AI Brainstorming, Market Analysis, Team Building)
- Project library preview
- Testimonials/social proof
- Footer with links

### 2. Authentication & Onboarding
- Email/password + OAuth (Google, GitHub)
- Multi-step onboarding:
  - Step 1: Account Identity
  - Step 2: Academic Profile (GPA, year, interests)
  - Step 3: Career Goals
- Progress tracking
- Profile completion incentives

### 3. Brainstorming AI
- Chat interface with AI tutor
- Project feasibility scoring (0-100%)
- Market gap identification
- Technical challenge analysis
- Research structure suggestions
- Export research summary (PDF)
- Conversation history

### 4. GP Library
- Searchable project database
- Filters: domain, year, tech stack, uniqueness score
- Project cards with:
  - Uniqueness Factor score
  - Tech stack tags
  - Release date
  - Case study links
- "Analyze Architecture" feature
- Favorites system

### 5. Team Formation
- Student profiles with skills
- Skill-based search and matching
- Team creation and management
- Team listings with open positions
- Connect/request system
- Availability status
- Tips and guidelines

### 6. Milestones & Project Management
- Project roadmap visualization
- Phase-based progress tracking
- Task management within phases
- Mentor feedback system
- Submission workflow
- Review archive
- Discussion forums

---

## Database Schema (Supabase)

```
users
├── id (UUID)
├── email
├── full_name
── university_email
├── gpa
── academic_year
├── career_goals
── avatar_url
├── created_at
── updated_at

user_skills
├── id
├── user_id (FK)
├── skill_name
└── proficiency_level

user_interests
├── id
── user_id (FK)
└── interest_category

projects
├── id
├── title
├── description
├── domain
├── tech_stack (array)
├── uniqueness_score
├── release_year
├── case_study_url
├── created_by (FK)
└── created_at

brainstorm_sessions
── id
├── user_id (FK)
├── project_focus
├── feasibility_score
├── market_gaps (JSON)
── technical_challenges (JSON)
├── created_at
└── updated_at

chat_messages
├── id
├── session_id (FK)
├── role (user/assistant)
├── content
└── timestamp

teams
├── id
├── name
── description
├── created_by (FK)
├── status (seeking/full)
── max_members
└── created_at

team_members
├── id
├── team_id (FK)
├── user_id (FK)
├── role
└── joined_at

milestones
├── id
├── project_id (FK)
├── phase_name
── phase_number
├── status
├── progress_percentage
├── start_date
├── end_date
└── created_at

tasks
├── id
├── milestone_id (FK)
├── title
├── description
├── status
├── due_date
── assigned_to (FK)

mentor_feedback
── id
├── milestone_id (FK)
├── mentor_id (FK)
├── feedback_text
├── rating
└── created_at
```

---

## Development Phases

### Phase 1: Foundation (Weeks 1-2)
- [ ] Project setup (Next.js, TypeScript, Tailwind)
- [ ] Supabase integration & authentication
- [ ] Base UI components (shadcn/ui)
- [ ] Navigation & layout structure
- [ ] Landing page implementation

### Phase 2: Core Features (Weeks 3-5)
- [ ] User onboarding flow (3-step wizard)
- [ ] Profile management
- [ ] Brainstorming AI chat interface
- [ ] OpenAI API integration
- [ ] Chat message persistence

### Phase 3: Library & Teams (Weeks 6-8)
- [ ] GP Library with search & filters
- [ ] Project card components
- [ ] Uniqueness scoring algorithm
- [ ] Team Formation page
- [ ] Student profile cards
- [ ] Team creation & management

### Phase 4: Project Management (Weeks 9-10)
- [ ] Milestones roadmap visualization
- [ ] Task management system
- [ ] Progress tracking
- [ ] Mentor feedback system
- [ ] Submission workflow

### Phase 5: Polish & Launch (Weeks 11-12)
- [ ] Responsive design optimization
- [ ] Performance optimization
- [ ] Testing (unit + integration)
- [ ] Bug fixes
- [ ] Documentation
- [ ] Deployment

---

## Key Technical Considerations

### 1. AI Integration
- Rate limiting for OpenAI API calls
- Streaming responses for chat
- Context window management
- Prompt engineering for academic focus

### 2. Security
- Row-level security (RLS) in Supabase
- Input validation & sanitization
- Rate limiting on API routes
- Secure file uploads

### 3. Performance
- Server-side rendering for SEO
- Image optimization
- Database indexing
- Caching strategies

### 4. Scalability
- Pagination for large datasets
- Lazy loading components
- CDN for static assets

---

## Estimated Timeline
- **Total Duration:** 12 weeks
- **Team Size:** 2-4 developers recommended
- **MVP Ready:** Week 8 (core features)
