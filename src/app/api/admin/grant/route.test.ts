/**
 * W4 — /api/admin/grant tests: the session-gated wrapper around the existing
 * key-gated beta-access endpoint. Pins the two security properties (non-admin
 * → 401; the server-side API key is injected, never client-supplied) and the
 * in-process reuse of the beta-access handler.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest, NextResponse } from "next/server"

const authState = vi.hoisted(() => ({ user: null as unknown }))
vi.mock("@/lib/auth", () => ({
  getCurrentUser: () => Promise.resolve(authState.user),
}))

const betaAccess = vi.hoisted(() => ({
  calls: [] as unknown[],
  response: null as Response | null,
}))
vi.mock("@/app/api/admin/beta-access/route", () => ({
  POST: async (request: Request) => {
    betaAccess.calls.push(await request.json())
    return (
      betaAccess.response ??
      NextResponse.json({ success: true, email: "tester@example.com" })
    )
  },
}))

import { POST } from "./route"

function grantRequest(body: unknown): NextRequest {
  return new NextRequest(new URL("https://gwth.ai/api/admin/grant"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("POST /api/admin/grant (W4)", () => {
  const originalAdmins = process.env.ADMIN_EMAILS
  const originalKey = process.env.BETA_ACCESS_API_KEY
  const originalPipelineKey = process.env.PIPELINE_API_KEY

  beforeEach(() => {
    authState.user = null
    betaAccess.calls = []
    betaAccess.response = null
    process.env.ADMIN_EMAILS = "david@agilecommercegroup.com"
    process.env.BETA_ACCESS_API_KEY = "server-side-key"
    delete process.env.PIPELINE_API_KEY
  })

  afterEach(() => {
    const restore = (name: string, value: string | undefined) => {
      if (value === undefined) delete process.env[name]
      else process.env[name] = value
    }
    restore("ADMIN_EMAILS", originalAdmins)
    restore("BETA_ACCESS_API_KEY", originalKey)
    restore("PIPELINE_API_KEY", originalPipelineKey)
  })

  it("returns 401 for anonymous callers and never touches the grant handler", async () => {
    authState.user = null
    const response = await POST(grantRequest({ email: "x@y.com", months: 3 }))
    expect(response.status).toBe(401)
    expect(betaAccess.calls).toHaveLength(0)
  })

  it("returns 401 for an authenticated non-admin", async () => {
    authState.user = { id: "u2", email: "tester@example.com" }
    const response = await POST(grantRequest({ email: "x@y.com", months: 3 }))
    expect(response.status).toBe(401)
    expect(betaAccess.calls).toHaveLength(0)
  })

  it("rejects an invalid body with 400", async () => {
    authState.user = { id: "u1", email: "david@agilecommercegroup.com" }
    const response = await POST(grantRequest({ email: "not-an-email" }))
    expect(response.status).toBe(400)
    expect(betaAccess.calls).toHaveLength(0)
  })

  it("returns 500 when no server-side API key is configured", async () => {
    authState.user = { id: "u1", email: "david@agilecommercegroup.com" }
    delete process.env.BETA_ACCESS_API_KEY
    const response = await POST(grantRequest({ email: "x@y.com", months: 3 }))
    expect(response.status).toBe(500)
    expect(betaAccess.calls).toHaveLength(0)
  })

  it("reuses the beta-access handler with the SERVER key injected", async () => {
    authState.user = { id: "u1", email: "david@agilecommercegroup.com" }
    const response = await POST(
      grantRequest({
        email: "tester@example.com",
        months: 2,
        sendInvite: true,
        // A hostile client cannot smuggle its own key — the schema strips it.
        apiKey: "client-supplied-key",
      })
    )
    expect(response.status).toBe(200)
    expect(betaAccess.calls).toHaveLength(1)
    expect(betaAccess.calls[0]).toMatchObject({
      email: "tester@example.com",
      months: 2,
      sendInvite: true,
      apiKey: "server-side-key",
    })
  })

  it("passes the beta-access response through (e.g. its errors)", async () => {
    authState.user = { id: "u1", email: "david@agilecommercegroup.com" }
    betaAccess.response = NextResponse.json({ error: "boom" }, { status: 500 })
    const response = await POST(grantRequest({ email: "x@y.com", months: 3 }))
    expect(response.status).toBe(500)
  })
})
