/** The Listen bar's speed menu reaches 2x (David, 21 Nov 2026: "Add read-aloud + 2x"). */
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { LISTEN_SPEEDS, ListenBar } from "./media-bits"
import { COPY } from "./copy"

describe("ListenBar speed menu", () => {
  it("offers 0.75x to 2x in order, starting at 1x", () => {
    expect(LISTEN_SPEEDS).toEqual(["0.75", "1", "1.25", "1.5", "1.75", "2"])
    render(
      <ListenBar
        src="/audio.mp3"
        seconds={60}
        readAlong={false}
        onReadAlong={() => {}}
        onPlay={() => {}}
        onPause={() => {}}
        onEnded={() => {}}
      />
    )
    const select = screen.getByLabelText(new RegExp(COPY.speed)) as HTMLSelectElement
    expect(Array.from(select.options).map((o) => o.textContent)).toEqual(["0.75x", "1x", "1.25x", "1.5x", "1.75x", "2x"])
    expect(select.value).toBe("1")
  })
})
