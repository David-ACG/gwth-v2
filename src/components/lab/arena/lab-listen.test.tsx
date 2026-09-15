import { render, screen, cleanup, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, afterEach, vi } from "vitest"
import { LabListen } from "./lab-listen"

afterEach(() => {
  cleanup()
  delete (globalThis as Record<string, unknown>).speechSynthesis
  delete (globalThis as Record<string, unknown>).SpeechSynthesisUtterance
})

/** A speech synthesis stand-in that records what it was asked to say. */
function installSynth() {
  const spoken: string[] = []
  const synth = {
    speaking: false,
    paused: false,
    speak: vi.fn((u: { text: string; onend?: () => void }) => {
      spoken.push(u.text)
      synth.speaking = true
    }),
    cancel: vi.fn(() => {
      synth.speaking = false
      synth.paused = false
    }),
    pause: vi.fn(() => {
      synth.paused = true
    }),
    resume: vi.fn(() => {
      synth.paused = false
    }),
  }
  class Utterance {
    text: string
    lang = ""
    rate = 1
    onend: (() => void) | null = null
    onerror: (() => void) | null = null
    constructor(text: string) {
      this.text = text
    }
  }
  Object.assign(globalThis, {
    speechSynthesis: synth,
    SpeechSynthesisUtterance: Utterance,
  })
  return { synth, spoken }
}

const SEGMENTS = [
  "Make sense of a messy spreadsheet.",
  "The task. You are the office manager at a small community centre in Leeds.",
  "The verdict. Close, slight edge to ChatGPT.",
]

/**
 * The read-aloud control, against David's annotation a-20260914-205206-82935a:
 * "there's not even a voice reader".
 *
 * The frozen decision is that the control is honest in both directions. Where
 * the browser can speak, the button speaks the lab and can be paused and
 * stopped from the keyboard. Where it cannot, the page says so in words rather
 * than leaving a control that does nothing when pressed.
 */
describe("LabListen", () => {
  it("says so plainly when the browser cannot read aloud", async () => {
    render(<LabListen segments={SEGMENTS} covers="Reads the task." />)

    await waitFor(() =>
      expect(screen.getByTestId("lab-listen")).toHaveAttribute(
        "data-listen",
        "unsupported"
      )
    )
    // A truthful fallback, not a dead button.
    expect(screen.queryByRole("button")).toBeNull()
    expect(screen.getByTestId("lab-listen")).toHaveTextContent(
      /cannot read pages aloud/i
    )
  })

  it("reads the lab, and only the parts it says it reads", async () => {
    const { spoken } = installSynth()
    const user = userEvent.setup()
    render(<LabListen segments={SEGMENTS} covers="Reads the task." />)

    const listen = await screen.findByRole("button", { name: "Listen" })
    await user.click(listen)

    const said = spoken.join(" ")
    expect(said).toContain("messy spreadsheet")
    expect(said).toContain("office manager")
    expect(said).toContain("Close, slight edge to ChatGPT")
  })

  it("pauses, resumes and stops, all from the keyboard", async () => {
    const { synth } = installSynth()
    const user = userEvent.setup()
    render(<LabListen segments={SEGMENTS} covers="Reads the task." />)

    const listen = await screen.findByRole("button", { name: "Listen" })
    listen.focus()
    await user.keyboard("{Enter}")

    const pause = await screen.findByRole("button", { name: "Pause" })
    expect(screen.getByRole("status")).toHaveTextContent(/reading/i)

    pause.focus()
    await user.keyboard("{Enter}")
    expect(synth.pause).toHaveBeenCalled()
    expect(screen.getByRole("status")).toHaveTextContent(/paused/i)

    const resume = await screen.findByRole("button", { name: "Resume" })
    resume.focus()
    await user.keyboard(" ")
    expect(synth.resume).toHaveBeenCalled()

    const stop = await screen.findByRole("button", { name: "Stop" })
    stop.focus()
    await user.keyboard("{Enter}")
    expect(synth.cancel).toHaveBeenCalled()
    expect(await screen.findByRole("button", { name: "Listen" })).toBeInTheDocument()
  })

  it("stops talking when the reader leaves the page", async () => {
    const { synth } = installSynth()
    const user = userEvent.setup()
    const view = render(
      <LabListen segments={SEGMENTS} covers="Reads the task." />
    )

    await user.click(await screen.findByRole("button", { name: "Listen" }))
    view.unmount()
    expect(synth.cancel).toHaveBeenCalled()
  })

  it("names what it reads and estimates the length honestly", async () => {
    installSynth()
    render(
      <LabListen
        segments={SEGMENTS}
        covers="Reads the task, the questions to score by and the verdict."
      />
    )
    const panel = screen.getByTestId("lab-listen")
    expect(panel).toHaveTextContent(/questions to score by and the verdict/i)
    // "about N minutes" — an estimate said as one, never a running time.
    expect(panel).toHaveTextContent(/about \d+ minutes?/i)
  })
})
