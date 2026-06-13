import type { Metadata } from "next"
import { getNotifications } from "@/lib/data/notifications"
import { EmptyState } from "@/components/shared/empty-state"
import { Bell, Trophy, Clock, Megaphone } from "lucide-react"
import { formatRelativeDate } from "@/lib/utils"
import type { NotificationType } from "@/lib/types"
import styles from "./notifications-fde.module.css"

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
  const notifications = await getNotifications()

  return (
    <div className={styles.shell} data-section="notifications">
      <header className={styles.head}>
        <h1 className={styles.title}>Notifications</h1>
        <p className={styles.mono}>Stay up to date with your learning</p>
      </header>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up! Check back later for updates."
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
