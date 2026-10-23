import Link from "next/link"
import { MONTH_CONFIGS, TOTAL_MANDATORY_LESSONS } from "@/lib/config"
import styles from "./lessons-fde.module.css"
import { canPromoteLabs } from "@/lib/labs-cta"

/**
 * The core-lesson count for one month, read from config. Never type a count
 * into this page, and never print an optional count (launch readiness brief,
 * 2026-10-20; a-20260914-201426-ae7f0e).
 */
function coreLessons(month: number): number {
  return MONTH_CONFIGS.find((m) => m.month === month)?.mandatoryLessons ?? 0
}

/**
 * How-the-course-works entries. Plain rows with a title and a sentence: the
 * numbered "01 Format" labels beside them were filler and are gone
 * (paper-first-banned-patterns; launch readiness review, 2026-10-20).
 */
const FEATURES = [
  {
    // The lesson films are short intros, written as tasters, not step-by-step
    // walkthroughs (gwth-public-writing, "Lesson intro videos are a taster").
    // The old line promised "a video showing you exactly what to do, step by
    // step", which no lesson contains (launch readiness review, 2026-10-20).
    title: "A short film to start each lesson",
    description:
      "Every lesson opens with a short film about what you will do. The written lesson then takes you through it, one step at a time.",
  },
  {
    // The "Why one hour a day?" essay and its picture went on 2026-10-20: the
    // picture showed Bill Gates, Warren Buffett, Elon Musk and Oprah Winfrey as
    // if they endorsed GWTH, and the millionaire figures beside it had no
    // source (launch readiness review, blocker). What is left is the one plain
    // fact about why a lesson is about an hour.
    title: "About an hour a lesson",
    description:
      "Each lesson takes about an hour, so five lessons fit into a working week and you can use each new skill before you move on to the next.",
  },
  {
    // No optional TOTAL is printed anywhere on this page any more, for the
    // reason /for-teams already refuses to print one (a-20260914-201426-ae7f0e):
    // config says 30 optional, the canonical syllabus register says 44 over the
    // three live months, and Month 1's optional flags in that register are
    // visibly wrong. Bead gwth-launch-88z.32.35 owns the conflict. The
    // mandatory figure stays: config owns it and the dashboard enforces it.
    title: `${TOTAL_MANDATORY_LESSONS} core lessons`,
    // Recovered (C02): docs/marketing/landing-page-hero-copy.md, "What You'll
    // Build". The old line said "not toy exercises", which names the thing it
    // is not; this names the thing it is. The projects count that travelled
    // with it in the original is deliberately NOT recovered (ledger C30: no
    // register agrees on it).
    // The recovered C02 line was three fragments with two technical terms in
    // them ("transformer architecture", "large language models"); the latest
    // Sol writing check asked for the same idea in a plain sentence
    // (2026-10-20).
    description:
      "You build useful things that you can use and show to other people.",
  },
  {
    title: "Progress you can see",
    description:
      "You can see which lessons you have finished, which projects you have done, and how you did on the questions at the end of each lesson.",
  },
  {
    // "We cover every major AI platform" was a claim no syllabus row backs
    // (launch readiness review, 2026-10-20).
    title: "Not tied to one AI company",
    description:
      "The lessons teach skills that work across AI tools, not tricks for one product, so you can pick the right tool for each job.",
  },
]

/**
 * The three directions the optional lessons run in.
 *
 * David, 2026-09-17 (annotation a-20260917-145147-bfd191): *"We are missing a
 * section on optional lessons. This is really important as people will want to
 * do specific lessons and not others. For example, CIPD will want to do lessons
 * on HR and accountants will want to do lessons specifically for accounts and
 * maybe law. We want to show that you can go deep into one area, or you can do
 * optional lessons by industry."*
 *
 * ## What may be named here, and what may not. Read before editing the copy.
 *
 * The structure is safe: every month has core lessons and optional ones. The
 * per-month core counts are read from `MONTH_CONFIGS`, which follows the
 * syllabus database (re-counted 2026-10-20: 22, 20 and 21), so this page never
 * types a count of its own. The "BY PROFESSION" style small-capitals kickers
 * on these cards went on the same day (paper-first-components).
 *
 * The SUBJECTS named below are authored lessons, not titles from a plan:
 * `m2_l35` UK legal, `m2_l36` UK finance, `m2_l34` UK healthcare, `m3_l23`
 * public sector procurement, `m3_l24` financial services, `m3_l26` professional
 * services for consulting, legal and accountancy firms, `m3_l27` manufacturing
 * and supply chain. Each is a written lesson of twenty thousand characters or
 * more with its sources in it; `m3_l26` is the one that teaches accountancy,
 * against the ICAEW, ACCA and CIMA codes and the audit sign-off rule in
 * ISA (UK) 700, and `m2_l35` teaches UK legal practice against the SRA code and
 * the Ayinde judgment.
 *
 * **HR is deliberately absent.** David's example was CIPD wanting HR lessons.
 * On 2026-10-20 optional HR, marketing and sales lessons were added to the
 * syllabus, but the launch readiness brief says to leave the test that pins
 * this, so this page still does not name them. When this note was first
 * written there was no HR lesson: the only one in the whole register is
 * "AI for HR and Recruitment" in the retired `old_backlog` module. Writing HR
 * into this list would be inventing a lesson. The honest answer to his example
 * is the exclusive-lesson mechanic on /for-institutions, which is where a body
 * gets lessons written to its own subject, so the pointer at the end of this
 * section carries it rather than this list.
 *
 * **No count, anywhere.** See the comment on the Volume feature.
 */
const PATHS = [
  {
    title: "Go deeper in your own field",
    body: "These lessons take the same skills into the rules your own work already has to follow. The syllabus covers UK legal practice, finance, healthcare, manufacturing and supply chain, buying AI in the public sector, and professional services for consulting, legal and accountancy firms. A lesson written for solicitors works to what the regulator actually requires, and one written for accountants works to the codes their institute sets, rather than a general warning to be careful.",
  },
  {
    title: "Go further into building",
    body: "The optional building lessons give you more practice. You build tools that answer questions using your own documents and show where each answer came from. You also learn how to test and protect what you build, run AI on your own computer and get several AI assistants to work together on one job.",
  },
  {
    title: "Learn to lead the change",
    body: "Month 3 has optional lessons for the person who ends up responsible for AI at work: what a board needs to be told and how often, how AI is bought and its suppliers checked in the public sector, how an AI consulting practice is run, and what an organisation owes its people when the work itself changes.",
  },
] as const

/**
 * What the score is worked out from, as four plain lines beside the
 * explanation. Bible `gwth-score-inputs` (David, 2026-10-23): the score counts
 * finished lessons, the end-of-lesson questions AND the marks for each month's
 * major project ("people are not going to take this seriously if we don't
 * actually mark projects"). Project marking is not built yet (bead
 * gwth-launch-9289), so the section is in the future tense and states no
 * weighting and no marker.
 * David, 2026-09-14 (a-20260914-204708-9f6b63): *"We haven't
 * talked at all about dynamic scoring or the certificate that you can display
 * on LinkedIn. These are real selling points. So I want to make it front and
 * center"*. The note says "about page"; the annotation was captured on
 * /lessons, and this is the page that owes a learner the full explanation.
 *
 * ## What is implemented, and what this copy may therefore claim
 *
 * `calculateGwthScore()` in `lib/progress/gwth-score.ts` is real: mandatory
 * lessons completed times `POINTS_PER_LESSON`, multiplied by the average best
 * quiz mark, against a denominator taken from the learner's own edition
 * (`lib/data/editions.ts`). Quizzes are graded on the server with the answer key
 * never sent to the browser. Those three facts are what the list below states.
 *
 * Everything else is unbuilt and is written here in the future tense, on the
 * page, in body copy: there is no stored score history anywhere in the product
 * (`scoreHistory` is returned empty unconditionally), no decay
 * (`SCORE_DECAY_DAYS` is read by nothing), nothing has ever written a row to
 * `credential_verifications`, so no real learner has a verification page yet,
 * and the whole feature sits behind `GWTH_SCORE_ENABLED`, which is set in no
 * environment. Copy ledger C35 bans naming the four sub-metrics; the /for-teams
 * suite bans "currentness" and "score decays". Do not restore any of them here.
 *
 * LinkedIn is named once, as a place a learner might put a link, because David
 * asked for it in those words. It is not an integration and must never be
 * written as one: the "Add to LinkedIn" control in the product is disabled.
 */
const SCORE_INPUTS = [
  {
    title: "The lessons you have finished",
    body: "Only the ones on your own syllabus count, not every lesson that exists.",
  },
  {
    title: "The questions at the end of each one",
    body: "Your answers are marked automatically, so you can see what to go back over.",
  },
  {
    title: "Your monthly projects",
    body: "Each month you build a major project. It will be marked, and the mark will count toward your score.",
  },
  {
    title: "Nothing else",
    body: "Not time spent, not lessons opened, and nothing you say about yourself.",
  },
] as const

/** Props for {@link LessonsFde}. */
interface LessonsFdeProps {
  /**
   * True once GWTH is on sale (`isSelling()` in `lib/launch.ts`, read by the
   * server page). Only the buttons branch on it: the page copy is written to
   * be true on both sides of 1 December (launch readiness brief, rule 2).
   */
  selling?: boolean
}

/**
 * The course page, in the PAPER-FIRST register: a two-column quiet masthead with
 * a Bitter headline, rounded month cards on the card surface (no coloured card
 * tops; the quiet header strip went on 2026-10-20), a how-it-works list, and a
 * closing band. The shared tokens give light/dark parity.
 *
 * ## Copy sources (bead gwth-launch-88z.32.26, 2026-09-14)
 *
 * Four lines here are RECOVERED from the pre-paper-first archive, because
 * David asked for the wording he had already spent hours refining rather than
 * new wording. Only the words come across; the FDE and Civic Press layouts
 * that carried them are history. Each is marked at the place it applies, with
 * its ledger id:
 *
 * - C01 the standfirst, from `docs/marketing/why-ai-skills-matter-now.md`
 * - C02 the "Volume" feature, from `docs/marketing/landing-page-hero-copy.md`
 * - C03 "around the day job", from the orphaned `PRODUCT_PILLARS` in
 *   `components/marketing/data.ts`
 * - C04 the closing line, from `docs/marketing/landing-page-hero-copy.md`
 *
 * C01, C02 and C04 were reworded on 2026-10-20 at the latest Sol writing
 * check; each keeps its idea, and the evergreen suite says why at each test.
 *
 * ## Launch readiness (2026-10-20, bead gwth-launch-ajqs.2)
 *
 * Every count comes from `MONTH_CONFIGS`; no optional count is printed. The
 * beta wording is gone, replaced by what is true from the GO LIVE release:
 * Month 1 is complete, Month 2 opens around 1 January 2027 and Month 3 around
 * 1 February 2027, and a student who reaches a month before it opens has their
 * time paused. Both "Join waitlist" buttons now follow `selling`.
 */
export function LessonsFde({ selling = false }: LessonsFdeProps = {}) {
  // The one self-service step, the same rule as the header button
  // (`primaryCta()` in public-nav): the prices once sales are open, the
  // waitlist before.
  const primary = selling
    ? { href: "/pricing", label: "Join the course" }
    : { href: "/waitlist", label: "Join the waitlist" }
  const labsOpen = canPromoteLabs()

  return (
    <div className={styles.shell}>
      <section className={styles.masthead} data-section="masthead">
        <div className={styles.page}>
          <h1 className={styles.mastheadTitle}>
            Build useful things <em>with AI.</em>
          </h1>
          <p className={styles.standfirst}>
            {TOTAL_MANDATORY_LESSONS} core lessons across three months, and a
            further set of optional lessons for going deeper. You learn to use
            AI through practical tasks from your own work and everyday life.
          </p>
          <div className={styles.mastheadActions}>
            <Link
              href={primary.href}
              className={styles.buttonSolid}
              data-testid="lessons-primary-cta"
            >
              {primary.label}
            </Link>
            {labsOpen ? (
              <Link href="/labs" className={styles.buttonOutline}>
                Try a free lab
              </Link>
            ) : selling ? null : (
              <Link href="/pricing" className={styles.buttonOutline}>
                See pricing
              </Link>
            )}
          </div>
          <div className={styles.mastheadFoot}>
            <p>3 months, 5 hours a week, around the day job</p>
            <p>A short film in every lesson</p>
            <p>One main project each month</p>
            <p>Plain progress tracking</p>
          </div>
        </div>
      </section>

      <section className={styles.section} data-section="months">
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              Three months. <em>Three levels.</em>
            </h2>
            <p className={styles.mono}>
              {TOTAL_MANDATORY_LESSONS} core lessons, plus optional lessons
            </p>
          </div>
          <div className={styles.monthsRow}>
            {MONTH_CONFIGS.map((month) => (
              <article
                key={month.month}
                className={styles.monthCard}
                data-testid="month-card"
              >
                {/* The month and its count are a metadata line on the card
                    surface, separated by a hairline. The tinted strip that
                    carried them was a coloured card top
                    (paper-first-components). */}
                <div className={styles.monthBody}>
                  <p className={styles.monthMeta}>
                    Month {month.month}, {month.mandatoryLessons} core lessons
                    {month.optionalLessons > 0 ? ", plus optional lessons" : ""}
                  </p>
                  <h3>{month.title}</h3>
                  <p className={styles.monthSub}>{month.subtitle}</p>
                  <p className={styles.monthDesc}>{month.description}</p>
                  <div className={styles.capstone}>
                    <p>The month&apos;s main project</p>
                    <strong>{month.capstoneName}</strong>
                    <em>{month.capstoneDescription}</em>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {/* When each month opens, as it is true from the GO LIVE release
              (facts sheet, launch readiness 2026-10-20). Written so it stays
              true on both sides of 1 December. */}
          <p className={styles.optionalNote} data-testid="months-availability">
            Month 1 is open from 1 December 2026. Month 2 opens around 1 January 2027 and Month
            3 around 1 February 2027. If you reach a month before it opens,
            your time on the course is paused until it does.
          </p>
        </div>
      </section>

      {/*
        The optional lessons (David, 2026-09-17, a-20260917-145147-bfd191). It
        sits directly under the three month cards because it is the thing those
        cards leave unanswered: they show the course getting harder, and this
        shows that it also opens out. What may be named here is on the PATHS
        comment above.
      */}
      <section
        className={`${styles.section} ${styles.sectionAlt}`}
        data-section="optional"
      >
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              Everyone does the core. <em>The rest is where you go deeper.</em>
            </h2>
          </div>
          {/* "Month 1 is the same for everybody" and "Months 2 and 3 each open
              with twenty core lessons" were both wrong once the syllabus was
              re-counted (Month 1 has optional lessons; Month 3 has 21 core).
              The counts are now read from config. */}
          <p className={styles.sectionLead} data-testid="optional-lead">
            Every month has core lessons that everybody does:{" "}
            {coreLessons(1)} in Month 1, {coreLessons(2)} in Month 2 and{" "}
            {coreLessons(3)} in Month 3. Each month also has optional lessons,
            and that is where the course stops being the same for everybody.
            The optional lessons run in three directions: using AI in your own
            profession, building more advanced AI tools, and leading AI work in
            an organisation.
          </p>
          <div className={styles.pathsRow}>
            {PATHS.map((path) => (
              <article
                className={styles.pathCard}
                key={path.title}
                data-testid="path-card"
              >
                <h3>{path.title}</h3>
                <p>{path.body}</p>
              </article>
            ))}
          </div>
          {/* The boundary, in body copy rather than a footnote. There is no
              picker in the course: the importer marks every lesson core, so a
              learner cannot select an optional lesson however the syllabus is
              written. Said in the present tense, with no promise of when that
              changes (launch readiness brief, rule 3). */}
          <p className={styles.optionalNote} data-testid="optional-beta-note">
            Each month includes its core and optional lessons when that month opens.
          </p>
          {/* /for-teams is closed to visitors from the launch (it returns a
              404), so its link and the smaller-team sentence went with it.
              /for-institutions is unlisted but its link works. */}
          <div className={styles.optionalBuyers} data-testid="optional-buyers">
            <h3>Buying for an organisation?</h3>
            <p>
              Everyone on the standard course completes the same{" "}
              {TOTAL_MANDATORY_LESSONS} core lessons. A professional body, or a
              company or team of 100 or more learners, can commission an
              edition of its own. Every edition keeps the same core lessons.
              The institution chooses which optional lessons are open to its
              members and which they must complete, and it can have lessons
              written on subjects the standard course does not cover yet.
            </p>
            <div className={styles.mastheadActions}>
              <Link href="/for-institutions" className={styles.buttonOutline}>
                For institutions and large companies
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} data-section="how-it-works">
        <div className={styles.page}>
          <div className={styles.featuresGrid}>
            <div>
              <h2 className={styles.sectionTitle}>
                How the course <em>works.</em>
              </h2>
            </div>
            <ul className={styles.featureList}>
              {FEATURES.map((feature) => (
                <li key={feature.title} className={styles.featureItem}>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </li>
              ))}
            </ul>
          </div>
          {/* The UK thread on this page (bead gwth-launch-88z.32.25). Every
              code named here is one an authored lesson actually works to, and
              they are listed in the PATHS comment above with their lesson
              ids: `m2_l35` against the SRA code and the Ayinde judgment,
              `m3_l26` against the ICAEW, ACCA and CIMA codes and the audit
              sign-off rule in ISA (UK) 700. Do not add a profession here that
              has no written lesson behind it. */}
          <p className={styles.sectionLead} data-testid="lessons-uk-note">
            The specialist lessons use the UK rules and professional standards
            that apply to your work. The lesson on legal practice works to the
            Solicitors Regulation Authority code and to the Ayinde judgment, a
            court ruling about citing cases that an AI tool invented. The
            lesson on accountancy works to the codes of the three main UK
            accountancy bodies (ICAEW, ACCA and CIMA) and to the rule for
            signing off an audit, ISA (UK) 700. Lessons that handle personal
            information work to UK data protection law.
          </p>
        </div>
      </section>

      {/*
        The score and the record (David, 2026-09-14, a-20260914-204708-9f6b63).
        It follows how-it-works because it is the answer to "and what do I have
        at the end of it", which only lands once the reader knows what a lesson
        is. What may be claimed is on the SCORE_INPUTS comment above. The beta
        wording went on 2026-10-20; the score is still switched on in no
        environment, so the page says so in the present tense and makes no
        promise about the part that is not built (the trend over time).
      */}
      <section
        className={`${styles.section} ${styles.sectionAlt}`}
        data-section="score"
      >
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              Your score, and <em>how it will be worked out.</em>
            </h2>
          </div>
          <div className={styles.scoreGrid}>
            <div className={styles.scoreBody}>
              <p data-testid="score-beta-note">
                The course does not show a GWTH score yet. When it does, this is
                how it will be worked out.
              </p>
              <p data-testid="score-lead">
                Finishing a lesson is not the same as being able to do what it
                taught. So every lesson ends with a few questions, and each
                month you build a major project that will be marked. Your GWTH
                score will be worked out from the lessons you have finished, how
                you did on those questions and the marks for your monthly
                projects. It counts what you did, not how long you were signed
                in.
              </p>
              <p data-testid="score-denominator">
                The score is measured against the lessons you were given, so two
                scores mean the same thing only when they come from the same set
                of lessons. An institution that chooses which optional lessons
                its members must complete, and sets its own pass mark, is
                choosing what the number is measured against.
              </p>
              {/* The shareable record page (with the LinkedIn mention David
                  asked for on 2026-09-14) went on 2026-10-20: no credential
                  row has ever been written and the score is switched on in no
                  environment, so describing the page was a promise of a
                  feature that may not exist on 1 December (launch readiness
                  brief, rule 3; latest Sol writing check). Bring it back the
                  day the record page is live. */}
            </div>
            <div className={styles.scoreAside}>
              <h3>What the score is worked out from</h3>
              <ul className={styles.scoreInputs} data-testid="score-inputs">
                {SCORE_INPUTS.map((input) => (
                  <li key={input.title}>
                    <strong>{input.title}</strong>
                    <span>{input.body}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.closing} data-section="closing">
        <div className={styles.page}>
          <h2>
            Ready to start <em>building?</em>
          </h2>
          {/* C04 said "Three months from now you will have built things most
              people assume need a developer". The latest Sol writing check
              (2026-10-20) blocked "most people assume" as unsupported and the
              fixed three months as untrue for anyone who starts later or is
              paused, so the idea is kept in a sentence that is true. */}
          <p>
            Lesson by lesson, you build useful tools for your work and everyday
            life.
          </p>
          <div className={styles.closingActions}>
            <Link
              href={primary.href}
              className={styles.buttonSolid}
              data-testid="lessons-closing-cta"
            >
              {primary.label}
            </Link>
            {selling ? (
              labsOpen ? (
                <Link href="/labs" className={styles.buttonOutline}>
                  Try a free lab
                </Link>
              ) : null
            ) : (
              <Link href="/pricing" className={styles.buttonOutline}>
                See pricing
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
