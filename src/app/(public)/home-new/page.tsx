import { notFound, redirect } from "next/navigation"
import { draftPagesShown } from "@/lib/public-routes"

/**
 * The draft of the new home page lived here until 19 Nov 2026, when David
 * asked for it to replace `/`. Old review links on the replica now land on the
 * real home page; everywhere else it stays a 404 (`DRAFT_PUBLIC_PATHS`).
 */
export default function HomeNewPage() {
  if (!draftPagesShown()) notFound()
  redirect("/")
}
