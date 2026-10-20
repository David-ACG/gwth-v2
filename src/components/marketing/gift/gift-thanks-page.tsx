import Link from "next/link"
import { formatUkDate } from "@/lib/billing/passes"
import type { PassRecord } from "@/lib/billing/pass-store"
import { THANKS_COPY as C } from "./gift-copy"
import form from "@/components/marketing/contact-fde/contact-fde.module.css"
import styles from "./gift.module.css"

/**
 * /gift/thanks (bead gwth-launch-v1uj.5): where Stripe returns the buyer. The
 * page route fulfils the order itself if the webhook has not yet, so this
 * always shows the real pass, or "we're confirming your payment". Opened
 * with no payment to check (no Stripe session in the link), it says so and
 * offers the gift page and Contact instead of waiting forever (launch
 * readiness review, 2026-10-20).
 */
export function GiftThanksPage({
  pass,
  hasPayment = true,
  now = new Date(),
}: {
  pass: PassRecord | null
  /** False when the link carries no Stripe checkout session to look up. */
  hasPayment?: boolean
  now?: Date
}) {
  let title: React.ReactNode
  let body: React.ReactNode

  if (!pass && !hasPayment) {
    title = C.noPayment.title
    body = (
      <div className={styles.stack} data-testid="thanks-no-payment">
        <p className={styles.noticeBody}>{C.noPayment.body}</p>
        <div className={styles.actions}>
          <Link href="/gift" className={form.buttonSolid}>
            {C.noPayment.gift}
          </Link>
          <Link href="/contact" className={form.buttonOutline}>
            {C.noPayment.contact}
          </Link>
        </div>
      </div>
    )
  } else if (!pass) {
    title = C.pending.title
    body = (
      <div className={styles.stack} data-testid="thanks-pending">
        <p className={styles.noticeBody}>{C.pending.body}</p>
        <p className={styles.hint}>
          {C.pending.helpLead}{" "}
          <Link href="/contact" className={styles.inlineLink}>
            {C.pending.helpLink}
          </Link>
          .
        </p>
      </div>
    )
  } else if (pass.isGift) {
    const who = pass.recipientName ?? "them"
    // Only a confirmed send says "we've emailed"; a passed send time with no
    // confirmation says it is going now (Sol copy check, 2026-10-20).
    const sent = pass.deliveredAt !== null
    const due = !sent && pass.deliverAt !== null && pass.deliverAt <= now
    title = (
      <>
        {C.gift.title} <em>{C.gift.titleAccent}</em>
      </>
    )
    body = (
      <div className={styles.stack} data-testid="gift-thanks">
        <p className={styles.noticeBody}>
          {sent
            ? C.gift.sentNow(who)
            : due
              ? C.gift.sending(who)
              : C.gift.body(who, pass.deliverAt ? formatUkDate(pass.deliverAt) : "")}
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
        <p className={styles.hint} data-testid="gift-thanks-refund">
          {C.refund.lead}{" "}
          <Link href="/contact" className={styles.inlineLink}>
            {C.refund.contact}
          </Link>
          {C.refund.rest}{" "}
          <Link href="/terms" className={styles.inlineLink}>
            {C.refund.terms}
          </Link>
          .
        </p>
      </div>
    )
  } else {
    title = (
      <>
        {C.self.title} <em>{pass.redeemedAt ? C.self.titleAccent : C.self.titleAccentNotOpened}</em>
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
