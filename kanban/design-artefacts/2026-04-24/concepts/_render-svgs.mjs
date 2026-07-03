// Quick render: rasterise each draft SVG on its design ground so we can eyeball the result.
// Inlines SVG markup into the HTML to bypass <img src="file://"> load issues.

import { chromium } from "playwright";
import { mkdir, readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "../../../..");
const outDir = resolve(__dirname, "renders");

await mkdir(outDir, { recursive: true });

const targets = [
  { svg: "logo.svg",               ground: "#191817", w: 1200, h: 320, name: "logo-dark-1200" },
  { svg: "logo.svg",               ground: "#191817", w:  480, h: 128, name: "logo-dark-480"  },
  { svg: "logo.svg",               ground: "#191817", w:  240, h:  64, name: "logo-dark-240"  },
  { svg: "icon.svg",               ground: "#191817", w:  512, h: 512, name: "icon-dark-512"  },
  { svg: "icon.svg",               ground: "#191817", w:  128, h: 128, name: "icon-dark-128"  },
  { svg: "icon.svg",               ground: "#191817", w:   32, h:  32, name: "icon-dark-32"   },
  { svg: "logo-stacked.svg",       ground: "#191817", w:  512, h: 512, name: "stacked-dark-512" },
  { svg: "logo-light.svg",         ground: "#FAF8F4", w: 1200, h: 320, name: "logo-light-1200" },
  { svg: "logo-light.svg",         ground: "#FAF8F4", w:  480, h: 128, name: "logo-light-480"  },
  { svg: "icon-light.svg",         ground: "#FAF8F4", w:  512, h: 512, name: "icon-light-512"  },
  { svg: "icon-light.svg",         ground: "#FAF8F4", w:   32, h:  32, name: "icon-light-32"   },
  { svg: "logo-stacked-light.svg", ground: "#FAF8F4", w:  512, h: 512, name: "stacked-light-512" },
];

const browser = await chromium.launch();

for (const t of targets) {
  const ctx = await browser.newContext({
    viewport: { width: t.w, height: t.h },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  const svgMarkup = await readFile(resolve(projectRoot, "public", t.svg), "utf8");
  // Strip XML decl if present, force width/height to 100%
  const svgInline = svgMarkup
    .replace(/<\?xml[^?]*\?>/, "")
    .replace(/<svg([^>]*)>/, '<svg$1 width="100%" height="100%" preserveAspectRatio="xMidYMid meet">');
  const html = `<!doctype html><html><head><style>
    html,body { margin:0; padding:0; background:${t.ground}; width:100%; height:100%; }
    .wrap { width:100%; height:100%; display:flex; align-items:center; justify-content:center; }
    svg { display:block; max-width:100%; max-height:100%; }
  </style></head><body><div class="wrap">${svgInline}</div></body></html>`;
  await page.setContent(html, { waitUntil: "load" });
  const path = resolve(outDir, t.name + ".png");
  await page.screenshot({ path, fullPage: false });
  console.log("rendered", t.name);
  await ctx.close();
}

await browser.close();
console.log("done →", outDir);
