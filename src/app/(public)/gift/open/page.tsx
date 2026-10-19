import type { Metadata } from "next"
import { getSessionIdentity } from "@/lib/auth"
import { OpenGiftPage } from "@/components/marketing/gift/open-gift-page"
import { OPEN_COPY } from "@/components/marketing/gift/gift-copy"

export const metadata: Metadata = {
  title: OPEN_COPY.meta.title,
  description: OPEN_COPY.meta.description,
  robots: { index: false },
}

export const dynamic = "force-dynamic"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ code?: string | string[] }>
}) {
  const { code } = await searchParams
  const raw = Array.isArray(code) ? code[0] : code
  return <OpenGiftPage rawCode={raw?.trim() || null} identity={await getSessionIdentity()} />
}
