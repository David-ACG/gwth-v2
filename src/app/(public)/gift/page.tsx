import type { Metadata } from "next"
import { GiftPage } from "@/components/marketing/gift/gift-page"
import { GIFT_COPY } from "@/components/marketing/gift/gift-copy"

export const metadata: Metadata = {
  title: GIFT_COPY.meta.title,
  description: GIFT_COPY.meta.description,
}

/** The price and the on-sale state depend on today's date. */
export const dynamic = "force-dynamic"

export default function Page() {
  return <GiftPage />
}
