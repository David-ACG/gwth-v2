---
paths:
  - "src/app/**/*.ts"
  - "src/app/**/*.tsx"
---

<!-- SENTINEL: rule=routing, salt=rt-3Q8w -->

# Routing — Pages, Routes, SEO

Loaded automatically when editing files under `src/app/**`.

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

## Route group structure

Route groups for `(public)`, `(auth)`, `(dashboard)` layouts. Each route group gets:
- An `error.tsx` that catches rendering errors and shows a user-friendly fallback with a retry button
- A `loading.tsx` with skeleton UI matching the page layout

Every dynamic route (`[slug]`) must handle missing data gracefully with `notFound()` from `next/navigation`. Provide a custom `app/not-found.tsx`.

## File structure detail (under `src/app/`)

```
src/app/
├── (public)/
│   ├── page.tsx              # Landing
│   ├── pricing/page.tsx
│   ├── about/page.tsx
│   ├── layout.tsx            # Public nav + footer
│   ├── loading.tsx
│   └── error.tsx
├── (auth)/
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── forgot-password/page.tsx
│   └── layout.tsx            # Centered card layout
├── (dashboard)/
│   ├── dashboard/page.tsx
│   ├── courses/page.tsx
│   ├── course/[slug]/
│   │   ├── page.tsx          # Course overview
│   │   ├── loading.tsx
│   │   ├── not-found.tsx
│   │   └── lesson/[lessonSlug]/
│   │       ├── page.tsx      # Lesson viewer
│   │       ├── loading.tsx
│   │       └── not-found.tsx
│   ├── labs/
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   └── [slug]/
│   │       ├── page.tsx
│   │       ├── loading.tsx
│   │       └── not-found.tsx
│   ├── progress/page.tsx
│   ├── bookmarks/page.tsx
│   ├── notifications/page.tsx
│   ├── profile/page.tsx
│   ├── settings/page.tsx
│   ├── layout.tsx            # Sidebar + header layout
│   ├── loading.tsx
│   └── error.tsx
├── sitemap.ts                # Auto-generated sitemap
├── robots.ts                 # Robots.txt
├── error.tsx                 # Root error boundary
├── not-found.tsx             # Root 404 page
├── globals.css
└── layout.tsx                # Root layout (fonts, ThemeProvider, Toaster)
```

## SEO & Metadata

**Dynamic metadata.** Use `generateMetadata` for every page with dynamic content:

```tsx
export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
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

**Structured data.** Add JSON-LD for courses (Google understands `Course` schema):

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Course",
      name: course.title,
      description: course.description,
      provider: { "@type": "Organization", name: "GWTH.ai" },
    }),
  }}
/>
```

**Sitemap & robots.** Generate `sitemap.xml` via `app/sitemap.ts` and `robots.txt` via `app/robots.ts` using Next.js conventions.

## Performance — page-level

**Dynamic imports for heavy components.** Video player, quiz engine, chart libraries, and syntax highlighter should use `next/dynamic` with loading fallbacks:

```tsx
const VideoPlayer = dynamic(
  () => import("@/components/shared/video-player"),
  {
    loading: () => <Skeleton className="aspect-video w-full" />,
  },
);
```

**Core Web Vitals targets:** LCP < 2.5s, INP < 200ms, CLS < 0.1. Avoid layout shifts from loading content. Use `sizes` prop on images.

**Streaming & Suspense.** Use `loading.tsx` and `<Suspense>` for progressive loading.

**Optimistic UI** for progress tracking (mark complete, quiz submit). Use `useOptimistic` from React 19.

**Mobile-first responsive design.** The lesson viewer sidebar becomes a Sheet on mobile.

## URL search params

Every filterable list must sync filters to URL search params (so users can share/bookmark filtered views).
