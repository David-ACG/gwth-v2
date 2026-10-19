import { LogoGwth } from "@/components/marketing/redesign/logo-gwth"
import { formatUkDate } from "@/lib/billing/passes"
import type { PassRecord } from "@/lib/billing/pass-store"
import { resolvePublicEmailBase } from "@/lib/email/auth-links"
import { CARD_COPY as C } from "./gift-copy"
import { PrintButton } from "./print-button"
import styles from "./gift-card-print.module.css"

/** The printable gift card: who it is for, what it is, the code, the open-by date. */
export function GiftCardPrint({ pass }: { pass: PassRecord | null }) {
  if (!pass) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <p className={styles.what}>{C.notFound}</p>
        </div>
      </main>
    )
  }
  const site = resolvePublicEmailBase().replace(/^https?:\/\//, "")
  return (
    <main className={styles.page}>
      <article className={styles.card} data-testid="gift-card">
        <LogoGwth width={140} />
        <h1 className={styles.heading}>{C.heading(pass.recipientName)}</h1>
        <p className={styles.what}>{C.what[pass.product]}</p>
        {pass.message && <p className={styles.message}>{pass.message}</p>}
        {pass.buyerName && <p className={styles.from}>{C.from(pass.buyerName)}</p>}
        <p className={styles.howTo}>{C.howTo(site)}</p>
        <p className={styles.code}>{pass.code}</p>
        <p className={styles.openBy}>{C.openBy(formatUkDate(pass.redeemBy))}</p>
      </article>
      <PrintButton className={styles.print} label={C.print} />
    </main>
  )
}
