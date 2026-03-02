"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { MarkdownRenderer } from "@/components/shared/markdown-renderer"
import {
  ObjectivesCard,
  TableOfContents,
  QuizSection,
  AudioBar,
  StepProgress,
  LessonSection,
} from "@/components/lesson"
import type { TocHeading } from "@/components/lesson"
import { demoLessonData } from "@/lib/data/demo-lesson-data"
import { Clock, BookOpen, Play } from "lucide-react"

const VideoPlayer = dynamic(
  () =>
    import("@/components/shared/video-player").then((m) => m.VideoPlayer),
  { loading: () => <Skeleton className="aspect-video w-full rounded-lg" /> },
)

/**
 * Generates TOC headings from the lesson content markdown.
 * Extracts H2 and H3 headings and creates ids matching the
 * MarkdownRenderer heading id generation.
 */
function extractHeadings(markdown: string): TocHeading[] {
  const headings: TocHeading[] = []
  const lines = markdown.split("\n")

  for (const line of lines) {
    const h2Match = line.match(/^## (.+)$/)
    const h3Match = line.match(/^### (.+)$/)

    if (h2Match) {
      const text = h2Match[1]!
      headings.push({
        id: text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, ""),
        text,
        level: 2,
      })
    } else if (h3Match) {
      const text = h3Match[1]!
      headings.push({
        id: text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, ""),
        text,
        level: 3,
      })
    }
  }

  // Add fixed section headings
  return [
    { id: "intro", text: "Intro Video", level: 2 },
    { id: "objectives", text: "Objectives", level: 2 },
    ...headings,
    { id: "quiz", text: "Check Your Understanding", level: 2 },
    { id: "project", text: "Project", level: 2 },
  ]
}

/**
 * Full demo lesson viewer showcasing all new lesson UI components
 * in the 5-section vertical layout (no tabs).
 */
export function DemoLessonViewer() {
  const data = demoLessonData
  const tocHeadings = extractHeadings(data.lessonContent)
  const [showAudio, setShowAudio] = useState(true)

  return (
    <div className="flex gap-8">
      {/* Main content column */}
      <div className="min-w-0 flex-1">
        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>GWTH — Applied AI Skills</span>
            <span>/</span>
            <span>Week 1</span>
            <span>/</span>
            <span className="text-foreground">Lesson 1</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">
            {data.introVideo.title}
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <Badge variant="secondary">beginner</Badge>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="size-3.5" />
              45 min
            </span>
            <Badge
              variant="outline"
              className="gap-1 border-primary/30 text-primary"
            >
              <BookOpen className="size-3" />
              Demo Preview
            </Badge>
          </div>
        </div>

        {/* ── Section 1: Intro Video ──────────────────────────────── */}
        <LessonSection id="intro" number={1} title="Intro Video">
          <VideoPlayer
            src={data.introVideo.url}
            title={data.introVideo.title}
          />
          <p className="mt-3 text-sm text-muted-foreground">
            {data.introVideo.description}
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Play className="size-3" />
            <span>{data.introVideo.duration}s</span>
          </div>
        </LessonSection>

        <hr className="border-border" />

        {/* ── Section 2: Objectives ──────────────────────────────── */}
        <LessonSection id="objectives" number={2} title="Objectives">
          <ObjectivesCard objectives={data.objectives} />
        </LessonSection>

        <hr className="border-border" />

        {/* ── Section 3: Lesson Content ───────────────────────────── */}
        <LessonSection number={3} title="Lesson Content">
          {/* Audio bar */}
          {showAudio && data.audioUrl && (
            <div className="mb-6">
              <AudioBar
                src={data.audioUrl}
                duration={data.audioDuration ?? undefined}
              />
              <button
                type="button"
                onClick={() => setShowAudio(false)}
                className="mt-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Hide audio player
              </button>
            </div>
          )}

          {/* Markdown content with callouts, key terms, code blocks */}
          <MarkdownRenderer content={data.lessonContent} />
        </LessonSection>

        <hr className="border-border" />

        {/* ── Section 4: Q&A ──────────────────────────────────────── */}
        <LessonSection id="quiz" number={4} title="Q&A">
          <QuizSection questions={data.questions} />
        </LessonSection>

        <hr className="border-border" />

        {/* ── Section 5: Project ──────────────────────────────────── */}
        <LessonSection id="project" number={5} title="Project">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{data.project.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {data.project.description}
              </p>
            </div>

            {data.project.videoUrl && (
              <VideoPlayer
                src={data.project.videoUrl}
                title={`${data.project.title} — walkthrough`}
              />
            )}

            <StepProgress milestones={data.project.milestones} />
          </div>
        </LessonSection>
      </div>

      {/* ── Table of Contents (right side, desktop only) ───────── */}
      <TableOfContents headings={tocHeadings} />
    </div>
  )
}
