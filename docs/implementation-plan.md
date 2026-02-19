# GWTH v2 — Implementation Plan (Design Phase)

## Overview

Rebuild the GWTH v2 frontend to match the design requirements, marketing copy, and tech radar data. This is **design only** — no backend, auth, or payment implementation.

**Source documents:**
- `docs/design-requirements.md` — Full design spec
- `docs/marketing/` — Landing page copy, social media, employer page, newsletter
- `docs/tech_radar.json` — 47+ AI tools tracked daily

---

## Checkpoint 1: Foundation (Types, Auth, Config, Dev Toolbar) - COMPLETE

### Changes Made
- **`src/lib/types.ts`** — Added `SubscriptionState` (7 states), `DynamicScore`, `TechRadarTool`, `MonthConfig` interfaces. Updated `User` to replace `plan` with `subscriptionState`, `subscriptionMonth`, `gracePeriodEnds`, `lastPaymentDate`. Added `month`, `isOptional`, `optionalTrack` to `CourseSection`, `LessonSummary`, and `Lesson`.
- **`src/lib/config.ts`** — Added pricing constants ($37.50/mo course, $7.50/mo ongoing), grace period, score decay, `MONTH_CONFIGS` array, teams email, dev toolbar flag.
- **`src/lib/auth.ts`** — Updated mock user, added `canAccessMonth()`, `canAccessLabs()`, `canAccessPremiumLabs()`, `canAccessCourse()`, `isInGracePeriod()`, `getAccessibleMonthCount()`.
- **`src/components/dev/state-switcher.tsx`** — NEW: Floating toolbar for switching subscription states during development. Uses `useSyncExternalStore` for localStorage reads.
- **`src/providers/root-provider.tsx`** — Added DevStateSwitcher.

---

## Checkpoint 2: Mock Data Overhaul - COMPLETE

### Changes Made
- **`src/lib/data/mock-data.ts`** — Complete rewrite:
  - Single GWTH course: "GWTH — Applied AI Skills" with 19 sections across 3 months
  - Month 1: 5 weekly sections, 24 mandatory lessons (real titles from syllabus)
  - Month 2: 4 mandatory + 3 optional track sections (Industry Verticals, Advanced Technical, Career Accelerators)
  - Month 3: 4 mandatory + 3 optional track sections (Enterprise Verticals, Advanced Technical, Leadership & Transformation)
  - 3 full lesson objects with real GWTH content for the lesson viewer
  - 5 GWTH-style labs (plain English, no coding required)
  - Dynamic score mock data (18/36 score, 72nd percentile, 30-day history)
  - Updated progress, bookmarks, notes, notifications
- **`src/lib/data/tech-radar.ts`** — NEW: Loads tools from `docs/tech_radar.json`, exports `getTechRadarTools()`, `getTechRadarCategories()`, `getTechRadarToolCount()`, `getTechRadarLastUpdated()`.

---

## Checkpoint 3: Public Pages - COMPLETE

### Changes Made
- **`src/components/landing/hero-section.tsx`** — Rewritten with GWTH copy ("Stop watching AI change the world. Start building with it."), stats, CTAs
- **`src/app/(public)/page.tsx`** — Full landing page: Hero, What You'll Build (3 month cards), Why GWTH (6 differentiators), Who This Is For (4 audiences), Pricing, Final CTA, JSON-LD
- **`src/app/(public)/pricing/page.tsx`** — Single-course pricing, no tiers, free labs CTA, For Teams section
- **`src/app/(public)/about/page.tsx`** — Full About page: Hero, GWTH Story, Philosophy (3 principles), Independence Pledge, What Makes Us Different (4 cards), The Numbers, CTA
- **`src/app/(public)/tech-radar/page.tsx`** — Server component with stats bar (tools tracked, categories, last updated), JSON-LD structured data
- **`src/components/tech-radar/tech-radar-grid.tsx`** — Client component: search, category/status/cost/hot filters, responsive card grid with status badges, version info, external links, tags
- **`src/app/(public)/newsletter/page.tsx`** — Newsletter signup: "The GWTH Weekly" with email form, what's included, what's not, CTAs
- **`src/app/(public)/for-teams/page.tsx`** — Teams landing page: business case stats, 5 differentiators, 3-month overview, how it works, investment (pricing from config), 6 FAQs, contact CTA
- **`src/components/layout/public-nav.tsx`** — Updated links: About, Pricing, For Teams, Tech Radar
- **`src/components/layout/footer.tsx`** — Updated links: Product (Pricing, For Teams, Tech Radar), Learn (Free Labs, Newsletter, About GWTH), Legal

---

## Checkpoint 4: Dashboard & Authenticated Pages - COMPLETE

### Changes Made
- **`src/components/layout/sidebar.tsx`** — Changed "Courses" nav item to "The Course" linking to `/course/applied-ai-skills`
- **`src/app/(dashboard)/dashboard/page.tsx`** — Full rewrite with subscription-aware views:
  - Lapsed: Warning card with "Update Payment" CTA
  - Subscriber: ProgressRing, course progress bar, month progress indicators (3 cards per MONTH_CONFIGS)
  - Free user: Course teaser with Lock icon, subscribe CTA ($37.50/mo), quick links to Free Labs and Tech Radar
  - Study streak calendar, notifications, bookmarks sections
- **`src/app/(dashboard)/course/[slug]/page.tsx`** — Full rewrite with month gating:
  - Sections grouped by month with headers ("Month 1: From Zero to Building")
  - Locked badge for inaccessible months
  - Mandatory/optional lesson counts
  - Optional lessons show track name as Badge
  - Locked lessons show Lock icon, accessible lessons are clickable Links
  - Capstone callout card at end of each month
- **`src/lib/data/progress.ts`** — Added `getDynamicScore()` function
- **`src/app/(dashboard)/progress/page.tsx`** — Full rewrite:
  - Dynamic Score card with gradient: overall score, percentile, curiosity, consistency, improvement rate
  - Stats grid: completed lessons, time spent, streak, avg quiz score
  - Study streak calendar
  - Course progress with ProgressRing
  - Certificates section
  - Quiz scores with grades
  - All links point to `/course/applied-ai-skills` (single course model)
- **`src/app/(dashboard)/settings/page.tsx`** — Added subscription management section:
  - Current plan display with badge (based on subscription state)
  - Lapsed warning with "Update Payment Method" CTA
  - Payment info (last payment date)
  - Free user upsell to pricing page
  - Appearance and notification settings preserved

---

## Checkpoint 5: Quality - COMPLETE

### Results
- **TypeScript**: `npx tsc --noEmit` — 0 errors
- **ESLint**: `npx eslint .` — 0 errors, 0 warnings
- **Vitest**: `npx vitest run` — 32/32 tests pass (5 suites)
- Fixed state-switcher to use `useSyncExternalStore` instead of `setState` in effect
- Cleaned up all unused imports and variables across the codebase

---

## Key Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Course model | Single course, 3 months | Matches GWTH business model |
| Subscription states | 7 states (visitor → ongoing/lapsed) | Every page/component respects these |
| Content gating | Month-based | Month 1 after 1st payment, Month 2 after 2nd, etc. |
| Optional lessons | Track-based (Industry, Technical, Career) | Months 2 & 3 only |
| Dynamic scoring | 1.5 pts/lesson, decay after 14 days | Encourages staying current |
| Pricing display | No total, no discount codes, no yearly | Keeps messaging honest per design-requirements |
| Labs | Free for registered users, premium labs for subscribers | Drives registrations |
| Tech Radar | Public page, filterable grid | 47+ tools from tech_radar.json |
| Dev toolbar | Floating bottom-left, dev-only | Test all subscription states easily |

---

## File Summary — All Files Modified/Created

### New Files
| File | Description |
|------|-------------|
| `src/app/(public)/about/page.tsx` | About page with story, philosophy, independence pledge |
| `src/app/(public)/tech-radar/page.tsx` | Tech Radar with stats and server-side data fetching |
| `src/app/(public)/newsletter/page.tsx` | Newsletter signup ("The GWTH Weekly") |
| `src/app/(public)/for-teams/page.tsx` | Teams/employer landing page with pricing, FAQ |
| `src/components/tech-radar/tech-radar-grid.tsx` | Client-side filterable tool card grid |
| `src/components/dev/state-switcher.tsx` | Dev toolbar for subscription state switching |
| `src/lib/data/tech-radar.ts` | Data functions for tech radar tools from JSON |
| `docs/implementation-plan.md` | This file |

### Modified Files
| File | Change |
|------|--------|
| `src/lib/types.ts` | Added SubscriptionState, DynamicScore, TechRadarTool, MonthConfig |
| `src/lib/config.ts` | Added pricing, MONTH_CONFIGS, teams email, feature flags |
| `src/lib/auth.ts` | Added subscription-aware access control functions |
| `src/lib/data/mock-data.ts` | Complete rewrite for single GWTH course (94 lessons) |
| `src/lib/data/progress.ts` | Added getDynamicScore() |
| `src/providers/root-provider.tsx` | Added DevStateSwitcher |
| `src/components/layout/sidebar.tsx` | "The Course" link |
| `src/components/layout/public-nav.tsx` | Updated nav links |
| `src/components/layout/footer.tsx` | Updated footer links |
| `src/components/landing/hero-section.tsx` | GWTH-specific copy and CTAs |
| `src/app/(public)/page.tsx` | Full landing page rewrite |
| `src/app/(public)/pricing/page.tsx` | Single-course pricing |
| `src/app/(dashboard)/dashboard/page.tsx` | Subscription-aware dashboard |
| `src/app/(dashboard)/course/[slug]/page.tsx` | Month-gated course detail |
| `src/app/(dashboard)/progress/page.tsx` | Dynamic score + updated links |
| `src/app/(dashboard)/settings/page.tsx` | Subscription management section |
| `src/components/course/course-card.test.tsx` | Added month field to test fixture |
