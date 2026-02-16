import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges Tailwind CSS class names using clsx and tailwind-merge.
 * Handles conditional classes and resolves Tailwind conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a duration in minutes to a human-readable string.
 * @example formatDuration(90) → "1h 30m"
 * @example formatDuration(45) → "45m"
 * @example formatDuration(120) → "2h"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`
}

/**
 * Formats a date to a localized string.
 * @example formatDate(new Date()) → "Feb 15, 2026"
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

/**
 * Formats a date as a relative time string.
 * @example formatRelativeDate(yesterday) → "1 day ago"
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) return "just now"
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date)
}

/**
 * Converts a string to a URL-friendly slug.
 * @example slugify("AI Fundamentals 101") → "ai-fundamentals-101"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
}

/**
 * Returns a letter grade based on a quiz score (0-100).
 * @example getGradeFromScore(95) → "A"
 * @example getGradeFromScore(72) → "C"
 */
export function getGradeFromScore(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 90) return "A"
  if (score >= 80) return "B"
  if (score >= 70) return "C"
  if (score >= 60) return "D"
  return "F"
}

/**
 * Returns the CSS variable name for a grade's color.
 * @example getGradeColor("A") → "var(--grade-a)"
 */
export function getGradeColor(grade: "A" | "B" | "C" | "D" | "F"): string {
  return `var(--grade-${grade.toLowerCase()})`
}

/**
 * Returns the CSS variable name for a lesson/lab status color.
 * @example getStatusColor("completed") → "var(--status-completed)"
 */
export function getStatusColor(
  status: "completed" | "in-progress" | "not-started" | "locked"
): string {
  return `var(--status-${status})`
}

/**
 * Clamps a number between a min and max value.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Formats a progress value (0-1) as a percentage string.
 * @example formatProgress(0.756) → "76%"
 */
export function formatProgress(progress: number): string {
  return `${Math.round(clamp(progress, 0, 1) * 100)}%`
}
