# ConnectUs

A quietly powerful network for college alumni and current students — built for mentorship, introductions, and community.

This repo is a two-app workspace:

```
connectus/
├── frontend/   # Next.js 14 (App Router) + TypeScript + Tailwind + Framer Motion
└── backend/    # Express + TypeScript, in-memory store, REST API
```

## Tech stack

**Frontend** — Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Radix UI primitives, lucide-react, next-themes, Inter + Fraunces (serif display).

**Backend** — Node.js + Express, TypeScript, in-memory seed (~30 alumni, ~20 students, ~14 posts, ~9 events, conversations, mentor availability), CORS enabled.

## Running locally

You'll need Node 18+ and npm.

### 1. Backend (port 4000)

```bash
cd backend
npm install
cp .env.example .env   # optional — defaults are fine
npm run dev
```

API will be live at <http://localhost:4000>. Sanity check: `GET http://localhost:4000/api/health`.

### 2. Frontend (port 3000)

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL defaults to localhost:4000
npm run dev
```

Open <http://localhost:3000>.

## What's in this build

This is the **first delivery pass** — full design system, sidebar layout, command palette (⌘K), backend, and two production-quality pages:

- ✅ **Dashboard** (`/`) — greeting, stats, recommended alumni, recent activity, upcoming events, quick actions
- ✅ **Alumni Directory** (`/alumni`) — search, animated filter chips, sort tabs, card grid with shared-element transitions
- ✅ **Alumni Profile** (`/alumni/[id]`) — hero card with `layoutId` transition from the directory, bio, work history timeline, expertise, quick facts
- 🛠️ Messages, Mentorship, Events, Feed, Profile, Settings — polished placeholder screens; backend endpoints already exist

All shared infrastructure is in place — design tokens, motion primitives, command palette, theme toggle, Avatar with deterministic gradient fallbacks, skeleton shimmer, custom scrollbars.

## Design notes

- **Palette** — warm off-white canvas (`#FAFAF9`), deep ink, **muted sage `#5B7C5A`** accent. Pure black surface in dark mode.
- **Type** — Inter for UI, Fraunces (serif, optical-sized) for display headings.
- **Motion** — every transition uses `ease: [0.16, 1, 0.3, 1]`; stagger ~40 ms; layout transitions via Framer Motion `layoutId` (try clicking an alumnus card).
- **Keyboard** — press `⌘K` / `Ctrl+K` to open the command palette.

## API surface

| Method | Path                                  | Notes |
|--------|---------------------------------------|-------|
| GET    | `/api/users/me`                       | Current user profile + stats |
| GET    | `/api/alumni`                         | Query: `search`, `year`, `industry`, `expertise` |
| GET    | `/api/alumni/:id`                     | One alumnus |
| GET    | `/api/students`                       | Student list |
| GET    | `/api/messages/conversations`         | Conversations w/ participant + last message |
| GET    | `/api/messages/:conversationId`       | Messages in a conversation |
| POST   | `/api/messages`                       | `{ conversationId, body }` |
| GET    | `/api/mentorship/mentors`             | Mentors with availability |
| GET    | `/api/mentorship/bookings`            | Your bookings |
| POST   | `/api/mentorship/book`                | `{ mentorId, slot, goal }` |
| GET    | `/api/events`                         | Events with host + attendee profiles |
| POST   | `/api/events/:id/rsvp`                | Toggle RSVP |
| GET    | `/api/feed`                           | Posts, newest first |
| POST   | `/api/feed/posts`                     | `{ content }` |

## Project structure

```
frontend/src/
├── app/                  # Next.js App Router (routes + layout)
├── components/
│   ├── ui/               # Hand-built primitives (Button, Card, Avatar, …)
│   ├── layout/           # Sidebar, Logo, ThemeToggle
│   └── features/         # PageHeader, StatCard, AlumniCard, CommandPalette
├── lib/                  # api client, utils, motion constants
├── hooks/
└── types/

backend/src/
├── index.ts              # Express app + routes
├── types.ts
└── data/seed.ts          # In-memory dataset
```

## Screenshots

_Add screenshots of the Dashboard and Alumni Directory here once you've run it._

- `docs/dashboard.png`
- `docs/alumni-directory.png`
- `docs/alumni-profile.png`
