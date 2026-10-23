import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const root = process.cwd()
const layout = readFileSync(join(root, "src/app/layout.tsx"), "utf8")
const manifest = readFileSync(join(root, "public/site.webmanifest"), "utf8")

describe("favicon", () => {
  it("stamps every icon and manifest URL so browsers drop the cached old G", () => {
    const icons = layout.slice(layout.indexOf("icons: {"))
    const urls = [...icons.matchAll(/url: `([^`]+)`/g)].map((m) => m[1])
    expect(urls.length).toBe(3)
    for (const url of urls) expect(url).toContain("?v=${FAVICON_VERSION}")
    expect(layout).toContain("apple: `/apple-touch-icon.png?v=${FAVICON_VERSION}`")
    expect(layout).toContain("manifest: `/site.webmanifest?v=${FAVICON_VERSION}`")
    const version = layout.match(/const FAVICON_VERSION = "(\d+)"/)?.[1]
    expect(version).toBeTruthy()
    for (const src of JSON.parse(manifest).icons.map((i: { src: string }) => i.src))
      expect(src).toContain(`?v=${version}`)
  })

  it("no longer ships the old tiled G files", () => {
    for (const f of ["favicon-96x96.png", "icon.png", "icon-light.png", "icon-light.svg"])
      expect(existsSync(join(root, "public", f))).toBe(false)
  })
})
