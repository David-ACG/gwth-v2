# Search Components

Global search, reachable from any dashboard page: the header's Search button,
its narrow-screen icon twin, or Cmd+K / Ctrl+K.

## Components

### `SearchPalette` (`search-palette.tsx`)
Command palette dialog built on shadcn's `CommandDialog` (which wraps cmdk) for
fuzzy matching. Four result groups:
- **Course** -- every course the catalogue serves.
- **Lessons** -- every lesson of every course, filtered to the caller's
  effective syllabus edition (N6), linking to
  `/course/<courseSlug>/lesson/<lessonSlug>`.
- **Labs** -- every published lab.
- **Quick links** -- Dashboard, Progress, Bookmarks, Settings, Profile.

(A **News** group exists in the index and renders when `ENABLE_NEWS` is on. It
is off.)

Selecting an item navigates to its page, closes the dialog and clears the
query, so reopening never starts on the last search.

## The index

The palette does NOT read content modules. `getSearchIndex()` in
`src/lib/data/search-index.ts` is `server-only`, builds a slim id/title/href
index from the data layer (`getCourses`, `getLessons`, `getLabs`) and the
dashboard layout passes it down as a prop. Two reasons, both load-bearing:

- **W25:** importing the content modules from this client component shipped
  308 KB of real lab prose into a public `/_next/static` chunk that no route
  guard can protect.
- **gwth-launch-4fg:** the index used to map the bundled mock arrays, so on
  gwth.ai, where the database is the only catalogue source every other surface
  reads, the palette offered a syllabus the site does not serve.

A caller who fails the W25 content gate gets `EMPTY_SEARCH_INDEX` instead, so
layout-level rendering cannot leak the syllabus to an unauthenticated visitor.

## Relevance

`search-score.ts` replaces cmdk's default scorer, which matched a SUBSEQUENCE -
the query's letters in order, anywhere. On this catalogue that put six
unrelated lessons above the one real hit for "spread" (gwth-launch-4fg). Every
word of the query must now appear in the title; a whole word beats the start of
a word beats one buried mid-word, and position only breaks ties. The scorer
reaches cmdk through a `filter` prop that `CommandDialog` forwards to
`Command`.

## Open state

`useSearch()` (`src/hooks/use-search.ts`) is a module-level store read through
`useSyncExternalStore`, the same shape as `use-sidebar.ts`. It has to be shared
rather than per-component: when it was a plain `useState`, the header and the
palette each held a private copy and the header's button opened nothing
(gwth-launch-4fg). The Cmd+K / Escape key listener is bound once for the store,
not once per hook instance, or two consumers would toggle it twice and cancel
each other out.

## Feature flag

`ENABLE_SEARCH` in `src/lib/config.ts` gates both header triggers and the
palette itself, so turning it off removes the entry points rather than leaving
a button that does nothing.

## Main Entry Points

- `SearchPalette` is rendered once in `src/app/(dashboard)/layout.tsx`.
- `DashboardHeader` triggers it via `useSearch().open`.
- `src/components/search/search-palette.test.tsx` renders the real header beside
  the real palette, because the regression above is invisible to any test that
  renders the palette alone.
