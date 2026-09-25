import Link from "next/link"
import { LogoGwth } from "@/components/marketing/redesign/logo-gwth"
import styles from "@/components/auth/auth-fde.module.css"

/**
 * Shared shell for the auth surfaces (login, signup, forgot-password,
 * reset-password, error) in the FDE journal register (DESIGN_FDE.md,
 * Direction C — "journal masthead + panel").
 *
 * A full-width masthead in the quiet paper fill carries the GWTH.ai wordmark
 * only (linking home), in exactly the inks the home page nav uses (bead
 * gwth-launch-awb, pinned by layout.test.tsx); each surface renders its own
 * panel centred on the page ground.
 * The `--v-*` palette is scoped to `.shell`, so the site-wide theme toggle
 * (`.dark` on `<html>`) flips the whole surface.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={styles.shell}>
      <header className={styles.masthead} data-section="masthead">
        <div className={`${styles.page} ${styles.mastheadInner}`}>
          <Link href="/" aria-label="GWTH.ai home" className={styles.wordmarkLink}>
            {/* The masthead is the quiet paper fill in the paper-first register
                (N12), so the wordmark takes the site inks. The `onDark` variant
                (cream + mint, W23) is for a genuinely dark ground, and this is
                no longer one. */}
            <LogoGwth width={150} />
          </Link>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.panelColumn}>{children}</div>
      </main>
    </div>
  )
}
