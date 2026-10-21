import Link from "next/link"
import type { ModelLabData, ModelLabAnswerFile, ModelLabPick } from "@/lib/types"
import { rowForClient } from "@/lib/data/model-lab"
import {
  aboutCost,
  MODEL_LAB_HOW_WE_TEST,
  countWord,
  formatTestedRange,
  levelLabel,
} from "@/lib/model-lab-format"
import { renderAnswerMarkdown } from "@/lib/model-lab-markdown"
import { SetupRow } from "./setup-row"
import { WhichWouldYouUse, type ClientAnswerFile } from "./which-would-you-use"
import styles from "./model-lab.module.css"

/** Props for {@link ModelLabPage}. */
interface ModelLabPageProps {
  /** The lab, as the export wrote it. */
  lab: ModelLabData
}

/** The line used for a set-up's trap record on a pick card. */
function Basics({ basics, n }: { basics: number; n: number }) {
  if (basics === n) return <>Passed every trap</>
  return (
    <span className={styles.bad}>
      <span aria-hidden="true">✗ </span>Fell for {n - basics} of {n} traps
    </span>
  )
}

function PickCard({ label, pick }: { label: string; pick: ModelLabPick }) {
  return (
    <div className={styles.card} data-testid="lab-pick">
      <div className={styles.pickLabel}>{label}</div>
      <div className={styles.pickName}>{pick.name}</div>
      <div>{levelLabel(pick.level)}</div>
      <div className={styles.meta}>
        Scored {pick.score} out of 100 · {aboutCost(pick.cost)} a task ·{" "}
        <Basics basics={pick.basics} n={pick.n} />
      </div>
    </div>
  )
}

/** A markdown block written by us (the brief, the premium note), rendered like an answer. */
function Markdown({ text }: { text: string }) {
  return (
    <div
      className={`lesson-prose ${styles.md}`}
      dangerouslySetInnerHTML={{ __html: renderAnswerMarkdown(text) }}
    />
  )
}

function toClientFile(f: ModelLabAnswerFile): ClientAnswerFile {
  if (f.kind === "md") return { kind: "md", name: f.name, html: renderAnswerMarkdown(f.text) }
  if (f.kind === "shot") {
    return { kind: "shot", name: f.name, src: f.src, href: f.try, label: f.try_label }
  }
  return { kind: f.kind, name: f.name, src: f.src }
}

/** The Fable sentence for a lab where Fable did not run every task. */
const FABLE_EVERY_TASK = "We tested Claude Fable on every task."
const FABLE_NOT_DATA05 =
  "We tested Claude Fable on every task in this lab except the flipchart photos, which we added later."

/**
 * One Model Lab results page (/labs/<superpower>), ported from the preview
 * David chose on 2026-10-21 (model-bakeoff lab/site/template.html).
 *
 * Sections: the six-lab menu, the hero, Our picks (four cards and how they
 * are chosen), "Which would you use?" (the main task's brief and four blind
 * answers, a client component), "Every set-up we tested" (one row per set-up
 * with its marks on each task and an expandable answer), the premium models
 * (cost only, never ranked), and How we test.
 *
 * Everything static is rendered here on the server, including every
 * markdown answer shown in the blind comparison (lib/model-lab-markdown.ts);
 * only the pick-and-reveal and the row toggles run in the browser.
 */
export function ModelLabPage({ lab }: ModelLabPageProps) {
  const n = lab.tasks.length
  const tested = formatTestedRange(lab.tested_from, lab.tested_to)
  const answers = lab.answers.map((a) => ({
    letter: a.letter,
    name: a.name,
    level: a.level,
    score: a.score,
    basics: a.basics,
    cost: a.cost,
    files: a.files.map(toClientFile),
  }))
  const colSpan = n + 7
  const premiumBefore = lab.fable_all
    ? lab.premium_note.before
    : lab.premium_note.before.replace(FABLE_EVERY_TASK, FABLE_NOT_DATA05)
  const anyDash = lab.table.some((r) => r.tasks.some((x) => x === null))

  return (
    <div className={styles.shell} data-section="model-lab" data-lab={lab.sp}>
      <div className={styles.page}>
        <nav className={styles.menu} aria-label="The six labs">
          {lab.nav.map((item) => (
            <Link
              key={item.id}
              href={`/labs/${item.id}`}
              className={styles.menuLink}
              aria-current={item.id === lab.sp ? "page" : undefined}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <header className={styles.hero}>
          <h1>{lab.headline}</h1>
          <p>
            We tested {lab.count} AI set-ups on {countWord(n)} real {lab.sp_name.toLowerCase()}{" "}
            tasks. A set-up is a model with a particular thinking setting. No AI company pays us,
            and you can read every answer to the main task below.
          </p>
          <p className={styles.meta}>Tested {tested}</p>
        </header>

        <section className={styles.section} aria-labelledby="h-picks">
          <h2 id="h-picks">Our picks</h2>
          <div className={styles.picks}>
            <PickCard label="Best" pick={lab.best} />
            <PickCard label="Best value" pick={lab.value} />
            <div className={styles.card} data-testid="lab-pick">
              <div className={styles.pickLabel}>Daily driver in an everyday app</div>
              {lab.app ? (
                <>
                  <div className={styles.pickName}>{lab.app.name}</div>
                  <div>{levelLabel(lab.app.level)}</div>
                  <div className={styles.meta}>
                    Scored {lab.app.score} out of 100 · in {lab.app.plan.plan},{" "}
                    {lab.app.plan.price}
                  </div>
                </>
              ) : (
                <div className={`${styles.pickName} ${styles.pickNone}`}>None yet</div>
              )}
            </div>
            <div className={styles.card} data-testid="lab-pick">
              <div className={styles.pickLabel}>Best for free</div>
              {lab.free ? (
                <>
                  <div className={styles.pickName}>{lab.free.name}</div>
                  <div>{levelLabel(lab.free.level)}</div>
                  <div className={styles.meta}>
                    Scored {lab.free.score} out of 100 · in {lab.free.plan.plan}.{" "}
                    {lab.free.plan.allowance}
                  </div>
                </>
              ) : (
                <div className={`${styles.pickName} ${styles.pickNone}`}>None yet</div>
              )}
            </div>
          </div>
          <p className={styles.note}>
            Best value is the set-up with the lowest test cost that scored at least 90% of the best
            score and passed every trap. The daily driver uses the same rules, but the set-up must be
            available in an app costing £20 a month or less. These comparisons use our test costs;
            app subscriptions have their own prices and usage limits. Best for free is the
            highest-scoring set-up available in a free app that passed every trap. We checked what
            each plan includes between 6 and 8 October 2026.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="h-try">
          <h2 id="h-try">{lab.ask}</h2>
          <p>
            {lab.sig_plain} Here are four real answers, with the names hidden. Read them, choose
            the one you would use, then see who wrote it and how we marked it.
          </p>
          <details className={styles.details}>
            <summary>Read the brief every model was given</summary>
            <div className={`${styles.card} ${styles.briefBody}`}>
              <Markdown text={lab.sig_task} />
            </div>
          </details>
          <WhichWouldYouUse answers={answers} />
        </section>

        <section className={styles.section} aria-labelledby="h-all">
          <h2 id="h-all">Every set-up we tested</h2>
          <p>
            The same models appear more than once because each can be set to think for longer,
            which costs more. The score is the average of the {countWord(n)} tasks.
          </p>
          <div
            className={styles.tableWrap}
            tabIndex={0}
            role="region"
            aria-label="Every set-up we tested, with its marks"
          >
            <table className={styles.board}>
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Model and setting</th>
                  <th scope="col" className={styles.num}>
                    Score
                  </th>
                  {lab.tasks.map((t) => (
                    <th
                      scope="col"
                      key={t.id}
                      className={`${styles.num} ${t.signature ? styles.sig : ""}`}
                    >
                      {t.title}
                      {t.signature ? (
                        <>
                          <br />
                          (main task)
                        </>
                      ) : null}
                    </th>
                  ))}
                  <th scope="col">Traps missed</th>
                  <th scope="col" className={styles.num}>
                    Cost a task
                  </th>
                  <th scope="col">Where you can use it</th>
                  <th scope="col">
                    <span className="sr-only">Answer to the main task</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {lab.table.map((r) => {
                  const row = rowForClient(r)
                  return (
                    <SetupRow
                      key={r.setup}
                      slug={lab.sp}
                      setup={r.setup}
                      name={`${r.name}, ${levelLabel(r.level)}`}
                      files={row.sig_files}
                      colSpan={colSpan}
                    >
                      <td>{r.rank}</td>
                      <td className={styles.name}>
                        {r.name}
                        <small>
                          {levelLabel(r.level)} · {r.maker}
                        </small>
                      </td>
                      <td className={`${styles.num} ${styles.score}`}>{r.score}</td>
                      {r.tasks.map((s, j) => (
                        <td
                          key={lab.tasks[j]?.id ?? j}
                          className={`${styles.num} ${lab.tasks[j]?.signature ? styles.sig : ""}`}
                        >
                          {s ?? "-"}
                        </td>
                      ))}
                      <td className={styles.nowrap}>
                        {r.basics === r.n ? (
                          <>
                            <span aria-hidden="true">✓ </span>None
                          </>
                        ) : (
                          <span className={styles.bad}>
                            <span aria-hidden="true">✗ </span>
                            {r.n - r.basics} missed
                          </span>
                        )}
                      </td>
                      <td className={`${styles.num} ${styles.nowrap}`}>{r.cost}</td>
                      <td className={styles.where}>{r.where}</td>
                    </SetupRow>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className={styles.note}>
            &quot;Answer&quot; shows that set-up&apos;s answer to the main task above.
            {anyDash
              ? " A dash means that task has not been marked yet; until it is, the score averages the tasks marked so far."
              : ""}
          </p>
        </section>

        {lab.premium.length ? (
          <section
            className={`${styles.section} ${styles.premium}`}
            aria-labelledby="h-premium"
            data-testid="lab-premium"
          >
            <h2 id="h-premium">{lab.premium_note.title}</h2>
            <Markdown text={premiumBefore} />
            <div className={styles.tableWrap}>
              <table className={styles.board}>
                <thead>
                  <tr>
                    <th scope="col">Model and setting</th>
                    <th scope="col" className={styles.num}>
                      Score
                    </th>
                    <th scope="col" className={styles.num}>
                      Cost a task
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lab.premium.map((r) => (
                    <tr key={`${r.name}-${r.level}`}>
                      <td className={styles.name}>
                        {r.name}
                        <small>
                          {levelLabel(r.level)} · {r.maker} · premium
                        </small>
                      </td>
                      <td className={`${styles.num} ${styles.score}`}>{r.score}</td>
                      <td className={styles.num}>{r.cost}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className={styles.name}>
                      {lab.best.name}
                      <small>
                        {levelLabel(lab.best.level)} · {lab.best.maker} · our best pick for this
                        lab
                      </small>
                    </td>
                    <td className={`${styles.num} ${styles.score}`}>{lab.best.score}</td>
                    <td className={styles.num}>{lab.best.cost}</td>
                  </tr>
                  {lab.premium_ref ? (
                    <tr>
                      <td className={styles.name}>
                        {lab.premium_ref.name}
                        <small>
                          {levelLabel(lab.premium_ref.level)} · {lab.premium_ref.maker} · OpenAI&apos;s
                          usual top model
                        </small>
                      </td>
                      <td className={`${styles.num} ${styles.score}`}>{lab.premium_ref.score}</td>
                      <td className={styles.num}>{lab.premium_ref.cost}</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            {lab.premium_note.astra ? <p>{lab.premium_note.astra}</p> : null}
            {lab.premium_main.length ? (
              <div className={styles.tableWrap} data-testid="lab-premium-main">
                <table className={styles.board}>
                  <thead>
                    <tr>
                      <th scope="col">The main task only: {lab.sig_title}</th>
                      <th scope="col" className={styles.num}>
                        Cost of this task
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lab.premium_main.map((r) => (
                      <tr key={`${r.name}-${r.level}`}>
                        <td className={styles.name}>
                          {r.name}
                          <small>
                            {levelLabel(r.level)} · {r.maker}
                            {r.premium ? " · premium" : ""}
                          </small>
                        </td>
                        <td className={styles.num}>{r.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            <Markdown text={lab.premium_note.after} />
            {lab.premium_note.sources ? (
              <p className={styles.meta}>{lab.premium_note.sources}</p>
            ) : null}
          </section>
        ) : null}

        <section className={styles.section} aria-labelledby="h-how">
          <h2 id="h-how">How we test</h2>
          <ul className={styles.how}>
            {MODEL_LAB_HOW_WE_TEST.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>

        <p className={styles.footnote}>
          Tested {tested}. Each set-up did each task once. Costs are what one task would cost at
          each company&apos;s published API prices, converted at 75p to the dollar.
        </p>
      </div>
    </div>
  )
}
