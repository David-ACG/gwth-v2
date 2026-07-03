#!/usr/bin/env node
// Lighthouse-only Next.js production server.
//
// Clears SITE_PASSWORD before delegating to `next start` so the
// pre-launch lockdown header (`X-Robots-Tag: noindex …`) is not
// emitted — without that, the SEO `is-crawlable` audit caps the
// Lighthouse SEO score at 0.69 and the .lighthouserc.json gate
// can never pass against the local production build.
import { spawn } from "node:child_process"

// Tell the middleware to skip the pre-launch X-Robots-Tag noindex
// header. SITE_PASSWORD stays in place because Next.js will reload
// .env.local regardless of what we set here; ALLOW_INDEXING is read
// directly by the middleware at request time and side-steps the
// .env-loading order entirely.
process.env.ALLOW_INDEXING = "1"

const child = spawn("npx", ["next", "start"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
})

child.on("exit", (code) => {
  process.exit(code ?? 0)
})
