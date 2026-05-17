import Link from "next/link"
import { PRICING } from "@/components/marketing/data"
import styles from "./gwth-redesign.module.css"

const teamFeatures = [
  "Admin dashboard for managers",
  "Progress and completion reporting",
  "Role-specific lesson recommendations",
  "Bespoke workflow lessons for larger teams",
]

const comparisons = [
  ["Free labs", "Included", "Included", "Included"],
  ["Full core course", "Preview only", "Included", "Included"],
  ["Verifiable GWTH Score", "Starter score", "Full learner score", "Team reporting"],
  ["Stay Current refreshes", "No", "Available after course", "Team policy"],
  ["Admin dashboard", "No", "No", "Included for 5+"],
]

export function GwthRedesignPricingPage() {
  const tiers = [
    PRICING[0]!,
    PRICING[1]!,
    {
      id: "team",
      badge: "Teams",
      price: "Same",
      per: "per-person price",
      features: teamFeatures,
      cta: { label: "Talk to us", href: "/contact", style: "ghost" },
    },
  ]

  return (
    <div className={styles.shell}>
      <section className={styles.aboutHero}>
        <div className={styles.narrowPage}>
          <p className={styles.kicker}>
            <span className={styles.dot} aria-hidden="true" />
            Pricing in GBP
          </p>
          <h1 className={styles.pageTitle}>
            Three ways to learn.{" "}
            <span className={styles.italicAccent}>Start free.</span>
          </h1>
          <p className={styles.heroLead}>
            Less than the cost of one hour with an AI consultant. Try the free
            labs, join the course when you are ready, and bring teams in without
            hidden enterprise games.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.page}>
          <div className={styles.priceGrid}>
            {tiers.map((tier, index) => {
              const featured = index === 1
              return (
                <article
                  className={`${styles.priceCard} ${
                    featured ? styles.priceCardFeatured : ""
                  }`}
                  key={tier.badge}
                >
                  <p className={styles.monoLabel}>{tier.badge}</p>
                  <h3>{index === 1 ? "Member" : tier.badge}</h3>
                  <div className={styles.price}>{tier.price}</div>
                  <p className={styles.pricePer}>{tier.per}</p>
                  <ul>
                    {tier.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  <Link
                    href={tier.cta.href}
                    className={featured ? styles.buttonPrimary : styles.buttonSecondary}
                  >
                    {tier.cta.label}
                  </Link>
                </article>
              )
            })}
          </div>
          <p className={styles.fineprint}>
            No yearly lock-in. Cancel anytime. Stay Current remains available
            after the course for learners who want ongoing refreshes.
          </p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.page}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Compare</p>
            <h2 className={styles.sectionTitle}>
              The useful differences, without pricing theatre.
            </h2>
            <p className={styles.sectionLead}>
              The point is simple: free is enough to try, member is the real
              course, team adds management visibility.
            </p>
          </div>
          <div className={styles.compareTableWrap}>
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
                {comparisons.map((row) => (
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

      <section className={styles.section}>
        <div className={`${styles.page} ${styles.splitGrid}`}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>For teams</p>
            <h2 className={styles.sectionTitle}>
              Same learner experience. More visibility for managers.
            </h2>
          </div>
          <div className={styles.founderNote}>
            <p>
              Teams of 5+ get an admin dashboard with progress tracking,
              completion rates, and the ability to recommend optional lessons by
              role. For teams of 100+, GWTH can create bespoke lessons around
              your company&apos;s workflows and tools.
            </p>
            <div className={styles.buttonRow}>
              <Link href="/for-teams" className={styles.buttonPrimary}>
                Learn about teams
              </Link>
              <Link href="/contact" className={styles.buttonSecondary}>
                Contact GWTH
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.page}>
          <h2>Try before you join.</h2>
          <p>
            Free labs are there so the course has to earn your attention first.
            No card, no timer, no pretend scarcity.
          </p>
          <div className={styles.heroActions}>
            <Link href="/labs" className={styles.buttonPrimary}>
              Try a free lab
            </Link>
            <Link href="/signup" className={styles.buttonSecondary}>
              Join the waitlist
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
