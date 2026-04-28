import { CURRICULUM } from "@/components/marketing/data"

/**
 * CurriculumVis — three-module syllabus card. Per Phase 1a decision, the
 * full syllabus stays locked behind sign-up, so each module exposes only
 * the title, lesson count and capstone callout, with a "Locked · sign up
 * to view" pill on every card. Numbers reference MONTH_CONFIGS in
 * src/lib/config.ts via marketing/data.ts so capstone names cannot drift
 * from the canonical course definition.
 */
export function CurriculumVis() {
  return (
    <div
      data-section="curriculum-vis"
      className="rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
          curriculum.gwth.ai · sample plan
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
          Locked · sign up to view
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {CURRICULUM.map((module) => (
          <article
            key={module.m}
            data-testid="curriculum-module"
            className="flex h-full flex-col rounded-xl border border-border bg-background p-4"
          >
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xs font-semibold text-primary">
                {module.m}
              </span>
              <span className="text-sm font-semibold text-foreground">{module.t}</span>
            </div>
            <span className="mt-1 text-xs text-muted-foreground">{module.d}</span>

            <div className="mt-4 flex-1 rounded-lg border border-border bg-muted/40 p-3">
              <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                Capstone
              </span>
              <strong className="mt-1 block text-sm text-foreground">
                {module.capstone}
              </strong>
              <span className="mt-1 block text-xs text-muted-foreground">
                {module.capstoneSub}
              </span>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-5 text-center font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
        Full syllabus revealed one month at a time after enrolment.
      </p>
    </div>
  )
}
