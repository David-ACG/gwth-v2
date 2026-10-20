import Link from "next/link"
import { LogoGwth } from "@/components/marketing/redesign/logo-gwth"
import { formatUkDate } from "@/lib/billing/passes"
import type { PassRecord } from "@/lib/billing/pass-store"
import { resolvePublicEmailBase } from "@/lib/email/auth-links"
import { CARD_COPY as C } from "./gift-copy"
import { PrintButton } from "./print-button"
import styles from "./gift-card-print.module.css"

/** The printable gift card: who it is for, what it is, the code, the open-by date. */
export function GiftCardPrint({ pass, now = new Date() }: { pass: PassRecord | null; now?: Date }) {
  if (!pass) {
    // A wrong or missing code: say where the card link is, offer the ways on,
    // and keep the logo so the visitor knows whose page this is (launch
    // readiness review, 2026-10-20).
    return (
      <main className={styles.page}>
        <div className={styles.card} data-testid="gift-card-not-found">
          <Link href="/" aria-label={C.back} className={styles.logoLink}>
            <LogoGwth width={140} />
          </Link>
          <h1 className={styles.notFoundTitle}>{C.notFound}</h1>
          <p className={styles.what}>{C.notFoundHelp}</p>
          <div className={styles.cardActions}>
            <Link href="/gift/open" className={styles.primary}>
              {C.openGift}
            </Link>
            <Link href="/contact" className={styles.back}>
              {C.contact}
            </Link>
            <Link href="/" className={styles.back}>
              {C.back}
            </Link>
          </div>
        </div>
        <LegalLinks />
      </main>
    )
  }
  const site = resolvePublicEmailBase().replace(/^https?:\/\//, "")
  const who = pass.recipientName?.trim() || "them"
  const firstName = pass.buyerName?.trim().split(/\s+/)[0] || null
  // Only a confirmed send says "we emailed"; a passed send time with no
  // confirmation says it is going now (Sol copy check, 2026-10-20).
  const sent = pass.deliveredAt !== null
  const due = !sent && pass.deliverAt !== null && pass.deliverAt <= now
  const sendDate = formatUkDate(pass.deliveredAt ?? pass.deliverAt ?? now)
  return (
    <main className={styles.page}>
      {/* For the buyer, on screen only (hidden when printed): David, 2026-10-20,
          "we need to say thank you to the buyer and we have sent / will send
          the gift to the person". */}
      {pass.isGift && (
        <section className={styles.note} data-testid="gift-card-thanks">
          <p className={styles.noteTitle}>{C.thanks(firstName)}</p>
          <p className={styles.noteBody}>
            {sent ? C.sent(who, sendDate) : due ? C.sending(who) : C.willSend(who, sendDate)} {C.printToo}
          </p>
        </section>
      )}
      <article className={styles.card} data-testid="gift-card">
        <Link href="/" aria-label={C.back} className={styles.logoLink}>
          <LogoGwth width={140} />
        </Link>
        <h1 className={styles.heading}>{C.heading(pass.recipientName)}</h1>
        <p className={styles.what}>{C.what[pass.product]}</p>
        {pass.message && <p className={styles.message}>{pass.message}</p>}
        {pass.buyerName && <p className={styles.from}>{C.from(pass.buyerName)}</p>}
        <p className={styles.howTo}>{C.howTo(site)}</p>
        <p className={styles.code}>{pass.code}</p>
        <p className={styles.openBy}>{C.openBy(formatUkDate(pass.redeemBy))}</p>
      </article>
      <div className={styles.actions}>
        <PrintButton className={styles.print} label={C.print} />
        <Link href="/" className={styles.back}>
          {C.back}
        </Link>
      </div>
      <LegalLinks />
    </main>
  )
}

/** Terms and Privacy, on screen only (hidden when the card is printed). */
function LegalLinks() {
  return (
    <nav aria-label="Legal" className={styles.legal}>
      <Link href="/terms">{C.terms}</Link>
      <Link href="/privacy">{C.privacy}</Link>
    </nav>
  )
}
