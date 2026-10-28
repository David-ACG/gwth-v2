/**
 * The three capstones a learner hands in, one per month (bead
 * gwth-launch-9289.2), and what each hand-in should contain.
 *
 * The expected-files list here is the BUILT-IN copy, taken from the approved
 * marking guides on the plan page (https://hlab.taila51191.ts.net:9480/project-marking/).
 * Bead 9289.1 turns those guides into one machine-read `marking_guide.json`
 * per capstone; once one exists, `loadMarkingGuide` in ./guide-loader.ts reads
 * its `hand_in.files` instead and this list is only the fall-back. Keep the
 * two shapes the same ({@link ExpectedFile}).
 *
 * Pure data and pure functions: safe to import from client components.
 */

/** The id of a capstone, also its URL segment (`/hand-in/<id>`). */
export type CapstoneId = "familybot" | "askmyco" | "askeveryone"

/** One file (or set of files) the marking guide expects in the hand-in. */
export interface ExpectedFile {
  /** Stable id, used in the stored checklist. */
  id: string
  /** What the learner reads in the checklist, in plain words. */
  label: string
  /** Lower-case words; a file matches when its path contains any of them. */
  nameHints: string[]
  /** Lower-case extensions without the dot; empty means any extension. */
  extensions: string[]
  /** False for evidence that helps but is not on the marking guide. */
  required: boolean
}

/** Whose details a hand-in uses: the learner's own, or the lesson's example. */
export type DataChoice = "own" | "example"

/** A kind of name the learner can ask us to hide, and its label stem. */
export interface NameKind {
  /** Stored value. */
  id: string
  /** Shown in the picker and used in the label, e.g. "Child" gives [Child 1]. */
  label: string
}

/** Everything the hand-in page needs to know about one capstone. */
export interface CapstoneGuide {
  /** Capstone id and URL segment. */
  id: CapstoneId
  /** Course month the capstone closes. */
  month: 1 | 2 | 3
  /** Short title. */
  title: string
  /** One line on what is handed in. */
  summary: string
  /** The example the learner may use instead of their own details. */
  exampleLabel: string
  /** What "own" means for this capstone (household or company). */
  ownLabel: string
  /** The kinds of names the learner can list for hiding. */
  nameKinds: NameKind[]
  /** The files the marking guide expects. */
  expectedFiles: ExpectedFile[]
  /** Where the expected-files list came from. */
  source: "built-in" | "marking_guide.json"
}

/** The most hand-ins a learner may make per capstone (decision 6c). */
export const MAX_HAND_INS = 3

/** The four short answers every capstone asks for (decision 1). */
export const HAND_IN_QUESTIONS = [
  {
    id: "built",
    question: "What did you build, and who is it for?",
    help: "Two or three sentences are enough.",
  },
  {
    id: "checked",
    question: "How did you check it works?",
    help: "Give one example from your files, and name the file.",
  },
  {
    id: "fixed",
    question: "What went wrong, and how did you fix it?",
    help: "Pick one thing that did not work the first time.",
  },
  {
    id: "next",
    question: "What would you change next?",
    help: "One change, and why it would help.",
  },
] as const

/** The id of one of the four answers. */
export type AnswerId = (typeof HAND_IN_QUESTIONS)[number]["id"]

/** Shortest and longest answer we accept, in characters. */
export const ANSWER_MIN_CHARS = 20
export const ANSWER_MAX_CHARS = 2000

const HOUSEHOLD_KINDS: NameKind[] = [
  { id: "child", label: "Child" },
  { id: "partner", label: "Partner" },
  { id: "adult", label: "Adult" },
  { id: "school", label: "School" },
  { id: "place", label: "Place" },
]

const COMPANY_KINDS: NameKind[] = [
  { id: "person", label: "Person" },
  { id: "company", label: "Company" },
  { id: "place", label: "Place" },
]

const TEXT = ["md", "txt", "pdf", "docx", "rtf", "html"]
const IMAGE = ["png", "jpg", "jpeg", "webp", "heic", "gif"]

const BUILT_IN: Record<CapstoneId, Omit<CapstoneGuide, "source">> = {
  familybot: {
    id: "familybot",
    month: 1,
    title: "FamilyBot",
    summary:
      "Your FamilyBot Blueprint, voice-note transcript, weekly brief, WhatsApp summary, digest email and a screenshot of the task and event, plus four short answers.",
    exampleLabel: "The example household from the lessons",
    ownLabel: "My own household",
    nameKinds: HOUSEHOLD_KINDS,
    expectedFiles: [
      { id: "blueprint", label: "Your FamilyBot Blueprint", nameHints: ["blueprint"], extensions: TEXT, required: true },
      { id: "transcript", label: "The voice-note transcript", nameHints: ["transcript"], extensions: TEXT, required: true },
      { id: "weekly-brief", label: "The weekly brief", nameHints: ["weekly_brief", "weekly-brief", "brief"], extensions: TEXT, required: true },
      { id: "whatsapp", label: "The WhatsApp summary", nameHints: ["whatsapp"], extensions: TEXT, required: true },
      { id: "digest", label: "The digest email", nameHints: ["digest"], extensions: [...TEXT, "eml"], required: true },
      { id: "screenshot", label: "A screenshot of the task and the event", nameHints: [""], extensions: IMAGE, required: true },
      { id: "ics", label: "The calendar (.ics) file", nameHints: [""], extensions: ["ics"], required: false },
    ],
  },
  askmyco: {
    id: "askmyco",
    month: 2,
    title: "AskMyCo and FractionalBuddy",
    summary:
      "Your AskMyCo code with screenshots of cited answers and the two-company test, the governance pack, the FractionalBuddy spec, the sprint plan and the Quality Statement, plus four short answers.",
    exampleLabel: "The example companies from the lessons",
    ownLabel: "A real company's documents",
    nameKinds: COMPANY_KINDS,
    expectedFiles: [
      { id: "code", label: "Your AskMyCo code", nameHints: ["package.json", "requirements.txt", "pyproject.toml"], extensions: [], required: true },
      { id: "cited-answers", label: "Screenshots of cited answers", nameHints: ["citation", "cited", "answer"], extensions: IMAGE, required: true },
      { id: "two-company-test", label: "The two-company test", nameHints: ["two-company", "two_company", "twocompany", "tenant", "isolation"], extensions: [], required: true },
      { id: "governance", label: "The governance pack", nameHints: ["governance", "lawful", "processing", "subject_access", "subject-access", "cyber"], extensions: [], required: true },
      { id: "spec", label: "The FractionalBuddy spec", nameHints: ["fractionalbuddy", "fractional", "spec"], extensions: TEXT, required: true },
      { id: "sprint-plan", label: "The ten-day sprint plan", nameHints: ["sprint"], extensions: TEXT, required: true },
      { id: "quality-statement", label: "The Quality Statement", nameHints: ["quality"], extensions: TEXT, required: true },
    ],
  },
  askeveryone: {
    id: "askeveryone",
    month: 3,
    title: "askevery.one readiness assessment",
    summary:
      "Your portfolio with the interview prototype, the evidence and scoring engine, the Southbridge report, the ten-slide deck, the golden input, the output JSON, the eval results and a README, plus four short answers.",
    exampleLabel: "The supplied Southbridge data",
    ownLabel: "Real interviews (with consent)",
    nameKinds: COMPANY_KINDS,
    expectedFiles: [
      { id: "readme", label: "A README", nameHints: ["readme"], extensions: [], required: true },
      { id: "report", label: "The Southbridge report (PDF)", nameHints: ["report", "southbridge"], extensions: ["pdf"], required: true },
      { id: "deck", label: "The ten-slide deck", nameHints: ["deck", "slides"], extensions: ["pdf", "pptx", "key", "odp"], required: true },
      { id: "golden-input", label: "The golden input", nameHints: ["golden"], extensions: [], required: true },
      { id: "output-json", label: "The output JSON", nameHints: ["output"], extensions: ["json"], required: true },
      { id: "eval-results", label: "The eval results", nameHints: ["eval"], extensions: [], required: true },
      { id: "transcripts", label: "Interview transcripts", nameHints: ["transcript", "interview"], extensions: [], required: false },
    ],
  },
}

/** Every capstone id, in month order. */
export const CAPSTONE_IDS: CapstoneId[] = ["familybot", "askmyco", "askeveryone"]

/** True when the value is a known capstone id. */
export function isCapstoneId(value: unknown): value is CapstoneId {
  return typeof value === "string" && (CAPSTONE_IDS as string[]).includes(value)
}

/** The built-in guide for one capstone (the fall-back while 9289.1 is open). */
export function builtInGuide(id: CapstoneId): CapstoneGuide {
  const guide = BUILT_IN[id]
  return { ...guide, expectedFiles: guide.expectedFiles.map((f) => ({ ...f })), source: "built-in" }
}

/** The capstone that closes a month. */
export function capstoneForMonth(month: number): CapstoneId | null {
  return CAPSTONE_IDS.find((id) => BUILT_IN[id].month === month) ?? null
}
