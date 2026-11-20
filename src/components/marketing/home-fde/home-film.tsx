"use client"

import Link from "next/link"
import { useState } from "react"
import p from "@/components/marketing/paper/paper.module.css"
import styles from "./home-film.module.css"

/**
 * The home page film: the paper cutout film (homepage-paper-depth, v06), in two
 * editions, paper and night, with the logo now green. David, 20 Nov 2026:
 * "Once you finish rendering please put all the videos into the site". Source:
 * GWTH-launch-plan/Video_Prroduction_with_AI/Claude Video Solution/notebook/
 * projects/homepage-paper-depth/out/ (the -v06-web copies).
 *
 * Before it: Film A, the Opus journal film (v04), which David approved on
 * 12 Nov 2026 ("Film A looks great"), with its signs drawn by GPT Image, which
 * he picked on 13 Nov 2026 (bead gwth-launch-1cin). It stays untouched on R2
 * under site/home-film/2026-11-13-gpt/, the 12 Nov Film A under
 * site/home-film/2026-11-12/, and the 21 Oct film under site/home-film/archive/,
 * so any of them can come back.
 *
 * David, 12 Nov 2026: "Home page for GWTH on the P520 with new video we have
 * just created and refine everything around it and all the public pages."
 *
 * It sits in the hero, under the headline, where the three-projects picture
 * used to be (that picture moved down to the months section). The film ends
 * "Why not try the free lesson to see how it works? The link is beside this
 * film", and its end card shows a "Start here" button, so the free-lesson panel
 * sits BESIDE the film on wide screens and straight under it on phones, with
 * the same button words.
 *
 * Two editions, the way the Start Here film does it: the paper edition in the
 * light theme and the night edition in the dark theme. Both posters are in the
 * page and CSS shows the one for the current theme; the edition is picked when
 * the visitor presses play. Click to play, so nothing downloads before the
 * visitor asks; captions are on by default.
 *
 * The films and posters are on R2 under a new dated key
 * (site/home-film/2026-11-20-paper-depth/). Same narration as Film A, so the
 * captions are unchanged. The captions are served from this site
 * (public/home/film/) because media.gwth.ai sends no CORS header, and a <track>
 * from another origin without one never loads.
 */
const BASE = "https://media.gwth.ai/site/home-film/2026-11-20-paper-depth"
export const FILM = {
  paper: { src: `${BASE}/homepage-paper-depth-paper.mp4`, poster: `${BASE}/poster-paper.jpg` },
  night: { src: `${BASE}/homepage-paper-depth-night.mp4`, poster: `${BASE}/poster-night.jpg` },
  captions: "/home/film/homepage-film-a.vtt",
} as const

export type HomeFilmCopy = {
  play: string
  heading: string
  body: string
  link: string
}

export const FILM_COPY: HomeFilmCopy = {
  play: "Play the film",
  heading: "Try the free lesson",
  body: "You'll watch a short film, read the lesson, do the project, then answer the end-of-lesson questions. Enter your email address and we'll send you the link.",
  link: "Start here",
}

export function HomeFilm({ copy = FILM_COPY }: { copy?: HomeFilmCopy }) {
  const [edition, setEdition] = useState<"paper" | "night" | null>(null)

  function play() {
    const dark = document.documentElement.classList.contains("dark")
    setEdition(dark ? "night" : "paper")
  }

  return (
    <div className={styles.block} data-section="film">
      <div className={styles.filmCol}>
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
            <button
              type="button"
              className={styles.posterButton}
              onClick={play}
              aria-label="Play the GWTH film"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- poster served from media.gwth.ai */}
              <img
                className={`${styles.poster} ${styles.paperOnly}`}
                src={FILM.paper.poster}
                alt=""
                fetchPriority="high"
              />
              {/* eslint-disable-next-line @next/next/no-img-element -- poster served from media.gwth.ai */}
              <img className={`${styles.poster} ${styles.nightOnly}`} src={FILM.night.poster} alt="" />
              <span className={styles.play}>
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path d="M7 5l12 7-12 7V5z" fill="currentColor" />
                </svg>
                {copy.play}
              </span>
            </button>
          )}
        </figure>
        {/* No running time or captions line under the film (David, 13 Nov
            2026, a-20261113-153022-a61050: "Remove that"). */}
      </div>
      {/* Lesson zero is the one open lesson; it still asks for an email before
          it opens (persona review PR09), which the body says. */}
      <aside className={styles.beside} data-testid="home-free-lesson">
        <h2 className={styles.besideTitle}>{copy.heading}</h2>
        <p className={styles.besideBody}>{copy.body}</p>
        <Link href="/start-here" className={p.buttonSolid}>
          {copy.link}
        </Link>
      </aside>
    </div>
  )
}
