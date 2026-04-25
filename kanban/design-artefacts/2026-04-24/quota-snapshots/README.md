# Claude Design quota snapshots

Tracks Claude Design weekly-quota usage across the POC. Every quota snapshot is a screenshot of claude.ai → Settings → Usage tab. File naming: `YYYY-MM-DD_<phase-marker>.jpg`.

## Snapshots

| File | Phase | Plan | Claude Design % used | Notes |
|---|---|---|---|---|
| `2026-04-25_pre-poc-start.jpg` | Pre-Phase-0 baseline | Max (5x) | **0%** | "You haven't used Claude Design yet". Weekly reset = Sat 2:00 AM. Current session 35% used (Claude Code, separate). All models 4% used weekly. Extra usage £20.92 of £50 cap (resets May 1). |

## Reset day clarification

The plan §0 originally noted "Thursday 2026-04-23 ~11:00" reset based on David's observation. The Settings page on 2026-04-25 shows the canonical weekly reset is **Saturday 02:00 AM**. Treating Saturday as the authoritative reset day going forward; the "Thursday" reset appears to have been either a misinterpretation or a one-off platform event. Take the next snapshot at Phase 1a end to confirm the Saturday reset is real and to measure homepage burn precisely.

## Targets / gates

- **Quota gate (`beads_GWTH-9t0`)** runs after Phase 1b (homepage shipped). Compare against this baseline.
- Decision rule from plan §0 / §17: <50% burn → straight to Phase 2. 50–75% → proceed but flag. >75% → pause until Sat 02:00 reset.
