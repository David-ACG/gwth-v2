import { PublicNav } from "@/components/layout/public-nav"
import { Footer } from "@/components/layout/footer"
import { getCurrentUser, canUserAccessCourse } from "@/lib/auth"
import { canViewPrivateContent } from "@/lib/content-access"
import { COURSE_PATH } from "@/lib/config"

/**
 * Render per request, never statically.
 *
 * The chrome below decides whether to show the Labs link from a RUNTIME env
 * value plus the caller's session. Every marketing page under this layout was
 * statically prerendered before W25, which would have frozen that decision
 * into the image: the Labs link would have stayed hidden after the launch flip
 * to `PRIVATE_CONTENT_MODE=off`, and the whole nav would have shown one
 * visitor's state to all. `canViewPrivateContent()` awaits `headers()`
 * unconditionally, which already forces this; the export makes it explicit and
 * survives a future refactor of that helper.
 *
 * Cost is negligible: these pages are server components over config constants,
 * and production already answers them with `cache-control: private, no-store`,
 * so nothing was being cached at the edge anyway.
 */
export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * Layout for public-facing pages (landing, pricing, about).
 * Includes the public navigation bar and site footer.
 * Passes auth state to the nav for login/avatar display.
 */
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, showLabs] = await Promise.all([
    getCurrentUser(),
    // Keyed on the VIEWER, not just the flag. An anonymous visitor during the
    // private period does not see a Labs link they would only bounce off,
    // while an allowlisted account keeps its nav route to Labs — which the
    // demo walks through. After PRIVATE_CONTENT_MODE=off this is true for
    // everyone and the link returns on its own.
    canViewPrivateContent(),
  ])

  // A signed-in learner clicking "Lessons" wants their course, not the advert
  // for it (David, 2026-07-26). `getCurrentUser()` already returns null without
  // a live grant, so this only redirects people who can actually open the
  // course. /lessons itself stays public and unchanged for everyone else, which
  // W25 requires so CIPD can research the site afterwards.
  const lessonsHref =
    user && canUserAccessCourse(user) ? COURSE_PATH : "/lessons"

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav
        user={user ? { name: user.name, email: user.email } : null}
        showLabs={showLabs}
        lessonsHref={lessonsHref}
      />
      <main className="flex-1">{children}</main>
      <Footer showLabs={showLabs} />
    </div>
  )
}
