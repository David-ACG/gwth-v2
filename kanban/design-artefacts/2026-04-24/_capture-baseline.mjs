// One-shot baseline capture for the GWTH redesign POC.
// Hits the live P520 (http://192.168.178.50:3001) and screenshots
// the routes that are reachable without auth at 1440x900 + 375x800,
// in light and dark mode. Outputs into ./baselines/.
//
// Run: node kanban/design-artefacts/2026-04-24/_capture-baseline.mjs
//
// next-themes default localStorage key is 'theme'; we set it before
// navigation via addInitScript so the first paint is correct.

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const BASE = 'http://192.168.178.50:3001';
const OUT = 'kanban/design-artefacts/2026-04-24/baselines';

const targets = [
  { name: 'homepage', url: '/' },
];
const sizes = [
  { name: '1440', w: 1440, h: 900 },
  { name: '375', w: 375, h: 800 },
];
const themes = ['light', 'dark'];

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();

for (const t of targets) {
  for (const size of sizes) {
    for (const theme of themes) {
      const ctx = await browser.newContext({
        viewport: { width: size.w, height: size.h },
        deviceScaleFactor: 2,
      });
      await ctx.addInitScript((th) => {
        try { localStorage.setItem('theme', th); } catch (e) {}
      }, theme);
      const page = await ctx.newPage();
      try {
        await page.goto(BASE + t.url, { waitUntil: 'domcontentloaded', timeout: 20_000 });
        await page.waitForTimeout(1500);
        const path = `${OUT}/${t.name}-${size.name}-${theme}.png`;
        await page.screenshot({ path, fullPage: true });
        console.log('saved', path);
      } catch (e) {
        console.error('failed', t.name, size.name, theme, e.message);
      } finally {
        await ctx.close();
      }
    }
  }
}

await browser.close();
console.log('done');
