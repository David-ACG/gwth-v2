/**
 * Gate-coverage scan (gwth-launch-dgc, N2 security; tightened under
 * gwth-launch-avo, N2 QA defects 1 + 2).
 *
 * The proxy's route guard is presence-only - a forged
 * `better-auth.session_token` cookie passes it - so the security boundary is
 * a server-validated check inside each page component. This test scans the
 * source of every page under the proxy's protected and dev/review prefixes
 * and fails if one is missing its page-level gate, so a future page added
 * under these prefixes cannot ship gated by nothing but the cookie's name.
 *
 * What counts as a gate (QA defect 1): ONLY the checks that validate the
 * session server-side in EVERY mode -
 *   - requireSessionOrRedirect()   (src/lib/content-access.ts)
 *   - requireAdminOrRedirect()     (src/lib/admin.ts)
 *   - redirect(...) as the entire page body (pure redirect pages expose
 *     nothing)
 * requireContentAccessOrRedirect() and canViewPrivateContent() are NOT
 * sufficient: both stop validating the session the moment
 * PRIVATE_CONTENT_MODE=off (the launch state). Pages wanting the content
 * allowlist call requireSessionOrRedirect() FIRST and the content gate after.
 *
 * How the scan reads a page (QA defect 2): comments and string literals are
 * stripped before matching, so `// TODO: add requireSessionOrRedirect()`
 * no longer counts as a gate, and the pure-redirect rule also rejects any
 * `return <JSX>` body, so a page that redirects on one branch while
 * rendering content on another is not blessed.
 *
 * The directory list derives from the proxy's OWN prefix constants
 * (src/lib/protected-routes.ts - QA style note 1): a prefix added to the
 * proxy without a mapping here fails the mapping test instead of silently
 * escaping the scan.
 */
import { describe, expect, it } from "vitest"
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs"
import { join } from "node:path"
import {
  PROTECTED_PATHS,
  DEV_REVIEW_PATHS,
} from "@/lib/protected-routes"

const APP_DIR = join(process.cwd(), "src", "app")

/**
 * Where each proxy prefix's pages live under src/app. Route groups like
 * `(dashboard)` are invisible in the URL, so the mapping cannot be derived
 * mechanically - but the mapping-completeness test below guarantees it can
 * never silently miss a prefix the proxy protects.
 */
const ROUTE_DIR_MAP: Record<string, string[]> = {
  "/admin": ["admin"],
  "/dashboard": ["(dashboard)/dashboard"],
  "/courses": ["(dashboard)/courses"],
  "/course": ["(dashboard)/course"],
  "/progress": ["(dashboard)/progress"],
  "/settings": ["(dashboard)/settings"],
  "/profile": ["(dashboard)/profile"],
  "/bookmarks": ["(dashboard)/bookmarks"],
  "/notifications": ["(dashboard)/notifications"],
  "/guide": ["(dashboard)/guide"],
  "/demo": ["demo"],
  "/logo_picker": ["logo_picker"],
  "/redesign": ["redesign"],
  "/redesign_v2": ["redesign_v2"],
  "/old-design": ["old-design"],
  "/score-card-variants": ["score-card-variants"],
}

/**
 * Pages deliberately reachable without a session, each with the reason. The
 * dedicated test below pins that every exemption still implements its
 * documented public behaviour, so an exemption cannot rot into an
 * accidentally open page.
 */
const EXEMPT_PAGES: Record<string, string> = {
  "(dashboard)/course/[slug]/page.tsx":
    "deliberate public teaser: renders basic info to visitors and decides " +
    "teaser vs full syllabus with the server-validated " +
    "canViewPrivateContent(); the proxy exempts /course/<slug> to match",
}

/** Session gates that validate server-side in EVERY mode (QA defect 1). */
const SUFFICIENT_GATES = [
  "requireSessionOrRedirect(",
  "requireAdminOrRedirect(",
]

/**
 * Strips comments and string/template literals so markers only match real
 * code (QA defect 2). A tiny state machine, not a parser - good enough for
 * scanning, and any mangling fails CLOSED (a swallowed real gate makes the
 * scan fail visibly, never pass silently).
 */
export function stripCommentsAndStrings(source: string): string {
  let out = ""
  type State = "code" | "line" | "block" | "single" | "double" | "template"
  let state: State = "code"
  for (let i = 0; i < source.length; i++) {
    const ch = source[i]!
    const next = source[i + 1]
    switch (state) {
      case "code":
        if (ch === "/" && next === "/") {
          state = "line"
          i++
        } else if (ch === "/" && next === "*") {
          state = "block"
          i++
        } else if (ch === "'") state = "single"
        else if (ch === '"') state = "double"
        else if (ch === "`") state = "template"
        else out += ch
        break
      case "line":
        if (ch === "\n") {
          state = "code"
          out += ch
        }
        break
      case "block":
        if (ch === "*" && next === "/") {
          state = "code"
          i++
        }
        break
      case "single":
        if (ch === "\\") i++
        else if (ch === "'" || ch === "\n") state = "code"
        break
      case "double":
        if (ch === "\\") i++
        else if (ch === '"' || ch === "\n") state = "code"
        break
      case "template":
        if (ch === "\\") i++
        else if (ch === "`") state = "code"
        break
    }
  }
  return out
}

/** Recursively collects every page.tsx under a directory. */
function collectPages(dir: string): string[] {
  if (!existsSync(dir)) return []
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      out.push(...collectPages(full))
    } else if (entry === "page.tsx") {
      out.push(full)
    }
  }
  return out
}

/**
 * True when the page's STRIPPED source carries a mode-independent session
 * gate, or its entire body is a redirect (a pure-redirect page renders no
 * JSX at all, so it exposes nothing).
 */
export function isGated(source: string): boolean {
  const code = stripCommentsAndStrings(source)
  if (SUFFICIENT_GATES.some((marker) => code.includes(marker))) return true
  // Pure-redirect page: calls redirect and returns NO JSX on any branch.
  return code.includes("redirect(") && !/\breturn\s*[(<]/.test(code)
}

describe("the scan covers every prefix the proxy protects", () => {
  const prefixes = [...PROTECTED_PATHS, ...DEV_REVIEW_PATHS]

  it.each(prefixes.map((p) => [p] as const))(
    "%s has a directory mapping",
    (prefix) => {
      expect(
        ROUTE_DIR_MAP[prefix],
        `proxy prefix ${prefix} has no entry in ROUTE_DIR_MAP - add one so ` +
          "its pages enter the gate scan"
      ).toBeDefined()
    }
  )

  it("maps no directory the proxy does not protect", () => {
    for (const key of Object.keys(ROUTE_DIR_MAP)) {
      expect(prefixes, `${key} is mapped but not proxy-protected`).toContain(
        key
      )
    }
  })
})

describe("every proxy-protected page carries a server-validated gate", () => {
  const dirs = [...PROTECTED_PATHS, ...DEV_REVIEW_PATHS].flatMap(
    (prefix) => ROUTE_DIR_MAP[prefix] ?? []
  )
  const pages = dirs
    .flatMap((dir) => collectPages(join(APP_DIR, dir)))
    .map((p) => p.slice(APP_DIR.length + 1))

  it("finds the protected page trees (guards the scan itself)", () => {
    // If the route trees move, this scan must move with them rather than
    // silently passing over nothing.
    expect(pages.length).toBeGreaterThanOrEqual(30)
  })

  it.each(
    pages
      .filter((p) => !(p in EXEMPT_PAGES))
      .map((p) => [p] as const)
  )("%s calls a server-side session gate", (relative) => {
    const source = readFileSync(join(APP_DIR, relative), "utf8")
    expect(
      isGated(source),
      `${relative} is only guarded by the proxy's presence-only cookie ` +
        "check; add requireSessionOrRedirect() (or a stronger gate) as " +
        "the first await in the page component"
    ).toBe(true)
  })

  it("every exempt page still exists and implements its documented public behaviour", () => {
    for (const [page, reason] of Object.entries(EXEMPT_PAGES)) {
      const full = join(APP_DIR, page)
      expect(existsSync(full), `${page} exempted but missing (${reason})`).toBe(
        true
      )
      const code = stripCommentsAndStrings(readFileSync(full, "utf8"))
      // The teaser page must still make its decision with the
      // server-validated content check - if that call disappears, the
      // exemption no longer holds and this page must be gated instead.
      expect(
        code.includes("canViewPrivateContent("),
        `${page}: the exemption rests on canViewPrivateContent(); it is gone`
      ).toBe(true)
    }
  })
})

describe("the gate classifier itself (QA defects 1 + 2)", () => {
  it("does not accept a gate marker that only appears in a comment", () => {
    const source = [
      "// TODO: add requireSessionOrRedirect() here",
      "/* requireAdminOrRedirect() one day */",
      "export default function Page() {",
      "  return <main>open content</main>",
      "}",
    ].join("\n")
    expect(isGated(source)).toBe(false)
  })

  it("does not accept a gate marker that only appears in a string", () => {
    const source = [
      'const note = "requireSessionOrRedirect()"',
      "export default function Page() {",
      "  return <main>{note}</main>",
      "}",
    ].join("\n")
    expect(isGated(source)).toBe(false)
  })

  it("does not accept a one-branch redirect that still renders JSX", () => {
    const source = [
      'import { redirect } from "next/navigation"',
      "export default function Page() {",
      '  if (Math.random() > 2) redirect("/login")',
      "  return <Content />",
      "}",
    ].join("\n")
    expect(isGated(source)).toBe(false)
  })

  it("does not accept the content-mode gates as a session gate", () => {
    const source = [
      "export default async function Page() {",
      "  await requireContentAccessOrRedirect()",
      "  const canView = await canViewPrivateContent()",
      "  return <main>{String(canView)}</main>",
      "}",
    ].join("\n")
    expect(isGated(source)).toBe(false)
  })

  it("accepts a real mode-independent session gate", () => {
    const source = [
      "export default async function Page() {",
      "  await requireSessionOrRedirect()",
      "  return <main>members</main>",
      "}",
    ].join("\n")
    expect(isGated(source)).toBe(true)
  })

  it("accepts a pure-redirect page with no JSX", () => {
    const source = [
      'import { redirect } from "next/navigation"',
      "export default function Page() {",
      '  redirect("/course/applied-ai-skills")',
      "}",
    ].join("\n")
    expect(isGated(source)).toBe(true)
  })
})
