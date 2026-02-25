import Link from "next/link"
import type { Metadata } from "next"
import { Mail, Check, ArrowRight, Radar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const metadata: Metadata = {
  title: "Newsletter",
  description:
    "The GWTH Weekly — one email per week with a practical AI tip, tool updates from the Tech Radar, and course previews. No spam. No sales pressure.",
}

const includes = [
  "A practical AI tip you can use that day",
  "Tool updates from the GWTH Tech Radar (60+ tools tracked daily)",
  "Course updates and new content previews",
]

const notIncludes = [
  "No spam",
  "No sales pressure",
  "No vendor partnerships",
]

/**
 * Newsletter signup page.
 * Presents the GWTH Weekly value proposition and a stubbed email signup form.
 */
export default function NewsletterPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 inline-flex rounded-full bg-primary/10 p-3">
            <Mail className="size-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            The GWTH Weekly
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            One email per week. No spam. No sales pressure.
          </p>
        </div>

        {/* Signup form card */}
        <div className="mx-auto mt-12 max-w-md">
          <Card className="border-primary shadow-lg">
            <CardContent className="p-8">
              <form
                action="#"
                method="POST"
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
                <Button type="submit" className="w-full gap-2" size="lg">
                  <Mail className="size-4" />
                  Subscribe
                </Button>
              </form>
              <p className="mt-4 text-center text-xs text-muted-foreground">
                Unsubscribe any time, one click, no guilt trip.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* What's in it */}
        <div className="mx-auto mt-16 max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight">
            What you get every week
          </h2>
          <ul className="mt-6 space-y-4">
            {includes.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="mt-0.5 size-5 shrink-0 text-primary" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What we don't do */}
        <div className="mx-auto mt-12 max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight">
            What we don&apos;t do
          </h2>
          <ul className="mt-6 space-y-4">
            {notIncludes.map((item) => (
              <li key={item} className="flex items-start gap-3 text-muted-foreground">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  &times;
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted-foreground">
            We write about what works. If a tool is good, we say so. If it is not, we say that too.
            Nobody pays us to recommend anything.
          </p>
        </div>

        {/* CTAs */}
        <div className="mx-auto mt-16 max-w-2xl">
          <div className="flex flex-col items-start gap-4 sm:flex-row">
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/labs">
                Try a Free Lab
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/tech-radar">
                <Radar className="size-4" />
                Browse the Tech Radar
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
