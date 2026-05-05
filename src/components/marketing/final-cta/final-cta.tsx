import Link from "next/link"
import dynamic from "next/dynamic"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

// Defer the WaitlistForm bundle (react-hook-form + zod + sonner) — it
// only matters at the bottom of the page, so loading it eagerly was
// adding ~60KB of unused JS to the homepage critical path and hurting
// mobile LCP/TBT.
const WaitlistForm = dynamic(
  () =>
    import("@/components/landing/waitlist-form").then((m) => ({
      default: m.WaitlistForm,
    })),
  {
    loading: () => (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full bg-background/10" />
        <Skeleton className="h-12 w-full bg-background/10" />
      </div>
    ),
  }
)

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
      className="bg-foreground py-24 text-background md:py-32"
    >
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          The AI gap is still early enough to close.
          <br />
          <span className="text-primary">Start with Month 1.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-background/80">
          Join the waitlist for the UK beta. No card required for free labs.
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
