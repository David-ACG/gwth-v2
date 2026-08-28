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
 * N5 (org tenancy): the organization plugin's three tables ride here too,
 * under the UK names decided 2026-08-28 (organisation / org_membership /
 * org_invitation, canonical DDL: supabase/migrations/013_org_tenancy.sql).
 * Property keys are the plugin's DEFAULT model field names (organizationId,
 * inviterId, activeOrganizationId…) so no `fields` remapping is needed in the
 * plugin config — only `modelName` — while the DB columns stay UK snake_case
 * via the drizzle column-name arguments. The export names organisation /
 * orgMembership / orgInvitation MUST match the modelName values configured in
 * src/lib/better-auth.ts: the Drizzle adapter resolves a model by looking up
 * `schema[modelName]`.
 *
 * Re-exported from `src/db/schema.ts` (the app-facing barrel).
 */
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  unique,
  uniqueIndex,
  index,
  check,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

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
  // N5 (013): the organization plugin stores the session's active org here.
  // UK column name; the property key is the plugin's default field name.
  activeOrganizationId: text("active_organisation_id"),
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

// ── N5: Better Auth organization plugin tables (canonical DDL: 013) ─────────
// Timestamps use withTimezone (the 013 columns are TIMESTAMPTZ, unlike the
// 010 core-four which are plain TIMESTAMP) and Date mode, because the plugin
// writes Date objects.

/**
 * Organisations (Better Auth `organization` model, UK-named per decision 3).
 * Plugin-managed columns first; GWTH domain columns (type/seatLimit/notes)
 * carry defaults or are nullable so plugin inserts succeed without them.
 */
export const organisation = pgTable("organisation", {
  id: text().primaryKey().notNull(),
  name: text().notNull(),
  slug: text().notNull(),
  logo: text(),
  metadata: text(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  // GWTH domain columns (not managed by Better Auth). type drives the hybrid
  // billing shape (decision 7): institution = invoice/org_seat, company =
  // Stripe per-seat (built later).
  type: text().default("company").notNull(),
  seatLimit: integer("seat_limit"),
  notes: text(),
}, (table) => [
  unique("organisation_slug_key").on(table.slug),
  check("organisation_type_check", sql`type IN ('company', 'institution')`),
])

/**
 * Org membership (Better Auth `member` model). One row per user per org;
 * learners are additionally limited to ONE org platform-wide (decision 1) by
 * the partial unique index. editionId is the GWTH per-member syllabus
 * override (NULL = org default); its FK to syllabus_edition is declared in
 * SQL only (014) to keep this module free of drizzle/schema.ts imports.
 */
export const orgMembership = pgTable("org_membership", {
  id: text().primaryKey().notNull(),
  organizationId: text("organisation_id")
    .notNull()
    .references(() => organisation.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text().default("learner").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  editionId: text("edition_id"),
}, (table) => [
  unique("org_membership_organisation_id_user_id_key").on(
    table.organizationId,
    table.userId,
  ),
  uniqueIndex("ux_org_membership_one_org_per_learner")
    .on(table.userId)
    .where(sql`role = 'learner'`),
  index("idx_org_membership_org").on(table.organizationId),
  index("idx_org_membership_user").on(table.userId),
  check(
    "org_membership_role_check",
    sql`role IN ('owner', 'admin', 'tutor', 'learner')`,
  ),
])

/**
 * Org invitations (Better Auth `invitation` model). Invitations cannot grant
 * owner — the creator role is assigned only when GWTH provisions the org.
 */
export const orgInvitation = pgTable("org_invitation", {
  id: text().primaryKey().notNull(),
  organizationId: text("organisation_id")
    .notNull()
    .references(() => organisation.id, { onDelete: "cascade" }),
  email: text().notNull(),
  role: text().default("learner").notNull(),
  status: text().default("pending").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("idx_org_invitation_org").on(table.organizationId),
  index("idx_org_invitation_email").on(table.email),
  check(
    "org_invitation_role_check",
    sql`role IN ('admin', 'tutor', 'learner')`,
  ),
  check(
    "org_invitation_status_check",
    sql`status IN ('pending', 'accepted', 'rejected', 'canceled')`,
  ),
])
