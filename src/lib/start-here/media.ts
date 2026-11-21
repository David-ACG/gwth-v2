/**
 * Start Here media on R2 (bead gwth-launch-xw6s).
 *
 * The film is the ink and watercolour lesson zero film (v03), in paper and
 * night editions. David, 20 Nov 2026: "Once you finish rendering please put
 * all the videos into the site". Its narration is the newer 12 Nov lesson zero
 * intro, not the one in the film this replaced: David chose to put the new
 * films into the site, so the new narration comes with it on purpose. Web
 * copies (x264, faststart) and posters from
 * GWTH-launch-plan/completion/lesson-zero-film-new-style/, under a new dated
 * key (site/start-here/2026-11-20-watercolour/).
 *
 * Before it: lesson-zero-film7, approved by David on 2026-10-17 ("The intro
 * film for lesson zero is excellent. No further changes needed."), still on R2
 * untouched under site/start-here/2026-11-06/ so it can come back.
 *
 * The captions are served from this site (public/start-here-film/), not from
 * R2: media.gwth.ai sends no CORS header, so a <track> from it never loads
 * (the 6 Nov captions sat on R2 and so never showed). The folder name is one
 * no route uses, so nothing shadows it.
 *
 * The pictures are the lesson's seven published images (light and dark), as
 * WebP at 1536 px wide, still under the 6 Nov key. Everything sits under dated
 * keys, so nothing gwth.ai served before is touched.
 */
const BASE = "https://media.gwth.ai/site/start-here/2026-11-06"
const FILM_BASE = "https://media.gwth.ai/site/start-here/2026-11-20-watercolour"

export const START_HERE_FILM = {
  paper: { src: `${FILM_BASE}/lesson-zero-watercolour-paper.mp4`, poster: `${FILM_BASE}/poster-paper.jpg` },
  night: { src: `${FILM_BASE}/lesson-zero-watercolour-night.mp4`, poster: `${FILM_BASE}/poster-night.jpg` },
  captions: "/start-here-film/lesson-zero-film.vtt",
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
  // The 21 Nov lesson has no "Vital tips" section; this picture sits with Tip 2, as in the lesson parts (parts.json p2 used i07).
  "Tip 2: Ask AI as you would ask a new colleague": image(7, "Five parts, role, task, context, format and limits, combine into a fuller brief for a bigger job."),
}
