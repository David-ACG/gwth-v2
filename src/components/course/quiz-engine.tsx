"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { getGradeFromScore } from "@/lib/utils"
import { MAX_QUIZ_ATTEMPTS } from "@/lib/config"
import type { QuizQuestion } from "@/lib/types"
import { CheckCircle2, XCircle } from "lucide-react"

interface QuizEngineProps {
  /** Quiz questions */
  questions: QuizQuestion[]
  /** User's best score so far (null if never attempted) */
  bestScore: number | null
  /** Number of previous attempts */
  attempts: number
  /** Called when the quiz is submitted with the calculated score */
  onSubmit: (score: number) => void
}

/**
 * Interactive quiz component with multiple-choice questions,
 * scoring, and results display.
 */
export function QuizEngine({
  questions,
  bestScore,
  attempts,
  onSubmit,
}: QuizEngineProps) {
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState<number | null>(null)

  const { watch, setValue } = useForm<Record<string, string>>({
    defaultValues: Object.fromEntries(
      questions.map((q) => [q.id, ""])
    ),
  })

  const answers = watch()
  const allAnswered = questions.every((q) => answers[q.id] !== "")
  const canAttempt = attempts < MAX_QUIZ_ATTEMPTS

  function handleSubmit() {
    let correct = 0
    questions.forEach((q) => {
      if (parseInt(answers[q.id]) === q.correctOptionIndex) {
        correct++
      }
    })
    const calculatedScore = Math.round((correct / questions.length) * 100)
    setScore(calculatedScore)
    setSubmitted(true)
    onSubmit(calculatedScore)
  }

  if (submitted && score !== null) {
    const grade = getGradeFromScore(score)
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="text-5xl font-bold">{score}%</div>
            <Badge
              className="text-lg px-4 py-1"
              style={{ color: `var(--grade-${grade.toLowerCase()})` }}
              variant="outline"
            >
              Grade: {grade}
            </Badge>
            {bestScore !== null && (
              <p className="text-sm text-muted-foreground">
                Best score: {bestScore}%
              </p>
            )}
          </CardContent>
        </Card>

        {/* Show answers with explanations */}
        <div className="space-y-4">
          {questions.map((q) => {
            const selected = parseInt(answers[q.id])
            const isCorrect = selected === q.correctOptionIndex
            return (
              <Card key={q.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[var(--status-completed)]" />
                    ) : (
                      <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
                    )}
                    <p className="font-medium">{q.question}</p>
                  </div>
                  <p className="text-sm text-muted-foreground pl-7">
                    {q.explanation}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {bestScore !== null && (
        <p className="text-sm text-muted-foreground">
          Best score: {bestScore}% · Attempts: {attempts}/{MAX_QUIZ_ATTEMPTS}
        </p>
      )}

      {!canAttempt ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              You&apos;ve used all {MAX_QUIZ_ATTEMPTS} attempts.
              Your best score: {bestScore}%
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {questions.map((q, qIndex) => (
            <Card key={q.id}>
              <CardContent className="p-4 space-y-3">
                <p className="font-medium">
                  {qIndex + 1}. {q.question}
                </p>
                <RadioGroup
                  value={answers[q.id]}
                  onValueChange={(v) => setValue(q.id, v)}
                >
                  {q.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem
                        value={String(optIndex)}
                        id={`${q.id}-${optIndex}`}
                      />
                      <Label htmlFor={`${q.id}-${optIndex}`}>
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={!allAnswered} className="w-full">
                Submit Quiz
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
                <AlertDialogDescription>
                  You&apos;ve answered all {questions.length} questions. Once
                  submitted, you cannot change your answers for this attempt.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Review Answers</AlertDialogCancel>
                <AlertDialogAction onClick={handleSubmit}>
                  Submit
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  )
}
