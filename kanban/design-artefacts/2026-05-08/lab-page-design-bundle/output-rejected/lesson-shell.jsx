/* GWTH.ai · Lesson Viewer · shared shell components.
 * Stone & Sage register. Bookish, calm, finishable.
 */

// ── Sidebar (kept slim — same shell as dashboard) ──────────────
function LessonSidebar({ active = 'course' }) {
  const items = [
    { id: 'home',     label: 'Today' },
    { id: 'course',   label: 'Course' },
    { id: 'capstones',label: 'Capstones' },
    { id: 'score',    label: 'Score' },
    { id: 'labs',     label: 'Labs' },
    { id: 'saved',    label: 'Saved' },
    { id: 'account',  label: 'Account' },
  ];
  return (
    <aside style={{
      width: 200, borderRight: '1px solid var(--border)',
      padding: '20px 0 24px', background: 'var(--card)',
      display: 'flex', flexDirection: 'column', flexShrink: 0, minHeight: '100%',
    }}>
      <div style={{ padding: '4px 22px 26px' }}><Logo /></div>
      <div style={{ padding: '0 22px 10px' }}><div className="label">NAV</div></div>
      <nav style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map(it => (
          <a key={it.id} href="#" style={{
            display: 'block', padding: '8px 22px', fontSize: 14,
            fontWeight: it.id === active ? 600 : 400,
            color: it.id === active ? 'var(--foreground)' : 'var(--muted-foreground)',
            borderLeft: it.id === active ? '2px solid var(--primary)' : '2px solid transparent',
            marginLeft: '-2px',
          }}>{it.label}</a>
        ))}
      </nav>
    </aside>
  );
}

// ── Lesson chrome (top of body) ────────────────────────────────
function LessonChrome({
  monthLabel = 'MONTH 1 · LESSON 13',
  lessonNum = 13,
  title = 'Building with Claude: your first useful tool',
  pageNum = 3,
  pageTotal = 8,
  monthDone = 12,
  monthTotal = 24,
  showOutlineToggle = false,
  outlineOpen = true,
  onToggleOutline,
}) {
  // Lesson progress = page count within lesson; course-month progress = lessons done in month.
  const lessonPct = ((pageNum - 1) / pageTotal) * 100; // current page is "in progress"
  const monthPct = (monthDone / monthTotal) * 100;
  return (
    <div style={{ borderBottom: '1px solid var(--border)', padding: '22px 0 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {showOutlineToggle && (
            <button onClick={onToggleOutline} aria-label="Outline" style={{
              width: 28, height: 28, border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--muted-foreground)', cursor: 'pointer', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M2 4h10M2 7h10M2 10h7"/>
              </svg>
            </button>
          )}
          <div className="label">{monthLabel}</div>
        </div>
        <div className="label" style={{ letterSpacing: '0.2em' }}>PAGE {pageNum} OF {pageTotal}</div>
      </div>
      <h1 style={{
        fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.12,
        margin: '12px 0 0', maxWidth: 720,
      }}>{title}</h1>

      {/* segmented progress: lesson + month, two thin bars */}
      <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--muted-foreground)' }}>LESSON {String(lessonNum).padStart(2,'0')} PROGRESS</span>
            <span className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--muted-foreground)' }}>{Math.round(lessonPct)}%</span>
          </div>
          <SegmentedBar value={pageNum - 1} total={pageTotal} />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--muted-foreground)' }}>MONTH 1 PROGRESS</span>
            <span className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--muted-foreground)' }}>{monthDone} / {monthTotal}</span>
          </div>
          <ProgressBar value={monthPct} total={100} height={4} />
        </div>
      </div>
    </div>
  );
}

// Segmented thin bar — N segments, "filled" up to value.
function SegmentedBar({ value, total, frozen }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${total}, 1fr)`, gap: 3 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          height: 4,
          background: i < value
            ? (frozen ? 'var(--muted-foreground)' : 'var(--primary)')
            : 'var(--muted)',
          border: '1px solid var(--border)',
        }} />
      ))}
    </div>
  );
}

// ── Page footer (prev ghost / Continue primary) ────────────────
function PageFooter({ pageNum = 3, pageTotal = 8, advancing = false, mobile }) {
  if (mobile) {
    return (
      <div style={{ marginTop: 28, paddingTop: 22, borderTop: '1px solid var(--border)' }}>
        <a className="btn btn-primary" href="#" style={{ width: '100%', justifyContent: 'center', padding: '16px 18px' }}>
          CONTINUE <span>→</span>
        </a>
      </div>
    );
  }
  return (
    <div style={{
      marginTop: 36, paddingTop: 22, borderTop: '1px solid var(--border)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
    }}>
      <a className="btn btn-ghost" href="#" style={{ minWidth: 160 }}>
        <span>←</span> PREVIOUS PAGE
      </a>
      <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.18em', color: 'var(--muted-foreground)' }}>
        PAGE {pageNum} OF {pageTotal}
      </div>
      <div style={{ position: 'relative', minWidth: 220, display: 'flex', justifyContent: 'flex-end' }}>
        {advancing && <AdvancingPing />}
        <a className="btn btn-primary" href="#" style={{ minWidth: 220 }}>
          CONTINUE <span>→</span>
        </a>
      </div>
    </div>
  );
}

// "Advancing in 2s, tap to stay" — small pill above the Continue button.
function AdvancingPing() {
  return (
    <div style={{
      position: 'absolute', bottom: 'calc(100% + 10px)', right: 0,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 12px',
      border: '1.5px solid var(--primary)',
      background: 'var(--card)',
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)',
        animation: 'gwth-pulse 1s ease-in-out infinite',
      }} />
      <span className="mono" style={{ fontSize: 10.5, letterSpacing: '0.16em', color: 'var(--primary)', fontWeight: 600 }}>
        ADVANCING IN 2S
      </span>
      <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>·</span>
      <span style={{ fontSize: 12, color: 'var(--foreground)', fontWeight: 600 }}>tap to stay</span>
      <style>{`@keyframes gwth-pulse{0%,100%{opacity:1}50%{opacity:.35}}`}</style>
    </div>
  );
}

// ── Lesson outline rail ────────────────────────────────────────
function OutlineRail({ pages, currentPage, lessonNum = 13, mobile = false }) {
  return (
    <aside style={{
      width: mobile ? '100%' : 248,
      borderRight: mobile ? 'none' : '1px solid var(--border)',
      borderTop: mobile ? '1px solid var(--border)' : 'none',
      padding: mobile ? '20px 22px 24px' : '32px 22px 32px',
      background: 'var(--card)',
      flexShrink: 0,
    }}>
      <div className="label">LESSON {String(lessonNum).padStart(2,'0')} · OUTLINE</div>
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column' }}>
        {pages.map((p, i) => {
          const n = i + 1;
          const state = n < currentPage ? 'done' : n === currentPage ? 'current' : 'pending';
          return (
            <a key={i} href="#" style={{
              display: 'grid', gridTemplateColumns: '20px 1fr auto', gap: 10, alignItems: 'flex-start',
              padding: '10px 4px',
              borderTop: i === 0 ? '1px solid var(--border)' : 'none',
              borderBottom: '1px solid var(--border)',
              opacity: state === 'pending' ? 0.6 : 1,
            }}>
              <span className="status-icon" data-state={state} style={{ width: 16, height: 16, marginTop: 2 }}>
                {state === 'done' && <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 5l2 2 4-4"/></svg>}
                {state === 'current' && <svg width="7" height="7" viewBox="0 0 8 8" fill="currentColor"><polygon points="2,1 7,4 2,7"/></svg>}
              </span>
              <div>
                <div style={{ fontSize: 13, fontWeight: state === 'current' ? 600 : 500, lineHeight: 1.3, color: state === 'current' ? 'var(--foreground)' : 'var(--foreground)' }}>
                  {p.title}
                </div>
                {p.kind && (
                  <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.16em', color: 'var(--muted-foreground)', marginTop: 3 }}>
                    {p.kind}
                  </div>
                )}
              </div>
              <span className="mono-num" style={{ fontSize: 10.5 }}>P{String(n).padStart(2,'0')}</span>
            </a>
          );
        })}
      </div>
    </aside>
  );
}

// ── Audio bar (persistent, bottom) ─────────────────────────────
// State variants:
//   - paused (Surface 1)        : play icon, idle scrubber, AUTO-ADVANCE toggle
//   - playing (Surface 2)       : pause icon, animated bars, AUTO-ADVANCE ON
//   - muted-during-video (S3)   : reduced row, "Resumes on next prose page"
function AudioBar({ state = 'paused', autoAdvance = true, onTogglePlay, onToggleAuto, onChangeSpeed,
  speed = '1x', currentTime = '00:00', totalTime = '03:42', progress = 0, mobile = false, muted = false }) {
  const playing = state === 'playing';
  return (
    <div style={{
      position: 'sticky', bottom: 0, zIndex: 5,
      background: muted ? 'var(--muted)' : 'var(--card)',
      borderTop: '2px solid var(--border-strong)',
      padding: mobile ? '12px 16px' : '14px 28px',
    }}>
      {muted ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              width: 32, height: 32, border: '1.5px solid var(--border)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--muted-foreground)',
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M2 4v6h2.5L9 13V1L4.5 4H2zm10 1l-2 2 2 2-1 1-2-2-2 2-1-1 2-2-2-2 1-1 2 2 2-2z"/></svg>
            </span>
            <div>
              <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.16em', color: 'var(--muted-foreground)', fontWeight: 600 }}>NARRATION MUTED FOR VIDEO</div>
              <div className="serif" style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 2 }}>Audio resumes on the next prose page.</div>
            </div>
          </div>
          <span className="pill pill-muted" style={{ fontWeight: 600 }}>AUTO-ADVANCE {autoAdvance ? 'ON' : 'OFF'}</span>
        </div>
      ) : mobile ? (
        <AudioBarMobile {...{ playing, autoAdvance, currentTime, totalTime, progress, speed }} />
      ) : (
        <AudioBarDesktop {...{ playing, autoAdvance, currentTime, totalTime, progress, speed }} />
      )}
    </div>
  );
}

function AudioBarDesktop({ playing, autoAdvance, currentTime, totalTime, progress, speed }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '52px minmax(0, 1fr) auto auto auto',
      alignItems: 'center', gap: 22,
    }}>
      {/* play / pause */}
      <button aria-label={playing ? 'Pause' : 'Play'} style={{
        width: 48, height: 48, border: '2px solid var(--border-strong)',
        background: playing ? 'var(--primary)' : 'var(--foreground)',
        borderColor: playing ? 'var(--primary)' : 'var(--foreground)',
        color: '#fff', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {playing
          ? <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor"><rect x="1" y="1" width="4" height="14"/><rect x="9" y="1" width="4" height="14"/></svg>
          : <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor"><polygon points="2,1 13,8 2,15"/></svg>}
      </button>

      {/* track + page label + waveform/scrub */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <span className="label" style={{ letterSpacing: '0.18em', whiteSpace: 'nowrap' }}>NOW READING</span>
            <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Page 3 · The brief, in plain English
            </span>
          </div>
          <span className="mono num-display" style={{ fontSize: 11.5, letterSpacing: '0.08em', color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>
            {currentTime} / {totalTime}
          </span>
        </div>
        {playing
          ? <Waveform progress={progress} />
          : <Scrubber progress={progress} />}
      </div>

      {/* speed */}
      <div style={{ display: 'flex', gap: 0, border: '1.5px solid var(--border)' }}>
        {['1x','1.25x','1.5x'].map(s => (
          <button key={s} style={{
            padding: '6px 10px', minWidth: 44,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
            color: s === speed ? 'var(--background)' : 'var(--muted-foreground)',
            background: s === speed ? 'var(--foreground)' : 'transparent',
            border: 'none', cursor: 'pointer',
          }}>{s}</button>
        ))}
      </div>

      {/* divider */}
      <div style={{ width: 1, height: 36, background: 'var(--border)' }} />

      {/* auto-advance toggle */}
      <AutoAdvanceToggle on={autoAdvance} />
    </div>
  );
}

function AudioBarMobile({ playing, autoAdvance, currentTime, totalTime, progress }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button style={{
          width: 40, height: 40, border: '2px solid var(--border-strong)',
          background: playing ? 'var(--primary)' : 'var(--foreground)',
          borderColor: playing ? 'var(--primary)' : 'var(--foreground)',
          color: '#fff', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {playing
            ? <svg width="12" height="14" viewBox="0 0 14 16" fill="currentColor"><rect x="1" y="1" width="4" height="14"/><rect x="9" y="1" width="4" height="14"/></svg>
            : <svg width="12" height="14" viewBox="0 0 14 16" fill="currentColor"><polygon points="2,1 13,8 2,15"/></svg>}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>P3 · The brief, in plain English</span>
            <span className="mono num-display" style={{ fontSize: 10.5, color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>{currentTime} / {totalTime}</span>
          </div>
          {playing ? <Waveform progress={progress} compact /> : <Scrubber progress={progress} compact />}
        </div>
      </div>
      <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 0, border: '1.5px solid var(--border)' }}>
          {['1x','1.25x','1.5x'].map((s, i) => (
            <button key={s} style={{
              padding: '4px 8px', minWidth: 38,
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 10.5, fontWeight: 700,
              color: i === 0 ? 'var(--background)' : 'var(--muted-foreground)',
              background: i === 0 ? 'var(--foreground)' : 'transparent',
              border: 'none', cursor: 'pointer',
            }}>{s}</button>
          ))}
        </div>
        <AutoAdvanceToggle on={autoAdvance} compact />
      </div>
    </div>
  );
}

function Scrubber({ progress = 0, compact }) {
  return (
    <div style={{ position: 'relative', height: compact ? 4 : 6, background: 'var(--muted)', border: '1px solid var(--border)' }}>
      <div style={{ position: 'absolute', top: -1, left: -1, bottom: -1, width: `calc(${progress}% + 2px)`, background: 'var(--foreground)' }} />
      <div style={{
        position: 'absolute', top: '50%', left: `${progress}%`,
        transform: 'translate(-50%,-50%)',
        width: compact ? 9 : 11, height: compact ? 9 : 11, background: 'var(--foreground)',
      }} />
    </div>
  );
}

function Waveform({ progress = 0, compact }) {
  // Deterministic-pseudo bars, sized by sin pattern + faint noise.
  const bars = React.useMemo(() => {
    const N = 56;
    const a = [];
    for (let i = 0; i < N; i++) {
      const v = 0.4 + Math.abs(Math.sin(i * 0.45) * 0.5) + ((i * 13) % 7) * 0.03;
      a.push(Math.min(1, v));
    }
    return a;
  }, []);
  const filledIdx = Math.floor(bars.length * (progress / 100));
  const H = compact ? 18 : 28;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: H }}>
      {bars.map((v, i) => {
        const isPlayed = i <= filledIdx;
        const isHead = i === filledIdx;
        return (
          <div key={i} style={{
            width: 3, height: `${Math.max(10, v * 100)}%`,
            background: isHead ? 'var(--primary)' : isPlayed ? 'var(--foreground)' : 'var(--border-strong)',
            opacity: isHead ? 1 : isPlayed ? 1 : 0.35,
            animation: isHead ? 'gwth-bar 0.7s ease-in-out infinite alternate' : 'none',
          }} />
        );
      })}
      <style>{`@keyframes gwth-bar{0%{transform:scaleY(.6)}100%{transform:scaleY(1.15)}}`}</style>
    </div>
  );
}

function AutoAdvanceToggle({ on = true, compact }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 8 : 10 }}>
      <span className="mono" style={{
        fontSize: compact ? 9.5 : 10.5, letterSpacing: '0.16em', fontWeight: 700,
        color: on ? 'var(--primary)' : 'var(--muted-foreground)',
      }}>AUTO-ADVANCE</span>
      <button role="switch" aria-checked={on} style={{
        width: compact ? 38 : 44, height: compact ? 20 : 24,
        border: `2px solid ${on ? 'var(--primary)' : 'var(--border-strong)'}`,
        background: on ? 'var(--primary)' : 'transparent',
        position: 'relative', cursor: 'pointer', padding: 0,
      }}>
        <span style={{
          position: 'absolute',
          top: 1, bottom: 1,
          left: on ? 'auto' : 1,
          right: on ? 1 : 'auto',
          width: compact ? 12 : 14, background: on ? '#fff' : 'var(--border-strong)',
          transition: 'all .12s',
        }} />
      </button>
      <span className="mono" style={{
        fontSize: compact ? 9.5 : 10.5, letterSpacing: '0.16em', fontWeight: 700,
        color: on ? 'var(--primary)' : 'var(--muted-foreground)',
      }}>{on ? 'ON' : 'OFF'}</span>
    </div>
  );
}

// ── Figure (mono caption) ──────────────────────────────────────
function Figure({ caption, height = 240, label = 'FIG. 03 · TOOL ARCHITECTURE' }) {
  return (
    <figure style={{ margin: '28px 0', padding: 0 }}>
      <div style={{
        height,
        background: 'repeating-linear-gradient(135deg, var(--muted) 0 12px, var(--card) 12px 24px)',
        border: '1.5px solid var(--border-strong)',
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div className="mono" style={{
          fontSize: 11, letterSpacing: '0.18em', color: 'var(--muted-foreground)',
          padding: '6px 12px', background: 'var(--card)', border: '1px solid var(--border)',
        }}>{label}</div>
      </div>
      <figcaption className="mono" style={{
        marginTop: 10, fontSize: 11, letterSpacing: '0.14em', color: 'var(--muted-foreground)',
        textTransform: 'uppercase',
      }}>
        {caption}
      </figcaption>
    </figure>
  );
}

// ── Pull-quote (italic Vollkorn) ───────────────────────────────
function PullQuote({ children }) {
  return (
    <blockquote style={{
      margin: '28px 0 28px',
      padding: '4px 0 4px 22px',
      borderLeft: '3px solid var(--primary)',
      fontFamily: '"Vollkorn", serif', fontStyle: 'italic', fontWeight: 500,
      fontSize: 22, lineHeight: 1.35, color: 'var(--foreground)',
      letterSpacing: '-0.005em',
    }}>{children}</blockquote>
  );
}

// ── Inline callout ─────────────────────────────────────────────
function Callout({ tag = 'NOTE', children }) {
  return (
    <aside style={{
      margin: '22px 0', padding: '14px 18px',
      border: '1.5px solid var(--border-strong)',
      background: 'var(--card)',
      display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 16, alignItems: 'flex-start',
    }}>
      <span className="mono" style={{
        fontSize: 10.5, letterSpacing: '0.18em', fontWeight: 700,
        color: 'var(--variant-warm)',
        padding: '4px 8px', border: '1px solid var(--variant-warm)',
        whiteSpace: 'nowrap',
      }}>{tag}</span>
      <div style={{ fontSize: 14.5, lineHeight: 1.55, color: 'var(--foreground)' }}>{children}</div>
    </aside>
  );
}

// ── Code block ─────────────────────────────────────────────────
function CodeBlock({ lang = 'python', children }) {
  return (
    <pre className="mono" style={{
      margin: '22px 0', padding: '16px 18px',
      background: 'var(--muted)',
      border: '1.5px solid var(--border-strong)',
      fontSize: 12.5, lineHeight: 1.55,
      color: 'var(--foreground)',
      overflow: 'auto', whiteSpace: 'pre',
      position: 'relative',
    }}>
      <span className="mono" style={{
        position: 'absolute', top: 8, right: 12,
        fontSize: 10, letterSpacing: '0.18em', color: 'var(--muted-foreground)',
        textTransform: 'uppercase',
      }}>{lang}</span>
      {children}
    </pre>
  );
}

// ── Prose body wrapper (max 720px column) ──────────────────────
function ProseBody({ children, style }) {
  return (
    <article style={{
      maxWidth: 720,
      fontFamily: '"Public Sans", sans-serif',
      fontSize: 17, lineHeight: 1.65,
      color: 'var(--foreground)',
      ...style,
    }}>
      {children}
    </article>
  );
}

// State-pill
function StatePill() {
  return (
    <span className="pill pill-success">
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
      Active · Month 1 of 3
    </span>
  );
}

Object.assign(window, {
  LessonSidebar, LessonChrome, SegmentedBar,
  PageFooter, AdvancingPing, OutlineRail,
  AudioBar, Scrubber, Waveform, AutoAdvanceToggle,
  Figure, PullQuote, Callout, CodeBlock, ProseBody, StatePill,
});
