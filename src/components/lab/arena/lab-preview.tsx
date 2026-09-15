import Image from "next/image"
import type { ArenaSpecimen, ModelArenaLab } from "@/lib/types"
import styles from "./lab-preview.module.css"

/**
 * Whether a lab has a REAL playable video guide, or one that is only planned.
 *
 * The single place the distinction is decided. David asked for a video per lab
 * and a thumbnail from it on the index (annotation a-20260914-205407-b3dbb2);
 * none of the four live labs has been recorded yet, so every surface has to be
 * able to say "planned" without ever implying "playable". Presence of
 * `lab.video` is the only evidence accepted: no slug convention, no poster
 * guess, no "coming soon" that renders a play triangle.
 */
export function labVideoState(lab: ModelArenaLab): "available" | "planned" {
  return lab.video?.src ? "available" : "planned"
}

/**
 * The lab title with its own matchup suffix removed, e.g. "Make sense of a
 * messy spreadsheet: Claude vs ChatGPT" becomes "Make sense of a messy
 * spreadsheet" on a card that already prints "Claude vs ChatGPT" underneath.
 *
 * Falls back to the full title whenever the suffix is not exactly the matchup,
 * so an unusually titled lab is never silently truncated.
 */
export function shortLabTitle(lab: ModelArenaLab): string {
  const suffix = `: ${lab.matchup[0].name} vs ${lab.matchup[1].name}`
  return lab.title.endsWith(suffix)
    ? lab.title.slice(0, -suffix.length)
    : lab.title
}

/** Props for {@link LabPreview}. */
interface LabPreviewProps {
  /** The lab being previewed. */
  lab: ModelArenaLab
  /** Marks the panel decorative when the surrounding link already names it. */
  decorative?: boolean
}

/**
 * The glanceable preview panel for a lab, paper-first register.
 *
 * Three states, and which one renders is a fact about the data, never a guess:
 *
 * 1. a REAL video guide exists, so its own poster frame is the thumbnail;
 * 2. no video but an authored `preview.specimen`, so a few lines of the lab's
 *    OWN material are set in type: the April export's messy rows for the
 *    spreadsheet lab, the three figures for the research lab. Nothing here is
 *    an illustration of the lab, it is a quotation from it;
 * 3. neither, so the panel is omitted entirely rather than filled with a
 *    placeholder that promises something.
 *
 * Drawn in CSS from the `--v-*` tokens, so it costs no image request, stays
 * sharp at any width, and inverts correctly in dark mode. There is deliberately
 * no play control on this panel: a card links to the lab page, and a play
 * triangle that navigates instead of playing is the exact dishonesty the
 * annotation was about.
 */
export function LabPreview({ lab, decorative = true }: LabPreviewProps) {
  const video = lab.video
  const preview = lab.preview

  if (video?.poster) {
    return (
      <div
        className={`${styles.panel} ${styles.panelVideo}`}
        data-testid="lab-preview"
        data-preview="video"
      >
        <Image
          src={video.poster}
          alt={decorative ? "" : `Still from the video guide for ${lab.title}`}
          className={styles.poster}
          fill
          sizes="(min-width: 64rem) 22rem, (min-width: 40rem) 45vw, 90vw"
        />
      </div>
    )
  }

  if (!preview) return null

  return (
    <div
      className={styles.panel}
      data-testid="lab-preview"
      data-preview="specimen"
      aria-hidden={decorative ? "true" : undefined}
    >
      <Specimen specimen={preview.specimen} />
    </div>
  )
}

/** Renders one specimen, either a few spreadsheet rows or label/value pairs. */
function Specimen({ specimen }: { specimen: ArenaSpecimen }) {
  if (specimen.kind === "grid") {
    return (
      <div className={styles.specimen}>
        <div className={styles.grid} data-testid="lab-specimen-grid">
          <div className={styles.gridRow} data-head="true">
            {specimen.columns.map((column) => (
              <span className={styles.gridHead} key={column}>
                {column}
              </span>
            ))}
          </div>
          {specimen.rows.map((row) => (
            <div className={styles.gridRow} key={row.cells.join("|")}>
              {row.cells.map((cell, index) => (
                <span className={styles.gridCell} key={index}>
                  {cell}
                </span>
              ))}
              {row.note ? (
                <span className={styles.gridNote}>
                  {/* The glyph reinforces; the words carry the meaning, because
                      a mark alone would be a signal nobody can read out
                      (bible tint-is-never-the-only-signal). */}
                  <span aria-hidden="true">{"⚠"}</span>
                  {row.note}
                </span>
              ) : null}
            </div>
          ))}
        </div>
        <p className={styles.caption}>{specimen.caption}</p>
      </div>
    )
  }

  return (
    <div className={styles.specimen}>
      <dl className={styles.pairs} data-testid="lab-specimen-pairs">
        {specimen.items.map((item) => (
          <div className={styles.pair} key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
      <p className={styles.caption}>{specimen.caption}</p>
    </div>
  )
}
