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

Selecting an item navigates to its page and closes the dialog. The query is
cleared on the CLOSED transition, wherever the close came from: the dialog
reports its own dismissals (Escape, the X, a click outside) but a close driven
by the store - a second press of Cmd+K - does not, and clearing only on the
first path left the palette reopening pre-filtered to a forgotten query.

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
Every group is therefore rendered only when it has rows: that caller used to
open the palette onto a "Course" heading and a "Labs" heading with nothing
underneath either, which is the same headline-over-nothing the whole bug was
about.

## Relevance

`search-score.ts` replaces cmdk's default scorer, which matched a SUBSEQUENCE -
the query's letters in order, anywhere. On this catalogue that put six
unrelated lessons above the one real hit for "spread" (gwth-launch-4fg). Every
word of the query must now be accounted for in the title, in one of four
tiers: a whole word, the start of a word, an inflection of a word that is there
("prompts" for "Prompt"), then one buried mid-word. Position only breaks ties.
The inflection tier is not optional politeness - without it "prompts", "emails"
and "hallucinations" all returned nothing against the real catalogue while
lessons about each sat in the index - but it is deliberately narrow: at most
three added letters onto a stem of at least three, so "prompts" cannot latch
onto a title word "pro". The scorer reaches cmdk through a `filter` prop that
`CommandDialog` forwards to `Command`.

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
