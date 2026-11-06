import { afterEach, describe, expect, it } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { HomeFilm } from "./home-film"

// David, 2026-10-21: "We need to put the home page video on the home page."
describe("HomeFilm", () => {
  afterEach(() => cleanup())

  it("shows a poster for each edition and nothing plays until asked", () => {
    const { container } = render(<HomeFilm />)
    expect(container.querySelector("video")).toBeNull()
    const posters = Array.from(container.querySelectorAll("img")).map((i) => i.getAttribute("src"))
    expect(posters.some((s) => s?.endsWith("homepage-film-paper-poster.jpg"))).toBe(true)
    expect(posters.some((s) => s?.endsWith("homepage-film-night-poster.jpg"))).toBe(true)
  })

  it("plays the paper edition in the light theme, with captions on", () => {
    document.documentElement.classList.remove("dark")
    const { container } = render(<HomeFilm />)
    fireEvent.click(screen.getByRole("button", { name: /play the gwth film/i }))
    const video = container.querySelector("video")!
    expect(video.getAttribute("src")).toMatch(/homepage-film-paper\.mp4$/)
    expect(container.querySelector("track")?.getAttribute("src")).toMatch(/homepage-film\.vtt$/)
  })

  // The film says "Try our free lesson to get a feel for the course" (bead
  // gwth-launch-xw6s), so the line under it goes to the free lesson.
  it("links the film's free lesson line to /start-here", () => {
    render(<HomeFilm />)
    const line = screen.getByTestId("home-free-lesson")
    expect(line.textContent).toMatch(/try our free lesson/i)
    expect(screen.getByRole("link", { name: /read start here free/i }).getAttribute("href")).toBe("/start-here")
  })

  it("plays the night edition in the dark theme", () => {
    document.documentElement.classList.add("dark")
    const { container } = render(<HomeFilm />)
    fireEvent.click(screen.getByRole("button", { name: /play the gwth film/i }))
    expect(container.querySelector("video")!.getAttribute("src")).toMatch(/homepage-film-night\.mp4$/)
    document.documentElement.classList.remove("dark")
  })
})
