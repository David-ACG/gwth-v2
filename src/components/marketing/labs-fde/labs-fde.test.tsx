import { aboutCost } from "@/lib/model-lab-format"
import { render, screen, cleanup, within, fireEvent } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import { CostChart, shortRunsSentence, LabsFde } from "./labs-fde"
import { getModelLabIndex } from "@/lib/data/model-lab"
import type { ModelLabCostChart } from "@/lib/types"

afterEach(cleanup)

const index = getModelLabIndex()

function renderIndex() {
  return render(<LabsFde index={index} />)
}

/**
 * The /labs index after David's 2026-10-21 decision (option A): the four Model
 * Arena labs went and the six Model Lab pages came in. Assertions are on the
 * data and on semantics, so the copy can be rewritten (it goes through the
 * latest Sol) without the suite being rewritten with it.
 */
describe("LabsFde, the six labs", () => {
  it("shows one card per lab, each linked to its own page", () => {
    renderIndex()
    const cards = screen.getAllByTestId("model-lab-card")
    expect(cards).toHaveLength(6)
    expect(cards.map((c) => c.getAttribute("href"))).toEqual([
      "/labs/research",
      "/labs/content",
      "/labs/thinking",
      "/labs/building",
      "/labs/data",
      "/labs/automation",
    ])
  })

  it("gives each card the lab's question, best pick and best value with score and cost", () => {
    renderIndex()
    for (const lab of index.labs) {
      const card = screen.getByRole("link", { name: `${lab.sp_name} lab: ${lab.headline}` })
      const text = card.textContent ?? ""
      expect(text).toContain(lab.headline)
      expect(text).toContain(lab.best.name)
      expect(text).toContain(`${lab.best.score} out of 100, ${aboutCost(lab.best.cost)} a task`)
      expect(text).toContain(lab.value.name)
      expect(text).toContain(`${lab.value.score} out of 100, ${aboutCost(lab.value.cost)} a task`)
      expect(text).not.toContain("about under")
    }
  })

  it("says what the labs are: same real UK tasks, two kinds of marking, nobody pays us, when", () => {
    const { container } = renderIndex()
    const text = container.textContent ?? ""
    expect(text).toMatch(/same real UK work tasks/)
    expect(text).toMatch(/Computer checks and AI judges/)
    expect(text).toMatch(/No AI company pays us/)
    expect(text).toMatch(/Tested October 2026/)
    expect(screen.getByRole("heading", { name: "How we test" })).toBeInTheDocument()
  })

  it("states the model and set-up counts from the data", () => {
    const { container } = renderIndex()
    expect(container.textContent).toContain(
      `${index.model_count} models, ${index.setup_count} set-ups`,
    )
  })

  it("carries none of the Arena wording and no banned punctuation", () => {
    const { container } = renderIndex()
    const text = container.textContent ?? ""
    expect(text).not.toMatch(/arena|head-to-head|matchup|rubric|archive/i)
    expect(text).not.toMatch(/[–—§]/)
  })
})

describe("CostChart", () => {
  it("draws every set-up in the export, dearest first", () => {
    renderIndex()
    const chart = screen.getByTestId("labs-cost-chart")
    const rows = within(chart.querySelector("ol")!).getAllByRole("listitem")
    expect(rows).toHaveLength(index.cost_chart.rows.length)
    expect(rows.length).toBeGreaterThan(30)
    const costs = index.cost_chart.rows.map((r) => r.cost_gbp)
    expect([...costs].sort((a, b) => b - a)).toEqual(costs)
    rows.forEach((row, i) => {
      const r = index.cost_chart.rows[i]!
      expect(row.textContent).toContain(r.name)
      expect(row.textContent).toContain(r.cost)
      expect(row.textContent).toContain(String(r.score))
    })
  })

  it("counts the tasks from the data rather than a fixed 24", () => {
    renderIndex()
    expect(
      screen.getByRole("heading", {
        name: `Test costs and average scores across ${index.cost_chart.tasks} tasks`,
      }),
    ).toBeInTheDocument()
    expect(index.cost_chart.tasks).toBe(
      index.labs.reduce((sum, lab) => sum + lab.tasks, 0),
    )
  })

  it("marks a premium set-up with the word premium under its name", () => {
    renderIndex()
    const chart = screen.getByTestId("labs-cost-chart")
    const premium = within(chart)
      .getAllByRole("listitem")
      .filter((li) => li.getAttribute("data-premium") === "true")
    expect(premium.length).toBe(index.cost_chart.rows.filter((r) => r.premium).length)
    for (const li of premium) expect(li.textContent).toMatch(/premium/)
    // Fable is premium and is on the chart.
    expect(premium.some((li) => /Claude Fable/.test(li.textContent ?? ""))).toBe(true)
  })

  it("says when a set-up ran fewer tasks than the rest, and leaves the rest alone", () => {
    const chart: ModelLabCostChart = {
      tasks: 25,
      rows: [
        { setup: "fable-5.1_max", name: "Claude Fable 5.1", level: "max", maker: "Anthropic", premium: true, cost_gbp: 85, cost: "£85.00", score: 94, tasks_run: 24 },
        { setup: "gpt-6-astra_medium", name: "GPT-6 Astra", level: "medium", maker: "OpenAI", premium: true, cost_gbp: 20, cost: "£20.00", score: 95, tasks_run: 25 },
        { setup: "gpt-6-luna_medium", name: "GPT-6 Luna", level: "medium", maker: "OpenAI", premium: false, cost_gbp: 0.1, cost: "10p", score: 78, tasks_run: 25 },
      ],
    }
    render(<CostChart chart={chart} />)
    const [fable, astra, luna] = within(document.querySelector("ol")!).getAllByRole("listitem")
    expect(fable!.textContent).toMatch(/premium · ran 24 of 25 tasks/)
    expect(astra!.textContent).toMatch(/premium/)
    expect(astra!.textContent).not.toMatch(/ran \d+ of/)
    expect(luna!.textContent).not.toMatch(/premium|ran \d+ of/)
    expect(screen.getByRole("heading", { name: /across 25 tasks/ })).toBeInTheDocument()
  })

  it("explains the bar, the number and the noise under the chart", () => {
    renderIndex()
    const chart = screen.getByTestId("labs-cost-chart")
    expect(chart.textContent).toMatch(/Each bar shows the total cost of the tasks that set-up ran/)
    expect(chart.textContent).toMatch(/average of its six lab scores, out of 100/)
    expect(chart.textContent).toMatch(/small score differences may change on another run/)
    expect(chart.textContent).toMatch(/App subscriptions are charged separately/)
  })

  it("names the set-ups that ran fewer tasks from the data, not a fixed sentence", () => {
    const row = { name: "X", level: "max", maker: "M", premium: false, cost_gbp: 1, cost: "£1.00", score: 90 }
    expect(shortRunsSentence({ tasks: 25, rows: [{ ...row, setup: "a", tasks_run: 25 }] })).toBe(
      "Every set-up ran all 25 tasks.",
    )
    expect(
      shortRunsSentence({
        tasks: 25,
        rows: [
          { ...row, setup: "fable-5.1_max", name: "Claude Fable 5.1", tasks_run: 24 },
          { ...row, setup: "fable-5.1_high", name: "Claude Fable 5.1", tasks_run: 24 },
          { ...row, setup: "b", tasks_run: 25 },
        ],
      }),
    ).toBe("Claude Fable 5.1 ran 24 of the 25 tasks; the other set-ups ran all 25.")
  })
})

describe("CostChart sort and colours (David, 2026-10-23)", () => {
  const row = { level: "medium", premium: false, tasks_run: 25 }
  const chart: ModelLabCostChart = {
    tasks: 25,
    rows: [
      { ...row, setup: "a", name: "Claude Opus 5.5", maker: "Anthropic", cost_gbp: 10, cost: "£10.00", score: 92 },
      { ...row, setup: "b", name: "GPT-6.1 Sol", maker: "OpenAI", cost_gbp: 2, cost: "£2.00", score: 94 },
      { ...row, setup: "c", name: "Kimi K3", maker: "Moonshot AI", cost_gbp: 5, cost: "£5.00", score: 94 },
      { ...row, setup: "d", name: "GPT-6 Astra", maker: "OpenAI", premium: true, cost_gbp: 20, cost: "£20.00", score: 93 },
    ],
  }
  const names = () => screen.getAllByRole("listitem").filter((li) => li.closest("ol")).map((li) => li.textContent?.split(",")[0])

  it("sorts by cost first, then by score with the cheaper of two equal scores first", () => {
    render(<CostChart chart={chart} />)
    expect(names()).toEqual(["GPT-6 Astra", "Claude Opus 5.5", "Kimi K3", "GPT-6.1 Sol"])
    const score = screen.getByRole("button", { name: "Score" })
    fireEvent.click(score)
    expect(score).toHaveAttribute("aria-pressed", "true")
    expect(names()).toEqual(["GPT-6.1 Sol", "Kimi K3", "GPT-6 Astra", "Claude Opus 5.5"])
  })

  it("colours each bar by company, with a key, and other makers share one colour", () => {
    render(<CostChart chart={chart} />)
    const key = screen.getByRole("list", { name: "Bar colours" })
    expect(key.textContent).toMatch(/Anthropic \(Claude\).*OpenAI \(GPT\).*Google \(Gemini\).*Other makers/)
    const fills = [...document.querySelectorAll("ol [data-maker]")].map((e) => e.getAttribute("data-maker"))
    expect(fills).toEqual(["openai", "anthropic", "other", "openai"])
  })
})
