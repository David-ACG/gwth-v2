import type { Metadata } from "next"
import { getDashboardUser } from "@/lib/auth"
import { SettingsForm } from "@/components/settings/settings-form"
import {
  COURSE_MONTHLY_PRICE,
  ONGOING_MONTHLY_PRICE,
  GRACE_PERIOD_DAYS,
  ENABLE_BILLING,
} from "@/lib/config"
import { BillingActions } from "@/components/billing/billing-actions"
import styles from "./settings-fde.module.css"

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings, subscription, and preferences.",
}

/** Maps subscription state to a human-readable label */
function getSubscriptionLabel(state: string): string {
  const labels: Record<string, string> = {
    visitor: "No Account",
    registered: "Free Account",
    month1: "Month 1 · Active",
    month2: "Month 2 · Active",
    month3: "Month 3 · Active",
    ongoing: "Ongoing · Active",
    lapsed: "Lapsed · Payment Required",
  }
  return labels[state] ?? state
}

/** Subscription state as colour + glyph + text (no rounded badge). */
function SubscriptionStatus({ state }: { state: string }) {
  const label = getSubscriptionLabel(state)
  if (state === "lapsed") {
    return <span className={styles.statusWarm}>▲ {label}</span>
  }
  if (["month1", "month2", "month3", "ongoing"].includes(state)) {
    return <span className={styles.statusActive}>✓ {label}</span>
  }
  return <span className={styles.statusMuted}>○ {label}</span>
}

export default async function SettingsPage() {
  const user = await getDashboardUser()
  const state = user?.subscriptionState ?? "visitor"

  return (
    <div className={styles.shell} data-section="settings">
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>Settings</h1>
        <p className={styles.mono}>Account</p>
      </div>
      <p className={styles.pageLead}>
        Manage your account, subscription, and notification preferences
      </p>

      {/* Subscription Management */}
      <section className={styles.group}>
        <div className={styles.groupHead}>
          <h2 className={styles.groupTitle}>Subscription</h2>
          <p className={styles.mono}>Billing</p>
        </div>

        <div className={styles.fieldRow}>
          <div>
            <p className={styles.fieldLabel}>Current Plan</p>
            <p className={styles.fieldHint}>
              {state === "registered"
                ? "Free labs access only"
                : state === "ongoing"
                  ? `Full course access · £${ONGOING_MONTHLY_PRICE.toFixed(2)}/month`
                  : ["month1", "month2", "month3"].includes(state)
                    ? `Course access · £${COURSE_MONTHLY_PRICE.toFixed(2)}/month`
                    : "No active subscription"}
            </p>
          </div>
          <SubscriptionStatus state={state} />
        </div>

        {state === "lapsed" && (
          <div className={styles.noticeRust}>
            <p className={styles.statusWarm}>▲ Payment failed</p>
            <p className={`${styles.bodyText} mt-2`}>
              Your payment could not be processed. You have{" "}
              {GRACE_PERIOD_DAYS} days to update your payment method before
              losing access.
            </p>
            {ENABLE_BILLING ? (
              <button type="button" className={`${styles.buttonDanger} mt-3`}>
                Update Payment Method
              </button>
            ) : (
              <p className={`${styles.bodyText} ${styles.rustText} mt-3`}>
                Billing is disabled for beta; access is handled manually.
              </p>
            )}
          </div>
        )}

        {user?.lastPaymentDate && (
          <div className={styles.fieldRow}>
            <span className={styles.fieldLabel}>Last payment</span>
            <span className={styles.metaValue}>
              {user.lastPaymentDate.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        )}

        {state === "registered" && (
          <div className={styles.noticeMuted}>
            <p className={styles.strongLine}>Ready to start the course?</p>
            <p className={`${styles.bodyText} mt-1`}>
              Subscribe for £{COURSE_MONTHLY_PRICE.toFixed(2)}/month to
              unlock the course one month at a time once billing reopens
              for approved beta learners.
            </p>
            {ENABLE_BILLING ? (
              <BillingActions
                state={state}
                className="mt-3"
                checkoutUrl="/api/stripe/checkout"
                portalUrl="/api/stripe/portal"
              />
            ) : (
              <p className={`${styles.bodyText} mt-3`}>
                Billing is disabled for beta. Approved learners receive
                manual access from GWTH.
              </p>
            )}
          </div>
        )}

        {ENABLE_BILLING && ["month1", "month2", "month3", "ongoing"].includes(state) && (
          <BillingActions
            state={state}
            className="mt-4"
            checkoutUrl="/api/stripe/checkout"
            portalUrl="/api/stripe/portal"
          />
        )}
      </section>

      <SettingsForm />
    </div>
  )
}
