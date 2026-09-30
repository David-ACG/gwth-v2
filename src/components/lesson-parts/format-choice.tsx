"use client"

/**
 * The choice before a learner's first lesson in parts (David, 2026-09-29):
 * a sample of each format, then one tap to choose. Since 2026-09-30 (David,
 * option A) each preview IS the play button: one tap plays a real 10 second
 * sample with sound, a second tap stops it. Nothing plays by itself.
 */
import * as React from "react"
import { cn } from "@/lib/utils"
import type { LessonFormat, PublicLessonPart } from "@/lib/lessons/parts"
import { COPY, FORMAT_COPY } from "./copy"
import { escapeHtml, loadWords, pauseOtherMedia } from "./media-bits"
import { alignWords, normWord, tokenAt, wrapWords } from "./read-along"
import styles from "./parts-lesson.module.css"

const SAMPLE_SECONDS = 10

type SampleState = "idle" | "playing" | "done"

/**
 * The overlay that makes the whole preview a play button (David, 2026-09-30,
 * option A: "the picture is the play button"). No separate controls.
 */
function SampleOverlay({ state }: { state: SampleState }) {
  if (state === "playing") {
    return (
      <span className={cn(styles.sampleBadge, styles.sampleBadgeQuiet)}>
        <span aria-hidden="true">❚❚</span> {COPY.sampleStop}
      </span>
    )
  }
  return (
    <span className={styles.sampleCover}>
      <span className={styles.samplePlay} aria-hidden="true">
        ▶
      </span>
      <span className={styles.sampleBadge}>{state === "done" ? COPY.sampleAgain : COPY.sampleTry}</span>
    </span>
  )
}

/** Watch short videos: part 1's video, with sound and captions, for 10 seconds. */
function WatchSample({ part, name }: { part: PublicLessonPart; name: string }) {
  const ref = React.useRef<HTMLVideoElement>(null)
  const [state, setState] = React.useState<SampleState>("idle")
  const toggle = () => {
    const v = ref.current
    if (!v) return
    if (!v.paused) {
      v.pause()
      setState("done")
      return
    }
    pauseOtherMedia(v)
    v.currentTime = 0
    v.muted = false
    void v.play().then(() => setState("playing")).catch(() => setState("idle"))
  }
  return (
    <button
      type="button"
      className={styles.previewBox}
      onClick={toggle}
      aria-label={`${state === "playing" ? COPY.sampleStop : COPY.sampleTry}: ${name}`}
      data-testid="sample-watch"
      data-state={state}
    >
      <video
        ref={ref}
        src={part.watch.video}
        poster={part.watch.poster ?? undefined}
        playsInline
        preload="metadata"
        tabIndex={-1}
        onPause={() => setState((s) => (s === "playing" ? "done" : s))}
        onTimeUpdate={(e) => {
          if (e.currentTarget.currentTime >= SAMPLE_SECONDS) e.currentTarget.pause()
        }}
      >
        {part.watch.captionsUrl ? <track kind="captions" src={part.watch.captionsUrl} srcLang="en" label="English" default /> : null}
      </video>
      <SampleOverlay state={state} />
    </button>
  )
}

/** Read or listen: the opening words, read aloud for 10 seconds, each word lit as it is spoken. */
function ReadSample({ part, name }: { part: PublicLessonPart; name: string }) {
  const boxRef = React.useRef<HTMLSpanElement>(null)
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const [state, setState] = React.useState<SampleState>("idle")

  React.useEffect(() => {
    const box = boxRef.current
    const audio = audioRef.current
    if (!box || !audio) return
    // Built here, not during render: DOMParser only exists in the browser.
    const doc = new DOMParser().parseFromString(part.html.lead, "text/html")
    const lead = (doc.body.textContent ?? "").trim().split(/\s+/).slice(0, 34).join(" ")
    box.innerHTML = `<strong>${escapeHtml(part.title)}.</strong> ${escapeHtml(lead)} ...`
    let spans: HTMLSpanElement[] = []
    let starts: number[] = []
    let map: number[] = []
    let raf = 0
    let cur = -1
    let cancelled = false
    const show = (wi: number) => {
      if (wi === cur) return
      if (cur >= 0) spans[cur]?.classList.remove("rw-on")
      cur = wi
      if (wi >= 0) spans[wi]?.classList.add("rw-on")
    }
    const frame = () => {
      if (audio.currentTime >= SAMPLE_SECONDS) audio.pause()
      const i = tokenAt(starts, audio.currentTime)
      show(i >= 0 ? (map[i] ?? -1) : -1)
      if (!audio.paused) raf = requestAnimationFrame(frame)
    }
    const onPlay = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(frame)
    }
    const onStop = () => {
      cancelAnimationFrame(raf)
      show(-1)
    }
    if (part.read.wordsUrl) {
      void loadWords(part.read.wordsUrl).then((words) => {
        if (cancelled || !words.length) return
        spans = wrapWords(box, "rw")
        const norms = spans.map((s) => normWord(s.textContent ?? ""))
        const allMap = alignWords(words.map((w) => normWord(w[1])), norms)
        let n = allMap.findIndex((m) => m >= norms.length - 1)
        n = n === -1 ? allMap.length : n + 1
        starts = words.slice(0, n).map((w) => w[0])
        map = allMap.slice(0, n)
      })
    }
    audio.addEventListener("play", onPlay)
    audio.addEventListener("pause", onStop)
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("pause", onStop)
    }
  }, [part.html.lead, part.title, part.read.wordsUrl])

  const toggle = () => {
    const a = audioRef.current
    if (!a) return
    if (!a.paused) {
      a.pause()
      return
    }
    pauseOtherMedia(a)
    a.currentTime = 0
    void a.play().then(() => setState("playing")).catch(() => setState("idle"))
  }

  return (
    <button
      type="button"
      className={styles.previewBox}
      onClick={toggle}
      aria-label={`${state === "playing" ? COPY.sampleStop : COPY.sampleTry}: ${name}`}
      data-testid="sample-read"
      data-state={state}
    >
      <span ref={boxRef} className={styles.previewText} aria-hidden="true" />
      <audio
        ref={audioRef}
        src={part.read.audio}
        preload="none"
        onPause={() => setState((s) => (s === "playing" ? "done" : s))}
      />
      <SampleOverlay state={state} />
    </button>
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
            {f === "watch" ? <WatchSample part={firstPart} name={FORMAT_COPY.watch.name} /> : <ReadSample part={firstPart} name={FORMAT_COPY.read.name} />}
            <h2 id={`choice-${f}`}>{FORMAT_COPY[f].name}</h2>
            <p>{FORMAT_COPY[f].blurb}</p>
            <button type="button" className={styles.btn} disabled={busy} onClick={() => onChoose(f)} aria-describedby={`choice-${f}`} data-testid={`choose-${f}`}>
              {FORMAT_COPY[f].choose}
            </button>
          </section>
        ))}
      </div>
    </div>
  )
}
