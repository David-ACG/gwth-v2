// @vitest-environment node
/**
 * A live run of both judges on PLANTED and MADE-UP hand-ins only (bead
 * gwth-launch-9289.5): the latest Luna through Codex and the latest Haiku
 * through Claude Code, on David's subscriptions. Decision 7a allows the
 * subscriptions for test hand-ins and prompt work; real student work only
 * ever goes through the APIs (./providers.ts). Pictures are left out here
 * (the API judges see them).
 *
 * Off unless asked for, because it spends subscription allowance:
 *   CAPSTONE_LIVE_SUBSCRIPTION=1 CAPSTONE_LIVE_CASES=askeveryone/p01,familybot/m04 npx vitest run src/lib/capstones/judge/live-subscription.test.ts
 * Writes a summary to CAPSTONE_LIVE_OUT (default: a temp file it prints).
 */
import { execFile } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import { runScriptChecks } from "../checks";
import { markingGuideFromJson, type MarkingGuide } from "../guide-loader";
import { HAND_IN_QUESTIONS } from "../guides";
import { asText } from "../preview";
import { Redactor } from "../redact";
import { loadFixture } from "../fixtures/load-fixtures";
import { buildJudgeRequest, type JudgeRequest } from "./prompt";
import type { Judge } from "./providers";
import {
  combineVerdicts,
  extractJson,
  parseVerdict,
  totalOf,
  bandOf,
  verdictJsonSchema,
} from "./verdict";

const run = promisify(execFile);
const LIVE = process.env.CAPSTONE_LIVE_SUBSCRIPTION === "1";
const LATEST = "/home/david/projects/GWTH-launch-plan/scripts/latest_models.py";

async function latest(family: string): Promise<string> {
  return (await run("python3", [LATEST, family])).stdout.trim();
}

/** The latest Luna at max reasoning through Codex, read-only, structured output. */
function codexLuna(): Judge {
  return async (request: JudgeRequest, schema) => {
    const model = await latest("luna");
    const dir = mkdtempSync(join(tmpdir(), "luna-"));
    writeFileSync(join(dir, "schema.json"), JSON.stringify(schema));
    const prompt = `${request.system}\n\n${request.text}`;
    const child = run(
      "codex",
      [
        "exec",
        "--model",
        model,
        "-c",
        "model_reasoning_effort=max",
        "--skip-git-repo-check",
        "-s",
        "read-only",
        "--output-schema",
        join(dir, "schema.json"),
        "--output-last-message",
        join(dir, "out.json"),
        "-",
      ],
      { cwd: dir, timeout: 20 * 60_000, maxBuffer: 64 * 1024 * 1024 },
    );
    child.child.stdin?.end(prompt);
    await child;
    return {
      judge: "luna",
      modelId: model,
      text: readFileSync(join(dir, "out.json"), "utf8"),
      inputTokens: null,
      outputTokens: null,
      costUsd: null,
    };
  };
}

/** The latest Haiku through Claude Code, no tools, JSON out. */
function claudeHaiku(): Judge {
  return async (request: JudgeRequest) => {
    const child = run(
      "claude",
      [
        "-p",
        "--model",
        "haiku",
        "--output-format",
        "json",
        "--disallowed-tools",
        "Bash",
        "Read",
        "Write",
        "Edit",
        "Glob",
        "Grep",
        "WebFetch",
        "WebSearch",
        "Task",
        "--system-prompt",
        request.system,
      ],
      {
        // A neutral folder, so no project instructions or hooks load into the judge.
        cwd: mkdtempSync(join(tmpdir(), "haiku-")),
        timeout: 20 * 60_000,
        maxBuffer: 64 * 1024 * 1024,
      },
    );
    child.child.stdin?.end(request.text);
    const { stdout } = await child;
    const body = JSON.parse(stdout) as {
      result?: string;
      modelUsage?: Record<string, unknown>;
      usage?: { input_tokens?: number; output_tokens?: number };
    };
    const modelId = Object.keys(body.modelUsage ?? {})[0] ?? "haiku";
    return {
      judge: "haiku",
      modelId,
      text: body.result ?? "",
      inputTokens: body.usage?.input_tokens ?? null,
      outputTokens: body.usage?.output_tokens ?? null,
      costUsd: null,
    };
  };
}

function guideFor(capstone: string): MarkingGuide | null {
  const root = join(homedir(), "gwth-dashboard", "generated_lessons");
  if (!existsSync(root)) return null;
  for (const dir of readdirSync(root)) {
    const file = join(root, dir, "content", "marking_guide.json");
    if (!existsSync(file)) continue;
    const guide = markingGuideFromJson(JSON.parse(readFileSync(file, "utf8")));
    if (guide?.capstone === capstone) return guide;
  }
  return null;
}

describe.skipIf(!LIVE)("live judges on test hand-ins (subscriptions)", () => {
  const cases = (
    process.env.CAPSTONE_LIVE_CASES ?? "askeveryone/p01,familybot/m04"
  )
    .split(",")
    .map((c) => c.trim());

  it.each(cases)(
    "marks %s end to end",
    async (spec) => {
      const [capstone, prefix] = spec.split("/") as [
        "familybot" | "askmyco" | "askeveryone",
        string,
      ];
      const root = join(
        process.cwd(),
        "src",
        "lib",
        "capstones",
        "fixtures",
        "handins",
        capstone,
      );
      const caseId = readdirSync(root).find((d) => d.startsWith(prefix))!;
      const c = await loadFixture(capstone, caseId);
      const guide = guideFor(capstone)!;
      const redactor = new Redactor();
      const files = c.files.map((f) => {
        const text = asText(f.path, f.bytes);
        return {
          path: f.path,
          originalPath: f.originalPath,
          text: text === null ? null : redactor.redact(text).text,
          bytes: f.bytes,
        };
      });
      const checks = runScriptChecks({
        capstone,
        files,
        labels: redactor.summary(),
        expectedFiles: guide.expectedFiles,
      });
      const request = buildJudgeRequest(
        `test-${caseId}`,
        guide,
        checks,
        c.answers as unknown as Record<string, string>,
        files.map((f) => ({ name: f.originalPath, text: f.text })),
        HAND_IN_QUESTIONS.map((q) => ({ id: q.id, question: q.question })),
      );
      const schema = verdictJsonSchema(guide);
      const [lunaReply, haikuReply] = await Promise.all([
        codexLuna()(request, schema),
        claudeHaiku()(request, schema),
      ]);
      const luna = parseVerdict(extractJson(lunaReply.text), guide);
      const haiku = parseVerdict(extractJson(haikuReply.text), guide);
      const sources = [
        ...Object.values(c.answers),
        ...files.map((f) => f.text ?? ""),
      ].join("\n");
      const combined = combineVerdicts(luna, haiku, guide, checks, sources);
      const lunaTotal = totalOf(luna, guide);
      const haikuTotal = totalOf(haiku, guide);
      const summary = {
        case: `${capstone}/${caseId}`,
        intended: {
          band: c.meta.intended_band,
          total: c.meta.intended_total,
          planted: c.meta.planted_problem,
        },
        luna: {
          model: lunaReply.modelId,
          total: lunaTotal,
          band: bandOf(
            lunaTotal,
            luna.basics.every((b) => b.met),
          ),
          basicsMissed: luna.basics
            .filter((b) => !b.met)
            .map((b) => `${b.id}: ${b.reason}`),
        },
        haiku: {
          model: haikuReply.modelId,
          total: haikuTotal,
          band: bandOf(
            haikuTotal,
            haiku.basics.every((b) => b.met),
          ),
          basicsMissed: haiku.basics
            .filter((b) => !b.met)
            .map((b) => `${b.id}: ${b.reason}`),
        },
        combined: {
          status: combined.status,
          total: combined.total,
          band: combined.band,
          flags: combined.flags,
        },
        scriptChecksFailed: checks.results
          .filter((r) => !r.passed)
          .map((r) => `${r.label}: ${r.detail}`),
        nextStep: combined.feedback.nextStep,
        raw: { luna: lunaReply.text, haiku: haikuReply.text, lunaModel: lunaReply.modelId, haikuModel: haikuReply.modelId },
      };
      const out =
        process.env.CAPSTONE_LIVE_OUT ??
        join(mkdtempSync(join(tmpdir(), "live-")), "summary.jsonl");
      writeFileSync(out, JSON.stringify(summary) + "\n", { flag: "a" });
      console.log(`LIVE ${JSON.stringify({ ...summary, raw: undefined })}`);
      // The run is the proof: valid verdicts from both real judges, combined.
      expect(combined.criteria).toHaveLength(guide.criteria.length);
    },
    45 * 60_000,
  );
});
