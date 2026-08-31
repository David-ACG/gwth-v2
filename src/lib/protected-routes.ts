/**
 * The proxy's protected and dev/review route prefixes, in one place.
 *
 * Split out of src/proxy.ts (N2 QA style note 1) so the gate-coverage scan
 * in src/app/protected-page-gates.test.ts derives its directory list from
 * the SAME constants the proxy enforces: a prefix added to (or renamed in)
 * the proxy can no longer silently fall out of the security scan, and a
 * prefix added only here fails the proxy/test mapping instead of being
 * guessed at. No `next/server` import, so plain vitest files can import it.
 */

/**
 * Dashboard routes that require authentication (W11 route guard).
 * `/admin` is here for the optimistic no-cookie bounce only - the REAL admin
 * gate (session + ADMIN_EMAILS allowlist) lives in src/app/admin/layout.tsx
 * and in requireAdminForApi for /api/admin/*; per W11 there is no middleware.
 */
export const PROTECTED_PATHS = [
  "/admin",
  // N7: the institution admin surface. Same shape as /admin - the prefix is
  // here for the optimistic no-cookie bounce only; the REAL gate (session +
  // org_membership role) is requireOrgStaffOrRedirect() in every /org page
  // and in src/app/org/layout.tsx.
  "/org",
  "/dashboard",
  "/courses",
  "/course",
  "/progress",
  "/settings",
  "/profile",
  "/bookmarks",
  "/notifications",
  "/guide",
]

/**
 * Internal dev/review leftovers (W15): auth-gated in EVERY production build
 * (including the ENABLE_DEV_MOCK_USER staging env) so none of them answers 200
 * to anonymous traffic on a public deploy. A logged-in session still reaches
 * them for review.
 *
 * W12 has closed, so W25 took the other option this list's original comment
 * offered and DELETED the leftovers outright rather than gating them:
 * /w12-review (+ /script, /scripts, /motion, /takes), /explainer-preview,
 * /w12-embed-demo, the unauthenticated POST /api/w12-take-review, and the
 * /demo/lesson-v1..v11 viewers (client components that shipped real lesson
 * prose into a public /_next/static chunk). Deletion is the only closure that
 * survives a forged session cookie - see guardDevReviewRoute.
 *
 * `/demo` stays listed: the route tree is gone, but keeping the prefix means a
 * future scratch page under it is gated by default rather than by memory.
 */
export const DEV_REVIEW_PATHS = [
  "/demo",
  "/logo_picker",
  "/redesign",
  "/redesign_v2",
  "/old-design",
  "/score-card-variants",
]
