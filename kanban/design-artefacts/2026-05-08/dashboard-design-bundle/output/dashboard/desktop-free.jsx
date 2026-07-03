/* Desktop free/registered learner — no course access yet */

function DesktopFree() {
  const statePill = (
    <span className="pill pill-muted">
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--muted-foreground)' }} />
      Free · Labs only
    </span>
  );

  return (
    <div className="gwth-root" data-mode="light" data-variant="e2-e" style={{
      width: 1440, minHeight: 1820, background: 'var(--background)',
    }}>
      <AppHeader user={{ name: 'Sam Khan', initials: 'SK' }} statePill={statePill} />
      <MastRow section="DASHBOARD · LABS" date="FRI 8 MAY 2026 · 14:24 BST" build="BETA · v0.4.1" />

      {/* TOP BAND */}
      <section style={{
        padding: '40px 32px 36px',
        borderBottom: '2px solid var(--border-strong)',
        display: 'grid', gridTemplateColumns: '1fr 480px', gap: 48, alignItems: 'flex-end',
      }}>
        <div>
          <div className="label" style={{ marginBottom: 18 }}>FREE ACCOUNT · NO COURSE PURCHASED</div>
          <h1 className="display" style={{ fontSize: 60 }}>
            Welcome, Sam.<br/>
            <span className="accent-italic" style={{ fontSize: 52 }}>Try a lab. Decide later.</span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--muted-foreground)', marginTop: 16, maxWidth: 540, lineHeight: 1.55 }}>
            You have access to all 18 free labs. Labs are practice, not credential.
            When you are ready, Month 1 of the course is £29 and unlocks the GWTH
            Score that employers can verify on the spot.
          </p>
        </div>
        <div style={{ borderLeft: '2px solid var(--border-strong)', paddingLeft: 36 }}>
          <div className="label label-warm" style={{ marginBottom: 14 }}>BETA · 23 MAY 2026</div>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 8 }}>
            Month 1 unlocks Building with Claude, Codex and the consultant&rsquo;s prompt patterns.
          </div>
          <div className="serif" style={{ fontSize: 16, color: 'var(--muted-foreground)', marginBottom: 22 }}>
            24 mandatory lessons, six optional. Five hours a week.
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <a className="btn btn-primary" href="#">Buy month 1 · £29</a>
            <a className="btn btn-ghost btn-sm" href="#">Read the brief</a>
          </div>
        </div>
      </section>

      {/* MONTH 1 TEASER + COMPARE */}
      <section style={{ padding: '40px 32px', borderBottom: '1px solid var(--border)' }}>
        <SectionLabel num="01" title="WHAT MONTH 1 ACTUALLY CONTAINS" />
        <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', margin: '12px 0 24px' }}>
          24 lessons. <span className="accent-italic">Plain English.</span>
        </h2>
        <div className="cell-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
          <TeaserCol num="01" title="Past ChatGPT-as-Google" body="Six lessons that move you from search-style prompting to real intent + iteration." />
          <TeaserCol num="02" title="Three small builds" body="A spreadsheet QA, an email triage, a brief generator. All shippable, all reviewed." />
          <TeaserCol num="03" title="Capstone 01" body="One internal-use tool you build with Claude Code. Reviewed by a human." />
        </div>
      </section>

      {/* SCORE TEASER + LABS */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 460px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ padding: '40px 32px 48px', borderRight: '1px solid var(--border)' }}>
          <SectionLabel num="02" title="FREE LABS · UNSCORED" />
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 12 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
              18 public labs. <span className="accent-italic" style={{ fontSize: 28 }}>Use them tonight.</span>
            </h2>
            <span className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--muted-foreground)' }}>NO CARD REQUIRED</span>
          </div>
          <div className="panel-strong" style={{ marginTop: 24 }}>
            <LabFullRow title="Resume rewriter for non-tech roles" tag="JOB SEARCH" duration="40 MIN" />
            <LabFullRow title="Email triage with three rules" tag="OPS" duration="25 MIN" />
            <LabFullRow title="Spreadsheet QA in plain English" tag="OPS" duration="35 MIN" />
            <LabFullRow title="Brief generator for marketing teams" tag="MARKETING" duration="50 MIN" />
            <LabFullRow title="Reading dense PDFs without reading them" tag="RESEARCH" duration="30 MIN" />
            <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)' }}>
              <span className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--muted-foreground)' }}>+ 13 MORE</span>
              <a href="#" className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', fontWeight: 600 }}>BROWSE ALL 18 →</a>
            </div>
          </div>
        </div>

        {/* score example panel */}
        <div style={{ padding: '40px 32px 48px' }}>
          <SectionLabel num="03" title="WHAT THE SCORE LOOKS LIKE" accent />
          <div style={{ marginTop: 12 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2 }}>
              <span className="accent-italic" style={{ fontSize: 24 }}>Illustrative.</span> Yours starts at zero.
            </h2>
          </div>
          <div style={{ marginTop: 20, opacity: 0.85, position: 'relative' }}>
            <ScoreTicker
              user={{ name: 'Alex Example', initials: 'AE', role: 'Operations Lead · UK' }}
              score={104} tier="TOP 1%" delta={49}
              scoreUrl="gwth.ai/score/c67sg#dde5"
            />
            <div style={{
              position: 'absolute', top: 14, left: 14,
              padding: '3px 9px', background: 'var(--muted)', border: '1px solid var(--border)',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 9.5, letterSpacing: '0.18em', color: 'var(--muted-foreground)',
            }}>EXAMPLE</div>
          </div>
          <p style={{ fontSize: 14, color: 'var(--muted-foreground)', marginTop: 14, lineHeight: 1.55 }}>
            Buy Month 1 to start your own. The score reflects only verified work, decays
            without activity, and updates the public URL employers see.
          </p>
        </div>
      </section>

      {/* PRICING STRIP */}
      <section style={{ padding: '40px 32px 48px', borderBottom: '1px solid var(--border)' }}>
        <SectionLabel num="04" title="WHEN YOU&rsquo;RE READY" />
        <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', margin: '12px 0 24px' }}>
          Less than the cost of one hour with <span className="accent-italic">an AI consultant.</span>
        </h2>
        <div className="cell-grid" style={{ gridTemplateColumns: '1fr 1.2fr 1fr' }}>
          <PriceCell badge="FREE LABS" price="£0" sub="forever, no card required" lines={[
            'Access to all 18 free labs',
            'Build real projects with AI',
            'No GWTH Score',
            'Stays free, always',
          ]} cta="Continue exploring" />
          <PriceCell badge="THE COURSE · STARTER" price="£29" sub="/mo, one month at a time" emphasis lines={[
            'Full Month 1 at beta launch',
            '24 mandatory lessons + 6 optional',
            'Capstone 01, reviewed by a human',
            'GWTH Score employers can verify',
            'Pause or cancel any time',
          ]} cta="Buy month 1 · £29" ctaPrimary />
          <PriceCell badge="STAY CURRENT" price="£7.50" sub="/mo, after Month 3" lines={[
            'Score stays current as content updates',
            '~2 hours / month of new lessons',
            'Optional, lightweight',
            'No lock-in',
          ]} cta="After course" muted />
        </div>
      </section>

      {/* postscript */}
      <section style={{ padding: '32px 32px 40px' }}>
        <p className="serif" style={{ fontSize: 18, color: 'var(--muted-foreground)', maxWidth: 720, lineHeight: 1.55 }}>
          Stay Current opens after the course. Keep your score current and your knowledge updated, with about two hours of new content a month.
        </p>
      </section>

      <footer style={{
        padding: '24px 32px', display: 'flex', justifyContent: 'space-between',
        fontSize: 11.5, color: 'var(--muted-foreground)',
        fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.1em', textTransform: 'uppercase',
        borderTop: '1px solid var(--border)',
      }}>
        <span>© 2026 GWTH.ai · UK</span>
        <span>23 May beta · v0.4.1</span>
        <span>Privacy · Terms</span>
      </footer>
    </div>
  );
}

function TeaserCol({ num, title, body }) {
  return (
    <div style={{ padding: '20px 22px 22px' }}>
      <div className="label label-warm">UNIT {num}</div>
      <div style={{ fontSize: 18, fontWeight: 700, marginTop: 10, lineHeight: 1.25 }}>{title}</div>
      <div style={{ fontSize: 14, color: 'var(--muted-foreground)', marginTop: 8, lineHeight: 1.55 }}>{body}</div>
    </div>
  );
}

function LabFullRow({ title, tag, duration }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '90px 1fr auto auto', gap: 16, alignItems: 'center',
      padding: '14px 16px', borderTop: '1px solid var(--border)',
    }}>
      <div className="label">{tag}</div>
      <div style={{ fontSize: 14.5, fontWeight: 500 }}>{title}</div>
      <div className="mono" style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--muted-foreground)' }}>{duration}</div>
      <a href="#" className="mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', fontWeight: 600 }}>OPEN →</a>
    </div>
  );
}

function PriceCell({ badge, price, sub, lines, cta, ctaPrimary, emphasis, muted }) {
  return (
    <div style={{
      padding: '24px 22px 22px',
      background: emphasis ? 'oklch(0.94 0.04 40 / 0.6)' : (muted ? 'oklch(0.78 0.13 75 / 0.35)' : 'transparent'),
    }}>
      <div className="label" style={{ color: emphasis ? 'var(--primary)' : 'var(--muted-foreground)' }}>{badge}</div>
      <div style={{ marginTop: 14, display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span className="num-display" style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}>{price}</span>
        <span className="serif" style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>{sub}</span>
      </div>
      <ul style={{ margin: '20px 0 22px', padding: 0, listStyle: 'none', fontSize: 13.5, lineHeight: 1.55 }}>
        {lines.map((l, i) => (
          <li key={i} style={{ display: 'flex', gap: 10, padding: '6px 0', borderTop: i ? '1px solid var(--border)' : 'none' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 700 }}>✓</span>
            <span>{l}</span>
          </li>
        ))}
      </ul>
      <a className={ctaPrimary ? 'btn btn-primary' : 'btn'} href="#" style={{ width: '100%' }}>{cta}</a>
    </div>
  );
}

Object.assign(window, { DesktopFree });
