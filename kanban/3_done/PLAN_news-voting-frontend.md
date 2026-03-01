# Plan: News & Voting System — Frontend (Next.js on gwth.ai)

## Overview

Public-facing news section on gwth.ai where visitors browse AI/tech news and authenticated users upvote items. Top-voted items inform which labs to build. Follows all existing GWTH v2 patterns (data abstraction, component modules, loading/error states, SEO metadata).

---

## Routes

```
src/app/(public)/news/
├── page.tsx                    # News feed — Hot/New/Top sort, category filters
├── loading.tsx                 # Skeleton grid of news cards
├── error.tsx                   # Error boundary with retry
└── [slug]/
    ├── page.tsx                # Article detail — content, votes, comments
    ├── loading.tsx             # Article skeleton
    └── not-found.tsx           # 404 for bad slugs
```

All routes are in the `(public)` group — no authentication required to read. Voting and commenting require auth (handled in components with login prompts).

---

## Page: `/news` — News Feed

### URL Search Params (synced to URL for shareability)
- `sort` — `hot` (default) | `new` | `top`
- `category` — `ai-launch` | `research` | `tool` | `industry` | `tutorial`
- `tag` — any tag string (e.g. `claude`, `agents`)
- `page` — pagination (default 1)

### Layout
```
┌─────────────────────────────────────────────────┐
│  Public Nav (existing)          [News] active    │
├─────────────────────────────────────────────────┤
│                                                  │
│  AI & Tech News                                  │
│  Vote on what matters. We build labs for the     │
│  topics you care about.                          │
│                                                  │
│  [Hot] [New] [Top]    [All Categories ▼]         │
│                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │ ▲  42    │ │ ▲  38    │ │ ▲  27    │         │
│  │ thumb    │ │ thumb    │ │ thumb    │         │
│  │ title    │ │ title    │ │ title    │         │
│  │ excerpt  │ │ excerpt  │ │ excerpt  │         │
│  │ tags     │ │ tags     │ │ [LAB]    │         │
│  │ 3h ago   │ │ 1d ago   │ │ 2d ago   │         │
│  └──────────┘ └──────────┘ └──────────┘         │
│                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │ ...      │ │ ...      │ │ ...      │         │
│  └──────────┘ └──────────┘ └──────────┘         │
│                                                  │
│  [← Prev]  Page 1 of 3  [Next →]                │
│                                                  │
├─────────────────────────────────────────────────┤
│  Footer (existing)                               │
└─────────────────────────────────────────────────┘
```

### Grid Layout
- **Desktop:** 3 columns, 4 rows = 12 items per page
- **Tablet:** 2 columns
- **Mobile:** 1 column

### SEO
```tsx
export const metadata: Metadata = {
  title: "AI & Tech News",
  description: "Latest AI and tech news curated for developers. Vote on topics to shape our lab curriculum.",
  openGraph: {
    title: "AI & Tech News | GWTH.ai",
    description: "Vote on the AI topics that matter to you.",
  },
};
```

---

## Page: `/news/[slug]` — Article Detail

### Layout
```
┌─────────────────────────────────────────────────┐
│  Public Nav                                      │
├─────────────────────────────────────────────────┤
│                                                  │
│  ← Back to News                                  │
│                                                  │
│  [ai-launch]  [claude] [anthropic] [agents]      │
│                                                  │
│  Claude Can Now Control Your                     │
│  Computer Remotely                               │
│                                                  │
│  By David · 3 hours ago · 42 votes · 8 comments │
│                                                  │
│  ┌─────────────────────────────────────────┐     │
│  │  ▲  42  Upvote this topic               │     │
│  │     "We'll build a lab if this trends!" │     │
│  └─────────────────────────────────────────┘     │
│                                                  │
│  [Article content rendered as Markdown]          │
│  ...                                             │
│  ...                                             │
│                                                  │
│  ┌─────────────────────────────────────────┐     │
│  │  🔬 This topic is now a lab!            │     │
│  │  [Try the Claude Remote Control Lab →]  │     │
│  └─────────────────────────────────────────┘     │
│                                                  │
│  ── Comments (8) ──                              │
│                                                  │
│  [Add a comment...]                              │
│                                                  │
│  Alex · 2h ago                                   │
│  "This is huge for automation workflows..."      │
│    └ Reply                                       │
│                                                  │
│  Sarah · 1h ago                                  │
│  "Would love a lab on this!"                     │
│    └ Reply                                       │
│                                                  │
├─────────────────────────────────────────────────┤
│  Footer                                          │
└─────────────────────────────────────────────────┘
```

### SEO (dynamic metadata)
```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getNewsArticle(params.slug);
  if (!article) return { title: "Article Not Found" };
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.thumbnail_url ? [{ url: article.thumbnail_url }] : [],
      type: "article",
      publishedTime: article.published_at,
      tags: article.tags,
    },
  };
}
```

### JSON-LD Structured Data
```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": article.title,
  "description": article.excerpt,
  "datePublished": article.published_at,
  "author": { "@type": "Person", "name": article.author },
  "publisher": { "@type": "Organization", "name": "GWTH.ai" },
  "interactionStatistic": {
    "@type": "InteractionCounter",
    "interactionType": "https://schema.org/LikeAction",
    "userInteractionCount": article.vote_count,
  },
}) }} />
```

---

## Components

### `components/news/` directory

#### `news-card.tsx` — Card for the news feed grid

Props:
```typescript
interface NewsCardProps {
  /** The news article to display */
  article: NewsArticle;
  /** Whether the current user has voted on this article */
  hasVoted: boolean;
  /** Called when upvote button is clicked (undefined = show login prompt) */
  onVote?: (articleId: string) => void;
}
```

Structure:
- Upvote button (left side or top, prominent)
- Thumbnail image (next/image with blur placeholder)
- Category badge (colored by category)
- Title (link to `/news/[slug]`)
- Excerpt (2-3 lines, truncated)
- Tags as small pills
- "Now a Lab!" badge if `lab_slug` is set (links to lab)
- Relative timestamp ("3h ago", "2d ago")
- Comment count icon

Animation:
- `whileHover` subtle lift + shadow (Motion)
- Staggered entrance when grid loads (`staggerChildren`)
- Upvote button scale animation on click

#### `upvote-button.tsx` — The core voting interaction

Props:
```typescript
interface UpvoteButtonProps {
  /** Article ID to vote on */
  articleId: string;
  /** Current vote count */
  voteCount: number;
  /** Whether current user has already voted */
  hasVoted: boolean;
  /** Size variant */
  size?: "sm" | "lg";
}
```

Behaviour:
- **Not logged in:** Click opens login dialog/redirect with return URL
- **Logged in, not voted:** Click adds vote (optimistic +1, primary color)
- **Logged in, already voted:** Click removes vote (optimistic -1, muted color)
- Uses React 19 `useOptimistic` for instant UI feedback
- Calls `toggleVote` Server Action
- Toast on error ("Failed to vote. Please try again.")
- Scale animation on click (Motion `whileTap={{ scale: 0.95 }}`)

Visual states:
- **Default:** Muted arrow icon + grey count
- **Voted:** Primary colored arrow + primary count + filled style
- **Pending:** Subtle opacity reduction during server roundtrip

#### `news-filters.tsx` — Sort and category controls

Props:
```typescript
interface NewsFiltersProps {
  /** Current sort option */
  currentSort: NewsSortOption;
  /** Current category filter (null = all) */
  currentCategory: string | null;
  /** Current tag filter (null = all) */
  currentTag: string | null;
}
```

Behaviour:
- Sort tabs: Hot | New | Top (styled like shadcn Tabs)
- Category dropdown: All | AI Launches | Research | Tools | Industry | Tutorials
- Active tag shown as dismissible pill
- All changes update URL search params via `useRouter().push()`
- URL-driven so pages are shareable/bookmarkable

#### `news-comment-section.tsx` — Comments under article

Props:
```typescript
interface NewsCommentSectionProps {
  /** Article ID */
  articleId: string;
  /** Pre-fetched comments */
  comments: NewsComment[];
  /** Whether current user is authenticated */
  isAuthenticated: boolean;
}
```

Features:
- Threaded replies (one level deep — parent + replies)
- Comment form with react-hook-form + zod validation
- "Sign in to comment" prompt for unauthenticated users
- Delete own comment (with AlertDialog confirmation)
- Relative timestamps
- User avatar + name from Supabase auth metadata

#### `lab-badge.tsx` — "Now a Lab!" link badge

```typescript
interface LabBadgeProps {
  /** Lab slug to link to */
  labSlug: string;
}
```

- Green accent badge with flask icon
- Links to `/labs/[slug]`
- Subtle pulse animation to draw attention (Motion)

#### `README.md`

```markdown
# News Components

Components for the `/news` section — a public-facing AI/tech news feed with upvoting.

## Main Components

- **`news-card.tsx`** — Card for the news feed grid. Shows title, excerpt, vote count, category, tags.
- **`upvote-button.tsx`** — Toggle upvote with optimistic UI. Requires auth.
- **`news-filters.tsx`** — Sort (hot/new/top) and category filters. URL-param driven.
- **`news-comment-section.tsx`** — Threaded comments under articles.
- **`lab-badge.tsx`** — Badge linking a news item to its resulting lab.

## Patterns

- Voting uses React 19 `useOptimistic` + Server Actions
- Filters sync to URL search params for shareability
- All data fetched via `lib/data/news.ts` abstraction
- Unauthenticated users see content but get login prompts for voting/commenting
```

---

## Types

Add to `lib/types.ts`:

```typescript
/** Category for news articles */
export type NewsCategory = "ai-launch" | "research" | "tool" | "industry" | "tutorial";

/** Sort option for news feed */
export type NewsSortOption = "hot" | "new" | "top";

/** A curated news article posted by admin */
export interface NewsArticle {
  /** Unique identifier */
  id: string;
  /** URL-friendly slug */
  slug: string;
  /** Article headline */
  title: string;
  /** Short summary for cards (max ~200 chars) */
  excerpt: string;
  /** Full article body in Markdown */
  content: string;
  /** External source URL (e.g. Anthropic blog post) */
  url: string | null;
  /** Content category */
  category: NewsCategory;
  /** Searchable tags */
  tags: string[];
  /** Thumbnail image URL */
  thumbnailUrl: string | null;
  /** Author name */
  author: string;
  /** Denormalized upvote count */
  voteCount: number;
  /** Denormalized comment count */
  commentCount: number;
  /** Slug of lab created from this news item (null if none) */
  labSlug: string | null;
  /** Whether this article is pinned/featured */
  isFeatured: boolean;
  /** Publication status */
  status: "draft" | "published" | "archived";
  /** When the article was published */
  publishedAt: string;
  /** Computed hotness score (from ranked view) */
  hotnessScore?: number;
  /** Record creation time */
  createdAt: string;
  /** Last update time */
  updatedAt: string;
}

/** A user's upvote on a news article */
export interface NewsVote {
  /** Unique identifier */
  id: string;
  /** Article that was voted on */
  articleId: string;
  /** User who voted */
  userId: string;
  /** When the vote was cast */
  createdAt: string;
}

/** A comment on a news article */
export interface NewsComment {
  /** Unique identifier */
  id: string;
  /** Article this comment belongs to */
  articleId: string;
  /** User who wrote the comment */
  userId: string;
  /** Parent comment ID for threaded replies (null = top-level) */
  parentId: string | null;
  /** Comment body in Markdown */
  body: string;
  /** Comment creation time */
  createdAt: string;
  /** Last edit time */
  updatedAt: string;
  /** User display name (joined from auth) */
  userName?: string;
  /** User avatar URL (joined from auth) */
  userAvatar?: string;
}
```

---

## Config

Add to `lib/config.ts`:

```typescript
/** Feature flag for news section */
export const ENABLE_NEWS = true;

/** Number of news articles per page */
export const NEWS_PAGE_SIZE = 12;

/** Default sort for news feed */
export const NEWS_DEFAULT_SORT: NewsSortOption = "hot";

/** News categories with display labels and colors */
export const NEWS_CATEGORIES: Record<NewsCategory, { label: string; color: string }> = {
  "ai-launch": { label: "AI Launch", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  "research": { label: "Research", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  "tool": { label: "Tool", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  "industry": { label: "Industry", color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
  "tutorial": { label: "Tutorial", color: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200" },
};
```

---

## Validation Schemas

Add to `lib/validations.ts`:

```typescript
export const newsCommentSchema = z.object({
  body: z.string()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment must be less than 2000 characters"),
  parentId: z.string().uuid().optional(),
});

export type NewsCommentFormData = z.infer<typeof newsCommentSchema>;
```

---

## Navigation Update

Add "News" to the public nav in `components/layout/public-nav.tsx`:

```typescript
const navLinks = [
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/for-teams", label: "For Teams" },
  { href: "/news", label: "News" },          // ← NEW
  { href: "/tech-radar", label: "Tech Radar" },
];
```

---

## Search Integration

Add news articles to the existing Cmd+K search palette:

```typescript
// In search results, add a "News" category
{
  group: "News",
  items: searchResults.news.map(article => ({
    label: article.title,
    href: `/news/${article.slug}`,
    icon: Newspaper,
    badge: `${article.voteCount} votes`,
  })),
}
```

---

## Loading States

### `/news/loading.tsx` — Feed skeleton
```
[Sort tabs skeleton]  [Category dropdown skeleton]

[Card skeleton] [Card skeleton] [Card skeleton]
[Card skeleton] [Card skeleton] [Card skeleton]
```

Uses `Skeleton` from shadcn/ui matching the news card layout.

### `/news/[slug]/loading.tsx` — Article skeleton
```
[Back link skeleton]
[Badge skeletons]
[Title skeleton - 2 lines]
[Meta line skeleton]
[Vote button skeleton]
[Content skeleton - multiple lines]
```

---

## Empty State

When no articles match filters:

```tsx
<EmptyState
  icon={Newspaper}
  title="No news yet"
  description="Check back soon — we're always tracking the latest AI developments."
/>
```

When filtered and no results:

```tsx
<EmptyState
  icon={Search}
  title="No matching articles"
  description="Try a different category or search term."
  action={{ label: "Clear Filters", href: "/news" }}
/>
```

---

## Sitemap Update

Add news articles to `app/sitemap.ts`:

```typescript
// In generateSitemap()
const newsArticles = await getNews({ sort: "new", limit: 250 });
const newsUrls = newsArticles.articles.map(article => ({
  url: `https://gwth.ai/news/${article.slug}`,
  lastModified: article.updatedAt,
  changeFrequency: "weekly" as const,
  priority: 0.7,
}));
```

---

## RSS Feed (Optional but good for marketing)

Add `app/(public)/news/feed.xml/route.ts`:

```typescript
export async function GET() {
  const { articles } = await getNews({ sort: "new", limit: 50 });

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>GWTH.ai - AI & Tech News</title>
      <link>https://gwth.ai/news</link>
      <description>Latest AI and tech news curated for developers learning to build with AI.</description>
      <atom:link href="https://gwth.ai/news/feed.xml" rel="self" type="application/rss+xml"/>
      ${articles.map(a => `
        <item>
          <title>${escapeXml(a.title)}</title>
          <link>https://gwth.ai/news/${a.slug}</link>
          <description>${escapeXml(a.excerpt)}</description>
          <pubDate>${new Date(a.published_at).toUTCString()}</pubDate>
          <guid>https://gwth.ai/news/${a.slug}</guid>
          <category>${a.category}</category>
        </item>
      `).join("")}
    </channel>
  </rss>`;

  return new Response(rss, {
    headers: { "Content-Type": "application/xml" },
  });
}
```

---

## Accessibility

- Upvote button: `aria-label="Upvote this article"` / `aria-label="Remove your upvote"`
- `aria-pressed` on upvote button reflecting voted state
- Vote count: `aria-live="polite"` so screen readers announce changes
- Category badges: text + color (not colour alone)
- Comment form: proper `label` associations
- Sort tabs: `role="tablist"` with `aria-selected`
- News cards: semantic `<article>` elements
- Focus management: arrow keys navigate card grid (optional enhancement)

---

## Animation (Motion)

- **Card grid:** `staggerChildren: 0.05` on feed load
- **Card hover:** `whileHover={{ y: -2 }}` + shadow increase
- **Upvote click:** `whileTap={{ scale: 0.9 }}` on the arrow icon
- **Vote count change:** `AnimatePresence` number flip (old number exits up, new enters from below)
- **Page transitions:** Fade in/out via existing `AnimatePresence` setup
- **Lab badge:** Subtle pulse (`animate={{ scale: [1, 1.05, 1] }}` with `repeat: Infinity`)
- **All animations:** Respect `prefers-reduced-motion` via `useReducedMotion()`

---

## Implementation Order

### Phase 1: Core (MVP)
1. Add types to `lib/types.ts`
2. Add config to `lib/config.ts`
3. Create `lib/data/news.ts` with mock data initially (3-5 seed articles)
4. Create `components/news/` directory with README
5. Build `news-card.tsx`
6. Build `upvote-button.tsx` (mock toggle, no Supabase yet)
7. Build `news-filters.tsx`
8. Build `/news/page.tsx` with grid, filters, pagination
9. Build `/news/[slug]/page.tsx` with article content
10. Add loading.tsx, error.tsx, not-found.tsx
11. Add "News" to public nav
12. Update sitemap

### Phase 2: Supabase Integration
13. Run database migrations (tables, RLS, functions)
14. Wire `lib/data/news.ts` to Supabase (replace mock data)
15. Create `lib/actions/news.ts` Server Actions
16. Wire upvote-button to real `toggleVote` action
17. Build `news-comment-section.tsx`
18. Wire comment form to real Server Actions
19. Test voting flow end-to-end

### Phase 3: Polish
20. Add lab-badge.tsx + wire lab_slug linking
21. Add to Cmd+K search palette
22. Add RSS feed
23. Add JSON-LD structured data
24. Motion animations (card stagger, vote flip, hover effects)
25. Test light/dark mode
26. Test mobile responsive layout
27. Accessibility audit (axe-core)
28. Component tests for NewsCard, UpvoteButton, NewsFilters

### Phase 4: Marketing
29. Seed 5-10 real news articles
30. Add "Trending on GWTH" widget to landing page (top 3 voted items)
31. Email notification to voters when their topic becomes a lab
32. Social sharing meta tags (OpenGraph images per article)
