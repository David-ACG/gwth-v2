# Baseline screenshots — captured 2026-04-24

Source: P520 at http://192.168.178.50:3001 (the "local" GWTH version that this POC will redesign).

## Captured

| File | What |
|---|---|
| `homepage-1440-light.png` | / route, 1440x900, light mode, full page |
| `homepage-1440-dark.png` | / route, 1440x900, dark mode (Graphite Warm), full page |
| `homepage-375-light.png` | / route, 375x800 mobile, light mode |
| `homepage-375-dark.png` | / route, 375x800 mobile, dark mode |

Dark mode captured by setting `localStorage.theme = 'dark'` via Playwright `addInitScript` before navigation.

## Pending

- `/dashboard` — auth-gated. Capture once test-user credentials are confirmed.

## Capture script
`../_capture-baseline.mjs`
