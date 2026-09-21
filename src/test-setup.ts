import "@testing-library/jest-dom/vitest"

// jsdom does not implement IntersectionObserver, which Motion's `whileInView`
// requires. Provide a minimal stub so components using `whileInView` can mount.
if (typeof globalThis.IntersectionObserver === "undefined") {
  class IntersectionObserverStub {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
    readonly root: Element | Document | null = null
    readonly rootMargin: string = "0px"
    readonly thresholds: ReadonlyArray<number> = [0]
  }
  ;(globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
    IntersectionObserverStub
}

// jsdom does not implement ResizeObserver, which cmdk (the Cmd+K command
// palette) observes its list with. Without it the palette throws on mount and
// no test can open it.
if (typeof globalThis.ResizeObserver === "undefined") {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  ;(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver =
    ResizeObserverStub
}

// jsdom has no layout, so Element.scrollIntoView is missing; cmdk calls it to
// keep the highlighted item in view.
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView() {}
}
