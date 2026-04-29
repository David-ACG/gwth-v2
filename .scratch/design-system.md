---
paths:
  - "src/components/**/*.tsx"
  - "src/app/**/*.css"
  - "src/app/globals.css"
---

<!-- SENTINEL: rule=design-system, salt=ds-9P4m -->

# Design System

Loaded automatically when editing components or CSS. Always-on architecture rules (RSC defaults, JSDoc, naming, a11y) live in `CLAUDE.md`.

All colors use OKLCH format in CSS custom properties defined in `src/app/globals.css`. The theme defaults to **light mode** (set in `src/providers/theme-provider.tsx`). Users can toggle via the sun/moon icon in the dashboard header.

## Theme Colors (OKLCH — CSS custom properties)

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

## Typography

- **Headings + Body:** Inter (via `next/font/google`, variable `--font-inter`)
- **Code blocks:** JetBrains Mono (via `next/font/google`, variable `--font-jetbrains`)
- **Corners:** rounded (`--radius: 0.625rem`)
- **Shadows:** subtle
- **Animations:** subtle, not flashy

## Font Loading

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

## Layout Dimensions

- Sidebar width: 280px (collapsed: 64px)
- Header height: 64px
- Content max-width: 1400px

## Background Effects — Cascading Spiral Windmill

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

## Route Transition Indicator

A `RouteProgress` component (`src/components/shared/route-progress.tsx`) renders on every client-side navigation:

- Top-of-page gradient bar (primary-to-accent) that animates from 0% to 100% width
- Small SVG spinner in the top-right corner
- Both auto-dismiss after 500ms
- Wired into the root layout (`src/app/layout.tsx`)

## Loading Spinners

The `Spinner` and `PageSpinner` components (`src/components/shared/spinner.tsx`) are used in all `loading.tsx` files:

- **`Spinner`** — dual-ring SVG spinner with primary outer arc and accent inner arc (counter-rotating). Configurable size.
- **`PageSpinner`** — full-page centered spinner with "Loading..." text, used for root and public loading states.
- Dashboard loading states combine the small spinner with skeleton placeholders.

Custom CSS animations in `globals.css`:

- `.animate-spin-reverse` — reverse rotation at 1.2s for the inner ring
- `.animate-progress` — 0-to-100% width animation for the route transition bar

## Additional Background Effects

- Frosted glass: `backdrop-filter: blur(12px)` with semi-transparent bg (used in public nav header)
- Gradient backdrop: `bg-gradient-to-br from-primary/5 via-transparent to-accent/5` (hero section base)

## Image Optimization

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
