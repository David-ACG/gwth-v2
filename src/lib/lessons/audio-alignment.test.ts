import { describe, expect, it } from "vitest"
import {
  alignPagesToAudio,
  alignWords,
  estimatePageStarts,
  spokenWords,
  timestampsUrlFor,
  type AudioWord,
} from "./audio-alignment"

/** Builds a word-timing stream from a sentence, one second per word. */
function timings(sentence: string, from = 0): AudioWord[] {
  return sentence
    .split(/\s+/)
    .filter(Boolean)
    .map((word, i) => ({ word, start: from + i, end: from + i + 1 }))
}

describe("timestampsUrlFor", () => {
  it("points at the sidecar the pipeline writes beside the audio", () => {
    expect(
      timestampsUrlFor("https://media.gwth.ai/lessons/m1_l01/audio/kokoro_main.wav")
    ).toBe(
      "https://media.gwth.ai/lessons/m1_l01/audio/kokoro_main_timestamps.json"
    )
  })

  it("keeps a query string on the end", () => {
    expect(timestampsUrlFor("/a/b/main.mp3?v=2")).toBe(
      "/a/b/main_timestamps.json?v=2"
    )
  })

  it("returns null when there is no audio, or no known extension", () => {
    expect(timestampsUrlFor(null)).toBeNull()
    expect(timestampsUrlFor("")).toBeNull()
    expect(timestampsUrlFor("https://media.gwth.ai/lessons/m1_l01/audio")).toBeNull()
  })
})

describe("spokenWords", () => {
  /**
   * Matches what the real Kokoro narration does: it reads figure alt text
   * aloud but not fenced code. Keeping alt text is what moved L1's "The six AI
   * superpowers" off the previous section's caption and onto its own heading.
   */
  it("keeps link text and figure alt text, drops fenced code and URLs", () => {
    const words = spokenWords(
      "See the [wishlist guide](https://example.com/guide).\n\n" +
        "![A chart of results](lessons/m1_l01/assets/chart.png)\n\n" +
        "```python\nprint('not spoken')\n```\n\nEnd."
    )
    expect(words).toEqual([
      "see",
      "the",
      "wishlist",
      "guide",
      "a",
      "chart",
      "of",
      "results",
      "end",
    ])
  })
})

describe("alignWords", () => {
  it("times every word of an exact reading", () => {
    const doc = ["the", "six", "superpowers"]
    expect(alignWords(doc, timings("the six superpowers"))).toEqual([0, 1, 2])
  })

  it("resyncs when the narration skips words the page has", () => {
    // The narration never reads the heading "Overview".
    const doc = spokenWords("Overview\n\nThree things are true")
    const times = alignWords(doc, timings("three things are true", 10))
    expect(times[doc.indexOf("three")]).toBe(10)
    expect(times[doc.indexOf("true")]).toBe(13)
  })

  it("resyncs when the narration expands words the page has once", () => {
    // TTS reads "2026" as "twenty twenty six".
    const doc = spokenWords("true in 2026 today")
    const times = alignWords(doc, timings("true in twenty twenty six today"))
    expect(times[0]).toBe(0)
    expect(times[doc.indexOf("today")]).toBe(5)
  })
})

describe("alignPagesToAudio", () => {
  const pages = [
    { content: null, narrated: false }, // intro video
    { content: "## One\n\nalpha bravo charlie", narrated: true },
    { content: "## Two\n\ndelta echo foxtrot", narrated: true },
    { content: "# Project\n\nmake the thing", narrated: false },
    { content: null, narrated: false }, // Q&A
  ]
  const audio = timings("alpha bravo charlie delta echo foxtrot")

  it("gives each narrated page the time its first spoken word lands", () => {
    expect(alignPagesToAudio(pages, audio)).toEqual([null, 0, 3, null, null])
  })

  it("leaves un-narrated pages (video, project, Q&A) without a start", () => {
    const starts = alignPagesToAudio(pages, audio)
    expect(starts[0]).toBeNull()
    expect(starts[3]).toBeNull()
    expect(starts[4]).toBeNull()
  })

  it("never sends the playhead backwards on a mis-aligned page", () => {
    // "delta" also appears on page one, so a naive match would place page two
    // before page one.
    const tricky = [
      { content: "zulu delta", narrated: true },
      { content: "delta echo", narrated: true },
    ]
    const starts = alignPagesToAudio(tricky, timings("zulu delta echo"))
    expect(starts[0]).not.toBeNull()
    expect(starts[1]!).toBeGreaterThanOrEqual(starts[0]!)
  })

  /**
   * The narrator announces each section, so a heading found in order beats the
   * running walk. On L1 the walk put "Demonstration: a council letter" 16s late
   * (the code block in it is not read aloud); the anchor lands it exactly.
   */
  it("prefers the spoken heading over accumulated drift", () => {
    const pages = [
      {
        title: "Overview",
        content: "alpha bravo charlie delta echo",
        narrated: true,
      },
      {
        title: "Demonstration: a council letter",
        content: "let us make this concrete",
        narrated: true,
      },
    ]
    // The narration skips two of page one's words, so a pure walk would carry
    // that drift into page two.
    const audio = timings(
      "overview alpha bravo demonstration a council letter let us make this concrete"
    )
    const starts = alignPagesToAudio(pages, audio)
    expect(starts[0]).toBe(0) // "overview"
    expect(starts[1]).toBe(3) // "demonstration"
  })

  it("ignores a heading the narrator never says", () => {
    const pages = [
      { title: "Overview", content: "alpha bravo", narrated: true },
      { title: "Never Spoken Heading", content: "charlie delta", narrated: true },
    ]
    const starts = alignPagesToAudio(
      pages,
      timings("overview alpha bravo charlie delta")
    )
    // Falls back to the walk: the body's first word, not a wrong anchor.
    expect(starts[1]).toBe(3)
  })

  it("only anchors forwards, so a repeated heading cannot rewind", () => {
    const pages = [
      { title: "The plan", content: "one two", narrated: true },
      { title: "The plan", content: "three four", narrated: true },
    ]
    const starts = alignPagesToAudio(
      pages,
      timings("the plan one two the plan three four")
    )
    expect(starts[0]).toBe(0)
    expect(starts[1]).toBe(4)
  })

  it("starts the first narrated page at zero even with no match at all", () => {
    const starts = alignPagesToAudio(
      [{ content: "nothing in common here", narrated: true }],
      timings("completely different spoken words")
    )
    expect(starts[0]).toBe(0)
  })
})

describe("estimatePageStarts", () => {
  it("splits the duration in proportion to each page's word count", () => {
    const starts = estimatePageStarts(
      [
        { content: "one two three four", narrated: true },
        { content: "five two three four", narrated: true },
      ],
      100
    )
    expect(starts).toEqual([0, 50])
  })

  it("returns no offsets when the duration is unknown", () => {
    expect(
      estimatePageStarts([{ content: "a b c", narrated: true }], 0)
    ).toEqual([null])
  })
})
