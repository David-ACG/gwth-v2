import { describe, it, expect, vi, beforeEach } from "vitest"
import * as React from "react"
import { render } from "@testing-library/react"
import { ScoreVis } from "./score-vis"

const tierLabelOf = (container: HTMLElement): { text: string; classes: string } => {
  const el = container.querySelector('[data-role="ring-tier-label"]')
  return {
    text: (el?.textContent ?? "").trim(),
    classes: el?.getAttribute("class") ?? "",
  }
}

describe("ScoreVis — geometry", () => {
  it("renders a primary ring circle and a dashed pass-line reference", () => {
    const { container } = render(<ScoreVis value={92} />)
    const ring = container.querySelector('[data-role="score-ring-progress"]')
    expect(ring).not.toBeNull()
    const dashed = container.querySelector('[data-role="sparkline"] line')
    expect(dashed).not.toBeNull()
    expect(dashed?.getAttribute("stroke-dasharray")).toBe("3 4")
  })

  it("ring stroke references the size-suffixed gradient", () => {
    const { container } = render(<ScoreVis value={104} size="md" />)
    const ring = container.querySelector(
      '[data-role="score-ring-progress"]'
    ) as SVGCircleElement
    expect(ring.getAttribute("stroke")).toBe("url(#score-ring-grad-md)")
  })

  it("ring closes (offset ≈ 0) at value=100", () => {
    const { container } = render(<ScoreVis value={100} />)
    const ring = container.querySelector(
      '[data-role="score-ring-progress"]'
    ) as SVGCircleElement
    const offset = parseFloat(ring.getAttribute("stroke-dashoffset") ?? "")
    expect(Math.abs(offset)).toBeLessThan(0.5)
  })

  it("halo is absent below pass-line and present above", () => {
    const below = render(<ScoreVis value={80} />)
    expect(below.container.querySelector('[data-role="score-halo"]')).toBeNull()
    below.unmount()

    const above = render(<ScoreVis value={120} />)
    const halo = above.container.querySelector(
      '[data-role="score-halo"]'
    ) as SVGCircleElement
    expect(halo).not.toBeNull()

    above.unmount()

    const at100 = render(<ScoreVis value={100} />)
    expect(at100.container.querySelector('[data-role="score-halo"]')).toBeNull()
  })

  it("halo offset is full circumference at passLine and ≈ 0 at passLine+30", () => {
    const r = 72 // md size
    const C = 2 * Math.PI * r

    const at101 = render(<ScoreVis value={101} />)
    const halo101 = at101.container.querySelector(
      '[data-role="score-halo"]'
    ) as SVGCircleElement
    const offset101 = parseFloat(halo101.getAttribute("stroke-dashoffset") ?? "")
    // value=101 → haloFraction=1/30 ≈ 0.033 → offset ≈ C * 0.967
    expect(offset101).toBeGreaterThan(C * 0.9)
    at101.unmount()

    const at130 = render(<ScoreVis value={130} />)
    const halo130 = at130.container.querySelector(
      '[data-role="score-halo"]'
    ) as SVGCircleElement
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
              const stripped: Record<string, unknown> = { ...props }
              delete stripped.initial
              delete stripped.animate
              delete stripped.transition
              delete stripped.whileInView
              delete stripped.viewport
              delete stripped.exit
              return React.createElement(key, stripped)
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
    const { container } = render(<ScoreVis value={65} />)
    const root = container.querySelector('[role="img"]')
    expect(root).not.toBeNull()
    const label = root!.getAttribute("aria-label") ?? ""
    expect(label).toContain("Illustrative only")
    expect(label).toContain("65")
    expect(label).toContain("Working towards")
  })

  it("aria-label reflects Top 1% framing at value=104", () => {
    const { container } = render(<ScoreVis value={104} />)
    const root = container.querySelector('[role="img"]')
    const label = root!.getAttribute("aria-label") ?? ""
    expect(label).toContain("Top 1%")
  })

  it("aria-label reflects Top 0.5% framing at value=135", () => {
    const { container } = render(<ScoreVis value={135} />)
    const root = container.querySelector('[role="img"]')
    const label = root!.getAttribute("aria-label") ?? ""
    expect(label).toContain("Top 0.5%")
  })
})

describe("ScoreVis — tier label (v2 ladder 80/100/130)", () => {
  it("Top 0.5% at value=135 with elite text-gradient", () => {
    const { container } = render(
      <ScoreVis
        value={135}
        history={[40, 55, 70, 85, 98, 108, 118, 125, 130, 132, 134, 135]}
      />
    )
    const { text, classes } = tierLabelOf(container as HTMLElement)
    expect(text).toBe("Top 0.5%")
    expect(classes).toContain("text-transparent")
    expect(classes).toContain("bg-gradient-to-br")
  })

  it("Top 1% at value=104 with text-success", () => {
    const { container } = render(
      <ScoreVis
        value={104}
        history={[40, 55, 70, 90, 108, 118, 128, 135, 130, 122, 114, 104]}
      />
    )
    const { text, classes } = tierLabelOf(container as HTMLElement)
    expect(text).toBe("Top 1%")
    expect(classes).toContain("text-success")
  })

  it("Top 5% at value=88 with text-success", () => {
    const { container } = render(
      <ScoreVis
        value={88}
        history={[35, 50, 65, 78, 90, 100, 108, 112, 105, 98, 92, 88]}
      />
    )
    const { text, classes } = tierLabelOf(container as HTMLElement)
    expect(text).toBe("Top 5%")
    expect(classes).toContain("text-success")
  })

  it("Working towards at value=65 with text-muted-foreground", () => {
    const { container } = render(
      <ScoreVis
        value={65}
        history={[20, 30, 40, 48, 55, 60, 62, 64, 66, 65, 66, 65]}
      />
    )
    const { text, classes } = tierLabelOf(container as HTMLElement)
    expect(text).toBe("Working towards")
    expect(classes).toContain("text-muted-foreground")
  })
})

describe("ScoreVis — decay path under v2 scenarios", () => {
  it("renders decay path when 88 crosses below from a passing prior point", () => {
    // Top 5% slipping case from the mock — last segment is 92 → 88,
    // and the segment before that (100 → 92) crosses the pass-line.
    // Construct a minimal history where the last segment crosses.
    const { container } = render(
      <ScoreVis value={88} history={[80, 90, 100, 105, 102, 88]} />
    )
    expect(container.querySelector('[data-role="sparkline-decay"]')).not.toBeNull()
  })

  it("does NOT render decay path for elite case (value=135 trending up)", () => {
    const { container } = render(
      <ScoreVis
        value={135}
        history={[40, 55, 70, 85, 98, 108, 118, 125, 130, 132, 134, 135]}
      />
    )
    expect(container.querySelector('[data-role="sparkline-decay"]')).toBeNull()
  })

  it("does NOT render decay path for Top 1% slipping at value=104 (still above pass-line)", () => {
    const { container } = render(
      <ScoreVis
        value={104}
        history={[40, 55, 70, 90, 108, 118, 128, 135, 130, 122, 114, 104]}
      />
    )
    // 114 → 104: prev >= 100 and last >= 100 → no crossing → no amber decay
    expect(container.querySelector('[data-role="sparkline-decay"]')).toBeNull()
  })
})

describe("ScoreVis — sparkline path generation", () => {
  it("emits one M command followed by N-1 L commands", () => {
    const { container } = render(<ScoreVis value={92} history={[88, 90, 92, 95, 92]} />)
    const paths = Array.from(
      container.querySelectorAll('[data-role="sparkline"] path')
    )
    const spark = paths.find((p) => p.getAttribute("data-role") !== "sparkline-decay")
    expect(spark).toBeDefined()
    const d = spark!.getAttribute("d") ?? ""
    const mCount = (d.match(/M/g) ?? []).length
    const lCount = (d.match(/L/g) ?? []).length
    expect(mCount).toBe(1)
    expect(lCount).toBe(4)
  })

  it("renders a gradient fill polygon traced under the sparkline", () => {
    const { container } = render(
      <ScoreVis value={104} history={[40, 55, 70, 90, 108, 118, 128, 135, 130, 122, 114, 104]} />
    )
    const fill = container.querySelector('[data-role="sparkline-fill"]')
    expect(fill).not.toBeNull()
    expect(fill?.getAttribute("fill")).toBe("url(#score-spark-fill-md)")
  })

  it("two-segment y-mapping keeps elite scores within the viewBox top half", () => {
    const { container } = render(
      <ScoreVis value={135} history={[100, 110, 120, 135]} size="md" />
    )
    const paths = Array.from(
      container.querySelectorAll('[data-role="sparkline"] path')
    )
    const spark = paths.find((p) => p.getAttribute("data-role") !== "sparkline-decay")
    const d = spark!.getAttribute("d") ?? ""
    // Last point: x=sparkW=220, y for value=135 in [100..145] → between TOP_Y=6 and PASS_Y=20
    // Specifically: 20 - (35/45)*14 ≈ 9.11
    const lastMatch = d.match(/L\s*([0-9.]+)\s+([0-9.]+)\s*$/)
    expect(lastMatch).not.toBeNull()
    const y = parseFloat(lastMatch![2]!)
    expect(y).toBeGreaterThanOrEqual(6)
    expect(y).toBeLessThanOrEqual(20)
  })

  it("sub-pass scores map below the dashed line and within bottomY", () => {
    const { container } = render(
      <ScoreVis value={65} history={[30, 40, 55, 65]} size="md" />
    )
    const paths = Array.from(
      container.querySelectorAll('[data-role="sparkline"] path')
    )
    const spark = paths.find((p) => p.getAttribute("data-role") !== "sparkline-decay")
    const d = spark!.getAttribute("d") ?? ""
    const lastMatch = d.match(/L\s*([0-9.]+)\s+([0-9.]+)\s*$/)
    expect(lastMatch).not.toBeNull()
    const y = parseFloat(lastMatch![2]!)
    // value=65 → y = 56 - (65/100) * (56 - 20) = 56 - 23.4 = 32.6
    expect(y).toBeGreaterThan(20)
    expect(y).toBeLessThanOrEqual(56)
  })
})
