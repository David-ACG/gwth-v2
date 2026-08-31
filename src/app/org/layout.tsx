import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { canEditEdition, resolveOrgStaffContext } from "@/lib/data/org-admin"
import { OrgNav } from "@/components/org/org-nav"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import adminStyles from "../admin/admin-fde.module.css"
import styles from "./org-fde.module.css"

export const metadata: Metadata = {
  title: "Your organisation",
  robots: { index: false, follow: false },
}

/**
 * /org reads live per-request session + DB state; never let Next statically
 * prerender it (the W7 static-prerender trap: the whole page would freeze at
 * its empty build-time render).
 */
export const dynamic = "force-dynamic"

/**
 * Layout and chrome for the institution admin surface (N7).
 *
 * Gate: the SAME shape as /admin's — resolve the session through the W11 auth
 * seam, then check authority. The difference is where authority comes from:
 * /admin is GWTH platform staff on the ADMIN_EMAILS env allowlist; /org is the
 * CUSTOMER's own staff, on their `org_membership.role` (owner/admin/tutor).
 * An institution admin must never need to be on a GWTH env var to run their
 * own edition. Anonymous traffic goes to /login; a signed-in learner goes to
 * their dashboard, not a 500.
 *
 * App Router renders pages IN PARALLEL with their layout, so this gate is the
 * chrome's gate only — every /org page calls requireOrgStaffOrRedirect()
 * itself before any data read, and protected-page-gates.test.ts fails the
 * build if one forgets.
 *
 * Chrome: the co-branded masthead the CIPD deck promised (slide 7) — visibly
 * GWTH, with the edition's own label beside it. Not white-labelled.
 */
export default async function OrgLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const context = await resolveOrgStaffContext()
  if (!context) {
    if (await getCurrentUser()) redirect("/dashboard")
    redirect("/login")
  }

  return (
    <div className={adminStyles.shell} data-section="org-shell">
      <header className={adminStyles.header}>
        <div className={`${adminStyles.page} ${adminStyles.headerRow}`}>
          <a href="/org" className={adminStyles.brand}>
            <span className={styles.coBrand}>
              <span className={adminStyles.brandTitle}>GWTH</span>
              {context.coBrandLabel ? (
                <>
                  <span className={styles.coBrandDivider} aria-hidden="true">
                    /
                  </span>
                  <span className={styles.coBrandLabel}>
                    {context.coBrandLabel}
                  </span>
                </>
              ) : null}
            </span>
          </a>
          <OrgNav canEdit={canEditEdition(context.role)} />
          <div className={adminStyles.headerActions}>
            <span className={adminStyles.mono}>
              {context.organisationName} · {context.role}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className={adminStyles.main}>
        <div className={adminStyles.page}>{children}</div>
      </main>
    </div>
  )
}
