import Link from "next/link"
import type { ModelLabIndex, ModelLabPick } from "@/lib/types"
import { aboutCost, formatTestedMonth, formatTestedRange, levelLabel } from "@/lib/model-lab-format"
import styles from "./labs-fde.module.css"
import { CostChart as CostChartView } from "./cost-chart"

/**
 * Props for {@link LabsFde}.
 */
interface LabsFdeProps {
  /** The six labs with their test dates, counts and the cost chart. */
  index: ModelLabIndex
}

/** One item in the "How we test" row. */
interface HowItem {
  /** Short heading. */
  title: string
  /** One or two sentences under it. */
  body: string
}

/** The short "How we test" on the index; the full list is on every lab page. */
const HOW_WE_TEST: ReadonlyArray<HowItem> = [
  {
    title: "Real tasks, each with a trap.",
    body: "We used 25 tasks across six labs, based on real UK work. Each hides a trap a careful person would catch, such as an out-of-date figure or a false legal claim.",
  },
  {
    title: "Marked two ways.",
    body: "Computer checks mark what can be checked exactly, such as figures and dates. AI judges mark the rest against a written guide, and no judge marks its own company's work.",
  },
  {
    title: "Checked by a person.",
    body: "A person at GWTH checked a sample of the marks by reading the answers side by side. Each set-up did each task once.",
  },
]

/** "Claude Opus 5.5, medium thinking. 94 out of 100, about 38p a task." */
function PickLine({ label, pick }: { label: string; pick: ModelLabPick }) {
  return (
    <p className={styles.cardPick}>
      <span className={styles.cardPickLabel}>{label}</span>
      <strong>{pick.name}</strong>, {levelLabel(pick.level)}. {pick.score} out of 100,{" "}
      {aboutCost(pick.cost)} a task.
    </p>
  )
}

export { CostChart, shortRunsSentence } from "./cost-chart"

/**
 * The Model Lab index at /labs (David, 2026-10-21, option A), PAPER-FIRST
 * register. It replaced the Model Arena listing: new AI models now get
 * the same real UK work tasks in six labs, marked by computer checks and AI
 * judges, and each lab has its own results page.
 *
 * Structure kept from the Arena listing: a two-column quiet masthead, a short
 * explainer row (now "How we test"), the card grid (now the six labs, each
 * with its question, best pick and best value), then the cost-and-score chart
 * for every set-up and the closing band pointing at the course. Labs are free
 * to open; during the private pre-launch period (W25) the route itself is
 * behind the content gate.
 */
export function LabsFde({ index }: LabsFdeProps) {
  const tested = formatTestedRange(index.tested_from, index.tested_to)
  return (
    <div className={styles.shell}>
      <section className={styles.masthead} data-section="masthead">
        <div className={styles.page}>
          <h1 className={styles.mastheadTitle}>
            Which AI should you use? <em>We test them to find out.</em>
          </h1>
          <p className={styles.standfirst} data-testid="labs-uk-note">
            We give new AI models the same real UK work tasks, in six labs: research, writing,
            thinking a problem through, building a tool, spreadsheets and data, and acting for
            you. Computer checks and AI judges mark every answer. No AI company pays us.
          </p>
          <p className={styles.standfirst}>
            Each lab names the best model and the best value, lets you read four answers with
            the names hidden and choose your own, and lists every model&apos;s marks and costs.
            The costs are what the tests cost through developer access (the API), not the price of
            an app subscription. Tested {formatTestedMonth(index.tested_from, index.tested_to)}.
          </p>
          <div className={styles.mastheadActions}>
            <a href="#labs" className={styles.buttonSolid}>
              See the six labs
            </a>
            <Link href="/pricing" className={styles.buttonOutline}>
              See the course
            </Link>
          </div>
          <div className={styles.mastheadFoot}>
            <p>Tested {tested}</p>
            <p>
              {index.model_count} models, {index.setup_count} set-ups including different thinking settings
            </p>
            <p>Free, no card required</p>
          </div>
        </div>
      </section>

      <section className={styles.explainer} data-section="how-we-test" aria-labelledby="h-how">
        <div className={styles.page}>
          <h2 className={styles.explainerHead} id="h-how">
            How we test
          </h2>
          <div className={styles.explainerRow}>
            {HOW_WE_TEST.map((item) => (
              <div key={item.title} className={styles.explainerItem}>
                <h3 className={styles.explainerTitle}>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} data-section="labs" id="labs">
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>The six labs.</h2>
          </div>
          <p className={styles.sectionLead}>
            Start with the kind of work that is closest to your own.
          </p>
          {index.labs.length === 0 ? (
            <div className={styles.empty}>
              <h3>No labs right now.</h3>
              <p>The next round of tests is running. The labs will appear here when it is done.</p>
            </div>
          ) : (
            <div className={styles.cardsRow}>
              {index.labs.map((lab) => (
                <Link
                  href={`/labs/${lab.sp}`}
                  aria-label={`${lab.sp_name} lab: ${lab.headline}`}
                  className={styles.card}
                  data-testid="model-lab-card"
                  key={lab.sp}
                >
                  <div className={styles.cardBody}>
                    <p className={styles.cardCue}>{lab.sp_name}</p>
                    <h3>{lab.headline}</h3>
                    <PickLine label="Best" pick={lab.best} />
                    <PickLine label="Best value" pick={lab.value} />
                    <p className={styles.cardMeta}>
                      <span>{lab.count} set-ups</span>
                      <span>Main task: {lab.sig_title}</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {index.cost_chart.rows.length ? (
        <section className={styles.section} data-section="cost-chart">
          <div className={styles.page}>
            <CostChartView chart={index.cost_chart} />
          </div>
        </section>
      ) : null}

      <section className={styles.closing} data-section="closing">
        <div className={styles.page}>
          <h2>
            Labs show you which AI. <em>The course shows you how.</em>
          </h2>
          <p>
            Each lab shows which AI did best on real work tasks, what it cost and when we tested
            it. In Month 1 of the course you build the Family AI Bot. In Month 2 you build a
            customer support chatbot. In Month 3 you build an AI consultant that interviews people
            and writes a plan for an organisation.
          </p>
          {/* David, 2026-10-23: "Do we have lessons that show you how to compare models? ... Maybe we
              should mention that on the labs page." Month 1 Lesson 5 (frontier labs), Month 2's cheaper
              and open models lesson and Month 3's premium plans lesson; numbers left out because the
              syllabus can move. Latest Sol checked. */}
          <p>
            The course also teaches you to run your own comparison. In Month 1 you give two AI tools
            the same task in exactly the same words. You compare their answers using four questions,
            then set up a monthly check to keep your choice up to date as models change. Later lessons
            show when a cheaper AI model or an open model you can download and run yourself is good
            enough, and when a premium plan is worth paying for.
          </p>
          <div className={styles.closingActions}>
            <Link href="/pricing" className={styles.buttonSolid}>
              See the course
            </Link>
            <Link href="/why-gwth" className={styles.buttonOutline}>
              Why GWTH
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
