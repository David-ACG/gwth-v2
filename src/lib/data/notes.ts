/**
 * Data access functions for user notes.
 * Currently backed by mock data. Will be replaced with real API/DB calls later.
 */

import type { Note } from "@/lib/types"
import { mockNotes } from "./mock-data"

/**
 * Fetches all notes for a specific lesson.
 * Returns them sorted by creation date (newest first).
 */
export async function getNotes(lessonId: string): Promise<Note[]> {
  return mockNotes
    .filter((n) => n.lessonId === lessonId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

/**
 * Creates or updates a note.
 * If an id is provided, updates the existing note. Otherwise, creates a new one.
 */
export async function saveNote(params: {
  id?: string
  lessonId: string
  content: string
  timestamp?: number | null
}): Promise<Note> {
  if (params.id) {
    const existing = mockNotes.find((n) => n.id === params.id)
    if (existing) {
      existing.content = params.content
      existing.timestamp = params.timestamp ?? existing.timestamp
      existing.updatedAt = new Date()
      return existing
    }
  }

  const newNote: Note = {
    id: `note_${Date.now()}`,
    userId: "user_mock_001",
    lessonId: params.lessonId,
    content: params.content,
    timestamp: params.timestamp ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  mockNotes.push(newNote)
  return newNote
}

/**
 * Deletes a note by ID.
 * Returns true if the note was found and deleted, false otherwise.
 */
export async function deleteNote(noteId: string): Promise<boolean> {
  const index = mockNotes.findIndex((n) => n.id === noteId)
  if (index >= 0) {
    mockNotes.splice(index, 1)
    return true
  }
  return false
}
