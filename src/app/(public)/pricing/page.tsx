import type { Metadata } from "next"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WaitlistForm } from "@/components/landing/waitlist-form"

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Choose the right plan for your AI learning journey. Free, Pro, and Team plans available.",
}

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with AI fundamentals at no cost.",
    features: [
      "Access to introductory lessons",
      "2 free labs",
      "Basic progress tracking",
      "Community access",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "Full access to all courses, labs, and features.",
    features: [
      "All courses and lessons",
      "All hands-on labs",
      "Interactive quizzes with scoring",
      "Progress analytics & streaks",
      "Completion certificates",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Team",
    price: "$39",
    period: "/seat/month",
    description: "Train your team with shared progress and reporting.",
    features: [
      "Everything in Pro",
      "Team progress dashboard",
      "Admin controls",
      "Custom learning paths",
      "Bulk licensing discounts",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

/**
 * Pricing page with plan comparison and waitlist signup.
 */
export default function PricingPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free, upgrade when you&apos;re ready. No hidden fees.
          </p>
        </div>

        {/* Plan cards */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.popular
                  ? "relative border-primary shadow-lg"
                  : ""
              }
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Waitlist section */}
        <div className="mx-auto mt-20 max-w-lg text-center">
          <h2 className="text-2xl font-bold">Join the Waitlist</h2>
          <p className="mt-2 text-muted-foreground">
            Be the first to know when new courses and features launch.
          </p>
          <div className="mt-6">
            <WaitlistForm />
          </div>
        </div>
      </div>
    </div>
  )
}
