/**
 * Import a lesson's parts content into lesson_parts (bead gwth-launch-hqyp).
 *
 *   # the Lesson 10 prototype (GWTH-launch-plan/completion/lesson-formats)
 *   npx tsx scripts/import-lesson-parts.ts --lesson m1_l10 \
 *     --prototype /home/david/projects/GWTH-launch-plan/completion/lesson-formats
 *
 *   # a file already in the site shape (src/lib/lessons/parts.ts)
 *   npx tsx scripts/import-lesson-parts.ts --lesson m1_l10 --site path/to/parts.site.json
 *
 * Options: --media-prefix lessons/<id>/formats (R2 key prefix for media),
 * --out file.json (write the site-shape JSON too), --dry-run (validate only).
 * Writes to DATABASE_URL. The media files themselves go to R2 separately (the
 * pipeline's R2 uploader), under the same prefix.
 *
 * The pipeline's publish-tree contract (1_gwthpipeline520/docs/
 * lesson-parts-contract.md, bead gwth-launch-t97p) will add a third source
 * here once it exists; until then the prototype layout is the input.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import path from "node:path"
import postgres from "postgres"
import { lessonPartsSchema, type LessonPartsContent } from "../src/lib/lessons/parts"

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i === -1 ? undefined : process.argv[i + 1]
}
const flag = (name: string) => process.argv.includes(`--${name}`)

const lessonId = arg("lesson") ?? ""
if (!/^m\d+_l\d{2}$/.test(lessonId)) {
  console.error("--lesson m1_l10 is required")
  process.exit(2)
}
const prefix = (arg("media-prefix") ?? `lessons/${lessonId}/formats`).replace(/\/+$/, "")

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, "utf8")) as T
}

/** [start, word] pairs, words only (punctuation tokens dropped). */
function compactWords(file: string): [number, string][] {
  if (!existsSync(file)) return []
  const raw = readJson<{ word: string; start: number }[]>(file)
  return raw
    .filter((w) => /[A-Za-z0-9]/.test(w.word ?? ""))
    .map((w) => [Math.max(0, Math.round(w.start * 1000) / 1000), w.word] as [number, string])
}

function readText(file: string): string | undefined {
  return existsSync(file) ? readFileSync(file, "utf8") : undefined
}

interface ProtoPart {
  id: string
  title: string
  minutes: number
  body_md: string
  image?: string
  check: { q: string; options: string[]; answer_index: number; feedback_right: string; feedback_wrong: string; explanation?: string }
}

function fromPrototype(dir: string): unknown {
  const base = readJson<{ title: string; parts: ProtoPart[] }>(path.join(dir, "content/base.json"))
  const media = path.join(dir, "media/base")
  const man = readJson<Record<string, number>>(path.join(media, "manifest.json"))
  // Diagram captions live in the prototype's common.js (DIAGRAMS map).
  const common = readFileSync(path.join(dir, "common.js"), "utf8")
  const captions: Record<string, string> = {}
  for (const m of common.matchAll(/^\s*(\w+):\s*"([^"]+)",?\s*$/gm)) if (m[1] && m[2]) captions[m[1]] = m[2]
  return {
    version: 1,
    lessonId,
    title: base.title,
    intro: existsSync(path.join(media, "intro.mp4"))
      ? {
          video: `${prefix}/intro.mp4`,
          poster: `${prefix}/intro.jpg`,
          seconds: man.intro,
          captions: readText(path.join(media, "intro.vtt")),
        }
      : undefined,
    parts: base.parts.map((p, i) => {
      const n = i + 1
      const cap = p.image ? captions[p.image] : undefined
      return {
        id: p.id,
        title: p.title,
        minutes: p.minutes,
        bodyMd: p.body_md,
        image: p.image
          ? {
              light: `${prefix}/img/${p.image}.jpg`,
              dark: `${prefix}/img/${p.image}-dark.jpg`,
              alt: `Diagram: ${cap ?? p.title}`,
              caption: cap,
            }
          : undefined,
        check: {
          question: p.check.q,
          options: p.check.options,
          answerIndex: p.check.answer_index,
          feedbackRight: p.check.feedback_right,
          feedbackWrong: p.check.feedback_wrong,
          explanation: p.check.explanation,
        },
        read: {
          audio: `${prefix}/verbatim_p${n}.mp3`,
          seconds: man[`verbatim_p${n}`],
          words: compactWords(path.join(media, `verbatim_p${n}.words.json`)),
        },
        watch: {
          video: `${prefix}/video_p${n}.mp4`,
          poster: `${prefix}/video_p${n}.jpg`,
          seconds: man[`video_p${n}`],
          captions: readText(path.join(media, `video_p${n}.vtt`)),
        },
      }
    }),
  }
}

async function main() {
  const proto = arg("prototype")
  const site = arg("site")
  const raw = proto ? fromPrototype(proto) : site ? readJson<unknown>(site) : null
  if (!raw) {
    console.error("give --prototype <dir> or --site <file>")
    process.exit(2)
  }
  const parsed = lessonPartsSchema.safeParse(raw)
  if (!parsed.success) {
    console.error("content does not validate:")
    for (const issue of parsed.error.issues.slice(0, 20)) console.error(" ", issue.path.join("."), issue.message)
    process.exit(1)
  }
  const content: LessonPartsContent = parsed.data
  if (content.lessonId !== lessonId) {
    console.error(`file is for ${content.lessonId}, not ${lessonId}`)
    process.exit(1)
  }
  const out = arg("out")
  if (out) writeFileSync(out, JSON.stringify(content, null, 1))
  const words = content.parts.reduce((n, p) => n + p.read.words.length, 0)
  console.log(`${lessonId}: ${content.parts.length} parts, ${words} timed words, media under ${prefix}/`)
  if (flag("dry-run")) return

  const url = process.env.DATABASE_URL
  if (!url) {
    console.error("DATABASE_URL is not set")
    process.exit(2)
  }
  const sql = postgres(url, { max: 1 })
  try {
    const source = proto ? `prototype:${proto}` : `site:${site}`
    await sql`
      insert into lesson_parts (lesson_id, version, content, source)
      values (${lessonId}, ${String(content.version)}, ${sql.json(content as never)}, ${source})
      on conflict (lesson_id) do update
        set version = excluded.version, content = excluded.content, source = excluded.source, imported_at = now()`
    console.log(`stored in lesson_parts (${source})`)
  } finally {
    await sql.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
