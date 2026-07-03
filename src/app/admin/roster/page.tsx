import Link from "next/link"
import { getRoster, type RosterEntry } from "@/lib/data/admin"
import { GrantForm } from "@/components/admin/grant-form"
import {
  AdminEmptyState,
  formatAgo,
  formatDate,
  safe,
  StateLabel,
} from "../admin-shared"
import styles from "../admin-fde.module.css"

/** Sortable roster columns, synced to ?sort= so views are shareable. */
const SORT_KEYS = ["name", "state", "signup", "activity"] as const
type SortKey = (typeof SORT_KEYS)[number]

/** Ranks states so the state sort groups granted → waitlist → revoked → registered. */
const STATE_RANK: Record<RosterEntry["state"], number> = {
  granted: 0,
  waitlist: 1,
  revoked: 2,
  registered: 3,
}

function sortRoster(entries: RosterEntry[], sort: SortKey, dir: 1 | -1): RosterEntry[] {
  const sorted = [...entries]
  sorted.sort((a, b) => {
    switch (sort) {
      case "name":
        return dir * a.name.localeCompare(b.name)
      case "state":
        return dir * (STATE_RANK[a.state] - STATE_RANK[b.state])
      case "signup":
        return (
          dir *
          (new Date(b.signedUpAt).getTime() - new Date(a.signedUpAt).getTime())
        )
      case "activity": {
        const at = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0
        const bt = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0
        return dir * (bt - at)
      }
    }
  })
  return sorted
}

/**
 * /admin/roster — Panel 1 (every registered user + waitlist-only signups,
 * with derived access state, signup date and last activity; sortable) and
 * Panel 4 (the manual grant form, target of the header's "Grant access").
 */
export default async function AdminRosterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const sortParam = typeof params.sort === "string" ? params.sort : "signup"
  const sort: SortKey = (SORT_KEYS as readonly string[]).includes(sortParam)
    ? (sortParam as SortKey)
    : "signup"
  const dir: 1 | -1 = params.dir === "desc" ? -1 : 1

  const roster = await safe(() => getRoster())
  const entries = roster ? sortRoster(roster, sort, dir) : []

  return (
    <section className={styles.section} data-section="roster">
      <div className={styles.sectionHead}>
        <h1 className={styles.sectionTitle}>Roster.</h1>
        <p className={styles.mono}>
          {roster ? `${entries.length} people` : "Database unavailable"}
        </p>
      </div>

      <GrantForm />

      {roster === null ? (
        <AdminEmptyState
          kicker="Database unavailable"
          title="The roster cannot be read right now"
          body="The roster reads users, grants and the waitlist from Postgres. It returns as soon as the database is reachable."
        />
      ) : entries.length === 0 ? (
        <AdminEmptyState
          kicker="No people yet"
          title="Nobody has signed up or joined the waitlist"
          body="Grant the first tester above; they appear here the moment the grant is saved, and their account joins the row when they sign up."
        />
      ) : (
        <RosterTable entries={entries} sort={sort} dir={dir} />
      )}
    </section>
  )
}

/** Column-header link that toggles direction when re-clicked. */
function SortHeader({
  label,
  sortKey,
  sort,
  dir,
}: {
  label: string
  sortKey: SortKey
  sort: SortKey
  dir: 1 | -1
}) {
  const active = sort === sortKey
  const nextDir = active && dir === 1 ? "desc" : "asc"
  return (
    <Link
      href={`/admin/roster?sort=${sortKey}&dir=${nextDir}`}
      className={styles.sortLink}
      data-active={active ? "true" : undefined}
    >
      {label}
      {active ? (dir === 1 ? " ↑" : " ↓") : ""}
    </Link>
  )
}

function RosterTable({
  entries,
  sort,
  dir,
}: {
  entries: RosterEntry[]
  sort: SortKey
  dir: 1 | -1
}) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">
              <SortHeader label="Person" sortKey="name" sort={sort} dir={dir} />
            </th>
            <th scope="col">
              <SortHeader label="Access" sortKey="state" sort={sort} dir={dir} />
            </th>
            <th scope="col">Months</th>
            <th scope="col">
              <SortHeader label="Signed up" sortKey="signup" sort={sort} dir={dir} />
            </th>
            <th scope="col">
              <SortHeader
                label="Last activity"
                sortKey="activity"
                sort={sort}
                dir={dir}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={`${entry.userId ?? "waitlist"}-${entry.email}`}>
              <td>
                <span className={styles.cellName}>{entry.name}</span>
                <span className={styles.cellEmail}>{entry.email}</span>
              </td>
              <td>
                <StateLabel state={entry.state} />
                {entry.state !== "waitlist" && entry.onWaitlist ? (
                  <span className={styles.cellEmail}>also on waitlist</span>
                ) : null}
              </td>
              <td className={styles.cellMuted}>
                {entry.subscriptionMonth > 0 ? `1–${entry.subscriptionMonth}` : "—"}
              </td>
              <td className={styles.cellMuted}>{formatDate(entry.signedUpAt)}</td>
              <td className={styles.cellMuted}>{formatAgo(entry.lastActiveAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
