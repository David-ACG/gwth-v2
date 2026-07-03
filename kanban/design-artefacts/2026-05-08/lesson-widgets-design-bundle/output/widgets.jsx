/* GWTH.ai — Lesson viewer widgets
 * Stone & Sage register inherited from the home/dashboard.
 *
 * What lives here:
 *   - HostBody: stripped-down placeholder of the locked lesson viewer.
 *     A thin top progress strip, a ~720px prose column, an audio-bar
 *     suggestion pinned bottom. Widgets are FIXED children of this shell.
 *   - EdgePill: slim vertical right-edge tab (FEEDBACK · 3 / NOTES · 7).
 *   - SidePanel: right-edge slide-out, sharp single left border.
 *   - PanelHeader: mono uppercase title + section selector + [F]·[N]·[ESC]
 *     keyboard hint strip.
 *   - CommentRow / Composer: feedback panel innards.
 *   - NoteRow / HighlightSpan / MarginMark: notes panel innards.
 *   - SelectionPopover, NoteComposePopover: anchored body overlays.
 *   - MobileSheet: bottom-sheet alternative for the feedback widget.
 *
 * Tokens come from styles.css. No new colors. No SVG logos. No shadows.
 */

// ── Sage muted highlight tints ───────────────────────────────────
// Sampled from Stone & Sage. Low chroma so body text contrast is preserved.
// Light: warm sage on stone background (4.6:1 against --foreground).
// Dark:  deeper sage on warm forest background.
const SAGE_HL_LIGHT = 'oklch(0.86 0.05 145)';
const SAGE_HL_LIGHT_FOCUS = 'oklch(0.78 0.07 145)';
const SAGE_HL_DARK = 'oklch(0.42 0.06 145)';
const SAGE_HL_DARK_FOCUS = 'oklch(0.50 0.08 145)';

// ── HostBody ─────────────────────────────────────────────────────
// Stripped-down lesson viewer. Single editorial column, ~720px wide,
// progress strip on top, audio bar pinned bottom. Children render INSIDE
// the body's positioning context so fixed-style overlays (panels, pills,
// popovers) sit relative to the artboard, not the page.
function HostBody({ mode = 'light', mobile = false, hoveredParagraph = null,
                   children, lessonTitle = 'Reading the room',
                   lessonNumber = '13', section = 'Module 04 · Delivery',
                   pageNumber = 4 }) {
  return (
    <div className="gwth-root" data-mode={mode}
      style={{
        position: 'relative', height: '100%', width: '100%',
        background: 'var(--background)', color: 'var(--foreground)',
        overflow: 'hidden',
      }}>
      {/* Top chrome — thinned to a progress strip + lesson breadcrumb */}
      <HostTopChrome lessonTitle={lessonTitle} lessonNumber={lessonNumber}
                     section={section} pageNumber={pageNumber} mobile={mobile} />

      {/* Optional left outline rail — placeholder, just a thin column */}
      {!mobile && <OutlineRailPlaceholder />}

      {/* Prose column.
          Brief: body stays centered at ~720px regardless of widget state.
          On desktop the centered 720 column lives well clear of the 36px
          right-edge pill column (the gutter is ~324px each side at 1440).
          On mobile the body would otherwise extend to x≈396 and the pill
          (right:0, w:36) overlaps the last ~20px — so on mobile we inset
          the body by `pillReserve` on the right to keep the pill's column
          free of prose at all times. */}
      <article style={{
        position: 'absolute',
        top: mobile ? 64 : 80,
        bottom: 64,
        left: mobile ? 16 : '50%',
        right: mobile ? 56 : 'auto',
        transform: mobile ? 'none' : 'translateX(-50%)',
        width: mobile ? 'auto' : 720,
        maxWidth: '100%',
        padding: mobile ? '24px 0 40px' : '36px 0 60px',
        overflow: 'hidden',
      }}>
        <ProsePlaceholder hoveredParagraph={hoveredParagraph} mobile={mobile}>
          {children}
        </ProsePlaceholder>
      </article>

      {/* Audio bar — quiet bottom strip */}
      <HostAudioBar mobile={mobile} />
    </div>
  );
}

function HostTopChrome({ lessonTitle, lessonNumber, section, pageNumber, mobile }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: mobile ? 64 : 80,
      borderBottom: '1px solid var(--border)',
      background: 'var(--background)',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: mobile ? '14px 16px 0' : '18px 24px 0',
      zIndex: 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, minWidth: 0 }}>
          <span className="label" style={{ flexShrink: 0 }}>L{lessonNumber} · {section}</span>
          {!mobile && (
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em',
                           color: 'var(--foreground)', whiteSpace: 'nowrap',
                           overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {lessonTitle}
            </span>
          )}
        </div>
        <span className="label num" style={{ flexShrink: 0 }}>P{pageNumber} / 09</span>
      </div>
      {/* Page progress: 9 sharp ticks, 4 filled */}
      <div style={{ display: 'flex', gap: 3, marginBottom: -1 }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3,
            background: i < pageNumber ? 'var(--primary)'
                       : i === pageNumber ? 'var(--foreground)'
                       : 'var(--muted)',
            opacity: i === pageNumber ? 0.4 : 1,
          }} />
        ))}
      </div>
    </div>
  );
}

function OutlineRailPlaceholder() {
  return (
    <div aria-hidden style={{
      position: 'absolute', top: 80, bottom: 64, left: 0, width: 56,
      borderRight: '1px solid var(--border)',
      background: 'var(--background)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: 24, gap: 14, zIndex: 0,
    }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} style={{
          width: 22, height: 6,
          background: i === 3 ? 'var(--primary)' : 'var(--border-strong)',
          opacity: i === 3 ? 1 : 0.18,
        }} />
      ))}
    </div>
  );
}

function HostAudioBar({ mobile }) {
  return (
    <div aria-hidden style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 64,
      borderTop: '2px solid var(--border-strong)',
      background: 'var(--card)',
      display: 'flex', alignItems: 'center', gap: 14,
      padding: mobile ? '0 14px' : '0 24px',
      zIndex: 50, // panels/pills sit BELOW per the brief
    }}>
      {/* Play button placeholder */}
      <div style={{
        width: 36, height: 36, border: '2px solid var(--border-strong)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <div style={{ width: 0, height: 0, borderTop: '6px solid transparent',
                      borderBottom: '6px solid transparent',
                      borderLeft: '9px solid var(--foreground)', marginLeft: 2 }} />
      </div>
      {/* Track label */}
      {!mobile && (
        <span className="label" style={{ flexShrink: 0 }}>L13 · P4 · 02:14 / 06:38</span>
      )}
      {/* Scrub track */}
      <div style={{ flex: 1, height: 3, background: 'var(--muted)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, height: '100%',
                      width: '34%', background: 'var(--primary)' }} />
      </div>
      {/* Auto-advance toggle placeholder */}
      {!mobile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span className="label">AUTO</span>
          <div style={{
            width: 28, height: 16, border: '2px solid var(--border-strong)',
            position: 'relative', background: 'var(--foreground)',
          }}>
            <div style={{ position: 'absolute', top: 1, right: 1,
                          width: 10, height: 10, background: 'var(--background)' }} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── ProsePlaceholder ─────────────────────────────────────────────
// Two paragraphs of editorial prose. One can be flagged as hovered (a
// quiet bordered outline + "+" margin affordance) to demo the section-
// attach interaction in the FEEDBACK panel surface.
function ProsePlaceholder({ hoveredParagraph = null, mobile, children }) {
  return (
    <div style={{
      fontFamily: '"Public Sans", sans-serif',
      fontSize: mobile ? 16 : 18,
      lineHeight: 1.6,
      color: 'var(--foreground)',
      letterSpacing: '-0.005em',
      maxWidth: '100%',
    }}>
      <div className="label" style={{ marginBottom: 10 }}>PAGE 4 · DELIVERY</div>
      <h1 style={{
        fontFamily: '"Public Sans", sans-serif',
        fontWeight: 700, fontSize: mobile ? 26 : 34, lineHeight: 1.1,
        letterSpacing: '-0.025em', margin: '0 0 18px',
        color: 'var(--foreground)',
      }}>
        Reading the room.
      </h1>

      <Paragraph hovered={hoveredParagraph === 1}>
        The work that survives a meeting is rarely the work with the cleanest
        slides. It is the work that arrives at the right moment, in language
        the room is already speaking, with the right person carrying it.
      </Paragraph>

      <Paragraph hovered={hoveredParagraph === 2}>
        Delivery is not performance. It is the practice of noticing what the
        room needs before it asks. A small pause where a senior leader is
        catching up. A recap where two stakeholders disagree about the
        framing. <span className="serif" style={{ fontWeight: 600,
            color: 'var(--primary)' }}>Pace is information.</span> The room
        will tell you what it needs if you let it.
      </Paragraph>

      {children}
    </div>
  );
}

function Paragraph({ hovered, children }) {
  return (
    <div style={{ position: 'relative', margin: '0 0 22px' }}>
      <p style={{
        margin: 0,
        padding: hovered ? '8px 12px' : 0,
        marginLeft: hovered ? -12 : 0,
        marginRight: hovered ? -12 : 0,
        border: hovered ? '1px solid var(--border-strong)' : '1px solid transparent',
        background: hovered ? 'var(--card)' : 'transparent',
        transition: 'none',
      }}>{children}</p>
      {hovered && (
        <button aria-label="Attach feedback to this paragraph" style={{
          position: 'absolute', right: -36, top: 6,
          width: 24, height: 24,
          border: '2px solid var(--border-strong)', background: 'var(--card)',
          color: 'var(--foreground)', fontSize: 16, lineHeight: 1, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 0, fontFamily: 'inherit', borderRadius: 0,
        }}>+</button>
      )}
    </div>
  );
}

// ── EdgePill ─────────────────────────────────────────────────────
// Slim vertical right-edge affordance. Sharp left border, no shadow, no
// rounding. Mono uppercase label is rotated by writing-mode so it reads
// top-down. A small terracotta dot in the corner signals unread staff
// reply.
function EdgePill({ label, count, top, dot = false, active = false, panelOpen = false }) {
  // When the panel is open, the pill DOCKS to the panel's left edge as a
  // quick-switch tab. We just push it leftwards by the panel width via the
  // `right` offset, which is set by the parent.
  const fg = active ? 'var(--primary-foreground)' : 'var(--foreground)';
  const bg = active ? 'var(--primary)' : 'var(--card)';
  const border = active ? 'var(--primary)' : 'var(--border-strong)';

  return (
    <div style={{
      position: 'absolute', right: 0, top,
      width: 36,
      borderTop: `2px solid ${border}`,
      borderBottom: `2px solid ${border}`,
      borderLeft: `2px solid ${border}`,
      background: bg, color: fg,
      cursor: 'pointer', userSelect: 'none',
      zIndex: 40,
    }}>
      <div style={{
        writingMode: 'vertical-rl',
        textOrientation: 'mixed',
        transform: 'rotate(180deg)',
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 11, fontWeight: 600, letterSpacing: '0.16em',
        textTransform: 'uppercase',
        padding: '14px 0',
        textAlign: 'center',
        margin: '0 auto',
      }}>
        {label}
        {typeof count === 'number' && (
          <span style={{ marginTop: 8, display: 'inline-block',
                         color: active ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                         fontWeight: 500 }}>
            {' · '}{count}
          </span>
        )}
      </div>
      {dot && (
        <div style={{ position: 'absolute', top: 6, left: 6,
                      width: 7, height: 7, background: 'var(--primary)',
                      border: '1px solid var(--background)' }} />
      )}
    </div>
  );
}

// ── SidePanel ────────────────────────────────────────────────────
// Right-edge slide-out, sharp single left border. Reserves space for the
// audio bar at the bottom (z-index 50 on the audio bar wins). The pill
// for the OTHER widget docks to the panel's left edge as a quick-switch
// tab.
function SidePanel({ children, mode = 'light', width = 400, top = 0,
                    siblingPill = null }) {
  return (
    <>
      {siblingPill}
      <aside data-mode={mode} style={{
        position: 'absolute', right: 0, top, bottom: 64, width,
        background: 'var(--card)',
        borderLeft: '2px solid var(--border-strong)',
        display: 'flex', flexDirection: 'column',
        zIndex: 30,
      }}>
        {children}
      </aside>
    </>
  );
}

// ── PanelHeader ──────────────────────────────────────────────────
function PanelHeader({ title, accent = null, scopePicker = null,
                      activeKey = 'F' }) {
  return (
    <div style={{
      borderBottom: '2px solid var(--border-strong)',
      padding: '18px 20px 14px',
      flexShrink: 0,
    }}>
      <div className="label" style={{
        fontSize: 12, letterSpacing: '0.18em',
        color: 'var(--foreground)', fontWeight: 600,
      }}>
        {title}
        {accent && <span style={{ color: 'var(--primary)' }}>{' · '}{accent}</span>}
      </div>

      {scopePicker}

      {/* keyboard strip */}
      <div style={{
        marginTop: 14,
        display: 'flex', gap: 0,
        border: '1px solid var(--border)',
      }}>
        <KeyChip k="F" label="FEEDBACK" active={activeKey === 'F'} />
        <KeyChip k="N" label="NOTES" active={activeKey === 'N'} />
        <KeyChip k="ESC" label="CLOSE" active={false} />
      </div>
    </div>
  );
}

function KeyChip({ k, label, active }) {
  return (
    <div style={{
      flex: 1,
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '7px 10px',
      borderLeft: '1px solid var(--border)',
      background: active ? 'var(--muted)' : 'transparent',
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
      color: 'var(--muted-foreground)',
    }}>
      <span style={{
        border: '1.5px solid var(--border-strong)',
        padding: '1px 5px', minWidth: 18, textAlign: 'center',
        color: 'var(--foreground)', fontWeight: 600,
        fontSize: 9.5, letterSpacing: '0.06em',
      }}>{k}</span>
      <span style={{ fontWeight: 500 }}>{label}</span>
    </div>
  );
}

// ── ScopePicker ──────────────────────────────────────────────────
// Two-state segmented control: This page · All pages.
function ScopePicker({ value = 'page' }) {
  const opts = [{ k: 'page', label: 'This page' },
                { k: 'all',  label: 'All pages' }];
  return (
    <div style={{
      marginTop: 12,
      display: 'flex',
      border: '1px solid var(--border-strong)',
    }}>
      {opts.map((o, i) => (
        <button key={o.k} style={{
          flex: 1,
          padding: '7px 10px',
          fontFamily: 'inherit',
          fontSize: 12, fontWeight: value === o.k ? 700 : 500,
          letterSpacing: '0.02em',
          background: value === o.k ? 'var(--foreground)' : 'transparent',
          color: value === o.k ? 'var(--background)' : 'var(--foreground)',
          borderLeft: i ? '1px solid var(--border-strong)' : 'none',
          border: 'none', cursor: 'pointer', borderRadius: 0,
          textAlign: 'center',
        }}>{o.label}</button>
      ))}
    </div>
  );
}

// ── SectionAnchorChip ────────────────────────────────────────────
// Mono uppercase chip showing where a comment attaches.
function SectionAnchorChip({ children, dim = false }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
      fontWeight: 500,
      padding: '3px 7px',
      border: '1px solid ' + (dim ? 'var(--border)' : 'var(--border-strong)'),
      color: dim ? 'var(--muted-foreground)' : 'var(--foreground)',
      background: 'transparent',
    }}>{children}</span>
  );
}

// ── CommentRow ───────────────────────────────────────────────────
function CommentRow({ anchor, time, body, staffReply = null }) {
  return (
    <div style={{
      borderBottom: '1px solid var(--border)',
      padding: '16px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <SectionAnchorChip>{anchor}</SectionAnchorChip>
        <span className="label num" style={{ fontSize: 10 }}>{time}</span>
      </div>
      <p style={{
        margin: 0, fontSize: 14, lineHeight: 1.5,
        color: 'var(--foreground)',
      }}>{body}</p>
      {staffReply && (
        <div style={{
          marginTop: 12,
          paddingLeft: 12,
          borderLeft: '2px solid var(--primary)',
        }}>
          <div className="label" style={{ color: 'var(--primary)', marginBottom: 4 }}>
            STAFF · {staffReply.author}
          </div>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5,
                      color: 'var(--muted-foreground)' }}>
            {staffReply.body}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Composer ─────────────────────────────────────────────────────
function Composer({ anchor = 'PAGE 4 · PARAGRAPH 1', text = '' }) {
  return (
    <div style={{
      borderTop: '2px solid var(--border-strong)',
      padding: 16,
      background: 'var(--card)',
      flexShrink: 0,
    }}>
      <textarea
        defaultValue={text}
        placeholder="What would you change about this section?"
        style={{
          width: '100%', minHeight: 72,
          fontFamily: 'inherit', fontSize: 14, lineHeight: 1.5,
          color: 'var(--foreground)',
          background: 'var(--background)',
          border: '1.5px solid var(--border)',
          padding: '10px 12px',
          resize: 'none', outline: 'none', borderRadius: 0,
        }}
      />
      <div style={{
        marginTop: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span className="label" style={{ fontSize: 10 }}>ATTACH</span>
          <SectionAnchorChip>{anchor}</SectionAnchorChip>
        </div>
        <button className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>POST</button>
      </div>
    </div>
  );
}

// ── HighlightSpan + MarginMark ───────────────────────────────────
function HighlightSpan({ children, focused = false, num = null, mode = 'light' }) {
  const bg = mode === 'dark'
    ? (focused ? SAGE_HL_DARK_FOCUS : SAGE_HL_DARK)
    : (focused ? SAGE_HL_LIGHT_FOCUS : SAGE_HL_LIGHT);
  return (
    <span style={{
      background: bg,
      padding: '0 2px',
      borderRadius: 0,
      borderBottom: focused ? '1.5px solid var(--border-strong)' : 'none',
    }}>
      {children}
      {typeof num === 'number' && (
        <sup style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 9.5, fontWeight: 600,
          marginLeft: 2,
          color: 'var(--foreground)',
          letterSpacing: 0,
        }}>{num}</sup>
      )}
    </span>
  );
}

function MarginMark({ top, focused = false }) {
  return (
    <div aria-hidden style={{
      position: 'absolute', right: -28, top,
      width: 14, height: 14,
      border: focused ? '2px solid var(--border-strong)' : '1.5px solid var(--border-strong)',
      background: focused ? 'var(--foreground)' : 'var(--card)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 6, height: 1.5, background: focused ? 'var(--background)' : 'var(--foreground)',
      }} />
    </div>
  );
}

// ── NoteRow ──────────────────────────────────────────────────────
function NoteRow({ quote, note, time, focused = false }) {
  return (
    <div style={{
      padding: '14px 20px 16px',
      borderBottom: '1px solid var(--border)',
      background: focused ? 'oklch(0.94 0.04 40 / 0.4)' : 'transparent',
      borderLeft: focused ? '3px solid var(--primary)' : '3px solid transparent',
    }}>
      <p className="serif" style={{
        margin: 0, fontSize: 14.5, lineHeight: 1.45,
        color: 'var(--foreground)',
      }}>
        “{quote}”
      </p>
      {note && (
        <p style={{
          margin: '8px 0 0', fontSize: 13, lineHeight: 1.5,
          color: 'var(--muted-foreground)',
        }}>{note}</p>
      )}
      <div style={{
        marginTop: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 8,
      }}>
        <span className="label num" style={{ fontSize: 10 }}>{time}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button style={{
            border: 'none', background: 'transparent',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase',
            fontWeight: 600,
            color: 'var(--foreground)',
            padding: 0, cursor: 'pointer',
            borderBottom: '1.5px solid var(--foreground)',
          }}>JUMP TO</button>
          <button aria-label="Delete note" style={{
            border: 'none', background: 'transparent',
            color: 'var(--muted-foreground)', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center',
          }}>
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

function TrashIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none"
         stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
      <path d="M2 3.5h10M5.5 1.5h3M3 3.5l.6 8.5h6.8l.6-8.5M5.5 5.5v5M8.5 5.5v5" />
    </svg>
  );
}

// ── PageGroupHeader ──────────────────────────────────────────────
function PageGroupHeader({ children }) {
  return (
    <div style={{
      padding: '14px 20px 8px',
      background: 'var(--background)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0,
    }}>
      <div className="label" style={{
        fontSize: 11, fontWeight: 600, color: 'var(--foreground)',
      }}>{children}</div>
    </div>
  );
}

// ── SelectionPopover ─────────────────────────────────────────────
function SelectionPopover({ left, top }) {
  return (
    <div style={{
      position: 'absolute', left, top,
      transform: 'translate(-50%, -100%)',
      marginTop: -10,
      display: 'flex',
      border: '2px solid var(--border-strong)',
      background: 'var(--card)',
      zIndex: 60,
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 11, fontWeight: 600, letterSpacing: '0.14em',
      textTransform: 'uppercase',
    }}>
      <button style={{
        padding: '10px 14px',
        background: SAGE_HL_LIGHT,
        color: 'var(--foreground)',
        border: 'none', cursor: 'pointer', borderRadius: 0,
        fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit',
        letterSpacing: 'inherit', textTransform: 'inherit',
      }}>HIGHLIGHT</button>
      <button style={{
        padding: '10px 14px',
        background: 'var(--primary)',
        color: 'var(--primary-foreground)',
        border: 'none', borderLeft: '2px solid var(--border-strong)',
        cursor: 'pointer', borderRadius: 0,
        fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit',
        letterSpacing: 'inherit', textTransform: 'inherit',
      }}>HIGHLIGHT + NOTE</button>
      <button style={{
        padding: '10px 14px',
        background: 'transparent',
        color: 'var(--muted-foreground)',
        border: 'none', borderLeft: '2px solid var(--border-strong)',
        cursor: 'pointer', borderRadius: 0,
        fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit',
        letterSpacing: 'inherit', textTransform: 'inherit',
      }}>CANCEL</button>
      {/* tail */}
      <div aria-hidden style={{
        position: 'absolute', left: '50%', top: '100%',
        transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: '7px solid transparent',
        borderRight: '7px solid transparent',
        borderTop: '7px solid var(--border-strong)',
      }} />
    </div>
  );
}

// ── NoteComposePopover ───────────────────────────────────────────
function NoteComposePopover({ left, top }) {
  return (
    <div style={{
      position: 'absolute', left, top,
      width: 280,
      border: '2px solid var(--border-strong)',
      background: 'var(--card)',
      zIndex: 60,
      padding: 12,
    }}>
      <div className="label" style={{ marginBottom: 8, color: 'var(--foreground)' }}>
        NOTE TO SELF · P4
      </div>
      <textarea
        defaultValue="Pace is information — bring this back to the kickoff slide."
        placeholder="Note to self..."
        style={{
          width: '100%', minHeight: 72,
          fontFamily: 'inherit', fontSize: 13, lineHeight: 1.5,
          color: 'var(--foreground)',
          background: 'var(--background)',
          border: '1.5px solid var(--border)',
          padding: '8px 10px',
          resize: 'none', outline: 'none', borderRadius: 0,
        }}
      />
      <div style={{
        marginTop: 10, display: 'flex', gap: 8,
        justifyContent: 'flex-end',
      }}>
        <button className="btn btn-ghost btn-sm">DELETE</button>
        <button className="btn btn-primary btn-sm">SAVE</button>
      </div>
    </div>
  );
}

// ── MobileSheet ──────────────────────────────────────────────────
// Bottom-sheet for the FEEDBACK widget on mobile. Sits above the audio bar
// (audio bar still owns the very bottom).
function MobileSheet({ children }) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 64,
      maxHeight: '78%',
      background: 'var(--card)',
      borderTop: '2px solid var(--border-strong)',
      display: 'flex', flexDirection: 'column',
      zIndex: 30,
    }}>
      {/* drag handle */}
      <div style={{
        padding: '10px 0 6px',
        display: 'flex', justifyContent: 'center',
      }}>
        <div style={{ width: 36, height: 3, background: 'var(--border-strong)' }} />
      </div>
      {children}
    </div>
  );
}

// expose
Object.assign(window, {
  HostBody, EdgePill, SidePanel, PanelHeader, ScopePicker,
  SectionAnchorChip, CommentRow, Composer,
  HighlightSpan, MarginMark, NoteRow, PageGroupHeader,
  SelectionPopover, NoteComposePopover, MobileSheet,
  Paragraph, ProsePlaceholder, HostAudioBar,
  SAGE_HL_LIGHT, SAGE_HL_DARK,
});
