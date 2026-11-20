"use client"

import { useEffect } from "react"

/**
 * The home page's motion (19 Nov 2026). David: *"One thing I think may be
 * missing from the homepage is some really stylish animation as you move from
 * one part of the page to another, or click on things ... but don't change any
 * of the wording or the layout or the content."* He picked the level: "A few
 * showpieces", three or four moments that make people stop, everything else
 * moving gently.
 *
 * This component renders nothing. After the page has hydrated it finds the
 * elements `home-next.tsx` marks with `data-motion`, and:
 *
 * 1. hides only the ones that are still BELOW the screen
 *    (`data-motion-state="before"`), then
 * 2. plays each one in as the reader reaches it (`"in"`), a few at a time.
 *
 * The CSS for every state is in `home-next.module.css` under "Motion".
 *
 * ## The promises this file keeps
 *
 * - **Nothing depends on it.** With no JavaScript, slow JavaScript, an old
 *   browser, `prefers-reduced-motion`, or a browser driven by automation
 *   (`navigator.webdriver`: screenshot scripts, test robots), no element is
 *   ever hidden: the page is exactly the server-rendered page.
 * - **The resting page is untouched.** It adds no element that stays, and
 *   every animation ends on the element's own, unanimated style. The picture
 *   pieces it makes while a picture assembles are removed when it finishes.
 * - **Only transform and opacity move.** The cut lines are fixed `clip-path`s
 *   on pieces that then only slide and fade, so nothing is laid out again.
 */

const STATE = "data-motion-state"
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)"
/** A small overshoot, for a label being pressed onto the picture. */
const PRESS = "cubic-bezier(0.34, 1.45, 0.64, 1)"

type Piece = {
  /** The cut, as a `clip-path` over the whole picture. None: the whole sheet. */
  clip?: string
  /** Where the piece turns and grows from, as a point on the picture. */
  origin?: string
  /** Where it starts. It always ends flat, in place. */
  from: string
  delay: number
  duration: number
  easing?: string
}

/**
 * How each picture is cut. The pictures are flat files, so a "layer" is the
 * same picture again, cut to one of the paper layers drawn in it. Pieces are
 * listed back to front; at rest they lie exactly on the picture underneath.
 *
 * The cut lines were traced on the light plates and checked on the night
 * twins, which share their composition (GWTH-launch-plan
 * `completion/public-pages-fable/home-motion/`).
 */
const MONTH_TWO_ARCH =
  "polygon(0% 49.6%, 1.5% 45.2%, 3.5% 41.9%, 6.5% 39.3%, 11% 37.5%, 16.5% 36.9%, 22% 36.7%, 27.5% 36.9%, 33% 37.5%, 38.5% 39.3%, 44% 42.3%, 48.5% 45.2%, 51.6% 47.6%, 51.6% 51%, 56.8% 51%, 61.2% 56%, 65% 61.3%, 68.9% 67.1%, 72.2% 73%, 74.9% 78%, 76.6% 82.5%, 76.6% 100%, 0% 100%)"
const MONTH_ONE_ARCH_AND_GROUND =
  "polygon(0% 73.5%, 2.25% 69.5%, 4.5% 67.4%, 6.75% 66.3%, 11.25% 65.7%, 15.75% 66.1%, 20.25% 68%, 23% 70.5%, 25.6% 74.1%, 27.85% 78.4%, 29.65% 82.8%, 31% 86.8%, 31.8% 89.6%, 41.6% 89.6%, 41.6% 92.2%, 45% 87.6%, 50% 85%, 55% 83.4%, 60% 82.3%, 65% 81.6%, 70% 81.4%, 75% 82%, 80% 83.2%, 85% 85.4%, 90% 88.6%, 95% 92.9%, 100% 97.8%, 100% 100%, 0% 100%)"

/** A sheet with rectangular windows cut out of it, for labels stuck on later. */
function sheetWithout(...holes: [left: number, top: number, right: number, bottom: number][]): string {
  const windows = holes
    .map(([l, t, r, b]) => `${l}% ${t}%, ${r}% ${t}%, ${r}% ${b}%, ${l}% ${b}%, ${l}% ${t}%, 0% 0%`)
    .join(", ")
  return `polygon(evenodd, 0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${windows})`
}

function label(
  [l, t, r, b]: [number, number, number, number],
  delay: number,
  turn: number
): Piece {
  return {
    clip: `inset(${t}% ${100 - r}% ${100 - b}% ${l}% round 1.2%)`,
    origin: `${(l + r) / 2}% ${(t + b) / 2}%`,
    from: `translate3d(0, -3%, 0) rotate(${turn}deg) scale(1.14)`,
    delay,
    duration: 460,
    easing: PRESS,
  }
}

const SCORE_LABEL: [number, number, number, number] = [2.4, 80.8, 41.3, 96.4]
const PORTFOLIO_LABEL: [number, number, number, number] = [47.4, 80.8, 97.4, 96.4]
const PAPERWORK_LABEL: [number, number, number, number] = [1.6, 3.6, 60.9, 17.1]
const SOURCE_LABEL: [number, number, number, number] = [43.9, 83.8, 99.1, 99.1]

export const RECIPES: Record<string, readonly Piece[]> = {
  /** One sheet, laid down. The six superpower pictures. */
  single: [
    { from: "translate3d(0, 5%, 0) rotate(-1.6deg) scale(1.03)", delay: 0, duration: 700 },
  ],
  /**
   * The three months, in the order you study them: Month 1 and the ground
   * first, Month 2 rises behind it, Month 3 rises behind them both.
   */
  months: [
    { from: "translate3d(0, 7%, 0) rotate(0deg) scale(1)", delay: 620, duration: 900 },
    { clip: MONTH_TWO_ARCH, from: "translate3d(0, 11%, 0) rotate(0deg) scale(1)", delay: 300, duration: 800 },
    { clip: MONTH_ONE_ARCH_AND_GROUND, from: "translate3d(0, 9%, 0) rotate(0deg) scale(1)", delay: 0, duration: 700 },
  ],
  /** Three arched panels, dealt left to right like cards. */
  triptych: [
    { from: "translate3d(0, 9%, 0) rotate(1.2deg) scale(1)", origin: "83% 100%", delay: 260, duration: 640 },
    {
      clip: "inset(0 34.4% 0 33.3%)",
      origin: "50% 100%",
      from: "translate3d(0, 9%, 0) rotate(-1.2deg) scale(1)",
      delay: 130,
      duration: 640,
    },
    {
      clip: "inset(0 66.7% 0 0)",
      origin: "17% 100%",
      from: "translate3d(0, 9%, 0) rotate(1.2deg) scale(1)",
      delay: 0,
      duration: 640,
    },
  ],
  /** The scene settles, then its two labels are pressed on. */
  proof: [
    {
      clip: sheetWithout(SCORE_LABEL, PORTFOLIO_LABEL),
      from: "translate3d(0, 5%, 0) rotate(-1.2deg) scale(1.03)",
      delay: 0,
      duration: 720,
    },
    label(SCORE_LABEL, 430, -4),
    label(PORTFOLIO_LABEL, 590, 3),
  ],
  uk: [
    {
      clip: sheetWithout(PAPERWORK_LABEL, SOURCE_LABEL),
      from: "translate3d(0, 5%, 0) rotate(1.2deg) scale(1.03)",
      delay: 0,
      duration: 720,
    },
    label(PAPERWORK_LABEL, 430, -3),
    label(SOURCE_LABEL, 590, 3),
  ],
}

/** Gap between neighbours that arrive together, by kind of element. */
const STAGGER: Record<string, number> = {
  rise: 70,
  head: 70,
  deal: 65,
  card: 140,
  score: 140,
  step: 300,
  panel: 0,
  assemble: 0,
}

type Win = Window & typeof globalThis

/** True when this browser should get motion at all. */
export function motionAllowed(win: Win): boolean {
  if (typeof win.IntersectionObserver !== "function") return false
  if (typeof win.matchMedia !== "function") return false
  if (win.matchMedia("(prefers-reduced-motion: reduce)").matches) return false
  // A browser driven by a script (screenshots, test robots) gets the plain
  // page, so a full-page capture never shows a part that is waiting to be
  // scrolled to.
  if (win.navigator.webdriver) return false
  return true
}

function isShown(el: HTMLElement): boolean {
  return el.offsetParent !== null
}

function tidyStyle(el: HTMLElement) {
  if (!el.getAttribute("style")) el.removeAttribute("style")
}

/** Starts the home page's motion. Returns a function that undoes it. */
export function startHomeMotion(root: HTMLElement, win: Win = window): () => void {
  if (!motionAllowed(win)) return () => {}

  const timers = new Set<number>()
  const later = (fn: () => void, ms: number) => {
    const id = win.setTimeout(() => {
      timers.delete(id)
      fn()
    }, ms)
    timers.add(id)
  }

  // A container can hand its kind to its children (the score cards, whose
  // markup belongs to another module).
  root.querySelectorAll<HTMLElement>("[data-motion-children]").forEach((parent) => {
    const kind = parent.getAttribute("data-motion-children")!
    Array.from(parent.children).forEach((child) => child.setAttribute("data-motion", kind))
  })

  const units = Array.from(root.querySelectorAll<HTMLElement>("[data-motion]"))
  const kindOf = (el: Element) => el.getAttribute("data-motion") ?? "rise"
  const chooserOf = (el: Element) => el.closest<HTMLElement>("[data-chooser]")
  const panelsOf = (el: Element) =>
    Array.from(chooserOf(el)?.querySelectorAll<HTMLElement>('[data-motion="panel"]') ?? [])
  const belowScreen = (el: HTMLElement) => el.getBoundingClientRect().top >= win.innerHeight

  // ── Pictures that assemble ────────────────────────────────────────────────

  const running = new Map<HTMLElement, () => void>()

  function assemble(figure: HTMLElement) {
    running.get(figure)?.()
    const picture = Array.from(figure.querySelectorAll<HTMLImageElement>("img")).find(
      (img) => !img.hasAttribute("data-piece") && isShown(img)
    )
    const showPlain = () => figure.setAttribute(STATE, "in")
    if (!picture || typeof picture.animate !== "function") return showPlain()

    let stopped = false
    let pieces: HTMLImageElement[] = []
    const finish = () => {
      if (stopped) return
      stopped = true
      running.delete(figure)
      figure.setAttribute(STATE, "in")
      pieces.forEach((piece) => piece.remove())
      pieces = []
      for (const property of ["position", "overflow", "border-radius"]) {
        figure.style.removeProperty(property)
      }
      tidyStyle(figure)
    }
    running.set(figure, finish)

    const begin = async () => {
      const recipe = RECIPES[figure.getAttribute("data-motion-pieces") ?? ""] ?? RECIPES.single!
      // A picture inside a panel waits for the panel to finish unfolding.
      const lead = figure.closest('[data-motion="panel"]') ? 240 : 0
      const made = recipe.map((spec, index) => {
        const piece = new Image()
        piece.alt = ""
        piece.setAttribute("aria-hidden", "true")
        piece.setAttribute("data-piece", "")
        piece.decoding = "sync"
        piece.src = picture.currentSrc || picture.src
        Object.assign(piece.style, {
          position: "absolute",
          left: "0",
          top: "0",
          width: "100%",
          height: "100%",
          zIndex: String(index + 1),
          pointerEvents: "none",
          clipPath: spec.clip ?? "none",
          transformOrigin: spec.origin ?? "50% 100%",
        })
        return piece
      })
      try {
        await Promise.all(made.map((piece) => piece.decode()))
      } catch {
        // The picture is on screen already, so a piece that will not decode
        // just means no assembly.
        return finish()
      }
      if (stopped) return
      pieces = made
      figure.style.position = "relative"
      figure.style.overflow = "hidden"
      figure.style.borderRadius = win.getComputedStyle(picture).borderRadius
      const animations = pieces.map((piece, index) => {
        const spec = recipe[index]!
        figure.appendChild(piece)
        return piece.animate(
          [
            { opacity: 0, transform: spec.from },
            { opacity: 1, offset: 0.4 },
            { opacity: 1, transform: "translate3d(0, 0, 0) rotate(0deg) scale(1)" },
          ],
          { duration: spec.duration, delay: lead + spec.delay, easing: spec.easing ?? EASE, fill: "backwards" }
        )
      })
      figure.setAttribute(STATE, "run")
      Promise.all(animations.map((animation) => animation.finished)).then(finish, finish)
    }

    if (picture.complete && picture.naturalWidth > 0) {
      void begin()
      return
    }
    // Still downloading: give it a moment, then show it plainly. A picture
    // never stays hidden waiting for its own animation.
    let waiting = true
    const ready = () => {
      if (!waiting || stopped) return
      waiting = false
      picture.removeEventListener("load", ready)
      if (picture.complete && picture.naturalWidth > 0) void begin()
      else finish()
    }
    picture.addEventListener("load", ready)
    later(() => {
      if (!waiting) return
      waiting = false
      picture.removeEventListener("load", ready)
      finish()
    }, 1500)
  }

  // ── Everything else: flip the state, the stylesheet does the rest ─────────

  function reveal(el: HTMLElement, delay: number) {
    const kind = kindOf(el)
    if (kind === "assemble") return assemble(el)
    if (delay > 0) {
      el.style.setProperty("--motion-delay", `${delay}ms`)
      // Cleared afterwards, so a panel opened again later opens at once.
      later(() => {
        el.style.removeProperty("--motion-delay")
        tidyStyle(el)
      }, delay + 2600)
    }
    // Every panel of a chooser opens with its first one: the rest are not on
    // screen, and each unfolds by itself when it is chosen.
    const group = kind === "panel" ? panelsOf(el) : [el]
    group.forEach((member) => member.setAttribute(STATE, "in"))
  }

  const inPanel = (el: HTMLElement) => kindOf(el) === "assemble" && el.closest('[data-motion="panel"]') !== null

  /** How much of an element must be showing before it plays. */
  const needed = new WeakMap<Element, number>()

  const onSeen: IntersectionObserverCallback = (entries, observer) => {
    const arrived = entries
      .filter(
        (entry) =>
          entry.isIntersecting &&
          entry.intersectionRatio >= (needed.get(entry.target) ?? 0) - 0.01
      )
      .map((entry) => entry.target as HTMLElement)
      .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
    let delay = 0
    for (const el of arrived) {
      if (el.getAttribute(STATE) !== "before") continue
      if (isShown(el) && el.getBoundingClientRect().bottom <= 0) {
        // Already scrolled past: play it now, out of sight, and do not make
        // the parts that ARE on screen queue up behind it.
        reveal(el, 0)
      } else {
        reveal(el, Math.min(delay, 900))
        delay += STAGGER[kindOf(el)] ?? 70
      }
      // A picture inside a chooser keeps being watched: it assembles again
      // each time its panel is chosen.
      if (!inPanel(el)) observer.unobserve(el)
    }
    for (const entry of entries) {
      const el = entry.target as HTMLElement
      if (!entry.isIntersecting && inPanel(el) && !isShown(el)) {
        running.get(el)?.()
        el.setAttribute(STATE, "before")
      }
    }
  }

  // Most things start once their top edge is a little way onto the screen.
  // The watched area also reaches far above the screen, so a part the reader
  // has jumped straight past (a link to the price, the End key) is played in
  // at once, out of sight, and is simply there when they scroll back up.
  const ABOVE = "100000px"
  const edge = new win.IntersectionObserver(onSeen, { rootMargin: `${ABOVE} 0px -8% 0px`, threshold: 0 })

  // A picture waits until most of it is showing, so its assembly is seen from
  // the first piece (Month 1 is at the foot of the months picture). Until
  // then its place is a blank sheet, never a hole. A picture taller than the
  // screen asks for less of itself.
  const pictureWatchers: IntersectionObserver[] = []
  const watchPicture = (el: HTMLElement) => {
    const height = el.getBoundingClientRect().height
    const share = height > 0 ? Math.min(0.65, (0.75 * win.innerHeight) / height) : 0.6
    const threshold = Math.max(0.1, Math.round(share * 100) / 100)
    needed.set(el, threshold)
    const watcher = new win.IntersectionObserver(onSeen, { rootMargin: `${ABOVE} 0px 0px 0px`, threshold })
    watcher.observe(el)
    pictureWatchers.push(watcher)
  }

  for (const el of units) {
    const kind = kindOf(el)
    let hide: boolean
    if (kind === "panel") {
      const open = panelsOf(el).find(isShown)
      hide = open ? belowScreen(open) : false
    } else if (inPanel(el)) {
      hide = !isShown(el) || belowScreen(el)
    } else {
      hide = isShown(el) && belowScreen(el)
    }
    if (hide) el.setAttribute(STATE, "before")
    // A chooser's pictures are always watched, because each one assembles
    // again whenever its panel is chosen.
    if (!hide && !inPanel(el)) continue
    if (kind === "assemble") watchPicture(el)
    else edge.observe(el)
  }

  return () => {
    edge.disconnect()
    pictureWatchers.forEach((watcher) => watcher.disconnect())
    timers.forEach((id) => win.clearTimeout(id))
    Array.from(running.values()).forEach((stop) => stop())
    units.forEach((el) => {
      el.removeAttribute(STATE)
      el.style.removeProperty("--motion-delay")
      tidyStyle(el)
    })
  }
}

export function HomeMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-home-motion]")
    if (!root) return
    return startHomeMotion(root)
  }, [])
  return null
}
