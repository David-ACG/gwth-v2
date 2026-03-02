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
 * Variant 3: "Magazine Layout" — editorial design.
 *
 * - 900px max content width (wider than other variants)
 * - Video full-bleed within 900px container
 * - Text constrained to 720px centred inside 900px
 * - Colourful callouts, pull quotes, horizontal dividers
 * - Extra-generous spacing (3em between major sections)
 * - Gradient objectives banner
 */
export default function LessonV3Page() {
  const data = demoLessonData
  const tocHeadings = extractHeadings(data.lessonContent)
  const [showAudio, setShowAudio] = useState(true)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex gap-8">
        {/* Main content — 900px max */}
        <article className="min-w-0 max-w-[900px] flex-1">
          {/* Page header — constrained text */}
          <header className="mx-auto mb-12 max-w-[720px]">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>GWTH — Applied AI Skills</span>
              <span className="text-muted-foreground/40">/</span>
              <span>Week 1</span>
              <span className="text-muted-foreground/40">/</span>
              <span className="text-foreground">Lesson 1</span>
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight">
              {data.introVideo.title}
            </h1>
            <div className="mt-3 flex items-center gap-3">
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
                V3 — Magazine Layout
              </Badge>
            </div>
          </header>

          {/* ── Section 1: Intro Video — full bleed ────────────── */}
          <section id="intro" className="mb-12">
            {/* Video at full 900px */}
            <VideoPlayer
              src={data.introVideo.url}
              title={data.introVideo.title}
            />
            {/* Caption constrained */}
            <div className="mx-auto max-w-[720px]">
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {data.introVideo.description}
              </p>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Play className="size-3" />
                <span>{data.introVideo.duration}s</span>
              </div>
            </div>
          </section>

          <div className="mx-auto mb-12 max-w-[720px] border-t border-border/60" />

          {/* ── Section 2: Objectives — full-width gradient banner */}
          <section id="objectives" className="mb-12">
            <div className="rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 p-8">
              <h2 className="mb-5 text-xl font-bold tracking-tight">
                What You&apos;ll Learn
              </h2>
              <ObjectivesCard
                objectives={data.objectives}
                className="border-0 bg-transparent p-0"
              />
            </div>
          </section>

          <div className="mx-auto mb-12 max-w-[720px] border-t border-border/60" />

          {/* ── Section 3: Lesson Content ──────────────────────── */}
          <section className="mb-12">
            {showAudio && data.audioUrl && (
              <div className="mx-auto mb-8 max-w-[720px]">
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

            {/* Text constrained to 720px, but code blocks can go wider */}
            <div className="mx-auto max-w-[720px]">
              {/* Larger H2, extra paragraph spacing */}
              <div className="lesson-prose prose-headings:tracking-tight prose-h2:text-[1.75rem] prose-p:mb-6 prose-p:leading-[1.8]">
                <MarkdownRenderer content={data.lessonContent} />
              </div>
            </div>
          </section>

          <div className="mx-auto mb-12 max-w-[720px] border-t border-border/60" />

          {/* ── Section 4: Q&A ─────────────────────────────────── */}
          <section id="quiz" className="mx-auto mb-12 max-w-[720px]">
            <QuizSection questions={data.questions} />
          </section>

          <div className="mx-auto mb-12 max-w-[720px] border-t border-border/60" />

          {/* ── Section 5: Project ─────────────────────────────── */}
          <section id="project" className="mx-auto mb-12 max-w-[720px]">
            <h2 className="mb-5 text-xl font-bold tracking-tight">Project</h2>
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold">{data.project.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
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

        {/* ── Table of Contents ────────────────────────────────── */}
        <TableOfContents headings={tocHeadings} />
      </div>
    </div>
  )
}
