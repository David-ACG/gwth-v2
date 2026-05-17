import styles from "./gwth-redesign.module.css"

export type GwthScoreCardProps = {
  learnerName?: string
  learnerRole?: string
  score?: number
  tier?: string
  trend?: string
  startedAt?: string
  verificationId?: string
  cohortPercentile?: string
}

export function GwthScoreCard({
  learnerName = "Alex Example",
  learnerRole = "Operations Lead · UK",
  score = 104,
  tier = "Curious",
  trend = "+49",
  startedAt = "12 Feb 2026",
  verificationId = "GWTH-2026-A4F8B1",
  cohortPercentile = "Top 8%",
}: GwthScoreCardProps) {
  return (
    <aside className={styles.scoreBadge} aria-label={`${learnerName}'s GWTH Score`}>
      <div className={styles.scoreBadgeHeader}>
        <div>
          <p className={styles.scoreName}>{learnerName}</p>
          <p className={styles.scoreRole}>{learnerRole}</p>
        </div>
        <p className={styles.monoLabel}>Example</p>
      </div>

      <div className={styles.scoreNumber}>{score}</div>
      <p className={styles.scoreTier}>{tier}</p>
      <p className={styles.scoreSmall}>
        A live score that grows through completed lessons, projects, and
        refreshes when the curriculum changes.
      </p>

      <div className={styles.scoreMetaGrid}>
        <div className={styles.scoreMetaCell}>
          <span className={styles.monoLabel}>Trend</span>
          <strong>{trend}</strong>
        </div>
        <div className={styles.scoreMetaCell}>
          <span className={styles.monoLabel}>Started</span>
          <strong>{startedAt}</strong>
        </div>
        <div className={styles.scoreMetaCell}>
          <span className={styles.monoLabel}>Cohort</span>
          <strong>{cohortPercentile}</strong>
        </div>
      </div>

      <svg
        className={styles.sparkline}
        viewBox="0 0 360 86"
        role="img"
        aria-label="GWTH Score trend rising over three months"
      >
        <g stroke="#D4CCBA" strokeWidth="1">
          <line x1="0" y1="18" x2="360" y2="18" />
          <line x1="0" y1="43" x2="360" y2="43" />
          <line x1="0" y1="68" x2="360" y2="68" />
        </g>
        <path
          d="M10 66 C 48 62, 58 54, 84 52 S 138 43, 166 39 S 218 28, 244 27 S 302 21, 350 14"
          fill="none"
          stroke="#2A5D69"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.6"
        />
        <circle cx="10" cy="66" r="3.5" fill="#B8893F" />
        <circle cx="350" cy="14" r="3.5" fill="#5C7F4A" />
        <g
          fill="#6F7569"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="9"
          letterSpacing="0.06em"
        >
          <text x="0" y="84">
            FEB
          </text>
          <text x="174" y="84" textAnchor="middle">
            APR
          </text>
          <text x="360" y="84" textAnchor="end">
            MAY
          </text>
        </g>
      </svg>

      <p className={styles.scoreSmall}>{verificationId}</p>
    </aside>
  )
}
