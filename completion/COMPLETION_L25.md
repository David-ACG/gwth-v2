# L25 — Home-page explainer video: verify the voice, fix only with David

**Task:** David reported the home-page explainer "voice goes strange at about 1:10".
Verify, measure, and fix only with his ear-gate.

**Verdict for this packet: DRIFT CONFIRMED, awaiting David's picks.** Nothing has
been swapped. The live `explainer.mp4` is untouched.

**Chunk editor (make your picks here):**
https://hlab.taila51191.ts.net:9456/qc-review.html?project=explainer

---

## 1. The defect is real and it is timbre, not words

David's 1:10 report is confirmed and quantified. Three independent checks
separate the three possible causes:

| Check | Result | Rules out |
|---|---|---|
| Tolerant WER vs the VTT script (faster-whisper small, int8 CPU) | **0.0044 overall** (1 homophone in 228 words); **final third 0.000**; final 20% **0.000** | Garbling / dropped words |
| Speaker-clone cosine vs the reference clip | **>0.993 on every chunk** | Speaker drift ("another man") |
| HNR (voice quality) per chunk | **falls 3.80 to 2.07 across the back half** | Nothing. This is the defect. |

So the words are right and it is still David's voice. What decays is voice
*quality*.

## 2. HNR across the whole video (shipped audio)

| Chunk | Window | HNR | Line |
|---|---|---|---|
| 0 | 0:00-0:12 | 2.71 | Most people use ChatGPT like a search box... |
| 1 | 0:12-0:25 | 3.31 | GWTH is an applied AI course for UK adults... |
| 2 | 0:25-0:40 | 3.63 | It starts in plain English. No jargon... |
| 3 | 0:40-0:48 | **3.80** (peak) | You automate the jobs you repeat every week... |
| 4 | 0:48-1:00 | 2.60 | Every lesson leaves real work behind... |
| 5 | 1:00-1:11 | 2.74 | We are independent. No sponsors... |
| 6 | 1:11-1:19 | 2.39 | If it suits you, course access is £29 a month... |
| 7 | 1:19-1:36 | **2.07** (worst) | Here is the promise... come and take a look at gwth.ai. |

Head (chunks 0-3) mean **3.36**. Tail (chunks 5-7) mean **2.40**. A 29% quality
decline, with the floor in the final chunk. The earlier pass measured the worst
single passage, "Here is the promise" at 1:19, at **HNR 0.97**, inside the reject
band. This is present in the source take, so it is the generation and not the mux.

The chunk boundaries land almost exactly on David's report: everything through
chunk 4 ends at 1:00, and the audible fault starts in chunks 5 to 7.

## 3. What is available to fix it

The video is split into 8 chunks with real start/end times in the finished
render, so a swap is **window-fitted**: each chunk is padded or head-trimmed back
into its own slot. No re-render, no caption re-timing, animation cannot shift.
This is not the 1-hour splice an earlier note warned about.

| Chunk | Best alternate | HNR vs shipped | Gate | Verdict |
|---|---|---|---|---|
| 5 | take_01 | **5.33** vs 2.74 | clean | Strong win |
| 6 | take_02 | 2.74 vs 2.39 | best_effort | Marginal, see below |
| 7 | take_04 | **3.02** vs 2.07 | clean | Strong win |
| 7 | take_03 | 2.92 vs 2.07 | clean | Good, but adds pause (below) |

**Chunk 6 has no good answer yet.** Four fresh takes were rolled today through the
proven recipe (8 attempts, cfg/seed grid). Zero passed the clean gate and the two
kept as best_effort match the quality already in the bank. Their transcripts show
real slips, not ASR artefacts: one says "pay the month at the time" for "paid a
month at a time", the other "of course, access is 29,000 a month" for "course
access is £29 a month". The "£29 a month, paid a month at a time" line is simply
hard for this model. On a pricing line that is worth knowing before shipping.

## 4. Correction on the chunk-7 outro gap

An earlier read of `window_delta_s` suggested the chunk-7 alternates, being 2.4 to
4.3s shorter than the window, would compound the existing silent outro into 5 to
7s of dead air. Direct measurement of where speech actually ends says otherwise:

| Take | Duration | Speech ends | Dead air after window-fit |
|---|---|---|---|
| take_00 (shipped) | 16.419 | 13.86 | **2.56s** |
| take_02 | 14.071 | 13.72 | 2.70s |
| take_04 | 13.725 | 13.54 | 2.88s |
| take_01 | 13.323 | 13.12 | 3.30s |
| take_03 | 12.115 | 12.10 | **4.32s** |

The shipped take already carries 2.56s of built-in trailing silence, so the
alternates are not adding much. take_02 and take_04 land within a third of a
second of the status quo. Only **take_03 is a real regression** on pacing, adding
about 1.8s of extra silence before the video ends.

## 5. Bug found and fixed on the way (the "roll new takes" button)

The QC page's "None of these are good enough, roll 3 new takes" button **could
never have worked**. `jobserver_alive()` in `scripts/vv7b_regen.py` shelled out to
`docker top <container> -eo args`. The Docker daemon parses that ps output itself
and rejects any format lacking a PID column, so the call always failed with
"Couldn't find PID field in ps output" and fell into a bare `except` returning
False. Consequences every time it ran:

1. A healthy resident jobserver was reported dead.
2. Its ready marker was deleted and a **second** jobserver started, which OOMed
   against the first one's 17.7 GB and sat in a retry loop holding 3.3 GB.
3. The run then aborted with "the VV7B job server died while starting".

Fixed by asking `ps` inside the container (`docker exec <c> ps -eo pid,args`),
which is the form that works, plus a non-zero-returncode warning so a future
breakage is loud rather than silent.

A second precondition bug surfaced behind it: the 20 GB free-GPU gate was applied
even when the model was **already resident**, which is unsatisfiable by definition
since the resident server is holding that memory. Now gated on whether a load is
actually needed. The orphaned OOM-looping jobserver was killed and the GPU left
clean (one healthy server, 18.1 GB).

Both fixes are in `/home/david/projects/GWTH-launch-plan/scripts/vv7b_regen.py`.

## 6. Recommendation

Swap **chunk 5 to take_01** and **chunk 7 to take_04**. Those are the two clean-gate
wins and together they cover the worst of what David hears, including the "Here is
the promise" passage. **Leave chunk 6 on the shipped take** until a take exists that
is both cleaner and says "£29" correctly. A marginal HNR gain is not worth a
wrong number in a pricing line.

Use "▶ in context" on the page rather than the bare clip, so the joins are audible.

## 7. Shipping, once David has picked

```bash
# 1. pick in the UI, then "Hear the whole thing with my picks"
# 2. preview the muxed video
python3 /home/david/projects/GWTH-launch-plan/scripts/mux_explainer_picks.py
# 3. when it sounds right, write it over the site asset
python3 /home/david/projects/GWTH-launch-plan/scripts/mux_explainer_picks.py --install
```

`--install` keeps a timestamped backup beside the asset, so the revert is one `mv`.
Deploying to gwth.ai stays a separate deliberate step.

## 8. Three more bugs found by David using the editor (all fixed)

Handing him the tool surfaced faults no measurement would have found.

**a. "Roll new takes" returned duplicates.** The generator's seed is
`SEED_BASE + index * 100 + attempt` with a hardcoded 1000 base, so a second run
over a chunk reproduced the first run's takes byte for byte. David's "3 new
takes" for chunk 5 came back as exact copies of take_01/02/03 (seeds 1501, 1505,
1507; identical HNR 5.33, 2.61, 2.14). `SEED_BASE` is now an env var that
`vv7b_regen.py` sets fresh per run, with a content-hash guard that discards any
generation matching a take already on offer. Re-rolled chunk 5 afterwards on
seeds 499465 to 499470 and got genuinely new audio, including one at
**HNR 6.56**, better than anything previously in the bank.

**b. "▶ in context" did nothing on exactly the takes he needed.** The
`/audio-context` route matched on `len(parts) == 4` and read the take from
`parts[3]`. A regenerated take is `__extra__/beat_06_....wav`, which splits into
five segments, so it matched nothing and 404ed. Context playback worked on bank
takes and failed silently on every freshly rolled one. Now `>= 4` with the tail
rejoined, matching the sibling `/audio` route.

**c. A swap looked like nothing had happened.** `takeName()` derived its label
from a `_take_NN` pattern that regenerated takes do not have, so all of them fell
through to the same generic label "take". Three rolled takes were
indistinguishable from each other and from what was already there. They are now
labelled by when they were made, for example "new 26 Jul 20:49 #1".

## 9. ElevenLabs for the L1 intro: blocked, not done

David asked for the L1 intro voiced by ElevenLabs as an experiment, since no VV7B
chunk for lesson 1 satisfies him. **It did not run.** All 17 chunks x 2 takes
returned 401 and zero audio was produced.

The cause is a trap worth recording: there are two separate allowances.

| Allowance | State |
|---|---|
| Workspace plan | creator tier, 25 of 131,000 characters used. Healthy. |
| The API key's own quota | **capped at 30 credits, 5 remaining.** Refuses every call. |

The per-key cap is set in the ElevenLabs dashboard and is not readable from any
endpoint, which is why the QC page had been reporting ElevenLabs as "ready" while
nothing could be made. Readiness now checks the plan allowance and remembers a
quota refusal in `completion/voice-qc/elevenlabs_state.json`, so the page states
the real reason. It self-heals on the first successful call.

David's action: raise the quota on the key, then rerun

```bash
cd /home/david/projects/GWTH-launch-plan && set -a && . ~/.elevenlabs.env && set +a && python3 scripts/elevenlabs_takes.py --project l1 --takes 2 --bulk
```

Tracked as bead `gwth-launch-gxm`. Note the standing constraint David set in
`~/.elevenlabs.env` the same day: the connected clone is his OLD, unoptimised one,
kept to prove the flow. Whatever it produces should be judged as a test of the
pipeline, not of how ElevenLabs can sound.

## 10. Making the ElevenLabs path clear (David: "the UI is not clear on how to do this")

- The panel used to render **nothing at all** for a chunk with no ElevenLabs
  takes. It now always states what is there and what to do about it.
- The only route to new takes was buried under "Something wrong with this chunk?"
  and refused to proceed until a reason was ticked. There is now a direct
  **"Get 3 ElevenLabs takes of this chunk"** button; the reasons moved into an
  optional "Tell it what was wrong first" disclosure that still shapes the voice
  settings when used.
- The panel shows the per-chunk cost before spending, and when unavailable it
  gives the actual reason rather than a disabled control.
- The VV7B view now carries a **"Try this chunk with ElevenLabs"** link, so the
  option is reachable where the frustration happens instead of only from the
  engine dropdown at the top of the page.

## What to verify (3 bullets)

- **Chunks 5 and 7 sound better to your ear, not just on the meter.** Play them
  "in context" so you hear the join into and out of the swapped chunk. The meter
  says take_01 and take_04 are the wins; your ear decides.
- **The £29 line.** Listen to chunk 6's alternates and confirm the shipped take is
  still the one that says the price correctly. If none of them are right, chunk 6
  stays as it is.
- **The ending does not sag.** If you pick take_03 for chunk 7, expect about 1.8s
  more silence before the video ends. take_02 and take_04 do not have this.
