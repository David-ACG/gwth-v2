import { ENABLE_BILLING } from "@/lib/config"
import { isSalesOpen } from "@/lib/billing/passes"

/**
 * True once GWTH is on sale: billing is switched on and SALES_OPEN_AT
 * (1 December 2026 by default, decisions 3 and 6) has passed.
 *
 * One rule for every page (launch readiness, 2026-10-20). gwth.ai changes at
 * David's GO LIVE release, which may land a few days before sales open, so
 * page copy is written to be true from that release onward and only the
 * buttons and links branch on this: buy from 1 December, the waitlist before.
 * Read it in a server component on a force-dynamic route, never at build time.
 */
export function isSelling(now: Date = new Date()): boolean {
  return ENABLE_BILLING && isSalesOpen(now)
}
