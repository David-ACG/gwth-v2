/**
 * Unit tests for the page-comments data layer: the row mapper, and that the
 * writes send the right values (the query builder is faked). The same
 * functions run against a real Postgres in
 * src/db/page-comments-migration.db.test.ts.
 */
import { beforeEach, describe, expect, it, vi } from "vitest"

const getDb = vi.hoisted(() => vi.fn())
vi.mock("@/db", () => ({ getDb }))

import {
  createPageComment,
  getPageComment,
  isBetaTester,
  setBetaTester,
  toPageComment,
  updatePageComment,
} from "./page-comments"

const ID = "11111111-2222-4333-8444-555555555555"

function row(overrides: Record<string, unknown> = {}) {
  return {
    id: ID,
    userId: "beta_1",
    authorEmail: "bea@example.com",
    authorRole: "beta",
    site: "preview",
    pagePath: "/course/x",
    pageTitle: null,
    lessonId: "m1_l01",
    lessonPage: 5,
    lessonPageTitle: null,
    lessonVariant: "live",
    targetType: "text",
    quote: "the UK",
    quotePrefix: null,
    quoteSuffix: null,
    selector: "#intro",
    selectorKind: "id",
    heading: null,
    imageSrc: null,
    imageAlt: null,
    context: null,
    comment: "Odd wording",
    status: "open",
    triage: null,
    action: null,
    shape: null,
    textEdit: null,
    viewport: "1440x900",
    userAgent: null,
    createdAt: "2026-09-25 10:00:00.123+00",
    updatedAt: "2026-09-25 10:00:00.123+00",
    ...overrides,
  }
}

beforeEach(() => {
  getDb.mockReset()
})

describe("toPageComment", () => {
  it("maps a row to the API shape, dropping empty optional fields", () => {
    const comment = toPageComment(row() as never)
    expect(comment).toEqual({
      id: ID,
      userId: "beta_1",
      authorEmail: "bea@example.com",
      authorRole: "beta",
      site: "preview",
      status: "open",
      triage: null,
      userAgent: null,
      createdAt: "2026-09-25T10:00:00.123Z",
      updatedAt: "2026-09-25T10:00:00.123Z",
      pagePath: "/course/x",
      targetType: "text",
      comment: "Odd wording",
      lessonId: "m1_l01",
      lessonPage: 5,
      lessonVariant: "live",
      quote: "the UK",
      selector: "#intro",
      selectorKind: "id",
      viewport: "1440x900",
    })
    expect("pageTitle" in comment).toBe(false)
    expect("action" in comment).toBe(false)
    expect("shape" in comment).toBe(false)
    expect("textEdit" in comment).toBe(false)
  })

  it("maps the action, shape and text edit in camelCase", () => {
    const action = { category: "content", key: "rewrite", label: "Rewrite this" }
    const shape = { kind: "box", rel: { x: 0.1, y: 0.2, w: 0.3, h: 0.4 } }
    const textEdit = { original: "the UK", replacement: "Britain" }
    const comment = toPageComment(
      row({ action, shape, textEdit, comment: "", targetType: "area" }) as never
    )
    expect(comment).toMatchObject({ action, shape, textEdit, comment: "", targetType: "area" })
  })

  it("keeps the triage record", () => {
    const triage = { by: "opus", at: "2026-09-25T11:00:00Z", verdict: "valid" }
    expect(toPageComment(row({ triage, status: "accepted" }) as never).triage).toEqual(triage)
  })
})

describe("writes", () => {
  it("createPageComment stores absent optional fields as null", async () => {
    const values = vi.fn(() => ({ returning: async () => [row()] }))
    getDb.mockReturnValue({ insert: () => ({ values }) })
    await createPageComment({
      pagePath: "/course/x",
      targetType: "page",
      comment: "Whole page",
      userId: "beta_1",
      authorEmail: "bea@example.com",
      authorRole: "beta",
      site: "local",
    })
    const inserted = (values.mock.calls[0] as unknown as [Record<string, unknown>])[0]
    expect(inserted).toMatchObject({
      userId: "beta_1",
      authorRole: "beta",
      site: "local",
      targetType: "page",
      quote: null,
      lessonId: null,
      userAgent: null,
      action: null,
      shape: null,
      textEdit: null,
    })
  })

  it("createPageComment persists the action, shape and text edit", async () => {
    const values = vi.fn(() => ({ returning: async () => [row()] }))
    getDb.mockReturnValue({ insert: () => ({ values }) })
    const action = { category: "keep" as const, key: "keep", label: "Keep this, I like it" }
    const shape = { kind: "point" as const, rel: { x: 0.5, y: 0.5, w: 0, h: 0 } }
    const textEdit = { original: "colour", replacement: "color" }
    await createPageComment({
      pagePath: "/course/x",
      targetType: "text",
      comment: "",
      action,
      shape,
      textEdit,
      userId: "beta_1",
      authorEmail: "bea@example.com",
      authorRole: "beta",
      site: "local",
    })
    const inserted = (values.mock.calls[0] as unknown as [Record<string, unknown>])[0]
    expect(inserted).toMatchObject({ comment: "", action, shape, textEdit })
  })

  it("updatePageComment stamps updated_at and only sets what was given", async () => {
    const set = vi.fn(() => ({ where: () => ({ returning: async () => [row({ status: "fixed" })] }) }))
    getDb.mockReturnValue({ update: () => ({ set }) })
    const result = await updatePageComment(ID, { status: "fixed" })
    const values = (set.mock.calls[0] as unknown as [Record<string, unknown>])[0]
    expect(Object.keys(values).sort()).toEqual(["status", "updatedAt"])
    expect(typeof values.updatedAt).toBe("string")
    expect(result?.status).toBe("fixed")
  })

  it("an id that is not a UUID never reaches the database", async () => {
    await expect(getPageComment("not-a-uuid")).resolves.toBeNull()
    await expect(updatePageComment("1; drop", { status: "fixed" })).resolves.toBeNull()
    expect(getDb).not.toHaveBeenCalled()
  })

  it("setBetaTester inserts idempotently when on and deletes when off", async () => {
    const onConflictDoNothing = vi.fn(async () => undefined)
    const values = vi.fn(() => ({ onConflictDoNothing }))
    const where = vi.fn(async () => undefined)
    getDb.mockReturnValue({ insert: () => ({ values }), delete: () => ({ where }) })

    await setBetaTester("u1", true, "admin_1")
    expect(values).toHaveBeenCalledWith({ userId: "u1", addedBy: "admin_1" })
    expect(onConflictDoNothing).toHaveBeenCalled()

    await setBetaTester("u1", false, "admin_1")
    expect(where).toHaveBeenCalled()
  })

  it("isBetaTester is true only when a row exists", async () => {
    const limit = vi.fn()
    getDb.mockReturnValue({
      select: () => ({ from: () => ({ where: () => ({ limit }) }) }),
    })
    limit.mockResolvedValueOnce([{ userId: "u1" }])
    await expect(isBetaTester("u1")).resolves.toBe(true)
    limit.mockResolvedValueOnce([])
    await expect(isBetaTester("u2")).resolves.toBe(false)
  })
})
