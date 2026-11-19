import type { ReactNode } from "react"
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
import { GiftForm } from "@/components/marketing/gift/gift-form"
import { GIFT_COPY as C } from "@/components/marketing/gift/gift-copy"
import p from "@/components/marketing/paper/paper.module.css"
import { SmallPagesPlate } from "@/components/marketing/start-here-next/plate"
import { Reveal } from "@/components/marketing/start-here-next/reveal"
import styles from "./gift-next.module.css"

/**
 * `/gift` in the family look (19 Nov 2026, the Fable public pages round):
 * the page should feel like a present. A picture of one being written, the
 * words beside it, then the order form, how a gift works in three steps and
 * the three answers.
 *
 * ## What is unchanged
 *
 * - The conditions are `GiftPage`'s, line for line: on sale only when billing
 *   is on AND sales are open (`isSalesOpen`), the Christmas price and the
 *   Christmas-morning option only while they apply. Before that the page says
 *   when gifts go on sale and shows no form. The checkout route enforces the
 *   same dates, so the page can never sell early or late.
 * - The order form is `GiftForm`, imported untouched, with the same props.
 * - Every sentence that states a price, a date or a rule is `GIFT_COPY`'s
 *   (`gift/gift-copy.ts`), imported, not retyped.
 *
 * The three "How a gift works" steps restate facts already in `GIFT_COPY`,
 * `OPEN_COPY` and `THANKS_COPY` (what can be given, when it is emailed, the
 * printed card, the code, the free account, one year to open it).
 *
 * Picture: a paper cutout in the style David picked on 13 Nov 2026. Brief and
 * prompts: GWTH-launch-plan `completion/public-pages-fable/pictures/small-pages/`.
 */

/** YYYY-MM-DD of an instant in UK time. */
function ukDay(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(date)
}

export const GIFT_PICTURE_ALT =
  "A paper cutout scene: a man at a table by a window writes a message in a small card. In front of him stands an envelope tied with a green ribbon and bow."

type StepId = "choose" | "send" | "open"

export const GIFT_STEPS: readonly { id: StepId; title: string; body: string }[] = [
  {
    id: "choose",
    title: "Choose the gift",
    body: "Give the whole course, which is Months 1, 2 and 3, or give the first month.",
  },
  {
    id: "send",
    title: "We email it for you",
    body: "Add your name and a message, and choose when we email it. You can also print a gift card and give it in person.",
  },
  {
    id: "open",
    title: "They open it when they're ready",
    body: "They open the gift with its code and a free GWTH account. Their time starts then, not when the email arrives. They must open it within one year of purchase.",
  },
]

function StepIcon({ id }: { id: StepId }) {
  const common = {
    width: 26,
    height: 26,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: "false" as const,
    className: styles.icon,
  }
  const paths: Record<StepId, ReactNode> = {
    choose: (
      <>
        <rect x="3.5" y="9" width="17" height="11" rx="1.5" />
        <path d="M2.5 9h19M12 9v11" />
        <path d="M12 9c-1.2-3.8-5.5-4-5.5-1.8C6.5 8.6 9.5 9 12 9zM12 9c1.2-3.8 5.5-4 5.5-1.8C17.5 8.6 14.5 9 12 9z" />
      </>
    ),
    send: (
      <>
        <rect x="3" y="5.5" width="18" height="13" rx="1.5" />
        <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
      </>
    ),
    open: (
      <>
        <circle cx="8" cy="12" r="3.5" />
        <path d="M11.5 12h9M17 12v3M20.5 12v2" />
      </>
    ),
  }
  return <svg {...common}>{paths[id]}</svg>
}

export function GiftNext({ now = new Date() }: { now?: Date }) {
  const window = getSaleWindow()
  const onSale = ENABLE_BILLING && isSalesOpen(now, window)
  const inChristmasSale = isChristmasSale(now, window)

  return (
    <div className={p.shell}>
      <section className={styles.hero} data-section="masthead">
        <div className={p.page}>
          <div className={styles.heroGrid}>
            <div>
              <h1 className={styles.heroTitle}>
                {C.masthead.title} <em>{C.masthead.titleAccent}</em>
              </h1>
              <p className={styles.heroLead}>{C.masthead.standfirst}</p>

              {onSale ? (
                <div className={p.actions}>
                  <a href="#choose" className={p.buttonSolid}>
                    {C.products.legend}
                  </a>
                </div>
              ) : (
                <div className={styles.notice} data-testid="gift-not-on-sale">
                  <p className={styles.noticeTitle}>
                    {C.notOnSale.title(formatUkDate(window.announcedOpenAt))}
                  </p>
                  <p className={styles.noticeBody}>{C.notOnSale.body}</p>
                </div>
              )}

              <p className={styles.links}>
                <span>
                  {C.links.haveCode}{" "}
                  <Link href="/gift/open">{C.links.openIt}</Link>
                </span>
                {onSale && (
                  <span>
                    {C.links.forYourself}{" "}
                    <Link href="/pricing">{C.links.seePrices}</Link>
                  </span>
                )}
              </p>
            </div>
            <figure className={`${p.plate} ${styles.heroPicture}`}>
              <SmallPagesPlate
                name="gift"
                alt={GIFT_PICTURE_ALT}
                sizes="(max-width: 1023px) 100vw, 540px"
                priority
              />
            </figure>
          </div>
        </div>
      </section>

      {onSale && (
        <section className={`${p.section} ${styles.anchor}`} data-section="gift" id="choose">
          <div className={p.page}>
            <div className={styles.formColumn}>
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
            </div>
          </div>
        </section>
      )}

      <section className={p.section} data-section="how">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>
              How a gift <em>works</em>
            </h2>
          </div>
          <ol className={styles.steps}>
            {GIFT_STEPS.map((step, index) => (
              <Reveal as="li" className={styles.step} key={step.id} delay={index * 110} data-testid="gift-step">
                <div className={styles.stepTop}>
                  <span className={styles.stepNumber} aria-hidden="true">
                    {index + 1}
                  </span>
                  <StepIcon id={step.id} />
                </div>
                <h3 className={p.cardTitle}>{step.title}</h3>
                <p className={p.cardBody}>{step.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className={`${p.section} ${styles.end}`} data-section="answers">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>Good to know</h2>
          </div>
          <div className={styles.answers}>
            {C.answers.map((a, index) => (
              <Reveal key={a.title} className={styles.answer} delay={index * 90}>
                <h3>{a.title}</h3>
                <p>{a.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
