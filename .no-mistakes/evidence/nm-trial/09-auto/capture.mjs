// Renders the real NewsCard component output (captured from the component test)
// in headless Chromium to produce reviewer-visible visual evidence and a real
// browser accessibility tree for the external-source icon a11y change.
import { chromium } from "playwright"
import { readFileSync, writeFileSync } from "node:fs"

const dir = new URL(".", import.meta.url).pathname
const external = readFileSync(`${dir}/news-card-external.fragment.html`, "utf8")
const original = readFileSync(`${dir}/news-card-original.fragment.html`, "utf8")

// Project design tokens (light mode) so the screenshot matches the real app.
const theme = `
@theme {
  --color-background: oklch(0.98 0 0);
  --color-foreground: oklch(0.18 0.04 175);
  --color-card: oklch(1 0 0);
  --color-card-foreground: oklch(0.18 0.04 175);
  --color-primary: oklch(0.7 0.18 220);
  --color-primary-foreground: oklch(0.98 0 0);
  --color-accent: oklch(0.65 0.16 165);
  --color-secondary: oklch(0.95 0.01 220);
  --color-secondary-foreground: oklch(0.18 0.04 175);
  --color-muted: oklch(0.95 0.01 220);
  --color-muted-foreground: oklch(0.5 0.02 220);
  --color-border: oklch(0.9 0.02 220);
  --color-input: oklch(0.9 0.02 220);
  --color-ring: oklch(0.7 0.18 220);
  --color-info: oklch(0.7 0.18 220);
  --color-success: oklch(0.6 0.18 145);
  --color-warning: oklch(0.75 0.15 75);
  --radius: 0.625rem;
}
`

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
<style type="text/tailwindcss">${theme}</style>
<style>
  body { background: var(--color-background); font-family: Inter, system-ui, sans-serif; padding: 32px; }
  .col { max-width: 560px; }
  .cap { font: 600 13px Inter, sans-serif; color: var(--color-muted-foreground); margin: 24px 0 8px; }
</style>
</head>
<body>
  <div class="col">
    <div class="cap">External source article &mdash; icon shown after headline (aria-label "(has external source)")</div>
    <div id="card-external">${external}</div>
    <div class="cap">GWTH original article (url = null) &mdash; no external-link icon</div>
    <div id="card-original">${original}</div>
  </div>
</body>
</html>`

writeFileSync(`${dir}/news-card-evidence.html`, html)

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 640, height: 900 }, deviceScaleFactor: 2 })
await page.goto(`file://${dir}/news-card-evidence.html`)
// Give the Tailwind browser build a moment to apply styles.
await page.waitForTimeout(1500)

await page.screenshot({ path: `${dir}/news-card-a11y.png`, fullPage: true })
await page.locator("#card-external").screenshot({ path: `${dir}/news-card-external.png` })

// Real Chromium accessibility tree (ARIA snapshot): prove the icon is announced
// as an image with the accessible name on the external card, and that the
// original card exposes no such node.
const externalTree = await page.locator("#card-external").ariaSnapshot()
const originalTree = await page.locator("#card-original").ariaSnapshot()
const report =
  "=== External-source card — ARIA tree (Chromium) ===\n" +
  externalTree +
  "\n\n=== GWTH original card (url=null) — ARIA tree (Chromium) ===\n" +
  originalTree +
  "\n"
console.log(report)
writeFileSync(`${dir}/aria-tree.txt`, report)

await browser.close()
