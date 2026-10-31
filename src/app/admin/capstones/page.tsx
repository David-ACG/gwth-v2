import Link from "next/link"
import { requireAdminOrRedirect } from "@/lib/admin"
import { agreementReport, type AgreementResult } from "@/lib/capstones/agreement"
import { CAPSTONE_IDS } from "@/lib/capstones/guides"
import { checkedMarks, davidQueue } from "@/lib/data/capstone-marks"
import { AdminEmptyState, formatAgo, safe } from "../admin-shared"
import styles from "../admin-fde.module.css"

const CAPSTONE: Record<string, string> = { familybot: "Month 1 FamilyBot", askmyco: "Month 2 AskMyCo", askeveryone: "Month 3 askevery.one" }
const BAND: Record<string, string> = { not_yet: "Not yet", pass: "Pass", good: "Good", excellent: "Excellent" }

export const dynamic = "force-dynamic"

/**
 * /admin/capstones: David's capstone check queue (bead gwth-launch-9289.7,
 * decision 5): every one of the first 20 hand-ins per capstone, every mark
 * the judges flagged (disagreement, near a band line, basics doubt, a judge
 * failing), every query he must decide, and a random 1 in 20 agreed marks.
 * Oldest first. Each row opens the hand-in to Agree or change a level.
 */
export default async function AdminCapstonesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdminOrRedirect()
  const saved = (await searchParams).saved === "1"
  const [queue, checked] = await Promise.all([safe(() => davidQueue()), safe(() => checkedMarks())])
  const report = checked ? agreementReport(checked, CAPSTONE_IDS) : null

  return (
    <section className={styles.section} data-section="capstone-checks">
      <div className={styles.sectionHead}>
        <h1 className={styles.sectionTitle}>Capstones to check</h1>
        <p className={styles.mono}>{queue ? `${queue.length} waiting` : "Database unavailable"}</p>
      </div>
      {saved && <p className={styles.cellMuted}>Saved. The learner now sees the final mark.</p>}
      {report && (
        <>
          <h2 className={styles.sectionTitle}>Do the judges mark like you?</h2>
          <p className={styles.cellMuted}>
            Measured against the hand-ins you have checked. A pass needs 20 checked, the same band on 17 of 20, never two
            bands off, never a pass where you gave Not yet, and totals within 8 points on average. When the pair passes on
            a capstone, its agreed marks stand without you, except a random 1 in 20.
          </p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Capstone</th>
                  <th scope="col">Luna</th>
                  <th scope="col">Haiku</th>
                  <th scope="col">The pair</th>
                </tr>
              </thead>
              <tbody>
                {report.map((r) => (
                  <tr key={r.capstoneId}>
                    <td>{CAPSTONE[r.capstoneId]}</td>
                    <AgreementCell result={r.luna} />
                    <AgreementCell result={r.haiku} />
                    <AgreementCell result={r.pair} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h2 className={styles.sectionTitle}>Waiting for you</h2>
        </>
      )}
      {queue === null ? (
        <AdminEmptyState kicker="Database unavailable" title="The queue cannot be read right now" body="This page reads capstone_attempts from Postgres." />
      ) : queue.length === 0 ? (
        <AdminEmptyState kicker="Nothing waiting" title="No hand-ins need you" body="Hand-ins appear here when the judges flag one, a learner still disagrees after a query, or it is one of the first 20 for its capstone." />
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Hand-in</th>
                <th scope="col">Capstone</th>
                <th scope="col">Why it is here</th>
                <th scope="col">Mark now</th>
                <th scope="col">Waiting</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((item) => (
                <tr key={item.handInId}>
                  <td>
                    <Link href={`/admin/capstones/${item.handInId}`}>Check {item.handInId.slice(0, 8)}</Link>
                    <div className={styles.cellMuted}>Hand-in {item.attemptNo}</div>
                  </td>
                  <td>{CAPSTONE[item.capstoneId] ?? item.capstoneId}</td>
                  <td>{item.reasons.join("; ")}</td>
                  <td>{item.band ? `${BAND[item.band]}, ${item.total}` : "No mark yet"}</td>
                  <td className={styles.cellMuted}>{formatAgo(item.confirmedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

/** One marker's agreement result: passed or not, and why. */
function AgreementCell({ result }: { result: AgreementResult }) {
  return (
    <td>
      <strong>{result.passed ? "Passes" : "Not yet passing"}</strong>
      <div className={styles.cellMuted}>
        {result.checked} checked
        {result.checked ? `, same band ${result.sameBand}, average gap ${result.meanGap}` : ""}
      </div>
      {!result.passed && <div className={styles.cellMuted}>{result.failing.join("; ")}</div>}
    </td>
  )
}
