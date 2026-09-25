import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import type { PageComment } from "@/lib/comments/types"

let mockPath = "/course/ai/lesson/l01"
vi.mock("next/navigation", () => ({
  usePathname: () => mockPath,
}))

import { CommentLayer } from "./comment-layer"

type FetchCall = { url: string; init?: RequestInit }

const PARA_TEXT = "Most people are still learning how to use AI in everyday work and life."

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  })
}

function makeComment(over: Partial<PageComment> = {}): PageComment {
  return {
    id: "c1",
    userId: "u1",
    authorEmail: "tester@example.com",
    authorRole: "beta",
    site: "local",
    status: "open",
    triage: null,
    pagePath: mockPath,
    lessonId: "m1_l01",
    lessonPage: 5,
    targetType: "text",
    quote: "still learning how to use AI",
    selector: "#para",
    selectorKind: "id",
    shape: { kind: "point", rel: { x: 0.5, y: 0, w: 0.1, h: 1 } },
    comment: "Check this is still the latest figure",
    createdAt: "2026-09-25T10:00:00.000Z",
    updatedAt: "2026-09-25T10:00:00.000Z",
    ...over,
  }
}

let calls: FetchCall[] = []
let listed: PageComment[] = []

function installFetch(overrides: Partial<Record<string, (init?: RequestInit) => Response>> = {}) {
  calls = []
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      calls.push({ url, init })
      const method = init?.method ?? "GET"
      const key = `${method} ${url.split("?")[0]}`
      const custom = overrides[key]
      if (custom) return custom(init)
      if (method === "GET" && url.startsWith("/api/comments")) {
        return jsonResponse(200, { comments: listed })
      }
      if (method === "POST" && url === "/api/comments") {
        const body = JSON.parse(String(init?.body)) as Record<string, unknown>
        return jsonResponse(201, {
          comment: makeComment({ id: "new", createdAt: "2026-09-25T12:00:00.000Z", ...body }),
        })
      }
      if (method === "PATCH") return jsonResponse(200, { comment: makeComment({ status: "withdrawn" }) })
      if (method === "POST" && url === "/api/lesson-draft/verdict") return jsonResponse(200, { ok: true })
      return jsonResponse(404, {})
    }),
  )
}

function rect(left: number, top: number, width: number, height: number): DOMRect {
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect
}

function mountPage() {
  const host = document.createElement("div")
  host.innerHTML = `
    <header><p id="head-text">Site header words</p></header>
    <main>
      <div data-section="lesson-viewer" data-lesson-id="m1_l01" data-lesson-page="5"
        data-lesson-page-title="Why this matters now, in the UK" data-lesson-variant="draft"
        data-lesson-draft-available="1">
        <h2>Why this matters</h2>
        <p id="para">${PARA_TEXT}</p>
        <p id="two">Some <strong>bold</strong> words here.</p>
        <img id="pic" src="/media/superpowers.png" alt="The six superpowers" width="600" height="300">
      </div>
    </main>`
  document.body.appendChild(host)
  document.getElementById("para")!.getBoundingClientRect = () => rect(100, 200, 800, 100)
  return host
}

function selectRange(start: Node, startOffset: number, end: Node, endOffset: number, target: Element) {
  const range = document.createRange()
  range.setStart(start, startOffset)
  range.setEnd(end, endOffset)
  const sel = window.getSelection()!
  sel.removeAllRanges()
  sel.addRange(range)
  fireEvent.mouseUp(target)
}

function selectWords(el: Element, words: string) {
  const node = el.firstChild as Text
  const start = node.data.indexOf(words)
  selectRange(node, start, node, start + words.length, el)
}

function lastPost(): Record<string, unknown> {
  const post = calls.filter((c) => c.init?.method === "POST" && c.url === "/api/comments").pop()
  if (!post) throw new Error("no POST")
  return JSON.parse(String(post.init?.body)) as Record<string, unknown>
}

async function openCardForWords(words = "still learning how to use AI") {
  act(() => selectWords(document.getElementById("para")!, words))
  fireEvent.click(await screen.findByRole("button", { name: "Comment" }))
  return screen.findByRole("dialog", { name: "What is wrong here?" })
}

beforeEach(() => {
  mockPath = "/course/ai/lesson/l01"
  listed = []
  document.title = "Lesson 1: Why AI now"
  window.localStorage.clear()
  installFetch()
})

afterEach(() => {
  cleanup()
  window.getSelection()?.removeAllRanges()
  document.body.innerHTML = ""
  vi.unstubAllGlobals()
})

describe("CommentLayer: the bar", () => {
  it("renders nothing on admin pages and makes no requests", () => {
    mockPath = "/admin/roster"
    mountPage()
    render(<CommentLayer role="admin" email="david@example.com" />)
    expect(screen.queryByRole("group", { name: "Comments" })).toBeNull()
    expect(calls).toHaveLength(0)
  })

  it("shows only the bar until you act, with the count for this page", async () => {
    listed = [makeComment(), makeComment({ id: "c2", status: "fixed", createdAt: "2026-09-25T11:00:00.000Z" })]
    mountPage()
    render(<CommentLayer role="beta" email="tester@example.com" />)
    const bar = screen.getByRole("group", { name: "Comments" })
    expect(within(bar).getByRole("button", { name: "On" })).toHaveAttribute("aria-pressed", "true")
    expect(within(bar).getByRole("button", { name: "Box" })).toHaveAttribute("aria-pressed", "false")
    expect(await within(bar).findByText("2 on this page, 1 fixed")).toBeInTheDocument()
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(screen.queryByRole("button", { name: "Comment" })).toBeNull()
  })

  it("Off hides the marks, stops capturing, and is remembered", async () => {
    listed = [makeComment()]
    mountPage()
    const { unmount } = render(<CommentLayer role="beta" />)
    expect(await screen.findByRole("button", { name: "Comment 1, Open" })).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "On" }))
    expect(screen.getByRole("button", { name: "Off" })).toHaveAttribute("aria-pressed", "false")
    expect(screen.queryByRole("button", { name: "Comment 1, Open" })).toBeNull()
    expect(screen.getByRole("button", { name: "Box" })).toBeDisabled()
    expect(window.localStorage.getItem("gwth-comments-on")).toBe("off")

    act(() => selectWords(document.getElementById("para")!, "everyday work"))
    await act(async () => {})
    expect(screen.queryByRole("button", { name: "Comment" })).toBeNull()

    unmount()
    render(<CommentLayer role="beta" />)
    expect(screen.getByRole("button", { name: "Off" })).toBeInTheDocument()
  })

  it("beta testers never see the draft controls", async () => {
    mountPage()
    render(<CommentLayer role="beta" />)
    await waitFor(() => expect(calls.length).toBeGreaterThan(0))
    expect(screen.queryByRole("button", { name: "Approve draft" })).toBeNull()
    expect(screen.queryByRole("button", { name: "Send back" })).toBeNull()
  })

  it("admin approves a draft after a yes, then links to the live version", async () => {
    mountPage()
    render(<CommentLayer role="admin" email="david@example.com" />)
    fireEvent.click(screen.getByRole("button", { name: "Approve draft" }))
    expect(screen.getByText("Approve this draft?")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Yes" }))
    const link = await screen.findByRole("link", { name: "Show live" })
    expect(link.getAttribute("href")).toContain("variant=live")
    expect(screen.getByText(/Draft approved\./)).toBeInTheDocument()
    const verdict = calls.find((c) => c.url === "/api/lesson-draft/verdict")!
    expect(JSON.parse(String(verdict.init?.body))).toEqual({ lessonId: "m1_l01", verdict: "approved" })
  })

  it("admin sends a draft back only with words", async () => {
    mountPage()
    render(<CommentLayer role="admin" email="david@example.com" />)
    fireEvent.click(screen.getByRole("button", { name: "Send back" }))
    const note = screen.getByPlaceholderText("What should change, in your own words")
    const send = screen.getByRole("button", { name: "Send back" })
    expect(send).toBeDisabled()
    fireEvent.change(note, { target: { value: "Shorter opening please" } })
    fireEvent.click(send)
    expect(await screen.findByText("Sent back for a rewrite.")).toBeInTheDocument()
    const verdict = calls.find((c) => c.url === "/api/lesson-draft/verdict")!
    expect(JSON.parse(String(verdict.init?.body))).toEqual({
      lessonId: "m1_l01",
      verdict: "sent_back",
      note: "Shorter opening please",
    })
  })
})

describe("CommentLayer: capture and the card", () => {
  it("select words, Comment, pick a canned action, Enter saves it", async () => {
    mountPage()
    render(<CommentLayer role="beta" email="tester@example.com" />)
    const card = await openCardForWords()
    expect(card).toHaveTextContent("Lesson 1, page 5, draft")
    expect(card).toHaveTextContent("“still learning how to use AI”")
    expect(within(card).getByRole("group", { name: "Content" })).toBeInTheDocument()
    expect(within(card).getByRole("button", { name: "Save" })).toBeDisabled()

    const chip = within(card).getByRole("button", { name: "Simplify this" })
    fireEvent.click(chip)
    expect(chip).toHaveAttribute("aria-pressed", "true")
    fireEvent.keyDown(chip, { key: "Enter" })

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    const body = lastPost()
    expect(body).toMatchObject({
      pagePath: window.location.pathname,
      pageTitle: "Lesson 1: Why AI now",
      lessonId: "m1_l01",
      lessonPage: 5,
      lessonVariant: "draft",
      targetType: "text",
      quote: "still learning how to use AI",
      quotePrefix: "Most people are ",
      selector: "#para",
      selectorKind: "id",
      heading: "Why this matters",
      comment: "",
      action: { category: "content", key: "simplify", label: "Simplify this" },
    })
    expect((body.shape as { kind: string }).kind).toBe("point")
    expect(body.textEdit).toBeUndefined()
    expect(await screen.findByRole("button", { name: "Comment 1, Open" })).toHaveTextContent("1")
    expect(screen.getByText("1 on this page, 0 fixed")).toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent("Saved")
  })

  it("only one canned action at a time, and tapping again clears it", async () => {
    mountPage()
    render(<CommentLayer role="beta" />)
    const card = await openCardForWords()
    const a = within(card).getByRole("button", { name: "Spacing" })
    const b = within(card).getByRole("button", { name: "Broken" })
    fireEvent.click(a)
    fireEvent.click(b)
    expect(a).toHaveAttribute("aria-pressed", "false")
    expect(b).toHaveAttribute("aria-pressed", "true")
    fireEvent.click(b)
    expect(b).toHaveAttribute("aria-pressed", "false")
    expect(within(card).getByRole("button", { name: "Save" })).toBeDisabled()
  })

  it("words alone save, Shift+Enter does not, and Escape cancels", async () => {
    mountPage()
    render(<CommentLayer role="beta" />)
    await openCardForWords("everyday work")
    const box = screen.getByPlaceholderText("In your own words (optional if you picked one above)")
    await waitFor(() => expect(box).toHaveFocus())
    fireEvent.change(box, { target: { value: "line one" } })
    fireEvent.keyDown(box, { key: "Enter", shiftKey: true })
    expect(calls.some((c) => c.init?.method === "POST")).toBe(false)

    fireEvent.keyDown(document, { key: "Escape" })
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())

    await openCardForWords("everyday work")
    const again = screen.getByPlaceholderText("In your own words (optional if you picked one above)")
    fireEvent.change(again, { target: { value: "This sounds vague" } })
    fireEvent.keyDown(again, { key: "Enter" })
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(lastPost()).toMatchObject({ comment: "This sounds vague", quote: "everyday work" })
    expect(lastPost().action).toBeUndefined()
  })

  it("Cancel closes the card without saving", async () => {
    mountPage()
    render(<CommentLayer role="beta" />)
    await openCardForWords()
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(calls.some((c) => c.init?.method === "POST")).toBe(false)
  })

  it("does not offer the button for selections in the header", async () => {
    mountPage()
    render(<CommentLayer role="beta" />)
    act(() => selectWords(document.getElementById("head-text")!, "header words"))
    await act(async () => {})
    expect(screen.queryByRole("button", { name: "Comment" })).toBeNull()
  })

  it("comments on a picture with its alt text", async () => {
    mountPage()
    render(<CommentLayer role="beta" />)
    fireEvent.click(document.getElementById("pic")!)
    fireEvent.click(await screen.findByRole("button", { name: "Comment" }))
    const card = await screen.findByRole("dialog", { name: "What is wrong here?" })
    expect(card).toHaveTextContent("Picture: The six superpowers")
    expect(within(card).queryByRole("button", { name: "Edit the words" })).toBeNull()
    fireEvent.click(within(card).getByRole("button", { name: "Replace this image" }))
    fireEvent.click(within(card).getByRole("button", { name: "Save" }))
    await waitFor(() => expect(calls.some((c) => c.init?.method === "POST")).toBe(true))
    expect(lastPost()).toMatchObject({
      targetType: "image",
      quote: "The six superpowers",
      imageAlt: "The six superpowers",
      selector: "#pic",
      action: { category: "image", key: "replace", label: "Replace this image" },
      shape: { kind: "point" },
    })
  })

  it("Box: drag over the page to comment on an area", async () => {
    mountPage()
    render(<CommentLayer role="beta" />)
    fireEvent.click(screen.getByRole("button", { name: "Box" }))
    expect(screen.getByRole("button", { name: "Box" })).toHaveAttribute("aria-pressed", "true")

    const para = document.getElementById("para")!
    fireEvent.mouseDown(para, { button: 0, clientX: 180, clientY: 210 })
    fireEvent.mouseMove(para, { clientX: 300, clientY: 240 })
    fireEvent.mouseMove(para, { clientX: 380, clientY: 260 })
    fireEvent.mouseUp(para, { clientX: 380, clientY: 260 })

    const card = await screen.findByRole("dialog", { name: "What is wrong here?" })
    expect(card).toHaveTextContent("This area")
    expect(within(card).queryByRole("button", { name: "Edit the words" })).toBeNull()
    fireEvent.click(within(card).getByRole("button", { name: "Spacing" }))
    fireEvent.click(within(card).getByRole("button", { name: "Save" }))
    await waitFor(() => expect(calls.some((c) => c.init?.method === "POST")).toBe(true))
    const body = lastPost()
    expect(body).toMatchObject({
      targetType: "area",
      selector: "#para",
      selectorKind: "id",
      heading: "Why this matters",
      action: { category: "design", key: "spacing", label: "Spacing" },
      shape: { kind: "box", rel: { x: 0.1, y: 0.1, w: 0.25, h: 0.5 } },
    })
    expect(body.quote).toBeUndefined()
  })

  it("Box: a click without a drag opens nothing", async () => {
    mountPage()
    render(<CommentLayer role="beta" />)
    fireEvent.click(screen.getByRole("button", { name: "Box" }))
    const para = document.getElementById("para")!
    fireEvent.mouseDown(para, { button: 0, clientX: 180, clientY: 210 })
    fireEvent.mouseUp(para, { clientX: 182, clientY: 211 })
    await act(async () => {})
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("shows an error and keeps the card open when saving fails", async () => {
    installFetch({ "POST /api/comments": () => jsonResponse(500, {}) })
    mountPage()
    render(<CommentLayer role="beta" />)
    await openCardForWords("everyday work")
    fireEvent.click(screen.getByRole("button", { name: "Broken" }))
    fireEvent.click(screen.getByRole("button", { name: "Save" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not save. Try again.")
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })
})

describe("CommentLayer: edit the words", () => {
  it("edits the text in place and saves a text edit", async () => {
    mountPage()
    render(<CommentLayer role="beta" />)
    const card = await openCardForWords("everyday work")
    fireEvent.click(within(card).getByRole("button", { name: "Edit the words" }))

    const span = document.querySelector("[data-comment-edit]") as HTMLElement
    expect(span).not.toBeNull()
    expect(span.textContent).toBe(PARA_TEXT)
    expect(within(card).queryByRole("button", { name: "Edit the words" })).toBeNull()
    span.textContent = "Most people are still learning to use AI at work and at home."
    fireEvent.keyDown(span, { key: "Enter" })

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    // The page's own text is back exactly as it was.
    expect(document.querySelector("[data-comment-edit]")).toBeNull()
    expect(document.getElementById("para")!.textContent).toBe(PARA_TEXT)
    expect(document.getElementById("para")!.firstChild?.nodeType).toBe(Node.TEXT_NODE)

    const body = lastPost()
    expect(body).toMatchObject({
      targetType: "text",
      quote: PARA_TEXT,
      selector: "#para",
      comment: "",
      textEdit: {
        original: PARA_TEXT,
        replacement: "Most people are still learning to use AI at work and at home.",
      },
    })
    const mark = await screen.findByRole("button", { name: "Comment 1, Open" })
    expect(mark.parentElement).toHaveTextContent("edit")
  })

  it("Escape in the edit puts the words back and keeps the card", async () => {
    mountPage()
    render(<CommentLayer role="beta" />)
    const card = await openCardForWords("everyday work")
    fireEvent.click(within(card).getByRole("button", { name: "Edit the words" }))
    const span = document.querySelector("[data-comment-edit]") as HTMLElement
    span.textContent = "Something else"
    fireEvent.keyDown(span, { key: "Escape" })
    expect(document.querySelector("[data-comment-edit]")).toBeNull()
    expect(document.getElementById("para")!.textContent).toBe(PARA_TEXT)
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(within(card).getByRole("button", { name: "Edit the words" })).toBeInTheDocument()
  })

  it("Cancel while editing restores the page", async () => {
    mountPage()
    render(<CommentLayer role="beta" />)
    const card = await openCardForWords("everyday work")
    fireEvent.click(within(card).getByRole("button", { name: "Edit the words" }))
    fireEvent.click(within(card).getByRole("button", { name: "Cancel" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(document.querySelector("[data-comment-edit]")).toBeNull()
    expect(document.getElementById("para")!.textContent).toBe(PARA_TEXT)
  })

  it("hides Edit the words when the selection spans more than one text node", async () => {
    mountPage()
    render(<CommentLayer role="beta" />)
    const two = document.getElementById("two")!
    const first = two.firstChild as Text
    const bold = two.querySelector("strong")!.firstChild as Text
    act(() => selectRange(first, 0, bold, 4, two))
    fireEvent.click(await screen.findByRole("button", { name: "Comment" }))
    const card = await screen.findByRole("dialog", { name: "What is wrong here?" })
    expect(card).toHaveTextContent("“Some bold”")
    expect(within(card).queryByRole("button", { name: "Edit the words" })).toBeNull()
  })
})

describe("CommentLayer: marks", () => {
  it("draws numbered marks from the list, with chips for fixed, not needed and edits", async () => {
    listed = [
      makeComment({ id: "c3", createdAt: "2026-09-25T12:00:00.000Z", status: "declined" }),
      makeComment({ id: "c1" }),
      makeComment({
        id: "c2",
        createdAt: "2026-09-25T11:00:00.000Z",
        targetType: "image",
        quote: "The six superpowers",
        imageAlt: "The six superpowers",
        selector: "#pic",
        status: "fixed",
      }),
      makeComment({ id: "gone", status: "withdrawn" }),
      makeComment({
        id: "lost",
        createdAt: "2026-09-25T12:30:00.000Z",
        selector: "#nowhere",
        quote: "words that are not on the page",
      }),
      makeComment({
        id: "c4",
        createdAt: "2026-09-25T13:00:00.000Z",
        textEdit: { original: PARA_TEXT, replacement: "Shorter." },
      }),
    ]
    mountPage()
    render(<CommentLayer role="beta" />)
    const one = await screen.findByRole("button", { name: "Comment 1, Open" })
    expect(one).toHaveTextContent("1")
    const two = screen.getByRole("button", { name: "Comment 2, Fixed" })
    expect(two).toHaveTextContent("2")
    expect(two.parentElement).toHaveTextContent("Fixed")
    const three = screen.getByRole("button", { name: "Comment 3, Not needed" })
    expect(three.parentElement).toHaveTextContent("Not needed")
    // The lost one keeps its number but is not drawn.
    expect(screen.queryByRole("button", { name: /^Comment 4,/ })).toBeNull()
    const five = screen.getByRole("button", { name: "Comment 5, Open" })
    expect(five.parentElement).toHaveTextContent("edit")
    expect(screen.getByText("5 on this page, 1 fixed")).toBeInTheDocument()
  })

  it("finds a mark by its words when the anchored element has gone", async () => {
    listed = [makeComment({ selector: "#old-para", quote: "in everyday work" })]
    mountPage()
    render(<CommentLayer role="beta" />)
    expect(await screen.findByRole("button", { name: "Comment 1, Open" })).toBeInTheDocument()
  })

  it("shows only this lesson page's marks and follows a page turn", async () => {
    listed = [
      makeComment({ id: "p5" }),
      makeComment({ id: "p4", lessonPage: 4, status: "accepted", quote: "Why this matters", selector: "h2" }),
    ]
    mountPage()
    render(<CommentLayer role="beta" />)
    expect(await screen.findByRole("button", { name: "Comment 1, Open" })).toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: /^Comment \d/ })).toHaveLength(1)
    expect(screen.getByText("1 on this page, 0 fixed")).toBeInTheDocument()

    act(() => {
      document.querySelector('[data-section="lesson-viewer"]')!.setAttribute("data-lesson-page", "4")
    })
    expect(await screen.findByRole("button", { name: "Comment 1, Accepted" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Comment 1, Open" })).toBeNull()
    expect(screen.getAllByRole("button", { name: /^Comment \d/ })).toHaveLength(1)
  })

  it("a mark opens a read card, and the author can remove an open one", async () => {
    listed = [makeComment({ action: { category: "content", key: "simplify", label: "Simplify this" } })]
    mountPage()
    render(<CommentLayer role="beta" />)
    fireEvent.click(await screen.findByRole("button", { name: "Comment 1, Open" }))
    const card = await screen.findByRole("dialog", { name: "Comment 1" })
    expect(card).toHaveTextContent("Simplify this")
    expect(card).toHaveTextContent("Check this is still the latest figure")
    expect(card).toHaveTextContent("Open")
    expect(card).not.toHaveTextContent("tester@example.com")
    fireEvent.click(within(card).getByRole("button", { name: "Remove" }))
    await waitFor(() => expect(screen.queryByRole("button", { name: "Comment 1, Open" })).toBeNull())
    const patch = calls.find((c) => c.init?.method === "PATCH")!
    expect(patch.url).toBe("/api/comments/c1")
    expect(JSON.parse(String(patch.init?.body))).toEqual({ status: "withdrawn" })
    expect(screen.getByText("0 on this page, 0 fixed")).toBeInTheDocument()
  })

  it("admin sees the author and cannot remove someone else's comment", async () => {
    listed = [makeComment({ authorEmail: "tester@example.com" })]
    mountPage()
    render(<CommentLayer role="admin" email="david@example.com" />)
    fireEvent.click(await screen.findByRole("button", { name: "Comment 1, Open" }))
    const card = await screen.findByRole("dialog", { name: "Comment 1" })
    expect(card).toHaveTextContent("tester@example.com")
    expect(within(card).queryByRole("button", { name: "Remove" })).toBeNull()
    fireEvent.keyDown(document, { key: "Escape" })
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })
})
