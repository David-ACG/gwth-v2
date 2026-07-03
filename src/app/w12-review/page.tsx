import Link from "next/link"
import styles from "./review.module.css"

/**
 * W12 review hub. Orients David and links to the three decisions he asked to
 * see in-browser: the script, the motion options, and the embed demos. Shows
 * the whole draft cut (silent — the final voice is generated in VV7B once the
 * script is locked) so the pacing and register are visible end to end.
 */
export default function W12ReviewHub() {
  return (
    <main className={styles.page}>
      <p className={styles.eyebrow}>The 60-second tour</p>
      <h1 className={styles.h1}>
        Your call on <em>four things</em>.
      </h1>
      <p className={styles.lead}>
        The explainer is built. Everything below is ready for your eye, not
        started from scratch. Watch the whole draft first, then use the three
        pages to settle the script, the motion, and where the video sits on the
        home page.
      </p>

      <figure className={styles.plate}>
        <div className={styles.stage}>
          <video
            src="/explainer/explainer-silent.mp4"
            poster="/explainer/poster.png"
            controls
            playsInline
            preload="metadata"
          />
        </div>
      </figure>

      <div className={styles.callout}>
        <p>
          <strong>Voice:</strong> this draft is silent on purpose. The final
          voiceover will be generated in <strong>VV7B (your VibeVoice-7B
          voice)</strong>, not F5-TTS, once you approve the script. Nothing you
          hear here is the final take.
        </p>
      </div>

      <div className={styles.cards}>
        <Link href="/w12-review/scripts" className={styles.navCard}>
          <p className={styles.mono}>Decision 1 + 2</p>
          <h3>Script bake-off</h3>
          <p>
            Eight options: 60 / 90 / 100 / 120s, each by Claude Fable and by
            Fable refined with ChatGPT 5.5 Extra High. Pick one, then VV7B.
          </p>
        </Link>
        <Link href="/w12-review/motion" className={styles.navCard}>
          <p className={styles.mono}>Decision 3</p>
          <h3>Motion</h3>
          <p>
            Watch each archetype&rsquo;s entrance options and pick one per
            slide. Colours are fixed; only motion is open.
          </p>
        </Link>
        <Link
          href="/w12-embed-demo?at=after-hero&chrome=framed"
          className={styles.navCard}
        >
          <p className={styles.mono}>Decision 4</p>
          <h3>Embed demos</h3>
          <p>
            See the video placed on the real home page in each position and
            chrome. Switch options from the bar at the bottom.
          </p>
        </Link>
      </div>

      <hr className={styles.rule} />
      <p className={styles.lead} style={{ marginBottom: 0 }}>
        When you have decided, tell me in chat: script approved (or your edits),
        your motion pick per archetype, and the embed placement + chrome. I then
        generate the VV7B voiceover, re-render, wire the chosen embed into the
        live home, and delete this review area.
      </p>
    </main>
  )
}
