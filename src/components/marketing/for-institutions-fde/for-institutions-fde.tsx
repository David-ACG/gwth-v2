import Link from "next/link"
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
 */

export const EVIDENCE = [
  {
    // The board brief calls this "CIPD's 67/33 stat" and the research file
    // cites a cipd.org news page. That page does not carry the figures; the
    // survey that does is CIPD Ireland's HR Practices study with the University
    // of Limerick (330 HR professionals, 20 May 2026), which says "more than two
    // thirds" and "one third". The page quotes the source, not the brief.
    kicker: "Figure 01",
    value: "Two thirds and one third",
    body: "More than two thirds of HR professionals put AI skills at the top of their development priorities. Only one third of organisations have given their staff AI training.",
    source: "CIPD Ireland with the University of Limerick, HR Practices survey of 330 HR professionals, May 2026",
    href: "https://www.rte.ie/news/business/2026/0520/1574248-cipd-survey-on-ai/",
  },
  {
    kicker: "Figure 02",
    value: "3.5 times",
    body: "The firms using AI most deeply, the ones OpenAI calls frontier firms, get three and a half times as much out of AI per worker as typical firms, on OpenAI's own measure, up from twice as much a year earlier. Only 36% of that gap is volume. The rest is deeper, more capable use.",
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

const EDITION = [
  {
    title: "Core, optional and exclusive tiers",
    body: "Every lesson sits in a tier. You choose the core your members must complete, the optional lessons they may pick, and the exclusive lessons only your edition carries.",
  },
  {
    title: "Exclusive lessons you ratify",
    body: "Draft lessons written to your titles wait in your admin screen until a tutor ratifies them. Nothing reaches a member unratified.",
  },
  {
    title: "A pass mark you set",
    body: "Quizzes are graded on our server with the answer key kept off the browser. The pass mark is yours, per edition.",
  },
  {
    title: "A tutor baseline view",
    body: "Before a room starts, your tutors see who has met the baseline and who has not, so an advanced course is taught at the level it says.",
  },
  {
    title: "A verified record",
    body: "Each member gets a record they can add to LinkedIn and a verification page anyone can open. It decays if they stop, so it says what they can do now.",
  },
  {
    title: "CPD ready",
    body: "Completions and scores arrive shaped as CPD records, ready for whatever your scheme asks members to log.",
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
    body: "Pick the core and optional lessons, name the exclusive titles you want written, set the pass mark, and put your name on it.",
  },
  {
    n: "03",
    title: "Open it to members",
    body: "Members join under your edition. Tutors see the baseline, members see their record, and the course keeps changing as the tools do.",
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
    title: "CIPD's study centres",
    body: "CIPD's own qualifications are delivered through a network of approved study centres, not by CIPD itself.",
    href: "https://findacentre.cipd.org/",
  },
] as const

const FAQS = [
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
    a: "Completed lessons, the project from each, quiz results against your pass mark, and how recently they refreshed. It has a public verification page.",
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
              AI foundations for your members, <em>curated by you</em>.
            </h1>
            <div>
              <p className={p.standfirst}>
                GWTH is a three-month applied AI foundation that a
                professional body runs as its own edition: your choice of
                lessons, your pass mark, your tutors watching the baseline,
                and a verified record each member can show. Independent,
                vendor neutral, and graded on our server.
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
            <p>Three months · Five hours a week · Assessed throughout</p>
            <p>Independent. No sponsors. No vendor partnerships.</p>
          </div>
        </div>
      </section>

      <section className={p.section} data-section="evidence">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>The gap is not access. It is depth.</h2>
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
            has, since February 2025, required providers and deployers of AI
            to take measures to ensure, as far as they can, a sufficient level
            of AI literacy among their staff. And the{" "}
            <a href={LAW.ukSkills} rel="noopener noreferrer" target="_blank">
              UK government&apos;s skills partnership, announced in January 2026,
            </a>{" "}
            aims to give ten million workers AI skills by 2030. Professional
            bodies are the obvious delivery rail for both.
          </p>
        </div>
      </section>

      <section className={p.section} data-section="edition">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>Your edition</h2>
            <p className={p.sectionMeta}>What an institution gets</p>
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
            <h2 className={p.sectionTitle}>The course underneath</h2>
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

      <section className={p.section} data-section="commercials">
        <div className={p.page}>
          <div className={p.sectionHead}>
            <h2 className={p.sectionTitle}>An annual licence, priced on active learners</h2>
            <p className={p.sectionMeta}>Commercials</p>
          </div>
          <p className={p.lead}>
            One annual fee covers your edition, the admin screen, tutor views
            and records for a band of active learners, with a per learner rate
            above it. No per seat surprises and no vendor deals behind the
            price. Ask for a proposal and we will build it around your
            membership.
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
            screen, the tutor view and the record. Bring the lessons you wish
            you already had.
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
