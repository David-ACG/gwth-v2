/**
 * Small pure helpers and fixed wording for the Model Lab pages, kept out of
 * `lib/data/model-lab.ts` (which is server-only, because it carries every
 * answer) so the lab's client components can use them too.
 */

/**
 * A set-up's thinking level as the pages say it: "standard", or "medium
 * thinking" for every other level.
 */
export function levelLabel(level: string): string {
  return level === "standard" ? "standard" : `${level === "xhigh" ? "extra-high" : level} thinking`
}

const MONTH = new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "UTC" })

function parts(iso: string): { day: number; month: string; year: number } {
  const date = new Date(`${iso}T00:00:00Z`)
  return {
    day: date.getUTCDate(),
    month: MONTH.format(date),
    year: date.getUTCFullYear(),
  }
}

/**
 * Formats a test date range in British style: "2 to 21 October 2026",
 * "30 September to 4 October 2026", or "2 October 2026" for a single day.
 * No dashes, by house rule.
 */
export function formatTestedRange(from: string, to: string): string {
  const a = parts(from)
  const b = parts(to)
  if (from === to) return `${a.day} ${a.month} ${a.year}`
  if (a.year !== b.year) {
    return `${a.day} ${a.month} ${a.year} to ${b.day} ${b.month} ${b.year}`
  }
  if (a.month !== b.month) {
    return `${a.day} ${a.month} to ${b.day} ${b.month} ${b.year}`
  }
  return `${a.day} to ${b.day} ${b.month} ${b.year}`
}

/**
 * Formats the month a range falls in, e.g. "October 2026", or "September and
 * October 2026" when it spans two months of one year.
 */
export function formatTestedMonth(from: string, to: string): string {
  const a = parts(from)
  const b = parts(to)
  if (a.year !== b.year) return `${a.month} ${a.year} to ${b.month} ${b.year}`
  if (a.month !== b.month) return `${a.month} and ${b.month} ${b.year}`
  return `${a.month} ${a.year}`
}

/** Small numbers as words, as the lab pages write them. */
const NUMBER_WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight"]

/**
 * A count as a word up to eight ("four"), else as digits.
 */
export function countWord(n: number): string {
  return NUMBER_WORDS[n] ?? String(n)
}

/**
 * "How we test", shown on every lab page and on the index. Ported word for
 * word from the Model Lab preview David reviewed (lab/site/template.html).
 */
export const MODEL_LAB_HOW_WE_TEST: readonly string[] = [
  "We used 25 tasks across six labs, based on real work, such as a small business post, a staff absence report or a week of emails to sort out.",
  "Each task hides a trap that a careful person would catch, such as an out-of-date figure or a false legal claim. Falling for it is shown in red, whatever the score.",
  "Computer checks mark what can be checked exactly, such as figures and dates. AI judges mark the rest against a written guide, and no judge marks its own company's work: Claude marks OpenAI's answers, GPT marks Anthropic's, and both mark everyone else's.",
  "A person at GWTH checked a sample of the marks by reading the answers to each task side by side.",
]

const ORDINALS = ["first", "second", "third", "fourth", "fifth", "sixth"]

/**
 * A place as a word: 1 is "first", up to "sixth", else "7th".
 */
export function ordinalWord(n: number): string {
  return ORDINALS[n - 1] ?? `${n}th`
}
