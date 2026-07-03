/**
 * W4 — admin allowlist + gate tests (src/lib/admin.ts).
 *
 * The allowlist is env-driven (ADMIN_EMAILS); nobody is admin when it is
 * unset (fail closed). getAdminUser layers the allowlist on the W11 auth
 * seam, which is mocked here.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { NextResponse } from "next/server"
import type { User } from "@/lib/types"

const authState = vi.hoisted(() => ({ user: null as unknown }))
vi.mock("@/lib/auth", () => ({
  getCurrentUser: () => Promise.resolve(authState.user),
}))

import {
  getAdminAllowlist,
  getAdminUser,
  isAdminEmail,
  requireAdminForApi,
} from "./admin"

const ADMIN: Partial<User> = {
  id: "user_1",
  name: "David",
  email: "david@agilecommercegroup.com",
}

describe("admin allowlist (W4)", () => {
  const original = process.env.ADMIN_EMAILS

  beforeEach(() => {
    authState.user = null
    delete process.env.ADMIN_EMAILS
  })

  afterEach(() => {
    if (original === undefined) delete process.env.ADMIN_EMAILS
    else process.env.ADMIN_EMAILS = original
  })

  it("is empty (nobody is admin) when ADMIN_EMAILS is unset", () => {
    expect(getAdminAllowlist().size).toBe(0)
    expect(isAdminEmail("david@agilecommercegroup.com")).toBe(false)
  })

  it("parses a comma-separated list with whitespace and mixed case", () => {
    process.env.ADMIN_EMAILS = " David@GWTH.ai , david@agilecommercegroup.com ,"
    expect(getAdminAllowlist()).toEqual(
      new Set(["david@gwth.ai", "david@agilecommercegroup.com"])
    )
    expect(isAdminEmail("DAVID@gwth.AI")).toBe(true)
    expect(isAdminEmail("someone@else.com")).toBe(false)
  })

  it("never treats null/undefined/empty email as admin", () => {
    process.env.ADMIN_EMAILS = "david@gwth.ai"
    expect(isAdminEmail(null)).toBe(false)
    expect(isAdminEmail(undefined)).toBe(false)
    expect(isAdminEmail("")).toBe(false)
  })

  it("getAdminUser returns null for anonymous traffic", async () => {
    process.env.ADMIN_EMAILS = "david@agilecommercegroup.com"
    authState.user = null
    expect(await getAdminUser()).toBeNull()
  })

  it("getAdminUser returns null for an authenticated non-admin", async () => {
    process.env.ADMIN_EMAILS = "david@agilecommercegroup.com"
    authState.user = { ...ADMIN, email: "tester@example.com" }
    expect(await getAdminUser()).toBeNull()
  })

  it("getAdminUser returns the user for an allowlisted admin", async () => {
    process.env.ADMIN_EMAILS = "david@agilecommercegroup.com"
    authState.user = ADMIN
    const user = await getAdminUser()
    expect(user?.email).toBe("david@agilecommercegroup.com")
  })

  it("requireAdminForApi returns a 401 response for non-admins", async () => {
    process.env.ADMIN_EMAILS = "david@agilecommercegroup.com"
    authState.user = { ...ADMIN, email: "tester@example.com" }
    const gate = await requireAdminForApi()
    expect(gate).toBeInstanceOf(NextResponse)
    expect((gate as NextResponse).status).toBe(401)
  })

  it("requireAdminForApi returns the user for admins", async () => {
    process.env.ADMIN_EMAILS = "david@agilecommercegroup.com"
    authState.user = ADMIN
    const gate = await requireAdminForApi()
    expect(gate).not.toBeInstanceOf(NextResponse)
    expect((gate as User).id).toBe("user_1")
  })
})
