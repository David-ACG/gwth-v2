import Image from "next/image"
import Link from "next/link"
import {
  CURRICULUM,
  JOURNEYS,
  PRODUCT_PILLARS,
  PRICING,
  RESEARCH_SOURCES,
  UK_STATS,
} from "@/components/marketing/data"
import { GwthScoreCard } from "./score-card"
import styles from "./gwth-redesign.module.css"

const faqs = [
  {
    q: "Do I need to know how to code?",
    a:
      "No. GWTH starts in plain English. You learn how to use AI well first, then build your way into more capable workflows and AI-assisted coding when it becomes useful.",
  },
  {
    q: "What does the GWTH Score actually measure?",
    a:
      "It is an accumulating score based on lessons, projects, reflections, and refresh work. It is designed to show current applied AI capability, not a one-off certificate date.",
  },
  {
    q: "Is the credential verifiable?",
    a:
      "Yes. A GWTH credential has a public verification URL and score history, so an employer can check what you completed and whether your work is current.",
  },
  {
    q: "How much time does the course take?",
    a:
      "The main course is designed around roughly five hours a week for three months. Free labs let you try the format before joining.",
  },
]

export function GwthRedesignHomePage() {
  return (
    <div className={styles.shell}>
      <section className={styles.hero} data-section="hero">
        <div className={`${styles.page} ${styles.heroInner}`}>
          <div>
            <p className={styles.kicker}>
              <span className={styles.dot} aria-hidden="true" />
              UK-based applied AI training
            </p>
            <h1 className={styles.heroTitle}>
              Stop watching AI change the world.{" "}
              <em>Start building with it.</em>
            </h1>
            <p className={styles.heroLead}>
              Learn to build apps, automate workflows, research faster, create
              content, analyse data, and solve real problems using AI - all in
              plain English. Every lesson and project updates a dynamic,
              verifiable GWTH Score.
            </p>
            <div className={styles.heroActions}>
              <Link href="/signup" className={styles.buttonPrimary}>
                Get started
              </Link>
              <Link href="/labs" className={styles.buttonSecondary}>
                Try a free lab
              </Link>
            </div>
            <p className={styles.fineprint}>
              Independent. UK-based. No sponsors. No vendor partnerships.
            </p>
          </div>
          <GwthScoreCard
            score={104}
            trend="+49"
            cohortPercentile="Top 1%"
            learnerName="Alex Example"
          />
        </div>
      </section>

      <section
        className={styles.researchStrip}
        data-section="research-strip"
        aria-label="Research sources"
      >
        <div className={`${styles.page} ${styles.researchInner}`}>
          <p className={styles.monoLabel}>Built around UK research</p>
          <ul className={styles.researchList}>
            {RESEARCH_SOURCES.map((source) => (
              <li key={source}>{source}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.section} data-section="pillars">
        <div className={`${styles.page} ${styles.splitGrid}`}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>How GWTH works</p>
            <h2 className={styles.sectionTitle}>
              Build practical AI ability in public, useful steps.
            </h2>
            <p className={styles.sectionLead}>
              The new design borrows the handoff&apos;s quiet editorial rhythm, but
              keeps the sharper product promise from the current site: learn by
              making things that prove you can use AI.
            </p>
          </div>
          <div className={styles.principleList}>
            {PRODUCT_PILLARS.map((pillar) => (
              <article className={styles.principleItem} key={pillar.n}>
                <p className={styles.monoLabel}>No. {pillar.n}</p>
                <div>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionAlt}`}
        data-section="journey"
      >
        <div className={styles.page}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Different reasons</p>
            <h2 className={styles.sectionTitle}>
              Nine journeys. <span className={styles.italicAccent}>One proof.</span>
            </h2>
            <p className={styles.sectionLead}>
              Whether you are reskilling, running a small business, or trying
              to keep your team ahead, the end point is the same: practical
              work and a score someone else can verify.
            </p>
          </div>
          <div className={styles.journeyGrid}>
            {JOURNEYS.slice(0, 9).map((journey) => (
              <Link
                href={journey.href}
                className={styles.journeyCard}
                data-testid="journey-card"
                key={journey.n}
              >
                <div className={styles.journeyTopline}>
                  <span className={styles.journeyTag}>{journey.tag}</span>
                  <span className={styles.monoLabel}>{journey.n}</span>
                </div>
                <h3>{journey.title}</h3>
                <p>{journey.body}</p>
                {journey.stat ? (
                  <div className={styles.journeyStat}>
                    {journey.stat.value} - {journey.stat.label}
                  </div>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} data-section="lesson-preview">
        <div className={`${styles.page} ${styles.splitGrid}`}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Sample lesson</p>
            <h2 className={styles.sectionTitle}>
              Read it like a careful magazine. Then build something real.
            </h2>
            <p className={styles.sectionLead}>
              Lessons should feel calm enough for beginners and substantial
              enough for adults. The viewer can carry audio, figures, page
              progress, and notes without turning into a video wall.
            </p>
            <div className={styles.buttonRow}>
              <Link href="/demo/lesson-v11" className={styles.buttonPrimary}>
                Open a lesson
              </Link>
              <Link href="/lessons" className={styles.buttonSecondary}>
                Browse lessons
              </Link>
            </div>
          </div>
          <article className={styles.lessonPreview} aria-label="Lesson preview">
            <figure className={styles.lessonFigure}>
              <Image
                src="/gwth-handoff/images/fig-01.png"
                alt="Paper craft overview of GWTH projects and AI confidence"
                width={1672}
                height={941}
                className={styles.lessonImage}
              />
              <figcaption className={styles.figureCaption}>
                Lesson M1 L01 figure 01
              </figcaption>
            </figure>
            <p className={styles.monoLabel}>Lesson M1 L01</p>
            <h3>Welcome to GWTH - Six Ways AI Can Give You Superpowers</h3>
            <p>
              For non-technical adults, AI changes the practical bits of life:
              drafting, planning, researching, building tools, and making sense
              of things that used to need a specialist.
            </p>
            <blockquote className={styles.pullQuote}>
              If you can describe what you want, you can begin to build it.
            </blockquote>
            <div className={styles.segmentBar} aria-hidden="true">
              {Array.from({ length: 12 }, (_, index) => (
                <span key={index} />
              ))}
            </div>
          </article>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionDeep}`}
        data-section="score-vis"
      >
        <div className={`${styles.page} ${styles.scoreSectionGrid}`}>
          <div>
            <p className={styles.sectionEyebrow}>The GWTH Score</p>
            <h2 className={styles.sectionTitle}>
              A credential that changes as your skill changes.
            </h2>
            <p className={styles.sectionLead}>
              The score does not pretend a certificate from six months ago is
              the same thing as current ability. When lessons are revised,
              learners refresh the updated material and the credential shows
              that work clearly.
            </p>
            <div className={styles.principleList}>
              {UK_STATS.map((stat) => (
                <article className={styles.principleItem} key={stat.value}>
                  <p className={styles.monoLabel}>{stat.value}</p>
                  <div>
                    <h3>{stat.label}</h3>
                    <p>
                      Named research is used as context, not as a fake partner
                      logo strip. The course stays independent.
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <Link href="/verify/GWTH-2026-A4F8B1" className={styles.credentialPanel}>
            <p className={styles.monoLabel}>GWTH-2026-A4F8B1 - Verified</p>
            <h3>Sarah Mensah</h3>
            <p>
              Has completed AI Literacy Foundations: practical AI for
              non-technical adults, refreshed against the live curriculum.
            </p>
            <div className={styles.credentialRow}>
              <div>
                <div className={styles.credentialNumber}>104</div>
                <p className={styles.monoLabel}>Curious</p>
              </div>
              <div className={styles.credentialFacts}>
                <div className={styles.credentialFact}>
                  <span>Issued</span>
                  <strong>12 Feb 2026</strong>
                </div>
                <div className={styles.credentialFact}>
                  <span>Trend</span>
                  <strong>+49</strong>
                </div>
                <div className={styles.credentialFact}>
                  <span>Status</span>
                  <strong>Current</strong>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className={styles.section} data-section="curriculum">
        <div className={styles.page}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Curriculum</p>
            <h2 className={styles.sectionTitle}>
              Three months from AI basics to applied work.
            </h2>
          </div>
          <div className={styles.curriculumGrid}>
            {CURRICULUM.map((module) => (
              <article className={styles.curriculumCard} key={module.m}>
                <p className={styles.monoLabel}>{module.m}</p>
                <h3>{module.t}</h3>
                <p>{module.d}</p>
                <p>
                  <strong>{module.capstone}</strong>
                  <br />
                  {module.capstoneSub}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} data-section="pricing">
        <div className={styles.page}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Pricing</p>
            <h2 className={styles.sectionTitle}>
              Start free. Join when the work is worth it.
            </h2>
            <p className={styles.sectionLead}>
              The full pricing page carries the comparison table. The homepage
              keeps the promise clear: free labs first, then the course, then
              optional refreshes after completion.
            </p>
          </div>
          <div className={styles.priceGrid}>
            {PRICING.map((tier) => (
              <article
                className={`${styles.priceCard} ${
                  tier.id === "course" ? styles.priceCardFeatured : ""
                }`}
                data-testid="pricing-tier"
                data-tier={tier.id}
                data-featured={tier.id === "course" ? "true" : undefined}
                key={tier.id}
              >
                <p className={styles.monoLabel}>{tier.badge}</p>
                <h3>{tier.badge}</h3>
                <div className={styles.price}>{tier.price}</div>
                <p className={styles.pricePer}>{tier.per}</p>
                <ul>
                  {tier.features.slice(0, 4).map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                {tier.cta.style === "disabled" ? (
                  <span className={styles.buttonSecondary}>{tier.cta.label}</span>
                ) : (
                  <Link
                    href={tier.cta.href}
                    className={
                      tier.id === "course"
                        ? styles.buttonPrimary
                        : styles.buttonSecondary
                    }
                  >
                    {tier.cta.label}
                  </Link>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} data-section="faq">
        <div className={`${styles.page} ${styles.splitGrid}`}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Common questions</p>
            <h2 className={styles.sectionTitle}>
              Things worth asking before you start.
            </h2>
          </div>
          <div className={styles.faqList}>
            {faqs.map((item, index) => (
              <details className={styles.faqItem} key={item.q} open={index === 0}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.ctaSection} data-section="final-cta">
        <div className={styles.page}>
          <h2>Start free, decide later.</h2>
          <p>
            Try the labs, read a lesson, and see whether the calm practical
            route fits. Upgrade when you want the full course and verifiable
            credential.
          </p>
          <div className={styles.heroActions}>
            <Link href="/signup" className={styles.buttonPrimary}>
              Get started
            </Link>
            <Link href="/pricing" className={styles.buttonSecondary}>
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
