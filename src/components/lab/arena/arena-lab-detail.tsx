import Link from "next/link"
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
 * NO LAB VIDEO HAS BEEN RECORDED. The video panel therefore renders a plainly
 * labelled ready state with no play control at all; it becomes a real player
 * the moment a lab carries a `video` object, and never before. Both states are
 * driven by `labVideoState`, so no surface can disagree with another about
 * whether a video exists.
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
            Lab{lab.category ? `, ${lab.category.toLowerCase()}` : ""}
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
            <p>
              {first.modelLabel ?? first.modelId} versus{" "}
              {second.modelLabel ?? second.modelId}
            </p>
            <p>Tested on {formatTestedOn(lab.testedOn)}</p>
            <p>{isArchived ? "Archived" : "Live now"}</p>
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
        <div className={styles.introMedia}>
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
          ) : (
            <div
              className={styles.videoPanel}
              data-testid="lab-video-guide"
              data-video-state="planned"
            >
              {/* Deliberately not a player and deliberately not a black
                  rectangle with a triangle on it. A play control that cannot
                  play is the thing this panel exists to avoid. */}
              <h2 className={styles.videoTitle}>Video guide planned</h2>
              <p className={styles.videoNote}>
                Every lab is getting a short video of the task and both
                answers. This one has not been recorded yet. The written
                walkthrough below is the whole lab, and you can have it read
                aloud.
              </p>
            </div>
          )}

          <LabListen
            segments={listenSegments}
            covers="Reads the task, the questions to score by and the verdict."
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
              The same prompt went to both, word for word, on{" "}
              {formatTestedOn(lab.testedOn)}. Neither answer has been edited.
            </p>
          </details>

          <details className={styles.disclosure} data-testid="shared-prompt">
            <summary className={styles.disclosureSummary}>
              The shared prompt, word for word
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
            tidied-up version of it.
          </p>
          <div className={styles.outputsGrid}>
            {lab.outputs.map((output) => {
              const contestant = lab.matchup.find((m) => m.name === output.by)
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
                  <div className={styles.outputBody}>{output.verbatim}</div>
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
                  <span>Good looks like</span>
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
            <p className={styles.verdictCall}>{lab.verdict.callText}</p>
            <p className={styles.freshness}>
              <span>Freshness</span>
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
