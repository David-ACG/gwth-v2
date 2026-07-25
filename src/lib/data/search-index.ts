import "server-only"

import { mockCourses, mockLabs, mockNewsArticles } from "@/lib/data/mock-data"
import { ENABLE_NEWS } from "@/lib/config"

/**
 * One navigable entry in the Cmd+K palette. Deliberately three scalar fields:
 * the palette renders a title and navigates to a href, and nothing else.
 */
export interface SearchEntry {
  /** Stable React key. */
  id: string
  /** Display label, also the value the fuzzy matcher scores against. */
  title: string
  /** Destination route. */
  href: string
}

/** The three groups the palette renders, in render order. */
export interface SearchIndex {
  courses: SearchEntry[]
  labs: SearchEntry[]
  news: SearchEntry[]
}

/**
 * Builds the palette's navigation index on the server (W25).
 *
 * `search-palette.tsx` used to import `mockCourses`/`mockLabs`/
 * `mockNewsArticles` at module scope from a CLIENT component. That pulled
 * `src/lib/data/m1-labs.ts` (308 KB of full Month-1 lab markdown, including
 * every `instructions[].content` step) and the full news article bodies into a
 * 361 KB `/_next/static` chunk, which is served straight off the static
 * handler: the proxy matcher excludes `_next/static`, so no route guard and no
 * page-level gate can reach it. Real lab prose was downloadable by anyone who
 * fetched the chunk.
 *
 * The palette only ever reads id/title/slug, so the fix is to build a slim
 * index here (~33 entries, a couple of KB) and pass it down as props. Content
 * bodies never enter the client module graph.
 *
 * `ENABLE_NEWS` is applied here rather than in the JSX: gating only the JSX
 * left the article array in the bundle because the import itself could not be
 * tree-shaken.
 *
 * `server-only` makes a future client import a build error rather than a
 * silent regression of the same leak.
 */
export function getSearchIndex(): SearchIndex {
  return {
    courses: mockCourses.map((course) => ({
      id: course.id,
      title: course.title,
      href: `/course/${course.slug}`,
    })),
    labs: mockLabs.map((lab) => ({
      id: lab.id,
      title: lab.title,
      href: `/labs/${lab.slug}`,
    })),
    news: ENABLE_NEWS
      ? mockNewsArticles
          .filter((article) => article.status === "published")
          .map((article) => ({
            id: article.id,
            title: article.title,
            href: `/news/${article.slug}`,
          }))
      : [],
  }
}
