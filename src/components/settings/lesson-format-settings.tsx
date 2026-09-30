"use client"

/**
 * Settings: how the learner takes lessons in parts (bead gwth-launch-hqyp).
 * The same choice as the first-lesson choice screen and the Watch / Read
 * switch inside every lesson; saved as soon as it changes.
 */
import * as React from "react"
import { toast } from "sonner"
import { saveLessonPrefsAction } from "@/lib/actions/lesson-parts"
import type { LessonFormat } from "@/lib/lessons/parts"
import { FORMAT_COPY } from "@/components/lesson-parts/copy"
import styles from "@/app/(dashboard)/settings/settings-fde.module.css"

export function LessonFormatSettings({ initial }: { initial: { lessonFormat: LessonFormat | null; readAlong: boolean } }) {
  const [format, setFormat] = React.useState<LessonFormat | null>(initial.lessonFormat)
  const [readAlong, setReadAlong] = React.useState(initial.readAlong)
  const [busy, setBusy] = React.useState(false)

  const save = async (patch: { lessonFormat?: LessonFormat; readAlong?: boolean }) => {
    setBusy(true)
    const res = await saveLessonPrefsAction(patch).catch(() => null)
    setBusy(false)
    if (res?.ok) toast.success("Saved")
    else toast.error(res?.message ?? "That setting could not be saved. Try again.")
  }

  return (
    <section className={styles.group} data-section="lesson-format">
      <div className={styles.groupHead}>
        <h2 className={styles.groupTitle}>Lessons</h2>
      </div>
      <fieldset className={styles.fieldRow} style={{ border: 0, margin: 0, display: "block" }}>
        <legend className={styles.fieldLabel}>How you take lessons</legend>
        <p className={styles.fieldHint}>You can also switch inside any lesson with the Watch and Read buttons at the top.</p>
        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          {(["watch", "read"] as const).map((f) => (
            <label key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
              <input
                type="radio"
                name="lesson-format"
                value={f}
                checked={format === f}
                disabled={busy}
                onChange={() => {
                  setFormat(f)
                  void save({ lessonFormat: f })
                }}
                style={{ marginTop: 4, width: 18, height: 18 }}
              />
              <span>
                <span className={styles.fieldLabel}>{FORMAT_COPY[f].name}</span>
                <span className={styles.fieldHint} style={{ display: "block" }}>
                  {FORMAT_COPY[f].blurb}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className={styles.fieldRow}>
        <label htmlFor="read-along-setting" style={{ cursor: "pointer" }}>
          <span className={styles.fieldLabel}>Read along</span>
          <span className={styles.fieldHint} style={{ display: "block" }}>
            When a part is read aloud, each word is highlighted as it is spoken.
          </span>
        </label>
        <input
          id="read-along-setting"
          type="checkbox"
          checked={readAlong}
          disabled={busy}
          onChange={(e) => {
            setReadAlong(e.target.checked)
            void save({ readAlong: e.target.checked })
          }}
          style={{ width: 20, height: 20 }}
        />
      </div>
    </section>
  )
}
