/* GWTH.ai · Lab page · shared shell components.
 * Stone & Sage register. Public Sans + Vollkorn + JetBrains Mono.
 * Two-column desktop: instructions (left) + workspace (right). No context switch.
 */

// ── Sidebar (Labs active) ──────────────────────────────────────
function LabSidebar({ active = 'labs' }) {
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
      <div style={{ marginTop: 'auto', padding: '24px 22px 0' }}>
        <div className="label" style={{ marginBottom: 8 }}>SUPPORT</div>
        <div style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
          <a href="#" style={{ display: 'block', marginBottom: 4 }}>Help &amp; FAQ</a>
          <a href="#" style={{ display: 'block' }}>Contact</a>
        </div>
      </div>
    </aside>
  );
}

// ── Public mast row (top) ──────────────────────────────────────
// On the labs route a visitor may be unauth'd. The mast still shows "where you
// are", build state, and (if signed-in) the avatar — otherwise a sign-in link.
function LabMast({ section = 'LABS · PROMPT COMPARISON', signedIn = false, dark, onToggleDark }) {
  return (
    <div style={{
      borderBottom: '1px solid var(--border)', padding: '10px 40px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontFamily: '"JetBrains Mono", monospace', fontSize: 10.5,
      letterSpacing: '0.16em', textTransform: 'uppercase',
      color: 'var(--muted-foreground)',
    }}>
      <span>{section}</span>
      <span>FRI 8 MAY 2026 · 14:24 BST</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {!signedIn
          ? <a href="#" style={{ color: 'var(--foreground)', fontWeight: 600 }}>SIGN IN</a>
          : <Avatar initials="AE" size={26} />}
        {onToggleDark && (
          <button onClick={onToggleDark} aria-label="theme" style={{
            width: 26, height: 26, border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--muted-foreground)', cursor: 'pointer',
          }}>{dark ? '☀' : '☾'}</button>
        )}
      </div>
    </div>
  );
}

// ── Lab chrome (top of body) ──────────────────────────────────
// Big sans display title, single italic Vollkorn subtitle, UNSCORED pill,
// the unscored-explanation sentence, thin lab-progress bar.
function LabChrome({
  shape = 'PROMPT COMPARISON',
  title = 'Two prompts, one model: see what specificity buys you.',
  subtitle = 'A short, hands-on look at how phrasing changes what Claude gives back.',
  estimate = '12 min',
  stepNum = 1,
  stepTotal = 4,
  complete = false,
}) {
  const pct = complete ? 100 : Math.round(((stepNum - 1) / stepTotal) * 100);
  return (
    <div style={{ borderBottom: '1px solid var(--border)', padding: '26px 0 20px' }}>
      {/* eyebrow row: shape mono + estimate mono. Functional, not decorative. */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        <div className="mono" style={{
          fontSize: 11, letterSpacing: '0.22em', color: 'var(--muted-foreground)',
          textTransform: 'uppercase', fontWeight: 600,
        }}>
          LAB · {shape}
        </div>
        <div className="mono" style={{
          fontSize: 11, letterSpacing: '0.18em', color: 'var(--muted-foreground)',
          textTransform: 'uppercase',
        }}>
          {estimate} · 3 to 5 steps
        </div>
      </div>

      {/* title */}
      <h1 style={{
        fontSize: 38, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.05,
        margin: '14px 0 10px', maxWidth: 980,
      }}>{title}</h1>

      {/* italic Vollkorn subtitle, 1 line */}
      <p className="serif" style={{
        margin: 0, fontSize: 19, color: 'var(--muted-foreground)',
        maxWidth: 880,
      }}>{subtitle}</p>

      {/* UNSCORED row + explanation sentence + thin progress bar */}
      <div style={{
        marginTop: 22,
        display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span className="pill" style={{
            borderColor: 'var(--border-strong)', color: 'var(--foreground)',
            background: 'var(--muted)', fontWeight: 700,
          }}>UNSCORED</span>
          <span style={{ fontSize: 13.5, color: 'var(--muted-foreground)' }}>
            Free, hands-on, does not affect your GWTH Score.
          </span>
        </div>
        <div style={{ minWidth: 280, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--muted-foreground)' }}>
            LAB PROGRESS
          </span>
          <div style={{ flex: 1 }}>
            <ProgressBar value={pct} total={100} height={4} />
          </div>
          <span className="mono num-display" style={{
            fontSize: 10.5, letterSpacing: '0.1em', color: 'var(--muted-foreground)', minWidth: 38, textAlign: 'right',
          }}>{pct}%</span>
        </div>
      </div>
    </div>
  );
}

// ── Step indicator (inside instructions column) ───────────────
function StepIndicator({ stepNum, stepTotal, steps = [] }) {
  return (
    <div>
      <div className="mono" style={{
        fontSize: 11, letterSpacing: '0.22em', color: 'var(--muted-foreground)',
        textTransform: 'uppercase', fontWeight: 700,
      }}>
        STEP {stepNum} OF {stepTotal}
      </div>
      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {steps.map((s, i) => {
          const n = i + 1;
          const state = n < stepNum ? 'done' : n === stepNum ? 'current' : 'pending';
          return (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '18px 1fr', gap: 10, alignItems: 'center',
              padding: '4px 0',
              opacity: state === 'pending' ? 0.5 : 1,
            }}>
              <span className="status-icon" data-state={state} style={{ width: 16, height: 16 }}>
                {state === 'done' && <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 5l2 2 4-4"/></svg>}
                {state === 'current' && <svg width="6" height="6" viewBox="0 0 8 8" fill="currentColor"><polygon points="2,1 7,4 2,7"/></svg>}
              </span>
              <span style={{
                fontSize: 13, fontWeight: state === 'current' ? 600 : 400,
                color: state === 'current' ? 'var(--foreground)' : 'var(--muted-foreground)',
              }}>{s}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Hint disclosure (inline, never modal) ─────────────────────
function HintDisclosure({ open = false, hint, label = 'Show hint' }) {
  return (
    <div style={{ marginTop: 18 }}>
      <a href="#" style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        fontSize: 13, color: 'var(--muted-foreground)',
        borderBottom: '1px dashed var(--muted-foreground)', paddingBottom: 1,
      }}>
        <span style={{ display: 'inline-block', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .12s' }}>›</span>
        {open ? 'Hide hint' : label}
      </a>
      {open && (
        <div style={{
          marginTop: 12, padding: '12px 14px',
          borderLeft: '2px solid var(--variant-warm)',
          background: 'oklch(0.93 0.04 75 / 0.4)',
          fontSize: 13.5, lineHeight: 1.55, color: 'var(--foreground)',
        }}>
          {hint}
        </div>
      )}
    </div>
  );
}

// ── Continue / Submit primary action ──────────────────────────
function StepFooter({ stepNum, stepTotal, primaryLabel = 'CONTINUE', secondaryLabel = 'BACK', complete }) {
  if (complete) return null;
  return (
    <div style={{
      marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
    }}>
      <a href="#" className="btn btn-ghost btn-sm" style={{ minWidth: 92 }}>
        ← {secondaryLabel}
      </a>
      <span className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--muted-foreground)' }}>
        {stepNum} / {stepTotal}
      </span>
      <a href="#" className="btn btn-primary btn-sm" style={{ minWidth: 132 }}>
        {primaryLabel} →
      </a>
    </div>
  );
}

// ── Conversion card (completion only) ─────────────────────────
// Single bordered panel, single sentence, single CTA. No stars, no ribbons,
// no testimonials, no nesting.
function ConversionCard() {
  return (
    <div style={{
      border: '2px solid var(--border-strong)',
      background: 'var(--card)',
      padding: '30px 36px',
      display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'center',
    }}>
      <div>
        <div className="label" style={{ marginBottom: 10 }}>WANT THE CREDENTIAL</div>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.25 }}>
          Start the course. <span className="accent-italic">£29 a month, one month at a time.</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
        <a href="#" className="btn btn-primary" style={{ minWidth: 220 }}>START THE COURSE →</a>
        <a href="#" style={{ fontSize: 13, color: 'var(--muted-foreground)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
          Browse more labs
        </a>
      </div>
    </div>
  );
}

// ── Sign-in to save card (anonymous-finish only) ──────────────
function SaveProgressCard() {
  return (
    <div style={{
      border: '1px solid var(--border)',
      background: 'var(--card)',
      padding: '18px 22px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap',
    }}>
      <div style={{ minWidth: 0 }}>
        <div className="label" style={{ marginBottom: 4 }}>SAVE THIS LAB</div>
        <div style={{ fontSize: 14.5, color: 'var(--foreground)' }}>
          You finished anonymously. Sign in to keep this in your saved labs.
        </div>
      </div>
      <a href="#" className="btn btn-ghost btn-sm">SIGN IN TO SAVE</a>
    </div>
  );
}

// ── Inline sign-in cue (in-flow, not a blocker) ───────────────
function SignInCue() {
  return (
    <div style={{
      marginTop: 18,
      padding: '10px 12px',
      border: '1px dashed var(--border-strong)',
      background: 'transparent',
      fontSize: 12.5, color: 'var(--muted-foreground)',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--variant-warm)', fontWeight: 700 }}>
        OPTIONAL
      </span>
      <span><a href="#" style={{ textDecoration: 'underline', textUnderlineOffset: 2 }}>Sign in</a> to save your progress on this lab.</span>
    </div>
  );
}

Object.assign(window, {
  LabSidebar, LabMast, LabChrome, StepIndicator,
  HintDisclosure, StepFooter, ConversionCard, SaveProgressCard, SignInCue,
});
