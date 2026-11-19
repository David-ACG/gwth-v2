import Link from "next/link"
import { formatUkDate } from "@/lib/billing/passes"
import type { PassRecord } from "@/lib/billing/pass-store"
import { THANKS_COPY as C } from "@/components/marketing/gift/gift-copy"
import form from "@/components/marketing/contact-fde/contact-fde.module.css"
import styles from "@/components/marketing/gift/gift.module.css"
import p from "@/components/marketing/paper/paper.module.css"
import { SmallPagesPlate } from "@/components/marketing/start-here-next/plate"
import { GIFT_PICTURE_ALT } from "./gift-next"
import frame from "./gift-next.module.css"

/**
 * `/gift/thanks` in the family look (19 Nov 2026, the Fable public pages
 * round), where Stripe returns the buyer. ONLY THE FRAME IS NEW: the headline
 * and the panel sit on the paper ground, and a finished gift is shown beside
 * the gift picture.
 *
 * Everything inside the panel is copied line for line from
 * `gift/gift-thanks-page.tsx`, because that file builds the panel and its
 * frame in one function: the four states (no payment to check, confirming
 * the payment, a gift, a course bought for yourself), the code, the open-by
 * date, the print link and the refund rule. The words are `THANKS_COPY`'s and
 * the inner styles are `gift/gift.module.css`'s, both imported.
 *
 * If `gift/gift-thanks-page.tsx` changes, make the same change here.
 */
export function GiftThanksNext({
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

  // A finished gift is shown beside the present; every other state is one
  // calm column.
  const withPicture = Boolean(pass?.isGift)
  const words = (
    <div data-section="thanks">
      <h1 className={frame.heroTitle}>{title}</h1>
      <div className={frame.heroPanel}>
        <div className={form.panel}>{body}</div>
      </div>
    </div>
  )

  return (
    <div className={p.shell}>
      <section className={`${frame.hero} ${frame.heroEnd}`} data-section="masthead">
        <div className={p.page}>
          {withPicture ? (
            <div className={`${frame.heroGrid} ${frame.heroGridTop}`}>
              {words}
              <figure className={`${p.plate} ${frame.heroPicture}`}>
                <SmallPagesPlate
                  name="gift"
                  alt={GIFT_PICTURE_ALT}
                  sizes="(max-width: 1023px) 100vw, 540px"
                  priority
                />
              </figure>
            </div>
          ) : (
            <div className={frame.single}>{words}</div>
          )}
        </div>
      </section>
    </div>
  )
}
