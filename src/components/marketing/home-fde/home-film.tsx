"use client"

import Link from "next/link"
import { useState } from "react"
import p from "@/components/marketing/paper/paper.module.css"
import styles from "./home-film.module.css"

/**
 * The home page film: Film A, the Opus journal film (v04), which David approved
 * on 12 Nov 2026 ("Film A looks great"). Source:
 * GWTH-launch-plan/completion/homepage-film-journal/options/opus-still/.
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
 * One edition: Film A is a paper film, and it plays as it is in the dark theme
 * too, inside its frame. Click to play, so nothing downloads before the visitor
 * asks; captions are on by default.
 *
 * The film and poster are on R2 under a dated key (site/home-film/2026-11-12/);
 * the 21 Oct film is untouched there and archived under site/home-film/archive/.
 * The captions are served from this site (public/home/film/) because
 * media.gwth.ai sends no CORS header, and a <track> from another origin without
 * one never loads.
 */
const BASE = "https://media.gwth.ai/site/home-film/2026-11-12"
export const FILM = {
  src: `${BASE}/homepage-film-a.mp4`,
  poster: `${BASE}/homepage-film-a-poster.jpg`,
  captions: "/home/film/homepage-film-a.vtt",
}

export type HomeFilmCopy = {
  label: string
  play: string
  heading: string
  body: string
  link: string
}

export const FILM_COPY: HomeFilmCopy = {
  label: "1 minute 19 seconds, with English captions",
  play: "Play the film",
  heading: "Try the free lesson",
  body: "You'll read the lesson, watch a film, try a project and take a quiz. Enter your email address and we'll send you the link.",
  link: "Start here",
}

export function HomeFilm({ copy = FILM_COPY }: { copy?: HomeFilmCopy }) {
  const [playing, setPlaying] = useState(false)

  return (
    <div className={styles.block} data-section="film">
      <div className={styles.filmCol}>
        <figure className={styles.frame}>
          {playing ? (
            <video
              className={styles.video}
              src={FILM.src}
              poster={FILM.poster}
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
              onClick={() => setPlaying(true)}
              aria-label="Play the GWTH film"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- poster served from media.gwth.ai */}
              <img className={styles.poster} src={FILM.poster} alt="" fetchPriority="high" />
              <span className={styles.play}>
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path d="M7 5l12 7-12 7V5z" fill="currentColor" />
                </svg>
                {copy.play}
              </span>
            </button>
          )}
        </figure>
        <p className={styles.meta}>{copy.label}</p>
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
