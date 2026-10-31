/**
 * Script checks: the exact, free checks that run on a hand-in before the AI
 * judges (bead gwth-launch-9289.4, decision 3a). Every judge gets the same
 * results as facts, so a missing file or a broken evidence reference is
 * decided by code, not by a model's reading.
 *
 * They run on what the learner confirmed (the redacted copies), and they
 * never throw: a missing or unreadable file is a failed check with a detail,
 * the same rule as the model-bakeoff lab check.py files.
 *
 * Pure apart from reading a .pptx's slide list: safe for tests and the runner.
 */
import { unzipSync } from "fflate"
import type { CapstoneId, ExpectedFile } from "./guides"
import type { LabelUse } from "./redact"
import { matchChecklist } from "./rules"

/** One handed-in file as the checks see it. */
export interface CheckFile {
  /** Stored path ("report.pdf.txt" for a converted PDF). */
  path: string
  /** The learner's own file name ("report.pdf"). */
  originalPath: string
  /** The redacted text, or null for a picture or other binary file. */
  text: string | null
  /** The stored bytes (used for a .pptx slide count). */
  bytes?: Uint8Array
}

/** One check's outcome. */
export interface CheckResult {
  id: string
  /** What was checked, in plain words (the judges read this). */
  label: string
  passed: boolean
  detail: string
  /** The basics line this check is evidence for, if any. */
  basic?: string
  /** The criterion this check is evidence for, if any. */
  criterion?: string
}

/** Everything the script checks found. */
export interface ScriptChecks {
  capstone: CapstoneId
  passed: number
  total: number
  results: CheckResult[]
}

/** What the checks need. */
export interface CheckInput {
  capstone: CapstoneId
  files: CheckFile[]
  /** The redaction summary: how often each kind of private detail was hidden. */
  labels: LabelUse[]
  /** The guide's expected files. */
  expectedFiles: ExpectedFile[]
}

const lower = (s: string) => s.toLowerCase()

function find(files: CheckFile[], hints: string[], exts: string[] = []): CheckFile | undefined {
  return files.find((f) => {
    const name = lower(f.originalPath.split("/").pop() ?? "")
    const ext = name.includes(".") ? name.split(".").pop()! : ""
    return hints.some((h) => name.includes(h)) && (exts.length === 0 || exts.includes(ext))
  })
}

/** The file the guide's line `ids` (first that exists) points at, else the fall-back hints. */
function fileFor(input: CheckInput, ids: string[], fallback: string[], exts: string[] = []): CheckFile | undefined {
  for (const id of ids) {
    const item = input.expectedFiles.find((f) => f.id === id)
    if (!item) continue
    const hit = find(input.files, item.nameHints, item.extensions)
    if (hit) return hit
  }
  return find(input.files, fallback, exts)
}

function hiddenCount(labels: LabelUse[], kinds: string[]): number {
  return labels.filter((l) => l.source === "pattern" && kinds.includes(l.kind)).reduce((n, l) => n + l.count, 0)
}

function wordCount(text: string): number {
  return (text.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? []).length
}

/** Rough English syllable count, the usual vowel-group rule. */
function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "")
  if (!w) return 0
  if (w.length <= 3) return 1
  const groups = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "").match(/[aeiouy]{1,2}/g)
  return Math.max(1, groups?.length ?? 1)
}

/** Flesch reading ease (higher is easier; 50 or more is the guide's line). */
export function fleschReadingEase(text: string): number | null {
  const words = text.match(/[A-Za-z][A-Za-z'’-]*/g) ?? []
  const sentences = text.split(/[.!?]+(?:\s|$)/).filter((s) => /[A-Za-z]/.test(s)).length
  if (words.length < 20 || sentences === 0) return null
  const syl = words.reduce((n, w) => n + syllables(w), 0)
  return Math.round((206.835 - 1.015 * (words.length / sentences) - 84.6 * (syl / words.length)) * 10) / 10
}

/** The text under a heading, up to the next heading-like line. */
export function section(text: string, heading: RegExp): string | null {
  const lines = text.split(/\r?\n/)
  const start = lines.findIndex((l) => heading.test(l.replace(/^[#*\s\d.]+/, "")))
  if (start < 0) return null
  const out: string[] = []
  for (const line of lines.slice(start + 1)) {
    if (/^#{1,6}\s/.test(line) || (/^[A-Z][A-Za-z ,&-]{2,60}$/.test(line.trim()) && out.join("").trim().length > 200)) break
    out.push(line)
  }
  return out.join("\n").trim()
}

/** Every value under a key that looks like an evidence reference. */
function evidenceRefs(value: unknown, out: string[] = []): string[] {
  if (Array.isArray(value)) value.forEach((v) => evidenceRefs(v, out))
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      if (/evidence_?refs?|evidence_?ids?/i.test(k)) {
        for (const ref of Array.isArray(v) ? v : [v]) {
          if (typeof ref === "string" || typeof ref === "number") out.push(String(ref))
          else if (ref && typeof ref === "object") {
            const id = (ref as Record<string, unknown>).id ?? (ref as Record<string, unknown>).ref
            if (id !== undefined) out.push(String(id))
          }
        }
      } else evidenceRefs(v, out)
    }
  }
  return out
}

/** Keys that look like a kill criterion or stop rule, with their values. */
function stopRules(value: unknown, out: unknown[] = []): unknown[] {
  if (Array.isArray(value)) value.forEach((v) => stopRules(v, out))
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      if (/kill_?criteri|stop_?rule/i.test(k)) out.push(v)
      else stopRules(v, out)
    }
  }
  return out
}

function parseJson(file: CheckFile | undefined): { ok: true; value: unknown } | { ok: false; detail: string } {
  if (!file) return { ok: false, detail: "file not found" }
  if (file.text === null) return { ok: false, detail: `${file.originalPath} is not a text file` }
  try {
    return { ok: true, value: JSON.parse(file.text) }
  } catch (error) {
    return { ok: false, detail: `${file.originalPath} is not valid JSON (${(error as Error).message.slice(0, 80)})` }
  }
}

/** Slides in a deck: a .pptx's slide files, or a PDF's pages. */
export function slideCount(file: CheckFile): number | null {
  const ext = lower(file.originalPath).split(".").pop()
  if (ext === "pptx" && file.bytes) {
    try {
      const entries = unzipSync(file.bytes, { filter: (f) => /^ppt\/slides\/slide\d+\.xml$/.test(f.name) })
      return Object.keys(entries).length
    } catch {
      return null
    }
  }
  if (ext === "pdf" && file.text !== null) return file.text.split("\f").length
  // A Marp (Markdown) deck: slides are separated by a line of three dashes;
  // a front-matter block at the top is not a slide.
  if (ext === "md" && file.text !== null) {
    const body = file.text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "")
    return body.split(/\r?\n---\s*\r?\n/).filter((s) => s.trim()).length
  }
  return null
}

function presenceChecks(input: CheckInput): CheckResult[] {
  return matchChecklist(input.files.map((f) => f.originalPath), input.expectedFiles)
    .filter((c) => c.required)
    .map((c) => ({
      id: `present:${c.id}`,
      label: `${c.label} is handed in`,
      passed: c.found.length > 0,
      detail: c.found.length ? `found: ${c.found.join(", ")}` : "no file with a matching name",
    }))
}

function familybot(input: CheckInput): CheckResult[] {
  const out: CheckResult[] = []
  const brief = find(input.files, ["weekly_brief", "weekly-brief", "brief"])
  const text = brief?.text ?? ""
  for (const name of ["Tasks", "Events", "Shopping", "Meals", "Uncertain"]) {
    const has = new RegExp(`^\\s*(?:#+\\s*|\\*\\*)?${name}\\b`, "im").test(text)
    out.push({
      id: `brief_section:${lower(name)}`,
      label: `The weekly brief has a ${name} section`,
      passed: has,
      detail: brief ? (has ? `found in ${brief.originalPath}` : `no line starting "${name}" in ${brief.originalPath}`) : "no weekly brief found",
      criterion: "weekly_brief",
    })
  }
  const shots = input.files.filter((f) => /\.(png|jpe?g|webp|gif|heic)$/i.test(f.originalPath))
  out.push({
    id: "screenshot",
    label: "A screenshot is handed in",
    passed: shots.length > 0,
    detail: shots.length ? `found: ${shots.map((f) => f.originalPath).join(", ")}` : "no picture file",
    criterion: "in_apps",
  })
  return out
}

function askmyco(input: CheckInput): CheckResult[] {
  const out: CheckResult[] = []
  const statement = find(input.files, ["quality"])
  const words = statement?.text ? wordCount(statement.text) : 0
  out.push({
    id: "quality_statement_one_page",
    label: "The Quality Statement fits on one page (650 words or fewer)",
    passed: Boolean(statement?.text) && words > 0 && words <= 650,
    detail: statement ? (statement.text === null ? "not a readable text file" : `${words} words`) : "no Quality Statement found",
    criterion: "quality_statement",
  })
  const signed = statement?.text
    ? /\b(signed|signature)\b/i.test(statement.text) &&
      /\b(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}|\d{4}-\d{2}-\d{2}|\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4})\b/i.test(statement.text)
    : false
  out.push({
    id: "quality_statement_signed",
    label: "The Quality Statement is signed and dated",
    passed: signed,
    detail: statement ? (signed ? "a signature line and a date found" : "no signature line with a date found") : "no Quality Statement found",
    basic: "honest_statement",
  })
  const plan = find(input.files, ["sprint"])
  const days = new Set(Array.from(plan?.text?.matchAll(/\bday\s*(\d{1,2})\b/gi) ?? [], (m) => Number(m[1])))
  const tenDays = Array.from({ length: 10 }, (_, i) => i + 1).every((d) => days.has(d))
  out.push({
    id: "sprint_plan_ten_days",
    label: "The sprint plan has Days 1 to 10",
    passed: tenDays,
    detail: plan ? `days found: ${[...days].sort((a, b) => a - b).join(", ") || "none"}` : "no sprint plan found",
    criterion: "sprint_plan",
  })
  const secrets = hiddenCount(input.labels, ["Secret"])
  out.push({
    id: "no_secrets",
    label: "No API keys or passwords in the files",
    passed: secrets === 0,
    detail: secrets ? `${secrets} key or password value found and hidden before marking` : "none found",
    basic: "no_secrets",
  })
  return out
}

function askeveryone(input: CheckInput): CheckResult[] {
  const out: CheckResult[] = []
  const deck = fileFor(input, ["deck"], ["deck", "slides"], ["pdf", "pptx", "key", "odp"])
  const slides = deck ? slideCount(deck) : null
  out.push({
    id: "deck_ten_slides",
    label: "The deck has ten slides",
    passed: slides === 10,
    detail: deck ? (slides === null ? `could not count the slides in ${deck.originalPath}` : `${slides} slides`) : "no deck found",
    criterion: "report_deck",
  })

  // "report" before "southbridge": southbridge_deck.md must never be taken for the report.
  const report =
    fileFor(input, ["report"], ["report"], ["pdf", "md", "docx", "txt"]) ??
    input.files.find((f) => /southbridge/i.test(f.originalPath) && !/deck|slide/i.test(f.originalPath) && /\.(pdf|md|docx|txt)$/i.test(f.originalPath))
  const summary = report?.text ? section(report.text, /^executive summary\b/i) : null
  const ease = summary ? fleschReadingEase(summary) : null
  out.push({
    id: "summary_reading_ease",
    label: "The executive summary reads easily (reading ease 50 or more)",
    passed: ease !== null && ease >= 50,
    detail: !report ? "no report found" : summary === null ? "no Executive summary heading found" : ease === null ? "summary too short to score" : `reading ease ${ease}`,
    criterion: "report_deck",
  })
  const legal = report?.text ? /legal review/i.test(report.text) : false
  out.push({
    id: "legal_review_line",
    label: "The report says real deployment needs legal review",
    passed: legal,
    detail: report ? (legal ? "found" : 'no mention of "legal review"') : "no report found",
    basic: "no_regulated_advice",
  })

  const output = parseJson(fileFor(input, ["output", "output-json"], ["output"], ["json"]))
  out.push({
    id: "output_json_valid",
    label: "The output JSON opens as valid JSON",
    passed: output.ok,
    detail: output.ok ? "valid" : output.detail,
    criterion: "evaluation",
  })
  const golden = fileFor(input, ["golden_input", "golden-input"], ["golden"], ["json"])
  const sources = [golden, ...input.files.filter((f) => /transcript|interview/i.test(f.originalPath))]
    .map((f) => f?.text ?? "")
    .join("\n")
  if (output.ok) {
    const refs = [...new Set(evidenceRefs(output.value))]
    const missing = refs.filter((r) => !sources.includes(r))
    out.push({
      id: "evidence_refs_resolve",
      label: "Every evidence reference in the output points to the golden input or a transcript",
      passed: refs.length > 0 && missing.length === 0 && Boolean(golden),
      detail: !golden
        ? "no golden input found"
        : refs.length === 0
          ? "no evidence references found in the output"
          : missing.length
            ? `${missing.length} of ${refs.length} not found: ${missing.slice(0, 5).join(", ")}`
            : `all ${refs.length} found`,
      basic: "evidence_behind_claims",
    })
    const rules = stopRules(output.value)
    const empty = rules.filter((v) => v === null || v === "" || (Array.isArray(v) && v.length === 0))
    out.push({
      id: "no_empty_stop_rule",
      label: "No action has an empty stop rule",
      passed: rules.length > 0 && empty.length === 0,
      detail: rules.length === 0 ? "no stop rules found in the output" : empty.length ? `${empty.length} of ${rules.length} empty` : `all ${rules.length} filled in`,
      criterion: "report_deck",
    })
  }
  const evals = parseJson(fileFor(input, ["eval_results", "eval-results"], ["eval"], ["json"]))
  out.push({
    id: "eval_results_valid",
    label: "The eval results file is there and opens as valid JSON",
    passed: evals.ok,
    detail: evals.ok ? "valid" : evals.detail,
    criterion: "evaluation",
  })
  return out
}

/** Facts every capstone shares: private details the learner left in. */
function privacyChecks(input: CheckInput): CheckResult[] {
  if (input.capstone !== "familybot") return []
  const sensitive = hiddenCount(input.labels, ["NHS number", "Account number", "Sort code", "Card number"])
  return [
    {
      id: "no_sensitive_numbers",
      label: "No NHS, bank, account or card numbers in the files",
      passed: sensitive === 0,
      detail: sensitive ? `${sensitive} such number found and hidden before marking` : "none found",
      basic: "private",
    },
  ]
}

/** Runs every check for the hand-in's capstone. Never throws. */
export function runScriptChecks(input: CheckInput): ScriptChecks {
  let results: CheckResult[]
  try {
    const specific = input.capstone === "familybot" ? familybot(input) : input.capstone === "askmyco" ? askmyco(input) : askeveryone(input)
    results = [...presenceChecks(input), ...specific, ...privacyChecks(input)]
  } catch (error) {
    results = [{ id: "checks_failed", label: "The script checks ran", passed: false, detail: `error: ${(error as Error).message}` }]
  }
  return { capstone: input.capstone, passed: results.filter((r) => r.passed).length, total: results.length, results }
}
