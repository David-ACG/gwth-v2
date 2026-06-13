import type { Metadata } from "next"
import { getDashboardUser } from "@/lib/auth"
import { formatDate } from "@/lib/utils"
import styles from "./profile-fde.module.css"

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
  const user = await getDashboardUser()

  if (!user) {
    return null
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
