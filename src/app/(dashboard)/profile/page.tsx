import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getDashboardUser } from "@/lib/auth"
import { formatDate } from "@/lib/utils"
import styles from "./profile-fde.module.css"
import { requireContentAccessOrRedirect } from "@/lib/content-access"

/**
 * Render per request, never statically. Profile is a per-user authed page
 * (real user via `getDashboardUser()` → `getCurrentUser()`); `getCurrentUser()`
 * short-circuits before touching cookies when `DATABASE_URL` is unset (build
 * time), which let Next statically optimise this route — the empty
 * no-user render was baked into the image and served to everyone (W7). See
 * the matching notes on the dashboard and progress pages.
 */
export const dynamic = "force-dynamic"

/**
 * Paired with force-dynamic so the W25 content gate is evaluated per request
 * and can never be served from a cached or prerendered render.
 */
export const revalidate = 0

export const metadata: Metadata = {
  title: "Profile",
  description: "View and manage your profile.",
}

/** Subscription state rendered as colour + glyph + text (no rounded badge). */
function SubscriptionStatus({ state }: { state: string }) {
  const label = state === "registered" ? "Free" : state
  if (["month1", "month2", "month3", "ongoing"].includes(state)) {
    return (
      <span className={styles.statusActive}>
        ✓ {label}
      </span>
    )
  }
  if (state === "lapsed") {
    return (
      <span className={styles.statusWarm}>
        ▲ {label}
      </span>
    )
  }
  return (
    <span className={styles.statusMuted}>
      ○ {label}
    </span>
  )
}

export default async function ProfilePage() {
  await requireContentAccessOrRedirect()

  const user = await getDashboardUser()

  // Anonymous traffic is bounced to /login by the proxy guard before this
  // renders; a live session without a beta grant resolves to null here and
  // belongs on the invite-required FreeDashboard, not a blank shell.
  if (!user) {
    redirect("/dashboard")
  }

  return (
    <div className={styles.shell} data-section="profile">
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>Profile</h1>
        <p className={styles.mono}>Account record</p>
      </div>
      <p className={styles.pageLead}>Your account information</p>

      <div className={styles.identityPanel}>
        <p className={styles.mono}>Personal Information</p>
        <div className={`${styles.identityHead} mt-5`}>
          <span className={styles.initial} aria-hidden="true">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <h2 className={styles.name}>{user.name}</h2>
            <p className={`${styles.mono} mt-1`}>{user.email}</p>
          </div>
        </div>

        <div className={styles.metaList}>
          <div className={styles.metaRow}>
            <span className={styles.mono}>Subscription</span>
            <SubscriptionStatus state={user.subscriptionState} />
          </div>
          <div className={styles.metaRow}>
            <span className={styles.mono}>Member since</span>
            <span className={styles.metaValue}>
              {formatDate(user.createdAt)}
            </span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.mono}>Email</span>
            <span className={styles.metaValue}>{user.email}</span>
          </div>
        </div>

        {user.bio && (
          <div className="mt-6">
            <h3 className={styles.bioHead}>Bio</h3>
            <p className={styles.bioBody}>{user.bio}</p>
          </div>
        )}
      </div>
    </div>
  )
}
