import Link from "next/link"
import { notFound } from "next/navigation"
import { CapstoneCheckForm } from "@/components/admin/capstone-check-form"
import { requireAdminOrRedirect } from "@/lib/admin"
import { loadPublishedGuide } from "@/lib/capstones/guide-loader"
import { HAND_IN_QUESTIONS } from "@/lib/capstones/guides"
import { getHandInForMarking } from "@/lib/data/capstone-hand-ins"
import { davidQueue } from "@/lib/data/capstone-marks"
import styles from "../../admin-fde.module.css"

export const dynamic = "force-dynamic"

const BAND: Record<string, string> = { not_yet: "Not yet", pass: "Pass", good: "Good", excellent: "Excellent" }

/**
 * /admin/capstones/<hand_in_id>: one hand-in for David to check (bead
 * gwth-launch-9289.7). Why it is here, the learner's four answers and files
 * (the redacted copies the judges read), and both judges' level and quote per
 * criterion beside his own choice. Target 3 to 5 minutes.
 */
export default async function AdminCapstoneCheckPage({ params }: { params: Promise<{ handInId: string }> }) {
  await requireAdminOrRedirect()
  const { handInId } = await params
  const item = (await davidQueue()).find((q) => q.handInId === handInId)
  if (!item) notFound()
  const [handIn, guide] = await Promise.all([getHandInForMarking(handInId).catch(() => null), loadPublishedGuide(item.capstoneId)])
  const decoder = new TextDecoder()

  const criteria = (guide?.criteria ?? item.criteria.map((c) => ({ id: c.id, name: c.name, points: c.max }))).map((c) => {
    const shown = item.criteria.find((x) => x.id === c.id)
    return {
      id: c.id,
      name: c.name,
      max: c.points,
      shown: shown?.level ?? "not_yet",
      judges: item.judges.map((j) => {
        const v = j.verdict?.criteria.find((x) => x.id === c.id)
        return { judge: j.judge, level: v?.level ?? null, quote: v?.quote ?? "", feedback: v?.feedback ?? "" }
      }),
    }
  })
  const basics = (guide?.basics ?? item.basics.map((b) => ({ id: b.id, name: b.name }))).map((b) => ({
    id: b.id,
    name: b.name,
    shown: item.basics.find((x) => x.id === b.id)?.met ?? true,
    judges: item.judges.map((j) => {
      const v = j.verdict?.basics.find((x) => x.id === b.id)
      return { judge: j.judge, met: v ? v.met : null, doubt: v?.doubt ?? false, reason: v?.reason ?? "" }
    }),
  }))

  return (
    <section className={styles.section} data-section="capstone-check">
      <p>
        <Link href="/admin/capstones">Back to the queue</Link>
      </p>
      <div className={styles.sectionHead}>
        <h1 className={styles.sectionTitle}>Check hand-in {handInId.slice(0, 8)}</h1>
        <p className={styles.mono}>
          {item.band ? `${BAND[item.band]}, ${item.total} out of 100` : "No mark yet"} · hand-in {item.attemptNo}
        </p>
      </div>
      <p>
        <strong>Why it is here:</strong> {item.reasons.join("; ")}
      </p>
      {item.query && (
        <p>
          <strong>Learner&apos;s query on {item.query.criterionId}:</strong> &ldquo;{item.query.reason}&rdquo;
          {item.query.levelAfter ? ` (judges re-marked it ${BAND[item.query.levelAfter]})` : " (judges did not agree on a re-mark)"}
        </p>
      )}

      <h2 className={styles.sectionTitle}>Their four answers</h2>
      {HAND_IN_QUESTIONS.map((q) => (
        <div key={q.id} style={{ margin: "0.75rem 0" }}>
          <strong>{q.question}</strong>
          <p style={{ whiteSpace: "pre-wrap", margin: "0.25rem 0" }}>{handIn?.answers[q.id] ?? "Not available"}</p>
        </div>
      ))}

      <h2 className={styles.sectionTitle}>Their files ({handIn?.files.length ?? 0})</h2>
      {handIn?.files.map((f) => {
        const href = `/api/admin/capstones/${handInId}/file?path=${encodeURIComponent(f.path)}`
        return (
          <details key={f.path} style={{ margin: "0.4rem 0" }}>
            <summary>
              {f.convertedFrom ?? f.path} <a href={href} target="_blank" rel="noreferrer">open</a>
            </summary>
            {f.kind === "text" ? (
              <pre style={{ whiteSpace: "pre-wrap", maxHeight: "24rem", overflow: "auto" }}>{decoder.decode(f.bytes)}</pre>
            ) : f.kind === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element -- a private admin-only file
              <img src={href} alt={f.path} style={{ maxWidth: "100%" }} />
            ) : (
              <p>Not a text file: open it to look.</p>
            )}
          </details>
        )
      })}

      <h2 className={styles.sectionTitle}>Your decision</h2>
      <CapstoneCheckForm handInId={handInId} criteria={criteria} basics={basics} />
    </section>
  )
}
