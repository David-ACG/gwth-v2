import styles from "../review.module.css"
import {
  SCRIPT_OPTIONS,
  SOURCE_LABELS,
  estimateSeconds,
  type ScriptSource,
} from "./scripts-data"

const DURATIONS = [60, 90, 100, 120]
const SOURCES: ScriptSource[] = ["fable", "fable-gpt"]

/**
 * Script bake-off (David's request): 8 options to compare before we commit to
 * the VV7B voiceover. Two writers across four lengths. The colour treatment,
 * slides, motion and embed are already settled; this page is only about the
 * words. David reads and picks one (or asks to blend).
 */
export default function W12ScriptsPage() {
  const populated = SCRIPT_OPTIONS.length > 0

  return (
    <main className={styles.page}>
      <p className={styles.eyebrow}>Decision 1 · script bake-off</p>
      <h1 className={styles.h1}>
        Eight scripts, <em>one winner</em>.
      </h1>
      <p className={styles.lead}>
        You were right that 60 seconds is tight, so here are four lengths, each
        written two ways: by Claude Fable, and by Fable then refined with ChatGPT
        5.5 Extra High (your lesson-script workflow). Read across a row to compare
        the two writers at the same length. Tell me the one you want, or a blend,
        and I cut it in your VV7B voice.
      </p>

      {!populated ? (
        <div className={styles.callout}>
          <p>
            <strong>Generating.</strong> The eight scripts are being written now
            (Fable first, then the ChatGPT 5.5 Extra High refine). Refresh this
            page in a couple of minutes.
          </p>
        </div>
      ) : (
        DURATIONS.map((seconds) => {
          return (
            <section key={seconds} style={{ marginTop: "2.5rem" }}>
              <h2 className={styles.sectionTitle}>{seconds}-second target</h2>
              <div className={styles.scriptRow}>
                {SOURCES.map((source) => {
                  const opt = SCRIPT_OPTIONS.find(
                    (o) => o.seconds === seconds && o.source === source,
                  )
                  return (
                    <article className={styles.scriptCol} key={source}>
                      <div className={styles.scriptColHead}>
                        <span className={styles.beatNo}>
                          {SOURCE_LABELS[source]}
                        </span>
                        {opt ? (
                          <span className={styles.mono}>
                            {opt.words} words · ~{estimateSeconds(opt.words)}s
                          </span>
                        ) : (
                          <span className={styles.mono}>pending</span>
                        )}
                      </div>
                      {opt ? (
                        <div className={styles.scriptBody}>
                          {opt.text.split(/\n{2,}/).map((para, p) => (
                            <p key={p}>{para.trim()}</p>
                          ))}
                        </div>
                      ) : (
                        <p className={styles.hint}>Not generated.</p>
                      )}
                    </article>
                  )
                })}
              </div>
            </section>
          )
        })
      )}
    </main>
  )
}
