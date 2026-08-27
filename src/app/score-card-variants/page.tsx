import type { Metadata } from "next"
import Link from "next/link"
import { ScoreCardFrame } from "@/components/marketing/score-card-variants/score-card-shared"
import { ENABLE_GWTH_SCORE } from "@/lib/config"
import { ScoreCardMinimal } from "@/components/marketing/score-card-variants/score-card-minimal"
import { ScoreCardSparkline } from "@/components/marketing/score-card-variants/score-card-sparkline"
import { ScoreCardTier } from "@/components/marketing/score-card-variants/score-card-tier"
import { requireSessionOrRedirect } from "@/lib/content-access"

export const metadata: Metadata = {
  title: ENABLE_GWTH_SCORE ? "Score card variants · GWTH.ai" : "Score card variants disabled for beta",
  description: ENABLE_GWTH_SCORE
    ? "Side-by-side comparison of three share-ticker-style score card designs."
    : "Score card variant previews are disabled for beta.",
  robots: { index: false, follow: false },
}

/**
 * Three example score histories. The "up" history is the production
 * EXAMPLE_SCORE_HISTORY (55 -> peak 118 -> 104 today). The "stable"
 * and "down" histories are synthetic so each variant can be reviewed
 * across all three trend states in one glance.
 */
const HISTORY_UP: readonly number[] = [
  55, 68, 80, 90, 98, 108, 116, 118, 116, 112, 108, 104,
]
const HISTORY_STABLE: readonly number[] = [
  103, 104, 105, 104, 103, 104, 105, 104, 103, 104, 105, 104,
]
const HISTORY_DOWN: readonly number[] = [
  120, 118, 115, 112, 110, 108, 106, 104, 102, 100, 98, 95,
]

const STATES = [
  { id: "up", label: "Up trend", history: HISTORY_UP, tier: "Top 1%" },
  { id: "stable", label: "Stable", history: HISTORY_STABLE, tier: "Top 1%" },
  { id: "down", label: "Down trend", history: HISTORY_DOWN, tier: "Top 2%" },
] as const

const VARIANTS = [
  {
    id: "minimal",
    title: "A · Minimal ticker",
    blurb: "Number + trend pill + period. No chart, no tier.",
    Component: ScoreCardMinimal,
  },
  {
    id: "sparkline",
    title: "B · Ticker + sparkline",
    blurb: "Same as A with a small directional sparkline beneath.",
    Component: ScoreCardSparkline,
  },
  {
    id: "tier",
    title: "C · Ticker + tier badge",
    blurb: "Tier pill replaces the chart entirely.",
    Component: ScoreCardTier,
  },
] as const

/**
 * Score-card variants comparison page. Renders a 3 × 3 grid:
 * columns are variants A / B / C, rows are trend states up /
 * stable / down. Built 2026-05-08 to let David pick the share-
 * ticker-style replacement for the current ring-and-graph score
 * card before porting the winner into HeroDevice.
 */
export default async function ScoreCardVariantsPage() {
  // Dev/review mock: the proxy bounce for this route is presence-only, so
  // the real gate is this server-validated session check (gwth-launch-dgc).
  await requireSessionOrRedirect()
  if (!ENABLE_GWTH_SCORE) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl flex-col justify-center px-5 py-16 sm:px-8">
        <section className="border-2 border-foreground bg-card px-7 py-8 text-center">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
            Beta access
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.022em]">
            Public credential previews are disabled for beta.
          </h1>
          <p className="mt-4 text-[16px] leading-[1.7] text-muted-foreground">
            The 23 June beta uses plain course progress. Post-beta credential
            design previews stay hidden unless the feature flag is enabled.
          </p>
          <Link href="/waitlist" className="mt-6 inline-flex border-2 border-primary bg-primary px-5 py-3 font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-primary-foreground">
            Join waitlist
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl space-y-12 px-5 py-12 sm:px-8 md:py-16">
      <header className="max-w-3xl">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
          Score card · variant comparison
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.022em] sm:text-4xl">
          Pick a winner.
        </h1>
        <p className="mt-4 text-[16px] leading-[1.7] text-muted-foreground">
          Three takes on a share-ticker-style score card, each rendered
          across the three trend states (up / stable / down). Stable
          threshold is fixed at <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">|Δ| &lt; 3</code> score
          points. Toggle dark mode with the OS theme toggle to confirm
          contrast in both. Once you pick, I&rsquo;ll port the winner
          into <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">HeroDevice</code>.
        </p>
      </header>

      <section className="space-y-3">
        <div className="grid gap-x-8 lg:grid-cols-3">
          {VARIANTS.map((v) => (
            <div key={v.id} className="space-y-1 pb-2">
              <h2 className="text-lg font-bold tracking-[-0.012em]">
                {v.title}
              </h2>
              <p className="text-[13px] text-muted-foreground">{v.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      {STATES.map((state) => (
        <section key={state.id} className="space-y-4">
          <div className="flex items-baseline gap-3 border-b border-border pb-2">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              State · {state.label}
            </h3>
            <span className="text-[12px] text-muted-foreground">
              {state.history[0]} → {state.history[state.history.length - 1]}
            </span>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {VARIANTS.map((v) => {
              const Card = v.Component
              return (
                <ScoreCardFrame
                  key={`${state.id}-${v.id}`}
                  variantLabel={`${v.title} · ${state.label}`}
                >
                  <Card
                    value={state.history.at(-1)!}
                    history={state.history}
                    tierLabel={state.tier}
                  />
                </ScoreCardFrame>
              )
            })}
          </div>
        </section>
      ))}
    </main>
  )
}
