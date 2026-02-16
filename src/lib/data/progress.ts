/**
 * Data access functions for user progress tracking.
 * Currently backed by mock data. Will be replaced with real API/DB calls later.
 */

import type {
  LessonProgress,
  LabProgress,
  CourseProgress,
  StudyStreak,
} from "@/lib/types"
import {
  mockLessonProgress,
  mockLabProgress,
  mockCourseProgress,
  mockStudyStreak,
} from "./mock-data"

/**
 * Fetches the user's progress on a specific lesson.
 * Returns null if no progress exists (lesson never started).
 */
export async function getLessonProgress(
  lessonId: string
): Promise<LessonProgress | null> {
  return mockLessonProgress.find((p) => p.lessonId === lessonId) ?? null
}

/**
 * Fetches progress for all lessons the user has interacted with.
 */
export async function getAllLessonProgress(): Promise<LessonProgress[]> {
  return [...mockLessonProgress]
}

/**
 * Updates the user's progress on a lesson.
 * In production, this would be a server action or API call.
 */
export async function updateLessonProgress(
  lessonId: string,
  update: Partial<LessonProgress>
): Promise<LessonProgress> {
  const existing = mockLessonProgress.find((p) => p.lessonId === lessonId)
  if (existing) {
    Object.assign(existing, update)
    return existing
  }
  const newProgress: LessonProgress = {
    lessonId,
    isCompleted: false,
    progress: 0,
    quizScore: null,
    bestQuizScore: null,
    quizAttempts: 0,
    timeSpent: 0,
    lastAccessedAt: new Date(),
    ...update,
  }
  mockLessonProgress.push(newProgress)
  return newProgress
}

/**
 * Fetches the user's progress on a specific lab.
 */
export async function getLabProgress(
  labId: string
): Promise<LabProgress | null> {
  return mockLabProgress.find((p) => p.labId === labId) ?? null
}

/**
 * Fetches progress for all labs the user has interacted with.
 */
export async function getAllLabProgress(): Promise<LabProgress[]> {
  return [...mockLabProgress]
}

/**
 * Fetches the user's progress on a specific course.
 */
export async function getCourseProgress(
  courseId: string
): Promise<CourseProgress | null> {
  return mockCourseProgress.find((p) => p.courseId === courseId) ?? null
}

/**
 * Fetches progress for all courses the user has interacted with.
 */
export async function getAllCourseProgress(): Promise<CourseProgress[]> {
  return [...mockCourseProgress]
}

/**
 * Fetches the user's study streak data.
 */
export async function getStreak(): Promise<StudyStreak> {
  return { ...mockStudyStreak }
}
