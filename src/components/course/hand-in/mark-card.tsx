"use client"

/**
 * The learner's mark on a capstone (bead gwth-launch-9289.6, David's option
 * A): the band and points, the basics, each criterion with its level, what
 * worked (quoting their own file) and how to reach the next level, then one
 * next step. Below it, the one query a learner may make per capstone.
 */
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import styles from "./hand-in.module.css"

const BAND: Record<string, string> = { not_yet: "Not yet", pass: "Pass", good: "Good", excellent: "Excellent" }
const NEXT: Record<string, string> = { not_yet: "Pass", pass: "Good", good: "Excellent", excellent: "Excellent" }

/** Props for {@link MarkCard}. */
export interface MarkCardProps {
  /** Capstone id, the API path segment. */
  capstoneId: string
  /** The marked hand-in to show. */
  card: {
    handInId: string
    attemptNo: number
    status: string
    total: number | null
    band: string | null
    criteria: { id: string; name: string; level: string; points: number; max: number; quote: string; feedback: string; nextLevel: string }[]
    basics: { id: string; name: string; met: boolean; reason: string }[]
    nextStep: string | null
    changeNote: string | null
    previousTotal: number | null
    previousBand: string | null
  }
  /** The learner's one query on this capstone, if they made it. */
  query: { criterionId: string; reason: string; status: string; levelBefore: string; levelAfter: string | null; davidNote: string | null } | null
}

function points(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, "")
}

/** The mark card and query form. */
export function MarkCard({ capstoneId, card, query }: MarkCardProps) {
  const router = useRouter()
  const [criterionId, setCriterionId] = useState(card.criteria[0]?.id ?? "")
  const [reason, setReason] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const base = `/api/hand-in/${capstoneId}/query`
  const name = (id: string) => card.criteria.find((c) => c.id === id)?.name ?? id

  async function send(url: string, body?: unknown) {
    setBusy(true)
    setError(null)
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: body ? { "content-type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      })
      const json = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(json.error ?? "Please try again. Something went wrong.")
        return false
      }
      return true
    } catch {
      setError("Check your connection and try again. We couldn't reach the server.")
      return false
    } finally {
      setBusy(false)
    }
  }

  async function submitQuery(event: React.FormEvent) {
    event.preventDefault()
    if (await send(base, { handInId: card.handInId, criterionId, reason })) {
      toast.success("Query sent. Both markers will review this part of your project and consider your reason.")
      router.refresh()
    }
  }

  async function disagree() {
    if (await send(`${base}/disagree`)) {
      toast.success("Sent to David. He'll decide within 7 days, and his decision is final.")
      router.refresh()
    }
  }

  const final = card.status === "final"
  return (
    <section className={styles.section} aria-labelledby="your-mark">
      <h2 id="your-mark" className={styles.h2}>
        Your mark for hand-in {card.attemptNo}
      </h2>
      <p className={styles.markLine}>
        <strong>{BAND[card.band ?? ""] ?? ""}</strong>, {card.total} out of 100
      </p>
      <p className={styles.note}>
        {final
          ? "This mark is final."
          : "This mark is provisional. David, the course founder, will check it within 7 days, so it may change."}
      </p>
      {card.changeNote && card.previousBand && (
        <p className={styles.notice}>
          Your mark changed from {BAND[card.previousBand]}, {card.previousTotal} out of 100. {card.changeNote}
        </p>
      )}
      {card.band === "not_yet" && (
        <p className={styles.notice}>
          Not yet means hand it in again. Each part below says what to do to reach the next level.
        </p>
      )}

      <h3 className={styles.h3}>The basics</h3>
      <ul className={styles.checklist}>
        {card.basics.map((b) => (
          <li key={b.id} className={b.met ? styles.found : styles.missing}>
            <strong>{b.met ? "Met" : "Not met"}:</strong> {b.name}
            {!b.met && <span className={styles.muted}> ({b.reason})</span>}
          </li>
        ))}
      </ul>

      <h3 className={styles.h3}>Each part of your project</h3>
      {card.criteria.map((c) => (
        <div key={c.id} className={styles.criterion}>
          <p className={styles.criterionHead}>
            <span className={styles.question}>{c.name}</span>
            <span>
              <strong>{BAND[c.level]}</strong>, {points(c.points)} of {c.max} points
            </span>
          </p>
          {c.quote && <blockquote className={styles.quote}>{c.quote}</blockquote>}
          <p className={styles.body}>
            <strong>What worked:</strong> {c.feedback}
          </p>
          <p className={styles.body}>
            <strong>{c.level === "excellent" ? "To keep it Excellent:" : `To reach ${NEXT[c.level]}:`}</strong> {c.nextLevel}
          </p>
        </div>
      ))}

      {card.nextStep && (
        <>
          <h3 className={styles.h3}>Your next step</h3>
          <p className={styles.body}>{card.nextStep}</p>
        </>
      )}

      <h3 className={styles.h3}>Query your mark</h3>
      {query ? (
        <div className={styles.notice} role="status">
          <p className={styles.noMargin}>
            You queried <strong>{name(query.criterionId)}</strong>: &ldquo;{query.reason}&rdquo;
          </p>
          {query.status === "remarking" && <p className={styles.noMargin}>Both markers are reviewing this part of your project and considering your reason.</p>}
          {query.status === "answered" && (
            <>
              <p className={styles.noMargin}>
                {query.levelAfter === query.levelBefore
                  ? `Both markers reviewed this part and considered your reason. They kept it at ${BAND[query.levelBefore]}.`
                  : `Both markers reviewed this part and considered your reason. They changed it to ${BAND[query.levelAfter ?? ""]}.`}
              </p>
              <button type="button" className={styles.secondary} disabled={busy} onClick={disagree}>
                I still disagree: ask David
              </button>
            </>
          )}
          {query.status === "with_david" && <p className={styles.noMargin}>David is reviewing it. He&apos;ll decide within 7 days, and his decision is final.</p>}
          {query.status === "resolved" && (
            <p className={styles.noMargin}>
              David decided: {BAND[query.levelAfter ?? query.levelBefore]}.{query.davidNote ? ` ${query.davidNote}` : ""}
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={submitQuery}>
          <p className={styles.help}>
            You can query one part of this project&apos;s mark, once. Both markers look again with your reason. If you
            still disagree, David decides.
          </p>
          <label className={styles.field}>
            <span>Which part?</span>
            <select value={criterionId} onChange={(e) => setCriterionId(e.currentTarget.value)} className={styles.input}>
              {card.criteria.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({BAND[c.level]})
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>Explain why this part should get a different level. Point to the files that support your reason.</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.currentTarget.value)}
              maxLength={500}
              rows={4}
              className={styles.textarea}
            />
            <span className={styles.help}>{500 - reason.length} characters left</span>
          </label>
          <button type="submit" className={styles.secondary} disabled={busy || !reason.trim()}>
            {busy ? "Sending..." : "Send query"}
          </button>
        </form>
      )}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </section>
  )
}
