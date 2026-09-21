/**
 * Relevance for the Cmd+K palette (gwth-launch-4fg).
 *
 * cmdk's default scorer matches a SUBSEQUENCE: the letters of the query in
 * order, anywhere, with anything in between. On this catalogue that is close
 * to useless. Typing "spread", looking for "The Spreadsheet Trust Test", put
 * six unrelated lessons above it - "Agents Superpower AI That Can Do Things
 * for You" matches because it contains s...p...r...e...a...d spread across
 * four words. A search whose first answer is the wrong one is not much better
 * than the search that did nothing.
 *
 * So: every word of the query must be accounted for in the title, and a word
 * that matches a whole word beats one that matches the start of a word, beats
 * a plural or tense of a word that IS there, beats one buried mid-word.
 * Nothing else survives.
 */

/**
 * How much earlier-in-the-title is worth. Deliberately smaller than the gap
 * between two match tiers, so it only ever breaks ties.
 */
const POSITION_WEIGHT = 0.05

/** Lowercases and reduces punctuation to single spaces, both sides alike. */
function normalise(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

/**
 * The longest suffix an inflection may add. Covers the endings people
 * actually type - "prompt" -> "prompts", "meeting" -> "meetings",
 * "test" -> "testing" - while stopping a long word from latching onto a short
 * one it merely begins with ("prompts" must not match a title word "pro").
 */
const MAX_INFLECTION = 3

/** The shortest title word an inflected query may match back to. */
const MIN_STEM = 3

/** How well one typed word matches the title, and where. */
interface TokenMatch {
  /** Match quality: whole word, start of a word, inflection, or buried. */
  tier: number
  /** Where it landed, for the position tie-break. */
  index: number
}

/**
 * Finds the best way one typed word matches the title, or null for no match
 * at all, which removes the entry.
 *
 * The inflection tier exists because the first version had none: every word
 * had to appear literally, so a learner typing "prompts", "emails" or
 * "hallucinations" was told nothing matched while three lessons and two labs
 * about exactly that sat in the index. A search that answers "nothing" to a
 * word printed on the page is the same complaint the learner started with
 * (gwth-launch-4fg). It sits below the two literal tiers and above a buried
 * match, because a singular the learner pluralised is a better answer than a
 * fragment found mid-word.
 */
function matchToken(
  words: string[],
  haystack: string,
  token: string
): TokenMatch | null {
  const index = haystack.indexOf(token)
  if (index !== -1) {
    if (words.includes(token)) return { tier: 1, index } // "test" in "Trust Test"
    if (words.some((word) => word.startsWith(token))) {
      return { tier: 0.7, index } // "spread" in "Spreadsheet"
    }
    return { tier: 0.4, index } // "heet" in "Spreadsheet"
  }

  // Nothing literal. The typed word may be a longer form of one in the title:
  // take the longest such word, so "spreadsheets" prefers "spreadsheet".
  const stem = words
    .filter(
      (word) =>
        word.length >= MIN_STEM &&
        token.startsWith(word) &&
        token.length - word.length <= MAX_INFLECTION
    )
    .sort((a, b) => b.length - a.length)[0]

  return stem ? { tier: 0.5, index: haystack.indexOf(stem) } : null
}

/**
 * Scores one entry against the typed query.
 *
 * Returns 0 for "do not show this", and a value in (0, 1] otherwise - cmdk
 * hides anything scoring 0 and orders the rest by score descending.
 */
export function scoreSearchEntry(title: string, query: string): number {
  const haystack = normalise(title)
  const needle = normalise(query)

  if (!needle) return 1
  if (!haystack) return 0

  const words = haystack.split(" ")
  const tokens = needle.split(" ")

  let total = 0
  for (const token of tokens) {
    const match = matchToken(words, haystack, token)
    if (!match) return 0

    // Earlier in the title is the better match, but only as a tie-break: the
    // tiers are spaced so position can never lift a weaker kind of match above
    // a stronger one.
    total += match.tier - Math.min(match.index / haystack.length, 1) * POSITION_WEIGHT
  }

  const averaged = total / tokens.length
  // A title that opens with exactly what was typed is the one being looked for.
  const bonus = haystack.startsWith(needle) ? POSITION_WEIGHT : 0

  return Math.min(1, Math.max(averaged + bonus, 0.01))
}
