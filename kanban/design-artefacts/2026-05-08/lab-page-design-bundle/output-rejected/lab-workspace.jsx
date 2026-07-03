/* GWTH.ai · Lab page · WORKSPACE primitives.
 * Three shapes: prompt comparison · tool walkthrough · build challenge.
 * Workspace is a single bordered surface (no nested panels). Denser, more
 * tool-like than the instructions column.
 */

// ── Prompt-comparison workspace ────────────────────────────────
// Variants:
//   stage = 'empty'    : prompt input on top, output panel empty, Run primary
//   stage = 'filled'   : visitor wrote prompt + ran it; output rendered;
//                        sample "good prompt" reveal available; comparison view
//   stage = 'compared' : both prompts side-by-side, locked
function PromptComparisonWorkspace({ stage = 'empty' }) {
  return (
    <WorkspaceFrame title="PROMPT WORKBENCH" subtitle="Claude Haiku 4.5 · 1024 tokens">
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* visitor's prompt */}
        <PromptCell
          heading="YOUR PROMPT"
          editable
          value={
            stage === 'empty'
              ? ''
              : 'Write a short summary of this email.'
          }
          placeholder="Paste an email, doc, or message you want summarised, then write a prompt asking Claude to summarise it."
          showRun={stage === 'empty'}
        />

        {/* output */}
        <div style={{ borderTop: '1px solid var(--border)' }} />
        <OutputCell
          heading="CLAUDE'S OUTPUT"
          status={stage === 'empty' ? 'idle' : 'returned'}
          tokens={stage === 'empty' ? null : '184 tokens · 1.2s'}
        >
          {stage === 'empty' ? (
            <EmptyOutput />
          ) : (
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>
              The sender is asking about the timeline for the Q3 launch and wants to know who's owning the launch comms. They mention they have a draft post ready and would like a review by Friday. They ask if a 30 min sync this week is possible.
            </p>
          )}
        </OutputCell>

        {/* comparison reveal once visitor has run their prompt */}
        {stage !== 'empty' && (
          <>
            <div style={{ borderTop: '1px solid var(--border)' }} />
            <ComparisonReveal opened={stage === 'compared'} />
          </>
        )}
      </div>
    </WorkspaceFrame>
  );
}

// ── Tool-walkthrough workspace (alt for Surface 2) ────────────
function ToolWalkthroughWorkspace({ frame = 2, total = 4 }) {
  return (
    <WorkspaceFrame title="TOOL WALKTHROUGH" subtitle={`Perplexity · screenshot ${frame} of ${total}`}>
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          flex: 1, position: 'relative',
          background: 'repeating-linear-gradient(135deg, var(--muted) 0 14px, var(--card) 14px 28px)',
          border: '1.5px solid var(--border-strong)',
          margin: 18,
          minHeight: 360,
        }}>
          <div className="mono" style={{
            position: 'absolute', top: 12, left: 12,
            fontSize: 10.5, letterSpacing: '0.18em',
            background: 'var(--card)', border: '1px solid var(--border)',
            padding: '4px 10px', color: 'var(--muted-foreground)',
          }}>FRAME {String(frame).padStart(2,'0')} · PERPLEXITY · NEW THREAD</div>
          {/* annotation pin */}
          <div style={{
            position: 'absolute', top: 130, left: 220,
            width: 26, height: 26, borderRadius: '50%',
            background: 'var(--primary)', color: '#fff',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 12,
            boxShadow: '0 0 0 4px var(--background)',
          }}>1</div>
          <div style={{
            position: 'absolute', top: 130, left: 256,
            background: 'var(--card)', border: '1.5px solid var(--border-strong)',
            padding: '8px 12px', fontSize: 12.5, lineHeight: 1.4, maxWidth: 220,
          }}>Click <strong>Sources</strong> to open the citation panel.</div>
        </div>

        <div style={{
          padding: '12px 18px', borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', color: 'var(--muted-foreground)' }}>
            FRAME {frame} / {total}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <a href="#" className="btn btn-ghost btn-sm">← PREV FRAME</a>
            <a href="#" className="btn btn-sm" style={{ borderColor: 'var(--border-strong)', color: 'var(--foreground)' }}>NEXT FRAME →</a>
          </div>
        </div>
      </div>
    </WorkspaceFrame>
  );
}

// ── Build-challenge workspace (alt for Surface 2) ─────────────
function BuildChallengeWorkspace({ filled = true, rubricOpen = false }) {
  return (
    <WorkspaceFrame title="BUILD WORKBENCH" subtitle="One paragraph · then self-grade against rubric">
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: '16px 20px 14px' }}>
          <div className="label" style={{ marginBottom: 8 }}>YOUR ARTEFACT</div>
          <div style={{
            border: '1.5px solid var(--border-strong)', background: 'var(--background)',
            padding: '14px 16px', minHeight: 200,
            fontFamily: '"JetBrains Mono", monospace', fontSize: 13, lineHeight: 1.55,
            color: 'var(--foreground)', whiteSpace: 'pre-wrap',
          }}>
            {filled
              ? `A small tool that reads the latest message in my Gmail label "triage" and writes a one-sentence summary back as a draft reply. Trigger: every 15 minutes. Input: one Gmail thread. Output: one Gmail draft. Stops if the thread already has my reply.`
              : ''}
            {!filled && (
              <span className="mono" style={{ color: 'var(--muted-foreground)' }}>
                Write your one-paragraph brief here. Plain English. No code.
              </span>
            )}
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: 10,
          }}>
            <span className="mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', color: 'var(--muted-foreground)' }}>
              {filled ? '47 WORDS' : '0 WORDS'} · MIN 30
            </span>
            <a href="#" className="btn btn-primary btn-sm">SELF-CHECK →</a>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)' }} />

        <div style={{ padding: '16px 20px 18px' }}>
          <a href="#" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 13, color: 'var(--muted-foreground)',
            borderBottom: '1px dashed var(--muted-foreground)',
          }}>
            <span style={{ display: 'inline-block', transform: rubricOpen ? 'rotate(90deg)' : 'none' }}>›</span>
            {rubricOpen ? 'Hide rubric' : 'Show solution rubric'}
          </a>
          {rubricOpen && (
            <ol style={{
              margin: '12px 0 0', padding: '14px 14px 14px 30px',
              border: '1.5px solid var(--border-strong)', background: 'var(--card)',
              fontSize: 13.5, lineHeight: 1.6, color: 'var(--foreground)',
            }}>
              <li>Names the input. Where does the data come from?</li>
              <li>Names the output. Where does the result land?</li>
              <li>Says what triggers it, on a schedule or by hand.</li>
              <li>Says when to stop, so the loop is safe.</li>
            </ol>
          )}
        </div>
      </div>
    </WorkspaceFrame>
  );
}

// ── Locked final state (Surface 3) ─────────────────────────────
function PromptComparisonLocked() {
  return (
    <WorkspaceFrame title="PROMPT WORKBENCH · LOCKED" subtitle="Final compared output, kept for the record" lockedTone>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1px 1fr', flex: 1, minHeight: 0,
      }}>
        <ColumnReadOnly
          heading="YOUR PROMPT, FIRST GO"
          prompt={'Write a short summary of this email.'}
          output={`The sender wants to know the timeline for the Q3 launch and is asking about ownership of comms. They have a draft and want a review by Friday.`}
          tone="muted"
        />
        <div style={{ background: 'var(--border)' }} />
        <ColumnReadOnly
          heading="YOUR PROMPT, REVISED"
          prompt={'Summarise this email in 3 lines: who sent it, what they want, by when. Use plain UK English.'}
          output={`Sent by Priya (Marketing). She wants me to review her Q3 launch post and confirm comms ownership. Deadline: Friday 16 May, end of day.`}
          tone="primary"
        />
      </div>

      <div style={{
        borderTop: '1px solid var(--border)', padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--muted)',
      }}>
        <span className="mono" style={{
          fontSize: 10.5, letterSpacing: '0.18em', color: 'var(--muted-foreground)', fontWeight: 600,
        }}>
          DELTA · +SPECIFICITY · −AMBIGUITY · −EM DASHES
        </span>
        <a href="#" className="btn btn-ghost btn-sm">DOWNLOAD AS TXT</a>
      </div>
    </WorkspaceFrame>
  );
}

// ── Frame primitive ───────────────────────────────────────────
function WorkspaceFrame({ title, subtitle, lockedTone, children }) {
  return (
    <div style={{
      border: '1.5px solid var(--border-strong)',
      background: 'var(--card)',
      display: 'flex', flexDirection: 'column',
      height: '100%', minHeight: 0,
    }}>
      <div style={{
        padding: '12px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
        background: lockedTone ? 'var(--muted)' : 'transparent',
      }}>
        <div className="mono" style={{
          fontSize: 11, letterSpacing: '0.2em', color: 'var(--foreground)',
          fontWeight: 700, textTransform: 'uppercase',
        }}>{title}</div>
        {subtitle && (
          <div className="mono" style={{
            fontSize: 10.5, letterSpacing: '0.16em', color: 'var(--muted-foreground)',
            textTransform: 'uppercase',
          }}>{subtitle}</div>
        )}
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}

// ── Prompt cell (textarea-feel) ────────────────────────────────
function PromptCell({ heading, value, placeholder, editable, showRun }) {
  const empty = !value || value.length === 0;
  return (
    <div style={{ padding: '16px 20px 18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div className="label">{heading}</div>
        {editable && (
          <span className="mono" style={{ fontSize: 10.5, letterSpacing: '0.16em', color: 'var(--muted-foreground)' }}>
            {empty ? '0 / 800' : '34 / 800'}
          </span>
        )}
      </div>
      <div style={{
        border: '1.5px solid var(--border-strong)', background: 'var(--background)',
        padding: '12px 14px', minHeight: 88,
        fontFamily: '"JetBrains Mono", monospace', fontSize: 13.5, lineHeight: 1.55,
        color: empty ? 'var(--muted-foreground)' : 'var(--foreground)',
        whiteSpace: 'pre-wrap', position: 'relative',
      }}>
        {empty ? placeholder : value}
        {empty && (
          <span style={{
            position: 'absolute', left: 14, top: 12 + 17,
            display: 'inline-block', width: 8, height: 16, background: 'var(--foreground)',
            animation: 'gwth-caret 1s steps(1,end) infinite',
          }} />
        )}
        <style>{`@keyframes gwth-caret{50%{opacity:0}}`}</style>
      </div>
      <div style={{
        marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
      }}>
        <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.14em', color: 'var(--muted-foreground)' }}>
          MODEL · CLAUDE HAIKU 4.5
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="#" className="btn btn-ghost btn-sm">CLEAR</a>
          <a href="#" className="btn btn-primary btn-sm" style={{ minWidth: 92 }}>RUN ▸</a>
        </div>
      </div>
    </div>
  );
}

// ── Output cell ───────────────────────────────────────────────
function OutputCell({ heading, status, tokens, children }) {
  const idle = status === 'idle';
  return (
    <div style={{ padding: '16px 20px 20px', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div className="label">{heading}</div>
        <div className="mono" style={{
          fontSize: 10.5, letterSpacing: '0.14em',
          color: idle ? 'var(--muted-foreground)' : 'var(--success)',
          fontWeight: idle ? 400 : 600,
        }}>
          {idle ? 'AWAITING RUN' : `RETURNED · ${tokens}`}
        </div>
      </div>
      <div style={{
        flex: 1, minHeight: 140,
        border: '1.5px dashed var(--border-strong)',
        background: idle ? 'transparent' : 'var(--background)',
        borderStyle: idle ? 'dashed' : 'solid',
        padding: '14px 16px',
        color: 'var(--foreground)',
      }}>
        {children}
      </div>
    </div>
  );
}

function EmptyOutput() {
  return (
    <div style={{
      height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 10, color: 'var(--muted-foreground)',
    }}>
      <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.2em', fontWeight: 600 }}>
        ⌁ NO RUN YET
      </div>
      <div style={{ fontSize: 13, maxWidth: 320, textAlign: 'center' }}>
        Write a prompt above and press <span className="mono" style={{ background: 'var(--muted)', padding: '0 4px', fontWeight: 600 }}>RUN</span> to see what comes back.
      </div>
    </div>
  );
}

// ── Comparison reveal: 'show a sharper prompt' ───────────────
function ComparisonReveal({ opened }) {
  return (
    <div style={{ padding: '14px 20px 20px' }}>
      <a href="#" style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        fontSize: 13, color: 'var(--primary)', fontWeight: 600,
        borderBottom: '1px dashed var(--primary)',
      }}>
        <span style={{ display: 'inline-block', transform: opened ? 'rotate(90deg)' : 'none' }}>›</span>
        {opened ? 'Hide a sharper prompt' : 'Show a sharper prompt'}
      </a>
      {opened && (
        <div style={{
          marginTop: 12, padding: '14px 16px',
          border: '1.5px solid var(--border-strong)', background: 'var(--card)',
        }}>
          <div className="label" style={{ marginBottom: 8 }}>SAMPLE · SHARPER PROMPT</div>
          <div className="mono" style={{
            fontSize: 13.5, lineHeight: 1.55, color: 'var(--foreground)',
            background: 'var(--muted)', border: '1px solid var(--border)',
            padding: '10px 12px',
          }}>
            Summarise this email in 3 lines: who sent it, what they want, by when. Use plain UK English.
          </div>
          <p style={{ margin: '12px 0 0', fontSize: 13, lineHeight: 1.55, color: 'var(--muted-foreground)' }}>
            Notice what changed: a fixed shape (3 lines), the questions to answer, and a register. The model now has somewhere to land.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Read-only final column ────────────────────────────────────
function ColumnReadOnly({ heading, prompt, output, tone }) {
  const accent = tone === 'primary' ? 'var(--primary)' : 'var(--muted-foreground)';
  return (
    <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
      <div className="label" style={{ color: accent }}>{heading}</div>
      <div style={{
        border: '1px solid var(--border)', background: 'var(--background)',
        padding: '10px 12px',
        fontFamily: '"JetBrains Mono", monospace', fontSize: 12.5, lineHeight: 1.5,
      }}>
        {prompt}
      </div>
      <div style={{
        border: '1px solid var(--border)', background: 'var(--card)',
        padding: '10px 12px', fontSize: 13.5, lineHeight: 1.55, color: 'var(--foreground)',
        flex: 1,
      }}>
        {output}
      </div>
    </div>
  );
}

Object.assign(window, {
  PromptComparisonWorkspace,
  ToolWalkthroughWorkspace,
  BuildChallengeWorkspace,
  PromptComparisonLocked,
  WorkspaceFrame,
});
