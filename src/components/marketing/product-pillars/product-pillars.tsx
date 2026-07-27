import * as React from "react"
import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { ENABLE_GWTH_SCORE } from "@/lib/config"
import { cn } from "@/lib/utils"
import { MotionSection } from "@/components/marketing/motion-section"
import { PRODUCT_PILLARS } from "@/components/marketing/data"
import { CurriculumVis } from "@/components/marketing/curriculum-vis/curriculum-vis"
import { ScoreVis } from "@/components/marketing/score-vis/score-vis"
import {
  EXAMPLE_SCORE_VALUE,
  EXAMPLE_SCORE_HISTORY,
} from "@/components/marketing/score-vis/example-data"
import { PromptVis } from "@/components/marketing/prompt-vis/prompt-vis"

type Bullet = string
type RowConfig = {
  bullets: readonly Bullet[]
  vis: React.ReactNode
  cta?: { label: string; href: string }
}

const progressVis = (
  <div
    data-section="progress-vis"
    className="rounded-2xl border border-border bg-card p-6 shadow-sm"
  >
    <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
      Course progress
    </span>
    <div className="mt-5 text-center">
      <div className="text-6xl font-bold tracking-tight">64/94</div>
      <p className="mt-3 text-sm text-muted-foreground">
        Plain progress: lessons, projects, capstones, and refresh work.
      </p>
    </div>
  </div>
)

const ROW_CONFIGS: readonly RowConfig[] = [
  {
    bullets: [
      "Month 1 foundations and practical AI",
      "Month 2 apps, workflows, and consulting",
      "Month 3 enterprise AI transformation",
    ],
    vis: <CurriculumVis />,
    cta: { label: "Lessons", href: "/lessons" },
  },
  {
    bullets: ENABLE_GWTH_SCORE
      ? [
          "One-click LinkedIn embed",
          "Public verify URL, no PDFs",
          "Decays if you stop, keeps it honest",
        ]
      : [
          "Plain progress",
          "Portfolio evidence, no public credential",
          "Refresh work keeps currentness visible",
        ],
    vis: ENABLE_GWTH_SCORE ? (
      <div
        data-section="score-vis"
        className="rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
            gwth.ai/score · alex example
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
            Live · updates as you stay current
          </span>
        </div>
        <div className="mt-5 flex justify-center">
          <ScoreVis
            value={EXAMPLE_SCORE_VALUE}
            history={EXAMPLE_SCORE_HISTORY}
            size="lg"
          />
        </div>
      </div>
    ) : (
      progressVis
    ),
  },
  {
    bullets: [
      "Use Claude, ChatGPT, n8n",
      "Start in plain English",
      "Build apps, workflows, and research systems",
    ],
    vis: <PromptVis />,
  },
]

export function ProductPillars() {
  return (
    <MotionSection data-section="pillars" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Three months. Plain progress. Applied AI that compounds.
          </h2>
        </div>

        <div className="mt-14 space-y-20">
          {PRODUCT_PILLARS.map((pillar, i) => {
            const config = ROW_CONFIGS[i]
            if (!config) {
              throw new Error(
                `ROW_CONFIGS[${i}] missing — PRODUCT_PILLARS and ROW_CONFIGS out of sync`
              )
            }
            const reverse = i === 1
            return (
              <div
                key={pillar.n}
                data-row={String(i + 1)}
                data-testid="product-row"
                className={cn(
                  "flex flex-col items-center gap-10 lg:gap-16",
                  reverse ? "lg:flex-row-reverse" : "lg:flex-row"
                )}
              >
                <div className="w-full max-w-xl lg:flex-1">
                  <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                    {pillar.n} · {pillar.label}
                  </span>
                  <h3 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {pillar.title}
                  </h3>
                  <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                    {pillar.body}
                  </p>
                  <ul className="mt-6 space-y-2.5">
                    {config.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <Check
                          className="mt-0.5 size-4 shrink-0 text-accent"
                          aria-hidden="true"
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  {config.cta && (
                    <Link
                      href={config.cta.href}
                      className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                    >
                      {config.cta.label}
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  )}
                </div>

                <div className="flex w-full justify-center lg:flex-1">
                  {config.vis}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </MotionSection>
  )
}
