// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const deleteExpiredHandInFiles = vi.fn()
const handInStore = vi.fn()
vi.mock("@/lib/data/capstone-retention", () => ({ deleteExpiredHandInFiles }))
vi.mock("@/lib/capstones/storage", () => ({ handInStore }))

const { POST } = await import("./route")

function call(secret?: string) {
  const headers: Record<string, string> = {}
  if (secret !== undefined) headers["x-cron-secret"] = secret
  return POST(new Request("http://localhost/api/cron/hand-in-retention", { method: "POST", headers }))
}

describe("POST /api/cron/hand-in-retention", () => {
  beforeEach(() => {
    process.env.CRON_SECRET = "s3cret"
    handInStore.mockReturnValue({ kind: "local" })
    deleteExpiredHandInFiles.mockResolvedValue({ deleted: ["h_a"], draftsRemoved: [], failed: [] })
  })
  afterEach(() => {
    delete process.env.CRON_SECRET
    vi.clearAllMocks()
  })

  it("fails closed without CRON_SECRET on the server", async () => {
    delete process.env.CRON_SECRET
    expect((await call("s3cret")).status).toBe(500)
    expect(deleteExpiredHandInFiles).not.toHaveBeenCalled()
  })

  it("refuses a missing or wrong secret", async () => {
    expect((await call()).status).toBe(401)
    expect((await call("wrong")).status).toBe(401)
    expect(deleteExpiredHandInFiles).not.toHaveBeenCalled()
  })

  it("does nothing when no hand-ins store is configured", async () => {
    handInStore.mockReturnValue(null)
    const res = await call("s3cret")
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ skipped: "no hand-ins store configured" })
    expect(deleteExpiredHandInFiles).not.toHaveBeenCalled()
  })

  it("runs the job and reports counts, never learner details", async () => {
    const res = await call("s3cret")
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ deleted: 1, draftsRemoved: 0, failed: [] })
  })

  it("returns 500 when any hand-in failed, so the scheduler notices", async () => {
    deleteExpiredHandInFiles.mockResolvedValue({ deleted: [], draftsRemoved: [], failed: ["h_b"] })
    expect((await call("s3cret")).status).toBe(500)
  })
})
