# GWTH v2 — Student Learning Platform

## Project Overview

Build GWTH v2, a student-facing learning platform where users can browse courses, view lessons (video + text + audio), complete labs, track progress, and take quizzes. This is a full rebuild — clean, modern, and properly architected from scratch.

**Content model:** This is a single course delivered over 3 months (not a multi-course catalog). The mock data uses multiple courses for UI development, but the production site will feature one course with monthly content releases.

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19, React Compiler, Turbopack)
- **Language:** TypeScript (strict mode, `@/*` path aliases)
- **Styling:** Tailwind CSS v4 + shadcn/ui (unified `radix-ui` package, new-york style)
- **Animation:** Motion (motion.dev, formerly Framer Motion) for page transitions, scroll animations, layout animations, and micro-interactions
- **CSS Animation:** tw-animate-css for Tailwind-native animation utilities
- **Icons:** lucide-react (consistent with ACG project)
- **Forms:** react-hook-form + zod for validation (quiz, login, signup, settings, profile)
- **Toasts:** Sonner for notifications ("lesson completed", "quiz submitted", errors)
- **Theme:** next-themes for light/dark mode with system preference detection
- **Syntax Highlighting:** Shiki (for code blocks in lesson content)

This matches the agilecommerce.ai stack (`next@16.1.4`, `react@19.2.3`, `tailwindcss@^4`, `tw-animate-css`).

Backend, auth, database, and payment choices will be decided separately. Do not install or configure any backend dependencies. Build the frontend with clean data-fetching abstractions so any backend can be plugged in later.

### next.config.ts

```ts
const nextConfig: NextConfig = {
  output: "standalone",  // Docker-ready for Coolify deployment
  images: {
    remotePatterns: [
      // Add patterns as external image sources are identified
      // e.g. course thumbnails, user avatars from CDN
    ],
  },
};
```

### ESLint

Use modern flat config matching the ACG project:

```js
// eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
```

### TypeScript

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "strict": true,
    "moduleResolution": "bundler",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

### Environment Variables

```bash
# .env.local (gitignored — backend secrets only)
# No env vars needed for Phase 1 (mock data)
# Future: NEXT_PUBLIC_* for client-side config, everything else server-only
```

Create a `.env.local.example` committed to git showing what vars are needed (without values).

## Design System

All colors use OKLCH format in CSS custom properties defined in `src/app/globals.css`. The theme defaults to **light mode** (set in `src/providers/theme-provider.tsx`). Users can toggle via the sun/moon icon in the dashboard header.

### Theme Colors (OKLCH — CSS custom properties)

**Light mode:**
| Token | OKLCH Value | Hex Approx | Notes |
|-------|-------------|-----------|-------|
| background | `oklch(0.98 0 0)` | `#F5F5F5` | Near-white |
| foreground | `oklch(0.18 0.04 175)` | `#0F2624` | Dark teal text |
| primary | `oklch(0.7 0.18 220)` | `#33BBFF` | Bright aqua |
| accent | `oklch(0.65 0.16 165)` | `#1CBA93` | Mint green |
| secondary | `oklch(0.95 0.01 220)` | `#EDF0F5` | Light blue-grey |
| muted | `oklch(0.95 0.01 220)` | `#EDF0F5` | Same as secondary |
| muted-foreground | `oklch(0.5 0.02 220)` | `#5E6E85` | Subdued text |
| card | `oklch(1 0 0)` | `#FFFFFF` | White cards on grey bg |
| border | `oklch(0.9 0.02 220)` | `#D6DCE6` | Light border |
| destructive | `oklch(0.577 0.245 27.325)` | `#E53935` | Red |
| success | `oklch(0.6 0.18 145)` | `#2E7D32` | Green |
| warning | `oklch(0.75 0.15 75)` | `#F59E0B` | Amber |
| info | `oklch(0.7 0.18 220)` | `#33BBFF` | Same as primary |
| sidebar | `oklch(0.97 0.005 175)` | `#F3F7F6` | Slight teal tint |

**Dark mode — "Graphite Warm":**
| Token | OKLCH Value | Hex Approx | Notes |
|-------|-------------|-----------|-------|
| background | `oklch(0.17 0.005 60)` | `#191817` | Warm charcoal |
| foreground | `oklch(0.93 0.008 60)` | `#EDEAE6` | Warm off-white |
| primary | `oklch(0.75 0.16 220)` | `#5BA8E6` | Lighter aqua for contrast |
| accent | `oklch(0.75 0.14 165)` | `#5CC8A8` | Lighter mint |
| secondary | `oklch(0.24 0.006 60)` | `#3A3937` | Dark warm grey |
| muted | `oklch(0.24 0.006 60)` | `#3A3937` | Same as secondary |
| muted-foreground | `oklch(0.65 0.015 60)` | `#9E9A94` | Warm grey text |
| card | `oklch(0.21 0.005 60)` | `#232221` | Slightly lighter than bg |
| border | `oklch(1 0 0 / 12%)` | `rgba(255,255,255,0.12)` | Subtle white border |
| sidebar | `oklch(0.15 0.005 60)` | `#151413` | Slightly darker than bg |

The dark mode uses hue 60 (warm/amber axis) with very low chroma (0.005-0.015) to create a neutral warm charcoal that avoids the green tint of teal-based dark themes. Primary and accent colors (aqua/mint) pop well against this neutral base.

**Status colors (both modes):** completed=green, in-progress=aqua, not-started=grey, locked=dark grey

**Grade colors:** A=green, B=mint, C=amber, D=orange, F=red

### Typography
- **Headings + Body:** Inter (via `next/font/google`, variable `--font-inter`)
- **Code blocks:** JetBrains Mono (via `next/font/google`, variable `--font-jetbrains`)
- **Corners:** rounded (`--radius: 0.625rem`)
- **Shadows:** subtle
- **Animations:** subtle, not flashy

### Font Loading

Use `next/font/google` for zero-layout-shift font loading:

```tsx
// app/layout.tsx
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

// Apply to <html>
<html className={`${inter.variable} ${jetbrainsMono.variable}`}>
```

Then in `globals.css`:
```css
@theme inline {
  --font-sans: var(--font-inter);
  --font-mono: var(--font-jetbrains);
}
```

### Layout Dimensions
- Sidebar width: 280px (collapsed: 64px)
- Header height: 64px
- Content max-width: 1400px

### Background Effects — Cascading Spiral Windmill

The landing page hero uses a **cascading blurred spiral animation** matching the agilecommercegroup.com style. This replaces the original glowing orbs approach.

**How it works:**
- A 7-blade SVG spiral (`public/logo-spiral.svg`) in the GWTH aqua-to-mint-to-indigo color spectrum (deep teal, teal, mint, aqua green, primary aqua, sky blue, indigo blue)
- 4 pre-blurred SVG variants at different Gaussian blur levels (`logo-spiral-blur-6.svg`, `-12.svg`, `-18.svg`, `-25.svg`)
- 4 cascading `<Image>` layers positioned in the top-right area, each with different size, blur level, opacity, rotation speed, and direction

**Layer configuration (hero section in `src/components/landing/hero-section.tsx`):**
| Layer | Size | SVG | Speed | Direction | Opacity (light/dark) |
|-------|------|-----|-------|-----------|---------------------|
| 1 (furthest) | 800px | blur-25 | 120s | forward | 12% / 8% |
| 2 | 650px | blur-18 | 80s | reverse | 18% / 12% |
| 3 | 500px | blur-12 | 55s | forward | 25% / 18% |
| 4 (closest) | 380px | blur-6 | 40s | reverse | 30% / 22% |

**Animation classes:** Uses Tailwind arbitrary animations — `animate-[spin_120s_linear_infinite]` and `animate-[spin_80s_linear_infinite_reverse]`. The standard `spin` keyframe from Tailwind handles the rotation. All layers are hidden when `prefers-reduced-motion` is active.

**Content layout:** Text is left-aligned (`max-w-2xl`) to balance visually against the spiral layers on the right.

**SVG files in `public/`:**
- `logo-spiral.svg` — sharp, no blur (not used directly in hero, available for other uses)
- `logo-spiral-blur-6.svg` — lightest blur (closest layer)
- `logo-spiral-blur-12.svg` — medium blur
- `logo-spiral-blur-18.svg` — heavy blur
- `logo-spiral-blur-25.svg` — heaviest blur (furthest layer)

**Blade colors (all SVG variants):**
| Blade | Color | Hex |
|-------|-------|-----|
| 1 | Deep Teal | `#0D4F4F` |
| 2 | Teal | `#0E7C7B` |
| 3 | Mint | `#1CBA93` |
| 4 | Aqua Green | `#22D3A7` |
| 5 | Primary Aqua | `#33BBFF` |
| 6 | Sky Blue | `#5B9BF5` |
| 7 | Indigo Blue | `#4A6CF7` |

### Route Transition Indicator

A `RouteProgress` component (`src/components/shared/route-progress.tsx`) renders on every client-side navigation:
- Top-of-page gradient bar (primary-to-accent) that animates from 0% to 100% width
- Small SVG spinner in the top-right corner
- Both auto-dismiss after 500ms
- Wired into the root layout (`src/app/layout.tsx`)

### Loading Spinners

The `Spinner` and `PageSpinner` components (`src/components/shared/spinner.tsx`) are used in all `loading.tsx` files:
- **`Spinner`** — dual-ring SVG spinner with primary outer arc and accent inner arc (counter-rotating). Configurable size.
- **`PageSpinner`** — full-page centered spinner with "Loading..." text, used for root and public loading states.
- Dashboard loading states combine the small spinner with skeleton placeholders.

Custom CSS animations in `globals.css`:
- `.animate-spin-reverse` — reverse rotation at 1.2s for the inner ring
- `.animate-progress` — 0-to-100% width animation for the route transition bar

### Additional Background Effects
- Frosted glass: `backdrop-filter: blur(12px)` with semi-transparent bg (used in public nav header)
- Gradient backdrop: `bg-gradient-to-br from-primary/5 via-transparent to-accent/5` (hero section base)

### Image Optimization

Use `next/image` for all images. Never use raw `<img>` tags:

```tsx
import Image from "next/image";

// Course thumbnails with blur placeholder
<Image
  src={course.thumbnail}
  alt={course.title}
  width={400}
  height={225}
  className="rounded-lg object-cover"
  placeholder="blur"
  blurDataURL={course.blurDataUrl}  // tiny base64 placeholder
/>

// Icons and logos (local SVGs)
<Image src="/logo.svg" alt="GWTH" width={36} height={36} />
```

Add remote patterns to `next.config.ts` as external image sources are identified.

## Domain Model (reference — shapes the UI, not the database)

These are the content types the UI must support. How they're stored is a backend concern.

### Course
- `title`, `slug`, `description`, `thumbnail`, `blurDataUrl`, `price`
- Contains ordered **sections**, each containing ordered **lessons**
- `category`, `difficulty`, `estimatedDuration`

### Lesson
- `title`, `slug`, `description`, `order`, `duration`, `difficulty`, `category`
- **Learn content:** video (`introVideoUrl`) + rich text/MDX (`learnContent`) + audio (`audioFileUrl`, `audioDuration`)
- **Build content:** video (`buildVideoUrl`) + step-by-step instructions (`buildInstructions`)
- **Quiz:** questions with scoring (`questions` JSON)
- **Resources:** links, downloads (`resources` JSON)
- **Status:** locked | available | completed
- **Hierarchy:** lessons can have sub-lessons (parent/child)

### Lab
- `title`, `slug`, `description`, `difficulty`, `duration`
- `technologies[]`, `learningOutcomes[]`, `prerequisites`
- `content` (markdown), `instructions` (step-by-step JSON)
- `category`, `projectType`, `color`, `icon`
- `isPremium`

### Progress (per user)
- **Lesson:** `isCompleted`, `progress` (0-1), `quizScore`, `bestQuizScore`, `quizAttempts`, `timeSpent`
- **Lab:** `isCompleted`, `progress` (0-1)
- **Course:** `progress` (0-1), `completedAt`

### Study Streak
- `currentStreak` (consecutive days), `longestStreak`, `lastActiveDate`
- `weeklyActivity[]` (array of 7 booleans for heatmap display)

### Bookmark
- `userId`, `lessonId` or `labId`, `createdAt`
- Used for "saved for later" / favorites feature

### Note
- `userId`, `lessonId`, `content` (markdown), `timestamp` (video position if applicable)
- Students can annotate lessons with personal notes

### Certificate
- `userId`, `courseId`, `issuedAt`, `certificateUrl`
- Awarded on course completion (100% lessons + passing quiz scores)

### Notification
- `userId`, `type` (achievement | reminder | announcement), `title`, `message`, `read`, `createdAt`
- For study reminders, achievement unlocks, new content alerts

## Pages & Routes

### Public (no auth)
- `/` — Landing page with hero, features, testimonials, pricing preview
- `/pricing` — Plans comparison (Free / Pro / Team)
- `/about` — About GWTH
- `/login` — Sign in
- `/signup` — Registration
- `/forgot-password` — Password reset flow

### Student Dashboard (authenticated)
- `/dashboard` — Overview: course cards, progress rings, recent activity, study streak calendar, bookmarked items
- `/courses` — Browse all courses (filterable by category, difficulty, search)
- `/course/[slug]` — Course detail: sections accordion, lesson list with status badges
- `/course/[slug]/lesson/[lessonSlug]` — **Lesson viewer** (the core page):
  - Left sidebar: course navigation (sections -> lessons, progress indicators)
  - Main content area with tabs: Learn | Build | Quiz
  - Learn tab: video player + rich text content + audio player
  - Build tab: video + step-by-step instructions
  - Quiz tab: interactive questions with scoring
  - Bottom bar: prev/next lesson navigation, mark complete button
  - Notes panel: slide-out panel for personal annotations
- `/labs` — Browse all labs with filters (difficulty, technology, category)
- `/labs/[slug]` — Lab viewer: instructions, resources, step tracker
- `/profile` — User profile, avatar, bio
- `/settings` — Account settings, notification preferences, theme toggle (light/dark)
- `/progress` — Detailed progress analytics: charts, time spent, completion rates, certificates
- `/bookmarks` — Saved lessons and labs
- `/notifications` — Notification center (achievements, reminders, announcements)

### Admin (separate admin panel — phase 2)
- Content management for courses, lessons, labs
- User management, analytics dashboard

## Architecture Principles

### Core
1. **Server Components by default.** Only use `"use client"` for interactive elements (video player, quiz, sidebar toggle, theme toggle, forms).
2. **React Compiler enabled.** Let the compiler handle memoization — do NOT manually use `useMemo`, `useCallback`, or `React.memo`.
3. **Turbopack** as the default bundler (`next dev --turbopack`).
4. **Streaming & Suspense.** Use `loading.tsx` and `<Suspense>` for progressive loading.
5. **Route groups** for `(public)`, `(auth)`, `(dashboard)` layouts.
6. **Optimistic UI** for progress tracking (mark complete, quiz submit). Use `useOptimistic` from React 19.
7. **Mobile-first responsive design.** The lesson viewer sidebar becomes a Sheet on mobile.

### Abstraction & Boundaries
8. **Data layer abstraction.** All data access goes through functions in `lib/data/` (e.g. `getCourse(slug)`, `getLessons(courseId)`, `updateProgress()`). These return typed interfaces. Initially use mock/seed data. The real backend will be wired in later. Every function must have a JSDoc comment describing what it returns.
9. **Auth abstraction.** Use a `lib/auth.ts` that exports `getCurrentUser()`, `requireAuth()`, etc. Stub these with a mock user for now. Real auth provider will be configured separately.
10. **Config abstraction.** All magic numbers, feature flags, and app-wide settings go in `lib/config.ts` — not scattered across components. This includes layout dimensions, animation durations, pagination sizes, etc.
11. **Clear module boundaries.** Each directory under `components/` is a feature module. Components in `components/course/` should not import from `components/lab/`. Shared utilities go in `components/shared/` or `lib/`.

### Error Handling & Resilience
12. **Error boundaries at every route.** Every route group gets an `error.tsx` that catches rendering errors and shows a user-friendly fallback with a retry button. The root `app/error.tsx` catches anything that slips through.
13. **Not-found handling.** Every dynamic route (`[slug]`) must handle missing data gracefully with `notFound()` from `next/navigation`. Provide a custom `app/not-found.tsx`.
14. **Loading states everywhere.** Every route gets a `loading.tsx` with skeleton UI matching the page layout. No blank white screens while data loads.
15. **Graceful degradation.** If a video fails to load, show a placeholder. If audio isn't available, hide the player. Components must never crash the page.

### Performance
16. **Dynamic imports for heavy components.** Video player, quiz engine, chart libraries, and syntax highlighter should use `next/dynamic` with loading fallbacks:
    ```tsx
    const VideoPlayer = dynamic(() => import("@/components/shared/video-player"), {
      loading: () => <Skeleton className="aspect-video w-full" />,
    });
    ```
17. **Image optimization.** Always use `next/image`. Generate blur placeholders for course/lab thumbnails. Configure `remotePatterns` for external image sources.
18. **Font optimization.** Use `next/font/google` for Inter and JetBrains Mono. Self-hosted by Next.js — zero external requests, zero layout shift.
19. **Core Web Vitals awareness.** Target LCP < 2.5s, INP < 200ms, CLS < 0.1. Avoid layout shifts from loading content. Use `sizes` prop on images.

### SEO & Metadata
20. **Dynamic metadata.** Use `generateMetadata` for every page with dynamic content:
    ```tsx
    export async function generateMetadata({ params }: Props): Promise<Metadata> {
      const course = await getCourse(params.slug);
      return {
        title: `${course.title} | GWTH`,
        description: course.description,
        openGraph: {
          title: course.title,
          description: course.description,
          images: [{ url: course.thumbnail, width: 1200, height: 630 }],
        },
      };
    }
    ```
21. **Structured data.** Add JSON-LD for courses (Google understands `Course` schema):
    ```tsx
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Course",
      "name": course.title,
      "description": course.description,
      "provider": { "@type": "Organization", "name": "GWTH.ai" },
    }) }} />
    ```
22. **Sitemap & robots.** Generate `sitemap.xml` via `app/sitemap.ts` and `robots.txt` via `app/robots.ts` using Next.js conventions.

### Documentation Standards
23. **JSDoc on all exports.** Every exported function, component, type, and constant must have a JSDoc comment explaining what it does, its parameters, and return value. This is non-negotiable.
    ```tsx
    /**
     * Fetches a single course by slug, including its sections and lesson metadata.
     * Returns null if the course doesn't exist or isn't published.
     */
    export async function getCourse(slug: string): Promise<Course | null> { ... }
    ```
24. **Component prop documentation.** Every component's props interface must have JSDoc on each field:
    ```tsx
    interface CourseCardProps {
      /** The course to display */
      course: Course;
      /** User's progress (0-1). Omit to hide the progress bar. */
      progress?: number;
      /** Called when the user clicks the card */
      onSelect?: (slug: string) => void;
    }
    ```
25. **README per feature module.** Each directory under `components/` gets a brief `README.md` explaining what's in it, which components are the main entry points, and any patterns used.
26. **Inline comments for non-obvious logic.** Don't comment what the code does — comment *why*. Especially for accessibility workarounds, browser quirks, and animation timing choices.

### Naming Conventions
27. **Files:** kebab-case (`course-card.tsx`, `use-sidebar.ts`, `mock-data.ts`)
28. **Components:** PascalCase (`CourseCard`, `LessonNav`, `ProgressRing`)
29. **Hooks:** camelCase with `use` prefix (`useSidebar`, `useTheme`, `useProgress`)
30. **Types/Interfaces:** PascalCase, no `I` prefix (`Course`, `LessonProgress`, `User`)
31. **Constants:** UPPER_SNAKE_CASE (`MAX_QUIZ_ATTEMPTS`, `SIDEBAR_WIDTH`)
32. **CSS variables:** kebab-case with semantic names (`--primary`, `--card`, `--sidebar-width`)

### Accessibility
33. **WCAG 2.1 AA compliance.** All text must meet 4.5:1 contrast ratio (3:1 for large text). Use the design system's semantic color tokens which have been tested.
34. **Keyboard navigation.** All interactive elements must be focusable and operable with keyboard. Tab order must be logical. Focus rings must be visible.
35. **ARIA labels.** Icon-only buttons must have `aria-label`. Progress indicators must have `aria-valuenow`. Status badges must convey meaning beyond color alone (text + icon).
36. **Screen reader support.** Use semantic HTML (`nav`, `main`, `article`, `section`, `aside`). Use `aria-live` regions for dynamic content updates (progress changes, quiz results).
37. **Reduced motion.** All Motion animations must respect `prefers-reduced-motion`. Use `useReducedMotion()` hook globally.

### Testing Strategy
38. **Component tests with Vitest + React Testing Library.** Test each custom component in isolation — props render correctly, interactions work, loading/error states display properly.
39. **Visual regression with Playwright.** Screenshot tests for key pages in light/dark mode at desktop/mobile breakpoints.
40. **Accessibility tests with axe-core.** Run automated a11y checks on every page during CI.
41. **Test files live next to source.** `course-card.tsx` -> `course-card.test.tsx` in the same directory.

## Animation & Motion

Use Motion (motion.dev) for rich, performant animations throughout the site:

- **Page transitions:** `<AnimatePresence>` with fade/slide between routes
- **Scroll animations:** `whileInView` for revealing sections on the landing page (features, testimonials, pricing cards)
- **Layout animations:** `layout` prop for smooth sidebar collapse/expand, tab switching, accordion open/close
- **Micro-interactions:** `whileHover`, `whileTap` on buttons, cards, nav items (subtle scale, lift with shadow)
- **Staggered lists:** `staggerChildren` for course cards, lesson lists, lab grids loading in sequence
- **Progress animations:** animated progress rings and bars using Motion's spring physics
- **Hero section:** floating/pulsing glowing orbs using Motion's `animate` with infinite keyframes
- **Loading states:** skeleton shimmer effects, spinner animations

Keep animations subtle and purposeful — never flashy or distracting. Use `spring` easing for natural feel, not linear. Respect `prefers-reduced-motion` by wrapping animations in a `useReducedMotion()` check.

## Component Library

Use shadcn/ui components. Key ones needed:
- `Button`, `Badge`, `Card`, `Avatar`, `Progress`
- `Tabs`, `Accordion`, `Dialog`, `Sheet` (mobile sidebar)
- `Input`, `Label`, `Select`, `Checkbox`, `RadioGroup`
- `Toast` (via Sonner), `Tooltip`, `Popover`, `Command` (search palette)
- `Skeleton` (loading states), `Separator`
- `DropdownMenu` (user menu), `NavigationMenu`
- `Form` (react-hook-form integration from shadcn/ui)
- `AlertDialog` (confirmation dialogs: "Submit quiz?", "Mark complete?")
- `Calendar` (study streak display)
- `Breadcrumb` (course > section > lesson navigation)

Custom components to build:
- `<VideoPlayer>` — wrapper around a video embed (YouTube/Mux/custom). Use `next/dynamic` for lazy loading.
- `<AudioPlayer>` — inline audio with waveform, playback speed control
- `<LessonNav>` — sidebar tree with sections, lessons, progress dots
- `<QuizEngine>` — renders questions, handles scoring, shows results. Uses react-hook-form for answer state.
- `<ProgressRing>` — circular SVG progress indicator with Motion animation
- `<StatusBadge>` — colored badge (completed/in-progress/locked/not-started) with icon + text
- `<MarkdownRenderer>` — renders lesson content with Shiki syntax highlighting for code blocks
- `<CourseCard>` — card with thumbnail (next/image + blur), title, progress bar, lesson count
- `<LabCard>` — card with difficulty badge, tech stack pills, duration
- `<EmptyState>` — reusable empty state component with icon, title, description, CTA button
- `<SearchPalette>` — Cmd+K command palette for finding courses, lessons, labs (uses shadcn Command)
- `<StudyStreakCalendar>` — GitHub-style activity heatmap showing daily study activity
- `<NotesPanel>` — slide-out panel for lesson annotations with markdown support
- `<BookmarkButton>` — toggle button for saving/unsaving lessons and labs

## File Structure

```
src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx              # Landing
│   │   ├── pricing/page.tsx
│   │   ├── about/page.tsx
│   │   ├── layout.tsx            # Public nav + footer
│   │   ├── loading.tsx
│   │   └── error.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── layout.tsx            # Centered card layout
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx
│   │   ├── courses/page.tsx
│   │   ├── course/[slug]/
│   │   │   ├── page.tsx          # Course overview
│   │   │   ├── loading.tsx
│   │   │   ├── not-found.tsx
│   │   │   └── lesson/[lessonSlug]/
│   │   │       ├── page.tsx      # Lesson viewer
│   │   │       ├── loading.tsx
│   │   │       └── not-found.tsx
│   │   ├── labs/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── [slug]/
│   │   │       ├── page.tsx
│   │   │       ├── loading.tsx
│   │   │       └── not-found.tsx
│   │   ├── progress/page.tsx
│   │   ├── bookmarks/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── layout.tsx            # Sidebar + header layout
│   │   ├── loading.tsx
│   │   └── error.tsx
│   ├── sitemap.ts                # Auto-generated sitemap
│   ├── robots.ts                 # Robots.txt
│   ├── error.tsx                 # Root error boundary
│   ├── not-found.tsx             # Root 404 page
│   ├── globals.css
│   └── layout.tsx                # Root layout (fonts, ThemeProvider, Toaster)
├── components/
│   ├── ui/                       # shadcn/ui components (do not edit directly)
│   ├── layout/                   # Header, Sidebar, Footer, MobileNav, Breadcrumb
│   │   └── README.md
│   ├── course/                   # CourseCard, LessonNav, LessonViewer
│   │   └── README.md
│   ├── lab/                      # LabCard, LabViewer
│   │   └── README.md
│   ├── progress/                 # ProgressRing, StatusBadge, StudyStreakCalendar, Charts
│   │   └── README.md
│   ├── shared/                   # VideoPlayer, AudioPlayer, MarkdownRenderer, EmptyState, BookmarkButton, NotesPanel
│   │   └── README.md
│   └── search/                   # SearchPalette (Cmd+K)
│       └── README.md
├── lib/
│   ├── data/                     # Data-fetching abstraction layer
│   │   ├── courses.ts            # getCourses(), getCourse(slug), searchCourses()
│   │   ├── lessons.ts            # getLessons(), getLesson(slug)
│   │   ├── labs.ts               # getLabs(), getLab(slug), searchLabs()
│   │   ├── progress.ts           # getProgress(), updateProgress(), getStreak()
│   │   ├── bookmarks.ts          # getBookmarks(), toggleBookmark()
│   │   ├── notes.ts              # getNotes(), saveNote(), deleteNote()
│   │   ├── notifications.ts     # getNotifications(), markRead()
│   │   └── mock-data.ts          # Seed/mock data for development
│   ├── auth.ts                   # Auth abstraction (getCurrentUser, requireAuth)
│   ├── config.ts                 # App-wide constants, feature flags, layout dimensions
│   ├── types.ts                  # Shared TypeScript interfaces (all JSDoc'd)
│   ├── utils.ts                  # cn() and helpers
│   └── validations.ts            # Zod schemas for forms (login, signup, quiz, profile, settings)
├── hooks/
│   ├── use-sidebar.ts
│   ├── use-theme.ts
│   ├── use-reduced-motion.ts
│   ├── use-progress.ts
│   ├── use-search.ts             # Cmd+K palette state
│   └── use-bookmark.ts           # Bookmark toggle with optimistic UI
├── providers/
│   ├── theme-provider.tsx        # next-themes ThemeProvider wrapper
│   └── root-provider.tsx         # Composes all providers
├── middleware.ts                 # Route protection (redirect unauthenticated users from /dashboard/* to /login)
├── __tests__/
│   └── pages/                    # Playwright page tests
└── public/
    ├── favicon.ico
    ├── og-image.png              # Default Open Graph image (1200x630)
    └── logo.svg
```

## Middleware

Protect dashboard routes from unauthenticated access:

```ts
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Auth check will be implemented when backend is connected
  // For now, allow all requests through
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/courses/:path*", "/labs/:path*", "/progress/:path*", "/settings/:path*", "/profile/:path*", "/bookmarks/:path*", "/notifications/:path*"],
};
```

## Root Layout

The root layout wires up fonts, providers, and global UI:

```tsx
// app/layout.tsx
import { Inter, JetBrains_Mono } from "next/font/google";
import { RootProvider } from "@/providers/root-provider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: { default: "GWTH.ai | Learn to Build with AI", template: "%s | GWTH.ai" },
  description: "Master AI development with hands-on courses, labs, and real-world projects.",
  metadataBase: new URL("https://gwth.ai"),
  openGraph: {
    title: "GWTH.ai | Learn to Build with AI",
    description: "Master AI development with hands-on courses, labs, and real-world projects.",
    url: "https://gwth.ai",
    siteName: "GWTH.ai",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <RootProvider>
          {children}
          <Toaster richColors position="bottom-right" />
        </RootProvider>
      </body>
    </html>
  );
}
```

## Form Validation Patterns

Use react-hook-form + zod for all forms:

```tsx
// lib/validations.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const quizAnswerSchema = z.object({
  questionId: z.string(),
  selectedOption: z.number().min(0),
});

export type LoginFormData = z.infer<typeof loginSchema>;
```

```tsx
// In a form component — use shadcn/ui Form component
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/validations";

const form = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: "", password: "" },
});
```

## Empty States

Every list page must handle the "nothing here yet" case:

```tsx
<EmptyState
  icon={BookOpen}
  title="No courses yet"
  description="You haven't enrolled in any courses. Browse our catalog to get started."
  action={{ label: "Browse Courses", href: "/courses" }}
/>
```

## Phase 1 Deliverables (build this first)

### Foundation
1. Project scaffolding: Next.js 16, React 19, Tailwind v4, shadcn/ui, Motion, Sonner, next-themes, react-hook-form, zod, Shiki, Vitest
2. Theme setup: `globals.css` with all GWTH Student tokens (light + dark mode), `next/font/google` for Inter + JetBrains Mono
3. Root layout with `RootProvider` (ThemeProvider + any future providers), `Toaster`, font variables
4. `lib/config.ts` with all layout dimensions, animation defaults, app constants
5. TypeScript interfaces for all domain types in `lib/types.ts` — every field JSDoc'd (Course, Lesson, Lab, Progress, Streak, Bookmark, Note, Certificate, Notification, User)
6. Zod schemas in `lib/validations.ts` for all forms (login, signup, profile, settings, quiz)
7. Mock data layer in `lib/data/` with realistic seed data (3 courses, 15+ lessons, 5 labs, streaks, bookmarks, notifications)
8. Auth stub: mock user, `getCurrentUser()` that returns a fake user
9. `middleware.ts` with route protection stubs
10. Root `error.tsx`, `not-found.tsx`, and `loading.tsx`
11. ESLint flat config matching ACG project

### Pages
12. Landing page with animated hero section (glowing orbs, scroll reveals, staggered features), JSON-LD structured data
13. Dashboard layout: collapsible sidebar with layout animation + header + breadcrumb + content area
14. Dashboard page: course cards with progress rings, recent activity, study streak calendar, bookmarked items
15. Course detail page: sections accordion with lesson list and status badges, `generateMetadata`
16. **Lesson viewer**: the core page with Learn/Build/Quiz tabs, video (dynamic import), Shiki code blocks, notes panel, prev/next navigation, mark complete with optimistic UI
17. Labs listing with filters (URL search params for category, difficulty, search) and lab viewer pages
18. Progress page with animated charts, certificates section
19. Settings page with dark mode toggle (next-themes), notification preferences
20. Login/signup pages with react-hook-form + zod validation
21. Bookmarks page, notifications page
22. Search palette (Cmd+K) accessible from any page

### Quality
23. `README.md` in each component directory explaining what's inside
24. Component tests for `CourseCard`, `ProgressRing`, `StatusBadge`, `QuizEngine`, `EmptyState`
25. Playwright visual tests for landing page, dashboard, and lesson viewer (light + dark, desktop + mobile)
26. axe-core accessibility checks passing on all pages
27. `sitemap.ts` and `robots.ts` for SEO
28. `.env.local.example` documenting required environment variables

## Important Notes

- This is a FRESH project. Do not copy v1 code — rebuild properly.
- **No backend dependencies.** No database ORM, no auth library, no payment SDK. Build the entire frontend against mock data and abstract interfaces. The backend will be chosen and integrated separately.
- **Robust architecture.** Error boundaries on every route group. Loading skeletons on every page. Graceful fallbacks for missing media. No component should crash the page.
- **Well-documented.** JSDoc on every export. README per component module. Inline comments explaining *why*, not *what*. The codebase should be understandable by a new developer without a walkthrough.
- All colors must use CSS custom properties. Never hardcode hex values in components.
- Support light/dark mode from day one. Every component must work in both. Use `next-themes` ThemeProvider.
- Mobile-first responsive design. The lesson viewer should work on phones (sidebar becomes a sheet).
- Use the design system background effects on the landing page hero section.
- All test files live next to their source files (`component.tsx` -> `component.test.tsx`).
- Use `next/image` for all images. Use `next/font/google` for fonts. Use `next/dynamic` for heavy components.
- Every list page must have an `<EmptyState>` fallback.
- Every filterable list must sync filters to URL search params (so users can share/bookmark filtered views).
- Use Sonner `toast()` for user feedback on actions (lesson completed, quiz submitted, bookmark toggled).
- Use `AlertDialog` for destructive or irreversible actions (submit quiz, reset progress).

## Beads Issue Tracking

This project uses [Beads (bd)](https://github.com/steveyegge/beads) for persistent agent memory across sessions.

### Core Rules

- Track all non-trivial work in Beads (never use markdown TODOs or comment-based task lists for multi-session work)
- Use `bd ready` to find available work at session start
- Use `bd create` to track new issues/tasks/bugs discovered during work
- Use `bd sync` at end of session to persist state to git
- The SessionStart hook auto-runs `bd prime` — you get context for free

### Quick Reference

```bash
bd prime                              # Load complete workflow context (auto-runs on session start)
bd ready                              # Show issues ready to work (no blockers)
bd list --status=open                 # List all open issues
bd create --title="..." --type=task   # Create new issue
bd update <id> --status=in_progress   # Claim work
bd close <id>                         # Mark complete
bd dep add <issue> <depends-on>       # Add dependency
bd sync                               # Sync with git remote
```

### "Land the Plane" Protocol

When ending a session (or when David says "Land the Plane"):

1. Close completed Beads issues: `bd close <id>` for each finished item
2. File remaining discovered work as new issues: `bd create --title="..." --type=task`
3. Run quality gates: `npm test` (this project) or appropriate test command
4. Commit and push everything
5. Sync Beads state: `bd sync`
6. Summarize: what was done, what's next, known problems

### Dolt Server Dependency

Beads requires a running Dolt SQL server on port 3307. If `bd` commands fail with connection errors:
```bash
# Start the Dolt server
C:\Users\david\AppData\Local\beads\start-dolt.bat
```
