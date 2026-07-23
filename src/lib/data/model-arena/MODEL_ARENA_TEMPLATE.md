# Model Arena lab template

The reusable content format for GWTH labs, decided by David on 2026-07-22
(`GWTH-launch-plan/docs/cipd-demo-2026-07-27.md`). This document is the
authoring guide: read it once, then produce a lab by filling in the schema in
`model-arena.schema.json` and writing the student-read markdown the same way as
`lab-01-job-advert-claude-vs-chatgpt.md`.

## What a Model Arena lab is

One realistic task. Two AI models or tools. The same prompt to both. Their
outputs shown side by side. A short rubric a beginner can score. A dated
verdict. That is the whole format.

Labs used to be tiered exercises (beginner, intermediate, advanced). They
overlapped the lessons and read as either too easy or too hard, so people
sampled a lab, misjudged the course, and did not sign up. The Model Arena
format fixes that: lessons teach you how, labs show you which tool when.

## Why labs are deliberately perishable

- Each lab is dated and pinned to exact model versions. When the models change,
  the lab goes out of date. That is the point, not a flaw.
- Only about six labs are live at once. They rotate. People come back to see
  the rematch.
- Old labs are never deleted. They become the archive, which gets more valuable
  over time: you can compare a model today against the same model three
  versions ago and see how fast the tools are moving.

## The eight parts of every lab

Fill each one. The field names in brackets match `model-arena.schema.json`.

1. **Title** (`title`). Plain and specific: the task, then the matchup. For
   example, "Write a job advert: Claude vs ChatGPT".

2. **The matchup** (`matchup`). Both contestants named with their exact
   versions and how they were run, so the test can be reproduced and so a
   reader knows what is being compared. Record the model id, the friendly
   product name, and the date tested. Never round a version off.

3. **The task brief** (`brief`). The realistic situation, written for the
   student in plain English: who they are pretending to be, what they are
   trying to do, and why the task is worth doing. One paragraph.

4. **The shared prompt** (`prompt`). The single prompt, word for word, that was
   given to both models. It must be identical for both. Show it in full so the
   student can run it themselves.

5. **Both outputs, verbatim** (`outputs`). Each model's real answer, quoted
   exactly as it came out, including that model's own spelling, punctuation and
   formatting. Never tidy, trim or paraphrase an output. Never invent one. If a
   model produced something awkward, that is evidence, so leave it in. Label
   each output with the model that produced it.

6. **The comparison rubric** (`rubric`). Four to six criteria a beginner can
   judge by reading, no expertise required. Each criterion is a plain question
   with a short note on what a good answer looks like. The student scores each
   output against each criterion themselves. Keep the criteria concrete: "Is it
   honest about the hard parts of the job?" beats "Assess quality".

7. **The verdict** (`verdict`). An honest call, with the reasons, and the date
   it was tested on. Say which output you would use and why, and be fair to the
   loser. If it is close, say it is close. Never rig the result for either
   model. Then a one-line freshness note: models change often, so this verdict
   is only true for the versions and date above, and the archived version shows
   how the tools compared at this point in time.

8. **Try it yourself** (`tryItYourself`). Short numbered steps so the student
   runs the same task with their own example and forms their own view. Point
   them at the free consumer apps (claude.ai, chatgpt.com), give them a task to
   adapt, and tell them to score both outputs on the same rubric.

## House rules (binding, from bible/bible.yaml)

- British English throughout. No em dashes, no en dashes, no section signs in
  authored prose. The one exception is inside a verbatim model output: quote it
  exactly as produced, even if the model itself used an em dash or American
  spelling, because changing it would break the "verbatim" promise. Frame those
  outputs clearly as raw, quoted answers so the reader knows the punctuation is
  the model's, not ours.
- Warm, honest, plain English. No hype words (supercharge, game changer, 10x,
  leverage, let's dive in). No scare tactics. One idea per sentence.
- Prices in GBP only. Never say "free trial"; it is "free labs".
- Every output must be a real generation with its model version and test date
  stated. No fabricated or illustrative outputs, ever.

## How to produce a rotating lab (the repeatable recipe)

1. Pick one realistic task with a clear "which tool is better here" question. HR,
   admin, writing, planning and research tasks all work well for beginners.
2. Write one shared prompt. Give the identical prompt to both contestants.
   Generate the Claude side from a current Claude model; generate the other side
   from the other tool (for example ChatGPT via the Codex CLI, or the consumer
   app). Capture each output verbatim and note the exact model id and date.
3. Fill the schema, write the student-read markdown, run the tone gate
   (`GWTH-launch-plan/scripts/tone_gate.sh`) on the student file, then stage it
   for the site to pick up.
4. When a newer model lands, re-run the same prompt, publish the rematch as a
   fresh dated lab, and move the previous one to the archive. Keep about six
   live.

## Files in this folder

- `MODEL_ARENA_TEMPLATE.md` — this guide.
- `model-arena.schema.json` — the machine-readable content schema.
- `lab-01-job-advert-claude-vs-chatgpt.json` — the pilot lab as structured data.
- `lab-01-job-advert-claude-vs-chatgpt.md` — the pilot lab as a student reads it
  (the file the tone gate reviews).
- `README.md` — staging note for the W22 site rework.
