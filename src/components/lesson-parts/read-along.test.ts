/** Read-along alignment and word wrapping (bead gwth-launch-hqyp). */
import { beforeAll, describe, expect, it } from "vitest"
import { alignWords, normWord, tokenAt, wrapWords } from "./read-along"

const norm = (s: string) => s.split(/\s+/).filter(Boolean).map(normWord)

describe("normWord", () => {
  it("lowercases, strips punctuation and folds accents", () => {
    expect(normWord("Hello,")).toBe("hello")
    expect(normWord("Café")).toBe("cafe")
    expect(normWord("don't")).toBe("dont")
    expect(normWord("20%")).toBe("20")
    expect(normWord("")).toBe("")
  })
})

describe("alignWords", () => {
  it("is the identity when tokens and words match exactly", () => {
    const words = norm("The cat sat on the mat today")
    expect(alignWords(words, words)).toEqual([0, 1, 2, 3, 4, 5, 6])
  })

  it("maps every token to 0 when either side is empty", () => {
    expect(alignWords([], ["a"])).toEqual([])
    expect(alignWords(["a", "b"], [])).toEqual([0, 0])
  })

  it("tolerates an extra spoken word without drifting", () => {
    const words = norm("the cat sat on the mat")
    const tokens = norm("the cat um sat on the mat")
    const map = alignWords(tokens, words)
    expect(map).toEqual([0, 1, 1, 2, 3, 4, 5])
  })

  it("tolerates a missing spoken word without drifting", () => {
    const words = norm("the cat sat quietly on the mat")
    const tokens = norm("the cat sat on the mat")
    const map = alignWords(tokens, words)
    expect(map).toEqual([0, 1, 2, 4, 5, 6])
  })

  it("gap-fills a number read out between its matched neighbours", () => {
    const words = norm("it costs 20 pounds a month")
    const tokens = norm("it costs twenty pounds a month")
    expect(alignWords(tokens, words)).toEqual([0, 1, 2, 3, 4, 5])
  })

  it("spreads several spoken tokens over one rendered number", () => {
    const words = norm("about 25 people came")
    const tokens = norm("about twenty five people came")
    expect(alignWords(tokens, words)).toEqual([0, 1, 1, 2, 3])
  })

  it("matches prefixes (amount / amounts)", () => {
    const words = norm("the amounts vary")
    const tokens = norm("the amount vary")
    expect(alignWords(tokens, words)).toEqual([0, 1, 2])
  })

  it("keeps a long passage in sync after an early mismatch", () => {
    const text = "one two three four five six seven eight nine ten eleven twelve"
    const words = norm(text)
    const tokens = norm(text.replace("three", "tree").replace("nine", ""))
    const map = alignWords(tokens, words)
    // Every later token still lands on its own word.
    expect(map.slice(-3)).toEqual([9, 10, 11])
    expect(map.every((w, i) => i === 0 || w >= map[i - 1]!)).toBe(true)
  })
})

describe("tokenAt", () => {
  const starts = [0, 1, 2.5, 4]

  it("returns -1 before the first token and for an empty list", () => {
    expect(tokenAt(starts, -1)).toBe(-1)
    expect(tokenAt([], 3)).toBe(-1)
  })

  it("returns the last token starting at or before t (with 20ms slack)", () => {
    expect(tokenAt(starts, 0)).toBe(0)
    expect(tokenAt(starts, 0.5)).toBe(0)
    expect(tokenAt(starts, 0.97)).toBe(0)
    expect(tokenAt(starts, 0.985)).toBe(1) // within 20ms of the next start
    expect(tokenAt(starts, 1)).toBe(1)
    expect(tokenAt(starts, 2.49)).toBe(2)
    expect(tokenAt(starts, 4)).toBe(3)
    expect(tokenAt(starts, 999)).toBe(3)
  })

  it("handles a single token", () => {
    expect(tokenAt([2], 1)).toBe(-1)
    expect(tokenAt([2], 2)).toBe(0)
  })
})

describe("wrapWords", () => {
  beforeAll(() => {
    // jsdom has no CSS.escape; browsers do. Only the idempotent path uses it.
    const g = globalThis as unknown as { CSS?: { escape?: (s: string) => string } }
    if (!g.CSS) g.CSS = {}
    if (!g.CSS.escape) g.CSS.escape = (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`)
  })

  function make(html: string): HTMLDivElement {
    const root = document.createElement("div")
    root.innerHTML = html
    return root
  }

  it("wraps each word in a span and preserves the text", () => {
    const root = make("<p>Hello  big\nworld.</p><p>Second <strong>bold</strong> line</p>")
    const before = root.textContent
    const spans = wrapWords(root, "w")
    expect(spans.map((s) => s.textContent)).toEqual(["Hello", "big", "world.", "Second", "bold", "line"])
    expect(spans.every((s) => s.tagName === "SPAN" && s.className === "w")).toBe(true)
    expect(root.textContent).toBe(before)
    expect(root.querySelector("strong span.w")?.textContent).toBe("bold")
    expect(root.dataset.wrapped).toBe("1")
  })

  it("keeps leading, trailing and inner whitespace as text nodes", () => {
    const root = make("<p> a  b </p>")
    wrapWords(root, "w")
    expect(root.querySelector("p")!.innerHTML).toBe(' <span class="w">a</span>  <span class="w">b</span> ')
  })

  it("skips elements for which skip() is true", () => {
    const root = make("<p>Run <code>npm test</code> now</p><figure><figcaption>Cap tion</figcaption></figure>")
    const spans = wrapWords(root, "w", (el) => el.tagName === "CODE" || el.tagName === "FIGURE")
    expect(spans.map((s) => s.textContent)).toEqual(["Run", "now"])
    expect(root.querySelector("code")!.innerHTML).toBe("npm test")
    expect(root.querySelector("figcaption")!.innerHTML).toBe("Cap tion")
  })

  it("is idempotent: a second call returns the same spans without re-wrapping", () => {
    const root = make("<p>one two three</p>")
    const first = wrapWords(root, "w")
    const html = root.innerHTML
    const second = wrapWords(root, "w")
    expect(second).toHaveLength(3)
    second.forEach((s, i) => expect(s).toBe(first[i]))
    expect(root.innerHTML).toBe(html)
    expect(root.querySelectorAll("span span")).toHaveLength(0)
  })

  it("returns no spans for an empty root", () => {
    expect(wrapWords(make(""), "w")).toEqual([])
    expect(wrapWords(make("<p>   </p>"), "w")).toEqual([])
  })
})
