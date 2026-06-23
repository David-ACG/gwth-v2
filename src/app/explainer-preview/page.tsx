import type { Metadata } from "next"
import { ExplainerVideo } from "@/components/marketing/home-fde/explainer-video"
import styles from "./preview.module.css"

export const metadata: Metadata = {
  title: "Explainer preview (W12) | GWTH.ai",
  description: "Review route for the homepage explainer video embed. Not linked in navigation.",
  robots: { index: false, follow: false },
}

const ASSETS = {
  src: "/explainer/explainer.mp4",
  poster: "/explainer/poster.png",
  captionsSrc: "/explainer/explainer.vtt",
}

/**
 * NON-PRODUCTION review route for W12. Shows the FDE explainer embed in both
 * chrome options on the live FDE ground so David can pick the chrome and
 * placement (step 2b) before it is wired into the live homepage. This route does
 * NOT modify `home-fde.tsx`; the live homepage is unchanged. Delete this route
 * once the chosen embed is wired in.
 */
export default function ExplainerPreviewPage() {
  return (
    <main className={styles.wrap}>
      <header className={styles.intro}>
        <p className={styles.mono}>W12 · explainer preview · not linked</p>
        <h1 className={styles.h1}>
          Homepage explainer, <em>two chrome options</em>.
        </h1>
        <p className={styles.lead}>
          The draft explainer in David&rsquo;s cloned voice, shown on the FDE
          ground. Pick a chrome below and a placement from the W12 decisions
          note. Toggle the site theme to check light and dark.
        </p>
      </header>

      <section className={styles.option}>
        <p className={styles.optionLabel}>Option A — framed (paper mat + hairline + mono caption)</p>
        <ExplainerVideo {...ASSETS} chrome="framed" kicker="The 60-second tour" heading="See it in a minute." />
      </section>

      <section className={styles.option}>
        <p className={styles.optionLabel}>Option B — bare (edge to edge, no mat)</p>
        <ExplainerVideo {...ASSETS} chrome="bare" kicker="The 60-second tour" />
      </section>
    </main>
  )
}
