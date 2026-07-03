// Crop the G+arrow region out of the canonical wordmark PNGs and produce
// transparent-background icon files at 512×512. This guarantees the icon
// matches the wordmark visually (same G shape, same arrow geometry).

import sharp from "sharp";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "../../../..");
const iconDir = resolve(__dirname, "icon");

await mkdir(iconDir, { recursive: true });

// Auto-detect the G's bounding box by scanning the canonical light PNG
// (dark text on light bg → easier to find dark pixels).
const lightSrc = resolve(projectRoot, "public/logo-light.png");
const meta = await sharp(lightSrc).metadata();
console.log("source:", meta.width, "x", meta.height);

const { data, info } = await sharp(lightSrc).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, C = info.channels;
function px(x, y) { const i = (y * W + x) * C; return [data[i], data[i+1], data[i+2], data[i+3]]; }
function isInk(x, y) {
  const [r, g, b] = px(x, y);
  // ink = anything noticeably darker or more saturated than the warm-off-white bg (~#FAF8F4)
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  return lum < 230;
}

// Find vertical bounds of the wordmark (full row scan)
let yTop = H, yBot = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (isInk(x, y)) { if (y < yTop) yTop = y; if (y > yBot) yBot = y; break; }
  }
}
console.log("wordmark vertical:", yTop, "→", yBot);

// Find horizontal bounds of the wordmark
let xLeft = W, xRight = 0;
for (let y = yTop; y <= yBot; y++) {
  for (let x = 0; x < W; x++) { if (isInk(x, y)) { if (x < xLeft) xLeft = x; break; } }
  for (let x = W - 1; x >= 0; x--) { if (isInk(x, y)) { if (x > xRight) xRight = x; break; } }
}
console.log("wordmark horizontal:", xLeft, "→", xRight);

// Find the gap after the G (first wide vertical stripe of pure bg between G and W).
const gMinWidth = Math.round((yBot - yTop) * 0.55); // G width ≥ ~55% of cap height
function colHasInk(x) {
  for (let y = yTop; y <= yBot; y++) if (isInk(x, y)) return true;
  return false;
}
let gapStart = -1;
for (let x = xLeft + gMinWidth; x < xRight - 10; x++) {
  if (!colHasInk(x)) { gapStart = x; break; }
}
let gapEnd = gapStart;
for (let x = gapStart + 1; x < xRight; x++) {
  if (colHasInk(x)) { gapEnd = x; break; }
}
const gapMid = Math.floor((gapStart + gapEnd) / 2);
console.log("gap:", gapStart, "→", gapEnd, "(mid", gapMid + ")");

// G bounding box: extend left and vertically with padding; on the right, stop at gap midpoint.
const gPad = 10;
const gBox = {
  left: Math.max(0, xLeft - gPad),
  top: Math.max(0, yTop - gPad),
  right: gapMid,
  bottom: Math.min(H, yBot + gPad),
};
const gW = gBox.right - gBox.left;
const gH = gBox.bottom - gBox.top;
console.log("G bbox:", gBox, "→", gW, "×", gH);

// Square the box (icon is 1:1)
const side = Math.max(gW, gH);
const cx = (gBox.left + gBox.right) / 2;
const cy = (gBox.top + gBox.bottom) / 2;
const square = {
  left: Math.round(cx - side / 2),
  top: Math.round(cy - side / 2),
  width: side,
  height: side,
};

// Render two outputs:
//   icon-canonical-light.png — charcoal G on warm-off-white bg (matches wordmark exactly)
//   icon-canonical-dark.png  — off-white G on warm-charcoal bg (cropped from dark canonical)
// And one transparent master:
//   icon-512-master.png      — charcoal G on transparent (ready for realfavicongenerator)

const variants = [
  { src: "public/logo-light.png", out: "icon-canonical-light.png", bg: { r: 250, g: 248, b: 244 }, transparent: false },
  { src: "public/logo.png",       out: "icon-canonical-dark.png",  bg: { r: 25,  g: 24,  b: 23  }, transparent: false },
  { src: "public/logo-light.png", out: "icon-512-master.png",      bg: { r: 250, g: 248, b: 244 }, transparent: true  },
];

for (const v of variants) {
  const srcPath = resolve(projectRoot, v.src);
  let pipe = sharp(srcPath).extract({
    left: Math.max(0, square.left),
    top: Math.max(0, square.top),
    width: Math.min(square.width, W - Math.max(0, square.left)),
    height: Math.min(square.height, H - Math.max(0, square.top)),
  });

  if (v.transparent) {
    // Alpha-key the bg colour to transparent so the icon adapts to any tab bg.
    const buf = await pipe.raw().ensureAlpha().toBuffer({ resolveWithObject: true });
    const px = buf.data;
    const bgR = v.bg.r, bgG = v.bg.g, bgB = v.bg.b;
    for (let i = 0; i < px.length; i += 4) {
      const dr = px[i] - bgR, dg = px[i + 1] - bgG, db = px[i + 2] - bgB;
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);
      // 0..15 → fully transparent; 15..40 → soft-edge alpha; >40 → fully opaque
      if (dist < 15) px[i + 3] = 0;
      else if (dist < 40) px[i + 3] = Math.round(255 * (dist - 15) / 25);
    }
    pipe = sharp(px, { raw: buf.info });
  }

  await pipe
    .resize(512, 512, {
      fit: "contain",
      background: v.transparent ? { r: 0, g: 0, b: 0, alpha: 0 } : v.bg,
    })
    .png()
    .toFile(resolve(iconDir, v.out));
  console.log("wrote", v.out);
}

console.log("done →", iconDir);
