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
    expect(text()).toMatch(/66 core lessons/i)
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

  it("/for-institutions names HR only as something commissioned", () => {
    render(<ForInstitutionsFde />)
    const body = text()
    expect(body).toMatch(/would not find an HR lesson in the standard course/i)
    expect(body).toMatch(/commission one/i)
    // Never as stock: no sentence may offer an HR lesson as available.
    expect(body).not.toMatch(/lessons on HR|HR lessons/i)
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

  it("every page that names the score also says it is off during the beta", () => {
    for (const page of PAGES) {
      cleanup()
      render(page.node)
      const body = text()
      if (!/GWTH score/i.test(body)) continue
      expect(
        /no score is switched on while the course is in beta/i.test(body),
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
    // The structure three registers agree on.
    expect(body).toMatch(/twenty core lessons/i)
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
    expect(note).toMatch(/given the whole set rather than picking from it/i)
    expect(note).toMatch(/building next/i)
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
    expect(text).toMatch(/smaller team takes the standard core/i)
    const hrefs = Array.from(buyers.querySelectorAll("a")).map((a) =>
      a.getAttribute("href")
    )
    expect(hrefs).toContain("/for-institutions")
    expect(hrefs).toContain("/for-teams")
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
      /answer key never sent to your browser/i
    )
  })

  it("puts the shareable record after the beta, not in it", () => {
    render(<LessonsFde />)
    const record = screen.getByTestId("score-record").textContent ?? ""
    expect(record).toMatch(/after the beta/i)
    expect(record).toMatch(/its own web address/i)
    // David asked for LinkedIn by name. It may be named as a place to put a
    // link, never as an integration (the banned patterns above enforce that).
    expect(record).toMatch(/linkedin/i)
  })
})

describe("/for-institutions: curating depth, and what the score can be asked to do", () => {
  it("has a depth section covering both what exists and what is commissioned", () => {
    const { container } = render(<ForInstitutionsFde />)
    expect(container.querySelector('[data-section="depth"]')).not.toBeNull()
    const cards = screen.getAllByTestId("depth-card")
    expect(cards).toHaveLength(2)
    const [existing, commissioned] = cards.map((el) => el.textContent ?? "")
    expect(existing).toMatch(/twenty core lessons/i)
    expect(existing).toMatch(/professional services for consulting, legal and accountancy firms/i)
    expect(commissioned).toMatch(/you name the titles and we write them/i)
    expect(commissioned).toMatch(/ratified/i)
  })

  it("does not imply CIPD has bought, approved or selected GWTH", () => {
    const { container } = render(<ForInstitutionsFde />)
    for (const name of ["depth", "score"]) {
      const section = container.querySelector(`[data-section="${name}"]`)
      expect(section?.textContent ?? "").not.toMatch(/CIPD/i)
    }
  })

  it("names the two things the score cannot do yet", () => {
    render(<ForInstitutionsFde />)
    const cards = screen.getAllByTestId("score-not-yet-card")
    expect(cards).toHaveLength(2)
    const body = cards.map((el) => el.textContent ?? "").join(" ")
    expect(body).toMatch(/nothing keeps a history of it/i)
    expect(body).toMatch(/rewritten/i)
    for (const card of cards) {
      expect(card.textContent).toMatch(/being built/i)
    }
  })

  it("no longer claims the member record loses value on its own", () => {
    // It said "It decays if they stop, so it says what they can do now".
    // Nothing in the product does that.
    render(<ForInstitutionsFde />)
    const record = screen
      .getByText("A verified record")
      .closest("div")?.textContent ?? ""
    expect(record).toMatch(/its own web address/i)
    expect(record).not.toMatch(/decay/i)
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
    // One treatment of admin control, not two.
    expect(
      (body.match(/How syllabus control works/gi) ?? []).length
    ).toBe(1)
  })

  it("names the score gaps inside the existing score item, not in a new section", () => {
    const { container } = render(<ForTeamsFde />)
    expect(container.querySelector('[data-section="score"]')).toBeNull()
    const item = screen
      .getByText("Achievement you can assess and reward")
      .closest("li")?.textContent ?? ""
    expect(item).toMatch(/dynamic GWTH Score/i)
    expect(item).toMatch(/which way a learner is going over time/i)
    expect(item).toMatch(/being built/i)
  })
})

describe("/: a signpost, not a fifth copy of the argument", () => {
  it("points at the optional lessons and links to the course page", () => {
    render(<HomeFde />)
    const note = screen.getByTestId("months-optional-note").textContent ?? ""
    expect(note).toMatch(/twenty core lessons that everybody does/i)
    expect(note).toMatch(/UK legal work/i)
    // Not a picker: the product has no way for a learner to select one.
    expect(note).toMatch(/not expected to take all of them/i)
    expect(note).not.toMatch(/you choose which/i)
    const link = screen.getByRole("link", { name: /see the optional lessons/i })
    expect(link).toHaveAttribute("href", "/lessons")
  })

  it("still carries exactly one score section, the one already approved", () => {
    const { container } = render(<HomeFde />)
    expect(container.querySelectorAll('[data-section="score"]')).toHaveLength(1)
    expect(screen.getAllByTestId("score-card")).toHaveLength(3)
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
      phrase: /given the whole set rather than picking from it/i,
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
    render(<ForInstitutionsFde />)
    const body = text()
    expect(body).toMatch(/No score is switched on while the course is in beta/i)
    expect(body).not.toMatch(/Each member carries a GWTH score/i)
    expect(body).not.toMatch(/how recently they refreshed/i)
    // Decay was removed earlier in this bead and must not come back.
    expect(body).not.toMatch(/decays/i)
    const lead = screen.getByTestId("institutions-score-lead").textContent ?? ""
    expect(lead).toMatch(/each member will have a GWTH score/i)
    // Server-side grading IS live, so it stays in the present tense.
    expect(lead).toMatch(/already marked on our server/i)
  })

  it("separates the standard core from an edition's own core (findings 2, 4)", () => {
    cleanup()
    render(<ForInstitutionsFde />)
    const institutions = text()
    expect(institutions).toMatch(
      new RegExp(`fixed core of ${TOTAL_MANDATORY_LESSONS} lessons`, "i")
    )
    expect(institutions).toMatch(/in your edition you choose which lessons make up that core/i)
    expect(institutions).not.toMatch(/the same applied AI foundation for everybody/i)
    // And /for-teams, which the old /lessons paragraph contradicted, still
    // says the standard core is the same for every team.
    cleanup()
    render(<ForTeamsFde />)
    expect(text()).toMatch(
      new RegExp(`${TOTAL_MANDATORY_LESSONS} mandatory lessons`, "i")
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
