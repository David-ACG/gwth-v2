import Link from "next/link"
import Image from "next/image"
import { MONTH_CONFIGS, TOTAL_MANDATORY_LESSONS } from "@/lib/config"
import styles from "./lessons-fde.module.css"
import { canPromoteLabs } from "@/lib/labs-cta"

/**
 * Colour-block card headers keyed by course month, mirroring the
 * difficulty colours on the labs page: teal for Month 1 (beginner),
 * moss for Month 2 (intermediate), rust for Month 3 (advanced).
 */
const MONTH_FLAVOURS: Record<number, string> = {
  1: styles.flvTeal ?? "",
  2: styles.flvMoss ?? "",
  3: styles.flvRust ?? "",
}

/** How-the-course-works entries for the numbered journal list. */
const FEATURES = [
  {
    label: "Format",
    title: "Video walkthroughs",
    description:
      "Every lesson includes a video showing you exactly what to do, step by step.",
  },
  {
    label: "Volume",
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
    description:
      "Not quizzes about transformer architecture. Not slide decks about large language models. Real things you build, use and show to people.",
  },
  {
    label: "Proof",
    title: "Progress you can see",
    description:
      "You can see which lessons you have finished, which projects you have done, and how you did on the questions at the end of each lesson.",
  },
  {
    label: "Approach",
    title: "Vendor-neutral",
    description:
      "Learn principles, not products. We cover every major AI platform so you can pick the right tool for the job.",
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
 * The structure is safe: THREE independent registers agree that Months 2 and 3
 * each run twenty core lessons and then a set of optional ones. `MONTH_CONFIGS`
 * says 20 mandatory for each; the canonical syllabus register
 * (`/home/david/gwth-dashboard/gwth_pipeline.db`, modules month2 and month3)
 * marks exactly the first twenty of each month mandatory; and the authored
 * lessons on disk run `m2_l01..l20` and `m3_l01..l20` before the optional
 * remainder.
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
 * **HR is deliberately absent.** David's example was CIPD wanting HR lessons,
 * and there is no HR lesson: the only one in the whole register is
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
    kicker: "By profession",
    title: "Go deeper in your own field",
    body: "These lessons take the same skills into the rules your own work already has to follow. The syllabus covers UK legal practice, finance, healthcare, manufacturing and supply chain, buying AI in the public sector, and professional services for consulting, legal and accountancy firms. A lesson written for solicitors works to what the regulator actually requires, and one written for accountants works to the codes their institute sets, rather than a general warning to be careful.",
  },
  {
    kicker: "By depth",
    title: "Go further into building",
    body: "If building is the part you want, the optional lessons carry on where the core stops. There is retrieval that answers from your own documents and shows where each answer came from, testing and evaluating what you have made, security, running models on your own machine instead of sending data out, and several AI assistants working together on one job.",
  },
  {
    kicker: "By role",
    title: "Learn to lead the change",
    body: "Month 3 has optional lessons for the person who ends up responsible for AI at work: what a board needs to be told and how often, how AI is bought and its suppliers checked in the public sector, how an AI consulting practice is run, and what an organisation owes its people when the work itself changes.",
  },
] as const

/**
 * What the score is worked out from, as three plain lines beside the
 * explanation. David, 2026-09-14 (a-20260914-204708-9f6b63): *"We haven't
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
    body: "They are marked on our server, with the answer key never sent to your browser.",
  },
  {
    title: "Nothing else",
    body: "Not time spent, not lessons opened, and nothing you say about yourself.",
  },
] as const

/**
 * The course page, in the PAPER-FIRST register: a two-column quiet masthead with
 * a Bitter headline, rounded month cards with a quiet header strip (the
 * teal/moss/rust rotation is retired), a numbered how-it-works list, the
 * 5-Hour Rule essay and a closing band. The shared tokens give light/dark
 * parity.
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
 * No lesson or project COUNT was recovered. The archive says 94 projects split
 * 24/35/35; this config computes 66 mandatory and 30 optional, /about prints
 * 64 and 30, and /why-gwth prints 94. Until one register owns the split, the
 * only numbers on this page are the two read from config. Full reasoning and
 * every rejected line: `GWTH-launch-plan/completion/evergreen-copy-recovery/`.
 */
export function LessonsFde() {
  return (
    <div className={styles.shell}>
      <section className={styles.masthead} data-section="masthead">
        <div className={styles.page}>
          <h1 className={styles.mastheadTitle}>
            Real projects, <em>not toy exercises.</em>
          </h1>
          <p className={styles.standfirst}>
            {TOTAL_MANDATORY_LESSONS} core lessons across three months, and a
            further set of optional lessons for going deeper. We do not teach
            you what AI is. We teach you what AI does, using your own work as an
            example.
          </p>
          <div className={styles.mastheadActions}>
            <Link href="/waitlist" className={styles.buttonSolid}>
              Join waitlist
            </Link>
            {canPromoteLabs() ? (
              <Link href="/labs" className={styles.buttonOutline}>
                Try a free lab
              </Link>
            ) : (
              <Link href="/pricing" className={styles.buttonOutline}>
                See pricing
              </Link>
            )}
          </div>
          <div className={styles.mastheadFoot}>
            <p>3 months · 5 hours a week, around the day job</p>
            <p>Video in every lesson</p>
            <p>One Capstone project per month</p>
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
                <div
                  className={`${styles.cardTop} ${MONTH_FLAVOURS[month.month]}`}
                >
                  <span>Month {String(month.month).padStart(2, "0")}</span>
                  <span>
                    {month.optionalLessons > 0
                      ? `${month.mandatoryLessons} core, plus optional`
                      : `${month.mandatoryLessons} core lessons`}
                  </span>
                </div>
                <div className={styles.monthBody}>
                  <h3>{month.title}</h3>
                  <p className={styles.monthSub}>{month.subtitle}</p>
                  <p>{month.description}</p>
                  <div className={styles.capstone}>
                    <p>Capstone project</p>
                    <strong>{month.capstoneName}</strong>
                    <em>{month.capstoneDescription}</em>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/*
        The optional lessons (David, 2026-09-17, a-20260917-145147-bfd191). It
        sits directly under the three month cards because it is the thing those
        cards leave unanswered: they show the course getting harder, and this
        shows that after Month 1 it also opens out. What may be named here is on
        the PATHS comment above.
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
          <p className={styles.sectionLead} data-testid="optional-lead">
            Month 1 is the same for everybody, because everybody needs the same
            start. Months 2 and 3 each open with twenty core lessons, and the
            lessons after those are optional. That is where the course stops
            being the same for everybody. The optional lessons run in three
            directions: using AI in your own profession, building more advanced
            AI tools, and leading AI work in an organisation.
          </p>
          <div className={styles.pathsRow}>
            {PATHS.map((path) => (
              <article
                className={styles.pathCard}
                key={path.title}
                data-testid="path-card"
              >
                <p className={styles.pathKicker}>{path.kicker}</p>
                <h3>{path.title}</h3>
                <p>{path.body}</p>
              </article>
            ))}
          </div>
          {/* The boundary, in body copy rather than a footnote. Month 1 is what
              the product database actually holds today; Months 2 and 3 are
              authored on disk and being prepared. And there is no picker in the
              course yet: the importer marks every lesson core, so a learner
              cannot select an optional lesson however the syllabus is written.
              Saying so is the only honest way to publish this section. */}
          <p className={styles.optionalNote} data-testid="optional-beta-note">
            Month 1 is what the beta group is working through now, and Months 2
            and 3 are written and being prepared for release. While the course
            is in beta you are given the whole set rather than picking from it.
            Choosing your own path through the optional lessons is the part we
            are building next.
          </p>
          <div className={styles.optionalBuyers} data-testid="optional-buyers">
            <h3>Buying for an organisation?</h3>
            <p>
              Everyone on the standard course completes the same{" "}
              {TOTAL_MANDATORY_LESSONS} core lessons. A professional body, or a
              company or team of 100 or more learners, can commission an
              edition of its own instead: it chooses which lessons make up the
              core its members must complete, which optional lessons are open
              to them, and it can have lessons written on subjects the standard
              course does not cover yet. A smaller team takes the standard
              core, and its admin recommends the optional lessons that suit
              each role.
            </p>
            <div className={styles.mastheadActions}>
              <Link href="/for-institutions" className={styles.buttonOutline}>
                For institutions and large companies
              </Link>
              <Link href="/for-teams" className={styles.buttonOutline}>
                For teams of five or more
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
                Built for <em>practical proof.</em>
              </h2>
            </div>
            <ol className={styles.featureList}>
              {FEATURES.map((feature, i) => (
                <li key={feature.title} className={styles.featureItem}>
                  <div className={styles.featureIndex}>
                    <p>{String(i + 1).padStart(2, "0")}</p>
                    <p>{feature.label}</p>
                  </div>
                  <div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          {/* The UK thread on this page (bead gwth-launch-88z.32.25). Every
              code named here is one an authored lesson actually works to, and
              they are listed in the PATHS comment above with their lesson
              ids: `m2_l35` against the SRA code and the Ayinde judgment,
              `m3_l26` against the ICAEW, ACCA and CIMA codes and the audit
              sign-off rule in ISA (UK) 700. Do not add a profession here that
              has no written lesson behind it. */}
          <p className={styles.sectionLead} data-testid="lessons-uk-note">
            The rules in the lessons are the ones that bind you. The lesson on
            legal practice works to the Solicitors Regulation Authority code
            and to the Ayinde judgment on citing cases a model invented. The
            lesson on accountancy works to the ICAEW, ACCA and CIMA codes and
            to the audit sign-off rule in ISA (UK) 700. Where a lesson handles
            personal data it works to UK data protection law. You are never
            asked to translate an American example into your own practice and
            hope the answer survives the trip.
          </p>
        </div>
      </section>

      {/*
        The score and the record (David, 2026-09-14, a-20260914-204708-9f6b63).
        It follows how-it-works because it is the answer to "and what do I have
        at the end of it", which only lands once the reader knows what a lesson
        is. The home page carries the three trajectory cards; this page carries
        the fuller explanation, so the two do not repeat each other. What may be
        claimed is on the SCORE_INPUTS comment above.
      */}
      <section
        className={`${styles.section} ${styles.sectionAlt}`}
        data-section="score"
      >
        <div className={styles.page}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              Your score, and <em>what you can show for it.</em>
            </h2>
          </div>
          <div className={styles.scoreGrid}>
            <div className={styles.scoreBody}>
              <p data-testid="score-lead">
                Finishing a lesson is not the same as being able to do what it
                taught, so every lesson ends with a few questions. Your GWTH
                score is worked out from the lessons you have finished and how
                you did on those questions. It counts what you did, not how long
                you were signed in.
              </p>
              <p data-testid="score-denominator">
                The score is measured against the lessons you were given, so two
                scores mean the same thing only when they come from the same set
                of lessons. An institution that chooses its own core and sets
                its own pass mark is choosing what the number is measured
                against.
              </p>
              {/* Future tense throughout, and it says why: nothing has ever
                  written a credential row, so no learner has a verification
                  page yet. LinkedIn is a place to put a link, not an
                  integration. */}
              <p data-testid="score-record">
                After the beta, your score will come with a page of its own, at
                its own web address: the lessons you completed, the project from
                each, and how you did on the questions. Anyone you send the link
                to can open it and check it, and you can put that link on a CV
                or a professional profile such as LinkedIn.
              </p>
              <p data-testid="score-beta-note">
                No score is switched on while the course is in beta. We are
                also still building the part that shows which way a score is
                going, so a lesson you passed before the tools changed can be
                brought up to date rather than counting for ever.
              </p>
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

      <section className={styles.section} data-section="five-hour-rule">
        <div className={styles.page}>
          <div className={styles.essay}>
            <div className={styles.essayImage}>
              <Image
                src="/five-hour-rule.png"
                alt="The 5-Hour Rule: Bill Gates, Warren Buffett, Elon Musk, and Oprah Winfrey all dedicate at least an hour a day to deliberate learning"
                width={900}
                height={450}
              />
            </div>
            <h2>
              Why <em>one hour a day?</em>
            </h2>
            <div className={styles.essayBody}>
              <p>
                GWTH.ai is built around the 5-Hour Rule: the principle, coined
                by Michael Simmons, that no matter how busy successful people
                are, they always set aside at least an hour a day for
                deliberate learning. Bill Gates, Warren Buffett, Elon Musk,
                and Oprah Winfrey all follow this approach. Simmons traces the
                idea back to Benjamin Franklin, who consistently invested an
                hour a day in reading, writing, and tracking his goals.
                Entrepreneur Thomas Corley&apos;s five-year study of 233
                millionaires confirmed that 88% dedicate at least 30 minutes
                daily to self-education, not for fun, but to sharpen their
                edge. The research is clear: sustained daily learning beats
                occasional cramming every time.
              </p>
              <p>
                GWTH.ai lessons are designed to fit this rhythm. Each one
                delivers focused, practical AI skills in roughly an hour, five
                hours across your working week, so you build real capability
                without disrupting your life. Read, reflect, then apply what
                you&apos;ve learned through hands-on projects. Spreading five
                hours of practical lessons across the working week is what lets
                you learn and apply one skill at a time.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.closing} data-section="closing">
        <div className={styles.page}>
          <h2>
            Ready to start <em>building?</em>
          </h2>
          <p>
            Three months from now you will have built things most people assume
            need a developer. Join the waitlist and we will write to you when
            places open.
          </p>
          <div className={styles.closingActions}>
            <Link href="/waitlist" className={styles.buttonSolid}>
              Join waitlist
            </Link>
            <Link href="/pricing" className={styles.buttonOutline}>
              View pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
