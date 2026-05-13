# GPspark 🎓

A graduation project management platform with AI brainstorming, team formation, project library, milestone tracking, and Supabase-based authentication.

## Features

- **AI Brainstorming** - Generate and refine project ideas using AI models (OpenRouter, Gemini, HuggingFace)
- **Team Formation** - Discover teammates, send/receive join requests, manage team status
- **Project Library** - Browse and search past graduation projects
- **Milestone Tracking** - Track project phases, tasks, and submissions
- **Notifications** - Real-time notifications for team requests, project updates, and milestones
- **Student Profiles** - Connect with peers, view academic info (GPA, department, year)
- **Authentication** - Email-based signup with confirmation, session persistence

## Tech Stack

- **Framework:** Next.js 16.2.6 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui, Radix UI
- **Database & Auth:** Supabase (PostgreSQL + Auth + Storage)
- **AI Integration:** OpenRouter, Google Gemini, Hugging Face

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
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

4. Set up your Supabase database by running the SQL files in order:
   - `supabase-schema.sql` (base schema)
   - `supabase-additional-schema.sql` (extended tables)
   - `supabase-brainstorm-schema.sql` (brainstorming tables)
   - `supabase-notifications-schema.sql` (notifications + team features)
   - `supabase-storage-schema.sql` (storage buckets)

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
| `OPENROUTER_API_KEY` | OpenRouter API key for AI models | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `HUGGING_FACE_TOKEN` | Hugging Face access token | Yes |
| `HUGGING_FACE_MODEL` | Hugging Face model to use | No |
| `NEXT_PUBLIC_APP_URL` | App URL (localhost or production) | Yes |

## Project Structure

```
gpspark/
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes (brainstorming)
│   ├── brainstorm/         # AI brainstorming page
│   ├── dashboard/          # User dashboard
│   ├── library/            # Project library
│   ├── mentors/            # Mentors directory
│   ├── milestones/         # Milestone tracking
│   ├── onboarding/         # New user onboarding
│   ├── profile/            # User profiles
│   ├── projects/           # Project creation & management
│   ├── signin/             # Sign in page
│   ├── signup/             # Sign up page
│   └── team/               # Team formation
├── components/             # Reusable UI components
├── contexts/               # React contexts (Auth, Notifications)
├── lib/                    # Utilities (Supabase client)
├── supabase-*.sql          # Database schema files
└── vercel.json             # Vercel deployment config
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

Run the SQL files in your Supabase SQL Editor in this order:

1. `supabase-schema.sql` - Core tables (profiles, teams, projects, etc.)
2. `supabase-additional-schema.sql` - Extended features
3. `supabase-brainstorm-schema.sql` - Brainstorming sessions
4. `supabase-notifications-schema.sql` - Notifications, team requests, project-team linking
5. `supabase-storage-schema.sql` - Storage buckets (policies must be added via Dashboard)

**Note:** Storage bucket policies cannot be created via SQL Editor. Add them manually in Supabase Dashboard → Storage → Configure bucket → Policies.

## License

This is a graduation project for educational purposes.
