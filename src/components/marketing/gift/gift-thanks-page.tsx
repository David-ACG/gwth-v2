import Link from "next/link"
import { formatUkDate } from "@/lib/billing/passes"
import type { PassRecord } from "@/lib/billing/pass-store"
import { THANKS_COPY as C } from "./gift-copy"
import form from "@/components/marketing/contact-fde/contact-fde.module.css"
import styles from "./gift.module.css"

/**
 * /gift/thanks (bead gwth-launch-v1uj.5): where Stripe returns the buyer. The
 * page route fulfils the order itself if the webhook has not yet, so this
 * always shows the real pass, or "we're confirming your payment".
 */
export function GiftThanksPage({ pass, now = new Date() }: { pass: PassRecord | null; now?: Date }) {
  let title: React.ReactNode
  let body: React.ReactNode

  if (!pass) {
    title = C.pending.title
    body = <p className={styles.noticeBody}>{C.pending.body}</p>
  } else if (pass.isGift) {
    const who = pass.recipientName ?? "them"
    const sentAlready = pass.deliveredAt !== null || (pass.deliverAt !== null && pass.deliverAt <= now)
    title = (
      <>
        {C.gift.title} <em>{C.gift.titleAccent}</em>
      </>
    )
    body = (
      <div className={styles.stack} data-testid="gift-thanks">
        <p className={styles.noticeBody}>
          {sentAlready ? C.gift.sentNow(who) : C.gift.body(who, pass.deliverAt ? formatUkDate(pass.deliverAt) : "")}
        </p>
        <dl className={styles.rows}>
          <div>
            <dt>{C.gift.code}</dt>
            <dd>
              <span className={styles.code} data-testid="gift-code">
                {pass.code}
              </span>
            </dd>
          </div>
          <div>
            <dt>{C.gift.openBy}</dt>
            <dd>{formatUkDate(pass.redeemBy)}</dd>
          </div>
        </dl>
        <p className={styles.hint}>{C.gift.printNote}</p>
        <div className={styles.actions}>
          <Link href={`/gift/card?code=${encodeURIComponent(pass.code)}`} className={form.buttonSolid}>
            {C.gift.print}
          </Link>
        </div>
      </div>
    )
  } else {
    title = (
      <>
        {C.self.title} <em>{C.self.titleAccent}</em>
      </>
    )
    body = (
      <div className={styles.stack} data-testid="self-thanks">
        <p className={styles.noticeBody}>{pass.redeemedAt ? C.self.body : C.self.notOpened}</p>
        {pass.redeemedAt && (
          <div className={styles.actions}>
            <Link href="/dashboard" className={form.buttonSolid}>
              {C.self.button}
            </Link>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={form.shell}>
      <section className={form.masthead} data-section="masthead">
        <div className={form.page}>
          <h1 className={form.mastheadTitle}>{title}</h1>
        </div>
      </section>
      <section className={form.section} data-section="thanks">
        <div className={form.page}>
          <div className={form.panelColumn}>
            <div className={form.panel}>{body}</div>
          </div>
        </div>
      </section>
    </div>
  )
}
