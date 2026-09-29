/**
 * Server reads behind /admin/lessons (bead gwth-launch-hqyp). The numbers
 * themselves come from the pure buildLessonReport().
 */
import "server-only"

import { buildLessonReport, type LessonReport, type ReportFilter } from "@/lib/lessons/lesson-report"
import { getLessonEventsForReport, getLessonPartsContent, listLessonsWithParts } from "./lesson-parts"

export interface LessonReportSummary {
  lessonId: string
  title: string
  parts: number
  report: LessonReport
}

export async function getLessonReportSummaries(): Promise<LessonReportSummary[]> {
  const lessons = await listLessonsWithParts()
  return Promise.all(
    lessons.map(async (l) => {
      const [content, events] = await Promise.all([getLessonPartsContent(l.lessonId), getLessonEventsForReport(l.lessonId)])
      return { ...l, report: buildLessonReport(events, content?.parts ?? [], "all") }
    })
  )
}

export async function getLessonReport(
  lessonId: string,
  filter: ReportFilter
): Promise<{ title: string; report: LessonReport } | null> {
  const content = await getLessonPartsContent(lessonId)
  if (!content) return null
  const events = await getLessonEventsForReport(lessonId)
  return { title: content.title, report: buildLessonReport(events, content.parts, filter) }
}
