/**
 * Boot-time schema assertion (N7, QA round-3 defect 4).
 *
 * The generated Drizzle schema selects columns that only exist after a
 * migration has run, and `edition_lessons` is read on EVERY learner request
 * through N6's edition resolution. So a deploy that lands before its
 * migrations do does not degrade — the learner surface fails with
 * `column does not exist` on every page.
 *
 * The migrations are additive and idempotent, so the safe order is always
 * "migrate, then deploy". Nothing enforced that ordering except a paragraph in
 * a completion packet, which is not a control. This is: `register()` in
 * `src/instrumentation.ts` runs once per server boot, before the first
 * request, and a missing column aborts startup so the container crash-loops
 * loudly at deploy time instead of serving a broken product.
 *
 * Two deliberate softenings, so this can only ever catch the real failure:
 *
 *  - No `DATABASE_URL` (local mock mode) is not checked at all.
 *  - A database that cannot be REACHED is logged, not fatal. A transient
 *    connection failure at boot must not turn a healthy deploy into a
 *    crash-loop; only a definitive answer that the columns are absent does.
 */

/** Columns whose absence would break a request path, and the migration. */
const REQUIRED_COLUMNS: Array<{
  table: string
  column: string
  migration: string
}> = [
  { table: "lesson_progress", column: "graded_by", migration: "016_server_grading.sql" },
  { table: "lesson_progress", column: "quiz_answers", migration: "016_server_grading.sql" },
  { table: "edition_lessons", column: "updated_at", migration: "019_edition_ratification.sql" },
  { table: "edition_lessons", column: "decided_at", migration: "019_edition_ratification.sql" },
  { table: "edition_lessons", column: "decided_by", migration: "019_edition_ratification.sql" },
  { table: "edition_lessons", column: "review_note", migration: "019_edition_ratification.sql" },
]

/**
 * Throws when the configured database is missing a column the app selects.
 *
 * @param query Injected for tests: returns the `table.column` pairs that
 *   exist. Production callers use the default, which reads
 *   `information_schema.columns` through the shared Drizzle client.
 */
export async function assertSchemaMigrated(
  query?: () => Promise<Set<string>>
): Promise<void> {
  if (!process.env.DATABASE_URL) return

  let present: Set<string>
  try {
    present = query ? await query() : await readColumns()
  } catch (error) {
    // Unreachable database at boot: log and continue. Failing here would turn
    // every transient DB blip into a crash-loop, which is a worse outcome
    // than the one this guard exists to prevent.
    console.warn(
      "[schema-guard] could not read information_schema at boot; skipping the migration check",
      error
    )
    return
  }

  const missing = REQUIRED_COLUMNS.filter(
    (required) => !present.has(`${required.table}.${required.column}`)
  )
  if (missing.length === 0) return

  const byMigration = new Map<string, string[]>()
  for (const item of missing) {
    const list = byMigration.get(item.migration) ?? []
    list.push(`${item.table}.${item.column}`)
    byMigration.set(item.migration, list)
  }
  const detail = [...byMigration]
    .map(([migration, columns]) => `  ${migration}: ${columns.join(", ")}`)
    .join("\n")

  throw new Error(
    "FATAL: the database is missing columns this build selects, so learner " +
      "pages would fail on every request. Run the outstanding migrations in " +
      "supabase/migrations (they are additive and idempotent) BEFORE " +
      `deploying this build.\n${detail}`
  )
}

/** The `table.column` pairs that actually exist, for the tables we care about. */
async function readColumns(): Promise<Set<string>> {
  const { getDb } = await import("@/db")
  const { sql } = await import("drizzle-orm")
  const tables = [...new Set(REQUIRED_COLUMNS.map((c) => c.table))]
  const rows = await getDb().execute<{ table_name: string; column_name: string }>(
    sql`SELECT table_name, column_name FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name IN (${sql.join(
            tables.map((t) => sql`${t}`),
            sql`, `
          )})`
  )
  return new Set(
    Array.from(rows as Iterable<{ table_name: string; column_name: string }>).map(
      (row) => `${row.table_name}.${row.column_name}`
    )
  )
}
