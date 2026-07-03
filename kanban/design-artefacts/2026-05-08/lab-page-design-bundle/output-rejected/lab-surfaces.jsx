/* GWTH.ai · Lab page · the four surfaces.
 * Lab landing (S1) · in progress (S2) · complete (S3) · mobile (S4).
 * Plus optional dark mode S1, alt workspace variants, and handoff notes.
 */

const LAB_STEPS = [
  'Read the brief',
  'Write your first prompt',
  'Compare a sharper prompt',
  'Save what you learned',
];

const LAB_STEP_BODIES = {
  1: {
    eyebrow: 'WHAT WE\'RE DOING',
    body: (
      <>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6 }}>
          Two prompts, one model, one input. You write the first prompt the way you'd ordinarily phrase it, then we'll show you a sharper version and let you compare what comes back.
        </p>
        <p style={{ marginTop: 14, fontSize: 16, lineHeight: 1.6 }}>
          The point is not that there's a "right" prompt. The point is to <span className="accent-italic">feel the difference specificity makes</span>, on a real piece of text from your own week.
        </p>
        <p style={{ marginTop: 14, fontSize: 14.5, lineHeight: 1.6, color: 'var(--muted-foreground)' }}>
          Pick an email, a Slack message, or a doc you actually need to summarise today. Paste it on the right when you're ready.
        </p>
      </>
    ),
  },
  2: {
    eyebrow: 'YOUR FIRST PROMPT',
    body: (
      <>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6 }}>
          Write your prompt the way you'd say it out loud. Don't try to be clever. We just want a baseline to compare against.
        </p>
        <p style={{ marginTop: 14, fontSize: 16, lineHeight: 1.6 }}>
          When you press <span className="mono" style={{ background: 'var(--muted)', padding: '0 4px', fontWeight: 600 }}>RUN</span>, Claude will respond on the same panel. Read what comes back. Note whether it answered the question you actually had.
        </p>
      </>
    ),
  },
  3: {
    eyebrow: 'NOW SHARPEN IT',
    body: (
      <>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6 }}>
          Open <span className="accent-italic">Show a sharper prompt</span> on the right. We've written one for the same input, with a fixed shape and a couple of questions to answer.
        </p>
        <p style={{ marginTop: 14, fontSize: 16, lineHeight: 1.6 }}>
          Run it. Look at the second output next to your first. What did the sharper prompt give you that yours didn't?
        </p>
      </>
    ),
  },
  4: {
    eyebrow: 'SAVE WHAT YOU LEARNED',
    body: (
      <>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6 }}>
          Write one sentence about what changed. Not a theory of prompting, just what was different about the second output. We'll keep it on your saved labs page.
        </p>
      </>
    ),
  },
};

// ── Layout shell ──────────────────────────────────────────────
function LabFrame({ children, dark = false, mast, signedIn = false }) {
  const mode = dark ? 'dark' : 'light';
  return (
    <div className="gwth-root" data-mode={mode} style={{
      width: 1440, minHeight: 1080, background: 'var(--background)', color: 'var(--foreground)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <LabSidebar />
        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <LabMast section={mast} signedIn={signedIn} />
          {children}
        </main>
      </div>
    </div>
  );
}

// ── Surface 1 · Lab landing (Step 1, workspace empty) ─────────
function LabLandingSurface({ dark = false, signedIn = false }) {
  return (
    <LabFrame dark={dark} signedIn={signedIn} mast="LABS · PROMPT COMPARISON">
      <div style={{ padding: '0 56px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <LabChrome stepNum={1} stepTotal={4} />
        <TwoColumnBody>
          <InstructionsColumn step={1} signedIn={signedIn} />
          <PromptComparisonWorkspace stage="empty" />
        </TwoColumnBody>
      </div>
    </LabFrame>
  );
}

// ── Surface 2 · In progress (Step 2, workspace populated, hint open) ─
function LabProgressSurface({ workspaceVariant = 'prompt' }) {
  return (
    <LabFrame mast="LABS · PROMPT COMPARISON" signedIn>
      <div style={{ padding: '0 56px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <LabChrome stepNum={2} stepTotal={4} />
        <TwoColumnBody>
          <InstructionsColumn step={2} hintOpen signedIn />
          {workspaceVariant === 'prompt' && <PromptComparisonWorkspace stage="filled" />}
          {workspaceVariant === 'tool' && <ToolWalkthroughWorkspace />}
          {workspaceVariant === 'build' && <BuildChallengeWorkspace filled rubricOpen />}
        </TwoColumnBody>
      </div>
    </LabFrame>
  );
}

// ── Surface 3 · Lab complete + conversion card ───────────────
function LabCompleteSurface({ anonymous = true }) {
  return (
    <LabFrame mast="LABS · PROMPT COMPARISON · COMPLETE" signedIn={!anonymous}>
      <div style={{ padding: '0 56px 40px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <LabChrome stepNum={4} stepTotal={4} complete />
        <TwoColumnBody>
          <InstructionsCompleteColumn />
          <PromptComparisonLocked />
        </TwoColumnBody>

        {/* Conversion card sits below the body, full width */}
        <div style={{ marginTop: 30 }}>
          <ConversionCard />
        </div>
        {anonymous && (
          <div style={{ marginTop: 14 }}>
            <SaveProgressCard />
          </div>
        )}
      </div>
    </LabFrame>
  );
}

// ── Two-column body ──────────────────────────────────────────
function TwoColumnBody({ children }) {
  return (
    <div style={{
      flex: 1, display: 'grid',
      gridTemplateColumns: '400px 1fr',
      gap: 32,
      padding: '32px 0 28px',
      minHeight: 0,
    }}>
      {children}
    </div>
  );
}

// ── Instructions column (per-step body) ──────────────────────
function InstructionsColumn({ step = 1, hintOpen = false, signedIn = false }) {
  const meta = LAB_STEP_BODIES[step];
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      borderRight: '1px solid var(--border)',
      paddingRight: 28,
      minHeight: 0,
    }}>
      <StepIndicator stepNum={step} stepTotal={4} steps={LAB_STEPS} />

      <div style={{ marginTop: 26 }}>
        <div className="label" style={{ marginBottom: 10 }}>{meta.eyebrow}</div>
        {meta.body}
      </div>

      {step >= 2 && (
        <HintDisclosure
          open={hintOpen}
          hint={(
            <>
              Try giving Claude a <strong>shape</strong> (3 lines, 1 paragraph, 5 bullets) and a <strong>register</strong> (plain UK English, formal, casual). The model is good at filling in shapes you give it.
            </>
          )}
        />
      )}

      {!signedIn && step === 1 && <SignInCue />}

      <div style={{ marginTop: 'auto' }}>
        <StepFooter stepNum={step} stepTotal={4} primaryLabel={step === 4 ? 'FINISH' : 'CONTINUE'} />
      </div>
    </div>
  );
}

// ── Instructions column · COMPLETE state ─────────────────────
function InstructionsCompleteColumn() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      borderRight: '1px solid var(--border)',
      paddingRight: 28,
      minHeight: 0,
    }}>
      <StepIndicator stepNum={4} stepTotal={4} steps={LAB_STEPS} />

      <div style={{ marginTop: 26 }}>
        <div className="label" style={{ marginBottom: 10 }}>DONE</div>
        <p className="serif" style={{
          margin: 0, fontSize: 26, lineHeight: 1.25, color: 'var(--foreground)', letterSpacing: '-0.005em',
        }}>
          Lab complete.
        </p>
        <p style={{ marginTop: 14, fontSize: 15.5, lineHeight: 1.6, color: 'var(--foreground)' }}>
          You wrote two prompts on the same input and saw how shape and register changed what Claude gave back. That instinct is most of the job.
        </p>
        <p style={{ marginTop: 14, fontSize: 14, lineHeight: 1.6, color: 'var(--muted-foreground)' }}>
          We've kept your sharper prompt on the right. You can copy it out, send it on, or close the tab.
        </p>
      </div>

      <div style={{ marginTop: 22, padding: '12px 14px', border: '1px solid var(--border)', background: 'var(--muted)' }}>
        <div className="label" style={{ marginBottom: 4 }}>WHAT YOU PRACTISED</div>
        <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: 13, lineHeight: 1.6, color: 'var(--foreground)' }}>
          <li>Naming a shape for the answer</li>
          <li>Setting register and language</li>
          <li>Reading two outputs side by side</li>
        </ul>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Surface 4 · Mobile 412
// ──────────────────────────────────────────────────────────────
function LabMobileSurface() {
  return (
    <div className="gwth-root" data-mode="light" style={{
      width: 412, minHeight: 892, background: 'var(--background)', color: 'var(--foreground)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* compact mast */}
      <div style={{
        padding: '10px 16px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: '"JetBrains Mono", monospace', fontSize: 9.5,
        letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted-foreground)',
      }}>
        <Logo small />
        <span>LABS</span>
        <Avatar initials="AE" size={22} />
      </div>

      {/* chrome */}
      <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid var(--border)' }}>
        <div className="mono" style={{
          fontSize: 10, letterSpacing: '0.22em', color: 'var(--muted-foreground)', fontWeight: 600,
        }}>LAB · PROMPT COMPARISON</div>
        <h1 style={{
          margin: '8px 0 6px', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1,
        }}>Two prompts, one model: see what specificity buys you.</h1>
        <p className="serif" style={{ margin: 0, fontSize: 15, color: 'var(--muted-foreground)', lineHeight: 1.4 }}>
          A short, hands-on look at how phrasing changes what Claude gives back.
        </p>

        <div style={{
          marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        }}>
          <span className="pill" style={{
            borderColor: 'var(--border-strong)', color: 'var(--foreground)',
            background: 'var(--muted)', fontWeight: 700, fontSize: 9.5,
          }}>UNSCORED</span>
          <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
            Free, hands-on. Doesn't affect your GWTH Score.
          </span>
        </div>
      </div>

      {/* segmented step bar */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--muted-foreground)', fontWeight: 700 }}>
            STEP 2 OF 4
          </span>
          <span className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--muted-foreground)' }}>
            WRITE YOUR PROMPT
          </span>
        </div>
        <SegmentedBar value={1} total={4} />
      </div>

      {/* instructions block */}
      <div style={{ padding: '18px 18px 8px' }}>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55 }}>
          Write your prompt the way you'd say it out loud. We just want a baseline to compare against.
        </p>
        <p style={{ marginTop: 10, fontSize: 13.5, lineHeight: 1.55, color: 'var(--muted-foreground)' }}>
          Press <span className="mono" style={{ background: 'var(--muted)', padding: '0 4px', fontWeight: 600 }}>RUN</span>. Read what comes back.
        </p>

        <HintDisclosure
          open
          hint={<>Try giving Claude a <strong>shape</strong> and a <strong>register</strong>. Three lines, plain English, etc.</>}
        />
      </div>

      {/* workspace block (stacked below) */}
      <div style={{ padding: '6px 18px 18px' }}>
        <div className="label" style={{ marginBottom: 8 }}>YOUR PROMPT</div>
        <div style={{
          border: '1.5px solid var(--border-strong)', background: 'var(--background)',
          padding: '10px 12px', minHeight: 64,
          fontFamily: '"JetBrains Mono", monospace', fontSize: 12.5, lineHeight: 1.55,
        }}>
          Write a short summary of this email.
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <span className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--muted-foreground)' }}>
            CLAUDE HAIKU 4.5
          </span>
          <a href="#" className="btn btn-primary btn-sm" style={{ minWidth: 84 }}>RUN ▸</a>
        </div>

        <div className="label" style={{ marginTop: 16, marginBottom: 8 }}>OUTPUT</div>
        <div style={{
          border: '1.5px solid var(--border-strong)', background: 'var(--card)',
          padding: '10px 12px', fontSize: 13, lineHeight: 1.55, color: 'var(--foreground)',
        }}>
          The sender wants to know the timeline for the Q3 launch and is asking who owns comms. They have a draft and want a review by Friday.
        </div>

        <div className="mono" style={{ marginTop: 8, fontSize: 10, letterSpacing: '0.14em', color: 'var(--success)', fontWeight: 600 }}>
          RETURNED · 184 TOKENS · 1.2S
        </div>
      </div>

      {/* sticky-feel footer */}
      <div style={{
        marginTop: 'auto', padding: '14px 18px', borderTop: '2px solid var(--border-strong)',
        background: 'var(--card)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10,
      }}>
        <a href="#" className="btn btn-ghost btn-sm" style={{ minWidth: 76 }}>← BACK</a>
        <span className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--muted-foreground)' }}>
          2 / 4
        </span>
        <a href="#" className="btn btn-primary btn-sm" style={{ minWidth: 116 }}>CONTINUE →</a>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Handoff notes
// ──────────────────────────────────────────────────────────────
function HandoffNotes() {
  return (
    <div className="gwth-root" data-mode="light" style={{
      width: 920, minHeight: 1180, background: 'var(--background)', color: 'var(--foreground)',
      padding: '40px 48px', boxSizing: 'border-box',
    }}>
      <div className="label">HANDOFF · LAB PAGE · GWTH.AI</div>
      <h2 style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 700, letterSpacing: '-0.015em' }}>
        What this lab page is and how to wire it.
      </h2>
      <p className="serif" style={{ margin: '8px 0 0', fontSize: 17, color: 'var(--muted-foreground)' }}>
        Two columns, three lab shapes, one calm conversion. Tokens already locked.
      </p>

      <Section title="01 · Components">
        <Bullet><Mono>LabChrome</Mono> · top of body. Shape eyebrow, big sans title, italic Vollkorn subtitle, UNSCORED pill, explanation sentence, lab progress bar.</Bullet>
        <Bullet><Mono>InstructionsColumn</Mono> · left, max 400px. Holds <Mono>StepIndicator</Mono>, per-step body, <Mono>HintDisclosure</Mono>, optional <Mono>SignInCue</Mono>, and <Mono>StepFooter</Mono> (Back · counter · Continue).</Bullet>
        <Bullet><Mono>WorkspaceFrame</Mono> · right, fills remaining width. One bordered surface. Three concrete fills: <Mono>PromptComparisonWorkspace</Mono>, <Mono>ToolWalkthroughWorkspace</Mono>, <Mono>BuildChallengeWorkspace</Mono>. Pick by <Mono>lab.shape</Mono>.</Bullet>
        <Bullet><Mono>HintDisclosure</Mono> · inline expand/collapse. Never a modal. Reused for "Show solution" on build challenges.</Bullet>
        <Bullet><Mono>ConversionCard</Mono> · single bordered panel. One sentence, one terracotta CTA <Mono>START THE COURSE</Mono>, one ghost link <Mono>Browse more labs</Mono>. No stars, ribbons, or testimonials.</Bullet>
        <Bullet><Mono>SaveProgressCard</Mono> · only renders if visitor finished anonymously. One-line cue, one ghost CTA.</Bullet>
      </Section>

      <Section title="02 · State machine">
        <Mono block>{`type LabRoute = '/labs/[slug]'

state Lab {
  status:     'landing' | 'in_progress' | 'complete'
  stepIndex:  number      // 1..stepTotal
  workspace:  shape-specific blob, persisted across step transitions
  hints:      Set<stepIndex>      // which hints have been opened
  anonymous:  boolean              // false once user signs in
}

events:
  CONTINUE        -> stepIndex++ (workspace persists)
  BACK            -> stepIndex-- (workspace persists)
  RUN             -> workspace.run(input)  // shape-specific
  REVEAL_HINT(n)  -> hints.add(n)
  REVEAL_SOLUTION -> workspace.showRubric = true
  FINISH          -> status = 'complete'
  SIGN_IN         -> anonymous = false  // also: persist progress server-side`}</Mono>
        <Bullet>Status drives chrome (progress bar % and Continue copy). <Mono>FINISH</Mono> on the last step swaps the body to the COMPLETE state and reveals the conversion card. Workspace state must <em>not</em> reset on step transitions.</Bullet>
      </Section>

      <Section title="03 · Locked button copy">
        <CopyTable rows={[
          ['Workspace primary',     'RUN ▸'],
          ['Step primary',          'CONTINUE →'],
          ['Final step primary',    'FINISH'],
          ['Step secondary',        '← BACK'],
          ['Hint trigger',          'Show hint / Hide hint'],
          ['Solution trigger',      'Show solution rubric / Hide rubric'],
          ['Sample sharper prompt', 'Show a sharper prompt / Hide a sharper prompt'],
          ['Conversion CTA',        'START THE COURSE →'],
          ['Conversion ghost',      'Browse more labs'],
          ['Save card CTA',         'SIGN IN TO SAVE'],
          ['Sign-in cue body',      'Sign in to save your progress on this lab.'],
        ]} />
      </Section>

      <Section title="04 · What the codebase needs first">
        <Bullet><Mono>lab manifest</Mono> · <Mono>{`{ slug, title, subtitle, shape, estimate, steps[], hints[], expectedOutputs[], conversionCopy }`}</Mono>. Public, served from <Mono>/api/labs/[slug]</Mono>. Lives in MDX or DB.</Bullet>
        <Bullet><Mono>prompt-comparison primitive</Mono> · server proxy that calls Claude Haiku 4.5 with the visitor's prompt + a fixed sample input. Streams back. Shape-specific.</Bullet>
        <Bullet><Mono>screenshot annotation primitive</Mono> · pinned numeric markers + tooltip cards for the tool-walkthrough shape. Static frames per lab.</Bullet>
        <Bullet><Mono>self-grade rubric primitive</Mono> · word-count gate plus reveal-on-demand checklist; returns a soft pass/fail on the artefact.</Bullet>
        <Bullet><Mono>anonymous-progress storage</Mono> · keyed by <Mono>{`localStorage.gwth_lab_progress[slug]`}</Mono>. Migrates server-side once visitor signs in.</Bullet>
        <Bullet><Mono>rate limit</Mono> · model calls are public-facing; 5 runs per IP per lab per hour, surfaced as a quiet inline message, never a modal.</Bullet>
      </Section>

      <Section title="05 · Quality bar (design-side)">
        <Bullet>5-second test: visitor sees UNSCORED + the explanation sentence within 5 seconds of landing. The sentence is the only place we say "doesn't affect your Score" on the page until the conversion card.</Bullet>
        <Bullet>No-scroll-between-contexts test: instructions and workspace are visible together at 1440 × 900. Mobile stacks instructions over workspace, but the step counter sits at the top so context doesn't get lost on scroll.</Bullet>
        <Bullet>No-sold-to test: the conversion card is the only mention of the paid course on the page. It uses one sentence, one CTA, one ghost link. No second pass below the fold.</Bullet>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ marginTop: 28 }}>
      <div className="label" style={{ marginBottom: 12 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </section>
  );
}

function Bullet({ children }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '14px 1fr', gap: 10,
      fontSize: 14, lineHeight: 1.55,
    }}>
      <span style={{ color: 'var(--primary)', fontWeight: 800 }}>·</span>
      <span>{children}</span>
    </div>
  );
}

function Mono({ children, block }) {
  if (block) {
    return (
      <pre className="mono" style={{
        margin: '6px 0 6px', padding: '14px 16px',
        background: 'var(--muted)', border: '1px solid var(--border)',
        fontSize: 12.5, lineHeight: 1.55, whiteSpace: 'pre',
        overflow: 'auto',
      }}>{children}</pre>
    );
  }
  return (
    <span className="mono" style={{
      background: 'var(--muted)', padding: '0 5px',
      borderRadius: 0, fontSize: 12.5, fontWeight: 600,
    }}>{children}</span>
  );
}

function CopyTable({ rows }) {
  return (
    <div style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
      {rows.map(([label, copy], i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '220px 1fr',
          padding: '8px 14px', borderTop: i ? '1px solid var(--border)' : 'none',
          alignItems: 'center', gap: 18,
        }}>
          <span className="label">{label}</span>
          <span className="mono" style={{ fontSize: 12.5, color: 'var(--foreground)' }}>{copy}</span>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, {
  LabLandingSurface, LabProgressSurface, LabCompleteSurface, LabMobileSurface,
  HandoffNotes, LAB_STEPS,
});
