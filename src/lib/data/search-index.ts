import "server-only"

import { getCourses } from "@/lib/data/courses"
import { getModelLabs } from "@/lib/data/model-lab"
import { getLessons } from "@/lib/data/lessons"
import { mockNewsArticles } from "@/lib/data/mock-data"
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

/** The four groups the palette renders, in render order. */
export interface SearchIndex {
  courses: SearchEntry[]
  lessons: SearchEntry[]
  labs: SearchEntry[]
  news: SearchEntry[]
}

/**
 * An index with nothing in it, for callers who must not receive one.
 *
 * App Router renders a layout IN PARALLEL with its page, so a layout that
 * builds this index unconditionally hands every course and lab title to any
 * caller who reaches the layout — including one holding a forged session
 * cookie, whose gated PAGE renders nothing. Titles are not bodies, but they
 * are the syllabus, and enumerable slugs are what make the ungated
 * media.gwth.ai origin addressable. The layout therefore checks
 * `canViewPrivateContent()` and passes this instead.
 */
export const EMPTY_SEARCH_INDEX: SearchIndex = {
  courses: [],
  lessons: [],
  labs: [],
  news: [],
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
 * index here and pass it down as props. Content bodies never enter the client
 * module graph.
 *
 * SOURCE (gwth-launch-4fg): this reads the DATA LAYER, not the bundled mock
 * arrays. It used to map `mockCourses`/`mockLabs` directly, so on gwth.ai —
 * where `DATABASE_URL` is set and the database is the only catalogue source
 * for every other surface — the palette offered the mock syllabus. Whatever it
 * listed that the database does not carry navigated to a 404, and whatever the
 * database carries that the mock set does not was unfindable. `getCourses`,
 * `getCourses` and `getLessons` already fall back to the mock arrays in mock mode,
 * so the no-database path is unchanged. Labs come from the Model Lab
 * export (`getModelLabs`), the six pages /labs actually serves.
 *
 * Lessons are in the index because the palette has always said "Search
 * lessons, labs, pages..." and never carried one. `getLessons` applies the N6
 * edition gate, so a learner is only offered lessons their effective edition
 * actually serves — the same set the course page shows them.
 *
 * `ENABLE_NEWS` is applied here rather than in the JSX: gating only the JSX
 * left the article array in the bundle because the import itself could not be
 * tree-shaken.
 *
 * `server-only` makes a future client import a build error rather than a
 * silent regression of the same leak.
 */
export async function getSearchIndex(): Promise<SearchIndex> {
  const courseList = await getCourses()

  // One request per course, in parallel. There is one course today; the shape
  // is per-course because `getLessons` is keyed by course slug and the edition
  // gate it applies is resolved per course.
  const lessonsByCourse = await Promise.all(
    courseList.map(async (course) => ({
      courseSlug: course.slug,
      lessons: await getLessons(course.slug),
    }))
  )

  return {
    courses: courseList.map((course) => ({
      id: course.id,
      title: course.title,
      href: `/course/${course.slug}`,
    })),
    lessons: lessonsByCourse.flatMap(({ courseSlug, lessons }) =>
      lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        href: `/course/${courseSlug}/lesson/${lesson.slug}`,
      }))
    ),
    // The six Model Lab pages (2026-10-21). The 23 tiered practise labs that
    // getLabs() still returns were retired in July and are no longer served
    // at /labs/<slug>, so they are not offered here.
    labs: getModelLabs().map((lab) => ({
      id: `model-lab-${lab.sp}`,
      title: `${lab.sp_name} lab: ${lab.headline}`,
      href: `/labs/${lab.sp}`,
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
