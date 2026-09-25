"use client"

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react"
import { createPortal } from "react-dom"
import { usePathname } from "next/navigation"
import {
  CANNED_ACTIONS,
  COMMENT_MAX_LENGTH,
  LESSON_VIEWER_SELECTOR,
  type CannedCategory,
  type CommentAction,
  type CommentRole,
  type CommentShape,
  type CommentStatus,
  type CommentTextEdit,
  type DraftVerdictRequest,
  type NewPageComment,
  type PageComment,
} from "@/lib/comments/types"
import {
  MARK_SIZE,
  anchorForBox,
  captureArea,
  captureImage,
  captureSelection,
  isCommentable,
  isCommentableImage,
  lessonLabel,
  markSpot,
  normaliseText,
  placeOf,
  rangeRects,
  readLessonContext,
  rectOf,
  relShape,
  type AreaCapture,
  type ImageCapture,
  type LessonContext,
  type RectLike,
  type TextCapture,
} from "./anchor"
import styles from "./comment-layer.module.css"

/**
 * Comment on the real student view (bead gwth-launch-8ksq), the hybrid David
 * chose on 2026-09-25 ("Option 1, go ahead"): the capture and storage of the
 * first build, with the interaction of his review-annotate tool.
 *
 * Mounted by CommentLayerGate for David (admin) and beta testers only. Nothing
 * shows but a small bar at the bottom left until you act: select words or
 * click a picture and a Comment button appears there; turn Box on and drag
 * over the page to mark an area. A compact card opens next to the mark, where
 * one tap on a canned action is enough and words are optional. Saved comments
 * stay on the page as numbered marks.
 */

const LAYER_ATTR = "data-comment-layer"
const OVERLAY_ATTR = "data-comment-overlay"
const STORAGE_KEY = "gwth-comments-on"
const BUTTON_W = 96
const BUTTON_H = 34
const EDGE = 8
const CARD_EDGE = 12
const CARD_GAP = 8
const DRAG_MIN = 6
const SCROLL_END_MS = 150
const SAVED_MS = 2000
/** Things fixed to the bottom of the window that the bar must sit above. */
const AVOID_SELECTOR = `${LESSON_VIEWER_SELECTOR} .sticky.bottom-0, [data-comment-avoid]`

export const STATUS_LABELS: Record<CommentStatus, string> = {
  open: "Open",
  accepted: "Accepted",
  fixed: "Fixed",
  declined: "Not needed",
  asked: "With David",
  withdrawn: "Withdrawn",
}

const COPY = {
  bar: "Comments",
  on: "On",
  off: "Off",
  box: "Box",
  count: (n: number, m: number) => `${n} on this page, ${m} fixed`,
  comment: "Comment",
  heading: "What is wrong here?",
  placeholder: "In your own words (optional if you picked one above)",
  wordsLabel: "In your own words",
  save: "Save",
  editWords: "Edit the words",
  editHint: "Change the words on the page, then press Enter or Save.",
  newWords: "New words",
  cancel: "Cancel",
  close: "Close",
  thisArea: "This area",
  noDescription: "no description",
  saved: "Saved",
  error: "Could not save. Try again.",
  remove: "Remove",
  edit: "edit",
  approveDraft: "Approve draft",
  sendBack: "Send back",
  approveConfirm: "Approve this draft?",
  yes: "Yes",
  no: "No",
  sendBackPlaceholder: "What should change, in your own words",
  sendBackLabel: "What should change",
  approved: "Draft approved.",
  showLive: "Show live",
  sentBack: "Sent back for a rewrite.",
} as const

type FloatingTarget =
  | { kind: "text"; range: Range }
  | { kind: "image"; img: HTMLImageElement }

type Pending =
  | {
      kind: "text"
      capture: TextCapture
      range: Range
      shape: CommentShape
      /** The one text node the selection sits in, when it sits in just one. */
      textNode: Text | null
    }
  | { kind: "image"; capture: ImageCapture; img: HTMLImageElement; shape: CommentShape }
  | { kind: "area"; capture: AreaCapture; shape: CommentShape; view: RectLike }

/** Where a card goes: its wanted left edge, and the tops below and above its anchor. */
interface CardSpot {
  left: number
  below: number
  above: number
}

interface EditSession {
  node: Text
  span: HTMLSpanElement
  start: number
  end: number
}

type DraftStep = "idle" | "confirm" | "note" | "busy"
type DraftResult = { kind: "approved"; href: string } | { kind: "sent_back" } | null

export interface CommentLayerProps {
  role: CommentRole
  /** The signed-in person's email, used to tell their own comments apart. */
  email?: string | null
}

const noopSubscribe = () => () => {}

function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
}

function inLayer(node: EventTarget | Node | null): boolean {
  if (!node) return false
  const el = (node as Node).nodeType === 1 ? (node as Element) : (node as Node).parentElement
  return !!el?.closest(`[${LAYER_ATTR}]`)
}

function readStoredOn(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "off"
  } catch {
    return true
  }
}

function storeOn(on: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? "on" : "off")
  } catch {
    // Private windows and blocked storage: the switch still works for this visit.
  }
}

/** The overlay's top-left in viewport coordinates, so document positions can be worked out. */
function overlayOrigin(): { left: number; top: number } {
  const el = document.querySelector(`[${OVERLAY_ATTR}]`)
  if (el) {
    const r = el.getBoundingClientRect()
    return { left: r.left, top: r.top }
  }
  return { left: -window.scrollX, top: -window.scrollY }
}

function clampButton(x: number, y: number): { left: number; top: number } {
  const w = window.innerWidth || 1024
  const h = window.innerHeight || 768
  return {
    left: Math.max(EDGE, Math.min(x, w - BUTTON_W - EDGE)),
    top: Math.max(EDGE, Math.min(y, h - BUTTON_H - EDGE)),
  }
}

function buttonPosition(target: FloatingTarget): { left: number; top: number } {
  if (target.kind === "text") {
    const rects = rangeRects(target.range)
    const last = rects[rects.length - 1]
    if (!last) return clampButton(EDGE, EDGE)
    return clampButton(last.x + last.w + 6, last.y + last.h + 6)
  }
  const r = target.img.getBoundingClientRect()
  return clampButton(r.right + 8, r.top)
}

/** The element under a point that belongs to the page, not to this layer. */
function pageElementAt(x: number, y: number): Element | null {
  const stack =
    typeof document.elementsFromPoint === "function"
      ? document.elementsFromPoint(x, y)
      : typeof document.elementFromPoint === "function"
        ? [document.elementFromPoint(x, y)]
        : []
  for (const el of stack) {
    if (el && !inLayer(el) && isCommentable(el)) return el
  }
  return null
}

function viewRectOf(a: { x: number; y: number }, b: { x: number; y: number }): RectLike {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    w: Math.abs(b.x - a.x),
    h: Math.abs(b.y - a.y),
  }
}

function spotFor(anchor: RectLike): CardSpot {
  const spot = markSpot(anchor, window.innerWidth || 1024)
  return { left: spot.left, below: anchor.y + anchor.h + CARD_GAP, above: anchor.y - CARD_GAP }
}

/** Place a card next to its anchor, clamped to the window, flipping above when it will not fit below. */
function placeCard(el: HTMLElement, spot: CardSpot) {
  const vw = window.innerWidth || 1024
  const vh = window.innerHeight || 768
  const r = el.getBoundingClientRect()
  const w = r.width || 420
  const h = r.height || 0
  const left = Math.max(CARD_EDGE, Math.min(spot.left, vw - w - CARD_EDGE))
  let top = spot.below
  if (top + h > vh - CARD_EDGE) {
    const above = spot.above - h
    top = above >= CARD_EDGE ? above : Math.max(CARD_EDGE, vh - h - CARD_EDGE)
  }
  const origin = overlayOrigin()
  el.style.setProperty("--card-left", `${Math.round(left - origin.left)}px`)
  el.style.setProperty("--card-top", `${Math.round(top - origin.top)}px`)
}

/** How far the bar lifts so it sits above the lesson's audio bar. */
function barLift(): number {
  const vh = window.innerHeight || 768
  let lift = 0
  for (const el of Array.from(document.querySelectorAll(AVOID_SELECTOR))) {
    if (inLayer(el)) continue
    const r = el.getBoundingClientRect()
    if (r.height <= 0 || r.height > 240) continue
    if (r.bottom < vh - 2 || r.top >= vh) continue
    if (r.left > 640) continue
    lift = Math.max(lift, vh - r.top)
  }
  return Math.round(lift)
}

function quoteLabel(p: Pending, edit: CommentTextEdit | null): string {
  if (p.kind === "image") return `Picture: ${p.capture.imageAlt || p.capture.quote || COPY.noDescription}`
  if (p.kind === "area") return COPY.thisArea
  const words = edit ? normaliseText(edit.original) : p.capture.quote
  return `“${words ?? ""}”`
}

function metaLine(lesson: LessonContext | null): string {
  if (lesson && (lesson.lessonId || lesson.lessonPage)) {
    return [
      lessonLabel(lesson.lessonId),
      lesson.lessonPage ? `page ${lesson.lessonPage}` : undefined,
      lesson.lessonVariant === "draft" ? "draft" : undefined,
    ]
      .filter(Boolean)
      .join(", ")
  }
  return normaliseText(document.title)
}

function byCreated(a: PageComment, b: PageComment): number {
  return a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id)
}

const CANNED_GROUPS = Object.entries(CANNED_ACTIONS) as [
  CannedCategory,
  (typeof CANNED_ACTIONS)[CannedCategory],
][]

export function CommentLayer(props: CommentLayerProps) {
  const pathname = usePathname() ?? ""
  const isClient = useIsClient()
  if (pathname.startsWith("/admin")) return null
  if (!isClient) return null
  // Keyed on the path, so moving to another page starts with a clean layer.
  return createPortal(<CommentLayerInner key={pathname} {...props} pathname={pathname} />, document.body)
}

function CommentLayerInner({
  role,
  email,
  pathname,
}: CommentLayerProps & { pathname: string }) {
  const [on, setOn] = useState<boolean>(readStoredOn)
  const [boxOn, setBoxOn] = useState(false)
  const [comments, setComments] = useState<PageComment[]>([])
  const [floating, setFloating] = useState<FloatingTarget | null>(null)
  const [pending, setPending] = useState<Pending | null>(null)
  const [cardSpot, setCardSpot] = useState<CardSpot | null>(null)
  const [action, setAction] = useState<CommentAction | null>(null)
  const [text, setText] = useState("")
  const [textEdit, setTextEdit] = useState<CommentTextEdit | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [readId, setReadId] = useState<string | null>(null)
  const [readSpot, setReadSpot] = useState<CardSpot | null>(null)
  const [readError, setReadError] = useState<string | null>(null)
  const [ghost, setGhost] = useState<RectLike | null>(null)
  const [saved, setSaved] = useState(false)
  const [, setTick] = useState(0)
  const [draftStep, setDraftStep] = useState<DraftStep>("idle")
  const [draftNote, setDraftNote] = useState("")
  const [draftResult, setDraftResult] = useState<DraftResult>(null)
  const [draftError, setDraftError] = useState<string | null>(null)

  const headingId = useId()
  const cardRef = useRef<HTMLDivElement | null>(null)
  const readRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const savedTimer = useRef<number | null>(null)
  const editRef = useRef<EditSession | null>(null)
  const saveRef = useRef<() => void>(() => {})

  const bump = useCallback(() => setTick((t) => t + 1), [])

  const loadList = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?path=${encodeURIComponent(pathname)}`, {
        credentials: "same-origin",
        cache: "no-store",
      })
      if (!res.ok) return
      const data = (await res.json()) as { comments?: PageComment[] }
      setComments(Array.isArray(data.comments) ? data.comments : [])
    } catch {
      // Marks are a convenience; a failed load leaves the page without them.
    }
  }, [pathname])

  useEffect(() => {
    void loadList()
  }, [loadList])

  useEffect(() => {
    return () => {
      if (savedTimer.current) window.clearTimeout(savedTimer.current)
      // Never leave the page with an edit box in it.
      const session = editRef.current
      editRef.current = null
      if (session?.span.parentNode) {
        try {
          session.span.parentNode.replaceChild(session.node, session.span)
        } catch {
          // The page moved on under the edit; nothing to put back.
        }
      }
    }
  }, [])

  /** Ends an in-place edit, putting the page's own text node back. */
  const finishEdit = useCallback(
    (keep: boolean): { textEdit: CommentTextEdit; capture: TextCapture } | null => {
      const session = editRef.current
      if (!session) return null
      editRef.current = null
      const { node, span, start, end } = session
      const typed = (span.textContent ?? "").replace(/ /g, " ")
      try {
        if (span.parentNode) span.parentNode.replaceChild(node, span)
      } catch {
        // React replaced the paragraph while it was being edited.
      }
      setEditing(false)
      const range = document.createRange()
      try {
        range.setStart(node, Math.min(start, node.length))
        range.setEnd(node, Math.min(end, node.length))
      } catch {
        range.selectNodeContents(node)
      }
      setPending((p) => (p?.kind === "text" ? { ...p, range } : p))
      if (!keep) return null
      const original = node.data
      const replacement = normaliseText(typed)
      if (replacement === normaliseText(original)) return null
      const whole = document.createRange()
      whole.selectNodeContents(node)
      const capture = { ...captureSelection(whole), quote: normaliseText(original) }
      const edit = { original, replacement }
      setTextEdit(edit)
      setPending((p) => (p?.kind === "text" ? { ...p, capture } : p))
      return { textEdit: edit, capture }
    },
    [],
  )

  const closeCard = useCallback(() => {
    finishEdit(false)
    setPending(null)
    setCardSpot(null)
    setError(null)
    setAction(null)
    setText("")
    setTextEdit(null)
    const back = returnFocusRef.current
    returnFocusRef.current = null
    if (back && back.isConnected && back !== document.body) {
      window.setTimeout(() => back.focus(), 0)
    }
  }, [finishEdit])

  const closeRead = useCallback(() => {
    setReadId(null)
    setReadSpot(null)
    setReadError(null)
  }, [])

  const openCard = useCallback(
    (next: Pending, anchor: RectLike) => {
      finishEdit(false)
      const active = document.activeElement
      if (active instanceof HTMLElement && !inLayer(active)) returnFocusRef.current = active
      setPending(next)
      setCardSpot(spotFor(anchor))
      setAction(null)
      setText("")
      setTextEdit(null)
      setError(null)
      setFloating(null)
      closeRead()
    },
    [finishEdit, closeRead],
  )

  // Selection, picture clicks and the Box tool. Nothing is captured while off.
  useEffect(() => {
    if (!on) return
    let selecting = false
    let drag: { sx: number; sy: number; target: Element } | null = null
    let swallowClick = false

    const readSelection = () => {
      const sel = window.getSelection()
      if (!sel || sel.rangeCount === 0) {
        setFloating((f) => (f?.kind === "text" ? null : f))
        return
      }
      const range = sel.getRangeAt(0)
      // Never steal a selection made inside the layer itself.
      if (inLayer(range.commonAncestorContainer) || inLayer(sel.anchorNode)) return
      if (sel.isCollapsed || !normaliseText(sel.toString())) {
        setFloating((f) => (f?.kind === "text" ? null : f))
        return
      }
      if (!isCommentable(range.startContainer) || !isCommentable(range.endContainer)) {
        setFloating((f) => (f?.kind === "text" ? null : f))
        return
      }
      setFloating({ kind: "text", range: range.cloneRange() })
    }

    const startDrag = (x: number, y: number, target: EventTarget | null): boolean => {
      if (!boxOn || !target || inLayer(target) || !isCommentable(target as Node)) return false
      drag = { sx: x, sy: y, target: target as Element }
      return true
    }
    const moveDrag = (x: number, y: number) => {
      if (!drag) return
      setGhost(viewRectOf({ x: drag.sx, y: drag.sy }, { x, y }))
    }
    const endDrag = (x: number, y: number): boolean => {
      const d = drag
      drag = null
      setGhost(null)
      if (!d) return false
      const view = viewRectOf({ x: d.sx, y: d.sy }, { x, y })
      if (view.w <= DRAG_MIN && view.h <= DRAG_MIN) return false
      const centre =
        pageElementAt(view.x + view.w / 2, view.y + view.h / 2) ??
        (d.target.nodeType === 1 ? d.target : d.target.parentElement)
      if (!centre) return false
      const { element, shape } = anchorForBox(centre, view)
      openCard({ kind: "area", capture: captureArea(element), shape, view }, view)
      return true
    }

    const onSelectionChange = () => {
      if (selecting || drag) return
      readSelection()
    }
    const onMouseDown = (e: MouseEvent) => {
      if (inLayer(e.target)) return
      if (e.button === 0 && startDrag(e.clientX, e.clientY, e.target)) {
        // No text selection while a box is being drawn.
        e.preventDefault()
        return
      }
      selecting = true
    }
    const onMouseMove = (e: MouseEvent) => moveDrag(e.clientX, e.clientY)
    const onMouseUp = (e: MouseEvent) => {
      if (drag) {
        if (endDrag(e.clientX, e.clientY)) {
          swallowClick = true
          window.setTimeout(() => {
            swallowClick = false
          }, 0)
        }
        return
      }
      selecting = false
      if (inLayer(e.target)) return
      readSelection()
    }
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0]
      if (t && e.touches.length === 1) startDrag(t.clientX, t.clientY, e.target)
    }
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]
      if (!drag || !t) return
      e.preventDefault()
      moveDrag(t.clientX, t.clientY)
    }
    const onTouchEnd = (e: TouchEvent) => {
      if (drag) {
        const t = e.changedTouches[0]
        if (t) endDrag(t.clientX, t.clientY)
        else {
          drag = null
          setGhost(null)
        }
        return
      }
      if (inLayer(e.target)) return
      // Mobile browsers settle the selection just after the touch ends.
      window.setTimeout(readSelection, 0)
    }
    const onClickCapture = (e: MouseEvent) => {
      if (!swallowClick) return
      // The click that ends a drawn box must not follow a link underneath it.
      swallowClick = false
      e.preventDefault()
      e.stopPropagation()
    }
    const onClick = (e: MouseEvent) => {
      if (inLayer(e.target)) return
      if (isCommentableImage(e.target)) {
        setFloating({ kind: "image", img: e.target })
        return
      }
      setFloating((f) => (f?.kind === "image" ? null : f))
    }

    document.addEventListener("selectionchange", onSelectionChange)
    document.addEventListener("mousedown", onMouseDown)
    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
    document.addEventListener("touchstart", onTouchStart, { passive: true })
    document.addEventListener("touchmove", onTouchMove, { passive: false })
    document.addEventListener("touchend", onTouchEnd)
    document.addEventListener("click", onClickCapture, true)
    document.addEventListener("click", onClick)
    return () => {
      document.removeEventListener("selectionchange", onSelectionChange)
      document.removeEventListener("mousedown", onMouseDown)
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
      document.removeEventListener("touchstart", onTouchStart)
      document.removeEventListener("touchmove", onTouchMove)
      document.removeEventListener("touchend", onTouchEnd)
      document.removeEventListener("click", onClickCapture, true)
      document.removeEventListener("click", onClick)
    }
  }, [on, boxOn, openCard])

  // Marks follow the page: on resize, when a scroll ends, when the lesson
  // turns a page, and when the page itself changes size.
  useEffect(() => {
    let frame = 0
    let scrollTimer = 0
    const onScroll = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(() => {
          frame = 0
          // Only the fixed Comment button needs to follow every frame.
          if (document.querySelector(`[${LAYER_ATTR}] [data-comment-float]`)) bump()
        })
      }
      window.clearTimeout(scrollTimer)
      scrollTimer = window.setTimeout(bump, SCROLL_END_MS)
    }
    const settle = window.setTimeout(bump, 300)
    window.addEventListener("scroll", onScroll, true)
    window.addEventListener("resize", bump)
    window.addEventListener("load", bump)
    const pageWatch =
      typeof MutationObserver === "function"
        ? new MutationObserver(() => {
            closeRead()
            bump()
          })
        : null
    pageWatch?.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-lesson-page"],
    })
    let sizeTimer = 0
    const sizeWatch =
      typeof ResizeObserver === "function"
        ? new ResizeObserver(() => {
            window.clearTimeout(sizeTimer)
            sizeTimer = window.setTimeout(bump, SCROLL_END_MS)
          })
        : null
    sizeWatch?.observe(document.body)
    return () => {
      window.removeEventListener("scroll", onScroll, true)
      window.removeEventListener("resize", bump)
      window.removeEventListener("load", bump)
      pageWatch?.disconnect()
      sizeWatch?.disconnect()
      window.clearTimeout(settle)
      window.clearTimeout(scrollTimer)
      window.clearTimeout(sizeTimer)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [bump, closeRead])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      if (editRef.current) finishEdit(false)
      else if (pending) closeCard()
      else if (readId) closeRead()
      else setFloating(null)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [pending, readId, closeCard, closeRead, finishEdit])

  // A read card closes when you press anywhere else.
  useEffect(() => {
    if (!readId) return
    const onDown = (e: MouseEvent) => {
      if (readRef.current?.contains(e.target as Node)) return
      if ((e.target as Element | null)?.closest?.("[data-comment-mark]")) return
      closeRead()
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [readId, closeRead])

  // The card is placed once its height is known, so Save is never off screen.
  useLayoutEffect(() => {
    if (cardRef.current && cardSpot) placeCard(cardRef.current, cardSpot)
  }, [cardSpot])

  useLayoutEffect(() => {
    if (readRef.current && readSpot) placeCard(readRef.current, readSpot)
  }, [readSpot])

  useEffect(() => {
    if (pending) textareaRef.current?.focus({ preventScroll: true })
  }, [pending])

  const startEdit = () => {
    if (pending?.kind !== "text" || !pending.textNode || editRef.current) return
    const node = pending.textNode
    const parent = node.parentNode
    if (!parent || !node.isConnected) return
    const span = document.createElement("span")
    span.setAttribute(LAYER_ATTR, "")
    span.setAttribute("data-comment-edit", "")
    span.className = styles.editing ?? ""
    span.setAttribute("contenteditable", "true")
    span.spellcheck = true
    span.setAttribute("role", "textbox")
    span.setAttribute("aria-label", COPY.editWords)
    span.textContent = textEdit ? textEdit.replacement : node.data
    span.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
        e.preventDefault()
        saveRef.current()
      } else if (e.key === "Escape") {
        e.preventDefault()
        e.stopPropagation()
        finishEdit(false)
      }
    })
    const start = pending.range.startOffset
    const end = pending.range.endOffset
    parent.replaceChild(span, node)
    editRef.current = { node, span, start, end }
    setEditing(true)
    span.focus({ preventScroll: true })
    const sel = window.getSelection()
    if (sel) {
      const caret = document.createRange()
      caret.selectNodeContents(span)
      caret.collapse(false)
      sel.removeAllRanges()
      sel.addRange(caret)
    }
  }

  const save = async () => {
    if (!pending || saving) return
    let edit = textEdit
    let target: Pending = pending
    if (editRef.current) {
      const taken = finishEdit(true)
      if (taken && pending.kind === "text") {
        edit = taken.textEdit
        target = { ...pending, capture: taken.capture }
      }
    }
    const comment = text.trim()
    if (!comment && !action && !edit) return
    const lesson = readLessonContext()
    const body: NewPageComment = {
      pagePath: window.location.pathname,
      pageTitle: normaliseText(document.title) || undefined,
      lessonId: lesson?.lessonId,
      lessonPage: lesson?.lessonPage,
      lessonPageTitle: lesson?.lessonPageTitle,
      lessonVariant: lesson?.lessonVariant,
      targetType: target.kind,
      ...target.capture,
      comment,
      shape: target.shape,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    }
    if (action) body.action = action
    if (edit) body.textEdit = edit
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`status ${res.status}`)
      const data = (await res.json()) as { comment?: PageComment }
      const created = data.comment
      if (created) setComments((list) => [...list.filter((c) => c.id !== created.id), created])
      window.getSelection()?.removeAllRanges()
      closeCard()
      setSaved(true)
      if (savedTimer.current) window.clearTimeout(savedTimer.current)
      savedTimer.current = window.setTimeout(() => setSaved(false), SAVED_MS)
    } catch {
      setError(COPY.error)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    saveRef.current = () => void save()
  })

  const withdraw = async (id: string) => {
    setReadError(null)
    try {
      const res = await fetch(`/api/comments/${encodeURIComponent(id)}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "withdrawn" }),
      })
      if (!res.ok) throw new Error(`status ${res.status}`)
      setComments((list) => list.filter((c) => c.id !== id))
      closeRead()
    } catch {
      setReadError(COPY.error)
    }
  }

  const sendVerdict = async (lessonId: string, verdict: DraftVerdictRequest["verdict"]) => {
    const note = draftNote.trim()
    if (verdict === "sent_back" && !note) return
    const body: DraftVerdictRequest = { lessonId, verdict }
    if (note && verdict === "sent_back") body.note = note
    setDraftStep("busy")
    setDraftError(null)
    try {
      const res = await fetch("/api/lesson-draft/verdict", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`status ${res.status}`)
      if (verdict === "approved") {
        const url = new URL(window.location.href)
        url.searchParams.set("variant", "live")
        setDraftResult({ kind: "approved", href: `${url.pathname}${url.search}${url.hash}` })
      } else {
        setDraftResult({ kind: "sent_back" })
        setDraftNote("")
      }
      setDraftStep("idle")
    } catch {
      setDraftError(COPY.error)
      setDraftStep(verdict === "approved" ? "confirm" : "note")
    }
  }

  const toggleOn = () => {
    const next = !on
    setOn(next)
    storeOn(next)
    if (!next) {
      closeCard()
      closeRead()
      setFloating(null)
      setBoxOn(false)
      setGhost(null)
    }
  }

  const openFromButton = () => {
    if (!floating) return
    if (floating.kind === "text") {
      const range = floating.range
      const capture = captureSelection(range)
      const rects = rangeRects(range)
      const end = rects[rects.length - 1] ?? { x: 0, y: 0, w: 0, h: 0 }
      let block: Element | null = null
      try {
        block = capture.selector ? document.querySelector(capture.selector) : null
      } catch {
        block = null
      }
      const shape = relShape("point", block ? rectOf(block) : end, end)
      const single =
        range.startContainer === range.endContainer && range.startContainer.nodeType === Node.TEXT_NODE
          ? (range.startContainer as Text)
          : null
      openCard({ kind: "text", capture, range, shape, textNode: single }, end)
    } else {
      const img = floating.img
      const box = rectOf(img)
      openCard(
        { kind: "image", capture: captureImage(img), img, shape: relShape("point", box, box) },
        box,
      )
    }
  }

  const chooseAction = (category: CannedCategory, key: string, label: string) => {
    setAction((cur) =>
      cur && cur.category === category && cur.key === key ? null : { category, key, label },
    )
  }

  const onCardKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return
    const t = e.target as HTMLElement
    // Cancel and Edit the words keep their own Enter.
    if (t.closest("[data-card-keep-enter]")) return
    e.preventDefault()
    void save()
  }

  const isOwn = (c: PageComment) =>
    role === "beta" || (!!email && c.authorEmail?.toLowerCase() === email.toLowerCase())

  // Everything below reads the live page on each render; scrolls, resizes and
  // lesson page turns bump a tick so it follows.
  const lesson = readLessonContext()
  const visible = comments
    .filter((c) => c.status !== "withdrawn")
    .filter((c) => !lesson?.lessonPage || c.lessonPage === lesson.lessonPage)
    .sort(byCreated)
  const fixedCount = visible.filter((c) => c.status === "fixed").length
  const origin = overlayOrigin()
  const vw = window.innerWidth || 1024
  const toDoc = (r: RectLike): RectLike => ({ x: r.x - origin.left, y: r.y - origin.top, w: r.w, h: r.h })

  const marks = on
    ? visible.flatMap((c, i) => {
        const place = placeOf(c)
        if (!place) return []
        const spot = markSpot(place, vw)
        return [{ c, n: i + 1, left: spot.left, top: spot.top }]
      })
    : []

  const floatPos = on && floating ? buttonPosition(floating) : null
  const highlights =
    pending?.kind === "text" && !editing ? rangeRects(pending.range).map(toDoc) : []
  const outline =
    floating?.kind === "image" && floating.img.isConnected
      ? toDoc(rectOf(floating.img))
      : pending?.kind === "image" && pending.img.isConnected
        ? toDoc(rectOf(pending.img))
        : null
  const areaBox = pending?.kind === "area" ? toDoc(pending.view) : null

  const read = readId ? visible.find((c) => c.id === readId) ?? null : null
  const readN = read ? visible.indexOf(read) + 1 : 0

  const showDraft = role === "admin" && lesson?.lessonVariant === "draft" && !!lesson.lessonId
  const draftLessonId = lesson?.lessonId ?? ""
  const barStyle = { "--bar-lift": `${barLift()}px` } as CSSProperties
  const canSave = !saving && (!!action || !!text.trim() || !!textEdit || editing)

  return (
    <div {...{ [LAYER_ATTR]: "" }} className={styles.layer}>
      <div {...{ [OVERLAY_ATTR]: "" }} className={styles.overlay}>
        {highlights.map((b, i) => (
          <div
            key={i}
            aria-hidden="true"
            className={styles.highlight}
            style={{ left: b.x, top: b.y, width: b.w, height: b.h }}
          />
        ))}
        {outline && (
          <div
            aria-hidden="true"
            className={styles.outline}
            style={{ left: outline.x - 2, top: outline.y - 2, width: outline.w + 4, height: outline.h + 4 }}
          />
        )}
        {areaBox && (
          <div
            aria-hidden="true"
            className={styles.drawBox}
            style={{ left: areaBox.x, top: areaBox.y, width: areaBox.w, height: areaBox.h }}
          />
        )}

        {marks.map(({ c, n, left, top }) => {
          const quiet = c.status === "fixed" || c.status === "declined"
          const chip = c.status === "fixed" || c.status === "declined" ? STATUS_LABELS[c.status] : null
          return (
            <div
              key={c.id}
              className={styles.markWrap}
              style={{ left: left - origin.left, top: top - origin.top }}
            >
              <button
                type="button"
                data-comment-mark=""
                className={`${styles.mark} ${quiet ? styles.markQuiet : ""}`}
                aria-label={`Comment ${n}, ${STATUS_LABELS[c.status] ?? c.status}`}
                aria-haspopup="dialog"
                aria-expanded={readId === c.id}
                onClick={(e) => {
                  if (readId === c.id) {
                    closeRead()
                    return
                  }
                  // Read where the mark is now, not where it was last drawn.
                  const r = e.currentTarget.getBoundingClientRect()
                  const at = r.width > 0 ? { left: r.left, top: r.top } : { left, top }
                  setReadId(c.id)
                  setReadError(null)
                  setReadSpot({ left: at.left, below: at.top + MARK_SIZE + 6, above: at.top - 6 })
                }}
              >
                {n}
              </button>
              {chip && <span className={styles.markChip}>{chip}</span>}
              {c.textEdit && <span className={styles.markChip}>{COPY.edit}</span>}
            </div>
          )
        })}

        {pending && on && (
          <div
            ref={cardRef}
            role="dialog"
            aria-modal="false"
            aria-labelledby={headingId}
            className={styles.card}
            onKeyDown={onCardKey}
          >
            <h2 id={headingId} className={styles.cardTitle}>
              {COPY.heading}
            </h2>
            {metaLine(lesson) && <p className={styles.meta}>{metaLine(lesson)}</p>}
            <blockquote className={styles.quote}>{quoteLabel(pending, textEdit)}</blockquote>
            {textEdit && !editing && (
              <p className={styles.newWords}>
                {COPY.newWords}: “{textEdit.replacement}”
              </p>
            )}
            {editing && <p className={styles.meta}>{COPY.editHint}</p>}
            {CANNED_GROUPS.map(([category, group]) => (
              <div key={category} role="group" aria-label={group.label} className={styles.group}>
                <p className={styles.groupLabel}>{group.label}</p>
                <div className={styles.chips}>
                  {Object.entries(group.actions).map(([key, label]) => {
                    const chosen = action?.category === category && action.key === key
                    return (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={chosen}
                        className={`${styles.chip} ${chosen ? styles.chipOn : ""}`}
                        onClick={() => chooseAction(category, key, label)}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              placeholder={COPY.placeholder}
              aria-label={COPY.wordsLabel}
              value={text}
              maxLength={COMMENT_MAX_LENGTH}
              onChange={(e) => setText(e.target.value)}
            />
            <div className={styles.row}>
              <button type="button" className={styles.btn} disabled={!canSave} onClick={() => void save()}>
                {COPY.save}
              </button>
              {pending.kind === "text" && pending.textNode && !editing && (
                <button type="button" data-card-keep-enter="" className={styles.btn2} onClick={startEdit}>
                  {COPY.editWords}
                </button>
              )}
              <button type="button" data-card-keep-enter="" className={styles.btn2} onClick={closeCard}>
                {COPY.cancel}
              </button>
            </div>
            {error && (
              <p role="alert" className={styles.error}>
                {error}
              </p>
            )}
          </div>
        )}

        {read && on && (
          <div
            ref={readRef}
            role="dialog"
            aria-modal="false"
            aria-label={`${COPY.comment} ${readN}`}
            className={`${styles.card} ${styles.readCard}`}
          >
            <div className={styles.readHead}>
              <p className={styles.readAction}>{read.action?.label ?? `${COPY.comment} ${readN}`}</p>
              <span className={`${styles.chip} ${styles.statusChip}`}>
                {STATUS_LABELS[read.status] ?? read.status}
              </span>
            </div>
            {read.comment && <p className={styles.readWords}>{read.comment}</p>}
            {read.textEdit && (
              <p className={styles.newWords}>
                {COPY.newWords}: “{read.textEdit.replacement}”
              </p>
            )}
            <div className={styles.readFoot}>
              <span className={styles.meta}>{role === "admin" ? read.authorEmail : ""}</span>
              <span className={styles.row}>
                {read.status === "open" && isOwn(read) && (
                  <button type="button" className={styles.textBtn} onClick={() => void withdraw(read.id)}>
                    {COPY.remove}
                  </button>
                )}
                <button type="button" className={styles.textBtn} onClick={closeRead}>
                  {COPY.close}
                </button>
              </span>
            </div>
            {readError && (
              <p role="alert" className={styles.error}>
                {readError}
              </p>
            )}
          </div>
        )}
      </div>

      {ghost && (
        <div
          aria-hidden="true"
          className={styles.ghost}
          style={{ left: ghost.x, top: ghost.y, width: ghost.w, height: ghost.h }}
        />
      )}

      {floating && floatPos && (
        <button
          type="button"
          data-comment-float=""
          className={styles.float}
          style={{ left: floatPos.left, top: floatPos.top }}
          // Keep the page selection alive while the button is pressed.
          onMouseDown={(e) => e.preventDefault()}
          onClick={openFromButton}
          aria-haspopup="dialog"
        >
          {COPY.comment}
        </button>
      )}

      <div role="group" aria-label={COPY.bar} className={styles.bar} style={barStyle}>
        <span className={styles.barName}>{COPY.bar}</span>
        <button
          type="button"
          aria-pressed={on}
          className={`${styles.chip} ${on ? styles.chipOn : ""}`}
          onClick={toggleOn}
        >
          {on ? COPY.on : COPY.off}
        </button>
        <button
          type="button"
          aria-pressed={boxOn}
          disabled={!on}
          className={`${styles.chip} ${boxOn ? styles.chipOn : ""}`}
          onClick={() => setBoxOn((b) => !b)}
        >
          {COPY.box}
        </button>
        <span className={styles.count}>{COPY.count(visible.length, fixedCount)}</span>
        {showDraft &&
          (draftResult?.kind === "approved" ? (
            <span className={styles.count}>
              {COPY.approved}{" "}
              <a className={styles.link} href={draftResult.href}>
                {COPY.showLive}
              </a>
            </span>
          ) : draftResult?.kind === "sent_back" ? (
            <span className={styles.count}>{COPY.sentBack}</span>
          ) : draftStep === "confirm" ? (
            <>
              <span className={styles.count}>{COPY.approveConfirm}</span>
              <button type="button" className={styles.btnSmall} onClick={() => void sendVerdict(draftLessonId, "approved")}>
                {COPY.yes}
              </button>
              <button type="button" className={styles.btn2Small} onClick={() => setDraftStep("idle")}>
                {COPY.no}
              </button>
            </>
          ) : draftStep === "note" ? (
            <>
              <textarea
                className={`${styles.textarea} ${styles.textareaSmall}`}
                placeholder={COPY.sendBackPlaceholder}
                aria-label={COPY.sendBackLabel}
                value={draftNote}
                maxLength={COMMENT_MAX_LENGTH}
                onChange={(e) => setDraftNote(e.target.value)}
              />
              <button
                type="button"
                className={styles.btnSmall}
                disabled={!draftNote.trim()}
                onClick={() => void sendVerdict(draftLessonId, "sent_back")}
              >
                {COPY.sendBack}
              </button>
              <button type="button" className={styles.btn2Small} onClick={() => setDraftStep("idle")}>
                {COPY.cancel}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={styles.btn2Small}
                disabled={draftStep === "busy"}
                onClick={() => setDraftStep("confirm")}
              >
                {COPY.approveDraft}
              </button>
              <button
                type="button"
                className={styles.btn2Small}
                disabled={draftStep === "busy"}
                onClick={() => setDraftStep("note")}
              >
                {COPY.sendBack}
              </button>
            </>
          ))}
        {showDraft && draftError && (
          <span role="alert" className={styles.error}>
            {draftError}
          </span>
        )}
      </div>

      <p role="status" className={styles.srOnly}>
        {saved ? COPY.saved : ""}
      </p>
    </div>
  )
}
