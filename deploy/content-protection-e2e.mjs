// End-to-end proof of the content-protection slice on the hlab preview
// (bead gwth-launch-735c). Local preview database only, never production.
//
//   node deploy/content-protection-e2e.mjs <outDir> [baseUrl]
//
// 1. Signs up three demo learners through the app (verified + granted in SQL):
//    a copier (beta, Month 1), a gated payer (paid Month 2, 5 of Month 1 done)
//    and a payer under review (paid Month 2, 20 done, open flag on Month 2).
// 2. The copier opens 23 lessons back to back over HTTP, as a scraper would.
// 3. Checks: lesson media links are signed, an old signed link expires, the
//    copier is flagged with Month 2 held, the notices read right, and
//    /admin/flagged shows the flag (signed in as the review admin).
// Writes screenshots + results.json to <outDir>. Credentials from env:
//   REVIEW_ADMIN_EMAIL, REVIEW_PASSWORD (review/whole-product/fixtures.env).
import { chromium } from "playwright"
import { mkdir, writeFile } from "node:fs/promises"
import { execFileSync } from "node:child_process"
import { randomBytes } from "node:crypto"

const OUT = process.argv[2] ?? "completion/content-protection"
const BASE = process.argv[3] ?? "https://hlab.taila51191.ts.net:9458"
const PASSWORD = `Cp-${randomBytes(9).toString("base64url")}`
const PEOPLE = {
  copier: "content-demo-copier@example.com",
  gated: "content-demo-gated@example.com",
  review: "content-demo-review@example.com",
}
const psql = (sql) =>
  execFileSync("docker", ["exec", "-i", "gwth-v2-dev-postgres", "psql", "-U", "gwth", "-d", "gwth_v2", "-Atq", "-v", "ON_ERROR_STOP=1"], { input: sql }).toString().trim()

await mkdir(OUT, { recursive: true })
const results = { base: BASE, checks: [] }
const check = (name, ok, detail = "") => {
  results.checks.push({ name, ok: Boolean(ok), detail })
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` - ${detail}` : ""}`)
}

// ---- 1. demo learners
psql(`delete from "user" where email in ('${Object.values(PEOPLE).join("','")}');`)
const browser = await chromium.launch()
for (const email of Object.values(PEOPLE)) {
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true })
  const res = await ctx.request.post(`${BASE}/api/auth/sign-up/email`, {
    headers: { "Content-Type": "application/json", Origin: BASE },
    data: { email, password: PASSWORD, name: email.split("@")[0].replace("content-demo-", "Demo ") },
  })
  if (!res.ok()) throw new Error(`sign-up ${email}: ${res.status()} ${await res.text()}`)
  await ctx.close()
}
const lessons = psql(`select id || '|' || slug from lessons where month = 1 and not is_optional order by "order";`).split("\n").map((l) => l.split("|"))
const ids = (n) => lessons.slice(0, n).map(([id]) => `'${id}'`).join(",")
psql(`
update "user" set email_verified = true where email in ('${Object.values(PEOPLE).join("','")}');
insert into user_access (user_id, access_source, subscription_state, subscription_month)
  select id, 'manual_beta', 'month1', 1 from "user" where email = '${PEOPLE.copier}';
insert into user_access (user_id, access_source, subscription_state, subscription_month, course_months_paid, stripe_subscription_status)
  select id, 'stripe_course', 'month2', 2, 2, 'active' from "user" where email in ('${PEOPLE.gated}', '${PEOPLE.review}');
insert into lesson_progress (user_id, lesson_id, is_completed, completed_at)
  select u.id, l.id, true, now() - interval '3 days' from "user" u, lessons l where u.email = '${PEOPLE.gated}' and l.id in (${ids(5)});
insert into lesson_progress (user_id, lesson_id, is_completed, completed_at)
  select u.id, l.id, true, now() - interval '3 days' from "user" u, lessons l where u.email = '${PEOPLE.review}' and l.id in (${ids(Math.ceil(lessons.length * 0.75))});
insert into content_access_flags (user_id, status, held_month, reasons, signals)
  select id, 'open', 2, '["24 new lessons in 10 minutes (the line is 20)"]', '{}' from "user" where email = '${PEOPLE.review}';
`)

async function signedIn(email) {
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 900 } })
  const res = await ctx.request.post(`${BASE}/api/auth/sign-in/email`, {
    headers: { "Content-Type": "application/json", Origin: BASE },
    data: { email, password: email === process.env.REVIEW_ADMIN_EMAIL ? process.env.REVIEW_PASSWORD : PASSWORD },
  })
  if (!res.ok()) throw new Error(`sign-in ${email}: ${res.status()} ${await res.text()}`)
  return ctx
}

// ---- 2. the copier opens 23 lessons back to back
const copier = await signedIn(PEOPLE.copier)
let firstHtml = ""
for (const [, slug] of lessons.slice(0, 23)) {
  const r = await copier.request.get(`${BASE}/course/applied-ai-skills/lesson/${slug}`)
  if (!firstHtml) firstHtml = await r.text()
  await new Promise((ok) => setTimeout(ok, 1500))
}
await new Promise((ok) => setTimeout(ok, 3000)) // recording runs after the response

// ---- 3a. signed links in the page
const signed = [...new Set(firstHtml.match(/https:\/\/gwth-media\.(?:[^"'\\\s)<>]|\\u0026)+/g) ?? [])].filter((u) => u.includes("X-Amz-Signature"))
const plainLesson = (firstHtml.match(/https:\/\/media\.gwth\.ai\/lessons\/[^"'\\\s)]+/g) ?? [])
check("lesson media links are signed", signed.length > 0, `${signed.length} signed, ${plainLesson.length} plain lesson URLs left`)
check("no plain lesson media URL left in the page", plainLesson.length === 0)
if (signed[0]) {
  const url = signed[0].replace(/&amp;|\\u0026/g, "&")
  const ok = await fetch(url, { headers: { Range: "bytes=0-99" } })
  check("a signed link works", ok.status === 200 || ok.status === 206, `HTTP ${ok.status}`)
  const tampered = await fetch(url.replace(/X-Amz-Signature=[0-9a-f]{4}/, "X-Amz-Signature=0000"))
  check("a tampered link is refused", tampered.status === 403, `HTTP ${tampered.status}`)
  const expires = Number(new URL(url).searchParams.get("X-Amz-Expires"))
  check("links live at most 3 hours", expires === 10800, `X-Amz-Expires=${expires}`)
  results.sampleSignedLink = url.replace(/X-Amz-Credential=[^&]+/, "X-Amz-Credential=...").replace(/X-Amz-Signature=[0-9a-f]+/, "X-Amz-Signature=...")
}
const timings = await copier.request.get(`${BASE}/api/lesson-timings?lesson=${lessons[0][0]}`)
check("narration timings load for a learner with access", timings.status() === 200 || timings.status() === 404, `HTTP ${timings.status()}`)
const anon = await browser.newContext({ ignoreHTTPSErrors: true })
const anonTimings = await anon.request.get(`${BASE}/api/lesson-timings?lesson=${lessons[0][0]}`)
// The preview admits a signed-out visitor as its review stand-in learner (as it
// does for the lesson page itself); production has no stand-in and answers 401
// (src/app/api/lesson-timings/route.test.ts).
results.signedOutTimingsOnPreview = anonTimings.status()

// ---- 3b. the copier was flagged, Month 2 held
const flag = psql(`select f.status || '|' || coalesce(f.held_month::text, '') || '|' || f.reasons::text from content_access_flags f join "user" u on u.id = f.user_id where u.email = '${PEOPLE.copier}';`)
check("the copier is flagged with Month 2 held", flag.startsWith("open|2|"), flag)
const views = psql(`select count(*) || ' views, ' || count(*) filter (where first_view) || ' first, media links ' || sum(media_links) from content_access_events e join "user" u on u.id = e.user_id where u.email = '${PEOPLE.copier}';`)
check("every lesson page served was recorded", views.startsWith("23 views"), views)
results.copierFlag = flag
results.copierViews = views

// ---- 3c. what learners see
async function shot(ctx, path, name, testid) {
  const page = await ctx.newPage()
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 120000 })
  await page.waitForTimeout(1500)
  const text = testid ? (await page.locator(`[data-testid="${testid}"]`).first().textContent().catch(() => "")) ?? "" : ""
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false })
  await page.close()
  return text
}
const gated = await signedIn(PEOPLE.gated)
const gatedText = await shot(gated, "/course/applied-ai-skills", "gated-course-page", "course-hold-notice")
check("a payer under the 75% gate is told why and that they are not charged", /core lessons from Month 1/.test(gatedText) && /won't charge you/.test(gatedText), gatedText)
const review = await signedIn(PEOPLE.review)
const reviewText = await shot(review, "/course/applied-ai-skills", "review-course-page", "course-hold-notice")
check("a payer under review sees the quick-check notice", /quick check/.test(reviewText), reviewText)
const aheadText = await shot(copier, "/course/applied-ai-skills", "copier-course-page", "course-gate-notice")
results.copierCoursePage = aheadText

// ---- 3d. David's page
const admin = await signedIn(process.env.REVIEW_ADMIN_EMAIL)
const page = await admin.newPage()
await page.goto(`${BASE}/admin/flagged`, { waitUntil: "networkidle", timeout: 120000 })
await page.screenshot({ path: `${OUT}/admin-flagged.png`, fullPage: true })
const cards = await page.locator('[data-testid="flag-card"]').count()
const copierCard = await page.locator('[data-testid="flag-card"]', { hasText: PEOPLE.copier }).count()
check("/admin/flagged lists the flagged accounts", cards >= 2 && copierCard === 1, `${cards} cards`)
await page.close()

results.passed = results.checks.every((c) => c.ok)
await writeFile(`${OUT}/results.json`, JSON.stringify(results, null, 2))
await browser.close()
console.log(results.passed ? "ALL PASSED" : "SOME CHECKS FAILED")
process.exit(results.passed ? 0 : 1)
