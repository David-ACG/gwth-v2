import Link from "next/link"
import { PRICING } from "@/components/marketing/data"
import {
  COURSE_MONTHLY_PRICE,
  ONGOING_MONTHLY_PRICE,
  ONGOING_NEW_CONTENT_HOURS,
  TOTAL_COURSE_COST,
} from "@/lib/config"
import styles from "./pricing-fde.module.css"
import { canPromoteLabs } from "@/lib/labs-cta"

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
 * ONE RECORDED DISCREPANCY. `SHOW_TOTAL_COURSE_COST` in that file is `false`
 * and its comment says marketing pages should not prominently show the
 * three-month total, which a-20260914-203941-b69458 directly overrides for
 * this masthead. The flag is read by nothing in `src/`, so it is left alone
 * rather than flipped from a page: it needs David's call, not an agent's. The
 * total still stays out of the per-tier price line, which is what the existing
 * regression test was protecting.
 */

/** Extra capabilities included for teams and institutions of 5 or more. */
const TEAM_FEATURES = [
  "Admin dashboard for managers",
  "Progress and completion reporting",
  "Role-specific lesson recommendations",
  "Bespoke workflow lessons for larger groups",
]

/** The audience of the third tier, in one place: card, column and split. */
const GROUP_AUDIENCE = "Teams or institutions"

/** Feature comparison rows: [feature, Free, Member, Teams or institutions]. */
// Every "Free" cell here has to survive a signed-out visitor actually trying
// it. There is no lesson preview and no progress tracking without an account,
// so both used to promise something the product does not do.
const COMPARISONS = [
  ["Free labs", "Included", "Included", "Included"],
  ["Full core course", "No", "Included", "Included"],
  ["A practical project in every lesson", "No", "Included", "Included"],
  ["Plain progress tracking", "No", "Included", "Included, plus an admin view"],
  [
    "Stay Current refreshes",
    "No",
    `£${ONGOING_MONTHLY_PRICE.toFixed(2)}/mo after the first three months`,
    "Set by your organisation",
  ],
  ["Admin dashboard", "No", "No", "Included for 5 or more"],
]

/**
 * Pricing page, in the PAPER-FIRST register: a two-column quiet masthead, three
 * rounded tier cards with a quiet header strip (the colour-block tops and the
 * ochre feature border are retired), a comparison table, the teams and
 * institutions split and a closing band. Prices come from the canonical
 * PRICING data so copy cannot drift from config.
 */
export function PricingFde() {
  const free = PRICING[0]!
  const course = PRICING[1]!
  const ongoing = ONGOING_MONTHLY_PRICE.toFixed(2)

  const tiers = [
    {
      key: "free",
      badge: free.badge,
      tag: "Forever",
      flavour: styles.flvTeal,
      price: free.price,
      per: free.per,
      features: free.features,
      // The free tier IS the labs, so this card's CTA is the one place on the
      // page that must follow the gate rather than the shared PRICING data
      // (W25). While /labs is private the button would land on a login wall.
      cta: canPromoteLabs()
        ? { label: free.cta.label, href: free.cta.href }
        : { label: "Join the waitlist", href: "/waitlist" },
      featured: false,
    },
    {
      key: "course",
      badge: "Member",
      tag: course.flag ?? "The course",
      flavour: styles.flvMoss,
      price: course.price,
      per: course.per,
      features: course.features,
      // The shared PRICING data still points this CTA at /signup, but W25 shut
      // registration, so /signup renders "Registration closed" under a button
      // labelled "Join the Waitlist". Send it where the label says it goes.
      cta: { label: course.cta.label, href: "/waitlist" },
      after: "a month once the first three months are done",
      featured: true,
    },
    {
      key: "team",
      badge: GROUP_AUDIENCE,
      tag: "5 or more people",
      flavour: styles.flvRust,
      price: "Same",
      per: "per-person price",
      features: TEAM_FEATURES,
      cta: { label: "Talk to us", href: "/contact" },
      after: "a month for each person once the first three months are done",
      featured: false,
    },
  ]

  return (
    <div className={styles.shell}>
      <section className={styles.masthead} data-section="masthead">
        <div className={styles.page}>
          {/* The kicker used to carry both prices too. With priceLine saying
              it directly below in headline type, that was the same sentence
              twice in one block. */}
          <h1 className={styles.mastheadTitle}>
            Three ways to learn. <em>Start free.</em>
          </h1>
          <p className={styles.priceLine} data-testid="masthead-price-line">
            £{COURSE_MONTHLY_PRICE} a month for the first three months, then{" "}
            <em>£{ongoing} a month</em>.
          </p>
          {/* a-20260914-203941-b69458 and a-20260914-204053-7fd060. The
              comparison is now the WHOLE foundation against one consultant
              hour, and the £7.50 is deliberately outside that sentence so it
              cannot read as included in the £87. Nothing here says the course
              is finished: it is always being updated, which is what the £7.50
              buys. */}
          <p className={styles.standfirst}>
            All three months together come to £{TOTAL_COURSE_COST}, less than
            the cost of one hour with an AI consultant. Join when you are
            ready, and bring a team or an institution in at the same per-person
            price, with no hidden enterprise games. After the first three
            months the lower price keeps your lessons current as they change,
            and you can stop whenever you like.
          </p>
          <div className={styles.mastheadFoot}>
            <p>Prices in GBP</p>
            <p>Unlock one month at a time</p>
            <p>£{ongoing}/mo after the first three months</p>
            <p>Cancel anytime</p>
          </div>
        </div>
      </section>

      <section className={styles.section} data-section="tiers">
        <div className={styles.page}>
          {/* Named for assistive technology only: the visible hierarchy runs
              h1 to the card h3s, which left the tier grid unlabelled and the
              heading order broken. */}
          <h2 className={styles.srOnly}>The three plans</h2>
          <div className={styles.tiersRow}>
            {tiers.map((tier) => (
              <article
                key={tier.key}
                data-testid="pricing-tier"
                data-tier={tier.key}
                data-featured={tier.featured ? "true" : undefined}
                className={`${styles.tierCard} ${
                  tier.featured ? styles.tierFeatured : ""
                }`}
              >
                <div className={`${styles.cardTop} ${tier.flavour}`}>
                  <h3>{tier.badge}</h3>
                  <span>{tier.tag}</span>
                </div>
                <div className={styles.tierBody}>
                  <p className={styles.tierPrice}>
                    <strong>{tier.price}</strong>
                    <span>{tier.per}</span>
                  </p>
                  {tier.after && (
                    <p className={styles.tierAfter} data-testid="tier-after">
                      then{" "}
                      <strong
                        className={styles.tierAfterPrice}
                        data-testid="tier-after-price"
                      >
                        £{ongoing}
                      </strong>{" "}
                      {tier.after}
                    </p>
                  )}
                  <ul className={styles.tierFeatures}>
                    {tier.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  <div className={styles.tierCta}>
                    <Link
                      href={tier.cta.href}
                      className={
                        tier.featured
                          ? styles.buttonSolid
                          : styles.buttonOutline
                      }
                    >
                      {tier.cta.label}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <p className={styles.fineprint}>
            No yearly price · Cancel anytime · Stay Current remains available
            after the first three months at {PRICING[2]!.price}/mo
          </p>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionAlt}`}
        data-section="compare"
      >
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              The useful differences, <em>without pricing theatre.</em>
            </h2>
          </div>
          {/* a-20260914-203753-b9d050: the labs are not sample lessons, so the
              free tier is no longer described as a taste of the course. */}
          <p className={styles.sectionLead}>
            The point is simple: the free labs compare the newest AI tools on
            one real task, member is the course itself with its lessons and
            projects, and teams or institutions add management visibility.
          </p>
          {/* Focusable because it scrolls sideways on a phone: a scrollable
              region a keyboard cannot reach is a serious axe violation. */}
          <div
            className={styles.tableWrap}
            tabIndex={0}
            role="region"
            aria-label="Plan comparison"
          >
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  <th scope="col">Free</th>
                  <th scope="col">Member</th>
                  {/* a-20260914-203458-8004f0: the column used to read
                      "Team", which read as excluding institutions. */}
                  <th scope="col">{GROUP_AUDIENCE}</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISONS.map((row) => (
                  <tr key={row[0]}>
                    <th scope="row">{row[0]}</th>
                    {row.slice(1).map((cell, index) => (
                      <td key={`${row[0]}-${index}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className={styles.section} data-section="teams">
        <div className={`${styles.page} ${styles.splitGrid}`}>
          <div>
            <h2>
              Same learner experience. <em>More visibility for managers.</em>
            </h2>
          </div>
          <div className={styles.splitNote}>
            <p>
              {GROUP_AUDIENCE} of 5 or more get an admin dashboard with
              progress tracking, completion rates, and the ability to recommend
              optional lessons by role. For 100 or more people, GWTH can create
              bespoke lessons around your own workflows and tools.
            </p>
            <div className={styles.buttonRow}>
              <Link href="/for-teams" className={styles.buttonSolid}>
                Learn about teams
              </Link>
              <Link href="/for-institutions" className={styles.buttonOutline}>
                Learn about institutions
              </Link>
              <Link href="/contact" className={styles.buttonOutline}>
                Contact GWTH
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* a-20260914-203753-b9d050. This block used to be headed "Try before
          you join", which leaned on the free labs standing in for the course.
          They do not: the labs compare tools, the lessons teach. What is
          genuinely true is that you can stop at any point, and that the price
          falls once the first three months are behind you. */}
      <section className={styles.closing} data-section="closing">
        <div className={styles.page}>
          <h2>
            Unusually fair pricing. <em>Stop whenever you like.</em>
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
          <p>
            You unlock one month at a time, with no timer and no pretend
            scarcity, and you can cancel whenever you like. The price drops
            after the first three months, so you are never paying course prices
            out of habit: £{ongoing} a month keeps every lesson current as it
            changes, adds around {ONGOING_NEW_CONTENT_HOURS} hours of new
            material a month, and opens the optional lessons you skipped. If it
            stops being worth it, cancel. That is the arrangement, and it is
            the thing that keeps us honest.
          </p>
          <div className={styles.closingActions}>
            {canPromoteLabs() && (
              <Link href="/labs" className={styles.buttonSolid}>
                Try a free lab
              </Link>
            )}
            <Link
              href="/waitlist"
              className={
                canPromoteLabs() ? styles.buttonOutline : styles.buttonSolid
              }
            >
              Join the waitlist
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
