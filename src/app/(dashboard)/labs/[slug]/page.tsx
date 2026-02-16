import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getLab } from "@/lib/data/labs"
import { getLabProgress } from "@/lib/data/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { MarkdownRenderer } from "@/components/shared/markdown-renderer"
import { Clock, CheckCircle2 } from "lucide-react"
import { formatDuration } from "@/lib/utils"

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const lab = await getLab(slug)
  if (!lab) return { title: "Lab Not Found" }

  return {
    title: lab.title,
    description: lab.description,
  }
}

/**
 * Lab viewer page with instructions, resources, and step tracker.
 */
export default async function LabDetailPage({ params }: PageProps) {
  const { slug } = await params
  const [lab, progress] = await Promise.all([
    getLab(slug),
    getLabProgress(slug),
  ])

  if (!lab) notFound()

  return (
    <div className="space-y-6">
      {/* Lab header */}
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{lab.difficulty}</Badge>
          {lab.isPremium && <Badge>Pro</Badge>}
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{lab.title}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{lab.description}</p>
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" />
            {formatDuration(lab.duration)}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {lab.technologies.map((tech) => (
            <Badge key={tech} variant="outline" className="font-normal">
              {tech}
            </Badge>
          ))}
        </div>
      </div>

      {/* Progress */}
      {progress && (
        <div className="max-w-sm space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              Step {progress.currentStep}/{lab.instructions.length}
            </span>
          </div>
          <Progress value={progress.progress * 100} className="h-2" />
        </div>
      )}

      {/* Learning outcomes */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold">What You&apos;ll Learn</h2>
          <ul className="mt-3 space-y-2">
            {lab.learningOutcomes.map((outcome) => (
              <li key={outcome} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                {outcome}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Instructions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Instructions</h2>
        {lab.instructions.map((step) => (
          <Card key={step.step}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {step.step}
                </div>
                <h3 className="text-base font-semibold">{step.title}</h3>
              </div>
              <div className="mt-3 pl-11">
                <MarkdownRenderer content={step.content} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
