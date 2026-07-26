// Screenshot authenticated pages on a LOCAL dev server, for eyeballing UI
// changes that live behind the login. Added 2026-07-26 after a lesson-viewer
// change could not be checked in a browser.
//
//   node deploy/shot-local-authed.mjs <outDir> [baseUrl]
//
// Credentials come from env (DEMO_EMAIL / DEMO_PASSWORD) so nothing lands in
// the repo. See docs/local-development.md for setting the local account up.
import { chromium } from "playwright"
import { mkdir } from "node:fs/promises"

const OUT = process.argv[2] ?? "completion/local-shots"
const BASE = process.argv[3] ?? "http://localhost:3000"
const EMAIL = process.env.DEMO_EMAIL ?? "local-check@example.com"
const PASSWORD = process.env.DEMO_PASSWORD ?? "Rafiki123"

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })

const res = await page.request.post(`${BASE}/api/auth/sign-in/email`, {
  headers: { "Content-Type": "application/json" },
  data: { email: EMAIL, password: PASSWORD },
})
if (!res.ok()) throw new Error(`sign-in failed: ${res.status()} ${await res.text()}`)

const lessonSlug =
  process.env.LESSON_SLUG ?? "welcome-to-gwth-six-ways-ai-can-give-you-superpowers"

const targets = [
  ["dashboard", "/dashboard", false],
  ["syllabus", "/course/applied-ai-skills", false],
  ["lesson-page1-video", `/course/applied-ai-skills/lesson/${lessonSlug}`, false],
]

for (const [name, path, full] of targets) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 120000 })
  await page.waitForTimeout(2500)
  if (page.url().includes("/login")) throw new Error(`${path} bounced to /login`)
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full })
  console.log(`${name}: ${page.url()}`)
}

// The lesson viewer paginates in client state, not the URL, so a prose page has
// to be reached by clicking. Page 2 is the first prose page and the one that
// shows the narration control in its normal (playable) state.
await page.goto(`${BASE}/course/applied-ai-skills/lesson/${lessonSlug}`, {
  waitUntil: "networkidle",
  timeout: 120000,
})
await page.waitForTimeout(2000)
const continueBtn = page.getByRole("button", { name: /continue/i }).first()
if (await continueBtn.count()) {
  await continueBtn.click()
} else {
  await page.getByText("Overview", { exact: false }).first().click()
}
await page.waitForTimeout(2500)
await page.screenshot({ path: `${OUT}/lesson-prose-narration.png` })
console.log(`lesson-prose-narration: captured`)

await browser.close()
console.log(`wrote shots to ${OUT}`)
