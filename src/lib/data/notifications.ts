/**
 * Data access functions for user notifications.
 * Currently backed by mock data. Will be replaced with real API/DB calls later.
 */

import type { Notification } from "@/lib/types"
import { mockNotifications } from "./mock-data"

/**
 * Fetches all notifications for the current user.
 * Returns them sorted by creation date (newest first).
 */
export async function getNotifications(): Promise<Notification[]> {
  return [...mockNotifications].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )
}

/**
 * Returns the count of unread notifications.
 */
export async function getUnreadCount(): Promise<number> {
  return mockNotifications.filter((n) => !n.read).length
}

/**
 * Marks a specific notification as read.
 */
export async function markRead(notificationId: string): Promise<void> {
  const notification = mockNotifications.find((n) => n.id === notificationId)
  if (notification) {
    notification.read = true
  }
}

/**
 * Marks all notifications as read.
 */
export async function markAllRead(): Promise<void> {
  mockNotifications.forEach((n) => {
    n.read = true
  })
}
