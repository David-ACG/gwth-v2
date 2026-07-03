/* Surface 1 · Desktop · Reading prose page (audio paused)
 * Surface 2 · Desktop · Audio playing, auto-advance ON, "Advancing in 2s" overlay
 */

const LESSON_OUTLINE = [
  { title: 'Why this lesson exists',          kind: 'PROSE · 2 MIN' },
  { title: 'Picking the right problem',       kind: 'PROSE · 3 MIN' },
  { title: 'The brief, in plain English',     kind: 'PROSE · 4 MIN' },
  { title: 'Calling Claude from a script',    kind: 'CODE · 4 MIN' },
  { title: 'When the model misreads you',     kind: 'PROSE · 3 MIN' },
  { title: 'Shipping past your own desk',     kind: 'PROSE · 3 MIN' },
  { title: 'Recap',                           kind: 'PROSE · 1 MIN' },
  { title: 'End-of-lesson Q&A',               kind: 'Q&A · 4 MIN' },
];

function ProseSurface({ playing = false, advancing = false, dark = false, label = 'Surface 1' }) {
  const mode = dark ? 'dark' : 'light';
  return (
    <div className="gwth-root" data-mode={mode} data-variant="e2-e" style={{
      width: 1440, minHeight: 1080, background: 'var(--background)', color: 'var(--foreground)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <LessonSidebar />
        <OutlineRail pages={LESSON_OUTLINE} currentPage={3} />

        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* mast row, light */}
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
              pageNum={3} pageTotal={8}
              monthDone={12} monthTotal={24}
            />

            <div style={{ flex: 1, padding: '36px 0 24px', display: 'flex', justifyContent: 'center' }}>
              <ProseBody>
                <p style={{ margin: 0, fontSize: 19, lineHeight: 1.55 }}>
                  Yesterday you wrote one paragraph on a sticky note: <span className="accent-italic">the smallest useful tool you wished existed at work last week</span>. Today you turn that paragraph into something you can actually run.
                </p>

                <p style={{ marginTop: 22 }}>
                  Most people, when they first sit down to build with a model, get stuck deciding what to build. They reach for the demo problems, the toy chatbot, the joke summariser. The teaching here is the opposite. Your first useful tool should be small, embarrassing, and <em style={{ fontFamily: '"Vollkorn", serif', fontStyle: 'italic' }}>specific to your own week</em>. Not a portfolio piece. A pocket knife.
                </p>

                <PullQuote>
                  The brief should fit on a sticky note. If it doesn’t, the tool will not ship.
                </PullQuote>

                <p>
                  Look at what you actually did between Monday and Friday. The repeated work, not the interesting work. Stand-up notes that became Jira tickets. Inbound emails that became three-line replies. The fortnightly slide where you copy six rows out of a spreadsheet. The point is not that any of these things are hard, it is that they are boring, and the model does not get bored.
                </p>

                <Figure
                  height={220}
                  label="FIG. 03 · A USEFUL TOOL, ANATOMY"
                  caption="Input from somewhere you already are · one model call · output back to where you already are. No new app to open."
                />

                <p>
                  Three rules for picking the brief. First: the input has to come from a place you already go, an email, a doc, a spreadsheet. Second: the output has to land in a place you already look, a Slack message, a Notion page, a Calendar event. Third: there is no new tab. If your tool needs a new tab, it is a product, not a tool, and you will not use it on Wednesday afternoon when you are tired.
                </p>

                <Callout tag="WORKED EXAMPLE">
                  Last cohort, the most-shipped lesson-13 build was a five-line script that read the latest message in a Gmail label called <span className="mono" style={{ background: 'var(--muted)', padding: '0 4px' }}>triage</span>, asked Claude for a one-sentence summary, and wrote it back as a draft reply. Forty minutes. Saved its author about an hour a week.
                </Callout>

                <p>
                  By the end of the next page you will have written your one-paragraph brief. By the end of the lesson you will have run the tool against a real input from your own week, and decided whether to keep it or throw it away. <span className="accent-italic">Both outcomes count.</span>
                </p>
              </ProseBody>
            </div>

            <div style={{ padding: '0 0 28px' }}>
              <div style={{ maxWidth: 720, margin: '0 auto', width: '100%' }}>
                <PageFooter pageNum={3} pageTotal={8} advancing={advancing} />
              </div>
            </div>
          </div>

          <AudioBar
            state={playing ? 'playing' : 'paused'}
            autoAdvance={true}
            currentTime={playing ? '02:14' : '00:00'}
            totalTime="03:42"
            progress={playing ? 60 : 0}
          />
        </main>
      </div>
    </div>
  );
}

Object.assign(window, { ProseSurface, LESSON_OUTLINE });
