import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Redesign · GWTH.ai",
  description: "Homepage style variants under review.",
}

type Variant = {
  slug: string
  name: string
  summary: string
  accent: string
  panel: string
  group: "near" | "far" | "a-family" | "e-family" | "e2-family"
  gradients: "with" | "without"
}

const VARIANTS: readonly Variant[] = [
  {
    slug: "v-a",
    name: "A · Field Notebook",
    summary:
      "Calm, UK-grounded. Mint drench mid-page, Ink-Deep-Teal panel near close. Albert Sans + JetBrains Mono. Reads like a serious practitioner's notebook.",
    accent: "oklch(0.65 0.16 165)",
    panel: "oklch(0.18 0.04 175)",
    group: "near",
    gradients: "with",
  },
  {
    slug: "v-b",
    name: "B · Modern Technical",
    summary:
      "Dark canonical. Aqua-drench hero, generous breathing room. Geist Sans + Geist Mono. Linear-style precision without the cramp.",
    accent: "oklch(0.7 0.18 220)",
    panel: "oklch(0.18 0.04 220)",
    group: "near",
    gradients: "with",
  },
  {
    slug: "v-c",
    name: "C · Quiet Essay",
    summary:
      "Warm cream surface, Source Serif 4 body, Manrope display. Burnt Sienna replaces Aqua. Reads like an Aeon long-read.",
    accent: "oklch(0.62 0.13 40)",
    panel: "oklch(0.21 0.025 60)",
    group: "near",
    gradients: "with",
  },
  {
    slug: "v-d",
    name: "D · Supportive Learning",
    summary:
      "Friendly humanist sans (Figtree), Soft Warm Coral drench. Generous spacing, calm and supportive without being patronising.",
    accent: "oklch(0.78 0.12 25)",
    panel: "oklch(0.18 0.04 175)",
    group: "near",
    gradients: "with",
  },
  {
    slug: "v-e",
    name: "E · Civic Press",
    summary:
      "Warm cream surface, deep navy carrier, burgundy accent. Vollkorn body + Public Sans display. GOV.UK / FT Weekend lineage. No gradients.",
    accent: "oklch(0.42 0.13 22)",
    panel: "oklch(0.25 0.06 250)",
    group: "far",
    gradients: "without",
  },
  {
    slug: "v-f",
    name: "F · Soft Practitioner",
    summary:
      "Pastel multi-tone (peach / sage / lavender). Bricolage Grotesque single-family. Soft section washes — most supportive of all.",
    accent: "oklch(0.58 0.18 290)",
    panel: "oklch(0.92 0.05 50)",
    group: "far",
    gradients: "with",
  },
  {
    slug: "v-g",
    name: "G · Architectural",
    summary:
      "Solid colour blocks. Big Shoulders Display + Hanken Grotesk. Black + warm cream + saturated ochre. Mid-century / Bauhaus grid. No gradients.",
    accent: "oklch(0.65 0.16 70)",
    panel: "oklch(0.15 0.012 60)",
    group: "far",
    gradients: "without",
  },
  {
    slug: "v-h",
    name: "H · Editorial Premium",
    summary:
      "Deep emerald carrier, warm cream surface, mustard accent. Domine serif + Onest sans. Stripe Press / Linear-blog premium feel.",
    accent: "oklch(0.36 0.09 165)",
    panel: "oklch(0.78 0.15 75)",
    group: "far",
    gradients: "with",
  },
  {
    slug: "v-e-2-a",
    name: "E2-A · Linen Civic",
    summary:
      "E2 with the pinkness fixed: cooler linen off-white, navy drench preserved, brick CTA, mustard gold postscript instead of red. Closest to E2 with feedback applied.",
    accent: "oklch(0.74 0.13 75)",
    panel: "oklch(0.25 0.06 250)",
    group: "e2-family",
    gradients: "without",
  },
  {
    slug: "v-e-2-b",
    name: "E2-B · Forest Editorial",
    summary:
      "Linen background, deep forest green carrier replaces navy, brick CTA, oat parchment postscript. For the readers who preferred green over blue.",
    accent: "oklch(0.72 0.13 80)",
    panel: "oklch(0.3 0.06 155)",
    group: "e2-family",
    gradients: "without",
  },
  {
    slug: "v-e-2-c",
    name: "E2-C · English Cottage",
    summary:
      "Plain English Kitchens energy. Oat parchment, sage drench, terracotta CTA, espresso brown postscript. The most explicitly earthy of the five.",
    accent: "oklch(0.72 0.13 80)",
    panel: "oklch(0.42 0.04 130)",
    group: "e2-family",
    gradients: "without",
  },
  {
    slug: "v-e-2-d",
    name: "E2-D · Soho Bronze",
    summary:
      "Warm cream, deep espresso brown carrier, bronze gold accent, brick CTA, bronze postscript. Soho House / leather-and-velvet register, very photo-friendly.",
    accent: "oklch(0.7 0.12 70)",
    panel: "oklch(0.27 0.025 50)",
    group: "e2-family",
    gradients: "without",
  },
  {
    slug: "v-e-2-e",
    name: "E2-E · Stone & Sage",
    summary:
      "Most neutral of the five. Warm stone surface, charcoal-stone drench, mustard accent, brick CTA, soft sage postscript. OKA / muted-editorial.",
    accent: "oklch(0.72 0.13 80)",
    panel: "oklch(0.32 0.005 75)",
    group: "e2-family",
    gradients: "without",
  },
  {
    slug: "v-e-2-f",
    name: "E2-F · Earthen Hybrid",
    summary:
      "Light mode = refined E2-E (lighter near-white, sage postscript). Dark mode = E2-A Linen scheme (navy + gold + brick) but with charcoal stone Section 03 (#343230) and dark forest sage postscript (#394f36).",
    accent: "oklch(0.82 0.14 75)",
    panel: "oklch(0.36 0.05 145)",
    group: "e2-family",
    gradients: "without",
  },
]

export default function RedesignIndex() {
  return (
    <div className="min-h-screen bg-neutral-50 px-6 py-16 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex flex-col gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-amber-700 dark:bg-amber-950/40">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-amber-800 dark:text-amber-300">
              archived · 2026-04-29
            </p>
            <p className="mt-1 text-sm text-amber-900 dark:text-amber-100">
              The full variant exploration below is kept for reference. Active
              colour tuning has moved to the E2-E palette explorer.
            </p>
          </div>
          <Link
            href="/redesign_v2"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 border-amber-900 bg-amber-900 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.14em] text-amber-50 transition-colors hover:bg-transparent hover:text-amber-900 dark:border-amber-300 dark:bg-amber-300 dark:text-amber-950 dark:hover:bg-transparent dark:hover:text-amber-300"
          >
            Open redesign_v2
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-neutral-500">
            redesign / impeccable-homepage · archived
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Style worlds under review.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
            All variants ship the same information architecture and the same
            Score-widget hero. The exploration concluded with E2-E (Stone &amp; Sage)
            as the chosen base; ongoing colour tuning happens on{" "}
            <Link href="/redesign_v2" className="underline underline-offset-2 hover:text-neutral-900 dark:hover:text-neutral-100">
              /redesign_v2
            </Link>
            .
          </p>
          <p className="mt-3 max-w-xl text-sm text-neutral-500">
            Each variant works in light + dark and at 412 / 768 / 1280+ viewports.
            Use the bar at the bottom of every variant page to switch between
            them and toggle the theme.
          </p>
        </div>

        {(["e2-family", "near", "far"] as const).map((group) => {
          const groupVariants = VARIANTS.filter((v) => v.group === group)
          return (
            <section key={group} className="mt-14">
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  {group === "e2-family"
                    ? "Round three — E2 plus Gold family · earthier, no pink, no red postscript"
                    : group === "near"
                      ? "Round one — close to the original brand"
                      : "Round two — further from the original brand"}
                </h2>
                <span className="font-mono text-[11px] text-neutral-400">
                  {groupVariants.length} variants
                </span>
              </div>
              <ul className="mt-5 grid gap-5 md:grid-cols-2">
                {groupVariants.map((v) => (
                  <li key={v.slug}>
                    <Link
                      href={`/redesign/${v.slug}`}
                      className="group relative block overflow-hidden rounded-3xl border border-neutral-200 bg-white p-7 transition-all hover:-translate-y-0.5 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
                    >
                      <div className="flex items-center justify-between gap-3">
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
                        {v.gradients === "without" && (
                          <span className="rounded-full border border-neutral-300 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
                            no gradients
                          </span>
                        )}
                      </div>
                      <h3 className="mt-5 text-2xl font-semibold tracking-tight">
                        {v.name}
                      </h3>
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
            </section>
          )
        })}

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
