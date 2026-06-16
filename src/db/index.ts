/**
 * Database client singleton (W7 — D1: Drizzle ORM + postgres.js).
 *
 * Exposes a lazily-initialised Drizzle instance backed by a single shared
 * postgres.js connection. Reads `DATABASE_URL` from the environment and throws a
 * clear error if it is missing — matching the repo convention used by
 * `getStripeClient()` in `src/lib/billing/stripe.ts`.
 *
 * Per D2 there is NO row-level security; per-user scoping is enforced in
 * application code (the data layer), not the database.
 *
 * Usage:
 *   import { getDb } from "@/db"
 *   const db = getDb()
 *   const rows = await db.select().from(courses)
 */
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js"
import postgres from "postgres"
// Import the generated tables/relations directly (not via the ./schema barrel)
// so the namespace resolves under every loader, including bare ESM/tsx. App code
// should import named tables from "@/db/schema" (the app-facing barrel).
import * as tables from "../../drizzle/schema"
import * as relations from "../../drizzle/relations"
// W11 — Better Auth core tables (user/session/account/verification) live in
// src/db/auth-schema.ts, NOT in the generated drizzle/ files. They MUST be part
// of the schema handed to the Drizzle adapter, or it throws `model "user" not
// found` on every op → getSession returns null → all users denied.
import * as authTables from "./auth-schema"

const schema = { ...tables, ...relations, ...authTables }

type Db = PostgresJsDatabase<typeof schema>

// Cache the client + db across hot reloads / module re-evaluations so we don't
// open a new connection pool on every request in dev.
const globalForDb = globalThis as unknown as {
  __gwthSql?: ReturnType<typeof postgres>
  __gwthDb?: Db
}

/**
 * Returns the shared Drizzle database instance, creating it on first use.
 * Throws if DATABASE_URL is not configured.
 */
export function getDb(): Db {
  if (globalForDb.__gwthDb) return globalForDb.__gwthDb

  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error("DATABASE_URL is not configured")
  }

  const sql = globalForDb.__gwthSql ?? postgres(url)
  const db = drizzle(sql, { schema })

  globalForDb.__gwthSql = sql
  globalForDb.__gwthDb = db
  return db
}

/**
 * Returns the underlying postgres.js client (for raw SQL or graceful shutdown).
 * Throws if DATABASE_URL is not configured.
 */
export function getSql(): ReturnType<typeof postgres> {
  if (globalForDb.__gwthSql) return globalForDb.__gwthSql
  // getDb() initialises both the sql client and the db instance.
  getDb()
  return globalForDb.__gwthSql!
}

export { schema }
