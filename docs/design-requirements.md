# GWTH.ai — Design Requirements

> A complete specification for designing and building all student-facing pages — both the public marketing site and the authenticated learning platform.
>
> **Audience for this document:** Claude Code or any developer building the GWTH v2 frontend.
>
> Last updated: 2026-02-19

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [User Roles & Access Control](#2-user-roles--access-control)
3. [Subscription & Payment Logic](#3-subscription--payment-logic)
4. [Content Model](#4-content-model)
5. [Scoring System](#5-scoring-system)
6. [Page Inventory — Public Pages](#6-page-inventory--public-pages)
7. [Page Inventory — Authenticated Pages](#7-page-inventory--authenticated-pages)
8. [User Flows](#8-user-flows)
9. [Feature Requirements](#9-feature-requirements)
10. [Copy & Messaging Guidelines](#10-copy--messaging-guidelines)
11. [Design System Reference](#11-design-system-reference)
12. [Appendix: Project & Lesson Inventory](#appendix-project--lesson-inventory)

---

## 1. Product Overview

GWTH.ai is a **single course** delivered over 3 months that teaches applied AI skills to non-technical people. Students learn to build apps, automate workflows, research faster, create content, analyse data, and solve real problems using AI — all in plain English, with no coding.

**Key facts:**
- One course, not a marketplace of courses
- 94 hands-on projects across 3 months (24 + 35 + 35)
- Every lesson ends with a project AND a video walkthrough by the instructor
- No coding required — everything done in plain English
- Content updated every day (not monthly or annually)
- Completely independent — no ads, sponsors, or vendor partnerships
- Tech Radar tracks 47+ AI tools daily across 16 categories

**Content model (production):** Single course with 3 monthly phases. The mock data for development may use multiple courses for UI testing, but the real site has one course.

---

## 2. User Roles & Access Control

There are **5 user states** that determine what a user can see and do. Every page and component must respect these states.

### 2.1 Visitor (not logged in)

**Can access:**
- Landing page (`/`)
- About page (`/about`)
- Pricing page (`/pricing`)
- Tech Radar (`/tech-radar`) — public, no login required
- Newsletter signup (`/newsletter`) — public, no login required
- Login (`/login`)
- Sign up (`/signup`)
- Forgot password (`/forgot-password`)

**Cannot access:**
- Labs (browsing or viewing)
- Syllabus / course content
- Dashboard
- Any authenticated page

**Key behaviour:**
- Attempting to visit any authenticated route redirects to `/login` with a `?redirect=` param
- The landing page, pricing page, and about page must sell the course without showing the full curriculum
- CTAs push toward free registration ("Create a free account to try the labs")

### 2.2 Registered User (free account, no subscription)

**Can access:**
- Everything a Visitor can, plus:
- Labs listing (`/labs`) — browse and complete free labs
- Lab viewer (`/labs/[slug]`) — full lab content for non-premium labs
- Dashboard (`/dashboard`) — shows labs progress, subscription CTA, study streak
- Profile (`/profile`)
- Settings (`/settings`)
- Bookmarks (`/bookmarks`) — for bookmarked labs
- Notifications (`/notifications`)

**Cannot access:**
- Course syllabus / lesson listing
- Any lesson content
- Course detail page content (beyond a teaser/upsell)
- Progress page (no course progress to show)

**Key behaviour:**
- Dashboard shows a prominent but non-aggressive subscription CTA
- Labs are the primary content available — positioned as a "try before you buy" experience
- Premium labs (`isPremium: true`) show a lock icon and subscription prompt
- The course card on the dashboard shows a blurred/teaser state with "Subscribe to unlock"

### 2.3 Subscriber — Month 1 (first payment of $37.50)

**Can access:**
- Everything a Registered User can, plus:
- Course detail page (`/course/[slug]`) — shows Month 1 sections and lessons only
- Month 1 lessons (`/course/[slug]/lesson/[lessonSlug]`) — all 24 lessons
- Progress page (`/progress`) — Month 1 progress data
- All labs (including premium)
- Full search results for Month 1 content

**Cannot access:**
- Month 2 lessons and sections (shown as locked with "Available after your second month")
- Month 3 lessons and sections (shown as locked with "Available after your third month")

**Key behaviour:**
- Course syllabus page shows Month 1 sections expanded/accessible, Month 2 and 3 collapsed with lock icons
- Month 2/3 section headers are visible (students can see what's coming) but lessons within are hidden
- The section title for Month 2 shows "Unlocks after your second payment" and Month 3 shows "Unlocks after your third payment"

### 2.4 Subscriber — Month 2 (second payment of $37.50)

**Can access:**
- Everything from Month 1, plus:
- Month 2 sections and lessons (20 mandatory + 15 optional)
- Month 2 progress data
- Month 2 industry specialisation selection

**Cannot access:**
- Month 3 lessons and sections (locked, "Available after your third month")

**Key behaviour:**
- Course syllabus page shows Month 1 and 2 sections accessible, Month 3 locked
- Optional lessons in Month 2 are clearly marked as optional with a different visual treatment
- Students choose 3-5 optional lessons based on their industry/goals

### 2.5 Subscriber — Month 3 (third payment of $37.50)

**Can access:**
- Full course content — all 3 months, all lessons, all optional content
- Full progress and scoring
- Certificate generation (upon completion)

### 2.6 Ongoing Subscriber ($7.50/month after Month 3)

**Can access:**
- Same as Month 3 subscriber — full course content
- Updated lessons and new content as it's published
- Dynamic score maintenance (score stays current)
- Certificate access

**Key behaviour:**
- Content continues to be updated daily. Students on ongoing access see new/updated lessons
- Their dynamic score reflects current tool landscape

### 2.7 Lapsed Subscriber (payment failed or cancelled)

**Grace period: 14 days** with email reminders at day 1, 7, and 12.

**During grace period:**
- Full access continues (read-only is confusing — just maintain access)
- A non-dismissable but non-blocking banner appears at the top: "Your payment method needs updating. Update payment to continue access."
- Reminders via email at day 1, 7, and 12

**After grace period:**
- Access reverts to Registered User level (labs only, no course content)
- Dashboard shows "Your subscription has lapsed" with a clear resubscribe CTA
- Progress data is preserved (not deleted) — restoring subscription restores access to all previously unlocked months
- Dynamic score freezes (stops updating, starts decaying)

---

## 3. Subscription & Payment Logic

### 3.1 Pricing

| Phase | Price | Duration | What unlocks |
|-------|-------|----------|-------------|
| Month 1 | $37.50/month | 1 month | 24 lessons + all labs |
| Month 2 | $37.50/month | 1 month | 35 additional lessons (cumulative with Month 1) |
| Month 3 | $37.50/month | 1 month | 35 additional lessons (full course unlocked) |
| Ongoing | $7.50/month | Recurring | Continued access to all content + updates |

### 3.2 Rules

- **No discount codes.** The price is the price. No coupon field anywhere in the UI.
- **No yearly pricing.** Monthly only. No annual plan option.
- **No bulk discounts.** Team pricing is the same per-person rate (see Enterprise section).
- **No free trial with credit card.** Free labs serve as the trial. No "7-day free trial" pattern.
- **No total price displayed.** Never show "$112.50 total" — only show the monthly price.
- **Cancel anytime.** One-click cancellation from settings. No retention dark patterns.
- **Resubscribe restores access.** If a user cancels and resubscribes, they regain access to all previously unlocked months. They don't re-pay for months already completed.

### 3.3 Enterprise / Teams

- Same per-person price ($37.50/mo × 3, then $7.50/mo)
- Teams of 5+ get an **enterprise admin dashboard** with:
  - Centralised billing
  - Employee progress tracking (completion rates, certification status)
  - Ability to designate which optional lessons are relevant for the organisation
  - Manager visibility into team AI capability
- Contact: teams@gwth.ai
- No self-serve team signup in v2 — handled via email contact

---

## 4. Content Model

### 4.1 Course Structure

```
Course (single course: "GWTH — Applied AI Skills")
├── Month 1: "From Zero to Building: AI for Your Life"
│   ├── Week 1: Quick Wins & Foundations (L1-L5) — 5 mandatory lessons
│   ├── Week 2: Content, Building & First Apps (L6-L10) — 5 mandatory lessons
│   ├── Week 3: Data, Agents & Automation (L11-L15) — 5 mandatory lessons
│   ├── Week 4: Family AI Bot Capstone (L16-L20) — 5 mandatory lessons
│   └── Week 5: Review & Optional Deep Dives (L21-L24) — 4 mandatory lessons
│   Total: 24 lessons, all mandatory
│
├── Month 2: "Building Real Apps & AI for Your Industry"
│   ├── 20 Mandatory Lessons (L1-L20)
│   │   ├── Week 1: Month 2 Toolkit (L1-L5)
│   │   ├── Week 2: Real Apps with AI (L6-L10)
│   │   ├── Week 3: RAG, Data & Intelligence (L11-L15)
│   │   └── Week 4: Capstone & Career (L16-L20)
│   └── 15 Optional Lessons
│       ├── Industry Verticals (O1-O7): Healthcare, Legal, Finance, Travel, Creative, Marketing, HR
│       ├── Advanced Technical (O8-O12): Full-stack, Advanced RAG, Multi-agent, Security, Collaboration
│       └── Career Accelerators (O13-O15): SaaS, Open-source, Portfolio & Interview
│   Total: 35 lessons (20 mandatory + 15 optional)
│   Students complete all 20 mandatory + 3-5 optional = 23-25 lesson experience
│
└── Month 3: "AI Transformation & Enterprise-Scale Solutions"
    ├── 20 Mandatory Lessons (L1-L20)
    │   ├── Week 1: Enterprise Foundations (L1-L5)
    │   ├── Week 2: Enterprise-Scale Building (L6-L10)
    │   ├── Week 3: Enterprise Automation & Governance (L11-L15)
    │   └── Week 4: Deployment & Leadership (L16-L20)
    └── 15 Optional Lessons
        ├── Enterprise Verticals (E1-E5): Financial Services, Healthcare, Public Sector, Manufacturing, Professional Services
        ├── Advanced Technical (E6-E10): Self-hosted Models, Voice AI, Security Red Teaming, Cost Optimisation, Compliance
        └── Leadership & Transformation (E11-E15): Internal Training, Consulting, Executive Advisory, Board Comms, Change Management
    Total: 35 lessons (20 mandatory + 15 optional)
```

### 4.2 Lesson Structure

Every lesson has three tabs in the viewer:

**Learn Tab:**
- Introductory video (instructor-led)
- Rich text content (markdown with code blocks highlighted via Shiki)
- Audio version (optional — for listening on the go)
- Resources (links, downloads, articles)

**Build Tab:**
- Build-along video (instructor builds the project step by step)
- Step-by-step written instructions
- The deliverable is a real, usable project (not a toy exercise)

**Quiz Tab:**
- Multiple-choice questions testing comprehension
- Immediate feedback with explanations
- Score contributes to dynamic scoring system
- Can be retaken (best score kept)

### 4.3 Capstone Projects

| Month | Capstone | Domain | Description |
|-------|----------|--------|-------------|
| 1 | Family AI Bot | familyaibot.com | Records family meetings → transcribes → extracts tasks, events, meals, shopping list → distributes automatically |
| 2 | AI Customer-Support Chatbot | askmyco.com | RAG-powered chatbot trained on company data, deployed on a real website |
| 3 | AI Readiness Assessment Tool | askevery.one | Voice agent that interviews organisations about AI maturity, generates transformation roadmaps |

### 4.4 Labs

Labs are standalone, hands-on projects separate from the course curriculum.

- **Free labs:** Available to all registered users (registration required)
- **Premium labs:** Require an active subscription
- Each lab has: title, description, difficulty, duration, technologies, learning outcomes, step-by-step instructions
- Duration: 30 minutes to 2 hours per lab
- Students keep everything they build

### 4.5 Tech Radar

A public-facing tool tracking 47+ AI tools across 16 categories:
- Updated daily via automated scanner
- Shows: tool name, category, status (GA/Beta/Alpha/Deprecated), cost tier, which lessons reference it
- Accessible to everyone (no login required)
- URL: `/tech-radar`

---

## 5. Scoring System

### 5.1 Dynamic Score

- Each lesson completed earns **1.5 points**
- Maximum score: ~100 (from mandatory lessons). Optional lessons can push above 100.
- **Score decays** if content is updated and the student hasn't reviewed the new version within 2 weeks
- This ensures scores reflect **current competence**, not historical achievement
- Employers/customers can trust the score because it's always current

### 5.2 Additional Metrics

| Metric | Description |
|--------|-------------|
| **AI Skill Percentile** | How the student's composite score compares to all other students |
| **Curiosity Index** | How often the student explores optional or advanced lessons |
| **Consistency Score** | How regularly the student learns and completes lessons (streak-based) |
| **Improvement Rate** | How the student's performance trends over time |

### 5.3 Display

- Scores are shown on the student's profile and progress page
- Can be shared to LinkedIn for employer/customer visibility
- The score badge should be visually distinctive and trustworthy-looking
- Show a breakdown of all 4 metrics, not just the overall score

---

## 6. Page Inventory — Public Pages

These pages are accessible to everyone (no login required).

### 6.1 Landing Page (`/`)

**Purpose:** Convert visitors to registered users or subscribers.

**Sections (in order):**

1. **Hero**
   - Headline: "Stop watching AI change the world. Start building with it."
   - Subheadline: Learn to build apps, automate workflows, research faster, create content, analyse data, and solve real problems using AI — all in plain English. No coding. No theory.
   - Subtext: One course. Three months to get started. Five hours a week. Updated every day so your skills never go stale.
   - Primary CTA: "Create Free Account" (leads to `/signup`)
   - Secondary CTA: "Explore the Tech Radar" (leads to `/tech-radar`)
   - Background: Cascading spiral windmill animation (see CLAUDE.md for spec)

2. **What You'll Build**
   - Section headline: "Three months from now, you will have built things most people think require a developer."
   - Intro: 94 projects across three months. Each with a hands-on project + instructor video walkthrough.
   - Month 1 card: "From Zero to Building" — 24 lessons, 24 projects, capstone: Family AI Bot
   - Month 2 card: "Real Business Applications" — 35 lessons, 35 projects, capstone: AI Customer-Support Chatbot
   - Month 3 card: "Enterprise AI & Multi-Agent Systems" — 35 lessons, 35 projects, capstone: AI Readiness Assessment Tool
   - **Important:** Show month summaries and capstone names, but do NOT show the full lesson list or syllabus. Keep curiosity high.

3. **Why GWTH** — Six differentiators
   - No coding required — and we mean it
   - Updated every day, not annually (Tech Radar scans 47+ tools daily)
   - Completely independent (no sponsors, no ads, no vendor partnerships)
   - Scores that employers can trust (dynamic scoring)
   - Designed by people who build this stuff — every day (25 years experience + AI-first from day one of Cursor and Claude Code)
   - We will hold your hand every step of the way (video walkthroughs on every lesson)

4. **Who This Is For** — Five audience segments
   - Worried AI will take your job
   - Made redundant and need to reskill fast
   - Run a company and need your team to keep up
   - Parent thinking about children's future
   - Run a small business and can't afford to fall behind

5. **Pricing**
   - $37.50/month for 3 months — full access
   - Then $7.50/month ongoing for updates and score maintenance
   - No yearly price. No lock-in. Cancel anytime.
   - Free labs to try first — no credit card required (just a free account)
   - **Never show a total price ($112.50). Only monthly figures.**

6. **Final CTA**
   - Headline: "The best time to learn AI was six months ago. The second best time is right now."
   - Primary CTA: "Create Free Account"
   - Secondary CTA: "Browse the Tech Radar"

**SEO:** Full metadata, Open Graph tags, JSON-LD structured data (`Course` schema).

### 6.2 About Page (`/about`)

**Purpose:** Build trust. Tell the GWTH story.

**Content:**
- Who built GWTH and why (25 years solution architecture + AI-first from day one)
- The independence promise (no ads, sponsors, vendor partnerships)
- The "agentic mindset" philosophy (prompt → evaluate → improve → repeat)
- The learning science behind 1 hour/day (Ericsson deliberate practice, spacing effect, Ebbinghaus forgetting curve, 5-Hour Rule)
- Why self-teaching with AI alone won't work (you don't know what you don't know; AI training data comes from outdated courses)

### 6.3 Pricing Page (`/pricing`)

**Purpose:** Clear pricing with no confusion.

**Content:**
- Single plan breakdown (no tiered comparison needed — it's one course):
  - $37.50/month for 3 months
  - $7.50/month ongoing after completion
- What's included (94 projects, video walkthroughs, dynamic scoring, Tech Radar access, daily updates)
- "No yearly price. We believe the course is good enough that you'll want to stay — but you're free to leave at any point."
- Free labs CTA for people not ready to subscribe
- Employer/team section (same per-person price, admin dashboard for teams of 5+, contact teams@gwth.ai)
- **No discount code field. No "enter promo code" anywhere.**

### 6.4 Employer/Teams Page (`/for-teams`)

**Purpose:** Sell GWTH to HR directors, team leaders, and business owners.

**Content (from `for-employers-and-teams.md`):**
- Business case: 34% better retention, 1.5x revenue growth for early AI adopters
- Why GWTH vs vendor training (vendor-neutral, dynamic scoring, daily updates)
- What teams learn per month (Month 1: personal AI mastery, Month 2: industry application, Month 3: enterprise transformation)
- How it works (5 hrs/week, self-paced, no prerequisites, progress tracking)
- Investment (same per-person price, enterprise admin dashboard for teams of 5+)
- FAQ section (displacement, data safety, ROI, non-technical suitability, vendor neutrality, pilot programs)
- CTA: "Try the free labs" + "Contact teams@gwth.ai"

### 6.5 Tech Radar (`/tech-radar`)

**Purpose:** Public reference tool. Builds trust and demonstrates expertise.

**Content:**
- Searchable/filterable grid of 47+ AI tools
- Categories (16): LLMs, Coding Agents, Image Generation, Automation, TTS, etc.
- For each tool: name, category, status (GA/Beta/Alpha/Deprecated), cost tier, brief description, which lessons reference it
- Daily update indicator ("Last scanned: [date]")
- No login required

### 6.6 Newsletter Signup (`/newsletter`)

**Purpose:** Low-friction email capture.

**Content:**
- One email per week: practical AI tip, Tech Radar updates, course news
- No spam, no sales pressure
- One-click unsubscribe
- Simple email input + submit button
- No login required

### 6.7 Auth Pages

**Login (`/login`):**
- Email + password form
- "Forgot password?" link
- "Don't have an account? Sign up" link
- Social login buttons (if implemented — design for it, wire later)

**Sign Up (`/signup`):**
- Name, email, password form
- Terms of service checkbox
- "Already have an account? Log in" link
- After signup: redirect to `/dashboard` (where labs are available)
- No credit card required at signup

**Forgot Password (`/forgot-password`):**
- Email input
- "Check your email" confirmation state

---

## 7. Page Inventory — Authenticated Pages

These pages require login. Access level varies by subscription state (see Section 2).

### 7.1 Dashboard (`/dashboard`)

**Purpose:** Home base after login. Shows what to do next.

**Layout:** Sidebar + header + content area.

**Content varies by user state:**

**For Registered (free) users:**
- Welcome message with name
- "Your Labs" section — grid of available free labs with progress indicators
- Subscription CTA card: "Unlock the full course — 94 projects, video walkthroughs, dynamic scoring" with "Subscribe" button
- Study streak calendar (tracks lab completions)
- Recent activity (labs started/completed)

**For Month 1 subscribers:**
- Course progress card with progress ring (% of Month 1 completed)
- "Continue where you left off" — link to current lesson
- Month 1 lesson grid with completion status
- Labs section
- Study streak calendar
- Upcoming: "Month 2 unlocks after your next payment" teaser card
- Dynamic score display

**For Month 2 subscribers:**
- Same as Month 1 plus Month 2 progress
- Industry specialisation selector (if not yet chosen)
- Optional lessons browsing

**For Month 3 / Ongoing subscribers:**
- Full course progress across all 3 months
- All scoring metrics (percentile, curiosity, consistency, improvement)
- Certificate status (if course completed)
- Updated/new content indicators

**For Lapsed subscribers:**
- Non-dismissable payment banner at top
- During grace period: full access with banner
- After grace period: reverts to Registered user view with "Resubscribe to restore access" CTA

### 7.2 Course Detail (`/course/[slug]`)

**Purpose:** Show the syllabus and track progress through the course.

**Access:** Subscribers only. Registered users see a teaser with subscription CTA.

**Layout:**

**For subscribers:**
- Course header: title, description, overall progress ring, total time spent
- Month tabs or sections: Month 1 | Month 2 | Month 3
- Each month shows:
  - Month title and description
  - Week groups (accordion/expandable)
  - Within each week: ordered lesson list with:
    - Lesson number and title
    - Duration
    - Status badge: completed (green check) / in-progress (blue dot) / available (grey) / locked (lock icon)
    - Quiz score (if completed)
  - Capstone project highlighted differently (larger card, more prominent)
- **Month gating:** Months the user hasn't paid for show a locked state:
  - Section header is visible (e.g., "Month 2: Building Real Apps & AI for Your Industry")
  - Tagline visible (e.g., "35 lessons. 35 projects. Choose your industry specialisation.")
  - Lessons within are HIDDEN (not just greyed out — not shown at all)
  - A message: "This month unlocks after your [second/third] payment."
  - A small "What you'll learn" summary (2-3 bullet points) to build anticipation
- Optional lessons (Month 2 & 3) have a distinct visual treatment:
  - Grouped separately from mandatory lessons
  - Tagged as "Optional"
  - Show industry/track labels (e.g., "Healthcare", "Advanced Technical", "Career Accelerator")
  - Recommendation: "Choose 3-5 optional lessons that match your goals"

**For registered (free) users:**
- Course header with blurred/teaser content
- "Subscribe to unlock the course" CTA
- Maybe show Month 1 section titles (no lesson details) as a teaser

### 7.3 Lesson Viewer (`/course/[slug]/lesson/[lessonSlug]`)

**Purpose:** The core learning experience. This is where students spend 80% of their time.

**Access:** Subscribers with access to the relevant month only.

**Layout:**
- **Left sidebar (desktop) / Sheet (mobile):** Course navigation tree
  - Sections → Lessons with progress dots
  - Current lesson highlighted
  - Completed lessons have green check
  - Locked lessons have lock icon (cannot navigate to them)
- **Main content area:** Three tabs
  - **Learn** — video player + rich text + audio player
  - **Build** — video player + step-by-step instructions
  - **Quiz** — interactive multiple choice with scoring
- **Bottom bar:**
  - Previous/Next lesson navigation
  - "Mark as Complete" button (optimistic UI with toast confirmation)
- **Notes panel:** Slide-out panel for personal annotations
  - Can be tied to video timestamps
  - Markdown support
  - Persisted per user per lesson

**Video player:**
- Lazy loaded (`next/dynamic`)
- Responsive aspect ratio
- Graceful fallback if video fails to load
- Both Learn and Build tabs have separate videos

**Quiz engine:**
- Multiple choice questions
- Immediate feedback after each answer (correct/incorrect + explanation)
- Overall score shown at end
- Can retake (best score kept)
- Confirm before submitting (`AlertDialog`)
- Score saved to progress

### 7.4 Labs Listing (`/labs`)

**Purpose:** Browse and filter available labs.

**Access:** Registered users and above.

**Layout:**
- Grid of lab cards
- Filters: difficulty (beginner/intermediate/advanced), category, technology, search
- Filters sync to URL params (shareable/bookmarkable filtered views)
- Each lab card shows: title, description snippet, difficulty badge, duration, tech stack pills, category
- Premium labs show a lock icon for free users with "Subscribe to unlock"
- Empty state if no labs match filters

### 7.5 Lab Viewer (`/labs/[slug]`)

**Purpose:** Complete a hands-on lab.

**Access:** Registered users for free labs. Subscribers for premium labs.

**Layout:**
- Lab header: title, description, difficulty, duration, technologies, learning outcomes
- Step-by-step instructions with step tracker (progress through steps)
- Main content area with markdown instructions
- Resources sidebar/section
- "Mark Step Complete" per step
- "Mark Lab Complete" at the end

### 7.6 Progress Page (`/progress`)

**Purpose:** Detailed analytics on learning progress.

**Access:** Subscribers only.

**Layout:**
- **Overall progress section:**
  - Course progress ring (overall %)
  - Lessons completed / total
  - Time spent total
  - Current month indicator
- **Dynamic score section:**
  - Overall score (large, prominent)
  - AI Skill Percentile
  - Curiosity Index
  - Consistency Score
  - Improvement Rate
  - Score history chart (line chart over time)
- **Monthly breakdown:**
  - Month 1 / 2 / 3 progress bars
  - Per-week completion rates
  - Quiz scores per lesson
- **Study streak:**
  - Current streak (days)
  - Longest streak
  - GitHub-style yearly activity heatmap
- **Certificates:**
  - If course completed: certificate card with download link
  - If not completed: progress toward certificate with requirements

### 7.7 Profile Page (`/profile`)

**Purpose:** User profile and public-facing information.

**Access:** All authenticated users.

**Layout:**
- Avatar (upload/change)
- Name, email, bio
- Subscription status
- Dynamic score (if subscriber) — with "Share to LinkedIn" button
- Completed labs and courses
- Member since date

### 7.8 Settings Page (`/settings`)

**Purpose:** Account management.

**Access:** All authenticated users.

**Layout:**
- **Account:** Name, email, password change
- **Subscription:**
  - Current plan status
  - Payment method
  - Next billing date
  - Cancel subscription button (with confirmation dialog — no dark patterns)
  - For lapsed: "Resubscribe" CTA
- **Preferences:**
  - Theme toggle (light/dark/system)
  - Email notification preferences (weekly digest, lesson reminders, new content alerts)
  - Study reminder settings (time of day, days of week)
- **Data:**
  - Export my data
  - Delete account (with serious confirmation — this is destructive)

### 7.9 Bookmarks Page (`/bookmarks`)

**Purpose:** Saved lessons and labs for quick access.

**Access:** All authenticated users.

**Layout:**
- Two sections: Bookmarked Lessons / Bookmarked Labs
- Each item shows: title, status, when bookmarked
- Click navigates to the lesson/lab
- "Remove bookmark" button
- Empty state: "No bookmarks yet. Bookmark lessons and labs to find them here."

### 7.10 Notifications Page (`/notifications`)

**Purpose:** Notification center.

**Access:** All authenticated users.

**Types:**
- **Achievement:** "You completed Month 1!" / "5-day study streak!" / "New high score on L8 quiz"
- **Reminder:** "You haven't studied in 3 days" / "New content available in L12"
- **Announcement:** "New lab published: Build a Personal CRM" / "Tech Radar update: GPT-5.4 released"

**Layout:**
- Chronological list
- Unread indicator (bold + dot)
- "Mark all as read" button
- Filter by type (achievement/reminder/announcement)
- Click navigates to relevant content

### 7.11 Search (`Cmd+K` / `Ctrl+K`)

**Purpose:** Quick navigation to any content.

**Access:** All authenticated users. Results filtered by access level.

**Layout:**
- Command palette (shadcn Command component)
- Searches: lessons (if subscriber), labs, settings pages
- Shows: title, type badge, status
- Keyboard navigable
- Results respect access control (free users don't see lessons in results)

---

## 8. User Flows

### 8.1 Visitor → Registered User

```
Landing Page → "Create Free Account" CTA → /signup
→ Fill form (name, email, password) → Submit
→ Email verification (optional — design for it, implement later)
→ Redirect to /dashboard
→ Dashboard shows: labs available, subscription CTA
```

### 8.2 Registered User → Month 1 Subscriber

```
Dashboard or Pricing page → "Subscribe" CTA
→ Payment form (card details, $37.50/month)
→ Payment success → redirect to /dashboard
→ Dashboard shows: Month 1 course content unlocked
→ "Start Lesson 1" CTA
```

### 8.3 Month 1 → Month 2 (automatic)

```
Second monthly payment processes automatically
→ Month 2 content unlocks
→ Notification: "Month 2 is now available!"
→ Dashboard updates to show Month 2 sections
→ Course detail page unlocks Month 2 lessons
```

### 8.4 Month 3 → Ongoing

```
Third monthly payment processes → full course unlocked
→ Fourth payment is $7.50 (reduced rate)
→ Student notified of rate change: "Your monthly rate drops to $7.50 starting next month"
→ Ongoing: access to all content + daily updates
```

### 8.5 Subscriber → Lapsed

```
Payment fails → grace period starts (14 days)
→ Banner appears: "Update your payment method"
→ Email reminder: day 1, 7, 12
→ If payment updated during grace: access continues seamlessly
→ If grace period expires: access reverts to Registered level
→ "Resubscribe" CTA on dashboard
→ Resubscribing restores access to all previously unlocked months
```

### 8.6 Lesson Completion Flow

```
Student opens lesson → Learn tab (video + content)
→ Switches to Build tab → follows instructions → builds project
→ Switches to Quiz tab → answers questions → sees score
→ Clicks "Mark as Complete" → optimistic UI update → toast: "Lesson completed!"
→ Progress updates → score recalculates
→ "Next Lesson" button appears → navigates to next
```

---

## 9. Feature Requirements

### 9.1 Study Streak

- Track consecutive days with at least one lesson or lab completed
- Display: current streak, longest streak, weekly activity (7-day view), yearly heatmap (GitHub-style)
- Achievement notifications at milestones (7 days, 30 days, etc.)
- Visible on dashboard and progress page

### 9.2 Dynamic Score

- Calculated from lesson completions and quiz scores
- Decays when content is updated and student hasn't reviewed within 2 weeks
- Displayed prominently on dashboard, progress page, and profile
- "Share to LinkedIn" functionality
- Score badge design should look trustworthy and professional

### 9.3 Video Walkthroughs

- Every lesson has TWO videos: an intro (Learn tab) and a walkthrough (Build tab)
- The walkthrough shows the instructor building the project step by step
- This is a core differentiator — emphasise it in the UI ("Watch the instructor build it")
- Lazy loaded with skeleton fallback
- Graceful error handling if video unavailable

### 9.4 Notes

- Students can annotate any lesson with personal notes
- Notes can be tied to video timestamps
- Markdown support
- Persisted per user per lesson
- Accessible via a slide-out panel in the lesson viewer

### 9.5 Bookmarks

- Save/unsave any lesson or lab
- Optimistic UI with toast feedback
- Accessible from the bookmarks page
- Show bookmark count on dashboard

### 9.6 Notifications

- Three types: achievement, reminder, announcement
- Bell icon with unread count in the header
- Full notification center page
- Email notifications (configurable in settings)

### 9.7 Search (Cmd+K)

- Command palette triggered by keyboard shortcut
- Searches lessons (title, description), labs, settings pages
- Results filtered by access level
- Fast, fuzzy matching
- Recently visited items shown by default

### 9.8 Optional Lesson Selection (Month 2 & 3)

- Students choose 3-5 optional lessons from available tracks
- Tracks: Industry Verticals, Advanced Technical, Career Accelerators (Month 2); Enterprise Verticals, Advanced Technical, Leadership & Transformation (Month 3)
- Selection UI: grouped by track, with descriptions
- Can change selections at any time
- Selected optionals appear in course navigation alongside mandatory lessons
- Unselected optionals remain browsable but visually de-emphasised

### 9.9 Certificate

- Generated when student completes all mandatory lessons + passes all quizzes
- Downloadable PDF
- Shareable link for verification
- Shows: student name, completion date, overall score, percentile

---

## 10. Copy & Messaging Guidelines

### 10.1 Tone

- Conversational but professional
- Honest — never over-promise
- Empowering — put the user in control
- No emojis (unless user content)
- No hype words ("revolutionary", "game-changing")
- British English throughout (organisation, colour, analyse, etc.)

### 10.2 Key Messages to Reinforce

These messages should be consistently reinforced across the UI:

1. **No coding required** — "Everything in plain English"
2. **94 hands-on projects** — not quizzes or theory
3. **Video walkthroughs on every lesson** — "You're never left guessing"
4. **Updated every day** — "Your skills never go stale"
5. **Completely independent** — "No sponsors, no bias"
6. **5 hours per week** — "One hour a day, backed by learning science"
7. **Dynamic scoring** — "Employers can trust your score because it's always current"

### 10.3 Audience-Specific Messaging

When messaging touches these audiences, use these angles:

| Audience | Key angle |
|----------|-----------|
| Worried about job loss | "The person who knows how to use AI will be more productive" |
| Made redundant | "Skills that make you hirable now. Every project goes in your portfolio." |
| Business owners | "Your competitors are already using AI. 5 hours/week to catch up." |
| Parents | "AI fluency will be table stakes. No coding needed." |
| Employers | "Companies investing in AI training retain 34% more staff." |

### 10.4 What NOT to Say

- Never mention a total course price ($112.50)
- Never use "free trial" — say "free labs" instead
- Never show the full lesson list to non-subscribers (maintain curiosity)
- Never use scare tactics without following up with empowerment
- Never reference specific competitor courses by name
- Never promise specific salary/job outcomes

---

## 11. Design System Reference

The full design system is defined in `src/app/globals.css` and documented in `CLAUDE.md`. Key points for page design:

### 11.1 Colors (OKLCH)

| Role | Light Mode | Dark Mode ("Graphite Warm") |
|------|-----------|---------------------------|
| Background | `oklch(0.98 0 0)` near-white | `oklch(0.17 0.005 60)` warm charcoal |
| Foreground | `oklch(0.18 0.04 175)` dark teal | `oklch(0.93 0.008 60)` warm off-white |
| Primary | `oklch(0.7 0.18 220)` bright aqua | `oklch(0.75 0.16 220)` lighter aqua |
| Accent | `oklch(0.65 0.16 165)` mint green | `oklch(0.75 0.14 165)` lighter mint |
| Card | `oklch(1 0 0)` white | `oklch(0.21 0.005 60)` slightly lighter than bg |
| Destructive | Red | Red |
| Success | Green | Green |
| Warning | Amber | Amber |

### 11.2 Typography

- **Body & Headings:** Inter (variable, `--font-inter`)
- **Code blocks:** JetBrains Mono (variable, `--font-jetbrains`)
- Loaded via `next/font/google` for zero layout shift

### 11.3 Layout

- Sidebar: 280px (collapsed: 64px)
- Header: 64px
- Content max-width: 1400px
- Corners: 0.625rem radius
- Shadows: subtle

### 11.4 Status Colors

| Status | Color |
|--------|-------|
| Completed | Green (success) |
| In-progress | Aqua (primary) |
| Available / Not started | Grey (muted) |
| Locked | Dark grey with lock icon |

### 11.5 Grade Colors

| Grade | Color |
|-------|-------|
| A (90-100) | Green |
| B (80-89) | Mint |
| C (70-79) | Amber |
| D (60-69) | Orange |
| F (<60) | Red |

### 11.6 Animation

- Use Motion (motion.dev) for transitions and interactions
- Keep animations subtle and purposeful
- Respect `prefers-reduced-motion`
- Landing page: cascading spiral windmill background (see CLAUDE.md for full spec)
- Dashboard: progress ring animations, staggered card loading
- Lesson viewer: smooth tab transitions, sidebar collapse/expand

### 11.7 Components

Use shadcn/ui as the component foundation. Key custom components:
- `CourseCard` — thumbnail, title, progress bar, lesson count
- `ProgressRing` — circular SVG with Motion animation
- `StatusBadge` — colored badge with icon + text
- `StudyStreakCalendar` — GitHub-style activity heatmap
- `EmptyState` — icon, title, description, CTA
- `BookmarkButton` — toggle with optimistic UI
- `SearchPalette` — Cmd+K command palette
- `QuizEngine` — interactive quiz with scoring
- `VideoPlayer` — lazy-loaded video embed
- `AudioPlayer` — inline audio with playback speed
- `MarkdownRenderer` — lesson content with Shiki code blocks
- `NotesPanel` — slide-out annotations panel
- `Spinner` / `PageSpinner` — dual-ring loading indicators
- `RouteProgress` — top-of-page navigation progress bar

---

## Appendix: Project & Lesson Inventory

### Capstone Projects by Month

| Month | Project | Domain | Description |
|-------|---------|--------|-------------|
| 1 | Family AI Bot | familyaibot.com | Records meetings → transcribes → extracts tasks, calendar events, meal plans, shopping lists → distributes automatically |
| 2 | AI Customer-Support Chatbot | askmyco.com | RAG-powered chatbot trained on company data with citation-backed answers |
| 3 | AI Readiness Assessment Tool | askevery.one | Voice agent that interviews organisations about AI maturity and generates transformation roadmaps |

### Smaller Projects (Selection)

| Month | Project | Domain | Description |
|-------|---------|--------|-------------|
| 1 | Superwhisper Clone | lowhisper.com | Private speech-to-text tool |
| 1 | Blog Post Writer | blogbot.app | AI agents that write posts from YouTube/tweets |
| 1 | Prompt Saver | cheatprompt.dev | Save, organise, and share AI prompts |
| 1 | Research Comparison Site | bestrobotmop.com | AI-powered product comparison website |
| 1 | Brag Manager | bragmanager.com | Professional accomplishments tracker |
| 1 | Blog Site | eyeonai.dev | AI news blog with AI-assisted publishing |
| 1 | Deck Creator | firstcalldeck.com | Research to slide deck automation |
| 1 | Goal Planner | goalsfor.me | AI-assisted personal goal planning |
| 1 | Grocery Agent | groceryshoppingagent.com | AI grocery list builder from meal plans |
| 1 | Recipe Unboxer | recipeunboxed.com | Extract ingredients from recipes into shopping lists |
| 2 | Sleep Music | talktosleep.com | AI-generated sleep music with Spotify distribution |
| 2 | SEO for AI | sitegeo.net | SEO strategies for AI-first search |
| 2 | C. Diff Guide | cdiffguide.com | Medical research aggregator for C. difficile |
| 2 | Employment Law Buddy | employmentlawbuddy.com | AI legal research for employment law |
| 2 | Health Logger | healthlog.app | Health tracking with AI insights |
| 2 | Hybrid Whiteboard | whiteboard.bot | Camera-to-screen whiteboard sharing |
| 2 | Share Trajectory | sharetrajectory.com | AI-powered stock analysis and recommendations |
| 2 | Travel Planner | stagsguide.co.uk | AI travel planning for group events |
| 2 | Video CV | myvideo.cv | CV-to-video conversion service |
| 3 | Transformation Planner | productarchitect.dev | AI business transformation roadmap generator |
| 3 | Idea Grading | ideagrading.com | AI tool to evaluate and rank transformation ideas |
| 3 | Transcript RAG | aitranscriptionhub.com | Company RAG system for meeting transcripts |

### Month 1 Lesson Titles (24 lessons)

| # | Title | Duration |
|---|-------|----------|
| L1 | Welcome to GWTH — What AI Can Actually Do For You | 45 min |
| L2 | Your AI Toolkit — Set Up Once, Use Forever | 45 min |
| L3 | Getting Great Results — The Prompting Skills That Matter | 60 min |
| L4 | AI Safety in 60 Seconds — Just the Rules That Matter | 30 min |
| L5 | Research with AI — Find Anything, Fast | 45 min |
| L6 | Content Creation — Write Anything, Fast | 45 min |
| L7 | Content Creation — Images, Audio & Video | 45 min |
| L8 | Build Your First App — The Moment Everything Changes | 60 min |
| L9 | Build Something Bigger — Tools That Solve Real Problems | 60 min |
| L10 | Build Your First Website | 60 min |
| L11 | Data Analysis — Ask Questions, Get Answers | 60 min |
| L12 | Build a Dashboard — Your Data, Visualised | 60 min |
| L13 | AI Agents — Your New Digital Assistants | 45 min |
| L14 | Custom GPTs and Project-Specific AI | 45 min |
| L15 | Automation Basics — Make AI Work While You Sleep | 60 min |
| L16 | Family AI Bot — Plan & Design (Capstone Pt.1) | 45 min |
| L17 | Family AI Bot — Record & Transcribe (Capstone Pt.2) | 60 min |
| L18 | Family AI Bot — Process & Extract (Capstone Pt.3) | 60 min |
| L19 | Family AI Bot — Distribute & Automate (Capstone Pt.4) | 60 min |
| L20 | Family AI Bot — Polish & Present (Capstone Pt.5) | 45 min |
| L21 | Portfolio Review — Show Off What You've Built | 45 min |
| L22 | Advanced Building — When Simple Isn't Enough | 60 min |
| L23 | OpenClaw Deep Dive — Power and Responsibility | 60 min |
| L24 | Content Systems — From One-Off to Pipeline | 60 min |

### Month 2 Topics (20 mandatory + 15 optional)

**Mandatory (20):** Month 2 toolkit setup, development environment, language selection, context engineering, security fundamentals, Cursor deep dive, Claude Code mastery, business tools, APIs & integrations, Cowork automation, RAG explained, building RAG apps, business dashboards, advanced automation, multi-agent introduction, content systems at scale, capstone planning, capstone build & deploy, teams & business case, portfolio review.

**Optional Industry Verticals (7):** Healthcare AI, Legal AI, Finance AI, Travel & Events AI, Creative AI, Marketing AI, HR AI.

**Optional Advanced Technical (5):** Full-stack databases, Advanced RAG, Multi-agent orchestration, Security hardening, Real-time collaboration.

**Optional Career Accelerators (3):** SaaS productisation, Open-source contribution, Portfolio & interview prep.

### Month 3 Topics (20 mandatory + 15 optional)

**Mandatory (20):** Enterprise foundations, transformation mindset, model selection, self-hosted AI, cost management, enterprise-scale apps, multi-tenant systems, enterprise integrations, advanced agents, workflow orchestration, enterprise automation, governance frameworks, OWASP AI Top 10, data pipelines, ROI measurement, deployment strategies, internal training design, leadership skills, transformation roadmap, final capstone.

**Optional Enterprise Verticals (5):** Financial services, Healthcare, Public sector, Manufacturing, Professional services.

**Optional Advanced Technical (5):** Self-hosted model deployment, Voice AI agents, Security red teaming, Cost optimisation at scale, Compliance automation.

**Optional Leadership (5):** Internal training programme design, Consulting practice, Executive advisory, Board-level communication, Change management.
