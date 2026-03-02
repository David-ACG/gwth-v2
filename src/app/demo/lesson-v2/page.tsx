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
 * Variant 2: "Card Sections" — Notion inspired.
 *
 * - 720px max-width, centred
 * - Each major section wrapped in a card (bg-card, border, shadow-sm)
 * - Page background visible between cards
 * - Block-based visual separation
 * - Slightly tighter spacing within cards
 */
export default function LessonV2Page() {
  const data = demoLessonData
  const tocHeadings = extractHeadings(data.lessonContent)
  const [showAudio, setShowAudio] = useState(true)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex gap-8">
        {/* Main content — 720px max */}
        <div className="min-w-0 max-w-[720px] flex-1 space-y-5">
          {/* Page header (not in a card) */}
          <header className="mb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>GWTH — Applied AI Skills</span>
              <span className="text-muted-foreground/40">/</span>
              <span>Week 1</span>
              <span className="text-muted-foreground/40">/</span>
              <span className="text-foreground">Lesson 1</span>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight">
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
                V2 — Card Sections
              </Badge>
            </div>
          </header>

          {/* ── Section 1: Intro Video ── Card ─────────────────── */}
          <section
            id="intro"
            className="rounded-lg border border-border bg-card p-6 shadow-sm"
          >
            <h2 className="mb-4 text-lg font-semibold">Intro Video</h2>
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
          </section>

          {/* ── Section 2: Objectives ── Card ──────────────────── */}
          <section
            id="objectives"
            className="rounded-lg border border-border bg-muted/50 p-6 shadow-sm"
          >
            <h2 className="mb-4 text-lg font-semibold">Objectives</h2>
            <ObjectivesCard
              objectives={data.objectives}
              className="border-0 bg-transparent p-0"
            />
          </section>

          {/* ── Section 3: Lesson Content ── Card ──────────────── */}
          <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Lesson Content</h2>

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

            {/* Tighter spacing within card */}
            <div className="lesson-prose prose-p:leading-relaxed prose-p:mb-4">
              <MarkdownRenderer content={data.lessonContent} />
            </div>
          </section>

          {/* ── Section 4: Q&A ── Card ─────────────────────────── */}
          <section
            id="quiz"
            className="rounded-lg border border-border bg-card p-6 shadow-sm"
          >
            <QuizSection questions={data.questions} />
          </section>

          {/* ── Section 5: Project ── Card ──────────────────────── */}
          <section
            id="project"
            className="rounded-lg border border-border bg-card p-6 shadow-sm"
          >
            <h2 className="mb-4 text-lg font-semibold">Project</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold">{data.project.title}</h3>
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
          </section>
        </div>

        {/* ── Table of Contents ────────────────────────────────── */}
        <TableOfContents headings={tocHeadings} />
      </div>
    </div>
  )
}
