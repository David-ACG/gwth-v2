"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ScoreBadge, type ProjectGrade } from "./score-badge"
import styles from "./score-story.module.css"

/**
 * The home page score story: three steps, one badge (David, 21 Nov 2026, bead
 * gwth-launch-phjb). He asked for an animation, not a video, to show "how you
 * place it into LinkedIn and how your score changes", built for trust: *"why
 * would I do it? And how do I know the score is genuine?"*
 *
 * 1. You earn it: the badge's ring fills as lessons are passed and the three
 *    projects are marked, falls a little after a long break, and comes back.
 * 2. You add it to LinkedIn: the same badge in a plain profile frame. The
 *    frame borrows nothing from LinkedIn's own look; it is named in words.
 * 3. Anyone can check it: Show credential opens the score page on gwth.ai.
 *
 * It plays once when it scrolls into view (about eight seconds) and rests on
 * the last frame. Without JavaScript, or with reduced motion, every step shows
 * its last frame. Before its turn a step is dimmed, never empty, so a phone
 * reader scrolling past never sees a blank box.
 *
 * Wording: the latest Astra wrote the captions and the latest Sol checked and
 * fixed them (21 Nov 2026), as the public writing rule requires.
 *
 * The numbers follow the real rules in `lib/progress/gwth-score.ts`: lessons
 * and quizzes give up to 50, each project about 16.7 (Good 65, Excellent 85,
 * Pass 48 of 100), and the fall takes 5% of earned points per full week. The
 * learner is an example and the note under the story says so.
 */

const EXAMPLE = {
  name: "Maya Patel",
  date: "9 March 2027",
  issued: "March 2027",
  link: "gwth.ai/verify/MP7K2Q",
  grades: ["Good", "Excellent", "Pass"] as const satisfies readonly ProjectGrade[],
  score: 72,
  fallen: 67,
  fallDate: "8 March 2027",
}

type Status = "date" | "up" | "fall" | "ok"

const ease = (k: number) => 1 - Math.pow(1 - k, 3)

export function ScoreStory() {
  const stage = useRef<HTMLOListElement>(null)
  const live = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<Status>("date")
  const [busy, setBusy] = useState(false)
  const [animated, setAnimated] = useState(false)
  const [lit, setLit] = useState<ReadonlySet<string>>(new Set())
  const [hit, setHit] = useState(false)
  const run = useRef(0)
  const fast = useRef(false)
  const pending = useRef<Array<() => void>>([])

  const setRing = useCallback((shown: number, earned: number) => {
    const el = live.current?.querySelector<HTMLElement>("[data-testid=score-badge]")
    if (!el) return
    el.style.setProperty("--shown", String(shown))
    el.style.setProperty("--earned", String(earned))
    const num = el.querySelector("[data-score-num]")
    if (num) num.textContent = String(Math.round(shown))
  }, [])

  const play = useCallback(async () => {
    const me = ++run.current
    const alive = () => run.current === me
    fast.current = false
    pending.current = []
    const steps = stage.current?.querySelectorAll<HTMLElement>("[data-step]")
    if (!steps || steps.length < 3) return

    const wait = (ms: number) =>
      new Promise<void>((done) => {
        if (fast.current) return done()
        pending.current.push(done)
        setTimeout(done, ms)
      })
    const seen = (el: HTMLElement) =>
      new Promise<void>((done) => {
        if (fast.current || !("IntersectionObserver" in window)) return done()
        pending.current.push(done)
        const o = new IntersectionObserver(
          (entries) => {
            if (entries[0]?.isIntersecting) {
              o.disconnect()
              done()
            }
          },
          { threshold: 0.3 },
        )
        o.observe(el)
      })
    const tween = (s0: number, s1: number, e0: number, e1: number, ms: number) =>
      new Promise<void>((done) => {
        const t0 = performance.now()
        const frame = (now: number) => {
          if (!alive()) return done()
          const k = fast.current ? 1 : Math.min(1, (now - t0) / ms)
          const q = ease(k)
          setRing(s0 + (s1 - s0) * q, e0 + (e1 - e0) * q)
          if (k < 1) requestAnimationFrame(frame)
          else done()
        }
        requestAnimationFrame(frame)
      })
    const on = (...keys: string[]) => setLit((prev) => new Set([...prev, ...keys]))

    setBusy(true)
    setAnimated(true)
    setLit(new Set())
    setHit(false)
    setStatus("up")
    setRing(0, 0)

    await seen(steps[0]!)
    await wait(200)
    await tween(0, 37.5, 0, 37.5, 850)
    on("p1")
    await tween(37.5, 48.8, 37.5, 48.8, 340)
    on("p2")
    await tween(48.8, 63, 48.8, 63, 340)
    on("p3")
    await tween(63, 71, 63, 71, 340)
    await wait(550)
    if (!alive()) return
    setStatus("fall")
    await tween(71, EXAMPLE.fallen, 71, 71, 800)
    await wait(750)
    if (!alive()) return
    setStatus("up")
    await tween(EXAMPLE.fallen, EXAMPLE.score, 71, EXAMPLE.score, 550)
    await wait(500)
    if (!alive()) return
    setStatus("date")
    await wait(250)
    await seen(steps[1]!)
    on("b1")
    await wait(350)
    on("b2")
    await wait(550)
    on("b3")
    await wait(600)
    setHit(true)
    await wait(320)
    await seen(steps[2]!)
    on("c1")
    await wait(450)
    if (!alive()) return
    setHit(false)
    setBusy(false)
  }, [setRing])

  useEffect(() => {
    // Old browsers (and the test runner) have no IntersectionObserver: they
    // keep the last frame rather than play the story where nobody sees it.
    const still =
      typeof window.matchMedia !== "function" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    // Started from a timer, not the effect body, so the first paint is the
    // badge at rest and the story then takes it from zero.
    const timer = still ? undefined : window.setTimeout(() => void play(), 0)
    return () => {
      window.clearTimeout(timer)
      run.current += 1
      pending.current.splice(0).forEach((d) => d())
    }
  }, [play])

  const onButton = () => {
    if (busy) {
      fast.current = true
      pending.current.splice(0).forEach((d) => d())
    } else {
      void play()
    }
  }

  const at = (key: string) => ({ "data-at": key, "data-on": lit.has(key) ? "" : undefined })

  return (
    <div className={styles.story}>
      <ol
        ref={stage}
        className={styles.steps}
        data-animated={animated ? "" : undefined}
        data-testid="score-story"
        aria-label="How a score is earned, added to LinkedIn and checked"
      >
        <li className={styles.step} data-step="1">
          <h4 className={styles.stepTitle}>
            <span className={styles.n} aria-hidden="true">
              1
            </span>
            You earn it
          </h4>
          <p className={styles.cap}>
            Your score rises as you pass core lessons and projects are marked.
            It can fall after 28 days without passing a core lesson. Passing a
            core lesson restores it.
          </p>
          <div className={styles.vis} ref={live}>
            <ScoreBadge
              id="story-live"
              name={EXAMPLE.name}
              shown={EXAMPLE.score}
              status={status}
              dateLabel={EXAMPLE.date}
              grades={EXAMPLE.grades}
              foot={{ kind: "link", label: EXAMPLE.link }}
              stepMarks
            />
          </div>
        </li>

        <li className={styles.step} data-step="2">
          <h4 className={styles.stepTitle}>
            <span className={styles.n} aria-hidden="true">
              2
            </span>
            You add it to LinkedIn
          </h4>
          <p className={styles.cap}>
            Add your GWTH.ai score under Licences and certifications on your
            LinkedIn profile. Include your score page link so people can open
            it with Show credential.
          </p>
          <div className={`${styles.vis} ${styles.frame}`}>
            <div className={styles.bar}>
              <span>LinkedIn profile</span>
              <b>{EXAMPLE.name}</b>
            </div>
            <p className={styles.section}>Licences and certifications</p>
            <div className={styles.entry} {...at("b1")}>
              <span className={styles.tile}>
                <svg className={styles.tileLogo} viewBox="0 0 125 102" aria-hidden="true">
                  <path
                    fill="var(--logo-wordmark)"
                    d="M60.79,1.33C28,.82,2.16,27.79,8.49,60.16s35.41,42.4,50.8,23.12c0,0-23.24.29-31.87-21.74S34.78,23.1,52.77,18.71s33.4,7,40.38,14.56l13.08-12.11S93.61,1.84,60.79,1.33Z"
                  />
                  <path
                    fill="var(--logo-accent)"
                    d="M86.13,64.61h0S62.07,93.38,47.73,98.16c0,0,14.34,4.86,28.54,0,9.71-3.32,19.59-13,24.86-18.74L119,97.06V46.89H68.17Z"
                  />
                </svg>
              </span>
              <div>
                <b>GWTH.ai score</b>
                <small>GWTH.ai</small>
                <small>Issued {EXAMPLE.issued}</small>
                <span className={styles.credential} data-hit={hit ? "" : undefined}>
                  Show credential
                  <svg className={styles.glyph} viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M7 3H3v10h10V9M9.5 2.5h4v4M13.5 2.5L7.5 8.5" />
                  </svg>
                  <svg className={styles.cursor} {...at("b3")} viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M4 2l11.5 9.2-5.2.6 3 5.6-2.3 1.2-3-5.7L4 16.6z" />
                  </svg>
                </span>
              </div>
            </div>
            <div className={styles.media} {...at("b2")}>
              <ScoreBadge
                id="story-profile"
                name={EXAMPLE.name}
                shown={EXAMPLE.score}
                status="date"
                dateLabel={EXAMPLE.date}
                grades={EXAMPLE.grades}
                foot={{ kind: "link", label: EXAMPLE.link }}
              />
            </div>
          </div>
        </li>

        <li className={styles.step} data-step="3">
          <h4 className={styles.stepTitle}>
            <span className={styles.n} aria-hidden="true">
              3
            </span>
            Anyone can check it
          </h4>
          <p className={styles.cap}>
            Show credential opens your score page on gwth.ai. The same card
            shows your score today, whether it&apos;s up to date or falling, and
            the date it last changed.
          </p>
          <div className={`${styles.vis} ${styles.frame}`}>
            <div className={styles.bar}>
              <span className={styles.address}>
                <svg className={styles.glyph} viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M4 7.5h8v6H4zM5.8 7.5V5.2a2.2 2.2 0 014.4 0v2.3" />
                </svg>
                <span>{EXAMPLE.link}</span>
              </span>
            </div>
            <div className={styles.page} {...at("c1")}>
              <ScoreBadge
                id="story-page"
                name={EXAMPLE.name}
                shown={EXAMPLE.score}
                status="ok"
                dateLabel={EXAMPLE.date}
                grades={EXAMPLE.grades}
                foot={{ kind: "changed", date: EXAMPLE.date }}
              />
            </div>
          </div>
        </li>
      </ol>
      <div className={styles.controls}>
        <button type="button" className={styles.replay} onClick={onButton} data-testid="score-story-replay">
          {busy ? "Skip to the end" : animated ? "Play again" : "Play the animation"}
        </button>
      </div>
    </div>
  )
}
