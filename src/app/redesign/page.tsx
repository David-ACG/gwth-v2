import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Redesign · GWTH.ai",
  description: "Four homepage style variants under review.",
}

const VARIANTS = [
  {
    slug: "v-a",
    name: "A · Field Notebook",
    summary:
      "Calm, UK-grounded. Mint drench mid-page, Ink-Deep-Teal panel near close. Albert Sans + JetBrains Mono. Reads like a serious practitioner's notebook.",
    accent: "oklch(0.65 0.16 165)",
    panel: "oklch(0.18 0.04 175)",
  },
  {
    slug: "v-b",
    name: "B · Modern Technical",
    summary:
      "Dark canonical. Aqua-drench hero, generous breathing room. Geist Sans + Geist Mono. Linear-style precision without the cramp.",
    accent: "oklch(0.7 0.18 220)",
    panel: "oklch(0.18 0.04 220)",
  },
  {
    slug: "v-c",
    name: "C · Quiet Essay",
    summary:
      "Warm cream surface, Source Serif 4 body, Manrope display. Burnt Sienna replaces Aqua. Reads like an Aeon long-read.",
    accent: "oklch(0.62 0.13 40)",
    panel: "oklch(0.21 0.025 60)",
  },
  {
    slug: "v-d",
    name: "D · Supportive Learning",
    summary:
      "Friendly humanist sans (Figtree), Soft Warm Coral drench. Generous spacing, calm and supportive without being patronising.",
    accent: "oklch(0.78 0.12 25)",
    panel: "oklch(0.18 0.04 175)",
  },
] as const

export default function RedesignIndex() {
  return (
    <div className="min-h-screen bg-neutral-50 px-6 py-16 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-neutral-500">
            redesign / impeccable-homepage
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Four style worlds. Pick one.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
            Stage 1 of a two-stage review. All four variants ship the same
            information architecture and the same Score-widget hero, so the
            comparison is purely about typography, palette, and pace. After you
            pick a winner, Stage 2 swaps in three hero artefact options.
          </p>
          <p className="mt-3 max-w-xl text-sm text-neutral-500">
            Each variant works in light + dark and at 412 / 768 / 1280+ viewports.
            Use the bar at the bottom of every variant page to switch between
            them and toggle the theme.
          </p>
        </div>

        <ul className="mt-14 grid gap-5 md:grid-cols-2">
          {VARIANTS.map((v) => (
            <li key={v.slug}>
              <Link
                href={`/redesign/${v.slug}`}
                className="group relative block overflow-hidden rounded-3xl border border-neutral-200 bg-white p-7 transition-all hover:-translate-y-0.5 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="block size-3 rounded-full"
                    style={{ backgroundColor: v.accent }}
                  />
                  <span
                    aria-hidden="true"
                    className="block size-3 rounded-full"
                    style={{ backgroundColor: v.panel }}
                  />
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                    /{v.slug}
                  </span>
                </div>
                <h2 className="mt-5 text-2xl font-semibold tracking-tight">
                  {v.name}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {v.summary}
                </p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium">
                  Open variant
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-16 border-t border-neutral-200 pt-8 text-sm text-neutral-500 dark:border-neutral-800">
          <p>
            Branch: <code className="font-mono">redesign/impeccable-homepage</code>
            . Logos PNG-locked, no SVG variants. Citations preserved on all
            variants. No fabricated stats, no &ldquo;trusted by&rdquo; logo row, no
            eyebrow pills.
          </p>
        </div>
      </div>
    </div>
  )
}
