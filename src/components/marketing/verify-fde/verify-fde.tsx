import Image from "next/image"
import type { PublicCredential } from "@/lib/data/credentials"
import styles from "./verify-fde.module.css"

/** Props for {@link VerifyFde}. */
interface VerifyFdeProps {
  /** The resolved public credential. */
  credential: PublicCredential
  /** QR code data URL pointing at the verification URL. */
  qrCode: string
  /** Canonical verification URL for this credential. */
  verifyUrl: string
}

/**
 * Public credential verification page in the FDE journal register. The
 * credential is presented as the §5.7 highlight panel: paper surface, ink
 * border, the register's only shadow (hard teal offset on hover), a mono
 * credential-ID line, serif learner name, and a hairline row pairing the
 * huge serif score with a right-aligned mono facts grid. The QR code sits
 * in a square hairline frame.
 */
export function VerifyFde({ credential, qrCode, verifyUrl }: VerifyFdeProps) {
  const updatedDate = credential.updatedAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className={styles.shell}>
      <main className={styles.stage} data-section="verify">
        <div className={styles.stageInner}>
          <p className={styles.kicker}>Public GWTH credential verification</p>
          <h1 className={styles.stageTitle}>
            This credential is <em>verified.</em>
          </h1>

          <article className={styles.credentialPanel}>
            <div className={styles.panelGrid}>
              <div>
                <p className={styles.credentialId}>
                  {credential.verificationCode} ·{" "}
                  <span className={styles.statusVerified}>
                    <i aria-hidden="true">✓</i>
                    Verified
                  </span>
                </p>
                <h2 className={styles.learnerName}>
                  {credential.learnerName}
                </h2>
                <p className={styles.credentialBody}>
                  This learner has a public GWTH Score for{" "}
                  {credential.courseTitle}. Scores reflect completed lessons,
                  Q&amp;A performance, and current applied AI progress.
                </p>

                <div className={styles.credentialRow}>
                  <div className={styles.scoreBlock}>
                    <span className={styles.mono}>GWTH Score</span>
                    <p className={styles.credentialNumber}>
                      {credential.gwthScore}
                    </p>
                  </div>
                  <div className={styles.credentialFacts}>
                    <p>
                      <span>Benchmark</span>
                      <strong>{credential.percentileLabel}</strong>
                    </p>
                    <p>
                      <span>Trajectory</span>
                      <strong>{credential.trajectoryLabel}</strong>
                    </p>
                    <p>
                      <span>Last updated</span>
                      <strong>{updatedDate}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.qrColumn}>
                <div className={styles.qrFrame}>
                  <Image
                    src={qrCode}
                    alt={`QR code for ${credential.learnerName}'s GWTH verification URL`}
                    width={176}
                    height={176}
                    unoptimized
                  />
                </div>
                <a href={verifyUrl} className={styles.buttonOutline}>
                  Open verification URL
                </a>
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  )
}

/**
 * Beta-disabled state for public credential verification, in the same
 * register: centred paper panel with ink border, mono kicker, serif
 * heading, and a single solid action.
 */
export function VerifyFdeDisabled() {
  return (
    <div className={styles.shell}>
      <main className={styles.stage} data-section="verify-disabled">
        <div className={styles.stageInner}>
          <article className={styles.disabledPanel}>
            <p className={styles.mono}>Beta access</p>
            <h1>
              Public credential verification is{" "}
              <em>disabled for beta.</em>
            </h1>
            <p>
              The 23 June beta shows plain course progress to invited
              learners. Public credential pages return after beta.
            </p>
            <div className={styles.disabledActions}>
              <a href="/waitlist" className={styles.buttonSolid}>
                Join waitlist
              </a>
            </div>
          </article>
        </div>
      </main>
    </div>
  )
}
