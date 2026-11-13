import { afterEach, describe, expect, it } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { FILM, HomeFilm } from "./home-film"

// David, 12 Nov 2026: "Home page for GWTH on the P520 with new video we have
// just created and refine everything around it". Film A (the Opus journal
// film, v04) replaced the 21 Oct film.
describe("HomeFilm", () => {
  afterEach(() => cleanup())

  it("shows Film A's poster and plays nothing until asked", () => {
    const { container } = render(<HomeFilm />)
    expect(container.querySelector("video")).toBeNull()
    const posters = Array.from(container.querySelectorAll("img")).map((i) => i.getAttribute("src"))
    expect(posters).toEqual([FILM.poster])
    expect(FILM.poster).toMatch(/\/site\/home-film\/2026-11-13-gpt\/homepage-film-a-gpt-poster\.jpg$/)
  })

  it("plays Film A from its new dated key, with captions on", () => {
    const { container } = render(<HomeFilm />)
    fireEvent.click(screen.getByRole("button", { name: /play the gwth film/i }))
    const video = container.querySelector("video")!
    expect(video.getAttribute("src")).toMatch(/\/site\/home-film\/2026-11-13-gpt\/homepage-film-a-gpt\.mp4$/)
    const track = container.querySelector("track")!
    expect(track.hasAttribute("default")).toBe(true)
    // Same origin: media.gwth.ai sends no CORS header, so a <track> from it
    // would never load.
    expect(track.getAttribute("src")).toBe("/home/film/homepage-film-a.vtt")
  })

  it("plays the same film in the dark theme", () => {
    document.documentElement.classList.add("dark")
    const { container } = render(<HomeFilm />)
    fireEvent.click(screen.getByRole("button", { name: /play the gwth film/i }))
    expect(container.querySelector("video")!.getAttribute("src")).toBe(FILM.src)
    document.documentElement.classList.remove("dark")
  })

  // The film ends "The link is beside this film", on an end card with a
  // "Start here" button, so the panel beside it carries the same words and
  // goes to the free lesson. It says the lesson opens through an email
  // (persona review PR09).
  it("puts the free lesson beside the film, with the end card's words", () => {
    render(<HomeFilm />)
    const panel = screen.getByTestId("home-free-lesson")
    expect(panel.textContent).toMatch(/free lesson/i)
    expect(panel.textContent).toMatch(/email/i)
    expect(screen.getByRole("link", { name: /^start here$/i }).getAttribute("href")).toBe("/start-here")
  })

  it("says how long the film is and that it has captions", () => {
    render(<HomeFilm />)
    expect(screen.getByText(/1 minute 19 seconds/i).textContent).toMatch(/captions/i)
  })
})
