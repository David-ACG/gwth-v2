/* GWTH.ai — public credential verify page primitives
 * Standalone shell (no PublicNav, no marketing footer).
 * All score-card rendering reuses <ScoreTicker> from shared.jsx.
 */

// ── Lock glyph (NOT a logo, just a status icon) ─────────────────
function LockGlyph({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="2.5" y="5.5" width="7" height="5.5" rx="0.5" />
      <path d="M4 5.5V3.75a2 2 0 0 1 4 0V5.5" />
    </svg>
  );
}

// ── Standalone shell ────────────────────────────────────────────
function VerifyShell({ children, mode = 'light', height, width = 1440 }) {
  return (
    <div className="gwth-root" data-mode={mode} data-variant="e2-e" style={{
      width,
      minHeight: height,
      background: 'var(--background)',
      color: 'var(--foreground)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <header style={{
        padding: '20px 32px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--background)',
      }}>
        <a href="#" style={{ display: 'inline-flex', alignItems: 'center' }}>
          <Logo />
        </a>
        <div className="mono" style={{
          fontSize: 10.5, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--muted-foreground)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <LockGlyph />
          <span>Public Credential Record</span>
        </div>
      </header>

      <main style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        padding: '56px 32px 72px',
      }}>
        <div style={{ width: '100%', maxWidth: 840 }}>
          {children}
        </div>
      </main>

      <footer style={{
        padding: '22px 32px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--card)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LockGlyph size={13} />
          <span className="mono" style={{
            fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
            fontWeight: 600,
          }}>
            Verified by gwth.ai
          </span>
          <span className="mono" style={{
            fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase',
            color: 'var(--muted-foreground)', marginLeft: 12,
          }}>
            Canonical record · 99.9 uptime
          </span>
        </div>
        <a href="#" className="mono" style={{
          fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--muted-foreground)',
        }}>
          About the GWTH Score →
        </a>
      </footer>
    </div>
  );
}

// ── Body column wrapper (max ~720) ──────────────────────────────
function VerifyBody({ children }) {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {children}
    </div>
  );
}

// ── Meta strip: institutional metadata under the card ───────────
function MetaStrip({ items }) {
  return (
    <div style={{
      maxWidth: 720,
      margin: '20px auto 0',
      padding: '14px 0',
      borderTop: '1px solid var(--border-strong)',
      borderBottom: '1px solid var(--border-strong)',
      display: 'flex',
      justifyContent: 'space-between',
      gap: 24,
      flexWrap: 'wrap',
    }}>
      {items.map((it, i) => (
        <div key={i} className="mono" style={{
          fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase',
          display: 'flex', gap: 8, alignItems: 'baseline',
        }}>
          <span style={{ color: 'var(--muted-foreground)' }}>{it.label}</span>
          <span style={{
            color: it.tone === 'success' ? 'var(--success)'
                 : it.tone === 'warm' ? 'var(--variant-warm)'
                 : 'var(--foreground)',
            fontWeight: 600,
          }}>{it.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Five credibility reasons (panel) ────────────────────────────
const FIVE_REASONS = [
  {
    lead: 'Always current.',
    body: "Lessons update constantly so students stay on the cutting edge, and the score decays if they don't keep up.",
  },
  {
    lead: 'Hands-on, not lectured.',
    body: 'Reaching 100 means completing 94+ hands-on projects across 3 modules, no passive watching.',
  },
  {
    lead: 'Tested, not assumed.',
    body: 'Every lesson has check questions; the course requires 3 capstone projects to graduate.',
  },
  {
    lead: 'Paced, not crammed.',
    body: 'The course is 3 months; lessons release in stages, no shortcuts, no rushing through.',
  },
  {
    lead: 'A high score is a recent score.',
    body: 'Above 100 means top 1% of applied-AI practitioners today, not when they enrolled.',
  },
];

function FiveReasonsPanel({ collapsibleMobile = false }) {
  return (
    <section style={{ marginTop: 36, border: '1px solid var(--border-strong)', background: 'var(--card)' }}>
      <header style={{ padding: '22px 28px 18px', borderBottom: '1px solid var(--border)' }}>
        <div className="label">SECTION 01 / CREDIBILITY</div>
        <h2 style={{
          margin: '8px 0 0', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.18,
        }}>
          What this score tells an employer.<br />
          <span className="accent-italic" style={{ fontSize: 24 }}>5 reasons it&rsquo;s credible.</span>
        </h2>
      </header>
      <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {FIVE_REASONS.map((r, i) => (
          <li key={i} style={{
            display: 'grid',
            gridTemplateColumns: '64px 1fr',
            gap: 20,
            padding: '20px 28px',
            borderTop: i ? '1px solid var(--border)' : 'none',
            alignItems: 'baseline',
          }}>
            <div className="mono num-display" style={{
              fontSize: 12, letterSpacing: '0.16em', color: 'var(--muted-foreground)', fontWeight: 700,
              paddingTop: 4,
            }}>
              0{i+1}
            </div>
            <div style={{ lineHeight: 1.55 }}>
              <span className="serif" style={{ fontSize: 19, color: 'var(--foreground)' }}>
                {r.lead}
              </span>
              {' '}
              <span style={{ fontSize: 15, color: 'var(--muted-foreground)' }}>
                {r.body}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ── Educational panel (Surface 2 only) ──────────────────────────
function EducationalPanel() {
  return (
    <section style={{
      marginTop: 36,
      padding: '26px 28px 28px',
      border: '1px solid var(--border-strong)',
      background: 'var(--card)',
    }}>
      <div className="label">FIRST TIME HERE</div>
      <h2 style={{
        margin: '8px 0 14px', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.18,
      }}>
        What is a GWTH Score?
      </h2>
      <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: 'var(--foreground)' }}>
        A GWTH Score is a verified, dynamic measure of an individual&rsquo;s applied AI capability.
        The number above isn&rsquo;t a snapshot, it&rsquo;s a live reading: it climbs as the holder
        completes hands-on lesson work and reviewed capstone projects, and it decays if they stop
        keeping current.
      </p>
      <p style={{ margin: '14px 0 0', fontSize: 16, lineHeight: 1.6, color: 'var(--muted-foreground)' }}>
        This page is the canonical record of the credential. The holder earned it on gwth.ai through
        94+ projects across a 3-month course. The number, the tier, and the verification ID below
        are issued and maintained by GWTH.ai. Anyone with this URL can confirm the credential is
        live and current.
      </p>
    </section>
  );
}

// ── Score history sparkline ─────────────────────────────────────
function Sparkline({
  data = [55, 58, 62, 64, 71, 78, 82, 88, 92, 96, 100, 104],
  width = 640, height = 96, target = 100,
}) {
  const max = Math.max(...data, target) * 1.05;
  const min = Math.min(...data) * 0.7;
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const points = data.map((v, i) => [i * stepX, height - ((v - min) / range) * height]);
  const path = points.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const areaPath = path + ` L${width},${height} L0,${height} Z`;
  const targetY = height - ((target - min) / range) * height;
  const lastIdx = points.length - 1;

  return (
    <svg width={width} height={height + 28} viewBox={`0 0 ${width} ${height + 28}`}
      style={{ display: 'block', maxWidth: '100%' }}>
      {/* baseline */}
      <line x1={0} y1={height} x2={width} y2={height} stroke="var(--border)" strokeWidth="1" />
      {/* target line at 100 */}
      <line x1={0} y1={targetY} x2={width} y2={targetY} stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="3 3" opacity="0.45" />
      <text x={width - 4} y={targetY - 4} textAnchor="end"
        fontFamily="JetBrains Mono, monospace" fontSize="9.5" letterSpacing="1.6"
        fill="var(--muted-foreground)" style={{ textTransform: 'uppercase' }}>
        TARGET 100
      </text>
      {/* area */}
      <path d={areaPath} fill="var(--primary)" fillOpacity="0.1" />
      {/* line */}
      <path d={path} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {/* point markers */}
      {points.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={i === lastIdx ? 4 : 2.2}
          fill={i === lastIdx ? 'var(--primary)' : 'var(--card)'}
          stroke="var(--primary)" strokeWidth="1.5" />
      ))}
      {/* axis labels */}
      <text x={0} y={height + 18} fontFamily="JetBrains Mono, monospace" fontSize="9.5"
        letterSpacing="1.6" fill="var(--muted-foreground)" style={{ textTransform: 'uppercase' }}>
        12 MONTHS AGO
      </text>
      <text x={width / 2} y={height + 18} textAnchor="middle"
        fontFamily="JetBrains Mono, monospace" fontSize="9.5"
        letterSpacing="1.6" fill="var(--muted-foreground)" style={{ textTransform: 'uppercase' }}>
        6 MONTHS AGO
      </text>
      <text x={width} y={height + 18} textAnchor="end"
        fontFamily="JetBrains Mono, monospace" fontSize="9.5"
        letterSpacing="1.6" fill="var(--primary)" fontWeight="600" style={{ textTransform: 'uppercase' }}>
        TODAY · 104
      </text>
    </svg>
  );
}

// ── Calculation disclosure ──────────────────────────────────────
function CalcDisclosure({ defaultOpen = false }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <section style={{
      marginTop: 18, border: '1px solid var(--border-strong)', background: 'var(--card)',
    }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', padding: '20px 28px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', gap: 16,
        background: 'transparent', border: 'none', cursor: 'pointer',
        font: 'inherit', color: 'inherit', textAlign: 'left',
      }}>
        <div>
          <div className="label">SECTION 02 / METHOD</div>
          <h3 style={{ margin: '8px 0 0', fontSize: 22, fontWeight: 700, letterSpacing: '-0.015em' }}>
            How this score is calculated
          </h3>
        </div>
        <span className="mono" style={{
          fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--muted-foreground)', fontWeight: 600, whiteSpace: 'nowrap',
        }}>
          {open ? '— Collapse' : '+ Expand'}
        </span>
      </button>
      {open && (
        <div style={{ padding: '8px 28px 28px', borderTop: '1px solid var(--border)' }}>
          <p style={{ marginTop: 18, fontSize: 15, lineHeight: 1.6, color: 'var(--muted-foreground)' }}>
            The GWTH Score is a weighted, decaying composite. It is recomputed weekly from four
            inputs: verified lesson completions, passing Q&amp;A on every mandatory lesson, three
            reviewed capstone projects, and a currentness multiplier that reflects activity over
            the last 90 days. A score above 100 places the holder in the top 1% of GWTH-issued
            credentials at the time of verification, not at the time of enrolment.
          </p>

          <div style={{ marginTop: 22 }}>
            <div className="label">CURRENT STANDING</div>
            <div style={{
              marginTop: 10,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              border: '1px solid var(--border)',
            }}>
              <DataCell label="LESSONS COMPLETED" value="62 / 64" sub="+ 2 OPTIONAL" />
              <DataCell label="CAPSTONES APPROVED" value="3 / 3" sub="ALL VERIFIED" />
              <DataCell label="CURRENTNESS" value="92%" sub="LAST 90 DAYS" />
              <DataCell label="DECAY CHECKED" value="11 MAY" sub="WEEKLY" />
            </div>
          </div>

          <div style={{ marginTop: 26 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div className="label">SCORE HISTORY · 12 MONTHS</div>
              <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.16em', color: 'var(--muted-foreground)' }}>
                ENROLLED 8 MAY 2025 · GRADUATED 8 AUG 2025
              </div>
            </div>
            <div style={{ marginTop: 12, padding: '14px 12px 6px', border: '1px solid var(--border)', background: 'var(--background)' }}>
              <Sparkline />
            </div>
          </div>

          <p style={{ marginTop: 22, fontSize: 14, lineHeight: 1.55, color: 'var(--muted-foreground)' }}>
            Holder reached 100 on 12 February 2026 and has held a Top 1% tier for 86 consecutive
            days. Underlying project files remain private; the credential proves the score, not
            the work product.
          </p>
        </div>
      )}
    </section>
  );
}

function DataCell({ label, value, sub }) {
  return (
    <div style={{ padding: '16px 18px', borderRight: '1px solid var(--border)' }}>
      <div className="label" style={{ fontSize: 10.5 }}>{label}</div>
      <div className="num-display" style={{
        fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 6,
      }}>{value}</div>
      <div className="mono" style={{
        marginTop: 4, fontSize: 9.5, letterSpacing: '0.16em',
        color: 'var(--muted-foreground)', textTransform: 'uppercase',
      }}>{sub}</div>
    </div>
  );
}

// ── Share row (copy link + Add to LinkedIn deferred) ────────────
function ShareRow({ stacked = false }) {
  return (
    <section style={{
      marginTop: 32,
      display: 'flex',
      flexDirection: stacked ? 'column' : 'row',
      gap: 12,
      alignItems: stacked ? 'stretch' : 'center',
    }}>
      <a className="btn btn-ghost" href="#" style={stacked ? { width: '100%' } : undefined}>
        <CopyGlyph />
        Copy link
      </a>
      <a className="btn btn-primary" href="#" style={stacked ? { width: '100%' } : undefined}>
        <LinkedInGlyph />
        Add to LinkedIn
        <span className="mono" style={{
          marginLeft: 4, fontSize: 9.5, letterSpacing: '0.14em',
          padding: '2px 6px', border: '1px solid currentColor',
          opacity: 0.8, fontWeight: 500,
        }}>SOON</span>
      </a>
      <span className="mono" style={{
        marginLeft: stacked ? 0 : 'auto', marginTop: stacked ? 4 : 0,
        fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase',
        color: 'var(--muted-foreground)',
        textAlign: stacked ? 'center' : 'right',
      }}>
        Stable URL · safe to share
      </span>
    </section>
  );
}

function CopyGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="3" width="7" height="8.5" />
      <path d="M5 3V1.5h6V10H9.5" />
    </svg>
  );
}

function LinkedInGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor" aria-hidden="true">
      <rect x="1" y="4" width="2.4" height="8" />
      <circle cx="2.2" cy="2.2" r="1.3" />
      <path d="M5 4h2.3v1.1c.4-.7 1.2-1.3 2.4-1.3 2 0 2.6 1.3 2.6 3v5.2H10v-4.7c0-1-.3-1.6-1.2-1.6-.9 0-1.4.6-1.4 1.6V12H5z" />
    </svg>
  );
}

// ── Revoked hero (replaces score card on Surface 3) ─────────────
function RevokedHero({ user, scoreUrl, revokedDate }) {
  return (
    <section style={{
      border: '1px solid var(--border)',
      background: 'var(--card)',
    }}>
      <div className="frame-chrome">
        <div className="frame-dots"><span className="r" /><span className="y" /><span className="g" /></div>
        <div className="frame-url" style={{ textDecoration: 'line-through', opacity: 0.7 }}>{scoreUrl}</div>
        <div style={{ width: 36 }} />
      </div>

      <div style={{ padding: '40px 40px 36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Avatar initials={user.initials} size={56} />
          <div style={{ lineHeight: 1.25 }}>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{user.name}</div>
            <div style={{ fontSize: 14.5, color: 'var(--muted-foreground)' }}>{user.role}</div>
          </div>
        </div>

        <div style={{
          marginTop: 32,
          padding: '32px 28px 30px',
          background: 'var(--muted)',
          border: '1px solid var(--border)',
          textAlign: 'center',
        }}>
          <div className="mono" style={{
            fontSize: 12.5, letterSpacing: '0.32em', textTransform: 'uppercase',
            color: 'var(--muted-foreground)', fontWeight: 600,
          }}>
            Credential Revoked
          </div>
          <p style={{
            margin: '14px auto 0', maxWidth: 480, fontSize: 16, lineHeight: 1.55,
            color: 'var(--muted-foreground)',
          }}>
            This credential is no longer valid as of {revokedDate}.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Pending hero (optional — Phase 1 issued, awaiting first verify) ─
function PendingHero({ user, scoreUrl }) {
  return (
    <section style={{
      border: '1px solid var(--border)',
      background: 'var(--card)',
      position: 'relative',
    }}>
      <div className="frame-chrome">
        <div className="frame-dots"><span className="r" /><span className="y" /><span className="g" /></div>
        <div className="frame-url">{scoreUrl}</div>
        <div style={{ width: 36 }} />
      </div>

      <div style={{ padding: '36px 40px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Avatar initials={user.initials} size={56} />
          <div style={{ lineHeight: 1.25 }}>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{user.name}</div>
            <div style={{ fontSize: 14.5, color: 'var(--muted-foreground)' }}>{user.role}</div>
          </div>
        </div>

        <div style={{
          marginTop: 28,
          padding: '40px 24px 36px',
          background: 'var(--background)',
          border: '1px dashed var(--border-strong)',
          textAlign: 'center',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: 16, right: 18 }}>
            <span className="label" style={{ letterSpacing: '0.22em', color: 'var(--variant-warm)' }}>PENDING</span>
          </div>
          <Logo small />
          <div className="label" style={{ marginTop: 4, letterSpacing: '0.22em' }}>GWTH SCORE</div>
          <div className="num-display" style={{
            marginTop: 18, fontSize: 88, fontWeight: 700, letterSpacing: '-0.04em',
            lineHeight: 0.9, color: 'var(--muted-foreground)',
          }}>—</div>
          <p style={{
            margin: '18px auto 0', maxWidth: 420, fontSize: 14.5, lineHeight: 1.55,
            color: 'var(--muted-foreground)',
          }}>
            Newly issued credentials enter a 24-hour verification window. The score
            will appear here once the first decay check completes.
          </p>
          <div className="mono" style={{
            marginTop: 18, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--variant-warm)', fontWeight: 600,
          }}>
            ETA · 9 May 2026 · 14:24 BST
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, {
  VerifyShell, VerifyBody, MetaStrip, FiveReasonsPanel,
  EducationalPanel, CalcDisclosure, ShareRow,
  RevokedHero, PendingHero, Sparkline, LockGlyph,
  FIVE_REASONS,
});
