import { isPrivateContentMode } from "@/lib/content-mode"

/**
 * Whether the marketing pages may advertise the free Labs (W25).
 *
 * The precedent is already written into `home-fde.tsx`: "Advertising a call to
 * action a visitor cannot reach is worse than one button." While
 * `PRIVATE_CONTENT_MODE` is on, /labs bounces an anonymous visitor to /login,
 * so every in-body "Try a free lab" button on the marketing pages would
 * dead-end on a login wall for a product whose signup is closed. Those pages
 * are exactly the ones the CIPD attendees browse after the demo, so the CTA is
 * withdrawn and the copy alongside it is softened.
 *
 * Keyed on the flag rather than on the viewer, unlike the nav and footer
 * links. That is deliberate: the nav is a route the signed-in demo account
 * genuinely uses, whereas "Try a FREE lab" is marketing addressed to visitors,
 * and showing it only to the account that is already signed in would read as a
 * mistake. Both come back together at launch.
 *
 * Safe to call only from SERVER components: this reads a non-NEXT_PUBLIC env
 * var, which is undefined in the browser bundle. Every caller is a server
 * component under the (public) layout, which is force-dynamic.
 */
export function canPromoteLabs(): boolean {
  return !isPrivateContentMode()
}
