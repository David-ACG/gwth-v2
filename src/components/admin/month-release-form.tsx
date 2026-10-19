"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import styles from "@/app/admin/admin-fde.module.css"

function toLocalInput(iso: string | null): string {
  if (!iso) return ""
  // The date is midnight UK time, so read it back in UK time too (in summer
  // that instant is 23:00 UTC the day before).
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(new Date(iso))
}

/**
 * Month 2 and Month 3 open dates (hold the clock, decision 5). Setting a date
 * moves every waiting pass holder and payer into that month on that date;
 * clearing it puts the month back on hold.
 */
export function MonthReleaseForm({ month2, month3 }: { month2: string | null; month3: string | null }) {
  const router = useRouter()
  const [pending, setPending] = useState<number | null>(null)

  async function save(month: 2 | 3, value: string) {
    setPending(month)
    try {
      const res = await fetch("/api/admin/course-release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, opensOn: value || null }),
      })
      const result = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        toast.error(result.error || "Could not save the date.")
        return
      }
      toast.success(value ? `Month ${month} opens on ${value}.` : `Month ${month} is back on hold.`)
      router.refresh()
    } finally {
      setPending(null)
    }
  }

  return (
    <section className={styles.panel} data-section="course-release">
      <div className={styles.panelHead}>
        <h2 className={styles.panelTitle}>When Months 2 and 3 open</h2>
      </div>
      <p className={styles.panelLead}>
        Until a month has a date, everyone who reaches it waits without losing any time: pass holders
        stay in the month before, and monthly payers are not charged for it. A date is midnight UK time
        at the start of that day.
      </p>
      {([2, 3] as const).map((month) => (
        <form
          key={month}
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault()
            const value = String(new FormData(e.currentTarget).get("opensOn") ?? "")
            void save(month, value)
          }}
        >
          <div className={styles.field}>
            <label className={styles.label} htmlFor={`opens-${month}`}>
              Month {month} opens on
            </label>
            <input
              id={`opens-${month}`}
              name="opensOn"
              type="date"
              className={styles.input}
              defaultValue={toLocalInput(month === 2 ? month2 : month3)}
            />
          </div>
          <button type="submit" className={styles.buttonSolid} disabled={pending !== null}>
            {pending === month ? "Saving" : "Save"}
          </button>
        </form>
      ))}
    </section>
  )
}
