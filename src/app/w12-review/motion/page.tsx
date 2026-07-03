import styles from "../review.module.css"

/**
 * Motion review (David's request to see the options in-browser). Each reel
 * plays that archetype's 2-3 entrance treatments back to back with a caption
 * baked in. The colours are fixed (the chosen mixed treatment); only the
 * entrance is open. David names one pick per archetype and I set them in the
 * MOTION map in remotion/src/explainer-content.ts, then re-render.
 */
const ARCHETYPES = [
  {
    key: "title",
    label: "Title / cover",
    src: "/explainer/motion/motion-title.mp4",
    variants: ["frame-draw", "mask-wipe", "settle"],
    fallback: "frame-draw",
    note: "How the drenched teal cover and the stacked headline arrive.",
  },
  {
    key: "statement",
    label: "Single statement",
    src: "/explainer/motion/motion-statement.mp4",
    variants: ["line-fade", "underline-draw", "crossfade"],
    fallback: "line-fade",
    note: "How the one big paper statement and its ochre accent resolve.",
  },
  {
    key: "feature",
    label: "Feature",
    src: "/explainer/motion/motion-feature.mp4",
    variants: ["stagger", "rule-rows", "settle"],
    fallback: "stagger",
    note: "How the list of real things you do enters, row by row.",
  },
  {
    key: "comparison",
    label: "Comparison / two-up",
    src: "/explainer/motion/motion-comparison.mp4",
    variants: ["divider-first", "slide-in", "sequential"],
    fallback: "divider-first",
    note: "How the most-courses-versus-GWTH columns build.",
  },
  {
    key: "dispatch",
    label: "CTA / dispatch",
    src: "/explainer/motion/motion-dispatch.mp4",
    variants: ["stagger", "button-draw", "settle"],
    fallback: "stagger",
    note: "How the teal beta dispatch, the prices, and the button land.",
  },
] as const

export default function W12MotionPage() {
  return (
    <main className={styles.page}>
      <p className={styles.eyebrow}>Decision 3 · motion</p>
      <h1 className={styles.h1}>
        Pick one <em>entrance</em> per slide.
      </h1>
      <p className={styles.lead}>
        Each reel plays that slide&rsquo;s entrance options back to back, with a
        caption telling you which is which. The highlighted chip is the current
        default. Watch, then tell me your pick per archetype in chat. The colour
        treatment is fixed; this is only about how things move in.
      </p>

      <div className={styles.motionGrid}>
        {ARCHETYPES.map((a) => (
          <article className={styles.motionCard} key={a.key}>
            <h3>{a.label}</h3>
            <div className={styles.variants}>
              {a.variants.map((v) => (
                <span
                  className={styles.variant}
                  key={v}
                  data-default={v === a.fallback ? "true" : undefined}
                >
                  {v}
                  {v === a.fallback ? " · default" : ""}
                </span>
              ))}
            </div>
            <div className={styles.stage}>
              <video
                src={a.src}
                controls
                loop
                muted
                playsInline
                preload="metadata"
              />
            </div>
            <p className={styles.hint}>{a.note}</p>
          </article>
        ))}
      </div>
    </main>
  )
}
