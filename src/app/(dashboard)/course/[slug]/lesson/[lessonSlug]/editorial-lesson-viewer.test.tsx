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

/**
 * David, 2026-07-26: "Please move the play button to the top of the text in
 * each lesson so students see this first."
 *
 * The narration control used to be a bar pinned to the bottom of the window,
 * so a student met the wall of text before they discovered they could listen
 * to it. It now sits directly under the lesson title and above the body.
 */
describe("EditorialLessonViewer narration control placement", () => {
  /** True when `a` comes before `b` in document order. */
  function precedes(a: Element, b: Element) {
    return Boolean(
      a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING
    )
  }

  it("puts the play button above the lesson body, not below it", () => {
    const { container } = render(
      <EditorialLessonViewer lesson={makeLesson()} initialSurface="prose" />
    )
    const play = screen.getByRole("button", { name: /play narration/i })
    const body = container.querySelector("article, [data-page-body]")
      ?? screen.getByText(makeLesson().pages[1]?.title ?? "", { exact: false })
    expect(precedes(play, body as Element)).toBe(true)
  })

  it("sticks to the top of the reading column, not the bottom", () => {
    render(
      <EditorialLessonViewer lesson={makeLesson()} initialSurface="prose" />
    )
    const play = screen.getByRole("button", { name: /play narration/i })
    const bar = play.closest("div.sticky")
    expect(bar).not.toBeNull()
    expect(bar!.className).toContain("top-0")
    expect(bar!.className).not.toContain("bottom-0")
  })
})

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
    // W26 reframed this state: still honest, no longer worded as though
    // something behind the scenes were broken.
    expect(
      screen.getByText("NO READ-ALONG ON THIS LESSON")
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

  it("signals the 80% mark with the wordless ticks, not gate copy", async () => {
    const user = userEvent.setup()
    render(
      <EditorialLessonViewer lesson={makeLesson()} initialSurface="video" />
    )
    // Before the mark: no ticks anywhere.
    expect(screen.queryByTestId("video-watched-tick")).not.toBeInTheDocument()
    expect(screen.queryByTestId("continue-tick")).not.toBeInTheDocument()
    expect(screen.queryByTestId("gate-tick")).not.toBeInTheDocument()

    await user.click(screen.getByText("simulate-watch-85"))

    // After: tick on the video, tick in CONTINUE, tick on progress segment 1.
    expect(await screen.findByTestId("video-watched-tick")).toBeInTheDocument()
    expect(screen.getByTestId("continue-tick")).toBeInTheDocument()
    expect(screen.getByTestId("gate-tick")).toBeInTheDocument()

    // The mechanics copy is gone for good.
    expect(screen.queryByText(/GATE 1 \/ 2/)).not.toBeInTheDocument()
    expect(
      screen.queryByText(/Counts toward completion/)
    ).not.toBeInTheDocument()
    expect(screen.queryByText("THRESHOLD")).not.toBeInTheDocument()
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

// ── Student project page ─────────────────────────────────────────────────────

/**
 * David, 2026-07-26: "There doesn't seem to be any project for L1."
 *
 * Every GWTH lesson ships a student project (`content/project.md` →
 * `lessons.build_instructions`), and the L1 body even says "the Build section
 * below is where you actually make the first portfolio artefact" — but the
 * viewer had no page kind for it, so the project was imported and never shown.
 */
const PROJECT_PAGES: EditorialLessonMeta["pages"] = [
  { title: "Overview", kindLabel: "PROSE · 3 MIN", kind: "prose", content: "Read this." },
  {
    title: "Your project: My AI Superpowers Wishlist",
    kindLabel: "PROJECT · 5 MIN",
    kind: "project",
    projectHeading: "My AI Superpowers Wishlist",
    content:
      "## What you are making\n\nA list of real things you want AI to help with.",
  },
  { title: "End-of-lesson Q&A", kindLabel: "Q&A · 2 QUESTIONS", kind: "qa" },
]

describe("EditorialLessonViewer student project page", () => {
  it("renders the project artefact and its instructions", () => {
    render(
      <EditorialLessonViewer
        lesson={makeLesson({ pages: PROJECT_PAGES, introVideoUrl: null })}
        initialSurface="prose"
        initialPage={2}
      />
    )
    expect(screen.getByText("MAKE THIS")).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: "My AI Superpowers Wishlist" })
    ).toBeInTheDocument()
    expect(screen.getByText("What you are making")).toBeInTheDocument()
    expect(
      screen.getByText(/A list of real things you want AI to help with/)
    ).toBeInTheDocument()
  })

  it("shows the project in the outline rail and reaches it via CONTINUE", async () => {
    const user = userEvent.setup()
    render(
      <EditorialLessonViewer
        lesson={makeLesson({ pages: PROJECT_PAGES, introVideoUrl: null })}
        initialSurface="prose"
        initialPage={1}
      />
    )
    expect(screen.getAllByText("PROJECT · 5 MIN").length).toBeGreaterThan(0)
    expect(screen.queryByText("MAKE THIS")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /CONTINUE/ }))
    expect(screen.getByText("MAKE THIS")).toBeInTheDocument()
    // The mast row names the page kind so the student knows this is the doing.
    expect(
      screen.getAllByText(/COURSE · LESSON 1 · PROJECT/).length
    ).toBeGreaterThan(0)
  })
})

// ── Mobile layout ────────────────────────────────────────────────────────────

/**
 * At 390px the pagination row and the audio bar both used to demand more
 * width than the viewport had, and because nothing scrolls horizontally the
 * overflow was CLIPPED: CONTINUE rendered at right=464 against a 390px
 * viewport and the narration play button at left=-46.
 *
 * jsdom has no layout engine, so these assert the class contract that carries
 * the fix rather than pretending to measure geometry (the real numbers are
 * verified with Playwright at 390x844). The invariant each one protects is
 * that the fixed desktop floor is gated behind `sm:` and the element is free
 * to shrink below it.
 */
describe("EditorialLessonViewer mobile layout", () => {
  it("lets the pagination buttons shrink below the sm breakpoint", () => {
    render(
      <EditorialLessonViewer
        lesson={makeLesson()}
        initialSurface="prose"
        initialPage={2}
      />
    )
    const next = screen.getByRole("button", { name: /CONTINUE/ })
    // The 220px floor must only apply from `sm` up; unprefixed it re-creates
    // the clipped-off-screen button at 390px.
    expect(next.className).toContain("sm:min-w-[220px]")
    expect(next.className).toContain("min-w-0")
    expect(next.className).not.toMatch(/(^|\s)min-w-\[220px\]/)

    const prev = screen.getByRole("button", { name: /PREVIOUS PAGE/ })
    expect(prev.className).toContain("sm:min-w-[160px]")
    expect(prev.className).not.toMatch(/(^|\s)min-w-\[160px\]/)
  })

  it("keeps the narration controls inside the viewport on mobile", () => {
    render(
      <EditorialLessonViewer lesson={makeLesson()} initialSurface="prose" />
    )
    const play = screen.getByRole("button", { name: /Play narration/ })
    // The five-column audio grid is what pushed this button to left=-46, so
    // it must be reachable only from `sm` up.
    const grid = play.parentElement
    expect(grid).not.toBeNull()
    expect(grid!.className).toContain(
      "sm:[grid-template-columns:52px_minmax(0,1fr)_auto_auto_auto]"
    )
    expect(grid!.className).toContain("[grid-template-columns:52px_minmax(0,1fr)]")
  })
})
