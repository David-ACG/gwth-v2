"use client"

import Link from "next/link"
import { useId, useRef, useState } from "react"
import { CONSENT_BUTTON, CONSENT_LINE, CONSENT_VERSION } from "@/lib/start-here/consent-wording"
import p from "@/components/marketing/paper/paper.module.css"
import styles from "./start-here.module.css"

/**
 * The Start Here email pop-up (bead gwth-launch-xw6s).
 *
 * David, 2026-10-16: the whole lesson and its film stay locked until the
 * visitor gives an email in a pop-up that says they must give it and accept
 * that we will email them more about the course. The button and the line
 * under it are his wording (2026-10-09, option A). A native <dialog> gives the
 * focus trap, Escape to close and the backdrop without a library.
 */
export function StartHereGate({ label = "Read the free lesson" }: { label?: string }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const uid = useId()
  const ids = { title: `${uid}-title`, email: `${uid}-email`, website: `${uid}-website`, consent: `${uid}-consent` }
  const [email, setEmail] = useState("")
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [resent, setResent] = useState(false)

  function open() {
    setError(null)
    dialog.current?.showModal()
  }

  async function send(address: string, honeypot = "") {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/start-here", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: address, consentVersion: CONSENT_VERSION, website: honeypot }),
      })
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; message?: string }
      if (data.success) return true
      setError(data.message ?? "Something went wrong. Please try again.")
    } catch {
      setError("Something went wrong. Please check your connection and try again.")
    } finally {
      setBusy(false)
    }
    return false
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const address = email.trim()
    if (await send(address, String(form.get("website") ?? ""))) {
      setSentTo(address)
      setResent(false)
    }
  }

  async function resend() {
    if (sentTo && (await send(sentTo))) setResent(true)
  }

  return (
    <>
      <button type="button" className={p.buttonSolid} onClick={open} data-testid="start-here-open">
        {label}
      </button>
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-labelledby={ids.title}
        data-testid="start-here-dialog"
      >
        <button
          type="button"
          className={styles.dialogClose}
          onClick={() => dialog.current?.close()}
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {sentTo ? (
          <div role="status" data-testid="start-here-sent">
            <h2 id={ids.title} className={styles.dialogTitle}>
              Check your inbox
            </h2>
            <p className={styles.dialogText}>
              We&apos;ve sent a link to <strong>{sentTo}</strong>. Open it to read the lesson. It can take a few
              minutes to arrive, so check your junk folder too.
            </p>
            {resent && <p className={styles.dialogNote}>We&apos;ve sent it again.</p>}
            {error && (
              <p className={styles.dialogError} role="alert">
                {error}
              </p>
            )}
            <div className={styles.dialogActions}>
              <button type="button" className={p.buttonOutline} onClick={resend} disabled={busy}>
                {busy ? "Sending..." : "Send it again"}
              </button>
              <button
                type="button"
                className={styles.textButton}
                onClick={() => {
                  setSentTo(null)
                  setError(null)
                }}
              >
                Use a different email address
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate={false} data-testid="start-here-form">
            <h2 id={ids.title} className={styles.dialogTitle}>
              Get the free lesson by email
            </h2>
            <p className={styles.dialogText}>
              Enter your email address and we&apos;ll send you a link that opens the lesson and its film.
            </p>
            <label className={styles.fieldLabel} htmlFor={ids.email}>
              Email address
            </label>
            <input
              id={ids.email}
              className={styles.input}
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={ids.consent}
            />
            <div className={styles.honeypot} aria-hidden="true">
              <label htmlFor={ids.website}>Leave this empty</label>
              <input id={ids.website} name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>
            {error && (
              <p className={styles.dialogError} role="alert">
                {error}
              </p>
            )}
            <button type="submit" className={`${p.buttonSolid} ${styles.fullButton}`} disabled={busy}>
              {busy ? "Sending..." : CONSENT_BUTTON}
            </button>
            <p id={ids.consent} className={styles.consent} data-testid={ids.consent}>
              {CONSENT_LINE}{" "}
              <Link href="/privacy" className={styles.consentLink}>
                Privacy notice
              </Link>
            </p>
          </form>
        )}
      </dialog>
    </>
  )
}
