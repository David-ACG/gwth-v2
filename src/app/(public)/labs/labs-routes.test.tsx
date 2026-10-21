import { render, screen, cleanup, within, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest"

const canView = vi.hoisted(() => vi.fn(async () => true))
vi.mock("@/lib/content-access", () => ({
  requireContentAccessOrRedirect: vi.fn(async () => undefined),
  canViewPrivateContent: canView,
}))
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND")
  },
  redirect: (to: string) => {
    throw new Error(`NEXT_REDIRECT ${to}`)
  },
  usePathname: () => "/labs",
}))

import PublicLabsPage, { metadata as indexMetadata } from "./page"
import LabDetailPage, { generateMetadata } from "./[slug]/page"
import { GET } from "./[slug]/answer/[setup]/route"
import { MODEL_LAB_SLUGS, getModelLab } from "@/lib/data/model-lab"

afterEach(cleanup)
beforeEach(() => {
  canView.mockResolvedValue(true)
})

const params = (slug: string) => ({ params: Promise.resolve({ slug }) })

describe("/labs", () => {
  it("lists the six labs and the cost chart", async () => {
    render(await PublicLabsPage())
    expect(screen.getAllByTestId("model-lab-card")).toHaveLength(6)
    expect(screen.getByTestId("labs-cost-chart")).toBeInTheDocument()
    expect(String(indexMetadata.description)).toMatch(/six labs/)
  })
})

describe("/labs/[slug]", () => {
  it.each([...MODEL_LAB_SLUGS])("renders the %s lab", async (slug) => {
    const lab = getModelLab(slug)!
    render(await LabDetailPage(params(slug)))
    expect(screen.getByRole("heading", { level: 1, name: lab.headline })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Our picks" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: lab.ask })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Every set-up we tested" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "How we test" })).toBeInTheDocument()
    expect(screen.getAllByTestId("lab-answer")).toHaveLength(4)
    expect(screen.getAllByTestId("lab-pick")).toHaveLength(4)
    // The menu marks the current lab.
    const menu = screen.getByRole("navigation", { name: "The six labs" })
    expect(within(menu).getByRole("link", { current: "page" })).toHaveAttribute("href", `/labs/${slug}`)
    // Names are hidden until a pick.
    expect(screen.queryAllByTestId("lab-reveal")).toHaveLength(0)
    // No preview banner, no Tell Claude, no visitor votes, no banned punctuation.
    const text = document.body.textContent ?? ""
    expect(text).not.toMatch(/Preview on the P520|Tell Claude|Visitors who chose/)
    expect(text.replace(/<[^>]+>/g, "")).not.toMatch(/§/)
  })

  it("shows the premium box with Fable, and the Astra main-task box only in Thinking", async () => {
    render(await LabDetailPage(params("thinking")))
    const premium = screen.getByTestId("lab-premium")
    expect(premium.textContent).toMatch(/Claude Fable 5\.1/)
    expect(within(premium).getByTestId("lab-premium-main").textContent).toMatch(/GPT-6 Astra/)
    cleanup()
    render(await LabDetailPage(params("research")))
    expect(screen.queryByTestId("lab-premium-main")).toBeNull()
  })

  it("says Fable skipped the flipchart photos in the Data lab only", async () => {
    render(await LabDetailPage(params("data")))
    expect(screen.getByTestId("lab-premium").textContent).toMatch(/except the flipchart photos/)
    cleanup()
    render(await LabDetailPage(params("thinking")))
    expect(screen.getByTestId("lab-premium").textContent).not.toMatch(/except the flipchart photos/)
  })

  it("is a 404 for any other slug, the old Arena and practise labs included", async () => {
    for (const slug of ["job-advert-claude-vs-chatgpt", "build-mcp-server", "nope"]) {
      await expect(LabDetailPage(params(slug))).rejects.toThrow("NEXT_NOT_FOUND")
    }
  })

  it("titles each page with its headline", async () => {
    const meta = await generateMetadata(params("building"))
    expect(meta.title).toBe("Which AI builds the best working tool?")
    expect(String(meta.description)).toMatch(/Tested \d+ to \d+ October 2026/)
    expect((await generateMetadata(params("nope"))).title).toBe("Lab not found")
  })
})

describe("Which would you use?", () => {
  it("reveals every name and our marks after a pick, and says where ours put it", async () => {
    const lab = getModelLab("thinking")!
    render(await LabDetailPage(params("thinking")))
    fireEvent.click(screen.getByRole("button", { name: "I would use answer B" }))
    const reveals = screen.getAllByTestId("lab-reveal")
    expect(reveals).toHaveLength(4)
    reveals.forEach((r, i) => expect(r.textContent).toContain(lab.answers[i]!.name))
    const b = lab.answers[1]!
    const result = screen.getByTestId("lab-result").textContent ?? ""
    expect(result).toContain(`You chose answer B, by ${b.name}.`)
    expect(result).toMatch(/Our marks put it (first|second|third|fourth) of these four/)
    expect(screen.queryByRole("button", { name: /I would use answer/ })).toBeNull()
    expect(screen.getByText("Your choice")).toBeInTheDocument()
  })

  it("frames Building apps sandboxed, never same-origin, with a Try it link", async () => {
    render(await LabDetailPage(params("building")))
    for (const frame of document.querySelectorAll("iframe")) {
      expect(frame.getAttribute("sandbox")).toBe("allow-scripts allow-forms allow-modals")
    }
    const tryLinks = screen.queryAllByRole("link", { name: "Try it" })
    for (const a of tryLinks) {
      expect(a.getAttribute("href")).toMatch(/^\/labs-files\/.+\/index\.html$/)
      expect(a).toHaveAttribute("target", "_blank")
    }
  })
})

describe("Every set-up we tested", () => {
  it("opens a row's written answer from the answer route", async () => {
    const lab = getModelLab("thinking")!
    const fetchMock = vi.fn(async (url: string) => {
      const setup = decodeURIComponent(url.split("/").pop()!)
      const res = await GET(new Request(`https://gwth.ai${url}`), {
        params: Promise.resolve({ slug: "thinking", setup }),
      })
      return res
    })
    vi.stubGlobal("fetch", fetchMock)
    render(await LabDetailPage(params("thinking")))
    const first = lab.table[0]!
    const label = `Answer from ${first.name}, ${first.level === "standard" ? "standard" : `${first.level} thinking`}`
    const button = screen.getAllByRole("button").find((b) => b.textContent === label)!
    expect(button).toBeDefined()
    fireEvent.click(button)
    expect(button).toHaveAttribute("aria-expanded", "true")
    await waitFor(() => expect(document.querySelector(`#answer-${first.setup.replace(/[^a-z0-9-]/gi, "-")} .lesson-prose`)).not.toBeNull())
    expect(fetchMock).toHaveBeenCalledWith(`/labs/thinking/answer/${encodeURIComponent(first.setup)}`)
    fireEvent.click(button)
    expect(button).toHaveAttribute("aria-expanded", "false")
    vi.unstubAllGlobals()
  })
})

describe("GET /labs/[slug]/answer/[setup]", () => {
  const call = (slug: string, setup: string) =>
    GET(new Request("https://gwth.ai/x"), { params: Promise.resolve({ slug, setup }) })

  it("renders a table row's markdown on the server", async () => {
    const setup = getModelLab("research")!.table[0]!.setup
    const res = await call("research", setup)
    expect(res.status).toBe(200)
    const body = (await res.json()) as { parts: { name: string; html: string }[] }
    expect(body.parts.map((p) => p.name)).toEqual(["revised_message.md", "briefing.md"])
    expect(body.parts[0]!.html).toMatch(/^<h1>|<p>/)
    expect(body.parts.every((p) => !/<script/i.test(p.html))).toBe(true)
  })

  it("is a 404 for a set-up that is not on the lab's table, or an unknown lab", async () => {
    expect((await call("research", "fable-5.1_max")).status).toBe(404)
    expect((await call("research", "../../secrets")).status).toBe(404)
    expect((await call("nope", "opus-5.5_medium")).status).toBe(404)
  })

  it("is a 404 while private content is closed to the caller", async () => {
    canView.mockResolvedValue(false)
    const setup = getModelLab("research")!.table[0]!.setup
    expect((await call("research", setup)).status).toBe(404)
  })
})
