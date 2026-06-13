"use client"

import * as React from "react"
import { Copy, Linkedin, Check } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

/**
 * Share-affordance row at the foot of the verify page. Two buttons:
 *
 * - **Copy link** — copies the canonical credential URL to the clipboard
 *   via the browser Clipboard API and surfaces a Sonner toast plus an
 *   inline checkmark for accessible feedback.
 * - **Add to LinkedIn (SOON)** — present-but-deferred. Carries a small
 *   "SOON" pill and an `aria-disabled` flag so screen-reader users hear
 *   the deferred state. Real wiring tracked under
 *   `linkedin-add-to-profile-future-feature-deferred-to` — must NOT be
 *   wired in Stage 4.
 *
 * Sharp bordered buttons (Stone & Sage editorial register), uppercase
 * mono font, 2px borders, no rounding.
 */
export function ShareRow() {
  const [copied, setCopied] = React.useState(false)
  const canonicalUrl = "https://gwth.ai/score/c67sg#dde5"

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(canonicalUrl)
      setCopied(true)
      toast.success("Canonical URL copied", {
        description: canonicalUrl,
      })
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Could not copy. Long-press the URL below to share.")
    }
  }

  return (
    <section className="mt-8 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handleCopy}
        className={sharpBtn("ghost")}
        aria-label="Copy canonical URL to clipboard"
      >
        {copied ? (
          <Check className="size-3.5" aria-hidden="true" />
        ) : (
          <Copy className="size-3.5" aria-hidden="true" />
        )}
        {copied ? "Copied" : "Copy link"}
      </button>

      <button
        type="button"
        disabled
        aria-disabled="true"
        title="LinkedIn add-to-profile deep-link is coming soon"
        className={cn(
          sharpBtn("primary"),
          "cursor-not-allowed opacity-95"
        )}
      >
        <Linkedin className="size-3.5" aria-hidden="true" />
        Add to LinkedIn
        <span className="ml-1 border border-current px-1.5 py-px font-mono text-[9.5px] font-medium tracking-[0.14em] opacity-90">
          SOON
        </span>
      </button>

      <span className="ml-auto font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
        Stable URL · safe to share
      </span>
    </section>
  )
}

/**
 * Sharp Stone & Sage button — same shape as the dashboard `SharpButton`
 * but inlined here so the verify page can stay decoupled from the
 * dashboard module. 2px border, no rounding, uppercase mono label.
 */
function sharpBtn(variant: "primary" | "ghost") {
  return cn(
    "inline-flex items-center justify-center gap-2 border-2 px-[18px] py-3 font-mono text-[12px] font-bold uppercase tracking-[0.12em] transition-colors",
    variant === "ghost" &&
      "border-border text-foreground hover:bg-foreground hover:text-background",
    variant === "primary" &&
      "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
  )
}
