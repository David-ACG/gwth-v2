"use client"

import { useState, type ReactNode } from "react"
import type { ModelLabRowFile } from "@/lib/types"
import styles from "./model-lab.module.css"

/** Props for {@link SetupRow}. */
interface SetupRowProps {
  /** The lab's slug, for the answer request. */
  slug: string
  /** The set-up id, e.g. "opus-5.5_medium". */
  setup: string
  /** The set-up's display name with its level, for the button, frame titles and alt text. */
  name: string
  /** Its answer files (without markdown text, which is fetched on open). */
  files: ModelLabRowFile[]
  /** How many columns the opened row spans. */
  colSpan: number
  /** The row's cells, rendered on the server. */
  children: ReactNode
}

type Loaded = { name: string; html: string }[]

/**
 * One row of "Every set-up we tested", with an "Answer" button that opens a
 * second row holding that set-up's answer to the main task. The cells are
 * server-rendered and passed in as children; only the toggle lives here.
 *
 * Written answers are fetched when the row is first opened, from
 * /labs/<slug>/answer/<setup>, which renders them on the server, so the page
 * does not carry thirty-odd answers nobody opened. Apps open in a sandboxed
 * frame, charts and pictures as images.
 */
export function SetupRow({ slug, setup, name, files, colSpan, children }: SetupRowProps) {
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [failed, setFailed] = useState(false)
  const rowId = `answer-${setup.replace(/[^a-z0-9-]/gi, "-")}`
  const needsText = files.some((f) => f.name.endsWith(".md"))

  async function toggle() {
    const next = !open
    setOpen(next)
    if (!next || !needsText || loaded) return
    try {
      const res = await fetch(
        `/labs/${encodeURIComponent(slug)}/answer/${encodeURIComponent(setup)}`,
      )
      if (!res.ok) throw new Error(String(res.status))
      const body = (await res.json()) as { parts: Loaded }
      setLoaded(body.parts)
      setFailed(false)
    } catch {
      setFailed(true)
    }
  }

  return (
    <>
      <tr>
        {children}
        <td>
          <button
            type="button"
            className={styles.buttonSecondary}
            aria-expanded={open}
            aria-controls={rowId}
            onClick={toggle}
          >
            {open ? "Hide" : "Answer"}
            <span className="sr-only"> from {name}</span>
          </button>
        </td>
      </tr>
      <tr className={styles.expand} id={rowId} hidden={!open}>
        <td colSpan={colSpan}>
          {open ? (
            <RowAnswer files={files} name={name} loaded={loaded} failed={failed} needsText={needsText} />
          ) : null}
        </td>
      </tr>
    </>
  )
}

function RowAnswer({
  files,
  name,
  loaded,
  failed,
  needsText,
}: {
  files: ModelLabRowFile[]
  name: string
  loaded: Loaded | null
  failed: boolean
  needsText: boolean
}) {
  if (!files.length) return <p>No answer was produced.</p>
  if (needsText && !loaded) {
    return (
      <p className={styles.meta}>
        {failed ? "The answer could not be loaded. Try again in a moment." : "Loading the answer."}
      </p>
    )
  }
  return (
    <>
      {files.map((f) => {
        if (f.name.endsWith(".html")) {
          return (
            <iframe
              key={f.name}
              className={styles.app}
              title={name}
              sandbox="allow-scripts allow-forms allow-modals"
              loading="lazy"
              src={f.src}
            />
          )
        }
        if (f.name.endsWith(".svg")) {
          // eslint-disable-next-line @next/next/no-img-element
          return <img key={f.name} className={styles.chart} alt={`${name}: chart`} src={f.src} />
        }
        if (f.name.endsWith(".png")) {
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={f.name}
              className={`${styles.chart} ${styles.picture}`}
              alt={`${name}: picture`}
              src={f.src}
            />
          )
        }
        const part = loaded?.find((p) => p.name === f.name)
        return part ? (
          <div
            key={f.name}
            className={`lesson-prose ${styles.md}`}
            // Rendered on the server by renderAnswerMarkdown (raw HTML dropped).
            dangerouslySetInnerHTML={{ __html: part.html }}
          />
        ) : null
      })}
    </>
  )
}
