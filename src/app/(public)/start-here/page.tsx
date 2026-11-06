import type { Metadata } from "next"
import Link from "next/link"
import { cookies } from "next/headers"
import { canPromoteLabs } from "@/lib/labs-cta"
import { isSelling } from "@/lib/launch"
import { ACCESS_COOKIE, verifyToken } from "@/lib/start-here/consent"
import { START_HERE_LESSON_MD, START_HERE_PROJECT_MD } from "@/lib/start-here/content.generated"
import { START_HERE_IMAGES } from "@/lib/start-here/media"
import { renderStartHere } from "@/lib/start-here/render"
import { StartHereFilm } from "@/components/marketing/start-here/start-here-film"
import { StartHereGate } from "@/components/marketing/start-here/start-here-gate"
import p from "@/components/marketing/paper/paper.module.css"
import styles from "@/components/marketing/start-here/start-here.module.css"

export const metadata: Metadata = {
  title: "Start Here: a free GWTH lesson",
  description:
    "A free lesson from the GWTH course: seven tips for using AI well from the start, ten shorter habits and the most useful advice from the course's first month.",
}

type PageProps = { searchParams: Promise<{ link?: string; welcome?: string }> }

/**
 * The lesson's own "What you will be able to do by the end" list (approved
 * text), read from the lesson so it never drifts from it. Plain sentences
 * explain the terms the bare tip titles left to the reader (copy gate,
 * 2026-11-06).
 */
function outcomes(): string[] {
  const section = START_HERE_LESSON_MD.split(/^## /m).find((s) => s.startsWith("What you will be able to do by the end"))
  return [...(section ?? "").matchAll(/^- (.+)$/gm)].map((m) => (m[1] ?? "").trim())
}

/**
 * Start Here, lesson zero, behind the email gate (bead gwth-launch-xw6s).
 *
 * David, 2026-10-09: the public page shows the title and a short summary,
 * then asks for an email address; the confirmation email's button brings the
 * reader back and opens the lesson. 2026-10-16: the whole lesson AND its film
 * stay locked until then, and the pop-up says they must give the address
 * and agree to hear more about the course. The lesson is read on the server
 * only when the signed cookie from that email link is present, so the text
 * never reaches a browser that has not confirmed.
 */
export default async function StartHerePage({ searchParams }: PageProps) {
  const sp = await searchParams
  const jar = await cookies()
  const open = verifyToken("access", jar.get(ACCESS_COOKIE)?.value) !== null

  const masthead = (
    <h1 className={styles.title}>
      Start Here <em>The tips we wish we&apos;d had when we started</em>
    </h1>
  )

  if (!open) {
    const notice =
      sp.link === "invalid"
        ? "That link doesn't work any more. Enter your email address again and we'll send you a new one."
        : sp.link === "error"
          ? "Something went wrong when we opened the lesson. Please try the link in your email again."
          : null
    return (
      <div className={p.shell} data-testid="start-here" data-state="locked">
        <section className={styles.masthead}>
          <div className={p.page}>
            {masthead}
            <p className={styles.summary}>
              A free lesson from the GWTH course. It gives you seven tips for using AI well from the start, ten
              shorter habits worth starting now and the most useful advice from the course&apos;s first month.
            </p>
            <p className={styles.meta}>About 20 to 25 minutes to read, with a short film and a 25-minute project.</p>
            {notice && (
              <p className={styles.notice} role="status">
                {notice}
              </p>
            )}
            <div className={p.actions}>
              <StartHereGate />
            </div>
          </div>
        </section>

        <section className={styles.bottomSection}>
          <div className={p.page}>
            <div className={styles.inside}>
              <h2 className={styles.insideTitle}>What you will be able to do by the end</h2>
              <ul className={styles.outcomes}>
                {outcomes().map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <p className={styles.after}>
                The 25-minute project at the end sets up three things you'll use in every lesson: a keyboard shortcut that types what you say, saved instructions that tell your AI tool how you like its answers, and a notebook for the requests that work for you.
              </p>
              <div className={p.actions}>
                <StartHereGate />
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  const lesson = renderStartHere(START_HERE_LESSON_MD, { images: START_HERE_IMAGES })
  const project = renderStartHere(START_HERE_PROJECT_MD, { demote: 1 })
  const joinCta = isSelling()
    ? { href: "/pricing", label: "Join the course" }
    : { href: "/waitlist", label: "Join the waitlist" }

  return (
    <div className={p.shell} data-testid="start-here" data-state="open">
      <section className={styles.masthead}>
        <div className={p.page}>
          {masthead}
          {sp.welcome === "1" && (
            <p className={styles.notice} role="status">
              Thank you. Your email address is confirmed and the lesson is open.
            </p>
          )}
        </div>
      </section>

      <section className={styles.filmSection}>
        <div className={styles.reading}>
          <StartHereFilm />
        </div>
      </section>

      <div className={`${styles.reading} ${styles.pageEnd}`}>
        <details className={styles.contents}>
          <summary>In this lesson</summary>
          <ol>
            {[...lesson.headings, ...project.headings].map((h) => (
              <li key={h.id}>
                <a href={`#${h.id}`}>{h.text}</a>
              </li>
            ))}
          </ol>
        </details>

        <article className={styles.prose} data-testid="start-here-lesson" dangerouslySetInnerHTML={{ __html: lesson.html }} />
        <hr className={styles.projectDivider} />
        <article className={styles.prose} data-testid="start-here-project" dangerouslySetInnerHTML={{ __html: project.html }} />

        <section className={styles.closing}>
          <h2 className={styles.closingTitle}>Carry on with the course</h2>
          <p className={styles.closingText}>
            Start Here is the free first lesson of GWTH. In the course, every lesson has a project like this one,
            and the projects get bigger and more useful every month.
          </p>
          <div className={p.actions}>
            <Link href={joinCta.href} className={p.buttonSolid}>
              {joinCta.label}
            </Link>
            {canPromoteLabs() && (
              <Link href="/labs" className={p.buttonOutline}>
                Try the labs
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
