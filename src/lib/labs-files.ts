/**
 * Headers for the files AI models wrote, served from `public/labs-files/`
 * (the Model Lab answers: web apps, charts, screenshots and markdown).
 *
 * Those files are not ours. A Building answer is a whole web page with its own
 * scripts, and a chart is an SVG, which can carry script too. Opened straight
 * from "Try it" in a new tab, on this origin, either could read this site's
 * cookies and call its API as the visitor. The policy below stops that:
 *
 * - `sandbox allow-scripts allow-forms allow-modals` runs the document in an
 *   OPAQUE origin (no `allow-same-origin`), so it shares nothing with gwth.ai:
 *   no cookies, no storage, no same-origin requests;
 * - `connect-src 'none'` gives it no network at all (fetch, XHR, WebSocket,
 *   beacons), so nothing typed into an app can be sent anywhere;
 * - `default-src 'self' 'unsafe-inline' data: blob:` lets the single-file apps
 *   run their own inline script and styles and nothing from elsewhere.
 *
 * It is the policy the Model Lab preview server used (spotcheck/server.py),
 * plus the sandbox. In the lab pages the same files sit in iframes with
 * `sandbox="allow-scripts allow-forms allow-modals"` and never
 * `allow-same-origin`. The header is applied twice on purpose: by
 * `next.config.ts` for every file under the path, and by `src/proxy.ts`, which
 * would otherwise overwrite it with the site-wide policy on the files it sees.
 */

/** The URL prefix the exported files are served under. */
export const LABS_FILES_PREFIX = "/labs-files/"

/** The Content-Security-Policy for every file under {@link LABS_FILES_PREFIX}. */
export const LABS_FILES_CSP =
  "sandbox allow-scripts allow-forms allow-modals; default-src 'self' 'unsafe-inline' data: blob:; connect-src 'none'"

/**
 * The `headers()` entry for next.config.ts.
 */
export const LABS_FILES_HEADERS = {
  source: "/labs-files/:path*",
  headers: [
    { key: "Content-Security-Policy", value: LABS_FILES_CSP },
    { key: "X-Content-Type-Options", value: "nosniff" },
  ],
}

/**
 * Whether a request path is one of the model-written files.
 */
export function isLabsFilePath(pathname: string): boolean {
  return pathname.startsWith(LABS_FILES_PREFIX)
}

/**
 * The retired Model Arena lab slugs and the Model Lab page that replaced each.
 */
export const MODEL_ARENA_REDIRECTS: { source: string; destination: string; permanent: true }[] = [
  { source: "/labs/job-advert-claude-vs-chatgpt", destination: "/labs/content", permanent: true },
  { source: "/labs/messy-spreadsheet-claude-vs-chatgpt", destination: "/labs/data", permanent: true },
  { source: "/labs/cite-your-sources-claude-vs-chatgpt", destination: "/labs/research", permanent: true },
  { source: "/labs/automate-a-weekly-chore-claude-vs-chatgpt", destination: "/labs/automation", permanent: true },
]

/**
 * The six Model Lab page slugs, in menu order. Kept here, in a module with no
 * data, so the proxy can answer an unknown /labs/<slug> with a real 404
 * without importing the lab files (`lib/data/model-lab.ts` re-uses this list).
 */
export const MODEL_LAB_PAGE_SLUGS = [
  "research",
  "content",
  "thinking",
  "building",
  "data",
  "automation",
] as const

/**
 * Whether a path is /labs/<slug> for a slug that is not one of the six labs.
 *
 * The page calls notFound() for these, but it renders under a streaming
 * layout, so by then the status line has gone out as 200. The proxy decides
 * it first, the same way it does for the pages judged Hide. Deeper paths
 * (the answer route) answer their own 404.
 */
export function isUnknownLabPath(pathname: string): boolean {
  const m = /^\/labs\/([^/]+)\/?$/.exec(pathname)
  if (!m) return false
  return !(MODEL_LAB_PAGE_SLUGS as readonly string[]).includes(decodeURIComponent(m[1]!))
}
