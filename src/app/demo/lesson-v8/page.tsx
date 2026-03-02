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
  { id: "intro", label: "Intro", color: "bg-primary" },
  { id: "objectives", label: "Objectives", color: "bg-accent" },
  { id: "content", label: "Content", color: "bg-info" },
  { id: "quiz", label: "Q&A", color: "bg-warning" },
  { id: "project", label: "Project", color: "bg-success" },
]

/**
 * Variant 8: "Colour-Banded" — V5 base with coloured section top borders.
 *
 * Changes from V5:
 * - Each section gets a coloured top accent bar (3px) — different colour per section
 * - Card has no outer border — relies on shadow for definition
 * - Shadow is stronger in light mode (shadow-lg) for clear card separation
 * - Breadcrumb pills colour-coded to match their section
 * - Section number badges match the section colour
 * - Creates strong visual hierarchy without needing card/bg contrast
 */
export default function LessonV8Page() {
  const data = demoLessonData
  const tocHeadings = extractHeadings(data.lessonContent)
  const [showAudio, setShowAudio] = useState(true)

  return (
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
                V8 — Colour-Banded
              </Badge>
            </div>
          </header>

          {/* Progress breadcrumb — colour-coded dots */}
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
                  className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  <span className={`size-2 rounded-full ${s.color}`} />
                  {s.label}
                </button>
              </div>
            ))}
          </div>

          {/* Main card — no border, shadow-driven definition */}
          <div className="overflow-hidden rounded-xl bg-card shadow-lg dark:border dark:border-border dark:shadow-none">
            {/* ── Section 1: Intro Video ───────────────────────── */}
            <section id="intro" className="border-t-[3px] border-t-primary p-8 pb-0">
              <SectionHeading number={1} title="Intro Video" color="bg-primary" />
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
              <div className="mt-8 border-b border-border" />
            </section>

            {/* ── Section 2: Objectives ────────────────────────── */}
            <section id="objectives" className="border-t-[3px] border-t-accent p-8 pb-0">
              <SectionHeading number={2} title="Objectives" color="bg-accent" />
              <ObjectivesCard
                objectives={data.objectives}
                className="border-l-4 border-l-accent"
              />
              <div className="mt-8 border-b border-border" />
            </section>

            {/* ── Section 3: Lesson Content ────────────────────── */}
            <section id="content" className="border-t-[3px] border-t-info p-8 pb-0">
              <SectionHeading number={3} title="Lesson Content" color="bg-info" />

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
              <div className="mt-8 border-b border-border" />
            </section>

            {/* ── Section 4: Q&A ───────────────────────────────── */}
            <section id="quiz" className="border-t-[3px] border-t-warning p-8 pb-0">
              <SectionHeading number={4} title="Q&A" color="bg-warning" />
              <QuizSection questions={data.questions} />
              <div className="mt-8 border-b border-border" />
            </section>

            {/* ── Section 5: Project ───────────────────────────── */}
            <section id="project" className="border-t-[3px] border-t-success p-8">
              <SectionHeading number={5} title="Project" color="bg-success" />
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
  )
}

/** Colour-matched section heading */
function SectionHeading({
  number,
  title,
  color,
}: {
  number: number
  title: string
  color: string
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span
        className={`flex size-8 items-center justify-center rounded-lg text-sm font-bold text-white ${color}`}
      >
        {String(number).padStart(2, "0")}
      </span>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
    </div>
  )
}
