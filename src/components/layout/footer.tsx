import Link from "next/link"
import { APP_NAME, ENABLE_NEWS } from "@/lib/config"
import { LogoGwth } from "@/components/marketing/redesign/logo-gwth"
import { cn } from "@/lib/utils"
import styles from "./footer-fde.module.css"

const footerLinks = [
  {
    title: "Product",
    links: [
      { href: "/for-institutions", label: "For institutions" },
      { href: "/for-teams", label: "For teams" },
      { href: "/pricing", label: "Pricing" },
      { href: "/why-gwth", label: "Why GWTH" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/lessons", label: "The course" },
      { href: "/labs", label: "Labs" },
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

/** Props for {@link Footer}. */
interface FooterProps {
  /**
   * Whether to show the Labs link (W25). Resolved once per request in
   * `(public)/layout.tsx` and passed in rather than read from env here, so the
   * footer and the nav can never disagree, and so this stays a pure component
   * that a static render cannot bake a stale answer into.
   */
  showLabs: boolean
}

/**
 * Site footer for public pages in the paper-first register (N12): a surface
 * band with a load-bearing top boundary, Public Sans column headers and links.
 * Shows logo, tagline, organised link columns, and copyright.
 */
export function Footer({ showLabs }: FooterProps) {
  const groups = showLabs
    ? footerLinks
    : footerLinks.map((col) => ({
        ...col,
        links: col.links.filter((link) => link.href !== "/labs"),
      }))

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
              A UK applied AI foundation. Build, automate, research and analyse
              in plain English, and finish with work you can show.
            </p>
          </div>
          {groups.map((group) => (
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
            <p className={styles.metaLine}>
              Independent. UK based. No sponsors. No ads. No vendor partnerships.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
