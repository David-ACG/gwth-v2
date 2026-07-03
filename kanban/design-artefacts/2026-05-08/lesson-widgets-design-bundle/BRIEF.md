# Claude Design Brief — GWTH.ai Lesson Viewer Widgets (2026-05-08)

**Logo PNGs are locked — do NOT propose, attempt, or render any SVG version of the logo. If you generate one, the entire response will be rejected.**

**Design tokens are locked.** The Stone & Sage palette, Public Sans / Vollkorn / JetBrains Mono typography, terracotta `#a94c2e` primary, and warm forest dark mode are inherited from the homepage template this chat was seeded from. Do NOT redefine, propose alternatives to, or "polish" the tokens. Use them.

You are Claude Design working on the GWTH.ai 23 May 2026 UK beta launch. Design **two widgets that attach to the existing lesson viewer body**. Do NOT redesign the lesson viewer page itself, the page chrome, the audio bar, the lesson outline rail, or anything else. The lesson viewer is already designed and locked in a separate bundle. This chat exists for the widgets only.

The host page is a multi-page lesson viewer: prose body in a ~720px-wide column, top chrome with progress bars, persistent audio bar pinned bottom (with auto-advance toggle), optional collapsible outline rail on the left. The widgets must coexist with all of this without competing for attention.

For visual context inside this chat, render a **stripped-down host body** (a single column of editorial prose, ~720px wide, on warm stone background, with the audio bar represented as a quiet bottom strip). The widgets are what we are designing, not the page.

## 1. The two widgets

### Widget A — Section feedback / comments (popout)

A persistent right-edge affordance that lets a learner leave feedback or questions tied to a specific section of the current page. Multiple comments per section. Visible to staff (used to improve content), visible to the learner, not visible to other learners (private feedback channel, not a forum).

**Default state:** a slim vertical pill anchored to the right edge of the viewport, mid-height. Mono uppercase label `FEEDBACK · 3` (count = number of existing comments by this learner on this lesson). Hover/focus expands the label to read more clearly. Click toggles the panel.

**Expanded state:** a panel slides out from the right edge, ~360–420px wide, full-height minus chrome, with a sharp single border on the left. Header in mono uppercase `FEEDBACK · LESSON 13`. Below the header, a small section selector that defaults to "This page" but lets the learner switch to "All pages in this lesson" (so they can review prior feedback when returning). Below that, a scrollable list of existing comments grouped by **section anchor** (e.g. `Page 3 · Paragraph 2`, `Page 5 · Code block`). Each comment shows a mono timestamp, the learner's text in Public Sans, and a small ghost reply-from-staff thread underneath when staff has responded. At the bottom, a sticky composer: a textarea ("What would you change about this section?"), a small **section anchor pill** showing where the comment will attach (auto-detected from the learner's current scroll position, manually selectable from a dropdown), and a sharp terracotta `POST` button.

**When attaching to a specific section:** while the panel is open, hovering a paragraph in the lesson body shows a quiet bordered outline + a small "+" icon at the right margin. Clicking it pre-fills the section anchor pill in the composer. This is the "comment on a specific paragraph" affordance.

**Closed state behaviour:** if there are unread staff replies on this lesson, the right-edge pill shows a small terracotta dot. Otherwise no decoration.

### Widget B — Highlight + notes (desktop only)

A selection-driven annotation tool. Learners select text in the body, choose to highlight it (persistent coloured background) and optionally attach a private note. Notes aggregate into a side panel they can review later. **Desktop-only**, marked clearly. Mobile shows a quiet inline message that the feature is desktop-only.

**Selection popover:** when the learner selects a span of body text, a small bordered popover appears just above the selection, sharp `border-2 rounded-none`, content in mono uppercase: `HIGHLIGHT` (sage green tint) · `HIGHLIGHT + NOTE` · `CANCEL`. No icons, no decoration, no shadow.

**Highlight rendering:** the selected span gains a persistent muted-sage background (sample from the Stone & Sage palette, low chroma, readable in light + dark). When a note is attached to the highlight, a small mono superscript number appears at the end of the highlight (e.g. ¹) AND a small note-icon mark appears in the right margin aligned to the highlight's first line.

**Note compose:** a thin bordered popover appears anchored to the highlight's right margin. Textarea with placeholder "Note to self...", `SAVE` button (sharp terracotta), `DELETE` ghost. Posting saves to the learner's private notes for this lesson.

**Notes aggregation panel:** a second right-edge affordance, distinct from the feedback pill, anchored above or below it. Pill label `NOTES · 7` (count = number of highlights+notes on this lesson). Click toggles a panel from the right (same width as feedback panel, can replace feedback panel rather than stack). The panel lists each highlight as a card-less row: the quoted text in italic Vollkorn, the note in Public Sans muted-foreground beneath, a small mono timestamp, a "Jump to" link that scrolls the body to that highlight and briefly flashes it, and a quiet trash icon to delete. Group by page (`PAGE 3 · 4 NOTES`).

**Mobile state:** instead of the highlight tool, a quiet single-line message at the top of the lesson body: "Highlights and notes are available on desktop." No popover, no broken affordance.

## 2. How the two widgets coexist

- Both widgets use the same right-edge pill idiom, stacked vertically on the right edge of the viewport, mid-height. `FEEDBACK` pill above `NOTES` pill, both slim, both sharp-bordered.
- When one panel opens, the other pill remains visible at the top of the panel as a quick-switch tab (so a learner reviewing notes can flip to feedback in one click without closing).
- Neither widget covers the audio bar at the bottom. Both widgets stop short of it.
- Neither widget covers the optional left outline rail. The outline rail is on the left; the widgets are on the right. Body column stays centered.
- Keyboard: `f` toggles feedback panel, `n` toggles notes panel, `Esc` closes any open panel. Show this in the panel header as a thin mono affordance line: `[F] FEEDBACK · [N] NOTES · [ESC] CLOSE`.

## 3. Hard prohibitions (any one of these = response rejected)

- No SVG logo work.
- No decorative eyebrow pills above headlines. Functional pills (count chips, page-anchor chips, mono labels) are fine.
- No gradient backgrounds, no gradient text.
- No drop shadows. Use sharp borders.
- No rounded blobby buttons. All buttons match home-page sharp-bordered language: `border-2 rounded-none`, uppercase, `font-bold tracking-wider`.
- No modal-first interactions. Both widgets are panels and inline popovers, never full-screen modals.
- No fake counts ("327 learners commented on this section"). The count is the holder's own count.
- No emoji reactions, no thumbs-up, no smiley faces. This is feedback for serious adult learners, not a social network.
- No nested cards (a card inside a card inside a card).
- No "How to use" UI copy explaining the widgets. The interface should explain itself with placeholder text and the keyboard hint strip.
- No em dashes in visible UI copy. Use commas or a colon.
- Do NOT redesign the lesson viewer page chrome, audio bar, outline rail, or lesson body typography. Render the host body as a stripped-down placeholder; widgets are the focus.
- Do NOT introduce aqua / mint / Inter, those were the pre-2026-04-29 register and are dead.
- Do NOT add a public/social layer. Comments are private between the learner and staff. Notes are private to the learner.

## 4. Required surfaces

### Surface 1 — Default state, both pills visible (desktop 1440px)

- Stripped-down lesson body in the centre (just two paragraphs of placeholder prose, audio bar suggested as a thin bottom strip).
- Right edge: `FEEDBACK · 3` pill above `NOTES · 7` pill, both collapsed.
- No panels open. Show the small terracotta dot on the FEEDBACK pill (unread staff reply).

### Surface 2 — Feedback panel open with composer (desktop 1440px)

- FEEDBACK panel expanded, ~400px wide.
- Panel header: `FEEDBACK · LESSON 13`, section selector beneath ("This page" / "All pages"), `[F] · [N] · [ESC]` keyboard strip.
- List of 3 existing comments grouped by section anchor (`PAGE 3 · PARAGRAPH 2`, `PAGE 5 · CODE BLOCK`, `PAGE 7 · IMAGE`). Show one with a staff reply expanded beneath.
- Composer at bottom: textarea, section anchor pill auto-set to current scroll position (`PAGE 4 · PARAGRAPH 1`), terracotta `POST` button.
- In the body, a hovered paragraph shows the bordered outline + "+" icon affordance.

### Surface 3 — Notes panel open with aggregated highlights (desktop 1440px)

- NOTES panel expanded, ~400px wide (replaces the feedback panel position).
- Panel header: `NOTES · LESSON 13`, `[F] · [N] · [ESC]` keyboard strip.
- List grouped by page: `PAGE 3 · 4 NOTES`, `PAGE 5 · 2 NOTES`, `PAGE 7 · 1 NOTE`. Each row: italic Vollkorn quoted span, Public Sans muted note beneath, mono timestamp, "Jump to" ghost link, trash ghost icon.
- In the body, render a few visible highlights (sage muted background) with margin note-marks; one highlight is currently selected/focused with a slightly stronger border.

### Surface 4 — Selection popover during text selection (desktop 1440px, focused detail)

- Body shows a span of text actively selected (e.g. mid-paragraph).
- Bordered popover anchored just above the selection: `HIGHLIGHT · HIGHLIGHT + NOTE · CANCEL`, sharp border, sage green tint on `HIGHLIGHT`, terracotta on `HIGHLIGHT + NOTE`.

### Surface 5 — Note compose popover after `HIGHLIGHT + NOTE` (desktop 1440px, focused detail)

- The selected span now has the sage muted background and a margin note-mark.
- A bordered popover anchored to the highlight's right margin: textarea ("Note to self..."), `SAVE` terracotta button, `DELETE` ghost button.

### Surface 6 — Mobile 412px

- Stripped-down body.
- Top of body: single quiet line "Highlights and notes are available on desktop." in muted-foreground.
- Right edge: only the `FEEDBACK · 3` pill (notes pill hidden on mobile). Tapping it slides up a sheet from the bottom rather than a side panel — sheet contains the same composer + comment list.

### Optional if quota allows

- Dark mode for Surface 1.
- Empty state for the FEEDBACK panel (no comments yet): a single italic Vollkorn line "No feedback yet." plus the composer.
- Empty state for the NOTES panel: a single italic Vollkorn line "No highlights yet. Select text in the lesson to start." plus a tiny mono key hint.

## 5. Information architecture rules

- Widgets render in a fixed right-edge column. They do NOT push body content; the body column stays centered at ~720px regardless of widget state. When a panel opens, it overlays the right margin of the viewport, not the body column.
- Both panels and both popovers use the same sharp-bordered language as home-page buttons. Single border, no shadow, no blur.
- Mono uppercase only for: panel headers, count pills, section anchor chips, keyboard hints, timestamps. Italic Vollkorn only for: quoted highlight spans in the notes list, optional empty-state lines. Public Sans for everything else.
- Sage muted highlight colour must be readable in both light and dark, with body text contrast preserved (WCAG AA minimum).

## 6. Current implementation to respect

- Lesson viewer route: `src/app/(dashboard)/lessons/[slug]/page.tsx` (or sibling).
- Widgets will mount inside the lesson body shell as fixed-position children that share the viewport with the audio bar (z-index below the audio bar so the audio bar always wins).
- Comment data model: comments scoped by `lessonId` + `pageNumber` + `sectionAnchor`, with optional `staffReply` thread. Private to the learner (no other learner reads).
- Notes data model: highlights scoped by `lessonId` + `pageNumber` + `selectionRange` (text offsets), optional `noteBody`. Private to the learner.

## 7. Deliverables

- Surface 1 — default state (both pills visible) at 1440px.
- Surface 2 — feedback panel with composer at 1440px.
- Surface 3 — notes panel with aggregated highlights at 1440px.
- Surface 4 — selection popover (focused detail) at 1440px.
- Surface 5 — note compose popover (focused detail) at 1440px.
- Surface 6 — mobile 412px.
- Concise implementation handoff: component list (right-edge pill, side panel, comment list item, composer, selection popover, note compose popover, highlight span, margin note-mark, notes-list row, mobile sheet), state machine (collapsed / panel-A open / panel-B open / selection-active / note-composing), exact button copy and keyboard mapping.
- Short list of anything the codebase needs before this can be fully wired (e.g. selection range serialisation, section anchor format, private comments table, staff reply notification channel).

## 8. Quality bar

- A learner reading should never feel the widgets compete with the prose. Pills are slim and quiet by default.
- Posting a comment on a specific paragraph must be fast and obvious: select the paragraph affordance, type, post. No friction.
- Highlighting must feel native, like a Kindle highlight, not like a bolted-on Chrome extension.
- The mobile experience must NOT pretend the highlight tool exists. State the limitation calmly and move on.
- David should be able to drop these widgets into the existing lesson viewer route without touching the page chrome, audio bar, or outline rail.
