import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About",
  description: "Learn about GWTH.ai and our mission to make AI education accessible.",
}

/**
 * About page describing GWTH.ai's mission and approach.
 */
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight">About GWTH.ai</h1>
      <div className="mt-8 space-y-6 text-lg leading-relaxed text-muted-foreground">
        <p>
          GWTH.ai is a hands-on learning platform for developers who want to
          build with artificial intelligence. We believe the best way to learn
          AI is by doing — not just reading papers or watching lectures.
        </p>
        <p>
          Our courses are designed by industry practitioners who have built
          production AI systems. Every lesson includes theory, code examples,
          and hands-on exercises. Our labs let you build complete projects
          from scratch.
        </p>
        <p>
          Whether you&apos;re a beginner exploring what AI can do or an
          experienced developer looking to add AI to your toolkit, GWTH.ai
          has a learning path for you.
        </p>
        <h2 className="pt-4 text-2xl font-semibold text-foreground">
          Our Approach
        </h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Learn by building.</strong> Every concept is paired with
            practical exercises and real-world projects.
          </li>
          <li>
            <strong>Track your progress.</strong> Study streaks, quizzes, and
            progress analytics keep you motivated.
          </li>
          <li>
            <strong>Earn certificates.</strong> Complete courses to earn
            shareable certificates that validate your skills.
          </li>
          <li>
            <strong>Stay current.</strong> Our content is regularly updated
            to reflect the latest in AI development.
          </li>
        </ul>
      </div>
    </div>
  )
}
