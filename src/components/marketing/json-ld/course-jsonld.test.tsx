import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import { CourseJsonLd } from "./course-jsonld"

describe("CourseJsonLd", () => {
  it("renders exactly one application/ld+json script tag", () => {
    const { container } = render(<CourseJsonLd />)
    const scripts = container.querySelectorAll('script[type="application/ld+json"]')
    expect(scripts.length).toBe(1)
  })

  it("script content parses to a Course schema with the expected fields", () => {
    const { container } = render(<CourseJsonLd />)
    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script).not.toBeNull()

    const payload = JSON.parse(script!.textContent ?? "")
    expect(payload["@context"]).toBe("https://schema.org")
    expect(payload["@type"]).toBe("Course")
    expect(payload.name).toBe("GWTH — Applied AI Skills")
    expect(payload.provider["@type"]).toBe("Organization")
    expect(payload.provider.name).toBe("GWTH.ai")
    expect(payload.provider.url).toBe("https://gwth.ai")
  })

  it("script content matches the pinned JSON payload byte-for-byte", () => {
    const { container } = render(<CourseJsonLd />)
    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script?.textContent).toMatchInlineSnapshot(
      `"{"@context":"https://schema.org","@type":"Course","name":"GWTH — Applied AI Skills","description":"Learn to build apps, automate workflows, and solve real problems using AI. 94 hands-on projects across 3 months. No coding required.","provider":{"@type":"Organization","name":"GWTH.ai","url":"https://gwth.ai"}}"`
    )
  })
})
