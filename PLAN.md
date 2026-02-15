# GWTH v2 — Implementation Plan

> **Status**: Planning complete, ready to execute
> **Last Updated**: 2026-02-15
> **Plan File**: Keep this file up to date as work progresses

## Context

Build GWTH v2, a student-facing learning platform. This is a **full rebuild** — clean architecture, new design system (OKLCH colors, Tailwind v4), and modern stack (Next.js 16, React 19). Before building v2, we need screenshots of v1 (running with mock data) so we can analyze which design elements and wording to carry forward.

Two phases:
- **Phase A**: Mock v1 to run locally without DB/auth, take Playwright screenshots of all pages
- **Phase B**: Scaffold v2 from scratch following CLAUDE.md Phase 1 spec

---

## Phase A: V1 Screenshots (Mock Data Mode)

**Project**: `C:\Projects\GWTH-Prod_v1` (on a `mock-data` branch — never touch main)

### A.1 — Branch + Install
- [ ] `git checkout -b mock-data`
- [ ] `npm install` (use `--legacy-peer-deps` if needed)
- [ ] Create `.env.local` with `ENABLE_DATABASE=false`, dummy `DATABASE_URL=postgresql://localhost/dummy`, mock secrets for `BETTER_AUTH_SECRET`, `MAILERSEND_API_KEY`, `STRIPE_SECRET_KEY`, etc.
- [ ] `npx prisma generate` (works without a live DB)
- **Verify**: node_modules exists, Prisma client generated

### A.2 — Stub Auth System
Files to modify:
- [ ] `src/app/api/auth/session/route.ts` → Return hardcoded mock user (David, david@agilecommercegroup.com, authenticated=true)
- [ ] `src/app/api/auth/signin/route.ts` → Accept any credentials, set mock cookie
- [ ] `src/app/api/auth/[...all]/route.ts` → Return mock responses
- [ ] `src/lib/better-auth.ts` → Export mock `auth` object, `getSession()`, `requireAuth()` returning mock user
- [ ] `src/lib/clerk.ts` → `getCurrentUser()` returns mock user with active subscription
- [ ] `src/contexts/auth-context.tsx` → Mock login/logout (state-only, no API calls)
- [ ] `src/middleware.ts` → Passthrough (always `NextResponse.next()`)
- **Verify**: `npm run dev` starts, no auth-related crashes

### A.3 — Stub Data Layer
- [ ] `src/lib/db/prisma.ts` → Proxy that returns empty arrays for `findMany`, null for `findUnique`, 0 for `count`
- [ ] `src/lib/subscription.ts` → `getContentAccessLevel()` returns full access (month 12, plan 'pro')
- [ ] API routes (`/api/labs`, `/api/lessons`, `/api/courses`, etc.) → Return mock arrays with realistic content
- [ ] Create `src/lib/mock-data.ts` with seed data (courses, lessons, labs, progress) based on Prisma schema structure
- **Verify**: `curl localhost:3000/api/labs` returns JSON, pages load without DB errors

### A.4 — Fix Remaining Build Errors
- [ ] Start `npm run dev` and iterate: fix one import/crash at a time
- Common issues: pg Pool imports, Stripe initialization, Minio client, better-auth config
- Strategy: stub at the module level (replace imports, not individual calls)
- **Verify**: All pages load without server errors in terminal

### A.5 — Take Playwright Screenshots
Navigate to each page and capture full-page screenshots (light + dark mode):

| Page | URL | Status |
|------|-----|--------|
| Landing | `/` | [ ] |
| About | `/about` | [ ] |
| Pricing | `/pricing` | [ ] |
| Sign In | `/sign-in` | [ ] |
| Sign Up | `/sign-up` | [ ] |
| Waitlist | `/waitlist` | [ ] |
| Dashboard | `/dashboard` | [ ] |
| Course | `/course` | [ ] |
| Labs | `/labs` | [ ] |
| Lessons | `/lessons` | [ ] |
| Backend/Admin | `/backend` | [ ] |
| Settings | `/settings` | [ ] |
| Profile | `/profile` | [ ] |

Save to `C:\Projects\GWTH-Prod_v1\screenshots\` for later analysis.

- **Verify**: Screenshot files exist showing rendered pages (not error screens)

### A.6 — Commit + Switch Back
- [ ] `git add -A && git commit -m "Mock data layer for screenshots"`
- [ ] `git checkout main` (leave mock-data branch for reference)

---

## Phase B: Scaffold GWTH v2

**Project**: `C:\Projects\GWTH_V2`

### B.1 — Initialize Project
- [ ] `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --turbopack --import-alias "@/*"`
- [ ] `git init && git add -A && git commit -m "Initial Next.js scaffold"`
- **Verify**: `npm run dev` shows default Next.js page at localhost:3000

### B.2 — Install Dependencies
```bash
# UI + Animation
npm install motion sonner next-themes lucide-react tw-animate-css
# Forms + Validation
npm install react-hook-form @hookform/resolvers zod
# Syntax highlighting
npm install shiki
# Dev
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
npm install -D @playwright/test axe-playwright
```
- **Verify**: `npm run dev` still works, no dependency conflicts

### B.3 — Configure Build Tools
- [ ] `next.config.ts`: Add `output: "standalone"`, empty `remotePatterns`
- [ ] `tsconfig.json`: Ensure `strict: true`, `paths: { "@/*": ["./src/*"] }`
- [ ] `eslint.config.mjs`: Flat config with `eslint-config-next/core-web-vitals` + `typescript`
- **Verify**: `npm run lint` and `npx tsc --noEmit` pass

### B.4 — Initialize shadcn/ui
- [ ] `npx shadcn@latest init` (new-york style, CSS variables)
- [ ] Install components: `button badge card avatar progress tabs accordion dialog sheet input label select checkbox radio-group tooltip popover command skeleton separator dropdown-menu navigation-menu form alert-dialog calendar breadcrumb`
- **Verify**: `src/components/ui/` populated

### B.5 — Theme Setup (globals.css)
- [ ] Replace generated globals.css with GWTH Student theme from `C:\Projects\design-system\themes\gwth-student-globals.css`
- [ ] Adapt font vars: `--font-inter` and `--font-jetbrains` instead of `--font-geist-*`
- [ ] All OKLCH color tokens (light + dark), component classes, utility classes, status/grade colors
- **Verify**: Dev server shows correct background color (light gray light mode / dark teal dark mode)

### B.6 — Root Layout + Fonts + Providers
- [ ] `src/providers/theme-provider.tsx`: next-themes ThemeProvider wrapper
- [ ] `src/providers/root-provider.tsx`: Composes all providers
- [ ] `src/app/layout.tsx`: Inter + JetBrains Mono via `next/font/google`, RootProvider, Sonner Toaster, full metadata/OG tags
- **Verify**: Fonts load (check computed styles), dark mode toggle works

### B.7 — Foundation Files
- [ ] `src/lib/config.ts`: SIDEBAR_WIDTH=280, HEADER_HEIGHT=64, CONTENT_MAX_WIDTH=1400, animation defaults, breakpoints
- [ ] `src/lib/types.ts`: All domain types (Course, Lesson, Lab, Progress, StudyStreak, Bookmark, Note, Certificate, Notification, User, QuizQuestion, Resource) — every field JSDoc'd
- [ ] `src/lib/validations.ts`: Zod schemas (login, signup, forgotPassword, profile, settings, quizAnswer, note, waitlist)
- [ ] `src/lib/utils.ts`: `cn()` + formatDuration, formatDate, slugify, getGradeFromScore, getStatusColor
- [ ] `src/lib/auth.ts`: Mock getCurrentUser(), requireAuth(), isAuthenticated()
- **Verify**: `npx tsc --noEmit` passes

### B.8 — Mock Data Layer
- [ ] `src/lib/data/mock-data.ts`: 3 courses with sections/lessons (15+ lessons total), 5 labs, streak data, bookmarks, notifications, progress
- [ ] `src/lib/data/courses.ts`: getCourses(), getCourse(slug), searchCourses()
- [ ] `src/lib/data/lessons.ts`: getLessons(), getLesson()
- [ ] `src/lib/data/labs.ts`: getLabs(), getLab(), searchLabs()
- [ ] `src/lib/data/progress.ts`: getProgress(), updateProgress(), getStreak()
- [ ] `src/lib/data/bookmarks.ts`: getBookmarks(), toggleBookmark()
- [ ] `src/lib/data/notes.ts`: getNotes(), saveNote(), deleteNote()
- [ ] `src/lib/data/notifications.ts`: getNotifications(), markRead()
- **Verify**: Import each module, call its main function — returns typed data

### B.9 — Hooks
- [ ] `src/hooks/use-sidebar.ts`: Open/close state with localStorage
- [ ] `src/hooks/use-reduced-motion.ts`: prefers-reduced-motion media query
- [ ] `src/hooks/use-progress.ts`: Progress tracking with useOptimistic
- [ ] `src/hooks/use-search.ts`: Cmd+K palette state
- [ ] `src/hooks/use-bookmark.ts`: Bookmark toggle with optimistic UI

### B.10 — Middleware + Error Handling
- [ ] `src/middleware.ts`: Passthrough with route matcher for dashboard paths
- [ ] `src/app/error.tsx`: Root error boundary with retry button
- [ ] `src/app/not-found.tsx`: Custom 404
- [ ] `src/app/loading.tsx`: Root loading skeleton

### B.11 — **CHECKPOINT**: Commit Foundation
```bash
git add -A && git commit -m "Foundation: types, config, auth stub, mock data, hooks, providers, theme"
npm run dev && npx tsc --noEmit && npm run lint
```

### B.12 — Route Group Layouts
- [ ] `src/app/(public)/layout.tsx`: Public nav bar + footer
- [ ] `src/app/(auth)/layout.tsx`: Centered card layout
- [ ] `src/app/(dashboard)/layout.tsx`: Collapsible sidebar + header + breadcrumb + content area
- [ ] Each gets `loading.tsx` and `error.tsx`

### B.13 — Layout Components
- [ ] `src/components/layout/public-nav.tsx`: Navigation for public pages
- [ ] `src/components/layout/footer.tsx`: Site footer
- [ ] `src/components/layout/sidebar.tsx`: Collapsible sidebar with Motion layout animations
- [ ] `src/components/layout/header.tsx`: Dashboard header (breadcrumb, search trigger, avatar, theme toggle)
- [ ] `src/components/layout/mobile-nav.tsx`: Sheet-based mobile navigation
- [ ] `src/components/layout/breadcrumb-nav.tsx`: Dynamic breadcrumb
- [ ] `src/components/layout/README.md`
- **Verify**: Navigate to `/` (public nav + footer), `/dashboard` (sidebar + header)

### B.14 — Landing Page
- [ ] `src/app/(public)/page.tsx`: Animated hero with glowing orbs (Motion), gradient text, scroll-reveal features (whileInView), staggered card animations, pricing preview CTA, JSON-LD structured data
- [ ] Background effects: blurred orbs (400-600px, blur(64px), 15-25% opacity), frosted glass cards
- **Verify**: Page loads with animations in light + dark mode. Playwright screenshot.

### B.15 — About + Pricing Pages
- [ ] `src/app/(public)/about/page.tsx`
- [ ] `src/app/(public)/pricing/page.tsx`: Plans comparison (Free/Pro/Team) + waitlist/newsletter signup form
- [ ] `src/lib/data/email.ts`: Stub functions for subscribeToWaitlist(), subscribeToNewsletter() (will wire to MailerSend/MailerLite later)
- **Verify**: Pages render, pricing form validates with zod

### B.16 — Auth Pages
- [ ] `src/app/(auth)/login/page.tsx`
- [ ] `src/app/(auth)/signup/page.tsx`
- [ ] `src/app/(auth)/forgot-password/page.tsx`
- [ ] All use react-hook-form + zod + shadcn Form
- **Verify**: Form validation works (empty submit, invalid email, short password)

### B.17 — **CHECKPOINT**: Commit Public Pages
```bash
git add -A && git commit -m "Public pages: landing, about, pricing, auth"
```

### B.18 — Shared Components
- [ ] `src/components/course/course-card.tsx`: Thumbnail, title, progress bar, lesson count
- [ ] `src/components/progress/progress-ring.tsx`: Circular SVG with Motion animation
- [ ] `src/components/progress/status-badge.tsx`: Colored badge (completed/in-progress/locked/not-started) with icon + text
- [ ] `src/components/progress/study-streak-calendar.tsx`: GitHub-style activity heatmap
- [ ] `src/components/shared/empty-state.tsx`: Reusable with icon, title, description, CTA
- [ ] `src/components/shared/bookmark-button.tsx`: Toggle with optimistic UI + toast
- [ ] Component directory README.md files

### B.19 — Dashboard Page
- [ ] `src/app/(dashboard)/dashboard/page.tsx`: Course cards with progress rings, recent activity, study streak calendar, bookmarked items
- **Verify**: Dashboard renders with mock data, progress rings animate, streak shows activity

### B.20 — Course Detail Page
- [ ] `src/app/(dashboard)/course/[slug]/page.tsx`: Sections accordion, lesson list with status badges, generateMetadata, JSON-LD
- [ ] `src/app/(dashboard)/course/[slug]/loading.tsx` + `not-found.tsx`
- **Verify**: `/course/ai-fundamentals` loads, `/course/nonexistent` shows 404

### B.21 — Lesson Viewer (Core Page)
- [ ] `src/app/(dashboard)/course/[slug]/lesson/[lessonSlug]/page.tsx`
- [ ] `src/components/course/lesson-nav.tsx`: Left sidebar tree (sections → lessons, progress dots)
- [ ] `src/components/course/lesson-tabs.tsx`: Learn | Build | Quiz tabs
- [ ] `src/components/shared/video-player.tsx`: Video embed (next/dynamic lazy load)
- [ ] `src/components/shared/audio-player.tsx`: Inline audio + playback speed
- [ ] `src/components/shared/markdown-renderer.tsx`: Lesson content with Shiki code blocks
- [ ] `src/components/course/quiz-engine.tsx`: Interactive quiz (react-hook-form), scoring, AlertDialog confirm
- [ ] `src/components/shared/notes-panel.tsx`: Slide-out Sheet for annotations
- [ ] `src/components/course/lesson-bottom-bar.tsx`: Prev/next + mark complete (useOptimistic)
- [ ] Mobile responsive: sidebar becomes Sheet
- **Verify**: Navigate to lesson, see Learn/Build/Quiz tabs, mark complete works, prev/next works

### B.22 — Courses Listing
- [ ] `src/app/(dashboard)/courses/page.tsx`: Grid of CourseCards, filters (category, difficulty) via URL search params, search input, empty state
- **Verify**: Filters update URL, cards render with mock data

### B.23 — Labs Listing + Viewer
- [ ] `src/app/(dashboard)/labs/page.tsx`: Lab grid with filters
- [ ] `src/app/(dashboard)/labs/[slug]/page.tsx`: Lab content + instructions
- [ ] `src/components/lab/lab-card.tsx`: Difficulty badge, tech stack pills, duration
- **Verify**: Labs page shows filtered cards, lab viewer shows content

### B.24 — **CHECKPOINT**: Commit Dashboard Pages
```bash
git add -A && git commit -m "Dashboard: overview, courses, lesson viewer, labs"
```

### B.25 — Remaining Dashboard Pages
- [ ] `src/app/(dashboard)/progress/page.tsx`: Charts, completion rates, certificates
- [ ] `src/app/(dashboard)/settings/page.tsx`: Account settings, notification prefs, dark mode toggle
- [ ] `src/app/(dashboard)/profile/page.tsx`: User profile, avatar, bio
- [ ] `src/app/(dashboard)/bookmarks/page.tsx`: Saved lessons and labs
- [ ] `src/app/(dashboard)/notifications/page.tsx`: Notification center
- [ ] Each gets `loading.tsx`
- **Verify**: Each page renders with mock data

### B.26 — Search Palette (Cmd+K)
- [ ] `src/components/search/search-palette.tsx`: shadcn Command, search courses/lessons/labs
- [ ] Integrate into dashboard layout
- **Verify**: Ctrl+K opens palette, search filters results

### B.27 — SEO + Config
- [ ] `src/app/sitemap.ts`: Auto-generated from courses and labs
- [ ] `src/app/robots.ts`: Standard robots.txt
- [ ] `.env.local.example`: Document all env vars (MAILERSEND_*, MAILERLITE_*, etc.)
- **Verify**: `/sitemap.xml` and `/robots.txt` return valid content

### B.28 — **CHECKPOINT**: Commit All Pages
```bash
git add -A && git commit -m "All pages: progress, settings, profile, bookmarks, notifications, search, SEO"
```

### B.29 — Vitest Component Tests
- [ ] `vitest.config.ts` + `src/test-setup.ts`
- [ ] `src/components/course/course-card.test.tsx`
- [ ] `src/components/progress/progress-ring.test.tsx`
- [ ] `src/components/progress/status-badge.test.tsx`
- [ ] `src/components/shared/empty-state.test.tsx`
- [ ] `src/components/course/quiz-engine.test.tsx`
- **Verify**: `npm test` — all suites pass

### B.30 — Playwright Visual Tests
- [ ] `npx playwright install`
- [ ] `src/__tests__/pages/landing.spec.ts`: Desktop + mobile, light + dark, axe-core a11y
- [ ] `src/__tests__/pages/dashboard.spec.ts`: Same
- [ ] `src/__tests__/pages/lesson-viewer.spec.ts`: Same
- **Verify**: `npx playwright test` passes, screenshots generated, no critical a11y violations

### B.31 — Component README Files
- [ ] `src/components/layout/README.md`
- [ ] `src/components/course/README.md`
- [ ] `src/components/lab/README.md`
- [ ] `src/components/progress/README.md`
- [ ] `src/components/shared/README.md`
- [ ] `src/components/search/README.md`

### B.32 — Final Verification
```bash
npm run dev          # Starts without errors
npx tsc --noEmit     # Type checks pass
npm run lint         # ESLint passes
npm test             # Vitest passes
npx playwright test  # Playwright passes
```
- [ ] Walk through every page in browser (light + dark mode)
- [ ] Take final Playwright screenshots of all v2 pages
- [ ] Compare v1 screenshots with v2 for review

```bash
git add -A && git commit -m "Complete Phase 1: tests, docs, and verification"
```

---

## Key Files Reference

| Purpose | File |
|---------|------|
| Design system theme | `C:\Projects\design-system\themes\gwth-student-globals.css` |
| Component patterns | `C:\Projects\design-system\themes\gwth-student-components.md` |
| Theme JSON | `C:\Projects\design-system\themes\gwth-student.json` |
| V1 landing page | `C:\Projects\GWTH-Prod_v1\src\app\page.tsx` |
| V1 auth client | `C:\Projects\GWTH-Prod_v1\src\lib\auth-client-better.ts` |
| V1 session route | `C:\Projects\GWTH-Prod_v1\src\app\api\auth\session\route.ts` |
| V1 email (MailerSend) | `C:\Projects\GWTH-Prod_v1\src\lib\mailersend.ts` |
| V1 email (MailerLite) | `C:\Projects\GWTH-Prod_v1\src\lib\mailerlite.ts` |

## Email Integration (from v1 → v2)

Copy the MailerSend + MailerLite integration pattern from v1:
- **MailerSend** (`mailersend@^2.6.0`): Transactional emails (welcome, waitlist confirmation)
- **MailerLite** (HTTP API): Newsletter subscriber management
- Env vars: `MAILERSEND_API_KEY`, `MAILERSEND_DOMAIN`, `MAILERSEND_FROM_EMAIL`, `MAILERSEND_FROM_NAME`, `MAILERLITE_API_KEY`, `MAILERLITE_GROUP_ID`
- Implement in `src/lib/data/email.ts` with server actions for form submission
- Wire into pricing page waitlist form and any newsletter signup CTAs

## Risks + Mitigations

1. **V1 mocking complexity**: Deep import chains may surface unexpected failures → Fix iteratively, stub at module boundaries
2. **Next.js 16 availability**: May still be canary → Use latest stable, upgrade when available
3. **Motion (motion.dev) imports**: Different from framer-motion → Use `import { motion } from "motion/react"`
4. **Large mock data**: 3 courses × 15 lessons × 5 labs → Start minimal, expand incrementally
