/**
 * Hides private details in a capstone hand-in before anything is stored or
 * sent to a marker (bead gwth-launch-9289.3, decision 3c).
 *
 * Two kinds of thing are hidden:
 *   - the names the learner lists (children, partner, school, a company...),
 *     each person's spellings mapped to ONE label such as [Child 1];
 *   - details found by pattern: emails, phone numbers, UK postcodes, NHS
 *     numbers, sort codes, bank account and card numbers, IBANs, and API keys
 *     or passwords.
 *
 * One {@link Redactor} is used for every file in a hand-in, so the same detail
 * gets the same label in every file ("[Phone 1]" in the brief is "[Phone 1]"
 * in the digest). Matching runs on the ORIGINAL text and overlapping matches
 * are resolved before anything is replaced, so a label is never re-matched.
 *
 * Nothing here keeps the original values beyond the redactor's lifetime: the
 * summary that is stored ({@link Redactor.summary}) holds labels and counts
 * only. Over-hiding is the safe failure: the learner sees every change in the
 * preview before they confirm.
 *
 * Pure, no I/O: safe to import anywhere.
 */

/** One person (or school, company, place) the learner wants hidden. */
export interface NameEntry {
  /** Label stem, e.g. "Child" gives [Child 1]. */
  kindLabel: string
  /** Every spelling of this one name, e.g. ["Amelia Jones", "Millie"]. */
  names: string[]
  /**
   * True for a person: their first name on its own is hidden too. Never for
   * a place, school or company, where the first word is "14" or "St".
   */
  person?: boolean
}

/** Kind labels that name a person (their first name is hidden on its own). */
export const PERSON_KINDS = ["Child", "Partner", "Adult", "Person"]

/** The pattern kinds, in the order their labels are shown. */
export const PATTERN_KINDS = [
  "Email",
  "Phone",
  "Postcode",
  "NHS number",
  "Sort code",
  "Account number",
  "Card number",
  "Secret",
] as const

/** A kind of detail found by pattern. */
export type PatternKind = (typeof PATTERN_KINDS)[number]

/** One label that was used, with how often (no original values). */
export interface LabelUse {
  /** The label as it appears in the text, e.g. "[Child 1]". */
  label: string
  /** The kind stem, e.g. "Child" or "Phone". */
  kind: string
  /** "name" for a listed name, "pattern" for a detail found by pattern. */
  source: "name" | "pattern"
  /** Number of places it replaced, across every file. */
  count: number
}

/** The result of redacting one text. */
export interface RedactedText {
  /** The text with every detail replaced by its label. */
  text: string
  /** Number of replacements made in this text. */
  replaced: number
}

interface Span {
  start: number
  end: number
  label: string
  priority: number
}

/** True for a code point that can be part of a word or number. */
const WORDISH = /[\p{L}\p{N}]/u

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function digitsOf(value: string): string {
  return value.replace(/\D/g, "")
}

/** NHS numbers carry a mod-11 check digit; most random 10-digit runs fail it. */
export function isValidNhsNumber(value: string): boolean {
  const d = digitsOf(value)
  if (d.length !== 10) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += Number(d[i]) * (10 - i)
  let check = 11 - (sum % 11)
  if (check === 11) check = 0
  if (check === 10) return false
  return check === Number(d[9])
}

/** Card numbers carry a Luhn check digit. */
export function passesLuhn(value: string): boolean {
  const d = digitsOf(value)
  if (d.length < 13 || d.length > 19) return false
  let sum = 0
  let double = false
  for (let i = d.length - 1; i >= 0; i--) {
    let n = Number(d[i])
    if (double) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    double = !double
  }
  return sum % 10 === 0
}

/** IBANs carry a mod-97 check. */
export function isValidIban(value: string): boolean {
  const s = value.replace(/\s+/g, "").toUpperCase()
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(s)) return false
  const moved = s.slice(4) + s.slice(0, 4)
  let rem = 0
  for (const ch of moved) {
    const code = ch >= "A" && ch <= "Z" ? String(ch.charCodeAt(0) - 55) : ch
    for (const digit of code) rem = (rem * 10 + Number(digit)) % 97
  }
  return rem === 1
}

/** UK numbers: +44 / 0044 / 0, then 9 or 10 national digits. */
function ukNationalDigits(raw: string): string | null {
  let s = raw.replace(/[\s\-().]/g, "")
  if (s.startsWith("+44")) s = s.slice(3)
  else if (s.startsWith("0044")) s = s.slice(4)
  else if (s.startsWith("0")) s = s.slice(1)
  else return null
  if (s.startsWith("0")) s = s.slice(1) // "+44 (0) 20..." leaves a stray 0
  if (!/^\d+$/.test(s) || s.length < 9 || s.length > 10) return null
  if (!/^[1-9]/.test(s)) return null
  return "0" + s
}

/** Text in the `window` characters before `index`, lower-cased. */
function before(text: string, index: number, window: number): string {
  return text.slice(Math.max(0, index - window), index).toLowerCase()
}

interface Detector {
  kind: PatternKind
  priority: number
  regex: RegExp
  /** Returns the normalised value (for consistent labels) or null to skip. */
  accept: (match: RegExpExecArray, text: string) => { value: string; start: number; end: number } | null
}

const whole = (m: RegExpExecArray, value: string) => ({ value, start: m.index, end: m.index + m[0].length })

const DETECTORS: Detector[] = [
  {
    kind: "Secret",
    priority: 9,
    regex: /\b(?:sk-(?:ant-|proj-)?[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{30,}|xox[abprs]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{35}|re_[A-Za-z0-9_]{20,})/g,
    accept: (m) => whole(m, m[0]),
  },
  {
    // key = value / "password": "value": only the value is hidden.
    kind: "Secret",
    priority: 8,
    regex: /\b(?:api[_-]?key|secret(?:[_-]?key)?|access[_-]?token|auth[_-]?token|password|passwd)\b["']?\s*[:=]\s*["']?([^\s"',;]{8,})/gi,
    accept: (m) => {
      const value = m[1] ?? ""
      if (!value || /^(process\.env|os\.environ|env\(|\$\{|<|\[)/i.test(value)) return null
      const start = m.index + m[0].lastIndexOf(value)
      return { value, start, end: start + value.length }
    },
  },
  {
    kind: "Email",
    priority: 7,
    regex: /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g,
    accept: (m) => whole(m, m[0].toLowerCase()),
  },
  {
    kind: "Account number",
    priority: 6,
    regex: /\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]{4}){2,7}(?: ?[A-Z0-9]{1,4})?\b/g,
    accept: (m) => (isValidIban(m[0]) ? whole(m, m[0].replace(/\s+/g, "").toUpperCase()) : null),
  },
  {
    kind: "Card number",
    priority: 6,
    regex: /\b\d(?:[ -]?\d){12,18}\b/g,
    accept: (m) => (passesLuhn(m[0]) && /[ -]|^\d{15,16}$/.test(m[0]) ? whole(m, digitsOf(m[0])) : null),
  },
  {
    kind: "Phone",
    priority: 5,
    regex: /(?:\+44\s?\(0\)\s?|\+44[\s-]?|0044[\s-]?|\(?0)\d[\d\s\-()]{7,13}\d/g,
    accept: (m, text) => {
      if (m.index > 0 && /[\d+]/.test(text[m.index - 1] ?? "")) return null
      const national = ukNationalDigits(m[0])
      if (!national) return null
      // "(0113 496 0000)": the opening bracket belongs to the sentence, not
      // the number, unless the number closes it ("(0113) 496 0000").
      const skip = m[0].startsWith("(") && !m[0].includes(")") ? 1 : 0
      return { value: national, start: m.index + skip, end: m.index + m[0].length }
    },
  },
  {
    kind: "Phone",
    priority: 5,
    regex: /\+(?!44)[1-9]\d{0,2}[\s-]?\(?\d{1,4}\)?(?:[\s-]?\d{2,4}){2,4}/g,
    accept: (m) => {
      const d = digitsOf(m[0])
      return d.length >= 8 && d.length <= 15 ? whole(m, "+" + d) : null
    },
  },
  {
    kind: "NHS number",
    priority: 4,
    regex: /\b\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/g,
    accept: (m, text) =>
      isValidNhsNumber(m[0]) || before(text, m.index, 30).includes("nhs") ? whole(m, digitsOf(m[0])) : null,
  },
  {
    kind: "Sort code",
    priority: 4,
    regex: /\b\d{2}[-\s]\d{2}[-\s]\d{2}\b/g,
    accept: (m, text) => (/sort\s*code|s\/c/.test(before(text, m.index, 30)) ? whole(m, digitsOf(m[0])) : null),
  },
  {
    kind: "Account number",
    priority: 3,
    regex: /\b\d{6,10}\b/g,
    accept: (m, text) => {
      // A bare run of digits is too often an order number or a date to hide
      // on sight; it is an account number when the words say so.
      const lead = before(text, m.index, 40)
      return /account|acct|a\/c|bank|sort\s*code/.test(lead) ? whole(m, m[0]) : null
    },
  },
  {
    kind: "Postcode",
    priority: 2,
    regex: /\b([A-Z]{1,2}\d[A-Z\d]?) ?(\d[A-Z]{2})\b/gi,
    accept: (m) => {
      const value = `${m[1]} ${m[2]}`.toUpperCase()
      // Mixed case ("Ab1 2cd") is almost never a postcode; all upper or all lower is.
      if (m[0] !== m[0].toUpperCase() && m[0] !== m[0].toLowerCase()) return null
      return whole(m, value)
    },
  },
]

/**
 * Hides the listed names and the pattern details, with labels that stay the
 * same across every text passed to the same instance.
 */
export class Redactor {
  private readonly nameMatchers: { regex: RegExp; label: string; priority: number }[] = []
  private readonly patternLabels = new Map<string, string>()
  private readonly kindCounters = new Map<string, number>()
  private readonly uses = new Map<string, LabelUse>()

  /**
   * @param entries the names to hide, one entry per person or place. Each
   *   gets its label now, in list order, so the labels do not depend on which
   *   file mentions a name first.
   */
  constructor(entries: NameEntry[] = []) {
    for (const entry of entries) {
      const spellings = expandSpellings(entry.names, entry.person ?? PERSON_KINDS.includes(entry.kindLabel))
      if (spellings.length === 0) continue
      const label = `[${entry.kindLabel} ${this.nextNumber(entry.kindLabel)}]`
      this.uses.set(label, { label, kind: entry.kindLabel, source: "name", count: 0 })
      for (const spelling of spellings) {
        const body = spelling.split(/\s+/).map(escapeRegExp).join("\\s+")
        this.nameMatchers.push({
          regex: new RegExp(`(?<![\\p{L}\\p{N}])${body}(?![\\p{L}\\p{N}])`, "giu"),
          label,
          // Longer spellings first, so "Amelia Jones" beats "Amelia".
          priority: 100 + spelling.length,
        })
      }
    }
  }

  private nextNumber(kind: string): number {
    const n = (this.kindCounters.get(kind) ?? 0) + 1
    this.kindCounters.set(kind, n)
    return n
  }

  private patternLabel(kind: PatternKind, value: string): string {
    const key = `${kind}\u0000${value}`
    let label = this.patternLabels.get(key)
    if (!label) {
      label = `[${kind} ${this.nextNumber(kind)}]`
      this.patternLabels.set(key, label)
      this.uses.set(label, { label, kind, source: "pattern", count: 0 })
    }
    return label
  }

  /** Redacts one text. Call in a stable order (e.g. sorted paths). */
  redact(text: string): RedactedText {
    const spans: Span[] = []
    for (const matcher of this.nameMatchers) {
      matcher.regex.lastIndex = 0
      for (let m = matcher.regex.exec(text); m; m = matcher.regex.exec(text)) {
        spans.push({ start: m.index, end: m.index + m[0].length, label: matcher.label, priority: matcher.priority })
      }
    }
    // Pattern labels are numbered in order of first appearance, so collect
    // the raw hits first and only label the ones that survive the overlap pass.
    const hits: (Span & { kind: PatternKind; value: string })[] = []
    for (const detector of DETECTORS) {
      detector.regex.lastIndex = 0
      for (let m = detector.regex.exec(text); m; m = detector.regex.exec(text)) {
        const found = detector.accept(m, text)
        if (!found) continue
        hits.push({ ...found, label: "", priority: detector.priority, kind: detector.kind })
      }
    }
    const chosen = resolveOverlaps([...spans, ...hits])
    let out = ""
    let cursor = 0
    for (const span of chosen) {
      const hit = span as Span & { kind?: PatternKind; value?: string }
      const label = hit.kind ? this.patternLabel(hit.kind, hit.value!) : span.label
      out += text.slice(cursor, span.start) + label
      cursor = span.end
      this.uses.get(label)!.count += 1
    }
    out += text.slice(cursor)
    return { text: out, replaced: chosen.length }
  }

  /** Every label that replaced something, names first then patterns. */
  summary(): LabelUse[] {
    const used = [...this.uses.values()].filter((u) => u.count > 0)
    const order = (u: LabelUse) => (u.source === "name" ? 0 : 1 + PATTERN_KINDS.indexOf(u.kind as PatternKind))
    return used.sort((a, b) => order(a) - order(b) || a.label.localeCompare(b.label, "en", { numeric: true }))
  }

  /** Names the learner listed that never appeared in any text. */
  unusedNameLabels(): string[] {
    return [...this.uses.values()].filter((u) => u.source === "name" && u.count === 0).map((u) => u.label)
  }
}

/** Keeps the earliest, then longest, then highest-priority span; drops overlaps. */
function resolveOverlaps<T extends Span>(spans: T[]): T[] {
  const sorted = [...spans].sort(
    (a, b) => a.start - b.start || b.end - b.start - (a.end - a.start) || b.priority - a.priority,
  )
  const kept: T[] = []
  let lastEnd = -1
  for (const span of sorted) {
    // The earlier (and, from the same start, longer) span already covers it:
    // a name inside an email address goes with the whole address.
    if (span.start < lastEnd) continue
    kept.push(span)
    lastEnd = span.end
  }
  return kept
}

/**
 * The spellings to search for one entry: each name as typed, plus, for a
 * person, the first word of a full name ("Amelia Jones" also hides "Amelia")
 * when that word is all letters. A surname on its own is not added, because
 * families share them; the learner lists it if they want it hidden. A place
 * gets no first word: "14 Elm Road" must not hide every "14".
 */
export function expandSpellings(names: string[], person = true): string[] {
  const out = new Set<string>()
  for (const raw of names) {
    const name = raw.trim().replace(/\s+/g, " ")
    if (name.length < 2 || !WORDISH.test(name)) continue
    out.add(name)
    const first = name.split(" ")[0] ?? ""
    if (person && name.includes(" ") && first.length >= 2 && /^[\p{L}'-]+$/u.test(first)) out.add(first)
  }
  return [...out].sort((a, b) => b.length - a.length)
}

/**
 * Parses the learner's names box: one person per line, as
 * "Child: Amelia Jones, Millie". Lines without a known kind use `fallbackKind`.
 */
export function parseNameLines(
  text: string,
  kinds: { id: string; label: string }[],
  fallbackKind: string,
): NameEntry[] {
  const byWord = new Map(kinds.flatMap((k) => [[k.id.toLowerCase(), k.label], [k.label.toLowerCase(), k.label]]))
  const entries: NameEntry[] = []
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const colon = trimmed.indexOf(":")
    let kindLabel = fallbackKind
    let rest = trimmed
    if (colon > 0) {
      const word = trimmed.slice(0, colon).trim().toLowerCase()
      const known = byWord.get(word)
      if (known) {
        kindLabel = known
        rest = trimmed.slice(colon + 1)
      }
    }
    const names = rest.split(",").map((n) => n.trim()).filter(Boolean)
    if (names.length) entries.push({ kindLabel, names })
  }
  return entries
}

/** Matches any label this module writes, for highlighting in the preview. */
export const LABEL_PATTERN = /\[(?:[A-Z][A-Za-z]*(?: [a-z]+)?) \d+\]/g
