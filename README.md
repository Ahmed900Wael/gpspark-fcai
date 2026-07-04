# GPspark 🎓

A comprehensive graduation project management platform for FCAI-CU students with AI-powered brainstorming, team formation, project library, milestone tracking, and real-time notifications.

## Features

- **AI Brainstorming** - Generate and refine project ideas using OpenCode AI (deepseek-v4-flash)
- **Team Formation** - Discover teammates, send/receive join requests, manage team status
- **Project Management** - Create projects, track phases, link to teams, manage access
- **Milestone Tracking** - Phase-based task management with submissions and file attachments
- **GP Library** - Browse 30+ past graduation projects with search and filters
- **Notifications** - Real-time notifications via Supabase subscriptions + polling fallback
- **Student Profiles** - Academic info, interests, career goals, contact details
- **Authentication** - Email confirmation, session persistence, protected routes
- **Project Access Control** - Granular permissions via `project_access` table

## Tech Stack

- **Framework:** Next.js 16.2.6 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui, Radix UI
- **Database & Auth:** Supabase (PostgreSQL + Auth + Storage + Realtime)
- **AI Integration:** OpenCode AI API (deepseek-v4-flash)
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Supabase account
- OpenCode AI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Ahmed900Wael/gpspark-fcai.git
cd gpspark
```

2. Install dependencies:
```bash
npm install
```

3. Copy `.env.local.example` to `.env.local` and fill in your values:
```bash
cp .env.local.example .env.local
```

4. Set up your Supabase database:
   - Go to Supabase SQL Editor
   - Run `database/schema.sql` (single consolidated file)
   - This creates all tables, RLS policies, and seed data

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) | Yes |
| `OPENCODE_API_KEY` | OpenCode AI API key | Yes |
| `NEXT_PUBLIC_APP_URL` | App URL (localhost or production) | Yes |

## Project Structure

```
gpspark/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── ai/           # AI service endpoints
│   │   └── brainstorm/   # AI brainstorming endpoints
│   ├── auth/callback/    # Email confirmation handler
│   ├── brainstorm/       # AI brainstorming page
│   ├── dashboard/        # User dashboard
│   ├── library/          # GP Library
│   ├── milestones/       # Milestone tracking
│   ├── projects/         # Project management
│   ├── profile/          # User profiles
│   ├── signin/           # Sign in page
│   ├── signup/           # Sign up page
│   └── team/             # Team formation
├── components/           # Reusable UI components
├── contexts/             # React contexts (Auth, Notifications)
├── database/             # Database schema
│   └── schema.sql        # Consolidated schema (single file)
├── lib/                  # Utilities
│   ├── supabase.ts       # Supabase client
│   ├── qwen-service.ts   # AI service class
│   └── gpspark-ai.ts     # High-level AI wrapper
└── vercel.json           # Vercel deployment config
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Set all environment variables in Vercel settings
4. Click **Deploy**

**Important:** After deploying, update your Supabase project settings:
- Go to **Authentication → URL Configuration**
- Set **Site URL** to your Vercel URL
- Add your Vercel URL to **Redirect URLs**

## Database Setup

Run `database/schema.sql` in your Supabase SQL Editor. This single file includes:
- All 13 core tables (profiles, teams, projects, phases, tasks, submissions, etc.)
- Row Level Security (RLS) policies
- Database triggers and functions
- Storage bucket configuration
- 30 seed projects for GP Library

**Note:** Storage bucket policies must be added manually via Supabase Dashboard → Storage → Configure bucket → Policies.

## Architecture

### Frontend
- Next.js 16.2.6 with App Router
- React 19.2.4 with TypeScript
- Tailwind CSS v4 + shadcn/ui components
- React Context API for state management

### Backend
- Next.js API Routes for server-side logic
- Supabase for database, auth, and storage
- Row Level Security for data access control
- Real-time subscriptions for live updates

### AI Integration
- OpenCode AI API endpoint
- Model: deepseek-v4-flash
- Non-streaming JSON responses
- Multi-turn conversation support

## Key Features

### Authentication
- Email signup with confirmation
- Session persistence via localStorage
- Protected routes with auto-redirect
- Custom `/auth/callback` for email verification

### Project Access Control
- `project_access` junction table for granular permissions
- Team members can view projects (read-only)
- Project owners have full access
- Explicit access grants via app logic

### Team Management
- Create and join teams
- Accept/reject join requests
- Owner can revoke members
- Automatic project access on team join

### Milestone Tracking
- Phase-based project structure
- Task CRUD with status tracking
- File attachments and submissions
- Phase advancement workflow

### Notifications
- Real-time via Supabase subscriptions
- 10-second polling fallback
- Bell dropdown in navbar
- Types: team requests, project assignments, milestone updates

## Current Status

✅ **Production Ready**
- All core features implemented
- Database schema consolidated
- Authentication working
- AI integration functional
- Deployment configured

## Repository

**GitHub:** https://github.com/Ahmed900Wael/gpspark-fcai  
**Production:** https://gpspark-fcai.vercel.app

## License

This is a graduation project for educational purposes.
