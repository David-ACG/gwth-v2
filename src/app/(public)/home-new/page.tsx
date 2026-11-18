import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { HomeNext } from "@/components/marketing/home-next/home-next"
import { isSelling } from "@/lib/launch"
import { draftPagesShown } from "@/lib/public-routes"

export const metadata: Metadata = {
  title: "Home page, new version (draft)",
  robots: { index: false, follow: false },
}

/**
 * A draft of a new home page, beside the real one at `/` (David, 18 Nov 2026:
 * "Don't overwrite the old home page. Just take a copy of it and then start
 * making changes. That I can review and either keep or discard.").
 *
 * It is a draft page (`DRAFT_PUBLIC_PATHS` in `lib/public-routes.ts`): the
 * proxy answers a real 404 for it unless the server was started with
 * SHOW_DRAFT_PAGES=1, which only the review replica sets. The check is
 * repeated here so the page can never render by accident.
 *
 * The score section is shown switched on so the whole design can be judged.
 * In the product the score is still behind `GWTH_SCORE_ENABLED`; when this
 * page replaces `/` it must pass the real flag, as `/` does.
 */
export default function HomeNewPage() {
  if (!draftPagesShown()) notFound()
  return <HomeNext selling={isSelling()} showScore />
}
