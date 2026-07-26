/**
 * W26: the lesson-1 intro video on production rendered as a solid block with
 * no play control. The <video> was healthy (readyState 4, the file 200s from
 * the CDN), but the loading skeleton on top of it never came down, because the
 * effect attached its `loadeddata` listener AFTER the browser had already
 * fired that event. Media events are not replayed for a late listener, so
 * `isLoading` stayed true for ever and the skeleton swallowed the click.
 *
 * These tests pin the two halves of the fix: reconcile with the readyState the
 * element is already in, and treat HAVE_METADATA as ready (preload="metadata"
 * may never produce a decoded frame, so `loadeddata` alone can hang).
 */
import { describe, it, expect, vi, afterEach } from "vitest"
import { cleanup, render, act, within } from "@testing-library/react"
import { VideoPlayer } from "./video-player"

/**
 * Pins HTMLMediaElement.readyState for the duration of a test. jsdom hardcodes
 * it to 0, which is the one value that cannot reproduce the bug.
 */
function stubReadyState(value: number) {
  const original = Object.getOwnPropertyDescriptor(
    window.HTMLMediaElement.prototype,
    "readyState"
  )
  Object.defineProperty(window.HTMLMediaElement.prototype, "readyState", {
    configurable: true,
    get: () => value,
  })
  return () => {
    if (original) {
      Object.defineProperty(window.HTMLMediaElement.prototype, "readyState", original)
    }
  }
}

const restores: Array<() => void> = []
afterEach(() => {
  // This project's vitest setup does not enable globals, so React Testing
  // Library's auto-cleanup never registers. Unmounting by hand keeps each
  // render out of the next test's document.
  cleanup()
  while (restores.length) restores.pop()!()
  vi.useRealTimers()
})

/** Renders and scopes every query to that render, never the whole document. */
function renderPlayer() {
  const { container } = render(
    <VideoPlayer src="https://media.example/x.mp4" title="Intro" />
  )
  return {
    container,
    query: within(container),
    skeleton: () => container.querySelector('[data-slot="skeleton"]'),
    video: () => container.querySelector("video")!,
  }
}

describe("VideoPlayer loading state", () => {
  it("clears the skeleton when the media is already loaded before the effect runs", () => {
    // readyState 4 with no events fired: exactly the production case, where a
    // warm CDN cache had the video ready before React mounted the listener.
    restores.push(stubReadyState(4))
    expect(renderPlayer().skeleton()).toBeNull()
  })

  it("treats HAVE_METADATA as ready, since preload='metadata' may never decode a frame", () => {
    restores.push(stubReadyState(1))
    expect(renderPlayer().skeleton()).toBeNull()
  })

  it("still shows the skeleton while the element genuinely has nothing", () => {
    restores.push(stubReadyState(0))
    expect(renderPlayer().skeleton()).not.toBeNull()
  })

  it("clears the skeleton when loadedmetadata arrives late", () => {
    restores.push(stubReadyState(0))
    const player = renderPlayer()
    expect(player.skeleton()).not.toBeNull()
    act(() => {
      player.video().dispatchEvent(new Event("loadedmetadata"))
    })
    expect(player.skeleton()).toBeNull()
  })

  it("falls back to the error surface only when the element still has nothing", () => {
    vi.useFakeTimers()
    restores.push(stubReadyState(0))
    const player = renderPlayer()
    act(() => {
      vi.advanceTimersByTime(9000)
    })
    expect(player.query.getByText("Video unavailable")).toBeInTheDocument()
  })

  it("does not error out a video that is loading slowly but has metadata", () => {
    vi.useFakeTimers()
    restores.push(stubReadyState(1))
    const player = renderPlayer()
    act(() => {
      vi.advanceTimersByTime(9000)
    })
    expect(player.query.queryByText("Video unavailable")).toBeNull()
    expect(player.skeleton()).toBeNull()
  })

  it("leaves the skeleton click-through so it can never lock the viewer out", () => {
    restores.push(stubReadyState(0))
    expect(renderPlayer().skeleton()!.className).toContain("pointer-events-none")
  })
})
