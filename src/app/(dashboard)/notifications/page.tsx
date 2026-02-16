import type { Metadata } from "next"
import { getNotifications } from "@/lib/data/notifications"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/empty-state"
import { Bell, Trophy, Clock, Megaphone } from "lucide-react"
import { formatRelativeDate } from "@/lib/utils"
import type { NotificationType } from "@/lib/types"

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="mt-1 text-muted-foreground">
          Stay up to date with your learning
        </p>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up! Check back later for updates."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const Icon = typeIcons[notif.type]
            return (
              <Card
                key={notif.id}
                className={notif.read ? "opacity-70" : ""}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="mt-0.5 rounded-full bg-primary/10 p-2">
                    <Icon className="size-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{notif.title}</p>
                      {!notif.read && (
                        <Badge className="text-[10px]">New</Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {notif.message}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatRelativeDate(notif.createdAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
