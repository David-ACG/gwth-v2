import { afterEach, describe, expect, it } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { FILM, HomeFilm } from "./home-film"

// David, 20 Nov 2026: "Once you finish rendering please put all the videos
// into the site". The paper cutout film (homepage-paper-depth v06) replaced
// Film A, in two editions: paper in the light theme, night in the dark.
describe("HomeFilm", () => {
  afterEach(() => {
    cleanup()
    document.documentElement.classList.remove("dark")
  })

  it("shows both editions' posters and plays nothing until asked", () => {
    const { container } = render(<HomeFilm />)
    expect(container.querySelector("video")).toBeNull()
    const posters = Array.from(container.querySelectorAll("img")).map((i) => i.getAttribute("src"))
    expect(posters).toEqual([FILM.paper.poster, FILM.night.poster])
    expect(FILM.paper.poster).toMatch(/\/site\/home-film\/2026-11-20-paper-depth-v07\/poster-paper\.jpg$/)
    expect(FILM.night.poster).toMatch(/\/site\/home-film\/2026-11-20-paper-depth-v07\/poster-night\.jpg$/)
    // CSS shows the poster for the current theme.
    const [paper, night] = Array.from(container.querySelectorAll("img"))
    expect(paper!.className).toMatch(/paperOnly/)
    expect(night!.className).toMatch(/nightOnly/)
  })

  it("plays the paper edition in the light theme, from its new dated key, with captions on", () => {
    const { container } = render(<HomeFilm />)
    fireEvent.click(screen.getByRole("button", { name: /play the gwth film/i }))
    const video = container.querySelector("video")!
    expect(video.getAttribute("src")).toMatch(
      /\/site\/home-film\/2026-11-20-paper-depth-v07\/homepage-paper-depth-paper\.mp4$/
    )
    expect(video.getAttribute("poster")).toBe(FILM.paper.poster)
    const track = container.querySelector("track")!
    expect(track.hasAttribute("default")).toBe(true)
    // Same origin: media.gwth.ai sends no CORS header, so a <track> from it
    // would never load.
    expect(track.getAttribute("src")).toBe("/home/film/homepage-film-a.vtt")
  })

  it("plays the night edition in the dark theme", () => {
    document.documentElement.classList.add("dark")
    const { container } = render(<HomeFilm />)
    fireEvent.click(screen.getByRole("button", { name: /play the gwth film/i }))
    const video = container.querySelector("video")!
    expect(video.getAttribute("src")).toMatch(
      /\/site\/home-film\/2026-11-20-paper-depth-v07\/homepage-paper-depth-night\.mp4$/
    )
    expect(video.getAttribute("poster")).toBe(FILM.night.poster)
    expect(container.querySelector("track")!.getAttribute("src")).toBe("/home/film/homepage-film-a.vtt")
  })

  // The film ends "The link is beside this film", on an end card with a
  // "Start here" button, so the panel beside it carries the same words and
  // goes to the free lesson. It says the lesson opens through an email
  // (persona review PR09).
  it("puts the free lesson beside the film, with the end card's words", () => {
    render(<HomeFilm />)
    const panel = screen.getByTestId("home-free-lesson")
    expect(panel.textContent).toMatch(/free lesson/i)
    expect(panel).toHaveTextContent(
      "In the free lesson, you'll watch a short film, read the lesson, then do the project. Enter your email address and we'll send you the link."
    )
    expect(panel).not.toHaveTextContent(/as you go/i)
    expect(screen.getByRole("link", { name: /^start here$/i }).getAttribute("href")).toBe("/start-here")
  })

  it("has no running time or captions line under the film (David, 13 Nov 2026)", () => {
    const { container } = render(<HomeFilm />)
    expect(container.textContent).not.toMatch(/1 minute 19 seconds|English captions/i)
  })
})
