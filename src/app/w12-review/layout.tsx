import type { Metadata } from "next"
import Link from "next/link"
import styles from "./review.module.css"
import { ReviewThemeToggle } from "./theme-toggle"

export const metadata: Metadata = {
  title: "W12 explainer review | GWTH.ai",
  description:
    "Review scaffolding for the homepage explainer video (W12). Not linked in navigation.",
  robots: { index: false, follow: false },
}

/**
 * Layout for the W12 explainer review area. A sticky mono banner keeps the
 * "review scaffolding, not linked" context visible and offers cross-links plus
 * a theme toggle. The whole `w12-review/` tree is deleted at finalisation once
 * David has approved the script and picked motion + embed.
 */
export default function W12ReviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={styles.shell}>
      <div className={styles.banner}>
        <p className={styles.bannerLabel}>W12 · explainer review · noindex</p>
        <nav className={styles.bannerNav}>
          <Link href="/w12-review">Overview</Link>
          <Link href="/w12-review/scripts">Scripts</Link>
          <Link href="/w12-review/takes">Takes</Link>
          <Link href="/w12-review/motion">Motion</Link>
          <Link href="/w12-embed-demo?at=after-hero&chrome=framed">
            Embed demos
          </Link>
          <ReviewThemeToggle />
        </nav>
      </div>
      {children}
    </div>
  )
}
