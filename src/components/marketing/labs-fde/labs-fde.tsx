import Link from "next/link"
import type { ModelLabCostChart, ModelLabIndex, ModelLabPick } from "@/lib/types"
import { formatTestedMonth, formatTestedRange, levelLabel } from "@/lib/model-lab-format"
import styles from "./labs-fde.module.css"

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
      <strong>{pick.name}</strong>, {levelLabel(pick.level)}. {pick.score} out of 100, about{" "}
      {pick.cost} a task.
    </p>
  )
}

/**
 * Every set-up's list-price cost of running every scored task, as a bar, with
 * its average score across the six labs beside it, dearest first (David,
 * 2026-10-21, copied from the Model Lab plan page). Plain HTML and CSS: an
 * ordered list whose rows read as "name, cost, score" to a screen reader; the
 * bars themselves are decoration over the printed figure. A premium set-up has
 * its own bar colour AND the word "premium" under its name.
 */
/** "Claude Fable 5.1 ran 24 of the 25 tasks; the other set-ups ran all 25." from the data, or
 * "Every set-up ran all 25." when none ran fewer (premium set-ups can skip a task added later). */
export function shortRunsSentence(chart: ModelLabCostChart): string {
  const short = [...new Set(chart.rows.filter((r) => r.tasks_run < chart.tasks).map((r) => `${r.name}|${r.tasks_run}`))]
  if (!short.length) return `Every set-up ran all ${chart.tasks} tasks.`
  const parts = short.map((k) => {
    const [name, n] = k.split("|")
    return `${name} ran ${n} of the ${chart.tasks} tasks`
  })
  return `${parts.join("; ")}; the other set-ups ran all ${chart.tasks}.`
}

export function CostChart({ chart }: { chart: ModelLabCostChart }) {
  const max = Math.max(...chart.rows.map((r) => r.cost_gbp), 0)
  return (
    <figure className={styles.chart} data-testid="labs-cost-chart">
      <figcaption>
        <h2 className={styles.sectionTitle} id="h-cost">
          Test costs and average scores across {chart.tasks} tasks
        </h2>
      </figcaption>
      <div className={styles.chartHead} aria-hidden="true">
        <span>Set-up</span>
        <span>Total test cost at list price</span>
        <span className={styles.chartScoreHead}>Average score out of 100</span>
      </div>
      <ol className={styles.chartRows} aria-labelledby="h-cost">
        {chart.rows.map((r) => {
          const width = max > 0 ? (r.cost_gbp / max) * 100 : 0
          const short = r.tasks_run < chart.tasks
          return (
            <li
              key={r.setup}
              className={styles.chartRow}
              data-premium={r.premium ? "true" : undefined}
            >
              <span className={styles.chartName}>
                {r.name}, {levelLabel(r.level)}
                {r.premium || short ? (
                  <small>
                    {[r.premium ? "premium" : "", short ? `ran ${r.tasks_run} of ${chart.tasks} tasks` : ""]
                      .filter(Boolean)
                      .join(" · ")}
                  </small>
                ) : null}
              </span>
              <span className={styles.chartTrack}>
                <span
                  className={`${styles.chartFill} ${r.premium ? styles.chartFillPremium : ""}`}
                  style={{ width: `calc(${width.toFixed(1)}% * 0.8)` }}
                  aria-hidden="true"
                />
                <span className={styles.chartCost}>
                  <span className="sr-only">Cost: </span>
                  {r.cost}
                </span>
              </span>
              <span className={styles.chartScore}>
                <span className="sr-only">Average score: </span>
                {r.score}
              </span>
            </li>
          )
        })}
      </ol>
      <p className={styles.chartNote}>
        Each bar shows the total cost of the tasks that set-up ran, using each company&apos;s
        published prices for developer access (API), converted at 75p to the dollar.
        {shortRunsSentence(chart)}{" "}
        {chart.rows.some((r) => r.premium)
          ? "Rows marked premium are Claude Fable and GPT-6 Astra, which we show for their cost and leave out of our picks. "
          : ""}
        The number on the right is the average of its six lab scores, out of 100. Each completed test was run
        once, so small score differences may change on another run. App subscriptions are charged
        separately.
      </p>
    </figure>
  )
}

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
            Tested {formatTestedMonth(index.tested_from, index.tested_to)}.
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
            <CostChart chart={index.cost_chart} />
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
