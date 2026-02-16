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

/** Maps route segments to human-readable labels */
const segmentLabels: Record<string, string> = {
  dashboard: "Dashboard",
  courses: "Courses",
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
      <BreadcrumbList>
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
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
