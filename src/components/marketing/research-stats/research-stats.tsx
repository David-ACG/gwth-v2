import { MotionSection } from "@/components/marketing/motion-section"
import { UK_STATS, RESEARCH_SOURCES } from "@/components/marketing/data"

/**
 * ResearchStats — three-tile UK research callout. Numbers are sourced
 * from DSIT (UK Government / AI Skills Boost programme, January 2026).
 * Citation footer lists the six research bodies cited across the site;
 * they are SOURCES, not partners or sponsors.
 */
export function ResearchStats() {
  return (
    <MotionSection data-section="research-stats" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            UK workers and businesses are falling behind on AI.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {UK_STATS.map((stat) => (
            <div
              key={stat.value}
              data-testid="research-stat"
              className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm"
            >
              <div
                className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl"
                style={{ fontFeatureSettings: "'tnum'" }}
              >
                {stat.value}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center font-mono text-xs uppercase tracking-wide text-muted-foreground">
          Source: UK Government / DSIT (Jan 2026) · {RESEARCH_SOURCES.join(" · ")}
        </p>
      </div>
    </MotionSection>
  )
}
