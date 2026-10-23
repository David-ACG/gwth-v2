"use client"

import { useMemo, useState } from "react"
import type { ModelLabCostChart } from "@/lib/types"
import { levelLabel } from "@/lib/model-lab-format"
import styles from "./labs-fde.module.css"

/** The makers with their own bar colour (David, 2026-10-23: option C, colour by company). */
export const CHART_MAKERS = [
  { maker: "Anthropic", label: "Anthropic (Claude)" },
  { maker: "OpenAI", label: "OpenAI (GPT)" },
  { maker: "Google", label: "Google (Gemini)" },
] as const

function makerKey(maker: string): string {
  return CHART_MAKERS.some((m) => m.maker === maker) ? maker.toLowerCase() : "other"
}

export type ChartSort = "cost" | "score"

/** Cost: dearest first. Score: highest first, and the cheaper of two equal scores first. */
export function sortRows(rows: ModelLabCostChart["rows"], sort: ChartSort): ModelLabCostChart["rows"] {
  return [...rows].sort((a, b) =>
    sort === "cost" ? b.cost_gbp - a.cost_gbp : b.score - a.score || a.cost_gbp - b.cost_gbp,
  )
}

/** "Claude Fable 5.1 ran 24 of the 25 tasks; the other set-ups ran all 25." from the data, or
 * "Every set-up ran all 25 tasks." when none ran fewer (premium set-ups can skip a task added later). */
export function shortRunsSentence(chart: ModelLabCostChart): string {
  const short = [...new Set(chart.rows.filter((r) => r.tasks_run < chart.tasks).map((r) => `${r.name}|${r.tasks_run}`))]
  if (!short.length) return `Every set-up ran all ${chart.tasks} tasks.`
  const parts = short.map((k) => {
    const [name, n] = k.split("|")
    return `${name} ran ${n} of the ${chart.tasks} tasks`
  })
  return `${parts.join("; ")}; the other set-ups ran all ${chart.tasks}.`
}

/**
 * Every set-up's list-price cost of running every scored task, as a bar, with its average score
 * across the six labs beside it (David, 2026-10-21, copied from the Model Lab plan page). Bars are
 * coloured by company with a key above (option C, 2026-10-23); premium set-ups say "premium" under
 * the name. Sorted by cost or by score (David, 2026-10-23: "Can we also add an option to sort it by
 * the score?"; then "Please default to score instead of cost sorting"). An ordered list whose rows read as "name, cost, score" to a screen reader; the bars
 * are decoration over the printed figure.
 */
export function CostChart({ chart }: { chart: ModelLabCostChart }) {
  const [sort, setSort] = useState<ChartSort>("score")  // David 23 Oct: "default to score"
  const rows = useMemo(() => sortRows(chart.rows, sort), [chart.rows, sort])
  const max = Math.max(...chart.rows.map((r) => r.cost_gbp), 0)
  return (
    <figure className={styles.chart} data-testid="labs-cost-chart">
      <figcaption>
        <h2 className={styles.sectionTitle} id="h-cost">
          Test costs and average scores across {chart.tasks} tasks
        </h2>
      </figcaption>
      <div className={styles.chartTools}>
        <div className={styles.chartSort} role="group" aria-label="Sort the chart">
          <span>Sort by</span>
          <button type="button" aria-pressed={sort === "cost"} onClick={() => setSort("cost")}>
            Cost
          </button>
          <button type="button" aria-pressed={sort === "score"} onClick={() => setSort("score")}>
            Score
          </button>
        </div>
        <ul className={styles.chartKey} aria-label="Bar colours">
          {CHART_MAKERS.map((m) => (
            <li key={m.maker}>
              <span className={styles.chartSwatch} data-maker={m.maker.toLowerCase()} aria-hidden="true" />
              {m.label}
            </li>
          ))}
          <li>
            <span className={styles.chartSwatch} data-maker="other" aria-hidden="true" />
            Other makers
          </li>
        </ul>
      </div>
      <div className={styles.chartHead} aria-hidden="true">
        <span>Set-up</span>
        <span>Total test cost at list price</span>
        <span className={styles.chartScoreHead}>Average score out of 100</span>
      </div>
      <ol className={styles.chartRows} aria-labelledby="h-cost">
        {rows.map((r) => {
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
                  className={styles.chartFill}
                  data-maker={makerKey(r.maker)}
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
        published prices for developer access (API), converted at 75p to the dollar.{" "}
        {shortRunsSentence(chart)}{" "}
        {chart.rows.some((r) => r.premium)
          ? "Rows marked premium are Claude Fable and GPT-6 Astra, which we show for their cost and leave out of our picks. "
          : ""}
        The number on the right is the average of its six lab scores, out of 100. Each completed
        test was run once, so small score differences may change on another run. App
        subscriptions are charged separately.
      </p>
    </figure>
  )
}
