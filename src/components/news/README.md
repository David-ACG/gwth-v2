# News Components

Components for the public news feed (`/news`) and article detail pages (`/news/[slug]`).

## Components

### `NewsCard` (`news-card.tsx`)
Card for the news feed grid. Shows upvote button, category badge, title, excerpt, tags, optional "Now a Lab!" badge, author, timestamp, and comment count. Used on the news feed page.

### `UpvoteButton` (`upvote-button.tsx`)
Toggle vote button with optimistic UI via the `useVote` hook. Shows a login prompt toast for unauthenticated users. Client component.

### `NewsFilters` (`news-filters.tsx`)
Filter bar with sort tabs (Hot/New/Top), category dropdown, and search input. Syncs all state to URL search params for shareable filtered views. Client component.

### `LabBadge` (`lab-badge.tsx`)
Small badge linking to the lab created from a news article. Only rendered when `labSlug` is set. Server component.

### `NewsCommentSection` (`news-comment-section.tsx`)
Threaded comment section with add/reply/delete functionality. Uses react-hook-form + zod for validation. Client component.

## Main Entry Points

- `NewsCard` is used on the news feed page and in the search palette.
- `NewsFilters` is used on the news feed page.
- `NewsCommentSection` is used on the article detail page.

## Data

News data is served from `lib/data/news.ts` with functions: `getNews()`, `getNewsArticle()`, `getNewsFilters()`, `getUserVotes()`, `toggleVote()`, `getNewsComments()`, `addNewsComment()`, `deleteNewsComment()`.
