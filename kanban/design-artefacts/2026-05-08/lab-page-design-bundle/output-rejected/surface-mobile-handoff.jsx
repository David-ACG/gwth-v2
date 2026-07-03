/* Surface 5 · Mobile 412 · prose page + audio bar
 * Plus: Lesson-complete editorial state (optional)
 */

function MobileSurface({ dark = false }) {
  const mode = dark ? 'dark' : 'light';
  return (
    <div className="gwth-root" data-mode={mode} data-variant="e2-e" style={{
      width: 412, minHeight: 892, background: 'var(--background)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* status / nav row */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button aria-label="Previous page" style={{
          width: 32, height: 32, border: '1px solid var(--border)',
          background: 'transparent', color: 'var(--muted-foreground)', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 2L4 7l5 5"/></svg>
        </button>
        <Logo small />
        <button aria-label="Lesson outline" style={{
          width: 32, height: 32, border: '1px solid var(--border)',
          background: 'transparent', color: 'var(--foreground)', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 4h10M2 7h10M2 10h7"/></svg>
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: 'var(--primary)', color: '#fff',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 8.5, fontWeight: 700, letterSpacing: '0.06em',
            padding: '1px 4px', borderRadius: 0,
          }}>3/8</span>
        </button>
      </div>

      {/* lesson chrome */}
      <div style={{ padding: '18px 22px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="label" style={{ fontSize: 9.5, letterSpacing: '0.18em' }}>MONTH 1 · LESSON 13</div>
          <div className="label" style={{ fontSize: 9.5, letterSpacing: '0.2em' }}>P3 / 8</div>
        </div>
        <h1 style={{
          fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2,
          margin: '8px 0 14px',
        }}>Building with Claude: your first useful tool.</h1>
        <SegmentedBar value={2} total={8} />
      </div>

      {/* prose */}
      <div style={{ padding: '20px 22px 24px', flex: 1 }}>
        <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6 }}>
          Yesterday you wrote one paragraph on a sticky note: <span className="accent-italic">the smallest useful tool you wished existed at work last week</span>. Today you turn that paragraph into something you can actually run.
        </p>
        <p style={{ marginTop: 16, fontSize: 15.5, lineHeight: 1.6 }}>
          Most people, when they first sit down to build with a model, get stuck deciding what to build. The teaching here is the opposite. Your first useful tool should be small, embarrassing, and <em style={{ fontFamily: '"Vollkorn", serif', fontStyle: 'italic' }}>specific to your own week</em>.
        </p>

        <blockquote style={{
          margin: '20px 0 18px', padding: '4px 0 4px 16px',
          borderLeft: '3px solid var(--primary)',
          fontFamily: '"Vollkorn", serif', fontStyle: 'italic', fontWeight: 500,
          fontSize: 17, lineHeight: 1.4, color: 'var(--foreground)',
        }}>
          The brief should fit on a sticky note. If it doesn’t, the tool will not ship.
        </blockquote>

        <p style={{ fontSize: 15.5, lineHeight: 1.6 }}>
          Look at what you actually did between Monday and Friday. The repeated work, not the interesting work. The point is not that any of these things are hard, it is that they are boring, and the model does not get bored.
        </p>

        <PageFooter mobile />
      </div>

      <AudioBar mobile state="playing" autoAdvance={true} currentTime="02:14" totalTime="03:42" progress={60} />
    </div>
  );
}

// ── Lesson-complete state (optional, editorial) ────────────────
function LessonCompleteSurface({ dark = false }) {
  const mode = dark ? 'dark' : 'light';
  return (
    <div className="gwth-root" data-mode={mode} data-variant="e2-e" style={{
      width: 1440, minHeight: 1080, background: 'var(--background)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <LessonSidebar />
        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            borderBottom: '1px solid var(--border)', padding: '10px 40px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontFamily: '"JetBrains Mono", monospace', fontSize: 10.5,
            letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted-foreground)',
          }}>
            <span>COURSE · LESSON 13 · COMPLETE</span>
            <span>FRI 8 MAY 2026 · 14:58 BST</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <StatePill />
              <Avatar initials="AE" size={26} />
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 56px' }}>
            <div style={{ width: '100%', maxWidth: 920 }}>
              <div className="label" style={{ marginBottom: 24 }}>MONTH 1 · LESSON 13 · COMPLETE</div>

              <h1 style={{
                fontFamily: '"Vollkorn", serif', fontStyle: 'italic', fontWeight: 500,
                fontSize: 88, lineHeight: 1.05, letterSpacing: '-0.02em',
                margin: 0, color: 'var(--foreground)',
              }}>
                Lesson complete.
              </h1>

              <p style={{
                marginTop: 24, maxWidth: 600, fontSize: 17, lineHeight: 1.55,
                color: 'var(--muted-foreground)',
              }}>
                Intro watched to <span className="accent-italic" style={{ fontStyle: 'italic' }}>92%</span>. Q&amp;A passed <span className="accent-italic" style={{ fontStyle: 'italic' }}>4 of 4</span>. This counts toward Month 1.
              </p>

              <div style={{
                marginTop: 36, display: 'grid', gridTemplateColumns: '1.4fr 1fr',
                border: '2px solid var(--border-strong)',
              }}>
                <div style={{ padding: '28px 30px' }}>
                  <div className="label" style={{ color: 'var(--variant-warm)' }}>UP NEXT · LESSON 14</div>
                  <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.15, marginTop: 8 }}>
                    Q&amp;A: when to reach for which model.
                  </div>
                  <div className="serif" style={{ fontSize: 14, color: 'var(--muted-foreground)', marginTop: 8 }}>
                    9 minutes. Three pages, no video. Picks up where this one stopped.
                  </div>
                  <div style={{ marginTop: 22, display: 'flex', gap: 10 }}>
                    <a className="btn btn-primary" href="#" style={{ minWidth: 220 }}>START LESSON 14 <span>→</span></a>
                    <a className="btn btn-ghost btn-sm" href="#">BACK TO COURSE</a>
                  </div>
                </div>
                <div style={{
                  padding: '28px 30px',
                  borderLeft: '2px solid var(--border-strong)',
                  background: 'var(--muted)',
                }}>
                  <div className="label">MONTH 1 PROGRESS</div>
                  <div className="num-display" style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-0.03em', marginTop: 6 }}>
                    13<span style={{ fontSize: 22, color: 'var(--muted-foreground)' }}> / 24</span>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <SegmentedBar value={13} total={24} />
                  </div>
                  <div className="serif" style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 10 }}>
                    Eleven mandatory lessons left. On the five-hour rhythm, two and a quarter weeks.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Handoff notes ──────────────────────────────────────────────
function HandoffNotes() {
  return (
    <div className="gwth-root" data-mode="light" data-variant="e2-e" style={{ padding: '36px 40px 44px', height: '100%', overflow: 'hidden' }}>
      <div className="label">HANDOFF · GWTH.AI / LESSON VIEWER</div>
      <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: '8px 0 4px' }}>
        Lesson viewer, in the dashboard shell.
      </h1>
      <p className="serif" style={{ fontSize: 15, color: 'var(--muted-foreground)', margin: 0 }}>
        Two ideas, two surfaces. Multi-page reading, audiobook auto-advance.
      </p>

      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        <div>
          <div className="label">COMPONENTS TO BUILD</div>
          <ul style={{ marginTop: 8, paddingLeft: 18, fontSize: 13, lineHeight: 1.55 }}>
            <li><b>&lt;LessonChrome&gt;</b> — month label, title, page-counter, two thin progress bars (lesson + course-month). Lives at the top of every prose / video / Q&amp;A page.</li>
            <li><b>&lt;OutlineRail&gt;</b> — collapsible page list with done / current / pending ticks. Mobile becomes a sheet, triggered by the top-chrome icon.</li>
            <li><b>&lt;AudioBar&gt;</b> — persistent, sticky bottom, never modal. Variants: <code>paused</code>, <code>playing</code>, <code>muted-during-video</code>. Always shows AUTO-ADVANCE toggle.</li>
            <li><b>&lt;Waveform&gt; / &lt;Scrubber&gt;</b> — bars when playing, scrub track when paused. Same row, same width.</li>
            <li><b>&lt;AdvancingPing&gt;</b> — 2-second tap-to-stay overlay above the Continue button when audio ends and auto-advance is ON.</li>
            <li><b>&lt;PageFooter&gt;</b> — previous-ghost left, primary Continue right. Mobile collapses to single full-width Continue, prev becomes top-left icon.</li>
            <li><b>&lt;Figure&gt; / &lt;PullQuote&gt; / &lt;Callout&gt; / &lt;CodeBlock&gt;</b> — inline content primitives. Mono caption on figures.</li>
            <li><b>&lt;VideoFrame&gt;</b> — 16:9 with 80% threshold tick on the scrub bar; clears the first completion gate at threshold (inline confirmation, no modal).</li>
            <li><b>&lt;QAItem&gt; / &lt;QAOption&gt;</b> — single-select MCQ, sharp bordered. States: idle / selected / correct / wrong / locked / passed.</li>
          </ul>
        </div>

        <div>
          <div className="label">AUTO-ADVANCE STATE MACHINE</div>
          <pre className="mono" style={{
            marginTop: 8, padding: '12px 14px', fontSize: 11, lineHeight: 1.55,
            background: 'var(--muted)', border: '1px solid var(--border-strong)',
            whiteSpace: 'pre-wrap',
          }}>{`PAUSED ─tap play──────▶ PLAYING
PLAYING ─audio ends, auto OFF──▶ PAUSED (Continue manual)
PLAYING ─audio ends, auto ON───▶ ADVANCING (2s)
ADVANCING ─tap to stay─────────▶ PAUSED (current page)
ADVANCING ─2s elapsed──────────▶ PLAYING (next page)
ANY ─toggle auto──▶ same state, flag flipped
VIDEO PAGE ─enter──▶ AudioBar = MUTED
VIDEO PAGE ─exit (next prose page)──▶ AudioBar resumes PAUSED`}</pre>

          <div className="label" style={{ marginTop: 18 }}>BUTTON COPY (LOCKED)</div>
          <ul style={{ marginTop: 8, paddingLeft: 18, fontSize: 13, lineHeight: 1.55 }}>
            <li>Primary advance: <b>CONTINUE →</b></li>
            <li>Reverse: <b>← PREVIOUS PAGE</b> (mobile: icon only)</li>
            <li>Q&amp;A submit: <b>SUBMIT Q&amp;A →</b></li>
            <li>Pass next-up: <b>START LESSON 14 →</b></li>
            <li>Auto-advance ping: <b>ADVANCING IN 2S · tap to stay</b></li>
            <li>Video gate: <b>Counts toward completion. GATE 1 / 2 · CLEARED</b></li>
            <li>Speed cycle: <b>1x · 1.25x · 1.5x</b></li>
          </ul>
        </div>
      </div>

      <div style={{ marginTop: 22, padding: '16px 20px', border: '2px solid var(--border-strong)' }}>
        <div className="label">WHAT THE CODEBASE NEEDS BEFORE WIRING</div>
        <ol style={{ marginTop: 6, paddingLeft: 20, fontSize: 13, lineHeight: 1.55 }}>
          <li>Per-page narration manifest. Each lesson section emits <code>{`{ pageId, audioUrl, durationMs, transcriptUrl }`}</code>; the manifest is what the viewer iterates over for auto-advance.</li>
          <li>Page segmentation step in the lesson loader. A 4,000-word lesson should resolve to 8–12 pages of 200–500 words plus optional figure / code / video / Q&amp;A.</li>
          <li>Persist <code>autoAdvance</code> as a per-user setting (default ON), and <code>lastCompletedPage</code> per lesson so refresh resumes mid-lesson.</li>
          <li>Video: emit <code>watchedFraction</code> on a 1-second tick. <code>completion.video = watchedFraction &gt;= 0.8</code> is the first gate.</li>
          <li>Q&amp;A: pass condition <code>correct &gt;= ceil(total * 0.75)</code>. Per-question feedback shown only after Submit, not live.</li>
          <li>Lesson completion writes to the same record the dashboard reads (<code>completedLessons[]</code>). Score recompute is the existing weekly job, not lesson-time.</li>
        </ol>
      </div>

      <div style={{ marginTop: 18 }}>
        <div className="label">DEFERRED / OUT OF SCOPE FOR 23 MAY</div>
        <p style={{ fontSize: 12.5, color: 'var(--muted-foreground)', margin: '6px 0 0', lineHeight: 1.55 }}>
          Highlight / annotate prose. Per-page bookmarking. Background-tab audio with media-session integration (iOS). Transcript pane. Speed beyond 1.5x. Full-screen video.
        </p>
      </div>
    </div>
  );
}

Object.assign(window, { MobileSurface, LessonCompleteSurface, HandoffNotes });
