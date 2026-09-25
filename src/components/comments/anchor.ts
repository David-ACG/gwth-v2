/**
 * Anchor helpers for the comment layer (bead gwth-launch-8ksq).
 *
 * Pure DOM helpers, no React: they turn a text selection or a clicked picture
 * into the fields of a NewPageComment, so a comment can be found again on the
 * page later. The selector logic is ported from the review-annotate overlay
 * (GWTH-launch-plan/review-annotate/static/overlay.js, selectorFor/excerptOf).
 */

import {
  LESSON_DATA_ATTRS,
  LESSON_VARIANTS,
  LESSON_VIEWER_SELECTOR,
  QUOTE_MAX_LENGTH,
  type CommentShape,
  type LessonVariant,
  type NewPageComment,
} from "@/lib/comments/types"

export const PREFIX_SUFFIX_CHARS = 80
export const CONTEXT_CHARS = 260
export const MIN_IMAGE_SIZE = 48

/** Where the layer never offers the Comment button: site chrome and itself. */
export const EXCLUDED_SELECTOR =
  'header, nav, footer, [data-section="site-header"], [data-comment-layer]'

/** Where a selection or a picture can be commented on. */
export const COMMENTABLE_SELECTOR = `main, ${LESSON_VIEWER_SELECTOR}`

const BLOCK_SELECTOR =
  "p, li, h1, h2, h3, h4, h5, h6, blockquote, td, th, figcaption, figure, dd, dt, pre, section, article, div, main"

const CONTEXT_CONTAINER_SELECTOR = `article, section, ${LESSON_VIEWER_SELECTOR}, main`

export type SelectorKind = NonNullable<NewPageComment["selectorKind"]>

export interface SelectorInfo {
  selector: string
  selectorKind: SelectorKind
}

export type TextCapture = Pick<
  NewPageComment,
  "quote" | "quotePrefix" | "quoteSuffix" | "selector" | "selectorKind" | "heading" | "context"
>

export type AreaCapture = Pick<NewPageComment, "selector" | "selectorKind" | "heading" | "context">

export type ImageCapture = Pick<
  NewPageComment,
  "quote" | "selector" | "selectorKind" | "heading" | "context" | "imageSrc" | "imageAlt"
>

export interface LessonContext {
  lessonId?: string
  lessonPage?: number
  lessonPageTitle?: string
  lessonVariant?: LessonVariant
  draftAvailable: boolean
}

/** Collapse every run of whitespace to one space and trim the ends. */
export function normaliseText(text: string | null | undefined): string {
  return collapse(text).trim()
}

function collapse(text: string | null | undefined): string {
  return String(text ?? "").replace(/\s+/g, " ")
}

function escapeIdent(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value)
  }
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&")
}

function isUniqueId(el: Element, doc: Document): boolean {
  if (!el.id) return false
  try {
    return doc.querySelectorAll(`#${escapeIdent(el.id)}`).length === 1
  } catch {
    return false
  }
}

/**
 * A stable CSS selector for an element: a unique id first, then a unique
 * data-testid, then a tag:nth-of-type path that stops at the first unique id.
 * Class names are never used: they are build-hashed and change on every
 * rebuild, which would strand every comment.
 */
export function selectorFor(node: Element | null | undefined): SelectorInfo {
  const doc = node?.ownerDocument ?? document
  if (!node || node === doc.documentElement) {
    return { selector: "html", selectorKind: "root" }
  }
  if (isUniqueId(node, doc)) {
    return { selector: `#${escapeIdent(node.id)}`, selectorKind: "id" }
  }
  const testid = node.getAttribute("data-testid")
  if (testid) {
    const sel = `[data-testid="${testid.replace(/"/g, '\\"')}"]`
    try {
      if (doc.querySelectorAll(sel).length === 1) {
        return { selector: sel, selectorKind: "testid" }
      }
    } catch {
      // An odd test id that is not a valid selector falls through to the path.
    }
  }
  const parts: string[] = []
  let cur: Element | null = node
  while (cur && cur.nodeType === 1 && cur !== doc.documentElement) {
    if (isUniqueId(cur, doc)) {
      parts.unshift(`#${escapeIdent(cur.id)}`)
      break
    }
    let index = 1
    let sib = cur.previousElementSibling
    while (sib) {
      if (sib.tagName === cur.tagName) index++
      sib = sib.previousElementSibling
    }
    parts.unshift(`${cur.tagName.toLowerCase()}:nth-of-type(${index})`)
    cur = cur.parentElement
  }
  return { selector: parts.join(" > "), selectorKind: "path" }
}

function elementOf(node: Node | null): Element | null {
  if (!node) return null
  return node.nodeType === 1 ? (node as Element) : node.parentElement
}

/** True when the node sits in site chrome or inside the comment layer. */
export function isExcluded(node: Node | null): boolean {
  const el = elementOf(node)
  return !!el?.closest(EXCLUDED_SELECTOR)
}

/** True when the node is inside the page body (main or the lesson viewer). */
export function isCommentable(node: Node | null): boolean {
  const el = elementOf(node)
  if (!el) return false
  return !!el.closest(COMMENTABLE_SELECTOR) && !isExcluded(el)
}

/** Nearest h1-h3 that comes before the node (or contains it). */
export function headingFor(node: Node | null): string | undefined {
  if (!node) return undefined
  const doc = node.ownerDocument ?? document
  const headings = Array.from(doc.querySelectorAll("h1, h2, h3"))
  let found: Element | undefined
  for (const h of headings) {
    if (h.closest("[data-comment-layer]")) continue
    if (h === node) {
      found = h
      continue
    }
    const pos = h.compareDocumentPosition(node)
    if (pos & Node.DOCUMENT_POSITION_FOLLOWING || pos & Node.DOCUMENT_POSITION_CONTAINED_BY) {
      found = h
    } else {
      break
    }
  }
  const text = found ? normaliseText(found.textContent) : ""
  return text || undefined
}

/** Text of `container` before and after a point, taken with a Range. */
function textAround(container: Element, start: Node, startOffset: number, end: Node, endOffset: number) {
  const doc = container.ownerDocument ?? document
  const before = doc.createRange()
  before.selectNodeContents(container)
  const after = doc.createRange()
  after.selectNodeContents(container)
  try {
    before.setEnd(start, startOffset)
    after.setStart(end, endOffset)
  } catch {
    return { before: "", after: "" }
  }
  return { before: before.toString(), after: after.toString() }
}

function clip(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) : text
}

function contextFrom(before: string, middle: string, after: string): string | undefined {
  const b = collapse(before)
  const a = collapse(after)
  const text = normaliseText(
    `${b.slice(Math.max(0, b.length - CONTEXT_CHARS))}${middle}${a.slice(0, CONTEXT_CHARS)}`,
  )
  return text || undefined
}

/** Everything a text comment needs, read from a live Range. */
export function captureSelection(range: Range): TextCapture {
  const quote = clip(normaliseText(range.toString()), QUOTE_MAX_LENGTH)
  const startEl = elementOf(range.startContainer)
  const common = elementOf(range.commonAncestorContainer)
  const block = common?.closest(BLOCK_SELECTOR) ?? common ?? startEl

  let quotePrefix: string | undefined
  let quoteSuffix: string | undefined
  if (block) {
    const { before, after } = textAround(
      block,
      range.startContainer,
      range.startOffset,
      range.endContainer,
      range.endOffset,
    )
    const b = collapse(before).trimStart()
    const a = collapse(after).trimEnd()
    quotePrefix = b.slice(Math.max(0, b.length - PREFIX_SUFFIX_CHARS)) || undefined
    quoteSuffix = a.slice(0, PREFIX_SUFFIX_CHARS) || undefined
  }

  let context: string | undefined
  const container = (block ?? startEl)?.closest(CONTEXT_CONTAINER_SELECTOR) ?? block
  if (container) {
    const { before, after } = textAround(
      container,
      range.startContainer,
      range.startOffset,
      range.endContainer,
      range.endOffset,
    )
    context = contextFrom(before, ` ${quote} `, after)
  }

  const { selector, selectorKind } = selectorFor(block)
  return {
    quote,
    quotePrefix,
    quoteSuffix,
    selector,
    selectorKind,
    heading: headingFor(range.startContainer),
    context,
  }
}

function fileNameOf(src: string): string {
  const clean = src.split(/[?#]/)[0] ?? ""
  return clean.split("/").pop() ?? ""
}

/** Everything a picture comment needs. The quote is its alt text. */
export function captureImage(img: HTMLImageElement): ImageCapture {
  const imageSrc = img.currentSrc || img.getAttribute("src") || img.src || undefined
  const imageAlt = normaliseText(img.getAttribute("alt")) || undefined
  const quote = clip(imageAlt ?? fileNameOf(imageSrc ?? ""), QUOTE_MAX_LENGTH) || undefined

  let context: string | undefined
  const container = img.closest(CONTEXT_CONTAINER_SELECTOR) ?? img.parentElement
  if (container && img.parentNode) {
    const parent = img.parentNode
    const index = Array.prototype.indexOf.call(parent.childNodes, img) as number
    const { before, after } = textAround(container, parent, index, parent, index + 1)
    const caption = normaliseText(img.closest("figure")?.querySelector("figcaption")?.textContent)
    context = contextFrom(before, ` ${caption || ""} `, after)
  }

  const { selector, selectorKind } = selectorFor(img)
  return {
    quote,
    selector,
    selectorKind,
    heading: headingFor(img),
    context,
    imageSrc,
    imageAlt,
  }
}

/** True for a picture worth commenting on: not a logo, avatar or icon. */
export function isCommentableImage(target: EventTarget | null): target is HTMLImageElement {
  if (!target || !(target as Element).tagName) return false
  const el = target as Element
  if (el.tagName !== "IMG") return false
  if (!isCommentable(el)) return false
  const rect = el.getBoundingClientRect()
  const img = el as HTMLImageElement
  const w = rect.width || img.width || img.naturalWidth || 0
  const h = rect.height || img.height || img.naturalHeight || 0
  return w >= MIN_IMAGE_SIZE && h >= MIN_IMAGE_SIZE
}

/** The lesson viewer's data attributes, or null when this is not a lesson. */
export function readLessonContext(root: ParentNode = document): LessonContext | null {
  const viewer = root.querySelector(LESSON_VIEWER_SELECTOR)
  if (!viewer) return null
  const lessonId = viewer.getAttribute(LESSON_DATA_ATTRS.id) || undefined
  const pageRaw = Number.parseInt(viewer.getAttribute(LESSON_DATA_ATTRS.page) ?? "", 10)
  const lessonPage = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : undefined
  const lessonPageTitle = normaliseText(viewer.getAttribute(LESSON_DATA_ATTRS.pageTitle)) || undefined
  const variantRaw = viewer.getAttribute(LESSON_DATA_ATTRS.variant)
  const lessonVariant = (LESSON_VARIANTS as readonly string[]).includes(variantRaw ?? "")
    ? (variantRaw as LessonVariant)
    : undefined
  const draftAvailable = viewer.getAttribute(LESSON_DATA_ATTRS.draftAvailable) === "1"
  if (!lessonId && !lessonPage && !lessonVariant) return null
  return { lessonId, lessonPage, lessonPageTitle, lessonVariant, draftAvailable }
}

/** "Lesson 1" for m1_l01, "Month 2, lesson 3" for m2_l03. */
export function lessonLabel(lessonId: string | undefined): string | undefined {
  if (!lessonId) return undefined
  const m = /^m(\d+)_l(\d+)/i.exec(lessonId)
  if (!m) return lessonId
  const month = Number(m[1])
  const lesson = Number(m[2])
  return month <= 1 ? `Lesson ${lesson}` : `Month ${month}, lesson ${lesson}`
}

/* ------------------------------------------------------------------------ */
/* Shapes and places: where a mark sits, ported from review-annotate's       */
/* buildAnchor and placeOf (overlay.js). Every rect here is in viewport      */
/* coordinates, as getBoundingClientRect gives them; the layer converts.     */
/* ------------------------------------------------------------------------ */

export interface RectLike {
  x: number
  y: number
  w: number
  h: number
}

export type ShapeRel = CommentShape["rel"]

/** The range the API accepts for a shape fraction (validation.ts relNumber). */
export const REL_MIN = -1
export const REL_MAX = 2
export const MARK_SIZE = 22

export function rectOf(el: Element): RectLike {
  const r = el.getBoundingClientRect()
  return { x: r.left, y: r.top, w: r.width, h: r.height }
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000
}

/** `target` as fractions of `box`, which is what buildAnchor stores as rel. */
export function relShape(kind: CommentShape["kind"], box: RectLike, target: RectLike): CommentShape {
  const w = Math.max(box.w, 1)
  const h = Math.max(box.h, 1)
  return {
    kind,
    rel: {
      x: round4((target.x - box.x) / w),
      y: round4((target.y - box.y) / h),
      w: round4(target.w / w),
      h: round4(target.h / h),
    },
  }
}

export function relFits(rel: ShapeRel): boolean {
  return [rel.x, rel.y, rel.w, rel.h].every((n) => Number.isFinite(n) && n >= REL_MIN && n <= REL_MAX)
}

export function clampRel(rel: ShapeRel): ShapeRel {
  const c = (n: number) => (Number.isFinite(n) ? Math.min(REL_MAX, Math.max(REL_MIN, n)) : 0)
  return { x: c(rel.x), y: c(rel.y), w: c(rel.w), h: c(rel.h) }
}

/**
 * The element a drawn box is pinned to. It starts with the element under the
 * box centre and widens to its parents until the box fits the range the API
 * accepts, so a box drawn across a whole section is pinned to the section and
 * not to the one word under its middle.
 */
export function anchorForBox(start: Element, box: RectLike): { element: Element; shape: CommentShape } {
  const doc = start.ownerDocument ?? document
  let el: Element | null = start
  while (el && el !== doc.documentElement) {
    const shape = relShape("box", rectOf(el), box)
    if (relFits(shape.rel)) return { element: el, shape }
    el = el.parentElement
  }
  const shape = relShape("box", rectOf(start), box)
  return { element: start, shape: { kind: "box", rel: clampRel(shape.rel) } }
}

/** Everything an area comment needs: where it is and the words around it. */
export function captureArea(el: Element): AreaCapture {
  const { selector, selectorKind } = selectorFor(el)
  const text = normaliseText(el.textContent)
  return {
    selector,
    selectorKind,
    heading: headingFor(el),
    context: text ? clip(text, CONTEXT_CHARS * 2) : undefined,
  }
}

/** Client rects of a range; jsdom and detached ranges fall back to the end element. */
export function rangeRects(range: Range): RectLike[] {
  if (typeof range.getClientRects === "function") {
    const list = Array.from(range.getClientRects())
      .filter((r) => r.width > 0 && r.height > 0)
      .map((r) => ({ x: r.left, y: r.top, w: r.width, h: r.height }))
    if (list.length > 0) return list
  }
  const el = elementOf(range.endContainer)
  return el ? [rectOf(el)] : []
}

/** The tag a tag:nth-of-type path ends with, or null for id and test id selectors. */
export function expectedTag(selector: string | undefined): string | null {
  if (!selector) return null
  const m = /(?:^|>\s*)([a-z][a-z0-9-]*):nth-of-type\(\d+\)\s*$/i.exec(selector)
  return m ? m[1]!.toLowerCase() : null
}

/** Where comments may be found again: the lesson viewer, else main, else the body. */
function searchRoot(doc: Document): Element | null {
  return doc.querySelector(LESSON_VIEWER_SELECTOR) ?? doc.querySelector("main") ?? doc.body
}

/**
 * The first place the (whitespace-normalised) quote appears in the page text,
 * as a live Range, or null. Text in site chrome and in the layer is skipped.
 */
export function findQuoteRange(quote: string | undefined, doc: Document = document): Range | null {
  const wanted = normaliseText(quote)
  const root = searchRoot(doc)
  if (!wanted || !root) return null
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let chars = ""
  const at: { node: Text; offset: number }[] = []
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const node = n as Text
    if (isExcluded(node)) continue
    const data = node.data
    for (let i = 0; i < data.length; i++) {
      const ch = data[i]!
      if (/\s/.test(ch)) {
        if (chars.length === 0 || chars.endsWith(" ")) continue
        chars += " "
      } else {
        chars += ch
      }
      at.push({ node, offset: i })
    }
  }
  const index = chars.indexOf(wanted)
  if (index < 0) return null
  const first = at[index]!
  const last = at[index + wanted.length - 1]!
  const range = doc.createRange()
  try {
    range.setStart(first.node, first.offset)
    range.setEnd(last.node, last.offset + 1)
  } catch {
    return null
  }
  return range
}

function safeQuery(doc: Document, selector: string | undefined): Element | null {
  if (!selector) return null
  try {
    return doc.querySelector(selector)
  } catch {
    return null
  }
}

export type PlaceableComment = Pick<
  NewPageComment,
  "selector" | "targetType" | "quote" | "shape" | "imageAlt" | "textEdit"
>

/** True when the element found by the selector is still the thing the comment is about. */
function stillMatches(el: Element, c: PlaceableComment): boolean {
  const tag = expectedTag(c.selector)
  if (tag && el.tagName.toLowerCase() !== tag) return false
  if (c.targetType === "image") return el.tagName === "IMG"
  if (c.targetType === "text") {
    const text = normaliseText(el.textContent)
    const quote = normaliseText(c.quote)
    const original = normaliseText(c.textEdit?.original)
    if (quote && text.includes(quote)) return true
    if (original && text.includes(original)) return true
    return !quote && !original
  }
  return true
}

/**
 * Where a comment's mark belongs now, in viewport coordinates, or null when
 * the page no longer holds it (then no mark is drawn). The anchored element
 * wins when it can still be found and still holds the quote; otherwise the
 * quote's first match in the page text is used.
 */
export function placeOf(c: PlaceableComment, doc: Document = document): RectLike | null {
  const el = safeQuery(doc, c.selector)
  if (el && el !== doc.documentElement && stillMatches(el, c)) {
    const box = rectOf(el)
    const w = Math.max(box.w, 1)
    const h = Math.max(box.h, 1)
    const rel = c.shape?.rel ?? { x: 0, y: 0, w: 1, h: 1 }
    return { x: box.x + rel.x * w, y: box.y + rel.y * h, w: rel.w * w, h: rel.h * h }
  }
  if (c.targetType === "image" && c.imageAlt) {
    const root = searchRoot(doc)
    const img = Array.from(root?.querySelectorAll("img") ?? []).find(
      (i) => normaliseText(i.getAttribute("alt")) === c.imageAlt,
    )
    if (img) return rectOf(img)
  }
  if (c.targetType === "text") {
    const range = findQuoteRange(c.quote, doc) ?? findQuoteRange(c.textEdit?.original, doc)
    if (range) {
      const rects = rangeRects(range)
      return rects[rects.length - 1] ?? null
    }
  }
  return null
}

/**
 * The top-left of a 22px mark for a place: just past its right edge, level
 * with a line of text or the top of a taller box, kept inside the window.
 */
export function markSpot(place: RectLike, viewportWidth: number): { left: number; top: number } {
  const top = place.h <= MARK_SIZE * 2 ? place.y + place.h / 2 - MARK_SIZE / 2 : place.y
  let left = place.x + place.w + 4
  if (left + MARK_SIZE > viewportWidth - 4) left = place.x + place.w - MARK_SIZE - 4
  left = Math.max(4, Math.min(left, viewportWidth - MARK_SIZE - 4))
  return { left, top }
}
