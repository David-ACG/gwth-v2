"use client"

import * as React from "react"
import { setScorePublicAction } from "@/lib/actions/score-share"
import type { ScoreShareView } from "@/lib/score/share"
import styles from "./learner-score-card.module.css"

/**
 * The learner's share buttons under their score badge (bead
 * gwth-launch-phjb): make the score page public (the opt-in; the share code
 * is minted the first time), then Add to LinkedIn, which opens LinkedIn's
 * pre-filled "Add licence or certification" form, and Copy link.
 */
export function ScoreShareActions({
  initial,
  buttonClassName,
}: {
  initial: ScoreShareView | null
  /** The page's own outline button class, so the buttons match their page. */
  buttonClassName?: string
}) {
  const [share, setShare] = React.useState(initial)
  const [pending, startTransition] = React.useTransition()
  const [copied, setCopied] = React.useState(false)
  const [failed, setFailed] = React.useState(false)
  const button = buttonClassName ?? styles.button

  function setPublic(isPublic: boolean) {
    setFailed(false)
    startTransition(async () => {
      try {
        const next = await setScorePublicAction(isPublic)
        if (next) setShare(next)
        else setFailed(true)
      } catch {
        setFailed(true)
      }
    })
  }

  async function copy() {
    if (!share) return
    try {
      await navigator.clipboard.writeText(share.pageUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      setFailed(true)
    }
  }

  const isPublic = share?.isPublic === true

  return (
    <div className={styles.share} data-testid="score-share" data-public={isPublic ? "" : undefined}>
      {isPublic && share ? (
        <>
          <p className={styles.note}>
            {SHARE_COPY.publicNote}{" "}
            <a className={styles.link} href={share.pageUrl} target="_blank" rel="noopener noreferrer">
              {share.pageUrl.replace(/^https?:\/\//, "")}
            </a>
          </p>
          <div className={styles.row}>
            <a
              className={button}
              href={share.linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="add-to-linkedin"
            >
              {SHARE_COPY.addToLinkedIn}
            </a>
            <button type="button" className={button} onClick={copy} data-testid="copy-score-link">
              {copied ? SHARE_COPY.copied : SHARE_COPY.copyLink}
            </button>
            <button
              type="button"
              className={styles.quiet}
              onClick={() => setPublic(false)}
              disabled={pending}
            >
              {SHARE_COPY.makePrivate}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className={styles.note}>{SHARE_COPY.privateNote}</p>
          <div className={styles.row}>
            <button
              type="button"
              className={button}
              onClick={() => setPublic(true)}
              disabled={pending}
              data-testid="make-score-public"
            >
              {SHARE_COPY.makePublic}
            </button>
          </div>
        </>
      )}
      {failed ? (
        <p className={styles.note} role="alert">
          {SHARE_COPY.failed}
        </p>
      ) : null}
      <span className={styles.srOnly} aria-live="polite">
        {copied ? SHARE_COPY.copied : ""}
      </span>
    </div>
  )
}

/**
 * The words on the share buttons: written by the latest Astra, checked by the
 * latest Sol on 21 Nov 2026 (GWTH-launch-plan
 * completion/score-card-real-2026-11-21/copy).
 */
export const SHARE_COPY = {
  privateNote: "Your score page is private. Make it public to add your score to LinkedIn.",
  makePublic: "Make page public",
  publicNote: "Your score page is public. Anyone with the link can see your current score:",
  addToLinkedIn: "Add to LinkedIn",
  copyLink: "Copy link",
  copied: "Link copied",
  makePrivate: "Make page private",
  failed: "That didn't work. Please try again.",
} as const
