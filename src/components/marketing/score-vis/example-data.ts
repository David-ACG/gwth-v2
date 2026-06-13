/**
 * EXAMPLE DATA — REPLACE WHEN SCORING IS LIVE.
 * Beads: bd show beads_GWTH-w5y (track replacement under follow-up).
 *
 * Numbers here are illustrative only. Used by the homepage hero device
 * and the standalone ScoreVis demo so the widget can render without a
 * real scoring backend. The "Example score" pill rendered inside the
 * widget and the figcaption beneath the device ensure visitors are not
 * misled into reading these as real assessment outcomes.
 */

/**
 * Default example score — sits at 104 to land in the "Top 1%" subtitle
 * with the sparkline showing recent slip from a higher peak. This tells
 * the most expressive story for a 5-second hero glance: visitor sees a
 * passing score (top 1%), notices the curve trending down, and
 * intuitively understands the "Stay Current" pitch.
 */
export const EXAMPLE_SCORE_VALUE = 104

/**
 * 3-month history (12 weekly points) showing earn-up to ~118 (top 0.5%)
 * then a slip back to 104 today. Last point stays above the pass-line
 * so the default render is "Top 1%" not "Slipping". Decay-state coverage
 * lives in the test file via synthetic histories.
 */
export const EXAMPLE_SCORE_HISTORY: readonly number[] = [
  55, 68, 80, 90, 98, 108, 116, 118, 116, 112, 108, 104,
]

export const EXAMPLE_SUB_SCORES = [
  { label: "Foundations", value: 104 },
  { label: "Building", value: 96 },
  { label: "Capstones", value: 82 },
  { label: "Currentness", value: 88 },
] as const
