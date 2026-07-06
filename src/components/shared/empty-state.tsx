import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import styles from "./state-fde.module.css"

interface EmptyStateProps {
  /**
   * Mono kicker stating the state (FDE recipe). Defaults to
   * "NOTHING HERE YET". Authored in any case — CSS uppercases it.
   */
  kicker?: string
  /** Serif one-line explanation heading */
  title: string
  /** Descriptive text below the heading */
  description: string
  /** Optional single way-out button */
  action?: {
    label: string
    href: string
  }
  /**
   * @deprecated The FDE register drops icons-in-circles; the mono kicker
   * replaces the icon. Accepted for back-compat with existing call sites but
   * not rendered.
   */
  icon?: LucideIcon
}

/**
 * Reusable empty state shown when a list has no items. FDE journal register
 * (bible item empty-error-states, DRAFT): centred paper panel, 1px ink
 * border, mono kicker, serif explanation, at most one button. No icon, no
 * rounded shadow. See DESIGN_FDE.md §5 "Empty/error states".
 */
export function EmptyState({
  kicker = "Nothing here yet",
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className={styles.shell}>
      <div className={styles.inline}>
        <div className={styles.panel} role="status">
          <p className={styles.kicker}>{kicker}</p>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.body}>{description}</p>
          {action && (
            <div className={styles.action}>
              <Link href={action.href} className={styles.button}>
                {action.label}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
