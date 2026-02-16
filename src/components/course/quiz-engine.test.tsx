import { render, screen, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, afterEach } from "vitest"
import { QuizEngine } from "./quiz-engine"
import type { QuizQuestion } from "@/lib/types"

afterEach(cleanup)

const mockQuestions: QuizQuestion[] = [
  {
    id: "q1",
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctOptionIndex: 1,
    explanation: "2 + 2 equals 4.",
  },
  {
    id: "q2",
    question: "What color is the sky?",
    options: ["Green", "Blue", "Red"],
    correctOptionIndex: 1,
    explanation: "The sky appears blue due to Rayleigh scattering.",
  },
]

describe("QuizEngine", () => {
  it("renders all questions", () => {
    render(
      <QuizEngine
        questions={mockQuestions}
        bestScore={null}
        attempts={0}
        onSubmit={vi.fn()}
      />
    )
    expect(screen.getByText(/What is 2 \+ 2\?/)).toBeInTheDocument()
    expect(screen.getByText(/What color is the sky\?/)).toBeInTheDocument()
  })

  it("renders all answer options", () => {
    render(
      <QuizEngine
        questions={mockQuestions}
        bestScore={null}
        attempts={0}
        onSubmit={vi.fn()}
      />
    )
    // Options from question 1
    expect(screen.getByText("3")).toBeInTheDocument()
    expect(screen.getByText("4")).toBeInTheDocument()
    expect(screen.getByText("5")).toBeInTheDocument()
    expect(screen.getByText("6")).toBeInTheDocument()
    // Options from question 2
    expect(screen.getByText("Green")).toBeInTheDocument()
    expect(screen.getByText("Blue")).toBeInTheDocument()
    expect(screen.getByText("Red")).toBeInTheDocument()
  })

  it("shows submit button disabled when not all questions answered", () => {
    render(
      <QuizEngine
        questions={mockQuestions}
        bestScore={null}
        attempts={0}
        onSubmit={vi.fn()}
      />
    )
    const submitButton = screen.getByRole("button", { name: "Submit Quiz" })
    expect(submitButton).toBeDisabled()
  })

  it("shows best score and attempts when provided", () => {
    render(
      <QuizEngine
        questions={mockQuestions}
        bestScore={85}
        attempts={1}
        onSubmit={vi.fn()}
      />
    )
    expect(screen.getByText(/Best score: 85%/)).toBeInTheDocument()
    expect(screen.getByText(/Attempts: 1\/3/)).toBeInTheDocument()
  })

  it("shows max attempts message when all attempts used", () => {
    render(
      <QuizEngine
        questions={mockQuestions}
        bestScore={70}
        attempts={3}
        onSubmit={vi.fn()}
      />
    )
    expect(screen.getByText(/You've used all 3 attempts/)).toBeInTheDocument()
    expect(screen.getByText(/Your best score: 70%/)).toBeInTheDocument()
  })

  it("enables submit button after answering all questions", async () => {
    const user = userEvent.setup()
    render(
      <QuizEngine
        questions={mockQuestions}
        bestScore={null}
        attempts={0}
        onSubmit={vi.fn()}
      />
    )

    // Answer question 1 (select "4")
    await user.click(screen.getByLabelText("4"))
    // Answer question 2 (select "Blue")
    await user.click(screen.getByLabelText("Blue"))

    const submitButton = screen.getByRole("button", { name: "Submit Quiz" })
    expect(submitButton).not.toBeDisabled()
  })

  it("shows confirmation dialog when submit is clicked", async () => {
    const user = userEvent.setup()
    render(
      <QuizEngine
        questions={mockQuestions}
        bestScore={null}
        attempts={0}
        onSubmit={vi.fn()}
      />
    )

    await user.click(screen.getByLabelText("4"))
    await user.click(screen.getByLabelText("Blue"))
    await user.click(screen.getByRole("button", { name: "Submit Quiz" }))

    expect(screen.getByText("Submit Quiz?")).toBeInTheDocument()
    expect(screen.getByText(/you cannot change your answers/i)).toBeInTheDocument()
  })

  it("calls onSubmit with score after confirming", async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(
      <QuizEngine
        questions={mockQuestions}
        bestScore={null}
        attempts={0}
        onSubmit={onSubmit}
      />
    )

    // Select correct answers
    await user.click(screen.getByLabelText("4"))
    await user.click(screen.getByLabelText("Blue"))
    // Click submit to open dialog
    await user.click(screen.getByRole("button", { name: "Submit Quiz" }))
    // Confirm in dialog
    await user.click(screen.getByRole("button", { name: "Submit" }))

    expect(onSubmit).toHaveBeenCalledWith(100)
  })

  it("shows score and grade after submission", async () => {
    const user = userEvent.setup()
    render(
      <QuizEngine
        questions={mockQuestions}
        bestScore={null}
        attempts={0}
        onSubmit={vi.fn()}
      />
    )

    // Select correct answers (100%)
    await user.click(screen.getByLabelText("4"))
    await user.click(screen.getByLabelText("Blue"))
    await user.click(screen.getByRole("button", { name: "Submit Quiz" }))
    await user.click(screen.getByRole("button", { name: "Submit" }))

    expect(screen.getByText("100%")).toBeInTheDocument()
    expect(screen.getByText("Grade: A")).toBeInTheDocument()
  })

  it("shows explanations after submission", async () => {
    const user = userEvent.setup()
    render(
      <QuizEngine
        questions={mockQuestions}
        bestScore={null}
        attempts={0}
        onSubmit={vi.fn()}
      />
    )

    await user.click(screen.getByLabelText("4"))
    await user.click(screen.getByLabelText("Blue"))
    await user.click(screen.getByRole("button", { name: "Submit Quiz" }))
    await user.click(screen.getByRole("button", { name: "Submit" }))

    expect(screen.getByText("2 + 2 equals 4.")).toBeInTheDocument()
    expect(screen.getByText(/Rayleigh scattering/)).toBeInTheDocument()
  })
})
