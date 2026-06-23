"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { ReportProblemPanel } from "./report-problem-panel"
import styles from "./report-problem.module.css"

/**
 * Floating "report a problem" launcher mounted across authenticated pages
 * (dashboard + lesson viewer). It opens the SAME {@link ReportProblemPanel}
 * shown always-in-view on /guide, in a square FDE overlay. The current pathname
 * is captured as the report's source page.
 *
 * Hidden on /guide itself, where the panel is already pinned in the right
 * column, and while no session-scoped chrome should overlap it.
 */
export function ReportProblemLauncher() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  // The panel is already inline on /guide — no floating duplicate there.
  if (pathname === "/guide") return null

  return (
    <>
      {!open && (
        <button
          type="button"
          className={styles.launchButton}
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
        >
          <span aria-hidden="true" className={styles.launchDot} />
          Report a problem
        </button>
      )}

      {open && (
        <div
          className={`${styles.shell} ${styles.overlay}`}
          role="dialog"
          aria-modal="true"
          aria-label="Report a problem"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div className={styles.overlayPanel}>
            <div className={styles.overlayHead}>
              <p className={styles.mono}>Report a problem</p>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
            <ReportProblemPanel
              sourcePath={pathname ?? "/"}
              variant="modal"
              onSubmitted={() => {
                // Leave the success state visible briefly, then close.
                window.setTimeout(() => setOpen(false), 1400)
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}
