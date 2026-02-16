import Link from "next/link"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  BookOpen,
  FlaskConical,
  BarChart3,
  Brain,
  Sparkles,
  Trophy,
} from "lucide-react"
import { HeroSection } from "@/components/landing/hero-section"

export const metadata: Metadata = {
  title: "GWTH.ai | Learn to Build with AI",
  description:
    "Master AI development with hands-on courses, labs, and real-world projects. From fundamentals to production-ready AI applications.",
}

const features = [
  {
    icon: BookOpen,
    title: "Structured Courses",
    description:
      "Learn AI from the ground up with expertly designed courses covering fundamentals, machine learning, and advanced topics.",
  },
  {
    icon: FlaskConical,
    title: "Hands-On Labs",
    description:
      "Build real-world projects — chatbots, RAG pipelines, image classifiers, and AI agents — with step-by-step guidance.",
  },
  {
    icon: Brain,
    title: "Interactive Quizzes",
    description:
      "Test your understanding with quizzes after every lesson. Track your scores and improve over time.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "Visualize your learning journey with detailed progress analytics, study streaks, and completion certificates.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Learning",
    description:
      "Content crafted by industry experts with real-world experience building AI systems at scale.",
  },
  {
    icon: Trophy,
    title: "Certificates",
    description:
      "Earn certificates upon course completion to showcase your skills to employers and peers.",
  },
]

/**
 * Landing page with animated hero, feature cards, and pricing preview CTA.
 */
export default function LandingPage() {
  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "GWTH.ai",
            description:
              "Master AI development with hands-on courses, labs, and real-world projects.",
            url: "https://gwth.ai",
          }),
        }}
      />

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to{" "}
              <span className="text-gradient">master AI</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A complete learning platform designed for developers who want to
              build with AI, not just read about it.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                    <feature.icon className="size-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30 py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to start your AI journey?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of developers learning to build with AI.
            Start free, upgrade when you&apos;re ready.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
