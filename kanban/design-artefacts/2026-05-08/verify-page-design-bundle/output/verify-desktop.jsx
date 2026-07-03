/* GWTH.ai verify page — desktop surfaces (1440)
 * Surface 1 — Default verified state
 * Surface 2 — First-time visitor educational state
 * Surface 3 — Revoked state
 * Surface 4 — Dark mode (Surface 1 parity)
 * Surface 5 — Pending verification (24-hour window)
 */

const HOLDER = {
  name: 'Alex Example',
  initials: 'AE',
  role: 'Operations Lead · UK',
};

const SCORE_URL = 'gwth.ai/score/c67sg#dde5';

// ── Surface 1 — Default verified ───────────────────────────────
function DesktopVerified({ mode = 'light', height = 2480 }) {
  return (
    <VerifyShell mode={mode} height={height}>
      <ScoreTicker
        large
        hideEmployerExplainer
        user={HOLDER}
        scoreUrl={SCORE_URL}
        score={104}
        tier="TOP 1%"
        delta={49}
        trendLabel="VS 3 MONTHS AGO"
      />

      <MetaStrip items={[
        { label: 'LAST VERIFIED', value: '2 MAY 2026' },
        { label: 'VERIFICATION ID', value: 'C67SG#DDE5' },
        { label: 'STATUS', value: 'VERIFIED', tone: 'success' },
      ]} />

      <VerifyBody>
        <CredentialName />
        <FiveReasonsPanel />
        <CalcDisclosure />
        <ShareRow />
        <CanonicalLine />
      </VerifyBody>
    </VerifyShell>
  );
}

// ── Surface 2 — First-time visitor (educational) ───────────────
function DesktopFirstTime({ mode = 'light', height = 2880 }) {
  return (
    <VerifyShell mode={mode} height={height}>
      <ScoreTicker
        large
        hideEmployerExplainer
        user={HOLDER}
        scoreUrl={SCORE_URL}
        score={104}
        tier="TOP 1%"
        delta={49}
        trendLabel="VS 3 MONTHS AGO"
      />

      <MetaStrip items={[
        { label: 'LAST VERIFIED', value: '2 MAY 2026' },
        { label: 'VERIFICATION ID', value: 'C67SG#DDE5' },
        { label: 'STATUS', value: 'VERIFIED', tone: 'success' },
      ]} />

      <VerifyBody>
        <CredentialName />
        <EducationalPanel />
        <FiveReasonsPanel />
        <CalcDisclosure defaultOpen />
        <ShareRow />
        <CanonicalLine />
      </VerifyBody>
    </VerifyShell>
  );
}

// ── Surface 3 — Revoked ────────────────────────────────────────
function DesktopRevoked({ mode = 'light', height = 1280 }) {
  return (
    <VerifyShell mode={mode} height={height}>
      <RevokedHero user={HOLDER} scoreUrl={SCORE_URL} revokedDate="28 April 2026" />

      <MetaStrip items={[
        { label: 'REVOKED ON', value: '28 APR 2026' },
        { label: 'VERIFICATION ID', value: 'C67SG#DDE5' },
        { label: 'STATUS', value: 'REVOKED' },
      ]} />

      <VerifyBody>
        <CredentialNameRevoked />

        <section style={{
          marginTop: 32,
          padding: '26px 28px 28px',
          border: '1px solid var(--border)',
          background: 'var(--card)',
        }}>
          <div className="label">CONTACT</div>
          <p style={{
            margin: '12px 0 0', fontSize: 16, lineHeight: 1.6, color: 'var(--foreground)',
          }}>
            If you believe this is in error, contact{' '}
            <a href="mailto:verify@gwth.ai" style={{
              color: 'var(--primary)', borderBottom: '1px solid var(--primary)', paddingBottom: 1,
            }}>verify@gwth.ai</a>.
          </p>
          <p style={{
            margin: '14px 0 0', fontSize: 14, lineHeight: 1.55, color: 'var(--muted-foreground)',
          }}>
            Revocation reasons include refund, manual review failure, or breach of the credential
            terms. The verification ID and the holder&rsquo;s name remain on record so prior
            third-party references can be reconciled.
          </p>
        </section>

        <CanonicalLine />
      </VerifyBody>
    </VerifyShell>
  );
}

// ── Surface 5 — Pending verification ───────────────────────────
function DesktopPending({ mode = 'light', height = 1480 }) {
  return (
    <VerifyShell mode={mode} height={height}>
      <PendingHero user={HOLDER} scoreUrl={SCORE_URL} />

      <MetaStrip items={[
        { label: 'ISSUED', value: '8 MAY 2026' },
        { label: 'VERIFICATION ID', value: 'C67SG#DDE5' },
        { label: 'STATUS', value: 'PENDING', tone: 'warm' },
      ]} />

      <VerifyBody>
        <div style={{ marginTop: 28 }}>
          <div className="label">CREDENTIAL · PENDING FIRST VERIFICATION</div>
          <h1 style={{
            margin: '10px 0 0', fontSize: 30, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.18,
          }}>
            GWTH Certified Practitioner.<br />
            <span className="accent-italic" style={{ fontSize: 28 }}>Score appears here within 24 hours.</span>
          </h1>
          <p style={{
            marginTop: 16, fontSize: 16, lineHeight: 1.6, color: 'var(--muted-foreground)', maxWidth: 640,
          }}>
            Newly issued credentials are held in a 24-hour verification window so the first decay
            check can run. The score, tier, and trend will populate once the check completes. The
            holder, the verification ID, and the canonical URL are stable from the moment the
            credential is issued.
          </p>
        </div>

        <FiveReasonsPanel />
        <CanonicalLine />
      </VerifyBody>
    </VerifyShell>
  );
}

// ── Shared body fragments ──────────────────────────────────────
function CredentialName() {
  return (
    <div style={{ marginTop: 36 }}>
      <div className="label">CREDENTIAL</div>
      <h1 style={{
        margin: '10px 0 0', fontSize: 32, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15,
      }}>
        GWTH Certified Practitioner.<br />
        <span className="accent-italic" style={{ fontSize: 30 }}>Score 104, Top 1%.</span>
      </h1>
      <p style={{
        marginTop: 14, fontSize: 16, lineHeight: 1.6, color: 'var(--muted-foreground)', maxWidth: 640,
      }}>
        Issued by GWTH.ai, United Kingdom. The credential certifies that the named holder
        has completed the GWTH applied-AI course, passed every check question, and shipped
        three reviewed capstone projects. The score above is live and recomputes weekly.
      </p>
    </div>
  );
}

function CredentialNameRevoked() {
  return (
    <div style={{ marginTop: 36 }}>
      <div className="label">CREDENTIAL · ON RECORD</div>
      <h1 style={{
        margin: '10px 0 0', fontSize: 30, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.18,
        color: 'var(--muted-foreground)',
      }}>
        GWTH Certified Practitioner.<br />
        <span style={{
          fontFamily: '"Vollkorn", serif', fontStyle: 'italic', fontWeight: 500,
          color: 'var(--muted-foreground)',
        }}>No longer recognised by the issuer.</span>
      </h1>
    </div>
  );
}

function CanonicalLine() {
  return (
    <section style={{
      marginTop: 56,
      paddingTop: 22,
      borderTop: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: 16,
      flexWrap: 'wrap',
    }}>
      <div className="mono" style={{
        fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
        color: 'var(--muted-foreground)',
      }}>
        Canonical URL · gwth.ai/score/c67sg#dde5
      </div>
      <div className="mono" style={{
        fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
        color: 'var(--muted-foreground)',
      }}>
        Issued by GWTH.ai · UK · No expiry
      </div>
    </section>
  );
}

Object.assign(window, {
  DesktopVerified, DesktopFirstTime, DesktopRevoked, DesktopPending,
});
