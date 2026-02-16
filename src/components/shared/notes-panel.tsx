"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { noteSchema, type NoteFormData } from "@/lib/validations"
import { saveNote, deleteNote } from "@/lib/data/notes"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { X, Trash2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Note } from "@/lib/types"

interface NotesPanelProps {
  /** Lesson the notes belong to */
  lessonId: string
  /** Initial notes from server */
  initialNotes: Note[]
  /** Called when the panel is closed */
  onClose: () => void
}

/**
 * Slide-out panel for lesson annotations.
 * Supports creating, viewing, and deleting notes.
 */
export function NotesPanel({
  lessonId,
  initialNotes,
  onClose,
}: NotesPanelProps) {
  const [notes, setNotes] = useState(initialNotes)

  const form = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: { content: "" },
  })

  async function onSubmit(data: NoteFormData) {
    const note = await saveNote({
      lessonId,
      content: data.content,
    })
    setNotes((prev) => [note, ...prev])
    form.reset()
    toast.success("Note saved")
  }

  async function handleDelete(noteId: string) {
    await deleteNote(noteId)
    setNotes((prev) => prev.filter((n) => n.id !== noteId))
    toast.info("Note deleted")
  }

  return (
    <div className="fixed right-0 top-16 z-30 flex h-[calc(100vh-4rem)] w-80 flex-col border-l bg-background shadow-lg">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold">Notes</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="size-7"
          aria-label="Close notes"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* New note form */}
      <div className="border-b p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Write a note..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              size="sm"
              disabled={form.formState.isSubmitting}
            >
              Save Note
            </Button>
          </form>
        </Form>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notes.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No notes yet. Write one above.
          </p>
        ) : (
          notes.map((note) => (
            <Card key={note.id}>
              <CardContent className="p-3 space-y-2">
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatDate(note.createdAt)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(note.id)}
                    className="size-6"
                    aria-label="Delete note"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
