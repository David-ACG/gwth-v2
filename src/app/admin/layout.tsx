import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin"
import { AdminNav } from "@/components/admin/admin-nav"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import styles from "./admin-fde.module.css"

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
}

/**
 * The admin surface reads live per-request session + DB state; never let Next
 * statically prerender it (the W7 static-prerender trap: getCurrentUser()
 * short-circuits at build time when DATABASE_URL is unset).
 */
export const dynamic = "force-dynamic"

/**
 * Layout (and THE access gate) for every /admin page (W4).
 *
 * Gate: reuses the W11 auth seam — `getCurrentUser()` from src/lib/auth.ts —
 * then checks the authenticated email against the ADMIN_EMAILS env allowlist
 * (src/lib/admin.ts). Anonymous traffic goes to /login; authenticated
 * non-admins are redirected to their dashboard, not shown a 500. Every
 * /admin/* page inherits this gate; /api/admin/* routes are gated identically
 * via requireAdminForApi. Per W11 there is NO middleware.ts — the proxy only
 * adds the optimistic no-cookie bounce for /admin.
 *
 * Chrome: a slim FDE header (ink hairline, mono nav, grant action) over the
 * summary-first pages. Dense and functional per DESIGN_FDE.md §6 — admin is
 * David-facing.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!isAdminEmail(user.email)) redirect("/dashboard")

  return (
    <div className={styles.shell} data-section="admin-shell">
      <header className={styles.header}>
        <div className={`${styles.page} ${styles.headerRow}`}>
          <a href="/admin" className={styles.brand}>
            <span className={styles.brandTitle}>Admin</span>
            <span className={styles.mono}>GWTH.ai · beta cohort</span>
          </a>
          <AdminNav />
          <div className={styles.headerActions}>
            <a href="/admin/roster#grant" className={styles.buttonSolid}>
              Grant access
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.page}>{children}</div>
      </main>
    </div>
  )
}
