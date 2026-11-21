/**
 * The GWTH.ai score share link and the LinkedIn "Add to profile" link (bead
 * gwth-launch-phjb). Pure: safe in client components and tests.
 *
 * LinkedIn's add-to-profile form (addtoprofile.linkedin.com) takes the
 * certification as query parameters: `startTask=CERTIFICATION_NAME`, `name`,
 * the issuer as `organizationName` (plain text; `organizationId` is the
 * alternative once GWTH.ai has a LinkedIn company page), `issueYear` and
 * `issueMonth` (1 to 12), `certUrl` (the Show credential link) and `certId`
 * (the Credential ID line). Every value is URL-encoded.
 */

/** Share codes: 10 characters, lower-case letters and digits without 0, 1, i, l, o. */
export const SHARE_CODE_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"
export const SHARE_CODE_LENGTH = 10
export const SHARE_CODE_PATTERN = /^[a-z2-9]{10}$/

/** The name of the certification on the learner's profile. */
export const LINKEDIN_CERT_NAME = "GWTH.ai score"
export const LINKEDIN_ORG_NAME = "GWTH.ai"

/** True when the value has the shape of a share code (a cheap guard before the database). */
export function isShareCode(value: string): boolean {
  return SHARE_CODE_PATTERN.test(value)
}

/** The site origin the public links point at. */
export function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://gwth.ai").replace(/\/+$/, "")
}

/** The learner's public score page: what Show credential opens. */
export function scorePageUrl(code: string, origin: string = siteOrigin()): string {
  return `${origin}/verify/${code}`
}

/**
 * LinkedIn's pre-filled "Add licence or certification" form. `issued` is when
 * the learner first shared the score (the code's creation), shown on LinkedIn
 * as the issue date.
 */
export function linkedInAddUrl(code: string, issued: Date, origin: string = siteOrigin()): string {
  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: LINKEDIN_CERT_NAME,
    organizationName: LINKEDIN_ORG_NAME,
    issueYear: String(issued.getUTCFullYear()),
    issueMonth: String(issued.getUTCMonth() + 1),
    certUrl: scorePageUrl(code, origin),
    certId: code,
  })
  // URLSearchParams writes spaces as "+"; LinkedIn's own examples use %20.
  return `https://www.linkedin.com/profile/add?${params.toString().replace(/\+/g, "%20")}`
}

/** "9 March 2027", in UK time: the badge's date lines. */
export function formatBadgeDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  }).format(date)
}

/** What the learner's share buttons need (built on the server, passed to the client). */
export type ScoreShareView = {
  code: string
  isPublic: boolean
  pageUrl: string
  linkedInUrl: string
}

/** The share buttons' view of a share row. */
export function shareView(share: { code: string; isPublic: boolean; createdAt: Date }): ScoreShareView {
  return {
    code: share.code,
    isPublic: share.isPublic,
    pageUrl: scorePageUrl(share.code),
    linkedInUrl: linkedInAddUrl(share.code, share.createdAt),
  }
}

/** The "Last changed" footer before the learner has earned a point. */
export const NO_CHANGE_YET = "Not yet"
