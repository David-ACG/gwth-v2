import { render, screen, cleanup } from "@testing-library/react"
import { describe, it, expect, afterEach, beforeEach } from "vitest"

import { MONTH_CONFIGS, TOTAL_MANDATORY_LESSONS } from "@/lib/config"
import { HomeNext } from "@/components/marketing/home-next/home-next"
import { LessonsNext } from "@/components/marketing/lessons-next/lessons-next"
import { ForOrganisationsNext } from "@/components/marketing/for-organisations-next/for-organisations-next"

/**
 * Optional lessons and the dynamic score, across the four pages that carry them
 * (bead gwth-launch-88z.32.36, 2026-09-17).
 *
 * David, annotation a-20260917-145147-bfd191, left on /lessons: *"We are
 * missing a section on optional lessons. This is really important as people
 * will want to do specific lessons and not others. For example, CIPD will want
 * to do lessons on HR and accountants will want to do lessons specifically for
 * accounts and maybe law. We want to show that you can go deep into one area,
 * or you can do optional lessons by industry. This should attract both
 * individuals and institutions and big companies or teams"*. He also asked for
 * the dynamic score to be explained wherever it is genuinely relevant
 * (a-20260915-211845-237ea3 on the home page, a-20260914-204708-9f6b63 on the
 * course page, a-20260914-200925-203041 on the teams page).
 *
 * This suite exists for one reason: the copy is attractive and most of the
 * mechanism behind it is not built yet. Every assertion below is either a
 * factual boundary that must not be crossed, or the distinct job one of the
 * four pages does, so a later pass cannot quietly turn a plan into a promise or
 * paste the same section onto all four.
 *
 * The facts it is written against, each checked before the copy was:
 *
 * - Months 2 and 3 each run twenty core lessons and then a set of optional
 *   ones. Three independent registers agree: `MONTH_CONFIGS`, the canonical
 *   syllabus register at `/home/david/gwth-dashboard/gwth_pipeline.db`, and the
 *   authored lessons on disk (`m2_l01..l20` then `m2_l21..l38`; `m3_l01..l20`
 *   then `m3_l21..l35`).
 * - No optional TOTAL is safe to publish. Config says 30, the register says 44
 *   over the three live months, and Month 1's flags in that register are
 *   visibly wrong. Bead gwth-launch-88z.32.35 owns the conflict.
 * - The subject lessons are real, written lessons. HR is NOT one of them: the
 *   only HR title in the whole register sits in the retired `old_backlog`
 *   module, so HR may appear only as an example of a lesson an institution
 *   commissions.
 * - `calculateGwthScore()` is implemented. Score history, decay and the
 *   credential writer are not, and `GWTH_SCORE_ENABLED` is set in no
 *   environment.
 */

afterEach(cleanup)

/*
 * 19 Nov 2026: the live routes render the rebuilt `*-next` components, so
 * this suite renders them with the props each route passes. /for-teams and
 * /for-institutions now redirect to /for-organisations (one page with an
 * institution choice and a team choice, both in the DOM), so the two old
 * pages are the same render here. The old `*-fde` components stay in the
 * repo as a backup and keep their own unit tests.
 */
const HomeFde = (props: { showScore?: boolean }) => (
  <HomeNext showScore markingLive {...props} />
)
const LessonsFde = () => <LessonsNext showScore markingLive />
const ForInstitutionsFde = () => (
  <ForOrganisationsNext showScore markingLive audience="institution" />
)
const ForTeamsFde = (_props: { showScore?: boolean } = {}) => (
  <ForOrganisationsNext showScore markingLive audience="team" />
)

// canPromoteLabs() is a runtime env read; pin the fail-closed production shape,
// as the evergreen suite does.
const ORIGINAL_MODE = process.env.PRIVATE_CONTENT_MODE
beforeEach(() => {
  process.env.PRIVATE_CONTENT_MODE = "on"
})
afterEach(() => {
  if (ORIGINAL_MODE === undefined) delete process.env.PRIVATE_CONTENT_MODE
  else process.env.PRIVATE_CONTENT_MODE = ORIGINAL_MODE
})

const PAGES = [
  { name: "/", node: <HomeFde /> },
  { name: "/lessons", node: <LessonsFde /> },
  // /for-teams and /for-institutions redirect here (one page, both choices).
  { name: "/for-organisations", node: <ForInstitutionsFde /> },
] as const

/** All visible text of the rendered page, whitespace collapsed. */
function text(): string {
  return (document.body.textContent ?? "").replace(/\s+/g, " ")
}

describe("no page invents an optional-lesson count", () => {
  // The rule /for-teams already lives under (a-20260914-201426-ae7f0e),
  // extended to every page that now describes the optional set. /lessons
  // printed 30 in three places until this pass; it prints none now.
  for (const page of PAGES) {
    it(`${page.name} prints no optional total`, () => {
      render(page.node)
      // /for-organisations' learners dashboard example says what one made-up
      // edition requires ("the 63 core lessons and 3 optional ones"). That is
      // an example edition's rule, not a count of the course's optional set.
      // /lessons prints the optional total once, in its facts row, read from
      // config (David, 19 Nov 2026, "One total, once"). That row is checked in
      // lessons-next.test.tsx; every other optional count stays banned.
      const facts = page.name === "/lessons"
        ? (screen.getByTestId("course-facts").textContent ?? "").replace(/\s+/g, " ")
        : ""
      const body = text()
        .replace(facts, "")
        .replace(
          /the edition requires the \d+ core lessons and \d+ optional ones/i,
          ""
        )
      expect(body).not.toMatch(/\b\d+\s+optional\b/i)
      expect(body).not.toMatch(/\b(30|33|34|44|50|54|96)\s+optional lessons\b/i)
    })
  }

  it("/lessons keeps the mandatory figure, which config owns", () => {
    render(<LessonsFde />)
    expect(text()).toMatch(
      new RegExp(`${TOTAL_MANDATORY_LESSONS} core lessons`, "i")
    )
    // 19 Nov 2026: FamilyBot's four lessons became core (26 + 20 + 21).
    expect(TOTAL_MANDATORY_LESSONS).toBe(67)
  })
})

describe("no page presents HR as a lesson that exists", () => {
  // David's own example was HR, and there is no HR lesson. Naming one would be
  // inventing it. /for-institutions may say an institution would commission
  // one, because that is what the exclusive tier is for.
  // Re-pointed 19 Nov 2026 to lessons-next / for-organisations-next. Since
  // the 2026-10-21 change below, HR is a real Month 2 optional lesson, so
  // "does not name HR at all" no longer holds anywhere; what remains is that
  // HR is named only as that optional lesson, never as one to commission.
  it("/lessons names HR only as the Month 2 optional lesson it is", () => {
    render(<LessonsFde />)
    const body = text()
    const hits = body.match(/\bHR\b|human resources/gi) ?? []
    expect(hits).toHaveLength(1)
    // 19 Nov 2026: /lessons no longer lists lesson titles ("Shape, not the
    // list"), so HR appears as the example project from that optional lesson,
    // marked as one.
    expect(body).toMatch(
      /An HR assistant that drafts job adverts and new-starter checklists for you to check for fairness Optional lesson/
    )
    expect(body).not.toMatch(/would not find an HR lesson|commission (an HR lesson|one)/i)
  })

  it("/for-organisations never says HR has to be commissioned", () => {
    render(<ForTeamsFde />)
    expect(text()).not.toMatch(/would not find an HR lesson|commission (an HR lesson|one)/i)
  })

  it("/for-institutions names HR as the optional lesson it now is", () => {
    // Changed 2026-10-21 (launch readiness, marketing copy gate). The syllabus
    // re-count of 2026-10-20 put HR, marketing and sales into Month 2 as
    // optional lessons (facts sheet), so "would not find an HR lesson in the
    // standard course; it would commission one" became untrue and contradicted
    // /why-gwth. The boundary that remains: HR is never something a body has
    // to commission.
    render(<ForInstitutionsFde />)
    const body = text()
    expect(body).toMatch(/optional lessons include HR/i)
    expect(body).not.toMatch(/would not find an HR lesson|commission (an HR lesson|one)/i)
  })
})

/**
 * The launch-product rule (David, 19 Nov 2026), which replaced the older
 * "say the score is not switched on" boundary on the public pages. His words:
 * "what I want to do is show the public pages with what we will have in
 * December ... so that CIPD and the people testing it over the weekend ...
 * can see exactly what will be available when we go live" and "Please
 * override the style Bible, as we want to show exactly what will be available
 * when we launch. We don't want to show what is available now because we're
 * not ready now."
 *
 * So the public pages describe the GWTH score and project marking in the
 * present tense, as the course will be at launch on 14 December 2026, and do
 * not say the score is "not switched on yet". /lessons and /for-organisations
 * may have a score block and name the weighting (half core lessons and
 * quizzes, half the three monthly projects). What still holds from the old
 * rule: no public score page, "anyone can check" or LinkedIn sharing claim
 * unless the public-score path (ENABLE_GWTH_SCORE, `publicScore`) is on; the
 * example score cards are labelled as examples; no claim of a stored score
 * history.
 */
const LAUNCH_RULE = "David, 19 Nov 2026: public pages show the launch product"

/** Claims that need the public score page (`publicScore`) to be on. */
const PUBLIC_SCORE_CLAIMS =
  /anyone can check|a score anyone|public page that anyone|share it on LinkedIn|its own web address/i

/** The example cards say they are examples and that no history is stored. */
function expectExampleCardsLabelled(page: string) {
  const body = text()
  if (!document.querySelector('[data-testid="score-cards"]')) return
  expect(body, `${page}: example cards not labelled`).toMatch(
    /These cards show examples (of what a learner sees, )?rather\s+than real learners/i
  )
  expect(body, `${page}: claims a stored score history`).toMatch(
    /don't yet store a history of/i
  )
}

describe("no page claims the unbuilt half of the score", () => {
  // SCORE_DECAY_DAYS is read by no runtime code, scoreHistory is returned empty
  // unconditionally, no migration creates a history table, and nothing has ever
  // written a row to credential_verifications. Copy ledger C35 additionally
  // bans the four sub-metric names.
  const BANNED: ReadonlyArray<{ why: string; pattern: RegExp }> = [
    { why: "decay is not implemented", pattern: /decays?\b|decaying/i },
    { why: "currentness is not measured", pattern: /currentness/i },
    {
      why: "the four sub-metrics do not exist (ledger C35)",
      pattern: /curiosity index|consistency score|improvement rate|ai skill percentile/i,
    },
    {
      why: "no score is recomputed on a schedule; nothing runs",
      pattern: /recomputes? weekly|updated weekly/i,
    },
    {
      why: "there is no LinkedIn integration; the control in the product is disabled",
      pattern: /add to linkedin|linkedin integration|sync(ed)? (to|with) linkedin/i,
    },
  ]

  for (const page of PAGES) {
    for (const banned of BANNED) {
      it(`${page.name} does not claim: ${banned.why}`, () => {
        render(page.node)
        expect(text()).not.toMatch(banned.pattern)
      })
    }
  }

  it("every page that names the score describes it as at launch, with the boundaries that still hold", () => {
    // Converted 19 Nov 2026 (see LAUNCH_RULE above). It used to require "not
    // switched on" / "does not show a GWTH score yet" beside every mention.
    for (const page of PAGES) {
      cleanup()
      render(page.node)
      const body = text()
      if (!/GWTH score/i.test(body)) continue
      expect(body, `${page.name}: ${LAUNCH_RULE}`).not.toMatch(
        /not switched on|does not show a GWTH score yet|while the course is in beta/i
      )
      expect(body, `${page.name} claims the public score page`).not.toMatch(
        PUBLIC_SCORE_CLAIMS
      )
      expectExampleCardsLabelled(page.name)
    }
  })
})

describe("/lessons: the fullest learner-facing explanation", () => {
  it("has an optional-lessons section with the three directions", () => {
    const { container } = render(<LessonsFde />)
    const section = container.querySelector('[data-section="optional"]')
    expect(section).not.toBeNull()
    expect(screen.getAllByTestId("path-card")).toHaveLength(3)
    const body = section!.textContent ?? ""
    // The structure, with every month's core count read from config: the
    // syllabus re-count of 2026-10-20 made "Months 2 and 3 each open with
    // twenty core lessons" untrue (Month 3 has 21), so no count is typed.
    // lessons-next (19 Nov 2026) prints each month's core count on the
    // month chooser ("Month 1 Build your foundation 22 core lessons"), not in
    // this section, so the counts are checked against the whole page.
    for (const month of MONTH_CONFIGS) {
      expect(text()).toMatch(
        new RegExp(`Month ${month.month}\\b[^.]{0,60}?${month.mandatoryLessons} core lessons`)
      )
    }
    // Deep by field, deep by craft, deep by role: David's "go deep into one
    // area, or do optional lessons by industry".
    expect(body).toMatch(/UK legal practice/i)
    expect(body).toMatch(/accountancy firms/i)
    expect(body).toMatch(/go further into building/i)
  })

  it("says plainly that choosing your own path is not switched on yet", () => {
    // The pipeline importer marks every lesson core, so no learner can select
    // an optional lesson however the syllabus is written. The page must not
    // read as though a picker exists.
    render(<LessonsFde />)
    // lessons-next: the note's test id is "optional-note".
    const note = screen.getByTestId("optional-note").textContent ?? ""
    // Reworded on the latest Sol's final check (2026-10-20): still says no
    // picker exists, in plainer words.
    expect(note).toMatch(/includes its core and optional lessons when that month opens/i)
    // "the part we are building next" was a promise about future work, which
    // the launch readiness checklist does not allow (2026-10-20).
    expect(note).not.toMatch(/building next|beta/i)
  })

  it("sends an institution or team buyer to its own page", () => {
    // The paragraph used to say "a professional body, a company or a team sets
    // its own version of the course", which promised every team control of its
    // own core and contradicted /for-teams, where the 66 core lessons are the
    // same for everybody and bespoke lessons start at 100 learners. The copy
    // gate blocked promotion on it (bead gwth-launch-88z.32.36), so the
    // eligibility rule is now asserted here rather than the old phrasing.
    render(<LessonsFde />)
    const buyers = screen.getByTestId("optional-buyers")
    const text = buyers.textContent ?? ""
    expect(text).toMatch(
      new RegExp(`same ${TOTAL_MANDATORY_LESSONS} core lessons`, "i")
    )
    expect(text).toMatch(/100 or more learners/i)
    const hrefs = Array.from(buyers.querySelectorAll("a")).map((a) =>
      a.getAttribute("href")
    )
    // 19 Nov 2026: /for-institutions and /for-teams redirect to the one
    // /for-organisations page, so the buyer is sent there directly.
    expect(hrefs).toContain("/for-organisations")
    expect(hrefs).not.toContain("/for-teams")
    expect(hrefs).not.toContain("/for-institutions")
  })

  it("explains the score in terms of what is actually computed", () => {
    const { container } = render(<LessonsFde />)
    const section = container.querySelector('[data-section="score"]')
    expect(section).not.toBeNull()
    // lessons-next (19 Nov 2026): "It combines the core lessons you've
    // passed, your quiz results and ..." sits in "score-what".
    const lead = screen.getAllByTestId("score-what")[0]!.textContent ?? ""
    // calculateGwthScore(): finished lessons, weighted by the quiz average.
    expect(lead).toMatch(/core lessons you've passed/i)
    expect(lead).toMatch(/quiz results/i)
    // The denominator is the learner's own edition, which is why two scores are
    // only comparable within one set of lessons.
    expect(screen.getByTestId("score-denominator").textContent).toMatch(
      /same set of lessons/i
    )
    // Marketing copy gate, 2026-10-21: the server detail meant nothing to a
    // beginner; the line says what the marking is for. On lessons-next it is
    // in the lesson steps, not a "score-inputs" card.
    expect(text()).toMatch(
      /marked automatically, so you can see what to go back over/i
    )
  })

  it("does not promise the shareable record page while it does not exist", () => {
    // This test used to pin the record paragraph ("After the beta, your score
    // will come with a page of its own ... such as LinkedIn"), which David
    // asked for on 2026-09-14 (a-20260914-204708-9f6b63). Nothing has ever
    // written a credential row and the score is switched on in no
    // environment, so from the launch that paragraph was a promise of a
    // feature that may not exist on 1 December. The launch readiness brief
    // (rule 3) and the latest Sol writing check both ruled it out on
    // 2026-10-20. Restore the paragraph, and this test's old shape, the day
    // the record page is live; LinkedIn may then be named as a place to put a
    // link, never as an integration (the banned patterns above enforce that).
    render(<LessonsFde />)
    expect(screen.queryByTestId("score-record")).toBeNull()
    expect(text()).not.toMatch(/its own web address/i)
  })

  it("describes the score as at launch, with its weighting, and no 'not yet' note", () => {
    // Converted 19 Nov 2026 (see LAUNCH_RULE above). It used to require the
    // "The course does not show a GWTH score yet" note.
    render(<LessonsFde />)
    expect(screen.queryByTestId("score-beta-note")).toBeNull()
    expect(text()).not.toMatch(/does not show a GWTH score yet|not switched on/i)
    expect(screen.getByTestId("score-lead").textContent).toMatch(
      /Core lessons and quiz results count for half of your score\. The marks for your monthly projects count for the other half/i
    )
    expect(text()).not.toMatch(PUBLIC_SCORE_CLAIMS)
  })
})

describe("/for-institutions: curating depth, and what the score can be asked to do", () => {
  it("has a depth section covering both what exists and what is commissioned", () => {
    const { container } = render(<ForInstitutionsFde />)
    expect(container.querySelector('[data-section="depth"]')).not.toBeNull()
    const cards = screen.getAllByTestId("depth-card")
    expect(cards).toHaveLength(2)
    const [existing, commissioned] = cards.map((el) => el.textContent ?? "")
    // Counts from config, never typed: "Months 2 and 3 each open with twenty
    // core lessons" became untrue at the 2026-10-20 re-count (Month 3 has 21).
    expect(existing).toContain(
      `Month 2 has ${MONTH_CONFIGS[1]!.mandatoryLessons} core lessons and Month 3 has ${MONTH_CONFIGS[2]!.mandatoryLessons}`
    )
    expect(existing).toMatch(/professional services for consulting, legal and accountancy firms/i)
    expect(commissioned).toMatch(/you name the titles and we write them/i)
    // "Ratified" became "approved" on the latest Sol's check (2026-10-21);
    // the admin sign-off it describes is unchanged.
    expect(commissioned).toMatch(/approved/i)
  })

  it("does not imply CIPD has bought, approved or selected GWTH", () => {
    const { container } = render(<ForInstitutionsFde />)
    for (const name of ["depth", "tutor-view"]) {
      const section = container.querySelector(`[data-section="${name}"]`)
      expect(section?.textContent ?? "").not.toMatch(/CIPD/i)
    }
  })

  it("states what the tutor screen shows, and the one limitation as a fact", () => {
    // This test pinned the score section's two "Being built" cards (history
    // and out-of-date passes). The launch readiness brief (rule 3) allows no
    // promise of work that will not exist on 1 December, and the GWTH score
    // is switched on in no environment, so the section now describes
    // /org/learners and states the out-of-date limitation with no promise.
    // for-organisations-next: the tutor view is data-testid="tutor-view".
    render(<ForInstitutionsFde />)
    expect(screen.queryAllByTestId("score-not-yet-card")).toHaveLength(0)
    const section = screen.getByTestId("tutor-view").textContent ?? ""
    // The measures are listed once, on the "A learners dashboard for your
    // tutors" card; the 21 Oct copy gate blocked a third telling here, so
    // this section keeps only the baseline rule and the limitation.
    expect(text()).toMatch(/average of their best mark on each quiz/i)
    expect(section).toMatch(/meets your baseline by completing every required lesson/i)
    expect(section).toMatch(/passed the earlier version still counts/i)
    expect(text()).not.toMatch(/being built/i)
  })

  it("may describe the score as at launch, but not the public score page", () => {
    // Converted 19 Nov 2026 (see LAUNCH_RULE above). It used to require no
    // score section and no mention of the GWTH score at all.
    const { container } = render(<ForInstitutionsFde />)
    const score = container.querySelector('[data-section="score"]')
    expect(score).not.toBeNull()
    expect(screen.getByTestId("score-lead").textContent).toMatch(
      /count for half of the score\. The marks for the monthly projects count for the other half/i
    )
    expect(text()).not.toMatch(/not switched on|does not show a GWTH score yet/i)
    expectExampleCardsLabelled("/for-organisations")
    // The public score page stays out while `publicScore` is off ...
    expect(text()).not.toMatch(PUBLIC_SCORE_CLAIMS)
    // ... and is described only when it is on.
    cleanup()
    render(<ForOrganisationsNext showScore markingLive publicScore />)
    expect(text()).toMatch(/A score anyone can check/)
  })

  it("no longer claims the member record loses value on its own", () => {
    // It said "It decays if they stop, so it says what they can do now".
    // Nothing in the product does that. Since 2026-10-21 the record is the
    // member's own progress page; the public record page (/verify) is closed
    // from the launch, so its "own web address" is no longer promised.
    render(<ForInstitutionsFde />)
    const record = screen
      .getByText("Progress your members can log")
      .closest("div")?.textContent ?? ""
    expect(record).toMatch(/progress page/i)
    expect(record).not.toMatch(/decay|its own web address/i)
  })
})

describe("/for-teams: the same story, told for somebody choosing for other people", () => {
  it("says what the optional set contains, by the work people do", () => {
    render(<ForTeamsFde />)
    const paths = screen.getByTestId("role-paths").textContent ?? ""
    expect(paths).toMatch(/Client-facing and regulated work/i)
    expect(paths).toMatch(/The people who build/i)
    // "The people who lead AI work" since the latest Sol's check (2026-10-21):
    // "lead it" had no clear antecedent.
    expect(paths).toMatch(/The people who lead AI work/i)
    expect(paths).toMatch(/UK legal practice/i)
    // for-organisations-next prints this line just after the role list.
    expect(text()).toMatch(/nobody has to take all of it/i)
  })

  it("keeps the existing syllabus-control bullets rather than repeating them", () => {
    render(<ForTeamsFde />)
    const body = text()
    // for-organisations-next (19 Nov 2026): the one telling is the "The same
    // core for everyone, optional lessons by role" item.
    expect(body).toMatch(
      /Each month also includes optional lessons for particular industries, for building more complex AI tools and for leading AI work/
    )
    // One treatment of lesson choice, not two. The box was "How syllabus
    // control works" until the launch readiness review (2026-10-21): the
    // standard course has no admin control, so it now says how choice works.
    expect(
      (body.match(/The same core for everyone, optional lessons by role/gi) ?? []).length
    ).toBe(1)
  })

  it("explains the score once, in its own score block, as at launch", () => {
    // Converted 19 Nov 2026 (see LAUNCH_RULE above). The old /for-teams kept
    // the score inside one "Achievement you can assess and reward" item; the
    // one /for-organisations page has a single score block instead. What
    // still holds: one telling, nothing "being built", no beta, and it
    // claims only what calculateGwthScore() combines.
    const { container } = render(<ForTeamsFde showScore />)
    expect(container.querySelectorAll('[data-section="score"]')).toHaveLength(1)
    const block = container.querySelector('[data-section="score"]')?.textContent ?? ""
    expect(block).toMatch(/core lessons they've passed, their quiz results and their best marks for the three monthly projects/i)
    expect(block).not.toMatch(/being built|beta|not switched on/i)
  })
})

describe("/: a signpost, not a fifth copy of the argument", () => {
  it("points at the optional lessons, with no counts and no button", () => {
    render(<HomeFde />)
    const note = (screen.getByTestId("months-optional-note").textContent ?? "").replace(/\s+/g, " ")
    // David, 13 Nov 2026: "Why do students want to know this? ... make this
    // more of a marketing site" (a-20261113-153646-33f0e6), and the "See the
    // optional lessons" button went (a-20261113-153733-1288d3).
    expect(note).toMatch(/optional lesson/i)
    expect(note).toMatch(/UK healthcare or legal work/i)
    expect(note).not.toMatch(/core lessons and Month 3 with \d+/)
    // Not a picker: the product has no way for a learner to select one.
    expect(note).toMatch(/without taking every optional lesson/i)
    expect(note).not.toMatch(/you choose|pick/i)
    expect(note).toContain("For work tasks, use the AI tool your organisation has approved.")
    expect(screen.queryByRole("link", { name: /see the optional lessons/i })).toBeNull()
  })

  // Launch readiness, 2026-10-20: the score section renders only while the
  // score is switched on (ENABLE_GWTH_SCORE, off at launch). Switched on, it is
  // still exactly the one section already approved.
  it("still carries exactly one score section, the one already approved", () => {
    const { container } = render(<HomeFde showScore />)
    expect(container.querySelectorAll('[data-section="score"]')).toHaveLength(1)
    expect(screen.getAllByTestId("score-card")).toHaveLength(3)
    cleanup()
    const off = render(<HomeFde showScore={false} />)
    expect(off.container.querySelectorAll('[data-section="score"]')).toHaveLength(0)
  })
})

describe("the four pages do four different jobs", () => {
  /**
   * The failure this guards against is the obvious one: writing the optional
   * lessons once and pasting it onto every page. Each page's own sentence is
   * checked to be absent from the other three.
   */
  const SIGNATURES = [
    {
      page: "/lessons",
      node: <LessonsFde />,
      phrase: /includes its core and optional lessons when that month opens/i,
    },
    // /for-institutions and /for-teams are one page since 19 Nov 2026, so
    // both its sentences are checked against the other pages, not each other.
    {
      page: "/for-organisations",
      node: <ForInstitutionsFde />,
      phrase: /you name the titles and we write them/i,
    },
    {
      page: "/for-organisations",
      node: <ForTeamsFde />,
      phrase: /What your team can choose from/i,
    },
    {
      page: "/",
      node: <HomeFde />,
      phrase: /Go deep into one area without taking every optional lesson/i,
    },
  ] as const

  for (const signature of SIGNATURES) {
    it(`${signature.page} owns its own sentence`, () => {
      cleanup()
      render(signature.node)
      expect(text()).toMatch(signature.phrase)
      for (const other of SIGNATURES) {
        if (other.page === signature.page) continue
        cleanup()
        render(other.node)
        expect(
          signature.phrase.test(text()),
          `${other.page} repeats ${signature.page}'s sentence`
        ).toBe(false)
      }
    })
  }
})

/**
 * The corrections the GPT-5.6 Sol marketing copy gate demanded before it would
 * let this work reach the preview (run
 * `completion/marketing-copy-gate/20260917T152408Z-gwth-launch-88z-32-36-optional-and-scoring.json`,
 * verdict FAIL, eleven blocking findings and three advisories).
 *
 * The gate reads the whole rendered page, so it blocked on copy that pre-dates
 * this task as well as on copy this task wrote. Each test below names the
 * finding it locks in, because the failure mode is somebody restoring one of
 * these sentences later without knowing why it went.
 *
 * The two claims that run through nearly all of them:
 *
 *  1. Nothing may promise, in the present tense, that the GWTH score, the
 *     tutor baseline screen, the public member record or freshness tracking is
 *     available. `calculateGwthScore()` exists and quizzes really are graded on
 *     the server, but the feature sits behind `GWTH_SCORE_ENABLED` (set in no
 *     environment), `scoreHistory` is returned empty unconditionally, no
 *     migration creates a history table, `SCORE_DECAY_DAYS` is read by no
 *     runtime code, and nothing has ever written a row to
 *     `credential_verifications`.
 *  2. No outcome, retention or comparison figure may be asserted without a
 *     source on the page.
 */
describe("the copy gate's corrections stay corrected", () => {
  it("says what the building direction builds (finding 1)", () => {
    render(<LessonsFde />)
    const lead = screen.getByTestId("optional-lead").textContent ?? ""
    expect(lead).toMatch(/building more advanced AI tools/i)
    expect(lead).not.toMatch(/building itself/i)
  })

  it("names no unsourced retention or productivity outcome (findings 10, 11)", () => {
    render(<ForTeamsFde />)
    const body = text()
    expect(body).not.toMatch(/34%/)
    expect(body).not.toMatch(/retain \d+% more staff/i)
    expect(body).not.toMatch(/should be automating tasks/i)
    expect(body).not.toMatch(/leading AI transformation initiatives/i)
    // What replaced them: the course teaches, the organisation decides.
    expect(body).toMatch(/Decisions about roles and staffing stay with your organisation/i)
  })

  it("keeps the consultant comparison out of the capstone (finding 3)", () => {
    for (const month of MONTH_CONFIGS) {
      expect(month.capstoneDescription).not.toMatch(/production-grade/i)
      expect(month.capstoneDescription).not.toMatch(/pay consultants/i)
    }
  })

  it("does not promise a live score, tutor screen or record (findings 5, 6, 7, 8)", () => {
    // Since 2026-10-21 (launch readiness) the page does not name the GWTH
    // score at all: it is switched on in no environment and there is no beta
    // to promise it "after". The tutor screen (/org/learners) does exist from
    // the launch, so it is described in the present tense; the public record
    // page (/verify) does not, so no record page is promised.
    render(<ForInstitutionsFde />)
    const body = text()
    // "does not name the GWTH score" is checked (and flagged) in the
    // /for-institutions block above.
    expect(body).not.toMatch(/Each member carries a GWTH score/i)
    expect(body).not.toMatch(/how recently they refreshed/i)
    expect(body).not.toMatch(/its own web address|after the beta/i)
    // Decay was removed earlier in this bead and must not come back.
    expect(body).not.toMatch(/decays/i)
    const lead = screen.getByTestId("institution-tutor-lead").textContent ?? ""
    expect(lead).toMatch(/sign in to a learners dashboard/i)
    // Server-side grading IS live, so it stays in the present tense. The
    // latest Sol (2026-10-21) asked for the plain result rather than the
    // server detail: marked automatically, answers unseen before submitting.
    expect(body).toMatch(/marked automatically/i)
    expect(body).toMatch(/cannot see the answers before they submit/i)
  })

  it("separates the standard core from an edition's own core (findings 2, 4)", () => {
    cleanup()
    render(<ForInstitutionsFde />)
    const institutions = text()
    // Changed 2026-10-21 (launch readiness): "in your edition you choose
    // which lessons make up that core" was untrue. /org/syllabus locks core
    // lessons in every edition (D-N7-3); an institution adds optional lessons
    // to its baseline and has lessons written, but cannot replace the core.
    expect(institutions).toMatch(
      new RegExp(
        `same ${TOTAL_MANDATORY_LESSONS} core lessons, and so does everyone in your edition`,
        "i"
      )
    )
    expect(institutions).not.toMatch(/choose which lessons make up that core/i)
    expect(institutions).not.toMatch(/the same applied AI foundation for everybody/i)
    // And /for-teams, which the old /lessons paragraph contradicted, still
    // says the standard core is the same for every team ("core", the course
    // page's word, since 2026-10-21).
    cleanup()
    render(<ForTeamsFde />)
    expect(text()).toMatch(
      new RegExp(`${TOTAL_MANDATORY_LESSONS} core lessons`, "i")
    )
    // for-organisations-next: "Everyone takes the same 63 core lessons."
    expect(text()).toMatch(
      new RegExp(`Everyone takes the same ${TOTAL_MANDATORY_LESSONS} core lessons`, "i")
    )
  })

  it("gives one eligibility rule for bespoke lessons, on both pages (finding 9)", () => {
    cleanup()
    render(<ForTeamsFde />)
    expect(text()).toMatch(/company or team of 100 or more learners/i)
    expect(text()).not.toMatch(/a professional body or a large company can have lessons/i)
    cleanup()
    render(<LessonsFde />)
    expect(text()).toMatch(/100 or more learners/i)
  })

  it("drops the scare tactic and the jargon the gate flagged (findings 12, 13)", () => {
    cleanup()
    render(<LessonsFde />)
    const lessons = text()
    expect(lessons).not.toMatch(/risk making themselves obsolete/i)
    expect(lessons).not.toMatch(/AT&T/i)
    cleanup()
    render(<ForInstitutionsFde />)
    expect(text()).not.toMatch(/delivery rail/i)
  })
})

describe("bible gwth-score-inputs: the score counts the marked monthly projects", () => {
  // David, 2026-10-23: "we also want to work it out on the major projects, and
  // that contributes to the score. Otherwise, people are not going to take
  // this seriously if we don't actually mark projects." Every explanation of
  // the score names lessons, questions and project marks. Marking is not built
  // (bead gwth-launch-9289), so /lessons is in the future tense and names no
  // weighting or marker.
  it("/lessons names all three, in the future tense", () => {
    cleanup()
    // lessons-next (19 Nov 2026): "score-what" names the three inputs.
    render(<LessonsFde />)
    const what = screen.getAllByTestId("score-what")[0]!.textContent ?? ""
    expect(what).toMatch(/core lessons you've passed/i)
    expect(what).toMatch(/quiz results/i)
    expect(what).toMatch(/marks for the three monthly projects/i)
  })

  it("/lessons states the weighting in the present tense", () => {
    // Converted 19 Nov 2026 (see LAUNCH_RULE above). It used to require the
    // future tense ("will be worked out") and no weighting. Marking is
    // described as at launch, so the half-and-half weighting is named; what
    // still holds is that no marker detail (tutor or AI) is in the score
    // explanation itself.
    cleanup()
    render(<LessonsFde />)
    const lead = screen.getByTestId("score-lead").textContent ?? ""
    expect(lead).not.toMatch(/will be worked out|will count/i)
    expect(lead).toMatch(/count for half of your score/i)
    expect(lead).toMatch(/monthly projects count for the other half/i)
    expect(lead).not.toMatch(/tutors? mark|AI marks/i)
  })

  it("the home page and For teams name the project marks when the score is on", () => {
    cleanup()
    render(<HomeFde showScore />)
    expect(screen.getByTestId("score-lead").textContent ?? "").toMatch(
      /marks for your monthly projects/i
    )
    cleanup()
    render(<ForTeamsFde showScore />)
    // for-organisations-next: "their best marks for the three monthly
    // projects" and "The marks for the monthly projects count for ...".
    expect(document.body.textContent ?? "").toMatch(
      /marks for (their|the|the three) monthly projects/i
    )
  })
})
