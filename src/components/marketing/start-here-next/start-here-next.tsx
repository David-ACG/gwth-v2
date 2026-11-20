import type { ReactNode } from "react"
import Link from "next/link"
import { CONSENT_LINE } from "@/lib/start-here/consent-wording"
import { START_HERE_LESSON_MD } from "@/lib/start-here/content.generated"
import { StartHereGate } from "@/components/marketing/start-here/start-here-gate"
import p from "@/components/marketing/paper/paper.module.css"
import { SmallPagesPlate } from "./plate"
import { Reveal } from "./reveal"
import styles from "./start-here-next.module.css"

/**
 * The free lesson's front door: what a visitor sees at `/start-here` BEFORE
 * they give an email address (19 Nov 2026, the Fable public pages round).
 * David: "would like to update all of the other public pages" with "a lot of
 * freedom", keeping "the same kind of colors and obviously the same logo".
 * "Free lesson" is now the first item in the public menu, so this is the page
 * his friends try first.
 *
 * ## What is and is not this component's
 *
 * - It is ONLY the locked face. The open lesson (film, lesson, project) is
 *   rendered by the route file exactly as before, with `start-here/`'s styles.
 * - The email step is `StartHereGate`, imported untouched from `start-here/`:
 *   the button, the pop-up, the consent wording, the honeypot, the "check your
 *   inbox" state and the call to `/api/start-here` are all its own. David
 *   chose a pop-up (2026-10-16), so the form is not moved onto the page.
 * - The consent sentence shown beside the button is `CONSENT_LINE`, imported,
 *   so the page can never say something different from the pop-up.
 *
 * ## Where each fact comes from
 *
 * - The seven outcomes are read from the lesson itself (`outcomes()`), as on
 *   the page this replaces, so they cannot drift from the approved lesson.
 * - "20 to 25 minutes to read", "a short film", "a 25-minute project" and the
 *   three things the project sets up: the page this replaces.
 * - Who it is for: the lesson's "Who this lesson is for".
 * - What you need: the project's "What you need" list.
 * - The film's length (about two minutes): the film file runs 2 min 20 s.
 * - "About 50 minutes in all" is the sum of those three.
 * - The link opening the lesson again later: `lib/start-here/consent.ts`
 *   ("the email is the reader's way back in").
 *
 * Picture: a paper cutout in the style David picked on 13 Nov 2026. Brief and
 * prompts: GWTH-launch-plan `completion/public-pages-fable/pictures/small-pages/`.
 */

/** The lesson's own "What you will be able to do by the end" list. */
export function outcomes(): string[] {
  const section = START_HERE_LESSON_MD.split(/^## /m).find((s) =>
    s.startsWith("What you will be able to do by the end")
  )
  return [...(section ?? "").matchAll(/^- (.+)$/gm)].map((m) => (m[1] ?? "").trim())
}

type StepId = "film" | "lesson" | "project"

export const STEPS: readonly { id: StepId; title: string; time: string; body: string }[] = [
  {
    id: "film",
    title: "Watch a short film",
    time: "About 2 minutes",
    body: "The film introduces the lesson before you start reading. It plays on the page, with captions.",
  },
  {
    id: "lesson",
    title: "Read the lesson",
    time: "20 to 25 minutes",
    body: "Seven tips for using AI well from the start, ten shorter habits and the most useful advice from the first month of the course.",
  },
  {
    id: "project",
    title: "Do the project",
    time: "About 25 minutes",
    body: "Set up three things you'll use in every lesson: a keyboard shortcut that types what you say, saved instructions that tell your AI tool how you like its answers, and a notebook for the requests that work for you.",
  },
]

export const NEEDS: readonly { id: "computer" | "account" | "time"; title: string; body: string }[] = [
  {
    id: "computer",
    title: "A computer with a microphone",
    body: "The project is written for a Windows computer or a Mac. A phone or tablet works too.",
  },
  {
    id: "account",
    title: "A free account with one AI tool",
    body: "Use ChatGPT, Claude, Gemini or another AI tool. The lesson helps you decide when paying for a plan is worthwhile.",
  },
  {
    id: "time",
    title: "About 50 minutes",
    body: "You can stop and come back. Keep the email we send you, because its link opens the lesson again.",
  },
]

const EMAIL_STEPS = [
  "Enter your email address.",
  "Open the link we email you. This confirms your address.",
  "The lesson and its film open on this site.",
] as const

function StepIcon({ id }: { id: StepId | "computer" | "account" | "time" }) {
  const common = {
    width: 26,
    height: 26,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: "false" as const,
    className: styles.icon,
  }
  const paths: Record<typeof id, ReactNode> = {
    film: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M10.5 9.5v5l4-2.5-4-2.5z" />
      </>
    ),
    lesson: (
      <>
        <path d="M6 3.5h8l4 4V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20V3.5z" />
        <path d="M9 11h6M9 14.5h6M9 18h3.5" />
      </>
    ),
    project: (
      <>
        <path d="M4 20l1-4L16.5 4.5a1.8 1.8 0 0 1 2.6 0l.4.4a1.8 1.8 0 0 1 0 2.6L8 19l-4 1z" />
        <path d="M14.5 6.5l3 3" />
      </>
    ),
    computer: (
      <>
        <rect x="4.5" y="5" width="15" height="10.5" rx="1.5" />
        <path d="M2.5 19h19" />
      </>
    ),
    account: (
      <>
        <path d="M4 5.5h16v10.5H10l-4 3.5V16H4V5.5z" />
        <path d="M8 9.5h8M8 12.5h5" />
      </>
    ),
    time: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 2" />
      </>
    ),
  }
  return <svg {...common}>{paths[id]}</svg>
}

export type StartHereNextProps = {
  /** A message about the link the reader followed (expired, or it failed). */
  notice?: string | null
}

export function StartHereNext({ notice = null }: StartHereNextProps = {}) {
  const done = outcomes()

  return (
    <div className={p.shell} data-testid="start-here" data-state="locked">
      {/* 1. The invitation: what it is, what it costs, how long, the button. */}
      <section className={styles.hero} data-section="masthead">
        <div className={p.page}>
          <div className={styles.heroGrid}>
            <div>
              <h1 className={styles.heroTitle}>
                Start Here <em>The tips we wish we&apos;d had when we started</em>
              </h1>
              <p className={styles.heroLead}>
                This is the free first lesson of the GWTH course. It&apos;s for
                you if you&apos;re new to AI, or have tried it a few times and
                wondered how to get more from it.
              </p>
              <dl className={styles.figures}>
                <div className={styles.figure}>
                  <dt>Free</dt>
                  <dd>
                    Enter your email address and we&apos;ll send you a link
                    that opens the lesson.
                  </dd>
                </div>
                <div className={styles.figure}>
                  <dt>Under an hour</dt>
                  <dd>
                    A short film, a lesson to read and a project to do: about
                    50 minutes in all.
                  </dd>
                </div>
              </dl>
              {notice && (
                <p className={styles.notice} role="status">
                  {notice}
                </p>
              )}
              <div className={p.actions}>
                <StartHereGate />
                <a href="#inside" className={p.buttonOutline}>
                  See what&apos;s in the lesson
                </a>
              </div>
              <p className={styles.heroSmall}>
                We&apos;ll also send you news about the GWTH course. You can
                opt out in any email.
              </p>
            </div>
            <figure className={`${p.plate} ${styles.heroPicture}`}>
              <SmallPagesPlate
                name="free-lesson"
                alt="A paper cutout picture in three panels showing one person at a kitchen table: she watches a short film on a laptop, reads the lesson with a notebook beside her, then speaks to the laptop as she does the project. The labels read Watch the film, Read the lesson, Do the project."
                sizes="(max-width: 1023px) 100vw, 540px"
                priority
              />
            </figure>
          </div>
        </div>
      </section>

      {/* 2. What you'll do, in the order you'll do it. */}
      <section className={`${p.section} ${styles.anchor}`} data-section="steps" id="inside">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>
              What you&apos;ll do, <em>step by step</em>
            </h2>
          </div>
          <ol className={styles.steps}>
            {STEPS.map((step, index) => (
              <Reveal as="li" className={styles.step} key={step.id} delay={index * 110} data-testid="start-here-step">
                <div className={styles.stepTop}>
                  <span className={styles.stepNumber} aria-hidden="true">
                    {index + 1}
                  </span>
                  <StepIcon id={step.id} />
                  <span className={styles.time}>{step.time}</span>
                </div>
                <h3 className={p.cardTitle}>{step.title}</h3>
                <p className={p.cardBody}>{step.body}</p>
              </Reveal>
            ))}
          </ol>
          <p className={styles.note}>
            In the course, you watch a short film, read the lesson, answer
            questions on the lesson, then do the project.
          </p>
        </div>
      </section>

      {/* 3. What you'll be able to do by the end: the lesson's own list. */}
      <section className={p.section} data-section="outcomes">
        <div className={p.page}>
          <div className={styles.outcomesGrid}>
            <Reveal className={styles.outcomesHead}>
              <h2 className={p.sectionTitle}>
                What you will be able to do <em>by the end</em>
              </h2>
              <p className={styles.lead}>
                The lesson has seven main tips, and each one teaches you to do
                one of these. Several take only a few minutes to set up.
              </p>
            </Reveal>
            <ol className={styles.outcomes} data-testid="start-here-outcomes">
              {done.map((line, index) => (
                <Reveal as="li" key={line} delay={Math.min(index, 4) * 60}>
                  <span className={styles.outcomeNumber} aria-hidden="true">
                    {index + 1}
                  </span>
                  <span>{line}</span>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 4. What you need. */}
      <section className={p.section} data-section="needs">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>What you need</h2>
          </div>
          <p className={styles.lead}>
            You don&apos;t need coding experience, and you don&apos;t need to
            have used AI before.
          </p>
          <ul className={styles.needs}>
            {NEEDS.map((need, index) => (
              <Reveal as="li" key={need.id} delay={index * 90}>
                <StepIcon id={need.id} />
                <h3>{need.title}</h3>
                <p>{need.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* 5. The email step, explained before the button is pressed. */}
      <section className={p.closing} data-section="get-it" id="get-it">
        <div className={p.page}>
          <Reveal className={styles.getBox}>
            <div className={styles.getGrid}>
              <div>
                <h2 className={p.sectionTitle}>
                  Get the lesson link <em>by email</em>
                </h2>
                <ol className={styles.emailSteps}>
                  {EMAIL_STEPS.map((line, index) => (
                    <li key={line}>
                      <span className={styles.emailNumber} aria-hidden="true">
                        {index + 1}
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className={styles.getAside}>
                <ul className={styles.promises}>
                  <li>The lesson is free, and we don&apos;t ask for card details.</li>
                  <li>
                    The email can take a few minutes to arrive, so check your
                    junk folder too.
                  </li>
                </ul>
                <div className={styles.getActions}>
                  <StartHereGate />
                </div>
                <p className={styles.consent} data-testid="start-here-consent-summary">
                  {CONSENT_LINE}{" "}
                  <Link href="/privacy">Privacy notice</Link>
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
