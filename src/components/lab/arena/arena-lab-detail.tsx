import Link from "next/link"
import type { ReactNode } from "react"
import type { ModelArenaLab } from "@/lib/types"
import { formatTestedOn } from "@/lib/data/model-arena"
import { LabListen } from "./lab-listen"
import { labVideoState } from "./lab-preview"
import styles from "./arena-detail.module.css"

/**
 * Props for {@link ArenaLabDetail}.
 */
interface ArenaLabDetailProps {
  /** The Model Arena lab to render head to head. */
  lab: ModelArenaLab
}

/** The sections a reader can jump to, in the order they appear. */
const JUMP: ReadonlyArray<{ id: string; label: string }> = [
  { id: "the-task", label: "The task" },
  { id: "the-answers", label: "The answers" },
  { id: "score-it", label: "Score it yourself" },
  { id: "the-verdict", label: "The verdict" },
]

/**
 * Answers longer than this many characters open with their first few
 * paragraphs and keep the rest behind a "Show the full answer" disclosure. The
 * weekly-chore lab printed about six hundred lines of code open, so a phone
 * reader scrolled some fifteen screens before reaching the scoring questions
 * (launch readiness review, 2026-10-20). Every other lab's answers are shorter
 * than this and stay fully open.
 */
export const LONG_ANSWER_CHARS = 6000

/** Roughly how much of a long answer shows before the disclosure. */
const OPENING_CHARS = 900

/**
 * Splits a long answer at the first paragraph break after
 * {@link OPENING_CHARS}. The two parts joined are exactly the original text,
 * so nothing a tool wrote is lost or changed; only where it folds.
 */
export function splitLongAnswer(text: string): [string, string] {
  if (text.length <= LONG_ANSWER_CHARS) return [text, ""]
  const at = text.indexOf("\n\n", OPENING_CHARS)
  if (at === -1) return [text, ""]
  return [text.slice(0, at), text.slice(at)]
}

/** A web address in a tool's answer, up to whitespace or a closing bracket. */
const URL_PATTERN = /https?:\/\/[^\s<>"'()[\]]+/g

/** The fence a markdown code block opens and closes with. */
const FENCE = "```"

/**
 * Renders a tool's answer with every web address made clickable. The text is
 * unchanged, character for character: an address stays exactly as the tool
 * wrote it and simply becomes a link, so a reader can do what the cite-sources
 * lab asks and click every source (launch readiness review, 2026-10-20).
 * Trailing full stops and commas are left outside the link.
 *
 * Addresses inside a ``` code block are left as text: there they are examples
 * of what to copy (a made-up spreadsheet address, say), not sources.
 * `startsInCode` says whether the text begins inside such a block, for the
 * second half of an answer split by {@link splitLongAnswer}.
 */
export function withLinks(text: string, startsInCode = false): ReactNode[] {
  const nodes: ReactNode[] = []
  const parts = text.split(FENCE)
  parts.forEach((part, index) => {
    if (index > 0) nodes.push(FENCE)
    const inCode = startsInCode ? index % 2 === 0 : index % 2 === 1
    if (inCode) {
      nodes.push(part)
      return
    }
    let last = 0
    for (const match of part.matchAll(URL_PATTERN)) {
      const start = match.index ?? 0
      const url = match[0].replace(/[.,;:!?]+$/, "")
      if (start > last) nodes.push(part.slice(last, start))
      nodes.push(
        <a
          key={`${index}-${start}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {url}
        </a>
      )
      last = start + url.length
    }
    if (last < part.length) nodes.push(part.slice(last))
  })
  return nodes
}

/** True when a text leaves a ``` code block open at its end. */
function endsInCode(text: string): boolean {
  return (text.split(FENCE).length - 1) % 2 === 1
}

/**
 * The category as the kicker shows it: lower case in the sentence, except an
 * abbreviation such as HR, which keeps its capitals ("Lab, HR", not "Lab, hr").
 */
function kickerCategory(category: string): string {
  return category === category.toUpperCase() ? category : category.toLowerCase()
}

/**
 * Head-to-head lab detail, PAPER-FIRST register (bible paper-first-lab-page).
 *
 * Rebuilt for bead gwth-launch-88z.32.22 from David's annotation
 * a-20260914-205206-82935a, which was boxed around this page's opening: "I
 * think all these labs need a really easy to follow video, and then maybe this
 * text can be below it. Currently, it looks too complicated and too much text,
 * which is difficult to read, and there's not even a voice reader."
 *
 * What the opening now does, in order: names the task area, the title, and the
 * lab in two sentences; says in one line what the reader will decide; offers
 * the two ways through it, a video guide and a read-aloud control; then a jump
 * list. What it no longer does: open with two paragraphs of model provenance
 * before the reader has been told what the lab is. That provenance is not
 * deleted, it is one disclosure below ("How each tool was run"), and the
 * shared prompt, which is a screenful of raw CSV, is behind its own disclosure
 * rather than being the third thing on the page.
 *
 * Only the messy-spreadsheet lab has a recorded video. The video panel is a
 * real player where a lab carries a `video` object, and is left out entirely
 * everywhere else: the "Video guide planned" panel that stood in its place was
 * a promise of unfinished work and went on 2026-10-20 (launch readiness
 * review). `labVideoState` decides, so no surface can disagree with another
 * about whether a video exists.
 *
 * The labs are not re-run for the launch, so the line under the headline says
 * when each was tested, with which models, and that both tools have newer
 * versions since (launch readiness review, 2026-10-20).
 *
 * Everything below the opening is unchanged in substance: the brief, the
 * shared prompt, both outputs verbatim, the rubric, the dated verdict and the
 * try-it steps. Outputs are still shown exactly as generated, including each
 * tool's own markdown markers, because judging that raw text is the lab.
 */
export function ArenaLabDetail({ lab }: ArenaLabDetailProps) {
  const isArchived = lab.status === "archived"
  const [first, second] = lab.matchup
  const videoState = labVideoState(lab)

  /*
   * What the read-aloud control reads: the lab's own walkthrough. The shared
   * prompt and the two raw outputs are excluded on purpose. They are pages of
   * CSV and markdown markers, and a voice reading "hash hash Registered Nurse
   * en dash" for six minutes would be an accessibility box ticked and a
   * listener lost.
   */
  const listenSegments = [
    lab.title,
    lab.summary ?? "",
    `The task. ${lab.brief}`,
    `Score it yourself. ${lab.rubric.map((item) => item.criterion).join(" ")}`,
    `The verdict. ${lab.verdict.winner ? `${lab.verdict.winner}. ` : ""}${
      lab.verdict.callText
    }`,
    lab.verdict.freshnessNote,
  ].filter(Boolean)

  return (
    <div className={styles.shell} data-section="arena-lab-detail">
      <header className={styles.matchup} data-section="intro">
        <div className={styles.page}>
          <p className={styles.kicker}>
            Lab{lab.category ? `, ${kickerCategory(lab.category)}` : ""}
          </p>
          <h1 className={styles.matchupTitle}>{lab.title}</h1>

          {lab.summary ? (
            <p className={styles.standfirst}>{lab.summary}</p>
          ) : null}

          {lab.preview?.outcome ? (
            <p className={styles.outcome} data-testid="lab-outcome">
              <span>What you decide</span>
              {lab.preview.outcome}
            </p>
          ) : null}

          <div className={styles.matchupFoot}>
            <p className={styles.testedNote} data-testid="lab-tested-note">
              Tested on {formatTestedOn(lab.testedOn)} with{" "}
              {first.modelLabel ?? first.modelId} and{" "}
              {second.modelLabel ?? second.modelId}. AI tools change over time, so the answers you get today may differ.
            </p>
          </div>
        </div>
      </header>

      <div className={styles.page}>
        {/*
          The two ways through the lab sit on the page ground rather than
          inside the quiet band above: a --v-line panel boundary measures
          2.84 : 1 against --v-quiet and 3.02 : 1 against --v-bg, and the bar
          is 3 : 1 (bible boundary-contrast-check).
        */}
        <div
          className={`${styles.introMedia} ${
            videoState === "available" ? "" : styles.introMediaSingle
          }`}
        >
          {videoState === "available" && lab.video ? (
            <div
              className={styles.videoPanel}
              data-testid="lab-video-guide"
              data-video-state="available"
            >
              {/* A captions track is rendered whenever the lab carries one,
                  and a lab that ships a video without captions is a content
                  defect to fix in the JSON, not to paper over here. */}
              <video
                className={styles.video}
                controls
                preload="metadata"
                poster={lab.video.poster}
              >
                <source src={lab.video.src} />
                {lab.video.captions ? (
                  <track
                    kind="captions"
                    src={lab.video.captions}
                    srcLang="en"
                    label="English"
                    default
                  />
                ) : null}
                Your browser cannot play this video. The written walkthrough
                below covers the same ground.
              </video>
              <p className={styles.videoNote}>
                Video guide
                {lab.video.durationLabel ? `, ${lab.video.durationLabel}` : ""}
                . The written walkthrough below covers the same ground.
              </p>
            </div>
          ) : null}

          <LabListen
            segments={listenSegments}
            covers="Reads the task, the scoring questions and the verdict aloud."
          />
        </div>

        <nav className={styles.jump} aria-label="Sections of this lab">
          {JUMP.map((item) => (
            <a key={item.id} href={`#${item.id}`} className={styles.jumpLink}>
              {item.label}
            </a>
          ))}
        </nav>

        {isArchived ? (
          <div className={styles.archivedBanner} data-testid="archived-banner">
            <span className={styles.badge}>Archived</span>
            <p>
              This matchup has been superseded by a newer test. It is kept as a
              record of how the tools compared on {formatTestedOn(lab.testedOn)},
              which is useful once newer models arrive.
            </p>
          </div>
        ) : null}

        <section className={styles.section} data-section="brief" id="the-task">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>The task</h2>
          </div>
          <p className={styles.brief}>{lab.brief}</p>

          {/*
            The provenance David was shown first is now one click below the
            thing it is provenance FOR. Nothing is lost: both exact model ids
            and exactly how each was run are still here, verbatim, and the
            disclosure is open to a keyboard and to find-in-page.
          */}
          <details className={styles.disclosure} data-testid="how-run">
            <summary className={styles.disclosureSummary}>
              How each tool was run
            </summary>
            <div className={styles.contestants}>
              <div className={styles.contestant}>
                <p className={styles.contestantName}>{first.name}</p>
                <p className={styles.contestantModel}>
                  {first.modelLabel ?? first.modelId}
                </p>
                <p className={styles.contestantRun}>{first.howRun}</p>
              </div>
              <div className={styles.contestant}>
                <p className={styles.contestantName}>{second.name}</p>
                <p className={styles.contestantModel}>
                  {second.modelLabel ?? second.modelId}
                </p>
                <p className={styles.contestantRun}>{second.howRun}</p>
              </div>
            </div>
            <p className={styles.disclosureNote}>
              The same instructions went to both, word for word, on{" "}
              {formatTestedOn(lab.testedOn)}. Neither answer has been edited.
            </p>
          </details>

          <details className={styles.disclosure} data-testid="shared-prompt">
            <summary className={styles.disclosureSummary}>
              The instructions given to both tools, word for word
            </summary>
            <pre className={styles.promptBlock}>{lab.prompt}</pre>
          </details>
        </section>

        <section
          className={styles.section}
          data-section="outputs"
          id="the-answers"
        >
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>The answers</h2>
          </div>
          {/*
            The outputs are printed exactly as returned, so ChatGPT's markdown
            headings and bold markers show as raw characters beside Claude's
            plain prose. Said out loud that reads as a difference between the
            tools; left unsaid it reads as a broken page.
          */}
          <p className={styles.sectionNote}>
            Each answer is printed exactly as the tool returned it, formatting
            marks and all, so you are judging the real output rather than a
            tidied-up version of it. Marks such as ## and ** are formatting
            codes that a chat window would normally show as headings and bold
            text. Web addresses in the answers are links you can open.
          </p>
          <div className={styles.outputsGrid}>
            {lab.outputs.map((output) => {
              const contestant = lab.matchup.find((m) => m.name === output.by)
              const [opening, rest] = splitLongAnswer(output.verbatim)
              return (
                <article
                  className={styles.outputCol}
                  data-testid="arena-output"
                  key={output.by}
                >
                  <header className={styles.outputHead}>
                    <span className={styles.outputName}>{output.by}</span>
                    <span className={styles.outputModel}>
                      {contestant?.modelLabel ?? contestant?.modelId}
                    </span>
                  </header>
                  <div className={styles.outputBody}>{withLinks(opening)}</div>
                  {rest ? (
                    <details
                      className={styles.outputMore}
                      data-testid="answer-more"
                    >
                      <summary className={styles.disclosureSummary}>
                        Show the full answer
                      </summary>
                      <div className={styles.outputBody}>{withLinks(rest, endsInCode(opening))}</div>
                    </details>
                  ) : null}
                </article>
              )
            })}
          </div>
        </section>

        <section className={styles.section} data-section="rubric" id="score-it">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Score it yourself</h2>
          </div>
          <ol className={styles.rubricList}>
            {lab.rubric.map((item) => (
              <li className={styles.rubricItem} key={item.criterion}>
                <p className={styles.rubricQ}>{item.criterion}</p>
                <p className={styles.rubricGood}>
                  <span>What a good answer includes:</span>
                  {item.goodLooksLike}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section
          className={styles.section}
          data-section="verdict"
          id="the-verdict"
        >
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>The verdict</h2>
          </div>
          <div className={styles.verdictPanel}>
            {lab.verdict.winner ? (
              <p className={styles.verdictWinner}>{lab.verdict.winner}</p>
            ) : null}
            {/* The verdict is authored as short paragraphs separated by a
                blank line, so it can be scanned on a phone. */}
            {lab.verdict.callText.split(/\n\n+/).map((paragraph, index) => (
              <p className={styles.verdictCall} key={index}>
                {paragraph}
              </p>
            ))}
            <p className={styles.freshness}>
              <span>When this was tested</span>
              {lab.verdict.freshnessNote}
            </p>
          </div>
        </section>

        <section className={styles.section} data-section="try-it" id="try-it">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Try it yourself</h2>
          </div>
          <ol className={styles.tryList}>
            {lab.tryItYourself.map((step, index) => (
              <li className={styles.tryItem} key={index}>
                {step}
              </li>
            ))}
          </ol>
        </section>

        <div className={styles.footRow}>
          <Link href="/labs" className={styles.buttonOutline}>
            Back to all labs
          </Link>
          <Link href="/pricing" className={styles.buttonSolid}>
            See the course
          </Link>
        </div>
      </div>
    </div>
  )
}
