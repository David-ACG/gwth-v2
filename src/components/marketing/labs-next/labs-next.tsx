import type { ReactNode } from "react"
import Link from "next/link"
import type { ModelLabIndex, ModelLabPick, ModelLabSlug } from "@/lib/types"
import { aboutCost, countWord, levelLabel } from "@/lib/model-lab-format"
import p from "@/components/marketing/paper/paper.module.css"
import { CostMap } from "./cost-map"
import { InView } from "./in-view"
import { LabsPlate } from "./labs-plate"
import styles from "./labs-next.module.css"

/**
 * The Labs page at `/labs`, rebuilt in the family of the new home page
 * (19 Nov 2026). David on the page it replaces: *"Labs, we've worked on this
 * recently, so we can keep most of this as it is, but it doesn't look
 * particularly inviting at the moment. So please change the layout and any
 * wording so that it is easier to read and more inviting."*
 *
 * `labs-fde/` is untouched and is the backup. The six lab pages under
 * `/labs/[slug]` are untouched too: this page only invites people into them.
 *
 * ## What changed, and why
 *
 * 1. **masthead**: says in two sentences what a lab is (one real task, given
 *    to different AI models, and you compare the answers), beside the paper
 *    cutout picture that draws the same three steps. The counts are a row of
 *    figures instead of a line of small print.
 * 2. **labs**: the six labs come straight after, as six invitations. Each
 *    card now tells the story of its main task in plain English (the lab's
 *    own `sig_plain`) and asks the question you answer inside it (`ask`),
 *    which the old cards never showed. Best and best value stay, exactly as
 *    the data gives them. The whole card opens the lab (David, 12 Nov: "It is
 *    not obvious that these boxes can be clicked"), with a worded link and no
 *    arrow icon.
 * 3. **tour**: what you do inside a lab, in three steps, beside the narrated
 *    tour film David asked for on 12 Nov and approved on 15 Nov.
 * 4. **how-we-test**: the same three points, beside a picture.
 * 5. **cost-chart**: every set-up as a dot (cost against score) with three
 *    set-ups pointed out, then the full list. See `cost-map.tsx`.
 * 6. **closing**: labs show you which AI, the course shows you how.
 *
 * ## Where the facts come from
 *
 * Every model name, score, cost, count and date is read from `index` (the
 * export written by model-bakeoff's `lab/site/export_gwth.py`). Nothing on
 * this page types a model name. The sentences about how we test, what the
 * costs are, and what the course teaches are carried from `labs-fde.tsx`,
 * where the comments say which of David's notes shaped each one.
 *
 * The page is the same whether or not the course is on sale: it has no price
 * and no buy button. The labs gate (`PRIVATE_CONTENT_MODE`) is in the route
 * file and the proxy, not here.
 */

/**
 * The narrated tour of the labs (David, 15 Nov 2026: "The video is great.
 * please add it to the labs page"). The same film, poster and captions as
 * `labs-fde.tsx`: film and poster on the media CDN under a dated key, captions
 * from this site because media.gwth.ai sends no CORS header and a `<track>`
 * from another origin without one never loads. The captions sit under
 * `/labs-film/`, not `/labs/`, because the proxy answers unknown `/labs/...`
 * paths with the 404 page.
 */
export const LABS_FILM = {
  src: "https://media.gwth.ai/site/labs-tour/2026-11-15/labs-tour.mp4",
  poster: "https://media.gwth.ai/site/labs-tour/2026-11-15/labs-tour-poster.jpg",
  captions: "/labs-film/labs-tour.vtt",
} as const

/** Line icons for the six labs, the same six drawn on the home page's superpowers. */
function LabIcon({ id }: { id: ModelLabSlug }) {
  const paths: Record<ModelLabSlug, ReactNode> = {
    research: (
      <>
        <circle cx="10.5" cy="10.5" r="6" />
        <path d="M15 15l5.5 5.5" />
      </>
    ),
    content: (
      <>
        <path d="M6 3.5h8l4 4V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20V3.5z" />
        <path d="M9 11h6M9 14.5h6M9 18h3.5" />
      </>
    ),
    thinking: (
      <>
        <circle cx="5" cy="12" r="1.8" />
        <path d="M6.8 12H11m0 0l5-6h3m-8 6h8m-8 0l5 6h3" />
      </>
    ),
    building: (
      <>
        <rect x="3.5" y="12.5" width="8" height="8" rx="1" />
        <rect x="12.5" y="12.5" width="8" height="8" rx="1" />
        <rect x="8" y="3.5" width="8" height="8" rx="1" />
      </>
    ),
    data: (
      <>
        <path d="M3.5 20.5h17" />
        <path d="M6.5 20.5v-6M12 20.5v-11M17.5 20.5v-15" />
      </>
    ),
    automation: (
      <>
        <path d="M19.5 12a7.5 7.5 0 0 1-13 5.1M4.5 12a7.5 7.5 0 0 1 13-5.1" />
        <path d="M17.5 3.5v3.6h-3.6M6.5 20.5v-3.6h3.6" />
      </>
    ),
  }
  return (
    <svg
      width={28}
      height={28}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={styles.cardIcon}
    >
      {paths[id]}
    </svg>
  )
}

/** "Claude Opus 5.5, medium thinking. 94 out of 100, about 38p a task." */
function PickRow({ label, pick }: { label: string; pick: ModelLabPick }) {
  return (
    <div className={styles.pick}>
      <dt>{label}</dt>
      <dd>
        <strong>{pick.name}</strong>, {levelLabel(pick.level)}. {pick.score} out of 100,{" "}
        {aboutCost(pick.cost)} a task.
      </dd>
    </div>
  )
}

/** "four", "four or five", or "four to six": how many tasks a lab has, from the data. */
export function tasksPerLab(counts: readonly number[]): string {
  if (!counts.length) return "several"
  const low = Math.min(...counts)
  const high = Math.max(...counts)
  if (low === high) return countWord(low)
  return high - low === 1
    ? `${countWord(low)} or ${countWord(high)}`
    : `${countWord(low)} to ${countWord(high)}`
}

/** What you do inside a lab. Carried from the lab page's own words (`lab-page.tsx`). */
const INSIDE_STEPS = [
  {
    title: "Read the task",
    body: "Read the lab's main task in plain English. You can also read the brief exactly as every AI model was given it.",
  },
  {
    title: "Read four answers, with the names hidden",
    body: "The answers are labelled A to D. You don't know which AI wrote which, so you judge the work and not the name.",
  },
  {
    title: "Choose the one you would use",
    body: "Then we show you which AI wrote each answer, the mark we gave it, what it cost and whether it caught the problem hidden in the task.",
  },
] as const

export type LabsNextProps = {
  /** The six labs with their test dates, counts and the cost chart. */
  index: ModelLabIndex
  /**
   * Each lab's main task in plain English (`sig_plain` from the lab's own
   * export), by slug. The route passes it; a lab without one shows only the
   * task's title.
   */
  plain?: Partial<Record<ModelLabSlug, string>>
}

export function LabsNext({ index, plain = {} }: LabsNextProps) {
  const labCount = index.labs.length
  const tasks = index.cost_chart.tasks

  /** The three points of "How we test", with the counts read from the data. */
  const howWeTest = [
    {
      title: "Real tasks, each with a trap",
      body: `We used ${tasks} tasks across ${countWord(labCount)} labs, based on real UK work. Each hides a trap a careful person would catch, such as an out-of-date figure or a false legal claim.`,
    },
    {
      title: "Marked two ways",
      body: "Computer checks mark what can be checked exactly, such as figures and dates. AI judges mark the rest against a written guide, and no judge marks its own company's work.",
    },
    {
      title: "Checked by a person",
      body: "A person at GWTH checked a sample of the marks by reading the answers side by side. Each set-up did each task once.",
    },
  ]

  return (
    <div className={`${p.shell} ${styles.root}`}>
      {/* 1. What a lab is, and the picture that draws it. */}
      <section className={styles.hero} data-section="masthead">
        <div className={p.page}>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <h1 className={styles.heroTitle}>
                <span>Which AI should </span>
                <span>you use? </span>
                <span>
                  <em>See for yourself.</em>
                </span>
              </h1>
              <p className={p.standfirst} data-testid="labs-what">
                Read four answers side by side with the AI names hidden. Choose the one you
                would use, then reveal the names, marks and costs.
              </p>
              <p className={`${p.standfirst} ${styles.heroSecond}`} data-testid="labs-uk-note">
                We give new AI models the same real UK work tasks in six labs, one for each AI
                superpower: Research, Content, Thinking, Building, Data, and Automation and
                agents. Computer checks and AI judges mark every answer. No AI company pays us.
              </p>
              <div className={p.actions}>
                <a href="#labs" className={`${p.buttonSolid} ${styles.press}`}>
                  Choose a lab
                </a>
                <a href="#tour" className={`${p.buttonOutline} ${styles.press}`}>
                  Watch the short tour
                </a>
              </div>
            </div>
            <figure className={`${p.plate} ${styles.heroPicture}`}>
              <LabsPlate
                name="compare"
                priority
                alt="A paper cutout scene: one task sheet at the top is sent to three screens, and two people at a table compare the three answers that come back. The labels read Same task, Different AI models, Compare the answers."
                sizes="(max-width: 1023px) 100vw, 560px"
              />
            </figure>
          </div>

          <dl className={styles.facts} data-testid="labs-facts">
            <div>
              <dt>{labCount}</dt>
              <dd>labs, one for each AI superpower</dd>
            </div>
            <div>
              <dt>{tasks}</dt>
              <dd>tasks based on real UK work</dd>
            </div>
            <div>
              <dt>{index.model_count}</dt>
              <dd>
                {" "}
                models tested in {index.setup_count} combinations of model and settings
              </dd>
            </div>
            <div>
              <dt>£0</dt>
              <dd>Free, no card required</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* 2. The six labs, as six things to try. */}
      <section className={p.section} data-section="labs" id="labs">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>
              Six labs to <em>try</em>
            </h2>
          </div>
          <p className={styles.lead}>
            Start with the kind of work that is closest to your own. Each lab has{" "}
            {tasksPerLab(index.labs.map((lab) => lab.tasks))} tasks. A set-up is one AI model
            with a setting for how long it can think before answering.
          </p>
          {index.labs.length === 0 ? (
            <div className={styles.empty}>
              <h3>No labs right now.</h3>
              <p>The next round of tests is running. The labs will appear here when it is done.</p>
            </div>
          ) : (
            <InView className={styles.cards}>
              {index.labs.map((lab) => (
                <article className={styles.card} data-testid="model-lab-card" key={lab.sp}>
                  <div className={styles.cardTop}>
                    <LabIcon id={lab.sp} />
                    <h3 className={styles.cardName}>{lab.sp_name}</h3>
                    <span className={styles.cardCount}>{countWord(lab.tasks)} tasks</span>
                  </div>
                  <p className={styles.cardQuestion}>{lab.headline}</p>
                  <div className={styles.cardTask}>
                    <p className={styles.cardTaskTitle}>The main task: {lab.sig_title}</p>
                    {plain[lab.sp] ? <p>{plain[lab.sp]}</p> : null}
                    <p className={styles.cardAsk}>
                      You decide: <em>{lab.ask}</em>
                    </p>
                  </div>
                  <dl className={styles.picks} aria-label={`Our picks in the ${lab.sp_name} lab`}>
                    <PickRow label="Best" pick={lab.best} />
                    <PickRow label="Best value" pick={lab.value} />
                  </dl>
                  <p className={styles.cardFoot}>
                    <Link href={`/labs/${lab.sp}`} className={styles.cardAction}>
                      Open the {lab.sp_name} lab
                      <span className={styles.srOnly}>: {lab.headline}</span>
                    </Link>
                    <span className={styles.cardMeta}>{lab.count} set-ups compared</span>
                  </p>
                </article>
              ))}
            </InView>
          )}
          <p className={styles.note}>
            Each lab explains how we chose its picks. The costs are what the tests cost through
            developer access (the API), not the price of an app subscription.
          </p>
        </div>
      </section>

      {/* 3. Inside a lab: three steps, and the narrated tour. */}
      <section className={p.section} data-section="tour" id="tour">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>What you do in a lab</h2>
          </div>
          <div className={styles.tourGrid}>
            <figure className={styles.film} data-testid="labs-film">
              <video
                controls
                playsInline
                preload="none"
                poster={LABS_FILM.poster}
                className={styles.filmVideo}
                aria-label="How to use the GWTH labs: a short narrated tour"
              >
                <source src={LABS_FILM.src} type="video/mp4" />
                <track kind="captions" src={LABS_FILM.captions} srcLang="en" label="English" />
              </video>
              <figcaption>How to use the labs, in just over a minute.</figcaption>
            </figure>
            <InView className={styles.stepsWrap}>
              <ol className={styles.steps} aria-label="What you do in a lab">
                {INSIDE_STEPS.map((step, i) => (
                  <li key={step.title}>
                    <span className={styles.stepNumber} aria-hidden="true">
                      {i + 1}
                    </span>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </li>
                ))}
              </ol>
            </InView>
          </div>
        </div>
      </section>

      {/* 4. How we test. */}
      <section className={p.section} data-section="how-we-test" aria-labelledby="h-how">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle} id="h-how">
              How we test
            </h2>
          </div>
          <div className={styles.howGrid}>
            <ul className={styles.howList}>
              {howWeTest.map((item) => (
                <li key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </li>
              ))}
            </ul>
            <figure className={`${p.plate} ${styles.howPicture}`}>
              <LabsPlate
                name="check"
                alt="A paper cutout scene: a person at a desk compares two printed answers side by side with a magnifying glass. One line on the left page is marked with a small paper flag. The labels read Every task hides a trap and Checked by a person."
                sizes="(max-width: 1023px) 100vw, 520px"
              />
            </figure>
          </div>
        </div>
      </section>

      {/* 5. What every set-up cost, and how it scored. */}
      {index.cost_chart.rows.length ? (
        <section className={p.section} data-section="cost-chart" aria-labelledby="h-cost">
          <div className={p.page}>
            <div className={p.sectionHead}>
              <h2 className={p.sectionTitle} id="h-cost">
                What each AI cost, and <em>how it scored</em>
              </h2>
            </div>
            <p className={styles.lead} data-testid="cost-lead">
              Each dot is one set-up. The higher the dot, the better its average score across
              the {countWord(labCount)} labs. The further right it sits, the more it cost to run
              its tasks. Each cost mark is ten times the previous one.
            </p>
            <CostMap
              chart={index.cost_chart}
              labCount={labCount}
              pencePerDollar={index.p_per_usd}
            />
          </div>
        </section>
      ) : null}

      {/* 6. Labs show you which AI. The course shows you how. */}
      <section className={p.closing} data-section="closing">
        <div className={p.page}>
          <div className={styles.closingBox}>
            <div className={styles.closingCopy}>
              <h2 className={p.sectionTitle}>
                Labs show you which AI. <em>The course shows you how.</em>
              </h2>
              <p>
                Each lab shows which AI did best on real work tasks, what it cost and when we
                tested it. In Month 1 of the course you build FamilyBot, an assistant that turns a
                family meeting recording into a list of jobs, a meal plan and a shopping list. In Month 2 you build a customer support chatbot. In Month 3 you
                build an AI consultant that interviews people and writes a plan for an
                organisation.
              </p>
              <p data-testid="closing-compare">
                The course also teaches you to run your own comparison. In Month 1 you give two
                AI tools the same task in exactly the same words. You compare their answers using
                four questions, then set up a monthly check to keep your choice up to date as
                models change. Later lessons show when a cheaper AI model or an open model you
                can download and run yourself is good enough, and when a premium plan is worth
                paying for.
              </p>
              <div className={p.actions}>
                <Link href="/lessons" className={`${p.buttonSolid} ${styles.press}`}>
                  See the course
                </Link>
                {/* The free lesson is the one lesson a visitor may open, as on
                    the home page; the words check may not remove it. */}
                <Link href="/start-here" className={`${p.buttonOutline} ${styles.press}`}>
                  Try the free lesson
                </Link>
              </div>
            </div>
            <figure className={`${p.plate} ${styles.closingPicture}`}>
              <LabsPlate
                name="your-own"
                alt="A paper cutout scene: a person at a table with two laptops side by side ticks the last box on a short checklist. The labels read Same task, same words and Compare the answers yourself."
                sizes="(max-width: 1023px) 100vw, 480px"
              />
            </figure>
          </div>
        </div>
      </section>
    </div>
  )
}
