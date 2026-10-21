# Model Lab copy for the writing check

Every visible string that is new or changed on branch `model-lab-labs` (bead gwth-launch-m3rw.6).
Braces mark values filled in from the data. 'preview: same' means the string is ported word for word
from the Model Lab preview David reviewed (model-bakeoff `lab/site/template.html`); those have had a
Sol pass already except where noted, but they are new on gwth.ai, so they are listed. Line numbers
are in this worktree. Model-written answers are quoted verbatim and are NOT for the writing check.

## 1. Website strings

| Page | Component | File:line | Old | New |
|---|---|---|---|---|
| /labs (index) | metadata title | src/app/(public)/labs/page.tsx:20 | Free AI labs | Free AI labs (unchanged) |
| /labs (index) | metadata description | src/app/(public)/labs/page.tsx:22 | Head-to-head AI labs: two tools do the same real UK work task, with both answers side by side, a checklist to judge them by and a dated verdict. Free to open, no card required. | Every new AI model on the same real UK work tasks, in six labs: research, writing, thinking, building, data and automation. Marked by computer checks and AI judges, with the best pick, the best value and the cost of each. Free, no card required. |
| /labs (index) | H1 | src/components/marketing/labs-fde/labs-fde.tsx:140 | Two tools, one task. *You judge.* | Which AI should you use? *We test them to find out.* (italic part in the accent) |
| /labs (index) | standfirst 1 | src/components/marketing/labs-fde/labs-fde.tsx:143 | Each lab gives two AI tools the same instructions for a realistic work task, then shows you both answers side by side. A short checklist of what a good answer should include helps you decide which is better. Lessons teach you how to use AI; labs help you choose which tool to use for a job. | Every new AI model gets the same real UK work tasks, in six labs: research, writing, thinking a problem through, building a tool, spreadsheets and data, and acting for you. Computer checks and AI judges mark every answer. No AI company pays us. |
| /labs (index) | standfirst 2 | src/components/marketing/labs-fde/labs-fde.tsx:148 | The tasks are set in UK workplaces, so you see how each tool handles UK rules and sources. One lab asks each tool to rewrite a job advert for a nursing vacancy at a Shropshire care home. Another, tested in July 2026, asks for the Statutory Sick Pay rate, with a GOV.UK source for the figure. | Each lab names the best model and the best value, lets you read four answers with the names hidden and choose your own, and lists every model's marks and costs. Tested {October 2026}. (month from the data) |
| /labs (index) | button | src/components/marketing/labs-fde/labs-fde.tsx:154 | Open the live lab | See the six labs |
| /labs (index) | button | src/components/marketing/labs-fde/labs-fde.tsx:157 | See the course | See the course (unchanged) |
| /labs (index) | metadata row | src/components/marketing/labs-fde/labs-fde.tsx:161 | Dated head-to-head tests | Tested {2 to 21 October 2026} |
| /labs (index) | metadata row | src/components/marketing/labs-fde/labs-fde.tsx:163 | (none) | {21} models, {34} set-ups |
| /labs (index) | metadata row | src/components/marketing/labs-fde/labs-fde.tsx:165 | Free, no card required | Free, no card required (unchanged) |
| /labs (index) | section head | src/components/marketing/labs-fde/labs-fde.tsx:172 | (three explainer items, no head) | How we test |
| /labs (index) | How we test 1 title | src/components/marketing/labs-fde/labs-fde.tsx:25 | One task, two tools. | Real tasks, each with a trap. |
| /labs (index) | How we test 1 body | src/components/marketing/labs-fde/labs-fde.tsx:26 | Two AI tools get exactly the same instructions for a realistic work task. | Four to six tasks a lab, based on real UK work. Each hides a trap a careful person would catch, such as an out-of-date figure or a false legal claim. |
| /labs (index) | How we test 2 title | src/components/marketing/labs-fde/labs-fde.tsx:29 | Compare both answers. | Marked two ways. |
| /labs (index) | How we test 2 body | src/components/marketing/labs-fde/labs-fde.tsx:30 | The answers sit side by side with a checklist a beginner can follow, and a verdict that names the models and the date. | Computer checks mark what can be checked exactly, such as figures and dates. AI judges mark the rest against a written guide, and no judge marks its own company's work. |
| /labs (index) | How we test 3 title | src/components/marketing/labs-fde/labs-fde.tsx:33 | Every lab is dated. | Checked by a person. |
| /labs (index) | How we test 3 body | src/components/marketing/labs-fde/labs-fde.tsx:34 | Each lab names the models it tested and the date. The tools change often, so the answers you get today may differ. | A person at GWTH checked a sample of the marks by reading the answers side by side. Each set-up did each task once. |
| /labs (index) | section head | src/components/marketing/labs-fde/labs-fde.tsx:189 | Live now. | The six labs. |
| /labs (index) | section lead | src/components/marketing/labs-fde/labs-fde.tsx:192 | Start with the task that is closest to your own work. | Start with the kind of work that is closest to your own. |
| /labs (index) | empty state | src/components/marketing/labs-fde/labs-fde.tsx:196 | No live labs right now. / The next matchups are being tested. They will appear here when they are ready. | No labs right now. / The next round of tests is running. The labs will appear here when it is done. |
| /labs (index) | card | src/components/marketing/labs-fde/labs-fde.tsx:204 | (card per Arena lab: task cue, title, matchup, outcome, Live now, Tested {date}) | Card link name: {Research} lab: {headline}. Card: {Research} / {headline} / Best: {name}, {level} thinking. {94} out of 100, about {38p} a task. / Best value: (same) / {34} set-ups · Main task: {sig_title} |
| /labs (index) | card pick labels | src/components/marketing/labs-fde/labs-fde.tsx:212 | (none) | Best / Best value |
| /labs (index) | cost chart title | src/components/marketing/labs-fde/labs-fde.tsx:63 | (new) | What it cost to run all {25} tasks, and the score each set-up got |
| /labs (index) | cost chart column heads | src/components/marketing/labs-fde/labs-fde.tsx:67 | (new) | Set-up / Cost of every task, at list price / Score |
| /labs (index) | cost chart row | src/components/marketing/labs-fde/labs-fde.tsx:82 | (new) | {Claude Opus 5.5}, {max thinking}; small line: premium / ran {24} of {25} tasks (joined with ·); screen-reader text: Cost: {£67.73}, Average score: {94} |
| /labs (index) | cost chart note | src/components/marketing/labs-fde/labs-fde.tsx:111 | (new) | The bar is the cost of running every task once at each company's published API prices, converted at 75p to the dollar. The number on the right is the average score out of 100 across the six labs. Each set-up ran each task once, so a gap of one or two points is noise. |
| /labs (index) | closing H2 | src/components/marketing/labs-fde/labs-fde.tsx:237 | Labs show you which tool. *The course shows you how.* | Labs show you which AI. *The course shows you how.* |
| /labs (index) | closing body | src/components/marketing/labs-fde/labs-fde.tsx:240 | Each lab shows which tool did better on one task, and the date it was tested. Over three months, ... | Each lab shows which AI did best on real work tasks, what it cost and when we tested it. Over three months, the course shows you, in plain English, how to build a household helper, a simple website and a tool that does a weekly task for you. You practise what you learn through projects you do yourself. (second and third sentences unchanged) |
| /labs/<lab> (all six) | metadata title | src/app/(public)/labs/[slug]/page.tsx:24 | (Arena title) | {headline} |
| /labs/<lab> (all six) | metadata description | src/app/(public)/labs/[slug]/page.tsx:25 | {A} vs {B} on one real task, tested on {date}. Both answers side by side, a checklist to judge them by and a dated verdict. | {34} AI set-ups did the same {four} real {thinking} tasks, marked by computer checks and AI judges. Read four answers with the names hidden and choose yours. Tested {2 to 21 October 2026}. |
| /labs/<lab> (all six) | lab menu (aria-label) | src/components/lab/model-lab/lab-page.tsx:103 | (new) | The six labs (menu items: Research, Content, Thinking, Building, Data, Automation) |
| /labs/<lab> (all six) | hero lead | src/components/lab/model-lab/lab-page.tsx:119 | preview: same | We gave {34} AI set-ups the same {four} real {thinking} tasks and marked every answer. No AI company pays us, and you can read every answer to the main task below. |
| /labs/<lab> (all six) | hero meta | src/components/lab/model-lab/lab-page.tsx:123 | preview: {Thinking} · round 1 (kicker above the H1, dropped) | Tested {2 to 21 October 2026} (under the lead) |
| /labs/<lab> (all six) | section head | src/components/lab/model-lab/lab-page.tsx:127 | preview: same | Our picks |
| /labs/<lab> (all six) | pick labels | src/components/lab/model-lab/lab-page.tsx:130 | preview: same | Best / Best value / Daily driver in an everyday app / Best for free / None yet |
| /labs/<lab> (all six) | pick meta | src/components/lab/model-lab/lab-page.tsx:38 | preview: same | Scored {N} out of 100 · about {cost} a task · Passed every trap \| ✗ Fell for {n} of {m} traps; app: Scored {N} out of 100 · in {plan}, {price}; free: Scored {N} out of 100 · in {plan}. {allowance} |
| /labs/<lab> (all six) | picks explanation | src/components/lab/model-lab/lab-page.tsx:163 | preview: same | Best value is the cheapest set-up that scored within 10% of the best and passed every trap. The daily driver is the cheapest to run of the set-ups you can choose in an app costing £20 a month or less that scored within 10% of the best and passed every trap. Set-ups that cost less to run usually use up an app's allowance more slowly. Best for free is the highest-scoring set-up you can use in a free app that passed every trap. We checked what each plan includes between 6 and 8 October 2026. |
| /labs/<lab> (all six) | Which would you use intro | src/components/lab/model-lab/lab-page.tsx:175 | preview: same | {sig_plain} Here are four real answers, with the names hidden. Read them, choose the one you would use, then see who wrote it and how we marked it. |
| /labs/<lab> (all six) | details summary | src/components/lab/model-lab/lab-page.tsx:179 | preview: same | Read the brief every model was given |
| /labs/<lab> (all six) | answer card | src/components/lab/model-lab/which-would-you-use.tsx:164 | preview: same | Answer {A}; region label Answer {A}; Your choice; No answer was produced. |
| /labs/<lab> (all six) | answer files | src/components/lab/model-lab/which-would-you-use.tsx:123 | preview: same | Read the {board note} (visual labs); link Try it / Open full size; alt {Answer A}: screenshot / {Answer A}: chart |
| /labs/<lab> (all six) | pick button | src/components/lab/model-lab/which-would-you-use.tsx:183 | preview: same | I would use answer {A} |
| /labs/<lab> (all six) | reveal | src/components/lab/model-lab/which-would-you-use.tsx:189 | preview: same plus 'Visitors who chose it: N%' (dropped, votes out of scope) | {name}, {level} thinking / Our mark: {N} out of 100 · about {cost} · Passed the trap \| ✗ Fell for the trap |
| /labs/<lab> (all six) | result line | src/components/lab/model-lab/which-would-you-use.tsx:225 | preview: same plus visitor-vote sentence (dropped) | You chose answer {B}, by {name}. Our marks put it {fourth} of these four. The highest marked was answer {A}, by {name}. (or ends 'of these four.' when first) |
| /labs/<lab> (all six) | section head + lead | src/components/lab/model-lab/lab-page.tsx:190 | preview: same | Every set-up we tested / The same models appear more than once because each can be set to think for longer, which costs more. The score is the average of the {four} tasks. |
| /labs/<lab> (all six) | table heads | src/components/lab/model-lab/lab-page.tsx:222 | preview: same | # / Model and setting / Score / {task titles} (main task) / Traps missed / Cost a task / Where you can use it / (screen reader) Answer to the main task; region label: Every set-up we tested, with its marks |
| /labs/<lab> (all six) | table cells | src/components/lab/model-lab/lab-page.tsx:268 | preview: same | ✓ None / ✗ {N} missed / - (not marked); level line {medium thinking} · {maker} |
| /labs/<lab> (all six) | row button | src/components/lab/model-lab/setup-row.tsx:71 | preview: same | Answer / Hide (+ screen reader: from {name}, {level}) |
| /labs/<lab> (all six) | row loading | src/components/lab/model-lab/setup-row.tsx:104 | preview: Loading… | Loading the answer. / The answer could not be loaded. Try again in a moment. / No answer was produced. |
| /labs/<lab> (all six) | table note | src/components/lab/model-lab/lab-page.tsx:281 | preview: same | "Answer" shows that set-up's answer to the main task above. (+ A dash means that task has not been marked yet; until it is, the score averages the tasks marked so far.) |
| /labs/<lab> (all six) | premium table | src/components/lab/model-lab/lab-page.tsx:326 | preview: same | Model and setting / Score / Cost a task; {level} · {maker} · premium; {level} · {maker} · our best pick for this lab; The main task only: {sig_title} / Cost of this task |
| /labs/<lab> (all six) | premium Fable sentence (Data) | src/components/lab/model-lab/lab-page.tsx:66 | preview: same | We tested Claude Fable on every task in this lab except the flipchart photos, which we added later. |
| /labs/<lab> (all six) | How we test bullets | src/lib/model-lab-format.ts:71 | preview: same | (the four bullets, see Data section below) |
| /labs/<lab> (all six) | footnote | src/components/lab/model-lab/lab-page.tsx:382 | preview: Round 1, tested 2 to 4 October 2026. Each set-up did each task once. Costs are what one task would cost at each company's published API prices, converted at 75p to the dollar. | Tested {2 to 21 October 2026}. Each set-up did each task once. Costs are what one task would cost at each company's published API prices, converted at 75p to the dollar. |
| /labs/<lab> (all six) | not-found page | src/app/(public)/labs/[slug]/not-found.tsx:14 | unchanged | Page not found / We couldn't find that lab / This lab doesn't exist or has been removed. / Browse labs (unchanged) |
| /pricing | free tier card bullets | src/components/marketing/data.ts:388 | Every free lab, no card required | All six free labs, no card required |
| /pricing | free tier card bullets | src/components/marketing/data.ts:389 | Side-by-side comparisons of the newest AI tools on one real task | Every new AI model tested on the same real work tasks |
| /pricing | free tier card bullets | src/components/marketing/data.ts:390 | New labs as new tools launch | Re-tested when new models come out |
| /pricing | comparison row | src/components/marketing/pricing-fde/pricing-fde.tsx:92 | Free labs | The six free labs |
| /pricing | compare section lead | src/components/marketing/pricing-fde/pricing-fde.tsx:451 | The free labs compare the newest AI tools on one real task. Member is the course itself, with its lessons and projects. Teams adds a view of progress for managers. | The free labs test every new AI model on the same real work tasks and show which one to use. Member is the course itself, with its lessons and projects. Teams adds a view of progress for managers. |
| /dashboard (free learner) | band lead | src/app/(dashboard)/dashboard/page.tsx:720 | You have access to all 18 free labs. | You have access to the six free labs. |
| /dashboard (free learner) | section title | src/app/(dashboard)/dashboard/page.tsx:790 | 18 public labs. *Use them tonight.* | Six free labs. *Which AI for which job.* |
| /dashboard (free learner) | lab rows | src/app/(dashboard)/dashboard/page.tsx:802 | Resume rewriter for non-tech roles / Job search / 40 min (and four more hard-coded rows) | {Research} / {Which AI is best at research?} / {34} set-ups / OPEN → (aria-label: Open the {Research} lab), one row per lab |
| /dashboard (free learner) | table foot | src/app/(dashboard)/dashboard/page.tsx:807 | + 13 more / Browse all 18 | Every new AI model, the same real tasks / See all six labs |
| /dashboard (free learner) | big stat | src/app/(dashboard)/dashboard/page.tsx:821 | 18 free labs | 6 free labs |
| Cmd+K search palette | Labs group entries | src/lib/data/search-index.ts:117 | (the 23 retired practise lab titles) | {Research} lab: {Which AI is best at research?} (one per lab) |
| Breadcrumb (dashboard shell) | lab crumb | src/components/layout/breadcrumb-nav.tsx:66 | {Job Advert Claude Vs Chatgpt} (slug title-cased) | {Thinking} lab |

## 2. Lab page text that comes from the data

Generated by model-bakeoff `lab/site/export_gwth.py` from `lab/site/build_site.py` (HEADLINE, ASK,
where/plan wording), the suite's `meta.yaml` (task titles, plain_english) and `lab/site/premium_note.md`.
Fix wording at that source and re-export; the JSON in `src/lib/data/model-lab/` is not hand-edited.

### Research (`src/lib/data/model-lab/research.json`)

- Headline (H1, page title, card, search): Which AI is best at research?
- Question (Which would you use? H2): Which fact-check would you trust?
- Main task title: Fact-check the CEO
- Main task plain English: Check fifteen claims in a chief executive's all-staff email against the company's own records before it goes to 1,200 people, and fix the ones that are wrong.
- Task titles (table heads): The cash ISA shortlist / Fact-check the CEO / The grant finder / The scrutiny briefing
- Daily driver plan line: in Claude Pro, £20 a month
- Best for free plan line: in Claude Free. Resets every 5 hours. Claude does not publish a number of messages, and it stops at the limit rather than switching to a weaker model.
- Astra sentence: We ran GPT-6 Astra on one task only, in the Thinking lab, to compare its cost.

### Content (`src/lib/data/model-lab/content.json`)

- Headline (H1, page title, card, search): Which AI makes the best content?
- Question (Which would you use? H2): Which post would you publish?
- Main task title: The bakery post
- Main task plain English: Write a small bakery's announcement in the owner's own voice, and leave out a false legal claim that a friend asked her to include.
- Task titles (table heads): The bakery post / The flexible working email / The angry customer / The job advert
- Daily driver plan line: in ChatGPT Plus, in the desktop app, £19.99 a month
- Best for free plan line: in Claude Free. Resets every 5 hours. Claude does not publish a number of messages, and it stops at the limit rather than switching to a weaker model.
- Astra sentence: We ran GPT-6 Astra on one task only, in the Thinking lab, to compare its cost.

### Thinking (`src/lib/data/model-lab/thinking.json`)

- Headline (H1, page title, card, search): Which AI is best at thinking a problem through?
- Question (Which would you use? H2): Which plan would you take to the board?
- Main task title: The four-day week pilot
- Main task plain English: A kitchen company's boss wants to trial a four-day week. Can the plan keep the showroom open on Saturdays, and does the staff survey really show everyone wants it? Play along before the reveal.
- Task titles (table heads): Should Sam retrain? / The four-day week pilot / The Monday questions / Hire, don't fire
- Daily driver plan line: in ChatGPT Plus, in the desktop app, £19.99 a month
- Best for free plan line: in Meta AI. Meta does not publish a number of messages for the free tier.
- Astra sentence: We ran GPT-6 Astra on this lab's main task only, to compare its cost with GPT-6.1 Sol.

### Building (`src/lib/data/model-lab/building.json`)

- Headline (H1, page title, card, search): Which AI builds the best working tool?
- Question (Which would you use? H2): Which coach would you use?
- Main task title: The pronunciation coach
- Main task plain English: Build a page where you pick a Spanish or French phrase, hear it, record yourself saying it, and see every word coloured green, amber or red with a score out of 100.
- Task titles (table heads): The dinner planner assistant / The pronunciation coach / The presentation rehearsal coach / Meeting recording to action plan
- Daily driver plan line: in ChatGPT Plus, in the desktop app, £19.99 a month
- Best for free plan line: in Claude Free. Resets every 5 hours. Claude does not publish a number of messages, and it stops at the limit rather than switching to a weaker model.
- Astra sentence: We ran GPT-6 Astra on one task only, in the Thinking lab, to compare its cost.

### Data (`src/lib/data/model-lab/data.json`)

- Headline (H1, page title, card, search): Which AI is best with spreadsheets and data?
- Question (Which would you use? H2): Which report would you send to the board?
- Main task title: The gender pay gap report
- Main task plain English: Work out a care company's legally required gender pay gap figures from messy HR and payroll exports, and tell the board whether it has to publish.
- Task titles (table heads): Where is my money going? / The Bradford Factor / The expenses and VAT check / The gender pay gap report / The flipchart photos
- Daily driver plan line: in ChatGPT Plus, in the desktop app, £19.99 a month
- Best for free plan line: in Meta AI. Meta does not publish a number of messages for the free tier.
- Astra sentence: We ran GPT-6 Astra on one task only, in the Thinking lab, to compare its cost.

### Automation (`src/lib/data/model-lab/automation.json`)

- Headline (H1, page title, card, search): Which AI can you trust to act for you?
- Question (Which would you use? H2): Whose week would you trust?
- Main task title: Clear my week
- Main task plain English: Hannah is back from leave. Can the AI clear her inbox, book her meetings, pay her bills and chase late payers, and stop to ask before it does anything risky?
- Task titles (table heads): The invoice sheet / Clear my week / Month-end payments / The new starter
- Daily driver plan line: in ChatGPT Plus, in the desktop app, £19.99 a month
- Best for free plan line: in Meta AI. Meta does not publish a number of messages for the free tier.
- Astra sentence: We ran GPT-6 Astra on one task only, in the Thinking lab, to compare its cost.

### 'Where you can use it' values (all labs)

- ChatGPT Free, in the desktop app (free), ChatGPT Plus, in the desktop app
- ChatGPT Plus, in the desktop app
- Claude Free (free), Claude Pro
- Claude Pro
- Gemini (free), Google AI Plus, Google AI Pro
- Google AI Plus, Google AI Pro
- Google AI Pro
- Grok (free)
- Meta AI (free)
- Only through the developer API

### The main-task brief

Each lab's `sig_task` ("Read the brief every model was given") is the prompt the models were given,
shown verbatim as test material. It is listed for completeness but should not be rewritten: changing it
would misstate what the models saw.

### Premium note (same on every lab, `lab/site/premium_note.md`)

Title: The premium models: Claude Fable and GPT-6 Astra

Before the cost box:

Claude Fable costs two and a half times as much as Claude Opus to use, and GPT-6 Astra costs five times as much as GPT-6.1 Sol.

We tested Claude Fable on every task. It didn't score higher than the usual top models, and it cost much more:

After the cost box:

### Why we don't recommend them

The personal versions of Claude and ChatGPT keep your chats, whichever model you choose. Some business services can be set up so the provider does not keep the data you send. A business account alone does not guarantee this.

Claude Fable has an extra requirement. Anthropic says: "Using Fable requires 30-day data retention for safety monitoring by default." That applies to business accounts too. Some eligible organisations can turn this retention off for a limited time. Fable has no option for processing data in the UK or EU.

Some providers make Fable optional. Harvey, which makes AI tools for law firms, says: "We are making this model available as an opt-in option vs. by default." Cursor, a popular coding tool, says Fable "is off by default in every Team that has Cursor Privacy Mode enabled and for every Enterprise customer". Jennifer Ellis, a lawyer who writes about legal technology, advises: "Don't use it if you have concerns about data retention or your firm has AI use policies against allowing data to be retained by outside tools."

So keep personal details, staff and customer records, unreleased figures, business plans and confidential findings out of Claude Fable. Check your organisation's AI policy before using it for work at all.

GPT-6 Astra has the same data retention rules as other OpenAI models. By default, OpenAI keeps records of use for up to 30 days to monitor misuse. Eligible customers can arrange for their data not to be kept in those records. Our reason for not recommending Astra is cost: it costs five times as much as GPT-6.1 Sol, and we haven't tested whether it gives better results.

### When a premium model is fine to use

If you need a lot of power for a long or difficult job, and none of the information is private or sensitive, a premium model is fine to use. Examples include researching a public topic in depth, working through published documents or completing a long coding task using code that isn't confidential. For Fable, Stephen Smith, who trains law firms to use AI, suggests asking: "can this engagement tolerate 30-day retention by the model provider? For a lot of work, the answer is yes. For some matters, it won't be."

For everyday work, start with a usual top model. Compare a premium model only if the results don't meet your needs.

Sources, checked 20 October 2026: Anthropic, Claude Fable page (anthropic.com/claude/fable); OpenAI, GPT-6 Astra announcement and API data controls; Harvey blog, "Fable 5.1 in Harvey", 1 September 2026; Cursor documentation for Claude Fable 5.1; Jennifer Ellis, jlellis.net, 10 June 2026; Stephen Smith, smithstephen.com, 9 June 2026.

### How we test (lab pages, `src/lib/model-lab-format.ts`, word for word from the preview)

- We wrote four to six tasks for each superpower, based on real work, such as a small business post, a staff absence report or a week of emails to sort out.
- Each task hides a trap that a careful person would catch, such as an out-of-date figure or a false legal claim. Falling for it is shown in red, whatever the score.
- Computer checks mark what can be checked exactly, such as figures and dates. AI judges mark the rest against a written guide, and no judge marks its own company's work: Claude marks OpenAI's answers, GPT marks Anthropic's, and both mark everyone else's.
- A person at GWTH checked a sample of the marks by reading the answers to each task side by side.

## 3. Not changed, but now describe the new labs

- 'Try a free lab' buttons (home, hero, newsletter, lessons, pricing, final CTA) still go to /labs.
- 'Free labs' badge on the pricing card, nav and footer 'Labs' links, dashboard 'Free labs' kicker: unchanged.
- `/redesign/*` and `/old-design` pages: untouched, as the brief says.
