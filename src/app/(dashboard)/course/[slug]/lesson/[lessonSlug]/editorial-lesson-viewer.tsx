"use client"

import * as React from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { mediaUrl } from "@/lib/media/url"
import { useProgress } from "@/hooks/use-progress"
import {
  getLessonCompletionStatus,
  INTRO_VIDEO_COMPLETION_THRESHOLD,
  QUIZ_PASS_SCORE,
} from "@/lib/progress/completion"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { LessonWidgets, type LessonWidgetSurface } from "./lesson-widgets"
import { MarkdownRenderer } from "@/components/shared/markdown-renderer"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { LogoGwth } from "@/components/marketing/redesign/logo-gwth"
import type { LessonProgress } from "@/lib/types"
import styles from "./lesson-fde.module.css"

// The video player is heavy (native <video> + controls chrome); load it only
// when a lesson actually renders the intro-video surface.
const VideoPlayer = dynamic(
  () =>
    import("@/components/shared/video-player").then((m) => m.VideoPlayer),
  { loading: () => <Skeleton className="aspect-video w-full rounded-none" /> }
)

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
  /**
   * Markdown for this prose/code page's body. Derived per `##` section of the
   * lesson (gwth-launch-qar), so pagination renders one real section at a time
   * instead of the whole body on one page. Absent for video/qa pages.
   */
  content?: string
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

/** Summary of the next lesson, used by the lesson-complete surface. */
export interface EditorialNextLesson {
  /** Next lesson display title. */
  title: string
  /** In-app href to the next lesson. */
  href: string
  /**
   * The next lesson's own number within its month/section. Not
   * necessarily the current lesson's number + 1 — the next lesson can
   * begin a new section/month where the order resets to 1.
   */
  lessonNumber: number
}

/** Static lesson metadata required by the viewer chrome. */
export interface EditorialLessonMeta {
  /** Lesson id, the key every progress write is recorded under. */
  id: string
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
  /**
   * Lesson narration audio reference as stored on the lesson row. Resolved
   * through `mediaUrl()` at render time; when absent the audio bar renders
   * an honest "narration not available" state instead of a fake player.
   */
  audioFileUrl?: string | null
  /** Narration duration in seconds, shown before audio metadata loads. */
  audioDuration?: number | null
  /**
   * Intro video reference as stored on the lesson row. Resolved through
   * `mediaUrl()`; drives the real player on the intro-video surface.
   */
  introVideoUrl?: string | null
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
  /**
   * The user's persisted progress row for this lesson (null when the lesson
   * was never started). Seeds the optimistic `useProgress` state so the
   * video gate and Q&A pick up where the user left off.
   */
  initialProgress?: LessonProgress | null
  /** Next lesson in course order, for the lesson-complete surface. */
  nextLesson?: EditorialNextLesson | null
  /** Href back to the parent course page. */
  courseHref?: string
}

const ADVANCING_PING_LABEL = "ADVANCING IN 2S"

/** Milliseconds the tap-to-stay overlay shows before auto-advancing. */
const AUTO_ADVANCE_DELAY_MS = 2000

/** Audio bar speeds mapped to the HTMLMediaElement playbackRate they set. */
const AUDIO_SPEEDS: Record<"1x" | "1.25x" | "1.5x", number> = {
  "1x": 1,
  "1.25x": 1.25,
  "1.5x": 1.5,
}

/** Formats seconds as the audio bar's `MM:SS` readout (e.g. `02:14`). */
function formatClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "00:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

/**
 * The editorial Stone & Sage lesson viewer ported from the
 * 2026-05-08 Claude Design bundle (lesson-viewer-design-bundle).
 * Mounts inside the dashboard shell and breaks out of its padding so
 * section borders run edge-to-edge. Owns: outline rail, mast row,
 * lesson chrome, body surface (prose / video / Q&A / lesson-complete /
 * mobile), persistent audio bar with auto-advance state machine.
 *
 * W13: media and persistence are real. The audio bar drives an actual
 * `<audio>` element (src via `mediaUrl()`), the intro-video surface renders
 * the shared `VideoPlayer`, and both the video 80% gate and the Q&A result
 * persist through `useProgress` → `updateLessonProgressAction` → the
 * `lesson_progress` table (the W7-tested write path).
 */
export function EditorialLessonViewer({
  lesson,
  initialSurface = "prose",
  initialPage = 1,
  initialWidgetSurface = "none",
  initialProgress = null,
  nextLesson = null,
  courseHref,
}: EditorialLessonViewerProps) {
  const [surface, setSurface] = React.useState<EditorialLessonSurface>(
    initialSurface
  )
  const [pageNum, setPageNum] = React.useState(initialPage)
  const [autoAdvance, setAutoAdvance] = React.useState(true)
  const [speed, setSpeed] = React.useState<"1x" | "1.25x" | "1.5x">("1x")
  // Mobile outline sheet (main responsive render). The desktop OutlineRail is
  // `hidden lg:block`; below lg the mast row exposes a hamburger that opens
  // this sheet with the same items.
  const [outlineOpen, setOutlineOpen] = React.useState(false)

  // Persistence: the same optimistic wrapper over the W7-tested
  // updateLessonProgressAction that the rest of the app uses. No second
  // write path.
  const { progress, markComplete, submitQuizScore, updateIntroVideoProgress } =
    useProgress(initialProgress)

  // ── Narration audio engine ────────────────────────────────────────────
  const audioSrc = mediaUrl(lesson.audioFileUrl) || null
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const [audioTime, setAudioTime] = React.useState(0)
  const [audioDur, setAudioDur] = React.useState(lesson.audioDuration ?? 0)
  const advanceTimer = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  )

  // handleEnded fires from a native listener attached once per audio source.
  // Read the live page/auto-advance state through refs so the listener sees
  // fresh values without re-subscribing every render.
  const pageNumRef = React.useRef(pageNum)
  pageNumRef.current = pageNum
  const autoAdvanceRef = React.useRef(autoAdvance)
  autoAdvanceRef.current = autoAdvance

  function cancelAdvance() {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current)
      advanceTimer.current = null
    }
    setSurface((s) => (s === "advancing" ? "prose" : s))
  }

  function goToPage(n: number) {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current)
      advanceTimer.current = null
    }
    const clamped = Math.min(Math.max(n, 1), lesson.pages.length)
    const kind = lesson.pages[clamped - 1]?.kind
    setPageNum(clamped)
    if (kind === "video" || kind === "qa") {
      // Narration mutes for the video page and stops for the Q&A.
      audioRef.current?.pause()
      setSurface(kind === "video" ? "video" : "qa")
    } else {
      setSurface(
        audioRef.current && !audioRef.current.paused ? "prose-playing" : "prose"
      )
    }
  }

  // Attach media listeners natively (media events don't bubble through
  // React), re-subscribing when the audio source changes so the listeners
  // always target the current element.
  React.useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    function handleTimeUpdate() {
      setAudioTime(audio!.currentTime)
    }
    function handleLoadedMetadata() {
      if (Number.isFinite(audio!.duration) && audio!.duration > 0) {
        setAudioDur(audio!.duration)
      }
    }
    function handlePlay() {
      setSurface((s) => (s === "prose" ? "prose-playing" : s))
    }
    function handlePause() {
      setSurface((s) => (s === "prose-playing" ? "prose" : s))
    }
    function handleEnded() {
      const next = pageNumRef.current + 1
      if (autoAdvanceRef.current && lesson.pages[next - 1]?.kind === "prose") {
        setSurface("advancing")
        advanceTimer.current = setTimeout(() => goToPage(next), AUTO_ADVANCE_DELAY_MS)
      }
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)
    audio.addEventListener("ended", handleEnded)
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
      audio.removeEventListener("ended", handleEnded)
    }
    // Listeners are keyed to the audio source; page/auto-advance state is
    // read live through refs inside handleEnded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioSrc])

  // Playback speed applies to the live element whenever the user changes it.
  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = AUDIO_SPEEDS[speed]
    }
  }, [speed])

  // Clear any pending auto-advance timer on unmount so it can't fire
  // goToPage() (a state update / navigation) against an unmounted viewer.
  React.useEffect(() => {
    return () => {
      if (advanceTimer.current) {
        clearTimeout(advanceTimer.current)
        advanceTimer.current = null
      }
    }
  }, [])

  function handleTogglePlay() {
    const audio = audioRef.current
    if (!audio || !audioSrc) return
    if (surface === "advancing") cancelAdvance()
    if (audio.paused) {
      void audio.play().catch(() => {
        toast.error("The narration audio could not be played.")
      })
    } else {
      audio.pause()
    }
  }

  function handleSeek(fraction: number) {
    const audio = audioRef.current
    if (!audio || !audioDur) return
    audio.currentTime = Math.max(0, Math.min(1, fraction)) * audioDur
  }

  // ── Intro-video 80% gate ──────────────────────────────────────────────
  const persistedWatched = progress?.introVideoProgress ?? 0
  const [liveWatched, setLiveWatched] = React.useState(persistedWatched)
  const watchedFraction = Math.max(persistedWatched, liveWatched)
  const videoGateReported = React.useRef(
    persistedWatched >= INTRO_VIDEO_COMPLETION_THRESHOLD
  )

  function handleIntroVideoProgress(fraction: number) {
    setLiveWatched((prev) => Math.max(prev, fraction))
    if (
      fraction >= INTRO_VIDEO_COMPLETION_THRESHOLD &&
      !videoGateReported.current
    ) {
      videoGateReported.current = true
      updateIntroVideoProgress(lesson.id, fraction)
    }
  }

  // ── Q&A + completion ──────────────────────────────────────────────────
  const [lastQuizScore, setLastQuizScore] = React.useState<number | null>(
    null
  )
  const bestQuizScore = Math.max(
    progress?.bestQuizScore ?? 0,
    lastQuizScore ?? 0
  )
  const completionStatus = getLessonCompletionStatus({
    hasIntroVideo: Boolean(lesson.introVideoUrl),
    questionCount: lesson.questions?.length ?? 0,
    introVideoProgress: watchedFraction,
    bestQuizScore: lastQuizScore === null && !progress ? null : bestQuizScore,
  })

  function handleQuizSubmit(score: number) {
    setLastQuizScore(score)
    submitQuizScore(lesson.id, score)
    if (score >= QUIZ_PASS_SCORE) {
      toast.success(`Q&A passed at ${score}%. Saved to your progress.`)
    } else {
      toast.error(
        `Score ${score}%. You need ${QUIZ_PASS_SCORE}% to pass. Retry when ready.`
      )
    }
  }

  function handleFinishLesson() {
    if (!completionStatus.canComplete) {
      toast.error(
        completionStatus.missingReasons[0] ?? "Lesson is not ready to complete yet"
      )
      return
    }
    markComplete(lesson.id)
    setSurface("complete")
  }

  // Lesson widgets show on prose / prose-playing / advancing only. They
  // don't make sense on the intro video, the Q&A, or the lesson-complete
  // surface, and the mobile surface gets its own mobile-mode widgets.
  const widgetEligible =
    surface === "prose" ||
    surface === "prose-playing" ||
    surface === "advancing"

  const playing = surface === "prose-playing" || surface === "advancing"
  const audioProgressPct = audioDur > 0 ? (audioTime / audioDur) * 100 : 0
  const audioElement = (
    <audio ref={audioRef} src={audioSrc ?? undefined} preload="metadata" />
  )

  if (surface === "mobile") {
    return (
      <div className={styles.shell}>
        {audioElement}
        <MobileSurface
          lesson={lesson}
          pageNum={pageNum}
          playing={playing}
          audioAvailable={Boolean(audioSrc)}
          currentTime={formatClock(audioTime)}
          totalTime={formatClock(audioDur)}
          progressPct={audioProgressPct}
          onTogglePlay={handleTogglePlay}
          speed={speed}
          onChangeSpeed={setSpeed}
          autoAdvance={autoAdvance}
          onToggleAutoAdvance={() => setAutoAdvance((v) => !v)}
          onSelectPage={(n) =>
            setPageNum(Math.min(Math.max(n, 1), lesson.pages.length))
          }
        />
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
    return (
      <LessonCompleteSurface
        lesson={lesson}
        introWatchedPct={Math.round(watchedFraction * 100)}
        quizScorePct={bestQuizScore}
        nextLesson={nextLesson}
        courseHref={courseHref}
      />
    )
  }

  const advancing = surface === "advancing"
  const isVideo = surface === "video"
  const isQa = surface === "qa"
  const currentPage = isVideo ? 1 : isQa ? lesson.pages.length : pageNum
  const videoCleared = watchedFraction >= INTRO_VIDEO_COMPLETION_THRESHOLD
  const quizPassed = bestQuizScore >= QUIZ_PASS_SCORE

  return (
    <div
      className={cn(
        styles.shell,
        "flex min-h-[calc(100vh-4rem)] flex-col"
      )}
      data-section="lesson-viewer"
    >
      {audioElement}
      <div className="flex flex-1 min-h-0">
        <OutlineRail
          pages={lesson.pages}
          currentPage={currentPage}
          lessonNumber={lesson.lessonNumber}
          onSelectPage={goToPage}
        />

        <OutlineSheet
          open={outlineOpen}
          onOpenChange={setOutlineOpen}
          pages={lesson.pages}
          currentPage={currentPage}
          lessonNumber={lesson.lessonNumber}
          onSelectPage={goToPage}
        />

        <main className="flex flex-1 min-w-0 flex-col">
          <MastRow
            section={
              isQa
                ? `COURSE · LESSON ${lesson.lessonNumber} · Q&A`
                : `COURSE · LESSON ${lesson.lessonNumber}`
            }
            currentPage={currentPage}
            pageTotal={lesson.pages.length}
            onOpenOutline={() => setOutlineOpen(true)}
            outlineOpen={outlineOpen}
          />

          <div className="flex flex-1 flex-col px-14">
            <LessonChrome
              monthLabel={
                isQa ? `${lesson.monthLabel} · END-OF-LESSON` : lesson.monthLabel
              }
              lessonNumber={lesson.lessonNumber}
              title={
                isQa
                  ? `Q&A: ${lesson.questions?.length ?? 4} short questions before this counts.`
                  : lesson.title
              }
              pageNum={currentPage}
              pageTotal={lesson.pages.length}
              monthCompleted={lesson.monthCompleted}
              monthTotal={lesson.monthTotal}
              videoFraction={watchedFraction}
              videoCleared={videoCleared}
              quizPassed={quizPassed}
            />

            <div className="flex flex-1 justify-center py-9">
              {isVideo ? (
                <VideoPageBody
                  videoUrl={mediaUrl(lesson.introVideoUrl) || null}
                  lessonTitle={lesson.title}
                  pageTitle={lesson.pages[0]?.title ?? "Why this lesson exists"}
                  pageTotal={lesson.pages.length}
                  cleared={videoCleared}
                  onProgressChange={handleIntroVideoProgress}
                />
              ) : isQa ? (
                lesson.questions && lesson.questions.length > 0 ? (
                  <RealQAPageBody
                    questions={lesson.questions}
                    onSubmit={handleQuizSubmit}
                    onFinish={handleFinishLesson}
                    canFinish={completionStatus.canComplete}
                    missingReason={completionStatus.missingReasons[0] ?? null}
                  />
                ) : (
                  <QAPageBody />
                )
              ) : (
                <ProseBody>
                  {(() => {
                    // Render only the current page's section (gwth-launch-qar):
                    // pagination now moves through real `##` sections. Fall back
                    // to the whole body, then the design placeholder, so a
                    // lesson with no per-page content still renders.
                    const pageContent = lesson.pages[currentPage - 1]?.content
                    const body = pageContent ?? lesson.learnContent
                    return body ? (
                      <MarkdownRenderer content={body} />
                    ) : (
                      <DefaultProseContent />
                    )
                  })()}
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
                    onPrev={() => goToPage(currentPage - 1)}
                    onNext={() =>
                      currentPage >= lesson.pages.length
                        ? handleFinishLesson()
                        : goToPage(currentPage + 1)
                    }
                    onCancelAdvance={cancelAdvance}
                    prevDisabled={currentPage <= 1}
                    nextLabel={
                      currentPage >= lesson.pages.length
                        ? "FINISH LESSON"
                        : "CONTINUE"
                    }
                  />
                </div>
              </div>
            )}

            {isVideo && (
              <div className="mx-auto mb-7 w-full max-w-[880px]">
                <PageFooter
                  pageNum={1}
                  pageTotal={lesson.pages.length}
                  onNext={() => goToPage(2)}
                  prevDisabled
                  nextVariant={videoCleared ? "primary" : "ghost"}
                  nextTick={videoCleared}
                />
              </div>
            )}
          </div>

          <AudioBar
            variant={
              isVideo
                ? "muted"
                : !audioSrc
                  ? "unavailable"
                  : playing
                    ? "playing"
                    : "paused"
            }
            autoAdvance={autoAdvance}
            speed={speed}
            nowReading={lesson.title}
            currentTime={formatClock(audioTime)}
            totalTime={formatClock(audioDur)}
            progress={audioProgressPct}
            onTogglePlay={handleTogglePlay}
            onSeek={handleSeek}
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
    </div>
  )
}

// ─── Outline rail ─────────────────────────────────────────────────────────────

function OutlineRail({
  pages,
  currentPage,
  lessonNumber,
  onSelectPage,
}: {
  pages: EditorialLessonPage[]
  currentPage: number
  lessonNumber: number
  /** Jump straight to a page (1-indexed) from the rail. */
  onSelectPage?: (page: number) => void
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
            <button
              key={page.title}
              type="button"
              onClick={() => onSelectPage?.(n)}
              aria-current={state === "current" ? "page" : undefined}
              className={cn(
                "grid w-full cursor-pointer grid-cols-[20px_1fr_auto] items-start gap-2.5 border-x-0 border-b border-t-0 border-solid border-border bg-transparent py-2.5 pl-1 pr-1 text-left transition-colors hover:bg-muted",
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
            </button>
          )
        })}
      </div>
    </aside>
  )
}

// ─── Mobile outline sheet ─────────────────────────────────────────────────────

/**
 * Mobile presentation of the outline. Mirrors {@link OutlineRail} in a shadcn
 * bottom `Sheet` (same pattern as the lesson-widgets mobile feedback sheet).
 * Tapping an item jumps to that page and closes the sheet. Keyboard: Up/Down
 * or J/K move a highlight cursor, Enter jumps, Esc closes (Esc + focus-trap
 * are handled by the underlying Radix dialog). The audio-scrubber arrow keys
 * live on their own focused `role="slider"` element and are untouched.
 *
 * The sheet renders in a portal outside the viewer's `.shell`, so it re-applies
 * `styles.shell` to keep the FDE `--v-*` token remap (background, border,
 * primary, ring, serif) on-register.
 */
function OutlineSheet({
  open,
  onOpenChange,
  pages,
  currentPage,
  lessonNumber,
  onSelectPage,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  pages: EditorialLessonPage[]
  currentPage: number
  lessonNumber: number
  onSelectPage: (page: number) => void
}) {
  // Highlight cursor for keyboard navigation, seeded to the current page each
  // time the sheet opens.
  const [cursor, setCursor] = React.useState(currentPage)
  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([])

  React.useEffect(() => {
    if (open) setCursor(currentPage)
  }, [open, currentPage])

  // Move DOM focus to the highlighted item so it scrolls into view and reads
  // to assistive tech; only while the sheet is open.
  React.useEffect(() => {
    if (open) itemRefs.current[cursor - 1]?.focus()
  }, [open, cursor])

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowDown" || e.key === "j" || e.key === "J") {
      e.preventDefault()
      setCursor((c) => Math.min(pages.length, c + 1))
    } else if (e.key === "ArrowUp" || e.key === "k" || e.key === "K") {
      e.preventDefault()
      setCursor((c) => Math.max(1, c - 1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      onSelectPage(cursor)
      onOpenChange(false)
    }
    // Esc closes via Radix; other keys pass through.
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        onKeyDown={handleKeyDown}
        className={cn(
          styles.shell,
          "max-h-[80vh] gap-0 overflow-y-auto border-t border-border bg-card p-0"
        )}
      >
        <SheetHeader className="border-b border-border px-[22px] py-4">
          <SheetTitle className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            LESSON {String(lessonNumber).padStart(2, "0")} · OUTLINE
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col px-[22px] pb-[max(2rem,env(safe-area-inset-bottom))]">
          {pages.map((page, i) => {
            const n = i + 1
            const state =
              n < currentPage ? "done" : n === currentPage ? "current" : "pending"
            return (
              <button
                key={page.title}
                ref={(el) => {
                  itemRefs.current[i] = el
                }}
                type="button"
                onClick={() => {
                  onSelectPage(n)
                  onOpenChange(false)
                }}
                aria-current={state === "current" ? "page" : undefined}
                className={cn(
                  "grid w-full cursor-pointer grid-cols-[20px_1fr_auto] items-start gap-2.5 border-x-0 border-b border-t-0 border-solid border-border bg-transparent py-3 pl-1 pr-1 text-left transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--v-ochre)]",
                  i === 0 && "border-t",
                  n === cursor && "bg-muted",
                  state === "pending" && "opacity-60"
                )}
              >
                <StatusIcon state={state} small />
                <div>
                  <div
                    className={cn(
                      "text-[14px] leading-[1.3]",
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
              </button>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ─── Mast row + lesson chrome ─────────────────────────────────────────────────

function MastRow({
  section,
  currentPage,
  pageTotal,
  onOpenOutline,
  outlineOpen,
}: {
  section: string
  /** Present only in the main responsive render, where the mobile
   *  hamburger (below lg) needs to open the outline sheet. */
  currentPage?: number
  pageTotal?: number
  onOpenOutline?: () => void
  outlineOpen?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground lg:px-10">
      {onOpenOutline && (
        <button
          type="button"
          onClick={onOpenOutline}
          aria-label="Open lesson outline"
          aria-haspopup="dialog"
          aria-expanded={outlineOpen ?? false}
          className="inline-flex shrink-0 items-center gap-2 border border-border bg-transparent px-2 py-1.5 text-foreground lg:hidden"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M2 4h10M2 7h10M2 10h7" />
          </svg>
          <span className="tabular-nums">
            P{currentPage ?? 1}/{pageTotal ?? 1}
          </span>
        </button>
      )}
      <span className="truncate">{section}</span>
      <span
        className={cn(
          styles.statusActive,
          "inline-flex shrink-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
        )}
      >
        <span aria-hidden="true">▸</span>
        Active
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
  videoFraction = 0,
  videoCleared = false,
  quizPassed = false,
}: {
  monthLabel: string
  lessonNumber: number
  title: string
  pageNum: number
  pageTotal: number
  monthCompleted: number
  monthTotal: number
  /** Live intro-video watched fraction (0–1); part-fills the first segment. */
  videoFraction?: number
  videoCleared?: boolean
  quizPassed?: boolean
}) {
  // The lesson bar is the single progress channel: segment 1 fills as the
  // intro video is watched (tick at the 80% gate), middle segments fill by
  // page position, the last segment fills when the Q&A is passed.
  const progress = Math.max(
    pageNum - 1,
    videoCleared ? 1 : Math.min(videoFraction, 0.99),
    quizPassed ? pageTotal : 0
  )
  const lessonPct = (progress / pageTotal) * 100
  const monthPct = (monthCompleted / monthTotal) * 100
  const gateTicks = [
    ...(videoCleared ? [0] : []),
    ...(quizPassed ? [pageTotal - 1] : []),
  ]
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
          <SegmentedBar
            value={Math.floor(progress)}
            partial={progress - Math.floor(progress)}
            ticks={gateTicks}
            total={pageTotal}
          />
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
  partial = 0,
  ticks = [],
}: {
  value: number
  total: number
  frozen?: boolean
  /** 0–1 part-fill of the segment at index `value` (live video progress). */
  partial?: number
  /** Segment indices that carry a gate tick (video watched, Q&A passed). */
  ticks?: number[]
}) {
  const fillClass = frozen ? "bg-[var(--v-muted)]" : "bg-[var(--v-dash-active)]"
  return (
    <div
      className="grid gap-[3px]"
      style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="relative h-[3px] bg-[var(--v-dash)]">
          {(i < value || (i === value && partial > 0)) && (
            <div
              className={cn("absolute inset-y-0 left-0", fillClass)}
              style={{ width: i < value ? "100%" : `${partial * 100}%` }}
            />
          )}
          {ticks.includes(i) && <GateTick />}
        </div>
      ))}
    </div>
  )
}

/** Small square tick pinned to a segment's end — a cleared gate, no words. */
function GateTick() {
  return (
    <span
      data-testid="gate-tick"
      className={cn(
        "absolute -top-[5px] right-0 z-10 flex size-[13px] items-center justify-center bg-[var(--v-dash-active)] text-background",
        styles.tickPop
      )}
    >
      <svg
        width="8"
        height="8"
        viewBox="0 0 10 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M2 5l2 2 4-4" />
      </svg>
    </span>
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
  onPrev,
  onNext,
  onCancelAdvance,
  prevDisabled,
  nextLabel = "CONTINUE",
  nextVariant = "primary",
  nextTick,
}: {
  pageNum: number
  pageTotal: number
  advancing?: boolean
  onPrev?: () => void
  onNext?: () => void
  /** Cancels a pending auto-advance ("tap to stay"). */
  onCancelAdvance?: () => void
  prevDisabled?: boolean
  nextLabel?: string
  /** Video page renders CONTINUE as ghost until the watch gate clears. */
  nextVariant?: "primary" | "ghost"
  /** Draws a tick inside CONTINUE the moment the gate clears. */
  nextTick?: boolean
}) {
  return (
    <div className="mt-9 flex items-center justify-between gap-4 border-t border-border pt-[22px]">
      <SharpButton
        variant="ghost"
        className="min-w-[160px]"
        onClick={onPrev}
        disabled={prevDisabled}
      >
        <span aria-hidden="true">←</span> PREVIOUS PAGE
      </SharpButton>
      <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
        PAGE {pageNum} OF {pageTotal}
      </div>
      <div className="relative flex min-w-[220px] justify-end">
        {advancing && <AdvancingPing onCancel={onCancelAdvance} />}
        <SharpButton
          variant={nextVariant}
          className="min-w-[220px]"
          onClick={onNext}
        >
          {nextTick && (
            <svg
              data-testid="continue-tick"
              className={styles.tickDraw}
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M2 6.5l2.5 2.5L10 3.5" />
            </svg>
          )}
          {nextLabel} <span aria-hidden="true">→</span>
        </SharpButton>
      </div>
    </div>
  )
}

function AdvancingPing({ onCancel }: { onCancel?: () => void }) {
  return (
    <button
      type="button"
      onClick={onCancel}
      className="absolute bottom-[calc(100%+10px)] right-0 flex cursor-pointer items-center gap-2.5 whitespace-nowrap border border-primary bg-card px-3 py-2"
    >
      <span className="size-2 animate-pulse bg-primary motion-reduce:animate-none" />
      <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-primary">
        {ADVANCING_PING_LABEL}
      </span>
      <span className="text-[12px] text-muted-foreground">·</span>
      <span className="text-[12px] font-semibold text-foreground">
        tap to stay
      </span>
    </button>
  )
}

// ─── Audio bar ────────────────────────────────────────────────────────────────

type AudioBarVariant = "paused" | "playing" | "muted" | "unavailable"

function AudioBar({
  variant,
  autoAdvance,
  speed,
  nowReading,
  currentTime,
  totalTime,
  progress,
  onTogglePlay,
  onSeek,
  onToggleAutoAdvance,
  onChangeSpeed,
}: {
  variant: AudioBarVariant
  autoAdvance: boolean
  speed: "1x" | "1.25x" | "1.5x"
  /** Title shown after the NOW READING label. */
  nowReading: string
  currentTime: string
  totalTime: string
  progress: number
  onTogglePlay: () => void
  /** Seeks the narration to a fraction (0 to 1) of its duration. */
  onSeek?: (fraction: number) => void
  onToggleAutoAdvance: () => void
  onChangeSpeed: (s: "1x" | "1.25x" | "1.5x") => void
}) {
  if (variant === "muted" || variant === "unavailable") {
    return (
      <div className="sticky bottom-0 z-[5] border-t border-foreground bg-card px-7 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-8 items-center justify-center border border-border text-muted-foreground">
              <SpeakerOffIcon />
            </span>
            <div>
              <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {variant === "muted"
                  ? "NARRATION MUTED FOR VIDEO"
                  : "NARRATION NOT AVAILABLE YET"}
              </div>
              <div className="mt-0.5 font-serif text-[13px] italic text-muted-foreground">
                {variant === "muted"
                  ? "Audio resumes on the next prose page."
                  : "This lesson's narration is still in production. Read on at your own pace."}
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
          aria-label={playing ? "Pause narration" : "Play narration"}
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
                {nowReading}
              </span>
            </div>
            <span className="whitespace-nowrap font-mono text-[11.5px] tabular-nums text-muted-foreground">
              {currentTime} / {totalTime}
            </span>
          </div>
          <SeekableTrack progress={progress} playing={playing} onSeek={onSeek} />
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

/**
 * Interactive wrapper around the Scrubber/Waveform visuals: click or use
 * arrow keys to seek the narration. Rendered as a slider for assistive tech.
 */
function SeekableTrack({
  progress,
  playing,
  onSeek,
}: {
  progress: number
  playing: boolean
  onSeek?: (fraction: number) => void
}) {
  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!onSeek) return
    const rect = e.currentTarget.getBoundingClientRect()
    onSeek((e.clientX - rect.left) / rect.width)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!onSeek) return
    const fraction = progress / 100
    if (e.key === "ArrowLeft") onSeek(Math.max(0, fraction - 0.05))
    else if (e.key === "ArrowRight") onSeek(Math.min(1, fraction + 0.05))
    else if (e.key === "Home") onSeek(0)
    else if (e.key === "End") onSeek(1)
    else return
    e.preventDefault()
  }

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label="Narration position"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ochre)]"
    >
      {playing ? (
        <Waveform progress={progress} />
      ) : (
        <Scrubber progress={progress} />
      )}
    </div>
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
                ? "animate-pulse bg-primary motion-reduce:animate-none"
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
  disabled,
}: {
  href?: string
  variant?: "primary" | "ghost"
  className?: string
  children: React.ReactNode
  type?: "button" | "submit"
  onClick?: () => void
  disabled?: boolean
}) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 border px-4.5 py-3 font-mono text-[0.74rem] font-semibold uppercase tracking-[0.14em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v-ochre)]",
    variant === "primary"
      ? "border-primary bg-primary text-primary-foreground hover:border-[var(--v-teal-deep)] hover:bg-[var(--v-teal-deep)]"
      : "border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background",
    disabled && "pointer-events-none opacity-45",
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
    <button type={type} onClick={onClick} className={classes} disabled={disabled}>
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

function VideoPageBody({
  videoUrl,
  lessonTitle,
  pageTitle,
  pageTotal,
  cleared,
  onProgressChange,
}: {
  /** Resolved intro-video URL (already through `mediaUrl()`), or null. */
  videoUrl: string | null
  lessonTitle: string
  pageTitle: string
  pageTotal: number
  /** True once the 80% completion gate is cleared. */
  cleared: boolean
  onProgressChange: (fraction: number) => void
}) {
  return (
    <div className="w-full max-w-[880px]">
      <div className="mb-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        PAGE 1 OF {pageTotal} · INTRO VIDEO
      </div>
      <h2 className="mb-[18px] max-w-[720px] text-[22px] font-semibold leading-[1.15] tracking-[-0.015em]">
        {pageTitle}
      </h2>

      {videoUrl ? (
        <div className="relative border border-foreground">
          <VideoPlayer
            src={videoUrl}
            title={`${lessonTitle} intro video`}
            className="rounded-none"
            onProgressChange={onProgressChange}
          />
          {cleared && (
            <span
              data-testid="video-watched-tick"
              role="img"
              aria-label="Watched. Counts toward lesson completion."
              className={cn(
                "absolute right-3 top-3 z-10 flex size-[22px] items-center justify-center bg-primary text-primary-foreground",
                styles.tickPop
              )}
            >
              <svg
                className={styles.tickDraw}
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M2 6.5l2.5 2.5L10 3.5" />
              </svg>
            </span>
          )}
        </div>
      ) : (
        <div
          className="relative flex items-center justify-center border border-foreground"
          style={{ aspectRatio: "16 / 9", background: "var(--v-video-bg)" }}
        >
          <div className="border border-border bg-card px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            INTRO VIDEO NOT AVAILABLE YET
          </div>
        </div>
      )}
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
 * editorial QAItem chrome as the design placeholder. Fully interactive (W13):
 * the learner selects an answer per question, submits, and the score is
 * graded inline and persisted via the viewer's `onSubmit` (the W7 progress
 * write path). A passing score unlocks the FINISH LESSON action.
 */
function RealQAPageBody({
  questions,
  onSubmit,
  onFinish,
  canFinish,
  missingReason,
}: {
  questions: EditorialLessonQuestion[]
  /** Called once per submission with the graded score (0 to 100). */
  onSubmit: (score: number) => void
  /** Called when the learner finishes a passed lesson. */
  onFinish: () => void
  /** Whether both completion gates are cleared. */
  canFinish: boolean
  /** First unmet completion requirement, shown when finish is blocked. */
  missingReason: string | null
}) {
  const [selected, setSelected] = React.useState<Record<number, number>>({})
  const [submittedAnswers, setSubmittedAnswers] = React.useState<Record<
    number,
    number
  > | null>(null)
  const [score, setScore] = React.useState<number | null>(null)

  const submitted = submittedAnswers !== null
  const answeredCount = questions.filter(
    (_, i) => selected[i] !== undefined
  ).length
  const allAnswered = answeredCount === questions.length
  const passed = score !== null && score >= QUIZ_PASS_SCORE

  function handleSelect(questionIndex: number, optionIndex: number) {
    if (submitted) return
    setSelected((prev) => ({ ...prev, [questionIndex]: optionIndex }))
  }

  function handleSubmit() {
    if (!allAnswered || submitted) return
    const correct = questions.filter(
      (q, i) => selected[i] === q.correctOptionIndex
    ).length
    const graded = Math.round((correct / questions.length) * 100)
    setSubmittedAnswers(selected)
    setScore(graded)
    onSubmit(graded)
  }

  function handleRetry() {
    setSelected({})
    setSubmittedAnswers(null)
    setScore(null)
  }

  return (
    <div className="w-full max-w-[720px]">
      <p className="m-0 mb-7 text-[17px] italic leading-[1.55] text-muted-foreground">
        {questions.length} short question{questions.length === 1 ? "" : "s"}{" "}
        before this counts toward Month 1.{" "}
        <span className={styles.accent}>
          No clock, no streak, no penalty for retrying.
        </span>
      </p>

      {questions.map((q, i) => {
        const chosen = submitted ? submittedAnswers[i] : selected[i]
        const gotItRight = submitted && chosen === q.correctOptionIndex
        return (
          <QAItem
            key={i}
            num={i + 1}
            total={questions.length}
            state={gotItRight ? "passed" : "open"}
            prompt={q.question}
            options={q.options.map((label, oi) => ({
              label,
              state: submitted
                ? oi === q.correctOptionIndex
                  ? ("correct" as const)
                  : oi === chosen
                    ? ("wrong" as const)
                    : ("idle" as const)
                : oi === chosen
                  ? ("selected" as const)
                  : ("idle" as const),
            }))}
            onSelect={(oi) => handleSelect(i, oi)}
            disabled={submitted}
            feedback={submitted && q.explanation ? q.explanation : undefined}
          />
        )
      })}

      <div className="mt-8 flex items-center justify-between gap-4 border-t border-border pt-[22px]">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
          {submitted
            ? `SCORE ${score}% · ${passed ? "PASSED" : `${QUIZ_PASS_SCORE}% NEEDED`}`
            : `${answeredCount} OF ${questions.length} ANSWERED`}
        </div>
        {!submitted ? (
          <SharpButton
            variant="primary"
            className="min-w-[240px]"
            onClick={handleSubmit}
            disabled={!allAnswered}
          >
            SUBMIT Q&amp;A <span aria-hidden="true">→</span>
          </SharpButton>
        ) : passed ? (
          <div className="flex flex-col items-end gap-1.5">
            <SharpButton
              variant="primary"
              className="min-w-[240px]"
              onClick={onFinish}
            >
              FINISH LESSON <span aria-hidden="true">→</span>
            </SharpButton>
            {!canFinish && missingReason && (
              <span className="text-[12.5px] italic text-muted-foreground">
                {missingReason}
              </span>
            )}
          </div>
        ) : (
          <SharpButton
            variant="ghost"
            className="min-w-[240px]"
            onClick={handleRetry}
          >
            RETRY Q&amp;A <span aria-hidden="true">→</span>
          </SharpButton>
        )}
      </div>
    </div>
  )
}

type QAOptionState = "idle" | "selected" | "correct" | "wrong"

/**
 * Renders a short markdown string inline (bold, italic, inline code, links)
 * without wrapping it in a block `<p>`. The end-of-lesson Q&A stores literal
 * markdown in its prompts, option labels and feedback (e.g. `**GWTH**`,
 * `**jagged frontier**`); rendering those as plain JSX showed the raw
 * asterisks (bug gwth-launch-5vh). The full `MarkdownRenderer` is not used
 * here because it wraps content in `.lesson-prose` block paragraphs, which
 * would break the option grid; this keeps the text inline. No `rehype-raw`,
 * so no HTML passthrough in quiz strings.
 */
function InlineMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <>{children}</>,
      }}
    >
      {children}
    </ReactMarkdown>
  )
}

function QAItem({
  num,
  total,
  prompt,
  options,
  state,
  feedback,
  onSelect,
  disabled,
}: {
  num: number
  total: number
  prompt: string
  options: { label: string; state: QAOptionState }[]
  state: "passed" | "open" | "locked"
  feedback?: string
  /** Called with the option index when the learner picks an answer. */
  onSelect?: (optionIndex: number) => void
  /** Locks option interaction (post-submit). */
  disabled?: boolean
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
        <InlineMarkdown>{prompt}</InlineMarkdown>
      </div>
      <div className="flex flex-col gap-2">
        {options.map((o, i) => (
          <QAOption
            key={i}
            label={o.label}
            state={o.state}
            letter={String.fromCharCode(65 + i)}
            onClick={onSelect ? () => onSelect(i) : undefined}
            disabled={disabled}
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
          <InlineMarkdown>{feedback}</InlineMarkdown>
        </div>
      )}
    </div>
  )
}

function QAOption({
  letter,
  label,
  state,
  onClick,
  disabled,
}: {
  letter: string
  label: string
  state: QAOptionState
  onClick?: () => void
  disabled?: boolean
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
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={state === "selected"}
      className={cn(
        "grid w-full cursor-pointer grid-cols-[32px_1fr_auto] items-center gap-3.5 border border-solid px-3.5 py-3 text-left",
        !disabled && state === "idle" && "hover:bg-muted",
        disabled && "cursor-default",
        optionStyles.border,
        optionStyles.bg
      )}
    >
      <span className="inline-flex size-[26px] items-center justify-center border border-foreground font-mono text-[11px] font-bold tracking-[0.06em]">
        {letter}
      </span>
      <div className="text-[14.5px] leading-[1.45] text-foreground">
        <InlineMarkdown>{label}</InlineMarkdown>
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
    </button>
  )
}

// ─── Lesson-complete editorial state ─────────────────────────────────────────

function LessonCompleteSurface({
  lesson,
  introWatchedPct,
  quizScorePct,
  nextLesson,
  courseHref,
}: {
  lesson: EditorialLessonMeta
  /** Real intro-video watched percentage from the progress row. */
  introWatchedPct: number
  /** Real best Q&A score (0 to 100). */
  quizScorePct: number
  nextLesson?: EditorialNextLesson | null
  courseHref?: string
}) {
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
            {lesson.introVideoUrl ? (
              <>
                Intro watched to{" "}
                <span className={styles.accent}>{introWatchedPct}%</span>.{" "}
              </>
            ) : null}
            {lesson.questions?.length ? (
              <>
                Q&amp;A passed at{" "}
                <span className={styles.accent}>{quizScorePct}%</span>.{" "}
              </>
            ) : null}
            This counts toward Month 1.
          </p>

          <div className="mt-9 grid grid-cols-[1.4fr_1fr] border border-foreground">
            <div className="px-7 py-7">
              <div className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {nextLesson
                  ? `UP NEXT · LESSON ${nextLesson.lessonNumber}`
                  : "UP NEXT"}
              </div>
              <div className="mt-2 text-[26px] font-semibold leading-[1.15] tracking-[-0.015em]">
                {nextLesson
                  ? nextLesson.title
                  : "You are at the end of the published lessons."}
              </div>
              <div className="mt-2 text-[14px] italic text-muted-foreground">
                {nextLesson
                  ? "Picks up where this one stopped."
                  : "New lessons unlock as the month releases."}
              </div>
              <div className="mt-[22px] flex gap-2.5">
                {nextLesson && (
                  <SharpButton
                    variant="primary"
                    className="min-w-[220px]"
                    href={nextLesson.href}
                  >
                    START LESSON {nextLesson.lessonNumber}{" "}
                    <span aria-hidden="true">→</span>
                  </SharpButton>
                )}
                <SharpButton variant="ghost" href={courseHref ?? "/dashboard"}>
                  BACK TO COURSE
                </SharpButton>
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
  pageNum,
  playing,
  audioAvailable,
  currentTime,
  totalTime,
  progressPct,
  onTogglePlay,
  speed,
  onChangeSpeed,
  autoAdvance,
  onToggleAutoAdvance,
  onSelectPage,
}: {
  lesson: EditorialLessonMeta
  pageNum: number
  playing: boolean
  audioAvailable: boolean
  currentTime: string
  totalTime: string
  progressPct: number
  onTogglePlay: () => void
  speed: "1x" | "1.25x" | "1.5x"
  onChangeSpeed: (s: "1x" | "1.25x" | "1.5x") => void
  autoAdvance: boolean
  onToggleAutoAdvance: () => void
  /** Jump to a page from the outline sheet (stays on the mobile surface). */
  onSelectPage: (page: number) => void
}) {
  const pageTitle = lesson.pages[pageNum - 1]?.title ?? lesson.title
  const [outlineOpen, setOutlineOpen] = React.useState(false)
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
        <LogoGwth className="h-5 w-auto" />

        <button
          type="button"
          aria-label="Lesson outline"
          aria-haspopup="dialog"
          aria-expanded={outlineOpen}
          onClick={() => setOutlineOpen(true)}
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
            {pageNum}/{lesson.pages.length}
          </span>
        </button>
      </div>

      <OutlineSheet
        open={outlineOpen}
        onOpenChange={setOutlineOpen}
        pages={lesson.pages}
        currentPage={pageNum}
        lessonNumber={lesson.lessonNumber}
        onSelectPage={onSelectPage}
      />

      <div className="border-b border-border px-[22px] py-4">
        <div className="flex items-center justify-between">
          <div className="font-mono text-[9.5px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {lesson.monthLabel}
          </div>
          <div className="font-mono text-[9.5px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            P{pageNum} / {lesson.pages.length}
          </div>
        </div>
        <h1 className="my-2 mb-3.5 text-[22px] font-semibold leading-[1.2] tracking-[-0.02em]">
          {lesson.title}
        </h1>
        <SegmentedBar value={pageNum - 1} total={lesson.pages.length} />
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
            aria-label={playing ? "Pause narration" : "Play narration"}
            onClick={onTogglePlay}
            disabled={!audioAvailable}
            className={cn(
              "inline-flex size-10 shrink-0 items-center justify-center border",
              playing
                ? "border-primary bg-primary text-primary-foreground"
                : "border-foreground bg-foreground text-background",
              !audioAvailable && "pointer-events-none opacity-45"
            )}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex justify-between">
              <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-semibold">
                P{pageNum} · {pageTitle}
              </span>
              <span className="whitespace-nowrap font-mono text-[10.5px] tabular-nums text-muted-foreground">
                {audioAvailable ? `${currentTime} / ${totalTime}` : "NO AUDIO"}
              </span>
            </div>
            <Waveform progress={progressPct} />
          </div>
        </div>
        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex border border-border">
            {(["1x", "1.25x", "1.5x"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChangeSpeed(s)}
                className={cn(
                  "min-w-[38px] cursor-pointer border-none px-2 py-1 font-mono text-[10.5px] font-bold",
                  s === speed
                    ? "bg-foreground text-background"
                    : "bg-transparent text-muted-foreground"
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <AutoAdvanceToggle on={autoAdvance} onToggle={onToggleAutoAdvance} compact />
        </div>
      </div>
    </div>
  )
}
