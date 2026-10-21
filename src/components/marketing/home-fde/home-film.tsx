"use client"

import { useState } from "react"
import styles from "./home-film.module.css"

/**
 * The home page film (homepage-9c-opus, script 10F in the film 7 look, with
 * David's marks; re-voiced 2026-10-20 for the audience-by-purpose change).
 *
 * David, 2026-10-21: "We need to put the home page video on the home page."
 * Placed straight after the hero, framed, which is where he put the earlier
 * explainer (W12 picks, 2026-07-04). Two editions: paper for the light theme,
 * night for the dark one. Click to play, so nothing autoplays or downloads
 * before the visitor asks; captions are on by default.
 *
 * The files are web copies (x264 CRF 26, faststart) on R2 under a dated key,
 * so the masters and anything gwth.ai served before are never overwritten.
 */
const BASE = "https://media.gwth.ai/site/home-film/2026-10-21"
const FILM = {
  paper: { src: `${BASE}/homepage-film-paper.mp4`, poster: `${BASE}/homepage-film-paper-poster.jpg` },
  night: { src: `${BASE}/homepage-film-night.mp4`, poster: `${BASE}/homepage-film-night-poster.jpg` },
  captions: `${BASE}/homepage-film.vtt`,
}

export function HomeFilm() {
  const [edition, setEdition] = useState<"paper" | "night" | null>(null)

  function play() {
    // The theme class is on <html>; read it at the moment of the click so the
    // edition always matches what the visitor is looking at.
    const dark = document.documentElement.classList.contains("dark")
    setEdition(dark ? "night" : "paper")
  }

  return (
    <section className={styles.section} data-section="film">
      <div className={styles.page}>
        <h2 className={styles.title}>Watch the film</h2>
        <p className={styles.meta}>Under five minutes, with captions</p>
        <figure className={styles.frame}>
          {edition ? (
            <video
              className={styles.video}
              src={FILM[edition].src}
              poster={FILM[edition].poster}
              controls
              autoPlay
              playsInline
              preload="metadata"
            >
              <track kind="captions" src={FILM.captions} srcLang="en" label="English" default />
            </video>
          ) : (
            <button type="button" className={styles.posterButton} onClick={play} aria-label="Play the GWTH film">
              {/* eslint-disable-next-line @next/next/no-img-element -- poster served from media.gwth.ai */}
              <img className={`${styles.poster} ${styles.paperOnly}`} src={FILM.paper.poster} alt="" loading="lazy" />
              {/* eslint-disable-next-line @next/next/no-img-element -- poster served from media.gwth.ai */}
              <img className={`${styles.poster} ${styles.nightOnly}`} src={FILM.night.poster} alt="" loading="lazy" />
              <span className={styles.play}>
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path d="M7 5l12 7-12 7V5z" fill="currentColor" />
                </svg>
                Play the film
              </span>
            </button>
          )}
        </figure>
      </div>
    </section>
  )
}
