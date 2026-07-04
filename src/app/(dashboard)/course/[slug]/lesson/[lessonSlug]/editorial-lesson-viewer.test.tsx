/**
 * Tests for the W13 media + persistence wiring of the editorial lesson
 * viewer: real audio readouts, the intro-video 80% gate, interactive Q&A
 * grading, and every progress write going through the single W7-tested
 * server action (`updateLessonProgressAction`).
 */
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeAll, afterEach } from "vitest"
import {
  EditorialLessonViewer,
  type EditorialLessonMeta,
} from "./editorial-lesson-viewer"

// ── Mocks ────────────────────────────────────────────────────────────────────

// The single progress write path. Every persistence assertion in this file
// goes through this mock.
vi.mock("@/lib/actions/progress", () => ({
  updateLessonProgressAction: vi.fn(() => Promise.resolve({})),
}))

// next/dynamic is only used for the VideoPlayer in this module; replace it
// with a stub exposing a button that reports an 85% watched fraction.
vi.mock("next/dynamic", () => ({
  default: () =>
    function MockVideoPlayer({
      src,
      onProgressChange,
    }: {
      src: string
      onProgressChange?: (fraction: number) => void
    }) {
      return (
        <div data-testid="video-player" data-src={src}>
          <button
            type="button"
            onClick={() => onProgressChange?.(0.85)}
          >
            simulate-watch-85
          </button>
        </div>
      )
    },
}))

import { updateLessonProgressAction } from "@/lib/actions/progress"

const updateAction = vi.mocked(updateLessonProgressAction)

// jsdom does not implement HTMLMediaElement playback; emulate just enough
// for play/pause state to round-trip through the element's events.
beforeAll(() => {
  const pausedFlags = new WeakMap<HTMLMediaElement, boolean>()
  Object.defineProperty(HTMLMediaElement.prototype, "paused", {
    configurable: true,
    get(this: HTMLMediaElement) {
      return pausedFlags.get(this) ?? true
    },
  })
  Object.defineProperty(HTMLMediaElement.prototype, "play", {
    configurable: true,
    value: function play(this: HTMLMediaElement) {
      pausedFlags.set(this, false)
      this.dispatchEvent(new Event("play"))
      return Promise.resolve()
    },
  })
  Object.defineProperty(HTMLMediaElement.prototype, "pause", {
    configurable: true,
    value: function pause(this: HTMLMediaElement) {
      pausedFlags.set(this, true)
      this.dispatchEvent(new Event("pause"))
    },
  })
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// ── Fixtures ─────────────────────────────────────────────────────────────────

const LESSON_ID = "lesson_w13_test"

function makeLesson(
  overrides: Partial<EditorialLessonMeta> = {}
): EditorialLessonMeta {
  return {
    id: LESSON_ID,
    monthLabel: "MONTH 1 · LESSON 01",
    lessonNumber: 1,
    title: "Welcome to GWTH",
    monthCompleted: 0,
    monthTotal: 24,
    pages: [
      {
        title: "Why this lesson exists",
        kindLabel: "VIDEO · 4 MIN",
        kind: "video",
      },
      {
        title: "Picking the right problem",
        kindLabel: "PROSE · 3 MIN",
        kind: "prose",
      },
      { title: "End-of-lesson Q&A", kindLabel: "Q&A · 4 MIN", kind: "qa" },
    ],
    questions: [
      {
        question: "What should your first tool be?",
        options: ["A portfolio piece", "A pocket knife"],
        correctOptionIndex: 1,
        explanation: "Small and specific to your own week.",
      },
      {
        question: "Where should the output land?",
        options: ["A new tab", "A place you already look"],
        correctOptionIndex: 1,
      },
    ],
    audioFileUrl: "https://media.test/lessons/l01/audio/kokoro_main.wav",
    audioDuration: 1931,
    introVideoUrl: "https://media.test/lessons/l01/video/intro.mp4",
    ...overrides,
  }
}

function getAudioElement(): HTMLAudioElement {
  const audio = document.querySelector("audio")
  expect(audio).not.toBeNull()
  return audio as HTMLAudioElement
}

// ── Audio bar ────────────────────────────────────────────────────────────────

describe("EditorialLessonViewer audio bar", () => {
  it("renders a real audio element with the lesson's media src", () => {
    render(
      <EditorialLessonViewer lesson={makeLesson()} initialSurface="prose" />
    )
    expect(getAudioElement().src).toBe(
      "https://media.test/lessons/l01/audio/kokoro_main.wav"
    )
  })

  it("shows an honest 00:00 start and the real narration duration", () => {
    render(
      <EditorialLessonViewer lesson={makeLesson()} initialSurface="prose" />
    )
    // 1931 seconds = 32:11. The old hardcoded 02:14 / 03:42 must be gone.
    expect(screen.getByText("00:00 / 32:11")).toBeInTheDocument()
    expect(screen.queryByText(/02:14/)).not.toBeInTheDocument()
    expect(screen.queryByText(/03:42/)).not.toBeInTheDocument()
  })

  it("drives the readout from the element's timeupdate events", () => {
    render(
      <EditorialLessonViewer lesson={makeLesson()} initialSurface="prose" />
    )
    const audio = getAudioElement()
    Object.defineProperty(audio, "currentTime", {
      configurable: true,
      value: 125,
    })
    fireEvent(audio, new Event("timeupdate"))
    expect(screen.getByText("02:05 / 32:11")).toBeInTheDocument()
  })

  it("toggles real playback from the play button", async () => {
    const user = userEvent.setup()
    render(
      <EditorialLessonViewer lesson={makeLesson()} initialSurface="prose" />
    )
    await user.click(screen.getByRole("button", { name: "Play narration" }))
    // The element's play event flips the surface to playing state.
    expect(
      await screen.findByRole("button", { name: "Pause narration" })
    ).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Pause narration" }))
    expect(
      await screen.findByRole("button", { name: "Play narration" })
    ).toBeInTheDocument()
  })

  it("shows an honest unavailable state when a lesson has no narration", () => {
    render(
      <EditorialLessonViewer
        lesson={makeLesson({ audioFileUrl: null })}
        initialSurface="prose"
      />
    )
    expect(
      screen.getByText("NARRATION NOT AVAILABLE YET")
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Play narration" })
    ).not.toBeInTheDocument()
  })
})

// ── Intro video gate ─────────────────────────────────────────────────────────

describe("EditorialLessonViewer intro video", () => {
  it("renders the real video player with the lesson's media src", () => {
    render(
      <EditorialLessonViewer lesson={makeLesson()} initialSurface="video" />
    )
    expect(screen.getByTestId("video-player")).toHaveAttribute(
      "data-src",
      "https://media.test/lessons/l01/video/intro.mp4"
    )
  })

  it("persists introVideoProgress once when playback crosses 80%", async () => {
    const user = userEvent.setup()
    render(
      <EditorialLessonViewer lesson={makeLesson()} initialSurface="video" />
    )
    await user.click(screen.getByText("simulate-watch-85"))
    await user.click(screen.getByText("simulate-watch-85"))

    await waitFor(() => {
      expect(updateAction).toHaveBeenCalledWith(LESSON_ID, {
        introVideoProgress: 0.85,
      })
    })
    expect(updateAction).toHaveBeenCalledTimes(1)
  })

  it("shows the honest gate state before and after the 80% mark", async () => {
    const user = userEvent.setup()
    render(
      <EditorialLessonViewer lesson={makeLesson()} initialSurface="video" />
    )
    expect(screen.getByText(/GATE 1 \/ 2 · 0% WATCHED/)).toBeInTheDocument()
    await user.click(screen.getByText("simulate-watch-85"))
    expect(await screen.findByText("GATE 1 / 2 · CLEARED")).toBeInTheDocument()
  })

  it("renders an honest placeholder when the lesson has no intro video", () => {
    render(
      <EditorialLessonViewer
        lesson={makeLesson({ introVideoUrl: null })}
        initialSurface="video"
      />
    )
    expect(
      screen.getByText("INTRO VIDEO NOT AVAILABLE YET")
    ).toBeInTheDocument()
    expect(screen.queryByTestId("video-player")).not.toBeInTheDocument()
  })
})

// ── Q&A + completion ─────────────────────────────────────────────────────────

async function answerAll(
  user: ReturnType<typeof userEvent.setup>,
  answers: string[]
) {
  for (const label of answers) {
    await user.click(screen.getByRole("button", { name: new RegExp(label) }))
  }
}

describe("EditorialLessonViewer Q&A", () => {
  it("grades a perfect run and persists the quiz score", async () => {
    const user = userEvent.setup()
    render(
      <EditorialLessonViewer lesson={makeLesson()} initialSurface="qa" />
    )

    const submit = screen.getByRole("button", { name: /SUBMIT Q&A/ })
    expect(submit).toBeDisabled()

    await answerAll(user, ["A pocket knife", "A place you already look"])
    await user.click(screen.getByRole("button", { name: /SUBMIT Q&A/ }))

    expect(screen.getByText(/SCORE 100% · PASSED/)).toBeInTheDocument()
    await waitFor(() => {
      expect(updateAction).toHaveBeenCalledWith(
        LESSON_ID,
        expect.objectContaining({
          quizScore: 100,
          bestQuizScore: 100,
          quizPassed: true,
          quizAttempts: 1,
        })
      )
    })
  })

  it("marks a failed run honestly and offers a retry", async () => {
    const user = userEvent.setup()
    render(
      <EditorialLessonViewer lesson={makeLesson()} initialSurface="qa" />
    )
    await answerAll(user, ["A portfolio piece", "A new tab"])
    await user.click(screen.getByRole("button", { name: /SUBMIT Q&A/ }))

    expect(screen.getByText(/SCORE 0% · 67% NEEDED/)).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /RETRY Q&A/ })
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(updateAction).toHaveBeenCalledWith(
        LESSON_ID,
        expect.objectContaining({ quizScore: 0, quizPassed: false })
      )
    })
  })

  it("finishing a passed lesson persists completion and shows the complete surface", async () => {
    const user = userEvent.setup()
    render(
      <EditorialLessonViewer
        lesson={makeLesson()}
        initialSurface="qa"
        initialProgress={{
          lessonId: LESSON_ID,
          isCompleted: false,
          progress: 0,
          quizScore: null,
          bestQuizScore: null,
          quizAttempts: 0,
          timeSpent: 0,
          lastAccessedAt: new Date(),
          completedAt: null,
          introVideoProgress: 0.9,
          quizPassed: false,
        }}
      />
    )

    await answerAll(user, ["A pocket knife", "A place you already look"])
    await user.click(screen.getByRole("button", { name: /SUBMIT Q&A/ }))
    await user.click(screen.getByRole("button", { name: /FINISH LESSON/ }))

    expect(await screen.findByText("Lesson complete.")).toBeInTheDocument()
    // Honest stats on the complete surface: real watched % and real score.
    expect(screen.getByText("90%")).toBeInTheDocument()
    expect(screen.getByText("100%")).toBeInTheDocument()
    await waitFor(() => {
      expect(updateAction).toHaveBeenCalledWith(
        LESSON_ID,
        expect.objectContaining({ isCompleted: true, progress: 1 })
      )
    })
  })
})

// ── Page navigation ──────────────────────────────────────────────────────────

describe("EditorialLessonViewer navigation", () => {
  it("walks video → prose → Q&A through the footer CONTINUE button", async () => {
    const user = userEvent.setup()
    render(
      <EditorialLessonViewer
        lesson={makeLesson()}
        initialSurface="video"
        initialPage={1}
      />
    )
    await user.click(screen.getByRole("button", { name: /CONTINUE/ }))
    expect(screen.getAllByText("PAGE 2 OF 3").length).toBeGreaterThan(0)

    await user.click(screen.getByRole("button", { name: /CONTINUE/ }))
    expect(
      screen.getByText(/before this counts toward Month 1/)
    ).toBeInTheDocument()
  })
})
