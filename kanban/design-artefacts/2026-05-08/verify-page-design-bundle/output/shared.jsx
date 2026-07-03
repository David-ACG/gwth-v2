/* GWTH.ai dashboard — shared components
 * Stone & Sage register. Public Sans + Vollkorn + JetBrains Mono.
 */

// ── QR placeholder ──────────────────────────────────────────────
// Deterministic-looking QR pattern that ISN'T a real QR. Uses a hash of the
// input string so the same URL always renders the same blocks. Real
// implementation should replace with an actual QR encoder.
function QrPlaceholder({ value = '', size = 64 }) {
  const N = 13;
  const cells = React.useMemo(() => {
    let h = 2166136261;
    for (let i = 0; i < value.length; i++) {
      h = (h ^ value.charCodeAt(i)) * 16777619 >>> 0;
    }
    const arr = [];
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        // Three corner finder squares (TL, TR, BL)
        const inFinder = (rr, cc) =>
          (rr < 7 && cc < 7) || (rr < 7 && cc >= N - 7) || (rr >= N - 7 && cc < 7);
        if (inFinder(r, c)) {
          const isFinderEdge =
            (r === 0 || r === 6 || c === 0 || c === 6) ||
            (r === 0 || r === 6 || c === N - 7 || c === N - 1) ||
            (r === N - 7 || r === N - 1 || c === 0 || c === 6);
          const inFinderInner =
            (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
            (r >= 2 && r <= 4 && c >= N - 5 && c <= N - 3) ||
            (r >= N - 5 && r <= N - 3 && c >= 2 && c <= 4);
          arr.push(isFinderEdge || inFinderInner);
        } else {
          h = (h * 1664525 + 1013904223) >>> 0;
          arr.push((h & 1) === 1);
        }
      }
    }
    return arr;
  }, [value]);

  return (
    <div className="qr-grid" style={{ width: size, height: size }}>
      {cells.map((on, i) => (
        <span key={i} className={on ? 'on' : ''} />
      ))}
    </div>
  );
}

// ── Logo ────────────────────────────────────────────────────────
// Text wordmark, NOT an SVG. Locked PNG will replace at build time.
function Logo({ small }) {
  return (
    <span className="gwth-logo" style={small ? { fontSize: 16 } : undefined}>
      GWTH<span className="ai">.ai</span>
    </span>
  );
}

// ── Sidebar nav (left) ──────────────────────────────────────────
function Sidebar({ active = 'home', mode = 'light' }) {
  const items = [
    { id: 'home', label: 'Today', count: null },
    { id: 'course', label: 'Course', count: null },
    { id: 'capstones', label: 'Capstones', count: 3 },
    { id: 'score', label: 'Score', count: null },
    { id: 'labs', label: 'Labs', count: null },
    { id: 'saved', label: 'Saved', count: 12 },
    { id: 'account', label: 'Account', count: null },
  ];
  return (
    <aside style={{
      width: 220,
      borderRight: '1px solid var(--border)',
      padding: '20px 0 24px',
      background: 'var(--card)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      minHeight: '100%',
    }}>
      <div style={{ padding: '4px 22px 24px' }}>
        <Logo />
      </div>

      <div style={{ padding: '0 22px 10px' }}>
        <div className="label">NAV</div>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map(item => (
          <a key={item.id} href="#"
            data-active={item.id === active}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 22px',
              fontSize: 14,
              fontWeight: item.id === active ? 600 : 400,
              color: item.id === active ? 'var(--foreground)' : 'var(--muted-foreground)',
              borderLeft: item.id === active ? '2px solid var(--primary)' : '2px solid transparent',
              marginLeft: '-2px',
            }}>
            <span>{item.label}</span>
            {item.count != null && (
              <span className="mono num" style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
                {item.count}
              </span>
            )}
          </a>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', padding: '24px 22px 0' }}>
        <div className="label" style={{ marginBottom: 8 }}>SUPPORT</div>
        <div style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
          <a href="#" style={{ display: 'block', marginBottom: 4 }}>Help &amp; FAQ</a>
          <a href="#" style={{ display: 'block', marginBottom: 4 }}>Contact</a>
          <a href="#" style={{ display: 'block' }}>What's new</a>
        </div>
      </div>
    </aside>
  );
}

// ── Top status bar ──────────────────────────────────────────────
// Product status line, not editorial mast. Shows where you are, when you are,
// and the build state.
function MastRow({ section = 'DASHBOARD', date = 'FRI 8 MAY 2026 · 14:24 BST', build = 'BETA · v0.4.1' }) {
  return (
    <div style={{
      borderBottom: '1px solid var(--border)',
      padding: '10px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 10.5,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color: 'var(--muted-foreground)',
    }}>
      <span>{section}</span>
      <span>{date}</span>
      <span>{build}</span>
    </div>
  );
}

// ── Top app header (logo + nav + account) ───────────────────────
function AppHeader({ user = { name: 'Alex Example', initials: 'AE' }, statePill, dark, onToggleDark }) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 32px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--background)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <Logo />
        <nav style={{ display: 'flex', gap: 22 }}>
          {['Today', 'Course', 'Score', 'Labs', 'Account'].map((l, i) => (
            <a key={l} href="#" style={{
              fontSize: 14,
              fontWeight: i === 0 ? 600 : 400,
              color: i === 0 ? 'var(--foreground)' : 'var(--muted-foreground)',
            }}>{l}</a>
          ))}
        </nav>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {statePill}
        <button onClick={onToggleDark} aria-label="toggle theme" style={{
          width: 32, height: 32, border: '1px solid var(--border)',
          background: 'transparent', color: 'var(--muted-foreground)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {dark ? '☀' : '☾'}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar initials={user.initials} />
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted-foreground)', letterSpacing: '0.06em' }}>UK · OPS LEAD</div>
          </div>
        </div>
      </div>
    </header>
  );
}

function Avatar({ initials = 'AE', size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--primary)',
      color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 600, letterSpacing: '0.02em',
    }}>{initials}</div>
  );
}

// ── Score Ticker — locked share-ticker idiom ────────────────────
// Reuse THIS component anywhere the score is shown. Do not invent.
function ScoreTicker({
  user = { name: 'Alex Example', initials: 'AE', role: 'Operations Lead · UK' },
  scoreUrl = 'gwth.ai/score/c67sg#dde5',
  score = 104,
  tier = 'TOP 1%',
  delta = 49,
  trendLabel = 'VS 3 MONTHS AGO',
  frozen = false,
  collapsibleOpen = false,
  hideEmployerExplainer = false,
  large = false,
}) {
  const [open, setOpen] = React.useState(collapsibleOpen);
  const trendUp = delta >= 0;
  const numSize = large ? 116 : 76;
  const avatarSize = large ? 56 : 42;
  const qrSize = large ? 96 : 68;
  const padX = large ? 36 : 22;
  const padY = large ? 28 : 20;
  const innerPadY = large ? 36 : 22;
  const innerPadX = large ? 28 : 18;
  const tierFontBoost = large ? 1.6 : 1;

  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 0,
      overflow: 'hidden',
    }}>
      {/* browser chrome */}
      <div className="frame-chrome">
        <div className="frame-dots"><span className="r" /><span className="y" /><span className="g" /></div>
        <div className="frame-url">{scoreUrl}</div>
        <div style={{ width: 36 }} />
      </div>

      <div style={{ padding: `${padY}px ${padX}px ${padY+2}px` }}>
        {/* identity row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: large ? 16 : 12 }}>
            <Avatar initials={user.initials} size={avatarSize} />
            <div style={{ lineHeight: 1.25 }}>
              <div style={{ fontSize: large ? 20 : 16, fontWeight: 600 }}>{user.name}</div>
              <div style={{ fontSize: large ? 14.5 : 13, color: 'var(--muted-foreground)' }}>{user.role}</div>
            </div>
          </div>
          <QrPlaceholder value={scoreUrl} size={qrSize} />
        </div>

        {/* score panel */}
        <div style={{
          marginTop: large ? 28 : 18,
          padding: `${innerPadY}px ${innerPadX}px ${innerPadY-2}px`,
          background: 'var(--background)',
          border: '1px solid var(--border)',
          textAlign: 'center',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: large ? 16 : 12, right: large ? 18 : 14 }}>
            <span className="label" style={{ letterSpacing: '0.2em' }}>{frozen ? 'FROZEN' : 'VERIFIED'}</span>
          </div>
          <Logo small />
          <div className="label" style={{ marginTop: 4, letterSpacing: '0.22em' }}>GWTH SCORE</div>

          <div style={{
            marginTop: large ? 18 : 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: large ? 22 : 14,
          }}>
            <div className="num-display" style={{
              fontSize: numSize,
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 0.9,
              color: frozen ? 'var(--muted-foreground)' : 'var(--foreground)',
            }}>{score}</div>
            <span className="pill pill-tier" style={large ? { fontSize: 13, padding: '6px 14px' } : undefined}>{tier}</span>
          </div>

          <div style={{
            marginTop: large ? 14 : 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            color: trendUp ? 'var(--success)' : 'var(--destructive)',
            fontWeight: 600, fontSize: large ? 20 : 16,
          }}>
            <span>{trendUp ? '↗' : '↘'}</span>
            <span className="num-display">{trendUp ? '+' : ''}{delta}</span>
          </div>

          <div className="label" style={{ marginTop: 6, letterSpacing: '0.2em' }}>{trendLabel}</div>
        </div>

        {/* collapsible employer reasons */}
        {!hideEmployerExplainer && (<>
        <button onClick={() => setOpen(o => !o)} style={{
          marginTop: 14,
          width: '100%',
          padding: '12px 14px',
          border: '1px solid var(--border)',
          background: 'transparent',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          cursor: 'pointer',
          fontFamily: 'inherit',
          color: 'inherit',
        }}>
          <span style={{
            width: 20, height: 20, borderRadius: '50%',
            border: '1.5px solid var(--primary)', color: 'var(--primary)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700,
          }}>?</span>
          <div style={{ flex: 1, lineHeight: 1.3 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>What this score tells an employer</div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>5 reasons it&apos;s credible</div>
          </div>
          <span style={{ color: 'var(--muted-foreground)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>▾</span>
        </button>
        {open && (
          <ol style={{
            margin: '10px 0 0', padding: '12px 14px 12px 30px',
            border: '1px solid var(--border)', borderTop: 'none',
            fontSize: 12.5, color: 'var(--muted-foreground)', lineHeight: 1.55,
          }}>
            <li>Verified course completion, lesson by lesson</li>
            <li>Passing Q&amp;A on every mandatory lesson</li>
            <li>Three reviewed capstone projects in your portfolio</li>
            <li>Score reflects last 90 days, not lifetime</li>
            <li>Anyone can verify on the spot at this URL</li>
          </ol>
        )}
        </>)}
      </div>
    </div>
  );
}

// ── Lesson row ──────────────────────────────────────────────────
function LessonRow({ num, title, length, state = 'pending', tag }) {
  const stateLabel = {
    done: 'DONE',
    current: 'IN PROGRESS',
    pending: '',
    locked: 'NEXT MONTH',
  }[state];
  return (
    <div className="lesson-row" data-state={state}>
      <div>
        <span className="status-icon" data-state={state}>
          {state === 'done' && <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 5l2 2 4-4"/></svg>}
          {state === 'current' && <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><polygon points="2,1 7,4 2,7"/></svg>}
        </span>
      </div>
      <div className="mono-num">L{String(num).padStart(2, '0')}</div>
      <div>
        <div style={{ fontSize: 14.5, fontWeight: state === 'current' ? 600 : 500, lineHeight: 1.3 }}>
          {title}
          {tag && <span className="label" style={{ marginLeft: 10, color: 'var(--variant-warm)' }}>{tag}</span>}
        </div>
        {stateLabel && (
          <div className="label" style={{ marginTop: 3, color: state === 'current' ? 'var(--primary)' : 'var(--muted-foreground)' }}>
            {stateLabel}
          </div>
        )}
      </div>
      <div className="mono-num" style={{ fontSize: 12 }}>{length}</div>
    </div>
  );
}

// ── Section label ───────────────────────────────────────────────
function SectionLabel({ num, title, accent = false }) {
  return (
    <div className="label" style={{ color: accent ? 'var(--variant-warm)' : 'var(--muted-foreground)' }}>
      {num && <span>SECTION {num}</span>}{num && ' — '}{title}
    </div>
  );
}

// ── Progress bar (sharp, bordered, no rounded fill) ─────────────
function ProgressBar({ value = 0, total = 100, height = 6, frozen = false }) {
  const pct = Math.max(0, Math.min(100, (value / total) * 100));
  return (
    <div style={{
      height,
      background: 'var(--muted)',
      border: '1px solid var(--border)',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: -1, left: -1, bottom: -1,
        width: `calc(${pct}% + 2px)`,
        background: frozen ? 'var(--muted-foreground)' : 'var(--primary)',
      }} />
    </div>
  );
}

// ── Activity heatmap (4 weeks × 7 days) ─────────────────────────
function ActivityHeatmap({ data }) {
  // data: array of 28 numbers 0..4 representing intensity
  const cells = data || [
    2,3,1,2,4,2,0,
    2,3,2,1,3,4,1,
    1,4,3,2,3,2,1,
    3,2,4,3,3,2,4,
  ];
  const days = ['M','T','W','T','F','S','S'];
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(7, 1fr)', gap: 4, alignItems: 'center', maxWidth: 240 }}>
        <div />
        {days.map((d, i) => (
          <div key={i} className="mono" style={{ fontSize: 9.5, color: 'var(--muted-foreground)', textAlign: 'center' }}>{d}</div>
        ))}
        {[0,1,2,3].map(week => (
          <React.Fragment key={week}>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--muted-foreground)' }}>W{week+1}</div>
            {[0,1,2,3,4,5,6].map(day => (
              <div key={day} className="heat-cell" data-h={cells[week * 7 + day]} />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// expose
Object.assign(window, {
  Logo, Sidebar, MastRow, AppHeader, Avatar,
  ScoreTicker, LessonRow, SectionLabel, ProgressBar,
  ActivityHeatmap, QrPlaceholder,
});
