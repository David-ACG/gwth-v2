"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import styles from "./lab-listen.module.css"

/** Words per minute used to estimate the running time. Always said as "about". */
const WORDS_PER_MINUTE = 165

/** Longest utterance we hand the browser, in characters. */
const CHUNK_CHARS = 180

/**
 * Chrome stops a long synthesis run after roughly fifteen seconds unless the
 * queue is nudged. Short utterances plus this heartbeat keep a five minute
 * read alive; both are needed, because the cut-off is on the QUEUE, not on one
 * utterance.
 */
const KEEPALIVE_MS = 8000

/**
 * Whether this browser can speak. Read through `useSyncExternalStore` rather
 * than set from an effect, so the server render and the hydrating client
 * render agree (the server has no `speechSynthesis`) and React swaps to the
 * real answer in the same pass instead of a cascading re-render.
 */
const speechStore = {
  subscribe: () => () => {},
  get: () =>
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof window.SpeechSynthesisUtterance === "function",
  server: () => false,
}

/** Props for {@link LabListen}. */
interface LabListenProps {
  /**
   * What to read, in order. These are the lab's own words: the task, the
   * rubric questions and the verdict. Deliberately NOT the shared prompt or
   * either raw model output, which are pages of unspoken formatting marks and
   * would make the control useless rather than accessible.
   */
  segments: string[]
  /** One line naming exactly what the control reads, shown under the buttons. */
  covers: string
}

/** Splits text into utterance-sized pieces, preferring sentence boundaries. */
function chunk(text: string): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/)
  const out: string[] = []
  let current = ""
  for (const sentence of sentences) {
    if (!sentence.trim()) continue
    if (current && current.length + sentence.length + 1 > CHUNK_CHARS) {
      out.push(current)
      current = sentence
    } else {
      current = current ? `${current} ${sentence}` : sentence
    }
  }
  if (current) out.push(current)
  return out
}

/** "about 3 minutes", from the word count. Never presented as exact. */
function estimate(words: number): string {
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE))
  return `about ${minutes} minute${minutes === 1 ? "" : "s"}`
}

/**
 * Read this lab aloud, using the browser's own speech synthesis.
 *
 * David, annotation a-20260914-205206-82935a: the lab "looks too complicated
 * and too much text, which is difficult to read, and there's not even a voice
 * reader". This is that voice reader, and it is honest in three ways:
 *
 * 1. It is the BROWSER's voice. Nothing is sent anywhere, no audio file is
 *    fetched, and no recording is implied to exist. There is no lab narration
 *    recorded yet and this does not pretend otherwise.
 * 2. It only appears once the browser has told us it can speak. Support is
 *    read through `useSyncExternalStore`, whose server snapshot is false, so
 *    the markup React sends and the markup it hydrates agree; where there is
 *    no `speechSynthesis` the component says so plainly and points at the
 *    written walkthrough rather than leaving a dead button.
 * 3. It states what it reads. The line under the controls names the parts and
 *    the rough length, because a control that reads something other than what
 *    you are looking at is worse than none.
 *
 * Operable from the keyboard because the controls are ordinary buttons, and
 * every state change is announced in a polite live region.
 */
export function LabListen({ segments, covers }: LabListenProps) {
  const supported = useSyncExternalStore(
    speechStore.subscribe,
    speechStore.get,
    speechStore.server
  )
  const [state, setState] = useState<"idle" | "speaking" | "paused">("idle")
  const keepalive = useRef<ReturnType<typeof setInterval> | null>(null)

  const text = useMemo(
    () => segments.map((s) => s.trim()).filter(Boolean).join("\n\n"),
    [segments]
  )
  const words = useMemo(() => text.split(/\s+/).filter(Boolean).length, [text])

  const stopKeepalive = useCallback(() => {
    if (keepalive.current) {
      clearInterval(keepalive.current)
      keepalive.current = null
    }
  }, [])

  const stop = useCallback(() => {
    stopKeepalive()
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    setState("idle")
  }, [stopKeepalive])

  // Leaving the page must not leave a voice talking over the next one.
  useEffect(() => stop, [stop])

  const start = useCallback(() => {
    const synth = window.speechSynthesis
    synth.cancel()

    const pieces = segments.flatMap((segment) => chunk(segment))
    pieces.forEach((piece, index) => {
      const utterance = new window.SpeechSynthesisUtterance(piece)
      utterance.lang = "en-GB"
      utterance.rate = 1
      if (index === pieces.length - 1) {
        utterance.onend = () => {
          stopKeepalive()
          setState("idle")
        }
      }
      utterance.onerror = () => {
        stopKeepalive()
        setState("idle")
      }
      synth.speak(utterance)
    })

    setState("speaking")
    stopKeepalive()
    keepalive.current = setInterval(() => {
      // Only nudge a queue that is meant to be running; resuming a queue the
      // reader deliberately paused would be a bug they cannot undo.
      if (synth.speaking && !synth.paused) {
        synth.pause()
        synth.resume()
      }
    }, KEEPALIVE_MS)
  }, [segments, stopKeepalive])

  const pause = useCallback(() => {
    window.speechSynthesis.pause()
    setState("paused")
  }, [])

  const resume = useCallback(() => {
    window.speechSynthesis.resume()
    setState("speaking")
  }, [])

  if (!supported) {
    return (
      <div
        className={styles.panel}
        data-testid="lab-listen"
        data-listen="unsupported"
      >
        <h2 className={styles.title}>Listen to this lab</h2>
        <p className={styles.note}>
          This browser cannot read pages aloud, so there is nothing to switch
          on here. The written walkthrough below is the whole lab.
        </p>
      </div>
    )
  }

  const busy = state !== "idle"

  return (
    <div className={styles.panel} data-testid="lab-listen" data-listen={state}>
      <h2 className={styles.title}>Listen to this lab</h2>
      <div className={styles.controls}>
        {!busy ? (
          <button type="button" className={styles.buttonSolid} onClick={start}>
            Listen
          </button>
        ) : null}
        {state === "speaking" ? (
          <button type="button" className={styles.buttonSolid} onClick={pause}>
            Pause
          </button>
        ) : null}
        {state === "paused" ? (
          <button type="button" className={styles.buttonSolid} onClick={resume}>
            Resume
          </button>
        ) : null}
        {busy ? (
          <button type="button" className={styles.buttonOutline} onClick={stop}>
            Stop
          </button>
        ) : null}
      </div>
      <p className={styles.note}>
        {covers} Read by your own browser, {estimate(words)}.
      </p>
      <p className={styles.status} role="status" aria-live="polite">
        {state === "speaking"
          ? "Reading the lab aloud."
          : state === "paused"
            ? "Paused."
            : ""}
      </p>
    </div>
  )
}
