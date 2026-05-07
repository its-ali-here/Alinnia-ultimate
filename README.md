# Alinnia

A **renovation analysis and project guidance tool** built for UK homeowners planning a remodel.

---

## Overview

Alinnia helps homeowners understand exactly what they can achieve with their budget — before they spend a penny. Users upload photos of their current space and an inspiration image, share their measurements and budget, and receive an AI-powered feasibility analysis in seconds.

The paid product unlocks a complete, room-specific renovation guide plus a project tracker to manage the work from quote to completion.

---

## The Problem

Homeowners starting a renovation face:

- No idea whether their budget is realistic for the look they want
- Overwhelming contractor quotes with no benchmark to compare against
- No clear sequence for what needs to happen and in what order
- Wasted time getting quotes before understanding scope
- Expensive surprises once work has started

Existing tools are either aimed at contractors (Buildertrend, Procore) or too generic to be useful (spreadsheets, Pinterest boards).

---

## The Solution

Alinnia gives homeowners clarity before they commit.

**Free tier — the analysis:**
1. Upload photos of the current space and an inspiration image
2. Enter room dimensions (length × width × height in metres)
3. Enter budget and location (city + UK country)
4. Receive an AI feasibility report: achievable %, what fits in budget, what doesn't

**Paid tier — the guide (£79 one-time):**
- Exact materials list with quantities and UK cost estimates
- Step-by-step work sequence in the correct trade order
- Which contractors to hire and when
- What to ask for quotes — and what a fair price looks like in their area
- Red flags checklist before signing anything
- Full project tracker: timeline, budget builder, punch list, files

---

## User Flow

```
Landing page
    ↓
Wizard (anonymous — no account required)
  Step 1: Room type + project name
  Step 2: Upload current photos + inspiration photo
  Step 3: Room measurements (L × W × H in metres)
  Step 4: Budget (GBP) + UK country + city
  Step 5: Review → "Analyse my space"
    ↓
AI analysis (Groq LLaMA) runs in ~15 seconds
    ↓
Results page (free — no account)
  - Feasibility % + progress bar
  - What fits / what won't fit
  - £79 guide paywall card
    ↓
"Start 3-day free trial" → Registration page
  - Name + email → Supabase magic link sent
    ↓
Email → click link → Set password page
    ↓
Dashboard (project auto-linked to new account)
  - Overview: feasibility card, budget remaining, project stage, contractor slots, next steps
  - Timeline: vertical step-by-step renovation stages
  - Budget builder: donut ring + variant selection per category
  - Punch list, Files, Close-out, Settings
```

---

## Core Features

### Analysis Engine
- AI feasibility scoring based on budget, location, room type, and dimensions
- What fits vs. what doesn't fit the budget
- Fallback heuristics if AI call fails (no broken experience)

### Budget Builder
- Donut ring chart showing budget split across categories (flooring, walls, kitchen, bathrooms, MEP, structural)
- 7 categories × 3–6 finish tier variants each
- All priced in £/m² with UK market benchmarks
- Live total vs. budget health bar (green → amber → red)
- Pre-filtered by room type (bathroom only shows relevant categories)

### Renovation Timeline
- Vertical step-by-step stage view — not a Gantt chart
- Stages sourced from the AI guide if purchased, or from room-type defaults
- Current stage highlighted with "You are here" badge
- Progress bar across all stages

### Project Tracker Dashboard
- Overview card: feasibility summary, budget remaining, project stage (Planning → Getting quotes → Underway → Done), pre-seeded contractor slots, contextual next-steps checklist
- All data pre-populated from the wizard — never an empty state

### Authentication
- Anonymous analysis (no account until payment)
- Magic link sign-up post-analysis
- Session-based project linking: anonymous project is claimed when the user creates their account

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Database & Auth | Supabase (PostgreSQL + Supabase Auth) |
| AI | Groq API (LLaMA 3.3 70B) via Vercel AI SDK |
| Styling | Tailwind CSS + Radix UI primitives (shadcn/ui) |
| Charts | Recharts |
| Animations | Framer Motion |
| Email | Supabase Auth (magic link) + Zeptomail SMTP |
| Hosting | Vercel (planned) |

---

## Database Schema (key tables)

| Table | Purpose |
|---|---|
| `projects` | Core project record — links user, room type, budget, location, guide status |
| `project_images` | Current + inspiration photos uploaded in wizard |
| `renovation_analyses` | AI-generated feasibility results per project |
| `renovation_guides` | Full paid guide content (materials, sequence, contractors, etc.) |
| `payments` | Payment records (Stripe placeholder — provider TBD) |
| `expenses` | Logged costs during active renovation |
| `phases` | Project phases for timeline and punch list |
| `tasks` | Individual tasks within phases |
| `price_intelligence` | UK regional material and labour pricing data |

---

## Pricing

| Tier | Price |
|---|---|
| Analysis | Free — no account required |
| Complete renovation guide + project tracker | £79 one-time |

3-day free trial. Cancel before day 3, pay nothing.

---

## Target Market

- UK homeowners planning a renovation with a budget of £8,000+
- Room types: bathroom, kitchen, bedroom, living room, full-home, extension, outdoor
- Primary focus: England, Scotland, Wales, Northern Ireland
- International expansion planned after UK validation

---

## Status

Active development. Core flow complete:

- [x] Anonymous wizard (room type, photos, measurements, budget, location)
- [x] AI feasibility analysis
- [x] Results page with paywall
- [x] Magic link sign-up flow
- [x] Project auto-linking after auth
- [x] Dashboard: overview, timeline, budget builder, punch list, files
- [ ] Payment provider integration (TBD)
- [ ] Guide generation post-payment
- [ ] Price intelligence data population (UK)
- [ ] Landing page refresh
- [ ] Mobile optimisation pass
