import Link from "next/link"
import Image from "next/image"
import {
  MONTH_CONFIGS,
  TOTAL_MANDATORY_LESSONS,
  TOTAL_OPTIONAL_LESSONS,
} from "@/lib/config"
import styles from "./lessons-fde.module.css"

/**
 * Colour-block card headers keyed by course month, mirroring the
 * difficulty colours on the labs page: teal for Month 1 (beginner),
 * moss for Month 2 (intermediate), rust for Month 3 (advanced).
 */
const MONTH_FLAVOURS: Record<number, string> = {
  1: styles.flvTeal ?? "",
  2: styles.flvMoss ?? "",
  3: styles.flvRust ?? "",
}

/** How-the-course-works entries for the numbered journal list. */
const FEATURES = [
  {
    label: "Format",
    title: "Video walkthroughs",
    description:
      "Every lesson includes a video showing you exactly what to do, step by step.",
  },
  {
    label: "Volume",
    title: `${TOTAL_MANDATORY_LESSONS + TOTAL_OPTIONAL_LESSONS} lessons`,
    description:
      "Build real apps, automations, and tools, not toy exercises. Every month moves towards practical proof.",
  },
  {
    label: "Proof",
    title: "Course progress",
    description:
      "Plain progress shows completed lessons, projects, and refresh work while public credentials stay reserved for post-beta.",
  },
  {
    label: "Approach",
    title: "Vendor-neutral",
    description:
      "Learn principles, not products. We cover every major AI platform so you can pick the right tool for the job.",
  },
]

/**
 * Lessons page in the FDE journal register, matching the chosen homepage
 * direction (home-fde/): drenched teal masthead with a serif headline,
 * month cards with colour-block tops (teal/moss/rust by month), a numbered
 * how-it-works list, the 5-Hour Rule essay, and a closing band. Scoped
 * palette variables give full light/dark parity.
 */
export function LessonsFde() {
  return (
    <div className={styles.shell}>
      <section className={styles.masthead} data-section="masthead">
        <div className={styles.page}>
          <p className={styles.mastheadKicker}>
            The course · 3 months · 5 hours a week
          </p>
          <h1 className={styles.mastheadTitle}>
            Real projects, <em>not toy exercises.</em>
          </h1>
          <p className={styles.standfirst}>
            {TOTAL_MANDATORY_LESSONS} mandatory lessons plus{" "}
            {TOTAL_OPTIONAL_LESSONS} optional deep-dives across 3 months.
            Start with ChatGPT basics, then build towards AI-assisted coding,
            practical projects, and enterprise transformation.
          </p>
          <div className={styles.mastheadActions}>
            <Link href="/signup" className={styles.buttonSolid}>
              Join waitlist
            </Link>
            <Link href="/labs" className={styles.buttonOutline}>
              Try a free lab
            </Link>
          </div>
          <div className={styles.mastheadFoot}>
            <p>Video in every lesson</p>
            <p>One capstone per month</p>
            <p>Plain progress tracking</p>
          </div>
        </div>
      </section>

      <section className={styles.section} data-section="months">
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              Three months. <em>Three levels.</em>
            </h2>
            <p className={styles.mono}>
              {TOTAL_MANDATORY_LESSONS} core +{" "}
              {TOTAL_OPTIONAL_LESSONS} optional lessons
            </p>
          </div>
          <div className={styles.monthsRow}>
            {MONTH_CONFIGS.map((month) => (
              <article
                key={month.month}
                className={styles.monthCard}
                data-testid="month-card"
              >
                <div
                  className={`${styles.cardTop} ${MONTH_FLAVOURS[month.month]}`}
                >
                  <span>Month {String(month.month).padStart(2, "0")}</span>
                  <span>
                    {month.mandatoryLessons} lessons
                    {month.optionalLessons > 0 &&
                      ` + ${month.optionalLessons}`}
                  </span>
                </div>
                <div className={styles.monthBody}>
                  <h3>{month.title}</h3>
                  <p className={styles.monthSub}>{month.subtitle}</p>
                  <p>{month.description}</p>
                  <div className={styles.capstone}>
                    <p>Capstone project</p>
                    <strong>{month.capstoneName}</strong>
                    <em>{month.capstoneDescription}</em>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.sectionAlt}`}
        data-section="how-it-works"
      >
        <div className={styles.page}>
          <div className={styles.featuresGrid}>
            <div>
              <p className={styles.mono}>How it works</p>
              <h2 className={styles.sectionTitle}>
                Built for <em>practical proof.</em>
              </h2>
            </div>
            <ol className={styles.featureList}>
              {FEATURES.map((feature, i) => (
                <li key={feature.title} className={styles.featureItem}>
                  <div className={styles.featureIndex}>
                    <p>{String(i + 1).padStart(2, "0")}</p>
                    <p>{feature.label}</p>
                  </div>
                  <div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className={styles.section} data-section="five-hour-rule">
        <div className={styles.page}>
          <div className={styles.essay}>
            <div className={styles.essayImage}>
              <Image
                src="/five-hour-rule.png"
                alt="The 5-Hour Rule: Bill Gates, Warren Buffett, Elon Musk, and Oprah Winfrey all dedicate at least an hour a day to deliberate learning"
                width={900}
                height={450}
              />
            </div>
            <p className={styles.mono}>The 5-Hour Rule</p>
            <h2>
              Why <em>one hour a day?</em>
            </h2>
            <div className={styles.essayBody}>
              <p>
                GWTH.ai is built around the 5-Hour Rule: the principle, coined
                by Michael Simmons, that no matter how busy successful people
                are, they always set aside at least an hour a day for
                deliberate learning. Bill Gates, Warren Buffett, Elon Musk,
                and Oprah Winfrey all follow this approach. Simmons traces the
                idea back to Benjamin Franklin, who consistently invested an
                hour a day in reading, writing, and tracking his goals.
                Entrepreneur Thomas Corley&apos;s five-year study of 233
                millionaires confirmed that 88% dedicate at least 30 minutes
                daily to self-education, not for fun, but to sharpen their
                edge. The research is clear: sustained daily learning beats
                occasional cramming every time.
              </p>
              <p>
                GWTH.ai lessons are designed to fit this rhythm. Each one
                delivers focused, practical AI skills in roughly an hour, five
                hours across your working week, so you build real capability
                without disrupting your life. Read, reflect, then apply what
                you&apos;ve learned through hands-on projects. As the AT&amp;T
                CEO warned, those who don&apos;t spend at least five to ten
                hours a week learning risk making themselves obsolete. In the
                age of AI, that&apos;s never been more true, and GWTH makes
                sure those five hours count.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.closing} data-section="closing">
        <div className={styles.page}>
          <h2>
            Ready to start <em>building?</em>
          </h2>
          <p>
            Join the waitlist for the course, or try a free lab first to see
            works.
          </p>
          <div className={styles.closingActions}>
            <Link href="/signup" className={styles.buttonSolid}>
              Join waitlist
            </Link>
            <Link href="/pricing" className={styles.buttonOutline}>
              View pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
