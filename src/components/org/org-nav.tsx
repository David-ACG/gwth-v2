"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import styles from "@/app/admin/admin-fde.module.css"

/**
 * The /org sections. Overview and Learners are what a TUTOR needs (read-only
 * roster visibility, design 05 section 4); Syllabus and Ratification are the
 * institution ADMIN's editing surfaces and are hidden from tutors — the
 * server actions refuse them regardless, so this is signposting, not a gate.
 */
const LINKS = [
  { href: "/org", label: "Overview", editorOnly: false },
  { href: "/org/syllabus", label: "Syllabus", editorOnly: true },
  { href: "/org/ratification", label: "Ratification", editorOnly: true },
  { href: "/org/learners", label: "Learners", editorOnly: false },
] as const

/**
 * Institution header navigation — mono links with an ink underline on the
 * active section (FDE §5.9 voice), matching /admin's AdminNav so the two
 * staff surfaces read as one register. Client component only for usePathname.
 *
 * @param canEdit Whether the signed-in staff member may edit the edition
 *   (owner/admin). Tutors see the read-only sections only.
 */
export function OrgNav({ canEdit }: { canEdit: boolean }) {
  const pathname = usePathname()

  return (
    <nav className={styles.nav} aria-label="Organisation sections">
      {LINKS.filter((link) => canEdit || !link.editorOnly).map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={styles.navLink}
          data-active={
            (link.href === "/org"
              ? pathname === "/org"
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
