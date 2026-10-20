/**
 * Which public pages are hidden or unlisted at launch (1 December 2026).
 *
 * David, 2026-10-20, on the launch readiness check of every public page
 * (Claude and the latest Sol each judged Ready, Fix or Hide): *"Use your
 * recommendations for all 30 pages (1 Ready, 21 Fix, 8 Hide) and start on the
 * fixes."* Tracker: GWTH-launch-plan completion/launch-readiness/ (bead
 * gwth-launch-ajqs.2).
 *
 * HIDDEN pages answer a real 404 for everyone and leave the menus. The 404 is
 * decided in the proxy, before any render: these routes sit under a
 * force-dynamic layout with a streaming loading state, so a page-level
 * notFound() can only signal in-band and the status stays 200 (the review
 * caught /news, /verify and /score doing exactly that).
 *
 * UNLISTED pages leave the menus and search engines but keep working for
 * anyone with the link. /for-institutions is the one: the CIPD demo on
 * 6 November and the institution conversations after it are sent there
 * directly, while the 1 December launch sells to individuals.
 *
 * To bring a page back, delete it from the list; menus follow on their own.
 */
export const HIDDEN_PUBLIC_PATHS = [
  "/news",
  "/tech-radar",
  "/newsletter",
  "/for-teams",
  "/verify",
  "/score",
] as const

export const UNLISTED_PUBLIC_PATHS = ["/for-institutions"] as const

function under(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`)
}

/** True for a hidden route and everything below it (/news/some-story). */
export function isHiddenPublicPath(pathname: string): boolean {
  return HIDDEN_PUBLIC_PATHS.some((route) => under(pathname, route))
}

/** True when a menu should leave this link out (hidden or unlisted). */
export function isOffMenu(href: string): boolean {
  return (
    isHiddenPublicPath(href) ||
    UNLISTED_PUBLIC_PATHS.some((route) => under(href, route))
  )
}
