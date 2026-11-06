"use client"

import { useState } from "react"
import { START_HERE_FILM } from "@/lib/start-here/media"
import film from "@/components/marketing/home-fde/home-film.module.css"

/**
 * Lesson zero's own film (lesson-zero-film7, approved by David 2026-10-17),
 * shown only once the lesson is open: it is the lesson's intro, not a public
 * trailer (David, 2026-10-16). Same frame as the home page film: paper edition
 * in the light theme, night in the dark, click to play, captions on.
 */
export function StartHereFilm() {
  const [edition, setEdition] = useState<"paper" | "night" | null>(null)

  function play() {
    const dark = document.documentElement.classList.contains("dark")
    setEdition(dark ? "night" : "paper")
  }

  return (
    <figure className={film.frame} data-testid="start-here-film">
      {edition ? (
        <video
          className={film.video}
          src={START_HERE_FILM[edition].src}
          poster={START_HERE_FILM[edition].poster}
          controls
          autoPlay
          playsInline
          preload="metadata"
        >
          <track kind="captions" src={START_HERE_FILM.captions} srcLang="en" label="English" default />
        </video>
      ) : (
        <button type="button" className={film.posterButton} onClick={play} aria-label="Play the Start Here film">
          {/* eslint-disable-next-line @next/next/no-img-element -- poster served from media.gwth.ai */}
          <img className={`${film.poster} ${film.paperOnly}`} src={START_HERE_FILM.paper.poster} alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element -- poster served from media.gwth.ai */}
          <img className={`${film.poster} ${film.nightOnly}`} src={START_HERE_FILM.night.poster} alt="" />
          <span className={film.play}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M7 5l12 7-12 7V5z" fill="currentColor" />
            </svg>
            Play the film
          </span>
        </button>
      )}
    </figure>
  )
}
