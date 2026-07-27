import Link from "next/link"
import { PRICING } from "@/components/marketing/data"
import { COURSE_MONTHLY_PRICE, ONGOING_MONTHLY_PRICE } from "@/lib/config"
import styles from "./pricing-fde.module.css"
import { canPromoteLabs } from "@/lib/labs-cta"

/** Extra capabilities included for teams of 5 or more. */
const TEAM_FEATURES = [
  "Admin dashboard for managers",
  "Progress and completion reporting",
  "Role-specific lesson recommendations",
  "Bespoke workflow lessons for larger teams",
]

/** Feature comparison rows: [feature, Free, Member, Team]. */
// Every "Free" cell here has to survive a signed-out visitor actually trying
// it. There is no lesson preview and no progress tracking without an account,
// so both used to promise something the product does not do.
const COMPARISONS = [
  ["Free labs", "Included", "Included", "Included"],
  ["Full core course", "No", "Included", "Included"],
  ["A practical project in every lesson", "No", "Included", "Included"],
  ["Plain progress tracking", "No", "Included", "Team visibility"],
  [
    "Stay Current refreshes",
    "No",
    `£${ONGOING_MONTHLY_PRICE.toFixed(2)}/mo after the course`,
    "Team policy",
  ],
  ["Admin dashboard", "No", "No", "Included for 5+"],
]

/**
 * Pricing page in the FDE journal register, matching the chosen homepage
 * direction (home-fde/): drenched teal masthead, three tier cards with
 * colour-block tops (the Member tier featured with an ochre border), a
 * ruled comparison table, the teams split, and a closing band. Prices come
 * from the canonical PRICING data so copy cannot drift from config.
 */
export function PricingFde() {
  const free = PRICING[0]!
  const course = PRICING[1]!

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
      after: "to stay current once the three months are done",
      featured: true,
    },
    {
      key: "team",
      badge: "Teams",
      tag: "5+ people",
      flavour: styles.flvRust,
      price: "Same",
      per: "per-person price",
      features: TEAM_FEATURES,
      cta: { label: "Talk to us", href: "/contact" },
      after: "per person after the course",
      featured: false,
    },
  ]

  return (
    <div className={styles.shell}>
      <section className={styles.masthead} data-section="masthead">
        <div className={styles.page}>
          <p className={styles.mastheadKicker}>
            Pricing in GBP · No yearly lock-in · £{COURSE_MONTHLY_PRICE} while
            you learn, £{ONGOING_MONTHLY_PRICE.toFixed(2)} to stay current
          </p>
          <h1 className={styles.mastheadTitle}>
            Three ways to learn. <em>Start free.</em>
          </h1>
          <p className={styles.priceLine} data-testid="masthead-price-line">
            £{COURSE_MONTHLY_PRICE} a month while you learn.{" "}
            <em>Then £{ONGOING_MONTHLY_PRICE.toFixed(2)} a month.</em>
          </p>
          <p className={styles.standfirst}>
            Less than the cost of one hour with an AI consultant. Join the
            course when you are ready, and bring teams in without hidden
            enterprise games. When the teaching is done the price drops to £
            {ONGOING_MONTHLY_PRICE.toFixed(2)} a month, because you should not
            keep paying course prices for a course you have finished.
          </p>
          <div className={styles.mastheadFoot}>
            <p>Unlock one month at a time</p>
            <p>£{ONGOING_MONTHLY_PRICE.toFixed(2)}/mo after the course</p>
            <p>Cancel anytime</p>
          </div>
        </div>
      </section>

      <section className={styles.section} data-section="tiers">
        <div className={styles.page}>
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
                      then <strong>£{ONGOING_MONTHLY_PRICE.toFixed(2)}/mo</strong>{" "}
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
            after the course at {PRICING[2]!.price}/mo
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
            <p className={styles.mono}>Compare</p>
          </div>
          <p className={styles.sectionLead}>
            The point is simple: free is enough to try, member is the real
            course, team adds management visibility.
          </p>
          <div className={styles.tableWrap}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Free</th>
                  <th>Member</th>
                  <th>Team</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISONS.map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, index) => (
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
            <p className={styles.mono}>For teams</p>
            <h2>
              Same learner experience. <em>More visibility for managers.</em>
            </h2>
          </div>
          <div className={styles.splitNote}>
            <p>
              Teams of 5+ get an admin dashboard with progress tracking,
              completion rates, and the ability to recommend optional lessons
              by role. For teams of 100+, GWTH can create bespoke lessons
              around your company&apos;s workflows and tools.
            </p>
            <div className={styles.buttonRow}>
              <Link href="/for-teams" className={styles.buttonSolid}>
                Learn about teams
              </Link>
              <Link href="/contact" className={styles.buttonOutline}>
                Contact GWTH
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.closing} data-section="closing">
        <div className={styles.page}>
          <h2>
            Try before <em>you join.</em>
          </h2>
          <p>
            You unlock one month at a time, so the course has to earn your
            attention first. No card up front, no timer, no pretend scarcity.
            After the three months it is £{ONGOING_MONTHLY_PRICE.toFixed(2)} a
            month to stay current, and you can stop that too.
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
