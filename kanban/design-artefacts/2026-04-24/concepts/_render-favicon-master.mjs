// Generate 512×512 PNG masters for upload to realfavicongenerator.net.
// Transparent background (so the icon adapts to whichever tab/app theme).

import { chromium } from "playwright";
import { mkdir, readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "../../../..");
const outDir = resolve(__dirname, "icon");

await mkdir(outDir, { recursive: true });

const targets = [
  { svg: "icon-light.svg", name: "icon-512-master",      label: "charcoal on transparent (use for favicon-generator upload)" },
  { svg: "icon.svg",       name: "icon-512-dark-master", label: "off-white on transparent (alternative for dark UIs)" },
];

const browser = await chromium.launch();

for (const t of targets) {
  const ctx = await browser.newContext({
    viewport: { width: 512, height: 512 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  const svgMarkup = (await readFile(resolve(projectRoot, "public", t.svg), "utf8"))
    .replace(/<\?xml[^?]*\?>/, "")
    .replace(/<svg([^>]*)>/, '<svg$1 width="100%" height="100%" preserveAspectRatio="xMidYMid meet">');
  const html = `<!doctype html><html><head><style>
    html,body { margin:0; padding:0; background:transparent; width:100%; height:100%; }
    svg { display:block; width:100%; height:100%; }
  </style></head><body>${svgMarkup}</body></html>`;
  await page.setContent(html, { waitUntil: "load" });
  const path = resolve(outDir, t.name + ".png");
  await page.screenshot({ path, omitBackground: true, fullPage: false });
  console.log("rendered", t.name, "—", t.label);
  await ctx.close();
}

await browser.close();
console.log("done →", outDir);
