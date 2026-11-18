import Link from "next/link"
import { LATER_MONTHS_OPEN, PRICING } from "@/components/marketing/data"
import { COURSE_MONTHLY_PRICE, ONGOING_MONTHLY_PRICE } from "@/lib/config"
import styles from "./pricing-fde.module.css"
import { canPromoteLabs } from "@/lib/labs-cta"
import { ENABLE_BILLING, ENABLE_TEAM_DASHBOARD } from "@/lib/config"
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

/**
 * The completion share the course gate uses (bead gwth-launch-735c, David,
 * 12 Nov 2026: "set it to 75% lessons complete for now"). Read from the gate's
 * own default so the page and the gate cannot disagree; changing the share
 * means changing the Terms first (docs/content-protection-go-live.md).
 */
const SHARE = `${DEFAULT_GATE_PERCENT}%`

/** Where the opening rules sit on this page; the notes beside each button link here. */
const RULES_ANCHOR = "month-opening-rules"

/**
 * David's /pricing annotations, 14 September 2026, applied here and in
 * `pricing-fde.module.css`. His words, and what each one changed:
 *
 * - **a-20260914-203458-8004f0**, on the comparison column headed "Team":
 *   "This should be for teams or institutions". The third tier, its column and
 *   the split section below now name both audiences.
 * - **a-20260914-203605-149911**, on the £7.50 line under the £29: "I'm not
 *   sure this extra big text looks good ... it looks slightly jarring going
 *   from a large bold £29 to normal text to larger text again to normal text
 *   again". The second price is no longer a second display size; it carries
 *   the jade accent and weight at body size, under the same accent bar.
 * - **a-20260914-203753-b9d050**, on the closing block: "Labs are quite
 *   different to lessons ... I'm not sure whether we can still say this: try
 *   before you join. I think what we can say is that you can stop at any time
 *   and that we have extremely fair pricing". "Try before you join" is gone;
 *   the block is now cancellation plus the lower continuing price.
 * - **a-20260914-203852-55e4f6**, on the table headings: "I don't really like
 *   the heading text being smaller than the text in the table."
 * - **a-20260914-203941-b69458**, on the masthead: "It should say the whole
 *   three months are less than the cost of one hour with a consultant."
 *   SUPERSEDED on 2026-10-20 by the launch readiness check (David: "Use your
 *   recommendations for all 30 pages"): both reviewers read the consultant
 *   hour as an unsupported comparison, so the masthead now states what you pay.
 * - **a-20260914-204053-7fd060**, same paragraph: "I'm not sure we should say
 *   the course has finished because it never really finishes because it's
 *   always up to date". Nothing on this page says the course is finished or
 *   done; the wording is "after the first three months" throughout.
 *
 * CANONICAL PRICES. Every number on the page is derived from `lib/config.ts`
 * (COURSE_MONTHLY_PRICE a month for TOTAL_COURSE_MONTHS months,
 * TOTAL_COURSE_COST in total, then ONGOING_MONTHLY_PRICE a month); none is
 * typed into the copy, so the £87 comparison cannot drift from the £29.
 *
 * LAUNCH READINESS, 2026-10-20 (bead gwth-launch-ajqs.2). Both reviewers'
 * findings, applied here: a short note on what happens after paying, how to
 * cancel and the refund rule, with a link to the Terms, beside every paying
 * button; Months 2 and 3 open around 1 January and 1 February 2027 and time
 * is paused if a month is late; the core count from config and no optional
 * count; the projects named as the home page names them; plain words instead
 * of "pricing theatre", "unusually fair" and the consultant-hour comparison;
 * the £7.50 plan explained once, without the "optional lessons you skipped"
 * and "five hours of new material" claims nothing supports; the comparison
 * stacked one plan at a time on a phone; no tinted card tops or table header;
 * and nothing links to /for-teams, which is hidden at launch. The £69 offer
 * is now on the page before 1 December too, in words that are true on both
 * sides of that date; only its buttons wait for sales to open.
 *
 * ONE RECORDED DISCREPANCY. `SHOW_TOTAL_COURSE_COST` in that file is `false`
 * and its comment says marketing pages should not prominently show the
 * three-month total, which a-20260914-203941-b69458 directly overrides for
 * this masthead. The flag is read by nothing in `src/`, so it is left alone
 * rather than flipped from a page: it needs David's call, not an agent's. The
 * total still stays out of the per-tier price line, which is what the existing
 * regression test was protecting.
 */


/**
 * What happens after paying, how to cancel and how to get a refund, in one
 * short line beside each paying button (launch readiness checklist, check 5).
 * The rules are the Terms' own (sections 6 and 7), summarised, never
 * redrafted, and each line links to the section that applies.
 */
function TermsNote({
  kind,
  testId,
}: {
  kind: "pass" | "monthly"
  testId: string
}) {
  // The 75% rule beside each button (bead gwth-launch-735c): written by the
  // latest Astra, polished and checked by the latest Sol, 12 Nov 2026. The
  // full rule is in the "When each course month opens" section above.
  const rules = (
    <Link href={`#${RULES_ANCHOR}`} className={styles.inlineLink}>
      opening rules above
    </Link>
  )
  return kind === "pass" ? (
    <p className={styles.termsNote} data-testid={testId}>
      You pay once and it never renews. If you buy it for yourself, sign in
      first: Month 1 opens as soon as you&apos;ve paid. Months 2 and 3 each
      require {SHARE}{" "}of the previous month&apos;s core lessons to be
      finished, under the {rules}; your pass time is paused while you wait.
      With a gift, the person you give it to has one year from the date you
      buy it to enter the gift code. Their course starts when they do, and we
      never ask for their card details. We refund a pass in full until
      it&apos;s opened, but not after, unless the law requires; to ask for
      one,{" "}
      <Link href="/contact" className={styles.inlineLink}>
        contact us
      </Link>
      . See the{" "}
      <Link href="/terms#passes" className={styles.inlineLink}>
        Terms for passes
      </Link>
      .
    </p>
  ) : (
    <p className={styles.termsNote} data-testid={testId}>
      Your first three monthly payments each open one month of the course.
      Months 2 and 3 each require {SHARE}{" "}of the previous month&apos;s core
      lessons to be finished, under the {rules}; your next payment waits
      until that month can open. After your third course payment, the plan
      carries on at £{ONGOING_MONTHLY_PRICE.toFixed(2)}{" "}a month for continued
      access to the updated lessons, unless you cancel. We email you before
      each payment. Cancel at any time in your account settings and you keep
      access until the end of the month you&apos;ve paid for, subject to the
      Terms on{" "}
      <Link href="/terms#course-protection" className={styles.inlineLink}>
        course protection
      </Link>{" "}
      and{" "}
      <Link href="/terms#termination" className={styles.inlineLink}>
        termination
      </Link>
      . See the{" "}
      <Link href="/terms#subscriptions" className={styles.inlineLink}>
        Terms for monthly payments
      </Link>
      , including refunds.
    </p>
  )
}

/**
 * When each course month opens (bead gwth-launch-735c). Consumer law needs
 * the 75% rule, the review hold and the personal media links in front of a
 * buyer BEFORE they pay, so this sits above both buying options, in full,
 * with no disclosure to open. Every statement matches the code:
 * src/lib/protection/month-hold.ts (the latest of the three points),
 * src/lib/billing/passes.ts and subscriptions.ts (time paused, payment
 * waits), src/lib/media/signed.ts (links valid a few hours) and
 * src/lib/protection/monitor.ts (the check). Written by the latest Astra,
 * polished and checked by the latest Sol, 12 Nov 2026.
 */
function MonthOpeningRules() {
  return (
    <section
      className={styles.section}
      data-section="month-rules"
      data-testid="month-opening-rules"
      id={RULES_ANCHOR}
    >
      <div className={`${styles.page} ${styles.splitGrid}`}>
        <div>
          <h2>When each course month opens</h2>
        </div>
        <div className={`${styles.splitNote} ${styles.monthRules}`}>
          <p>
            Month 1 starts when you pay or open your pass. Before Month 2
            opens, you must finish {SHARE}{" "}of Month 1&apos;s core lessons.
            Before Month 3 opens, you must finish {SHARE}{" "}of Month 2&apos;s
            core lessons. Use Finish lesson at the end of each lesson to record
            that you&apos;ve finished it. Optional lessons do not count and are
            never required. There is no time limit on reaching {SHARE}.
          </p>
          <p>Each later month opens at the latest of three points:</p>
          <ul>
            <li>Its opening date for everyone, shown below.</li>
            <li>
              Your own start date for that month: one month after your
              previous month began with a pass, or your next monthly payment
              date if you pay monthly.
            </li>
            <li>When you&apos;ve reached the required {SHARE}.</li>
          </ul>
          <p>
            While you wait, you keep using the month you&apos;re on. With a
            pass, including a gift or prepaid team place, your course time is
            paused, so you still get a full month of each part. On a monthly
            plan, your next payment waits until that month can open; your plan
            is not cancelled.
          </p>
          <p>
            The completion rule helps stop someone copying the whole course in
            a few days from one account. Each month also builds on the one
            before.
          </p>
          <p data-testid="media-links-note">
            Videos, audio and pictures use links made for your account that
            stop working after a few hours; they still play and display
            normally inside GWTH.
          </p>
          <p>
            We also check lesson-opening activity for bulk copying and account
            sharing. If an automatic check flags your account, your next month
            is held for a person at GWTH to review, usually within a day. The
            same arrangements for access, pass time and payments apply while it
            is held. See{" "}
            <Link href="/terms#course-months" className={styles.inlineLink}>
              how months open
            </Link>{" "}
            and{" "}
            <Link href="/terms#course-protection" className={styles.inlineLink}>
              how we protect the course
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  )
}

/**
 * Pricing page, in the PAPER-FIRST register: a two-column quiet masthead, the
 * pay-once offer, three rounded tier cards (no coloured or tinted card tops),
 * a comparison table that stacks one plan at a time on a phone, the teams and
 * institutions split and a closing band. Prices come from the canonical
 * PRICING data so copy cannot drift from config.
 */
export function PricingFde({ now = new Date() }: { now?: Date } = {}) {
  const free = PRICING[0]!
  const course = PRICING[1]!
  const ongoing = ONGOING_MONTHLY_PRICE.toFixed(2)

  // Christmas gift sale (beads gwth-launch-v1uj.5 and .9). The band offering
  // to pay once for all three months (£69 from 1 December to 6 January, then
  // £87) or to give the course as a gift is on the page from the GO LIVE
  // release (launch readiness, 2026-10-20). Before sales open its button is
  // the waitlist; from 1 December the Member button takes the monthly payment
  // and the band sells the pass. The checkout routes enforce the same dates.
  const window = getSaleWindow()
  const selling = ENABLE_BILLING && isSalesOpen(now, window)
  // The £69 words are shown from the GO LIVE release, before sales open, and
  // stay until the sale window closes; only the buttons wait for 1 December.
  const christmas = isChristmasSale(now, window) || !isSalesOpen(now, window)
  const salesOpenOn = formatUkDate(window.announcedOpenAt)
  // Before sales open the band already names the £69 sale price it will sell
  // at; passPrice() alone would give the full price until 1 December.
  const coursePass = formatPence(
    christmas
      ? PASS_PRICES_PENCE.courseSale
      : passPrice("course", now, window).pence
  )
  const saleEndsOn = formatUkDate(new Date(window.saleEndsAt.getTime() - 1))
  const monthlyCta = (
    <BuyButton
      endpoint="/api/stripe/checkout"
      body={{ plan: "course" }}
      label={OFFER.monthly(`£${COURSE_MONTHLY_PRICE}`)}
      returnTo="/pricing"
      className={styles.buttonSolid}
      errorClassName={styles.buyError}
    />
  )

  // Persona review round 2 (D16 and D25, 7 Nov 2026): every persona wanted
  // the two ways to pay side by side, with each condition said once. Words
  // by the latest Astra, refined and checked by the latest Sol (12 Nov 2026,
  // completion/public-pages-persona-apply/copy/).
  const courseFull = formatPence(PASS_PRICES_PENCE.courseFull)
  const payRows: { row: string; monthly: string; pass: string }[] = [
    {
      row: "What you pay",
      monthly: `£${COURSE_MONTHLY_PRICE} a month for the first three months. All three cost £${
        COURSE_MONTHLY_PRICE * 3
      }. Each payment opens one month.`,
      pass: christmas
        ? `${coursePass} once if you buy from ${salesOpenOn} to ${saleEndsOn}; ${courseFull} after that.`
        : `${coursePass} once.`,
    },
    {
      row: "At the end of month three",
      monthly: "Your plan continues automatically unless you cancel.",
      pass: "Your lesson access ends unless you choose to continue.",
    },
    {
      row: "How to cancel",
      monthly:
        "Cancel at any time in your account settings. Keep access until the end of the month you've paid for.",
      pass: "The pass ends by itself; you don't need to cancel.",
    },
    {
      row: "Does it renew?",
      monthly: "Yes. We email you before each payment.",
      pass: "No.",
    },
  ]
  const payPlans = [
    { key: "monthly", name: "Pay monthly" },
    { key: "pass", name: "Pay once for three months" },
  ] as const
  // "No adverts or hidden charges" is left off here (latest Sol, 12 Nov
  // 2026): the page does not yet say what AI tools cost, so "hidden charges"
  // promises a complete cost it cannot show. The footer keeps "no adverts".
  // The month opening dates are said once, under the comparison (D25).
  const courseFeatures = course.features.filter(
    (feature) => !/hidden charges|^Month 1 opens/i.test(feature)
  )

  return (
    <div className={styles.shell}>
      <section className={styles.masthead} data-section="masthead">
        <div className={styles.page}>
          <h1 className={styles.mastheadTitle}>Choose how to join GWTH</h1>
          <p className={styles.priceLine} data-testid="masthead-price-line">
            £{COURSE_MONTHLY_PRICE} a month for the first three months, then{" "}
            <em>£{ongoing} a month</em> if you stay.
          </p>
          {/* Jump links (D25): a short decision path down a long page. */}
          <nav className={styles.mastheadFoot} aria-label="On this page" data-testid="pricing-jump">
            <p><a href="#how-to-pay" className={styles.inlineLink}>Compare payments</a></p>
            {canPromoteLabs() && (
              <p><a href="#what-you-get" className={styles.inlineLink}>Try the free labs</a></p>
            )}
            <p><a href="#teams" className={styles.inlineLink}>Teams and institutions</a></p>
            <p data-testid="pricing-uk-note">Prices in pounds for the UK, with no VAT added</p>
          </nav>
        </div>
      </section>

      <MonthOpeningRules />

      <section
        className={`${styles.section} ${styles.sectionAlt}`}
        data-section="offer"
        data-testid="pricing-offer"
        id="how-to-pay"
      >
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Choose how to pay</h2>
          </div>
          <p className={styles.sectionLead}>
            Pay a month at a time, or pay once for the whole course: a
            three-month pass for yourself.
          </p>
          <div
            className={styles.tableWrap}
            tabIndex={0}
            role="region"
            aria-label="Two ways to pay"
          >
            <table className={styles.compareTable} data-testid="pay-compare">
              <thead>
                <tr>
                  <th scope="col">
                    <span className={styles.srOnly}>Question</span>
                  </th>
                  {payPlans.map((plan) => (
                    <th scope="col" key={plan.key}>{plan.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payRows.map((row) => (
                  <tr key={row.row}>
                    <th scope="row">{row.row}</th>
                    <td>{row.monthly}</td>
                    <td>{row.pass}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.compareStack} data-testid="compare-stack">
            {payPlans.map((plan) => (
              <div
                key={plan.key}
                className={styles.compareStackPlan}
                data-testid="compare-stack-plan"
              >
                <h3>{plan.name}</h3>
                <dl>
                  {payRows.map((row) => (
                    <div key={row.row} className={styles.compareStackEntry}>
                      <dt>{row.row}</dt>
                      <dd>{row[plan.key]}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
          <div className={styles.buttonRow}>
            {selling ? (
              <>
                {monthlyCta}
                <BuyButton
                  endpoint="/api/passes/checkout"
                  body={{ gift: false, product: "course" }}
                  label={OFFER.buySelf(coursePass)}
                  returnTo="/pricing"
                  className={styles.buttonOutline}
                  errorClassName={styles.buyError}
                />
              </>
            ) : (
              <Link href="/waitlist" className={styles.buttonSolid}>
                Join the waitlist
              </Link>
            )}
          </div>
          {/* The 75% rule beside the paying buttons (bead gwth-launch-735c,
              wording option A, David 12 Nov). Both buttons share one row in
              the persona layout, so the two button notes from master are said
              once here, in master's own words. */}
          <p className={styles.termsNote} data-testid="pricing-offer-rule">
            Months 2 and 3 each require {SHARE}{" "}of the previous month&apos;s
            core lessons to be finished, under the{" "}
            <Link href={`#${RULES_ANCHOR}`} className={styles.inlineLink}>
              opening rules above
            </Link>
            . With a pass, your pass time is paused while you wait. On a monthly
            plan, your next payment waits until that month can open.
          </p>
          <p className={styles.termsNote} data-testid="pricing-offer-months">
            {/* The 75% rule (bead gwth-launch-735c, master f81f8e2): the dates
                here, the full rule in the section above the comparison. */}
            Month 1 is available from {salesOpenOn}, Month 2 around{" "}
            {LATER_MONTHS_OPEN.month2} and Month 3 around{" "}
            {LATER_MONTHS_OPEN.month3}. Both ways to pay follow the{" "}
            <Link href={`#${RULES_ANCHOR}`} className={styles.inlineLink}>
              opening rules above
            </Link>
            .
          </p>
          <p className={styles.termsNote} data-testid="pricing-continuation">
            After the first three months, continued access to updated lessons
            costs £{ongoing} a month.
          </p>
          <p className={styles.termsNote} data-testid="pricing-offer-terms">
            For a pass for yourself, sign in before paying. We refund a pass in
            full until it&apos;s opened, but not after, unless the law
            requires. To ask for a refund,{" "}
            <Link href="/contact" className={styles.inlineLink}>
              contact us
            </Link>
            . See the{" "}
            <Link href="/terms#passes" className={styles.inlineLink}>
              Terms for passes
            </Link>{" "}
            and the{" "}
            <Link href="/terms#subscriptions" className={styles.inlineLink}>
              Terms for monthly payments
            </Link>
            , including refunds.
          </p>
        </div>
      </section>

      <section className={styles.section} data-section="tiers" id="what-you-get">
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>What you get</h2>
          </div>
          <div className={styles.tiersRow}>
            <article className={`${styles.tierCard} ${styles.tierFeatured}`} data-testid="pricing-tier" data-tier="course">
              <div className={styles.cardTop}>
                <h3>The course</h3>
              </div>
              <div className={styles.tierBody}>
                <ul className={styles.tierFeatures}>
                  {courseFeatures.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            </article>
            <article className={styles.tierCard} data-testid="pricing-tier" data-tier="free">
              <div className={styles.cardTop}>
                <h3>Free labs</h3>
              </div>
              <div className={styles.tierBody}>
                <p className={styles.tierText}>
                  All six labs are free forever, with no card required. They
                  test new AI models on the same real work tasks and show which
                  one to use. We re-test when new models come out. Lessons and
                  their projects come with the course.
                </p>
                <div className={styles.tierCta}>
                  <Link
                    href={canPromoteLabs() ? free.cta.href : "/waitlist"}
                    className={styles.buttonOutline}
                  >
                    {canPromoteLabs() ? free.cta.label : "Join the waitlist"}
                  </Link>
                </div>
              </div>
            </article>
            <article className={styles.tierCard} data-testid="pricing-tier" data-tier="gift">
              <div className={styles.cardTop}>
                <h3>Give the course as a gift</h3>
              </div>
              <div className={styles.tierBody}>
                <p className={styles.tierText}>
                  Give a three-month pass, or just the first month for{" "}
                  {formatPence(PASS_PRICES_PENCE.month1)}.
                  {christmas ? " Gifts stay on sale after the offer ends." : ""}{" "}
                  The recipient has one year from purchase to enter their code.
                  Their course starts when they do, and we never ask for their
                  card details.
                </p>
                {selling && (
                  <div className={styles.tierCta}>
                    <Link href="/gift" className={styles.buttonOutline}>
                      {OFFER.gift}
                    </Link>
                  </div>
                )}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.section} data-section="teams" id="teams">
        <div className={`${styles.page} ${styles.splitGrid}`}>
          {/* David, 2026-10-21, option B: the dashboard heading is his, and
              shows only once ENABLE_TEAM_DASHBOARD is on. */}
          <div>
            {ENABLE_TEAM_DASHBOARD ? (
              <h2>
                Same learner experience.{" "}
                <em>More visibility for managers.</em>
              </h2>
            ) : (
              <h2>Buying for a team or institution</h2>
            )}
          </div>
          <div className={styles.splitNote}>
            {ENABLE_TEAM_DASHBOARD ? (
              <p data-testid="teams-split-body">
                Any team can ask us for a manager dashboard. It shows who has
                finished each lesson, their quiz marks and the mark for the
                project they build each month. For 100 or more people, GWTH can
                create lessons around your own workflows and tools.
                Institutions get a proposal based on their needs.
              </p>
            ) : (
              <>
                <p data-testid="teams-split-body">
                  Teams pay the same per-person price, with no minimum size.
                  Each learner has an account and tracks their own progress. Pay
                  monthly for each person or buy places one at a time. For 100
                  or more people, GWTH can create an edition with a tutor
                  dashboard and lessons written around your work. Institutions
                  get a proposal based on their needs.
                </p>
              </>
            )}
            <div className={styles.buttonRow}>
              <Link href="/for-teams" className={styles.buttonSolid}>
                GWTH for teams
              </Link>
              <Link href="/for-institutions" className={styles.buttonOutline}>
                Learn about institutions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bible audience-by-purpose (David, 2026-10-20). One of the four places
          the age is stated (with Terms, Privacy and the sign-up form); change
          all four together. Tool age limits are stated, and no alternative
          tool is promised. */}
      <section
        className={`${styles.section} ${styles.sectionAlt}`}
        data-section="who"
      >
        <div className={`${styles.page} ${styles.splitGrid}`}>
          <div>
            <h2 id="who-can-take-gwth">Who can take GWTH?</h2>
          </div>
          <p data-testid="who-can-take">
            Anyone aged 16 or over. The course focuses on using AI at work. If
            you&apos;re 16 or 17, a parent or guardian must hold your GWTH
            account and agree to the Terms. Your employer can do this if
            you&apos;re an apprentice or employee. Some tools used in lessons
            have their own age limits: Claude requires users to be 18 or over,
            and ChatGPT requires permission from a parent or legal guardian if
            you&apos;re under 18. An alternative tool may not be available for
            every lesson.
          </p>
        </div>
      </section>

      {/* a-20260914-203753-b9d050. This block used to be headed "Try before
          you join", which leaned on the free labs standing in for the course.
          They do not: the labs compare tools, the lessons teach. What is
          genuinely true is that you can stop at any point, and that the price
          falls once the first three months are behind you. */}
      <section className={styles.closing} data-section="closing">
        <div className={styles.page}>
          {/* Launch readiness, 2026-10-20: "Unusually fair pricing" and
              "the thing that keeps us honest" were read by both reviewers as
              self-praise, "no timer and no pretend scarcity" sat beside a
              dated offer, and "opens the optional lessons you skipped" and
              the five hours of new material a month are claims nothing
              supports. The block now states the terms plainly. */}
          <h2>
            One month at a time. <em>Stop whenever you like.</em>
          </h2>
          {/* Recovered 2026-09-14 (ledger C13 and C14). C13 is David's own
              sentence from his pre-N12 home copy (c6e610d): the page already
              stated the price drop as a fact and never said why it exists.
              His original opened "the price drops when the teaching is done",
              which this page may not say: annotation a-20260914-204053-7fd060
              settled that nothing here implies the course finishes, and
              pricing.test.tsx holds that phrase on the banned list. The clause
              worth recovering is the second one, and it reads the same after
              the opener is swapped for the wording the rest of the page uses.
              C14 is "that keeps us honest", which he kept through four
              separate marketing documents. Both are substitutions, not
              additions, and neither changes a term. The first draft of this
              block also kept "You can stop that too", which left three
              consecutive sentences telling the reader they may stop; the
              recovered sentence says it better, so the older one went.

              NOT recovered here, and it was the most tempting line in the
              archive: "There are no discount codes. That's deliberate."
              src/app/api/stripe/checkout/route.ts sets
              allow_promotion_codes: true, so the checkout accepts them. Either
              the flag changes or the line stays out, and that is David's call
              (ledger C26). The money-back guarantee he dictated in July is out
              for the same reason: /terms offers a refund only where GWTH
              cancels an order (ledger C25, bead filed). */}
          {/* Persona review PR05 dropped this paragraph; it is David's own
              recovered sentence (C13), so it stays, with the £7.50 described
              as continued access like the rest of the page. */}
          <p>
            With monthly payments, you unlock one month at a time and can
            cancel whenever you like. The price drops after the first three
            months, so you are never paying course prices out of habit:
            £{ongoing} a month pays for continued access to the lessons as we
            update them. We rewrite lessons when the tools, or the best way to
            use them, change. If it stops being worth it to you, cancel.
          </p>
          <div className={styles.closingActions}>
            {selling && monthlyCta}
            {canPromoteLabs() && (
              <Link
                href="/labs"
                className={selling ? styles.buttonOutline : styles.buttonSolid}
              >
                Try a free lab
              </Link>
            )}
            {!selling && (
              <Link
                href="/waitlist"
                className={
                  canPromoteLabs() ? styles.buttonOutline : styles.buttonSolid
                }
              >
                Join the waitlist
              </Link>
            )}
          </div>
          {selling && <TermsNote kind="monthly" testId="closing-terms" />}
        </div>
      </section>
    </div>
  )
}
