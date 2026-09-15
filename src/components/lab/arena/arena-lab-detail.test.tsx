import { describe, it, expect, afterEach } from "vitest"
import { render, screen, cleanup, within } from "@testing-library/react"
import { ArenaLabDetail } from "./arena-lab-detail"
import { getArenaLab } from "@/lib/data/model-arena"
import type { ModelArenaLab } from "@/lib/types"

afterEach(cleanup)

const pilot = getArenaLab("job-advert-claude-vs-chatgpt") as ModelArenaLab
const spreadsheet = getArenaLab(
  "messy-spreadsheet-claude-vs-chatgpt"
) as ModelArenaLab

describe("ArenaLabDetail", () => {
  it("renders the matchup, both verbatim outputs, rubric and verdict", () => {
    render(<ArenaLabDetail lab={pilot} />)

    // Matchup header names both tools.
    expect(
      screen.getByRole("heading", { level: 1, name: pilot.title })
    ).toBeInTheDocument()

    // Both outputs render, verbatim (raw markdown markers preserved).
    const outputs = screen.getAllByTestId("arena-output")
    expect(outputs).toHaveLength(2)
    // ChatGPT's raw heading marker survives verbatim (the rubric judges it).
    expect(screen.getByText(/## Registered Nurse/)).toBeInTheDocument()

    // Rubric criteria and the dated verdict/freshness note appear.
    expect(screen.getByText(pilot.rubric[0]!.criterion)).toBeInTheDocument()
    expect(screen.getByText(pilot.verdict.freshnessNote)).toBeInTheDocument()

    // Live labs carry no archived banner.
    expect(screen.queryByTestId("archived-banner")).not.toBeInTheDocument()
  })

  it("shows an archived banner for a superseded lab", () => {
    const archived: ModelArenaLab = { ...pilot, status: "archived" }
    render(<ArenaLabDetail lab={archived} />)
    expect(screen.getByTestId("archived-banner")).toBeInTheDocument()
  })
})

/**
 * The opening, against David's annotation a-20260914-205206-82935a, which was
 * boxed around exactly this part of the spreadsheet lab:
 *
 * > I think all these labs need a really easy to follow video, and then maybe
 * > this text can be below it. Currently, it looks too complicated and too
 * > much text, which is difficult to read, and there's not even a voice reader
 *
 * The frozen decisions: the first screen says what the lab is before it says
 * how the models were run; the video state is stated rather than mimed; there
 * is a read-aloud route; and none of the evidence is lost in the process.
 */
describe("ArenaLabDetail opening", () => {
  it("opens with the lab in a sentence, then what the reader decides", () => {
    render(<ArenaLabDetail lab={spreadsheet} />)

    expect(screen.getByText(spreadsheet.summary!)).toBeInTheDocument()
    expect(screen.getByTestId("lab-outcome")).toHaveTextContent(
      spreadsheet.preview!.outcome
    )
  })

  it("moves the model provenance below the introduction, without losing it", () => {
    render(<ArenaLabDetail lab={spreadsheet} />)

    const disclosure = screen.getByTestId("how-run")
    expect(disclosure.tagName).toBe("DETAILS")
    // Still verbatim, still exact: how each tool was run is evidence.
    for (const contestant of spreadsheet.matchup) {
      expect(within(disclosure).getByText(contestant.howRun)).toBeInTheDocument()
      expect(
        within(disclosure).getByText(contestant.modelLabel ?? contestant.modelId)
      ).toBeInTheDocument()
    }
  })

  it("puts the raw shared prompt behind its own disclosure, unedited", () => {
    render(<ArenaLabDetail lab={spreadsheet} />)

    const disclosure = screen.getByTestId("shared-prompt")
    expect(disclosure.tagName).toBe("DETAILS")
    const block = disclosure.querySelector("pre")
    expect(block).not.toBeNull()
    expect(block!.textContent).toBe(spreadsheet.prompt)
  })

  it("states that the video guide is planned, and renders no player", () => {
    const { container } = render(<ArenaLabDetail lab={spreadsheet} />)

    const panel = screen.getByTestId("lab-video-guide")
    expect(panel).toHaveAttribute("data-video-state", "planned")
    expect(panel).toHaveTextContent(/planned/i)
    // No media element and no play control: nothing to press that cannot work.
    expect(container.querySelector("video")).toBeNull()
    expect(screen.queryByRole("button", { name: /play/i })).toBeNull()
  })

  it("plays a real video, with captions, once the lab carries one", () => {
    const withVideo: ModelArenaLab = {
      ...spreadsheet,
      video: {
        src: "/labs/video/example.mp4",
        poster: "/labs/video/example.png",
        captions: "/labs/video/example.vtt",
        durationLabel: "4 min",
      },
    }
    const { container } = render(<ArenaLabDetail lab={withVideo} />)

    const panel = screen.getByTestId("lab-video-guide")
    expect(panel).toHaveAttribute("data-video-state", "available")
    const video = container.querySelector("video")
    expect(video).not.toBeNull()
    expect(video).toHaveAttribute("controls")
    expect(video!.querySelector("track[kind='captions']")).not.toBeNull()
    // A fallback line for a browser that cannot play it.
    expect(panel).toHaveTextContent(/written walkthrough below/i)
  })

  it("offers a read-aloud route in the opening", () => {
    render(<ArenaLabDetail lab={spreadsheet} />)
    expect(screen.getByTestId("lab-listen")).toBeInTheDocument()
  })

  it("carries a jump list whose every target exists on the page", () => {
    const { container } = render(<ArenaLabDetail lab={spreadsheet} />)

    const nav = screen.getByRole("navigation", { name: /sections of this lab/i })
    const links = within(nav).getAllByRole("link")
    expect(links.length).toBeGreaterThanOrEqual(4)
    for (const link of links) {
      const id = link.getAttribute("href")!.slice(1)
      expect(container.querySelector(`#${id}`)).not.toBeNull()
    }
  })

  it("keeps the comparison whole: both answers, the rubric and the verdict", () => {
    render(<ArenaLabDetail lab={spreadsheet} />)

    const outputs = screen.getAllByTestId("arena-output")
    expect(outputs).toHaveLength(2)
    for (const output of spreadsheet.outputs) {
      const column = outputs.find((el) => el.textContent?.includes(output.by))!
      expect(column.textContent).toContain(output.verbatim)
    }
    for (const item of spreadsheet.rubric) {
      expect(screen.getByText(item.criterion)).toBeInTheDocument()
    }
    expect(screen.getByText(spreadsheet.verdict.callText)).toBeInTheDocument()
    expect(
      screen.getByText(spreadsheet.verdict.freshnessNote)
    ).toBeInTheDocument()
  })

  it("survives a lab authored before the preview fields existed", () => {
    const bare: ModelArenaLab = { ...spreadsheet }
    delete bare.summary
    delete bare.preview
    render(<ArenaLabDetail lab={bare} />)

    expect(screen.queryByTestId("lab-outcome")).toBeNull()
    expect(screen.getByText(bare.brief)).toBeInTheDocument()
    expect(screen.getByTestId("lab-video-guide")).toHaveAttribute(
      "data-video-state",
      "planned"
    )
  })
})
