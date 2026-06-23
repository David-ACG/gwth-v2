import Link from "next/link"
import {
  COURSE_MONTHLY_PRICE,
  ONGOING_MONTHLY_PRICE,
  TOTAL_MANDATORY_LESSONS,
  TOTAL_OPTIONAL_LESSONS,
} from "@/lib/config"
import { UK_STATS, RESEARCH_SOURCES } from "@/components/marketing/data"
import styles from "./for-teams-fde.module.css"

/** Differentiator entries for the numbered journal list. */
const WHY_GWTH = [
  {
    title: "Zero wasted time",
    description:
      "No repetition. No filler. No outdated material. Every lesson teaches the newest, most relevant applied AI skills. Your team's time is more valuable than the course, and we treat it that way.",
  },
  {
    title: "Practical projects with walkthroughs",
    description:
      "Not slides. Not theory. Lessons build towards real outputs your team members can use, show, or adapt at work.",
  },
  {
    title: "Beginner-friendly, then builder-ready",
    description:
      "Month 1 starts in plain English. Later lessons introduce AI-assisted coding and building patterns for teams ready to go deeper.",
  },
  {
    title: "You choose the syllabus",
    description: `${TOTAL_MANDATORY_LESSONS} essential lessons are mandatory. ${TOTAL_OPTIONAL_LESSONS} optional lessons cover industry-specific and advanced topics. Team admins assign the right optional lessons to each role, so no one wastes time on irrelevant content.`,
  },
  {
    title: "Vendor-neutral applied AI",
    description:
      "We do not sell tools. Your team learns transferable AI skills, not product-specific workflows that become obsolete.",
  },
  {
    title: "Plain progress reporting",
    description:
      "Progress reporting reflects completion, demonstrated applied skill, and currentness rather than a one-time certificate.",
  },
  {
    title: "Built for the enterprise conversation",
    description:
      "Month 3 covers governance, ROI measurement, change management, and multi-agent systems. The strategic layer that boards and compliance teams need to hear.",
  },
]

/** Syllabus month summaries with colour-block flavours (teal/moss/rust). */
const MONTHS = [
  {
    month: 1,
    title: "Foundations",
    lessons: "24 mandatory",
    flavour: "flvTeal" as const,
    description:
      "Move beyond using ChatGPT like Google. Learn AI foundations, the six primitives, and practical AI-assisted building.",
  },
  {
    month: 2,
    title: "Apps, Workflows & Consulting",
    lessons: "20 mandatory + 15 optional",
    flavour: "flvMoss" as const,
    description:
      "Go deeper into building, workflows, small-business use cases, and consultant-level applied AI skills.",
  },
  {
    month: 3,
    title: "Enterprise Transformation",
    lessons: "20 mandatory + 15 optional",
    flavour: "flvRust" as const,
    description:
      "Multi-agent systems, self-hosted AI, governance frameworks, ROI measurement, and change management. The strategic layer that turns individual skills into organisational capability.",
  },
]

/** Frequently asked questions, rendered as native disclosure elements. */
const FAQS = [
  {
    question: "Can we choose which lessons our team completes?",
    answer: `Yes. The ${TOTAL_MANDATORY_LESSONS} mandatory lessons cover essential AI skills that everyone needs. Beyond that, there are ${TOTAL_OPTIONAL_LESSONS} optional lessons covering industry-specific applications, advanced topics, and specialisations. Team admins can assign relevant optional lessons per role: your marketing team does not need the same modules as your engineering team. Individual learners can also pick their own path from the optional lessons.`,
  },
  {
    question: "Will this displace our employees?",
    answer:
      "No. This course makes your existing team more productive. People who can use AI effectively are more valuable, not less. UK employment law provides strong protections, and the government's own AI strategy emphasises augmentation over replacement. Companies investing in AI training retain 34% more staff because employees feel invested in rather than threatened.",
  },
  {
    question: "Is our data safe?",
    answer:
      "The course teaches your team how to use AI responsibly, including when to use private/local models versus cloud APIs. Month 3 includes governance frameworks specifically designed for enterprise data handling. Your team will understand the security implications before they start building.",
  },
  {
    question: "What is the ROI?",
    answer: `Starter pricing is £${COURSE_MONTHLY_PRICE.toFixed(2)}/month for each person, with monthly access rather than an annual lock-in. By Month 1, your team should be automating tasks that currently take hours. By Month 3, they will be building internal tools and leading AI transformation initiatives.`,
  },
  {
    question: "Our team is not technical. Is this appropriate?",
    answer:
      "This course starts with non-technical people in mind. Month 1 uses plain English and practical AI patterns, then later lessons introduce AI-assisted coding and stronger building techniques for people ready to go deeper.",
  },
  {
    question: "How is this different from vendor-specific training?",
    answer:
      "Vendor training teaches you one tool. GWTH teaches the skill of working with AI, using whichever tool is best for the job. Your team learns transferable skills, not product-specific workflows that become obsolete.",
  },
  {
    question: "How does this compare to the government's AI Skills Boost?",
    answer:
      "The government programme covers AI awareness basics in 20 minutes to 9 hours. GWTH goes further with structured lessons, practical projects, AI-assisted building, and enterprise transformation. Many teams complete the free government badge first, then use GWTH for the skills their people actually need.",
  },
  {
    question: "Can employees complete this during working hours?",
    answer:
      "Many companies do exactly this, and it is the most effective approach. At 5 hours per week for 3 months, the time investment is modest. Because every lesson is practical and immediately applicable, employees start returning value from week one. The syllabus flexibility means admins can prioritise lessons most relevant to each team's daily work.",
  },
  {
    question: "Can we pilot with a small group first?",
    answer:
      "Absolutely. There is no minimum team size and no contract. Start with 2 people or 200. The admin dashboard is available for teams of 5+, but smaller groups work perfectly well with individual accounts.",
  },
  {
    question: "Can you create bespoke content for our company?",
    answer:
      "Yes. For teams of 100+, we can create bespoke lessons tailored specifically to your company's workflows, tools, and industry challenges. This means your team learns AI skills in the context of the work they actually do every day, not generic examples they have to mentally translate. Get in touch to discuss your requirements.",
  },
]

/** Logistics mini-stats. */
const HOW_IT_WORKS = [
  { label: "3 months", detail: "structured curriculum" },
  { label: "5 hours/week", detail: "per team member" },
  { label: "Fully online", detail: "no travel required" },
  { label: "Self-paced", detail: "fits any schedule" },
  { label: "Daily updates", detail: "always current" },
]

/** What the per-person price includes for teams. */
const TEAM_PRICE_FEATURES = [
  "Same price for teams: no bulk discount because it is already the lowest possible price",
  "No minimum contract, no lock-in",
  "Teams of 5+ get an admin dashboard with progress tracking and completion rates",
  "Admin chooses which optional lessons each role completes",
  "Cancel anytime, per seat",
]

/** How syllabus control works, shown in the ruled control box. */
const SYLLABUS_BULLETS = [
  `${TOTAL_MANDATORY_LESSONS} mandatory lessons cover the essential AI skills everyone needs, no choices required`,
  `${TOTAL_OPTIONAL_LESSONS} optional lessons cover industry-specific and advanced topics`,
  "Team admins assign relevant optional lessons per role via the dashboard",
  "Individual learners (non-team) pick their own path from optional lessons",
  "Progress tracking shows completion rates per person and per department",
]

/**
 * For Teams page in the FDE journal register, matching the chosen homepage
 * direction (home-fde/): drenched teal masthead, ruled UK stat columns,
 * time-cost comparison cards, a numbered differentiator list, syllabus
 * month cards (teal/moss/rust), logistics mini-stats, a featured
 * investment card, a native-details FAQ, and a closing band.
 */
export function ForTeamsFde() {
  return (
    <div className={styles.shell}>
      <section className={styles.masthead} data-section="masthead">
        <div className={styles.page}>
          <p className={styles.mastheadKicker}>For teams · UK</p>
          <h1 className={styles.mastheadTitle}>AI Training for Your Team</h1>
          <p className={styles.standfirst}>
            UK businesses are falling behind on AI skills. The gap is not
            tools, it is training.
          </p>
          <div className={styles.mastheadActions}>
            <Link href="/contact" className={styles.buttonSolid}>
              Get in touch
            </Link>
            <Link href="/labs" className={styles.buttonOutline}>
              Try a free lab
            </Link>
          </div>
          <div className={styles.mastheadFoot}>
            <p>3 months · 5 hours a week</p>
            <p>Fully online</p>
            <p>No lock-in</p>
          </div>
        </div>
      </section>

      <section className={styles.section} data-section="stats">
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              The numbers <em>are clear.</em>
            </h2>
            <p className={styles.mono}>The numbers</p>
          </div>
          <div className={styles.statsRow}>
            {UK_STATS.map((stat) => (
              <div key={stat.value} className={styles.stat} data-testid="for-teams-stat">
                <strong>{stat.value}</strong>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
          <p className={styles.statsFoot}>
            Source: UK Government / DSIT (Jan 2026) ·{" "}
            {RESEARCH_SOURCES.join(" · ")}
          </p>
          <p className={styles.statsNote}>
            Most AI training fails because it teaches tools, not skills. The
            UK government&apos;s own research shows only 21% of workers feel
            confident using AI. A 20-minute vendor course will not change
            that. 120 hours of hands-on, vendor-neutral training will.
          </p>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionAlt}`}
        data-section="time-cost"
      >
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              The real cost is not the course.{" "}
              <em>It is your team&apos;s time.</em>
            </h2>
          </div>
          <p className={styles.sectionLead}>
            At £{COURSE_MONTHLY_PRICE.toFixed(2)}/month for 3 months, the
            entire course costs £{COURSE_MONTHLY_PRICE.toFixed(2)}/month per
            person. That is deliberately priced below even a short consultant
            call.
          </p>
          <div className={styles.compareRow}>
            <article className={styles.compareCard}>
              <div className={`${styles.cardTop} ${styles.flvMuted}`}>
                <span>Elsewhere</span>
                <span>40 hours</span>
              </div>
              <h3>Typical AI training</h3>
              <p>
                Padded with filler. Repetitive. Outdated within weeks. Your
                team spends 40 hours on content that could be covered in 10.
              </p>
            </article>
            <article className={styles.compareCard}>
              <div className={`${styles.cardTop} ${styles.flvTeal}`}>
                <span>This course</span>
                <span>Zero filler</span>
              </div>
              <h3>GWTH</h3>
              <p>
                No repetition. No filler. Only the newest, most relevant
                applied AI topics. Every minute of your team&apos;s time
                produces a practical skill they use immediately.
              </p>
            </article>
          </div>
          <p className={styles.compareNote}>
            When your employees complete lessons during working hours, as
            many companies encourage, the quality and efficiency of every
            lesson matters even more. You want zero wasted time. That is
            exactly what we deliver.
          </p>
        </div>
      </section>

      <section className={styles.section} data-section="why-gwth">
        <div className={styles.page}>
          <div className={styles.whyGrid}>
            <div>
              <p className={styles.mono}>Differentiators</p>
              <h2 className={styles.sectionTitle}>
                Why GWTH <em>for teams.</em>
              </h2>
            </div>
            <ol className={styles.whyList}>
              {WHY_GWTH.map((item, i) => (
                <li key={item.title} className={styles.whyItem}>
                  <p className={styles.whyIndex}>
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionAlt}`}
        data-section="syllabus"
      >
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              Complete control over what your team learns
            </h2>
            <p className={styles.mono}>Syllabus</p>
          </div>
          <p className={styles.sectionLead}>
            Not every role needs every lesson. The team admin dashboard lets
            you build the right syllabus for each department. Every concept
            is introduced with a clear explanation of why it matters, not
            just what it is, so your team stays engaged because they
            understand the practical benefit before learning the skill.
          </p>
          <div className={styles.monthsRow}>
            {MONTHS.map((month) => (
              <article key={month.month} className={styles.monthCard}>
                <div className={`${styles.cardTop} ${styles[month.flavour]}`}>
                  <span>Month {String(month.month).padStart(2, "0")}</span>
                  <span>{month.lessons}</span>
                </div>
                <div className={styles.monthBody}>
                  <h3>{month.title}</h3>
                  <p>{month.description}</p>
                </div>
              </article>
            ))}
          </div>
          <div className={styles.controlBox}>
            <h3>How syllabus control works</h3>
            <ul className={styles.ruledList}>
              {SYLLABUS_BULLETS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.section} data-section="how-it-works">
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>How it works</h2>
            <p className={styles.mono}>Logistics</p>
          </div>
          <div className={styles.miniStats}>
            {HOW_IT_WORKS.map((item) => (
              <div key={item.label} className={styles.miniStat}>
                <strong>{item.label}</strong>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionAlt}`}
        data-section="investment"
      >
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              Same per-person price <em>for any team size.</em>
            </h2>
            <p className={styles.mono}>Investment</p>
          </div>
          <article className={styles.investCard}>
            <div className={`${styles.cardTop} ${styles.flvMoss}`}>
              <span>Per person</span>
              <span>GBP · monthly</span>
            </div>
            <div className={styles.investBody}>
              <p className={styles.investPrice}>
                <strong>£{COURSE_MONTHLY_PRICE.toFixed(2)}</strong>
                <span>/month per person</span>
              </p>
              <p>
                per course month, then £{ONGOING_MONTHLY_PRICE.toFixed(2)}
                /month optional Stay Current access after course access ends.
              </p>
              <ul className={styles.ruledList}>
                {TEAM_PRICE_FEATURES.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          </article>
          <p className={styles.investFoot}>
            All prices in GBP. International pricing coming soon. See the
            full pricing breakdown on the{" "}
            <Link href="/pricing">pricing page</Link>.
          </p>
        </div>
      </section>

      <section className={styles.section} data-section="faq">
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              Frequently asked <em>questions.</em>
            </h2>
            <p className={styles.mono}>Questions</p>
          </div>
          <div className={styles.faqList}>
            {FAQS.map((faq) => (
              <details key={faq.question} className={styles.faqItem}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.closing} data-section="closing">
        <div className={styles.page}>
          <h2>
            Ready to upskill <em>your UK team?</em>
          </h2>
          <p>
            Get in touch to discuss your team&apos;s needs, or let your
            people try a free lab right now.
          </p>
          <div className={styles.closingActions}>
            <Link href="/contact" className={styles.buttonSolid}>
              Get in touch
            </Link>
            <Link href="/labs" className={styles.buttonOutline}>
              Try a free lab
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
