import { describe, it, expect, vi, beforeEach } from "vitest"
import { render } from "@testing-library/react"
import { ScoreVis } from "./score-vis"

describe("ScoreVis — geometry", () => {
  it("renders a primary ring circle and a dashed pass-line reference", () => {
    const { container } = render(<ScoreVis value={92} />)
    const ring = container.querySelector('[data-role="score-ring-progress"]')
    expect(ring).not.toBeNull()
    const dashed = container.querySelector('[data-role="sparkline"] line')
    expect(dashed).not.toBeNull()
    expect(dashed?.getAttribute("stroke-dasharray")).toBe("2 3")
  })

  it("ring closes (offset ≈ 0) at value=100", () => {
    const { container } = render(<ScoreVis value={100} />)
    const ring = container.querySelector('[data-role="score-ring-progress"]') as SVGCircleElement
    const offset = parseFloat(ring.getAttribute("stroke-dashoffset") ?? "")
    expect(Math.abs(offset)).toBeLessThan(0.5)
  })

  it("halo is absent below pass-line and present above", () => {
    const below = render(<ScoreVis value={80} />)
    expect(below.container.querySelector('[data-role="score-halo"]')).toBeNull()
    below.unmount()

    const above = render(<ScoreVis value={120} />)
    const halo = above.container.querySelector('[data-role="score-halo"]') as SVGCircleElement
    expect(halo).not.toBeNull()

    above.unmount()

    const at100 = render(<ScoreVis value={100} />)
    expect(at100.container.querySelector('[data-role="score-halo"]')).toBeNull()
  })

  it("halo offset is full circumference at passLine and ≈ 0 at passLine+30", () => {
    const r = 72 // md size
    const C = 2 * Math.PI * r

    const at101 = render(<ScoreVis value={101} />)
    const halo101 = at101.container.querySelector('[data-role="score-halo"]') as SVGCircleElement
    const offset101 = parseFloat(halo101.getAttribute("stroke-dashoffset") ?? "")
    // value=101 → haloFraction=1/30 ≈ 0.033 → offset ≈ C * 0.967
    expect(offset101).toBeGreaterThan(C * 0.9)
    at101.unmount()

    const at130 = render(<ScoreVis value={130} />)
    const halo130 = at130.container.querySelector('[data-role="score-halo"]') as SVGCircleElement
    const offset130 = parseFloat(halo130.getAttribute("stroke-dashoffset") ?? "")
    expect(Math.abs(offset130)).toBeLessThan(0.5)
  })
})

describe("ScoreVis — decay rule (cross the line, not just trending down)", () => {
  it("flags decay when the last segment crosses pass-line downward (105 → 95)", () => {
    const { container } = render(
      <ScoreVis value={95} history={[88, 92, 96, 102, 105, 95]} />
    )
    const decay = container.querySelector('[data-role="sparkline-decay"]')
    expect(decay).not.toBeNull()
    expect(decay?.getAttribute("stroke")).toBe("var(--warning)")
  })

  it("does NOT flag decay when last segment trends down but stays below pass-line (95 → 92)", () => {
    const { container } = render(
      <ScoreVis value={92} history={[80, 85, 88, 90, 95, 92]} />
    )
    expect(container.querySelector('[data-role="sparkline-decay"]')).toBeNull()
  })

  it("does NOT flag decay when last segment trends down but stays above pass-line (105 → 102)", () => {
    const { container } = render(
      <ScoreVis value={102} history={[101, 103, 104, 106, 105, 102]} />
    )
    expect(container.querySelector('[data-role="sparkline-decay"]')).toBeNull()
  })
})

describe("ScoreVis — reduced motion", () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it("renders pulse element without animate props when prefers-reduced-motion is set", async () => {
    vi.doMock("motion/react", () => ({
      useReducedMotion: () => true,
      motion: new Proxy(
        {},
        {
          get: (_target, key: string) => {
            const Component = (props: Record<string, unknown>) => {
              const stripped = { ...props }
              delete stripped.initial
              delete stripped.animate
              delete stripped.transition
              delete stripped.whileInView
              delete stripped.viewport
              delete stripped.exit
              const Tag = key as unknown as keyof JSX.IntrinsicElements
              return <Tag {...stripped} />
            }
            Component.displayName = `motion.${key}`
            return Component
          },
        }
      ),
    }))

    const { ScoreVis: Mocked } = await import("./score-vis")
    const { container } = render(<Mocked value={92} history={[88, 90, 92]} />)
    const pulse = container.querySelector('[data-role="score-pulse"]')
    expect(pulse).not.toBeNull()
    // In reduced-motion path the wrapper is a plain div with no Motion attrs.
    expect(pulse?.tagName.toLowerCase()).toBe("div")
  })
})

describe("ScoreVis — accessibility", () => {
  it("exposes role=img and an illustrative aria-label including the value", () => {
    const { container } = render(<ScoreVis value={92} />)
    const root = container.querySelector('[role="img"]')
    expect(root).not.toBeNull()
    const label = root!.getAttribute("aria-label") ?? ""
    expect(label).toContain("Illustrative only")
    expect(label).toContain("92")
    expect(label).toContain("currently below pass line")
  })

  it("aria-label reflects passing state when value >= passLine", () => {
    const { container } = render(<ScoreVis value={110} />)
    const root = container.querySelector('[role="img"]')
    const label = root!.getAttribute("aria-label") ?? ""
    expect(label).toContain("currently passing")
  })
})

describe("ScoreVis — sparkline path generation", () => {
  it("emits one M command followed by N-1 L commands", () => {
    const { container } = render(<ScoreVis value={92} history={[88, 90, 92, 95, 92]} />)
    // The static (reduced-motion-fallback) path or the motion path both have d=...
    const paths = Array.from(container.querySelectorAll('[data-role="sparkline"] path'))
    // Pick the main sparkline path (not the decay segment)
    const spark = paths.find((p) => p.getAttribute("data-role") !== "sparkline-decay")
    expect(spark).toBeDefined()
    const d = spark!.getAttribute("d") ?? ""
    const mCount = (d.match(/M/g) ?? []).length
    const lCount = (d.match(/L/g) ?? []).length
    expect(mCount).toBe(1)
    expect(lCount).toBe(4)
  })
})
