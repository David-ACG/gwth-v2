import { render, screen, cleanup } from "@testing-library/react"
import { describe, it, expect, afterEach, beforeEach } from "vitest"

import { MONTH_CONFIGS, TOTAL_MANDATORY_LESSONS } from "@/lib/config"
import { HomeFde } from "@/components/marketing/home-fde/home-fde"
import { LessonsFde } from "@/components/marketing/lessons-fde/lessons-fde"
import { ForInstitutionsFde } from "@/components/marketing/for-institutions-fde/for-institutions-fde"
import { ForTeamsFde } from "@/components/marketing/for-teams-fde/for-teams-fde"

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
  { name: "/for-institutions", node: <ForInstitutionsFde /> },
  { name: "/for-teams", node: <ForTeamsFde /> },
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
      const body = text()
      expect(body).not.toMatch(/\b\d+\s+optional\b/i)
      expect(body).not.toMatch(/\b(30|33|34|44|50|54|96)\s+optional lessons\b/i)
    })
  }

  it("/lessons keeps the mandatory figure, which config owns", () => {
    render(<LessonsFde />)
    expect(text()).toMatch(/63 core lessons/i)
  })
})

describe("no page presents HR as a lesson that exists", () => {
  // David's own example was HR, and there is no HR lesson. Naming one would be
  // inventing it. /for-institutions may say an institution would commission
  // one, because that is what the exclusive tier is for.
  it("/lessons does not name HR at all", () => {
    render(<LessonsFde />)
    expect(text()).not.toMatch(/\bHR\b|human resources/i)
  })

  it("/for-teams does not name HR at all", () => {
    render(<ForTeamsFde />)
    expect(text()).not.toMatch(/\bHR\b|human resources/i)
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

  it("every page that names the score also says it is not switched on", () => {
    // The boundary is the same; only the wording changed. From the launch
    // there is no beta (launch readiness, 2026-10-20), so /lessons says "The
    // course does not show a GWTH score yet". The old beta sentence is
    // still accepted for the pages that have not been rewritten.
    for (const page of PAGES) {
      cleanup()
      render(page.node)
      const body = text()
      if (!/GWTH score/i.test(body)) continue
      expect(
        /no score is switched on while the course is in beta|does not show a GWTH score yet/i.test(
          body
        ),
        `${page.name} names the score without the beta boundary`
      ).toBe(true)
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
    for (const month of MONTH_CONFIGS) {
      expect(body).toMatch(
        new RegExp(`${month.mandatoryLessons} in Month ${month.month}`)
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
    const note = screen.getByTestId("optional-beta-note").textContent ?? ""
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
    expect(hrefs).toContain("/for-institutions")
    // /for-teams returns a 404 from the launch (launch readiness, 2026-10-20),
    // so the page no longer links to it, nor describes the team admin there.
    expect(hrefs).not.toContain("/for-teams")
  })

  it("explains the score in terms of what is actually computed", () => {
    const { container } = render(<LessonsFde />)
    const section = container.querySelector('[data-section="score"]')
    expect(section).not.toBeNull()
    const lead = screen.getByTestId("score-lead").textContent ?? ""
    // calculateGwthScore(): finished lessons, weighted by the quiz average.
    expect(lead).toMatch(/lessons you have finished/i)
    expect(lead).toMatch(/questions/i)
    // The denominator is the learner's own edition, which is why two scores are
    // only comparable within one set of lessons.
    expect(screen.getByTestId("score-denominator").textContent).toMatch(
      /same set of lessons/i
    )
    expect(screen.getAllByTestId("score-inputs")[0]!.textContent).toMatch(
      // Marketing copy gate, 2026-10-21: the server detail meant nothing to a
      // beginner; the line now says what the marking is for.
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
    expect(screen.getByTestId("score-beta-note").textContent).toMatch(
      /does not show a GWTH score yet/i
    )
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
    const { container } = render(<ForInstitutionsFde />)
    expect(container.querySelector('[data-section="score"]')).toBeNull()
    expect(screen.queryAllByTestId("score-not-yet-card")).toHaveLength(0)
    const section =
      container.querySelector('[data-section="tutor-view"]')?.textContent ?? ""
    expect(section).toMatch(/average of their best mark on each quiz/i)
    expect(section).toMatch(/passed the earlier version still counts/i)
    expect(text()).not.toMatch(/being built|GWTH score/i)
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
    expect(paths).toMatch(/The people who lead it/i)
    expect(paths).toMatch(/UK legal practice/i)
    expect(paths).toMatch(/nobody has to take all of it/i)
  })

  it("keeps the existing syllabus-control bullets rather than repeating them", () => {
    render(<ForTeamsFde />)
    const body = text()
    expect(body).toMatch(
      /A further set of optional lessons covers industry-specific and advanced topics/
    )
    // One treatment of lesson choice, not two. The box was "How syllabus
    // control works" until the launch readiness review (2026-10-21): the
    // standard course has no admin control, so it now says how choice works.
    expect(
      (body.match(/How lesson choice works/gi) ?? []).length
    ).toBe(1)
  })

  it("keeps the score inside the existing score item, not in a new section", () => {
    // Launch readiness review, 2026-10-21: the item shows only while the
    // score is switched on, and it no longer names the two unbuilt parts as
    // "being built", because the launch brief rules out promises of later
    // work. It claims only what calculateGwthScore() does.
    const { container } = render(<ForTeamsFde showScore />)
    expect(container.querySelector('[data-section="score"]')).toBeNull()
    const item = screen
      .getByText("Achievement you can assess and reward")
      .closest("li")?.textContent ?? ""
    expect(item).toMatch(/dynamic GWTH Score/i)
    expect(item).not.toMatch(/being built|beta/i)
  })
})

describe("/: a signpost, not a fifth copy of the argument", () => {
  it("points at the optional lessons and links to the course page", () => {
    render(<HomeFde />)
    const note = (screen.getByTestId("months-optional-note").textContent ?? "").replace(/\s+/g, " ")
    // The core counts come from config, never typed (launch readiness,
    // 2026-10-20: the syllabus now runs 20 and 21, not twenty and twenty).
    expect(note).toContain(
      `Month 2 starts with ${MONTH_CONFIGS[1]!.mandatoryLessons} core lessons and Month 3 with ${MONTH_CONFIGS[2]!.mandatoryLessons}, and everybody does those`
    )
    expect(note).toMatch(/UK legal work/i)
    // Not a picker: the product has no way for a learner to select one.
    expect(note).toMatch(/not expected to take all of them/i)
    expect(note).not.toMatch(/you choose which/i)
    const link = screen.getByRole("link", { name: /see the optional lessons/i })
    expect(link).toHaveAttribute("href", "/lessons")
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
    {
      page: "/for-institutions",
      node: <ForInstitutionsFde />,
      phrase: /you name the titles and we write them/i,
    },
    {
      page: "/for-teams",
      node: <ForTeamsFde />,
      phrase: /What your team can choose from/i,
    },
    {
      page: "/",
      node: <HomeFde />,
      phrase: /not expected to take all of them/i,
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
    expect(body).not.toMatch(/GWTH score/i)
    expect(body).not.toMatch(/Each member carries a GWTH score/i)
    expect(body).not.toMatch(/how recently they refreshed/i)
    expect(body).not.toMatch(/its own web address|after the beta/i)
    // Decay was removed earlier in this bead and must not come back.
    expect(body).not.toMatch(/decays/i)
    const lead = screen.getByTestId("institutions-tutor-lead").textContent ?? ""
    expect(lead).toMatch(/sign in to a learners screen/i)
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
    expect(text()).toMatch(/same for every learner/i)
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
