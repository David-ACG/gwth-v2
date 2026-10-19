import Link from "next/link"
import { ENABLE_BILLING } from "@/lib/config"
import {
  addMonths,
  offersChristmasMorning,
  formatPence,
  formatUkDate,
  getSaleWindow,
  isChristmasSale,
  isSalesOpen,
  PASS_PRICES_PENCE,
  passPrice,
} from "@/lib/billing/passes"
import { GiftForm } from "./gift-form"
import { GIFT_COPY as C } from "./gift-copy"
import form from "@/components/marketing/contact-fde/contact-fde.module.css"
import styles from "./gift.module.css"

/** YYYY-MM-DD of an instant in UK time. */
function ukDay(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(date)
}

/**
 * /gift (bead gwth-launch-v1uj.5, row 1.5): two gifts on one page, the whole
 * course (£69 in the Christmas sale, £87 from 7 January) and the first month
 * (£29 all year). Before sales open it says when they do; the checkout route
 * enforces the same dates, so the page can never sell early or late.
 */
export function GiftPage({ now = new Date() }: { now?: Date }) {
  const window = getSaleWindow()
  const onSale = ENABLE_BILLING && isSalesOpen(now, window)
  const inChristmasSale = isChristmasSale(now, window)

  return (
    <div className={form.shell}>
      <section className={form.masthead} data-section="masthead">
        <div className={form.page}>
          <h1 className={form.mastheadTitle}>
            {C.masthead.title} <em>{C.masthead.titleAccent}</em>
          </h1>
          <p className={form.standfirst}>{C.masthead.standfirst}</p>
        </div>
      </section>

      <section className={form.section} data-section="gift">
        <div className={`${form.page} ${styles.wideColumn}`}>
          {onSale ? (
            <GiftForm
              prices={{
                course: formatPence(passPrice("course", now, window).pence),
                month1: formatPence(passPrice("month1", now, window).pence),
              }}
              courseWasPrice={inChristmasSale ? formatPence(PASS_PRICES_PENCE.courseFull) : null}
              saleEndsOn={
                inChristmasSale
                  ? formatUkDate(new Date(window.saleEndsAt.getTime() - 1))
                  : null
              }
              christmasLabel={offersChristmasMorning(now) ? "25 December, 7am" : null}
              today={ukDay(now)}
              lastDay={ukDay(addMonths(now, 12))}
            />
          ) : (
            <div className={styles.notice} data-testid="gift-not-on-sale">
              <p className={styles.noticeTitle}>{C.notOnSale.title(formatUkDate(window.salesOpenAt))}</p>
              <p className={styles.noticeBody}>{C.notOnSale.body}</p>
            </div>
          )}

          <p className={`${styles.hint} ${styles.afterForm}`}>
            {C.links.haveCode}{" "}
            <Link href="/gift/open" className={styles.inlineLink}>
              {C.links.openIt}
            </Link>
            {onSale && (
              <>
                {" · "}
                {C.links.forYourself}{" "}
                <Link href="/pricing" className={styles.inlineLink}>
                  {C.links.seePrices}
                </Link>
              </>
            )}
          </p>
        </div>
      </section>

      <section className={`${form.section} ${styles.answersSection}`} data-section="answers">
        <div className={`${form.page} ${styles.wideColumn}`}>
          <div className={styles.answers}>
            {C.answers.map((a) => (
              <div key={a.title} className={styles.answer}>
                <h3>{a.title}</h3>
                <p>{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
