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
 *
 * ## 20 Nov 2026: rebuilt at the top for someone who has only used ChatGPT
 *
 * David, on the page above: *"I asked my wife to watch the video and was
 * surprised when she didn't understand what a model was. I've now read this
 * section and we don't really explain what we're testing. ... The icons next
 * to each lab are not particularly inspiring. Please can we make this more
 * attractive to new users who don't understand using different models. For
 * example, my wife has only used chat GPT in chat mode and doesn't really
 * understand how to change the model or the thinking level."*
 *
 * - **masthead** now says what an AI model is in its first sentence.
 * - **explainer** (new, straight under it): what a model is, what the
 *   thinking setting does, why the choice matters and where to look in a chat
 *   app, beside a drawing of a made-up chat app whose two menus can be tried
 *   (`PickerDrawing`). It then says what the labs test; the four figures moved
 *   here from the masthead, so "models" is explained before it is counted.
 * - **labs**: each card leads with a paper cutout picture of its main task
 *   (`public/labs/v2/`), in place of the small line icon, and a one-line
 *   description for a beginner. The best and best-value picks are still read
 *   from the data, now behind a native `<details>` on each card, so nobody
 *   meets a model name or a cost before the explainer and nobody is told the
 *   answer before they have judged for themselves.
 * - The film, "How we test", the chart, the list and the closing are as they
 *   were. The film changes next week (David's choice, 20 Nov), not today.
 *
 * The new words were written by the latest GPT Astra and checked by the latest
 * GPT Sol, as David asked; the briefs and reports are in
 * `GWTH-launch-plan/completion/public-pages-fable/labs-v2/`. They are in
 * `COPY` below. No sentence there names a model or a model version.
 */

/**
 * The narrated tour of the labs (David, 15 Nov 2026: "The video is great.
 * please add it to the labs page"). Since 20 Nov 2026 it is the tour in the new
 * soft 3D style (labs-tour-soft3d v02), in two editions: David, 20 Nov 2026:
 * "Once you finish rendering please put all the videos into the site". The
 * paper edition shows in the light theme and the night edition in the dark,
 * like the home page and Start Here films; this page is server-rendered, so
 * both players are in the page and CSS shows the one for the theme (each has
 * preload="none", so the hidden one downloads nothing). Same narration as the
 * 15 Nov film, so the captions are unchanged.
 *
 * Films and posters are on the media CDN under a new dated key
 * (site/labs-tour/2026-11-20-soft3d/); the 15 Nov film stays untouched under
 * site/labs-tour/2026-11-15/ so it can come back (`labs-fde.tsx` still names
 * it). The captions come from this site because media.gwth.ai sends no CORS
 * header and a `<track>` from another origin without one never loads. They sit
 * under `/labs-film/`, not `/labs/`, because the proxy answers unknown
 * `/labs/...` paths with the 404 page.
 */
const LABS_FILM_BASE = "https://media.gwth.ai/site/labs-tour/2026-11-20-soft3d"
export const LABS_FILM = {
  paper: { src: `${LABS_FILM_BASE}/labs-tour-soft3d-paper.mp4`, poster: `${LABS_FILM_BASE}/poster-paper.jpg` },
  night: { src: `${LABS_FILM_BASE}/labs-tour-soft3d-night.mp4`, poster: `${LABS_FILM_BASE}/poster-night.jpg` },
  captions: "/labs-film/labs-tour.vtt",
} as const

/**
 * The words for a newcomer (20 Nov 2026): drafted by the latest GPT Astra,
 * corrected by the latest GPT Sol. `{tasksPerLab}`, `{labs}` and `{labNames}` are
 * filled from the data (`fill`).
 * Nothing here may name an AI model or a model version (there is a test).
 */
export const COPY = {
  heroWhat:
    "An AI model is the part of a chat app that writes your answer. Our labs let you compare how different models handle the same real UK work task.",
  heroDo:
    "Read four answers with the AI names hidden. Choose the one you’d use, then see which AI wrote each answer. It’s free, with no card required. No AI company pays us.",
  heroNew: "Explain the choices",
  explainerTitle: "New to AI models? Start here",
  explainerIntro: "The app you type in may offer choices that affect how it answers your question.",
  questions: [
    {
      title: "What is an AI model?",
      body: "A model is the part of a chat app that writes the answers you read. Different companies make different models. One app can offer several and let you choose which one writes your answer.",
    },
    {
      title: "What does the thinking setting do?",
      body: "It controls how much work the model can do before replying. More thinking can help with difficult questions, but may take longer and cost more to run.",
    },
    {
      title: "Why does the choice matter?",
      body: "The best model for your job is not always the most famous or the dearest. In each lab, you can read the answers and decide which you would use before seeing the AI names.",
    },
  ],
  setUp:
    "A “set-up” means one model with one thinking setting. If there’s no setting to choose, we label it “standard”.",
  whereTitle: "Where to look in your chat app",
  whereBody:
    "In apps such as ChatGPT, Claude and Gemini, check the app’s help for information about choosing a model or a thinking setting. What you can change depends on the app and your access. You do not need to change anything in your app to use these labs.",
  drawing: {
    question: "What can I cook with leftover roast potatoes?",
    modelLabel: "AI model",
    modelChoices: ["Model A", "Model B", "Model C"],
    thinkingLabel: "Thinking",
    thinkingChoices: ["Less", "Medium", "More"],
    notes: [
      "Choose the model that writes your answer.",
      "Choose how much work the model can do before replying.",
    ],
    caption: "This is a drawing of a made-up chat app. Try the two menus. Real apps look different.",
  },
  testTitle: "What the labs test",
  testBody:
    "We give models the same real work task. You compare answers with names hidden, then see their marks and whether they caught the hidden problem, or “trap”. Costs are for direct access to the AI through a connection called an API, rather than app subscriptions.",
  testBody2:
    "Our {labs} labs each cover a type of work we call an AI superpower: {labNames}. Computer checks and AI judges, which are other models, mark every answer.",
  labsLead:
    "Start with the kind of work closest to your own. Each lab has {tasksPerLab} tasks, so you can compare answers to different problems.",
  picksLabel: "Show our picks",
  picksNote:
    "Our picks offer a short answer if you want one, and each lab explains how we chose them.",
} as const

/**
 * Each lab's line for a beginner and the alt text of its picture. The picture
 * shows the lab's main task (`sig_title`): `public/labs/v2/<slug>.jpg` and its
 * dusk twin `<slug>-dark.jpg`, drawn for this page on 20 Nov 2026.
 */
export const LAB_INTRO: Record<ModelLabSlug, { line: string; alt: string }> = {
  research: {
    line: "Check facts, compare sources and decide which information to use.",
    alt: "A paper cutout scene: a woman at a desk checks a printed page line by line against a box of records, with two lines marked by rust-coloured tabs.",
  },
  content: {
    line: "Write something that sounds like you and says what you mean.",
    alt: "A paper cutout scene: a bakery owner in an apron writes on a laptop at her counter, beside fresh loaves and a blank notice in the window.",
  },
  thinking: {
    line: "Weigh up a plan, check its assumptions and spot what needs more thought.",
    alt: "A paper cutout scene: a man stands at a wall planner with seven day panels, holding one loose panel.",
  },
  building: {
    line: "Turn an idea into a useful page people can try.",
    alt: "A paper cutout scene: a woman practises a phrase aloud at a laptop, with five cards coloured green, amber and red on the desk.",
  },
  data: {
    line: "Make sense of messy figures and explain what they mean.",
    alt: "A paper cutout scene: a man measures the gap between a tall stack of coins and a short one with a ruler, beside a pile of printouts.",
  },
  automation: {
    line: "Compare how AI handles routine jobs and whether it asks before doing anything risky.",
    alt: "A paper cutout scene: a man sits at a tidy desk and holds up an envelope.",
  },
}

/** The grey lines that stand for an answer: one pattern of line lengths per model choice. */
const ANSWER_LINES = [
  [92, 78, 86, 54, 70],
  [84, 96, 62, 90, 48],
  [70, 88, 94, 66, 80, 36],
] as const

/**
 * A drawing of a made-up chat app, in the page's own paper and ink: one sent
 * message, an answer drawn as plain lines, and the two menus this page is
 * about. It is not a picture of any real app and carries no brand.
 *
 * The menus are real radio buttons, so they can be tried with a mouse, a
 * finger or the keyboard, and the drawing answers in CSS alone (`:has()` in
 * the stylesheet): another model draws a different answer, and more thinking
 * fills more of the three marks above it, the work done before the reply. It
 * does not draw a longer answer: the words check (20 Nov 2026) found nothing
 * to support "more thinking, longer answer". No script; without `:has()` it
 * is simply a still drawing with the middle choice of each menu.
 */
function PickerDrawing() {
  const d = COPY.drawing
  return (
    <figure className={styles.drawing} data-testid="labs-drawing">
      <div className={styles.app}>
        <div className={styles.chat}>
          <p className={styles.bubbleUser}>{d.question}</p>
          <div className={styles.bubbleAnswer} aria-hidden="true">
            <span className={styles.work}>
              <i />
              <i />
              <i />
            </span>
            {ANSWER_LINES.map((lines, model) => (
              <span className={styles.answer} data-answer={model} key={model}>
                {lines.map((width, i) => (
                  <i key={i} style={{ width: `${width}%` }} />
                ))}
              </span>
            ))}
          </div>
        </div>
        {/* The box she types in, drawn empty, with the two menus beside it. */}
        <div className={styles.typeBox} aria-hidden="true">
          <i className={styles.caret} />
          <i className={styles.send} />
        </div>
        <div className={styles.menus}>
          <fieldset className={styles.menu} data-menu="model">
            <legend>
              <span className={styles.marker} aria-hidden="true">
                1
              </span>
              {d.modelLabel}
            </legend>
            {d.modelChoices.map((choice, i) => (
              <label key={choice}>
                <input type="radio" name="labs-drawing-model" value={i} defaultChecked={i === 1} />
                <span>{choice}</span>
              </label>
            ))}
          </fieldset>
          <fieldset className={styles.menu} data-menu="thinking">
            <legend>
              <span className={styles.marker} aria-hidden="true">
                2
              </span>
              {d.thinkingLabel}
            </legend>
            {d.thinkingChoices.map((choice, i) => (
              <label key={choice}>
                <input type="radio" name="labs-drawing-thinking" value={i} defaultChecked={i === 1} />
                <span>{choice}</span>
              </label>
            ))}
          </fieldset>
        </div>
      </div>
      <ol className={styles.drawingNotes}>
        {d.notes.map((note, i) => (
          <li key={note}>
            <span className={styles.marker} aria-hidden="true">
              {i + 1}
            </span>
            {note}
          </li>
        ))}
      </ol>
      <figcaption>{d.caption}</figcaption>
    </figure>
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

/** "Research, Content and Thinking": the labs' own names from the data, as a list in a sentence. */
export function listOf(names: readonly string[]): string {
  if (names.length < 2) return names.join("")
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
}

export function LabsNext({ index, plain = {} }: LabsNextProps) {
  const labCount = index.labs.length
  const tasks = index.cost_chart.tasks
  /** Fills the counts and names a sentence in `COPY` leaves to the data. */
  const fill = (text: string) =>
    text
      .replace("{tasksPerLab}", tasksPerLab(index.labs.map((lab) => lab.tasks)))
      .replace("{labs}", countWord(labCount))
      .replace("{labNames}", listOf(index.labs.map((lab) => lab.sp_name)))

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
                {COPY.heroWhat}
              </p>
              <p className={`${p.standfirst} ${styles.heroSecond}`} data-testid="labs-uk-note">
                {COPY.heroDo}
              </p>
              <div className={p.actions}>
                <a href="#labs" className={`${p.buttonSolid} ${styles.press}`}>
                  Choose a lab
                </a>
                <a href="#new-here" className={`${p.buttonOutline} ${styles.press}`}>
                  {COPY.heroNew}
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

        </div>
      </section>

      {/* 2. For a newcomer: what a model is, what thinking is, what we test. */}
      <section
        className={`${p.band} ${styles.explainer}`}
        data-section="explainer"
        id="new-here"
        aria-labelledby="h-new"
      >
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle} id="h-new">
              {COPY.explainerTitle}
            </h2>
          </div>
          <p className={styles.lead} data-testid="explainer-intro">
            {COPY.explainerIntro}
          </p>
          <InView className={styles.explainGrid}>
            <PickerDrawing />
            <div className={styles.questions} data-testid="labs-explainer">
              {COPY.questions.map((q) => (
                <div className={styles.question} key={q.title}>
                  <h3>{q.title}</h3>
                  <p>{q.body}</p>
                </div>
              ))}
              <p className={styles.setUp} data-testid="labs-set-up">
                {COPY.setUp}
              </p>
            </div>
          </InView>
          <div className={styles.afterGrid}>
            <div className={styles.where} data-testid="labs-where">
              <h3>{COPY.whereTitle}</h3>
              <p>{COPY.whereBody}</p>
            </div>
            <div className={styles.test} data-testid="labs-test">
              <h3>{COPY.testTitle}</h3>
              <p>{COPY.testBody}</p>
              <p>{fill(COPY.testBody2)}</p>
              <p>
                <a href="#tour" className={styles.textLink}>
                  Watch the short tour
                </a>
              </p>
            </div>
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

      {/* 3. The six labs, as six things to try. */}
      <section className={p.section} data-section="labs" id="labs">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>
              Six labs to <em>try</em>
            </h2>
          </div>
          <p className={styles.lead} data-testid="labs-lead">
            {fill(COPY.labsLead)}
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
                  <figure className={`${p.plate} ${styles.cardPicture}`}>
                    <LabsPlate
                      name={`v2/${lab.sp}`}
                      alt={LAB_INTRO[lab.sp].alt}
                      sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 370px"
                    />
                  </figure>
                  <div className={styles.cardBody}>
                    <div className={styles.cardTop}>
                      <h3 className={styles.cardName}>{lab.sp_name}</h3>
                      <span className={styles.cardCount}>{countWord(lab.tasks)} tasks</span>
                    </div>
                    <p className={styles.cardQuestion}>{LAB_INTRO[lab.sp].line}</p>
                    <div className={styles.cardTask}>
                      <p className={styles.cardTaskTitle}>The main task: {lab.sig_title}</p>
                      {plain[lab.sp] ? <p>{plain[lab.sp]}</p> : null}
                      <p className={styles.cardAsk}>
                        You decide: <em>{lab.ask}</em>
                      </p>
                    </div>
                    <p className={styles.cardFoot}>
                      <Link href={`/labs/${lab.sp}`} className={styles.cardAction}>
                        Open the {lab.sp_name} lab
                        <span className={styles.srOnly}>: {lab.headline}</span>
                      </Link>
                    </p>
                    {/* Our picks, from the data, shown only when asked for: you
                        judge the answers before you are told ours. A native
                        <details>, so it opens without JavaScript; it sits above
                        the card's stretched link. */}
                    <details className={styles.cardPicks} data-testid="lab-picks">
                      <summary>{COPY.picksLabel}</summary>
                      <dl className={styles.picks} aria-label={`Our picks in the ${lab.sp_name} lab`}>
                        <PickRow label="Best" pick={lab.best} />
                        <PickRow label="Best value" pick={lab.value} />
                      </dl>
                      <p className={styles.cardMeta}>{lab.count} set-ups compared</p>
                    </details>
                  </div>
                </article>
              ))}
            </InView>
          )}
          <p className={styles.note} data-testid="labs-picks-note">
            {COPY.picksNote} The costs are what the tests cost through developer access (the API),
            not the price of an app subscription.
          </p>
        </div>
      </section>

      {/* 4. Inside a lab: three steps, and the narrated tour. */}
      <section className={p.section} data-section="tour" id="tour">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>What you do in a lab</h2>
          </div>
          <div className={styles.tourGrid}>
            <figure className={styles.film} data-testid="labs-film">
              {(["paper", "night"] as const).map((edition) => (
                <video
                  key={edition}
                  controls
                  playsInline
                  preload="none"
                  poster={LABS_FILM[edition].poster}
                  className={`${styles.filmVideo} ${edition === "paper" ? styles.paperOnly : styles.nightOnly}`}
                  data-edition={edition}
                  aria-label="How to use the GWTH labs: a short narrated tour"
                >
                  <source src={LABS_FILM[edition].src} type="video/mp4" />
                  <track kind="captions" src={LABS_FILM.captions} srcLang="en" label="English" />
                </video>
              ))}
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

      {/* 5. How we test. */}
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

      {/* 6. What every set-up cost, and how it scored. */}
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

      {/* 7. Labs show you which AI. The course shows you how. */}
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
