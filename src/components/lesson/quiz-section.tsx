"use client"

import { useState } from "react"
import { HelpCircle, CheckCircle2, XCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { QuizQuestion } from "@/lib/types"

interface QuizSectionProps {
  /** Quiz questions to display */
  questions: QuizQuestion[]
  /** Additional CSS classes */
  className?: string
}

/**
 * Inline quiz section (not tabbed). Displays questions with radio options
 * and provides immediate feedback on selection. Shows a score summary
 * after all questions are answered with an option to retake.
 */
export function QuizSection({ questions, className }: QuizSectionProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [revealed, setRevealed] = useState<Set<string>>(new Set())

  const answeredCount = Object.keys(answers).length
  const totalCount = questions.length
  const allAnswered = answeredCount === totalCount

  const correctCount = questions.filter(
    (q) => answers[q.id] === q.correctOptionIndex,
  ).length

  function handleSelect(questionId: string, optionIndex: number) {
    if (revealed.has(questionId)) return // Already answered
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }))
    setRevealed((prev) => new Set(prev).add(questionId))
  }

  function handleReset() {
    setAnswers({})
    setRevealed(new Set())
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <HelpCircle className="size-5 text-primary" />
        <h3 className="text-lg font-semibold">Check Your Understanding</h3>
      </div>

      {/* Questions */}
      <div className="space-y-5">
        {questions.map((question, qIndex) => {
          const isRevealed = revealed.has(question.id)
          const selectedIndex = answers[question.id]
          const isCorrect = selectedIndex === question.correctOptionIndex

          return (
            <div
              key={question.id}
              className="rounded-lg border border-border bg-card p-5"
            >
              <p className="mb-3 text-sm font-medium">
                <span className="mr-1.5 text-muted-foreground">
                  {qIndex + 1}.
                </span>
                {question.question}
              </p>

              <div className="space-y-2">
                {question.options.map((option, oIndex) => {
                  const isSelected = selectedIndex === oIndex
                  const isCorrectOption =
                    oIndex === question.correctOptionIndex

                  let optionClass = "border-border hover:border-primary/50 hover:bg-primary/5"
                  if (isRevealed) {
                    if (isCorrectOption) {
                      optionClass =
                        "border-success bg-success/5"
                    } else if (isSelected && !isCorrectOption) {
                      optionClass =
                        "border-destructive bg-destructive/5"
                    } else {
                      optionClass = "border-border opacity-60"
                    }
                  } else if (isSelected) {
                    optionClass = "border-primary bg-primary/5"
                  }

                  return (
                    <button
                      key={oIndex}
                      type="button"
                      onClick={() => handleSelect(question.id, oIndex)}
                      disabled={isRevealed}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md border px-4 py-2.5 text-left text-sm transition-colors",
                        optionClass,
                        isRevealed && "cursor-default",
                      )}
                    >
                      {/* Radio circle */}
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                          isRevealed && isCorrectOption
                            ? "border-success bg-success text-success-foreground"
                            : isRevealed && isSelected && !isCorrectOption
                              ? "border-destructive bg-destructive text-white"
                              : isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground/30",
                        )}
                      >
                        {isRevealed && isCorrectOption && (
                          <CheckCircle2 className="size-3" />
                        )}
                        {isRevealed && isSelected && !isCorrectOption && (
                          <XCircle className="size-3" />
                        )}
                      </span>
                      <span>{option}</span>
                    </button>
                  )
                })}
              </div>

              {/* Explanation */}
              {isRevealed && (
                <div
                  className={cn(
                    "mt-3 rounded-md px-4 py-3 text-sm",
                    isCorrect
                      ? "bg-success/5 text-success"
                      : "bg-destructive/5 text-destructive",
                  )}
                >
                  <p className="font-medium">
                    {isCorrect ? "Correct!" : "Not quite."}
                  </p>
                  <p className="mt-1 text-foreground/80">
                    {question.explanation}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Score summary */}
      {allAnswered && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <div>
            <p className="text-sm font-medium">
              Score: {correctCount}/{totalCount}
            </p>
            <p className="text-xs text-muted-foreground">
              {correctCount === totalCount
                ? "Perfect score!"
                : correctCount >= totalCount / 2
                  ? "Good job! Review the explanations above."
                  : "Keep studying — you'll get there!"}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="mr-1.5 size-3.5" />
            Retake
          </Button>
        </div>
      )}
    </div>
  )
}
