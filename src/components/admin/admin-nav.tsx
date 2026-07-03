"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import styles from "@/app/admin/admin-fde.module.css"

/** The four admin panels, in the summary-first order David chose (2026-06-17). */
const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/roster", label: "Roster" },
  { href: "/admin/funnel", label: "Funnel" },
  { href: "/admin/feedback", label: "Feedback" },
] as const

/**
 * Admin header navigation — mono links with an ink underline on the active
 * panel (FDE §5.9 voice). Client component only for usePathname.
 */
export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className={styles.nav} aria-label="Admin sections">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={styles.navLink}
          data-active={
            (link.href === "/admin"
              ? pathname === "/admin"
              : pathname?.startsWith(link.href))
              ? "true"
              : undefined
          }
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
