"use client"

/**
 * First-party lesson tracking (bead gwth-launch-hqyp). Events are queued and
 * posted in small batches to /api/lesson-events, GWTH's own database. When the
 * page is hidden or closed, a "left" event and anything queued go out through
 * navigator.sendBeacon so they survive the tab closing. No third party.
 */
import * as React from "react"
import type { ClientLessonEvent } from "@/lib/lessons/lesson-events"
import type { LessonFormat } from "@/lib/lessons/parts"

export interface TrackFn {
  (event: ClientLessonEvent, partIndex: number | null, detail?: Record<string, unknown>): void
}

function newSessionId(): string {
  const bytes = new Uint8Array(12)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

const FLUSH_MS = 4000

export function useLessonTracker(opts: {
  lessonId: string
  enabled: boolean
  format: LessonFormat | null
  /** The screen the learner is on, reported with "left". */
  screen: number
}): { track: TrackFn; sessionId: string } {
  const [sessionId] = React.useState(newSessionId)
  const queue = React.useRef<{ event: string; partIndex: number | null; format: LessonFormat | null; detail: Record<string, unknown> }[]>([])
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const formatRef = React.useRef(opts.format)
  const screenRef = React.useRef(opts.screen)
  React.useEffect(() => {
    formatRef.current = opts.format
    screenRef.current = opts.screen
  }, [opts.format, opts.screen])

  const flush = React.useCallback(
    (useBeacon = false) => {
      if (timer.current) {
        clearTimeout(timer.current)
        timer.current = null
      }
      if (!opts.enabled) return
      while (queue.current.length) {
        const events = queue.current.splice(0, 50)
        const body = JSON.stringify({ lessonId: opts.lessonId, sessionId, events })
        if (useBeacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
          navigator.sendBeacon("/api/lesson-events", new Blob([body], { type: "application/json" }))
        } else {
          void fetch("/api/lesson-events", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body,
            keepalive: true,
          }).catch(() => {})
        }
      }
    },
    [opts.enabled, opts.lessonId, sessionId]
  )

  const track = React.useCallback<TrackFn>(
    (event, partIndex, detail) => {
      if (!opts.enabled) return
      queue.current.push({ event, partIndex, format: formatRef.current, detail: detail ?? {} })
      if (!timer.current) timer.current = setTimeout(() => flush(false), FLUSH_MS)
    },
    [flush, opts.enabled]
  )

  React.useEffect(() => {
    if (!opts.enabled) return
    const onHide = () => {
      if (document.visibilityState !== "hidden") return
      const screen = screenRef.current
      queue.current.push({ event: "left", partIndex: screen > 0 ? screen - 1 : null, format: formatRef.current, detail: { screen } })
      flush(true)
    }
    const onPageHide = () => {
      if (!queue.current.length) return
      flush(true)
    }
    document.addEventListener("visibilitychange", onHide)
    window.addEventListener("pagehide", onPageHide)
    return () => {
      document.removeEventListener("visibilitychange", onHide)
      window.removeEventListener("pagehide", onPageHide)
      flush(false)
    }
  }, [flush, opts.enabled])

  return { track, sessionId }
}
