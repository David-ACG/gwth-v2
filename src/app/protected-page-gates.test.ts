/**
 * Gate-coverage scan (gwth-launch-dgc, N2 security; hardened across the
 * gwth-launch-avo QA rounds).
 *
 * The proxy's route guard is presence-only - a forged
 * `better-auth.session_token` cookie passes it - so the security boundary is
 * a server-validated check inside each page component. This test scans every
 * page under the proxy's protected and dev/review prefixes and fails if one
 * is missing its page-level gate, so a future page added under these
 * prefixes cannot ship gated by nothing but the cookie's name.
 *
 * The scan PARSES each page with the TypeScript compiler (QA round-3 defect
 * 1: every string heuristic before this could be fooled - markers in
 * comments or strings, gates in unused helpers, redirects in files whose
 * JSX hid in a variable). What now counts as gated is a structural fact
 * about the DEFAULT-EXPORTED page component itself:
 *   - its body contains an awaited call to a mode-independent session gate
 *     (`requireSessionOrRedirect` / `requireAdminOrRedirect`), or
 *   - it is a pure redirect: no JSX anywhere in the component and no return
 *     of anything but `redirect(...)`.
 * requireContentAccessOrRedirect() and canViewPrivateContent() are NOT
 * sufficient (QA defect 1): both stop validating the session the moment
 * PRIVATE_CONTENT_MODE=off (the launch state).
 *
 * The directory list derives from the proxy's OWN prefix constants
 * (src/lib/protected-routes.ts - QA style note 1), and every mapped
 * directory must exist on disk (round-2 style note 5).
 */
import { describe, expect, it } from "vitest"
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs"
import { join } from "node:path"
import ts from "typescript"
import {
  PROTECTED_PATHS,
  DEV_REVIEW_PATHS,
} from "@/lib/protected-routes"

const APP_DIR = join(process.cwd(), "src", "app")

/**
 * Where each proxy prefix's pages live under src/app. Route groups like
 * `(dashboard)` are invisible in the URL, so the mapping cannot be derived
 * mechanically - but the mapping-completeness tests below guarantee it can
 * never silently miss a prefix the proxy protects, and that every mapped
 * directory really exists.
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
 * Proxy prefixes whose route trees were deliberately DELETED (kept in the
 * proxy list so a future scratch page is gated by default). Only these may
 * map to a directory that does not exist on disk.
 */
const DELETED_PREFIXES = new Set(["/demo"])

/**
 * Pages deliberately reachable without a session, each with the reason. The
 * dedicated test below pins - structurally, on the AST - that every
 * exemption still implements its documented public behaviour, so an
 * exemption cannot rot into an accidentally open page.
 */
const EXEMPT_PAGES: Record<string, string> = {
  "(dashboard)/course/[slug]/page.tsx":
    "deliberate public teaser: renders basic info to visitors and decides " +
    "teaser vs full syllabus with the server-validated " +
    "canViewPrivateContent(); the proxy exempts /course/<slug> to match",
}

/** Session gates that validate server-side in EVERY mode (QA defect 1). */
const GATE_NAMES = new Set([
  "requireSessionOrRedirect",
  "requireAdminOrRedirect",
])

// ── AST classifier ───────────────────────────────────────────────────────────

function parse(source: string): ts.SourceFile {
  return ts.createSourceFile(
    "page.tsx",
    source,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    ts.ScriptKind.TSX
  )
}

/**
 * Resolves the node whose body IS the default-exported page component:
 * `export default (async) function`, or `export default X` where X is a
 * top-level function/const. Returns null when there is no default export -
 * which the scan treats as NOT gated.
 */
function defaultExportNode(sf: ts.SourceFile): ts.Node | null {
  for (const stmt of sf.statements) {
    if (
      ts.isFunctionDeclaration(stmt) &&
      stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)
    ) {
      return stmt
    }
    if (ts.isExportAssignment(stmt) && !stmt.isExportEquals) {
      const expr = stmt.expression
      if (!ts.isIdentifier(expr)) return expr
      for (const other of sf.statements) {
        if (
          ts.isFunctionDeclaration(other) &&
          other.name?.text === expr.text
        ) {
          return other
        }
        if (ts.isVariableStatement(other)) {
          for (const decl of other.declarationList.declarations) {
            if (
              ts.isIdentifier(decl.name) &&
              decl.name.text === expr.text &&
              decl.initializer
            ) {
              return decl.initializer
            }
          }
        }
      }
      return null
    }
  }
  return null
}

/** True when the node's subtree awaits a call to one of the gate functions. */
function containsAwaitedGate(root: ts.Node): boolean {
  let found = false
  const visit = (node: ts.Node) => {
    if (found) return
    if (
      ts.isAwaitExpression(node) &&
      ts.isCallExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      GATE_NAMES.has(node.expression.expression.text)
    ) {
      found = true
      return
    }
    ts.forEachChild(node, visit)
  }
  visit(root)
  return found
}

/** True when the node's subtree contains any JSX at all. */
function containsJsx(root: ts.Node): boolean {
  let found = false
  const visit = (node: ts.Node) => {
    if (found) return
    if (
      ts.isJsxElement(node) ||
      ts.isJsxSelfClosingElement(node) ||
      ts.isJsxFragment(node)
    ) {
      found = true
      return
    }
    ts.forEachChild(node, visit)
  }
  visit(root)
  return found
}

/** `redirect(...)` call test. */
function isRedirectCall(node: ts.Node): boolean {
  return (
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === "redirect"
  )
}

/**
 * Pure-redirect page component: exposes NOTHING - no JSX anywhere in the
 * component, at least one `redirect(...)` call, and no return of anything
 * except a `redirect(...)` call (so `return body` variables and
 * expression-bodied JSX both disqualify it, QA round-3 defect 1).
 */
function isPureRedirect(root: ts.Node): boolean {
  if (containsJsx(root)) return false
  let callsRedirect = false
  let returnsOther = false
  const visit = (node: ts.Node) => {
    if (isRedirectCall(node)) callsRedirect = true
    if (ts.isReturnStatement(node) && node.expression) {
      if (!isRedirectCall(node.expression)) returnsOther = true
    }
    // An expression-bodied arrow (`() => expr`) returns its body.
    if (
      ts.isArrowFunction(node) &&
      !ts.isBlock(node.body) &&
      !isRedirectCall(node.body)
    ) {
      returnsOther = true
    }
    ts.forEachChild(node, visit)
  }
  visit(root)
  return callsRedirect && !returnsOther
}

/** The classifier: is this page source gated? */
export function isGated(source: string): boolean {
  const component = defaultExportNode(parse(source))
  if (!component) return false
  return containsAwaitedGate(component) || isPureRedirect(component)
}

/**
 * Structural pin for the teaser exemption (QA round-3 defect 2): TRUE only
 * when `contentAllowed` is destructured from `await Promise.all([...])`
 * with `canViewPrivateContent()` at the SAME index - i.e. the variable
 * provably receives the gate's result - AND `contentAllowed` drives a
 * conditional expression somewhere in the file.
 */
export function teaserGateBindsAndUsesResult(source: string): boolean {
  const sf = parse(source)
  let binds = false
  let branches = false
  const visit = (node: ts.Node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isArrayBindingPattern(node.name) &&
      node.initializer &&
      ts.isAwaitExpression(node.initializer) &&
      ts.isCallExpression(node.initializer.expression)
    ) {
      const call = node.initializer.expression
      if (
        ts.isPropertyAccessExpression(call.expression) &&
        call.expression.name.text === "all" &&
        call.arguments[0] &&
        ts.isArrayLiteralExpression(call.arguments[0])
      ) {
        const elements = call.arguments[0].elements
        node.name.elements.forEach((binding, index) => {
          if (
            ts.isBindingElement(binding) &&
            ts.isIdentifier(binding.name) &&
            binding.name.text === "contentAllowed"
          ) {
            const producer = elements[index]
            if (
              producer &&
              ts.isCallExpression(producer) &&
              ts.isIdentifier(producer.expression) &&
              producer.expression.text === "canViewPrivateContent"
            ) {
              binds = true
            }
          }
        })
      }
    }
    if (
      ts.isConditionalExpression(node) &&
      ts.isIdentifier(node.condition) &&
      node.condition.text === "contentAllowed"
    ) {
      branches = true
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
  return binds && branches
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

// ── The scan ─────────────────────────────────────────────────────────────────

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

  it("every mapped directory exists on disk (a renamed tree cannot silently leave the scan)", () => {
    for (const [prefix, dirs] of Object.entries(ROUTE_DIR_MAP)) {
      if (DELETED_PREFIXES.has(prefix)) continue
      for (const dir of dirs) {
        expect(
          existsSync(join(APP_DIR, dir)),
          `${prefix} maps to src/app/${dir}, which does not exist - if the ` +
            "tree moved, move the mapping; if it was deleted on purpose, " +
            "record it in DELETED_PREFIXES"
        ).toBe(true)
      }
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
  )("%s awaits a server-side session gate in its page component", (relative) => {
    const source = readFileSync(join(APP_DIR, relative), "utf8")
    expect(
      isGated(source),
      `${relative} is only guarded by the proxy's presence-only cookie ` +
        "check; add `await requireSessionOrRedirect()` (or a stronger " +
        "gate) as the first await in the page component"
    ).toBe(true)
  })

  it("every exempt page still exists and provably uses its content gate's result", () => {
    for (const [page, reason] of Object.entries(EXEMPT_PAGES)) {
      const full = join(APP_DIR, page)
      expect(existsSync(full), `${page} exempted but missing (${reason})`).toBe(
        true
      )
      const source = readFileSync(full, "utf8")
      expect(
        teaserGateBindsAndUsesResult(source),
        `${page}: contentAllowed no longer provably receives ` +
          "canViewPrivateContent()'s result (or no longer drives a " +
          "conditional) - the exemption does not hold; re-verify the " +
          "teaser gating and update the pin if the shape changed"
      ).toBe(true)
    }
  })
})

// ── The classifier itself (QA defects 1 + 2, rounds 1-3) ─────────────────────

describe("the gate classifier", () => {
  it("does not accept a gate marker that only appears in a comment or string", () => {
    const source = [
      "// TODO: add requireSessionOrRedirect() here",
      "/* await requireAdminOrRedirect() one day */",
      'const note = "await requireSessionOrRedirect()"',
      "export default function Page() {",
      "  return <main>{note}</main>",
      "}",
    ].join("\n")
    expect(isGated(source)).toBe(false)
  })

  it("does not accept a gate awaited only in an UNUSED helper (round-3 defect 1)", () => {
    const source = [
      "async function unusedHelper() {",
      "  await requireSessionOrRedirect()",
      "}",
      "export default function Page() {",
      "  return <main>open content</main>",
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

  it("does not accept a one-branch redirect returning JSX held in a variable", () => {
    const source = [
      'import { redirect } from "next/navigation"',
      "export default function Page() {",
      '  if (!flag) redirect("/login")',
      "  const body = buildBody()",
      "  return body",
      "}",
    ].join("\n")
    expect(isGated(source)).toBe(false)
  })

  it("does not accept an expression-bodied page with a redirect in a dead branch (round-3 defect 1)", () => {
    const source = [
      'import { redirect } from "next/navigation"',
      "const Page = () => <main>open</main>",
      'function never() { redirect("/login") }',
      "export default Page",
    ].join("\n")
    expect(isGated(source)).toBe(false)
  })

  it("does not accept a bare gate mention without the awaited call", () => {
    const source = [
      'import { requireSessionOrRedirect } from "@/lib/content-access"',
      "const gate = requireSessionOrRedirect",
      "export default function Page() {",
      "  return <main>open</main>",
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

  it("accepts a real awaited session gate inside the page component", () => {
    const source = [
      "export default async function Page() {",
      "  await requireSessionOrRedirect()",
      "  return <main>members</main>",
      "}",
    ].join("\n")
    expect(isGated(source)).toBe(true)
  })

  it("accepts a default-exported const referencing a gated function", () => {
    const source = [
      "async function Page() {",
      "  await requireAdminOrRedirect()",
      "  return <main>admin</main>",
      "}",
      "export default Page",
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

  it("accepts a page that returns its redirect", () => {
    const source = [
      'import { redirect } from "next/navigation"',
      "export default function Page() {",
      '  return redirect("/course/applied-ai-skills")',
      "}",
    ].join("\n")
    expect(isGated(source)).toBe(true)
  })
})

describe("the teaser exemption pin (round-3 defect 2)", () => {
  it("rejects a page whose contentAllowed does NOT come from the gate", () => {
    const source = [
      "export default async function Page() {",
      "  const contentAllowed = true",
      "  void canViewPrivateContent()",
      "  const user = contentAllowed ? realUser : null",
      "  return <main>{String(user)}</main>",
      "}",
    ].join("\n")
    expect(teaserGateBindsAndUsesResult(source)).toBe(false)
  })

  it("rejects a page that binds the result but never branches on it", () => {
    const source = [
      "export default async function Page() {",
      "  const [contentAllowed] = await Promise.all([canViewPrivateContent()])",
      "  return <main>full syllabus</main>",
      "}",
    ].join("\n")
    expect(teaserGateBindsAndUsesResult(source)).toBe(false)
  })

  it("accepts the real bind-and-branch shape", () => {
    const source = [
      "export default async function Page() {",
      "  const [course, contentAllowed] = await Promise.all([",
      "    getCourse(slug),",
      "    canViewPrivateContent(),",
      "  ])",
      "  const user = contentAllowed ? dashboardUser : null",
      "  return <main>{String(user)}</main>",
      "}",
    ].join("\n")
    expect(teaserGateBindsAndUsesResult(source)).toBe(true)
  })
})
