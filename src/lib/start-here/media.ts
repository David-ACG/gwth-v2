/**
 * Start Here media on R2 (bead gwth-launch-xw6s).
 *
 * The film is lesson-zero-film7, approved by David on 2026-10-17 ("The intro
 * film for lesson zero is excellent. No further changes needed."). Web copies
 * (x264 CRF 26, faststart) of its paper and night masters, the frame at 15 s
 * as the poster, and its captions. The pictures are the lesson's seven
 * published images (light and dark), as WebP at 1536 px wide. Everything
 * sits under a new dated key, so nothing gwth.ai served before is touched.
 */
const BASE = "https://media.gwth.ai/site/start-here/2026-11-06"

export const START_HERE_FILM = {
  paper: { src: `${BASE}/lesson-zero-film-paper.mp4`, poster: `${BASE}/lesson-zero-film-paper-poster.jpg` },
  night: { src: `${BASE}/lesson-zero-film-night.mp4`, poster: `${BASE}/lesson-zero-film-night-poster.jpg` },
  captions: `${BASE}/lesson-zero-film.vtt`,
} as const

export type StartHereImage = { light: string; dark: string; alt: string }

function image(n: number, alt: string): StartHereImage {
  const id = String(n).padStart(2, "0")
  return { light: `${BASE}/start-here-${id}-light.webp`, dark: `${BASE}/start-here-${id}-dark.webp`, alt }
}

/**
 * Where each picture goes: straight after the lesson heading it was drawn
 * for (content/image_prompts.json in the lesson folder). Alt text from the
 * lesson's parts.json, and the brief's description for the first picture.
 */
export const START_HERE_IMAGES: Record<string, StartHereImage> = {
  "Who this lesson is for": image(
    1,
    "A complete beginner and a confident user read the same workbook on a lower landing. Stairs lead up to a larger landing where three people build practical work, labelled later lessons. Both landings rest on one base, labelled foundations."
  ),
  "Tip 1: Speak to AI and listen when it helps": image(2, "Three distinct ways to speak to AI or hear its answers: dictation, voice mode and read aloud."),
  "Tip 4: Show it an example whenever you can": image(3, "An example email guides the layout and length of a new email."),
  "Tip 5: Keep a learning notebook": image(4, "A saved prompt and example are retrieved from a notebook for a similar task."),
  "Tip 7: Look at the labs before you choose": image(5, "Different model answers face the same scenario and checklist before a learner chooses."),
  "Ten more habits worth starting now": image(6, "An adult checks an AI answer against an open reference source."),
  "Vital tips from your first month": image(7, "Five parts, role, task, context, format and limits, combine into a fuller brief for a bigger job."),
}
