/**
 * Maps each page of a lesson onto a start time in the lesson's narration, so
 * pressing play reads the page you are looking at.
 *
 * Before this, the narration was one 32-minute file with a single playhead: it
 * carried on from wherever it happened to be, regardless of which page the
 * reader had moved to. David, 2026-07-26: "The recording always starts from
 * where a student left off. Change it so it starts from the page they are
 * viewing and they can click on a section and it starts from there."
 *
 * The pipeline already emits word-level timings next to the audio
 * (`kokoro_main_timestamps.json`, a flat `[{word,start,end}]`), so the mapping
 * is an alignment problem, not a guess: walk the page text and the spoken word
 * stream together and record where each page's first spoken word lands. The
 * algorithm is the two-sided resync from the L1 read-along demo
 * (GWTH-launch-plan/completion/L1-lesson-demo/build_demo.py), which is already
 * proven against this narration.
 */

/** One entry of the pipeline's word-timing sidecar. */
export interface AudioWord {
  word: string
  start: number
  end?: number
}

/** How far either sequence may run ahead before we give up on a resync. */
const RESYNC_WINDOW = 14

/**
 * Derives the word-timings URL for a narration file: the pipeline writes
 * `<name>_timestamps.json` beside `<name>.wav`. Returns null for a reference
 * with no recognised audio extension.
 */
export function timestampsUrlFor(audioUrl: string | null | undefined): string | null {
  if (!audioUrl) return null
  const match = /^(.*)\.(wav|mp3|m4a|ogg)(\?.*)?$/i.exec(audioUrl)
  if (!match) return null
  return `${match[1]}_timestamps.json${match[3] ?? ""}`
}

/**
 * Reduces markdown to the words a narrator actually speaks, lowercased and
 * split on non-alphanumerics.
 *
 * What the Kokoro narration does and does not read was established by
 * inspecting the real L1 recording against its word timings:
 *   - Figure ALT TEXT IS read aloud, so it is kept. Dropping it cost about 25
 *     unmatched words, more than the resync window, and pushed "The six AI
 *     superpowers" ten seconds into the previous section's caption.
 *   - Fenced code blocks are NOT read as written, so they are dropped.
 *   - Link text is read; the URL is not.
 */
export function spokenWords(markdown: string): string[] {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/~~~[\s\S]*?~~~/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, " $1 ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
  return text.toLowerCase().match(/[a-z0-9]+/g) ?? []
}

/** Normalises a spoken word the same way, dropping anything left empty. */
function normaliseAudioWords(words: AudioWord[]): { word: string; start: number }[] {
  const out: { word: string; start: number }[] = []
  for (const w of words) {
    const cleaned = String(w.word ?? "").toLowerCase().replace(/[^a-z0-9]/g, "")
    if (cleaned) out.push({ word: cleaned, start: Number(w.start) })
  }
  return out
}

/**
 * Aligns a document's words to a narration's words, returning the spoken start
 * time for each document word (null where no confident match was found).
 *
 * The two sequences are near-identical readings of the same text, so the walk
 * is linear with a resync window on BOTH sides: the narration skips things the
 * document has (headings, captions) and expands things it does not ("2026" is
 * spoken as several words), and either side may therefore run ahead.
 */
export function alignWords(
  docWords: string[],
  audioWords: AudioWord[]
): (number | null)[] {
  const audio = normaliseAudioWords(audioWords)
  const times: (number | null)[] = new Array(docWords.length).fill(null)

  let i = 0
  let j = 0
  while (i < docWords.length && j < audio.length) {
    if (docWords[i] === audio[j]!.word) {
      times[i] = audio[j]!.start
      i += 1
      j += 1
      continue
    }
    let resynced = false
    for (let w = 1; w < RESYNC_WINDOW; w += 1) {
      // Words only the document has: the narration skipped them.
      if (i + w < docWords.length && docWords[i + w] === audio[j]!.word) {
        i += w
        resynced = true
        break
      }
      // Words only the narration has: it inserted or expanded them.
      if (j + w < audio.length && docWords[i] === audio[j + w]!.word) {
        j += w
        resynced = true
        break
      }
    }
    if (!resynced) {
      i += 1
      j += 1
    }
  }
  return times
}

/** A page as far as alignment is concerned: narrated pages carry markdown. */
export interface AlignablePage {
  /** The page's markdown, or null/undefined when it is not narrated. */
  content?: string | null
  /**
   * The page's `##` heading. The narrator reads headings aloud, and the
   * section body is stored without its heading line, so the heading has to be
   * supplied here or every page starts a few words late.
   */
  title?: string
  /** False for pages the narration does not cover (video, Q&A, project). */
  narrated: boolean
}

/** Heading words used as an anchor. Two is too loose, four over-fits. */
const ANCHOR_WORDS = 3

/**
 * Finds the first place at or after `from` where the narration says `needle`
 * verbatim. Returns the index into the word stream, or -1.
 */
function findRun(
  audio: { word: string; start: number }[],
  needle: string[],
  from: number
): number {
  if (needle.length === 0) return -1
  outer: for (let i = Math.max(0, from); i + needle.length <= audio.length; i += 1) {
    for (let k = 0; k < needle.length; k += 1) {
      if (audio[i + k]!.word !== needle[k]) continue outer
    }
    return i
  }
  return -1
}

/**
 * Returns the narration start time for each page, or null for pages the
 * narration does not cover. Times are forced to be non-decreasing so a
 * mis-aligned page can never send the playhead backwards.
 */
export function alignPagesToAudio(
  pages: AlignablePage[],
  audioWords: AudioWord[]
): (number | null)[] {
  const audio = normaliseAudioWords(audioWords)
  const docWords: string[] = []
  const wordPage: number[] = []
  pages.forEach((page, index) => {
    if (!page.narrated || !page.content) return
    // Heading first: the narrator reads it, and it is the anchor below.
    for (const word of spokenWords(`${page.title ?? ""} ${page.content}`)) {
      docWords.push(word)
      wordPage.push(index)
    }
  })

  const times = alignWords(docWords, audioWords)

  const starts: (number | null)[] = pages.map(() => null)
  for (let k = 0; k < times.length; k += 1) {
    const page = wordPage[k]!
    const time = times[k]
    if (time !== null && time !== undefined && starts[page] === null) {
      starts[page] = time
    }
  }

  // Heading anchor. The running walk absorbs drift over a whole lesson and can
  // land a section up to ~16s late (measured on L1's "Demonstration: a council
  // letter", where the intervening code block is not read aloud). Each section
  // is also announced verbatim by the narrator, so where the heading is found
  // in order it is a better answer than the walk: on the real L1 narration this
  // takes 10 of 11 sections exact to 11 of 11.
  let cursor = 0
  pages.forEach((page, index) => {
    if (!page.narrated || !page.title) return
    const needle = spokenWords(page.title).slice(0, ANCHOR_WORDS)
    if (needle.length < 2) return
    const found = findRun(audio, needle, cursor)
    if (found === -1) return
    starts[index] = audio[found]!.start
    cursor = found + 1
  })

  // The first narrated page always starts at the top of the recording, even if
  // its opening words were not matched.
  const firstNarrated = pages.findIndex((p) => p.narrated && p.content)
  if (firstNarrated >= 0 && starts[firstNarrated] === null) starts[firstNarrated] = 0

  // Never allow a later page to point earlier than one before it.
  let floor = 0
  for (let index = 0; index < starts.length; index += 1) {
    const start = starts[index]
    if (start === null || start === undefined) continue
    if (start < floor) starts[index] = floor
    else floor = start
  }
  return starts
}

/**
 * Fallback for a lesson whose narration has no word-timing sidecar: split the
 * duration in proportion to each page's word count. Rough, but it still puts
 * the playhead inside the page being read instead of wherever it was left.
 */
export function estimatePageStarts(
  pages: AlignablePage[],
  durationSeconds: number
): (number | null)[] {
  const counts = pages.map((p) =>
    p.narrated && p.content
      ? spokenWords(`${p.title ?? ""} ${p.content}`).length
      : 0
  )
  const total = counts.reduce((sum, n) => sum + n, 0)
  if (!total || !durationSeconds || !Number.isFinite(durationSeconds)) {
    return pages.map(() => null)
  }
  const starts: (number | null)[] = []
  let running = 0
  for (let index = 0; index < pages.length; index += 1) {
    if (!counts[index]) {
      starts.push(null)
      continue
    }
    starts.push((running / total) * durationSeconds)
    running += counts[index]!
  }
  return starts
}
