import type { ReactNode } from "react"
import Link from "next/link"
import { LATER_MONTHS_OPEN, PRICING } from "@/components/marketing/data"
import {
  COURSE_MONTHLY_PRICE,
  ENABLE_BILLING,
  ENABLE_TEAM_DASHBOARD,
  ONGOING_MONTHLY_PRICE,
  TOTAL_COURSE_MONTHS,
  TOTAL_MANDATORY_LESSONS,
} from "@/lib/config"
import { canPromoteLabs } from "@/lib/labs-cta"
import {
  formatPence,
  formatUkDate,
  getSaleWindow,
  isChristmasSale,
  isSalesOpen,
  PASS_PRICES_PENCE,
  passPrice,
} from "@/lib/billing/passes"
import { BuyButton } from "@/components/billing/buy-button"
import { PRICING_OFFER_COPY as OFFER } from "@/components/marketing/gift/gift-copy"
import { DEFAULT_GATE_PERCENT } from "@/lib/protection/month-hold"
import p from "@/components/marketing/paper/paper.module.css"
import { PricingPlate } from "./pricing-plate"
import styles from "./pricing-next.module.css"

/**
 * The pricing page, rebuilt on 19 Nov 2026 to sit beside the new home page
 * (`home-next`). David's words about the page it replaces (`pricing-fde`, kept
 * untouched as the backup): *"Pricing looks extremely complex and messy. We
 * really need to revamp that page."*
 *
 * ## The idea
 *
 * The page answers in the order a visitor asks:
 *
 * 1. **What does it cost?** Three figures, set as a stat list in the hero:
 *    the pass, the monthly price and the things that cost nothing.
 * 2. **When does each month open?** A short section BEFORE the ways to pay
 *    (David, 12 Nov 2026, option A): the 75% rule as a drawn path (Month 1,
 *    75%, Month 2, 75%, Month 3) and "The rule" paragraph.
 * 3. **How do I pay?** Two cards side by side. Their rows line up (CSS
 *    subgrid), so the cards read as a comparison without being a table.
 * 4. **What do I get?** Five short items.
 * 5. **More on how months open.** The rest of the rule in titled pieces: the
 *    three points, waiting, the reason, and how the course is protected.
 * 6. **What happens after three months?** One section, both ways to pay.
 * 7. Gifts, teams and organisations, plain questions and answers, and what is
 *    free.
 *
 * ## What must not drift (all carried over from `pricing-fde`)
 *
 * - **Every number is read, never typed**: prices from `lib/config` and
 *   `lib/billing/passes`, dates from the sale window and `LATER_MONTHS_OPEN`,
 *   the share from the gate's own `DEFAULT_GATE_PERCENT`, the lesson count
 *   from `TOTAL_MANDATORY_LESSONS`.
 * - **Two selling states.** Before sales open (and whenever billing is off)
 *   every paying button is the waitlist and the £69 price is described as the
 *   price from the opening date. From the opening date the cards sell. From
 *   the day after the offer ends the pass is the full price and the offer
 *   words go by themselves. The checkout routes enforce the same dates.
 * - **The 75% rule, the review hold and the personal media links** (bead
 *   gwth-launch-735c) are on the page in full, in plain view, with no
 *   disclosure to open. The rule itself comes before the ways to pay and is
 *   said again beside the paying buttons ("opening rules above"). The wording
 *   is the approved wording (latest Astra, checked by the latest Sol, 12 Nov
 *   2026).
 * - **What happens when a pass ends** is David's 19 Nov wording (4a8afd1):
 *   "Your access to the course lessons stops. You only pay again if you
 *   choose to subscribe at £7.50 a month."
 * - **Who can take GWTH?** is one of the four places the age is stated
 *   (Terms, Privacy, here, the sign-up form). Change all four together.
 * - David's 14 Sep 2026 annotations still hold: nothing says the course is
 *   finished ("after the first three months" throughout), no "try before you
 *   join" for the labs, no consultant-hour comparison, and the £7.50 is never
 *   set at display size beside the £29.
 * - Labs buttons follow `canPromoteLabs()`, the manager dashboard wording
 *   follows `ENABLE_TEAM_DASHBOARD`, and the gift button only shows while
 *   selling.
 *
 * Organisations now have one page, `/for-organisations` (it replaces
 * `/for-teams` and `/for-institutions`).
 *
 * Pictures: paper cutouts in the style David picked on 13 Nov 2026, drawn by
 * the latest Astra. Brief and prompts: GWTH-launch-plan
 * `completion/public-pages-fable/pictures/pricing/`.
 */

/** The completion share the course gate uses, read from the gate itself. */
const SHARE = `${DEFAULT_GATE_PERCENT}%`

/** Where the opening rules sit on this page; the note beside the buttons links here. */
const RULES_ANCHOR = "month-opening-rules"

/** The rest of the opening rules, lower down the page. */
const DETAIL_ANCHOR = "month-opening-detail"

type PayCard = {
  key: "pass" | "monthly"
  name: string
  price: string
  unit: string
  note: string
  end: string
  cancel: string
  renews: string
}

const ROW_LABELS = {
  end: "At the end of month three",
  cancel: "How to cancel",
  renews: "Does it renew?",
} as const

function Tick() {
  return (
    <svg
      className={styles.tick}
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M3.5 9.5l3.5 3.5 7.5-8" />
    </svg>
  )
}

export function PricingNext({ now = new Date() }: { now?: Date } = {}) {
  const free = PRICING[0]!
  const ongoing = ONGOING_MONTHLY_PRICE.toFixed(2)
  const monthly = `£${COURSE_MONTHLY_PRICE}`

  // The sale window (beads gwth-launch-v1uj.5 and .9), exactly as on the page
  // this replaces. Selling needs billing on AND the opening date reached.
  const window = getSaleWindow()
  const salesOpen = isSalesOpen(now, window)
  const selling = ENABLE_BILLING && salesOpen
  // The £69 words are shown before sales open and until the offer ends; only
  // the buttons wait for the opening date.
  const christmas = isChristmasSale(now, window) || !salesOpen
  const salesOpenOn = formatUkDate(window.announcedOpenAt)
  const saleEndsOn = formatUkDate(new Date(window.saleEndsAt.getTime() - 1))
  // Before sales open the page already names the price it will sell at;
  // passPrice() alone would give the full price until the opening date.
  const coursePass = formatPence(
    christmas
      ? PASS_PRICES_PENCE.courseSale
      : passPrice("course", now, window).pence
  )
  const courseFull = formatPence(PASS_PRICES_PENCE.courseFull)
  const firstMonth = formatPence(PASS_PRICES_PENCE.month1)
  const labsOpen = canPromoteLabs()

  const cards: PayCard[] = [
    {
      key: "pass",
      name: "Pay once for three months",
      price: coursePass,
      unit: "once",
      note: christmas
        ? `This is the price from ${salesOpenOn} to ${saleEndsOn}. After that a pass costs ${courseFull}. One payment covers all three months.`
        : "One payment covers all three months.",
      end: `Your access to the course lessons stops. You only pay again if you choose to subscribe at £${ongoing} a month.`,
      cancel: "The pass ends by itself; you don't need to cancel.",
      renews: "No.",
    },
    {
      key: "monthly",
      name: "Pay monthly",
      price: monthly,
      unit: "a month",
      note: `You pay this for each of the first three months. All three cost £${
        COURSE_MONTHLY_PRICE * TOTAL_COURSE_MONTHS
      }. Each payment opens one month.`,
      end: `Your plan continues automatically unless you cancel. Continued access to updated lessons costs £${ongoing} a month.`,
      cancel:
        "Cancel at any time in your account settings. Keep access until the end of the month you've paid for.",
      renews: "Yes. We email you before each payment.",
    },
  ]

  const buyButtons: Record<PayCard["key"], ReactNode> = {
    pass: (
      <BuyButton
        endpoint="/api/passes/checkout"
        body={{ gift: false, product: "course" }}
        label={OFFER.buySelf(coursePass)}
        returnTo="/pricing"
        className={p.buttonSolid}
        errorClassName={styles.buyError}
      />
    ),
    monthly: (
      <BuyButton
        endpoint="/api/stripe/checkout"
        body={{ plan: "course" }}
        label={OFFER.monthly(monthly)}
        returnTo="/pricing"
        className={p.buttonSolid}
        errorClassName={styles.buyError}
      />
    ),
  }

  /** What the course price buys. Facts from `PRICING` and the home page. */
  const included = [
    {
      title: "Three monthly parts",
      body: "About five hours of work a week. Each month builds on the one before.",
    },
    {
      title: `${TOTAL_MANDATORY_LESSONS} core lessons`,
      body: "Plus optional lessons for your field.",
    },
    {
      title: "Projects you make yourself",
      body: "Including your own portfolio website, the AskMyCo support chatbot and your own AI consultant.",
    },
    {
      title: "A marked project each month",
      body: "You hand in a major project at the end of each month. AI marks it against GWTH's published marking guides, and a person at GWTH checks any mark in doubt.",
    },
    {
      title: "Your GWTH score",
      body: "A number out of 100. It combines the core lessons you've passed, your quiz results and your best marks for the three monthly projects.",
    },
  ]

  return (
    <div className={p.shell}>
      {/* 1. The answer. Three figures, then the picture. */}
      <section className={styles.hero} data-section="masthead">
        <div className={p.page}>
          <div className={styles.heroGrid}>
            <div>
              <h1 className={styles.heroTitle}>
                What the course <em>costs</em>
              </h1>
              <p className={styles.heroLead} data-testid="hero-what-you-get">
                Both ways to pay get you the same course: three monthly parts,{" "}
                {TOTAL_MANDATORY_LESSONS} core lessons and a marked project at
                the end of each month.
              </p>
              <dl className={styles.figures} data-testid="masthead-price-line">
                <div className={styles.figure}>
                  <dt>{coursePass}</dt>
                  <dd>
                    once, for all three months
                    {christmas
                      ? `, if you buy from ${salesOpenOn} to ${saleEndsOn}. After that, ${courseFull}.`
                      : "."}
                  </dd>
                </div>
                <div className={styles.figure}>
                  <dt>{monthly}</dt>
                  <dd>
                    a month for the first three months, then £{ongoing}{" "}a month
                    if you stay. Cancel at any time.
                  </dd>
                </div>
                <div className={styles.figure}>
                  <dt>{free.price}</dt>
                  <dd>for the free lesson and the six free labs.</dd>
                </div>
              </dl>
              {!salesOpen && (
                <p className={styles.opens} data-testid="pricing-opens">
                  The course opens on {salesOpenOn}. These are the prices from
                  that day.
                </p>
              )}
              <div className={p.actions}>
                {selling ? (
                  <a href="#how-to-pay" className={p.buttonSolid}>
                    Choose how to pay
                  </a>
                ) : (
                  <Link href="/waitlist" className={p.buttonSolid}>
                    Join the waitlist
                  </Link>
                )}
                <Link href="/start-here" className={p.buttonOutline}>
                  Try the free lesson
                </Link>
              </div>
            </div>
            <figure className={`${p.plate} ${styles.heroPicture}`}>
              <PricingPlate
                name="choose"
                priority
                alt="A paper cutout scene: a woman stands between two green card arches. The left arch has one large ticket above the label Pay once. The right arch has three smaller tickets above the label Pay monthly."
                sizes="(max-width: 1023px) 100vw, 540px"
              />
            </figure>
          </div>
        </div>
      </section>

      {/* 2. When each month opens, BEFORE the ways to pay (bead
          gwth-launch-735c; David, 12 Nov 2026, option A: "one short section
          before the buying options, a reminder beside each button";
          docs/content-protection-go-live.md). Short on purpose: the path and
          the rule. The other pieces are lower down, in plain view. */}
      <section
        className={p.section}
        data-section="month-rules"
        data-testid="month-opening-rules"
        id={RULES_ANCHOR}
      >
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>When each course month opens</h2>
          </div>
          <p className={styles.lead}>
            You take the months in order. Finish {SHARE}{" "}of a month&apos;s
            core lessons and the next month can open.
          </p>

          <ol className={styles.path} data-testid="month-path">
            <li className={styles.pathMonth}>
              <h3>Month 1</h3>
              <p>Available from {salesOpenOn}.</p>
              <p>It starts when you pay or open your pass.</p>
            </li>
            <li className={styles.pathGate}>
              <span className={styles.gateFigure}>{SHARE}</span>
              <span className={styles.gateLabel}>
                of Month 1&apos;s core lessons finished
              </span>
            </li>
            <li className={styles.pathMonth}>
              <h3>Month 2</h3>
              <p>Opens for everyone around {LATER_MONTHS_OPEN.month2}.</p>
            </li>
            <li className={styles.pathGate}>
              <span className={styles.gateFigure}>{SHARE}</span>
              <span className={styles.gateLabel}>
                of Month 2&apos;s core lessons finished
              </span>
            </li>
            <li className={styles.pathMonth}>
              <h3>Month 3</h3>
              <p>Opens for everyone around {LATER_MONTHS_OPEN.month3}.</p>
            </li>
          </ol>

          <div className={styles.ruleTop}>
            <div className={styles.rule}>
              <h3>The rule</h3>
              <p>
                Month 1 starts when you pay or open your pass. Before Month 2
                opens, you must finish {SHARE}{" "}of Month 1&apos;s core
                lessons. Before Month 3 opens, you must finish {SHARE}{" "}of
                Month 2&apos;s core lessons. Use Finish lesson at the end of
                each lesson to record that you&apos;ve finished it. Optional
                lessons do not count and are never required for a later month
                to open. There is no time limit on reaching {SHARE}.
              </p>
            </div>
            <p className={styles.aside}>
              <a href={`#${DETAIL_ANCHOR}`}>More on how months open</a>
            </p>
          </div>
        </div>
      </section>

      {/* 3. The choice. Two cards whose rows line up. */}
      <section
        className={p.section}
        data-section="offer"
        data-testid="pricing-offer"
        id="how-to-pay"
      >
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>Choose how to pay</h2>
          </div>
          <p className={styles.lead}>
            Pay once for the whole course with a three-month pass, or pay a
            month at a time.
          </p>
          <div className={styles.payCards} data-testid="pay-compare">
            {cards.map((card) => (
              <article
                className={styles.payCard}
                key={card.key}
                data-testid="pay-card"
                data-plan={card.key}
              >
                <div className={styles.payHead}>
                  <h3 className={styles.payName}>{card.name}</h3>
                  {card.key === "pass" && christmas && (
                    <span className={styles.chip}>Christmas price</span>
                  )}
                </div>
                <p className={styles.payPrice}>
                  <strong>{card.price}</strong> {card.unit}
                </p>
                <p className={styles.payNote}>{card.note}</p>
                {(["end", "cancel", "renews"] as const).map((row) => (
                  <div className={styles.payRow} key={row}>
                    <h4>{ROW_LABELS[row]}</h4>
                    <p>{card[row]}</p>
                  </div>
                ))}
                <div className={styles.payAction}>
                  {selling ? (
                    buyButtons[card.key]
                  ) : !salesOpen ? (
                    <p className={styles.payStatus}>
                      On sale from {salesOpenOn}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>

          {!selling && (
            <div className={styles.waitRow}>
              <Link href="/waitlist" className={p.buttonSolid}>
                Join the waitlist
              </Link>
            </div>
          )}

          <div className={styles.beforeYouPay}>
            {/* The 75% rule beside the paying buttons (bead gwth-launch-735c,
                wording option A, David 12 Nov 2026). */}
            <div>
              <h3>Months open in order</h3>
              <p data-testid="pricing-offer-rule">
                Months 2 and 3 each require {SHARE}{" "}of the previous
                month&apos;s core lessons to be finished, under the{" "}
                <a href={`#${RULES_ANCHOR}`}>opening rules above</a>. With a
                pass, your pass time is paused while you wait. On a monthly
                plan, your next payment waits until that month can open.
              </p>
            </div>
            <div>
              <h3>Refunds and terms</h3>
              <p data-testid="pricing-offer-terms">
                For a pass for yourself, sign in before paying. We refund a
                pass in full until it&apos;s opened, but not after, unless the
                law requires. To ask for a refund,{" "}
                <Link href="/contact">contact us</Link>. See the{" "}
                <Link href="/terms#passes">Terms for passes</Link> and the{" "}
                <Link href="/terms#subscriptions">
                  Terms for monthly payments
                </Link>
                , including refunds.
              </p>
            </div>
          </div>
          <p className={styles.ukNote} data-testid="pricing-uk-note">
            Prices in pounds for the UK, with no VAT added
          </p>
        </div>
      </section>

      {/* 4. What the price buys. */}
      <section className={p.section} data-section="included" id="what-you-get">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>What you get</h2>
          </div>
          <ul className={styles.included} data-tier="course">
            {included.map((item) => (
              <li key={item.title}>
                <Tick />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 5. The rest of the opening rules (bead gwth-launch-735c), in plain
          view, never inside a disclosure: the three points, waiting, the
          reason, and how the course is protected. */}
      <section
        className={p.section}
        data-section="month-detail"
        data-testid="month-opening-detail"
        id={DETAIL_ANCHOR}
      >
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>More on how months open</h2>
          </div>
          <div className={`${styles.rules} ${styles.rulesDetail}`}>
            <div className={styles.rule}>
              <h3>When a later month opens</h3>
              <p>Each later month opens at the latest of three points:</p>
              <ul>
                <li>Its opening date for everyone, shown above.</li>
                <li>
                  Your own start date for that month: one month after your
                  previous month began with a pass, or your next monthly
                  payment date if you pay monthly.
                </li>
                <li>When you&apos;ve reached the required {SHARE}.</li>
              </ul>
            </div>
            <div className={styles.rule}>
              <h3>While you wait</h3>
              <p>
                While you wait, you keep using the month you&apos;re on. With
                a pass, including a gift or prepaid team place, your course
                time is paused, so you still get a full month of each part. On
                a monthly plan, your next payment waits until that month can
                open; your plan is not cancelled.
              </p>
            </div>
            <div className={styles.rule}>
              <h3>Why there is a rule</h3>
              <p>
                The completion rule helps stop someone copying the whole
                course in a few days from one account. Each month also builds
                on the one before.
              </p>
            </div>
            <div className={`${styles.rule} ${styles.ruleWide}`}>
              <h3>How we protect the course</h3>
              <p data-testid="media-links-note">
                Videos, audio and pictures use links made for your account
                that stop working after a few hours; they still play and
                display normally inside GWTH.
              </p>
              <p>
                We also check lesson-opening activity for bulk copying and
                account sharing. If an automatic check flags your account,
                your next month is held for a person at GWTH to review,
                usually within a day. The same arrangements for access, pass
                time and payments apply while it is held. See{" "}
                <Link href="/terms#course-months">how months open</Link> and{" "}
                <Link href="/terms#course-protection">
                  how we protect the course
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. After the first three months. David's own sentence (ledger C13)
          says why the price drops; his 19 Nov wording says what a pass does. */}
      <section
        className={p.section}
        data-section="after"
        id="after-three-months"
      >
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>
              What happens after <em>the first three months</em>
            </h2>
          </div>
          <div className={styles.split}>
            <figure className={`${p.plate} ${styles.splitPicture}`}>
              <PricingPlate
                name="updated"
                alt="A paper cutout scene: a man stands at a wall of lesson cards and slides a new card into place, holding the old one in his other hand. The label reads Lessons kept up to date."
                sizes="(max-width: 1023px) 100vw, 520px"
              />
            </figure>
            <div data-testid="after-three-months">
              <p className={styles.lead}>
                The price drops after the first three months, so you are never
                paying course prices out of habit: £{ongoing}{" "}a month pays for
                continued access to the lessons as we update them. We rewrite
                lessons when the tools, or the best way to use them, change.
              </p>
              {/* `{" "}` after an expression is deliberate throughout: the
                  compiler drops a plain space there when the same text
                  carries an entity such as &apos; later on. */}
              <div className={styles.afterList}>
                <div>
                  <h3>If you pay monthly</h3>
                  <p>
                    With monthly payments, you unlock one month at a time and
                    can cancel whenever you like. After your third course
                    payment, the plan carries on at{" "}£{ongoing}{" "}a month
                    unless you cancel. If it stops being worth it to you,
                    cancel.
                  </p>
                </div>
                <div>
                  <h3>If you paid once for a pass</h3>
                  <p>
                    Your access to the course lessons stops. You only pay
                    again if you choose to subscribe at £{ongoing}{" "}a month.
                    You keep your account, your progress and the free labs,
                    and we&apos;ll email you about continuing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. A gift. The button only shows while gifts are on sale. */}
      <section className={p.section} data-section="gift" id="gift">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>Give the course as a gift</h2>
          </div>
          <div className={`${styles.split} ${styles.splitFlip}`}>
            <div data-tier="gift">
              <p className={styles.lead}>
                Give the whole course for the same price as a pass for
                yourself, or just the first month for {firstMonth}.
                {christmas
                  ? ` Gifts stay on sale after the ${coursePass} price ends.`
                  : ""}
              </p>
              <ul className={styles.ticks}>
                <li>
                  <Tick />
                  <span>
                    The recipient has one year from purchase to enter their
                    code.
                  </span>
                </li>
                <li>
                  <Tick />
                  <span>
                    Their course starts when they do, and we never ask for
                    their card details.
                  </span>
                </li>
                <li>
                  <Tick />
                  <span>A gift is paid once and never renews.</span>
                </li>
                <li>
                  <Tick />
                  <span>
                    We refund a gift in full until it&apos;s opened, but not
                    after, unless the law requires.
                  </span>
                </li>
              </ul>
              {selling ? (
                <div className={p.actions}>
                  <Link href="/gift" className={p.buttonSolid}>
                    {OFFER.gift}
                  </Link>
                </div>
              ) : !salesOpen ? (
                <p className={styles.opens}>
                  Gifts go on sale on {salesOpenOn}.
                </p>
              ) : null}
              <p className={styles.aside}>
                Have a gift code? <Link href="/gift/open">Open your gift</Link>
                .
              </p>
            </div>
            <figure className={`${p.plate} ${styles.splitPicture}`}>
              <PricingPlate
                name="gift"
                alt="A paper cutout scene: an older man hands a young woman a card envelope tied with a green ribbon across a kitchen table, and both are smiling."
                sizes="(max-width: 1023px) 100vw, 520px"
              />
            </figure>
          </div>
        </div>
      </section>

      {/* 8. Teams and organisations. David, 2026-10-21, option B: the manager
          dashboard is promised only once ENABLE_TEAM_DASHBOARD is on. */}
      <section className={p.section} data-section="teams" id="teams">
        <div className={p.page}>
          <div className={p.sectionHead}>
            {ENABLE_TEAM_DASHBOARD ? (
              <h2 className={p.sectionTitle}>
                {/* David's own heading (2026-10-21, option B); the words
                    check may not replace it. */}
                Same learner experience.{" "}
                <em>More visibility for managers.</em>
              </h2>
            ) : (
              <h2 className={p.sectionTitle}>
                Buying for a team or organisation
              </h2>
            )}
          </div>
          <div className={styles.split}>
            <figure className={`${p.plate} ${styles.splitPicture}`}>
              <PricingPlate
                name="team"
                alt="A paper cutout scene: four colleagues sit along one table, each working at their own laptop with the same card ticket beside it. The label reads Same price per person."
                sizes="(max-width: 1023px) 100vw, 520px"
              />
            </figure>
            <div>
              {ENABLE_TEAM_DASHBOARD ? (
                <p className={styles.lead} data-testid="teams-split-body">
                  Any team can ask us for a manager dashboard. It shows who
                  has finished each lesson, their quiz marks and the mark for
                  the project they build each month. For 100 or more people,
                  GWTH can create lessons around your own workflows and tools.
                  Institutions get a proposal based on their needs.
                </p>
              ) : (
                <p className={styles.lead} data-testid="teams-split-body">
                  Teams pay the same per-person price, with no minimum size.
                  Each learner has an account and tracks their own progress.
                  Each person can sign up and pay monthly, or you can buy a
                  pass for each person, one at a time. For 100 or more people,
                  GWTH can create an edition with a tutor dashboard and
                  lessons written around your work. Institutions get a
                  proposal based on their needs.
                </p>
              )}
              <div className={p.actions}>
                <Link href="/for-organisations" className={p.buttonSolid}>
                  GWTH for organisations
                </Link>
                <Link href="/contact" className={p.buttonOutline}>
                  Contact us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Plain questions and answers. Every answer is a rule from the
          Terms or a sentence carried over from the page this replaces. */}
      <section className={p.section} data-section="questions" id="questions">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>Questions and answers</h2>
          </div>
          <div className={`${p.faqList} ${styles.faq}`}>
            <details className={p.faqItem}>
              <summary>Can I get a refund?</summary>
              <p>
                We refund a pass in full until it&apos;s opened, but not
                after, unless the law requires. A pass you buy for yourself
                while signed in opens when you pay. A gift opens when the
                recipient enters their code. To ask for a refund,{" "}
                <Link href="/contact">contact us</Link>. For monthly payments,
                see the{" "}
                <Link href="/terms#subscriptions">
                  Terms for monthly payments
                </Link>
                , including refunds.
              </p>
            </details>
            <details className={p.faqItem}>
              <summary>How do I cancel?</summary>
              <p>
                On a monthly plan, cancel at any time in your account
                settings. You keep access until the end of the month
                you&apos;ve paid for, subject to the Terms on{" "}
                <Link href="/terms#course-protection">course protection</Link>{" "}
                and <Link href="/terms#termination">termination</Link>. There
                is no minimum commitment period, cancellation fee or penalty
                for leaving. A pass ends by itself, so there is nothing to
                cancel.
              </p>
            </details>
            <details className={p.faqItem}>
              <summary>What if I need longer than a month?</summary>
              <p>
                There is no time limit on reaching {SHARE}. While you wait,
                you keep using the month you&apos;re on. With a pass, your
                course time is paused. On a monthly plan, your next payment
                waits until that month can open, and your plan is not
                cancelled.
              </p>
            </details>
            <details className={p.faqItem}>
              <summary>Is VAT added to the price?</summary>
              <p>
                No. GWTH is not registered for VAT, so no VAT is added to any
                price. All prices are in pounds.
              </p>
            </details>
            <details className={p.faqItem}>
              <summary>Will the monthly price change?</summary>
              <p>
                We will give you at least 30 days&apos; notice of any price
                change. If you already pay monthly, you keep your current rate
                for the rest of your course period.
              </p>
            </details>
            <details className={p.faqItem}>
              <summary>What else will I need?</summary>
              <p>
                A computer, an internet connection and the ability to type.
                Lessons use AI tools made by other companies, such as Claude
                and ChatGPT. Those companies set their own prices, terms and
                age limits, and GWTH doesn&apos;t sell their tools.
              </p>
            </details>
            {/* Bible audience-by-purpose (David, 2026-10-20). One of the four
                places the age is stated (with Terms, Privacy and the sign-up
                form); change all four together. Tool age limits are stated,
                and no alternative tool is promised. */}
            <details className={p.faqItem} id="who-can-take-gwth">
              <summary>Who can take GWTH?</summary>
              <p data-testid="who-can-take">
                Anyone aged 16 or over. The course focuses on using AI at
                work. If you&apos;re 16 or 17, a parent or guardian must hold
                your GWTH account and agree to the Terms. Your employer can do
                this if you&apos;re an apprentice or employee. Some tools used
                in lessons have their own age limits: Claude requires users to
                be 18 or over, and ChatGPT requires permission from a parent
                or legal guardian if you&apos;re under 18. An alternative tool
                may not be available for every lesson.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* 10. What is free. The free lesson is a real lesson, so it can stand
          for the course; the labs compare tools and are described as that
          (a-20260914-203753-b9d050). */}
      <section className={p.closing} data-section="closing">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>
              Try a lesson or <em>compare AI tools</em>
            </h2>
          </div>
          <div className={p.cards2}>
            <article className={`${p.card} ${styles.freeCard}`} data-tier="lesson">
              <h3 className={p.cardTitle}>The free lesson</h3>
              {/* The home page's own words (`FILM_COPY.body` in home-film, a
                  client module, so the sentence is repeated here, not
                  imported). */}
              <p className={p.cardBody}>
                You&apos;ll watch a short film, read the lesson, do the
                project, then answer the end-of-lesson questions. Enter your
                email address and we&apos;ll send you the link.
              </p>
              <div className={styles.freeAction}>
                <Link href="/start-here" className={p.buttonOutline}>
                  Try the free lesson
                </Link>
              </div>
            </article>
            <article className={`${p.card} ${styles.freeCard}`} data-tier="free">
              <h3 className={p.cardTitle}>The six free labs</h3>
              <p className={p.cardBody}>
                All six labs are free forever, with no card required. They
                test new AI models on the same real work tasks and show which
                one to use. We re-test when new models come out.
              </p>
              {labsOpen && (
                <div className={styles.freeAction}>
                  <Link href={free.cta.href} className={p.buttonOutline}>
                    {free.cta.label}
                  </Link>
                </div>
              )}
            </article>
          </div>
          <div className={`${p.actions} ${styles.closingActions}`}>
            {selling ? (
              <a href="#how-to-pay" className={p.buttonSolid}>
                Choose how to pay
              </a>
            ) : (
              <Link href="/waitlist" className={p.buttonSolid}>
                Join the waitlist
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
