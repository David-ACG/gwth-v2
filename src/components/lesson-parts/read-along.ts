/**
 * Read-along for "Read or listen" (bead gwth-launch-hqyp), ported from the
 * Lesson 10 prototype (GWTH-launch-plan/completion/lesson-formats/common.js).
 *
 * The audio reads the part's text word for word; Kokoro's word timings say
 * when each spoken word starts. `alignWords` maps every spoken token to a
 * rendered word, tolerating the small differences the voice introduces
 * (numbers read out, words changed by the pronunciation dictionary).
 */

/** Lowercase letters and digits only, accents folded. */
export function normWord(s: string): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]/g, "")
}

/**
 * Weighted longest common subsequence: exact matches score 3, prefix
 * matches (amount / amounts) score 1. Spoken tokens with no match are spread
 * over the rendered words between their matched neighbours, so one skipped or
 * altered word never derails the sync. Returns token index -> word index.
 */
export function alignWords(tokens: string[], words: string[]): number[] {
  const n = tokens.length
  const m = words.length
  if (!n || !m) return tokens.map(() => 0)
  const score = (a: string, b: string): number => {
    if (!a || !b) return 0
    if (a === b) return 3
    if (a.length >= 3 && b.length >= 3 && (b.startsWith(a) || a.startsWith(b))) return 1
    return 0
  }
  const W = m + 1
  const D = new Int32Array((n + 1) * W)
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      let best = D[(i - 1) * W + j]!
      const left = D[i * W + j - 1]!
      if (left > best) best = left
      const s = score(tokens[i - 1]!, words[j - 1]!)
      if (s && D[(i - 1) * W + j - 1]! + s > best) best = D[(i - 1) * W + j - 1]! + s
      D[i * W + j] = best
    }
  }
  const map = new Array<number>(n).fill(-1)
  let i = n
  let j = m
  while (i > 0 && j > 0) {
    const s = score(tokens[i - 1]!, words[j - 1]!)
    if (s && D[i * W + j] === D[(i - 1) * W + j - 1]! + s) {
      map[i - 1] = j - 1
      i--
      j--
    } else if (D[(i - 1) * W + j]! >= D[i * W + j - 1]!) i--
    else j--
  }
  let k = 0
  while (k < n) {
    if (map[k]! >= 0) {
      k++
      continue
    }
    const a = k
    while (k < n && map[k]! < 0) k++
    const prevW = a > 0 ? map[a - 1]! : -1
    const nextW = k < n ? map[k]! : m
    const gap = nextW - prevW - 1
    const cnt = k - a
    for (let t = 0; t < cnt; t++) {
      map[a + t] = gap > 0 ? prevW + 1 + Math.floor((t * gap) / cnt) : Math.max(0, Math.min(m - 1, prevW < 0 ? 0 : prevW))
    }
  }
  return map
}

/** Index of the last token starting at or before `t` (binary search). */
export function tokenAt(starts: number[], t: number): number {
  let lo = 0
  let hi = starts.length - 1
  let ans = -1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (starts[mid]! <= t + 0.02) {
      ans = mid
      lo = mid + 1
    } else hi = mid - 1
  }
  return ans
}

/**
 * Wrap every word in the text nodes under `root` in <span class={cls}>.
 * `skip(el)` returns true for elements whose text must stay untouched.
 * Idempotent: an already-wrapped root returns its existing spans.
 */
export function wrapWords(root: HTMLElement, cls: string, skip?: (el: Element) => boolean): HTMLSpanElement[] {
  if (root.dataset.wrapped === "1") {
    return Array.from(root.querySelectorAll<HTMLSpanElement>(`span.${CSS.escape(cls)}`))
  }
  const spans: HTMLSpanElement[] = []
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const value = node.nodeValue ?? ""
      const pieces = value.split(/(\s+)/)
      if (pieces.length === 1 && !(pieces[0] ?? "").trim()) return
      const frag = document.createDocumentFragment()
      for (const piece of pieces) {
        if (!piece) continue
        if (/^\s+$/.test(piece)) {
          frag.appendChild(document.createTextNode(piece))
          continue
        }
        const span = document.createElement("span")
        span.className = cls
        span.textContent = piece
        frag.appendChild(span)
        spans.push(span)
      }
      node.parentNode?.replaceChild(frag, node)
      return
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return
    if (skip?.(node as Element)) return
    Array.from(node.childNodes).forEach(walk)
  }
  walk(root)
  root.dataset.wrapped = "1"
  return spans
}
