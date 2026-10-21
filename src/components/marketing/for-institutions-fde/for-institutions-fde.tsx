import Link from "next/link"
import { MONTH_CONFIGS, TOTAL_MANDATORY_LESSONS } from "@/lib/config"
import { LATER_MONTHS_OPEN } from "@/components/marketing/data"
import { Plate } from "@/components/marketing/paper/plate"
import p from "@/components/marketing/paper/paper.module.css"
import styles from "./for-institutions-fde.module.css"

/**
 * /for-institutions in the paper-first register (N12, 2026-09-03). The
 * B2B2C proposition from the institution pivot plan (04 C1): a professional
 * body or a large employer runs GWTH as its own edition before its own
 * courses. Every figure carries its source; nothing here is priced in public.
 *
 * Copy rules: British English, sentence case, no em or en dashes, GBP only.
 *
 * ## Launch readiness rewrite (21 October 2026, bead gwth-launch-ajqs.2)
 *
 * David, 2026-10-21: *"Why have we hidden for institutions page? CIPD are
 * going to help get other institutions to look at the site so it has to be
 * visible."* So the page is on the menus again and has to be true from the GO
 * LIVE release (about 28 November) for any institution CIPD sends here.
 *
 * Every product claim now describes what the code does on that day, and
 * nothing that does not:
 *
 * - `src/app/org/syllabus`: one pass mark per edition; core lessons are in
 *   every edition and cannot be switched off (D-N7-3); optional lessons are
 *   switched on or off and each can be made to count toward the baseline
 *   (`MandatoryToggle`). So the page never says an institution chooses its
 *   own core.
 * - `src/app/org/ratification`: lessons written for an edition stay hidden
 *   from its members until an ADMIN ratifies them, or sends them back with a
 *   note (`canEditEdition`: owner and admin; tutors are read-only).
 * - `src/app/org/learners`: tutors and admins see each member's progress on
 *   the lessons that count, their average best quiz mark, when they were last
 *   active, and whether they have met the baseline (every counted, ratified
 *   lesson completed with a quiz at or above the pass mark).
 * - The learner's own `/progress` page lists completed lessons and best quiz
 *   marks, which is what a member can copy into a CPD log.
 *
 * Gone, because it will not exist on 1 December: the public verification
 * page (`/verify` is a 404 from the launch, `src/lib/public-routes.ts`), the
 * GWTH score (`GWTH_SCORE_ENABLED` is set in no environment and `/score` is a
 * 404), score history, the "after the beta" wording, and the two "Being
 * built" cards. The one current limitation an institution needs, that a pass
 * on an earlier version of a rewritten lesson still counts, is stated as a
 * plain fact in the tutor section, with no promise attached.
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
 *   So the prerequisite proposition owns the masthead and the section
 *   directly under it, in words close to his own ("bring the whole class up
 *   to the same level"), and the edition features are ordered pass mark,
 *   tutor screen first, because those are the mechanics the proposition
 *   promises.
 *
 *   The meeting record supports the argument: Steve, 27 Jul, "how we baseline
 *   people before we come into those environments ... we're getting people
 *   coming in thinking they're better than they are or having different
 *   fundamental understandings to other people in the room, which then creates
 *   complexity for the person doing the training delivery" [25:20]; Lizzie,
 *   20 Aug, "it could be like a prerequisite. You have to do this, you have to
 *   get a certain score and then you can do the next course" [00:25:51 to
 *   00:26:30]. Digest:
 *   GWTH-launch-plan/Institution - Fable Plan/01-cipd-meetings-digest.md.
 *
 *   **What that record does NOT support, and what this page therefore never
 *   says:** CIPD has not bought, approved, endorsed or selected GWTH. CIPD is
 *   named only where a published third-party fact is cited. Nor is a guarantee
 *   offered: the page promises a pass mark the institution sets, marking
 *   against it, and a screen a tutor can check.
 *
 * - **a-20260915-085041-eaa513**, on the pricing claim: "We don't want to make
 *   this statement saying that active learners are priced rather than seats
 *   because that may not be the case, for example, with CIPD, they have
 *   150,000 members, but they only want to pay £150,000 per year." The page
 *   therefore names no pricing basis, unit, figure or range anywhere.
 *
 * - **a-20260914-202509-f3143d**, on the old "CPD ready" heading: "I don't
 *   know what CPD means, so I don't think others will either." The abbreviation
 *   is written out on first use and the feature is titled by its benefit.
 *
 * - **2026-09-13, on the masthead picture** (bead gwth-launch-88z.32.13): "The
 *   general style looks fine, but the image does not convey any message." The
 *   masthead carries `curated-by-you`, a hand placing the last square onto a
 *   board of twelve beside a slider, lettered "You choose the lessons" and
 *   "You set the pass mark", the same two claims the standfirst makes.
 */

/**
 * Four published figures. Each sentence says what its source measured, and
 * nothing more (marketing copy gate, 2026-09-21 and 2026-10-21):
 *
 * - WEF: the "workforce of 100" framing from the Future of Jobs Report 2025,
 *   which comes from its employer survey.
 * - Microsoft: "16% of the AI users we surveyed" (3,233 of 20,000), classed
 *   as frontier professionals by three behaviours; "organizational factors
 *   ... account for twice the reported AI impact of individual effort alone",
 *   which the report calls statistical associations, not causal effects.
 * - OpenAI B2B Signals: frontier firms at 3.5 times typical firms' AI use per
 *   worker, up from twice a year earlier. OpenAI's measure is AI output per
 *   worker, which it treats as depth of use, not business value. The old
 *   "only 36% of that gap is volume" clause went: it needed a definition of
 *   volume the card could not give.
 * - CIPD Ireland with the University of Limerick: "67% of HR professionals
 *   identified AI for HR as their top professional development priority" and
 *   "33% offering training". It is an Irish survey, so the card says so, and
 *   it no longer leads the set (Claude review, 2026-10-20).
 */
export const EVIDENCE = [
  {
    value: "59 in 100",
    body: "Employers expect 59 in every 100 workers to need new training by 2030, and 11 of those 59 to be unlikely to get it.",
    source: "World Economic Forum, Future of Jobs Report 2025",
    href: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
  },
  {
    value: "16%",
    body: "Microsoft surveyed 20,000 people who use AI at work. It classed 16% as advanced users: people who said they use AI for complex, multi-step work, have changed how they work to make use of it, and use it together with their team.",
    source: "Microsoft Work Trend Index, 2026",
    href: "https://www.microsoft.com/en-us/worklab/work-trend-index/agents-human-agency-and-the-opportunity-for-every-organization",
  },
  {
    value: "3.5 times",
    body: "Among businesses using OpenAI, the firms that used AI most heavily produced 3.5 times as much AI output per worker as typical firms, up from twice as much a year earlier. OpenAI treats this as a measure of how deeply AI is used, not of business results.",
    source: "OpenAI, How frontier firms are pulling ahead (B2B Signals), May 2026",
    href: "https://openai.com/index/introducing-b2b-signals/",
  },
  {
    value: "67% and 33%",
    body: "In a survey of human resources (HR) professionals in Ireland, 67% named AI for HR as their top development priority, and 33% said their organisation offers AI training.",
    source: "CIPD Ireland with the University of Limerick, HR Practices in Ireland 2025 to 2026",
    href: "https://www.cipd.org/ie/knowledge/reports/hr-practices-ireland-survey/",
  },
] as const

/**
 * The prerequisite proposition, as the before and after an institution
 * recognises. Each panel is labelled in words as well as placed (bible
 * tint-is-never-the-only-signal), so the kickers stay.
 */
export const BASELINE = [
  {
    kicker: "Without a shared starting point",
    title: "Your tutors spend the first sessions filling gaps",
    body: "People often arrive on a specialist course with very different experience of using AI. Tutors can then spend the first sessions bringing the whole class up to the same level before the course moves on.",
  },
  {
    kicker: "With GWTH first",
    title: "Your tutors can see who has met your pass mark",
    body: "Before your specialist course, your learners complete the core lessons and any optional ones you require. Each quiz is marked against the pass mark you set, and your tutors can see who has met it before teaching begins.",
  },
] as const

/** What an edition gives an institution, as the /org screens implement it. */
const EDITION = [
  {
    title: "A pass mark you set",
    body: "You set one pass mark for your edition. Every quiz is marked automatically against it, and learners cannot see the answers before they submit.",
  },
  {
    title: "A learners screen for your tutors",
    body: "Your tutors see each member's progress on the required lessons, the average of their best mark on each quiz, when they were last active and whether they have met your pass mark.",
  },
  {
    title: "Separate admin and tutor access",
    body: "Your admins choose the lessons, approve the ones we write for you and set the pass mark. Your tutors can see how members are getting on, but they cannot change the edition.",
  },
  {
    title: "Core, optional and exclusive lessons",
    body: "Core lessons are in every edition and are always required. You choose which optional lessons your members see and whether they must complete each one and pass its quiz. Lessons written for your edition are shown only to your members.",
  },
  {
    title: "Exclusive lessons you approve",
    body: "Each lesson we write for your edition waits on your admin screen until your admin approves it, or sends it back with a note. Your members cannot see it until it is approved.",
  },
  {
    // a-20260914-202509-f3143d: was "CPD ready". Titled by the benefit, and
    // the abbreviation is written out the first time the page uses it.
    title: "Progress your members can log",
    body: "Each member's progress page lists the lessons they have completed and their best mark on each quiz. They can copy it into the continuing professional development (CPD) record their professional body asks them to keep.",
  },
] as const

const [, MONTH_2, MONTH_3] = MONTH_CONFIGS

/**
 * The subject depth an institution chooses, and the depth only it has.
 *
 * David, 2026-09-17 (a-20260917-145147-bfd191): *"people will want to do
 * specific lessons and not others. For example, CIPD will want to do lessons on
 * HR and accountants will want to do lessons specifically for accounts and
 * maybe law. We want to show that you can go deep into one area, or you can do
 * optional lessons by industry."*
 *
 * HR is now an optional Month 2 lesson, with marketing and sales (syllabus
 * re-count, 2026-10-20; facts sheet), so it is named here as part of the
 * course, never as something a body would have to commission. The core
 * counts come from MONTH_CONFIGS, never typed, and no optional count is
 * printed (a-20260914-201426-ae7f0e). CIPD is not named.
 */
export const DEPTH = [
  {
    title: "Optional lessons already in the course",
    body: `After its core lessons, each month has optional lessons on particular kinds of work. Month 2 has ${MONTH_2!.mandatoryLessons} core lessons and Month 3 has ${MONTH_3!.mandatoryLessons}. The optional lessons include HR, marketing and sales, UK legal practice, finance, healthcare, manufacturing and supply chain, buying AI in the public sector, and professional services for consulting, legal and accountancy firms. Each one shows how to use AI within the rules and standards of that work. Month 2 opens around ${LATER_MONTHS_OPEN.month2} and Month 3 around ${LATER_MONTHS_OPEN.month3}.`,
  },
  {
    title: "Lessons written only for your members",
    body: "If the course does not cover a subject your members need, you name the titles and we write them. Each draft waits on your admin screen until your admin has read it and approved it. It is shown only to members of your edition and does not join the standard course.",
  },
] as const

/** Plain words for each month's opening, true on both sides of 1 December. */
const MONTH_OPENS: Record<number, string> = {
  1: "Opens on 1 December 2026",
  2: `Opens around ${LATER_MONTHS_OPEN.month2}`,
  3: `Opens around ${LATER_MONTHS_OPEN.month3}`,
}

const STEPS = [
  {
    title: "Pilot with your own staff",
    body: "From 1 December 2026, a small group of your staff can try the standard course. Their feedback helps you choose the lessons for your edition.",
  },
  {
    title: "Set up your edition with us",
    body: "Choose the optional lessons, tell us the titles of any lessons you want written for you, and set your pass mark. We create the edition for you.",
  },
  {
    title: "Members take it before your courses",
    body: "Your members take your edition before your own courses, and your tutors check who has met your pass mark on the learners screen.",
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
    body: "ACCA runs its own online courses on a platform it does not own. ACCA keeps its brand and its syllabus, and the platform delivers the courses.",
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
    a: "Yes. Your members complete the core lessons and any optional lessons you require, and you set the pass mark. Before your course begins, your tutors can see on the learners screen who has met it.",
  },
  {
    // Refined 2026-09-17 (a-20260917-145147-bfd191): the subject lessons teach
    // AI use INSIDE a profession's rules, not the profession.
    q: "Does it teach our profession?",
    a: "No, and it is not meant to. The subject lessons teach people how to use AI within the rules their work already follows. Your own courses keep the professional depth, and can start at the level they were written for.",
  },
  {
    q: "Can our members skip the parts that are not for them?",
    a: "Yes, for optional lessons. Everyone in your edition completes the core lessons, and members see only the optional lessons you switch on, so they spend their time on subjects that fit their work.",
  },
  {
    q: "Does it favour one AI company's tools?",
    a: "No. GWTH is independent: no sponsors, no partnerships with AI companies, and lessons compare tools rather than sell one.",
  },
  {
    q: "Who marks the quizzes?",
    a: "Quizzes are marked automatically against the pass mark you set for your edition. Learners cannot see the answers before they submit.",
  },
  {
    q: "What can a member show for it?",
    a: "Their progress page lists the lessons they have completed and their best mark on each quiz. GWTH does not issue certificates or public record pages.",
  },
  {
    q: "Who sees the lessons written for us?",
    a: "Only members of your edition, once your admin has approved each one. They do not join the standard course. The agreement for your edition sets out what you may do with them.",
  },
  {
    q: "How quickly can we start?",
    a: "A pilot group can start on the standard course once it opens on 1 December 2026. We agree the date your edition opens with you, because it depends on the lessons you choose and on any lessons we write for you and your admin approves.",
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
                Learners often arrive at a professional course with very
                different levels of experience using AI, and tutors can spend
                the first sessions bringing the whole class up to the same
                level. GWTH is a three-month applied AI course your learners
                take before your course begins. You choose which optional
                lessons are required and set the pass mark for their quizzes,
                and your tutors can see who has met it. It is for professional
                bodies and large employers that run their own courses.
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
              name="curated-by-you"
              alt="A hand placing the last mint paper square onto a board of twelve, labelled 'You choose the lessons', beside a paper slider labelled 'You set the pass mark'."
              priority
              sizes="(max-width: 1180px) 100vw, 1140px"
            />
          </figure>
          <div className={p.plateMeta}>
            <p>Three months · About five hours a week · Marked against your pass mark</p>
            <p>Independent, with no sponsors or partnerships with AI companies.</p>
          </div>
        </div>
      </section>

      <section className={p.section} data-section="baseline">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>
              A shared starting point <em>for your courses</em>
            </h2>
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
            GWTH does not teach your profession. It teaches people how to use
            AI in their work, so your own course can focus on the specialist
            subject. Your
            tutors see which lessons each member completed and their quiz marks
            against the pass mark you chose. It is a record of what each member
            has done, not a promise about how ready they are.
          </p>
        </div>
      </section>

      <section className={p.section} data-section="evidence">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>
              How well people use AI at work varies widely
            </h2>
          </div>
          <div className={p.cards4}>
            {EVIDENCE.map((item) => (
              <article className={p.card} key={item.value} data-testid="evidence-card">
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
          {/* Scoped on the marketing copy gate (2026-10-21): the EU duty
              applies only to organisations the Act covers, so it is not aimed
              at every UK buyer. */}
          <p className={`${p.lead} ${styles.leadAfter}`}>
            If your organisation provides or uses AI systems covered by the EU
            AI Act,{" "}
            <a href={LAW.euAiAct} rel="noopener noreferrer" target="_blank">
              Article 4 of the Act
            </a>{" "}
            has required it since February 2025 to help its staff understand
            those systems. In the UK, the{" "}
            <a href={LAW.ukSkills} rel="noopener noreferrer" target="_blank">
              government&apos;s skills partnership, announced in January 2026,
            </a>{" "}
            aims to give ten million workers AI skills by 2030.
          </p>
          {/* The UK thread on this page (bead gwth-launch-88z.32.25), from the
              tutor's side, because that is who this page is written for. */}
          <p className={`${p.lead} ${styles.leadAfter}`} data-testid="institutions-uk-note">
            The course is written in the United Kingdom, for people working to
            UK rules. Where a lesson covers regulated work, it names the UK
            regulator for that work, and where it covers personal data, it
            follows UK data protection law.
          </p>
        </div>
      </section>

      <section className={p.section} data-section="edition">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>Your own edition of the course</h2>
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
        a-20260917-145147-bfd191). What may be named is on the DEPTH comment
        above. Core lessons cannot be removed from an edition (D-N7-3), so the
        lead says an edition adds to the core, never that it replaces it.
      */}
      <section className={p.section} data-section="depth">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>
              Lessons that fit <em>your members&apos; work</em>
            </h2>
          </div>
          <p className={p.lead}>
            Everyone on the standard course completes the same{" "}
            {TOTAL_MANDATORY_LESSONS} core lessons, and so does everyone in your
            edition. On top of those, you choose the optional lessons your
            members see and can have lessons written for your edition alone.
          </p>
          <div className={p.cards2}>
            {DEPTH.map((item) => (
              <article className={p.card} key={item.title} data-testid="depth-card">
                <h3 className={p.cardTitle}>{item.title}</h3>
                <p className={p.cardBody}>{item.body}</p>
              </article>
            ))}
          </div>
          <p className={`${p.lead} ${styles.leadAfter}`}>
            You do not set up an edition on your own. We set it up with you,
            and from 1 December 2026 a pilot group can use the standard course
            while we do.
          </p>
        </div>
      </section>

      {/*
        What a tutor sees, as /org/learners shows it. This replaced "What the
        score tells a tutor" and its two "Being built" cards on 2026-10-21: the
        GWTH score is switched on in no environment, and the launch readiness
        brief allows no promise of work that will not exist on 1 December. The
        one limitation an institution needs is stated as a fact.
      */}
      <section className={p.section} data-section="tutor-view">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>What your tutors see</h2>
          </div>
          <p className={p.lead} data-testid="institutions-tutor-lead">
            Your tutors sign in to a learners screen for your edition. A
            member meets your baseline by completing every required lesson
            with a quiz mark at or above your pass mark.
          </p>
          <p className={`${p.lead} ${styles.leadAfter}`}>
            Tutors see whether each member has met the baseline, not their
            individual wrong answers. When we update a lesson, a member who
            passed the earlier version still counts as having passed it.
          </p>
        </div>
      </section>

      <section className={p.section} data-section="steps">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>How it starts</h2>
          </div>
          <div className={p.cards3}>
            {STEPS.map((step) => (
              <article className={p.card} key={step.title}>
                <h3 className={p.cardTitle}>{step.title}</h3>
                <p className={p.cardBody}>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* The three months, read from MONTH_CONFIGS so names and core counts
          match every other page; no optional count is printed. */}
      <section className={p.band} data-section="course">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>What the course covers</h2>
          </div>
          <p className={p.lead}>
            Month 1 starts with AI for a person&apos;s own life and work.
            Months 2 and 3 move on to building apps for a business and leading
            AI work across an organisation. Each month ends with a larger
            project.
          </p>
          <div className={`${p.cards3} ${styles.months}`}>
            {MONTH_CONFIGS.map((month) => (
              <article className={p.card} key={month.month} data-testid="month-card">
                <p className={p.cardKicker}>Month {month.month}</p>
                <h3 className={p.cardTitle}>{month.title}</h3>
                <p className={p.cardBody}>
                  {month.subtitle}. {month.mandatoryLessons} core lessons, then
                  optional ones. {MONTH_OPENS[month.month]}.
                </p>
                <p className={p.cardSource}>
                  {month.capstoneName}: {month.capstoneDescription}
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
            <h2 className={p.sectionTitle}>
              Professional bodies already deliver learning through partners
            </h2>
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
        only want to pay £150,000 per year"*. No basis, unit, figure or range;
        only what an agreement covers and how to get a proposal.
      */}
      <section
        className={`${p.section} ${styles.anchor}`}
        data-section="commercials"
        id="commercials"
      >
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>One agreement covers the edition</h2>
          </div>
          <p className={p.lead} data-testid="institutions-commercials-lead">
            One agreement covers your edition, the admin screen and the
            learners screen your tutors use. There is no published price for an
            institution edition, because it depends on the lessons you choose,
            any lessons we write for you, and how you want to start. Tell us
            what you need and we will send you a proposal.
          </p>
        </div>
      </section>

      <section className={p.section} data-section="faq">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>Common questions</h2>
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
            See how it would work <em>for your courses</em>.
          </h2>
          <p className={p.standfirst}>
            A walkthrough takes about forty minutes. We show you what a member
            sees, the admin screen where you choose lessons and set the pass
            mark, and the learners screen your tutors use. Tell us which of
            your courses you want members to arrive ready for.
          </p>
          <div className={p.actions}>
            <Link href="/contact" className={p.buttonSolid}>
              Book a walkthrough
            </Link>
            <Link href="/for-teams" className={p.buttonOutline}>
              See options for company teams
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
