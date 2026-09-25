import { afterEach, describe, expect, it } from "vitest"
import {
  anchorForBox,
  captureArea,
  clampRel,
  expectedTag,
  findQuoteRange,
  markSpot,
  placeOf,
  relFits,
  relShape,
  captureImage,
  captureSelection,
  headingFor,
  isCommentable,
  isCommentableImage,
  isExcluded,
  lessonLabel,
  normaliseText,
  readLessonContext,
  selectorFor,
} from "./anchor"

function textNodeOf(el: Element): Text {
  const node = el.firstChild
  if (!node || node.nodeType !== Node.TEXT_NODE) throw new Error("no text node")
  return node as Text
}

function rangeOver(el: Element, word: string): Range {
  const node = textNodeOf(el)
  const start = node.data.indexOf(word)
  const range = document.createRange()
  range.setStart(node, start)
  range.setEnd(node, start + word.length)
  return range
}

afterEach(() => {
  document.body.innerHTML = ""
})

describe("normaliseText", () => {
  it("collapses whitespace and trims", () => {
    expect(normaliseText("  a \n\t b   c ")).toBe("a b c")
    expect(normaliseText(null)).toBe("")
  })
})

describe("selectorFor", () => {
  it("prefers a unique id", () => {
    document.body.innerHTML = `<main><p id="intro">Hi</p></main>`
    expect(selectorFor(document.getElementById("intro"))).toEqual({
      selector: "#intro",
      selectorKind: "id",
    })
  })

  it("uses a unique data-testid when there is no id", () => {
    document.body.innerHTML = `<main><p data-testid="lede">Hi</p></main>`
    expect(selectorFor(document.querySelector("p"))).toEqual({
      selector: '[data-testid="lede"]',
      selectorKind: "testid",
    })
  })

  it("falls back to a tag path that stops at a unique id and ignores classes", () => {
    document.body.innerHTML = `<main id="page"><section><p class="x1">One</p><p class="x2">Two</p></section></main>`
    const second = document.querySelectorAll("p")[1]
    const info = selectorFor(second)
    expect(info).toEqual({
      selector: "#page > section:nth-of-type(1) > p:nth-of-type(2)",
      selectorKind: "path",
    })
    expect(document.querySelector(info.selector)).toBe(second)
  })

  it("returns root for the document element or nothing", () => {
    expect(selectorFor(document.documentElement).selectorKind).toBe("root")
    expect(selectorFor(null).selector).toBe("html")
  })
})

describe("exclusion and commentable areas", () => {
  it("excludes header, nav, footer and the layer", () => {
    document.body.innerHTML = `
      <header><p id="h">Head</p></header>
      <main><nav><p id="n">Nav</p></nav><p id="m">Body</p></main>
      <footer><p id="f">Foot</p></footer>
      <div data-comment-layer><p id="l">Pane</p></div>`
    expect(isExcluded(document.getElementById("h"))).toBe(true)
    expect(isExcluded(document.getElementById("n"))).toBe(true)
    expect(isExcluded(document.getElementById("f"))).toBe(true)
    expect(isExcluded(document.getElementById("l"))).toBe(true)
    expect(isCommentable(document.getElementById("m"))).toBe(true)
    expect(isCommentable(document.getElementById("n"))).toBe(false)
  })

  it("treats text outside main as not commentable", () => {
    document.body.innerHTML = `<div><p id="x">Loose</p></div>`
    expect(isCommentable(document.getElementById("x"))).toBe(false)
  })
})

describe("headingFor", () => {
  it("finds the nearest preceding h1 to h3", () => {
    document.body.innerHTML = `<main><h1>Top</h1><h2>Why this matters</h2><h4>Minor</h4><p id="p">Words</p><h2>Later</h2></main>`
    expect(headingFor(document.getElementById("p"))).toBe("Why this matters")
  })

  it("uses the heading itself when the selection is inside it", () => {
    document.body.innerHTML = `<main><h2 id="h">A heading here</h2></main>`
    expect(headingFor(textNodeOf(document.getElementById("h")!))).toBe("A heading here")
  })
})

describe("captureSelection", () => {
  it("captures quote, prefix, suffix, selector, heading and context", () => {
    document.body.innerHTML = `<main><h2>Section one</h2><p id="para">Roughly three   in ten UK adults are still learning how to use AI.</p></main>`
    const para = document.getElementById("para")!
    const cap = captureSelection(rangeOver(para, "in ten UK adults"))
    expect(cap.quote).toBe("in ten UK adults")
    expect(cap.quotePrefix).toBe("Roughly three ")
    expect(cap.quoteSuffix).toBe(" are still learning how to use AI.")
    expect(cap.selector).toBe("#para")
    expect(cap.selectorKind).toBe("id")
    expect(cap.heading).toBe("Section one")
    expect(cap.context).toContain("in ten UK adults are still learning")
  })

  it("keeps prefix and suffix to 80 characters", () => {
    const long = "a".repeat(200)
    document.body.innerHTML = `<main><p id="p">${long} middle ${long}</p></main>`
    const cap = captureSelection(rangeOver(document.getElementById("p")!, "middle"))
    expect(cap.quotePrefix!.length).toBe(80)
    expect(cap.quoteSuffix!.length).toBe(80)
    expect(cap.context!.length).toBeLessThanOrEqual(260 * 2 + "middle".length + 2)
  })
})

describe("captureImage", () => {
  it("uses the alt text as the quote", () => {
    document.body.innerHTML = `<main><h2>Pictures</h2><figure><img id="pic" src="/media/six-superpowers.png?v=2" alt="The six superpowers"><figcaption>Six things AI does well</figcaption></figure></main>`
    const img = document.getElementById("pic") as HTMLImageElement
    const cap = captureImage(img)
    expect(cap.quote).toBe("The six superpowers")
    expect(cap.imageAlt).toBe("The six superpowers")
    expect(cap.imageSrc).toContain("six-superpowers.png")
    expect(cap.selector).toBe("#pic")
    expect(cap.heading).toBe("Pictures")
    expect(cap.context).toContain("Six things AI does well")
  })

  it("falls back to the file name when there is no alt", () => {
    document.body.innerHTML = `<main><img id="pic" src="/media/chart.png"></main>`
    const cap = captureImage(document.getElementById("pic") as HTMLImageElement)
    expect(cap.quote).toBe("chart.png")
    expect(cap.imageAlt).toBeUndefined()
  })
})

describe("isCommentableImage", () => {
  it("skips small images and images in the header", () => {
    document.body.innerHTML = `
      <header><img id="logo" width="200" height="60" src="/logo.png"></header>
      <main><img id="icon" width="24" height="24" src="/i.png"><img id="big" width="600" height="300" src="/b.png"></main>`
    expect(isCommentableImage(document.getElementById("logo"))).toBe(false)
    expect(isCommentableImage(document.getElementById("icon"))).toBe(false)
    expect(isCommentableImage(document.getElementById("big"))).toBe(true)
    expect(isCommentableImage(document.querySelector("main"))).toBe(false)
  })
})

describe("readLessonContext", () => {
  it("reads the lesson viewer attributes", () => {
    document.body.innerHTML = `<main><div data-section="lesson-viewer" data-lesson-id="m1_l01" data-lesson-page="5" data-lesson-page-title="Why this matters now, in the UK" data-lesson-variant="draft" data-lesson-draft-available="1"></div></main>`
    expect(readLessonContext()).toEqual({
      lessonId: "m1_l01",
      lessonPage: 5,
      lessonPageTitle: "Why this matters now, in the UK",
      lessonVariant: "draft",
      draftAvailable: true,
    })
  })

  it("returns null without a lesson viewer and ignores a bad variant", () => {
    expect(readLessonContext()).toBeNull()
    document.body.innerHTML = `<div data-section="lesson-viewer" data-lesson-id="m1_l02" data-lesson-variant="odd"></div>`
    expect(readLessonContext()?.lessonVariant).toBeUndefined()
    expect(readLessonContext()?.draftAvailable).toBe(false)
  })
})

describe("lessonLabel", () => {
  it("names month one lessons simply", () => {
    expect(lessonLabel("m1_l01")).toBe("Lesson 1")
    expect(lessonLabel("m2_l03")).toBe("Month 2, lesson 3")
    expect(lessonLabel(undefined)).toBeUndefined()
  })
})

function stubRect(el: Element, left: number, top: number, width: number, height: number) {
  el.getBoundingClientRect = () =>
    ({
      left,
      top,
      width,
      height,
      right: left + width,
      bottom: top + height,
      x: left,
      y: top,
      toJSON: () => ({}),
    }) as DOMRect
}

describe("relShape, relFits and clampRel", () => {
  it("stores a target as fractions of the element box", () => {
    const shape = relShape("box", { x: 100, y: 200, w: 800, h: 100 }, { x: 180, y: 210, w: 200, h: 50 })
    expect(shape).toEqual({ kind: "box", rel: { x: 0.1, y: 0.1, w: 0.25, h: 0.5 } })
  })

  it("treats a zero-sized element as one pixel rather than dividing by zero", () => {
    const shape = relShape("point", { x: 0, y: 0, w: 0, h: 0 }, { x: 0, y: 0, w: 0, h: 0 })
    expect(shape.rel).toEqual({ x: 0, y: 0, w: 0, h: 0 })
  })

  it("keeps fractions inside the range the API accepts", () => {
    expect(relFits({ x: -1, y: 2, w: 1, h: 0 })).toBe(true)
    expect(relFits({ x: 0, y: 0, w: 2.5, h: 1 })).toBe(false)
    expect(clampRel({ x: -3, y: 5, w: 0.5, h: Number.NaN })).toEqual({ x: -1, y: 2, w: 0.5, h: 0 })
  })
})

describe("anchorForBox", () => {
  it("pins a small box to the element under its centre", () => {
    document.body.innerHTML = `<main id="m"><section id="s"><p id="p">Words</p></section></main>`
    const p = document.getElementById("p")!
    stubRect(p, 0, 0, 400, 40)
    const { element, shape } = anchorForBox(p, { x: 40, y: 4, w: 100, h: 20 })
    expect(element).toBe(p)
    expect(shape).toEqual({ kind: "box", rel: { x: 0.1, y: 0.1, w: 0.25, h: 0.5 } })
  })

  it("widens to a parent when the box is far bigger than the element", () => {
    document.body.innerHTML = `<main id="m"><section id="s"><p id="p">Words</p></section></main>`
    const p = document.getElementById("p")!
    const s = document.getElementById("s")!
    stubRect(p, 0, 0, 100, 20)
    stubRect(s, 0, 0, 1000, 600)
    const { element, shape } = anchorForBox(p, { x: 0, y: 0, w: 900, h: 400 })
    expect(element).toBe(s)
    expect(relFits(shape.rel)).toBe(true)
  })

  it("clamps when nothing is big enough", () => {
    document.body.innerHTML = `<main><p id="p">Words</p></main>`
    const p = document.getElementById("p")!
    stubRect(p, 0, 0, 10, 10)
    const { element, shape } = anchorForBox(p, { x: 0, y: 0, w: 5000, h: 5000 })
    expect(element).toBe(p)
    expect(relFits(shape.rel)).toBe(true)
  })
})

describe("captureArea", () => {
  it("records the selector, heading and the words in the area", () => {
    document.body.innerHTML = `<main><h2>Pictures</h2><section id="s"><p>One   two</p></section></main>`
    expect(captureArea(document.getElementById("s")!)).toEqual({
      selector: "#s",
      selectorKind: "id",
      heading: "Pictures",
      context: "One two",
    })
  })
})

describe("expectedTag", () => {
  it("reads the tag at the end of a path selector only", () => {
    expect(expectedTag("#page > section:nth-of-type(1) > p:nth-of-type(2)")).toBe("p")
    expect(expectedTag("h2:nth-of-type(1)")).toBe("h2")
    expect(expectedTag("#para")).toBeNull()
    expect(expectedTag(undefined)).toBeNull()
  })
})

describe("findQuoteRange", () => {
  it("finds normalised words across whitespace and elements", () => {
    document.body.innerHTML = `<main><p>Most people are   still <em>learning</em> how</p></main>`
    const range = findQuoteRange("are still learning how")
    expect(range?.toString()).toBe("are   still learning how")
  })

  it("skips site chrome and returns null when the words are not there", () => {
    document.body.innerHTML = `<header><p>Only in the header</p></header><main><p>Body text</p></main>`
    expect(findQuoteRange("Only in the header")).toBeNull()
    expect(findQuoteRange("")).toBeNull()
  })

  it("searches the lesson viewer first", () => {
    document.body.innerHTML = `<main><p>Outside words</p><div data-section="lesson-viewer"><p>Inside words</p></div></main>`
    expect(findQuoteRange("Outside words")).toBeNull()
    expect(findQuoteRange("Inside words")?.toString()).toBe("Inside words")
  })
})

describe("placeOf", () => {
  it("places a shape inside the anchored element", () => {
    document.body.innerHTML = `<main><p id="p">Roughly three in ten UK adults</p></main>`
    stubRect(document.getElementById("p")!, 100, 200, 800, 100)
    const place = placeOf({
      selector: "#p",
      targetType: "text",
      quote: "three in ten",
      shape: { kind: "point", rel: { x: 0.5, y: 0.25, w: 0.1, h: 0.2 } },
    })
    expect(place).toEqual({ x: 500, y: 225, w: 80, h: 20 })
  })

  it("uses the whole element when there is no shape", () => {
    document.body.innerHTML = `<main><img id="i" src="/a.png" alt="A chart"></main>`
    stubRect(document.getElementById("i")!, 10, 20, 300, 200)
    expect(placeOf({ selector: "#i", targetType: "image" })).toEqual({ x: 10, y: 20, w: 300, h: 200 })
  })

  it("refuses an element with the wrong tag or without the quote", () => {
    document.body.innerHTML = `<main id="m"><div>Other words</div></main>`
    expect(placeOf({ selector: "#m > p:nth-of-type(1)", targetType: "text", quote: "gone" })).toBeNull()
    expect(placeOf({ selector: "#m > div:nth-of-type(1)", targetType: "text", quote: "gone" })).toBeNull()
  })

  it("falls back to the first text match of the quote", () => {
    document.body.innerHTML = `<main><p id="p">Roughly three in ten UK adults</p></main>`
    stubRect(document.getElementById("p")!, 100, 200, 800, 40)
    const place = placeOf({ selector: "#missing", targetType: "text", quote: "in ten UK" })
    expect(place).not.toBeNull()
  })

  it("falls back to a picture with the same alt text", () => {
    document.body.innerHTML = `<main><img id="new" src="/b.png" alt="The six superpowers"></main>`
    stubRect(document.getElementById("new")!, 5, 6, 70, 80)
    expect(
      placeOf({ selector: "#old", targetType: "image", imageAlt: "The six superpowers" }),
    ).toEqual({ x: 5, y: 6, w: 70, h: 80 })
  })

  it("returns null for an area whose element has gone", () => {
    document.body.innerHTML = `<main></main>`
    expect(placeOf({ selector: "#gone", targetType: "area" })).toBeNull()
  })
})

describe("markSpot", () => {
  it("sits just past a line of text, centred on it", () => {
    expect(markSpot({ x: 100, y: 200, w: 300, h: 24 }, 1440)).toEqual({ left: 404, top: 201 })
  })

  it("sits level with the top of a taller box", () => {
    expect(markSpot({ x: 100, y: 200, w: 300, h: 200 }, 1440)).toEqual({ left: 404, top: 200 })
  })

  it("tucks inside when the right edge is at the window edge", () => {
    expect(markSpot({ x: 1000, y: 0, w: 440, h: 100 }, 1440)).toEqual({ left: 1414, top: 0 })
  })
})
