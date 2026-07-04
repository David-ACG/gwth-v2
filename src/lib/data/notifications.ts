/**
 * Data access functions for user notifications.
 *
 * There is no notifications table yet (post-beta follow-up), so real accounts
 * honestly have no notifications. The fixture notifications (which include a
 * fake streak achievement) are served only on the mock/dev path via
 * `resolveDataMode()` — no DB, or the ENABLE_DEV_MOCK_USER review path with
 * no real session — and can never reach a real logged-in session (W14).
 */

import type { Notification } from "@/lib/types"
import { mockNotifications } from "./mock-data"
import { resolveDataMode } from "./mode"

/**
 * Fetches all notifications for the current user, newest first.
 * Real accounts get an empty list until a notifications store exists.
 */
export async function getNotifications(): Promise<Notification[]> {
  const mode = await resolveDataMode()
  if (mode.kind !== "mock") return []
  return [...mockNotifications].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )
}

/**
 * Returns the count of unread notifications.
 * Real accounts have none until a notifications store exists.
 */
export async function getUnreadCount(): Promise<number> {
  const mode = await resolveDataMode()
  if (mode.kind !== "mock") return 0
  return mockNotifications.filter((n) => !n.read).length
}

/**
 * Marks a specific notification as read.
 * Only meaningful on the mock/dev path; a no-op for real sessions.
 */
export async function markRead(notificationId: string): Promise<void> {
  const mode = await resolveDataMode()
  if (mode.kind !== "mock") return
  const notification = mockNotifications.find((n) => n.id === notificationId)
  if (notification) {
    notification.read = true
  }
}

/**
 * Marks all notifications as read.
 * Only meaningful on the mock/dev path; a no-op for real sessions.
 */
export async function markAllRead(): Promise<void> {
  const mode = await resolveDataMode()
  if (mode.kind !== "mock") return
  mockNotifications.forEach((n) => {
    n.read = true
  })
}
