import "@testing-library/jest-dom/vitest"

// jsdom does not implement IntersectionObserver, which Motion's `whileInView`
// requires. Provide a minimal stub so components using `whileInView` can mount.
if (typeof globalThis.IntersectionObserver === "undefined") {
  class IntersectionObserverStub {
    constructor(_cb: IntersectionObserverCallback, _opts?: IntersectionObserverInit) {}
    observe(_el: Element) {}
    unobserve(_el: Element) {}
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
