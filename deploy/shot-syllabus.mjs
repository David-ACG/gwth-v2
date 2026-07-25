// Capture the syllabus page on live gwth.ai as the demo student, for the
// walkthrough step "syllabus". Credentials are passed in via env so they never
// land in the repo.
import { chromium } from "playwright"

const EMAIL = process.env.DEMO_EMAIL
const PASSWORD = process.env.DEMO_PASSWORD
const OUT = process.env.OUT || "auth-syllabus.png"

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const res = await page.request.post("https://gwth.ai/api/auth/sign-in/email", {
  headers: { "Content-Type": "application/json" },
  data: { email: EMAIL, password: PASSWORD },
})
if (!res.ok()) throw new Error(`sign-in failed: ${res.status()} ${await res.text()}`)

await page.goto("https://gwth.ai/course/applied-ai-skills", {
  waitUntil: "networkidle",
  timeout: 60000,
})
await page.waitForTimeout(2500)

const title = await page.title()
const lessons = await page.locator('a[href*="/lesson/"]').count()
console.log(`title=${title} lessonLinks=${lessons} url=${page.url()}`)
if (page.url().includes("/login")) throw new Error("bounced to /login: session did not stick")

await page.screenshot({ path: OUT, fullPage: true })
console.log(`wrote ${OUT}`)
await browser.close()
