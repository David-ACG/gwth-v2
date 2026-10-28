/**
 * Reads the hand-in form (bead gwth-launch-9289.2). Everything arriving here
 * is attacker-controlled: each field is checked and an error says what to fix.
 */
import {
  ANSWER_MAX_CHARS,
  ANSWER_MIN_CHARS,
  HAND_IN_QUESTIONS,
  type AnswerId,
  type CapstoneGuide,
  type DataChoice,
} from "./guides"
import { parseNameLines, type NameEntry } from "./redact"

/** The checked form, ready to collect files from. */
export interface PrepareForm {
  source: "files" | "zip" | "repo"
  repoUrl: string | null
  dataChoice: DataChoice
  names: NameEntry[]
  answers: Record<AnswerId, string>
}

/** Field name of each answer in the form. */
export const answerField = (id: AnswerId) => `answer_${id}`

/** The longest names box we read. */
export const NAMES_MAX_CHARS = 4000

/** Reads the non-file fields, or returns the first problem in plain words. */
export function readPrepareForm(form: FormData, guide: CapstoneGuide): PrepareForm | { error: string } {
  const source = form.get("source")
  if (source !== "files" && source !== "zip" && source !== "repo") {
    return { error: "Choose how you are handing in your project: files, a zip or a GitHub link." }
  }
  const dataChoice = form.get("data_choice")
  if (dataChoice !== "own" && dataChoice !== "example") {
    return { error: "Say whose details your project uses." }
  }
  const repoRaw = form.get("repo_url")
  const repoUrl = source === "repo" && typeof repoRaw === "string" ? repoRaw.trim() : null
  if (source === "repo" && !repoUrl) return { error: "Paste the link to your public project on GitHub." }

  const namesRaw = form.get("names")
  const namesText = typeof namesRaw === "string" ? namesRaw : ""
  if (namesText.length > NAMES_MAX_CHARS) return { error: "Keep the list of names to hide to 4,000 characters or fewer." }
  const names = dataChoice === "own" ? parseNameLines(namesText, guide.nameKinds, "Detail") : []

  const answers = {} as Record<AnswerId, string>
  for (const q of HAND_IN_QUESTIONS) {
    const raw = form.get(answerField(q.id))
    const value = typeof raw === "string" ? raw.trim() : ""
    if (value.length < ANSWER_MIN_CHARS) return { error: `Please answer "${q.question}" using at least ${ANSWER_MIN_CHARS} characters.` }
    if (value.length > ANSWER_MAX_CHARS) return { error: `Please keep your answer to "${q.question}" to ${ANSWER_MAX_CHARS} characters or fewer.` }
    answers[q.id] = value
  }
  return { source, repoUrl, dataChoice, names, answers }
}
