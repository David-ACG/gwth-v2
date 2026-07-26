"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
// Same scoped stylesheet the viewer uses: the edge tabs are part of the tool
// chrome, so they read the same `--v-tool-*` tokens the chrome variants swap.
import styles from "./lesson-fde.module.css"

/**
 * Public surface name for selecting the initial widget state on mount.
 * `none` (default) renders both pills collapsed; `feedback` opens the
 * feedback panel with mock comments; `notes` opens the aggregated notes
 * panel; `selection` shows the selection popover above an active selection;
 * `note-compose` shows the note compose popover anchored to a highlight;
 * `mobile-sheet` opens the mobile bottom sheet; `mobile-collapsed` shows
 * only the feedback pill on mobile (notes is desktop-only).
 *
 * Used by the demo route's `?widget=` query parameter to verify each
 * surface against the 2026-05-08 lesson-widgets-design-bundle.
 */
export type LessonWidgetSurface =
  | "none"
  | "feedback"
  | "notes"
  | "selection"
  | "note-compose"
  | "mobile-sheet"
  | "mobile-collapsed"

/** A single feedback comment, scoped by section anchor. */
interface FeedbackComment {
  /** Mono uppercase chip label, e.g. `"PAGE 3 · PARAGRAPH 2"`. */
  anchor: string
  /** Mono timestamp (no real time wiring yet). */
  time: string
  /** Comment body, plain text. */
  body: string
  /** Optional staff reply rendered as a terracotta-bordered nested block. */
  staffReply?: { author: string; body: string }
}

/** A single highlight + optional note row in the aggregated notes panel. */
interface HighlightNote {
  /** The quoted span from the prose, rendered in italic Vollkorn. */
  quote: string
  /** Optional learner note beneath the quote, in muted Public Sans. */
  note?: string
  /** Mono timestamp (no real time wiring yet). */
  time: string
  /** Whether this row is currently focused (terracotta accent strip). */
  focused?: boolean
}

/** Page-group ahead of a list of notes in the aggregated notes panel. */
interface NotesPageGroup {
  /** Page label, e.g. `"PAGE 3 · 4 NOTES"`. */
  label: string
  /** Ordered list of highlight + note rows on this page. */
  rows: HighlightNote[]
}

const MOCK_COMMENTS: FeedbackComment[] = [
  {
    anchor: "PAGE 3 · PARAGRAPH 2",
    time: "22 APR · 14:08",
    body: "The line about ‘who carries the work’ is the one I’d quote, but it’s buried halfway through the paragraph. Could it move up so it lands first?",
    staffReply: {
      author: "AMY (CONTENT)",
      body: "Good call, moving it to the lede on the next pass. Tracking as edit-237.",
    },
  },
  {
    anchor: "PAGE 5 · CODE BLOCK",
    time: "22 APR · 14:14",
    body: "The TypeScript snippet uses a generic that hasn’t been introduced yet. Maybe a one-line gloss above it?",
  },
  {
    anchor: "PAGE 7 · IMAGE",
    time: "22 APR · 14:21",
    body: "Diagram caption says ‘figure 4’ but it’s the third image on the page.",
  },
]

const MOCK_NOTE_GROUPS: NotesPageGroup[] = [
  {
    label: "PAGE 3 · 4 NOTES",
    rows: [
      {
        quote: "who carries the work",
        note: "Probably my best line. Bring this to the kickoff template.",
        time: "22 APR · 14:02",
      },
      {
        quote:
          "arrives at the right moment, in language the room is already speaking",
        time: "22 APR · 14:03",
      },
      {
        quote: "cleanest slides",
        note: "Counterexample: the BD deck last quarter, gorgeous, missed the room entirely.",
        time: "22 APR · 14:05",
      },
      {
        quote: "rarely the work",
        time: "22 APR · 14:06",
      },
    ],
  },
  {
    label: "PAGE 4 · 2 NOTES",
    rows: [
      {
        quote: "Pace is information.",
        note: "Use this as the kickoff slide tagline. Italic in the deck.",
        time: "22 APR · 14:18",
        focused: true,
      },
      {
        quote: "A small pause where a senior leader is catching up.",
        time: "22 APR · 14:19",
      },
    ],
  },
  {
    label: "PAGE 7 · 1 NOTE",
    rows: [
      {
        quote: "noticing what the room needs before it asks",
        note: "Worth a whole separate session on this with the team.",
        time: "22 APR · 14:24",
      },
    ],
  },
]

const FEEDBACK_COUNT = 3
const NOTES_COUNT = 7

/**
 * Lesson-viewer widgets, ported from the 2026-05-08 Claude Design bundle
 * (lesson-widgets-design-bundle). Two right-edge widgets:
 *   - Feedback popout (private comments tied to section anchors)
 *   - Highlight / notes (desktop-only annotation aggregator)
 *
 * Mounts as fixed-position children of the lesson viewer's main column.
 * Z-index 30 so it sits below the audio bar (`z-[5]` -> stacking context
 * means the audio bar always wins). Mobile drops the notes affordance and
 * swaps the feedback panel for a bottom sheet above the audio bar.
 *
 * Persistence is mocked, real DB wiring is filed as follow-up beads.
 */
export function LessonWidgets({
  lessonNumber,
  initialSurface = "none",
  mobile = false,
}: {
  /** Lesson number for the panel-header accent (`FEEDBACK · LESSON 13`). */
  lessonNumber: number
  /** Initial widget surface to mount in. Used by the demo route. */
  initialSurface?: LessonWidgetSurface
  /**
   * When true, render mobile affordances (single feedback pill + bottom
   * sheet, no notes). When false, render desktop affordances (both pills
   * + side panel + selection popovers).
   */
  mobile?: boolean
}) {
  const [surface, setSurface] = React.useState<LessonWidgetSurface>(
    initialSurface
  )

  // Keyboard: F = feedback, N = notes (desktop only), Esc = close.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return
      }
      if (e.key === "Escape") {
        setSurface(mobile ? "mobile-collapsed" : "none")
        return
      }
      if (e.key === "f" || e.key === "F") {
        setSurface((s) => {
          if (mobile) return s === "mobile-sheet" ? "mobile-collapsed" : "mobile-sheet"
          return s === "feedback" ? "none" : "feedback"
        })
      }
      if (!mobile && (e.key === "n" || e.key === "N")) {
        setSurface((s) => (s === "notes" ? "none" : "notes"))
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [mobile])

  // Mobile path. Notes is desktop-only; feedback is a bottom sheet.
  if (mobile) {
    const sheetOpen = surface === "mobile-sheet"
    return (
      <>
        <MobileDesktopOnlyBanner />
        {sheetOpen ? (
          <MobileFeedbackSheet
            lessonNumber={lessonNumber}
            onClose={() => setSurface("mobile-collapsed")}
          />
        ) : (
          <EdgePill
            label="FEEDBACK"
            count={FEEDBACK_COUNT}
            position={{ right: 0, top: "40%" }}
            dot
            onClick={() => setSurface("mobile-sheet")}
          />
        )}
      </>
    )
  }

  // Desktop path.
  const isFeedback = surface === "feedback"
  const isNotes = surface === "notes"
  const isSelection = surface === "selection"
  const isNoteCompose = surface === "note-compose"
  const panelOpen = isFeedback || isNotes
  const PANEL_W = 400

  return (
    <>
      {/* Right-edge pill column. When a panel is open, both pills dock to
          the panel's left edge as quick-switch tabs. */}
      <EdgePill
        label="FEEDBACK"
        count={FEEDBACK_COUNT}
        dot
        active={isFeedback}
        position={
          panelOpen
            ? { right: PANEL_W, top: "30%" }
            : { right: 0, top: "30%" }
        }
        onClick={() => setSurface(isFeedback ? "none" : "feedback")}
      />
      <EdgePill
        label="NOTES"
        count={NOTES_COUNT}
        active={isNotes}
        position={
          panelOpen
            ? { right: PANEL_W, top: "calc(30% + 184px)" }
            : { right: 0, top: "calc(30% + 184px)" }
        }
        onClick={() => setSurface(isNotes ? "none" : "notes")}
      />

      {isFeedback && (
        <FeedbackPanel
          lessonNumber={lessonNumber}
          width={PANEL_W}
          onClose={() => setSurface("none")}
        />
      )}
      {isNotes && (
        <NotesPanel lessonNumber={lessonNumber} width={PANEL_W} />
      )}

      {isSelection && <SelectionPopoverDemo />}
      {isNoteCompose && <NoteComposePopoverDemo />}
    </>
  )
}

// ─── Edge pill ────────────────────────────────────────────────────────────────

interface EdgePillPosition {
  right?: number | string
  top?: number | string
}

/**
 * Slim vertical right-edge tab, mono uppercase label rotated 180° so it
 * reads top-down. Sharp single border, no shadow. Optional terracotta
 * unread dot in the corner.
 */
function EdgePill({
  label,
  count,
  position,
  dot,
  active,
  onClick,
}: {
  label: string
  count: number
  position: EdgePillPosition
  dot?: boolean
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Toggle ${label.toLowerCase()} panel, ${count} items`}
      aria-pressed={active}
      className={cn(
        // `grid place-items-center` centres the rotated label across the 36px
        // tab. `text-align` cannot do it: inside `writing-mode: vertical-rl`
        // the inline axis runs vertically, so text-center centres the label
        // along its length and leaves it flush against one side.
        "fixed z-30 grid w-9 cursor-pointer select-none place-items-center",
        "border-y border-l",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : cn(styles.toolSurface, "text-foreground hover:bg-muted")
      )}
      style={{
        right: position.right,
        top: position.top,
      }}
    >
      <span
        className="block font-mono text-[11px] font-semibold uppercase tracking-[0.16em]"
        style={{
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          transform: "rotate(180deg)",
          // PHYSICAL padding on purpose. Tailwind's `py-*` compiles to
          // `padding-block`, which is LOGICAL: under `writing-mode:
          // vertical-rl` the block axis runs horizontally, so `py-3.5` put the
          // 14px on the left and right and left the label touching the top and
          // bottom borders (measured insets: 1px). David, 2026-07-26: "The
          // Notes and Feedback tabs have no padding for the text so it looks
          // squashed."
          paddingTop: "0.875rem",
          paddingBottom: "0.875rem",
          paddingLeft: 0,
          paddingRight: 0,
        }}
      >
        {label}
        <span
          className={cn(
            "mt-2 inline-block font-medium",
            active ? "text-primary-foreground" : "text-muted-foreground"
          )}
        >
          {" · "}
          {count}
        </span>
      </span>
      {dot && (
        <span
          aria-hidden="true"
          className="absolute left-1.5 top-1.5 size-[7px] border border-background bg-primary"
        />
      )}
    </button>
  )
}

// ─── Side panel + header ──────────────────────────────────────────────────────

/**
 * Right-edge slide-out side panel. Sharp single left border, fixed full
 * height minus the audio bar (`bottom: 64px`). The panel sits at z-30 so
 * the audio bar (z-[5] but rooted in a higher stacking context as a
 * sticky child of `<main>`) still wins on hit-testing inside the lesson
 * viewer — but we belt-and-brace by reserving the bottom 64px for the
 * audio bar.
 */
function SidePanel({
  width,
  children,
}: {
  width: number
  children: React.ReactNode
}) {
  return (
    <aside
      className="fixed right-0 top-16 z-30 flex flex-col border-l border-foreground bg-card"
      style={{
        width,
        bottom: 76,
      }}
    >
      {children}
    </aside>
  )
}

/**
 * Mono uppercase header for both side panels. Renders the title plus an
 * optional terracotta accent (`LESSON 13`), an optional scope picker
 * beneath, and a thin `[F] · [N] · [ESC]` keyboard hint strip.
 */
function PanelHeader({
  title,
  accent,
  activeKey,
  scopePicker,
}: {
  title: string
  accent?: string
  activeKey: "F" | "N"
  scopePicker?: React.ReactNode
}) {
  return (
    <div className="shrink-0 border-b border-foreground px-5 pb-3.5 pt-[18px]">
      <div className="font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-foreground">
        {title}
        {accent && <span className="text-primary"> · {accent}</span>}
      </div>

      {scopePicker}

      <div className="mt-3.5 flex border border-border">
        <KeyChip k="F" label="FEEDBACK" active={activeKey === "F"} />
        <KeyChip k="N" label="NOTES" active={activeKey === "N"} />
        <KeyChip k="ESC" label="CLOSE" active={false} />
      </div>
    </div>
  )
}

function KeyChip({
  k,
  label,
  active,
}: {
  k: string
  label: string
  active: boolean
}) {
  return (
    <div
      className={cn(
        "flex flex-1 items-center gap-1.5 px-2.5 py-[7px] font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground",
        "border-l border-border first:border-l-0",
        active && "bg-muted"
      )}
    >
      <span
        className="min-w-[18px] border border-foreground px-[5px] py-px text-center font-semibold text-foreground"
        style={{ fontSize: 9.5, letterSpacing: "0.06em" }}
      >
        {k}
      </span>
      <span className="font-medium">{label}</span>
    </div>
  )
}

/** Two-state segmented control: This page · All pages. Display-only. */
function ScopePicker({
  value = "page",
}: {
  value?: "page" | "all"
}) {
  const opts: { k: "page" | "all"; label: string }[] = [
    { k: "page", label: "This page" },
    { k: "all", label: "All pages" },
  ]
  return (
    <div className="mt-3 flex border border-foreground">
      {opts.map((o, i) => (
        <button
          key={o.k}
          type="button"
          className={cn(
            "flex-1 px-2.5 py-[7px] text-center text-[12px] tracking-[0.02em]",
            i > 0 && "border-l border-foreground",
            value === o.k
              ? "bg-foreground font-bold text-background"
              : "bg-transparent font-medium text-foreground"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Mono uppercase chip for a section anchor. */
function SectionAnchorChip({
  children,
  dim,
}: {
  children: React.ReactNode
  dim?: boolean
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-[7px] py-[3px] font-mono text-[10px] font-medium uppercase tracking-[0.14em]",
        dim
          ? "border-border text-muted-foreground"
          : "border-foreground text-foreground"
      )}
    >
      {children}
    </span>
  )
}

// ─── Feedback panel ───────────────────────────────────────────────────────────

function FeedbackPanel({
  lessonNumber,
  width,
  onClose,
}: {
  lessonNumber: number
  width: number
  onClose: () => void
}) {
  return (
    <SidePanel width={width}>
      <PanelHeader
        title="FEEDBACK"
        accent={`LESSON ${lessonNumber}`}
        activeKey="F"
        scopePicker={<ScopePicker value="page" />}
      />
      <div className="flex-1 overflow-y-auto">
        {MOCK_COMMENTS.map((c, i) => (
          <CommentRow key={i} {...c} />
        ))}
      </div>
      <Composer anchor="PAGE 4 · PARAGRAPH 1" onPost={onClose} />
    </SidePanel>
  )
}

/** A single comment in the feedback panel. */
function CommentRow({ anchor, time, body, staffReply }: FeedbackComment) {
  return (
    <div className="border-b border-border px-5 py-4">
      <div className="mb-2 flex items-center justify-between">
        <SectionAnchorChip>{anchor}</SectionAnchorChip>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] tabular-nums text-muted-foreground">
          {time}
        </span>
      </div>
      <p className="m-0 text-[14px] leading-[1.5] text-foreground">{body}</p>
      {staffReply && (
        <div className="mt-3 border-l-2 border-primary pl-3">
          <div className="mb-1 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
            STAFF · {staffReply.author}
          </div>
          <p className="m-0 text-[13px] leading-[1.5] text-muted-foreground">
            {staffReply.body}
          </p>
        </div>
      )}
    </div>
  )
}

/** Sticky composer at the bottom of the feedback panel. */
function Composer({
  anchor,
  onPost,
}: {
  anchor: string
  onPost?: () => void
}) {
  return (
    <div className="shrink-0 border-t border-foreground bg-card p-4">
      <textarea
        placeholder="What would you change about this section?"
        className="block w-full resize-none border border-border bg-background p-2.5 text-[14px] leading-[1.5] text-foreground outline-none focus:border-foreground"
        rows={3}
      />
      <div className="mt-2.5 flex items-center justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            ATTACH
          </span>
          <SectionAnchorChip>{anchor}</SectionAnchorChip>
        </div>
        <button
          type="button"
          onClick={onPost}
          className="shrink-0 border border-primary bg-primary px-3 py-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-primary-foreground hover:border-[var(--v-teal-deep)] hover:bg-[var(--v-teal-deep)]"
        >
          POST
        </button>
      </div>
    </div>
  )
}

// ─── Notes panel ──────────────────────────────────────────────────────────────

function NotesPanel({
  lessonNumber,
  width,
}: {
  lessonNumber: number
  width: number
}) {
  return (
    <SidePanel width={width}>
      <PanelHeader
        title="NOTES"
        accent={`LESSON ${lessonNumber}`}
        activeKey="N"
      />
      <div className="flex-1 overflow-y-auto">
        {MOCK_NOTE_GROUPS.map((group) => (
          <React.Fragment key={group.label}>
            <PageGroupHeader>{group.label}</PageGroupHeader>
            {group.rows.map((row, i) => (
              <NoteRow key={i} {...row} />
            ))}
          </React.Fragment>
        ))}
      </div>
    </SidePanel>
  )
}

function PageGroupHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky top-0 border-b border-border bg-background px-5 py-2 pt-3.5">
      <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">
        {children}
      </div>
    </div>
  )
}

function NoteRow({ quote, note, time, focused }: HighlightNote) {
  return (
    <div
      className={cn(
        "border-b border-border px-5 pb-4 pt-3.5",
        focused
          ? "border-l-2 border-l-primary bg-[var(--v-line-soft)]"
          : "border-l-2 border-l-transparent"
      )}
    >
      <p className="m-0 text-[14.5px] italic leading-[1.45] text-foreground">
        “{quote}”
      </p>
      {note && (
        <p className="mt-2 text-[13px] leading-[1.5] text-muted-foreground">
          {note}
        </p>
      )}
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] tabular-nums text-muted-foreground">
          {time}
        </span>
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            className="border-b-[1.5px] border-foreground p-0 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-foreground"
          >
            JUMP TO
          </button>
          <button
            type="button"
            aria-label="Delete note"
            className="flex items-center p-0 text-muted-foreground hover:text-destructive"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  )
}

function TrashIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
    >
      <path d="M2 3.5h10M5.5 1.5h3M3 3.5l.6 8.5h6.8l.6-8.5M5.5 5.5v5M8.5 5.5v5" />
    </svg>
  )
}

// ─── Selection + note compose popovers (demo-only positioning) ────────────────

/**
 * Sage / terracotta / ghost three-button popover that appears just above
 * a text selection. Position is fixed relative to the viewport for the
 * demo route; real usage will anchor to a `Range.getBoundingClientRect()`.
 */
function SelectionPopoverDemo() {
  return (
    <div
      className="fixed z-[60] flex border border-foreground bg-card font-mono text-[11px] font-semibold uppercase tracking-[0.14em] shadow-none"
      style={{
        left: "50%",
        top: "42%",
        transform: "translate(-50%, -100%)",
      }}
    >
      <button
        type="button"
        className="bg-[var(--v-line-soft)] px-3.5 py-2.5 text-foreground"
      >
        HIGHLIGHT
      </button>
      <button
        type="button"
        className="border-l border-foreground bg-primary px-3.5 py-2.5 text-primary-foreground"
      >
        HIGHLIGHT + NOTE
      </button>
      <button
        type="button"
        className="border-l border-foreground bg-transparent px-3.5 py-2.5 text-muted-foreground"
      >
        CANCEL
      </button>
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-full size-0 -translate-x-1/2"
        style={{
          borderLeft: "7px solid transparent",
          borderRight: "7px solid transparent",
          borderTop: "7px solid var(--v-ink)",
        }}
      />
    </div>
  )
}

/**
 * Note compose popover anchored to the right margin of a freshly-created
 * highlight. Demo-positioned in the viewport for the demo route.
 */
function NoteComposePopoverDemo() {
  return (
    <div
      className="fixed z-[60] w-[280px] border border-foreground bg-card p-3"
      style={{ left: "60%", top: "38%" }}
    >
      <div className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">
        NOTE TO SELF · P4
      </div>
      <textarea
        defaultValue="Pace is information, bring this back to the kickoff slide."
        className="block w-full resize-none border border-border bg-background p-2 text-[13px] leading-[1.5] text-foreground outline-none focus:border-foreground"
        rows={3}
      />
      <div className="mt-2.5 flex justify-end gap-2">
        <button
          type="button"
          className="border border-foreground bg-transparent px-3 py-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-foreground hover:bg-foreground hover:text-background"
        >
          DELETE
        </button>
        <button
          type="button"
          className="border border-primary bg-primary px-3 py-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-primary-foreground hover:border-[var(--v-teal-deep)] hover:bg-[var(--v-teal-deep)]"
        >
          SAVE
        </button>
      </div>
    </div>
  )
}

// ─── Mobile ───────────────────────────────────────────────────────────────────

/**
 * Quiet single-line message at the top of the mobile lesson body that
 * the highlight tool is desktop-only. Placed inline above the prose; on
 * desktop this banner is omitted entirely.
 */
function MobileDesktopOnlyBanner() {
  // Rendered as a fixed strip just under the dashboard top-nav (~64px)
  // and the mobile-surface chrome (~52px). We render it AS the topmost
  // band of the viewport, so it sits above all lesson content and the
  // pill below it. This is intentional, the brief calls for a calm
  // banner the learner can ignore.
  return (
    <div
      className="fixed left-0 right-0 z-20 flex items-center gap-2 border-b border-border bg-background px-4 py-2"
      style={{ top: 116 }}
    >
      <span
        aria-hidden="true"
        className="size-1.5 shrink-0 bg-muted-foreground"
      />
      <span className="text-[13px] leading-[1.4] text-muted-foreground">
        Highlights and notes are available on desktop.
      </span>
    </div>
  )
}

/**
 * Bottom sheet for the feedback widget on mobile. Sits above the audio
 * bar (audio bar is a sticky child of the lesson viewer's `<main>`, this
 * sheet is fixed-positioned at `bottom: 76` to clear the bar plus a
 * small gap).
 */
function MobileFeedbackSheet({
  lessonNumber,
  onClose,
}: {
  lessonNumber: number
  onClose: () => void
}) {
  return (
    <div
      className="fixed left-0 right-0 z-30 flex flex-col border-t border-foreground bg-card"
      style={{ bottom: 76, maxHeight: "70vh" }}
    >
      <div className="flex justify-center pb-1.5 pt-2.5">
        <button
          type="button"
          aria-label="Close feedback sheet"
          onClick={onClose}
          className="h-[3px] w-9 cursor-pointer border-none bg-foreground p-0"
        />
      </div>
      <PanelHeader
        title="FEEDBACK"
        accent={`L${lessonNumber}`}
        activeKey="F"
      />
      <div className="flex-1 overflow-y-auto">
        <CommentRow
          anchor="P3 · PARA 2"
          time="22 APR · 14:08"
          body="‘Who carries the work’ is the line I’d quote, could it move up?"
          staffReply={{
            author: "AMY",
            body: "Moving it to the lede next pass.",
          }}
        />
        <CommentRow
          anchor="P5 · CODE"
          time="22 APR · 14:14"
          body="Generic isn’t introduced yet, one-line gloss above?"
        />
      </div>
      <Composer anchor="P4 · PARA 1" onPost={onClose} />
    </div>
  )
}
