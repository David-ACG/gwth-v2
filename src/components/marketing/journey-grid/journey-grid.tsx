import { MotionSection } from "@/components/marketing/motion-section"
import { JOURNEYS } from "@/components/marketing/data"
import { JourneyCard } from "./journey-card"

/**
 * 7-card journey grid. Desktop: 3+3+1 (3 cols on rows 1 & 2; the 7th
 * card spans full width as row 3). Mobile: single column.
 *
 * Section-level entrance animation comes from MotionSection (gated on
 * prefers-reduced-motion). Per-card hover lift uses the global
 * .hover-lift utility from globals.css.
 */
export function JourneyGrid() {
  const rowOne = JOURNEYS.slice(0, 3)
  const rowTwo = JOURNEYS.slice(3, 6)
  const rowThree = JOURNEYS[6]
  if (!rowThree) {
    throw new Error("JOURNEYS must contain at least 7 entries — see marketing/data.ts")
  }

  return (
    <MotionSection data-section="journey" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
            Who it&apos;s for
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Whichever line you&apos;re standing on, the work is the same.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Seven journeys, one course, one Dynamic Score. Pick the row that fits — they
            all end up at the same proof.
          </p>
        </div>

        <div className="mt-14 space-y-6">
          <div data-row="1" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {rowOne.map((journey) => (
              <JourneyCard key={journey.n} journey={journey} />
            ))}
          </div>

          <div data-row="2" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {rowTwo.map((journey) => (
              <JourneyCard key={journey.n} journey={journey} />
            ))}
          </div>

          <div data-row="3" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <JourneyCard journey={rowThree} wide />
          </div>
        </div>
      </div>
    </MotionSection>
  )
}
