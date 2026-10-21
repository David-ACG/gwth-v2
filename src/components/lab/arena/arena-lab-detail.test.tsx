import { describe, it, expect, afterEach } from "vitest"
import { render, screen, cleanup, within } from "@testing-library/react"
import {
  ArenaLabDetail,
  LONG_ANSWER_CHARS,
  splitLongAnswer,
} from "./arena-lab-detail"
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
 * how the models were run; a video is shown only where one exists, never
 * mimed; there is a read-aloud route; and none of the evidence is lost in the
 * process.
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

  it("shows no video panel where no media exists", () => {
    // Only the spreadsheet lab has a video. The others used to show a "Video
    // guide planned" panel ("Every lab is getting a short video... This one
    // has not been recorded yet"), which the launch readiness review of
    // 2026-10-20 ruled a promise of unfinished work. Now they show nothing.
    expect(pilot.video).toBeUndefined()
    const { container } = render(<ArenaLabDetail lab={pilot} />)

    expect(screen.queryByTestId("lab-video-guide")).toBeNull()
    expect(container.textContent).not.toMatch(/planned|not been recorded/i)
    // No media element and no play control: nothing to press that cannot work.
    expect(container.querySelector("video")).toBeNull()
    expect(screen.queryByRole("button", { name: /play/i })).toBeNull()
  })

  it("plays the real guide on the lab that has one, with its captions", () => {
    // bead gwth-launch-88z.32.23. The seam was built empty; this is the lab
    // that now carries real media, so the panel must be the player and the
    // captions track must be wired from the lab's own data.
    const { container } = render(<ArenaLabDetail lab={spreadsheet} />)

    const panel = screen.getByTestId("lab-video-guide")
    expect(panel).toHaveAttribute("data-video-state", "available")
    const video = container.querySelector("video")
    expect(video).not.toBeNull()
    expect(video).toHaveAttribute("controls")
    expect(video).toHaveAttribute("poster", spreadsheet.video!.poster)
    expect(video!.querySelector("source")).toHaveAttribute(
      "src",
      spreadsheet.video!.src
    )
    const track = video!.querySelector("track[kind='captions']")
    expect(track).not.toBeNull()
    expect(track).toHaveAttribute("src", spreadsheet.video!.captions)
    // The running time is authored, never computed from the file.
    expect(panel).toHaveTextContent(spreadsheet.video!.durationLabel!)
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
    // The verdict is authored as short paragraphs; every one is on the page.
    for (const paragraph of spreadsheet.verdict.callText.split(/\n\n+/)) {
      expect(screen.getByText(paragraph)).toBeInTheDocument()
    }
    expect(
      screen.getByText(spreadsheet.verdict.freshnessNote)
    ).toBeInTheDocument()
  })

  it("survives a lab authored before the preview fields existed", () => {
    const bare: ModelArenaLab = { ...spreadsheet }
    delete bare.summary
    delete bare.preview
    // A lab authored before these fields existed had no video either.
    delete bare.video
    render(<ArenaLabDetail lab={bare} />)

    expect(screen.queryByTestId("lab-outcome")).toBeNull()
    expect(screen.getByText(bare.brief)).toBeInTheDocument()
    expect(screen.queryByTestId("lab-video-guide")).toBeNull()
  })
})

const citeSources = getArenaLab(
  "cite-your-sources-claude-vs-chatgpt"
) as ModelArenaLab
const weeklyChore = getArenaLab(
  "automate-a-weekly-chore-claude-vs-chatgpt"
) as ModelArenaLab

/**
 * The launch readiness review (2026-10-20, Claude and the latest Sol). The
 * labs are not re-run for the launch, so each page says plainly when it was
 * tested and that both tools have moved on. The models' own answers stay
 * exactly as they were; only the surrounding GWTH words changed.
 */
describe("ArenaLabDetail launch readiness", () => {
  it("says near the top when it was tested, with which models, and that answers may differ now", () => {
    render(<ArenaLabDetail lab={pilot} />)
    const note = screen.getByTestId("lab-tested-note").textContent ?? ""
    expect(note).toMatch(/Tested on 23 July 2026/)
    expect(note).toContain("Claude Opus 4.8")
    expect(note).toContain("OpenAI GPT-5.6 Sol")
    // Sol's final check (2026-10-20) asked for "AI tools change over time"
    // rather than a claim about each maker's release history.
    expect(note).toMatch(/change over time/i)
    expect(note).toMatch(/may differ/i)
  })

  it("drops the 1M-context jargon and names the Claude model one way", () => {
    const { container } = render(<ArenaLabDetail lab={pilot} />)
    expect(container.textContent).not.toMatch(/1M-context/i)
  })

  it("keeps an abbreviation in capitals in the kicker", () => {
    render(<ArenaLabDetail lab={pilot} />)
    expect(screen.getByText("Lab, HR")).toBeInTheDocument()
  })

  it("points at no archived version that does not exist", () => {
    for (const lab of [pilot, spreadsheet, citeSources, weeklyChore]) {
      cleanup()
      const { container } = render(<ArenaLabDetail lab={lab} />)
      expect(container.textContent).not.toMatch(/archived version/i)
    }
  })

  it("makes every source address in an answer a link you can open", () => {
    const { container } = render(<ArenaLabDetail lab={citeSources} />)
    const hrefs = Array.from(
      container.querySelectorAll('[data-testid="arena-output"] a')
    ).map((a) => a.getAttribute("href"))
    expect(hrefs).toContain("https://www.gov.uk/national-minimum-wage-rates")
    expect(hrefs).toContain(
      "https://www.gov.uk/guidance/statutory-sick-pay-manually-calculate-your-employees-payments"
    )
    // A markdown link keeps its closing bracket outside the address.
    expect(hrefs.every((href) => !href?.endsWith(")"))).toBe(true)
    // And the answer text itself is untouched.
    for (const output of citeSources.outputs) {
      const column = screen
        .getAllByTestId("arena-output")
        .find((el) => el.textContent?.includes(output.by))!
      expect(column.textContent).toContain(output.verbatim)
    }
  })

  it("tells readers to check the address bar shows www.gov.uk", () => {
    const { container } = render(<ArenaLabDetail lab={citeSources} />)
    expect(container.textContent).toMatch(/address bar/i)
    expect(container.textContent).toContain("www.gov.uk")
  })

  it("does not credit Claude for a link that covers all three figures", () => {
    expect(citeSources.verdict.callText).not.toMatch(
      /covers all three figures/i
    )
    expect(citeSources.verdict.callText).toMatch(/not the redundancy cap/i)
  })

  it("credits ChatGPT for leaving out the 31 March row too", () => {
    expect(spreadsheet.verdict.callText).not.toMatch(
      /two problems ChatGPT does not mention at all/i
    )
    expect(spreadsheet.verdict.callText).toMatch(
      /Both tools leave out the 31 March row/
    )
  })

  it("folds a very long answer behind 'Show the full answer', losing nothing", () => {
    render(<ArenaLabDetail lab={weeklyChore} />)
    const more = screen.getAllByTestId("answer-more")
    expect(more.length).toBeGreaterThan(0)
    for (const details of more) {
      expect(details.tagName).toBe("DETAILS")
      expect(details.querySelector("summary")).toHaveTextContent(
        "Show the full answer"
      )
    }
    for (const output of weeklyChore.outputs) {
      const [opening, rest] = splitLongAnswer(output.verbatim)
      expect(opening + rest).toBe(output.verbatim)
      if (output.verbatim.length > LONG_ANSWER_CHARS) {
        expect(rest.length).toBeGreaterThan(0)
        expect(opening.length).toBeLessThan(output.verbatim.length / 2)
      }
    }
  })

  it("leaves a short answer fully open", () => {
    render(<ArenaLabDetail lab={citeSources} />)
    expect(screen.queryAllByTestId("answer-more")).toHaveLength(0)
  })

  it("does not reward clicking past Google's warning", () => {
    const text = weeklyChore.verdict.callText
    expect(text).not.toMatch(/unsafe means unreviewed/i)
    expect(text).not.toMatch(/most people give up|lose your nerve/i)
    expect(text).not.toMatch(/next two years/i)
    expect(weeklyChore.brief).not.toMatch(/still be working next year/i)
    expect(text).toMatch(/read the list of permissions/i)
  })
})
