"use client"

/**
 * David's decision on one capstone hand-in (bead gwth-launch-9289.7): both
 * judges' level and quote per criterion, his level beside them (starting at
 * the mark the learner sees), the basics, an optional note for the learner,
 * then "Agree with all" or "Save my levels". Either makes the mark final.
 */
import { useState } from "react"
import { useRouter } from "next/navigation"
import styles from "@/app/admin/admin-fde.module.css"

const LEVEL_LABEL: Record<string, string> = { not_yet: "Not yet", pass: "Pass", good: "Good", excellent: "Excellent" }
const LEVELS = ["not_yet", "pass", "good", "excellent"]

/** One judge's view of a criterion. */
interface JudgeView {
  judge: string
  level: string | null
  quote: string
  feedback: string
}

/** Props for {@link CapstoneCheckForm}. */
export interface CapstoneCheckFormProps {
  handInId: string
  criteria: { id: string; name: string; max: number; shown: string; judges: JudgeView[] }[]
  basics: { id: string; name: string; shown: boolean; judges: { judge: string; met: boolean | null; doubt: boolean; reason: string }[] }[]
}

/** The per-criterion decision form. */
export function CapstoneCheckForm({ handInId, criteria, basics }: CapstoneCheckFormProps) {
  const router = useRouter()
  const [levels, setLevels] = useState<Record<string, string>>(Object.fromEntries(criteria.map((c) => [c.id, c.shown])))
  const [met, setMet] = useState<Record<string, boolean>>(Object.fromEntries(basics.map((b) => [b.id, b.shown])))
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const changed = criteria.some((c) => levels[c.id] !== c.shown) || basics.some((b) => met[b.id] !== b.shown)

  async function save(agreeAll: boolean) {
    setBusy(true)
    setMessage(null)
    const body = agreeAll
      ? { levels: Object.fromEntries(criteria.map((c) => [c.id, c.shown])), basics: Object.fromEntries(basics.map((b) => [b.id, b.shown])), note }
      : { levels, basics: met, note }
    const response = await fetch(`/api/admin/capstones/${handInId}/check`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null)
    setBusy(false)
    if (!response?.ok) {
      const json = await response?.json().catch(() => ({}))
      setMessage(json?.error ?? "Could not save. Try again.")
      return
    }
    router.push("/admin/capstones?saved=1")
    router.refresh()
  }

  return (
    <div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Criterion</th>
              <th scope="col">Luna</th>
              <th scope="col">Haiku</th>
              <th scope="col">Your level</th>
            </tr>
          </thead>
          <tbody>
            {criteria.map((c) => (
              <tr key={c.id}>
                <td>
                  <strong>{c.name}</strong>
                  <div className={styles.cellMuted}>{c.max} points</div>
                </td>
                {c.judges.map((j) => (
                  <td key={j.judge}>
                    <strong>{j.level ? LEVEL_LABEL[j.level] : "No verdict"}</strong>
                    {j.quote && <div className={styles.cellMuted}>&ldquo;{j.quote}&rdquo;</div>}
                    {j.feedback && <div className={styles.cellMuted}>{j.feedback}</div>}
                  </td>
                ))}
                <td>
                  <select
                    aria-label={`Your level for ${c.name}`}
                    value={levels[c.id]}
                    onChange={(e) => setLevels({ ...levels, [c.id]: e.currentTarget.value })}
                  >
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {LEVEL_LABEL[l]}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {basics.map((b) => (
              <tr key={b.id}>
                <td>
                  <strong>Basics: {b.name}</strong>
                </td>
                {b.judges.map((j) => (
                  <td key={j.judge}>
                    <strong>{j.met === null ? "No verdict" : j.met ? (j.doubt ? "Met, in doubt" : "Met") : "Not met"}</strong>
                    {j.reason && <div className={styles.cellMuted}>{j.reason}</div>}
                  </td>
                ))}
                <td>
                  <label>
                    <input type="checkbox" checked={met[b.id]} onChange={(e) => setMet({ ...met, [b.id]: e.currentTarget.checked })} /> Met
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <label style={{ display: "grid", gap: "0.35rem", margin: "1rem 0" }}>
        <span>A line for the learner if the mark changes (optional)</span>
        <textarea value={note} onChange={(e) => setNote(e.currentTarget.value)} maxLength={500} rows={3} />
      </label>
      {message && <p role="alert">{message}</p>}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <button type="button" className={styles.buttonSolid} disabled={busy || changed} onClick={() => save(true)}>
          Agree with all
        </button>
        <button type="button" className={styles.buttonSolid} disabled={busy || !changed} onClick={() => save(false)}>
          Save my levels
        </button>
      </div>
    </div>
  )
}
