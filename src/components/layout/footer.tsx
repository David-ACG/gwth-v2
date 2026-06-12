import Link from "next/link"
import { APP_NAME, ENABLE_NEWS } from "@/lib/config"
import { LogoGwth } from "@/components/marketing/redesign/logo-gwth"
import { cn } from "@/lib/utils"
import styles from "./footer-fde.module.css"

const footerLinks = [
  {
    title: "Product",
    links: [
      { href: "/pricing", label: "Pricing" },
      { href: "/why-gwth", label: "Why GWTH" },
      { href: "/for-teams", label: "For Teams" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/labs", label: "Free Labs" },
      { href: "/lessons", label: "Lessons" },
      { href: "/news", label: "News" },
      { href: "/newsletter", label: "Newsletter" },
      { href: "/about", label: "About GWTH" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
].map((col) => ({
  ...col,
  links: col.links.filter((link) => ENABLE_NEWS || link.href !== "/news"),
}))

/**
 * Site footer for public pages, in the FDE journal register
 * (DESIGN_FDE.md §5.9): paper surface band, 1px ink top rule, mono
 * uppercase column headers, serif links.
 * Shows logo, tagline, organised link columns, and copyright.
 */
export function Footer() {
  return (
    <footer
      data-section="footer"
      className={cn(styles.shell, styles.footer)}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" aria-label={`${APP_NAME} home`} className="inline-flex">
              <LogoGwth width={150} className="h-7 w-auto" />
            </Link>
            <p className={cn("mt-4 max-w-xs", styles.tagline)}>
              UK-focused applied AI training. Learn to build apps, automate
              workflows, research faster, analyse data, and prove your progress.
            </p>
          </div>
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className={styles.colHeader}>{group.title}</h3>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={styles.link}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className={cn("mt-12 pt-8", styles.legalRow)}>
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className={styles.copyright}>
              &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
            <p className={styles.monoLine}>
              Independent. UK-based. No sponsors. No ads. No vendor partnerships.
            </p>
            <p className={styles.monoLine}>Based in the United Kingdom.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
