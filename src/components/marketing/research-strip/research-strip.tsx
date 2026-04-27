import { MotionSection } from "@/components/marketing/motion-section"
import { RESEARCH_SOURCES } from "@/components/marketing/data"

/**
 * Six UK research sources GWTH cites — DSIT, ONS, CIPD, BCS, Tech UK,
 * Innovate UK. Headline copy is locked: "Built around UK research."
 * These are SOURCES, not partners or sponsors.
 */
export function ResearchStrip() {
  return (
    <MotionSection
      data-section="research-strip"
      className="border-y border-border bg-muted/40 py-10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center font-mono text-xs uppercase tracking-wide text-muted-foreground">
          Built around UK research
        </p>
        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:gap-x-12">
          {RESEARCH_SOURCES.map((source) => (
            <li
              key={source}
              className="text-sm font-semibold text-muted-foreground sm:text-base"
            >
              {source}
            </li>
          ))}
        </ul>
      </div>
    </MotionSection>
  )
}
