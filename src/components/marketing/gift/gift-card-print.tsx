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
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <p className={styles.what}>{C.notFound}</p>
        </div>
        <Link href="/" className={styles.back}>
          {C.back}
        </Link>
      </main>
    )
  }
  const site = resolvePublicEmailBase().replace(/^https?:\/\//, "")
  const who = pass.recipientName?.trim() || "them"
  const firstName = pass.buyerName?.trim().split(/\s+/)[0] || null
  const sent = pass.deliveredAt !== null || (pass.deliverAt !== null && pass.deliverAt <= now)
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
            {sent ? C.sent(who, sendDate) : C.willSend(who, sendDate)} {C.printToo}
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
    </main>
  )
}
