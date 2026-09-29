"use client"

/**
 * The choice before a learner's first lesson in parts (David, 2026-09-29):
 * a few seconds of preview of each format, then one tap to choose. The
 * previews are silent and stop on request (WCAG 2.2.2); with reduced motion
 * they wait for Play.
 */
import * as React from "react"
import { cn } from "@/lib/utils"
import type { LessonFormat, PublicLessonPart } from "@/lib/lessons/parts"
import { COPY, FORMAT_COPY } from "./copy"
import { escapeHtml, loadWords, pauseOtherMedia } from "./media-bits"
import { alignWords, normWord, tokenAt, wrapWords } from "./read-along"
import styles from "./parts-lesson.module.css"

const PREVIEW_SECONDS = 8

function reducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
}

function WatchPreview({ part }: { part: PublicLessonPart }) {
  const ref = React.useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = React.useState(false)
  React.useEffect(() => {
    const v = ref.current
    if (!v || reducedMotion()) return
    v.muted = true
    void v.play().catch(() => {})
  }, [])
  return (
    <>
      <div className={styles.previewBox}>
        <video
          ref={ref}
          src={part.watch.video}
          poster={part.watch.poster ?? undefined}
          muted
          playsInline
          preload="metadata"
          aria-label={`${FORMAT_COPY.watch.name}: preview`}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => {
            if (e.currentTarget.currentTime >= PREVIEW_SECONDS) e.currentTarget.currentTime = 0
          }}
        />
      </div>
      <div className={styles.previewCtl}>
        <button
          type="button"
          className={styles.ghost}
          onClick={() => {
            const v = ref.current
            if (!v) return
            if (v.paused) {
              v.muted = true
              void v.play().catch(() => {})
            } else v.pause()
          }}
        >
          {playing ? COPY.pausePreview : COPY.playPreview}
        </button>
      </div>
    </>
  )
}

function ReadPreview({ part }: { part: PublicLessonPart }) {
  const boxRef = React.useRef<HTMLDivElement>(null)
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const [running, setRunning] = React.useState(false)
  const [hearing, setHearing] = React.useState(false)
  React.useEffect(() => {
    const box = boxRef.current
    if (!box) return
    // Built here, not during render: DOMParser only exists in the browser.
    const doc = new DOMParser().parseFromString(part.html.lead, "text/html")
    const lead = (doc.body.textContent ?? "").trim().split(/\s+/).slice(0, 34).join(" ")
    box.innerHTML = `<strong>${escapeHtml(part.title)}.</strong> ${escapeHtml(lead)} ...`
    let spans: HTMLSpanElement[] = []
    let starts: number[] = []
    let map: number[] = []
    let raf = 0
    let cur = -1
    let t0 = performance.now()
    let limit = PREVIEW_SECONDS
    const show = (wi: number) => {
      if (wi === cur) return
      if (cur >= 0) spans[cur]?.classList.remove("rw-on")
      cur = wi
      if (wi >= 0) spans[wi]?.classList.add("rw-on")
    }
    const frame = () => {
      const a = audioRef.current
      const t = a && !a.paused ? a.currentTime : ((performance.now() - t0) / 1000) % limit
      if (a && !a.paused && a.currentTime >= limit) a.pause()
      const i = tokenAt(starts, t)
      show(i >= 0 ? (map[i] ?? -1) : -1)
      raf = requestAnimationFrame(frame)
    }
    let cancelled = false
    if (part.read.wordsUrl) {
      void loadWords(part.read.wordsUrl).then((words) => {
        if (cancelled || !words.length) return
        spans = wrapWords(box, "rw")
        const norms = spans.map((s) => normWord(s.textContent ?? ""))
        // Only the tokens spoken while the excerpt is on screen.
        const lastSpan = norms.length - 1
        const allMap = alignWords(words.map((w) => normWord(w[1])), norms)
        let n = allMap.findIndex((m) => m >= lastSpan)
        if (n === -1) n = allMap.length
        starts = words.slice(0, n).map((w) => w[0])
        map = allMap.slice(0, n)
        limit = Math.min(12, Math.max(4, starts[starts.length - 1] ?? PREVIEW_SECONDS))
        if (!reducedMotion()) setRunning(true)
      })
    }
    const onToggle = () => {
      cancelAnimationFrame(raf)
      if (box.dataset.run === "1") {
        t0 = performance.now()
        raf = requestAnimationFrame(frame)
      } else show(-1)
    }
    box.addEventListener("preview-toggle", onToggle)
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      box.removeEventListener("preview-toggle", onToggle)
    }
  }, [part.html.lead, part.title, part.read.wordsUrl])

  React.useEffect(() => {
    const box = boxRef.current
    if (!box) return
    box.dataset.run = running || hearing ? "1" : "0"
    box.dispatchEvent(new Event("preview-toggle"))
  }, [running, hearing])

  return (
    <>
      <div className={styles.previewBox}>
        <div ref={boxRef} className={styles.previewText} aria-label={`${FORMAT_COPY.read.name}: preview`} />
      </div>
      <audio
        ref={audioRef}
        src={part.read.audio}
        preload="none"
        onPlay={() => setHearing(true)}
        onPause={() => setHearing(false)}
        onEnded={() => setHearing(false)}
      />
      <div className={styles.previewCtl}>
        <button type="button" className={styles.ghost} onClick={() => setRunning((r) => !r)}>
          {running ? COPY.pausePreview : COPY.playPreview}
        </button>
        <button
          type="button"
          className={styles.ghost}
          onClick={() => {
            const a = audioRef.current
            if (!a) return
            if (a.paused) {
              pauseOtherMedia(a)
              a.currentTime = 0
              void a.play().catch(() => {})
            } else a.pause()
          }}
        >
          {hearing ? COPY.stopHearing : COPY.hearIt}
        </button>
      </div>
    </>
  )
}

export function FormatChoice({
  firstPart,
  onChoose,
  busy,
}: {
  firstPart: PublicLessonPart
  onChoose: (format: LessonFormat) => void
  busy: boolean
}) {
  return (
    <div className={styles.column} style={{ maxWidth: "68rem" }} data-testid="format-choice">
      <h1 id="screen-title" className={styles.h1}>
        {COPY.choiceTitle}
      </h1>
      <p className={styles.lede}>{COPY.choiceBody}</p>
      <div className={styles.choiceGrid}>
        {(["watch", "read"] as const).map((f) => (
          <section key={f} className={cn(styles.panel, styles.choiceCard)} aria-labelledby={`choice-${f}`}>
            {f === "watch" ? <WatchPreview part={firstPart} /> : <ReadPreview part={firstPart} />}
            <h2 id={`choice-${f}`}>{FORMAT_COPY[f].name}</h2>
            <p>{FORMAT_COPY[f].blurb}</p>
            <button type="button" className={styles.btn} disabled={busy} onClick={() => onChoose(f)}>
              {FORMAT_COPY[f].choose}
            </button>
          </section>
        ))}
      </div>
    </div>
  )
}
