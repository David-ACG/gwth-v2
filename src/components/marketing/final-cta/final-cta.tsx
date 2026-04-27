import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WaitlistForm } from "@/components/landing/waitlist-form"

/**
 * FinalCTA — dark band closing call-to-action. Mounts the existing
 * WaitlistForm unchanged so the email-collection flow stays a single
 * source of truth. Copy is locked from the variant-1-garrow brief; the
 * "free lab" CTA is preserved as the secondary action.
 */
export function FinalCTA() {
  return (
    <section
      data-section="final-cta"
      className="bg-foreground py-20 text-background md:py-28"
    >
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          The best time to learn AI was six months ago.
          <br />
          <span className="text-primary">The second best time is right now.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-background/80">
          Join the waitlist for the next cohort. No card required for free labs.
        </p>

        <div className="mx-auto mt-10 max-w-md">
          <WaitlistForm />
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            asChild
            variant="ghost"
            className="text-background hover:bg-background/10 hover:text-background"
          >
            <Link href="/labs">
              Try a free lab
              <ArrowRight className="ml-1 size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <p className="mt-6 text-sm text-background/60">
          No card required for free labs · UK VAT included on subscription
        </p>
      </div>
    </section>
  )
}
