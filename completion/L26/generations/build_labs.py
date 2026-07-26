#!/usr/bin/env python3
"""Build the Model Arena lab JSON + student markdown from the raw generations.

Both files are produced from the SAME source strings, and the model outputs are
read byte for byte from the captured run files, so the verbatim promise cannot
drift between the two.
"""
from __future__ import annotations

import datetime as dt
import json
import pathlib
import re
import textwrap

ARENA = pathlib.Path(__file__).resolve().parent
DEST = pathlib.Path("/home/david/projects/GWTH_V2/src/lib/data/model-arena")


def read(name: str) -> str:
    return (ARENA / name).read_text().rstrip("\n")


def fence(body: str) -> str:
    """Pick a fence long enough to contain the body's own backtick runs."""
    longest = max((len(m) for m in re.findall(r"`+", body)), default=0)
    return "`" * max(3, longest + 1)


def wrap(text: str, indent: str = "") -> str:
    return textwrap.fill(text, width=79, subsequent_indent=indent)


def long_date(iso: str) -> str:
    date = dt.date.fromisoformat(iso)
    return f"{date.day} {date.strftime('%B')} {date.year}"


LABS = [
    {
        "id": "arena_002",
        "slug": "messy-spreadsheet-claude-vs-chatgpt",
        "format": "model-arena",
        "title": "Make sense of a messy spreadsheet: Claude vs ChatGPT",
        "status": "live",
        "category": "Data",
        "testedOn": "2026-07-26",
        "brief": (
            "You are the office manager at a small community centre in Leeds. Once a month you export "
            "the volunteer sign-in log, and this month's export is a mess: three different date formats, "
            "one volunteer's name spelled two ways, hours logged as \"7:30\", \"half day\" and \"N/A\", a row "
            "that says 40 hours and appears twice, and a total at the bottom that does not add up. The "
            "trustees meet next week and they want two numbers. You give the same export to two AI tools "
            "and see which one gets you to a figure you could defend."
        ),
        "taskProse": (
            "You are the office manager at a small community centre in Leeds. Volunteers sign in and out "
            "on a tablet, and once a month you export the log. This month's export is a mess. Dates come "
            "in three formats. One volunteer appears twice under two spellings. Hours are logged as "
            "\"7:30\", \"half day\" and \"N/A\". One row says 40 hours and appears twice. The total at the "
            "bottom does not match anything. Your trustees meet next week and want two numbers: total "
            "volunteer hours for April, and the top three volunteers. You hand the export to two AI tools "
            "and see which one gets you to a figure you could defend."
        ),
        "matchup": [
            {
                "name": "Claude",
                "modelId": "claude-opus-5",
                "modelLabel": "Claude Opus 5",
                "howRun": "Generated directly from Claude Opus 5 on 2026-07-26, with no web search and no other tools. The prompt was the only input.",
                "mdLine": "Claude Opus 5, run on 26 July 2026 with no web search and no other tools.",
            },
            {
                "name": "ChatGPT",
                "modelId": "gpt-5.6-sol",
                "modelLabel": "OpenAI GPT-5.6",
                "howRun": "Generated via the Codex CLI 0.144.1 on 2026-07-26, set to its most careful answer mode, which OpenAI calls high reasoning effort. Web search was available to it but it made no searches for this task. The consumer ChatGPT app uses the same GPT-5.6 family.",
                "mdLine": "OpenAI GPT-5.6 (model id gpt-5.6-sol), run on 26 July 2026 in its most careful answer mode. Search was available but it made none.",
            },
        ],
        "promptFile": "prompt-02-spreadsheet.txt",
        "outputFiles": [("Claude", "out-02-claude.txt"), ("ChatGPT", "out-02-chatgpt.txt")],
        "rubric": [
            {
                "criterion": "Does it give you a number you could actually put in front of the trustees?",
                "goodLooksLike": "A clear figure, with the assumptions behind it stated so you can argue with them.",
            },
            {
                "criterion": "Did it spot the rows that cannot be trusted?",
                "goodLooksLike": "It names the 40 hour rows, the blank, the \"N/A\", the \"half day\" and the March date.",
            },
            {
                "criterion": "Does it warn you off the total at the bottom of the export?",
                "goodLooksLike": "It says plainly that the 89.5 does not add up and should not be used.",
            },
            {
                "criterion": "Could you follow it without being confident with spreadsheets?",
                "goodLooksLike": "Plain English, no formulas you would have to go and look up.",
            },
            {
                "criterion": "Does it tell you what to check before the meeting?",
                "goodLooksLike": "A short list of specific questions to ask specific people, not \"clean your data\".",
            },
        ],
        "verdict": {
            "winner": "Close, slight edge to ChatGPT for getting to a usable number",
            "paras": [
                "This one is close, and the two answers are strong in different places.",
                "ChatGPT gets to the point. It opens with a ranked table, commits to one provisional total of 56 hours, "
                "and lists the six assumptions behind it plainly enough that you could disagree with any of them. It also "
                "makes the judgement Claude declined to make: that Ahmed's 40 hours on 9 April is a mistyped 4, and that "
                "the second identical row is a duplicate. That is the call most office managers would make, and saying it "
                "out loud is more useful than leaving it open.",
                "Claude catches more. It flags two problems ChatGPT does not mention at all: the three different date "
                "formats, which quietly break any attempt to filter by month, and the 31 March row, which may have been "
                "left out of the March report as well, so those four hours could disappear from both. It also hands you a "
                "sentence you could read out at the meeting. The cost is length. Claude's answer is nearly three times "
                "longer, and the number the trustees actually want is harder to find in it.",
                "Both tell you not to use the exported total of 89.5, which is the single most valuable thing either of "
                "them says.",
                "Look closely at the two safe floor figures, because they look like a contradiction and are not. Claude "
                "says 44.5 hours are beyond doubt, ChatGPT says 41.0. The difference is one row: the 2 April entry logged "
                "as \"J. Smith\". Claude counts it as Jane Smith, ChatGPT sets it aside until you confirm who it is. Both "
                "are defensible, and you can check it yourself in a minute, which is rather the point.",
                "For a report you have to write this week, ChatGPT's is the answer you would work from. Claude's is the "
                "one you would read before you sent it.",
            ],
            "freshnessNote": (
                "Tested on 2026-07-26 with Claude Opus 5 and OpenAI GPT-5.6. Models change often, so this verdict is only "
                "true for these versions on this date. The archived version of this lab shows how the two tools handled "
                "the same messy export at this point in time."
            ),
        },
        "tryItYourself": [
            "Take a real export you have to make sense of every month, and delete anything private first. Real names, email addresses and anything you would not put on a postcard.",
            "Open claude.ai and chatgpt.com. Both have a free option and neither needs payment for this.",
            "Paste the same data and the same question into both, word for word, so the test is fair. Ask for the numbers and for what you should not trust.",
            "Score both answers against the five questions above.",
            "Check one of their totals by hand. Whichever tool you preferred, this is the habit that keeps you out of trouble.",
        ],
    },
    {
        "id": "arena_003",
        "slug": "cite-your-sources-claude-vs-chatgpt",
        "format": "model-arena",
        "title": "Find the figure and prove it: Claude vs ChatGPT",
        "status": "live",
        "category": "Research",
        "testedOn": "2026-07-26",
        "brief": (
            "You look after payroll and HR admin for a small company in England. You need three current "
            "figures, and your finance director will want to see where each one comes from. This is the "
            "task AI tools are most likely to quietly get wrong, because a confident wrong number with a "
            "broken link looks exactly like a confident right one. You give the same request to two tools, "
            "then you click every link they give you."
        ),
        "taskProse": (
            "You look after payroll and HR admin for a small company in England with eighteen staff. You "
            "need three current figures: the National Living Wage, the weekly rate of Statutory Sick Pay, "
            "and the weekly pay cap used for statutory redundancy pay. Your finance director will want to "
            "see where each one comes from. This is the task AI tools are most likely to quietly get "
            "wrong, because a confident wrong figure with a broken link looks exactly like a confident "
            "right one. So you ask two tools the same thing, and then you click every link."
        ),
        "matchup": [
            {
                "name": "Claude",
                "modelId": "claude-opus-5",
                "modelLabel": "Claude Opus 5",
                "howRun": "Generated directly from Claude Opus 5 on 2026-07-26 with web search switched on, as it is by default in the consumer app.",
                "mdLine": "Claude Opus 5, run on 26 July 2026 with web search switched on.",
            },
            {
                "name": "ChatGPT",
                "modelId": "gpt-5.6-sol",
                "modelLabel": "OpenAI GPT-5.6",
                "howRun": "Generated via the Codex CLI 0.144.1 on 2026-07-26, set to its most careful answer mode, which OpenAI calls high reasoning effort, with web search switched on. It ran four searches, all restricted to gov.uk.",
                "mdLine": "OpenAI GPT-5.6 (model id gpt-5.6-sol), run on 26 July 2026 in its most careful answer mode, with web search switched on.",
            },
        ],
        "promptFile": "prompt-03-citations.txt",
        "outputFiles": [("Claude", "out-03-claude.txt"), ("ChatGPT", "out-03-chatgpt.txt")],
        "rubric": [
            {
                "criterion": "Does every figure come with a link you can click?",
                "goodLooksLike": "Three figures, three links, no figure left floating on its own.",
            },
            {
                "criterion": "Do the links go to GOV.UK itself, rather than to a payroll blog?",
                "goodLooksLike": "Every address starts with gov.uk, because that is the one your finance director will accept.",
            },
            {
                "criterion": "Does the page it links to actually show the figure and the date?",
                "goodLooksLike": "You open the link and the number is there, with the date it applies from.",
            },
            {
                "criterion": "Does it flag anything that has recently changed?",
                "goodLooksLike": "It tells you which rule moved, not just what today's number is.",
            },
            {
                "criterion": "Could you paste it into an email without editing it?",
                "goodLooksLike": "Short, plain, and no waffle you would have to cut first.",
            },
        ],
        "verdict": {
            "winner": "Close. ChatGPT for the citation, Claude for the warnings",
            "paras": [
                "Both tools got all three figures right. Every one was checked against GOV.UK on the day of the test: the "
                "National Living Wage for a worker aged 21 or over is £12.71 an hour from 1 April 2026, Statutory Sick Pay "
                "is £123.25 a week or 80% of normal weekly earnings, whichever is lower, and the redundancy cap is £751 a "
                "week for redundancies on or after 6 April 2026. Every link in both answers is a real GOV.UK page that "
                "opens. Neither tool invented a source, which is worth saying plainly, because inventing sources is exactly "
                "what tools like these used to do.",
                "The difference is what each chose to link to. ChatGPT's sick pay link goes to the HMRC guidance on working "
                "out payments manually, which states the rate and the exact period it runs for, 6 April 2026 to 5 April "
                "2027. That is the page you want when someone asks where the date comes from. Claude linked the "
                "employee-facing sick pay page instead, which gives the amount but not the date it applies from, so its "
                "\"2026 to 2027 tax year\" claim is not proved by the page it cites. Claude does add a single link at the end "
                "that covers all three figures, which partly makes up for it.",
                "Claude is more useful on what has changed. It flags that sick pay is no longer a flat rate, so lower paid "
                "staff will often get less than £123.25, and that the wage rate changed on 1 April while the redundancy cap "
                "changed on 6 April, which matters for anyone made redundant in that gap. ChatGPT mentions the 80% rule in "
                "passing and says nothing about the date gap.",
                "Neither said \"I am not sure\", because neither needed to. Both searched, and both landed on current "
                "pages.",
                "For an email you have to send today, ChatGPT's answer is tighter and its sick pay citation is the better "
                "one. If you are the person who gets blamed when a figure turns out to be out of date, Claude's warnings "
                "are the part you would miss.",
            ],
            "freshnessNote": (
                "Tested on 2026-07-26 with Claude Opus 5 and OpenAI GPT-5.6. Models change often and so do these rates, "
                "which normally rise each April. This verdict is only true for these versions on this date, and the figures "
                "quoted are only true for the day they were checked."
            ),
        },
        "tryItYourself": [
            "Pick three figures you have to be right about in your own job. A rate, a threshold, a deadline.",
            "Open claude.ai and chatgpt.com, and give both the same wording: the figure, the date it applies from, and an official link you can check.",
            "Click every link. This is the whole test. A link that does not open, or that goes to a consultancy blog rather than the official source, is a fail however confident the answer sounds.",
            "Check that the figure on the page matches the figure in the answer. They do not always.",
            "Score both against the five questions above, then decide which one you would trust without checking. The honest answer is neither, and that is the habit worth keeping.",
        ],
    },
    {
        "id": "arena_004",
        "slug": "automate-a-weekly-chore-claude-vs-chatgpt",
        "format": "model-arena",
        "title": "Automate a weekly chore: Claude vs ChatGPT",
        "status": "live",
        "category": "Automation",
        "testedOn": "2026-07-26",
        "brief": (
            "You manage a team of twelve at a housing association. Every Friday you open the timesheet "
            "spreadsheet, work out who has not filled theirs in, and email each of them a reminder. It "
            "takes half an hour and you dread it. You have never written a line of code, and nobody at "
            "work is going to help you. Two AI tools are asked to automate it. One gives you something "
            "you could finish this afternoon. The other gives you something that will still be working "
            "next year. You decide which you would actually attempt."
        ),
        "taskProse": (
            "You manage a team of twelve at a housing association. Every Friday afternoon you open the "
            "spreadsheet where the team log their hours, work out who has not filled theirs in, and email "
            "each of them a reminder. It takes half an hour and you dread it. You have never written a "
            "line of code in your life, and nobody at work is going to help you. You ask two AI tools to "
            "set it up so it happens on its own, and to tell you exactly what to click. One gives you "
            "something you could finish this afternoon. The other gives you something that will still be "
            "working next year. You decide which one you would actually attempt."
        ),
        "matchup": [
            {
                "name": "Claude",
                "modelId": "claude-opus-5",
                "modelLabel": "Claude Opus 5",
                "howRun": "Generated directly from Claude Opus 5 on 2026-07-26 with no web search. It answered from what it already knew about Google Apps Script.",
                "mdLine": "Claude Opus 5, run on 26 July 2026 with no web search. It answered from what it already knew.",
            },
            {
                "name": "ChatGPT",
                "modelId": "gpt-5.6-sol",
                "modelLabel": "OpenAI GPT-5.6",
                "howRun": "Generated via the Codex CLI 0.144.1 on 2026-07-26, set to its most careful answer mode, which OpenAI calls high reasoning effort. It searched Google's own Apps Script documentation before answering, which Claude did not. That difference is worth holding in mind when you read the two.",
                "mdLine": "OpenAI GPT-5.6 (model id gpt-5.6-sol), run on 26 July 2026 in its most careful answer mode. It read Google's Apps Script documentation before answering.",
            },
        ],
        "promptFile": "prompt-04-automation.txt",
        "outputFiles": [("Claude", "out-04-claude.txt"), ("ChatGPT", "out-04-chatgpt.txt")],
        "rubric": [
            {
                "criterion": "Could you follow it on a Friday afternoon with nobody to ask?",
                "goodLooksLike": "Named menus and buttons, in order, with nothing assumed about what you already know.",
            },
            {
                "criterion": "Does it stop you emailing twelve colleagues by mistake?",
                "goodLooksLike": "A way to see exactly who would be chased before anyone is chased.",
            },
            {
                "criterion": "Is it clear which bits you change and which bits you leave alone?",
                "goodLooksLike": "The lines you edit are marked, and everything else is explicitly hands off.",
            },
            {
                "criterion": "Does it warn you about the scary Google permission screen?",
                "goodLooksLike": "It tells you the warning is coming and what it means, so you do not stop there.",
            },
            {
                "criterion": "Does it deal with real life, like annual leave and people who log zero?",
                "goodLooksLike": "Named situations with what to do about each, not a general note about testing.",
            },
        ],
        "verdict": {
            "winner": "Close. ChatGPT if you want it to keep working, Claude if you want it working today",
            "paras": [
                "These two answers are so different that the useful question is not which is better, it is which one you "
                "would actually get to the end of.",
                "ChatGPT built the thing an IT department would build. It asks which of two sheet layouts you have and "
                "handles both. It gives you a preview that sends no email at all, then a test that emails only you, then "
                "the live run. It remembers who it has already chased so nobody gets two reminders. It writes an audit tab, "
                "emails you a summary, supports a pause date for annual leave, and links to Google's own documentation for "
                "the claims it makes. It is about six hundred lines of code and nine numbered steps.",
                "Claude built the thing you could finish before the school run. One short script, seven settings at the top, "
                "and a test mode that emails only you until you turn it off. It reaches Apps Script through Extensions on "
                "the sheet itself, so you never have to find your spreadsheet ID. It is honest about its own limits: it "
                "tells you it does not handle a sheet with one column per week, and invites you to say so and get an "
                "adjusted version.",
                "Claude has one advantage that matters more than its size. It warns you about the Google screen that says "
                "the app is not verified, tells you to click Advanced and continue anyway, and explains that unsafe means "
                "unreviewed rather than dangerous. That screen is where most people give up. ChatGPT walks you through "
                "granting permission and never mentions it.",
                "Both are right about the timing, which is a nice detail. Claude says 4pm means some time between 4pm and "
                "5pm, which is true of the trigger it tells you to set up by hand. ChatGPT says roughly a quarter to four "
                "until quarter past, which is true of the tighter trigger its code creates.",
                "If your sheet is simple and you want this done today, start with Claude's, and go back and ask for the "
                "extras once it works. If twelve people are going to get an automatic email from you every Friday for the "
                "next two years, ChatGPT's is the one you want running, as long as you do not lose your nerve at the "
                "permission screen.",
            ],
            "freshnessNote": (
                "Tested on 2026-07-26 with Claude Opus 5 and OpenAI GPT-5.6. Models change often, and so does Google's "
                "interface, so both the verdict and the exact menu names are only reliable for this date. The archived "
                "version of this lab shows how the two tools handled the same request at this point in time."
            ),
        },
        "tryItYourself": [
            "Pick the job you do every week that you most resent. Chasing something, copying something, checking something.",
            "Open claude.ai and chatgpt.com and describe it to both in the same words. Say plainly that you cannot write code and that nobody will help you.",
            "Ask both the same three things: what do I click, what do I change, and what could go wrong.",
            "Score both answers against the five questions above, before you build anything.",
            "Build the one you would trust, and test it on yourself first. If either answer does not offer you a way to test it safely, that is the answer to be wary of.",
        ],
    },
]


def build(lab: dict) -> None:
    prompt = read(lab["promptFile"])
    outputs = [{"by": by, "verbatim": read(path)} for by, path in lab["outputFiles"]]

    verdict = {
        "winner": lab["verdict"]["winner"],
        "callText": " ".join(lab["verdict"]["paras"]),
        "freshnessNote": lab["verdict"]["freshnessNote"],
    }

    data = {
        "id": lab["id"],
        "slug": lab["slug"],
        "format": lab["format"],
        "title": lab["title"],
        "status": lab["status"],
        "category": lab["category"],
        "testedOn": lab["testedOn"],
        "brief": lab["brief"],
        "matchup": [
            {k: m[k] for k in ("name", "modelId", "modelLabel", "howRun")}
            for m in lab["matchup"]
        ],
        "prompt": prompt,
        "outputs": outputs,
        "rubric": lab["rubric"],
        "verdict": verdict,
        "tryItYourself": lab["tryItYourself"],
    }

    stem = f"lab-{lab['id'].split('_')[1][-2:]}-{lab['slug']}"
    (DEST / f"{stem}.json").write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")

    tested = long_date(lab["testedOn"])
    md = [f"# {lab['title']}", ""]
    md.append(f"**Lab · {lab['category']}** · Tested on {tested}")
    md += [
        "",
        "Two AI tools, one real task, the same prompt to both. You read both answers,",
        "score them against a simple checklist, and decide which one you would actually",
        "use. The skill you are practising is judgement: knowing which tool did the",
        "better job on a task you already understand.",
        "",
        "## The task",
        "",
        wrap(lab["taskProse"]),
        "",
        "## The matchup",
        "",
    ]
    for m in lab["matchup"]:
        md.append(wrap(f"- **{m['name']}**: {m['mdLine']}", indent="  "))
    md += [
        "",
        "## The prompt (the same words to both)",
        "",
        "Both tools were given this exact prompt, word for word.",
        "",
    ]
    f = fence(prompt)
    md += [f"{f}text", prompt, f, ""]
    md += [
        "## The two answers",
        "",
        "Both answers below are quoted exactly as each tool produced them. Nothing has",
        "been tidied, shortened or corrected, so the spelling, punctuation and layout you",
        "see are each tool's own, not ours.",
        "",
    ]
    for out in outputs:
        f = fence(out["verbatim"])
        md += [f"### {out['by']}'s answer", "", f"{f}text", out["verbatim"], f, ""]

    md += [
        "## Score them yourself",
        "",
        f"Read both answers again and score each one against these {len(lab['rubric'])} questions. There is",
        "no right answer. You are scoring your own reading.",
        "",
    ]
    for i, item in enumerate(lab["rubric"], 1):
        good = item["goodLooksLike"]
        md.append(
            wrap(
                f"{i}. **{item['criterion']}** Good looks like {good[0].lower()}{good[1:]}",
                indent="   ",
            )
        )
    md += ["", "## The verdict", ""]
    md.append("\n\n".join(wrap(p) for p in lab["verdict"]["paras"]))
    md += [
        "",
        "**Models change often, so this verdict is only true for these versions on this",
        "date.** When newer models arrive we run the same prompt again and publish the",
        "rematch. The archived version of this lab then shows how the tools compared in",
        f"{dt.date.fromisoformat(lab['testedOn']).strftime('%B %Y')}, which is a useful record of how fast they are moving.",
        "",
        "## Try it yourself",
        "",
    ]
    for i, step in enumerate(lab["tryItYourself"], 1):
        md.append(wrap(f"{i}. {step}", indent="   "))
    md.append("")

    (DEST / f"{stem}.md").write_text("\n".join(md))
    print(f"wrote {stem}.json and {stem}.md")


if __name__ == "__main__":
    for lab in LABS:
        build(lab)
