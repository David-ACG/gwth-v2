import type { Metadata } from "next"
import { getNotifications } from "@/lib/data/notifications"
import { EmptyState } from "@/components/shared/empty-state"
import { Trophy, Clock, Megaphone } from "lucide-react"
import { formatRelativeDate } from "@/lib/utils"
import type { NotificationType } from "@/lib/types"
import styles from "./notifications-fde.module.css"
import { requireContentAccessOrRedirect } from "@/lib/content-access"

/**
 * Render per request, never statically. Notifications are mode-gated per
 * request via `resolveDataMode()` (W14): real sessions get an honest empty
 * list; only the mock/dev path sees fixtures. At build time `DATABASE_URL`
 * is unset, so the mode resolved to "mock" before touching cookies and Next
 * statically baked the fixture notifications into the image — serving them
 * to every visitor, including real accounts (W7). See the matching notes on
 * the dashboard, progress, profile, and settings pages.
 */
export const dynamic = "force-dynamic"

/**
 * Paired with force-dynamic so the W25 content gate is evaluated per request
 * and can never be served from a cached or prerendered render.
 */
export const revalidate = 0

export const metadata: Metadata = {
  title: "Notifications",
  description: "Your notifications and alerts.",
}

const typeIcons: Record<NotificationType, React.ElementType> = {
  achievement: Trophy,
  reminder: Clock,
  announcement: Megaphone,
}

export default async function NotificationsPage() {
  await requireContentAccessOrRedirect()

  const notifications = await getNotifications()

  return (
    <div className={styles.shell} data-section="notifications">
      <header className={styles.head}>
        <h1 className={styles.title}>Notifications</h1>
        <p className={styles.mono}>Stay up to date with your learning</p>
      </header>

      {notifications.length === 0 ? (
        <EmptyState
          kicker="No notifications"
          title="You're all caught up"
          description="Check back later for updates on your learning."
        />
      ) : (
        <ul className={styles.list}>
          {notifications.map((notif) => {
            const Icon = typeIcons[notif.type]
            return (
              <li
                key={notif.id}
                className={styles.row}
                data-unread={notif.read ? "false" : "true"}
              >
                <Icon className={styles.rowIcon} aria-hidden="true" />
                <div>
                  <p className={styles.rowTitle}>
                    {!notif.read && (
                      <span className={styles.unreadMark}>
                        <span aria-hidden="true">●</span>
                        <span className="sr-only">Unread</span>
                      </span>
                    )}
                    {notif.title}
                  </p>
                  <p className={styles.rowMessage}>{notif.message}</p>
                  <p className={styles.rowMeta}>
                    {notif.type} · {formatRelativeDate(notif.createdAt)}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
