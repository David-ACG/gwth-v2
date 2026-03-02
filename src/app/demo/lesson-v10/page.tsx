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

const SECTIONS = [
  { id: "intro", label: "Intro" },
  { id: "objectives", label: "Objectives" },
  { id: "content", label: "Content" },
  { id: "quiz", label: "Q&A" },
  { id: "project", label: "Project" },
]

/**
 * Variant 10: "Inset" — card inset into a distinctly darker surround.
 *
 * Changes from V5:
 * - Page area uses bg-secondary (slightly darker than bg-background) in light mode
 * - Card stays bg-card (white) — creates clear figure/ground separation
 * - Card gets a subtle inner shadow for "inset" feel
 * - Section heading uses a left accent bar instead of a numbered badge
 * - Dividers removed — the accent bars provide enough section separation
 * - Stronger outer border in light mode
 * - Dark mode: bg-background surround with bg-card card (existing good contrast)
 */
export default function LessonV10Page() {
  const data = demoLessonData
  const tocHeadings = extractHeadings(data.lessonContent)
  const [showAudio, setShowAudio] = useState(true)

  return (
    <div className="min-h-screen bg-secondary dark:bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex gap-8">
          <div className="min-w-0 max-w-[720px] flex-1">
            {/* Page header */}
            <header className="mb-6">
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
                <Badge variant="secondary" className="bg-card">
                  beginner
                </Badge>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="size-3.5" />
                  45 min
                </span>
                <Badge
                  variant="outline"
                  className="gap-1 border-primary/30 bg-card text-primary"
                >
                  <BookOpen className="size-3" />
                  V10 — Inset
                </Badge>
              </div>
            </header>

            {/* Progress breadcrumb */}
            <div className="mb-6 flex items-center gap-1 overflow-x-auto">
              {SECTIONS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-1">
                  {i > 0 && (
                    <span className="text-xs text-muted-foreground/40">&rarr;</span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      document
                        .getElementById(s.id)
                        ?.scrollIntoView({ behavior: "smooth" })
                    }}
                    className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:text-foreground"
                  >
                    <span className="flex size-4 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {i + 1}
                    </span>
                    {s.label}
                  </button>
                </div>
              ))}
            </div>

            {/* Main card — inset on secondary background */}
            <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
              {/* ── Section 1: Intro Video ─────────────────────── */}
              <section id="intro" className="mb-8">
                <SectionHeading number={1} title="Intro Video" />
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

              <hr className="mb-8 border-border/60" />

              {/* ── Section 2: Objectives ──────────────────────── */}
              <section id="objectives" className="mb-8">
                <SectionHeading number={2} title="Objectives" />
                <ObjectivesCard
                  objectives={data.objectives}
                  className="border-l-4 border-l-primary"
                />
              </section>

              <hr className="mb-8 border-border/60" />

              {/* ── Section 3: Lesson Content ──────────────────── */}
              <section id="content" className="mb-8">
                <SectionHeading number={3} title="Lesson Content" />

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

                <div className="lesson-prose prose-p:leading-[1.75] prose-p:mb-5">
                  <MarkdownRenderer content={data.lessonContent} />
                </div>
              </section>

              <hr className="mb-8 border-border/60" />

              {/* ── Section 4: Q&A ─────────────────────────────── */}
              <section id="quiz" className="mb-8">
                <SectionHeading number={4} title="Q&A" />
                <QuizSection questions={data.questions} />
              </section>

              <hr className="mb-8 border-border/60" />

              {/* ── Section 5: Project ─────────────────────────── */}
              <section id="project">
                <SectionHeading number={5} title="Project" />
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-semibold">
                      {data.project.title}
                    </h3>
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
          </div>

          <TableOfContents headings={tocHeadings} />
        </div>
      </div>
    </div>
  )
}

/** Left accent bar section heading with number */
function SectionHeading({ number, title }: { number: number; title: string }) {
  return (
    <div className="mb-5 flex items-center gap-3 border-l-[3px] border-l-primary pl-3">
      <span className="text-sm font-bold text-primary">
        {String(number).padStart(2, "0")}
      </span>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
    </div>
  )
}
