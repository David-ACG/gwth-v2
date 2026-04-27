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

export const EXAMPLE_SCORE_VALUE = 92

/**
 * 30-day history trending around 92 with a gentle build-up. Values
 * stay above the pass-line so the example renders the "Passing" state
 * by default. Decay-state coverage lives in the test file via
 * synthetic histories.
 */
export const EXAMPLE_SCORE_HISTORY: readonly number[] = [
  78, 80, 81, 79, 82, 83, 85, 84, 86, 88,
  89, 90, 88, 87, 89, 91, 90, 92, 93, 91,
  92, 94, 93, 92, 91, 92, 93, 94, 92, 92,
]

export const EXAMPLE_SUB_SCORES = [
  { label: "Personal AI", value: 92 },
  { label: "Professional", value: 78 },
  { label: "Enterprise", value: 64 },
  { label: "Tech Radar", value: 71 },
] as const
