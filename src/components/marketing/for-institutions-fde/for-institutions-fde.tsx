import Link from "next/link"
import { TOTAL_MANDATORY_LESSONS } from "@/lib/config"
import { CURRICULUM } from "@/components/marketing/data"
import { Plate } from "@/components/marketing/paper/plate"
import p from "@/components/marketing/paper/paper.module.css"
import styles from "./for-institutions-fde.module.css"

/**
 * /for-institutions in the paper-first register (N12, 2026-09-03). The
 * B2B2C proposition from the institution pivot plan (04 C1): a professional
 * body curates GWTH as its own edition. Evidence is the 02-web-research set
 * and every figure carries its source; nothing here is priced in public.
 *
 * Copy rules: British English, sentence case, no em or en dashes, GBP only.
 *
 * ## What this page leads with, and why (David's annotations, 2026-09-14)
 *
 * - **a-20260914-202954-1ef966**, on the masthead standfirst: "The main reason
 *   that CIPD was interested in GWTH was as a foundation for other courses
 *   that they offered ... students often attended courses where the
 *   prerequisite was that they already knew quite a lot of applied AI and then
 *   the tutors from CIPD had to get the whole class up to a certain level
 *   before they could continue with the course ... I think this is the main
 *   reason any institution will want to use GWTH ... We need to show that we
 *   can do this on this page. That's what this page is for."
 *
 *   So the prerequisite proposition now owns the masthead and the section
 *   directly under it, and the edition features are ordered pass mark, tutor
 *   baseline view, record first, because those are the three mechanics the
 *   proposition promises. Everything else on the page supports it rather than
 *   competing with it.
 *
 *   The meeting record supports the argument: Steve, 27 Jul, "how we baseline
 *   people before we come into those environments ... we're getting people
 *   coming in thinking they're better than they are or having different
 *   fundamental understandings to other people in the room, which then creates
 *   complexity for the person doing the training delivery" [25:20], and
 *   "something like what you've shown here could be a fantastic precursor"
 *   [25:59]; Lizzie, 20 Aug, "quite problematic, these people turning up with
 *   very different levels of understanding" [00:41:50 to 00:43:25] and the
 *   prerequisite flow, "it could be like a prerequisite. You have to do this,
 *   you have to get a certain score and then you can do the next course"
 *   [00:25:51 to 00:26:30]. Digest:
 *   GWTH-launch-plan/Institution - Fable Plan/01-cipd-meetings-digest.md.
 *
 *   **What that record does NOT support, and what this page therefore never
 *   says:** CIPD has not bought, approved, endorsed or selected GWTH. No
 *   endorsement is implied anywhere here, and CIPD is named only where a
 *   published third-party fact is being cited. Nor is a literal guarantee
 *   offered: the page promises a threshold the institution sets, grading
 *   against it, and a record a tutor can check, because that is what N6 and N7
 *   actually implement (src/app/org/learners, src/components/org/pass-mark-form,
 *   src/app/(public)/verify/[code]).
 *
 * - **a-20260915-085041-eaa513**, on the pricing claim: "We don't want to make
 *   this statement saying that active learners are priced rather than seats
 *   because that may not be the case, for example, with CIPD, they have
 *   150,000 members, but they only want to pay £150,000 per year." The page
 *   therefore names no pricing basis, unit, figure or range anywhere. The
 *   commercials section says what an agreement covers and how to get a
 *   proposal, and nothing about how the proposal is worked out. See the
 *   comment above that section.
 *
 * - **a-20260914-202509-f3143d**, on the old "CPD ready" heading: "I don't
 *   know what CPD means, so I don't think others will either." The abbreviation
 *   is now expanded on first use in the body it appears in, and the feature is
 *   titled by its benefit rather than by the acronym.
 */

export const EVIDENCE = [
  {
    // The board brief calls this "CIPD's 67/33 stat" and the research file
    // cites a cipd.org news page. That page does not carry the figures; the
    // survey that does is CIPD Ireland's HR Practices study with the University
    // of Limerick (330 HR professionals, published May 2026). The page links the
    // survey report itself and quotes its figures.
    kicker: "Figure 01",
    value: "67% and one third",
    body: "67% of HR professionals name AI for HR as their top development priority. Only one third of organisations have given their staff AI training.",
    source: "CIPD Ireland with the University of Limerick, HR Practices in Ireland 2025 to 2026",
    href: "https://www.cipd.org/ie/knowledge/reports/hr-practices-ireland-survey/",
  },
  {
    kicker: "Figure 02",
    value: "3.5 times",
    body: "The firms using AI most deeply, the ones OpenAI calls frontier firms, use three and a half times as much AI per worker as typical firms on OpenAI's measure of intelligence per worker, up from twice as much a year earlier. Only 36% of that gap is volume. The rest is deeper, more capable use.",
    source: "OpenAI, How frontier firms are pulling ahead (B2B Signals), May 2026",
    href: "https://openai.com/index/introducing-b2b-signals/",
  },
  {
    kicker: "Figure 03",
    value: "16%",
    body: "Only 16% of people using AI at work are what Microsoft calls frontier professionals, and its data ties twice as much of the difference to the organisation as to the individual.",
    source: "Microsoft Work Trend Index, 2026",
    href: "https://www.microsoft.com/en-us/worklab/work-trend-index/agents-human-agency-and-the-opportunity-for-every-organization",
  },
  {
    kicker: "Figure 04",
    value: "59 in 100",
    body: "Fifty-nine of every hundred workers need reskilling or upskilling by 2030, and eleven of them are unlikely to get it.",
    source: "World Economic Forum, Future of Jobs Report 2025",
    href: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
  },
] as const

/**
 * The prerequisite proposition, as the before and after an institution
 * recognises. Two panels rather than one paragraph, because this is the thing
 * a decision-maker has to take from the page, and each panel is labelled in
 * words as well as placed (bible tint-is-never-the-only-signal).
 */
export const BASELINE = [
  {
    kicker: "What happens now",
    title: "Your tutors teach the catch-up first",
    body: "People arrive on a specialist course having used AI for very different things, to very different depths, and confidence is a poor guide to capability. The tutor levels the room before the real subject can start, wasting the time of learners who were already ready to move beyond the basics.",
  },
  {
    kicker: "With GWTH in front of it",
    title: "Everyone arrives at the level you set",
    body: "GWTH is the shared applied AI foundation your learners complete first. You choose which lessons count and what score passes, quizzes are graded on our server, and your tutors will see who has met the baseline before the room starts. Your specialist teaching begins where it was written to begin.",
  },
] as const

const EDITION = [
  {
    title: "A pass mark you set",
    body: "You decide what counts as ready for your courses. Quizzes are graded on our server, with the answer key kept off the browser, against your pass mark, per edition.",
  },
  {
    title: "A tutor baseline view",
    body: "Before a room starts, your tutors will open one screen and see who has met the baseline and who has not, so an advanced course is taught at the level it says. The screen is built; it opens with your edition, after the beta.",
  },
  {
    // CORRECTED 2026-09-17 (bead gwth-launch-88z.32.36). This said "It decays
    // if they stop, so it says what they can do now". Decay is not implemented
    // anywhere in the product: SCORE_DECAY_DAYS is a config constant that no
    // runtime code reads, there is no stored score history, and nothing has
    // ever written a row to credential_verifications. The /for-teams suite
    // already forbids the same claim on that page. What the record really
    // carries is stated here instead, and the plan is stated as a plan in the
    // score section below.
    title: "A verified record",
    body: "After the beta, each member will get a record with its own web address, which they can link to and anyone can open: the lessons completed, the project from each, and the quiz results against your pass mark.",
  },
  {
    title: "Core, optional and exclusive tiers",
    body: "Every lesson sits in a tier. You choose the core your members must complete, the optional lessons they may pick, and the exclusive lessons only your edition carries.",
  },
  {
    title: "Exclusive lessons you ratify",
    body: "Draft lessons written to your titles wait in your admin screen until a tutor ratifies them. Nothing reaches a member unratified.",
  },
  {
    // a-20260914-202509-f3143d: was "CPD ready". Titled by the benefit now,
    // and the abbreviation is expanded the first time the page uses it.
    title: "Records your members can log",
    body: "A member's record is designed to be logged for continuing professional development, the CPD record your scheme asks members to keep each year. What each member completed, and how they did on the questions, is on one page they can copy from rather than reconstruct.",
  },
] as const

/**
 * The subject depth an institution chooses, and the depth only it has.
 *
 * David, 2026-09-17 (a-20260917-145147-bfd191): *"people will want to do
 * specific lessons and not others. For example, CIPD will want to do lessons on
 * HR and accountants will want to do lessons specifically for accounts and
 * maybe law. We want to show that you can go deep into one area, or you can do
 * optional lessons by industry. This should attract both individuals and
 * institutions and big companies or teams"*.
 *
 * The subjects named in DEPTH[0] are authored lessons on disk, not titles from
 * a plan: `m2_l34` UK healthcare, `m2_l35` UK legal, `m2_l36` UK finance,
 * `m3_l23` public sector procurement, `m3_l24` financial services, `m3_l26`
 * professional services for consulting, legal and accountancy firms, `m3_l27`
 * manufacturing and supply chain. `m3_l26` is the one that teaches accountancy,
 * against the ICAEW, ACCA and CIMA codes and the audit sign-off rule.
 *
 * DEPTH[1] is where David's HR example is answered, and it is answered
 * honestly: there is NO HR lesson in the course. The only HR title in the whole
 * syllabus register sits in the retired `old_backlog` module. A body for people
 * professionals would commission one, which is exactly what the exclusive tier
 * and the ratification queue are for (`src/app/org/syllabus`,
 * `src/app/org/ratification`, `edition_lessons.tier`). So HR appears here as an
 * example of a commission, never as something already on the shelf.
 *
 * CIPD is not named. Nothing on this page may imply that CIPD has bought,
 * approved, endorsed or selected GWTH, and an example written as "a body for
 * people professionals" carries his point without making that implication.
 */
export const DEPTH = [
  {
    kicker: "Choose from what exists",
    title: "The subjects the course already teaches",
    body: "Months 2 and 3 each open with twenty core lessons, and the lessons after those are optional. They include UK legal practice, finance, healthcare, manufacturing and supply chain, buying AI in the public sector, and professional services for consulting, legal and accountancy firms. Each is written against the rules that profession is held to rather than as a general introduction. You decide which of them belong in your edition and leave out the ones that do not.",
  },
  {
    kicker: "Commission what does not",
    title: "The subjects only your members get",
    body: "Where the course does not cover your field, you name the titles and we write them. A body for people professionals, for instance, would not find an HR lesson in the standard course; it would commission one. Drafts wait in your admin screen until one of your own tutors has read the lesson and ratified it, and an exclusive lesson stays behind your edition rather than joining the standard course.",
  },
] as const

/**
 * What the score is, for an institution, and the two things it does not do yet.
 *
 * Implemented and therefore stated plainly: `calculateGwthScore()` is mandatory
 * lessons completed times `POINTS_PER_LESSON`, multiplied by the average best
 * quiz mark, against a denominator taken from the edition
 * (`lib/data/editions.ts`); quizzes are graded server side; and
 * `src/app/org/learners` really shows staff who has met the baseline and their
 * average best quiz mark.
 *
 * NOT implemented, and therefore written as a plan on the page rather than
 * omitted: there is no stored score history of any kind (`scoreHistory` is
 * returned empty unconditionally and no migration creates a history table), and
 * there is no decay (`SCORE_DECAY_DAYS` is read by no runtime code). The whole
 * feature also sits behind `GWTH_SCORE_ENABLED`, which is set in no
 * environment, which is why the last line says no score is switched on during
 * the beta. Copy ledger C35 bans naming the four sub-metrics; do not add them.
 */
const SCORE_NOT_YET = [
  {
    title: "Which way a member is going",
    body: "The score does not yet show movement over time, because nothing keeps a history of it. That is the next piece of work.",
  },
  {
    title: "Whether it has gone out of date",
    body: "When a lesson is rewritten because the tools moved on, a member who passed the old one still counts as having passed. We are building the part that asks them to complete it again.",
  },
] as const

const STEPS = [
  {
    n: "01",
    title: "Pilot with your own staff",
    body: "Run the standard course with a small internal group first. It is the fastest way to see what your members would see, and the pilot shapes your edition.",
  },
  {
    n: "02",
    title: "Curate your edition",
    body: "Pick the core and optional lessons, name the exclusive titles you want written, set the pass mark that makes a learner ready for your own courses, and put your name on it.",
  },
  {
    n: "03",
    title: "Put it in front of your courses",
    body: "Members join under your edition. Tutors will check the baseline before each specialist course, members will keep a record they can show, and the foundation keeps changing as the tools do.",
  },
] as const

const PATTERN = [
  {
    title: "CMI with TechSkills",
    body: "The Chartered Management Institute built its Leadership for AI qualifications with a skills partner rather than alone.",
    href: "https://www.managers.org.uk/education-and-learning/qualifications/leadership-for-ai-qualifications/",
  },
  {
    title: "ACCA-X on edX",
    body: "ACCA runs its own online courses on a platform it does not own. The institute keeps the brand and the syllabus; the platform delivers.",
    href: "https://www.acca-x.com/global/en.html",
  },
  {
    // CIPD is named here as a cited fact about how a professional body has its
    // own qualifications delivered, in a list beside CMI and ACCA. It is not an
    // endorsement claim and must never be written as one: CIPD has not bought,
    // approved or selected GWTH.
    title: "Approved study centres",
    body: "CIPD's own qualifications are delivered through a network of approved study centres, not by CIPD itself.",
    href: "https://findacentre.cipd.org/",
  },
] as const

const FAQS = [
  {
    q: "Can we require it before our own courses?",
    a: "Yes. You choose the lessons that count and the pass mark, and your tutors will see who has met the baseline before the room starts. The record each member will carry, and the page anyone can open to check it, are the evidence that they did.",
  },
  {
    // Refined 2026-09-17 (a-20260917-145147-bfd191). The page now says members
    // can go deep in their own field, so this answer has to draw the line the
    // subject lessons actually sit on: they teach AI use INSIDE a profession's
    // rules, not the profession. m2_l35 teaches a solicitor how to use AI
    // without breaching the SRA code; it does not teach law.
    q: "Does it teach our profession?",
    a: "No, and it is not meant to. The subject lessons teach people how to use AI inside the rules their profession already works to, which is not the same as teaching the profession. Your courses keep the professional depth, and start at the level they were written for.",
  },
  {
    q: "Can our members skip the parts that are not for them?",
    a: "That is what the tiers are for. The core is what everybody in your edition completes, and the optional lessons are the ones you open to them, so a member spends the time on the work they actually do rather than on a subject they will never touch.",
  },
  {
    q: "Is it tied to one AI vendor?",
    a: "No. GWTH is independent: no sponsors, no vendor partnerships, and lessons compare tools rather than sell one.",
  },
  {
    q: "Who grades the quizzes?",
    a: "Our server does, with the answer key never sent to the browser, against the pass mark you set for your edition.",
  },
  {
    q: "What does a member's record show?",
    a: "After the beta, it will show the lessons completed, the project from each, and the quiz results against your pass mark, on a page anyone the member sends the link to can open. Showing when a lesson was last refreshed comes with the update tracking we are still building.",
  },
  {
    q: "How much of the content is yours?",
    a: "As much as you want. The standard course is the foundation. Exclusive lessons written to your titles are yours and stay behind your edition.",
  },
  {
    q: "How quickly can we start?",
    a: "A staff pilot can start on the standard course within days. An edition takes as long as your curation does.",
  },
] as const

const LAW = {
  euAiAct: "https://artificialintelligenceact.eu/article/4/",
  ukSkills:
    "https://www.gov.uk/government/news/free-ai-training-for-all-as-government-and-industry-programme-expands-to-provide-10-million-workers-with-key-ai-skills-by-2030",
}

export function ForInstitutionsFde() {
  return (
    <div className={p.shell}>
      <section className={styles.masthead} data-section="masthead">
        <div className={p.page}>
          <div className={styles.mastheadGrid}>
            <h1 className={styles.mastheadTitle}>
              Start your specialist courses{" "}
              <em>at the level they were written for</em>.
            </h1>
            <div>
              <p className={p.standfirst}>
                Learners arrive at a professional course with very different
                applied AI understanding, so tutors spend the first hours
                levelling the room instead of teaching the subject. GWTH is the
                three-month applied AI foundation that runs before it. You
                choose the lessons and set the pass mark, and your tutors
                will see verified evidence that a learner met it before the
                course begins. The course is in beta now, and editions open to
                institutions as that beta ends.
              </p>
              <div className={p.actions}>
                <Link href="/contact" className={p.buttonSolid}>
                  Book a walkthrough
                </Link>
                <Link href="/lessons" className={p.buttonOutline}>
                  See the course
                </Link>
              </div>
            </div>
          </div>
          <figure className={`${p.plate} ${styles.mastheadPlate}`}>
            <Plate
              name="the-gap-arrow"
              alt="Two torn sheets of cream paper with a gap between them, and a hand placing a small jade paper arrow that points across the gap."
              priority
              sizes="(max-width: 1180px) 100vw, 1140px"
            />
          </figure>
          <div className={p.plateMeta}>
            <p>Three months · Five hours a week · Graded against your pass mark</p>
            <p>Independent. No sponsors. No vendor partnerships.</p>
          </div>
        </div>
      </section>

      <section className={p.section} data-section="baseline">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>
              Set the baseline once. <em>Teach the specialism after.</em>
            </h2>
            <p className={p.sectionMeta}>The prerequisite</p>
          </div>
          <div className={p.cards2}>
            {BASELINE.map((item) => (
              <article
                className={`${p.card} ${styles.baselineCard}`}
                key={item.title}
                data-testid="baseline-card"
              >
                <p className={p.cardKicker}>{item.kicker}</p>
                <h3 className={p.cardTitle}>{item.title}</h3>
                <p className={p.cardBody}>{item.body}</p>
              </article>
            ))}
          </div>
          <p className={`${p.lead} ${styles.leadAfter}`}>
            It is a precursor, not a replacement. Nothing here teaches your
            profession; GWTH teaches the applied AI foundation underneath it,
            and keeps that foundation current as the tools change. What will
            reach your tutor is evidence rather than an assurance: the lessons
            a member completed, the project from each, and the quiz results
            against the pass mark you chose, on a record anyone you send it to
            can verify.
          </p>
        </div>
      </section>

      <section className={p.section} data-section="evidence">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>The gap is depth, not access.</h2>
            <p className={p.sectionMeta}>Four figures, four sources</p>
          </div>
          <div className={p.cards4}>
            {EVIDENCE.map((item) => (
              <article className={p.card} key={item.kicker} data-testid="evidence-card">
                <p className={p.cardKicker}>{item.kicker}</p>
                <h3 className={p.cardValue}>{item.value}</h3>
                <p className={p.cardBody}>{item.body}</p>
                <p className={p.cardSource}>
                  <a href={item.href} rel="noopener noreferrer" target="_blank">
                    {item.source}
                  </a>
                </p>
              </article>
            ))}
          </div>
          <p className={`${p.lead} ${styles.leadAfter}`}>
            Two more things make a baseline hard to postpone.{" "}
            <a href={LAW.euAiAct} rel="noopener noreferrer" target="_blank">
              Article 4 of the EU AI Act
            </a>{" "}
            has, since February 2025, put a duty on providers and deployers of
            AI to support AI literacy among the staff who work with it. And
            the{" "}
            <a href={LAW.ukSkills} rel="noopener noreferrer" target="_blank">
              UK government&apos;s skills partnership, announced in January 2026,
            </a>{" "}
            aims to give ten million workers AI skills by 2030. Professional
            bodies could help their members meet both through training tied to
            the work those professions already do.
          </p>
        </div>
      </section>

      <section className={p.section} data-section="edition">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>Your edition</h2>
            <p className={p.sectionMeta}>What you control</p>
          </div>
          <div className={`${p.featureGrid} ${styles.featureGrid3}`}>
            {EDITION.map((item) => (
              <div className={p.feature} key={item.title} data-testid="edition-feature">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*
        The depth an institution chooses (David, 2026-09-17,
        a-20260917-145147-bfd191). It follows "Your edition", which lists the
        controls, because this is the one control a buyer cares about most: what
        their own members will actually study. What may be named is on the DEPTH
        comment above; HR is an example of a commission, never of stock.
      */}
      <section className={p.section} data-section="depth">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>
              Go deep in <em>the subjects your members work in</em>
            </h2>
            <p className={p.sectionMeta}>Optional and exclusive lessons</p>
          </div>
          <p className={p.lead}>
            The standard course has a fixed core of {TOTAL_MANDATORY_LESSONS}{" "}
            lessons that everyone on it completes. In your edition you choose
            which lessons make up that core instead, and every one of your
            members completes the same ones, because a baseline only works if
            everyone reached it the same way. What sits on top of it is yours.
            Your members can go deep in the field they actually work in instead
            of taking a general course and translating it afterwards.
          </p>
          <div className={p.cards2}>
            {DEPTH.map((item) => (
              <article className={p.card} key={item.title} data-testid="depth-card">
                <p className={p.cardKicker}>{item.kicker}</p>
                <h3 className={p.cardTitle}>{item.title}</h3>
                <p className={p.cardBody}>{item.body}</p>
              </article>
            ))}
          </div>
          {/* Honest about how this starts. The admin screens exist and are in
              review; an edition is not something a buyer self-serves today. */}
          <p className={`${p.lead} ${styles.leadAfter}`}>
            You do not set an edition up on your own in an afternoon. A pilot
            starts on the standard course, and we build your edition alongside
            it, which is also how you find out which optional lessons your
            members go to first.
          </p>
        </div>
      </section>

      {/*
        What the score tells a tutor (David, 2026-09-15, a-20260915-211845-237ea3
        on the home page, carried onto the page where an institution decides).
        The two things it cannot do yet are on the page in body copy, not in a
        footnote: see the SCORE_NOT_YET comment above for why each is listed.
      */}
      <section className={p.section} data-section="score">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>What the score tells a tutor</h2>
            <p className={p.sectionMeta}>The baseline</p>
          </div>
          <p className={p.lead} data-testid="institutions-score-lead">
            No score is switched on while the course is in beta. After it, each
            member will have a GWTH score, worked out from the lessons they
            have finished on the syllabus you chose and how they did on the
            questions at the end of each one. Those questions are already
            marked on our server, with the answer key never sent to the
            browser. Because the score is measured against the lessons you
            chose, the number will mean the same thing for every member of your
            edition, which is what makes it usable as a threshold.
          </p>
          <p className={`${p.lead} ${styles.leadAfter}`}>
            Your tutors will not have to read it as a number. Before a course
            starts they will open one screen and see who has met your pass mark
            and who has not.
          </p>
          <div className={p.cards2}>
            {SCORE_NOT_YET.map((item) => (
              <article
                className={p.card}
                key={item.title}
                data-testid="score-not-yet-card"
              >
                <p className={p.cardKicker}>Being built</p>
                <h3 className={p.cardTitle}>{item.title}</h3>
                <p className={p.cardBody}>{item.body}</p>
              </article>
            ))}
          </div>
          <p className={`${p.lead} ${styles.leadAfter}`}>
            Both matter more to you than to a single learner. A foundation in
            applied AI that was passed two years ago is not the same as one
            passed this term, and a body that puts its name on a baseline needs
            that baseline to keep meaning something.
          </p>
        </div>
      </section>

      <section className={p.section} data-section="steps">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>How it starts</h2>
            <p className={p.sectionMeta}>Three steps</p>
          </div>
          <div className={p.cards3}>
            {STEPS.map((step) => (
              <article className={p.card} key={step.n}>
                <p className={p.cardKicker}>{step.n} · Step</p>
                <h3 className={p.cardTitle}>{step.title}</h3>
                <p className={p.cardBody}>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={p.band} data-section="course">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>The foundation underneath</h2>
            <p className={p.sectionMeta}>Three months</p>
          </div>
          <p className={p.lead}>
            Every lesson ends in a project a member can open and show, and the
            six building blocks run through all three months. Month 1 stays
            close to a person&apos;s own work and life on purpose. It is what
            carries people through the first weeks.
          </p>
          <div className={`${p.cards3} ${styles.months}`}>
            {CURRICULUM.map((month) => (
              <article className={p.card} key={month.m}>
                <p className={p.cardKicker}>{month.m}</p>
                <h3 className={p.cardTitle}>{month.t}</h3>
                <p className={p.cardBody}>{month.d}</p>
                <p className={p.cardSource}>
                  {month.capstone}: {month.capstoneSub}
                </p>
              </article>
            ))}
          </div>
          <div className={p.actions}>
            <Link href="/lessons" className={p.buttonOutline}>
              See every lesson
            </Link>
          </div>
        </div>
      </section>

      <section className={p.section} data-section="pattern">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>Institutes already buy this in</h2>
            <p className={p.sectionMeta}>The pattern</p>
          </div>
          <div className={p.cards3}>
            {PATTERN.map((item) => (
              <article className={p.card} key={item.title}>
                <h3 className={p.cardTitle}>{item.title}</h3>
                <p className={p.cardBody}>{item.body}</p>
                <p className={p.cardSource}>
                  <a href={item.href} rel="noopener noreferrer" target="_blank">
                    Source
                  </a>
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/*
        Commercials, with no pricing basis claimed (David, 2026-09-15,
        a-20260915-085041-eaa513): *"We don't want to make this statement saying
        that active learners are priced rather than seats because that may not
        be the case, for example, with CIPD, they have 150,000 members, but they
        only want to pay £150,000 per year"*. The claim was struck from Home
        under gwth-launch-88z.32.31 and is struck here for the same reason.

        Nothing has been invented in its place: no basis, no unit, no figure and
        no range. The section now says only what an agreement covers, that there
        is no public institution price, and how to get a proposal. The vendor
        independence line that used to sit here was a duplicate of the "Is it
        tied to one AI vendor?" answer in FAQS and has gone with it. When a deal
        shape is settled, the basis belongs here and nowhere else on the page.
      */}
      <section className={p.section} data-section="commercials">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>One agreement covers the edition</h2>
            <p className={p.sectionMeta}>Commercials</p>
          </div>
          <p className={p.lead} data-testid="institutions-commercials-lead">
            One agreement covers your edition, the admin screen, the tutor views
            and the records your members carry. There is no published price for
            an institution edition, because what we build is shaped by your
            curation and by how you want a pilot to start. Tell us what you want
            it to cover and we will put a proposal in front of you.
          </p>
        </div>
      </section>

      <section className={p.section} data-section="faq">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>Worth asking first</h2>
            <p className={p.sectionMeta}>Common questions</p>
          </div>
          <div className={p.faqList}>
            {FAQS.map((item, index) => (
              <details className={p.faqItem} key={item.q} open={index === 0}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={p.closing} data-section="closing">
        <div className={p.page}>
          <h2 className={p.sectionTitle}>
            See it with <em>your titles</em> on it.
          </h2>
          <p className={p.standfirst}>
            A walkthrough takes forty minutes: the member journey, the admin
            screen where you set the pass mark, the tutor view of the baseline,
            and the record. Bring the courses you wish people arrived ready
            for.
          </p>
          <div className={p.actions}>
            <Link href="/contact" className={p.buttonSolid}>
              Book a walkthrough
            </Link>
            <Link href="/for-teams" className={p.buttonOutline}>
              Buying for a company team instead?
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
