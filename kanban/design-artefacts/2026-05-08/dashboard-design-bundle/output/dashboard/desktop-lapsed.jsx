/* Desktop lapsed payment learner — grace period, score frozen */

function DesktopLapsed() {
  const statePill = (
    <span className="pill pill-warn">
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
      Lapsed · Grace period
    </span>
  );

  return (
    <div className="gwth-root" data-mode="light" data-variant="e2-e" style={{
      width: 1440, minHeight: 2280, background: 'var(--background)',
    }}>
      <AppHeader user={{ name: 'Alex Example', initials: 'AE' }} statePill={statePill} />
      <MastRow section="DASHBOARD · TODAY" date="FRI 8 MAY 2026 · 14:24 BST" build="BETA · v0.4.1" />

      {/* GRACE-PERIOD BANNER */}
      <div className="panel-warm" style={{
        padding: '18px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
        borderBottom: '2px solid var(--border-strong)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <span className="label" style={{ color: 'oklch(0.22 0.008 75)', letterSpacing: '0.18em' }}>PAYMENT FAILED · 4 MAY</span>
          <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.3 }}>
            Your card was declined. You have 6 days left in your grace period before
            Month 2 access closes and your score is frozen at the public URL.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <a className="btn btn-primary" href="#">Update payment</a>
          <a className="btn btn-ghost btn-sm" href="#" style={{ borderColor: 'oklch(0.22 0.008 75)' }}>Pause instead</a>
        </div>
      </div>

      {/* TOP TASK BAND */}
      <section style={{
        padding: '40px 32px 36px',
        borderBottom: '2px solid var(--border-strong)',
        display: 'grid', gridTemplateColumns: '1fr 480px', gap: 48, alignItems: 'flex-end',
      }}>
        <div>
          <div className="label" style={{ marginBottom: 18 }}>TODAY · 14:24 BST</div>
          <h1 className="display" style={{ fontSize: 60 }}>
            You&rsquo;re still on track,<br/> Alex.
            <br/><span className="accent-italic" style={{ fontSize: 50 }}>Just not paid up.</span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--muted-foreground)', marginTop: 18, maxWidth: 540, lineHeight: 1.55 }}>
            Lessons stay open through 14 May. The public verification URL still works
            until then, marked as &ldquo;frozen.&rdquo; After that, employers checking the
            link will see your last verified score, dated.
          </p>
        </div>
        <div style={{ borderLeft: '2px solid var(--border-strong)', paddingLeft: 36 }}>
          <div className="label label-warm" style={{ marginBottom: 14 }}>NEXT, IF YOU HAVE 24 MINUTES</div>
          <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 6 }}>LESSON 13 · MONTH 1 · STILL OPEN</div>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 8 }}>
            Building with Claude: your first useful tool.
          </div>
          <div className="serif" style={{ fontSize: 16, color: 'var(--muted-foreground)', marginBottom: 22 }}>
            Lessons keep working through your grace window.
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <a className="btn" href="#">Continue Lesson 13 →</a>
            <a className="btn btn-primary btn-sm" href="#">Resubscribe</a>
          </div>
        </div>
      </section>

      {/* MAIN GRID */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 460px', borderBottom: '1px solid var(--border)' }}>
        {/* LEFT: course unchanged but with frozen indicator */}
        <div style={{ padding: '40px 32px 48px', borderRight: '1px solid var(--border)' }}>
          <SectionLabel num="01" title="YOUR COURSE · STILL OPEN" />
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 12 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
              Month 1 of 3.
            </h2>
            <span className="mono num" style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>
              13 / 24 mandatory
            </span>
          </div>
          <div style={{ marginTop: 18 }}><ProgressBar value={13} total={24} /></div>
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--muted-foreground)' }}>OPEN UNTIL 14 MAY</span>
            <span className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--variant-warm)', fontWeight: 600 }}>UPDATE PAYMENT TO CONTINUE</span>
          </div>

          <div className="panel-strong" style={{ marginTop: 28 }}>
            <LessonRow num={13} title="Building with Claude: your first useful tool" length="24 MIN" state="current" />
            <LessonRow num={14} title="Q&A: when to reach for which model" length="9 MIN" state="pending" />
            <LessonRow num={15} title="Reading docs without reading docs" length="18 MIN" state="pending" />
            <LessonRow num={16} title="Codex for non-engineers, part one" length="22 MIN" state="locked" />
            <LessonRow num={17} title="Plain-English automations" length="26 MIN" state="locked" />
            <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', background: 'oklch(0.93 0.07 75 / 0.4)' }}>
              <span className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--variant-warm)', fontWeight: 600 }}>
                LESSONS 16+ LOCK IF GRACE LAPSES
              </span>
              <a href="#" className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', fontWeight: 600 }}>UPDATE CARD →</a>
            </div>
          </div>

          {/* impact callout */}
          <div className="cell-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 28 }}>
            <div style={{ padding: '20px 22px' }}>
              <div className="label">IF YOU UPDATE BY 14 MAY</div>
              <div className="serif" style={{ fontSize: 18, marginTop: 8, lineHeight: 1.3 }}>
                Nothing changes. Score keeps verifying, lessons stay open, capstone keeps its review slot.
              </div>
            </div>
            <div style={{ padding: '20px 22px', background: 'oklch(0.93 0.07 75 / 0.5)' }}>
              <div className="label" style={{ color: 'var(--variant-warm)' }}>IF YOU DON&rsquo;T</div>
              <div className="serif" style={{ fontSize: 18, marginTop: 8, lineHeight: 1.3 }}>
                Lessons close 15 May. Score freezes at 104 with a dated &ldquo;last verified&rdquo; line. You can resume at any time, no re-enrolment.
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: frozen score */}
        <div style={{ padding: '40px 32px 48px' }}>
          <SectionLabel num="02" title="YOUR GWTH SCORE · FROZEN" accent />
          <div style={{ marginTop: 12, marginBottom: 4 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2 }}>
              <span className="accent-italic" style={{ fontSize: 24 }}>Holding.</span> No new verification.
            </h2>
          </div>

          <div style={{ marginTop: 20, position: 'relative' }}>
            <ScoreTicker
              user={{ name: 'Alex Example', initials: 'AE', role: 'Operations Lead · UK' }}
              score={104} tier="TOP 1%" delta={49}
              scoreUrl="gwth.ai/score/c67sg#dde5"
              frozen
            />
          </div>

          <div style={{ marginTop: 16, padding: '14px 16px', background: 'oklch(0.93 0.07 75 / 0.4)', border: '1px solid var(--variant-warm)' }}>
            <div className="label" style={{ color: 'var(--variant-warm)' }}>WHAT EMPLOYERS SEE NOW</div>
            <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.5 }}>
              The public URL works. Below the score it shows
              <span className="mono" style={{ background: 'var(--card)', padding: '2px 6px', margin: '0 4px', fontSize: 11.5 }}>
                FROZEN · LAST VERIFIED 6 MAY 2026
              </span>
              instead of the up-trend pill.
            </div>
          </div>

          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <SectionLabel num="03" title="ACCOUNT" />
            <div style={{ marginTop: 12, padding: '14px 16px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span className="mono" style={{ fontSize: 11.5, letterSpacing: '0.1em' }}>VISA •••• 4421</span>
                <span className="pill pill-warn" style={{ fontSize: 9.5 }}>Declined 4 May</span>
              </div>
              <div className="serif" style={{ fontSize: 14, color: 'var(--muted-foreground)', marginBottom: 14 }}>
                Bank reason: insufficient funds. We will retry 11 May.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <a className="btn btn-primary btn-sm" href="#" style={{ flex: 1 }}>Update card</a>
                <a className="btn btn-ghost btn-sm" href="#" style={{ flex: 1 }}>Pause for a month</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* postscript */}
      <section className="panel-sage" style={{ padding: '40px 32px 48px' }}>
        <SectionLabel num="04" title="POSTSCRIPT" />
        <h3 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', margin: '12px 0 0', lineHeight: 1.05 }}>
          The credential decays
          <span style={{ display: 'block', fontFamily: '"Vollkorn", serif', fontStyle: 'italic', fontWeight: 500 }}>
            if you stop. So does the gap.
          </span>
        </h3>
        <p style={{ fontSize: 15, marginTop: 18, maxWidth: 640, lineHeight: 1.55, opacity: 0.85 }}>
          You can pause for up to 60 days without losing your evidence. After that the score expires.
          Better to update the card and keep the rhythm.
        </p>
      </section>

      <footer style={{
        padding: '24px 32px', display: 'flex', justifyContent: 'space-between',
        fontSize: 11.5, color: 'var(--muted-foreground)',
        fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.1em', textTransform: 'uppercase',
      }}>
        <span>© 2026 GWTH.ai · UK</span>
        <span>23 May beta · v0.4.1</span>
        <span>Privacy · Terms</span>
      </footer>
    </div>
  );
}

Object.assign(window, { DesktopLapsed });
