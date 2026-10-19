import { requireAdminOrRedirect } from "@/lib/admin"
import { getMonthRelease } from "@/lib/billing/access"
import {
  listPasses,
  rollingTwelveMonthTakings,
  type PassRecord,
} from "@/lib/billing/pass-store"
import { formatPence } from "@/lib/billing/passes"
import { PassActions } from "@/components/admin/pass-actions"
import { MonthReleaseForm } from "@/components/admin/month-release-form"
import { AdminEmptyState, formatDate, safe } from "../admin-shared"
import styles from "../admin-fde.module.css"

/** VAT registration threshold in pence (from April 2024; accountant to confirm). */
const VAT_THRESHOLD = 9_000_000
/** Warn well before it (decision 8). */
const VAT_WARNING = 7_500_000

export const dynamic = "force-dynamic"

function passState(p: PassRecord): string {
  if (p.refundedAt) return "Refunded"
  if (p.redeemedAt) return "Opened"
  if (p.isGift && !p.deliveredAt) return "Waiting to send"
  return "Not opened"
}

/**
 * /admin/passes (bead gwth-launch-v1uj.5, row 1.8): every gift and prepaid
 * pass with resend, refund and extend; the Month 2 and Month 3 open dates
 * that drive hold the clock; and the rolling 12-month takings against the VAT
 * registration threshold (decision 8: GWTH is not VAT registered).
 */
export default async function AdminPassesPage() {
  await requireAdminOrRedirect()

  const [passes, release, takings] = await Promise.all([
    safe(() => listPasses()),
    safe(() => getMonthRelease()),
    safe(() => rollingTwelveMonthTakings()),
  ])

  const sold = passes?.length ?? 0
  const opened = passes?.filter((p) => p.redeemedAt).length ?? 0
  const waiting = passes?.filter((p) => p.isGift && !p.deliveredAt && !p.refundedAt).length ?? 0
  const nearThreshold = (takings ?? 0) >= VAT_WARNING

  return (
    <section className={styles.section} data-section="passes">
      <div className={styles.sectionHead}>
        <h1 className={styles.sectionTitle}>Gifts and passes.</h1>
        <p className={styles.mono}>{passes ? `${sold} sold` : "Database unavailable"}</p>
      </div>

      <div className={styles.metricsRow}>
        <div className={styles.metricCard}>
          <span className={styles.metricValue}>{sold}</span>
          <span className={styles.metricCaption}>Passes sold</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricValue}>{opened}</span>
          <span className={styles.metricCaption}>Opened</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricValue}>{waiting}</span>
          <span className={styles.metricCaption}>Gift emails still to send</span>
        </div>
        <div
          className={`${styles.metricCard} ${nearThreshold ? styles.metricAlert : ""}`}
          data-testid="vat-watch"
        >
          <span className={styles.metricValue}>{takings === null ? "?" : formatPence(takings)}</span>
          <span className={styles.metricCaption}>
            {nearThreshold ? "▲ Near the VAT threshold. " : ""}
            Takings in the last 12 months, against the {formatPence(VAT_THRESHOLD)} VAT registration
            threshold
          </span>
        </div>
      </div>

      <MonthReleaseForm
        month2={release?.month2?.toISOString() ?? null}
        month3={release?.month3?.toISOString() ?? null}
      />

      {passes === null ? (
        <AdminEmptyState
          kicker="Database unavailable"
          title="Passes cannot be read right now"
          body="This page reads prepaid_passes from Postgres. It returns as soon as the database is reachable."
        />
      ) : passes.length === 0 ? (
        <AdminEmptyState
          kicker="Nothing sold yet"
          title="No gifts or passes yet"
          body="Each paid gift or whole-course purchase appears here as soon as Stripe confirms the payment."
        />
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table} data-testid="passes-table">
            <thead>
              <tr>
                <th scope="col">Bought</th>
                <th scope="col">Pass</th>
                <th scope="col">Buyer</th>
                <th scope="col">For</th>
                <th scope="col">Email</th>
                <th scope="col">State</th>
                <th scope="col">Open by</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {passes.map((p) => (
                <tr key={p.id}>
                  <td className={styles.cellMuted}>{formatDate(p.createdAt.toISOString())}</td>
                  <td>
                    <span className={styles.cellName}>
                      {p.product === "course" ? "Whole course" : "First month"} · {formatPence(p.pricePaid)}
                    </span>
                    <span className={styles.cellEmail}>{p.code}</span>
                  </td>
                  <td>
                    <span className={styles.cellName}>{p.buyerName ?? "No name"}</span>
                    <span className={styles.cellEmail}>{p.buyerEmail}</span>
                  </td>
                  <td>
                    {p.isGift ? (
                      <>
                        <span className={styles.cellName}>{p.recipientName}</span>
                        <span className={styles.cellEmail}>{p.recipientEmail}</span>
                      </>
                    ) : (
                      <span className={styles.cellMuted}>Themselves</span>
                    )}
                  </td>
                  <td className={styles.cellMuted}>
                    {p.isGift
                      ? p.deliveredAt
                        ? `Sent ${formatDate(p.deliveredAt.toISOString())}`
                        : `Due ${formatDate((p.deliverAt ?? p.createdAt).toISOString())}`
                      : "Receipt only"}
                  </td>
                  <td>
                    <span className={styles.cellName}>{passState(p)}</span>
                    {p.redeemedAt && (
                      <span className={styles.cellEmail}>
                        {formatDate(p.redeemedAt.toISOString())}
                        {p.extraMonths ? ` · +${p.extraMonths} month${p.extraMonths > 1 ? "s" : ""}` : ""}
                      </span>
                    )}
                  </td>
                  <td className={styles.cellMuted}>{formatDate(p.redeemBy.toISOString())}</td>
                  <td>
                    <PassActions
                      id={p.id}
                      code={p.code}
                      canResend={p.isGift && !p.refundedAt}
                      canRefund={!p.refundedAt && !p.redeemedAt}
                      canExtend={!p.refundedAt}
                      extendLabel={p.redeemedAt ? "Add a month" : "3 more months to open"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
