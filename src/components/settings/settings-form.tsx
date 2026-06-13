"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { settingsSchema, type SettingsFormData } from "@/lib/validations"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import styles from "@/app/(dashboard)/settings/settings-fde.module.css"

/**
 * Settings form with notification preferences and theme toggle.
 * Presentation follows the FDE journal register (DESIGN_FDE.md §6:
 * functional-as-is): shadcn Form/Checkbox/Select wiring is unchanged; the
 * visual layer is restyled via the settings page's scoped token module.
 * Rendered only inside the /settings page shell.
 */
export function SettingsForm() {
  const { theme, setTheme } = useTheme()
  // next-themes resolves the stored theme only on the client; render the
  // select valueless until mounted so SSR and first client render match.
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0)
    return () => window.clearTimeout(timer)
  }, [])

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      emailNotifications: true,
      studyReminders: true,
      achievementAlerts: true,
      weeklyDigest: false,
    },
  })

  function onSubmit() {
    toast.success("Settings saved")
  }

  return (
    <div className={styles.controls}>
      {/* Appearance */}
      <section className={styles.group}>
        <div className={styles.groupHead}>
          <h2 className={styles.groupTitle}>Appearance</h2>
          <p className={styles.mono}>Display</p>
        </div>
        <div className={styles.fieldRow}>
          <div>
            <p className={styles.fieldLabel}>Theme</p>
            <p className={styles.fieldHint}>
              Choose your preferred color scheme
            </p>
          </div>
          <Select value={mounted ? theme : undefined} onValueChange={setTheme}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Notifications */}
      <section className={styles.group}>
        <div className={styles.groupHead}>
          <h2 className={styles.groupTitle}>Notifications</h2>
          <p className={styles.mono}>Preferences</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="emailNotifications"
              render={({ field }) => (
                <FormItem className={styles.fieldRow}>
                  <div>
                    <FormLabel className={styles.fieldLabel}>
                      Email Notifications
                    </FormLabel>
                    <FormDescription className={styles.fieldHint}>
                      Receive important updates via email
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="studyReminders"
              render={({ field }) => (
                <FormItem className={styles.fieldRow}>
                  <div>
                    <FormLabel className={styles.fieldLabel}>
                      Study Reminders
                    </FormLabel>
                    <FormDescription className={styles.fieldHint}>
                      Daily reminders to maintain your streak
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="achievementAlerts"
              render={({ field }) => (
                <FormItem className={styles.fieldRow}>
                  <div>
                    <FormLabel className={styles.fieldLabel}>
                      Achievement Alerts
                    </FormLabel>
                    <FormDescription className={styles.fieldHint}>
                      Notifications when you unlock achievements
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weeklyDigest"
              render={({ field }) => (
                <FormItem className={styles.fieldRow}>
                  <div>
                    <FormLabel className={styles.fieldLabel}>
                      Weekly Digest
                    </FormLabel>
                    <FormDescription className={styles.fieldHint}>
                      Weekly summary of your progress
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="pt-5">
              <button type="submit" className={styles.buttonSolid}>
                Save Preferences
              </button>
            </div>
          </form>
        </Form>
      </section>
    </div>
  )
}
