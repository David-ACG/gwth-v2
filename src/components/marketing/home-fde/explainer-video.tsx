"use client"

import { useState } from "react"
import Image from "next/image"
import styles from "./explainer-video.module.css"

/** Props for the homepage explainer embed. All content is supplied by the caller. */
export interface ExplainerVideoProps {
  /** Web-optimised MP4 source (served from /public). */
  src: string
  /** Poster frame shown before play (served from /public). */
  poster: string
  /** WebVTT captions track (served from /public). */
  captionsSrc: string
  /** Mono kicker above the frame (functional label). */
  kicker?: string
  /** Short serif line beside the player (optional). */
  heading?: string
  /** Accessible label / play-button copy. */
  label?: string
  /** Player chrome: framed (hairline + mono caption) or bare (edge to edge). */
  chrome?: "framed" | "bare"
}

/**
 * FDE-register video embed for the homepage explainer.
 *
 * Click-to-play poster (no autoplay, so it respects reduced-motion and data),
 * square corners, a single hairline border, a functional mono caption, and a
 * captions `<track>` for accessibility. Colours come from the scoped FDE token
 * block in the CSS module, so it follows light/dark with the rest of the page.
 *
 * Drop it into `home-fde.tsx` at the placement David picks (see W12 DECISIONS).
 * It does not change any existing section; it is a self-contained block.
 */
export function ExplainerVideo({
  src,
  poster,
  captionsSrc,
  kicker = "Watch",
  heading,
  label = "Play the 60-second tour",
  chrome = "framed",
}: ExplainerVideoProps) {
  const [playing, setPlaying] = useState(false)

  return (
    <section className={styles.shell} data-section="explainer">
      <div className={styles.page}>
        {(kicker || heading) && (
          <div className={styles.head}>
            {heading && <h2 className={styles.title}>{heading}</h2>}
            {kicker && <p className={styles.mono}>{kicker}</p>}
          </div>
        )}

        <figure
          className={`${styles.frame} ${chrome === "bare" ? styles.bare : ""}`}
        >
          <div className={styles.stage}>
            {playing ? (
              <video
                className={styles.video}
                src={src}
                poster={poster}
                controls
                autoPlay
                playsInline
                preload="metadata"
              >
                <track
                  kind="captions"
                  src={captionsSrc}
                  srcLang="en"
                  label="English"
                  default
                />
              </video>
            ) : (
              <button
                type="button"
                className={styles.posterButton}
                onClick={() => setPlaying(true)}
                aria-label={label}
              >
                <Image
                  className={styles.poster}
                  src={poster}
                  alt="GWTH.ai explainer poster frame"
                  fill
                  sizes="(max-width: 768px) 100vw, 1100px"
                  priority={false}
                />
                <span className={styles.playRow}>
                  <span className={styles.playGlyph} aria-hidden="true">
                    {/* Functional play triangle, square chip, no decoration */}
                    <svg viewBox="0 0 24 24" width="22" height="22">
                      <path d="M7 5l12 7-12 7V5z" fill="currentColor" />
                    </svg>
                  </span>
                  <span className={styles.playLabel}>{label}</span>
                </span>
              </button>
            )}
          </div>
        </figure>
      </div>
    </section>
  )
}
