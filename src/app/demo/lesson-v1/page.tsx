"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { MarkdownRenderer } from "@/components/shared/markdown-renderer"
import {
  ObjectivesCard,
  TableOfContents,
  QuizSection,
  AudioBar,
  StepProgress,
} from "@/components/lesson"
import { demoLessonData } from "@/lib/data/demo-lesson-data"
import { extractHeadings } from "@/lib/demo-utils"
import { Clock, BookOpen, Play } from "lucide-react"

const VideoPlayer = dynamic(
  () =>
    import("@/components/shared/video-player").then((m) => m.VideoPlayer),
  { loading: () => <Skeleton className="aspect-video w-full rounded-lg" /> },
)

/**
 * Variant 1: "Documentation Clean" — react.dev inspired.
 *
 * - 720px max-width, centred, flat/seamless background
 * - Left-border callouts (default CalloutBox style)
 * - Generous spacing, clean typography
 * - Minimal decoration, muted colours
 */
export default function LessonV1Page() {
  const data = demoLessonData
  const tocHeadings = extractHeadings(data.lessonContent)
  const [showAudio, setShowAudio] = useState(true)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex gap-8">
        {/* Main content — 720px max */}
        <article className="min-w-0 max-w-[720px] flex-1">
          {/* Page header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>GWTH — Applied AI Skills</span>
              <span className="text-muted-foreground/40">/</span>
              <span>Week 1</span>
              <span className="text-muted-foreground/40">/</span>
              <span className="text-foreground">Lesson 1</span>
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">
              {data.introVideo.title}
            </h1>
            <div className="mt-2 flex items-center gap-3">
              <Badge variant="secondary" className="font-normal">
                beginner
              </Badge>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="size-3.5" />
                45 min
              </span>
              <Badge
                variant="outline"
                className="gap-1 border-primary/30 font-normal text-primary"
              >
                <BookOpen className="size-3" />
                V1 — Documentation Clean
              </Badge>
            </div>
          </header>

          {/* ── Section 1: Intro Video ─────────────────────────────── */}
          <section id="intro" className="mb-10">
            <VideoPlayer
              src={data.introVideo.url}
              title={data.introVideo.title}
            />
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {data.introVideo.description}
            </p>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Play className="size-3" />
              <span>{data.introVideo.duration}s</span>
            </div>
          </section>

          <hr className="mb-10 border-border/60" />

          {/* ── Section 2: Objectives ──────────────────────────────── */}
          <section id="objectives" className="mb-10">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">
              What You&apos;ll Learn
            </h2>
            <ObjectivesCard
              objectives={data.objectives}
              className="border-primary/15 bg-primary/[0.03]"
            />
          </section>

          <hr className="mb-10 border-border/60" />

          {/* ── Section 3: Lesson Content ──────────────────────────── */}
          <section className="mb-10">
            {showAudio && data.audioUrl && (
              <div className="mb-8">
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

            {/* Lesson prose — generous line height, relaxed paragraphs */}
            <div className="lesson-prose prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-[1.75] prose-p:mb-5">
              <MarkdownRenderer content={data.lessonContent} />
            </div>
          </section>

          <hr className="mb-10 border-border/60" />

          {/* ── Section 4: Q&A ─────────────────────────────────────── */}
          <section id="quiz" className="mb-10">
            <QuizSection questions={data.questions} />
          </section>

          <hr className="mb-10 border-border/60" />

          {/* ── Section 5: Project ─────────────────────────────────── */}
          <section id="project" className="mb-10">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">
              Project
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold">{data.project.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
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
          </section>
        </article>

        {/* ── Table of Contents (right side) ───────────────────── */}
        <TableOfContents headings={tocHeadings} />
      </div>
    </div>
  )
}
