import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ArenaLabDetail } from "./arena-lab-detail"
import { getArenaLab } from "@/lib/data/model-arena"
import type { ModelArenaLab } from "@/lib/types"

const pilot = getArenaLab("job-advert-claude-vs-chatgpt") as ModelArenaLab

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
