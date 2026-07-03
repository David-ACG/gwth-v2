/* GWTH.ai verify page — Mobile 412
 * Verified state. Score card stacks vertically, reasons collapse,
 * share buttons stack full-width, meta strip is a vertical key/value list.
 */

function MobileVerified({ mode = 'light', height = 2240 }) {
  return (
    <div className="gwth-root" data-mode={mode} data-variant="e2-e" style={{
      width: 412,
      minHeight: height,
      background: 'var(--background)',
      color: 'var(--foreground)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top bar */}
      <header style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Logo small />
        <div className="mono" style={{
          fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--muted-foreground)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <LockGlyph size={11} />
          <span>Public Record</span>
        </div>
      </header>

      <main style={{ padding: '24px 16px 40px', flex: 1 }}>
        <MobileScoreCard />

        <MobileMetaList items={[
          { label: 'LAST VERIFIED', value: '2 MAY 2026' },
          { label: 'VERIFICATION ID', value: 'C67SG#DDE5' },
          { label: 'STATUS', value: 'VERIFIED', tone: 'success' },
          { label: 'ISSUER', value: 'GWTH.AI · UK' },
        ]} />

        <div style={{ marginTop: 28 }}>
          <div className="label">CREDENTIAL</div>
          <h1 style={{
            margin: '8px 0 0', fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15,
          }}>
            GWTH Certified Practitioner.<br />
            <span className="accent-italic" style={{ fontSize: 24 }}>Score 104, Top 1%.</span>
          </h1>
          <p style={{
            marginTop: 12, fontSize: 14.5, lineHeight: 1.55, color: 'var(--muted-foreground)',
          }}>
            Issued by GWTH.ai, United Kingdom. Live, dynamic credential, recomputed weekly
            from completed lesson work, passed Q&amp;A, and three reviewed capstone projects.
          </p>
        </div>

        {/* Five reasons — tap to expand */}
        <MobileFiveReasons />

        {/* Calculation — collapsed disclosure */}
        <MobileCalcDisclosure />

        {/* Share — stacked full-width */}
        <ShareRow stacked />

        <div style={{
          marginTop: 32, paddingTop: 18, borderTop: '1px solid var(--border)',
        }}>
          <div className="mono" style={{
            fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--muted-foreground)', lineHeight: 1.6,
          }}>
            Canonical URL<br />
            <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>gwth.ai/score/c67sg#dde5</span>
          </div>
        </div>
      </main>

      <footer style={{
        padding: '18px 18px',
        borderTop: '1px solid var(--border)',
        background: 'var(--card)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LockGlyph size={12} />
          <span className="mono" style={{
            fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600,
          }}>
            Verified by gwth.ai
          </span>
        </div>
        <a href="#" className="mono" style={{
          marginTop: 8, display: 'inline-block',
          fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--muted-foreground)',
        }}>
          About the GWTH Score →
        </a>
      </footer>
    </div>
  );
}

// ── Mobile score card — stacked vertical layout ────────────────
function MobileScoreCard() {
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
    }}>
      {/* browser chrome */}
      <div className="frame-chrome" style={{ padding: '8px 10px' }}>
        <div className="frame-dots"><span className="r" /><span className="y" /><span className="g" /></div>
        <div className="frame-url" style={{ fontSize: 10, maxWidth: 200 }}>gwth.ai/score/c67sg#dde5</div>
        <div style={{ width: 30 }} />
      </div>

      <div style={{ padding: '20px 18px 22px' }}>
        {/* identity row — full width */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar initials="AE" size={44} />
          <div style={{ lineHeight: 1.25, flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Alex Example</div>
            <div style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>Operations Lead · UK</div>
          </div>
        </div>

        {/* score panel */}
        <div style={{
          marginTop: 18,
          padding: '20px 16px 18px',
          background: 'var(--background)',
          border: '1px solid var(--border)',
          textAlign: 'center',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: 12, right: 14 }}>
            <span className="label" style={{ letterSpacing: '0.2em', fontSize: 10 }}>VERIFIED</span>
          </div>
          <Logo small />
          <div className="label" style={{ marginTop: 4, letterSpacing: '0.22em', fontSize: 10 }}>GWTH SCORE</div>

          <div className="num-display" style={{
            marginTop: 12, fontSize: 88, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 0.9,
          }}>104</div>

          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
            <span className="pill pill-tier">TOP 1%</span>
          </div>

          <div style={{
            marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            color: 'var(--success)', fontWeight: 600, fontSize: 16,
          }}>
            <span>↗</span><span className="num-display">+49</span>
          </div>
          <div className="label" style={{ marginTop: 6, letterSpacing: '0.2em', fontSize: 10 }}>VS 3 MONTHS AGO</div>
        </div>

        {/* QR row at bottom */}
        <div style={{
          marginTop: 16,
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          border: '1px solid var(--border)',
          background: 'var(--background)',
        }}>
          <QrPlaceholder value="gwth.ai/score/c67sg#dde5" size={56} />
          <div style={{ lineHeight: 1.35, flex: 1 }}>
            <div className="mono" style={{
              fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--muted-foreground)', fontWeight: 600,
            }}>SCAN TO VERIFY</div>
            <div style={{ fontSize: 12, color: 'var(--foreground)', marginTop: 2 }}>
              Opens this same canonical record.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Mobile meta — vertical key/value list ──────────────────────
function MobileMetaList({ items }) {
  return (
    <div style={{
      marginTop: 18,
      borderTop: '1px solid var(--border-strong)',
      borderBottom: '1px solid var(--border-strong)',
    }}>
      {items.map((it, i) => (
        <div key={i} style={{
          padding: '11px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          borderTop: i ? '1px solid var(--border)' : 'none',
        }}>
          <span className="mono" style={{
            fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--muted-foreground)',
          }}>{it.label}</span>
          <span className="mono" style={{
            fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
            fontWeight: 600,
            color: it.tone === 'success' ? 'var(--success)'
                 : it.tone === 'warm' ? 'var(--variant-warm)'
                 : 'var(--foreground)',
          }}>{it.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Mobile credibility reasons — collapsible list ──────────────
function MobileFiveReasons() {
  const [openIdx, setOpenIdx] = React.useState(0);
  return (
    <section style={{ marginTop: 28, border: '1px solid var(--border-strong)', background: 'var(--card)' }}>
      <header style={{ padding: '18px 18px 14px', borderBottom: '1px solid var(--border)' }}>
        <div className="label">SECTION 01 / CREDIBILITY</div>
        <h2 style={{
          margin: '6px 0 0', fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.18,
        }}>
          What this score tells an employer.<br />
          <span className="accent-italic" style={{ fontSize: 18 }}>5 reasons it&rsquo;s credible.</span>
        </h2>
      </header>
      <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {FIVE_REASONS.map((r, i) => {
          const open = i === openIdx;
          return (
            <li key={i} style={{ borderTop: i ? '1px solid var(--border)' : 'none' }}>
              <button onClick={() => setOpenIdx(open ? -1 : i)} style={{
                width: '100%', padding: '14px 18px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                font: 'inherit', color: 'inherit', textAlign: 'left',
                display: 'grid', gridTemplateColumns: '32px 1fr 14px', gap: 12, alignItems: 'baseline',
              }}>
                <div className="mono" style={{
                  fontSize: 11, letterSpacing: '0.16em', color: 'var(--muted-foreground)', fontWeight: 700,
                }}>0{i+1}</div>
                <div className="serif" style={{ fontSize: 16, color: 'var(--foreground)', lineHeight: 1.3 }}>
                  {r.lead}
                </div>
                <div style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>
                  {open ? '−' : '+'}
                </div>
              </button>
              {open && (
                <div style={{
                  padding: '0 18px 16px 62px',
                  fontSize: 14, lineHeight: 1.55, color: 'var(--muted-foreground)',
                }}>
                  {r.body}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// ── Mobile calculation disclosure ──────────────────────────────
function MobileCalcDisclosure() {
  const [open, setOpen] = React.useState(false);
  return (
    <section style={{ marginTop: 18, border: '1px solid var(--border-strong)', background: 'var(--card)' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', padding: '16px 18px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', gap: 10,
        background: 'transparent', border: 'none', cursor: 'pointer',
        font: 'inherit', color: 'inherit', textAlign: 'left',
      }}>
        <div>
          <div className="label">SECTION 02 / METHOD</div>
          <h3 style={{ margin: '6px 0 0', fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>
            How this score is calculated
          </h3>
        </div>
        <span className="mono" style={{
          fontSize: 11, letterSpacing: '0.16em', color: 'var(--muted-foreground)', fontWeight: 600,
          whiteSpace: 'nowrap',
        }}>{open ? '— CLOSE' : '+ OPEN'}</span>
      </button>
      {open && (
        <div style={{ padding: '4px 18px 22px', borderTop: '1px solid var(--border)' }}>
          <p style={{
            marginTop: 14, fontSize: 14, lineHeight: 1.6, color: 'var(--muted-foreground)',
          }}>
            Weighted, decaying composite. Recomputed weekly from verified lesson completions,
            passing Q&amp;A, three reviewed capstones, and a 90-day currentness multiplier.
            Above 100 means top 1% of GWTH-issued credentials at the time of verification.
          </p>
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid var(--border)' }}>
            <MiniCell label="LESSONS" value="62 / 64" />
            <MiniCell label="CAPSTONES" value="3 / 3" />
            <MiniCell label="CURRENTNESS" value="92%" />
            <MiniCell label="DECAY CHECK" value="11 MAY" />
          </div>
        </div>
      )}
    </section>
  );
}

function MiniCell({ label, value }) {
  return (
    <div style={{
      padding: '14px 14px',
      borderRight: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div className="label" style={{ fontSize: 9.5 }}>{label}</div>
      <div className="num-display" style={{ marginTop: 6, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{value}</div>
    </div>
  );
}

Object.assign(window, { MobileVerified });
