/**
 * Server-side helpers shared by the /org pages (N7).
 *
 * Deliberately thin: the /admin equivalents (`formatDate`, `formatAgo`,
 * `safe`, `AdminEmptyState`, `DashProgress`) are imported straight from
 * `../admin/admin-shared` rather than re-implemented, so the two staff
 * surfaces cannot drift apart. Only the labels /org needs and /admin has no
 * concept of live here.
 *
 * Every label follows DESIGN_FDE.md §7.5: colour is never the only carrier —
 * glyph + text say the same thing.
 */
import type { EditionSyllabusEntry } from "@/lib/data/org-admin"
import adminStyles from "../admin/admin-fde.module.css"
import styles from "./org-fde.module.css"

/** Glyph + class per tier. */
const TIER_LABELS: Record<
  EditionSyllabusEntry["tier"],
  { glyph: string; className: string | undefined; text: string }
> = {
  core: { glyph: "■", className: styles.tierCore, text: "core" },
  optional: { glyph: "◆", className: styles.tierOptional, text: "optional" },
  exclusive: { glyph: "★", className: styles.tierExclusive, text: "exclusive" },
}

/** Mono tier label — who sees this lesson. */
export function TierLabel({ tier }: { tier: EditionSyllabusEntry["tier"] }) {
  const { glyph, className, text } = TIER_LABELS[tier]
  return (
    <span className={`${adminStyles.status} ${className}`}>
      {glyph} {text}
    </span>
  )
}

/**
 * Mono ratification-state label. A draft carrying a review note reads
 * "changes requested" rather than "draft" — same DB state (D-N7-2), but the
 * screen tells the truth about who is holding the lesson up.
 */
export function StateLabel({
  state,
  hasReviewNote = false,
}: {
  state: EditionSyllabusEntry["state"]
  hasReviewNote?: boolean
}) {
  if (state === "ratified") {
    return (
      <span className={`${adminStyles.status} ${styles.stateRatified}`}>
        ✓ ratified
      </span>
    )
  }
  return (
    <span className={`${adminStyles.status} ${styles.stateDraft}`}>
      {hasReviewNote ? "↩ changes requested" : "● awaiting ratification"}
    </span>
  )
}

/** Mono baseline label for roster rows (colour + glyph + text). */
export function BaselineLabel({ met }: { met: boolean }) {
  return met ? (
    <span className={`${adminStyles.status} ${adminStyles.stActive}`}>
      ✓ baseline met
    </span>
  ) : (
    <span className={`${adminStyles.status} ${adminStyles.stRegistered}`}>
      — in progress
    </span>
  )
}

/** Mono label for whether a lesson counts toward the baseline. */
export function MandatoryLabel({ isMandatory }: { isMandatory: boolean }) {
  return isMandatory ? (
    <span className={`${adminStyles.status} ${adminStyles.stActive}`}>
      ✓ counts
    </span>
  ) : (
    <span className={`${adminStyles.status} ${adminStyles.stRegistered}`}>
      — extra
    </span>
  )
}

/** "Month 2 · optional" style metadata, in the mono voice. */
export function LessonMeta({ children }: { children: React.ReactNode }) {
  return <span className={adminStyles.mono}>{children}</span>
}

/**
 * The banner every screen shows when it is rendering fixtures rather than a
 * real institution's rows. Saying so on the face of the screen is the whole
 * point: a preview that looks like live data is worse than no preview.
 */
export function PreviewBanner() {
  return (
    <div className={styles.previewBanner} data-section="org-preview-banner">
      <strong>Preview — example data.</strong> No organisation is signed in, so
      these screens are showing an illustrative CIPD edition. Changes are not
      saved. Sign in as an organisation admin to curate a real edition.
    </div>
  )
}
