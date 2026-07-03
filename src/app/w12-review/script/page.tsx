import styles from "../review.module.css"

/**
 * Beat-by-beat script, transcribed from remotion/SCRIPT.md so David can read it
 * comfortably in the browser (his request). British English, no em dashes,
 * every fact drawn from the live homepage copy. Editing the real cut still
 * happens in remotion/src/explainer-content.ts; this page is for reading and
 * approving.
 */
const BEATS = [
  {
    n: 1,
    time: "0:00–0:07",
    template: "Title / cover — teal",
    onscreen:
      'GWTH.AI · “Stop watching AI change the world. Build.” · UK applied AI · 5 hours a week · 3 months',
    vo: "AI is changing how the world works. Most people are watching it happen. You do not have to.",
  },
  {
    n: 2,
    time: "0:07–0:18",
    template: "Single statement — paper",
    onscreen:
      "WHAT IT IS · A three month applied AI course for UK adults, in plain English.",
    vo: "GWTH is a three month applied AI course for adults in the UK. It starts in plain English, with no coding and no jargon to wade through first.",
  },
  {
    n: 3,
    time: "0:18–0:34",
    template: "Feature — paper",
    onscreen:
      "WHAT YOU DO · Real things, not theory · Build apps / Automate workflows / Research and analyse",
    vo: "In about five hours a week, you learn to do real things with AI. Build small apps. Automate the busywork. Research in minutes, not hours. And make sense of your own data, all in plain language.",
  },
  {
    n: 4,
    time: "0:34–0:46",
    template: "Comparison / two-up — paper",
    onscreen: "WHY IT IS DIFFERENT · Proof, not promises · Most courses vs GWTH",
    vo: "Most AI courses hand you slides and a certificate. GWTH is built the other way round. Every lesson and project leaves real work behind, proof you can actually show.",
  },
  {
    n: 5,
    time: "0:46–0:54",
    template: "Single statement — paper",
    onscreen:
      "THE PROMISE · If you can describe what you want, you can begin to build it.",
    vo: "Because the truth is simpler than it sounds. If you can describe what you want, you can begin to build it.",
  },
  {
    n: 6,
    time: "0:54–1:06",
    template: "CTA / dispatch — teal-deep",
    onscreen:
      "JOIN THE BETA · Start free. Join when the work is worth it. · £0 / £29 a month / £7.50 a month · Try a free lab · gwth.ai",
    vo: "We are opening GWTH to a small group of hand picked beta learners. Start free, with real labs and no card. Join when the work is worth it. GWTH dot A I.",
  },
]

/** VO chunks for the VV7B run / a live recording, one clean take at a time. */
const CHUNKS = [
  "AI is changing how the world works. Most people are watching it happen. You do not have to.",
  "GWTH is a three month applied AI course for adults in the UK. It starts in plain English, with no coding and no jargon to wade through first.",
  "In about five hours a week, you learn to do real things with AI. Build small apps. Automate the busywork. Research in minutes, not hours. And make sense of your own data, all in plain language.",
  "Most AI courses hand you slides and a certificate. GWTH is built the other way round. Every lesson and project leaves real work behind, proof you can actually show.",
  "Because the truth is simpler than it sounds. If you can describe what you want, you can begin to build it.",
  "We are opening GWTH to a small group of hand picked beta learners. Start free, with real labs and no card. Join when the work is worth it. GWTH dot A I.",
]

export default function W12ScriptPage() {
  return (
    <main className={styles.page}>
      <p className={styles.eyebrow}>Decision 1 + 2 · script and voice</p>
      <h1 className={styles.h1}>
        The explainer <em>script</em>.
      </h1>
      <p className={styles.lead}>
        Around 66 seconds at a natural pace. British English, no em dashes,
        written to be spoken aloud. Every fact is taken from the live homepage
        copy. Read it through, then approve it in chat or tell me the lines to
        change.
      </p>

      <div className={styles.callout}>
        <p>
          <strong>The one promise:</strong> if you can describe what you want,
          you can begin to build it. Everything else serves that line, and it is
          quoted verbatim from the live home page so the video and the page
          reinforce each other.
        </p>
        <p>
          <strong>Who it is for:</strong> hand-picked beta learners and UK adults
          who use AI but suspect there is more to it: reskillers, small-business
          owners, parents, and team leads.
        </p>
      </div>

      <h2 className={styles.sectionTitle}>Beat by beat</h2>
      <div className={styles.beats}>
        {BEATS.map((beat) => (
          <article className={styles.beat} key={beat.n}>
            <div className={styles.beatHead}>
              <span className={styles.beatNo}>
                Beat {beat.n} · {beat.template}
              </span>
              <span className={styles.mono}>{beat.time}</span>
            </div>
            <p className={styles.beatOnscreen}>{beat.onscreen}</p>
            <p className={styles.beatVo}>{beat.vo}</p>
          </article>
        ))}
      </div>

      <hr className={styles.rule} />

      <h2 className={styles.sectionTitle}>Voiceover, chunked for VV7B</h2>
      <p className={styles.lead}>
        The final voice is <strong>VV7B — your VibeVoice-7B voice</strong>. Each
        chunk below is generated as one clean take, quality-checked, then
        stitched to the beat timing. If you would rather record it yourself, the
        same chunks are the takes to read.
      </p>
      <ol className={styles.chunks}>
        {CHUNKS.map((chunk, index) => (
          <li key={index}>{chunk}</li>
        ))}
      </ol>

      <div className={styles.callout}>
        <p>
          <strong>Two quick options if you want them:</strong> to bring it under
          60 seconds, beat 3 can drop to two examples. &ldquo;busywork&rdquo; can
          become &ldquo;repetitive work&rdquo;. Say the word and I make the edit
          before the voice is cut.
        </p>
        <p>
          <strong>Pronunciation:</strong> tell me how GWTH should be said aloud
          — as &ldquo;growth&rdquo;, or spelled &ldquo;G. W. T. H.&rdquo; — and I
          set it for the VV7B take.
        </p>
      </div>
    </main>
  )
}
