/* Surface 3 · Intro video page (80% completion gate)
 * Surface 4 · End-of-lesson Q&A
 */

function VideoSurface({ dark = false }) {
  const mode = dark ? 'dark' : 'light';
  return (
    <div className="gwth-root" data-mode={mode} data-variant="e2-e" style={{
      width: 1440, minHeight: 1080, background: 'var(--background)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <LessonSidebar />
        <OutlineRail pages={LESSON_OUTLINE} currentPage={1} />

        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            borderBottom: '1px solid var(--border)', padding: '10px 40px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontFamily: '"JetBrains Mono", monospace', fontSize: 10.5,
            letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted-foreground)',
          }}>
            <span>COURSE · LESSON 13</span>
            <span>FRI 8 MAY 2026 · 14:24 BST</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <StatePill />
              <Avatar initials="AE" size={26} />
            </div>
          </div>

          <div style={{ padding: '0 56px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <LessonChrome
              monthLabel="MONTH 1 · LESSON 13"
              lessonNum={13}
              title="Building with Claude: your first useful tool."
              pageNum={1} pageTotal={8}
              monthDone={12} monthTotal={24}
            />

            <div style={{ flex: 1, padding: '32px 0 24px', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '100%', maxWidth: 880 }}>
                <div className="label" style={{ marginBottom: 10, color: 'var(--variant-warm)' }}>PAGE 1 OF 8 · INTRO VIDEO · 4:12</div>
                <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.015em', margin: '0 0 18px', maxWidth: 720 }}>
                  Why this lesson, in four minutes.
                </h2>

                {/* video frame */}
                <div style={{
                  position: 'relative', aspectRatio: '16 / 9',
                  border: '2px solid var(--border-strong)',
                  background: '#0e0c0a', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(circle at 30% 35%, oklch(0.32 0.02 75) 0%, oklch(0.14 0.005 75) 70%)',
                  }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <button aria-label="Play video" style={{
                      width: 88, height: 88, border: '2px solid #fff',
                      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
                      color: '#fff', cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="28" height="32" viewBox="0 0 14 16" fill="currentColor"><polygon points="2,1 13,8 2,15"/></svg>
                    </button>
                  </div>
                  <div style={{
                    position: 'absolute', top: 14, left: 16,
                    fontFamily: '"JetBrains Mono", monospace', fontSize: 10.5,
                    letterSpacing: '0.18em', color: 'rgba(255,255,255,0.85)',
                  }}>L13 · INTRO · NARR. PALMER</div>
                  <div style={{
                    position: 'absolute', bottom: 14, right: 16,
                    fontFamily: '"JetBrains Mono", monospace', fontSize: 11,
                    letterSpacing: '0.1em', color: 'rgba(255,255,255,0.85)',
                  }}>03:22 / 04:12</div>

                  {/* video scrub bar — sit at bottom, mark 80% threshold */}
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '0 16px 12px' }}>
                    <div style={{ position: 'relative', height: 5, background: 'rgba(255,255,255,0.18)' }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '80%', background: '#fff' }} />
                      {/* 80% threshold tick */}
                      <div style={{
                        position: 'absolute', top: -5, bottom: -5, left: '80%',
                        width: 2, background: 'var(--primary)',
                      }} />
                      <div style={{
                        position: 'absolute', top: -22, left: '80%', transform: 'translateX(-50%)',
                        fontFamily: '"JetBrains Mono", monospace', fontSize: 9,
                        letterSpacing: '0.18em', color: 'var(--variant-warm)', whiteSpace: 'nowrap',
                      }}>80% MARK</div>
                    </div>
                  </div>
                </div>

                {/* completion gate strip */}
                <div style={{
                  marginTop: 18, padding: '16px 20px',
                  border: '2px solid var(--success)',
                  background: 'oklch(0.94 0.06 145 / 0.35)',
                  display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 18, alignItems: 'center',
                }}>
                  <span className="status-icon" data-state="done" style={{ width: 22, height: 22 }}>
                    <svg width="11" height="11" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 5l2 2 4-4"/></svg>
                  </span>
                  <div>
                    <div style={{ fontSize: 14.5, fontWeight: 600 }}>
                      Counts toward completion. <span className="accent-italic">You passed the 80% mark a moment ago.</span>
                    </div>
                    <div className="serif" style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 2 }}>
                      Lesson completion needs the intro watched to 80% and the Q&A passed. One down.
                    </div>
                  </div>
                  <span className="mono" style={{ fontSize: 10.5, letterSpacing: '0.18em', color: 'var(--success)', fontWeight: 700 }}>
                    GATE 1 / 2 · CLEARED
                  </span>
                </div>

                <div style={{
                  marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                  border: '1px solid var(--border)',
                }}>
                  <VideoMeta tag="DURATION" value="4:12" sub="watched 3:22" />
                  <VideoMeta tag="THRESHOLD" value="80%" sub="cleared at 3:22" border />
                  <VideoMeta tag="UP NEXT" value="Page 2" sub="Picking the right problem" border />
                </div>

                <div style={{ marginTop: 32 }}>
                  <PageFooter pageNum={1} pageTotal={8} />
                </div>
              </div>
            </div>
          </div>

          <AudioBar muted autoAdvance={true} />
        </main>
      </div>
    </div>
  );
}

function VideoMeta({ tag, value, sub, border }) {
  return (
    <div style={{
      padding: '14px 18px',
      borderLeft: border ? '1px solid var(--border)' : 'none',
    }}>
      <div className="label">{tag}</div>
      <div className="num-display" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 4 }}>{value}</div>
      <div className="serif" style={{ fontSize: 12.5, color: 'var(--muted-foreground)', marginTop: 1 }}>{sub}</div>
    </div>
  );
}

// ── Q&A ────────────────────────────────────────────────────────
function QASurface({ dark = false }) {
  const mode = dark ? 'dark' : 'light';
  return (
    <div className="gwth-root" data-mode={mode} data-variant="e2-e" style={{
      width: 1440, minHeight: 1180, background: 'var(--background)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <LessonSidebar />
        <OutlineRail pages={LESSON_OUTLINE} currentPage={8} />

        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            borderBottom: '1px solid var(--border)', padding: '10px 40px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontFamily: '"JetBrains Mono", monospace', fontSize: 10.5,
            letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted-foreground)',
          }}>
            <span>COURSE · LESSON 13 · Q&A</span>
            <span>FRI 8 MAY 2026 · 14:51 BST</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <StatePill />
              <Avatar initials="AE" size={26} />
            </div>
          </div>

          <div style={{ padding: '0 56px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <LessonChrome
              monthLabel="MONTH 1 · LESSON 13 · END-OF-LESSON"
              lessonNum={13}
              title="Q&A: four short questions before this counts."
              pageNum={8} pageTotal={8}
              monthDone={12} monthTotal={24}
            />

            <div style={{ flex: 1, padding: '32px 0 24px', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '100%', maxWidth: 720 }}>
                <p className="serif" style={{
                  fontSize: 17, lineHeight: 1.55, color: 'var(--muted-foreground)',
                  margin: '0 0 28px',
                }}>
                  Pass three of four to count this lesson toward Month 1. <span className="accent-italic">No clock, no streak, no penalty for retrying.</span>
                </p>

                <QAItem
                  num={1} total={4} state="passed"
                  prompt="Which best describes the brief you should write for your first useful tool?"
                  options={[
                    { label: 'A two-page PRD with success metrics and acceptance criteria.', state: 'idle' },
                    { label: 'A paragraph that fits on a sticky note, specific to your own week.', state: 'correct' },
                    { label: 'A list of every feature you might add later.', state: 'idle' },
                    { label: 'A demo problem from the course examples.', state: 'idle' },
                  ]}
                  feedback="Right. Small, embarrassing, specific to your week."
                />

                <QAItem
                  num={2} total={4} state="open"
                  prompt="The lesson lists three rules for picking the brief. Which is NOT one of them?"
                  options={[
                    { label: 'The input has to come from a place you already go.', state: 'idle' },
                    { label: 'The output has to land in a place you already look.', state: 'idle' },
                    { label: 'The tool must use at least two model calls in a chain.', state: 'selected' },
                    { label: 'There is no new tab.', state: 'idle' },
                  ]}
                />

                <QAItem
                  num={3} total={4} state="locked"
                  prompt="In the worked example, where did the tool deliver its output?"
                  options={[
                    { label: 'A new dashboard at a new URL.', state: 'idle' },
                    { label: 'A draft reply inside Gmail, where the input already lived.', state: 'idle' },
                    { label: 'A Notion database labelled “triage”.', state: 'idle' },
                    { label: 'A weekly Slack digest at 9am.', state: 'idle' },
                  ]}
                />

                <QAItem
                  num={4} total={4} state="locked"
                  prompt="Which outcome does the lesson explicitly say also counts?"
                  options={[
                    { label: 'Shipping the tool to a colleague.', state: 'idle' },
                    { label: 'Running the tool then deciding to throw it away.', state: 'idle' },
                    { label: 'Shipping a polished version on the weekend.', state: 'idle' },
                    { label: 'Posting it to the cohort Slack.', state: 'idle' },
                  ]}
                />

                <div style={{
                  marginTop: 32, paddingTop: 22, borderTop: '1px solid var(--border)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.18em', color: 'var(--muted-foreground)' }}>
                    1 PASSED · 1 SELECTED · 2 PENDING
                  </div>
                  <a className="btn btn-primary" href="#" style={{ minWidth: 240 }}>
                    SUBMIT Q&amp;A <span>→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <AudioBar muted autoAdvance={true} />
        </main>
      </div>
    </div>
  );
}

function QAItem({ num, total, prompt, options, state, feedback }) {
  const isPassed = state === 'passed';
  const isLocked = state === 'locked';
  return (
    <div style={{
      marginBottom: 22,
      border: `2px solid ${isPassed ? 'var(--success)' : 'var(--border-strong)'}`,
      background: 'var(--card)',
      opacity: isLocked ? 0.55 : 1,
      padding: '20px 22px 22px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.18em', color: 'var(--muted-foreground)' }}>
          QUESTION {num} OF {total}
        </div>
        {isPassed && (
          <span className="pill pill-success" style={{ fontWeight: 700 }}>
            <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M2 5l2 2 4-4"/></svg>
            CORRECT
          </span>
        )}
      </div>
      <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.4, marginBottom: 16 }}>{prompt}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {options.map((o, i) => (
          <QAOption key={i} {...o} letter={String.fromCharCode(65 + i)} />
        ))}
      </div>
      {feedback && (
        <div style={{
          marginTop: 14, padding: '10px 14px',
          background: 'oklch(0.94 0.06 145 / 0.4)',
          borderLeft: '3px solid var(--success)',
          fontFamily: '"Vollkorn", serif', fontStyle: 'italic', fontWeight: 500,
          fontSize: 14.5, color: 'var(--foreground)',
        }}>
          {feedback}
        </div>
      )}
    </div>
  );
}

function QAOption({ letter, label, state }) {
  const styles = {
    idle:     { border: 'var(--border-strong)', bg: 'transparent',                     fg: 'var(--foreground)' },
    selected: { border: 'var(--foreground)',    bg: 'var(--muted)',                     fg: 'var(--foreground)' },
    correct:  { border: 'var(--success)',       bg: 'oklch(0.94 0.06 145 / 0.5)',       fg: 'var(--foreground)' },
    wrong:    { border: 'var(--destructive)',   bg: 'oklch(0.95 0.04 27 / 0.45)',       fg: 'var(--foreground)' },
  }[state];
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '32px 1fr auto', gap: 14, alignItems: 'center',
      padding: '12px 14px',
      border: `2px solid ${styles.border}`,
      background: styles.bg,
      cursor: 'pointer',
    }}>
      <span className="mono" style={{
        width: 26, height: 26, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        border: '1.5px solid var(--border-strong)',
        fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
      }}>{letter}</span>
      <div style={{ fontSize: 14.5, lineHeight: 1.45, color: styles.fg }}>{label}</div>
      {state === 'correct' && (
        <svg width="16" height="16" viewBox="0 0 10 10" fill="none" stroke="var(--success)" strokeWidth="2.2" strokeLinecap="round"><path d="M2 5l2 2 4-4"/></svg>
      )}
      {state === 'selected' && (
        <span className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--muted-foreground)', fontWeight: 700 }}>SELECTED</span>
      )}
      {state === 'idle' && <span style={{ width: 16 }} />}
    </div>
  );
}

Object.assign(window, { VideoSurface, QASurface });
