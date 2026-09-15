import Link from "next/link"
import { COURSE_MONTHLY_PRICE, ONGOING_MONTHLY_PRICE } from "@/lib/config"
import { CURRICULUM } from "@/components/marketing/data"
import { canPromoteLabs } from "@/lib/labs-cta"
import { Plate } from "@/components/marketing/paper/plate"
import p from "@/components/marketing/paper/paper.module.css"
import styles from "./home-fde.module.css"

/**
 * The home page in the paper-first register (N12, 2026-09-03), on the artboard
 * David approved in the N9 design round (annex 15: HN2L light / HN3D dark).
 * The six-blocks plate is the I2 image with the key rendered by the PAGE
 * (image-text-rules).
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
    body: "You take the same skills into the work of a small business. You build AskMyCo, a customer support chatbot that answers from a company's own documents and shows you where each answer came from. Then you plan a second one, FractionalBuddy, an assistant for a small consulting firm, and build it over ten days. You also learn to test what you have made, and to look after other people's data, before anyone else uses it.",
  },
  {
    kicker: "Month 3",
    title: "A whole organisation",
    body: "Month 3 is about how an organisation works as a whole, not one more tool for it. You pick a real one: your employer, a charity you help run, or your own business. You interview people in different teams to find where AI would genuinely help. You score the organisation on twelve areas of its work, such as its skills, its data and the rules it has to follow. Each score has your evidence beside it, so you can show where an AI project would work today and where it would not. From that you write a plan: what to change first, and what it will cost. The last thing you build is a tool that runs those interviews itself, by voice. It rates the answers the same way you did. The report it produces is written for the people who decide which changes get funded.",
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
 * the key is inset under the tiles and cannot grow sideways.
 */
export const SIX_BLOCKS = [
  {
    n: "01",
    name: "Research",
    clause: "find facts and check the source",
    body: "Find and compare information, then check it and say where it came from.",
  },
  {
    n: "02",
    name: "Content",
    clause: "create work in your own voice",
    body: "Write, design and communicate in your own voice, not the machine's.",
  },
  {
    n: "03",
    name: "Thinking",
    clause: "plan with AI, then decide yourself",
    body: "Use AI to help you plan and learn, while you make the decisions.",
  },
  {
    n: "04",
    name: "Building",
    clause: "make useful tools without code",
    body: "Make your first small working tool without writing code.",
  },
  {
    n: "05",
    name: "Data",
    clause: "check that the numbers add up",
    body: "Ask questions of a spreadsheet, and check whether the answers are right.",
  },
  {
    n: "06",
    name: "Automation",
    clause: "hand routine jobs to AI",
    body: "Hand a repetitive job over to AI, and check it is doing it properly.",
  },
] as const

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
            <div>
              <p className={p.standfirst}>
                GWTH is a three-month course in using AI well at work. You are
                taught how to check what AI gives you, and how to spot when it
                has got something wrong. You start on your own work, and the
                projects get bigger every month. You keep what you make: a
                rewritten CV, a spreadsheet turned into a chart you can act on,
                an AI assistant of your own.
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

          {/* The one saturated thing on the page. No frame, no tint, 8px. */}
          <figure className={`${p.plate} ${styles.heroPlate}`} id="six-building-blocks">
            <Plate
              name="six-blocks"
              alt="Six square paper tiles in two rows of three, each carrying one cut-paper symbol: a magnifying glass, a fountain pen nib, a lightbulb, a stack of bricks, a bar chart and a cog. A hand is placing the sixth tile."
              priority
              sizes="(max-width: 1180px) 100vw, 1140px"
            />
            <figcaption className={styles.plateCaption}>
              {/* The page labels the tiles in the picture's own pattern,
                  three across at every width. Never collapse this grid: the
                  photograph does not reflow, so a two-column key would point
                  the names at nothing (image-text-rules). */}
              <span className={styles.plateKey} data-testid="six-blocks-key">
                {SIX_BLOCKS.map((block) => (
                  <span key={block.n} data-testid="six-blocks-key-cell">
                    <span className={styles.keyName}>{block.name}</span>
                    <span className={styles.keyClause}>{block.clause}</span>
                  </span>
                ))}
              </span>
              <span className={styles.plateLine}>
                Six ways of working, not six subjects. The three months take
                you through <em>every one of them</em>, on your own work.
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
                Places are invite-only while we finish the course with a small
                group of testers. Leave a name and an email and we will write to
                you when the next intake opens. No call, no demo, no sales
                conversation.
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
            project brings several of the six blocks together. Take the Family
            AI Bot in Month 1. To make it you research what your family
            actually needs. You write the instructions, then judge what the AI
            gives back. You check the tasks and dates it has pulled out of the
            recording. You decide how much of the job it should do without you.
            That is five of the six blocks below, used on one small tool:
            research, content, thinking, data and automation. Some projects are
            the working tool itself. Others are the plan or the test that has
            to come before anyone else uses the tool.
          </p>
          <div className={p.cards3}>
            {SIX_BLOCKS.map((block) => (
              <article className={p.card} key={block.n} data-testid="block-card">
                <p className={p.cardKicker}>{block.n} · Block</p>
                <h3 className={p.cardTitle}>{block.name}</h3>
                <p className={p.cardBody}>{block.body}</p>
              </article>
            ))}
          </div>
          <p className={p.attribution}>
            The six blocks follow the{" "}
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
