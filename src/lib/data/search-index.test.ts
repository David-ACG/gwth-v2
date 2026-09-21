/**
 * gwth-launch-4fg: the Cmd+K index used to map the bundled mock arrays, so on
 * gwth.ai - where DATABASE_URL is set and the database is the only catalogue
 * source every other surface reads - the palette offered a syllabus the site
 * does not serve. It also carried no lessons at all while promising "Search
 * lessons, labs, pages...".
 */
import { describe, it, expect, vi, beforeEach } from "vitest"

const getCourses = vi.hoisted(() => vi.fn())
const getLessons = vi.hoisted(() => vi.fn())
const getLabs = vi.hoisted(() => vi.fn())

vi.mock("@/lib/data/courses", () => ({ getCourses }))
vi.mock("@/lib/data/lessons", () => ({ getLessons }))
vi.mock("@/lib/data/labs", () => ({ getLabs }))

import { EMPTY_SEARCH_INDEX, getSearchIndex } from "./search-index"

beforeEach(() => {
  getCourses.mockReset()
  getLessons.mockReset()
  getLabs.mockReset()
})

describe("getSearchIndex", () => {
  it("reads the data layer, not the bundled mock arrays", async () => {
    getCourses.mockResolvedValue([
      { id: "c1", slug: "applied-ai-skills", title: "Applied AI Skills" },
    ])
    getLessons.mockResolvedValue([])
    getLabs.mockResolvedValue([{ id: "lab1", slug: "clean-a-list", title: "Clean a list" }])

    const index = await getSearchIndex()

    expect(getCourses).toHaveBeenCalled()
    expect(getLabs).toHaveBeenCalled()
    expect(index.courses).toEqual([
      { id: "c1", title: "Applied AI Skills", href: "/course/applied-ai-skills" },
    ])
    expect(index.labs).toEqual([
      { id: "lab1", title: "Clean a list", href: "/labs/clean-a-list" },
    ])
  })

  it("carries lessons, addressed under their own course", async () => {
    getCourses.mockResolvedValue([
      { id: "c1", slug: "applied-ai-skills", title: "Applied AI Skills" },
    ])
    getLessons.mockResolvedValue([
      { id: "m1_l01", slug: "welcome-to-gwth", title: "Welcome to GWTH" },
      { id: "m1_l02", slug: "your-ai-toolkit", title: "Your AI Toolkit" },
    ])
    getLabs.mockResolvedValue([])

    const index = await getSearchIndex()

    expect(getLessons).toHaveBeenCalledWith("applied-ai-skills")
    expect(index.lessons).toEqual([
      {
        id: "m1_l01",
        title: "Welcome to GWTH",
        href: "/course/applied-ai-skills/lesson/welcome-to-gwth",
      },
      {
        id: "m1_l02",
        title: "Your AI Toolkit",
        href: "/course/applied-ai-skills/lesson/your-ai-toolkit",
      },
    ])
  })

  it("asks for lessons once per course and keeps each course's own slug", async () => {
    getCourses.mockResolvedValue([
      { id: "c1", slug: "applied-ai-skills", title: "Applied AI Skills" },
      { id: "c2", slug: "second-course", title: "Second Course" },
    ])
    getLessons.mockImplementation(async (slug: string) => [
      { id: `${slug}-l1`, slug: "one", title: `${slug} one` },
    ])
    getLabs.mockResolvedValue([])

    const index = await getSearchIndex()

    expect(getLessons).toHaveBeenCalledTimes(2)
    expect(index.lessons.map((entry) => entry.href)).toEqual([
      "/course/applied-ai-skills/lesson/one",
      "/course/second-course/lesson/one",
    ])
  })

  it("returns an empty index for an empty catalogue rather than mock titles", async () => {
    getCourses.mockResolvedValue([])
    getLabs.mockResolvedValue([])

    const index = await getSearchIndex()

    expect(index).toEqual(EMPTY_SEARCH_INDEX)
    expect(getLessons).not.toHaveBeenCalled()
  })

  it("has a lessons group in the locked-out index, so the palette shape never differs", () => {
    expect(EMPTY_SEARCH_INDEX.lessons).toEqual([])
  })
})
