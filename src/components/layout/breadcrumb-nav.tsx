"use client"

import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import React from "react"
import styles from "./breadcrumb-nav-fde.module.css"

/** Maps route segments to human-readable labels */
const segmentLabels: Record<string, string> = {
  dashboard: "Dashboard",
  course: "Course",
  labs: "Labs",
  lesson: "Lesson",
  progress: "Progress",
  bookmarks: "Bookmarks",
  notifications: "Notifications",
  profile: "Profile",
  settings: "Settings",
}

/**
 * Path segments that exist only to namespace the route and have no page of
 * their own (W26).
 *
 * `/course/applied-ai-skills` was rendering a "COURSE" crumb linking to
 * `/course`, which 404s — a dead link one click from the demo lesson. Same for
 * the `lesson` segment in `/course/<slug>/lesson/<lessonSlug>`. They still read
 * as crumbs, they just are not clickable.
 */
const NON_NAVIGABLE_SEGMENTS = new Set(["course", "lesson"])

/**
 * Dynamic breadcrumb navigation that builds from the current URL path.
 * Handles route groups by filtering out segments in parentheses.
 */
export function BreadcrumbNav() {
  const pathname = usePathname()

  // Split path and filter out route groups like (dashboard)
  const segments = pathname
    .split("/")
    .filter((s) => s && !s.startsWith("("))

  if (segments.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList className={styles.crumbs}>
        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/")
          const isLast = index === segments.length - 1
          const label =
            segmentLabels[segment] ??
            segment
              .replace(/-/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())

          return (
            <React.Fragment key={href}>
              {index > 0 && (
                <BreadcrumbSeparator className={styles.crumbSep}>
                  /
                </BreadcrumbSeparator>
              )}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className={styles.crumbCurrent}>
                    {label}
                  </BreadcrumbPage>
                ) : NON_NAVIGABLE_SEGMENTS.has(segment) ? (
                  // A plain span, not BreadcrumbPage: this crumb is neither a
                  // link nor the current page, and BreadcrumbPage would tell
                  // assistive tech it is the page you are on.
                  <span className={styles.crumbLink}>{label}</span>
                ) : (
                  <BreadcrumbLink href={href} className={styles.crumbLink}>
                    {label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
