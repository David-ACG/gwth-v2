// W14 — capture live :3001 honest-zero evidence for a FRESH real account.
//
// Phase "fresh": /dashboard, /progress and a lab page must show honest zeros
// (0 streak, 0/26 lessons, no completed labs) — never the old fixtures
// (5-day streak, 12/24, lab_001/002 complete). Phase "one" (run after a real
// lesson_progress row exists for the user): the same pages must reflect the
// real derived progress. Light + dark at 1440/768/412, console errors fatal.
//
// Cookies come from the Netscape jar written by the curl sign-in (env JAR).
// Usage: JAR=/tmp/w14-jar.txt PHASE=fresh node deploy/shot-w14.mjs
import { chromium } from "playwright"
import { mkdirSync, readFileSync } from "node:fs"

const BASE = process.env.BASE || "http://192.168.178.50:3001"
const OUT = process.env.OUT || "completion/W14"
const JAR = process.env.JAR || "/tmp/w14-jar.txt"
const PHASE = process.env.PHASE || "fresh"
const LAB_SLUG = process.env.LAB_SLUG || "agent-build-off"
mkdirSync(OUT, { recursive: true })

/** Parse a Netscape cookie jar into Playwright cookie objects. */
function jarCookies(path) {
  const cookies = []
  for (const line of readFileSync(path, "utf8").split("\n")) {
    if (!line || (line.startsWith("#") && !line.startsWith("#HttpOnly_"))) continue
    const f = line.replace(/^#HttpOnly_/, "").split("\t")
    if (f.length < 7) continue
    const [domain, , cookiePath, secure, expires, name, value] = f
    cookies.push({
      name,
      value,
      domain: domain.replace(/^\./, ""),
      path: cookiePath || "/",
      expires: Number(expires) || -1,
      httpOnly: false,
      secure: secure === "TRUE",
      sameSite: "Lax",
    })
  }
  return cookies
}

/** Text markers each page must (and must not) contain, per phase. */
const CHECKS = {
  fresh: {
    "/dashboard": {
      must: [
        "0 / 26 mandatory",
        "CAPSTONES · 0 OF 3",
        "Complete a lesson to start your streak.",
        "SHIPPED · 0 PROJECTS",
      ],
      never: ["Held for 5 days", "12 / 24", "5.2", "PROJECTS SHIPPED"],
    },
    "/progress": {
      must: ["0 days", "No progress yet"],
      never: ["5 day streak", "14 day best", "12 of 24"],
    },
    [`/labs/${LAB_SLUG}`]: {
      must: ["Not started"],
      never: ["Step 5/", "Step 4/"],
    },
  },
  one: {
    "/dashboard": {
      must: ["1 / 26 mandatory"],
      never: ["Held for 5 days", "12 / 24"],
    },
    "/progress": {
      must: ["1 of 26 lessons"],
      never: ["12 of 24"],
    },
  },
}

const VIEWPORTS = [
  ["1440", { width: 1440, height: 960 }],
  ["768", { width: 768, height: 1024 }],
  ["412", { width: 412, height: 915 }],
]

const cookies = jarCookies(JAR)
const browser = await chromium.launch()
const failures = []
let shots = 0

for (const [route, { must, never }] of Object.entries(CHECKS[PHASE])) {
  const slug = route.replaceAll("/", "-").replace(/^-/, "")
  for (const theme of ["light", "dark"]) {
    for (const [vpName, viewport] of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport })
      await ctx.addCookies(cookies)
      // next-themes reads localStorage("theme") before first paint.
      await ctx.addInitScript(
        (t) => window.localStorage.setItem("theme", t),
        theme
      )
      const page = await ctx.newPage()
      const consoleErrors = []
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text())
      })
      page.on("pageerror", (err) => consoleErrors.push(String(err)))

      const resp = await page.goto(BASE + route, {
        waitUntil: "networkidle",
        timeout: 45000,
      })
      if (!resp || resp.status() !== 200) {
        failures.push(`${route} [${theme}/${vpName}] http ${resp?.status()}`)
      }
      // Case-insensitive: the FDE mono register uppercases via CSS, which
      // innerText reflects ("0 / 26 MANDATORY").
      const body = (
        await page.evaluate(() => document.body.innerText)
      ).toLowerCase()
      for (const marker of must) {
        if (!body.includes(marker.toLowerCase())) {
          failures.push(`${route} [${theme}/${vpName}] MISSING "${marker}"`)
        }
      }
      for (const marker of never) {
        if (body.includes(marker.toLowerCase())) {
          failures.push(`${route} [${theme}/${vpName}] FIXTURE LEAK "${marker}"`)
        }
      }
      if (consoleErrors.length) {
        failures.push(
          `${route} [${theme}/${vpName}] console errors: ${consoleErrors.join(" | ").slice(0, 300)}`
        )
      }
      await page.screenshot({
        path: `${OUT}/${PHASE}-${slug}-${theme}-${vpName}.png`,
        fullPage: vpName === "1440",
      })
      shots += 1
      await ctx.close()
    }
  }
}

await browser.close()
console.log(`${shots} screenshots -> ${OUT} (phase=${PHASE})`)
if (failures.length) {
  console.error("FAILURES:\n" + failures.map((f) => "  - " + f).join("\n"))
  process.exit(1)
}
console.log("ALL CHECKS PASSED")
