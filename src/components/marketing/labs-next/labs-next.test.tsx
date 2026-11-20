import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { sortRows } from "@/components/marketing/labs-fde/cost-chart"
import { getModelLab, getModelLabIndex } from "@/lib/data/model-lab"
import { aboutCost, levelLabel } from "@/lib/model-lab-format"
import type { ModelLabCostChart, ModelLabIndex, ModelLabSlug } from "@/lib/types"
import { callouts, CostMap, costTick, plotScales } from "./cost-map"
import { COPY, LAB_INTRO, LABS_FILM, LabsNext, listOf, tasksPerLab } from "./labs-next"

afterEach(cleanup)

const index = getModelLabIndex()
const plain: Partial<Record<ModelLabSlug, string>> = Object.fromEntries(
  index.labs.map((lab) => [lab.sp, getModelLab(lab.sp)!.sig_plain])
)

function renderPage(over: Partial<ModelLabIndex> = {}) {
  return render(<LabsNext index={{ ...index, ...over }} plain={plain} />)
}

const pageText = (container: HTMLElement) => (container.textContent ?? "").replace(/\s+/g, " ")

/** The picture whose file ends with `file` (next/image writes the path URL-encoded). */
const picture = (within: Element, file: string) =>
  [...within.querySelectorAll("img")].find((img) =>
    decodeURIComponent(img.getAttribute("src") ?? "").includes(`/labs/${file}`)
  ) ?? null

/**
 * The Labs page in the family of the new home page (19 Nov 2026). Assertions
 * are on the data and on semantics, as in `labs-fde.test.tsx`, so the copy can
 * go through the words check without the suite being rewritten with it.
 */
describe("LabsNext, what a lab is", () => {
  it("says plainly what a lab is, under one h1, and explains the word model as it uses it", () => {
    renderPage()
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Which AI should you use? See for yourself."
    )
    // 20 Nov 2026, David: "she didn't understand what a model was". The first
    // sentence under the headline says what an AI model is.
    const what = screen.getByTestId("labs-what")
    expect(what).toHaveTextContent(COPY.heroWhat)
    expect(what.textContent).toMatch(/^An AI model is the part of a chat app that writes your answer/)
    const second = screen.getByTestId("labs-uk-note")
    expect(second.textContent).toMatch(/names hidden/)
    expect(second.textContent).toMatch(/free/i)
  })

  it("keeps the facts the old page stated: UK tasks, two kinds of marking, nobody pays us", () => {
    const { container } = renderPage()
    const text = pageText(container)
    expect(text).toMatch(/same real UK work tasks?/)
    expect(text).toMatch(/Computer checks and AI judges/)
    expect(text).toMatch(/No AI company pays us/)
    // The six kinds of work, named from the data (the words check, 20 Nov 2026).
    expect(text).toContain(`AI superpower: ${listOf(index.labs.map((lab) => lab.sp_name))}.`)
    expect(listOf(["Research", "Content", "Thinking"])).toBe("Research, Content and Thinking")
    expect(text).not.toMatch(/\{[a-zA-Z]+\}/)
  })

  it("states the counts and free price, without dating the check", () => {
    renderPage()
    const facts = pageText(screen.getByTestId("labs-facts"))
    expect(facts).toContain(`${index.labs.length}labs, one for each AI superpower`)
    expect(facts).toContain(`${index.cost_chart.tasks}tasks based on real UK work`)
    expect(facts).toContain(
      `${index.model_count} models tested in ${index.setup_count} combinations of model and settings`
    )
    expect(facts).toContain("Free, no card required")
    expect(screen.queryByTestId("labs-tested")).not.toBeInTheDocument()
    expect(index.cost_chart.tasks).toBe(index.labs.reduce((sum, lab) => sum + lab.tasks, 0))
  })

  it("has real headings in order and one picture per theme with alt text", () => {
    const { container } = renderPage()
    const levels = [...container.querySelectorAll("h1, h2, h3, h4")].map((h) => Number(h.tagName[1]))
    expect(levels[0]).toBe(1)
    expect(levels.filter((l) => l === 1)).toHaveLength(1)
    levels.reduce((previous, level) => {
      expect(level - previous).toBeLessThanOrEqual(1)
      return level
    })
    for (const name of ["compare", "check", "your-own", ...index.labs.map((lab) => `v2/${lab.sp}`)]) {
      const light = picture(container, `${name}.jpg`)
      const dark = picture(container, `${name}-dark.jpg`)
      expect(light?.getAttribute("alt")?.length).toBeGreaterThan(40)
      expect(dark?.getAttribute("alt")).toBe(light?.getAttribute("alt"))
    }
  })
})

/**
 * David, 20 Nov 2026: "I asked my wife to watch the video and was surprised
 * when she didn't understand what a model was ... my wife has only used chat
 * GPT in chat mode and doesn't really understand how to change the model or
 * the thinking level." The explainer sits straight under the masthead.
 */
describe("LabsNext, the explainer for a newcomer", () => {
  /** Model families and version numbers that must never be typed into the explainer. */
  const MODEL_NAMES =
    /GPT|Opus|Sonnet|Haiku|Fable|Astra|Luna|Terra|\bSol\b|Grok|Kimi|Qwen|Mistral|DeepSeek|Llama|GLM|Hydrogen|Carbon|Flash|\bPro\b|\bo\d\b/
  const VERSION = /\b\d+(\.\d+)+\b|\bv\d+\b|\b[A-Z][a-z]+ \d+(\.\d+)?\b/

  it("comes straight after the masthead and before the six labs, and the top button goes to it", () => {
    const { container } = renderPage()
    const sections = [...container.querySelectorAll("[data-section]")].map((s) =>
      s.getAttribute("data-section")
    )
    expect(sections.slice(0, 3)).toEqual(["masthead", "explainer", "labs"])
    const explainer = container.querySelector('[data-section="explainer"]')!
    expect(explainer.id).toBe("new-here")
    expect(within(explainer as HTMLElement).getByRole("heading", { level: 2 })).toHaveTextContent(
      COPY.explainerTitle
    )
    expect(screen.getByRole("link", { name: COPY.heroNew })).toHaveAttribute("href", "#new-here")
  })

  it("answers what a model is, what the thinking setting does and why the choice matters", () => {
    renderPage()
    const explainer = screen.getByTestId("labs-explainer")
    const titles = within(explainer)
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent)
    expect(titles).toEqual(COPY.questions.map((q) => q.title))
    expect(titles).toHaveLength(3)
    const text = pageText(explainer)
    expect(text).toMatch(/model is the part of a chat app that writes the answers you read/i)
    expect(text).toMatch(/Different companies make different models/)
    expect(text).toMatch(/how much work the model can do before replying/)
    expect(text).toMatch(/not always the most famous or the dearest/)
    // "Set-up" is the word the cards, the chart and the list use: explained here first.
    expect(pageText(screen.getByTestId("labs-set-up"))).toMatch(
      /set-up.+one model with one thinking setting/
    )
  })

  it("says where to look for the choice in a chat app without naming a menu, and that nothing needs changing", () => {
    renderPage()
    const where = screen.getByTestId("labs-where")
    expect(within(where).getByRole("heading", { level: 3 })).toHaveTextContent(COPY.whereTitle)
    const text = pageText(where)
    for (const app of ["ChatGPT", "Claude", "Gemini"]) expect(text).toContain(app)
    // No menu, button or plan name is typed: apps move and rename them.
    expect(text).not.toMatch(/drop-?down|toggle|\bPlus\b|\bPro\b|\bMax\b|settings menu/i)
    expect(text).toMatch(/do not need to change anything/)
  })

  it("says what the labs test, then the counts from the data", () => {
    renderPage()
    const test = pageText(screen.getByTestId("labs-test"))
    expect(test).toMatch(/same real (UK )?work task/)
    expect(test).toMatch(/names hidden/)
    expect(test).toMatch(/trap/)
    expect(test).toMatch(/cost/i)
    const explainer = document.querySelector('[data-section="explainer"]')!
    expect(explainer.contains(screen.getByTestId("labs-facts"))).toBe(true)
  })

  it("draws a made-up chat app whose two menus are real radio buttons, one chosen in each", () => {
    renderPage()
    const drawing = screen.getByTestId("labs-drawing")
    expect(drawing.tagName).toBe("FIGURE")
    expect(drawing.querySelector("figcaption")!.textContent).toBe(COPY.drawing.caption)
    expect(drawing.querySelector("img, svg")).toBeNull()
    const model = within(drawing).getByRole("group", { name: new RegExp(COPY.drawing.modelLabel) })
    const thinking = within(drawing).getByRole("group", {
      name: new RegExp(COPY.drawing.thinkingLabel),
    })
    for (const [group, choices] of [
      [model, COPY.drawing.modelChoices],
      [thinking, COPY.drawing.thinkingChoices],
    ] as const) {
      const radios = within(group).getAllByRole("radio") as HTMLInputElement[]
      expect(radios).toHaveLength(3)
      expect(radios.filter((r) => r.checked)).toHaveLength(1)
      for (const choice of choices) expect(within(group).getByLabelText(choice)).toBeInTheDocument()
    }
    // Trying a menu moves the choice; the drawing itself answers in CSS.
    const other = within(model).getByLabelText(COPY.drawing.modelChoices[2]) as HTMLInputElement
    fireEvent.click(other)
    expect(other.checked).toBe(true)
    expect(pageText(drawing)).toContain(COPY.drawing.question)
    for (const note of COPY.drawing.notes) expect(pageText(drawing)).toContain(note)
  })

  it("names no model and no model version anywhere in the words written for it", () => {
    const strings: string[] = []
    const collect = (value: unknown) => {
      if (typeof value === "string") strings.push(value)
      else if (value && typeof value === "object") Object.values(value).forEach(collect)
    }
    collect(COPY)
    collect(LAB_INTRO)
    expect(strings.length).toBeGreaterThan(40)
    for (const text of strings) {
      // The three chat apps may be named as apps, in the one "where to look" sentence.
      const checked = text === COPY.whereBody ? text.replace(/ChatGPT|Claude|Gemini/g, "") : text
      expect(checked, text).not.toMatch(/ChatGPT|Claude|Gemini/)
      expect(checked, text).not.toMatch(MODEL_NAMES)
      expect(checked, text).not.toMatch(VERSION)
      expect(text, text).not.toMatch(/[–—§!]/)
      expect(text, text).not.toMatch(/as of|last checked|at the time of writing/i)
    }
    // And on the page: the whole explainer section, as a visitor reads it.
    const { container } = renderPage()
    const explainer = pageText(container.querySelector('[data-section="explainer"]') as HTMLElement)
    expect(explainer.replace(/ChatGPT, Claude and Gemini/, "")).not.toMatch(MODEL_NAMES)
    for (const row of index.cost_chart.rows) expect(explainer).not.toContain(row.name)
    const masthead = pageText(container.querySelector('[data-section="masthead"]') as HTMLElement)
    expect(masthead).not.toMatch(MODEL_NAMES)
    for (const row of index.cost_chart.rows) expect(masthead).not.toContain(row.name)
  })
})

describe("LabsNext, the six labs", () => {
  it("shows one card per lab, each opening its own page", () => {
    renderPage()
    const cards = screen.getAllByTestId("model-lab-card")
    expect(cards).toHaveLength(6)
    expect(cards.map((c) => c.querySelector("a")?.getAttribute("href"))).toEqual([
      "/labs/research",
      "/labs/content",
      "/labs/thinking",
      "/labs/building",
      "/labs/data",
      "/labs/automation",
    ])
    for (const lab of index.labs) {
      expect(
        screen.getByRole("link", { name: `Open the ${lab.sp_name} lab: ${lab.headline}` })
      ).toHaveAttribute("href", `/labs/${lab.sp}`)
    }
  })

  it("gives each card the lab's question, its main task in plain English and what you decide", () => {
    renderPage()
    const cards = screen.getAllByTestId("model-lab-card")
    index.labs.forEach((lab, i) => {
      const card = cards[i]!
      expect(within(card).getByRole("heading", { level: 3, name: lab.sp_name })).toBeInTheDocument()
      const text = pageText(card)
      // A line for a beginner, then the lab's own question for a screen reader.
      expect(text).toContain(LAB_INTRO[lab.sp].line)
      expect(text).toContain(lab.headline)
      expect(text).toContain(`The main task: ${lab.sig_title}`)
      expect(text).toContain(plain[lab.sp]!)
      expect(text).toContain(`You decide: ${lab.ask}`)
      expect(text).toContain(`${lab.count} set-ups compared`)
    })
  })

  it("names the best pick and the best value with score and cost, from the data", () => {
    renderPage()
    const cards = screen.getAllByTestId("model-lab-card")
    index.labs.forEach((lab, i) => {
      const text = pageText(cards[i]!)
      for (const pick of [lab.best, lab.value]) {
        expect(text).toContain(
          `${pick.name}, ${levelLabel(pick.level)}. ${pick.score} out of 100, ${aboutCost(pick.cost)} a task.`
        )
      }
      expect(text).not.toContain("about under")
    })
  })

  // 20 Nov 2026, David: "The icons next to each lab are not particularly
  // inspiring." Each card leads with a paper cutout picture of its main task.
  it("leads each card with a picture of its main task, paper and dusk, and no icon", () => {
    renderPage()
    const cards = screen.getAllByTestId("model-lab-card")
    index.labs.forEach((lab, i) => {
      const card = cards[i]!
      const light = picture(card, `v2/${lab.sp}.jpg`)
      const dark = picture(card, `v2/${lab.sp}-dark.jpg`)
      expect(light, lab.sp).not.toBeNull()
      expect(dark, lab.sp).not.toBeNull()
      expect(light!.getAttribute("alt")).toBe(LAB_INTRO[lab.sp].alt)
      expect(card.querySelector("svg")).toBeNull()
      for (const edition of ["", "-dark"]) {
        expect(
          existsSync(join(process.cwd(), "public/labs/v2", `${lab.sp}${edition}.jpg`)),
          `${lab.sp}${edition}.jpg`
        ).toBe(true)
      }
    })
  })

  // A newcomer must not meet a model name or a cost in pence on the cards: the
  // picks are still read from the data, behind a native <details>, closed.
  it("keeps each lab's picks out of sight until asked for, in a native details", () => {
    renderPage()
    const cards = screen.getAllByTestId("model-lab-card")
    index.labs.forEach((lab, i) => {
      const picks = within(cards[i]!).getByTestId("lab-picks")
      expect(picks.tagName).toBe("DETAILS")
      expect(picks.hasAttribute("open")).toBe(false)
      expect(picks.querySelector("summary")!.textContent).toBe(COPY.picksLabel)
      const outside = cards[i]!.cloneNode(true) as HTMLElement
      outside.querySelector("details")!.remove()
      const text = pageText(outside)
      for (const pick of [lab.best, lab.value]) {
        expect(text).not.toContain(pick.name)
        expect(pageText(picks)).toContain(pick.name)
      }
      expect(text).not.toMatch(/\d+p a task|£\d/)
    })
  })

  it("says in words that a card opens, without an arrow icon in the link", () => {
    renderPage()
    for (const card of screen.getAllByTestId("model-lab-card")) {
      const link = card.querySelector("a")!
      expect(link.textContent).toMatch(/^Open the .+ lab/)
      expect(link.querySelector("svg")).toBeNull()
    }
  })

  it("still makes sense for a lab with no plain task, and says so when there are no labs", () => {
    const { container, unmount } = render(<LabsNext index={index} />)
    expect(screen.getAllByTestId("model-lab-card")).toHaveLength(6)
    expect(pageText(container)).toContain(`The main task: ${index.labs[0]!.sig_title}`)
    unmount()
    renderPage({ labs: [] })
    expect(screen.queryAllByTestId("model-lab-card")).toHaveLength(0)
    expect(screen.getByRole("heading", { name: "No labs right now." })).toBeInTheDocument()
  })

  it("counts the tasks in a lab from the data", () => {
    expect(tasksPerLab([4, 4, 4])).toBe("four")
    expect(tasksPerLab([4, 5, 4])).toBe("four or five")
    expect(tasksPerLab([3, 6])).toBe("three to six")
    expect(tasksPerLab([])).toBe("several")
    const { container } = renderPage()
    expect(pageText(screen.getByTestId("labs-lead"))).toContain(
      `Each lab has ${tasksPerLab(index.labs.map((lab) => lab.tasks))} tasks`
    )
    expect(pageText(container)).not.toContain("{tasksPerLab}")
  })
})

describe("LabsNext, inside a lab and how we test", () => {
  it("sets out what you do in a lab as three steps", () => {
    renderPage()
    const steps = within(screen.getByRole("list", { name: "What you do in a lab" })).getAllByRole(
      "listitem"
    )
    expect(steps).toHaveLength(3)
    expect(steps[1]!.textContent).toMatch(/four answers, with the names hidden/)
    expect(steps[2]!.textContent).toMatch(
      /which AI wrote each answer, the mark we gave it, what it cost and whether it caught the problem hidden in the task/
    )
  })

  // David, 20 Nov 2026: "Once you finish rendering please put all the videos
  // into the site". The soft 3D tour, paper edition in light, night in dark.
  it("plays the labs tour from a new dated key on the media CDN, paper in light and night in dark, with captions from this site", () => {
    renderPage()
    const figure = screen.getByTestId("labs-film")
    const videos = Array.from(figure.querySelectorAll("video"))
    expect(videos.map((v) => v.getAttribute("data-edition"))).toEqual(["paper", "night"])
    const base = "https://media.gwth.ai/site/labs-tour/2026-11-20-soft3d"
    expect(videos.map((v) => v.querySelector("source")?.getAttribute("src"))).toEqual([
      `${base}/labs-tour-soft3d-paper.mp4`,
      `${base}/labs-tour-soft3d-night.mp4`,
    ])
    expect(videos.map((v) => v.getAttribute("poster"))).toEqual([LABS_FILM.paper.poster, LABS_FILM.night.poster])
    expect(LABS_FILM.paper.poster).toBe(`${base}/poster-paper.jpg`)
    // CSS shows the player for the current theme.
    expect(videos[0]!.className).toMatch(/paperOnly/)
    expect(videos[1]!.className).toMatch(/nightOnly/)
    for (const video of videos) {
      // media.gwth.ai sends no CORS header, so a <track> must come from this origin.
      const track = video.querySelector("track")
      expect(track?.getAttribute("src")).toBe("/labs-film/labs-tour.vtt")
      expect(track?.getAttribute("kind")).toBe("captions")
      expect(video.hasAttribute("controls")).toBe(true)
      expect(video.getAttribute("preload")).toBe("none")
      expect(video.getAttribute("aria-label")).toMatch(/labs/i)
    }
    expect(figure.textContent).toMatch(/How to use the labs, in just over a minute\./)
  })

  it("keeps the three points of How we test, with the counts from the data", () => {
    const { container } = renderPage()
    expect(screen.getByRole("heading", { level: 2, name: "How we test" })).toBeInTheDocument()
    const text = pageText(container)
    expect(text).toContain(`We used ${index.cost_chart.tasks} tasks across six labs, based on real UK work.`)
    expect(text).toMatch(/Each hides a trap a careful person would catch/)
    expect(text).toMatch(/no judge marks its own company's work/)
    expect(text).toMatch(/A person at GWTH checked a sample of the marks/)
    expect(text).toMatch(/Each set-up did each task once/)
    expect(text).toMatch(
      /The costs are what the tests cost through developer access \(the API\), not the price of an app subscription/
    )
  })
})

describe("LabsNext, the closing", () => {
  it("says the course teaches your own comparison, without lesson numbers that can move", () => {
    renderPage()
    expect(
      screen.getByRole("heading", { name: "Labs show you which AI. The course shows you how." })
    ).toBeInTheDocument()
    const body = document.body.textContent ?? ""
    expect(body).toMatch(/The course also teaches you to run your own comparison/)
    expect(body).toMatch(/same task in exactly the same words/)
    expect(body).toMatch(/In Month 2 you build a customer support chatbot/)
    // 19 Nov 2026, David: "FamilyBot, made core". No lesson builds a portfolio website.
    expect(body).toMatch(/In Month 1 of the course you build FamilyBot/)
    expect(body).not.toMatch(/portfolio website/i)
    expect(body).not.toMatch(/Lesson \d+/)
  })

  it("is the same page whether or not the course is on sale: no price, no buy or waitlist button", () => {
    const { container } = renderPage()
    const hrefs = [...container.querySelectorAll("a")].map((a) => a.getAttribute("href") ?? "")
    const allowed = /^(#labs|#tour|#new-here|\/labs\/[a-z]+|\/lessons|\/start-here)$/
    for (const href of hrefs) expect(href, href).toMatch(allowed)
    expect(hrefs).toContain("/lessons")
    expect(hrefs).toContain("/start-here")
    // Nothing opens a course lesson, and the only prices are test costs.
    expect(pageText(container)).not.toMatch(/a month\b|£\d+ once|Buy |Join the (course|waitlist)/)
  })
})

describe("LabsNext, the words", () => {
  it("carries none of the Arena wording and no banned punctuation", () => {
    const { container } = renderPage()
    const text = container.textContent ?? ""
    expect(text).not.toMatch(/arena|head-to-head|matchup|rubric|archive/i)
    expect(text).not.toMatch(/[–—§]/)
    for (const img of container.querySelectorAll("img")) {
      expect(img.getAttribute("alt") ?? "").not.toMatch(/[–—§]/)
    }
  })

  it("types no model name and no check date: every one comes from the data", () => {
    const dir = join(process.cwd(), "src/components/marketing/labs-next")
    for (const file of ["labs-next.tsx", "cost-map.tsx"]) {
      // The one sentence that says where to look names three chat APPS, so a
      // newcomer recognises the one she uses (20 Nov 2026). It is taken out
      // before the scan; "the explainer names no model" checks it separately.
      const code = readFileSync(join(dir, file), "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, " ")
        .replace(/^\s*\/\/.*$/gm, " ")
        .replace(COPY.whereBody, " ")
      expect(code, file).not.toMatch(
        /Claude|GPT|Gemini|Fable|Opus|Sonnet|Haiku|Astra|Luna|Terra|Grok|Kimi|Qwen|Mistral|DeepSeek/
      )
      expect(code, file).not.toMatch(/as of|last checked|correct as of|at the time of writing/i)
      expect(code, file).not.toMatch(/[–—§]/)
    }
  })
})

describe("CostMap, the picture", () => {
  const chart = index.cost_chart
  const renderMap = (c: ModelLabCostChart = chart) =>
    render(<CostMap chart={c} labCount={6} pencePerDollar={index.p_per_usd} />)

  it("draws one dot per set-up, named with its score and cost", () => {
    renderMap()
    const dots = within(screen.getByTestId("cost-plot")).getAllByRole("button")
    expect(dots).toHaveLength(chart.rows.length)
    expect(dots.length).toBeGreaterThan(30)
    for (const r of chart.rows) {
      const name = `${r.name}, ${levelLabel(r.level)}${r.premium ? ", premium" : ""}. Average score ${r.score} out of 100. Test cost ${r.cost}.`
      const dot = dots.find((d) => d.getAttribute("aria-label") === name)
      expect(dot, name).toBeDefined()
      expect(dot!.getAttribute("data-premium")).toBe(r.premium ? "true" : null)
    }
  })

  it("places dearer set-ups further right and better scores higher up, inside the plot", () => {
    const scales = plotScales(chart.rows)
    const byCost = [...chart.rows].sort((a, b) => a.cost_gbp - b.cost_gbp)
    const xs = byCost.map((r) => scales.x(r.cost_gbp))
    expect([...xs].sort((a, b) => a - b)).toEqual(xs)
    for (const r of chart.rows) {
      expect(scales.x(r.cost_gbp)).toBeGreaterThan(0)
      expect(scales.x(r.cost_gbp)).toBeLessThan(100)
      expect(scales.y(r.score)).toBeGreaterThan(0)
      expect(scales.y(r.score)).toBeLessThanOrEqual(100)
    }
    expect(scales.y(90)).toBeGreaterThan(scales.y(80))
    expect(scales.costTicks.map(costTick)).toEqual(["10p", "£1", "£10", "£100"])
    expect(costTick(0.01)).toBe("1p")
  })

  it("points out the highest score, the lowest cost and the highest cost from the data", () => {
    renderMap()
    const picks = callouts(chart.rows)
    expect(picks.top).toEqual(sortRows(chart.rows, "score")[0])
    expect(picks.cheapest.cost_gbp).toBe(Math.min(...chart.rows.map((r) => r.cost_gbp)))
    expect(picks.dearest.cost_gbp).toBe(Math.max(...chart.rows.map((r) => r.cost_gbp)))
    const cards = within(screen.getByTestId("cost-callouts")).getAllByRole("button")
    expect(cards).toHaveLength(3)
    expect(cards[0]!.textContent).toContain(`${picks.top.name}, ${levelLabel(picks.top.level)}`)
    expect(cards[0]!.textContent).toContain(
      `Scored ${picks.top.score} out of 100. Total test cost: ${picks.top.cost}.`
    )
    expect(cards[1]!.textContent).toContain(
      `Total test cost: ${picks.cheapest.cost}. Scored ${picks.cheapest.score} out of 100.`
    )
    expect(cards[2]!.textContent).toContain(
      `Total test cost: ${picks.dearest.cost}. Scored ${picks.dearest.score} out of 100.`
    )
  })

  it("says when other set-ups share the top score, and only then", () => {
    const row = { level: "medium", maker: "M", premium: false, tasks_run: 25 }
    const tied: ModelLabCostChart = {
      tasks: 25,
      rows: [
        { ...row, setup: "a", name: "A", cost_gbp: 10, cost: "£10.00", score: 95 },
        { ...row, setup: "b", name: "B", cost_gbp: 2, cost: "£2.00", score: 95 },
        { ...row, setup: "c", name: "C", cost_gbp: 0.5, cost: "50p", score: 80 },
      ],
    }
    const { unmount } = renderMap(tied)
    const top = within(screen.getByTestId("cost-callouts")).getAllByRole("button")[0]!
    expect(top.textContent).toContain("B, medium thinking")
    expect(top.textContent).toContain("One other set-up also scored 95. This one cost the least.")
    unmount()
    renderMap({ ...tied, rows: tied.rows.map((r) => (r.setup === "a" ? { ...r, score: 90 } : r)) })
    expect(screen.getByTestId("cost-callouts").textContent).not.toMatch(/also scored/)
  })

  it("names a set-up when its card or its dot is chosen, and walks the dots with the arrow keys", () => {
    renderMap()
    const picks = callouts(chart.rows)
    const readout = screen.getByTestId("cost-readout")
    expect(readout.textContent).toContain(`${picks.top.name}, ${levelLabel(picks.top.level)}`)

    const cards = within(screen.getByTestId("cost-callouts")).getAllByRole("button")
    fireEvent.click(cards[2]!)
    expect(cards[2]).toHaveAttribute("aria-pressed", "true")
    expect(cards[0]).toHaveAttribute("aria-pressed", "false")
    expect(readout.textContent).toContain(
      `${picks.dearest.name}, ${levelLabel(picks.dearest.level)}`
    )
    expect(readout.textContent).toContain(`Test cost ${picks.dearest.cost}.`)

    // One tab stop: the chosen dot. Left moves to the next cheaper set-up.
    const plot = screen.getByTestId("cost-plot")
    const focusable = [...plot.querySelectorAll("button")].filter((b) => b.tabIndex === 0)
    expect(focusable).toHaveLength(1)
    const byCost = [...chart.rows].sort((a, b) => a.cost_gbp - b.cost_gbp)
    fireEvent.keyDown(focusable[0]!, { key: "ArrowLeft" })
    const next = byCost[byCost.length - 2]!
    expect(readout.textContent).toContain(`${next.name}, ${levelLabel(next.level)}`)
    fireEvent.keyDown(document.activeElement!, { key: "Home" })
    expect(readout.textContent).toContain(`Test cost ${picks.cheapest.cost}.`)
  })

  it("gives the colours a key, with a word for other makers and for premium", () => {
    renderMap()
    const key = screen.getByRole("list", { name: "Dot and bar colours" })
    expect(key.textContent).toMatch(
      /Anthropic \(Claude\).*OpenAI \(GPT\).*Google \(Gemini\).*Other makers.*Hollow dot: premium/
    )
  })
})

describe("CostMap, the list", () => {
  const chart = index.cost_chart
  const renderMap = (c: ModelLabCostChart = chart) =>
    render(<CostMap chart={c} labCount={6} pencePerDollar={index.p_per_usd} />)
  const listRows = () => [...screen.getByTestId("labs-cost-chart").querySelectorAll("ol > li")]

  it("lists every set-up in the export, highest score first, ten before the fold", () => {
    renderMap()
    const rows = listRows()
    expect(rows).toHaveLength(chart.rows.length)
    const ordered = sortRows(chart.rows, "score")
    rows.forEach((row, i) => {
      const r = ordered[i]!
      expect(row.textContent).toContain(`${r.name}, ${levelLabel(r.level)}`)
      expect(row.textContent).toContain(r.cost)
      expect(row.textContent).toContain(String(r.score))
    })
    expect(screen.getByTestId("cost-rows").querySelectorAll("li")).toHaveLength(10)
    // The rest are in a native <details>, so they open without JavaScript.
    const more = screen.getByTestId("cost-rows-more")
    expect(more.closest("details")).not.toBeNull()
    expect(more.closest("details")!.querySelector("summary")!.textContent).toBe(
      `Show the other ${chart.rows.length - 10} set-ups`
    )
  })

  it("opens sorted by score and switches to cost, dearest first", () => {
    renderMap()
    expect(screen.getByRole("button", { name: "Score" })).toHaveAttribute("aria-pressed", "true")
    const cost = screen.getByRole("button", { name: "Cost" })
    fireEvent.click(cost)
    expect(cost).toHaveAttribute("aria-pressed", "true")
    const ordered = sortRows(chart.rows, "cost")
    listRows().forEach((row, i) => expect(row.textContent).toContain(ordered[i]!.cost))
  })

  it("marks a premium set-up with the word premium, and says which they are from the data", () => {
    renderMap()
    const premium = listRows().filter((li) => li.getAttribute("data-premium") === "true")
    expect(premium).toHaveLength(chart.rows.filter((r) => r.premium).length)
    for (const li of premium) expect(li.textContent).toMatch(/premium/)
    const names = [...new Set(chart.rows.filter((r) => r.premium).map((r) => r.name))]
    const text = pageText(screen.getByTestId("labs-cost-chart"))
    for (const name of names) expect(text).toContain(name)
    expect(text).toMatch(/Set-ups marked premium are .+, which we show for their cost and leave out of our picks\./)
  })

  it("says when a set-up ran fewer tasks than the rest", () => {
    const row = { level: "max", maker: "Anthropic", cost_gbp: 85, cost: "£85.00", score: 94 }
    renderMap({
      tasks: 25,
      rows: [
        { ...row, setup: "p", name: "Premium One", premium: true, tasks_run: 24 },
        { ...row, setup: "q", name: "Plain Two", premium: false, cost_gbp: 1, cost: "£1.00", tasks_run: 25 },
      ],
    })
    const rows = listRows()
    expect(rows.find((li) => li.textContent?.startsWith("Premium One"))!.textContent).toMatch(
      /premium · ran 24 of 25 tasks/
    )
    expect(rows.find((li) => li.textContent?.startsWith("Plain Two"))!.textContent).not.toMatch(
      /premium|ran \d+ of/
    )
    const text = pageText(screen.getByTestId("labs-cost-chart"))
    expect(text).toContain("Premium One ran 24 of the 25 tasks; the other set-ups ran all 25.")
    expect(text).toContain("Set-ups marked premium are Premium One, which we show")
  })

  it("explains the bar, the score and the noise under the list", () => {
    renderMap()
    const text = pageText(screen.getByTestId("labs-cost-chart"))
    expect(text).toMatch(/Each bar shows the total cost of the tasks that set-up ran/)
    expect(text).toContain(`converted at ${index.p_per_usd}p to the dollar`)
    expect(text).toMatch(/average of its six lab scores, out of 100/)
    expect(text).toMatch(/small score differences may change on another run/)
    expect(text).toMatch(/App subscriptions are charged separately/)
  })
})
