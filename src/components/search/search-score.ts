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
 * So: every word of the query must appear IN the title, and a word that
 * matches a whole word beats one that matches the start of a word, which beats
 * one buried mid-word. Nothing else survives.
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
    const index = haystack.indexOf(token)
    if (index === -1) return 0

    let score: number
    if (words.includes(token)) {
      score = 1 // a whole word: "test" in "Trust Test"
    } else if (words.some((word) => word.startsWith(token))) {
      score = 0.7 // the start of a word: "spread" in "Spreadsheet"
    } else {
      score = 0.4 // buried inside one: "heet" in "Spreadsheet"
    }

    // Earlier in the title is the better match, but only as a tie-break: the
    // tiers are spaced so position can never lift a weaker kind of match above
    // a stronger one.
    score -= Math.min(index / haystack.length, 1) * POSITION_WEIGHT
    total += score
  }

  const averaged = total / tokens.length
  // A title that opens with exactly what was typed is the one being looked for.
  const bonus = haystack.startsWith(needle) ? POSITION_WEIGHT : 0

  return Math.min(1, Math.max(averaged + bonus, 0.01))
}
