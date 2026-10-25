/**
 * The day the course opens, in ONE place (David, 2026-10-25: "Please use the
 * first of december twenty sixth as the main date. This may have to be changed
 * to a later date, such as the tenth or the twelfth, if we don't make it by the
 * first").
 *
 * To move the launch, change DEFAULT_SALES_OPEN_AT. Every page, email subtitle
 * and checkout message prints COURSE_OPENS_ON, and selling switches on at the
 * same moment (lib/billing/passes.ts). Pure, with no server imports, so client
 * components can use it too.
 */

/** Default sale window (decision 3): sales open 1 Dec, the £69 price ends after 6 Jan (UK). */
export const DEFAULT_SALES_OPEN_AT = "2026-12-01T00:00:00Z"

/** "25 December 2026", in UK time. */
export function formatUkDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

/** The opening date as the pages print it: "1 December 2026". */
export const COURSE_OPENS_ON = formatUkDate(new Date(DEFAULT_SALES_OPEN_AT))
