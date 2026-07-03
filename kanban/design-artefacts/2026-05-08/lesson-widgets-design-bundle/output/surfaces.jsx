/* GWTH.ai lesson viewer widgets — surfaces
 * Six artboards composing the widget primitives onto the stripped-down
 * host body. Each surface is a single artboard so it can be exported,
 * inline-renamed, drag-reordered, and focused fullscreen via the canvas.
 */

// Right-edge layout constants used across the surfaces. Both pills share
// one vertical column, mid-height, and the open panel slots into the same
// column. Pill heights are sized so the count + label have room to breathe.
const PILL_FEEDBACK_H = 168;
const PILL_NOTES_H    = 130;
const PILL_GAP        = 6;
const PILL_TOP        = 280;        // 1440×900-ish; mid-height of body
const PILL_TOP_NOTES  = PILL_TOP + PILL_FEEDBACK_H + PILL_GAP;
const PANEL_W         = 400;
const PANEL_TOP       = 80;         // below top chrome

// ── Surface 1 — Default state, both pills visible ───────────────
function SurfaceDefault({ mode = 'light' }) {
  return (
    <HostBody mode={mode}>
      <EdgePill label="FEEDBACK" count={3} top={PILL_TOP} dot />
      <EdgePill label="NOTES" count={7} top={PILL_TOP_NOTES} />
    </HostBody>
  );
}

// ── Surface 2 — Feedback panel open ─────────────────────────────
function SurfaceFeedbackOpen({ mode = 'light' }) {
  // While the panel is open, the pill for the OTHER widget docks to the
  // panel's left edge as a quick-switch tab.
  const dockedNotes = (
    <div style={{ position: 'absolute', right: PANEL_W, top: PILL_TOP_NOTES, zIndex: 41 }}>
      <EdgePill label="NOTES" count={7} top={0} />
    </div>
  );
  return (
    <HostBody mode={mode} hoveredParagraph={2}>
      {/* The active pill stays as a docked tab too, so the user can close
          the panel by clicking it. */}
      <div style={{ position: 'absolute', right: PANEL_W, top: PILL_TOP, zIndex: 41 }}>
        <EdgePill label="FEEDBACK" count={3} top={0} active dot />
      </div>
      {dockedNotes}

      <SidePanel mode={mode} top={PANEL_TOP} width={PANEL_W}>
        <PanelHeader title="FEEDBACK" accent="LESSON 13"
          activeKey="F"
          scopePicker={<ScopePicker value="page" />} />

        {/* scrollable comment list */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <CommentRow
            anchor="PAGE 3 · PARAGRAPH 2"
            time="22 APR · 14:08"
            body="The line about ‘who carries the work’ is the one I’d quote, but it’s buried halfway through the paragraph. Could it move up so it lands first?"
            staffReply={{
              author: 'AMY (CONTENT)',
              body: 'Good call — moving it to the lede on the next pass. Tracking as edit-237.',
            }}
          />
          <CommentRow
            anchor="PAGE 5 · CODE BLOCK"
            time="22 APR · 14:14"
            body="The TypeScript snippet uses a generic that hasn’t been introduced yet. Maybe a one-line gloss above it?"
          />
          <CommentRow
            anchor="PAGE 7 · IMAGE"
            time="22 APR · 14:21"
            body="Diagram caption says ‘figure 4’ but it’s the third image on the page."
          />
        </div>

        <Composer anchor="PAGE 4 · PARAGRAPH 1" />
      </SidePanel>
    </HostBody>
  );
}

// ── Surface 3 — Notes panel open ────────────────────────────────
function SurfaceNotesOpen({ mode = 'light' }) {
  const dockedFeedback = (
    <div style={{ position: 'absolute', right: PANEL_W, top: PILL_TOP, zIndex: 41 }}>
      <EdgePill label="FEEDBACK" count={3} top={0} dot />
    </div>
  );

  // Body with a few visible highlights + margin marks. We replace the
  // default prose with the same paragraphs but wrapped highlights inline.
  return (
    <HostBody mode={mode}>
      {dockedFeedback}
      <div style={{ position: 'absolute', right: PANEL_W, top: PILL_TOP_NOTES, zIndex: 41 }}>
        <EdgePill label="NOTES" count={7} top={0} active />
      </div>

      {/* Body overlays — render on top of the default prose to demo
          highlights without recreating the whole article. */}
      <BodyHighlightOverlay mode={mode} />

      <SidePanel mode={mode} top={PANEL_TOP} width={PANEL_W}>
        <PanelHeader title="NOTES" accent="LESSON 13" activeKey="N" />

        <div style={{ flex: 1, overflow: 'hidden' }}>
          <PageGroupHeader>PAGE 3 · 4 NOTES</PageGroupHeader>
          <NoteRow
            quote="who carries the work"
            note="Probably my best line. Bring this to the kickoff template."
            time="22 APR · 14:02"
          />
          <NoteRow
            quote="arrives at the right moment, in language the room is already speaking"
            note=""
            time="22 APR · 14:03"
          />
          <NoteRow
            quote="cleanest slides"
            note="Counterexample: the BD deck last quarter — gorgeous, missed the room entirely."
            time="22 APR · 14:05"
          />
          <NoteRow
            quote="rarely the work"
            note=""
            time="22 APR · 14:06"
          />

          <PageGroupHeader>PAGE 4 · 2 NOTES</PageGroupHeader>
          <NoteRow
            quote="Pace is information."
            note="Use this as the kickoff slide tagline. Italic in the deck."
            time="22 APR · 14:18"
            focused
          />
          <NoteRow
            quote="A small pause where a senior leader is catching up."
            note=""
            time="22 APR · 14:19"
          />

          <PageGroupHeader>PAGE 7 · 1 NOTE</PageGroupHeader>
          <NoteRow
            quote="noticing what the room needs before it asks"
            note="Worth a whole separate session on this with the team."
            time="22 APR · 14:24"
          />
        </div>
      </SidePanel>
    </HostBody>
  );
}

// Highlight overlay — re-renders the prose column with sage muted spans
// where highlights live. Sits on top of the default ProsePlaceholder so the
// margin marks line up with the right-margin column. We render it as the
// SAME column geometry (720px centered, top: 80, bottom: 64) but with
// position: absolute and a transparent paragraph layer that masks the
// underlying default prose for those paragraphs.
function BodyHighlightOverlay({ mode }) {
  return (
    <div style={{
      position: 'absolute', top: 80, bottom: 64,
      left: '50%', transform: 'translateX(-50%)',
      width: 720, padding: '36px 0 60px',
      pointerEvents: 'none',
      fontFamily: '"Public Sans", sans-serif',
      fontSize: 18, lineHeight: 1.6, color: 'var(--foreground)',
      letterSpacing: '-0.005em',
      background: 'var(--background)',
    }}>
      <div className="label" style={{ marginBottom: 10 }}>PAGE 4 · DELIVERY</div>
      <h1 style={{
        fontFamily: '"Public Sans", sans-serif',
        fontWeight: 700, fontSize: 34, lineHeight: 1.1,
        letterSpacing: '-0.025em', margin: '0 0 18px',
      }}>Reading the room.</h1>

      <div style={{ position: 'relative', margin: '0 0 22px' }}>
        <p style={{ margin: 0 }}>
          The work that survives a meeting is rarely the work with the{' '}
          <HighlightSpan mode={mode}>cleanest slides</HighlightSpan>. It is the work
          that arrives at the right moment, in language the room is already speaking,
          with the right person carrying it.
        </p>
      </div>

      <div style={{ position: 'relative', margin: '0 0 22px' }}>
        <p style={{ margin: 0 }}>
          Delivery is not performance. It is the practice of{' '}
          <HighlightSpan mode={mode} num={2}>noticing what the room needs before it asks</HighlightSpan>.
          A small pause where a senior leader is catching up. A recap where two stakeholders
          disagree about the framing. <HighlightSpan mode={mode} focused num={1}>Pace is information.</HighlightSpan>
          {' '}The room will tell you what it needs if you let it.
        </p>
        <MarginMark top={56} focused />
        <MarginMark top={86} />
      </div>
    </div>
  );
}

// ── Surface 4 — Selection popover (focused detail) ──────────────
function SurfaceSelectionPopover({ mode = 'light' }) {
  return (
    <HostBody mode={mode}>
      {/* Pills still visible at right, just to anchor the screen */}
      <EdgePill label="FEEDBACK" count={3} top={PILL_TOP} dot />
      <EdgePill label="NOTES" count={7} top={PILL_TOP_NOTES} />

      {/* Re-render prose with one paragraph showing an active selection */}
      <div style={{
        position: 'absolute', top: 80, bottom: 64,
        left: '50%', transform: 'translateX(-50%)',
        width: 720, padding: '36px 0 60px',
        background: 'var(--background)',
        fontFamily: '"Public Sans", sans-serif',
        fontSize: 18, lineHeight: 1.6, color: 'var(--foreground)',
        letterSpacing: '-0.005em',
      }}>
        <div className="label" style={{ marginBottom: 10 }}>PAGE 4 · DELIVERY</div>
        <h1 style={{
          fontFamily: '"Public Sans", sans-serif',
          fontWeight: 700, fontSize: 34, lineHeight: 1.1,
          letterSpacing: '-0.025em', margin: '0 0 18px',
        }}>Reading the room.</h1>
        <p style={{ margin: '0 0 22px' }}>
          The work that survives a meeting is rarely the work with the cleanest
          slides. It is the work that arrives at the right moment, in language
          the room is already speaking, with the right person carrying it.
        </p>
        <p style={{ margin: 0, position: 'relative' }}>
          Delivery is not performance. It is the{' '}
          <span style={{
            background: 'oklch(0.78 0.10 250 / 0.45)',
            // browser native selection blue — distinct from sage highlight
            padding: '0 2px',
          }}>practice of noticing what the room needs before it asks</span>.
          A small pause where a senior leader is catching up.
        </p>

        {/* Popover anchored just above the selection */}
        <SelectionPopover left={332} top={170} />
      </div>
    </HostBody>
  );
}

// ── Surface 5 — Note compose popover (focused detail) ───────────
function SurfaceNoteCompose({ mode = 'light' }) {
  return (
    <HostBody mode={mode}>
      <EdgePill label="FEEDBACK" count={3} top={PILL_TOP} dot />
      <EdgePill label="NOTES" count={7} top={PILL_TOP_NOTES} />

      <div style={{
        position: 'absolute', top: 80, bottom: 64,
        left: '50%', transform: 'translateX(-50%)',
        width: 720, padding: '36px 0 60px',
        background: 'var(--background)',
        fontFamily: '"Public Sans", sans-serif',
        fontSize: 18, lineHeight: 1.6, color: 'var(--foreground)',
        letterSpacing: '-0.005em',
      }}>
        <div className="label" style={{ marginBottom: 10 }}>PAGE 4 · DELIVERY</div>
        <h1 style={{
          fontFamily: '"Public Sans", sans-serif',
          fontWeight: 700, fontSize: 34, lineHeight: 1.1,
          letterSpacing: '-0.025em', margin: '0 0 18px',
        }}>Reading the room.</h1>
        <p style={{ margin: '0 0 22px' }}>
          The work that survives a meeting is rarely the work with the cleanest
          slides. It is the work that arrives at the right moment, in language
          the room is already speaking, with the right person carrying it.
        </p>
        <div style={{ position: 'relative', margin: 0 }}>
          <p style={{ margin: 0 }}>
            Delivery is not performance. It is the{' '}
            <HighlightSpan mode={mode} focused>
              practice of noticing what the room needs before it asks
            </HighlightSpan>.
            A small pause where a senior leader is catching up. A recap where
            two stakeholders disagree about the framing.
          </p>
          <MarginMark top={32} focused />
          {/* Compose popover anchored to the highlight's right margin */}
          <NoteComposePopover left={696} top={-8} />
        </div>
      </div>
    </HostBody>
  );
}

// ── Surface 6 — Mobile 412px ─────────────────────────────────────
function SurfaceMobile({ sheet = false }) {
  return (
    <HostBody mobile lessonNumber="13">
      {/* Quiet single-line desktop-only message at the top of the body */}
      <div style={{
        margin: '-8px 0 18px',
        paddingBottom: 12,
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{
          width: 6, height: 6, background: 'var(--muted-foreground)',
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: 13, color: 'var(--muted-foreground)',
          lineHeight: 1.4,
        }}>
          Highlights and notes are available on desktop.
        </span>
      </div>

      {!sheet && (
        // Right-edge: ONLY feedback pill on mobile.
        <EdgePill label="FEEDBACK" count={3} top={220} dot />
      )}

      {sheet && (
        <MobileSheet>
          <PanelHeader title="FEEDBACK" accent="L13" activeKey="F" />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <CommentRow
              anchor="P3 · PARA 2"
              time="22 APR · 14:08"
              body="‘Who carries the work’ is the line I’d quote — could it move up?"
              staffReply={{
                author: 'AMY',
                body: 'Moving it to the lede next pass.',
              }}
            />
            <CommentRow
              anchor="P5 · CODE"
              time="22 APR · 14:14"
              body="Generic isn’t introduced yet — one-line gloss above?"
            />
          </div>
          <Composer anchor="P4 · PARA 1" />
        </MobileSheet>
      )}
    </HostBody>
  );
}

// ── Surface 7 — Empty states (optional) ─────────────────────────
function SurfaceEmptyFeedback({ mode = 'light' }) {
  const dockedNotes = (
    <div style={{ position: 'absolute', right: PANEL_W, top: PILL_TOP_NOTES, zIndex: 41 }}>
      <EdgePill label="NOTES" count={0} top={0} />
    </div>
  );
  return (
    <HostBody mode={mode}>
      <div style={{ position: 'absolute', right: PANEL_W, top: PILL_TOP, zIndex: 41 }}>
        <EdgePill label="FEEDBACK" count={0} top={0} active />
      </div>
      {dockedNotes}
      <SidePanel mode={mode} top={PANEL_TOP} width={PANEL_W}>
        <PanelHeader title="FEEDBACK" accent="LESSON 13" activeKey="F"
          scopePicker={<ScopePicker value="page" />} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', padding: 24 }}>
          <p className="serif" style={{
            margin: 0, fontSize: 16, color: 'var(--muted-foreground)',
            textAlign: 'center', lineHeight: 1.5,
          }}>No feedback yet.</p>
        </div>
        <Composer />
      </SidePanel>
    </HostBody>
  );
}

function SurfaceEmptyNotes({ mode = 'light' }) {
  const dockedFeedback = (
    <div style={{ position: 'absolute', right: PANEL_W, top: PILL_TOP, zIndex: 41 }}>
      <EdgePill label="FEEDBACK" count={3} top={0} dot />
    </div>
  );
  return (
    <HostBody mode={mode}>
      {dockedFeedback}
      <div style={{ position: 'absolute', right: PANEL_W, top: PILL_TOP_NOTES, zIndex: 41 }}>
        <EdgePill label="NOTES" count={0} top={0} active />
      </div>
      <SidePanel mode={mode} top={PANEL_TOP} width={PANEL_W}>
        <PanelHeader title="NOTES" accent="LESSON 13" activeKey="N" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', padding: '0 32px' }}>
          <p className="serif" style={{
            margin: 0, fontSize: 16, color: 'var(--muted-foreground)',
            textAlign: 'center', lineHeight: 1.5,
          }}>
            No highlights yet. Select text in the lesson to start.
          </p>
        </div>
      </SidePanel>
    </HostBody>
  );
}

// ── Handoff notes panel ──────────────────────────────────────────
function HandoffNotes() {
  return (
    <div className="gwth-root" data-mode="light"
      style={{ padding: '40px 44px 48px', height: '100%', overflow: 'hidden' }}>
      <div className="label">HANDOFF · GWTH.AI / LESSON WIDGETS</div>
      <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', margin: '8px 0 6px' }}>
        Two widgets, one right-edge column.
      </h1>
      <p className="serif" style={{ fontSize: 15, color: 'var(--muted-foreground)', margin: 0 }}>
        Stone &amp; Sage register, dropped into the locked lesson viewer shell.
      </p>

      <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        <div>
          <div className="label">COMPONENTS</div>
          <ul style={{ marginTop: 8, paddingLeft: 18, fontSize: 13, lineHeight: 1.55 }}>
            <li><b>&lt;EdgePill&gt;</b> — slim vertical right-edge tab. Props: <code>label, count, dot, active, panelOpen</code>. Renders mono uppercase top-down with a count chip and an optional terracotta unread-dot.</li>
            <li><b>&lt;SidePanel&gt;</b> — right-edge slide-out, sharp single left border, stops short of the audio bar. Width 400px desktop. Hosts panel header + scrollable list + composer (feedback) or list-only (notes).</li>
            <li><b>&lt;PanelHeader&gt;</b> — mono uppercase title + scope picker + <code>[F] · [N] · [ESC]</code> keyboard strip.</li>
            <li><b>&lt;CommentRow&gt;</b> — anchor chip · timestamp · body · optional staff reply (terracotta-bordered nested block, never a card-in-a-card).</li>
            <li><b>&lt;Composer&gt;</b> — sticky textarea + section-anchor chip (auto-detected, manually selectable) + terracotta POST.</li>
            <li><b>&lt;HighlightSpan&gt;</b> — sage muted background, optional mono superscript number when a note is attached. Light + dark variants both pass AA.</li>
            <li><b>&lt;MarginMark&gt;</b> — tiny right-margin square aligned to the highlight's first line, filled when focused.</li>
            <li><b>&lt;NoteRow&gt;</b> — italic Vollkorn quote · Public Sans note · mono timestamp · JUMP TO ghost link · trash ghost icon.</li>
            <li><b>&lt;SelectionPopover&gt;</b> — three buttons sharp-bordered: HIGHLIGHT (sage), HIGHLIGHT + NOTE (terracotta), CANCEL (ghost). Tail points to the selection.</li>
            <li><b>&lt;NoteComposePopover&gt;</b> — anchored to highlight's right margin. SAVE (terracotta) · DELETE (ghost).</li>
            <li><b>&lt;MobileSheet&gt;</b> — bottom sheet alternative for the feedback widget on &lt;768px. Notes widget hidden entirely on mobile.</li>
          </ul>
        </div>
        <div>
          <div className="label">STATE MACHINE</div>
          <ul style={{ marginTop: 8, paddingLeft: 18, fontSize: 13, lineHeight: 1.55 }}>
            <li><code>collapsed</code> — both pills visible.</li>
            <li><code>panel-feedback</code> — feedback panel open, notes pill docked.</li>
            <li><code>panel-notes</code> — notes panel open, feedback pill docked.</li>
            <li><code>selection-active</code> — body selection alive, popover above.</li>
            <li><code>note-composing</code> — highlight committed, note popover at right margin.</li>
            <li>Transitions: <code>F</code> / <code>N</code> toggle; <code>Esc</code> exits to <code>collapsed</code>; selecting text overrides into <code>selection-active</code> (panels stay where they were).</li>
          </ul>

          <div className="label" style={{ marginTop: 16 }}>COPY &amp; KEYBOARD</div>
          <ul style={{ marginTop: 8, paddingLeft: 18, fontSize: 13, lineHeight: 1.55 }}>
            <li>Composer placeholder: <i>What would you change about this section?</i></li>
            <li>Note placeholder: <i>Note to self...</i></li>
            <li>Buttons: POST · SAVE · DELETE · HIGHLIGHT · HIGHLIGHT + NOTE · CANCEL · JUMP TO. All <code>border-2 rounded-none</code>, uppercase, tracking-wider.</li>
            <li>Keys: <code>F</code> feedback · <code>N</code> notes · <code>Esc</code> close. Shown as a thin mono strip in panel header.</li>
            <li>Empty-state lines (italic Vollkorn): <i>No feedback yet.</i> · <i>No highlights yet. Select text in the lesson to start.</i></li>
          </ul>
        </div>
      </div>

      <div style={{ marginTop: 22, padding: '16px 18px', border: '2px solid var(--border-strong)' }}>
        <div className="label">WHAT THE CODEBASE NEEDS BEFORE WIRING</div>
        <ol style={{ marginTop: 8, paddingLeft: 20, fontSize: 13, lineHeight: 1.55 }}>
          <li>Section-anchor format: <code>&#123; lessonId, pageNumber, sectionType: 'paragraph'|'code'|'image'|'heading', ordinalWithinPage &#125;</code>. Stamped on every prose block at MDX compile time so the composer can auto-detect from scroll.</li>
          <li>Selection-range serialisation: text-offset pair <code>(startNode, startOffset, endNode, endOffset)</code> resolved against a stable per-page node map (path-by-ordinal, NOT DOM ids), so highlights survive prose edits.</li>
          <li>Private comments table: <code>lesson_feedback(id, learnerId, lessonId, pageNumber, sectionAnchor, body, createdAt)</code> with read access scoped to learner + staff role.</li>
          <li>Staff reply thread: <code>lesson_feedback_replies(id, feedbackId, staffUserId, body, createdAt)</code> + a per-learner unread flag; the unread flag drives the terracotta dot on the FEEDBACK pill.</li>
          <li>Private notes table: <code>lesson_notes(id, learnerId, lessonId, pageNumber, selectionRange, noteBody, createdAt)</code>.</li>
          <li>Mount: widgets live as fixed-position children of the lesson body shell at <code>z-index: 30</code>; audio bar stays at <code>z-index: 50</code> so it always wins.</li>
          <li>Mobile breakpoint: hide notes affordance entirely below 768px; swap feedback panel for the bottom sheet.</li>
        </ol>
      </div>

      <div style={{ marginTop: 18 }}>
        <div className="label">HARD CONSTRAINTS RESPECTED</div>
        <p style={{ fontSize: 12.5, color: 'var(--muted-foreground)',
                    margin: '6px 0 0', lineHeight: 1.5 }}>
          No SVG logos. No decorative eyebrow pills. No gradients. No drop
          shadows. No rounded buttons. No modals. No fake counts. No emoji
          reactions. No nested cards. No aqua / mint / Inter. Body
          typography unchanged. Audio bar, outline rail, page chrome
          untouched.
        </p>
      </div>
    </div>
  );
}

Object.assign(window, {
  SurfaceDefault, SurfaceFeedbackOpen, SurfaceNotesOpen,
  SurfaceSelectionPopover, SurfaceNoteCompose, SurfaceMobile,
  SurfaceEmptyFeedback, SurfaceEmptyNotes, HandoffNotes,
});
