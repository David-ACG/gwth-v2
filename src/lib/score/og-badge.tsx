/**
 * The share picture: the GWTH.ai score badge at 1200 x 627, the size
 * LinkedIn shows a shared link at (bead gwth-launch-phjb). It is the badge
 * David picked on 21 Nov 2026 (`score-badge.tsx`, "ring on the left"),
 * redrawn for `next/og`, which cannot read CSS modules, container units or
 * CSS variables: every size here is the badge's wide layout at 1200 pixels
 * (1cqw = 12px) and every colour is the light paper token it stands for.
 * Keep the two in step: a change to the badge's look is a change here too.
 */
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"
import { LogoGwth } from "@/components/marketing/redesign/logo-gwth"
import type { ProjectGrade } from "@/components/marketing/score-badge/score-badge"

export const OG_SIZE = { width: 1200, height: 627 } as const

/** The light paper tokens (globals.css), as plain colours. */
const C = {
  surface: "#ffffff",
  quiet: "#e6efeb",
  ink: "#17211d",
  soft: "#414b46",
  muted: "#67716b",
  line: "#838884",
  lineSoft: "#dde2df",
  accent: "#3f7d6d",
} as const

const CQ = OG_SIZE.width / 100
const cq = (n: number) => Math.round(n * CQ)

/** What the picture shows. With no learner it is the plain GWTH.ai score title. */
export type OgBadge = {
  name: string
  shown: number
  earned: number
  status: "ok" | "fall"
  grades: readonly [ProjectGrade, ProjectGrade, ProjectGrade]
  footKey: string
  footValue: string
}

const R = 47.5
const W = 11

function polar(r: number, v: number): [number, number] {
  const a = ((-90 + 3.6 * v) * Math.PI) / 180
  return [60 + r * Math.cos(a), 60 + r * Math.sin(a)]
}

function tick(r0: number, r1: number, v: number) {
  const [x1, y1] = polar(r0, v)
  const [x2, y2] = polar(r1, v)
  return { x1: x1.toFixed(2), y1: y1.toFixed(2), x2: x2.toFixed(2), y2: y2.toFixed(2) }
}

/** An arc along the ring from `from` to `to` points (0 to 100). */
function arc(from: number, to: number): string {
  const [x1, y1] = polar(R, from)
  const [x2, y2] = polar(R, to)
  const large = to - from > 50 ? 1 : 0
  return `M ${x1.toFixed(3)} ${y1.toFixed(3)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(3)} ${y2.toFixed(3)}`
}

function Ring({ shown, earned, size }: { shown: number; earned: number; size: number }) {
  const s = Math.max(0, Math.min(100, shown))
  const e = Math.max(s, Math.min(100, earned))
  const circ = 2 * Math.PI * R
  const gap = tick(R - W / 2 - 1.2, R + W / 2 + 1.2, s)
  const mark = tick(R - W / 2 - 2.2, R + W / 2 + 2.2, s)
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={R} fill="none" stroke={C.quiet} strokeWidth={W} />
      {s > 0 ? (
        s >= 100 ? (
          <circle cx="60" cy="60" r={R} fill="none" stroke={C.accent} strokeWidth={W} />
        ) : (
          <circle
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke={C.accent}
            strokeWidth={W}
            strokeDasharray={`${((s / 100) * circ).toFixed(3)} ${circ.toFixed(3)}`}
            transform="rotate(-90 60 60)"
          />
        )
      ) : null}
      {e > s ? (
        <path d={arc(s, e)} fill="none" stroke={C.ink} strokeWidth={W} strokeDasharray="2 2.2" />
      ) : null}
      <circle cx="60" cy="60" r={R + W / 2} fill="none" stroke={C.line} strokeWidth={0.8} />
      <circle cx="60" cy="60" r={R - W / 2} fill="none" stroke={C.line} strokeWidth={0.8} />
      {[0, 25, 50, 75].map((v) => (
        <line key={v} {...tick(55.8, 59.2, v)} stroke={C.ink} strokeWidth={1.5} strokeLinecap="round" />
      ))}
      <line {...gap} stroke={C.surface} strokeWidth={4.6} />
      <line {...mark} stroke={C.ink} strokeWidth={2.2} strokeLinecap="round" />
    </svg>
  )
}

function Glyph({ status, size }: { status: OgBadge["status"]; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <path
        d={status === "fall" ? "M3 5l5 6 5-6" : "M2.5 8.5l3.5 3.5 7.5-8"}
        fill="none"
        stroke={C.ink}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** The status words on the badge (the same as `score-badge.tsx`). */
const STATUS_WORDS: Record<OgBadge["status"], string> = { ok: "Up to date", fall: "Falling" }

function Title({ logoWidth, wordSize }: { logoWidth: number; wordSize: number }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: cq(1.7) }}>
      {/* No <title>: next/og would draw it as text over the logo. */}
      <LogoGwth wordmarkColor={C.ink} accentColor={C.accent} width={logoWidth} title="" />
      <span
        style={{
          fontFamily: "Bitter",
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: wordSize,
          lineHeight: 1,
          color: C.accent,
          marginBottom: -wordSize * 0.15,
        }}
      >
        score
      </span>
    </div>
  )
}

/**
 * The name's size: the badge's own size, made smaller for a long name so it
 * fits the column on one line, and no smaller than {@link NAME_MIN}, below
 * which it wraps instead. Bitter SemiBold averages about 0.56em a character.
 */
const NAME_MIN = cq(3.8)
function nameSize(name: string, column: number): number {
  const fit = column / (Math.max(1, name.length) * 0.56)
  return Math.round(Math.max(NAME_MIN, Math.min(cq(5.8), fit)))
}

function Badge({ b }: { b: OgBadge }) {
  const p = cq(5.33)
  const ring = cq(25.5)
  const gap = cq(4.6)
  // Satori does not shrink a flex child below its text, so the right-hand
  // column gets its width spelled out.
  const column = OG_SIZE.width - 2 * p - ring - gap - 4
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: C.surface,
        border: `2px solid ${C.line}`,
        borderRadius: 16,
        overflow: "hidden",
        fontFamily: "Public Sans",
        color: C.ink,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, padding: `${cq(3.7)}px ${p}px 0` }}>
        <Title logoWidth={cq(21)} wordSize={cq(5.75)} />
        <div style={{ display: "flex", flexGrow: 1, alignItems: "center", gap, marginTop: cq(3) }}>
          <div style={{ display: "flex", position: "relative", width: ring, height: ring }}>
            <Ring shown={b.shown} earned={b.earned} size={ring} />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: ring,
                height: ring,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontFamily: "Bitter", fontWeight: 700, fontSize: cq(10.4), lineHeight: 1, letterSpacing: "-0.02em" }}>
                {String(Math.round(b.shown))}
              </span>
              <span style={{ fontSize: cq(2.05), color: C.muted, marginTop: cq(0.3) }}>out of 100</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", width: column }}>
            <span style={{ fontFamily: "Bitter", fontWeight: 600, fontSize: nameSize(b.name, column), lineHeight: 1.08, letterSpacing: "-0.012em" }}>
              {b.name}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: cq(1.1), marginTop: cq(1.6), fontSize: cq(2.6), fontWeight: 600 }}>
              <Glyph status={b.status} size={cq(2.6)} />
              <span>{STATUS_WORDS[b.status]}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: cq(2.8),
                paddingTop: cq(2.2),
                borderTop: `1px solid ${C.lineSoft}`,
              }}
            >
              {b.grades.map((g, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: cq(2.2), color: C.muted, lineHeight: 1.35 }}>{`Month ${i + 1} project`}</span>
                  <span style={{ fontSize: cq(3.1), fontWeight: 600, lineHeight: 1.35 }}>{g}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: cq(1.8),
          marginTop: cq(3),
          padding: `${cq(2.3)}px ${p}px`,
          background: C.quiet,
          borderTop: `2px solid ${C.line}`,
        }}
      >
        <span style={{ fontSize: cq(2.4), color: C.soft }}>{b.footKey}</span>
        <span style={{ fontSize: cq(3), fontWeight: 600 }}>{b.footValue}</span>
      </div>
    </div>
  )
}

/** The picture with no learner: the GWTH.ai score title alone. */
function Plain() {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        background: C.surface,
        border: `2px solid ${C.line}`,
        borderRadius: 16,
      }}
    >
      <Title logoWidth={cq(40)} wordSize={cq(11)} />
    </div>
  )
}

const FONT_DIR = join(process.cwd(), "public", "fonts", "score-card")

async function fonts() {
  const load = (file: string) => readFile(join(FONT_DIR, file))
  const [italic, semi, bold, sans, sansSemi] = await Promise.all([
    load("Bitter-MediumItalic.ttf"),
    load("Bitter-SemiBold.ttf"),
    load("Bitter-Bold.ttf"),
    load("PublicSans-Regular.ttf"),
    load("PublicSans-SemiBold.ttf"),
  ])
  return [
    { name: "Bitter", data: italic, weight: 500 as const, style: "italic" as const },
    { name: "Bitter", data: semi, weight: 600 as const, style: "normal" as const },
    { name: "Bitter", data: bold, weight: 700 as const, style: "normal" as const },
    { name: "Public Sans", data: sans, weight: 400 as const, style: "normal" as const },
    { name: "Public Sans", data: sansSemi, weight: 600 as const, style: "normal" as const },
  ]
}

/** The 1200 x 627 PNG of the badge (or of the plain title when `badge` is null). */
export async function scoreBadgeImage(badge: OgBadge | null): Promise<ImageResponse> {
  return new ImageResponse(badge ? <Badge b={badge} /> : <Plain />, {
    ...OG_SIZE,
    fonts: await fonts(),
    headers: { "cache-control": "public, max-age=0, s-maxage=600, stale-while-revalidate=3600" },
  })
}
