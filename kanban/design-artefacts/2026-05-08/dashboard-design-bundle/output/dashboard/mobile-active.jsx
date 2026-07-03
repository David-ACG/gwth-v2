/* Mobile active learner — 412 wide */

function MobileActive() {
  return (
    <div className="gwth-root" data-mode="light" data-variant="e2-e" style={{
      width: 412,
      minHeight: 2240,
      background: 'var(--background)',
    }}>
      {/* compact header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button aria-label="menu" style={{
            width: 32, height: 32, border: '1px solid var(--border)', background: 'transparent',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 3,
          }}>
            <span style={{ width: 14, height: 1.5, background: 'var(--foreground)' }} />
            <span style={{ width: 14, height: 1.5, background: 'var(--foreground)' }} />
            <span style={{ width: 14, height: 1.5, background: 'var(--foreground)' }} />
          </button>
          <Logo />
        </div>
        <Avatar initials="AE" size={32} />
      </header>

      {/* mast row */}
      <div style={{
        padding: '8px 18px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between',
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'var(--muted-foreground)',
      }}>
        <span>DASHBOARD · TODAY</span>
        <span>FRI 8 MAY · 14:24</span>
      </div>

      {/* greeting */}
      <section style={{ padding: '24px 18px 28px' }}>
        <span className="pill pill-success" style={{ fontSize: 9.5 }}>Active · Month 1 of 3</span>
        <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.05, margin: '14px 0 0' }}>
          Welcome back, Alex.
        </h1>
        <div className="accent-italic" style={{ fontSize: 22, marginTop: 4 }}>
          Five hours this week.
        </div>
        <p style={{ fontSize: 14.5, color: 'var(--muted-foreground)', marginTop: 12, lineHeight: 1.5 }}>
          You are 13 lessons into Month 1. On pace to finish by 23 May.
        </p>
      </section>

      {/* Continue card */}
      <section style={{ padding: '0 18px 28px' }}>
        <div className="panel-strong" style={{ padding: '18px 18px 20px' }}>
          <div className="label label-warm" style={{ marginBottom: 10 }}>NEXT · 24 MIN</div>
          <div style={{ fontSize: 11.5, color: 'var(--muted-foreground)', marginBottom: 4, fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            LESSON 13 · MONTH 1
          </div>
          <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Building with Claude: your first useful tool.
          </div>
          <div className="serif" style={{ fontSize: 14.5, color: 'var(--muted-foreground)', marginTop: 6 }}>
            You wrote the brief yesterday. Today you ship it.
          </div>
          <a className="btn btn-primary" href="#" style={{ marginTop: 16, width: '100%' }}>
            Continue Lesson 13 →
          </a>
        </div>
      </section>

      {/* Course progress */}
      <section style={{ padding: '0 18px 32px', borderTop: '1px solid var(--border)', paddingTop: 24 }}>
        <SectionLabel num="01" title="MONTH 1" />
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
            13 of 24 lessons.
          </h2>
          <span className="mono" style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>54%</span>
        </div>
        <div style={{ marginTop: 12 }}>
          <ProgressBar value={13} total={24} />
        </div>

        <div style={{ marginTop: 18, border: '1px solid var(--border)' }}>
          <LessonRow num={13} title="Building with Claude" length="24 MIN" state="current" />
          <LessonRow num={14} title="When to reach for which model" length="9 MIN" state="pending" />
          <LessonRow num={15} title="Reading docs without reading docs" length="18 MIN" state="pending" />
          <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)' }}>
            <span className="mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', color: 'var(--muted-foreground)' }}>+ 8 MORE</span>
            <a href="#" className="mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', fontWeight: 600 }}>SEE ALL →</a>
          </div>
        </div>
      </section>

      {/* Score ticker */}
      <section style={{ padding: '0 18px 32px', borderTop: '1px solid var(--border)', paddingTop: 24 }}>
        <SectionLabel num="02" title="YOUR SCORE" accent />
        <div style={{ marginTop: 6, marginBottom: 14 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
            <span className="accent-italic" style={{ fontSize: 22 }}>Improving.</span>
          </h2>
        </div>
        <ScoreTicker
          user={{ name: 'Alex Example', initials: 'AE', role: 'Operations Lead · UK' }}
          score={104} tier="TOP 1%" delta={49}
          scoreUrl="gwth.ai/score/c67sg#dde5"
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <a className="btn btn-ghost btn-sm" href="#" style={{ flex: 1, padding: '10px 8px' }}>Share</a>
          <a className="btn btn-ghost btn-sm" href="#" style={{ flex: 1, padding: '10px 8px' }}>Add to LinkedIn</a>
        </div>
      </section>

      {/* Capstones */}
      <section style={{ padding: '24px 18px 28px', borderTop: '1px solid var(--border)' }}>
        <SectionLabel num="03" title="CAPSTONES" />
        <div style={{ marginTop: 6 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
            1 of 3 approved.
          </h2>
        </div>
        <div style={{ marginTop: 10 }}>
          <CapstoneRow num="01" title="Internal ops assistant" status="approved" date="6 MAY" />
          <CapstoneRow num="02" title="Brief due 24 May" status="brief" date="DUE 24 MAY" />
          <CapstoneRow num="03" title="Month 3 capstone" status="locked" date="UNLOCKS JUL" />
        </div>
      </section>

      {/* Labs (unscored) */}
      <section style={{ padding: '24px 18px 28px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SectionLabel num="04" title="LABS" />
          <span className="pill pill-muted" style={{ fontSize: 9, padding: '3px 7px' }}>UNSCORED</span>
        </div>
        <div style={{ marginTop: 10, fontSize: 14, color: 'var(--muted-foreground)' }}>
          Practice work that does not affect your score.
        </div>
        <div style={{ marginTop: 12 }}>
          <LabRow title="Resume rewriter for non-tech roles" duration="40 MIN" />
          <LabRow title="Email triage with three rules" duration="25 MIN" />
          <LabRow title="Spreadsheet QA in plain English" duration="35 MIN" />
        </div>
      </section>

      {/* Activity + streak */}
      <section style={{ padding: '24px 18px 28px', borderTop: '1px solid var(--border)' }}>
        <SectionLabel num="05" title="THIS WEEK" />
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <span className="num-display" style={{ fontSize: 28, fontWeight: 700 }}>5.2</span>
            <span style={{ fontSize: 12, color: 'var(--muted-foreground)', marginLeft: 6 }}>HRS</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="num-display" style={{ fontSize: 22, fontWeight: 700 }}>11<span style={{ fontSize: 11, color: 'var(--muted-foreground)', marginLeft: 4 }}>DAY STREAK</span></div>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <ActivityHeatmap />
        </div>
      </section>

      {/* Notifications */}
      <section style={{ padding: '24px 18px 32px', borderTop: '1px solid var(--border)' }}>
        <SectionLabel num="06" title="NOTIFICATIONS" />
        <div style={{ marginTop: 8 }}>
          <NotifRow time="2H AGO" tag="CAPSTONE" tagColor="success" body="Capstone 01 approved by reviewer M. Patel." />
          <NotifRow time="6H AGO" tag="LESSON" body="L13 was updated, two new examples." />
          <NotifRow time="YESTERDAY" tag="SCORE" tagColor="warm" body="Score moved from 92 to 104." />
        </div>
      </section>

      {/* postscript */}
      <section className="panel-sage" style={{ padding: '28px 18px 32px' }}>
        <div className="label" style={{ color: 'rgba(255,255,255,0.6)' }}>POSTSCRIPT</div>
        <h3 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, margin: '8px 0 0' }}>
          Five hours a week.
          <span style={{ display: 'block', fontFamily: '"Vollkorn", serif', fontStyle: 'italic', fontWeight: 500 }}>
            Decide later, but keep going.
          </span>
        </h3>
      </section>

      <footer style={{
        padding: '16px 18px', fontSize: 10, color: 'var(--muted-foreground)',
        fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.1em', textTransform: 'uppercase',
        textAlign: 'center',
      }}>
        © 2026 GWTH.ai · UK · v0.4.1
      </footer>
    </div>
  );
}

Object.assign(window, { MobileActive });
