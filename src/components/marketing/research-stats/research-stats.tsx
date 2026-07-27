import { MotionSection } from "@/components/marketing/motion-section"
import { UK_STATS } from "@/components/marketing/data"

/**
 * ResearchStats — three-tile UK research callout. Each tile carries its OWN
 * citation. It used to print one blanket "Source: UK Government / DSIT" line
 * trailed by all six research bodies named anywhere on the site, which left a
 * reader unable to tell which organisation stood behind which number, and
 * implied four organisations that had not been cited here at all.
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
              <p
                data-testid="research-stat-source"
                className="mt-4 font-mono text-[11px] uppercase tracking-wide text-muted-foreground"
              >
                Source: {stat.source}
              </p>
            </div>
          ))}
        </div>
      </div>
    </MotionSection>
  )
}
