/**
 * Better Auth Drizzle schema (W11 — Phase 1).
 *
 * The four core Better Auth tables — user / session / account / verification —
 * with text ids and camelCase columns (Better Auth's default naming; the Drizzle
 * adapter does NOT snake_case unless told to). Canonical user table is
 * `public."user"` per D-W11-3; default table names per D-W11-4.
 *
 * Hand-authored (the `@better-auth/cli generate` step can't introspect the lazy
 * `getAuth()` in `src/lib/better-auth.ts` — it requires an eagerly exported
 * `auth`/default export, which the lazy mock-mode pattern deliberately avoids).
 * Mirrors the canonical DDL in `supabase/migrations/010_better_auth.sql` and the
 * pg-core declaration style used by `drizzle/schema.ts`.
 *
 * Re-exported from `src/db/schema.ts` (the app-facing barrel).
 */
import { pgTable, text, timestamp, boolean, unique } from "drizzle-orm/pg-core"

export const user = pgTable("user", {
  id: text().primaryKey().notNull(),
  name: text().notNull(),
  email: text().notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  unique("user_email_unique").on(table.email),
])

export const session = pgTable("session", {
  id: text().primaryKey().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
}, (table) => [
  unique("session_token_unique").on(table.token),
])

export const account = pgTable("account", {
  id: text().primaryKey().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text(),
  idToken: text("id_token"),
  password: text(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})

export const verification = pgTable("verification", {
  id: text().primaryKey().notNull(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})
