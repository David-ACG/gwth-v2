"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { LessonWidgets, type LessonWidgetSurface } from "./lesson-widgets"
import { MarkdownRenderer } from "@/components/shared/markdown-renderer"
import styles from "./lesson-fde.module.css"

/**
 * Public surface name for selecting the initial render of the editorial
 * lesson viewer. `prose` is the default reading state with audio paused;
 * `prose-playing` adds the playing waveform + auto-advance ON; `advancing`
 * also surfaces the 2-second tap-to-stay overlay; `video` renders the intro
 * video page (page 1) with the muted audio bar; `qa` renders the end-of-
 * lesson Q&A; `complete` renders the optional editorial lesson-complete
 * surface; `mobile` is the 412px reading variant. Used by the demo route
 * to verify each surface independently.
 */
export type EditorialLessonSurface =
  | "prose"
  | "prose-playing"
  | "advancing"
  | "video"
  | "qa"
  | "complete"
  | "mobile"

/** Kind tag attached to each lesson page in the outline rail. */
export type EditorialLessonPageKind = "video" | "prose" | "code" | "qa"

/** A single page in the multi-page lesson reading flow. */
export interface EditorialLessonPage {
  /** Page heading shown in the outline rail. */
  title: string
  /** Outline-rail tag (e.g. `"PROSE · 4 MIN"`). */
  kindLabel: string
  /** Page kind, drives body rendering. */
  kind: EditorialLessonPageKind
}

/** A real Q&A question wired into the end-of-lesson surface. */
export interface EditorialLessonQuestion {
  /** The question prompt. */
  question: string
  /** Answer options (rendered A, B, C…). */
  options: string[]
  /** Index of the correct option. */
  correctOptionIndex: number
  /** Optional explanation shown as feedback. */
  explanation?: string
}

/** Static lesson metadata required by the viewer chrome. */
export interface EditorialLessonMeta {
  /** Course month label, e.g. `"MONTH 1 · LESSON 13"`. */
  monthLabel: string
  /** Lesson number within the course month. */
  lessonNumber: number
  /** Lesson display title (no trailing punctuation enforced). */
  title: string
  /** Course-month progress numerator (lessons completed this month). */
  monthCompleted: number
  /** Course-month progress denominator (mandatory lessons this month). */
  monthTotal: number
  /** Ordered list of pages in this lesson. */
  pages: EditorialLessonPage[]
  /**
   * Real lesson body (markdown), imported from Postgres. When present the
   * prose surface renders this instead of the bundled design placeholder.
   */
  learnContent?: string
  /**
   * Real end-of-lesson Q&A, imported from Postgres. When present the Q&A
   * surface renders these instead of the bundled design placeholder.
   */
  questions?: EditorialLessonQuestion[]
}

interface EditorialLessonViewerProps {
  /** Locked lesson metadata and page list. */
  lesson: EditorialLessonMeta
  /** Initial surface to render. Default `"prose"`. */
  initialSurface?: EditorialLessonSurface
  /** 1-indexed page number to start on. Default `1`. */
  initialPage?: number
  /**
   * Initial state for the right-edge widgets (feedback popout +
   * highlight/notes). Default `"none"`. Used by the demo route to render
   * each widget surface against the design bundle.
   */
  initialWidgetSurface?: LessonWidgetSurface
}

const ADVANCING_PING_LABEL = "ADVANCING IN 2S"

/**
 * The editorial Stone & Sage lesson viewer ported from the
 * 2026-05-08 Claude Design bundle (lesson-viewer-design-bundle).
 * Mounts inside the dashboard shell and breaks out of its padding so
 * section borders run edge-to-edge. Owns: outline rail, mast row,
 * lesson chrome, body surface (prose / video / Q&A / lesson-complete /
 * mobile), persistent audio bar with auto-advance state machine.
 */
export function EditorialLessonViewer({
  lesson,
  initialSurface = "prose",
  initialPage = 3,
  initialWidgetSurface = "none",
}: EditorialLessonViewerProps) {
  const [surface, setSurface] = React.useState<EditorialLessonSurface>(
    initialSurface
  )
  const [pageNum] = React.useState(initialPage)
  const [autoAdvance, setAutoAdvance] = React.useState(true)
  const [speed, setSpeed] = React.useState<"1x" | "1.25x" | "1.5x">("1x")

  // Lesson widgets show on prose / prose-playing / advancing only. They
  // don't make sense on the intro video, the Q&A, or the lesson-complete
  // surface, and the mobile surface gets its own mobile-mode widgets.
  const widgetEligible =
    surface === "prose" ||
    surface === "prose-playing" ||
    surface === "advancing"

  if (surface === "mobile") {
    return (
      <div className={styles.shell}>
        <MobileSurface lesson={lesson} autoAdvance={autoAdvance} />
        <LessonWidgets
          lessonNumber={lesson.lessonNumber}
          mobile
          initialSurface={
            initialWidgetSurface === "none"
              ? "mobile-collapsed"
              : initialWidgetSurface
          }
        />
      </div>
    )
  }

  if (surface === "complete") {
    return <LessonCompleteSurface lesson={lesson} />
  }

  const playing = surface === "prose-playing" || surface === "advancing"
  const advancing = surface === "advancing"
  const isVideo = surface === "video"
  const isQa = surface === "qa"
  const currentPage = isVideo ? 1 : isQa ? lesson.pages.length : pageNum

  return (
    <div
      className={cn(
        styles.shell,
        "flex min-h-[calc(100vh-4rem)] flex-col"
      )}
      data-section="lesson-viewer"
    >
      <div className="flex flex-1 min-h-0">
        <OutlineRail
          pages={lesson.pages}
          currentPage={currentPage}
          lessonNumber={lesson.lessonNumber}
        />

        <main className="flex flex-1 min-w-0 flex-col">
          <MastRow
            section={
              isQa
                ? `COURSE · LESSON ${lesson.lessonNumber} · Q&A`
                : `COURSE · LESSON ${lesson.lessonNumber}`
            }
          />

          <div className="flex flex-1 flex-col px-14">
            <LessonChrome
              monthLabel={
                isQa ? `${lesson.monthLabel} · END-OF-LESSON` : lesson.monthLabel
              }
              lessonNumber={lesson.lessonNumber}
              title={
                isQa
                  ? "Q&A: four short questions before this counts."
                  : lesson.title
              }
              pageNum={currentPage}
              pageTotal={lesson.pages.length}
              monthCompleted={lesson.monthCompleted}
              monthTotal={lesson.monthTotal}
            />

            <div className="flex flex-1 justify-center py-9">
              {isVideo ? (
                <VideoPageBody />
              ) : isQa ? (
                lesson.questions && lesson.questions.length > 0 ? (
                  <RealQAPageBody questions={lesson.questions} />
                ) : (
                  <QAPageBody />
                )
              ) : (
                <ProseBody>
                  {lesson.learnContent ? (
                    <MarkdownRenderer content={lesson.learnContent} />
                  ) : (
                    <DefaultProseContent />
                  )}
                </ProseBody>
              )}
            </div>

            {!isVideo && !isQa && (
              <div className="pb-7">
                <div className="mx-auto w-full max-w-[720px]">
                  <PageFooter
                    pageNum={currentPage}
                    pageTotal={lesson.pages.length}
                    advancing={advancing}
                  />
                </div>
              </div>
            )}

            {isVideo && (
              <div className="mx-auto mb-7 w-full max-w-[880px]">
                <PageFooter pageNum={1} pageTotal={lesson.pages.length} />
              </div>
            )}
          </div>

          <AudioBar
            variant={isVideo ? "muted" : playing ? "playing" : "paused"}
            autoAdvance={autoAdvance}
            speed={speed}
            currentTime={playing ? "02:14" : "00:00"}
            totalTime="03:42"
            progress={playing ? 60 : 0}
            onTogglePlay={() =>
              setSurface(playing ? "prose" : "prose-playing")
            }
            onToggleAutoAdvance={() => setAutoAdvance((v) => !v)}
            onChangeSpeed={setSpeed}
          />
        </main>
      </div>

      {widgetEligible && (
        <LessonWidgets
          lessonNumber={lesson.lessonNumber}
          initialSurface={initialWidgetSurface}
        />
      )}

      {/* unused param wired so the linter accepts the controlled state */}
      <span className="sr-only">{`${surface}-${pageNum}`}</span>
    </div>
  )
}

// ─── Outline rail ─────────────────────────────────────────────────────────────

function OutlineRail({
  pages,
  currentPage,
  lessonNumber,
}: {
  pages: EditorialLessonPage[]
  currentPage: number
  lessonNumber: number
}) {
  return (
    <aside className="hidden w-[248px] shrink-0 border-r border-border bg-card px-[22px] py-8 lg:block">
      <div className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        LESSON {String(lessonNumber).padStart(2, "0")} · OUTLINE
      </div>
      <div className="mt-4 flex flex-col">
        {pages.map((page, i) => {
          const n = i + 1
          const state =
            n < currentPage ? "done" : n === currentPage ? "current" : "pending"
          return (
            <div
              key={page.title}
              className={cn(
                "grid grid-cols-[20px_1fr_auto] items-start gap-2.5 border-b border-border py-2.5 pl-1 pr-1",
                i === 0 && "border-t",
                state === "pending" && "opacity-60"
              )}
            >
              <StatusIcon state={state} small />
              <div>
                <div
                  className={cn(
                    "text-[13px] leading-[1.3]",
                    state === "current" ? "font-semibold" : "font-medium"
                  )}
                >
                  {page.title}
                </div>
                <div className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
                  {page.kindLabel}
                </div>
              </div>
              <span className="font-mono text-[10.5px] tabular-nums text-muted-foreground">
                P{String(n).padStart(2, "0")}
              </span>
            </div>
          )
        })}
      </div>
    </aside>
  )
}

// ─── Mast row + lesson chrome ─────────────────────────────────────────────────

function MastRow({ section }: { section: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-10 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
      <span>{section}</span>
      <span>FRI 8 MAY 2026 · 14:24 BST</span>
      <span
        className={cn(
          styles.statusActive,
          "inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
        )}
      >
        <span aria-hidden="true">▸</span>
        Active · Month 1 of 3
      </span>
    </div>
  )
}

function LessonChrome({
  monthLabel,
  lessonNumber,
  title,
  pageNum,
  pageTotal,
  monthCompleted,
  monthTotal,
}: {
  monthLabel: string
  lessonNumber: number
  title: string
  pageNum: number
  pageTotal: number
  monthCompleted: number
  monthTotal: number
}) {
  const lessonPct = ((pageNum - 1) / pageTotal) * 100
  const monthPct = (monthCompleted / monthTotal) * 100
  return (
    <div className="border-b border-border pb-[18px] pt-[22px]">
      <div className="flex items-center justify-between gap-4">
        <div className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {monthLabel}
        </div>
        <div className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          PAGE {pageNum} OF {pageTotal}
        </div>
      </div>
      <h1 className="mt-3 max-w-[720px] text-[32px] font-semibold leading-[1.12] tracking-[-0.02em]">
        {title}
      </h1>

      <div className="mt-[18px] grid grid-cols-2 gap-[18px]">
        <div>
          <div className="mb-1 flex justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <span>LESSON {String(lessonNumber).padStart(2, "0")} PROGRESS</span>
            <span>{Math.round(lessonPct)}%</span>
          </div>
          <SegmentedBar value={pageNum - 1} total={pageTotal} />
        </div>
        <div>
          <div className="mb-1 flex justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <span>MONTH 1 PROGRESS</span>
            <span>
              {monthCompleted} / {monthTotal}
            </span>
          </div>
          <ProgressBar value={monthPct} total={100} />
        </div>
      </div>
    </div>
  )
}

function SegmentedBar({
  value,
  total,
  frozen,
}: {
  value: number
  total: number
  frozen?: boolean
}) {
  return (
    <div
      className="grid gap-[3px]"
      style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-[3px]",
            i < value
              ? frozen
                ? "bg-[var(--v-muted)]"
                : "bg-[var(--v-dash-active)]"
              : "bg-[var(--v-dash)]"
          )}
        />
      ))}
    </div>
  )
}

function ProgressBar({
  value,
  total,
  frozen,
}: {
  value: number
  total: number
  frozen?: boolean
}) {
  const pct = Math.max(0, Math.min(100, total === 0 ? 0 : (value / total) * 100))
  return (
    <div className="relative h-[3px] bg-[var(--v-dash)]">
      <div
        className={cn(
          "absolute inset-y-0 left-0",
          frozen ? "bg-[var(--v-muted)]" : "bg-[var(--v-dash-active)]"
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// ─── Page footer ──────────────────────────────────────────────────────────────

function PageFooter({
  pageNum,
  pageTotal,
  advancing,
}: {
  pageNum: number
  pageTotal: number
  advancing?: boolean
}) {
  return (
    <div className="mt-9 flex items-center justify-between gap-4 border-t border-border pt-[22px]">
      <SharpButton variant="ghost" className="min-w-[160px]">
        <span aria-hidden="true">←</span> PREVIOUS PAGE
      </SharpButton>
      <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
        PAGE {pageNum} OF {pageTotal}
      </div>
      <div className="relative flex min-w-[220px] justify-end">
        {advancing && <AdvancingPing />}
        <SharpButton variant="primary" className="min-w-[220px]">
          CONTINUE <span aria-hidden="true">→</span>
        </SharpButton>
      </div>
    </div>
  )
}

function AdvancingPing() {
  return (
    <div className="absolute bottom-[calc(100%+10px)] right-0 flex items-center gap-2.5 whitespace-nowrap border border-primary bg-card px-3 py-2">
      <span className="size-2 animate-pulse bg-primary" />
      <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-primary">
        {ADVANCING_PING_LABEL}
      </span>
      <span className="text-[12px] text-muted-foreground">·</span>
      <span className="text-[12px] font-semibold text-foreground">
        tap to stay
      </span>
    </div>
  )
}

// ─── Audio bar ────────────────────────────────────────────────────────────────

type AudioBarVariant = "paused" | "playing" | "muted"

function AudioBar({
  variant,
  autoAdvance,
  speed,
  currentTime,
  totalTime,
  progress,
  onTogglePlay,
  onToggleAutoAdvance,
  onChangeSpeed,
}: {
  variant: AudioBarVariant
  autoAdvance: boolean
  speed: "1x" | "1.25x" | "1.5x"
  currentTime: string
  totalTime: string
  progress: number
  onTogglePlay: () => void
  onToggleAutoAdvance: () => void
  onChangeSpeed: (s: "1x" | "1.25x" | "1.5x") => void
}) {
  if (variant === "muted") {
    return (
      <div className="sticky bottom-0 z-[5] border-t border-foreground bg-card px-7 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-8 items-center justify-center border border-border text-muted-foreground">
              <SpeakerOffIcon />
            </span>
            <div>
              <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                NARRATION MUTED FOR VIDEO
              </div>
              <div className="mt-0.5 font-serif text-[13px] italic text-muted-foreground">
                Audio resumes on the next prose page.
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 border border-border bg-transparent px-2.5 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            AUTO-ADVANCE {autoAdvance ? "ON" : "OFF"}
          </span>
        </div>
      </div>
    )
  }

  const playing = variant === "playing"
  return (
    <div className="sticky bottom-0 z-[5] border-t border-foreground bg-card px-7 py-3.5">
      <div className="grid items-center gap-[22px] [grid-template-columns:52px_minmax(0,1fr)_auto_auto_auto]">
        <button
          type="button"
          aria-label={playing ? "Pause" : "Play"}
          onClick={onTogglePlay}
          className={cn(
            "inline-flex size-12 items-center justify-center border",
            playing
              ? "border-primary bg-primary text-primary-foreground"
              : "border-foreground bg-foreground text-background"
          )}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>

        <div className="min-w-0">
          <div className="mb-2 flex items-baseline justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="whitespace-nowrap font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                NOW READING
              </span>
              <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold">
                Page 3 · The brief, in plain English
              </span>
            </div>
            <span className="whitespace-nowrap font-mono text-[11.5px] tabular-nums text-muted-foreground">
              {currentTime} / {totalTime}
            </span>
          </div>
          {playing ? (
            <Waveform progress={progress} />
          ) : (
            <Scrubber progress={progress} />
          )}
        </div>

        <div className="flex border border-border">
          {(["1x", "1.25x", "1.5x"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChangeSpeed(s)}
              className={cn(
                "min-w-[44px] cursor-pointer border-none px-2.5 py-1.5 font-mono text-[11px] font-bold tracking-[0.04em]",
                s === speed
                  ? "bg-foreground text-background"
                  : "bg-transparent text-muted-foreground"
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="h-9 w-px bg-border" />

        <AutoAdvanceToggle on={autoAdvance} onToggle={onToggleAutoAdvance} />
      </div>
    </div>
  )
}

function PlayIcon() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor">
      <polygon points="2,1 13,8 2,15" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor">
      <rect x="1" y="1" width="4" height="14" />
      <rect x="9" y="1" width="4" height="14" />
    </svg>
  )
}

function SpeakerOffIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <path d="M2 4v6h2.5L9 13V1L4.5 4H2zm10 1l-2 2 2 2-1 1-2-2-2 2-1-1 2-2-2-2 1-1 2 2 2-2z" />
    </svg>
  )
}

function Scrubber({ progress }: { progress: number }) {
  return (
    <div className="relative h-1.5 border border-border bg-muted">
      <div
        className="absolute -left-px -top-px -bottom-px bg-foreground"
        style={{ width: `calc(${progress}% + 2px)` }}
      />
      <div
        className="absolute top-1/2 size-[11px] -translate-x-1/2 -translate-y-1/2 bg-foreground"
        style={{ left: `${progress}%` }}
      />
    </div>
  )
}

function Waveform({ progress }: { progress: number }) {
  const bars = React.useMemo(() => {
    const N = 56
    const a: number[] = []
    for (let i = 0; i < N; i++) {
      const v =
        0.4 + Math.abs(Math.sin(i * 0.45) * 0.5) + ((i * 13) % 7) * 0.03
      a.push(Math.min(1, v))
    }
    return a
  }, [])
  const filledIdx = Math.floor(bars.length * (progress / 100))
  return (
    <div className="flex h-7 items-center gap-[2px]">
      {bars.map((v, i) => {
        const isPlayed = i <= filledIdx
        const isHead = i === filledIdx
        return (
          <div
            key={i}
            className={cn(
              "w-[3px]",
              isHead
                ? "animate-pulse bg-primary"
                : isPlayed
                  ? "bg-foreground"
                  : "bg-foreground/35"
            )}
            style={{ height: `${Math.max(10, v * 100).toFixed(2)}%` }}
          />
        )
      })}
    </div>
  )
}

function AutoAdvanceToggle({
  on,
  onToggle,
  compact,
}: {
  on: boolean
  onToggle: () => void
  compact?: boolean
}) {
  return (
    <div className={cn("flex items-center", compact ? "gap-2" : "gap-2.5")}>
      <span
        className={cn(
          "font-mono font-bold uppercase tracking-[0.16em]",
          compact ? "text-[9.5px]" : "text-[10.5px]",
          on ? "text-primary" : "text-muted-foreground"
        )}
      >
        AUTO-ADVANCE
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={onToggle}
        className={cn(
          "relative cursor-pointer border p-0",
          compact ? "h-5 w-[38px]" : "h-6 w-11",
          on ? "border-primary bg-primary" : "border-foreground bg-transparent"
        )}
      >
        <span
          className={cn(
            "absolute top-px bottom-px block",
            compact ? "w-3" : "w-3.5",
            on ? "right-px bg-primary-foreground" : "left-px bg-foreground"
          )}
        />
      </button>
      <span
        className={cn(
          "font-mono font-bold uppercase tracking-[0.16em]",
          compact ? "text-[9.5px]" : "text-[10.5px]",
          on ? "text-primary" : "text-muted-foreground"
        )}
      >
        {on ? "ON" : "OFF"}
      </span>
    </div>
  )
}

// ─── Sharp buttons + status ──────────────────────────────────────────────────

function SharpButton({
  href,
  variant = "primary",
  className,
  children,
  type = "button",
  onClick,
}: {
  href?: string
  variant?: "primary" | "ghost"
  className?: string
  children: React.ReactNode
  type?: "button" | "submit"
  onClick?: () => void
}) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 border px-4.5 py-3 font-mono text-[0.74rem] font-semibold uppercase tracking-[0.14em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ochre)]",
    variant === "primary"
      ? "border-primary bg-primary text-primary-foreground hover:border-[var(--v-teal-deep)] hover:bg-[var(--v-teal-deep)]"
      : "border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background",
    className
  )
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }
  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  )
}

function StatusIcon({
  state,
  small,
}: {
  state: "done" | "current" | "pending" | "locked"
  small?: boolean
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center border",
        small ? "size-4" : "size-[18px]",
        state === "done" && "border-foreground bg-foreground text-background",
        state === "current" &&
          "border-primary bg-primary text-primary-foreground",
        state === "pending" && "border-border bg-transparent",
        state === "locked" && "border-border bg-transparent"
      )}
    >
      {state === "done" && (
        <svg
          width={small ? "9" : "10"}
          height={small ? "9" : "10"}
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M2 5l2 2 4-4" />
        </svg>
      )}
      {state === "current" && (
        <svg
          width={small ? "7" : "8"}
          height={small ? "7" : "8"}
          viewBox="0 0 8 8"
          fill="currentColor"
        >
          <polygon points="2,1 7,4 2,7" />
        </svg>
      )}
    </span>
  )
}

// ─── Prose body + content primitives ──────────────────────────────────────────

function ProseBody({ children }: { children: React.ReactNode }) {
  return <article className={styles.proseBody}>{children}</article>
}

function DefaultProseContent() {
  return (
    <>
      <p className="m-0 text-[1.12rem] leading-[1.6]">
        Yesterday you wrote one paragraph on a sticky note:{" "}
        <span className={styles.accent}>
          the smallest useful tool you wished existed at work last week
        </span>
        . Today you turn that paragraph into something you can actually run.
      </p>

      <p className="mt-5">
        Most people, when they first sit down to build with a model, get stuck
        deciding what to build. They reach for the demo problems, the toy
        chatbot, the joke summariser. The teaching here is the opposite. Your
        first useful tool should be small, embarrassing, and{" "}
        <em className="italic">specific to your own week</em>. Not a
        portfolio piece. A pocket knife.
      </p>

      <PullQuote>
        The brief should fit on a sticky note. If it doesn&rsquo;t, the tool
        will not ship.
      </PullQuote>

      <p>
        Look at what you actually did between Monday and Friday. The repeated
        work, not the interesting work. Stand-up notes that became Jira
        tickets. Inbound emails that became three-line replies. The fortnightly
        slide where you copy six rows out of a spreadsheet. The point is not
        that any of these things are hard, it is that they are boring, and the
        model does not get bored.
      </p>

      <Figure
        label="FIG. 03 · A USEFUL TOOL, ANATOMY"
        caption="Input from somewhere you already are, one model call, output back to where you already are. No new app to open."
      />

      <p>
        Three rules for picking the brief. First: the input has to come from a
        place you already go, an email, a doc, a spreadsheet. Second: the
        output has to land in a place you already look, a Slack message, a
        Notion page, a Calendar event. Third: there is no new tab. If your
        tool needs a new tab, it is a product, not a tool, and you will not
        use it on Wednesday afternoon when you are tired.
      </p>

      <Callout tag="WORKED EXAMPLE">
        Last cohort, the most-shipped lesson-13 build was a five-line script
        that read the latest message in a Gmail label called{" "}
        <span className="bg-muted px-1 font-mono">triage</span>, asked Claude
        for a one-sentence summary, and wrote it back as a draft reply. Forty
        minutes. Saved its author about an hour a week.
      </Callout>

      <p>
        By the end of the next page you will have written your one-paragraph
        brief. By the end of the lesson you will have run the tool against a
        real input from your own week, and decided whether to keep it or
        throw it away.{" "}
        <span className={styles.accent}>Both outcomes count.</span>
      </p>
    </>
  )
}

function PullQuote({ children }: { children: React.ReactNode }) {
  return <blockquote className={styles.pullQuote}>{children}</blockquote>
}

function Figure({
  label,
  caption,
  height = 220,
}: {
  label: string
  caption: string
  height?: number
}) {
  return (
    <figure className="my-7">
      <div
        className="relative flex items-center justify-center border border-foreground"
        style={{
          height,
          background:
            "repeating-linear-gradient(135deg, var(--v-line-soft) 0 12px, var(--v-surface) 12px 24px)",
        }}
      >
        <div className="border border-border bg-card px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </div>
      </div>
      <figcaption className="mt-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  )
}

function Callout({
  tag,
  children,
}: {
  tag: string
  children: React.ReactNode
}) {
  return (
    <aside className="my-[22px] grid grid-cols-[auto_1fr] items-start gap-4 border border-foreground bg-card px-[18px] py-3.5">
      <span
        className="whitespace-nowrap border px-2 py-1 font-mono text-[10.5px] font-bold uppercase tracking-[0.18em]"
        style={{
          color: "var(--v-dash-active)",
          borderColor: "var(--v-dash-active)",
        }}
      >
        {tag}
      </span>
      <div className="text-[14.5px] leading-[1.55] text-foreground">
        {children}
      </div>
    </aside>
  )
}

// ─── Video page ──────────────────────────────────────────────────────────────

function VideoPageBody() {
  return (
    <div className="w-full max-w-[880px]">
      <div className="mb-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        PAGE 1 OF 8 · INTRO VIDEO · 4:12
      </div>
      <h2 className="mb-[18px] max-w-[720px] text-[22px] font-semibold leading-[1.15] tracking-[-0.015em]">
        Why this lesson, in four minutes.
      </h2>

      <div
        className="relative overflow-hidden border border-foreground"
        style={{ aspectRatio: "16 / 9", background: "var(--v-video-bg)" }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            type="button"
            aria-label="Play video"
            className="inline-flex size-[88px] items-center justify-center border-2 border-white text-white"
            style={{ background: "var(--v-video-scrim)" }}
          >
            <svg width="28" height="32" viewBox="0 0 14 16" fill="currentColor">
              <polygon points="2,1 13,8 2,15" />
            </svg>
          </button>
        </div>
        <div className="absolute left-4 top-3.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/85">
          L13 · INTRO · NARR. PALMER
        </div>
        <div className="absolute bottom-3.5 right-4 font-mono text-[11px] tracking-[0.1em] text-white/85">
          03:22 / 04:12
        </div>

        <div className="absolute inset-x-0 bottom-0 px-4 pb-3">
          <div className="relative h-[5px] bg-white/20">
            <div className="absolute left-0 top-0 bottom-0 w-[80%] bg-white" />
            <div
              className="absolute -top-[5px] -bottom-[5px] w-[2px] bg-primary"
              style={{ left: "80%" }}
            />
            <div
              className="absolute -top-[22px] whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.18em]"
              style={{
                left: "80%",
                transform: "translateX(-50%)",
                color: "var(--v-ochre-bright)",
              }}
            >
              80% MARK
            </div>
          </div>
        </div>
      </div>

      <div
        className="mt-[18px] grid grid-cols-[auto_1fr_auto] items-center gap-[18px] border bg-card px-5 py-4"
        style={{
          borderColor: "var(--success)",
        }}
      >
        <StatusIcon state="done" />
        <div>
          <div className="text-[14.5px] font-semibold">
            Counts toward completion.{" "}
            <span className={styles.accent}>
              You passed the 80% mark a moment ago.
            </span>
          </div>
          <div className="mt-0.5 text-[13px] italic text-muted-foreground">
            Lesson completion needs the intro watched to 80% and the Q&amp;A
            passed. One down.
          </div>
        </div>
        <span
          className="font-mono text-[10.5px] font-bold uppercase tracking-[0.18em]"
          style={{ color: "var(--success)" }}
        >
          GATE 1 / 2 · CLEARED
        </span>
      </div>

      <div className="mt-3.5 grid grid-cols-3 border border-border">
        <VideoMeta tag="DURATION" value="4:12" sub="watched 3:22" />
        <VideoMeta
          tag="THRESHOLD"
          value="80%"
          sub="cleared at 3:22"
          bordered
        />
        <VideoMeta
          tag="UP NEXT"
          value="Page 2"
          sub="Picking the right problem"
          bordered
        />
      </div>
    </div>
  )
}

function VideoMeta({
  tag,
  value,
  sub,
  bordered,
}: {
  tag: string
  value: string
  sub: string
  bordered?: boolean
}) {
  return (
    <div
      className={cn(
        "px-[18px] py-3.5",
        bordered && "border-l border-border"
      )}
    >
      <div className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {tag}
      </div>
      <div className="mt-1 text-[22px] font-semibold tabular-nums tracking-[-0.02em]">
        {value}
      </div>
      <div className="text-[12.5px] italic text-muted-foreground">
        {sub}
      </div>
    </div>
  )
}

// ─── Q&A page ────────────────────────────────────────────────────────────────

function QAPageBody() {
  return (
    <div className="w-full max-w-[720px]">
      <p className="m-0 mb-7 text-[17px] italic leading-[1.55] text-muted-foreground">
        Pass three of four to count this lesson toward Month 1.{" "}
        <span className={styles.accent}>
          No clock, no streak, no penalty for retrying.
        </span>
      </p>

      <QAItem
        num={1}
        total={4}
        state="passed"
        prompt="Which best describes the brief you should write for your first useful tool?"
        options={[
          {
            label:
              "A two-page PRD with success metrics and acceptance criteria.",
            state: "idle",
          },
          {
            label:
              "A paragraph that fits on a sticky note, specific to your own week.",
            state: "correct",
          },
          {
            label: "A list of every feature you might add later.",
            state: "idle",
          },
          {
            label: "A demo problem from the course examples.",
            state: "idle",
          },
        ]}
        feedback="Right. Small, embarrassing, specific to your week."
      />

      <QAItem
        num={2}
        total={4}
        state="open"
        prompt="The lesson lists three rules for picking the brief. Which is NOT one of them?"
        options={[
          {
            label: "The input has to come from a place you already go.",
            state: "idle",
          },
          {
            label: "The output has to land in a place you already look.",
            state: "idle",
          },
          {
            label: "The tool must use at least two model calls in a chain.",
            state: "selected",
          },
          { label: "There is no new tab.", state: "idle" },
        ]}
      />

      <QAItem
        num={3}
        total={4}
        state="locked"
        prompt="In the worked example, where did the tool deliver its output?"
        options={[
          { label: "A new dashboard at a new URL.", state: "idle" },
          {
            label:
              "A draft reply inside Gmail, where the input already lived.",
            state: "idle",
          },
          {
            label: "A Notion database labelled “triage”.",
            state: "idle",
          },
          { label: "A weekly Slack digest at 9am.", state: "idle" },
        ]}
      />

      <QAItem
        num={4}
        total={4}
        state="locked"
        prompt="Which outcome does the lesson explicitly say also counts?"
        options={[
          { label: "Shipping the tool to a colleague.", state: "idle" },
          {
            label: "Running the tool then deciding to throw it away.",
            state: "idle",
          },
          {
            label: "Shipping a polished version on the weekend.",
            state: "idle",
          },
          { label: "Posting it to the cohort Slack.", state: "idle" },
        ]}
      />

      <div className="mt-8 flex items-center justify-between border-t border-border pt-[22px]">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
          1 PASSED · 1 SELECTED · 2 PENDING
        </div>
        <SharpButton variant="primary" className="min-w-[240px]">
          SUBMIT Q&amp;A <span aria-hidden="true">→</span>
        </SharpButton>
      </div>
    </div>
  )
}

/**
 * Renders the real, imported end-of-lesson Q&A (from Postgres) using the same
 * editorial QAItem chrome as the design placeholder. Options are shown in the
 * neutral `idle` state — the static viewer does not reveal answers or grade
 * inline; the answer key stays server-side. Falls back to the bundled
 * `QAPageBody` when no questions are imported.
 */
function RealQAPageBody({
  questions,
}: {
  questions: EditorialLessonQuestion[]
}) {
  return (
    <div className="w-full max-w-[720px]">
      <p className="m-0 mb-7 text-[17px] italic leading-[1.55] text-muted-foreground">
        {questions.length} short question{questions.length === 1 ? "" : "s"}{" "}
        before this counts toward Month 1.{" "}
        <span className={styles.accent}>
          No clock, no streak, no penalty for retrying.
        </span>
      </p>

      {questions.map((q, i) => (
        <QAItem
          key={i}
          num={i + 1}
          total={questions.length}
          state="open"
          prompt={q.question}
          options={q.options.map((label) => ({
            label,
            state: "idle" as const,
          }))}
        />
      ))}

      <div className="mt-8 flex items-center justify-between border-t border-border pt-[22px]">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
          {questions.length} QUESTION{questions.length === 1 ? "" : "S"}
        </div>
        <SharpButton variant="primary" className="min-w-[240px]">
          SUBMIT Q&amp;A <span aria-hidden="true">→</span>
        </SharpButton>
      </div>
    </div>
  )
}

type QAOptionState = "idle" | "selected" | "correct" | "wrong"

function QAItem({
  num,
  total,
  prompt,
  options,
  state,
  feedback,
}: {
  num: number
  total: number
  prompt: string
  options: { label: string; state: QAOptionState }[]
  state: "passed" | "open" | "locked"
  feedback?: string
}) {
  const isPassed = state === "passed"
  const isLocked = state === "locked"
  return (
    <div
      className={cn(
        "mb-[22px] border bg-card px-[22px] py-5",
        isPassed ? "border-[var(--success)]" : "border-foreground",
        isLocked && "opacity-55"
      )}
    >
      <div className="mb-2.5 flex items-center justify-between">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
          QUESTION {num} OF {total}
        </div>
        {isPassed && (
          <span
            className="inline-flex items-center gap-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.14em]"
            style={{ color: "var(--success)" }}
          >
            <svg
              width="9"
              height="9"
              viewBox="0 0 10 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            >
              <path d="M2 5l2 2 4-4" />
            </svg>
            CORRECT
          </span>
        )}
      </div>
      <div className="mb-4 text-[17px] font-semibold leading-[1.4]">
        {prompt}
      </div>
      <div className="flex flex-col gap-2">
        {options.map((o, i) => (
          <QAOption
            key={i}
            label={o.label}
            state={o.state}
            letter={String.fromCharCode(65 + i)}
          />
        ))}
      </div>
      {feedback && (
        <div
          className="mt-3.5 border-l-2 bg-[var(--v-bg)] px-3.5 py-2.5 text-[14.5px] font-medium italic text-foreground"
          style={{
            borderColor: "var(--success)",
          }}
        >
          {feedback}
        </div>
      )}
    </div>
  )
}

function QAOption({
  letter,
  label,
  state,
}: {
  letter: string
  label: string
  state: QAOptionState
}) {
  const optionStyles = {
    idle: { border: "border-foreground", bg: "bg-transparent" },
    selected: { border: "border-foreground", bg: "bg-muted" },
    correct: {
      border: "border-[var(--success)]",
      bg: "bg-[var(--v-bg)]",
    },
    wrong: {
      border: "border-[var(--destructive)]",
      bg: "bg-[var(--v-bg)]",
    },
  }[state]
  return (
    <div
      className={cn(
        "grid cursor-pointer grid-cols-[32px_1fr_auto] items-center gap-3.5 border px-3.5 py-3",
        optionStyles.border,
        optionStyles.bg
      )}
    >
      <span className="inline-flex size-[26px] items-center justify-center border border-foreground font-mono text-[11px] font-bold tracking-[0.06em]">
        {letter}
      </span>
      <div className="text-[14.5px] leading-[1.45] text-foreground">
        {label}
      </div>
      {state === "correct" && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 10 10"
          fill="none"
          stroke="var(--success)"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <path d="M2 5l2 2 4-4" />
        </svg>
      )}
      {state === "selected" && (
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          SELECTED
        </span>
      )}
      {state === "idle" && <span className="w-4" />}
    </div>
  )
}

// ─── Lesson-complete editorial state ─────────────────────────────────────────

function LessonCompleteSurface({ lesson }: { lesson: EditorialLessonMeta }) {
  return (
    <div
      className={cn(
        styles.shell,
        "flex min-h-[calc(100vh-4rem)] flex-col"
      )}
    >
      <MastRow
        section={`COURSE · LESSON ${lesson.lessonNumber} · COMPLETE`}
      />
      <div className="flex flex-1 items-center justify-center px-14 py-10">
        <div className="w-full max-w-[920px]">
          <div className="mb-6 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {lesson.monthLabel} · COMPLETE
          </div>

          <h1 className="m-0 text-[clamp(3rem,8vw,5.5rem)] font-medium italic leading-[1.05] tracking-[-0.02em]">
            Lesson complete.
          </h1>

          <p className="mt-6 max-w-[600px] text-[17px] leading-[1.55] text-muted-foreground">
            Intro watched to <span className={styles.accent}>92%</span>.
            Q&amp;A passed <span className={styles.accent}>4 of 4</span>. This
            counts toward Month 1.
          </p>

          <div className="mt-9 grid grid-cols-[1.4fr_1fr] border border-foreground">
            <div className="px-7 py-7">
              <div className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                UP NEXT · LESSON {lesson.lessonNumber + 1}
              </div>
              <div className="mt-2 text-[26px] font-semibold leading-[1.15] tracking-[-0.015em]">
                Q&amp;A: when to reach for which model.
              </div>
              <div className="mt-2 text-[14px] italic text-muted-foreground">
                9 minutes. Three pages, no video. Picks up where this one
                stopped.
              </div>
              <div className="mt-[22px] flex gap-2.5">
                <SharpButton variant="primary" className="min-w-[220px]">
                  START LESSON {lesson.lessonNumber + 1}{" "}
                  <span aria-hidden="true">→</span>
                </SharpButton>
                <SharpButton variant="ghost">BACK TO COURSE</SharpButton>
              </div>
            </div>
            <div className="border-l border-foreground bg-card px-7 py-7">
              <div className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                MONTH 1 PROGRESS
              </div>
              <div className="mt-1.5 text-[56px] font-semibold tabular-nums tracking-[-0.03em]">
                {lesson.monthCompleted + 1}
                <span className="text-[22px] text-muted-foreground">
                  {" "}
                  / {lesson.monthTotal}
                </span>
              </div>
              <div className="mt-3">
                <SegmentedBar
                  value={lesson.monthCompleted + 1}
                  total={lesson.monthTotal}
                />
              </div>
              <div className="mt-2.5 text-[13px] italic text-muted-foreground">
                {Math.max(0, lesson.monthTotal - lesson.monthCompleted - 1)}{" "}
                mandatory lessons left. On the five-hour rhythm, two and a
                quarter weeks.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Mobile (412px) surface ──────────────────────────────────────────────────

function MobileSurface({
  lesson,
  autoAdvance,
}: {
  lesson: EditorialLessonMeta
  autoAdvance: boolean
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[412px] flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <button
          type="button"
          aria-label="Previous page"
          className="inline-flex size-8 items-center justify-center border border-border bg-transparent text-muted-foreground"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M9 2L4 7l5 5" />
          </svg>
        </button>
        <span className="text-[16px] font-bold tracking-[-0.02em]">
          GWTH<span className="text-[var(--v-ochre)]">.ai</span>
        </span>
        <button
          type="button"
          aria-label="Lesson outline"
          className="relative inline-flex size-8 items-center justify-center border border-border bg-transparent text-foreground"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M2 4h10M2 7h10M2 10h7" />
          </svg>
          <span className="absolute -right-1 -top-1 bg-primary px-1 font-mono text-[8.5px] font-bold tracking-[0.06em] text-primary-foreground">
            3/{lesson.pages.length}
          </span>
        </button>
      </div>

      <div className="border-b border-border px-[22px] py-4">
        <div className="flex items-center justify-between">
          <div className="font-mono text-[9.5px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {lesson.monthLabel}
          </div>
          <div className="font-mono text-[9.5px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            P3 / {lesson.pages.length}
          </div>
        </div>
        <h1 className="my-2 mb-3.5 text-[22px] font-semibold leading-[1.2] tracking-[-0.02em]">
          {lesson.title}
        </h1>
        <SegmentedBar value={2} total={lesson.pages.length} />
      </div>

      <div className="flex-1 px-[22px] py-5">
        <p className="m-0 text-[15.5px] leading-[1.7] text-[var(--v-soft)]">
          Yesterday you wrote one paragraph on a sticky note:{" "}
          <span className={styles.accent}>
            the smallest useful tool you wished existed at work last week
          </span>
          . Today you turn that paragraph into something you can actually run.
        </p>
        <p className="mt-4 text-[15.5px] leading-[1.7] text-[var(--v-soft)]">
          Most people, when they first sit down to build with a model, get
          stuck deciding what to build. The teaching here is the opposite.
          Your first useful tool should be small, embarrassing, and{" "}
          <em className="italic">specific to your own week</em>.
        </p>

        <blockquote className={cn(styles.pullQuote, "text-[17px]")}>
          The brief should fit on a sticky note. If it doesn&rsquo;t, the tool
          will not ship.
        </blockquote>

        <p className="text-[15.5px] leading-[1.7] text-[var(--v-soft)]">
          Look at what you actually did between Monday and Friday. The
          repeated work, not the interesting work. The point is not that any
          of these things are hard, it is that they are boring, and the model
          does not get bored.
        </p>

        <div className="mt-7 border-t border-border pt-[22px]">
          <SharpButton variant="primary" className="w-full justify-center">
            CONTINUE <span aria-hidden="true">→</span>
          </SharpButton>
        </div>
      </div>

      <div className="sticky bottom-0 z-[5] border-t border-foreground bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Pause"
            className="inline-flex size-10 shrink-0 items-center justify-center border border-primary bg-primary text-primary-foreground"
          >
            <PauseIcon />
          </button>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex justify-between">
              <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-semibold">
                P3 · The brief, in plain English
              </span>
              <span className="whitespace-nowrap font-mono text-[10.5px] tabular-nums text-muted-foreground">
                02:14 / 03:42
              </span>
            </div>
            <Waveform progress={60} />
          </div>
        </div>
        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex border border-border">
            {(["1x", "1.25x", "1.5x"] as const).map((s, i) => (
              <button
                key={s}
                type="button"
                className={cn(
                  "min-w-[38px] cursor-pointer border-none px-2 py-1 font-mono text-[10.5px] font-bold",
                  i === 0
                    ? "bg-foreground text-background"
                    : "bg-transparent text-muted-foreground"
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <AutoAdvanceToggle on={autoAdvance} onToggle={() => {}} compact />
        </div>
      </div>
    </div>
  )
}
