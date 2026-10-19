import type { Metadata } from "next"
import { GiftCardPrint } from "@/components/marketing/gift/gift-card-print"
import { CARD_COPY } from "@/components/marketing/gift/gift-copy"
import { normalisePassCode } from "@/lib/billing/passes"
import { getPassByCode } from "@/lib/billing/pass-store"

export const metadata: Metadata = {
  title: CARD_COPY.meta.title,
  robots: { index: false },
}

export const dynamic = "force-dynamic"

/**
 * /gift/card?code=: the printable gift card (bead gwth-launch-v1uj.5, row
 * 1.3), the fallback if the Christmas morning email does not arrive. Outside
 * the public layout so it prints as one clean page with no navigation.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ code?: string | string[] }>
}) {
  const { code } = await searchParams
  const raw = Array.isArray(code) ? code[0] : code
  const normal = raw ? normalisePassCode(raw) : null
  const pass = normal ? await getPassByCode(normal).catch(() => null) : null
  return <GiftCardPrint pass={pass && !pass.refundedAt ? pass : null} />
}
