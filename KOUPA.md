# KOUPA — Master Project Document
> Read this entire file before touching any code. This is your single source of truth.

---

## 1. What Is KOUPA?

KOUPA is a personal academic and life organizer built as a Progressive Web App (PWA). It is built exclusively for one user: **Erfan** — a computer science student at the University of Bonn.

- Runs at a Vercel URL
- Installable on iPhone via Safari "Add to Home Screen"
- Always online — no offline data, no localStorage
- Replaces scattered notes, phone reminders, and mental overhead

---

## 2. Who Is Erfan?

- CS student, University of Bonn
- Courses: NLP, Machine Learning, Spatio-temporal Data Analysis, Secure Software Engineering, Computational Neuroscience
- Developer background: Flutter/Dart, React, .NET/ASP.NET Core
- Uses Claude Code via terminal
- Primary device: iPhone — app must feel native on Safari PWA

---

## 3. Tech Stack — NON-NEGOTIABLE

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS only |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Google OAuth |
| Notifications | Telegram Bot API + Vercel Cron |
| Hosting | Vercel |
| PWA | next-pwa |

**Hard rules:**
- No IndexedDB
- No localStorage for data
- No Prisma, no ORM — use @supabase/supabase-js directly
- No other UI libraries unless explicitly approved
- Everything persisted in Supabase

---

## 4. Folder Structure

```
koupa/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (app)/
│   │   ├── layout.tsx              ← bottom nav + auth guard
│   │   ├── home/
│   │   │   └── page.tsx
│   │   ├── courses/
│   │   │   ├── page.tsx            ← Course Galaxy
│   │   │   └── [id]/
│   │   │       ├── page.tsx        ← Course Hub
│   │   │       ├── homework/
│   │   │       │   └── page.tsx
│   │   │       ├── exams/
│   │   │       │   └── page.tsx
│   │   │       ├── notes/
│   │   │       │   └── page.tsx
│   │   │       ├── teammates/
│   │   │       │   └── page.tsx
│   │   │       ├── grades/
│   │   │       │   └── page.tsx
│   │   │       └── calendar/
│   │   │           └── page.tsx
│   │   ├── planner/
│   │   │   └── page.tsx            ← Weekly Planner
│   │   ├── todo/
│   │   │   └── page.tsx            ← Personal Todo
│   │   └── profile/
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts
│   │   └── cron/
│   │       └── notify/
│   │           └── route.ts
│   ├── layout.tsx                  ← root layout, PWA meta tags
│   └── globals.css
│
├── components/
│   ├── ui/                         ← reusable primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Badge.tsx
│   │   ├── BottomNav.tsx
│   │   ├── PageHeader.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── EmptyState.tsx
│   │   └── CountdownBadge.tsx
│   ├── courses/
│   ├── homework/
│   ├── exams/
│   ├── todos/
│   └── planner/
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts               ← browser client
│   │   ├── server.ts               ← server client (SSR)
│   │   └── types.ts                ← DB types
│   ├── telegram.ts                 ← sendTelegramMessage()
│   └── utils.ts                    ← shared helpers
│
├── public/
│   ├── manifest.json
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
│
├── middleware.ts                   ← session refresh + route protection
├── .env.local
├── next.config.js
├── tailwind.config.js
└── vercel.json                     ← cron config
```

---

## 5. Database Schema

### Table: profiles
```sql
id            uuid  PK (references auth.users)
name          text
telegram_chat_id  text
created_at    timestamptz
```

### Table: courses
```sql
id            uuid  PK
user_id       uuid  → profiles.id
name          text  NOT NULL
code          text
professor     text
room          text
color         text  DEFAULT '#7B5EA7'
semester_start  date  NOT NULL
semester_end    date  NOT NULL
created_at    timestamptz
```

### Table: course_schedules
```sql
id            uuid  PK
course_id     uuid  → courses.id
day_of_week   int   (0=Mon, 6=Sun)
start_time    time
end_time      time
```

### Table: homework
```sql
id            uuid  PK
course_id     uuid  → courses.id
user_id       uuid  → profiles.id
title         text  NOT NULL
description   text
has_deadline  boolean  DEFAULT false
deadline      timestamptz
remind_at     timestamptz
reminder_sent boolean  DEFAULT false
is_done       boolean  DEFAULT false
created_at    timestamptz
```

### Table: exams
```sql
id            uuid  PK
course_id     uuid  → courses.id
user_id       uuid  → profiles.id
title         text  NOT NULL
exam_date     timestamptz  NOT NULL
location      text
topics        text
readiness     int   (1–5)
created_at    timestamptz
```

### Table: notes
```sql
id            uuid  PK
course_id     uuid  → courses.id
user_id       uuid  → profiles.id
content       text
url           text
created_at    timestamptz
```

### Table: teammates
```sql
id            uuid  PK
course_id     uuid  → courses.id
user_id       uuid  → profiles.id
name          text  NOT NULL
email         text
created_at    timestamptz
```

### Table: grades
```sql
id            uuid  PK
course_id     uuid  → courses.id
user_id       uuid  → profiles.id
item_name     text  NOT NULL
max_score     numeric  NOT NULL
received_score  numeric  NOT NULL
created_at    timestamptz
```

### Table: todo_categories
```sql
id            uuid  PK
user_id       uuid  → profiles.id
name          text  NOT NULL
color         text  DEFAULT '#00C9A7'
created_at    timestamptz
```

### Table: todos
```sql
id            uuid  PK
user_id       uuid  → profiles.id
category_id   uuid  → todo_categories.id (nullable)
title         text  NOT NULL
description   text
priority      text  (low / medium / high)  DEFAULT 'medium'
due_at        timestamptz
remind_at     timestamptz
reminder_sent boolean  DEFAULT false
is_done       boolean  DEFAULT false
created_at    timestamptz
```

**All tables have RLS enabled. Users can only access their own rows.**

Auto-create profile on signup via Supabase trigger:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 6. Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TELEGRAM_BOT_TOKEN=
CRON_SECRET=
NEXT_PUBLIC_APP_URL=
```

---

## 7. Screens — What Gets Built

| # | Screen | Route |
|---|--------|-------|
| 1 | Login | /login |
| 2 | Home | /home |
| 3 | Course Galaxy | /courses |
| 4 | Course Hub | /courses/[id] |
| 5 | Course Calendar | /courses/[id]/calendar |
| 6 | Homework | /courses/[id]/homework |
| 7 | Exams | /courses/[id]/exams |
| 8 | Notes | /courses/[id]/notes |
| 9 | Teammates | /courses/[id]/teammates |
| 10 | Grades | /courses/[id]/grades |
| 11 | Weekly Planner | /planner |
| 12 | Personal Todo | /todo |
| 13 | Profile | /profile |

---

## 8. Notification System

- Vercel Cron Job runs every 5 minutes
- Endpoint: `/api/cron/notify` — protected by `CRON_SECRET`
- Queries `homework` and `todos` where `remind_at` is within next 5-minute window and `reminder_sent = false`
- Sends Telegram message via Bot API to user's `telegram_chat_id`
- Marks `reminder_sent = true` after sending

---

## 9. Design System — Deep Space Editorial

### Philosophy
Not just dark mode. A multi-layered atmospheric experience. Feels like the navigation deck of a starship. Vast negative space. Intentional asymmetry. Focus over density.

### Color Tokens
```
surface (background void):        #0F131F
surface-container-low (sections): #171B28
surface-container (cards):        #1B1F2C
surface-container-lowest (inputs):#0A0E1A
surface-container-highest (overlay): #313442

primary (violet):                 #D6BAFF
primary_container:                #7B5EA7
secondary (teal):                 #41E4C0
tertiary (amber):                 #FFB955
error (coral):                    #FF6B6B

on_surface (text primary):        #DFE2F3
on_surface_variant (text muted):  rgba(223,226,243,0.60)
outline_variant (ghost border):   #4A454F
```

### Typography
- **Headlines & Display:** Space Grotesk — geometric, authoritative
- **Body & Labels:** Manrope — humanist, readable in dark mode
- `letter-spacing: -0.02em` on large titles
- `letter-spacing: 0.05em` on small caps labels

### Rules — NEVER BREAK THESE
1. **No solid 1px borders for layout** — use background color shifts instead
2. **No pure white text** — always use `#DFE2F3`
3. **No sharp corners** — minimum 16px radius on cards, 12px on buttons
4. **No crowded screens** — when in doubt, add space
5. **No flat CTAs** — primary buttons use gradient `#D6BAFF → #7B5EA7` at 135deg

### Glassmorphism (modals, bottom nav, FABs)
```css
background: rgba(15, 19, 31, 0.60);
backdrop-filter: blur(20px);
border: 1px solid rgba(74, 69, 79, 0.20);
```

### Shadows (floating elements only)
```css
box-shadow: 0px 24px 48px rgba(0, 0, 0, 0.4);
```

### Component Rules
- Cards: `background #1B1F2C`, `border-radius 16px`, no dividers inside
- List items: `12px gap` between items, no dividers
- Active card: 2px left-edge glow in `primary` color, no border
- Input focus: border transitions to `#41E4C0` with outer glow
- Pulse indicator: `#41E4C0` dot with slow-pulsing 10% opacity ring
- Progress: circular thin stroke with teal gradient — no flat bars

---

## 10. Build Phases Overview

| Phase | Agent | Task |
|-------|-------|------|
| 1 | Claude Code | Foundation: Next.js setup, Supabase schema, Auth, PWA config |
| 2 | Codex | UI Kit: 10 reusable components |
| 3 | Claude Code | Courses: Galaxy + Hub + DB queries |
| 4 | Claude Code | Calendar: auto-generate occurrences, monthly/weekly view |
| 5 | Claude Code + Codex | Homework: list + form + reminders |
| 6 | Codex | Exams: list + countdown + readiness |
| 7 | Codex | Notes + Teammates + Grades |
| 8 | Claude Code | Weekly Planner: cross-course time grid |
| 9 | Claude Code + Codex | Personal Todo: categories + priority + reminders |
| 10 | Claude Code | Notifications: Telegram + Vercel Cron |
| 11 | Codex | Home Page: today's summary |
| 12 | Claude Code | PWA + Deployment |

---

## 11. Agent Rules

### Claude Code handles:
- Project setup and configuration
- Supabase schema, RLS, migrations
- Auth flow
- All database queries
- API routes
- Cron job
- Complex logic
- PWA config
- Vercel deployment

### Codex handles:
- Individual UI components
- Forms and simple pages
- Styling and Tailwind classes
- Small utility functions

### Both agents must:
- Report back in this exact format:
```
DONE: [what was completed]
FILES CREATED/MODIFIED: [list every file]
ISSUES: [any blockers or decisions needed]
NEXT: [what they suggest comes next]
```
- Never make architectural decisions alone
- Never skip a step
- Never assume — ask if unclear
