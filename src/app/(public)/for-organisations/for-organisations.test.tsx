import { render, screen, cleanup } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import ForOrganisationsPage, { metadata } from "./page"
import { COURSE_OPENS_ON } from "@/lib/launch-date"

afterEach(cleanup)

async function renderPage(params?: { for?: string | string[] }) {
  render(
    await ForOrganisationsPage({
      searchParams: params ? Promise.resolve(params) : undefined,
    })
  )
}

describe("/for-organisations", () => {
  it("has a title, a description with the opening date and a canonical address", () => {
    expect(metadata.title).toBe("For organisations")
    expect(metadata.description).toContain(COURSE_OPENS_ON)
    expect(metadata.description).toMatch(/Professional bodies/)
    expect(metadata.description).toMatch(/Employers can buy places for a team/)
    expect(metadata.description).not.toMatch(/[—–§]/)
    expect(metadata.alternates?.canonical).toBe("/for-organisations")
  })

  it("opens on the institution choice by default", async () => {
    await renderPage()
    const radios = screen.getAllByRole("radio") as HTMLInputElement[]
    expect(radios.find((r) => r.checked)?.value).toBe("institution")
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1)
  })

  it("opens on the team choice for ?for=team, and ignores anything else", async () => {
    await renderPage({ for: "team" })
    let radios = screen.getAllByRole("radio") as HTMLInputElement[]
    expect(radios.find((r) => r.checked)?.value).toBe("team")
    cleanup()
    await renderPage({ for: ["teams", "x"] })
    radios = screen.getAllByRole("radio") as HTMLInputElement[]
    expect(radios.find((r) => r.checked)?.value).toBe("team")
    cleanup()
    await renderPage({ for: "nonsense" })
    radios = screen.getAllByRole("radio") as HTMLInputElement[]
    expect(radios.find((r) => r.checked)?.value).toBe("institution")
  })

  it("describes the score and marking as the home page does, in the present tense", async () => {
    await renderPage()
    expect(screen.getByTestId("score-lead").textContent).toMatch(/a number out of 100/)
    expect(screen.getByTestId("proof-marking").textContent).toMatch(
      /Monthly projects are marked/
    )
  })

  it("keeps the public score page behind GWTH_SCORE_ENABLED, which is off", async () => {
    await renderPage()
    expect(document.body.textContent).not.toMatch(/A score anyone can check|LinkedIn/)
  })

  it("keeps Book a walkthrough going to /contact", async () => {
    await renderPage()
    const ctas = screen.getAllByRole("link", { name: "Book a walkthrough" })
    expect(ctas.length).toBeGreaterThanOrEqual(3)
    for (const cta of ctas) expect(cta).toHaveAttribute("href", "/contact")
  })
})
