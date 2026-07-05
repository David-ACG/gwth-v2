#!/usr/bin/env python3
"""Generate explainer.vtt from the final take's word-level timestamps.

Cue text is authored from the approved fable100 script (proper punctuation,
"GWTH", £ signs); cue windows come from faster-whisper word timings of
vv7b_explainer_fable100_perfect_005.wav (take005_words.json). Word indices
below refer to that JSON's word list — re-run the alignment and re-check them
if the voiceover take ever changes.
"""

import json
from pathlib import Path

WORDS = json.loads(
    Path("/home/david/gwth-dashboard/w12_explainer/take005_words.json").read_text()
)["words"]

# (first word idx, last word idx, caption text)
CUES = [
    (0, 16, "Most people use ChatGPT like a search box.\nType a question, get an answer, move on."),
    (17, 30, "That works, but it barely scratches the surface\nof what these tools can do."),
    (31, 39, "GWTH is an applied AI course for UK adults,"),
    (40, 51, "built to take you from that first prompt\nto serious, useful work."),
    (52, 64, "It runs for three months, about five hours a week,\nin monthly parts."),
    (65, 77, "It starts in plain English. No jargon,\nand no coding needed to begin."),
    (78, 91, "Building comes later, and by the end\nit is the spine of the course."),
    (92, 101, "You do not sit through theory.\nYou build small apps."),
    (102, 109, "You automate the jobs you repeat every week."),
    (110, 120, "You research faster,\nand you make sense of your own data."),
    (121, 131, "Every lesson leaves real work behind,\nevidence you can actually show,"),
    (132, 140, "not a certificate that goes stale in a drawer."),
    (141, 148, "The credential is verifiable, and it stays current."),
    (149, 159, "We are independent. No sponsors,\nno vendor deals, just what works."),
    (160, 169, "You can start free, with real labs and no card."),
    (170, 180, "If it suits you, course access is £29 a month,"),
    (181, 193, "paid a month at a time,\nand you can stop whenever you like."),
    (194, 202, "Here is the promise the whole course rests on."),
    (203, 215, "If you can describe what you want,\nyou can begin to build it."),
    (216, 228, "If that sounds like you,\ncome and take a look at gwth.ai."),
]


def ts(seconds: float) -> str:
    m, s = divmod(max(0.0, seconds), 60)
    return f"00:{int(m):02d}:{s:06.3f}"


lines = [
    "WEBVTT",
    "",
    "NOTE",
    "Captions for the GWTH.ai homepage explainer. Cue windows are word-aligned",
    "to the final voiceover (VV7B fable100 take 005, 93.5s). British English,",
    "no em dashes on screen.",
    "",
]

for n, (a, b, text) in enumerate(CUES, start=1):
    start = WORDS[a]["start"] - 0.1
    end = WORDS[b]["end"] + 0.4
    if n < len(CUES):
        nxt = WORDS[CUES[n][0]]["start"] - 0.1
        end = min(end, nxt - 0.05)
    lines += [str(n), f"{ts(start)} --> {ts(end)}", text, ""]

out = Path(__file__).resolve().parent.parent / "public" / "captions" / "explainer.vtt"
out.write_text("\n".join(lines), encoding="utf-8")
print(f"wrote {out} ({len(CUES)} cues, last ends {ts(WORDS[CUES[-1][1]]['end'] + 0.4)})")
