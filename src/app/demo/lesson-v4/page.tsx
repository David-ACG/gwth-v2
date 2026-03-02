"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { MarkdownRenderer } from "@/components/shared/markdown-renderer"
import {
  TableOfContents,
  QuizSection,
  AudioBar,
  StepProgress,
} from "@/components/lesson"
import { demoLessonData } from "@/lib/data/demo-lesson-data"
import { extractHeadings } from "@/lib/demo-utils"
import { Clock, BookOpen, Play, Check } from "lucide-react"

const VideoPlayer = dynamic(
  () =>
    import("@/components/shared/video-player").then((m) => m.VideoPlayer),
  { loading: () => <Skeleton className="aspect-video w-full rounded-lg" /> },
)

/**
 * Variant 4: "Linear Minimal" — maximum whitespace, minimum decoration.
 *
 * - 700px max-width (slightly narrower)
 * - Flat/seamless, no borders, no shadows
 * - Monochrome callouts (bg-muted only)
 * - Extreme spacing (3-4em between sections/paragraphs)
 * - Plain objectives list, no card
 * - Minimal TOC (just text links)
 */
export default function LessonV4Page() {
  const data = demoLessonData
  const tocHeadings = extractHeadings(data.lessonContent)
  const [showAudio, setShowAudio] = useState(true)

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex gap-10">
        {/* Main content — 700px max */}
        <article className="min-w-0 max-w-[700px] flex-1">
          {/* Page header — minimal */}
          <header className="mb-16">
            <div className="text-sm text-muted-foreground">
              Week 1 &middot; Lesson 1
            </div>
            <h1 className="mt-3 text-2xl font-medium tracking-tight">
              {data.introVideo.title}
            </h1>
            <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                45 min
              </span>
              <span>beginner</span>
              <Badge
                variant="outline"
                className="gap-1 border-border font-normal text-muted-foreground"
              >
                <BookOpen className="size-3" />
                V4 — Linear Minimal
              </Badge>
            </div>
          </header>

          {/* ── Section 1: Intro Video ─────────────────────────── */}
          <section id="intro" className="mb-16">
            <VideoPlayer
              src={data.introVideo.url}
              title={data.introVideo.title}
            />
            <p className="mt-4 text-sm text-muted-foreground">
              {data.introVideo.description}
            </p>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Play className="size-3" />
              <span>{data.introVideo.duration}s</span>
            </div>
          </section>

          {/* ── Section 2: Objectives — plain list, no card ────── */}
          <section id="objectives" className="mb-16">
            <h2 className="mb-6 text-lg font-medium tracking-tight">
              What you&apos;ll learn
            </h2>
            <ul className="space-y-3">
              {data.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-3 text-[0.9375rem] leading-relaxed">
                  <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* ── Section 3: Lesson Content ──────────────────────── */}
          <section className="mb-16">
            {showAudio && data.audioUrl && (
              <div className="mb-12">
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

            {/* Extreme spacing, extra top margins on headings */}
            <div className="lesson-prose prose-p:mb-[1.5em] prose-p:leading-[1.8] prose-h2:mt-[2.5em] prose-h2:font-medium prose-h3:mt-[2em] prose-h3:font-medium">
              <MarkdownRenderer content={data.lessonContent} />
            </div>
          </section>

          {/* ── Section 4: Q&A ─────────────────────────────────── */}
          <section id="quiz" className="mb-16">
            <QuizSection questions={data.questions} />
          </section>

          {/* ── Section 5: Project ─────────────────────────────── */}
          <section id="project" className="mb-16">
            <h2 className="mb-6 text-lg font-medium tracking-tight">
              Project
            </h2>
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-medium">{data.project.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
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

        {/* ── Table of Contents — extremely minimal ────────────── */}
        <TableOfContents headings={tocHeadings} />
      </div>
    </div>
  )
}
