import type { Metadata } from "next"
import { GiftThanksPage } from "@/components/marketing/gift/gift-thanks-page"
import { THANKS_COPY } from "@/components/marketing/gift/gift-copy"
import { ENABLE_BILLING } from "@/lib/config"
import { fulfilPassCheckout } from "@/lib/billing/pass-fulfil"
import { getPassByCheckoutSession, type PassRecord } from "@/lib/billing/pass-store"

export const metadata: Metadata = {
  title: THANKS_COPY.meta.title,
  description: THANKS_COPY.meta.description,
  robots: { index: false },
}

export const dynamic = "force-dynamic"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>
}) {
  const { session_id } = await searchParams
  const sessionId = Array.isArray(session_id) ? session_id[0] : session_id

  let pass: PassRecord | null = null
  const hasPayment = Boolean(sessionId && /^cs_[A-Za-z0-9_]+$/.test(sessionId))
  if (sessionId && hasPayment) {
    pass = await getPassByCheckoutSession(sessionId).catch(() => null)
    if (!pass && ENABLE_BILLING) {
      // The webhook has not landed yet: fulfil from Stripe directly. Safe to
      // race the webhook; every step is idempotent.
      pass = await fulfilPassCheckout(sessionId).catch((err) => {
        console.error("[gift/thanks] fulfilment failed", err)
        return null
      })
    }
  }
  return <GiftThanksPage pass={pass} hasPayment={hasPayment} />
}
