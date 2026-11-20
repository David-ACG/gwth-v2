"use client"

import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react"
import type { ModelLabCostChart } from "@/lib/types"
import { countWord, levelLabel } from "@/lib/model-lab-format"
import {
  CHART_MAKERS,
  shortRunsSentence,
  sortRows,
  type ChartSort,
} from "@/components/marketing/labs-fde/cost-chart"
import { InView } from "./in-view"
import styles from "./labs-next.module.css"

type Row = ModelLabCostChart["rows"][number]

/** How many rows of the list show before the rest fold behind "Show the other ...". */
const FIRST_ROWS = 10

function makerKey(maker: string): string {
  return CHART_MAKERS.some((m) => m.maker === maker) ? maker.toLowerCase() : "other"
}

/** "Claude Opus 5.5, medium thinking": the name and level exactly as the data gives them. */
function setupName(row: Row): string {
  return `${row.name}, ${levelLabel(row.level)}`
}

/** "10p", "£1", "£100": an axis mark, from the cost in pounds. */
export function costTick(pounds: number): string {
  return pounds < 1 ? `${Math.round(pounds * 100)}p` : `£${pounds}`
}

/**
 * Where the dots sit. Cost runs left to right on a scale where each mark is
 * ten times the last (10p, £1, £10, £100), because the dearest set-up costs
 * several hundred times the cheapest and an even scale would pile every other
 * dot against the left edge. Score runs bottom to top, starting at the ten
 * below the lowest score so the dots use the height.
 */
export function plotScales(rows: readonly Row[]) {
  const costs = rows.map((r) => r.cost_gbp).filter((c) => c > 0)
  const scores = rows.map((r) => r.score)
  const lo = Math.log10(Math.min(...costs) / 1.8)
  const hi = Math.log10(Math.max(...costs) * 1.8)
  const scoreLo = Math.max(0, Math.floor((Math.min(...scores) - 3) / 10) * 10)
  const scoreHi = 100
  const costTicks: number[] = []
  for (let power = Math.ceil(lo); power <= Math.floor(hi); power++) costTicks.push(10 ** power)
  const scoreTicks: number[] = []
  for (let s = scoreLo; s <= scoreHi; s += 10) scoreTicks.push(s)
  return {
    x: (pounds: number) => ((Math.log10(pounds) - lo) / (hi - lo)) * 100,
    y: (score: number) => ((score - scoreLo) / (scoreHi - scoreLo)) * 100,
    costTicks,
    scoreTicks,
  }
}

/** The three set-ups the page points out, straight from the data. */
export function callouts(rows: readonly Row[]) {
  const top = sortRows([...rows], "score")[0]!
  const byCost = [...rows].sort((a, b) => a.cost_gbp - b.cost_gbp)
  return {
    top,
    /** Other set-ups with the same top score; `top` is the cheapest of them. */
    tied: rows.filter((r) => r.score === top.score).length - 1,
    cheapest: byCost[0]!,
    dearest: byCost[byCost.length - 1]!,
  }
}

/** "A, B and C" from the data, so no model name is typed on this page. */
function listNames(names: readonly string[]): string {
  if (names.length <= 1) return names.join("")
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * The cost and score of every set-up, two ways (Labs page, 19 Nov 2026).
 * David: the page "doesn't look particularly inviting"; the brief: "make the
 * cost chart a pleasure to read".
 *
 * 1. **The picture.** One dot per set-up: further right cost more, higher up
 *    scored better. It answers "does paying more get better work?" at a
 *    glance, which the old list of 46 bars could not. Three set-ups are
 *    pointed out in words (highest score, lowest cost, highest cost), all
 *    worked out from the data. Choosing a card or a dot names that set-up
 *    underneath.
 * 2. **The list.** The same rows as the old chart (`labs-fde/cost-chart.tsx`,
 *    whose sort and wording helpers this reuses): name, cost bar with its
 *    figure, average score. The first ten show; the rest are in a native
 *    `<details>`, so they open without JavaScript.
 *
 * Colour is by company with a key (David, 2026-10-23, option C), a premium
 * set-up is a hollow dot AND says "premium", and every figure is printed as
 * text, so colour never carries anything alone.
 *
 * Keyboard: the dots are one tab stop; left and right arrows move from one
 * set-up to the next dearer or cheaper one.
 */
export function CostMap({
  chart,
  labCount,
  pencePerDollar,
}: {
  chart: ModelLabCostChart
  /** How many labs the average score is taken over. */
  labCount: number
  /** Pence to the dollar used for every cost (`index.p_per_usd`). */
  pencePerDollar: number
}) {
  const scales = useMemo(() => plotScales(chart.rows), [chart.rows])
  const picks = useMemo(() => callouts(chart.rows), [chart.rows])
  /** Cheapest first: the order the arrow keys walk the dots in. */
  const byCost = useMemo(
    () => [...chart.rows].sort((a, b) => a.cost_gbp - b.cost_gbp),
    [chart.rows]
  )
  const [picked, setPicked] = useState(picks.top.setup)
  const [sort, setSort] = useState<ChartSort>("score") // David, 23 Oct: "default to score"
  const rows = useMemo(() => sortRows(chart.rows, sort), [chart.rows, sort])
  const dots = useRef(new Map<string, HTMLButtonElement>())

  const max = Math.max(...chart.rows.map((r) => r.cost_gbp), 0)
  const current = chart.rows.find((r) => r.setup === picked) ?? picks.top
  const premiumNames = [...new Set(chart.rows.filter((r) => r.premium).map((r) => r.name))]

  function onDotKey(event: KeyboardEvent<HTMLButtonElement>, setup: string) {
    const at = byCost.findIndex((r) => r.setup === setup)
    const to =
      event.key === "ArrowRight" || event.key === "ArrowUp"
        ? at + 1
        : event.key === "ArrowLeft" || event.key === "ArrowDown"
          ? at - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? byCost.length - 1
              : -1
    const next = byCost[to]
    if (!next) return
    event.preventDefault()
    setPicked(next.setup)
    dots.current.get(next.setup)?.focus()
  }

  const cards: { id: string; label: string; row: Row; lines: string[] }[] = [
    {
      id: "top",
      label: "Highest average score",
      row: picks.top,
      lines: [
        `Scored ${picks.top.score} out of 100. Total test cost: ${picks.top.cost}.`,
        ...(picks.tied > 0
          ? [
              `${capitalise(countWord(picks.tied))} other set-up${picks.tied > 1 ? "s" : ""} also scored ${picks.top.score}. This one cost the least.`,
            ]
          : []),
      ],
    },
    {
      id: "cheapest",
      label: "Lowest test cost",
      row: picks.cheapest,
      lines: [`Total test cost: ${picks.cheapest.cost}. Scored ${picks.cheapest.score} out of 100.`],
    },
    {
      id: "dearest",
      label: "Highest test cost",
      row: picks.dearest,
      lines: [`Total test cost: ${picks.dearest.cost}. Scored ${picks.dearest.score} out of 100.`],
    },
  ]

  const row = (r: Row) => {
    const width = max > 0 ? (r.cost_gbp / max) * 100 : 0
    const short = r.tasks_run < chart.tasks
    return (
      <li key={r.setup} className={styles.listRow} data-premium={r.premium ? "true" : undefined}>
        <span className={styles.listName}>
          {setupName(r)}
          {r.premium || short ? (
            <small>
              {[r.premium ? "premium" : "", short ? `ran ${r.tasks_run} of ${chart.tasks} tasks` : ""]
                .filter(Boolean)
                .join(" · ")}
            </small>
          ) : null}
        </span>
        <span className={styles.listTrack}>
          <span
            className={styles.listFill}
            data-maker={makerKey(r.maker)}
            style={{ width: `calc(${width.toFixed(1)}% * 0.78)` }}
            aria-hidden="true"
          />
          <span className={styles.listCost}>
            <span className={styles.srOnly}>Cost: </span>
            {r.cost}
          </span>
        </span>
        <span className={styles.listScore}>
          <span className={styles.srOnly}>Average score: </span>
          {r.score}
        </span>
      </li>
    )
  }

  const first = rows.slice(0, FIRST_ROWS)
  const rest = rows.slice(FIRST_ROWS)

  return (
    <div className={styles.costMap} data-testid="labs-cost-chart">
      <div className={styles.callouts} data-testid="cost-callouts">
        {cards.map((card) => (
          <button
            type="button"
            key={card.id}
            className={styles.callout}
            aria-pressed={picked === card.row.setup}
            onClick={() => setPicked(card.row.setup)}
            data-callout={card.id}
          >
            <span className={styles.calloutLabel}>{card.label}</span>
            <span className={styles.calloutName}>
              <span
                className={styles.swatch}
                data-maker={makerKey(card.row.maker)}
                data-premium={card.row.premium ? "true" : undefined}
                aria-hidden="true"
              />
              {setupName(card.row)}
              {card.row.premium ? " (premium)" : ""}
            </span>
            {card.lines.map((line) => (
              <span className={styles.calloutLine} key={line}>
                {line}
              </span>
            ))}
          </button>
        ))}
      </div>

      <InView className={styles.plotPanel}>
        <div className={styles.plotTop}>
          <p className={styles.axisTitle} aria-hidden="true">
            Average score out of 100
          </p>
          <p className={styles.plotHint}>Choose any dot to see which AI it is.</p>
        </div>
        <div
          className={styles.plot}
          role="group"
          aria-label={`Every set-up as a dot, placed by its total test cost and its average score. Use the left and right arrow keys to move from one set-up to the next.`}
          data-testid="cost-plot"
        >
          {scales.scoreTicks.map((tick) => (
            <span
              className={styles.yTick}
              style={{ bottom: `${scales.y(tick)}%` }}
              key={`y${tick}`}
              aria-hidden="true"
            >
              <span>{tick}</span>
            </span>
          ))}
          {scales.costTicks.map((tick) => (
            <span
              className={styles.xTick}
              style={{ left: `${scales.x(tick)}%` }}
              key={`x${tick}`}
              aria-hidden="true"
            >
              <span>{costTick(tick)}</span>
            </span>
          ))}
          {byCost.map((r, i) => (
            <button
              type="button"
              key={r.setup}
              ref={(el) => {
                if (el) dots.current.set(r.setup, el)
                else dots.current.delete(r.setup)
              }}
              className={styles.dot}
              data-maker={makerKey(r.maker)}
              data-premium={r.premium ? "true" : undefined}
              data-picked={picked === r.setup ? "true" : undefined}
              aria-pressed={picked === r.setup}
              aria-label={`${setupName(r)}${r.premium ? ", premium" : ""}. Average score ${r.score} out of 100. Test cost ${r.cost}.`}
              tabIndex={picked === r.setup ? 0 : -1}
              style={
                {
                  left: `${scales.x(r.cost_gbp).toFixed(2)}%`,
                  bottom: `${scales.y(r.score).toFixed(2)}%`,
                  "--dot-delay": `${i * 14}ms`,
                } as CSSProperties
              }
              onClick={() => setPicked(r.setup)}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setPicked(r.setup)
              }}
              onFocus={() => setPicked(r.setup)}
              onKeyDown={(event) => onDotKey(event, r.setup)}
            />
          ))}
        </div>
        <p className={`${styles.axisTitle} ${styles.axisTitleX}`} aria-hidden="true">
          Total test cost at list price
        </p>

        <p className={styles.readout} aria-live="polite" data-testid="cost-readout">
          <span
            className={styles.swatch}
            data-maker={makerKey(current.maker)}
            data-premium={current.premium ? "true" : undefined}
            aria-hidden="true"
          />
          <span>
            <strong>{setupName(current)}</strong>
            {current.premium ? " (premium)" : ""}. Average score {current.score} out of 100. Test
            cost {current.cost}
            {current.tasks_run < chart.tasks
              ? `, for the ${current.tasks_run} of ${chart.tasks} tasks it ran`
              : ""}
            .
          </span>
        </p>

        <ul className={styles.key} aria-label="Dot and bar colours">
          {CHART_MAKERS.map((m) => (
            <li key={m.maker}>
              <span className={styles.swatch} data-maker={m.maker.toLowerCase()} aria-hidden="true" />
              {m.label}
            </li>
          ))}
          <li>
            <span className={styles.swatch} data-maker="other" aria-hidden="true" />
            Other makers
          </li>
          {premiumNames.length ? (
            <li>
              <span
                className={styles.swatch}
                data-maker="other"
                data-premium="true"
                aria-hidden="true"
              />
              Hollow dot: premium
            </li>
          ) : null}
        </ul>
      </InView>

      <div className={styles.list}>
        <div className={styles.listTools}>
          <h3 className={styles.listTitle} id="h-cost-list">
            Every set-up we tested
          </h3>
          <div className={styles.sort} role="group" aria-label="Sort the list">
            <span>Sort by</span>
            <button type="button" aria-pressed={sort === "score"} onClick={() => setSort("score")}>
              Score
            </button>
            <button type="button" aria-pressed={sort === "cost"} onClick={() => setSort("cost")}>
              Cost
            </button>
          </div>
        </div>
        <div className={styles.listHead} aria-hidden="true">
          <span>Set-up</span>
          <span>Total test cost at list price</span>
          <span className={styles.listScoreHead}>Average score</span>
        </div>
        <InView className={styles.bars}>
          <ol className={styles.listRows} aria-labelledby="h-cost-list" data-testid="cost-rows">
            {first.map(row)}
          </ol>
          {rest.length ? (
            <details className={styles.more}>
              <summary>
                Show the other {rest.length} set-ups
              </summary>
              <ol
                className={styles.listRows}
                aria-labelledby="h-cost-list"
                start={FIRST_ROWS + 1}
                data-testid="cost-rows-more"
              >
                {rest.map(row)}
              </ol>
            </details>
          ) : null}
        </InView>
        <p className={styles.chartNote}>
          Each bar shows the total cost of the tasks that set-up ran, using each company&apos;s
          published prices for developer access (API), converted at {pencePerDollar}p to the
          dollar. {shortRunsSentence(chart)}{" "}
          {premiumNames.length
            ? `Set-ups marked premium are ${listNames(premiumNames)}, which we show for their cost and leave out of our picks. `
            : ""}
          The score is the average of its {countWord(labCount)} lab scores, out of 100. Each
          completed test was run once, so small score differences may change on another run. App
          subscriptions are charged separately.
        </p>
      </div>
    </div>
  )
}
