# Capstone hand-in fixtures

Test hand-ins with a known intended mark, one folder per case, for the three
capstones GWTH marks (bead gwth-launch-9289.9). They feed the two-judge runner
(bead 9289.5) and the agreement test (bead 9289.8), and are the only hand-ins
used for building and prompt work on David's subscription. Every person,
household and company in them is made up: the lessons' example household (the
Patel-Brown family) and companies (Riverside Plumbing Ltd, Hill Top Bakery Ltd),
the fictional Southbridge Community Trust, and a few invented names. There is no
real personal data, and the one API key is fake.

## Two kinds of case

- **Planted** (5 per capstone): a deliberate problem a judge must catch. Most
  break one basics line, which makes the band Not yet whatever the total; the
  rest sit within 3 points of a band line, so they test the borderline routing
  to David.
- **Made-up** (6 or 7 per capstone): ordinary pieces spread across all four
  bands, with every basics line met except where the table says otherwise.

Between them, every basics line of every capstone is broken in at least one
case, and every band appears in the made-up set.

## Layout

```
handins/<capstone>/<case-id>/
  files/         what the learner handed in, as the hand-in store holds it
  answers.json   the four written answers: { built, checked, fixed, next }
  case.json      the intended mark (below)
```

`case.json`:

```
{ capstone, kind: "planted" | "made-up",
  intended_band: "not_yet" | "pass" | "good" | "excellent",
  intended_total,                      // out of 100
  criteria: [{ id, level }],           // ids from the capstone's marking_guide.json
  basics:   [{ id, met }],
  planted_problem: string | null,      // null for made-up cases
  why }                                // why this band, in a sentence or two
```

The total is the marking guide's: each criterion's points times its level (Not
yet 0, Pass half, Good three quarters, Excellent full). Bands: under 40 Not yet,
40 Pass, 60 Good, 80 Excellent. Any basics line not met makes the band Not yet.
`load-fixtures.test.ts` checks every case against this and against the live
marking guides (found the same way `guide-loader.ts` finds them; the guide part
is skipped where the guides are not on disk, such as CI).

## File conventions

- `name.ts.fixture` is the learner's `name.ts`. The suffix only stops the site's
  own type check and lint from compiling Month 2 and 3 code; the loader drops it.
- `name.pdf.txt` is the text of the learner's `name.pdf`, pages split by a form
  feed, exactly as the hand-in stores a PDF after pulling its text out. The
  loader gives `path` as stored and `originalPath` as the learner's name.
- Screenshots are small PNG mock-ups (a task, a calendar event, a cited answer),
  so the screenshot checks see a picture file. Identical pictures are shared
  across cases and stored once by git.
- Month 2 code is the unpacked repo (what a zip becomes after `fromZip`).

## Using them

```ts
import {
  loadFixtures,
  loadFixture,
} from "@/lib/capstones/fixtures/load-fixtures";

const all = await loadFixtures(); // every case
const m1 = await loadFixtures({ capstone: "familybot" });
const planted = await loadFixtures({ kind: "planted" });
const one = await loadFixture("askmyco", "p01-api-key-in-code");
// -> { capstone, caseId, files: [{ path, originalPath, bytes }], answers, meta }
```

Server and test only (it reads from disk). `CAPSTONE_FIXTURES_DIR` points it at
another folder. To change a case, edit its files and `case.json` by hand; the
test catches a total or band that no longer agrees with the levels.

## The cases

### Month 1 FamilyBot (`handins/familybot/`)

Household A is the lessons' worked example (the Patel-Brown family, week of Mon
11 May 2026), so consent is met by using the example. Household B is a made-up
"own" household (the Hollis household, week of Mon 12 Oct 2026), where the
consent answers must be in the Blueprint.

| Case                            | Kind    | Band      | Total | Basics not met   | What it tests                                                                                                                                                                     |
| ------------------------------- | ------- | --------- | ----- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `p01-digest-sent-automatically` | planted | Not yet   | 75    | person_sends     | The WhatsApp summary and the digest email went out on a Zapier schedule; the answers say they were not read first.                                                                |
| `p02-invented-details`          | planted | Not yet   | 67.5  | nothing_invented | The brief and digest add details that are not in the voice note (a dentist time and practice, a £5 entry fee, quantities, a pub, a different Friday meal); Uncertain says "None". |
| `p03-no-consent-answers`        | planted | Not yet   | 75    | consent          | Own household; the Blueprint's consent section is blank placeholders, signed by no one.                                                                                           |
| `p04-just-under-pass`           | planted | Not yet   | 37.5  | none             | Borderline under Pass: thin but honest, a WhatsApp summary and no digest email.                                                                                                   |
| `p05-just-under-excellent`      | planted | Good      | 78.75 | none             | Borderline under Excellent: strong brief and digest, one task screenshot in a personal list.                                                                                      |
| `m01-not-yet-thin`              | made-up | Not yet   | 27.5  | none             | Not yet on the total: the brief has only Tasks and Shopping; no screenshots.                                                                                                      |
| `m02-pass-plain`                | made-up | Pass      | 50    | none             | Pass on every criterion.                                                                                                                                                          |
| `m03-pass-good-blueprint`       | made-up | Pass      | 55    | none             | A Good Blueprint, the rest Pass.                                                                                                                                                  |
| `m04-good-all-round`            | made-up | Good      | 75    | none             | Good on every criterion.                                                                                                                                                          |
| `m05-good-own-household`        | made-up | Good      | 73.75 | none             | Own household with consent signed; Excellent transcript notes, one task screenshot.                                                                                               |
| `m06-excellent`                 | made-up | Excellent | 96.25 | none             | Excellent except "Really in their apps" (the event is in a personal calendar).                                                                                                    |
| `m07-private-details`           | made-up | Not yet   | 75    | private          | Good work, but the Blueprint holds the address, NHS, bank and council tax numbers, and the brief names the children in full with their school.                                    |

### Month 2 AskMyCo + FractionalBuddy (`handins/askmyco/`)

| Case                              | Kind    | Band      | Total | Basics not met     | What it tests                                                                                                                       |
| --------------------------------- | ------- | --------- | ----- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `p01-api-key-in-code`             | planted | Not yet   | 75    | no_secrets         | A (fake) Anthropic key pasted into `askmyco/lib/retrieval.ts`.                                                                      |
| `p02-made-up-answer`              | planted | Not yet   | 70    | no_made_up_answers | A question the documents cannot answer gets "double time, £90 per hour" with no citation; the prompt says to use general knowledge. |
| `p03-quality-statement-no-limits` | planted | Not yet   | 71.25 | honest_statement   | Signed and dated, but no "does not yet do" section and claims it "answers every question accurately".                               |
| `p04-two-company-leak`            | planted | Not yet   | 71.25 | data_fenced        | A new `/api/search` route skips the org filter; the student's own test shows a Riverside document to the Hill Top user.             |
| `p05-just-over-pass`              | planted | Pass      | 42.5  | none               | Borderline over Pass: no processing record or subject access export, the rest bare minimum.                                         |
| `m01-not-yet-missing-spec`        | made-up | Not yet   | 32.5  | none               | Not yet on the total: no FractionalBuddy spec, partial governance pack.                                                             |
| `m02-pass-plain`                  | made-up | Pass      | 50    | none               | Pass on every criterion.                                                                                                            |
| `m03-pass-good-citations`         | made-up | Pass      | 55    | none               | Good citations (three questions, right passages), the rest Pass.                                                                    |
| `m04-good-all-round`              | made-up | Good      | 75    | none               | Good on every criterion.                                                                                                            |
| `m05-good-strong-citations`       | made-up | Good      | 76.25 | none               | Excellent citation check (a weak answer explained and fixed), a Pass sprint plan.                                                   |
| `m06-excellent`                   | made-up | Excellent | 96.25 | none               | Excellent except the sprint plan (Good: no reasoned deployment path).                                                               |

### Month 3 askevery.one (`handins/askeveryone/`)

| Case                                 | Kind    | Band      | Total | Basics not met                       | What it tests                                                                                                                                   |
| ------------------------------------ | ------- | --------- | ----- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `p01-evidence-ref-points-at-nothing` | planted | Not yet   | 70    | evidence_behind_claims               | A key finding cites R009; the golden input has only R001 to R008. The student's citation check only tests the ID pattern, so it reports a pass. |
| `p02-no-legal-review-line`           | planted | Not yet   | 75    | no_regulated_advice                  | The risk section and deck never say real deployment needs legal review.                                                                         |
| `p03-consent-not-linked`             | planted | Not yet   | 70    | consent_first                        | `consent_event_id` made optional, one test transcript has none, deletion never tested.                                                          |
| `p04-real-colleague-interviews`      | planted | Not yet   | 75    | consent_first, no_real_personal_data | Three named colleagues from the student's real employer (names invented for the test) added to the input with no consent.                       |
| `p05-borderline-report`              | planted | Good      | 61.25 | none                                 | Borderline over Good: six sections but reading ease far under 50 and two empty stop rules, so the report is Pass.                               |
| `m01-not-yet-no-deck`                | made-up | Not yet   | 22.5  | none                                 | Not yet on the total: a partial report, no deck, no eval results.                                                                               |
| `m02-pass-plain`                     | made-up | Pass      | 50    | none                                 | Pass on every criterion.                                                                                                                        |
| `m03-pass-good-prototype`            | made-up | Pass      | 55    | none                                 | A Good interview prototype, the rest Pass.                                                                                                      |
| `m04-good-all-round`                 | made-up | Good      | 75    | none                                 | Good on every criterion.                                                                                                                        |
| `m05-good-strong-prototype`          | made-up | Good      | 75    | none                                 | Excellent prototype (three interviews, where a colleague got stuck and what changed); eval shows 3 of 5.                                        |
| `m06-excellent`                      | made-up | Excellent | 95    | none                                 | Excellent except the evaluation run (Good: all five pass, no failed-first story).                                                               |

## What the script checks make of them (30 October 2026)

Run against `checks.ts` as it stood on 30 October, the fixtures agree with the
intended marks except for these gaps in the checks or guides, not the cases:

- Month 3: the report check picks `southbridge_deck.md` as the report (it
  matches "southbridge" before "report"), so reading ease and the legal-review
  line are read from the deck.
- Month 3: `evidence_refs_resolve` looks for a file named "golden", but the
  lesson and the guide name it `southbridge_input.json`, so it always says "no
  golden input found".
- Month 2: the guide's subject access export accepts json, csv, zip, md and txt,
  but the lesson's file is `dsar-export.sql`.
- Months 2 and 3: the repo-or-zip line expects a file ending `.zip`, so it fails
  on the unpacked files here; worth checking how a real unpacked zip or GitHub
  hand-in satisfies it.
