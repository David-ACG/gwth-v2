import type { Metadata } from "next"
import Link from "next/link"
import {
  HomeFde,
  type ExplainerPlacement,
} from "@/components/marketing/home-fde/home-fde"
import { ExplainerVideo } from "@/components/marketing/home-fde/explainer-video"
import styles from "./embed-demo.module.css"

export const metadata: Metadata = {
  title: "W12 embed demo | GWTH.ai",
  description:
    "Review route: the explainer video placed on the live home page in each position and chrome. Not linked in navigation.",
  robots: { index: false, follow: false },
}

/** Placement options, in the order shown on the switcher. */
const PLACEMENTS: { value: ExplainerPlacement; label: string }[] = [
  { value: "after-hero", label: "After hero" },
  { value: "after-curriculum", label: "After curriculum" },
  { value: "before-pricing", label: "Before pricing" },
  { value: "replace-quote", label: "Replace pull-quote" },
]

const CHROMES = ["framed", "bare"] as const
type Chrome = (typeof CHROMES)[number]

const VALID_PLACEMENTS = new Set(PLACEMENTS.map((p) => p.value))

/**
 * NON-PRODUCTION review route for W12 gate 2b. Renders the real FDE home
 * (`HomeFde`) with the explainer injected at the placement + chrome given in
 * the query string, so David sees each option in true context (nav, footer,
 * every section) and switches between them from the fixed bar. The video is the
 * silent draft cut; the final VV7B voice is added after the script is approved.
 * Deleted, along with the injection slot's demo use, once the pick is wired in.
 */
export default async function W12EmbedDemoPage({
  searchParams,
}: {
  searchParams: Promise<{ at?: string; chrome?: string }>
}) {
  const sp = await searchParams
  const at: ExplainerPlacement = VALID_PLACEMENTS.has(
    sp.at as ExplainerPlacement,
  )
    ? (sp.at as ExplainerPlacement)
    : "after-hero"
  const chrome: Chrome = sp.chrome === "bare" ? "bare" : "framed"

  const explainer = (
    <div id="w12-explainer">
      <ExplainerVideo
        src="/explainer/explainer-silent.mp4"
        poster="/explainer/poster.png"
        captionsSrc="/explainer/explainer.vtt"
        chrome={chrome}
        heading="See it in a minute."
        kicker="The 60-second tour"
      />
    </div>
  )

  return (
    <>
      <HomeFde explainer={explainer} explainerAt={at} />
      <div className={styles.pad} />

      <nav className={styles.bar} aria-label="Embed demo options">
        <span className={styles.group}>
          <span className={styles.groupLabel}>Placement</span>
          {PLACEMENTS.map((p) => (
            <Link
              key={p.value}
              className={styles.opt}
              data-active={p.value === at ? "true" : undefined}
              href={`/w12-embed-demo?at=${p.value}&chrome=${chrome}`}
            >
              {p.label}
            </Link>
          ))}
        </span>

        <span className={styles.group}>
          <span className={styles.groupLabel}>Chrome</span>
          {CHROMES.map((c) => (
            <Link
              key={c}
              className={styles.opt}
              data-active={c === chrome ? "true" : undefined}
              href={`/w12-embed-demo?at=${at}&chrome=${c}`}
            >
              {c}
            </Link>
          ))}
        </span>

        <span className={styles.spacer} />
        <a className={styles.jump} href="#w12-explainer">
          Jump to video ↓
        </a>
        <Link className={styles.jump} href="/w12-review">
          Back to review
        </Link>
      </nav>
    </>
  )
}
