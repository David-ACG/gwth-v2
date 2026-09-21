import Link from "next/link"
import { COURSE_MONTHLY_PRICE, ONGOING_MONTHLY_PRICE } from "@/lib/config"
import { CURRICULUM } from "@/components/marketing/data"
import { canPromoteLabs } from "@/lib/labs-cta"
import { Plate } from "@/components/marketing/paper/plate"
import { ScoreCard, type ScoreState } from "./score-card"
import p from "@/components/marketing/paper/paper.module.css"
import styles from "./home-fde.module.css"

/**
 * The home page in the paper-first register (N12, 2026-09-03), on the artboard
 * David approved in the N9 design round (annex 15: HN2L light / HN3D dark).
 * The hero plate is `what-you-make`, the flagship picture that replaced the
 * six-blocks legend (bead gwth-launch-88z.32.12). Its labels are lettered into
 * the photograph, so the page renders no key under it.
 *
 * ## Individual-first (David, 2026-09-15, annotation a-20260915-085703-483d98)
 *
 * His words: *"We are kind of replicating the four institutions page here. I'm
 * not sure why we're concentrating so much on it. What we need to have on the
 * home page is for individuals, and then ask for institutions and teams to
 * click on a link to go to their own page. The home page needs to be aimed at
 * individuals who are probably going to be the most important type of customer
 * in the end, and will also help attract institutions and companies or teams.
 * So it's important for everyone that we concentrate on individuals on the home
 * page"*
 *
 * So the page is ONE argument aimed at one person, in this order:
 *
 * 1. `hero` says what the course gives that person, in concrete terms.
 * 2. `course` is how a lesson works, with the price and the only self-service
 *    step that exists today.
 * 3. `months` is the three-month progression, Month 1 to Month 3, in examples.
 * 4. `blocks` is the six ways of working, with building named first.
 * 5. `organisations` is a SIGNPOST, four sentences and two links, not a second
 *    /for-institutions page. It names a large company beside an institution
 *    (a-20260915-085510-7939bd).
 * 6. `individuals` closes on the learner, with what they leave holding.
 *
 * Section heads carry ONE line, not a title and a standfirst above it
 * (a-20260915-084728-90d41b).
 *
 * ## The third copy pass (David, 2026-09-15). Three annotations, one rewrite.
 *
 * - **a-20260915-101324-6aa90f**, on the hero: *"Can we add that this gets
 *   gradually more complex as the course progresses? So you move from simpler
 *   projects like the ones you gave examples for to more advanced projects in
 *   month two and give examples and then even more Complex in month three,
 *   where you're talking about whole company transformation And give examples
 *   for this as well"*. The hero gets ONE short sentence saying the projects
 *   get bigger every month; the examples themselves are a section of their own
 *   (`months`), because three months of examples in the hero is the overload
 *   he has objected to twice. Every example there is checked against the
 *   authored lesson it comes from: see "What the examples are taken from".
 *
 * - **a-20260915-101631-6649fd**, on the three-figure evidence section: *"This
 *   section should move to the institutions part because everything is talking
 *   about benefits institutions and companies - not individuals"*. He is
 *   right, and the substance was ALREADY on `/for-institutions` before this
 *   change: its `EVIDENCE` array carries the CIPD 67/33 figure and the OpenAI
 *   frontier-firm figure word for word as its own Figure 01 and Figure 02, and
 *   its `BASELINE` panels carry the specialist-day argument that was Figure 03
 *   here ("Your tutors teach the catch-up first" / "Everyone arrives at the
 *   level you set"). So the section is removed from this page and NOTHING is
 *   copied across: `/for-institutions` is not edited by this pass, which also
 *   keeps it clear of the separate work already in flight on that page.
 *
 *   That supersedes, on THIS page only, a-20260915-085220-526a43 ("it's
 *   definitely worth keeping this theme in because that's what CIPD wanted").
 *   The theme is kept, on the page a professional body actually reads.
 *
 *   The space is not left empty: the `months` progression he asked for in
 *   a-20260915-101324-6aa90f takes it, in the same three-card component, so
 *   there is no hole and no stranded heading.
 *
 * - **a-20260915-101927-9ec6a5**, on the building-blocks lead: *"This still
 *   sounds like Claude talking, not a human ... make it sound more human and
 *   much simpler so beginners can understand it ... It is important that this
 *   course is understood and desirable to everyone, not just technical people
 *   who use clever jargon. We're not trying to be clever. We're trying to be
 *   inclusive and friendly"*. Every visitor-visible string on this page was
 *   rewritten against `.agents/skills/gwth-public-writing/SKILL.md`, which
 *   names the old lead sentence, "Building is the one that carries the other
 *   five", as an example of the thing to remove. The H1 went the same way for
 *   the same reason: "The gap is not access. It is depth." is a contrast a
 *   beginner has to decode before it says anything. Its first replacement,
 *   "Three months to get genuinely good at AI", was blocked by the copy gate
 *   as an undefined outcome, which is the same rule; the headline now names
 *   what the course does rather than a standard it cannot define.
 *
 * ## What the examples are taken from (checked 2026-09-15)
 *
 * Nothing in `months` is taken from `lessons.metadata.project_title` in the
 * pipeline DB. That field is demonstrably stale for Month 1 and Month 3 (see
 * `GWTH-launch-plan/completion/home-annotations-round2/curriculum-check.md`),
 * so every example is read from the authored lesson itself under
 * `1_gwthpipeline520/data/generated_lessons/<id>/content/project.md`:
 *
 * - Month 1: `m1_l14` CV or LinkedIn upgrade pack, `m1_l15` interview practice
 *   pack, `m1_l17` dashboard decision note ("one question, one dataset, one
 *   chart, two verified numbers, one decision"), `m1_l09` "build one small
 *   working tool today", and the capstone `m1_l21` to `m1_l24` FamilyBot,
 *   whose four lessons produce the transcript, the tasks and events, the meal
 *   plan and the shopping list. David's dictated "good fun" point (a51de31,
 *   ledger C05) sits in the Month 1 card, beside the Month 1 examples, and now
 *   says why these personal projects are useful. The capstone NAME is read from CURRICULUM so
 *   it cannot drift from `config.ts`.
 * - Month 2: `m2_l13` "Build A Multi-Tenant Cited Q&A Engine" (AskMyCo: the
 *   answers carry citations into the UI), `m2_l18` FractionalBuddy spec and
 *   `m2_l19` the ten-day production sprint that builds it, `m2_l09` "Your
 *   First Agent Verification Loop" and `m2_l06` security and UK GDPR.
 * - Month 3: `m3_l04` interviewing the organisation, `m3_l03`/`m3_l09`
 *   readiness assessment and scoring (`m3_l03` is the twelve-theme table with
 *   a one-to-five maturity score and an evidence note per row, and it names
 *   the subjects a learner
 *   may pick: their employer, a charity they are a trustee of, a school they
 *   govern, their own practice or a consenting client), `m3_l10` roadmap,
 *   `m3_l11` the AI P&L one-pager, and the capstone `m3_l16` to `m3_l18`
 *   askevery.one: the voice interview prototype, the evidence and scoring
 *   engine, and the executive report and slide deck for a board.
 *
 * ## The GPT-5.6 Sol editorial pass (skill step 5)
 *
 * The complete rendered page was given to GPT-5.6 Sol at high reasoning in
 * reading order, before the copy gate. Taken: the hero no longer promises a
 * "dashboard" (m1_l17 produces a decision note holding a chart, which Sol
 * spotted independently of the curriculum check); "Nothing is a quiz" was
 * deleted because the product does have quizzes, graded on the server against
 * an institution's pass mark, so the sentence was untrue; Month 2 no longer
 * opens on a rhetorical fragment; the six block bodies lost their metaphors
 * and their two unsupported quantities ("the repetitive half of the week",
 * "learn faster"); the close no longer says every deliverable runs, which the
 * authored project files contradict. Refused: rewording the browser title,
 * which is not in this pass's scope; replacing the plate caption, which drops
 * the flagship line David asked for in a-20260914-155515-41bf8e and duplicates
 * the attribution already under the six cards; and flattening "they are good
 * fun", which is David's own dictated wording and the only line on the site
 * that says a learner might enjoy this. Sol's note asked whether a beginner
 * needs technical experience; that is a fair question from a reader and the
 * course section now answers it.
 *
 * ## The last copy-gate round (2026-09-15, r17 and the sweep after it)
 *
 * The gate was run seventeen times on this page, once per edit, which is a
 * cost this page is not worth repeating. The three blocking findings it left
 * open were fixed together, and every other passage changed by this pass was
 * swept in the same sitting against the patterns the earlier sixteen rounds
 * had already caught (vague pronouns, undefined nouns, jargon, metaphors,
 * label collisions, clause-heavy lists, unsupported universals, promises
 * about what an employer will do, and an ending weaker than the opening):
 *
 * - Month 3 said "you score it on twelve things ... risk and compliance". Both
 *   the pronoun and the idea of being "ready for AI" were abstract, so the
 *   card now names examples of the twelve areas and says what the scores let
 *   the learner show.
 * - The blocks lead opened on "Here is what one small build takes". "A build"
 *   is the jargon noun r7 had already caught, and the paragraph then made the
 *   reader work out which five blocks the example used. It now states the
 *   structure plainly, walks the same Family AI Bot example, and names the
 *   five.
 * - The six keys under the plate now use complete, parallel actions rather
 *   than compressed noun fragments. This keeps each label short while making
 *   its meaning clear when the page is read or extracted as plain text.
 * - The headline's comma, raised twice as advisory, is gone.
 * - The flagship line under the plate claimed these were "the six things
 *   people actually do with AI at work", the unsupported absolute r1 caught.
 *   The sentence is deleted rather than hedged: the attribution under the six
 *   cards already says where the six come from, and rule 2 prefers the cut.
 *
 * Passages the gate had already passed under review were left exactly as they
 * were: rewording them would put them back under review for no gain.
 *
 * ## What this page deliberately does NOT claim
 *
 * - **That half the course is building.** The syllabus does not support it;
 *   the evidence is in the curriculum check above.
 * - **That most Month 2 projects are working software.** An earlier version of
 *   the blocks lead said so on the strength of the same stale
 *   `project_title` metadata (25 of 39). Read from the authored `project.md`
 *   files, most Month 2 deliverables are a spec, a brief, an audit or a
 *   decision note, and the clear builds are the capstones and their
 *   supporting lessons. The page now names the capstones instead of counting.
 * - **That you run an assistant on a company's own computers in Month 3.**
 *   `m3_l30` produces a one-page infrastructure plan, not a deployment.
 * - **How institution editions are priced** (a-20260915-085041-eaa513).
 *
 * ## What the self-service route may promise
 *
 * There is no live checkout. `/api/stripe/checkout` answers 503 unless
 * `BILLING_ENABLED` is set, and it is set nowhere; `/signup` is invite-only
 * while `PRIVATE_CONTENT_MODE` is on, which is its fail-closed default in
 * production. The honest self-service step today is therefore the waitlist.
 * The prices are the canonical ones from config.
 *
 * Copy rules: British English, sentence case, no em or en dashes, GBP only.
 * Every visitor-visible passage here passed the marketing copy gate
 * (`GWTH-launch-plan/scripts/marketing_copy_gate.py`, GPT-5.6 Sol at high
 * reasoning) on the whole rendered page, not on snippets.
 */

/**
 * The three months, as the work a learner actually does in each one. This
 * replaces the institution evidence cards (a-20260915-101631-6649fd) and
 * answers a-20260915-101324-6aa90f: the same card component, so the page keeps
 * its shape, with the progression in it instead of figures about employers.
 */
export const MONTHS = [
  {
    kicker: "Month 1",
    title: "Your own work and home life",
    body: "You rewrite your CV and your LinkedIn profile, and practise for interviews. You turn a spreadsheet of numbers into a chart and a decision you can act on. You make your first small working tool. You use your own information and routines, so the projects are useful to you and good fun to make. The month ends with the {CAPSTONE}: it takes the recording of your weekly family meeting and turns it into tasks, calendar events, a meal plan and a shopping list.",
  },
  {
    kicker: "Month 2",
    title: "A small business",
    body: "You take the same skills into the work of a small business. Before anything you make is used by other people, you learn how to secure their data: where keys are kept, who can see what, and how to test that one customer cannot see another's records. Then you build AskMyCo, a customer support chatbot that answers from a company's own documents and shows you where each answer came from. You also write down what personal information it touches, and the legal reason you are allowed to use it. After that you specify a second assistant, FractionalBuddy, for a small consulting firm, and plan the ten days of work that would build it.",
  },
  {
    kicker: "Month 3",
    title: "A whole organisation",
    body: "Month 3 is about how an organisation works as a whole, not one more tool for it. You pick a real one: your employer, a charity you help run, or your own business. You interview people in different teams to find where AI would genuinely help. You score the organisation on twelve areas of its work, such as its skills, its data and the rules it has to follow. Then you build a working AI consultant that does all of that for you. It interviews people by voice, and every score it gives names the answers it came from. It sorts the work into what to change now, what comes next and what can wait, then writes the report and the slide deck. The people who run the organisation decide what changes, and when.",
  },
] as const

/**
 * The six building blocks, in the order the tiles sit in the photograph
 * (three across, two down). GWTH's names for OpenAI's six use case
 * primitives: research, content creation, ideation and strategy, coding,
 * data analysis, automation.
 *
 * `clause` is what the key under the plate says beside each name. David,
 * 2026-09-14 (annotation a-20260914-155515-41bf8e), on the six bare nouns
 * that used to sit there: *"This text under a diagram really doesn't look
 * good enough for a home page. It may be okay for a lesson, but this is
 * totally uninspiring for the most important page on GWTH"*. A category word
 * names a subject; the clause says what you walk away able to do, which is
 * the thing the picture is actually about. Keep them to four or five words:
 * the key is inset under the tiles and cannot grow sideways. The six clauses
 * passed the copy gate in the third pass and are deliberately NOT reopened
 * here (skill rule: rewording passed copy puts it back under review for no
 * gain).
 *
 * `months` is David's fourth-pass ask, a-20260915-211445-2274ea: *"For all of
 * these blocks, I'd like to explain how the student progresses from month one
 * to two to three. That's much more powerful than just saying the first step
 * or what the block is"*. It replaces the single `body` line. Three clauses
 * crammed into one paragraph would have made six unreadable cards, so each
 * card carries a three-row track instead (`.blockTrack`).
 *
 * **Every cell below is checked against the authored lesson, not against
 * `lessons.metadata.project_title`, which is stale** (the round-2 curriculum
 * check records why). Read from
 * `1_gwthpipeline520/data/generated_lessons/<id>/content/project.md` and
 * `content/lesson.md`:
 *
 * - Research: m1_l06 one-page comparison · m2_l10 knowledge audit ·
 *   m3_l07, whose project is explicitly an architecture decision record and
 *   NOT code, so the cell says "design", built later in m3_l17.
 * - Content: m1_l07 four-piece package with a commercially safe image ·
 *   m2_l17 brand-asset system map · m3_l18 twelve-page PDF and ten-slide deck.
 * - Thinking: m1_l08 personal goal plan · m2_l02 builder's spec with
 *   acceptance criteria · m3_l03 twelve-theme scoring, m3_l10 now/next/later
 *   roadmap, m3_l11 the AI profit-and-loss one-pager.
 * - Building: m1_l09 *"build one small working tool today"*, the eighth
 *   lesson in author order, which at five lessons a week lands in the second
 *   week, so the page says "your first couple of weeks" and never "day one" ·
 *   m2_l08 real logins, m2_l13 cited multi-tenant Q&A, m2_l14 Streamlit
 *   dashboard, m2_l09 test-first · m3_l16 to m3_l18.
 * - Data: m1_l10 messy-data workflow and m1_l17 the decision note ·
 *   m2_l14 three-panel dashboard plus the evaluation tiles · m3_l08 and
 *   m3_l09 themes and evidence-anchored scores.
 * - Automation: **no month builds one**, in any of the three. m1_l11 is a
 *   written "Safe First Automation"; m2_l15 says in terms *"This project does
 *   not require you to build the automation. It asks you to design it"*; and
 *   m3_l29 says *"You will not write code. You will design the system on
 *   paper."* All three cells therefore say "design", which is what the
 *   curriculum actually teaches. Do not let this one drift into "you
 *   automate": it is the weakest-evidenced block on the page.
 */
export const SIX_BLOCKS = [
  {
    n: "01",
    name: "Research",
    clause: "find facts and check the source",
    months: [
      "You build a one-page comparison to settle a real decision you are facing, and you say where every fact came from.",
      "You audit what one organisation actually knows, and where that knowledge is kept.",
      "You design the search system that reads a whole organisation's interviews and finds the evidence behind an answer.",
    ],
  },
  {
    n: "02",
    name: "Content",
    clause: "create work in your own voice",
    months: [
      "You write a short post and a longer piece in your own voice, with one image you are allowed to use commercially.",
      "You write your brand down once, in a form your AI tools can read, so everything you make after that is consistent.",
      "Your own tool produces a twelve-page report and a ten-slide deck from the interviews it collected.",
    ],
  },
  {
    n: "03",
    name: "Thinking",
    clause: "plan with AI, then decide for yourself",
    months: [
      "You make a one-page plan for a real decision in your life, using a seven-step routine you can use again.",
      "You write a builder's brief: what to make, what good looks like, and how you will check it.",
      "You score an organisation's readiness, sort the work into now, next and later, and put a cost against it.",
    ],
  },
  {
    n: "04",
    name: "Building",
    clause: "make useful tools without code",
    months: [
      "In your first couple of weeks you build one small working tool, without writing any code.",
      "You start building real software: a database with real logins, a chatbot that shows where its answers came from, a dashboard, and tests that check each part works.",
      "You build the AI consultant itself, from the voice interview at the front to the report that comes out of the back.",
    ],
  },
  {
    n: "05",
    name: "Data",
    clause: "check that the numbers add up",
    months: [
      "You take one messy real spreadsheet and get a chart, two checked numbers and a decision out of it.",
      "You build a dashboard with three panels, and a way of measuring whether the answers it gives are any good.",
      "You turn dozens of interviews into themes, and into scores that each name the answers they came from.",
    ],
  },
  {
    n: "06",
    name: "Automation",
    clause: "hand routine jobs to AI",
    months: [
      "You design your first safe automation on paper: the steps, the permissions, four test cases and how to undo it if it goes wrong.",
      "You design a workflow where AI does the repetitive part and a person still signs it off.",
      "You design how one job can be split between several AI assistants working together, and where a person has to be able to stop them.",
    ],
  },
] as const

/**
 * The three states of the score, as David asked for them
 * (a-20260915-211845-237ea3): *"It needs to show the score and the trajectory
 * that the student is on whether they're improving their score or it's
 * flatlining or it's not being kept up to date"*.
 *
 * ## What is real here, and what is not. Read this before touching the copy.
 *
 * The score ITSELF is implemented: `calculateGwthScore()` in
 * `lib/progress/gwth-score.ts` is mandatory lessons completed times 1.5,
 * multiplied by the average best quiz mark, against a denominator taken from
 * the learner's own syllabus edition. The band beside each number below is the
 * product's own `getTrajectoryLabel()`, copied from that file.
 *
 * The MOVEMENT is not. There is no decay, no staleness, no recency weighting
 * and no stored history anywhere in the product: `SCORE_DECAY_DAYS` is a
 * config constant that nothing reads, `scoreHistory` is returned empty
 * unconditionally, and the whole feature sits behind `GWTH_SCORE_ENABLED`,
 * which is set in no environment. Copy ledger C35 bans asserting the four
 * named metrics and score decay as present facts, and the /for-teams tests
 * enforce the same thing on that page.
 *
 * So the section does NOT assert the mechanic in the present tense. It says on
 * the page, in body copy rather than in a footnote, that this part is still
 * being built and that no score is switched on during the beta, and the note
 * under the cards says the numbers are examples. That is the only honest way
 * to publish what David asked for. If the mechanic ships, delete the
 * still-being-built sentence and nothing else needs to move.
 *
 * Values are kept under 99 on purpose: 66 mandatory lessons at 1.5 points is a
 * ceiling of 99, so a marketing "104" or "reaching 100" would be a number the
 * product cannot produce.
 *
 * Deliberately absent: any percentile or rarity claim ("top 1%"), any claim
 * about what an employer thinks, the word certificate as something GWTH
 * issues, and any social network's name, mark or template.
 */
export const SCORE_STATES: readonly ScoreState[] = [
  {
    id: "rising",
    value: 71,
    band: "Confident builder",
    history: [8, 14, 21, 27, 33, 38, 45, 52, 57, 62, 67, 71],
    state: "Going up",
    marker: "filled",
    said: "You are finishing lessons and doing well on the questions, so the number has risen every month since you started.",
  },
  {
    id: "level",
    value: 44,
    band: "Month 1 foundations",
    history: [8, 15, 22, 29, 36, 43, 44, 44, 44, 44, 44, 44],
    state: "No change",
    marker: "square",
    said: "You finished Month 1 and have not started Month 2. Nothing you earned is taken away, and nothing new is being added either.",
  },
  {
    id: "stale",
    value: 58,
    band: "Confident builder",
    history: [10, 19, 28, 37, 46, 55, 62, 62, 61, 60, 59, 58],
    recordedUpTo: 7,
    state: "Needs updating",
    marker: "ring",
    said: "Lessons you passed have been rewritten since, because the tools moved on. Working through the new versions will bring your score back up.",
  },
]

/**
 * The three ways this page carries the UK thread. Each is a different KIND of
 * claim, not the same sentence three times: what you practise on, what you
 * are held to, and how you are taught to check an answer. None of them
 * carries a statistic; the sourced figures live on /about, /why-gwth and
 * /for-teams, and every one of them comes from
 * `src/lib/data/uk-ai-context.ts`.
 */
const UK_THREAD = [
  {
    title: "The documents you actually get",
    body: "A letter from the NHS, a council or benefits form, a Self Assessment return, a workplace pension statement, the household spreadsheet behind all of it. You practise on the paperwork that lands in your own house, so the skill is ready the first time you need it.",
  },
  {
    title: "The rules you are actually held to",
    body: "Tax, pensions, employment and data protection all work differently here. Where a lesson touches any of them it teaches the version that applies to you, because an answer that is right somewhere else and wrong in the United Kingdom is worse than no answer at all.",
  },
  {
    title: "Proof you can point at",
    body: "Most of what an AI model has read was written about somewhere else, so it will answer confidently about the wrong country. You are taught to ask for the source and to check it against the GOV.UK page, the regulator's own words or your employer's policy before you act on it.",
  },
]

export const PRIMITIVES_URL =
  "https://openai.com/business/guides-and-resources/identifying-and-scaling-ai-use-cases/"

/** Month 1's capstone, read from the canonical curriculum so it cannot drift. */
const MONTH_ONE_CAPSTONE = CURRICULUM[0]?.capstone ?? "the Month 1 capstone"

export function HomeFde() {
  // Server component under the force-dynamic (public) layout, so this reads
  // the RUNTIME gate. While /labs is private an anonymous visitor bounces off
  // a login wall, and the precedent on this page is already written down:
  // advertising a call to action a visitor cannot reach is worse than one
  // button (W25, `lib/labs-cta.ts`).
  const labsArePublic = canPromoteLabs()

  return (
    <div className={p.shell}>
      <section className={styles.hero} data-section="hero">
        <div className={p.page}>
          <div className={styles.heroGrid}>
            {/* The N9 artboard headline was "The gap is not access. It is
                depth." David, 2026-09-15 (a-20260915-101927-9ec6a5), asked for
                the whole page to stop making a beginner think too hard, and
                that sentence was the page's hardest: two abstract nouns and a
                contrast to decode before it tells you anything. The layout is
                unchanged; the words say what the course is. */}
            <h1 className={styles.heroTitle}>
              <span>Learn to use AI at work </span>
              <span>
                by <em>making things</em>.
              </span>
            </h1>
            <div className={styles.heroCopy}>
              <p className={p.standfirst}>
                GWTH is a three-month course in using AI well at work and in
                life. You are taught how to check what AI gives you and how to
                spot when it has got something wrong. The course is practical
                because we have found that making things is the best way to
                learn. You start with simple, fun projects based on your own
                work, and the projects get bigger and more useful every month.
                You keep what you make. That includes a rewritten CV, a
                spreadsheet turned into a chart you can act on, and a retrieval
                system called RAG. RAG lets AI work with your company&apos;s
                information. By Month 3, you build your own AI consultant. It
                interviews people across an organisation by voice and uses
                their answers to score the organisation. It produces a report
                and a plan for what to change first.
              </p>
              <div className={p.actions}>
                <Link href="/waitlist" className={p.buttonSolid}>
                  Join the waitlist
                </Link>
                <Link href="/lessons" className={p.buttonOutline}>
                  See what you build
                </Link>
              </div>
            </div>
          </div>

          {/* The one saturated thing on the page. No frame, no tint, 8px.

              David, 2026-09-13, on the picture that used to be here: *"the
              image could be better for a home page as it just looks like a
              kind of standard image that you get in a lesson rather than a
              special image that goes on the home page"* (bead
              gwth-launch-88z.32.12). Six equal cards in a three by two grid is
              the form every lesson figure takes, it is the picture of breadth
              rather than of depth, and the six blocks have a section of their
              own further down that does the job properly. This picture makes
              the headline's argument instead: three projects, each one bigger
              than the last, the newest one in a hand. Its labels are lettered
              into the photograph (landscape-labelled-images), so the page no
              longer renders a key under it; David, 2026-09-14, had already
              said the six bare category words there were "totally
              uninspiring". */}
          <figure className={`${p.plate} ${styles.heroPlate}`} id="what-you-make">
            <Plate
              name="what-you-make"
              alt="Three paper-craft objects on a desk, each larger than the one before. A small card with a speech bubble and a cog, labelled Month 1, a tool that works. A propped screen showing a bar chart with a key beside it, labelled Month 2, real software. A bound booklet with a microphone on its mint cover, labelled Month 3, your AI consultant, being set down by a hand."
              priority
              sizes="(max-width: 1180px) 100vw, 1140px"
            />
            <figcaption className={styles.plateCaption}>
              <span className={styles.plateLine}>
                Three projects from the course, in the order you make them. You
                build <em>every one of them</em> yourself, using your own work
                as an example, and you keep all three.
              </span>
            </figcaption>
          </figure>
          <div className={p.plateMeta}>
            <p>Three months · Five hours a week · Assessed throughout</p>
            <p>Independent. No sponsors. No vendor partnerships.</p>
          </div>
        </div>
      </section>

      {/*
        How a lesson works, straight after the hero, because this is the page's
        main audience and this is the question they arrived with. The price and
        the one self-service step that exists live here and nowhere else on the
        page, so nothing repeats them further down.
      */}
      <section className={p.section} data-section="course">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>How the course works</h2>
          </div>
          <div className={styles.offer}>
            <div>
              <p className={styles.offerBody}>
                Every lesson is built around a project. You attempt it
                yourself first, then the lesson works through it with you, step
                by step. There are a few questions at the end, marked for you,
                so you know what to go back over. You do not need any coding
                experience to start.
              </p>
            </div>
            <div className={styles.offerAside}>
              <p className={styles.offerPrice}>
                For one person it is £{COURSE_MONTHLY_PRICE} a month while the
                teaching runs. After that, £
                {ONGOING_MONTHLY_PRICE.toFixed(2)} a month keeps your access and
                brings you the new lessons as the tools change. You can cancel
                at any time.
              </p>
              <p className={styles.offerNote}>
                Places are invite-only. A small group of beta testers is
                working through the course now. Leave a name and an email and
                we will write to you when the next intake opens. No call, no
                demo, no sales conversation.
              </p>
              <div className={styles.offerActions}>
                <Link href="/waitlist" className={p.buttonSolid}>
                  Join the waitlist
                </Link>
                {labsArePublic ? (
                  <Link href="/labs" className={p.buttonOutline}>
                    Try a free lab
                  </Link>
                ) : (
                  <Link href="/pricing" className={p.buttonOutline}>
                    See pricing
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*
        The progression David asked for (a-20260915-101324-6aa90f), in the slot
        the institution figures used to hold (a-20260915-101631-6649fd). Three
        cards, one per month, each one an example of the work rather than a
        description of a level. Every example is traced to an authored lesson
        in the file header.
      */}
      <section className={p.section} data-section="months">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>The work gets bigger every month</h2>
          </div>
          <div className={p.cards3}>
            {MONTHS.map((month) => (
              <article className={p.card} key={month.kicker} data-testid="month-card">
                <p className={p.cardKicker}>{month.kicker}</p>
                <h3 className={p.cardTitle}>{month.title}</h3>
                <p className={p.cardBody}>
                  {month.body.replace("{CAPSTONE}", MONTH_ONE_CAPSTONE)}
                </p>
              </article>
            ))}
          </div>
          {/*
            The optional lessons, as a signpost and nothing more (David,
            2026-09-17, a-20260917-145147-bfd191, left on /lessons: *"people
            will want to do specific lessons and not others ... you can go deep
            into one area, or you can do optional lessons by industry"*). The
            full explanation belongs on the course page, and this paragraph
            exists so a reader of the home page knows there is one.

            Two rules it is written under. The STRUCTURE is safe: MONTH_CONFIGS,
            the canonical syllabus register and the authored lessons on disk all
            agree that Months 2 and 3 run twenty core lessons and then optional
            ones. The CHOICE is not a live control: the pipeline importer marks
            every lesson core, so nothing in the product lets a learner select
            an optional lesson yet. Hence "you are not expected to take all of
            them", which is true of the syllabus, rather than "you choose",
            which would describe a picker that does not exist. No count appears
            here for the reason /for-teams prints none (a-20260914-201426-ae7f0e).
          */}
          <p className={styles.monthsNote} data-testid="months-optional-note">
            Months 2 and 3 each open with twenty core lessons that everybody
            does. The lessons after those are optional. There are lessons on
            using AI inside UK legal work, finance, healthcare, manufacturing
            and the public sector, and others that go further into building
            things or into leading the change at work. You are not expected to
            take all of them.
          </p>
          <div className={p.actions}>
            <Link href="/lessons" className={p.buttonOutline}>
              See the optional lessons
            </Link>
          </div>
        </div>
      </section>

      <section className={p.section} data-section="blocks">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>Six building blocks</h2>
          </div>
          {/* David, 2026-09-15 (a-20260915-085439-6c8134): *"We need to say
              something here about building being the really important
              foundation for almost everything else ... we're concentrating
              maybe 50% of the course on building."* The emphasis is right and
              the number is not something the syllabus can be made to say. The
              sentence that used to carry the emphasis, "Building is the one
              that carries the other five", is named in the public-writing
              skill as the kind of line to delete, and David's
              a-20260915-101927-9ec6a5 is about exactly that habit. So the
              emphasis is now made by saying what happens when you make
              something. */}
          <p className={styles.blocksLead} data-testid="blocks-lead">
            Every month here is built around making something, and each
            project brings several of the six building blocks together. Take
            the Family AI Bot in Month 1. To make it you research what your
            family actually needs. You write the instructions, then judge what
            the AI gives back. You check the tasks and dates it has pulled out
            of the recording. You decide how much of the job it should do
            without you. That is all six building blocks below, used in one
            small tool: research, content, thinking, building, data and
            automation.
            Some projects are the working tool itself. Others are the plan or
            the test that has to come before anyone else uses it.{" "}
            {/* "Six ways of working, not six subjects" used to sit under the
                hero picture, where it was explaining six tiles in that
                photograph. The picture changed (bead gwth-launch-88z.32.12),
                so the sentence moved to the section that owns the six blocks
                rather than being dropped. It closes the paragraph rather than
                opening it: the opening sentence is pinned by David's
                building-emphasis annotation (a-20260915-085439-6c8134). */}
            Six ways of working, not six subjects.
          </p>
          <div className={p.cards3}>
            {SIX_BLOCKS.map((block) => (
              <article className={p.card} key={block.n} data-testid="block-card">
                <p className={p.cardKicker}>{block.n} · Building block</p>
                <h3 className={p.cardTitle}>{block.name}</h3>
                {/* One row per month, so the reader can see where the block
                    takes them rather than only where it starts
                    (a-20260915-211445-2274ea). */}
                <div className={styles.blockTrack} data-testid="block-track">
                  {block.months.map((line, i) => (
                    <p className={styles.blockStep} key={i} data-testid="block-step">
                      <span className={styles.blockStepMonth}>Month {i + 1}</span>
                      <span className={styles.blockStepBody}>{line}</span>
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <p className={p.attribution}>
            The six building blocks follow the{" "}
            <a href={PRIMITIVES_URL} rel="noopener noreferrer" target="_blank">
              six common ways of using AI at work
            </a>{" "}
            that OpenAI found across its customers: research, content
            creation, ideation and strategy, coding, data analysis and
            automation. The names above are ours.
          </p>
        </div>
      </section>

      {/*
        The UK thread on the flagship page (bead gwth-launch-88z.32.25, from
        David's annotation a-20260914-210609-f7fdc8: "This is about the only
        page that mentions that it's UK focused, we should be mentioning it on
        all pages").

        It sits after the building blocks because this is the first moment the
        reader knows what the work IS, so "and it is set here" has something to
        attach to. It carries no statistic on purpose: /about, /why-gwth and
        /for-teams each carry sourced UK figures, and this page is written for
        somebody deciding whether AI is for them at all. A percentage is one
        more thing for them to decode (beginner-first-public-writing).
      */}
      <section className={p.section} data-section="uk">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>
              Written for work and life <em>in the United Kingdom</em>
            </h2>
          </div>
          <p className={styles.blocksLead} data-testid="uk-lead">
            The skills travel anywhere. The paperwork does not, and neither do
            the rules or the money, so the work you do in this course uses the
            things you already have to deal with in the United Kingdom.
          </p>
          <div className={p.cards3}>
            {UK_THREAD.map((item) => (
              <article className={p.card} key={item.title} data-testid="uk-card">
                <h3 className={p.cardTitle}>{item.title}</h3>
                <p className={p.cardBody}>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/*
        The score (David, 2026-09-15, a-20260915-211845-237ea3). It sits here
        because it is the answer to "and what do I have at the end of it",
        which only makes sense once the reader knows what the work is. The
        closing section keeps the FILES a learner walks away with; this one is
        about the number and which way it is moving, so the two do not repeat.

        What may and may not be claimed is in the SCORE_STATES comment above.
      */}
      <section className={p.section} data-section="score">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>Your score, and which way it is going</h2>
          </div>
          {/* The gate caught two things here on the first run and both were
              right. The opening claimed everything marked feeds the score,
              which contradicted the sentence after it and is not what
              `calculateGwthScore()` does: marked projects are feedback, and
              the number comes from finished lessons and the end-of-lesson
              questions. And a rising score was said to show somebody had kept
              up, which it cannot show until the update tracking exists. */}
          <p className={styles.scoreLead} data-testid="score-lead">
            Your GWTH score is one number, worked out from the lessons you have
            finished and how you did on the questions at the end of each one.
            It is a record of work you have actually done rather than a note
            saying you attended. No score is switched on while the course is in
            beta.
          </p>
          {/* The copy says only what the planned update tracking can establish:
              whether a completed lesson has since changed. It does not claim
              to measure whether the learner's knowledge or work is current. */}
          <p className={styles.scoreLead} data-testid="score-honesty">
            Once scores are switched on, yours will show more than what you
            have finished. It will show whether any lesson you passed has since
            been rewritten and needs completing again. AI tools move quickly,
            and a completion date on its own does not show whether somebody has
            kept up with them. We are still building this update tracking. The
            three cards below show what that will look like.
          </p>
          <div className={p.cards3} data-testid="score-cards">
            {SCORE_STATES.map((state) => (
              <ScoreCard key={state.id} state={state} cardClassName={p.card} />
            ))}
          </div>
          <p className={styles.scoreNote}>
            {/* NOT YET GATED, same run. "On a different scale" did not say
                which comparison is unsafe, which matters on a page that
                presents the score as something to show somebody. */}
            The numbers here are examples rather than real learners. Your score
            is based on the lessons you were given, so two scores mean the same
            thing only when they come from the same set of lessons.
          </p>
        </div>
      </section>

      {/*
        The signpost, and deliberately nothing more. Everything an institution
        or a large company needs to decide is on its own page; what belongs
        here is enough for a reader to recognise themselves and one link each.
      */}
      <section className={p.section} data-section="organisations">
        <div className={p.page}>
          <div className={styles.signpost} data-testid="organisations-signpost">
            <h2 className={p.sectionTitle}>Buying this for other people?</h2>
            <p className={styles.signpostBody}>
              A professional body or a large company gets its own edition: you
              pick the lessons and you set the pass mark. Your tutors or
              training leads can see who has reached it, and each learner
              finishes with a record of the lessons they passed. If you are
              buying for one team of five or more rather than a whole
              organisation, the teams page has what you need.
            </p>
            <div className={p.actions}>
              <Link href="/for-institutions" className={p.buttonOutline}>
                For institutions and large companies
              </Link>
              <Link href="/for-teams" className={p.buttonOutline}>
                For teams of five or more
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/*
        The close, and the last word on the page, because the reader it is
        written for is one person deciding for themselves. It says what they
        leave holding, which is the one thing the page has not said yet. It
        does not restate the price: that is three sections up, once.
      */}
      <section className={p.closing} data-section="individuals">
        <div className={p.page}>
          <h2 className={p.sectionTitle}>
            You finish with <em>work</em> you can show.
          </h2>
          <p className={p.standfirst}>
            {/* Recovered: David's own refined home wording, "every lesson and
                project" and the portfolio line (18a3e09^, a51de31). */}
            Everything you make in a lesson is yours, and it stays yours when
            the course ends. By the end of the three months that is a folder of
            finished work: documents you can hand to somebody else, and tools
            you can open and run. Each project is marked, so you know which
            parts you got right.
          </p>
          <div className={p.actions}>
            <Link href="/waitlist" className={p.buttonSolid}>
              Join the waitlist
            </Link>
            <Link href="/lessons" className={p.buttonOutline}>
              See the course
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
