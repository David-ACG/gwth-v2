/* Desktop active learner — 1440 wide
 * Active paid Month 1, 13 of 24 lessons complete.
 */

function DesktopActive({ dark = false }) {
  const [mode, setMode] = React.useState(dark ? 'dark' : 'light');
  React.useEffect(() => { setMode(dark ? 'dark' : 'light'); }, [dark]);

  const statePill = (
    <span className="pill pill-success">
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: 'currentColor',
      }} />
      Active · Month 1 of 3
    </span>
  );

  return (
    <div className="gwth-root" data-mode={mode} data-variant="e2-e" style={{
      width: 1440,
      minHeight: 2480,
      background: 'var(--background)',
      color: 'var(--foreground)',
    }}>
      <AppHeader user={{ name: 'Alex Example', initials: 'AE' }}
        statePill={statePill}
        dark={mode === 'dark'}
        onToggleDark={() => setMode(m => m === 'light' ? 'dark' : 'light')} />
      <MastRow section="DASHBOARD · TODAY" date="FRI 8 MAY 2026 · 14:24 BST" build="BETA · v0.4.1" />

      {/* ── TOP TASK BAND ───────────────────────────────────────── */}
      <section style={{
        padding: '40px 32px 36px',
        borderBottom: '2px solid var(--border-strong)',
        display: 'grid',
        gridTemplateColumns: '1fr 480px',
        gap: 48,
        alignItems: 'flex-end',
      }}>
        <div>
          <div className="label" style={{ marginBottom: 18 }}>TODAY · 14:24 BST</div>
          <h1 className="display" style={{ fontSize: 64 }}>
            Welcome back, Alex.<br/>
            <span className="accent-italic" style={{ fontSize: 56 }}>Five hours this week.</span>
          </h1>
          <p style={{
            fontSize: 16, color: 'var(--muted-foreground)', marginTop: 18, maxWidth: 540, lineHeight: 1.55,
          }}>
            Month 1, lesson 13. Capstone 01 approved 6 May. Score 104,
            verified two days ago. Next charge 8 June.
          </p>
        </div>

        <div style={{ borderLeft: '2px solid var(--border-strong)', paddingLeft: 36 }}>
          <div className="label label-warm" style={{ marginBottom: 14 }}>NEXT, IF YOU HAVE 24 MINUTES</div>
          <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 6 }}>LESSON 13 · MONTH 1</div>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 8 }}>
            Building with Claude: your first useful tool.
          </div>
          <div className="serif" style={{ fontSize: 16, color: 'var(--muted-foreground)', marginBottom: 22 }}>
            You wrote the brief yesterday. Today you ship it.
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <a className="btn btn-primary" href="#">
              Continue Lesson 13
              <span>→</span>
            </a>
            <a className="btn btn-ghost btn-sm" href="#">Skip to Q&amp;A</a>
          </div>
        </div>
      </section>

      {/* ── COURSE (full width — the most important section) ── */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <div style={{ padding: '40px 32px 48px' }}>
          <SectionLabel num="01" title="YOUR COURSE" />
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 12 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
              Month 1 of 3. <span className="accent-italic" style={{ fontSize: 28 }}>Plain English.</span>
            </h2>
            <span className="mono num" style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>
              13 / 24 mandatory · 2 / 6 optional
            </span>
          </div>
          <div style={{ marginTop: 18 }}>
            <ProgressBar value={13} total={24} />
          </div>
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--muted-foreground)' }}>UNLOCKED 8 APR</span>
            <span className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--muted-foreground)' }}>TARGET TOP 30% · 7 JUN</span>
          </div>

          {/* lesson list */}
          <div className="panel-strong" style={{ marginTop: 28 }}>
            <div style={{
              padding: '12px 16px',
              display: 'grid',
              gridTemplateColumns: '30px 60px 1fr auto',
              gap: 16,
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 10.5,
              letterSpacing: '0.16em',
              color: 'var(--muted-foreground)',
              borderBottom: '2px solid var(--border-strong)',
              textTransform: 'uppercase',
            }}>
              <div></div>
              <div>NO.</div>
              <div>LESSON</div>
              <div>LENGTH</div>
            </div>

            {/* compressed range row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '30px 60px 1fr auto',
              gap: 16, alignItems: 'center', padding: '14px 16px',
              borderTop: '1px solid var(--border)',
              color: 'var(--muted-foreground)',
            }}>
              <div><span className="status-icon" data-state="done"><svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 5l2 2 4-4"/></svg></span></div>
              <div className="mono-num">L01–12</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>
                Twelve foundations, complete.
                <span className="serif" style={{ marginLeft: 10, fontSize: 13.5, color: 'var(--muted-foreground)' }}>
                  ChatGPT past Google, prompt patterns, three small builds.
                </span>
              </div>
              <a href="#" className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--muted-foreground)' }}>REVIEW →</a>
            </div>

            <LessonRow num={13} title="Building with Claude: your first useful tool" length="24 MIN" state="current" />
            <LessonRow num={14} title="Q&A: when to reach for which model" length="9 MIN" state="pending" />
            <LessonRow num={15} title="Reading docs without reading docs" length="18 MIN" state="pending" />
            <LessonRow num={16} title="Codex for non-engineers, part one" length="22 MIN" state="pending" />
            <LessonRow num={17} title="Plain-English automations" length="26 MIN" state="pending" tag="OPTIONAL" />
            <LessonRow num={18} title="Two-week capstone brief" length="14 MIN" state="pending" />
            <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)' }}>
              <span className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--muted-foreground)' }}>+ 6 MORE LESSONS THIS MONTH</span>
              <a href="#" className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', fontWeight: 600 }}>VIEW ALL 24 →</a>
            </div>
          </div>

          {/* upcoming months */}
          <div className="cell-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 28, border: 'none', gap: 16 }}>
            <div style={{
              padding: '24px 26px',
              background: 'oklch(0.88 0.06 75 / 0.55)',
              border: '1px solid var(--variant-warm)',
              position: 'relative',
            }}>
              <div className="label" style={{ marginBottom: 8, color: 'var(--primary)' }}>MONTH 02 · LOCKED</div>
              <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                Apps, agents, and the consultant&rsquo;s skill.
              </div>
              <div className="serif" style={{ fontSize: 14, color: 'var(--foreground)', opacity: 0.75, marginTop: 10, lineHeight: 1.5 }}>
                20 mandatory plus 15 optional. Target top 5%.
              </div>
              <div style={{ marginTop: 22, paddingTop: 14, borderTop: '1px solid var(--variant-warm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', fontWeight: 600 }}>UNLOCKS 8 JUN</span>
                <span className="mono num-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>£29</span>
              </div>
            </div>
            <div className="panel-sage" style={{
              padding: '24px 26px',
              position: 'relative',
            }}>
              <div className="label" style={{ marginBottom: 8, color: 'var(--variant-warm)' }}>MONTH 03 · LOCKED</div>
              <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.01em', color: 'inherit' }}>
                Enterprise transformation, in your job.
              </div>
              <div className="serif" style={{ fontSize: 14, color: 'inherit', opacity: 0.7, marginTop: 10, lineHeight: 1.5 }}>
                20 mandatory plus 15 optional. Target top 1%.
              </div>
              <div style={{ marginTop: 22, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.18)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', fontWeight: 600, color: 'var(--variant-warm)' }}>UNLOCKS 8 JUL</span>
                <span className="mono num-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--variant-warm)' }}>£29</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SCORE + CREDENTIAL CURRENTNESS (own band, below course) ── */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ padding: '40px 32px 48px', borderRight: '1px solid var(--border)' }}>
          <SectionLabel num="02" title="YOUR GWTH SCORE" accent />
          <div style={{ marginTop: 12, marginBottom: 4 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2 }}>
              <span className="accent-italic">Improving.</span> Verified two days ago.
            </h2>
          </div>
          <div style={{ marginTop: 20, maxWidth: 520 }}>
            <ScoreTicker
              user={{ name: 'Alex Example', initials: 'AE', role: 'Operations Lead · UK' }}
              score={104}
              tier="TOP 1%"
              delta={49}
              trendLabel="VS 3 MONTHS AGO"
              scoreUrl="gwth.ai/score/c67sg#dde5"
            />
          </div>

          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <a className="btn btn-ghost btn-sm" href="#">Copy public URL</a>
            <a className="btn btn-ghost btn-sm" href="#">Add to LinkedIn</a>
            <a className="btn btn-ghost btn-sm" href="#">Download QR</a>
          </div>
        </div>

        <div style={{ padding: '40px 32px 48px' }}>
          <SectionLabel num="03" title="CREDENTIAL CURRENTNESS" />
          <div style={{ marginTop: 12, marginBottom: 4 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2 }}>
              Score is current. <span className="accent-italic">Stays that way if you keep going.</span>
            </h2>
          </div>
          <div style={{ marginTop: 20, padding: '20px 22px', border: '1px solid var(--border)', background: 'var(--card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>Last verified work: Capstone 01.</div>
                <div className="serif" style={{ fontSize: 14, color: 'var(--muted-foreground)', marginTop: 2 }}>
                  Approved 6 May by reviewer M. Patel.
                </div>
              </div>
              <span className="pill pill-success">Stable</span>
            </div>
            <div style={{ marginTop: 16 }}>
              <ProgressBar value={92} total={100} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span className="mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', color: 'var(--muted-foreground)' }}>FRESHNESS 92%</span>
                <span className="mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', color: 'var(--muted-foreground)' }}>NEXT DECAY CHECK 11 MAY</span>
              </div>
            </div>
          </div>

          {/* Lessons updated — review to keep score fresh */}
          <div style={{ marginTop: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div className="label" style={{ color: 'var(--variant-warm)' }}>UPDATED SINCE YOU LAST WATCHED · 4</div>
              <a href="#" className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--muted-foreground)' }}>MARK ALL REVIEWED</a>
            </div>
            <div className="serif" style={{ fontSize: 14, color: 'var(--muted-foreground)', marginTop: 6, lineHeight: 1.45 }}>
              The course updates as the tools do. A short re-watch keeps your score current and your work in step with what employers are using right now.
            </div>
            <div style={{ marginTop: 16, border: '1px solid var(--border)', background: 'var(--card)' }}>
              <UpdatedLessonRow
                num="L09"
                title="Reading docs without reading docs"
                change="New section on Claude Sonnet 4.5 doc-tool — 4 min added at 12:18."
                date="2 DAYS AGO"
              />
              <UpdatedLessonRow
                num="L11"
                title="Spreadsheets, plain English"
                change="Replaced the GPT-4 demo with Claude Code; same brief, faster path."
                date="5 DAYS AGO"
              />
              <UpdatedLessonRow
                num="L07"
                title="When to reach for which model"
                change="Updated pricing table and Apr-2026 model line-up. Two new examples."
                date="1 WEEK AGO"
              />
              <UpdatedLessonRow
                num="L04"
                title="Prompt patterns that survive a model swap"
                change="Re-recorded with new Claude voice. Same six patterns."
                date="2 WEEKS AGO"
                last
              />
            </div>
            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', color: 'var(--muted-foreground)' }}>
                REVIEWING UPDATED LESSONS HOLDS YOUR FRESHNESS ABOVE 90%
              </span>
              <a href="#" className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', fontWeight: 600 }}>UPDATE LOG →</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── ACTIVITY (promoted band — bigger, higher) ─────────── */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <div style={{ padding: '40px 32px 12px' }}>
          <SectionLabel num="04" title="ACTIVITY" />
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', margin: '12px 0 0' }}>
            Five-hour rhythm. <span className="accent-italic">Held for eleven days.</span>
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.05fr 1.6fr 1fr',
          margin: '24px 32px 0',
          border: '1px solid var(--border)',
        }}>
          {/* BIG hours number — gold panel */}
          <div className="panel-warm" style={{ padding: '32px 28px' }}>
            <div className="label" style={{ color: 'inherit', opacity: 0.75 }}>HOURS THIS WEEK</div>
            <div className="num-display" style={{
              fontSize: 124, fontWeight: 700, lineHeight: 0.95, letterSpacing: '-0.04em',
              marginTop: 14, color: 'inherit',
            }}>5.2</div>
            <div className="serif" style={{ fontSize: 16, color: 'inherit', marginTop: 14, lineHeight: 1.35 }}>
              On target. The course is built around <span className="accent-italic">five hours a week</span> — you are exactly there.
            </div>
            <div style={{ marginTop: 18, display: 'flex', gap: 22 }}>
              <div>
                <div className="label" style={{ color: 'inherit', opacity: 0.75 }}>VS LAST WEEK</div>
                <div className="mono" style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>+0.8 HRS</div>
              </div>
              <div>
                <div className="label" style={{ color: 'inherit', opacity: 0.75 }}>4-WEEK AVG</div>
                <div className="mono" style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>4.9 HRS</div>
              </div>
            </div>
          </div>

          {/* Heatmap, larger */}
          <div style={{ padding: '32px 28px', background: 'var(--card)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div className="label">LAST 12 WEEKS</div>
              <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', color: 'var(--muted-foreground)' }}>EVERY GREEN CELL · A SESSION YOU SHIPPED</div>
            </div>
            <div style={{ marginTop: 18, transform: 'scale(1.35)', transformOrigin: 'top left', width: 'fit-content' }}>
              <ActivityHeatmap />
            </div>
          </div>

          {/* Streak stack — sage panel */}
          <div className="panel-sage" style={{ padding: '32px 28px' }}>
            <div className="label" style={{ color: 'var(--variant-warm)' }}>CURRENT STREAK</div>
            <div className="num-display" style={{ fontSize: 88, fontWeight: 700, lineHeight: 0.95, letterSpacing: '-0.04em', marginTop: 10, color: 'inherit' }}>
              11<span style={{ fontSize: 20, color: 'inherit', opacity: 0.6, marginLeft: 6, letterSpacing: 0 }}>DAYS</span>
            </div>
            <div className="serif" style={{ fontSize: 14, color: 'inherit', opacity: 0.7, marginTop: 6 }}>
              Longest yet: 18 days, in March.
            </div>
            <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.16)' }}>
              <div className="label" style={{ color: 'var(--variant-warm)' }}>PROJECTS SHIPPED</div>
              <div className="num-display" style={{ fontSize: 44, fontWeight: 700, marginTop: 4, letterSpacing: '-0.03em', color: 'var(--variant-warm)' }}>12</div>
              <div className="serif" style={{ fontSize: 13, color: 'inherit', opacity: 0.7, marginTop: 2 }}>
                Across nine lessons, two labs, one capstone.
              </div>
            </div>
          </div>
        </div>
        <div style={{ height: 40 }} />
      </section>

      {/* ── PORTFOLIO ───────────────────────────────────────────── */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <div style={{ padding: '40px 32px 12px' }}>
          <SectionLabel num="05" title="PORTFOLIO" />
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', margin: '12px 0 0' }}>
            Every lesson ships a project. <span className="accent-italic">They all live here.</span>
          </h2>
        </div>

        {/* Capstone progress strip — sage band, the score-affecting subset */}
        <div className="panel-sage" style={{
          margin: '20px 32px 0',
          padding: '16px 22px',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto auto auto auto',
          gap: 18,
          alignItems: 'center',
        }}>
          <div className="label" style={{ color: 'var(--variant-warm)' }}>CAPSTONES · 1 OF 3</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <CapstoneTick state="approved" label="C01" />
            <CapstoneTick state="brief" label="C02" />
            <CapstoneTick state="locked" label="C03" />
          </div>
          <div className="serif" style={{ fontSize: 13.5, color: 'inherit', opacity: 0.78 }}>
            Three pieces of verifiable work, one per month. These are the projects that count for credential.
          </div>
          <a href="#" className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', fontWeight: 600, color: 'var(--variant-warm)' }}>EVIDENCE LOCKER →</a>
        </div>

        <div className="cell-grid" style={{ gridTemplateColumns: '1.7fr 1fr', margin: '20px 32px 0' }}>
          {/* Portfolio list — every shipped artifact */}
          <div style={{ padding: '20px 22px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
              <div className="label">SHIPPED · 12 PROJECTS</div>
              <div style={{ display: 'flex', gap: 14 }}>
                <FilterChip active>ALL</FilterChip>
                <FilterChip>CAPSTONES</FilterChip>
                <FilterChip>LESSONS</FilterChip>
                <FilterChip>LABS</FilterChip>
              </div>
            </div>

            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column' }}>
              <PortfolioRow
                tag="CAPSTONE 01" tagKind="capstone"
                title="Internal ops assistant"
                meta="Built in M1 · Claude + Notion API · approved by M. Patel"
                status="approved" statusLabel="APPROVED"
                date="6 MAY"
              />
              <PortfolioRow
                tag="L09" tagKind="lesson"
                title="Doc triage scanner for inbound briefs"
                meta="Lesson project · ChatGPT · 240 lines TS"
                status="public" statusLabel="PUBLIC"
                date="4 MAY"
              />
              <PortfolioRow
                tag="L08" tagKind="lesson"
                title="Three-rule email triage"
                meta="Lesson project · Claude + Gmail filter export"
                status="public" statusLabel="PUBLIC"
                date="1 MAY"
              />
              <PortfolioRow
                tag="LAB" tagKind="lab"
                title="Spreadsheet QA in plain English"
                meta="Lab · unscored · Claude + Sheets"
                status="public" statusLabel="PUBLIC"
                date="28 APR"
              />
              <PortfolioRow
                tag="L07" tagKind="lesson"
                title="Meeting recap → Jira tickets"
                meta="Lesson project · Claude Code · 1 webhook"
                status="public" statusLabel="PUBLIC"
                date="24 APR"
              />
              <PortfolioRow
                tag="L06" tagKind="lesson"
                title="Personal CRM in Notion + Claude"
                meta="Lesson project · private build"
                status="private" statusLabel="PRIVATE"
                date="20 APR"
              />
              <PortfolioRow
                tag="LAB" tagKind="lab"
                title="Resume rewriter for non-tech roles"
                meta="Lab · unscored · public template"
                status="public" statusLabel="PUBLIC"
                date="17 APR"
              />
            </div>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <a href="#" className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', fontWeight: 600 }}>VIEW ALL 12 →</a>
              <span className="mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', color: 'var(--muted-foreground)' }}>
                LESSON PROJECTS DO NOT AFFECT SCORE · LABS DO NOT AFFECT SCORE
              </span>
            </div>
          </div>

          {/* Saved cell */}
          <div style={{ padding: '20px 22px 22px' }}>
            <div className="label">SAVED · 12 ITEMS</div>
            <div style={{ marginTop: 10, fontSize: 17, fontWeight: 600, lineHeight: 1.25 }}>
              Bookmarks, drafts, notes.
            </div>
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 0 }}>
              <SavedRow kind="DRAFT" title="Capstone 02 brief" date="YESTERDAY" />
              <SavedRow kind="NOTE" title="Six prompt patterns I keep reusing" date="2 MAY" />
              <SavedRow kind="LESSON" title="L09 · Reading docs without reading docs" date="29 APR" />
              <SavedRow kind="LAB" title="Email triage with three rules" date="24 APR" />
              <SavedRow kind="DRAFT" title="Lab idea — invoice chaser" date="22 APR" />
            </div>
            <a href="#" className="mono" style={{ marginTop: 14, display: 'inline-block', fontSize: 11, letterSpacing: '0.14em', fontWeight: 600 }}>OPEN ALL SAVED →</a>
          </div>
        </div>

        <div style={{ height: 40 }} />
      </section>

      {/* ── NOTIFICATIONS (full width) ─────────────────────────── */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <div style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <SectionLabel num="06" title="NOTIFICATIONS" />
            <a href="#" className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--muted-foreground)' }}>MARK ALL READ</a>
          </div>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column' }}>
            <NotifRow time="2H AGO" tag="CAPSTONE" tagColor="success" body="Capstone 01 was approved by reviewer M. Patel." />
            <NotifRow time="6H AGO" tag="LESSON" body="L13 was updated · 2 new examples for Claude Code." />
            <NotifRow time="YESTERDAY" tag="SCORE" tagColor="warm" body="Score moved from 92 to 104. New tier: Top 1%." />
            <NotifRow time="3 MAY" tag="REMINDER" body="Q&A on L09 expires in 5 days. Pass to keep credit." />
            <NotifRow time="2 MAY" tag="COURSE" body="Month 2 unlocks 8 June. Your charge is queued, no action needed." />
          </div>
        </div>
      </section>

      {/* ── POSTSCRIPT (sage panel) ─────────────────────────────── */}
      <section className="panel-sage" style={{ padding: '48px 32px 56px' }}>
        <SectionLabel num="07" title="POSTSCRIPT" accent={false} />
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'flex-end' }}>
          <h3 style={{
            fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.05,
            color: 'inherit',
          }}>
            Five hours a week.<br/>
            <span style={{ fontFamily: '"Vollkorn", serif', fontStyle: 'italic', fontWeight: 500 }}>Decide later, but keep going.</span>
          </h3>
          <p style={{ fontSize: 15, lineHeight: 1.55, opacity: 0.85, margin: 0, maxWidth: 460 }}>
            Your score reflects the last 90 days. Skip a week and the freshness check
            will tell you. Stay Current opens after Month 3 to keep things current
            without resitting the whole course.
          </p>
        </div>
      </section>

      {/* footer */}
      <footer style={{
        padding: '24px 32px',
        display: 'flex', justifyContent: 'space-between',
        fontSize: 11.5, color: 'var(--muted-foreground)',
        fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.1em', textTransform: 'uppercase',
      }}>
        <span>© 2026 GWTH.ai · UK</span>
        <span>Built for the 23 May beta · v0.4.1</span>
        <span>Privacy · Terms · Accessibility</span>
      </footer>
    </div>
  );
}

// ── small subcomponents only used here ─────────────────────────
function UpdatedLessonRow({ num, title, change, date, last }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, alignItems: 'flex-start',
      padding: '14px 18px',
      borderBottom: last ? 'none' : '1px solid var(--border)',
    }}>
      <span className="mono" style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        minWidth: 44, height: 24, padding: '0 8px',
        fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em',
        background: 'var(--variant-warm)', color: '#fff',
      }}>{num}</span>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, justifyContent: 'space-between' }}>
          <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{title}</div>
          <a href="#" className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', fontWeight: 600, whiteSpace: 'nowrap' }}>RE-WATCH →</a>
        </div>
        <div className="serif" style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 3, lineHeight: 1.4 }}>
          {change}
        </div>
      </div>
      <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', color: 'var(--muted-foreground)', whiteSpace: 'nowrap', marginTop: 4 }}>{date}</div>
    </div>
  );
}

function CapstoneTick({ state, label }) {
  const styles = {
    approved: { bg: 'var(--success)', fg: '#fff', border: 'var(--success)' },
    brief:    { bg: 'transparent', fg: 'var(--variant-warm)', border: 'var(--variant-warm)' },
    locked:   { bg: 'transparent', fg: 'rgba(255,255,255,0.55)', border: 'rgba(255,255,255,0.25)' },
  }[state];
  return (
    <span className="mono" style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 44, height: 22, padding: '0 8px',
      fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em',
      background: styles.bg, color: styles.fg,
      border: `1px solid ${styles.border}`,
    }}>{label}</span>
  );
}

function FilterChip({ children, active }) {
  return (
    <a href="#" className="mono" style={{
      fontSize: 10.5, letterSpacing: '0.14em', fontWeight: 600,
      color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
      borderBottom: active ? '1.5px solid var(--accent-warm)' : '1.5px solid transparent',
      paddingBottom: 2,
    }}>{children}</a>
  );
}

function PortfolioRow({ tag, tagKind, title, meta, status, statusLabel, date }) {
  const tagStyle = {
    capstone: { bg: 'var(--accent-warm)', fg: '#fff' },
    lesson:   { bg: 'var(--card)', fg: 'var(--foreground)', border: '1px solid var(--border)' },
    lab:      { bg: 'transparent', fg: 'var(--muted-foreground)', border: '1px dashed var(--border)' },
  }[tagKind];
  const statusPill = {
    approved: <span className="pill pill-success">{statusLabel}</span>,
    public:   <span className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--muted-foreground)' }}>{statusLabel}</span>,
    private:  <span className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--muted-foreground)' }}>{statusLabel}</span>,
  }[status];
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 14, alignItems: 'center',
      padding: '12px 0', borderTop: '1px solid var(--border)',
    }}>
      <span className="mono" style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        minWidth: 86, height: 24, padding: '0 10px',
        fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
        background: tagStyle.bg, color: tagStyle.fg,
        border: tagStyle.border || 'none',
      }}>{tag}</span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.25 }}>{title}</div>
        <div className="serif" style={{ fontSize: 12.5, color: 'var(--muted-foreground)', marginTop: 2 }}>{meta}</div>
      </div>
      <div>{statusPill}</div>
      <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', color: 'var(--muted-foreground)', minWidth: 56, textAlign: 'right' }}>{date}</div>
    </div>
  );
}

function CapstoneRow({ num, title, status, date }) {
  const pill = {
    approved: <span className="pill pill-success">Approved</span>,
    review: <span className="pill pill-warn">In review</span>,
    brief: <span className="pill pill-muted">Brief due</span>,
    changes: <span className="pill pill-warn">Needs changes</span>,
    locked: <span className="pill pill-muted">Locked</span>,
  }[status];
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12, alignItems: 'center',
      padding: '12px 0', borderTop: '1px solid var(--border)',
    }}>
      <div className="mono-num">C{num}</div>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 500 }}>{title}</div>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--muted-foreground)', marginTop: 1 }}>{date}</div>
      </div>
      <div>{pill}</div>
    </div>
  );
}

function LabRow({ title, duration }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center',
      padding: '10px 0', borderTop: '1px solid var(--border)',
    }}>
      <div style={{ fontSize: 13.5, fontWeight: 500 }}>{title}</div>
      <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.12em', color: 'var(--muted-foreground)' }}>{duration}</div>
    </div>
  );
}

function SavedRow({ kind, title, date }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 10, alignItems: 'center',
      padding: '10px 0', borderTop: '1px solid var(--border)',
    }}>
      <div className="label" style={{ letterSpacing: '0.14em' }}>{kind}</div>
      <div style={{ fontSize: 13.5, fontWeight: 500 }}>{title}</div>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--muted-foreground)' }}>{date}</div>
    </div>
  );
}

function NotifRow({ time, tag, tagColor, body }) {
  const colors = { success: 'var(--success)', warm: 'var(--variant-warm)', destructive: 'var(--destructive)' };
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '90px 110px 1fr', gap: 16, alignItems: 'baseline',
      padding: '12px 0', borderTop: '1px solid var(--border)',
    }}>
      <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', color: 'var(--muted-foreground)' }}>{time}</div>
      <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', fontWeight: 600, color: colors[tagColor] || 'var(--foreground)' }}>{tag}</div>
      <div style={{ fontSize: 13.5, lineHeight: 1.45 }}>{body}</div>
    </div>
  );
}

Object.assign(window, { DesktopActive, CapstoneRow, LabRow, SavedRow, NotifRow });
