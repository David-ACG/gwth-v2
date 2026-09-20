import { render, screen, cleanup, within } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import { LabsFde } from "./labs-fde"
import { getLiveArenaLabs, getArchivedArenaLabs } from "@/lib/data/model-arena"
import type { ModelArenaLab } from "@/lib/types"

afterEach(cleanup)

const liveLabs = getLiveArenaLabs()

function renderIndex(labs: ModelArenaLab[] = liveLabs) {
  return render(
    <LabsFde
      liveLabs={labs}
      archivedArenaLabs={getArchivedArenaLabs()}
      legacyArchive={[]}
    />
  )
}

/**
 * The /labs index, against David's annotation a-20260914-205407-b3dbb2:
 *
 * > I think we definitely want to demo labs to CIPD, but they need to look
 * > very different to this. They need a video for each lab and the menu here
 * > on the labs page should show a thumbnail from the video (like youtube) so
 * > people understand just by glancing what it's going to be about. For
 * > example, spreadsheets
 *
 * Two decisions are frozen here. A card must be understandable at a glance:
 * a preview of the lab's own material, a plain task cue, the matchup, one
 * outcome line. And a card must never claim a video that does not exist: the
 * thumbnail he asked for arrives with the video, and until then the card says
 * "planned" instead of drawing a play button over nothing.
 *
 * Assertions are on semantics and data attributes rather than on sentences, so
 * the copy can be rewritten without the suite having to be rewritten with it.
 */
describe("LabsFde live cards", () => {
  it("gives every live lab a preview panel and a plain task cue", () => {
    renderIndex()
    const cards = screen.getAllByTestId("arena-lab-card")
    expect(cards).toHaveLength(liveLabs.length)

    for (const card of cards) {
      expect(within(card).getByTestId("lab-preview")).toBeInTheDocument()
      const cue = within(card).getByTestId("lab-task-cue")
      expect(cue.textContent?.trim().length ?? 0).toBeGreaterThan(3)
    }
  })

  it("previews the spreadsheet lab with the poster from its own video", () => {
    // The CSS specimen was the honest stand-in while no lab had media. The
    // spreadsheet lab now has a real guide, so its card shows a real still
    // from that guide, which is the "like youtube" thumbnail David asked for.
    renderIndex()
    const card = screen
      .getAllByTestId("arena-lab-card")
      .find((c) => c.getAttribute("href")?.includes("messy-spreadsheet"))
    expect(card).toBeDefined()
    expect(within(card!).getByTestId("lab-preview")).toHaveAttribute(
      "data-preview",
      "video"
    )
    expect(within(card!).queryByTestId("lab-specimen-grid")).toBeNull()
  })

  it("quotes the lab's own material on every card that has no video yet", () => {
    renderIndex()
    for (const lab of liveLabs) {
      if (lab.video || !lab.preview) continue
      const card = screen
        .getAllByTestId("arena-lab-card")
        .find((c) => c.getAttribute("href")?.endsWith(`/labs/${lab.slug}`))!
      expect(within(card).getByTestId("lab-preview")).toHaveAttribute(
        "data-preview",
        "specimen"
      )
      const specimen = lab.preview.specimen
      // Every quoted cell really appears in the lab's own shared prompt: the
      // preview is a quotation from the lab, never an illustration of it.
      if (specimen.kind === "grid") {
        for (const row of specimen.rows) {
          for (const cell of row.cells) {
            expect(lab.prompt).toContain(cell)
          }
        }
      }
    }
  })

  it("claims a video only where one exists, and says planned everywhere else", () => {
    const { container } = renderIndex()

    // The index never plays anything: a card links to the lab page, so a play
    // control here would navigate rather than play. That stays true even now
    // that one lab has real media.
    expect(container.querySelector("video")).toBeNull()
    expect(screen.queryByRole("button", { name: /play/i })).toBeNull()

    for (const card of screen.getAllByTestId("arena-lab-card")) {
      const lab = liveLabs.find((l) =>
        card.getAttribute("href")?.endsWith(`/labs/${l.slug}`)
      )!
      const state = card.getAttribute("data-video-state")
      const label = within(card).getByTestId("lab-video-state")
      if (lab.video) {
        // Real media, so the card shows its own poster frame and the running
        // time the lab AUTHORED. Nothing here estimates a duration.
        expect(state).toBe("available")
        expect(within(card).getByTestId("lab-preview")).toHaveAttribute(
          "data-preview",
          "video"
        )
        expect(label).toHaveTextContent(
          `Video guide, ${lab.video.durationLabel}`
        )
      } else {
        expect(state).toBe("planned")
        expect(label).toHaveTextContent(/planned/i)
      }
    }
  })

  it("gives the messy-spreadsheet lab a real, complete video guide", () => {
    // The pilot (bead gwth-launch-88z.32.23). A lab video ships as a set or it
    // does not ship: a playable source, a poster frame taken from that video,
    // a captions track, and a running time written by a person.
    const lab = liveLabs.find(
      (l) => l.slug === "messy-spreadsheet-claude-vs-chatgpt"
    )!
    expect(lab.video).toBeDefined()
    expect(lab.video!.src).toMatch(/\.mp4$/)
    expect(lab.video!.poster).toMatch(/\.(png|jpg|webp)$/)
    expect(lab.video!.captions).toMatch(/\.vtt$/)
    expect(lab.video!.durationLabel).toBeTruthy()
  })

  it("shows a real poster and running time once a lab has real media", () => {
    const [first, ...rest] = liveLabs
    const withVideo: ModelArenaLab = {
      ...first!,
      video: {
        src: "/labs/video/example.mp4",
        poster: "/labs/video/example.png",
        durationLabel: "4 min",
      },
    }
    renderIndex([withVideo, ...rest])

    const card = screen
      .getAllByTestId("arena-lab-card")
      .find((c) => c.getAttribute("href")?.includes(withVideo.slug))!
    expect(card).toHaveAttribute("data-video-state", "available")
    expect(within(card).getByTestId("lab-preview")).toHaveAttribute(
      "data-preview",
      "video"
    )
    expect(within(card).getByTestId("lab-video-state")).toHaveTextContent(
      "Video guide, 4 min"
    )
  })

  it("drops the matchup suffix from a card title that already carries it", () => {
    renderIndex()
    const card = screen
      .getAllByTestId("arena-lab-card")
      .find((c) => c.getAttribute("href")?.includes("messy-spreadsheet"))!
    const heading = within(card).getByRole("heading", { level: 3 })
    expect(heading).toHaveTextContent("Make sense of a messy spreadsheet")
    expect(heading.textContent).not.toMatch(/Claude vs ChatGPT/)
    // The matchup is still on the card, once, on its own line.
    expect(within(card).getByText("Claude vs ChatGPT")).toBeInTheDocument()
  })

  it("leads with one outcome line rather than the whole brief", () => {
    renderIndex()
    for (const lab of liveLabs) {
      const card = screen
        .getAllByTestId("arena-lab-card")
        .find((c) => c.getAttribute("href")?.includes(lab.slug))!
      // The four-line clamped brief is what made every card look the same.
      expect(card.textContent).not.toContain(lab.brief)
      expect(card).toHaveTextContent(lab.preview!.outcome)
    }
  })

  it("keeps every live lab linked to its own page", () => {
    renderIndex()
    const hrefs = screen
      .getAllByTestId("arena-lab-card")
      .map((c) => c.getAttribute("href"))
    expect(hrefs).toEqual(liveLabs.map((lab) => `/labs/${lab.slug}`))
  })

  it("still renders the empty state when nothing is live", () => {
    renderIndex([])
    expect(screen.queryAllByTestId("arena-lab-card")).toHaveLength(0)
    expect(
      screen.getByRole("heading", { name: /no live labs/i })
    ).toBeInTheDocument()
  })
})
