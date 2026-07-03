import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"
import QRCode from "qrcode"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, "..")
const outputDir = path.join(projectRoot, "public", "scorecards")
const logoPath = path.join(projectRoot, "public", "logo-light-cropped.png")

const variants = [
  {
    id: "01-market-board",
    title: "Market board",
    file: "gwth-scorecard-01-market-board.png",
    learner: "Maya Patel",
    symbol: "GWTH.MAYA",
    verification: "MP-7K2Q",
    score: "87.4",
    max: "100",
    direction: "up",
    trend: "+14.2%",
    trendText: "3M trend",
    percentile: "Top 6%",
    benchmark: "Applied AI benchmark",
    status: "Verified, current",
    updated: "8 May 2026",
    course: "Applied AI Course",
    points: [22, 25, 24, 31, 38, 35, 47, 54, 58, 72, 84],
    theme: {
      surface: "oklch(0.17 0.018 210)",
      panel: "oklch(0.2 0.022 210)",
      text: "oklch(0.94 0.012 190)",
      muted: "oklch(0.73 0.035 205)",
      accent: "oklch(0.74 0.17 170)",
      accent2: "oklch(0.7 0.18 220)",
      caution: "oklch(0.7 0.16 28)",
    },
    layout: "market",
  },
  {
    id: "02-terminal-ticket",
    title: "Terminal ticket",
    file: "gwth-scorecard-02-terminal-ticket.png",
    learner: "Rory Hughes",
    symbol: "GWTH.RORY",
    verification: "RH-4P9A",
    score: "74.1",
    max: "100",
    direction: "up",
    trend: "+7.8%",
    trendText: "3M trend",
    percentile: "Top 20%",
    benchmark: "Career switcher track",
    status: "Verified, current",
    updated: "8 May 2026",
    course: "Month 2 complete",
    points: [30, 29, 33, 35, 36, 43, 42, 49, 55, 59, 63],
    theme: {
      surface: "oklch(0.92 0.012 70)",
      panel: "oklch(0.2 0.018 185)",
      text: "oklch(0.19 0.04 175)",
      muted: "oklch(0.47 0.025 190)",
      accent: "oklch(0.67 0.17 218)",
      accent2: "oklch(0.62 0.15 165)",
      caution: "oklch(0.58 0.18 28)",
    },
    layout: "ticket",
  },
  {
    id: "03-currentness-alert",
    title: "Currentness alert",
    file: "gwth-scorecard-03-currentness-alert.png",
    learner: "Priya Shah",
    symbol: "GWTH.PRIYA",
    verification: "PS-2M6C",
    score: "68.5",
    max: "100",
    direction: "down",
    trend: "-4.6%",
    trendText: "3M trend",
    percentile: "Top 34%",
    benchmark: "Needs current lesson review",
    status: "Verified, update due",
    updated: "8 May 2026",
    course: "Currentness check",
    points: [70, 72, 76, 78, 73, 71, 69, 65, 63, 61, 58],
    theme: {
      surface: "oklch(0.18 0.012 60)",
      panel: "oklch(0.23 0.012 60)",
      text: "oklch(0.91 0.012 65)",
      muted: "oklch(0.68 0.016 65)",
      accent: "oklch(0.66 0.16 28)",
      accent2: "oklch(0.76 0.15 80)",
      caution: "oklch(0.66 0.16 28)",
    },
    layout: "alert",
  },
  {
    id: "04-employer-quote",
    title: "Employer quote",
    file: "gwth-scorecard-04-employer-quote.png",
    learner: "Amara Lewis",
    symbol: "GWTH.AMARA",
    verification: "AL-8T3K",
    score: "91.2",
    max: "100",
    direction: "up",
    trend: "+18.4%",
    trendText: "3M trend",
    percentile: "Top 3%",
    benchmark: "Advanced applied AI",
    status: "Verified, current",
    updated: "8 May 2026",
    course: "Capstone verified",
    points: [18, 24, 29, 28, 41, 52, 57, 64, 76, 83, 94],
    theme: {
      surface: "oklch(0.97 0.004 190)",
      panel: "oklch(0.22 0.03 205)",
      text: "oklch(0.17 0.04 175)",
      muted: "oklch(0.46 0.025 205)",
      accent: "oklch(0.63 0.17 165)",
      accent2: "oklch(0.69 0.17 220)",
      caution: "oklch(0.65 0.16 28)",
    },
    layout: "quote",
  },
  {
    id: "05-pixel-wall",
    title: "Pixel wall",
    file: "gwth-scorecard-05-pixel-wall.png",
    learner: "Daniel Reed",
    symbol: "GWTH.DAN",
    verification: "DR-6Q1V",
    score: "82.9",
    max: "100",
    direction: "up",
    trend: "+5.1%",
    trendText: "3M trend",
    percentile: "Top 10%",
    benchmark: "Portfolio ready",
    status: "Verified, current",
    updated: "8 May 2026",
    course: "Applied AI Course",
    points: [52, 51, 54, 55, 58, 56, 62, 66, 68, 74, 77],
    theme: {
      surface: "oklch(0.15 0.018 252)",
      panel: "oklch(0.2 0.024 248)",
      text: "oklch(0.93 0.01 220)",
      muted: "oklch(0.7 0.035 230)",
      accent: "oklch(0.72 0.17 220)",
      accent2: "oklch(0.74 0.16 165)",
      caution: "oklch(0.7 0.16 28)",
    },
    layout: "wall",
  },
]

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function dataUri(buffer, mime) {
  return `data:${mime};base64,${buffer.toString("base64")}`
}

function sparkPath(points, width = 520, height = 210) {
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = Math.max(1, max - min)
  const step = width / (points.length - 1)
  const coords = points.map((point, index) => {
    const x = index * step
    const y = height - ((point - min) / range) * (height - 18) - 9
    return [Number(x.toFixed(2)), Number(y.toFixed(2))]
  })
  const line = coords
    .map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x} ${y}`)
    .join(" ")
  const area = `${line} L ${width} ${height} L 0 ${height} Z`
  return { line, area, coords }
}

function renderSparkline(variant, width = 560, height = 240) {
  const { line, area, coords } = sparkPath(variant.points, width, height)
  const stroke = variant.direction === "up" ? variant.theme.accent : variant.theme.caution
  const end = coords.at(-1)
  const gridLines = [0.25, 0.5, 0.75]
    .map(
      (ratio) =>
        `<line x1="0" y1="${height * ratio}" x2="${width}" y2="${height * ratio}" class="chart-grid" />`
    )
    .join("")

  return `
    <svg class="sparkline" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(
      variant.trendText
    )} ${escapeHtml(variant.trend)}">
      <defs>
        <linearGradient id="fill-${variant.id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${stroke}" stop-opacity="0.44" />
          <stop offset="1" stop-color="${stroke}" stop-opacity="0" />
        </linearGradient>
        <filter id="glow-${variant.id}" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      ${gridLines}
      <path d="${area}" fill="url(#fill-${variant.id})" />
      <path d="${line}" fill="none" stroke="${stroke}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow-${variant.id})" />
      <circle cx="${end[0]}" cy="${end[1]}" r="10" fill="${stroke}" />
    </svg>`
}

function renderArrow(direction) {
  return `<span class="trend-arrow trend-${direction}" aria-hidden="true"></span>`
}

function renderPixelDigits(value) {
  return value
    .split("")
    .map((char) => `<span class="pixel-digit">${escapeHtml(char)}</span>`)
    .join("")
}

function renderTicker(variant) {
  const items = [
    variant.symbol,
    `SCORE ${variant.score}`,
    `${variant.trend} 3M`,
    variant.percentile,
    "VERIFY LIVE",
  ]
  return `<div class="ticker">${items
    .concat(items)
    .map((item) => `<span>${escapeHtml(item)}</span>`)
    .join("")}</div>`
}

function renderQrBlock(variant, qrDataUri) {
  return `
    <div class="qr-block">
      <img src="${qrDataUri}" alt="Verification QR code for ${escapeHtml(variant.learner)}" />
      <div>
        <p>gwth.ai/verify/${escapeHtml(variant.verification)}</p>
        <span>Public verification URL</span>
      </div>
    </div>`
}

function renderStats(variant) {
  return `
    <div class="stats">
      <div>
        <span>Benchmark</span>
        <strong>${escapeHtml(variant.percentile)}</strong>
        <p>${escapeHtml(variant.benchmark)}</p>
      </div>
      <div>
        <span>Status</span>
        <strong>${escapeHtml(variant.status)}</strong>
        <p>Updated ${escapeHtml(variant.updated)}</p>
      </div>
      <div>
        <span>Course</span>
        <strong>${escapeHtml(variant.course)}</strong>
        <p>Score reflects current progress</p>
      </div>
    </div>`
}

function renderCard(variant, logoDataUri, qrDataUri) {
  const trendTone = variant.direction === "up" ? "positive" : "negative"
  const layout = {
    market: renderMarket,
    ticket: renderTicket,
    alert: renderAlert,
    quote: renderQuote,
    wall: renderWall,
  }[variant.layout]

  return layout(variant, logoDataUri, qrDataUri, trendTone)
}

function renderHeader(variant, logoDataUri) {
  return `
    <header class="brand-row">
      <div class="logo-lockup">
        <img src="${logoDataUri}" alt="GWTH.ai" />
        <span>Score exchange</span>
      </div>
      <div class="market-code">
        <span>${escapeHtml(variant.symbol)}</span>
        <strong>${escapeHtml(variant.verification)}</strong>
      </div>
    </header>`
}

function renderScoreStack(variant) {
  return `
    <section class="score-stack">
      <p class="eyebrow">Current GWTH Score</p>
      <div class="score-line">
        <div class="score-digits">${renderPixelDigits(variant.score)}</div>
        <span class="score-max">/${escapeHtml(variant.max)}</span>
      </div>
      <div class="trend-badge ${variant.direction === "up" ? "positive" : "negative"}">
        ${renderArrow(variant.direction)}
        <strong>${escapeHtml(variant.trend)}</strong>
        <span>${escapeHtml(variant.trendText)}</span>
      </div>
    </section>`
}

function renderMarket(variant, logoDataUri, qrDataUri) {
  return `
    <article class="scorecard market-card" style="${themeVars(variant)}">
      <div class="screen-texture"></div>
      ${renderTicker(variant)}
      ${renderHeader(variant, logoDataUri)}
      <main class="market-main">
        <div>
          <p class="learner-label">Verified learner</p>
          <h1>${escapeHtml(variant.learner)}</h1>
          ${renderScoreStack(variant)}
        </div>
        <div class="chart-panel">
          <div class="chart-head">
            <span>Last three months</span>
            <strong>${escapeHtml(variant.trend)}</strong>
          </div>
          ${renderSparkline(variant)}
        </div>
      </main>
      ${renderStats(variant)}
      ${renderQrBlock(variant, qrDataUri)}
    </article>`
}

function renderTicket(variant, logoDataUri, qrDataUri) {
  return `
    <article class="scorecard ticket-card" style="${themeVars(variant)}">
      <div class="screen-texture"></div>
      ${renderHeader(variant, logoDataUri)}
      <div class="ticket-shell">
        <section class="ticket-screen">
          <p class="terminal-line">QUOTE ${escapeHtml(variant.symbol)} // PUBLIC SCORE</p>
          <div class="ticket-grid">
            <div>
              <p class="learner-label">Learner</p>
              <h1>${escapeHtml(variant.learner)}</h1>
            </div>
            ${renderScoreStack(variant)}
          </div>
          ${renderSparkline(variant, 680, 220)}
        </section>
        <aside class="ticket-sidebar">
          ${renderQrBlock(variant, qrDataUri)}
          ${renderStats(variant)}
        </aside>
      </div>
      ${renderTicker(variant)}
    </article>`
}

function renderAlert(variant, logoDataUri, qrDataUri) {
  return `
    <article class="scorecard alert-card" style="${themeVars(variant)}">
      <div class="screen-texture"></div>
      ${renderHeader(variant, logoDataUri)}
      <main class="alert-main">
        <section class="alert-copy">
          <p class="learner-label">Verified learner</p>
          <h1>${escapeHtml(variant.learner)}</h1>
          <p class="plain-copy">The score is still public and verifiable, but the three-month line shows recent currentness drift.</p>
          ${renderStats(variant)}
          ${renderQrBlock(variant, qrDataUri)}
        </section>
        <section class="alert-board">
          ${renderScoreStack(variant)}
          ${renderSparkline(variant, 660, 260)}
          <div class="alert-strip">
            ${renderArrow(variant.direction)}
            <strong>${escapeHtml(variant.trend)}</strong>
            <span>Review updated lessons to restore the trajectory.</span>
          </div>
        </section>
      </main>
    </article>`
}

function renderQuote(variant, logoDataUri, qrDataUri) {
  return `
    <article class="scorecard quote-card" style="${themeVars(variant)}">
      <div class="screen-texture"></div>
      <section class="quote-left">
        ${renderHeader(variant, logoDataUri)}
        <p class="learner-label">Candidate scorecard</p>
        <h1>${escapeHtml(variant.learner)}</h1>
        <p class="plain-copy">A current GWTH Score, not a one-time certificate. Employers can verify the score and trajectory on the spot.</p>
        ${renderQrBlock(variant, qrDataUri)}
      </section>
      <section class="quote-right">
        ${renderScoreStack(variant)}
        <div class="chart-panel">
          <div class="chart-head">
          <span>Three-month score movement</span>
          <strong>${escapeHtml(variant.trend)}</strong>
        </div>
          ${renderSparkline(variant, 620, 190)}
        </div>
        ${renderStats(variant)}
      </section>
    </article>`
}

function renderWall(variant, logoDataUri, qrDataUri) {
  return `
    <article class="scorecard wall-card" style="${themeVars(variant)}">
      <div class="screen-texture dense"></div>
      ${renderTicker(variant)}
      <div class="wall-score">
        <div>
          ${renderHeader(variant, logoDataUri)}
          <p class="learner-label">Public GWTH Score</p>
          <h1>${escapeHtml(variant.learner)}</h1>
        </div>
        ${renderScoreStack(variant)}
      </div>
      <div class="wall-bottom">
        <div class="chart-panel">
          ${renderSparkline(variant, 780, 250)}
        </div>
        <div class="wall-proof">
          ${renderStats(variant)}
          ${renderQrBlock(variant, qrDataUri)}
        </div>
      </div>
    </article>`
}

function themeVars(variant) {
  const { theme } = variant
  return [
    `--surface:${theme.surface}`,
    `--panel:${theme.panel}`,
    `--text:${theme.text}`,
    `--muted:${theme.muted}`,
    `--accent:${theme.accent}`,
    `--accent-2:${theme.accent2}`,
    `--caution:${theme.caution}`,
  ].join(";")
}

function renderPage(cardHtml) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: oklch(0.15 0.01 220);
        font-family: Inter, "Segoe UI", system-ui, sans-serif;
      }
      .scorecard {
        position: relative;
        width: 1600px;
        height: 900px;
        overflow: hidden;
        border-radius: 8px;
        color: var(--text);
        background:
          linear-gradient(135deg, color-mix(in oklch, var(--surface) 94%, var(--accent) 6%), var(--surface));
        box-shadow: 0 42px 95px oklch(0.1 0.02 220 / 0.58);
      }
      .scorecard::before {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        background:
          linear-gradient(90deg, transparent 0 94%, color-mix(in oklch, var(--accent) 70%, transparent) 95% 96%, transparent 97%),
          linear-gradient(0deg, oklch(1 0 0 / 0.04), transparent 42%, oklch(1 0 0 / 0.03));
        background-size: 36px 100%, 100% 11px;
        mix-blend-mode: screen;
        opacity: 0.42;
        z-index: 2;
      }
      .screen-texture {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background-image:
          radial-gradient(circle, color-mix(in oklch, var(--accent) 55%, transparent) 0 1.1px, transparent 1.45px),
          radial-gradient(circle, oklch(1 0 0 / 0.08) 0 0.9px, transparent 1.35px);
        background-position: 0 0, 4px 4px;
        background-size: 10px 10px, 10px 10px;
        opacity: 0.38;
        z-index: 1;
      }
      .screen-texture.dense {
        background-size: 7px 7px, 7px 7px;
        opacity: 0.54;
      }
      .brand-row {
        position: relative;
        z-index: 3;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 28px;
      }
      .logo-lockup {
        display: flex;
        align-items: center;
        gap: 18px;
      }
      .logo-lockup img {
        display: block;
        width: 182px;
        height: auto;
        filter: drop-shadow(0 0 20px color-mix(in oklch, var(--accent) 45%, transparent));
      }
      .logo-lockup span,
      .market-code span,
      .eyebrow,
      .learner-label,
      .chart-head span,
      .terminal-line,
      .stats span,
      .qr-block span {
        color: var(--muted);
        font-size: 19px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .market-code {
        display: flex;
        align-items: baseline;
        gap: 16px;
        font-family: "JetBrains Mono", "Cascadia Mono", ui-monospace, monospace;
      }
      .market-code strong {
        color: var(--text);
        font-size: 21px;
      }
      h1 {
        margin: 18px 0 0;
        max-width: 740px;
        color: var(--text);
        font-size: 78px;
        line-height: 0.95;
        letter-spacing: 0;
      }
      .score-stack {
        position: relative;
        z-index: 3;
      }
      .score-line {
        display: flex;
        align-items: end;
        gap: 18px;
        margin-top: 12px;
      }
      .score-digits {
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: "JetBrains Mono", "Cascadia Mono", ui-monospace, monospace;
        color: var(--accent);
        font-size: 118px;
        font-weight: 800;
        line-height: 0.88;
        text-shadow:
          0 0 18px color-mix(in oklch, var(--accent) 60%, transparent),
          0 0 42px color-mix(in oklch, var(--accent) 42%, transparent);
      }
      .pixel-digit {
        position: relative;
      }
      .pixel-digit::after {
        content: "";
        position: absolute;
        inset: 4px 1px 6px;
        background-image: radial-gradient(circle, var(--surface) 0 1.3px, transparent 1.7px);
        background-size: 8px 8px;
        opacity: 0.3;
        mix-blend-mode: multiply;
      }
      .score-max {
        margin-bottom: 11px;
        color: var(--muted);
        font-size: 34px;
        font-weight: 800;
      }
      .trend-badge,
      .alert-strip {
        display: inline-flex;
        align-items: center;
        gap: 13px;
        min-height: 58px;
        margin-top: 25px;
        padding: 13px 18px;
        border: 1px solid color-mix(in oklch, var(--accent) 36%, transparent);
        border-radius: 8px;
        background: color-mix(in oklch, var(--panel) 82%, var(--accent) 18%);
        font-family: "JetBrains Mono", "Cascadia Mono", ui-monospace, monospace;
      }
      .trend-badge.negative,
      .alert-strip {
        border-color: color-mix(in oklch, var(--caution) 42%, transparent);
        background: color-mix(in oklch, var(--panel) 80%, var(--caution) 20%);
      }
      .trend-badge strong,
      .alert-strip strong {
        color: var(--text);
        font-size: 34px;
      }
      .trend-badge span,
      .alert-strip span {
        color: var(--muted);
        font-size: 18px;
        font-weight: 800;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }
      .trend-arrow {
        display: inline-block;
        width: 0;
        height: 0;
        filter: drop-shadow(0 0 16px color-mix(in oklch, var(--accent) 70%, transparent));
      }
      .trend-up {
        border-left: 18px solid transparent;
        border-right: 18px solid transparent;
        border-bottom: 29px solid var(--accent);
      }
      .trend-down {
        border-left: 18px solid transparent;
        border-right: 18px solid transparent;
        border-top: 29px solid var(--caution);
        filter: drop-shadow(0 0 16px color-mix(in oklch, var(--caution) 70%, transparent));
      }
      .chart-panel {
        position: relative;
        z-index: 3;
        min-height: 330px;
        padding: 32px;
        border: 1px solid color-mix(in oklch, var(--accent-2) 24%, transparent);
        border-radius: 8px;
        background:
          linear-gradient(135deg, color-mix(in oklch, var(--panel) 88%, var(--accent-2) 12%), var(--panel)),
          radial-gradient(circle at 20% 10%, color-mix(in oklch, var(--accent) 28%, transparent), transparent 35%);
      }
      .chart-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 12px;
        font-family: "JetBrains Mono", "Cascadia Mono", ui-monospace, monospace;
      }
      .chart-head strong {
        color: var(--accent);
        font-size: 28px;
      }
      .sparkline {
        display: block;
        width: 100%;
        height: auto;
        overflow: visible;
      }
      .chart-grid {
        stroke: color-mix(in oklch, var(--muted) 38%, transparent);
        stroke-width: 1;
        stroke-dasharray: 10 14;
      }
      .stats {
        position: relative;
        z-index: 3;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
      }
      .stats > div {
        padding: 18px;
        border: 1px solid color-mix(in oklch, var(--muted) 22%, transparent);
        border-radius: 8px;
        background: color-mix(in oklch, var(--panel) 72%, transparent);
      }
      .stats strong {
        display: block;
        margin-top: 8px;
        color: var(--text);
        font-size: 25px;
        line-height: 1.05;
      }
      .stats p {
        margin: 8px 0 0;
        color: var(--muted);
        font-size: 18px;
        line-height: 1.3;
      }
      .qr-block {
        position: relative;
        z-index: 3;
        display: flex;
        align-items: center;
        gap: 18px;
        padding: 16px;
        border: 1px solid color-mix(in oklch, var(--muted) 24%, transparent);
        border-radius: 8px;
        background: color-mix(in oklch, var(--panel) 76%, transparent);
      }
      .qr-block img {
        width: 112px;
        height: 112px;
        border-radius: 6px;
      }
      .qr-block p {
        margin: 0 0 10px;
        color: var(--text);
        font-family: "JetBrains Mono", "Cascadia Mono", ui-monospace, monospace;
        font-size: 22px;
      }
      .ticker {
        position: absolute;
        left: 0;
        right: 0;
        z-index: 4;
        display: flex;
        gap: 34px;
        overflow: hidden;
        white-space: nowrap;
        padding: 14px 0;
        color: var(--text);
        border-block: 1px solid color-mix(in oklch, var(--accent) 32%, transparent);
        background: color-mix(in oklch, var(--panel) 82%, var(--surface) 18%);
        font-family: "JetBrains Mono", "Cascadia Mono", ui-monospace, monospace;
        font-size: 22px;
        font-weight: 800;
      }
      .ticker span {
        color: color-mix(in oklch, var(--text) 82%, var(--accent) 18%);
      }
      .plain-copy {
        max-width: 570px;
        color: color-mix(in oklch, var(--text) 72%, var(--muted) 28%);
        font-size: 28px;
        line-height: 1.35;
      }

      .market-card { padding: 96px 80px 56px; }
      .market-card .ticker { top: 0; }
      .market-main {
        position: relative;
        z-index: 3;
        display: grid;
        grid-template-columns: 0.9fr 1fr;
        gap: 54px;
        align-items: center;
        margin-top: 70px;
      }
      .market-card .stats {
        width: 980px;
        margin-top: 36px;
      }
      .market-card .qr-block {
        position: absolute;
        right: 80px;
        bottom: 56px;
        width: 430px;
      }

      .ticket-card {
        padding: 60px;
        color: var(--text);
      }
      .ticket-card .brand-row .logo-lockup span,
      .ticket-card .brand-row .market-code span,
      .ticket-card .brand-row .market-code strong {
        color: var(--text);
      }
      .ticket-shell {
        position: relative;
        z-index: 3;
        display: grid;
        grid-template-columns: 1fr 420px;
        gap: 26px;
        margin-top: 42px;
      }
      .ticket-screen {
        min-height: 610px;
        padding: 40px;
        border-radius: 8px;
        color: oklch(0.92 0.012 190);
        background:
          radial-gradient(circle at 12% 20%, color-mix(in oklch, var(--accent) 22%, transparent), transparent 32%),
          var(--panel);
      }
      .ticket-screen h1,
      .ticket-screen .score-max,
      .ticket-screen .trend-badge strong,
      .ticket-screen .trend-badge span {
        color: oklch(0.92 0.012 190);
      }
      .ticket-screen .learner-label,
      .ticket-screen .eyebrow,
      .ticket-screen .terminal-line {
        color: oklch(0.66 0.035 190);
      }
      .ticket-grid {
        display: grid;
        grid-template-columns: 0.85fr 1fr;
        gap: 32px;
        align-items: start;
        margin-top: 54px;
      }
      .ticket-sidebar {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .ticket-sidebar .stats {
        grid-template-columns: 1fr;
      }
      .ticket-sidebar .stats > div,
      .ticket-sidebar .qr-block {
        background: color-mix(in oklch, var(--surface) 84%, var(--accent) 8%);
      }
      .ticket-card .ticker {
        left: 60px;
        right: 60px;
        bottom: 24px;
        padding: 8px 0;
        border-radius: 8px;
        font-size: 16px;
        opacity: 0.82;
      }
      .ticket-card .ticker span {
        color: oklch(0.88 0.012 190);
      }

      .alert-card { padding: 64px 74px; }
      .alert-main {
        position: relative;
        z-index: 3;
        display: grid;
        grid-template-columns: 0.82fr 1.18fr;
        gap: 58px;
        align-items: center;
        margin-top: 48px;
      }
      .alert-board {
        padding: 42px;
        border: 1px solid color-mix(in oklch, var(--caution) 38%, transparent);
        border-radius: 8px;
        background:
          linear-gradient(135deg, color-mix(in oklch, var(--panel) 82%, var(--caution) 18%), var(--panel));
      }
      .alert-card .stats {
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-top: 24px;
      }
      .alert-card .stats > div {
        min-height: 112px;
        padding: 13px;
      }
      .alert-card .stats strong {
        font-size: 21px;
      }
      .alert-card .stats p {
        font-size: 15px;
      }
      .alert-strip {
        display: flex;
        width: 100%;
        justify-content: flex-start;
        margin-top: 22px;
      }
      .alert-card .qr-block {
        margin-top: 14px;
        width: 100%;
      }
      .alert-card .qr-block img {
        width: 94px;
        height: 94px;
      }

      .quote-card {
        display: grid;
        grid-template-columns: 0.8fr 1.2fr;
        gap: 36px;
        padding: 54px;
      }
      .quote-left,
      .quote-right {
        position: relative;
        z-index: 3;
        border-radius: 8px;
      }
      .quote-left {
        display: flex;
        flex-direction: column;
        padding: 34px;
        background: color-mix(in oklch, var(--surface) 82%, var(--accent) 18%);
      }
      .quote-left .brand-row {
        display: block;
      }
      .quote-left .market-code {
        margin-top: 26px;
      }
      .quote-left .logo-lockup img {
        filter: none;
      }
      .quote-left .plain-copy {
        margin-top: 34px;
        color: color-mix(in oklch, var(--text) 78%, var(--muted) 22%);
      }
      .quote-left .qr-block {
        position: relative;
        left: auto;
        right: auto;
        bottom: auto;
        margin-top: auto;
        background: color-mix(in oklch, var(--surface) 74%, var(--panel) 26%);
      }
      .quote-right {
        padding: 30px;
        color: oklch(0.93 0.01 210);
        background:
          radial-gradient(circle at 85% 10%, color-mix(in oklch, var(--accent-2) 35%, transparent), transparent 34%),
          var(--panel);
      }
      .quote-right .score-digits {
        font-size: 104px;
      }
      .quote-right .trend-badge {
        margin-top: 20px;
      }
      .quote-right .chart-panel {
        min-height: 0;
        padding: 26px;
      }
      .quote-right .stats {
        margin-top: 18px;
      }
      .quote-right .stats > div {
        padding: 14px;
      }
      .quote-right .stats strong {
        font-size: 22px;
      }
      .quote-right .stats p {
        font-size: 15px;
      }
      .quote-right .stats strong,
      .quote-right .trend-badge strong {
        color: oklch(0.93 0.01 210);
      }
      .quote-right .stats p,
      .quote-right .stats span,
      .quote-right .trend-badge span,
      .quote-right .eyebrow,
      .quote-right .chart-head span {
        color: oklch(0.68 0.035 215);
      }

      .wall-card {
        padding: 88px 64px 56px;
      }
      .wall-card .ticker {
        top: 0;
      }
      .wall-score {
        position: relative;
        z-index: 3;
        display: grid;
        grid-template-columns: 0.75fr 1.25fr;
        gap: 40px;
        align-items: end;
      }
      .wall-card .score-digits {
        font-size: 170px;
      }
      .wall-card .score-line {
        justify-content: flex-end;
      }
      .wall-card .score-stack {
        text-align: right;
      }
      .wall-bottom {
        position: relative;
        z-index: 3;
        display: grid;
        grid-template-columns: 1.15fr 0.85fr;
        gap: 26px;
        margin-top: 44px;
      }
      .wall-proof {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .wall-proof .stats {
        grid-template-columns: repeat(2, 1fr);
      }
      .wall-proof .stats > div {
        min-height: 116px;
      }
      .wall-proof .stats > div:first-child {
        grid-column: span 2;
      }
    </style>
  </head>
  <body>
    ${cardHtml}
  </body>
</html>`
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true })
  const logo = dataUri(await fs.readFile(logoPath), "image/png")
  const browser = await chromium.launch()
  const page = await browser.newPage({
    viewport: { width: 1700, height: 1000 },
    deviceScaleFactor: 1,
  })

  for (const variant of variants) {
    const verifyUrl = `https://gwth.ai/verify/${variant.verification}`
    const qr = await QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 192,
      color: {
        dark: "#143b37",
        light: "#f7f6f1",
      },
    })
    const card = renderCard(variant, logo, qr)
    const html = renderPage(card)
    await page.setContent(html, { waitUntil: "load" })
    const outPath = path.join(outputDir, variant.file)
    await page.locator(".scorecard").screenshot({ path: outPath })
    console.log(`wrote ${path.relative(projectRoot, outPath)}`)
  }

  const gallery = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>GWTH Scorecard Variants</title>
    <style>
      body {
        margin: 0;
        padding: 32px;
        background: oklch(0.94 0.006 70);
        color: oklch(0.18 0.04 175);
        font-family: Inter, "Segoe UI", system-ui, sans-serif;
      }
      h1 { margin: 0 0 24px; font-size: 34px; }
      .grid { display: grid; gap: 28px; }
      figure { margin: 0; }
      img {
        display: block;
        width: min(100%, 1200px);
        height: auto;
        border-radius: 8px;
        box-shadow: 0 18px 54px oklch(0.2 0.02 80 / 0.18);
      }
      figcaption { margin-top: 10px; font-weight: 700; }
    </style>
  </head>
  <body>
    <h1>GWTH Scorecard Variants</h1>
    <main class="grid">
      ${variants
        .map(
          (variant) => `<figure>
            <img src="./${variant.file}" alt="${escapeHtml(variant.title)} scorecard variant" />
            <figcaption>${escapeHtml(variant.title)}: ${escapeHtml(variant.file)}</figcaption>
          </figure>`
        )
        .join("\n")}
    </main>
  </body>
</html>`

  await fs.writeFile(path.join(outputDir, "index.html"), gallery, "utf8")
  await browser.close()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
