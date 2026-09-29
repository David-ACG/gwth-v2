"use client"

/**
 * The media pieces of a lesson part: the Listen bar (Read or listen), the
 * part text with read-along, the part video (Watch short videos) and the
 * diagram. Bead gwth-launch-hqyp; behaviour ported from the Lesson 10
 * prototype.
 */
import * as React from "react"
import { cn } from "@/lib/utils"
import type { PublicPartImage } from "@/lib/lessons/parts"
import { COPY } from "./copy"
import { alignWords, normWord, tokenAt, wrapWords } from "./read-along"
import styles from "./parts-lesson.module.css"

/** Only one audio or video plays at a time on the page. */
export function pauseOtherMedia(except: HTMLMediaElement | null): void {
  document.querySelectorAll<HTMLMediaElement>("audio, video").forEach((m) => {
    if (m !== except && !m.paused) m.pause()
  })
}

function fmt(sec: number | null | undefined): string {
  if (sec == null || !Number.isFinite(sec)) return "--:--"
  const s = Math.max(0, Math.round(sec))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}

/** The element that actually scrolls `el` (the dashboard scrolls a <main>, not the window). */
export function scrollParent(el: Element | null): Element {
  let e = el?.parentElement ?? null
  while (e) {
    const oy = getComputedStyle(e).overflowY
    if ((oy === "auto" || oy === "scroll") && e.scrollHeight > e.clientHeight) return e
    e = e.parentElement
  }
  return document.scrollingElement ?? document.documentElement
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
}

// ── HTML that React renders once and never touches again ────────────────────

/**
 * Server-rendered part HTML. React sets innerHTML once and leaves the
 * children alone while `html` is unchanged, which is what lets read-along
 * wrap the words in place.
 */
export const HtmlBlock = React.memo(function HtmlBlock({
  html,
  as = "div",
  className,
  blockRef,
  id,
  tabIndex,
}: {
  html: string
  as?: "div" | "h2"
  className?: string
  blockRef?: React.Ref<HTMLElement>
  id?: string
  tabIndex?: number
}) {
  const Tag = as as "div"
  return (
    <Tag
      ref={blockRef as React.Ref<HTMLDivElement>}
      id={id}
      tabIndex={tabIndex}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
})

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

// ── Diagram ──────────────────────────────────────────────────────────────────

export function PartFigure({ image }: { image: PublicPartImage }) {
  return (
    <figure className={styles.figure}>
      {/* eslint-disable-next-line @next/next/no-img-element -- CDN media, sized by the content */}
      <img className={image.dark ? styles.imgLight : undefined} src={image.light} alt={image.alt} loading="lazy" width={1536} height={1024} />
      {image.dark ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.imgDark} src={image.dark} alt={image.alt} loading="lazy" width={1536} height={1024} />
      ) : null}
      {image.caption ? <figcaption>{image.caption}</figcaption> : null}
    </figure>
  )
}

// ── Listen bar ───────────────────────────────────────────────────────────────

export interface ListenBarHandle {
  audio: HTMLAudioElement | null
  restart: () => void
}

export const ListenBar = React.forwardRef<
  ListenBarHandle,
  {
    src: string
    seconds: number | null
    readAlong: boolean
    onReadAlong: (on: boolean) => void
    onPlay: (t: number) => void
    onPause: (t: number) => void
    onEnded: () => void
  }
>(function ListenBar({ src, seconds, readAlong, onReadAlong, onPlay, onPause, onEnded }, ref) {
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = React.useState(false)
  const [time, setTime] = React.useState(0)
  const [duration, setDuration] = React.useState<number | null>(seconds)
  const [missing, setMissing] = React.useState(false)
  const [seekValue, setSeekValue] = React.useState<number | null>(null)
  const [rate, setRate] = React.useState("1")

  React.useImperativeHandle(ref, () => ({
    get audio() {
      return audioRef.current
    },
    restart() {
      const a = audioRef.current
      if (!a) return
      a.currentTime = 0
      pauseOtherMedia(a)
      void a.play().catch(() => {})
    },
  }))

  const toggle = () => {
    const a = audioRef.current
    if (!a) return
    if (a.paused) {
      pauseOtherMedia(a)
      void a.play().catch(() => {})
    } else a.pause()
  }

  const d = duration ?? seconds
  const position = seekValue ?? (d ? Math.round((1000 * time) / d) : 0)

  return (
    <div className={styles.listen} data-testid="listen-bar">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={(e) => {
          setPlaying(true)
          onPlay(e.currentTarget.currentTime)
        }}
        onPause={(e) => {
          setPlaying(false)
          if (!e.currentTarget.ended) onPause(e.currentTarget.currentTime)
        }}
        onEnded={() => {
          setPlaying(false)
          onEnded()
        }}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          setMissing(false)
          if (Number.isFinite(e.currentTarget.duration)) setDuration(e.currentTarget.duration)
        }}
        onError={() => setMissing(true)}
      />
      <button type="button" className={cn(styles.btn, styles.play)} onClick={toggle} disabled={missing} aria-label={playing ? COPY.pause : COPY.play}>
        {playing ? `❚❚ ${COPY.pause}` : `▶ ${COPY.play}`}
      </button>
      <span className={styles.time} aria-live="off">
        {missing ? COPY.audioMissing : `${fmt(time)} / ${fmt(d)}`}
      </span>
      <input
        className={styles.seek}
        type="range"
        min={0}
        max={1000}
        value={position}
        aria-label={COPY.audioPosition}
        aria-valuetext={`${fmt(time)} of ${fmt(d)}`}
        onChange={(e) => setSeekValue(Number(e.target.value))}
        onPointerUp={() => commitSeek()}
        onKeyUp={() => commitSeek()}
        onBlur={() => commitSeek()}
        disabled={missing}
      />
      <div className={styles.listenOpts}>
        <label>
          {COPY.speed}{" "}
          <select
            value={rate}
            onChange={(e) => {
              setRate(e.target.value)
              if (audioRef.current) audioRef.current.playbackRate = Number(e.target.value)
            }}
          >
            <option value="0.75">0.75x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
          </select>
        </label>
        <label className={styles.toggle}>
          <input type="checkbox" checked={readAlong} onChange={(e) => onReadAlong(e.target.checked)} />
          {COPY.readAlong}
        </label>
      </div>
    </div>
  )

  function commitSeek() {
    const a = audioRef.current
    if (seekValue === null || !a) return
    const dd = Number.isFinite(a.duration) ? a.duration : d
    if (dd) a.currentTime = (dd * seekValue) / 1000
    setSeekValue(null)
  }
})

// ── Part text with read-along ────────────────────────────────────────────────

const wordsCache = new Map<string, Promise<[number, string][]>>()
function loadWords(url: string): Promise<[number, string][]> {
  let p = wordsCache.get(url)
  if (!p) {
    p = fetch(url)
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => [])
    wordsCache.set(url, p)
  }
  return p
}
export { loadWords }

/**
 * The part title and text. With `readAlong` set, every word is wrapped once
 * and the one being spoken is highlighted while the audio plays; clicking a
 * word jumps the audio there.
 */
export function PartText({
  titleId,
  title,
  html,
  image,
  audio,
  wordsUrl,
  readAlongOn,
  topOffset,
}: {
  titleId: string
  title: string
  html: { lead: string; rest: string }
  image: PublicPartImage | null
  /** The part's audio element, when this is the Read format. */
  audio: HTMLAudioElement | null
  wordsUrl: string | null
  readAlongOn: boolean
  /** Height of the sticky chrome above the text, for auto-scroll. */
  topOffset: () => number
}) {
  const hostRef = React.useRef<HTMLDivElement>(null)
  const titleRef = React.useRef<HTMLElement>(null)
  const leadRef = React.useRef<HTMLElement>(null)
  const restRef = React.useRef<HTMLElement>(null)
  const titleHtml = React.useMemo(() => escapeHtml(title), [title])

  React.useEffect(() => {
    if (!audio || !wordsUrl || !readAlongOn) return
    const host = hostRef.current
    let cancelled = false
    let raf = 0
    let cur = -1
    let userScrollAt = 0
    let spans: HTMLSpanElement[] = []
    let starts: number[] = []
    let map: number[] = []

    const show = (wi: number) => {
      if (wi === cur) return
      if (cur >= 0) spans[cur]?.classList.remove("rw-on")
      cur = wi
      const s = wi >= 0 ? spans[wi] : undefined
      if (!s) return
      s.classList.add("rw-on")
      if (audio.paused || Date.now() - userScrollAt < 4000) return
      const r = s.getBoundingClientRect()
      const vh = window.innerHeight
      if (r.bottom > vh * 0.85 || r.top < topOffset()) {
        scrollParent(s).scrollBy({ top: r.top - vh * 0.38, behavior: prefersReducedMotion() ? "auto" : "smooth" })
      }
    }
    const tick = () => {
      const i = tokenAt(starts, audio.currentTime)
      show(i >= 0 ? (map[i] ?? -1) : -1)
      if (!audio.paused) raf = requestAnimationFrame(tick)
    }
    const onPlay = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(tick)
    }
    const onIdle = () => {
      if (audio.paused) tick()
    }
    const onUserScroll = () => {
      userScrollAt = Date.now()
    }
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const wi = spans.indexOf(target as HTMLSpanElement)
      if (wi < 0) return
      const ti = map.indexOf(wi)
      if (ti >= 0) {
        audio.currentTime = starts[ti] ?? 0
        tick()
      }
    }

    void loadWords(wordsUrl).then((words) => {
      if (cancelled || !words.length) return
      const skipFigure = (el: Element) => el.tagName === "FIGURE"
      spans = [titleRef.current, leadRef.current, restRef.current].flatMap((el) =>
        el ? wrapWords(el as HTMLElement, "rw", skipFigure) : []
      )
      starts = words.map((w) => w[0])
      map = alignWords(
        words.map((w) => normWord(w[1])),
        spans.map((s) => normWord(s.textContent ?? ""))
      )
      audio.addEventListener("play", onPlay)
      audio.addEventListener("seeked", tick)
      audio.addEventListener("timeupdate", onIdle)
      host?.addEventListener("click", onClick)
      window.addEventListener("wheel", onUserScroll, { passive: true })
      window.addEventListener("touchmove", onUserScroll, { passive: true })
      tick()
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      if (cur >= 0) spans[cur]?.classList.remove("rw-on")
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("seeked", tick)
      audio.removeEventListener("timeupdate", onIdle)
      host?.removeEventListener("click", onClick)
      window.removeEventListener("wheel", onUserScroll)
      window.removeEventListener("touchmove", onUserScroll)
    }
  }, [audio, wordsUrl, readAlongOn, topOffset])

  return (
    <div ref={hostRef} className={cn(readAlongOn && audio ? styles.readAlongOn : undefined)}>
      <HtmlBlock as="h2" id={titleId} tabIndex={-1} className={styles.h2} html={titleHtml} blockRef={titleRef} />
      <PartBody html={html} image={image} leadRef={leadRef} restRef={restRef} />
    </div>
  )
}

/** Text + diagram, no audio (the Watch format's "Read this part instead"). */
export function PartBody({
  html,
  image,
  leadRef,
  restRef,
}: {
  html: { lead: string; rest: string }
  image: PublicPartImage | null
  leadRef?: React.Ref<HTMLElement>
  restRef?: React.Ref<HTMLElement>
}) {
  return (
    <div className={styles.body}>
      <HtmlBlock html={html.lead} blockRef={leadRef} />
      {image ? <PartFigure image={image} /> : null}
      <HtmlBlock html={html.rest} blockRef={restRef} />
    </div>
  )
}

// ── Part video ───────────────────────────────────────────────────────────────

export const PartVideo = React.forwardRef<
  HTMLVideoElement,
  {
    src: string
    poster: string | null
    captionsUrl: string | null
    label: string
    onPlay: (t: number) => void
    onPause: (t: number) => void
    onEnded: () => void
  }
>(function PartVideo({ src, poster, captionsUrl, label, onPlay, onPause, onEnded }, ref) {
  return (
    <video
      ref={ref}
      className={styles.video}
      controls
      playsInline
      preload="metadata"
      poster={poster ?? undefined}
      aria-label={label}
      onPlay={(e) => {
        pauseOtherMedia(e.currentTarget)
        onPlay(e.currentTarget.currentTime)
      }}
      onPause={(e) => {
        if (!e.currentTarget.ended) onPause(e.currentTarget.currentTime)
      }}
      onEnded={onEnded}
    >
      <source src={src} type="video/mp4" />
      {captionsUrl ? <track kind="captions" src={captionsUrl} srcLang="en" label="English" default /> : null}
    </video>
  )
})
