import { readFileSync } from "node:fs"
import { join } from "node:path"
import { render, cleanup } from "@testing-library/react"
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest"
import { HomeNext } from "./home-next"
import { RECIPES, motionAllowed, startHomeMotion } from "./home-motion"

/**
 * The home page's motion (David, 19 Nov 2026): "really stylish animation ...
 * but don't change any of the wording or the layout or the content". These
 * tests hold the limits: nothing is hidden unless a real, willing browser is
 * scrolling the page, and nothing motion adds ever stays.
 */

afterEach(cleanup)

const CSS = readFileSync(join(__dirname, "home-next.module.css"), "utf8")
const MOTION_CSS = CSS.slice(CSS.indexOf("/* ── Motion"))

type Win = Window & typeof globalThis
type Seen = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void

/** A stand-in browser window: everything `startHomeMotion` asks of one. */
function fakeWindow({
  reducedMotion = false,
  webdriver = false,
  observers = true,
}: { reducedMotion?: boolean; webdriver?: boolean; observers?: boolean } = {}) {
  const watchers: { seen: Seen; watching: Set<Element>; self: IntersectionObserver }[] = []
  class FakeObserver {
    private entry: (typeof watchers)[number]
    constructor(seen: Seen) {
      this.entry = { seen, watching: new Set(), self: this as unknown as IntersectionObserver }
      watchers.push(this.entry)
    }
    observe(el: Element) {
      this.entry.watching.add(el)
    }
    unobserve(el: Element) {
      this.entry.watching.delete(el)
    }
    disconnect() {
      this.entry.watching.clear()
    }
  }
  const win = {
    IntersectionObserver: observers ? FakeObserver : undefined,
    matchMedia: (query: string) => ({ matches: reducedMotion && query.includes("reduce") }),
    navigator: { webdriver },
    innerHeight: 800,
    setTimeout: (fn: () => void, ms: number) => window.setTimeout(fn, ms),
    clearTimeout: (id: number) => window.clearTimeout(id),
    getComputedStyle: (el: Element) => window.getComputedStyle(el),
  } as unknown as Win
  /** Scrolls an element into view, as far as the page's motion can tell. */
  const reach = (...els: Element[]) => {
    for (const watcher of watchers) {
      const mine = els.filter((el) => watcher.watching.has(el))
      if (mine.length === 0) continue
      watcher.seen(
        mine.map((target) => ({ target, isIntersecting: true, intersectionRatio: 1 }) as IntersectionObserverEntry),
        watcher.self
      )
    }
  }
  return { win, reach, watchers }
}

/**
 * jsdom has no layout. Give it the one the tests need: the hero is on screen,
 * every other section is below it, and only the first panel of each chooser is
 * shown (as the stylesheet's `:has()` rule does in a browser).
 */
function layOut(container: HTMLElement) {
  const hidden = (el: Element) => {
    const panel = el.closest<HTMLElement>("[data-panel]")
    if (!panel) return false
    const chooser = panel.closest("[data-chooser]")!
    return chooser.querySelector("[data-panel]") !== panel
  }
  vi.spyOn(HTMLElement.prototype, "offsetParent", "get").mockImplementation(function (this: HTMLElement) {
    return hidden(this) ? null : this.parentElement
  })
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    const inHero = this.closest('[data-section="hero"]') !== null
    const top = hidden(this) ? 0 : inHero ? 100 : 2000
    return { top, bottom: top + 300, left: 0, right: 300, width: 300, height: hidden(this) ? 0 : 300, x: 0, y: top } as DOMRect
  })
  void container
}

function states(container: HTMLElement) {
  return Array.from(container.querySelectorAll("[data-motion-state]")).map((el) =>
    el.getAttribute("data-motion-state")
  )
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe("the page is whole without motion", () => {
  it("adds no element to the page: the motion component renders nothing", () => {
    const { container } = render(<HomeNext />)
    const root = container.querySelector("[data-home-motion]")!
    expect(root).toBe(container.firstElementChild)
    expect(Array.from(root.children).map((el) => el.tagName)).toEqual(
      Array(8).fill("SECTION")
    )
    expect(root.firstElementChild).toHaveAttribute("data-section", "hero")
  })

  it("renders nothing hidden: the before state is never in the server's markup", () => {
    const { container } = render(<HomeNext selling />)
    expect(container.querySelector("[data-motion-state]")).toBeNull()
    expect(container.querySelector("[data-piece]")).toBeNull()
    expect(container.innerHTML).not.toMatch(/opacity\s*:\s*0/)
  })

  it.each([
    ["the reader asks for reduced motion", { reducedMotion: true }],
    ["the browser is driven by a script, as screenshot tools are", { webdriver: true }],
    ["the browser cannot watch for scrolling", { observers: false }],
  ])("hides nothing when %s", (_, options) => {
    const { container } = render(<HomeNext />)
    layOut(container)
    const { win, watchers } = fakeWindow(options)
    expect(motionAllowed(win)).toBe(false)
    startHomeMotion(container.querySelector<HTMLElement>("[data-home-motion]")!, win)
    expect(states(container)).toEqual([])
    expect(watchers).toEqual([])
  })

  it("does nothing in a browser with no matchMedia", () => {
    const { win } = fakeWindow()
    ;(win as unknown as { matchMedia: unknown }).matchMedia = undefined
    expect(motionAllowed(win)).toBe(false)
  })
})

describe("with motion", () => {
  function start() {
    const view = render(<HomeNext showScore />)
    layOut(view.container)
    const browser = fakeWindow()
    const root = view.container.querySelector<HTMLElement>("[data-home-motion]")!
    const stop = startHomeMotion(root, browser.win)
    return { ...view, ...browser, root, stop }
  }

  it("leaves everything on the first screen alone and waits only for what is below", () => {
    const { container } = start()
    const hero = container.querySelector('[data-section="hero"]')!
    expect(hero.querySelector("[data-motion-state]")).toBeNull()
    const waiting = container.querySelectorAll('[data-motion-state="before"]')
    expect(waiting.length).toBeGreaterThan(40)
    for (const el of Array.from(waiting)) {
      expect(el.closest('[data-section="hero"]')).toBeNull()
    }
  })

  it("never touches the film", () => {
    const { container } = start()
    const film = container.querySelector('[data-section="film"]')!
    expect(film.hasAttribute("data-motion")).toBe(false)
    expect(film.querySelector("[data-motion], [data-motion-state]")).toBeNull()
    expect(film.closest("[data-motion]")).toBeNull()
  })

  it("plays each part in as it is reached, neighbours one after another", () => {
    const { container, reach } = start()
    const cards = Array.from(container.querySelectorAll<HTMLElement>('[data-testid="month-step"]'))
    expect(cards.map((el) => el.getAttribute("data-motion-state"))).toEqual(["before", "before", "before"])
    reach(...cards)
    expect(cards.map((el) => el.getAttribute("data-motion-state"))).toEqual(["in", "in", "in"])
    expect(cards.map((el) => el.style.getPropertyValue("--motion-delay"))).toEqual(["", "140ms", "280ms"])
  })

  it("opens every panel of a chooser with its first, so no choice can show a hidden panel", () => {
    const { container, reach } = start()
    const panels = Array.from(container.querySelectorAll<HTMLElement>('[data-testid="superpower-panel"]'))
    expect(panels.every((el) => el.getAttribute("data-motion-state") === "before")).toBe(true)
    reach(panels[0]!)
    expect(panels.every((el) => el.getAttribute("data-motion-state") === "in")).toBe(true)
    // The other chooser has not been reached, so it still waits.
    const purposes = Array.from(container.querySelectorAll<HTMLElement>('[data-testid="purpose-panel"]'))
    expect(purposes.every((el) => el.getAttribute("data-motion-state") === "before")).toBe(true)
  })

  it("gives the score cards their motion without touching their markup's module", () => {
    const { container, reach } = start()
    const cards = Array.from(container.querySelectorAll<HTMLElement>('[data-testid="score-card"]'))
    expect(cards).toHaveLength(3)
    expect(cards.every((el) => el.getAttribute("data-motion") === "score")).toBe(true)
    reach(...cards)
    expect(cards.every((el) => el.getAttribute("data-motion-state") === "in")).toBe(true)
  })

  it("shows a picture plainly when it cannot be assembled, never leaving it hidden", () => {
    // jsdom has no Web Animations, which is the old-browser case.
    const { container, reach } = start()
    const plate = container.querySelector<HTMLElement>('[data-motion-pieces="months"]')!
    expect(plate.getAttribute("data-motion-state")).toBe("before")
    reach(plate)
    expect(plate.getAttribute("data-motion-state")).toBe("in")
    expect(plate.querySelector("[data-piece]")).toBeNull()
    expect(plate.querySelectorAll("img")).toHaveLength(2)
  })

  it("changes no words, in any state", () => {
    const plain = render(<HomeNext showScore />).container.textContent
    cleanup()
    const { container, reach } = start()
    expect(container.textContent).toBe(plain)
    reach(...Array.from(container.querySelectorAll("[data-motion]")))
    expect(container.textContent).toBe(plain)
  })

  it("puts everything back when the page is left", () => {
    const { container, stop, watchers } = start()
    expect(states(container).length).toBeGreaterThan(0)
    stop()
    expect(states(container)).toEqual([])
    expect(container.querySelector("[data-piece]")).toBeNull()
    expect(watchers.every((watcher) => watcher.watching.size === 0)).toBe(true)
  })
})

describe("the motion stylesheet", () => {
  it("only exists for readers who have not asked for reduced motion", () => {
    // Every animation, transition and hidden state sits inside a
    // `no-preference` block (or the print block, which removes motion).
    const outside = MOTION_CSS.replace(/\/\*[\s\S]*?\*\//g, "")
      .split(/@media[^{]+\{/)
      .at(0)!
    expect(outside).not.toMatch(/animation|transition|opacity|transform/)
    const blocks = MOTION_CSS.match(/@media[^{]+\{/g) ?? []
    expect(blocks.filter((b) => !b.includes("min-width"))).toEqual([
      "@media (prefers-reduced-motion: no-preference) {",
      "@media (hover: hover) and (prefers-reduced-motion: no-preference) {",
      "@media print {",
    ])
  })

  it("never leaves an element on its last frame: no animation fills forwards", () => {
    expect(MOTION_CSS).not.toMatch(/animation-fill-mode:\s*(forwards|both)/)
    expect(MOTION_CSS).not.toMatch(/infinite/)
  })

  it("hides only in the before and run states, which only the script sets", () => {
    const rules = MOTION_CSS.replace(/\/\*[\s\S]*?\*\//g, "").match(/[^{}]+\{[^{}]*opacity:\s*0;[^{}]*\}/g) ?? []
    const resting = rules.filter(
      (rule) => !rule.includes("data-motion-state=") && !/^\s*(from|to|\d+%)/.test(rule)
    )
    // The one resting rule is the fold's shade, an overlay that is invisible
    // at rest and never covers anything.
    expect(resting).toHaveLength(1)
    expect(resting[0]).toContain(".panel::after")
  })

  it("moves no layout: no animation touches a size, a margin or a position", () => {
    const frames = MOTION_CSS.match(/@keyframes[^{]+\{(?:[^{}]*\{[^{}]*\})+\s*\}/g) ?? []
    expect(frames.length).toBeGreaterThan(10)
    for (const frame of frames) {
      const properties = Array.from(frame.matchAll(/([a-z-]+)\s*:/g)).map((m) => m[1])
      for (const property of properties) {
        expect(["opacity", "transform", "clip-path"]).toContain(property)
      }
    }
  })
})

describe("the picture recipes", () => {
  it("end every piece flat and in place, and never run long", () => {
    for (const [name, pieces] of Object.entries(RECIPES)) {
      expect(pieces.length, name).toBeGreaterThan(0)
      for (const piece of pieces) {
        expect(piece.delay + piece.duration, name).toBeLessThanOrEqual(1600)
        expect(piece.from, name).toMatch(/^translate3d\(.+\) rotate\(.+\) scale\(.+\)$/)
      }
      // The back piece is the whole picture or a sheet with label windows.
      expect(pieces[0]!.clip ?? "none", name).toMatch(/^(none|polygon\(evenodd)/)
    }
  })

  it("has a recipe for every picture the page names", () => {
    const { container } = render(<HomeNext showScore />)
    const named = Array.from(container.querySelectorAll("[data-motion-pieces]")).map(
      (el) => el.getAttribute("data-motion-pieces")!
    )
    expect(new Set(named)).toEqual(new Set(["months", "triptych", "proof", "uk"]))
    for (const name of named) expect(RECIPES[name]).toBeDefined()
  })
})
