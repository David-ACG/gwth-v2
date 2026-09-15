import { render, screen, cleanup, within } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import { AboutFde } from "./about-fde"

afterEach(cleanup)

/**
 * The /about page, against the three annotations David left on 2026-09-14
 * (bead gwth-launch-88z.32.24):
 *
 * > a-20260914-205610-1de94a: This should say the promise is simple. We help
 * > you stop watching AI change the world and start building with it
 *
 * > a-20260914-210202-2fba31: I think we can do better than this founder's
 * > note. I've worked in consulting and as a solution architect for 25 years
 * > [...] I've worked for one of the biggest AI providers in the world And
 * > I've helped everyone from my children to friends, grandparents, to
 * > technical CTOs to CEOs of large companies
 *
 * > a-20260914-210609-f7fdc8: [...] it should be repeated several times in
 * > different ways that are interesting. We need to talk about things that
 * > only happen in the UK [...] the fact we don't have any large AI companies
 * > here [...] Please make this last statement more accurate
 *
 * Three decisions are frozen here, and the assertions are on MEANING rather
 * than on sentences so the copy can be improved without the suite having to be
 * rewritten with it. The exception is the promise, which David dictated word
 * for word and which is therefore checked as he said it.
 *
 * The third annotation is the one that most needs a guard. David asked for a
 * claim that the primary sources contradict (no large AI companies, no model
 * providers) and for a superlative nobody has measured (the cheapest way for
 * the country to catch up). The page carries the accurate version of his
 * point, and these tests exist to stop the inaccurate version coming back in a
 * later copy pass. Sources are listed in this folder's README.
 */

function renderAbout() {
  return render(<AboutFde />)
}

/** Everything a reader can actually read on the page, whitespace normalised. */
function pageText(): string {
  const text = document.body.textContent ?? ""
  return text.replace(/\s+/g, " ").trim()
}

describe("About page, the promise", () => {
  it("says the promise in David's words, in the first person plural", () => {
    renderAbout()
    const promise = screen.getByTestId("about-promise")
    const text = (promise.textContent ?? "").replace(/\s+/g, " ").trim()

    expect(text).toBe(
      "The promise is simple. We help you stop watching AI change the world and start building with it."
    )
  })

  it("does not keep the old colon form that collapsed the two sentences", () => {
    renderAbout()
    expect(pageText()).not.toMatch(/promise is simple:/i)
  })
})

describe("About page, the founder note", () => {
  it("covers the experience David actually described", () => {
    renderAbout()
    const note = within(screen.getByTestId("founder-note"))
    const text = (
      screen.getByTestId("founder-note").textContent ?? ""
    ).replace(/\s+/g, " ")

    // It is his note, in his voice.
    expect(note.getByText(/founder note/i)).toBeInTheDocument()
    expect(text).toMatch(/\bI have\b/)

    // 25 years of consulting and solution architecture.
    expect(text).toMatch(/25 years/)
    expect(text).toMatch(/consult/i)
    expect(text).toMatch(/solution architecture/i)

    // Machine learning through generative AI, and a major AI provider.
    expect(text).toMatch(/machine learning/i)
    expect(text).toMatch(/generative|chat models/i)
    expect(text).toMatch(/AI providers? in the world|largest AI provider/i)

    // Coding tools as they arrive, open models on his own hardware.
    expect(text).toMatch(/coding tools/i)
    expect(text).toMatch(/open-source models/i)
    expect(text).toMatch(/own hardware/i)

    // The span of people he has helped, family through to large companies.
    expect(text).toMatch(/children/i)
    expect(text).toMatch(/grandparents|older/i)
    expect(text).toMatch(/chief executives?|CEOs?/i)
  })

  it("invents no employer, client, product or first-use date", () => {
    renderAbout()
    const text = pageText()

    for (const name of [
      "OpenAI",
      "Anthropic",
      "ChatGPT",
      "Claude",
      "Copilot",
      "Cursor",
      "Amazon",
      "AWS",
      "Microsoft",
      "Azure",
      "Meta",
      "Nvidia",
    ]) {
      expect(text, `${name} is not supported by any canonical source`).not.toMatch(
        new RegExp(`\\b${name}\\b`, "i")
      )
    }

    // No "since 2012", no "from the first day of", no exact start date.
    expect(text).not.toMatch(/since (19|20)\d{2}/i)
    expect(text).not.toMatch(/from day one/i)
  })

  it("makes no universal claim about models or tools", () => {
    renderAbout()
    const text = pageText()

    expect(text).not.toMatch(/every (popular )?(open[- ]source )?model/i)
    expect(text).not.toMatch(/every (coding )?(tool|harness)/i)
    expect(text).not.toMatch(/all of the (coding )?(tools|harnesses|models)/i)
  })

  it("gives the note its own section rather than a footnote aside", () => {
    renderAbout()
    const section = document.querySelector('[data-section="founder"]')
    expect(section).not.toBeNull()
    expect(
      within(section as HTMLElement).getByRole("heading", { level: 2 })
    ).toHaveTextContent(/who writes/i)
  })
})

describe("About page, the UK thread", () => {
  it("returns to the UK in several different places, not one clause", () => {
    renderAbout()

    // 1. The intro paragraph says who the course is written for.
    expect(pageText()).toMatch(/written for the United Kingdom/i)

    // 2. The worked-example panel names the British material it draws on.
    const examples = screen.getAllByTestId("uk-example")
    expect(examples.length).toBeGreaterThanOrEqual(3)

    // 3. A principle about answers being right for the country you are in.
    expect(pageText()).toMatch(/wrong in the United Kingdom/i)

    // 4. A section on where the UK actually stands.
    expect(document.querySelector('[data-section="uk-context"]')).not.toBeNull()
    expect(screen.getAllByTestId("uk-note").length).toBeGreaterThanOrEqual(3)
  })

  it("names concrete UK contexts rather than repeating a slogan", () => {
    renderAbout()
    const text = pageText()

    expect(text).toMatch(/NHS/)
    expect(text).toMatch(/pensions?/i)
    expect(text).toMatch(/Self Assessment|tax/i)
    expect(text).toMatch(/school/i)

    // "UK-focused" was the whole of the old UK message. If it is the whole of
    // the new one too, nothing was actually added.
    const slogan = text.match(/UK-focused/gi) ?? []
    expect(slogan.length).toBeLessThanOrEqual(1)
  })

  it("treats these as particular UK rules, not things unique to the planet", () => {
    renderAbout()
    const text = pageText()

    // The page must say the skills travel and the rules do not, rather than
    // implying nobody else has a health service or a pension.
    expect(text).toMatch(/travel anywhere|the same anywhere/i)
    expect(text).not.toMatch(/only (happen|exist)s? in the (UK|United Kingdom)/i)
    expect(text).not.toMatch(/unique to the (UK|United Kingdom)/i)
  })

  it("states the accurate version of where the UK sits in AI", () => {
    renderAbout()
    const text = pageText()

    expect(text).toMatch(/third largest AI market/i)
    expect(text).toMatch(/DeepMind/)
    expect(text).toMatch(/risks? falling behind/i)
    // The real gap in the evidence is adoption depth, so the page has to say
    // something measurable about it.
    expect(text).toMatch(/35%/)
  })

  it("refuses the three claims the sources do not support", () => {
    renderAbout()
    const text = pageText()

    // Not "we have no large AI companies here".
    expect(text).not.toMatch(
      /(no|not any|without any)[^.]{0,40}\bAI (companies|firms|labs)\b/i
    )
    // Not "we have no LLM providers".
    expect(text).not.toMatch(
      /(no|not any|without any)[^.]{0,40}\b(LLM|model|frontier) (providers?|labs?|companies)\b/i
    )
    // Not "the cheapest way for the country to catch up", and no other
    // unmeasured superlative about the country's standing.
    expect(text).not.toMatch(/cheapest/i)
    expect(text).not.toMatch(/(only|fastest|quickest) way (for|the country)/i)
    expect(text).not.toMatch(/\bcatch up\b/i)
  })

  it("attributes its figures to primary sources with working links", () => {
    renderAbout()
    const sources = within(screen.getByTestId("uk-sources"))
    const links = sources.getAllByRole("link")
    expect(links.length).toBeGreaterThanOrEqual(3)

    for (const link of links) {
      const href = link.getAttribute("href") ?? ""
      expect(href).toMatch(/^https:\/\/(www\.gov\.uk|www\.ons\.gov\.uk)\//)
      expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"))
    }
  })
})

describe("About page, structure and house style", () => {
  it("has exactly one h1 and a heading under every section", () => {
    renderAbout()
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1)

    for (const section of [
      "founder",
      "principles",
      "uk-context",
      "numbers",
      "closing",
    ]) {
      const node = document.querySelector(`[data-section="${section}"]`)
      expect(node, section).not.toBeNull()
      expect(
        within(node as HTMLElement).getAllByRole("heading", { level: 2 }).length,
        section
      ).toBe(1)
    }
  })

  it("keeps the internal calls to action pointing somewhere real", () => {
    renderAbout()
    const closing = document.querySelector('[data-section="closing"]')
    const links = within(closing as HTMLElement).getAllByRole("link")
    expect(links.length).toBeGreaterThanOrEqual(2)
    for (const link of links) {
      expect(link.getAttribute("href")).toMatch(/^\/(labs|waitlist|pricing)$/)
    }
  })

  it("uses no em dash, en dash or section sign in displayed copy", () => {
    renderAbout()
    expect(pageText()).not.toMatch(/[–—§]/)
  })

  it("stays in British English and out of contractions", () => {
    renderAbout()
    const text = pageText()

    // Contractions belong to the spoken register (bible `spoken-register`);
    // read copy keeps the full forms. Possessives are not contractions, so
    // "the government's plan" is fine and is deliberately not matched here.
    expect(text).not.toMatch(
      /\b\w+n't\b|\b(?:it|that|there|here|what|who|he|she|let)'s\b|\b(?:we|you|they)'(?:re|ve|ll)\b|\bI'(?:m|ve|ll|d)\b/i
    )
    expect(text).not.toMatch(/\borganiz|analyz|\bcolor\b/i)
  })
})
