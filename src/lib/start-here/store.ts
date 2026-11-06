/**
 * Start Here sign-ups: the consent record (migration 032) and the waitlist.
 *
 * The table is declared here rather than in the generated drizzle/ files,
 * which only `drizzle-kit pull` writes. Inserts and updates do not need it in
 * the relational schema map.
 */
import "server-only"

import { and, eq, gt, isNull, sql } from "drizzle-orm"
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { getDb } from "@/db"
import { waitlist } from "@/db/schema"
import { CONSENT_BUTTON, CONSENT_LINE, CONSENT_VERSION } from "./consent-wording"

export const marketingConsents = pgTable("marketing_consents", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  email: text().notNull(),
  source: text().notNull(),
  wording: text().notNull(),
  buttonLabel: text("button_label").notNull(),
  wordingVersion: text("wording_version").notNull(),
  consentedAt: timestamp("consented_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true, mode: "string" }),
  withdrawnAt: timestamp("withdrawn_at", { withTimezone: true, mode: "string" }),
})

export const START_HERE_SOURCE_TAG = "start-here"

/** Sign-ups allowed per address per hour, so the form cannot spam an inbox. */
export const MAX_SIGNUPS_PER_HOUR = 3

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** How many Start Here sign-ups this address made in the last hour. */
export async function recentSignupCount(email: string): Promise<number> {
  const rows = await getDb()
    .select({ n: sql<number>`count(*)::int` })
    .from(marketingConsents)
    .where(
      and(
        eq(marketingConsents.email, normaliseEmail(email)),
        eq(marketingConsents.source, START_HERE_SOURCE_TAG),
        gt(marketingConsents.consentedAt, sql`now() - interval '1 hour'`)
      )
    )
  return rows[0]?.n ?? 0
}

/** Records the sign-up with the exact wording on screen; returns its id. */
export async function recordConsent(email: string): Promise<string> {
  const [row] = await getDb()
    .insert(marketingConsents)
    .values({
      email: normaliseEmail(email),
      source: START_HERE_SOURCE_TAG,
      wording: CONSENT_LINE,
      buttonLabel: CONSENT_BUTTON,
      wordingVersion: CONSENT_VERSION,
    })
    .returning({ id: marketingConsents.id })
  if (!row) throw new Error("marketing_consents insert returned no row")
  return row.id
}

/**
 * Marks a sign-up confirmed (the first time only) and adds the address to the
 * waitlist. Returns the email, or null when no such sign-up exists.
 */
export async function confirmConsent(id: string): Promise<string | null> {
  const db = getDb()
  const [row] = await db
    .update(marketingConsents)
    .set({ confirmedAt: sql`coalesce(${marketingConsents.confirmedAt}, now())` })
    .where(eq(marketingConsents.id, id))
    .returning({ email: marketingConsents.email })
  if (!row) return null
  await db.insert(waitlist).values({ email: row.email }).onConflictDoNothing({ target: waitlist.email })
  return row.email
}

/** Opts the address out of course news on every sign-up it made. */
export async function withdrawConsent(id: string): Promise<string | null> {
  const db = getDb()
  const [row] = await db
    .select({ email: marketingConsents.email })
    .from(marketingConsents)
    .where(eq(marketingConsents.id, id))
  if (!row) return null
  await db
    .update(marketingConsents)
    .set({ withdrawnAt: sql`now()` })
    .where(and(eq(marketingConsents.email, row.email), isNull(marketingConsents.withdrawnAt)))
  return row.email
}
