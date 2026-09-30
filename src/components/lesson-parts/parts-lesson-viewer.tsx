"use client"

/**
 * Lessons in parts, two learner-chosen formats (bead gwth-launch-hqyp;
 * Style Bible lesson-viewer-two-formats).
 *
 * Screens: 0 is the introduction, 1..n are the parts (one per screen, in
 * either format), n+1 is the end of the lesson (rating, then the project).
 * A part's check question must be resolved (right, or explained after two
 * wrong tries) before Continue opens the next one. The Watch / Read switch at
 * the top changes format in place and keeps the learner on the same part.
 */
import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { answerPartCheckAction, saveLessonPrefsAction } from "@/lib/actions/lesson-parts"
import type { LessonFormat, PublicLessonParts } from "@/lib/lessons/parts"
import { CheckCard, EMPTY_CHECK, type ClientCheck } from "./check-card"
import { COPY, FORMAT_COPY } from "./copy"
import { RatingCard, useConfused } from "./feedback-bits"
import { FormatChoice } from "./format-choice"
import { HtmlBlock, ListenBar, PartBody, PartText, PartVideo, pauseOtherMedia, scrollParent, type ListenBarHandle } from "./media-bits"
import { useLessonTracker, type TrackFn } from "./use-lesson-tracker"
import styles from "./parts-lesson.module.css"

export interface PartsLessonViewerProps {
  lesson: { id: string; number: number; title: string; courseHref: string }
  parts: PublicLessonParts
  initialChecks: Record<string, ClientCheck>
  startScreen: number
  returning: boolean
  prefs: { lessonFormat: LessonFormat | null; readAlong: boolean }
  /** Show the format choice even if one was made (review links: ?choose=1). */
  forceChoice: boolean
  project: { html: string } | null
  nextLesson: { title: string; href: string } | null
  /** False on a preview without a signed-in learner: nothing is recorded. */
  trackingEnabled: boolean
}

/** The furthest screen a learner may open: up to the first unresolved part. */
export function maxOpenScreen(partIds: string[], checks: Record<string, ClientCheck>): number {
  const firstOpen = partIds.findIndex((id) => !checks[id]?.resolved)
  return firstOpen === -1 ? partIds.length + 1 : firstOpen + 1
}

export function PartsLessonViewer(props: PartsLessonViewerProps) {
  const { lesson, parts } = props
  const n = parts.parts.length
  const partIds = React.useMemo(() => parts.parts.map((p) => p.id), [parts])

  const [format, setFormat] = React.useState<LessonFormat | null>(props.forceChoice ? null : props.prefs.lessonFormat)
  const [readAlong, setReadAlong] = React.useState(props.prefs.readAlong)
  const [checks, setChecks] = React.useState<Record<string, ClientCheck>>(props.initialChecks)
  const [pending, setPending] = React.useState<string | null>(null)
  const [answerError, setAnswerError] = React.useState<string | null>(null)
  const [savingChoice, setSavingChoice] = React.useState(false)
  const maxScreen = maxOpenScreen(partIds, checks)
  const [screen, setScreen] = React.useState(() => Math.max(0, Math.min(props.startScreen, maxScreen)))

  const { track, sessionId } = useLessonTracker({
    lessonId: lesson.id,
    enabled: props.trackingEnabled,
    format,
    screen,
  })

  const shellRef = React.useRef<HTMLDivElement>(null)
  const topbarRef = React.useRef<HTMLElement>(null)
  const listenRef = React.useRef<ListenBarHandle>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [audioEl, setAudioEl] = React.useState<HTMLAudioElement | null>(null)

  // Keep the sticky Listen bar just under the sticky top bar.
  React.useLayoutEffect(() => {
    const bar = topbarRef.current
    const shell = shellRef.current
    if (!bar || !shell) return
    const set = () => shell.style.setProperty("--pl-top", `${bar.offsetHeight + 8}px`)
    set()
    const ro = new ResizeObserver(set)
    ro.observe(bar)
    return () => ro.disconnect()
  }, [format])

  const topOffset = React.useCallback(() => {
    const top = topbarRef.current?.offsetHeight ?? 0
    const listen = shellRef.current?.querySelector<HTMLElement>("[data-testid=listen-bar]")?.offsetHeight ?? 0
    return top + listen + 24
  }, [])

  // lesson_opened once; part_opened whenever a part is on screen.
  React.useEffect(() => {
    track("lesson_opened", null, { returning: props.returning })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  React.useEffect(() => {
    if (format && screen >= 1 && screen <= n) track("part_opened", screen - 1)
  }, [screen, format, n, track])

  // The audio element of the current Read screen, for read-along.
  React.useEffect(() => {
    setAudioEl(listenRef.current?.audio ?? null)
  }, [screen, format])

  const go = React.useCallback(
    (target: number) => {
      const next = Math.max(0, Math.min(target, maxScreen))
      pauseOtherMedia(null)
      setScreen(next)
      setAnswerError(null)
      const url = new URL(window.location.href)
      url.searchParams.set("part", next === n + 1 ? "end" : String(next))
      url.searchParams.delete("choose")
      window.history.replaceState(null, "", url.toString())
      // The dashboard scrolls inside its own container, not the window;
      // scroll only that, so the page header never slides over the switch.
      if (shellRef.current) scrollParent(shellRef.current).scrollTo({ top: 0 })
      requestAnimationFrame(() => {
        const h = document.getElementById(next >= 1 && next <= n ? `part-title-${partIds[next - 1]}` : "screen-title")
        h?.focus({ preventScroll: true })
      })
    },
    [maxScreen, n, partIds]
  )

  const chooseFormat = async (to: LessonFormat, where: "choice" | "switch") => {
    const from = format
    if (from === to && where === "switch") return
    pauseOtherMedia(null)
    setFormat(to)
    if (where === "choice") setSavingChoice(true)
    const partIndex = screen >= 1 && screen <= n ? screen - 1 : null
    await saveLessonPrefsAction({
      lessonFormat: to,
      log: props.trackingEnabled
        ? { lessonId: lesson.id, sessionId, event: where === "choice" ? "format_chosen" : "format_switched", partIndex, from, where }
        : undefined,
    }).catch(() => null)
    setSavingChoice(false)
  }

  const changeReadAlong = (on: boolean) => {
    setReadAlong(on)
    const partIndex = screen >= 1 && screen <= n ? screen - 1 : null
    void saveLessonPrefsAction({
      readAlong: on,
      log: props.trackingEnabled ? { lessonId: lesson.id, sessionId, event: "read_along", partIndex } : undefined,
    }).catch(() => null)
  }

  const answer = async (partId: string, optionIndex: number) => {
    setPending(partId)
    setAnswerError(null)
    try {
      const prev = checks[partId]
      const res = await answerPartCheckAction({
        lessonId: lesson.id,
        partId,
        optionIndex,
        format,
        sessionId,
        previous: prev ? { tries: prev.tries, wrongTries: prev.wrongTries, answers: [...prev.wrongPicks] } : undefined,
      })
      if (!res.ok) {
        setAnswerError(res.message ?? COPY.answerError)
        return
      }
      setChecks((prev) => {
        const before = prev[partId] ?? EMPTY_CHECK
        const next: ClientCheck = {
          tries: res.tries ?? before.tries + 1,
          wrongTries: res.wrongTries ?? before.wrongTries,
          resolved: Boolean(res.resolved),
          wrongPicks: res.correct ? before.wrongPicks : [...before.wrongPicks, optionIndex],
          rightPick: res.correct ? optionIndex : before.rightPick,
          feedback: res.feedback ?? null,
          reveal: res.reveal ?? before.reveal,
        }
        return { ...prev, [partId]: next }
      })
    } catch {
      setAnswerError(COPY.answerError)
    } finally {
      setPending(null)
    }
  }

  const again = (partIndex: number, from: string) => {
    track("again", partIndex, { from })
    if (format === "watch") {
      const v = videoRef.current
      if (v) {
        v.currentTime = 0
        v.scrollIntoView({ block: "center", inline: "nearest" })
        pauseOtherMedia(v)
        void v.play().catch(() => {})
      }
    } else {
      document.getElementById(`part-title-${partIds[partIndex]}`)?.scrollIntoView({ block: "start" })
      listenRef.current?.restart()
    }
  }

  // ── Choice screen ──────────────────────────────────────────────────────
  const firstPart = parts.parts[0]
  if (!format && firstPart) {
    return (
      <div ref={shellRef} className={styles.shell} data-lesson-parts={lesson.id}>
        <header ref={topbarRef} className={styles.topbar}>
          <div className={styles.topRow}>
            <Link className={styles.courseLink} href={lesson.courseHref}>
              {COPY.backToCourse}
            </Link>
            <span className={styles.topTitle}>{lesson.title}</span>
          </div>
        </header>
        <FormatChoice firstPart={firstPart} busy={savingChoice} onChoose={(f) => void chooseFormat(f, "choice")} />
      </div>
    )
  }

  const activeFormat: LessonFormat = format ?? "read"
  const doneCount = partIds.filter((id) => checks[id]?.resolved).length
  const current = screen >= 1 && screen <= n ? parts.parts[screen - 1] : null

  return (
    <div ref={shellRef} className={styles.shell} data-lesson-parts={lesson.id} data-format={format} data-screen={screen}>
      <header ref={topbarRef} className={styles.topbar}>
        <div className={styles.topRow}>
          <Link className={styles.courseLink} href={lesson.courseHref}>
            {COPY.backToCourse}
          </Link>
          <span className={styles.topTitle}>{lesson.title}</span>
          <div className={styles.switch} role="group" aria-label={COPY.formatSwitchLabel} data-testid="format-switch">
            {(["watch", "read"] as const).map((f) => (
              <button key={f} type="button" aria-pressed={format === f} title={FORMAT_COPY[f].name} onClick={() => void chooseFormat(f, "switch")}>
                {format === f ? `✓ ${FORMAT_COPY[f].short}` : FORMAT_COPY[f].short}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.progress}>
          <ol className={styles.segments} aria-label={COPY.partsDone(doneCount, n)}>
            {parts.parts.map((p, i) => {
              const done = Boolean(checks[p.id]?.resolved)
              const here = screen === i + 1
              const reachable = i + 1 <= maxScreen
              const label = `${COPY.partOf(i + 1, n)}: ${p.title}${done ? `, ${COPY.done}` : ""}${here ? `, ${COPY.youAreHere}` : ""}`
              const cls = cn(styles.segment, done && styles.segmentDone, here && styles.segmentHere)
              return (
                <li key={p.id}>
                  {reachable && !here ? (
                    <button type="button" className={cls} aria-label={label} onClick={() => go(i + 1)} />
                  ) : (
                    <span className={cls} aria-label={label} role="img" aria-current={here ? "step" : undefined} />
                  )}
                </li>
              )
            })}
          </ol>
          <span className={styles.progressText} aria-hidden="true">
            {current ? COPY.partOf(screen, n) : COPY.partsDone(doneCount, n)}
          </span>
        </div>
      </header>

      {screen === 0 ? (
        <IntroScreen
          lesson={lesson}
          parts={parts}
          checks={checks}
          maxScreen={maxScreen}
          returning={props.returning}
          go={go}
        />
      ) : current ? (
        <PartScreen
          key={`${current.id}-${format}`}
          index={screen - 1}
          n={n}
          part={current}
          format={activeFormat}
          readAlong={readAlong}
          onReadAlong={changeReadAlong}
          check={checks[current.id] ?? EMPTY_CHECK}
          pending={pending === current.id}
          error={pending === null ? answerError : null}
          onAnswer={(k) => void answer(current.id, k)}
          onAgain={(from) => again(screen - 1, from)}
          listenRef={listenRef}
          videoRef={videoRef}
          audioEl={audioEl}
          topOffset={topOffset}
          track={track}
          onBack={() => {
            track("back", screen - 1)
            go(screen - 1)
          }}
          onContinue={() => {
            track("continue", screen - 1)
            go(screen + 1)
          }}
          canContinue={Boolean(checks[current.id]?.resolved)}
        />
      ) : (
        <EndScreen
          n={n}
          checks={checks}
          partIds={partIds}
          project={props.project}
          nextLesson={props.nextLesson}
          courseHref={lesson.courseHref}
          track={track}
          onBack={() => go(n)}
        />
      )}
    </div>
  )
}

// ── Introduction ─────────────────────────────────────────────────────────────

function IntroScreen({
  lesson,
  parts,
  checks,
  maxScreen,
  returning,
  go,
}: {
  lesson: PartsLessonViewerProps["lesson"]
  parts: PublicLessonParts
  checks: Record<string, ClientCheck>
  maxScreen: number
  returning: boolean
  go: (screen: number) => void
}) {
  const n = parts.parts.length
  const resumeAt = Math.min(maxScreen, n + 1)
  return (
    <main className={styles.column} data-testid="intro-screen">
      <p className={styles.kicker}>{COPY.lessonLine(lesson.number, n, parts.totalMinutes)}</p>
      <h1 id="screen-title" tabIndex={-1} className={styles.h1} style={{ outline: "none" }}>
        {lesson.title}
      </h1>
      {parts.intro ? (
        <div style={{ margin: "18px 0 26px" }}>
          <video className={styles.video} controls playsInline preload="metadata" poster={parts.intro.poster ?? undefined} aria-label={COPY.introVideo} onPlay={(e) => pauseOtherMedia(e.currentTarget)}>
            <source src={parts.intro.video} type="video/mp4" />
            {parts.intro.captionsUrl ? <track kind="captions" src={parts.intro.captionsUrl} srcLang="en" label="English" default /> : null}
          </video>
        </div>
      ) : null}
      <h2 className={styles.h2} style={{ fontSize: "1.25rem", marginBottom: 0 }}>
        {COPY.inThisLesson}
      </h2>
      <ol className={styles.map}>
        {parts.parts.map((p, i) => {
          const done = Boolean(checks[p.id]?.resolved)
          const reachable = i + 1 <= maxScreen
          const inner = (
            <>
              <span className={cn(styles.mapNum, done && styles.mapNumDone)} aria-hidden="true">
                {done ? "✓" : i + 1}
              </span>
              <span>
                {p.title}
                {done ? <span className="sr-only">, {COPY.done}</span> : null}
              </span>
              <span className={styles.mapMeta}>{done ? `${COPY.done}, ${COPY.minutes(p.minutes)}` : COPY.minutes(p.minutes)}</span>
            </>
          )
          return (
            <li key={p.id}>
              {reachable ? (
                <button type="button" className={styles.mapRow} onClick={() => go(i + 1)}>
                  {inner}
                </button>
              ) : (
                <div className={styles.mapRow}>{inner}</div>
              )}
            </li>
          )
        })}
      </ol>
      <div className={styles.introActions}>
        {returning && resumeAt > 1 ? (
          <button type="button" className={styles.btn} onClick={() => go(resumeAt)}>
            {resumeAt > n ? COPY.reviewEnd : COPY.carryOn(resumeAt)}
          </button>
        ) : (
          <button type="button" className={styles.btn} onClick={() => go(1)} data-testid="start-part-1">
            {COPY.start}
          </button>
        )}
      </div>
    </main>
  )
}

// ── One part ─────────────────────────────────────────────────────────────────

function PartScreen({
  index,
  n,
  part,
  format,
  readAlong,
  onReadAlong,
  check,
  pending,
  error,
  onAnswer,
  onAgain,
  listenRef,
  videoRef,
  audioEl,
  topOffset,
  track,
  onBack,
  onContinue,
  canContinue,
}: {
  index: number
  n: number
  part: PublicLessonParts["parts"][number]
  format: LessonFormat
  readAlong: boolean
  onReadAlong: (on: boolean) => void
  check: ClientCheck
  pending: boolean
  error: string | null
  onAnswer: (k: number) => void
  onAgain: (from: string) => void
  listenRef: React.RefObject<ListenBarHandle | null>
  videoRef: React.RefObject<HTMLVideoElement | null>
  audioEl: HTMLAudioElement | null
  topOffset: () => number
  track: TrackFn
  onBack: () => void
  onContinue: () => void
  canContinue: boolean
}) {
  const isLast = index === n - 1
  const titleId = `part-title-${part.id}`
  const hintId = `continue-hint-${part.id}`
  const confused = useConfused({
    partIndex: index,
    track,
    againLabel: format === "watch" ? COPY.watchPartAgain : COPY.listenAgain,
    onAgain: () => onAgain("confused"),
  })

  return (
    <main className={styles.column} data-testid="part-screen" data-part={part.id}>
      <p className={styles.kicker}>
        {COPY.partOf(index + 1, n)}, {COPY.minutes(part.minutes)}
      </p>

      {format === "read" ? (
        <>
          <ListenBar
            ref={listenRef}
            src={part.read.audio}
            seconds={part.read.seconds}
            readAlong={readAlong}
            onReadAlong={onReadAlong}
            onPlay={(t) => track("media_play", index, { kind: "audio", t })}
            onPause={(t) => track("media_pause", index, { kind: "audio", t })}
            onEnded={() => track("media_ended", index, { kind: "audio" })}
          />
          <PartText
            titleId={titleId}
            title={part.title}
            html={part.html}
            image={part.image}
            audio={audioEl}
            wordsUrl={part.read.wordsUrl}
            readAlongOn={readAlong}
            topOffset={topOffset}
          />
        </>
      ) : (
        <>
          <HtmlBlock as="h2" id={titleId} tabIndex={-1} className={styles.h2} html={escapeTitle(part.title)} />
          <PartVideo
            ref={videoRef}
            src={part.watch.video}
            poster={part.watch.poster}
            captionsUrl={part.watch.captionsUrl}
            label={COPY.partVideo(index + 1)}
            onPlay={(t) => track("media_play", index, { kind: "video", t })}
            onPause={(t) => track("media_pause", index, { kind: "video", t })}
            onEnded={() => track("media_ended", index, { kind: "video" })}
          />
          <details
            className={styles.readInstead}
            onToggle={(e) => {
              if ((e.currentTarget as HTMLDetailsElement).open) track("read_instead", index)
            }}
          >
            <summary>{COPY.readInstead}</summary>
            <div className={styles.readInsteadBody}>
              <PartBody html={part.html} image={part.image} />
            </div>
          </details>
        </>
      )}

      <CheckCard
        partId={part.id}
        question={part.check.question}
        options={part.check.options}
        state={check}
        pending={pending}
        error={error}
        format={format}
        onAnswer={onAnswer}
        onAgain={() => onAgain("check")}
      />

      <div className={styles.foot}>
        {confused.link}
        <div className={styles.footRight}>
          <button type="button" className={styles.ghost} onClick={onBack}>
            {COPY.back}
          </button>
          <button
            type="button"
            className={styles.btn}
            disabled={!canContinue}
            aria-describedby={canContinue ? undefined : hintId}
            onClick={onContinue}
            data-testid="continue"
          >
            {isLast ? COPY.finish : COPY.continue}
          </button>
        </div>
        {canContinue ? null : (
          <p id={hintId} className={styles.hint}>
            {COPY.answerFirst}
          </p>
        )}
      </div>
      {confused.panel}
    </main>
  )
}

function escapeTitle(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

// ── End of the lesson ────────────────────────────────────────────────────────

function EndScreen({
  n,
  checks,
  partIds,
  project,
  nextLesson,
  courseHref,
  track,
  onBack,
}: {
  n: number
  checks: Record<string, ClientCheck>
  partIds: string[]
  project: { html: string } | null
  nextLesson: { title: string; href: string } | null
  courseHref: string
  track: TrackFn
  onBack: () => void
}) {
  const allDone = partIds.every((id) => checks[id]?.resolved)
  return (
    <main className={cn(styles.column, styles.stack)} data-testid="end-screen">
      <div>
        <h1 id="screen-title" tabIndex={-1} className={styles.h1} style={{ outline: "none" }}>
          {allDone ? COPY.finishedTitle : COPY.notFinished}
        </h1>
        {allDone ? <p className={styles.lede}>{project ? COPY.finishedNextProject : COPY.finishedBody}</p> : null}
      </div>
      <RatingCard track={track} lastPart={n - 1} />
      {project ? (
        <section className={styles.panel} aria-labelledby="project-title">
          <h2 id="project-title" className={styles.h2} style={{ fontSize: "1.3rem" }}>
            {COPY.projectTitle}
          </h2>
          <HtmlBlock className={styles.body} html={project.html} />
        </section>
      ) : null}
      <div className={styles.row}>
        <button type="button" className={styles.ghost} onClick={onBack}>
          {COPY.back}
        </button>
        {nextLesson ? (
          <Link className={styles.btn} href={nextLesson.href}>
            {COPY.nextLesson(nextLesson.title)}
          </Link>
        ) : (
          <Link className={styles.btn} href={courseHref}>
            {COPY.backToCourse}
          </Link>
        )}
      </div>
    </main>
  )
}
