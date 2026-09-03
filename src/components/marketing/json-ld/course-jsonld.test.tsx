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
    expect(payload.name).toBe("GWTH.ai Applied AI Course")
    expect(payload.provider["@type"]).toBe("Organization")
    expect(payload.provider.name).toBe("GWTH.ai")
    expect(payload.provider.url).toBe("https://gwth.ai")
  })

  it("script content matches the pinned JSON payload byte-for-byte", () => {
    const { container } = render(<CourseJsonLd />)
    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script?.textContent).toMatchInlineSnapshot(
      `"{"@context":"https://schema.org","@type":"Course","name":"GWTH.ai Applied AI Course","description":"A three-month applied AI foundation for UK professionals and the institutions that serve them: research, content, thinking, building, data and automation, taught in plain English, assessed throughout, with a project in every lesson and a verified record at the end.","provider":{"@type":"Organization","name":"GWTH.ai","url":"https://gwth.ai"}}"`
    )
  })
})
