import styles from "./verify-fde.module.css"

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
