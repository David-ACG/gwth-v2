# Make sense of a messy spreadsheet: Claude vs ChatGPT

**Lab · Data** · Tested on 26 July 2026

Two AI tools, one real task, the same prompt to both. You read both answers,
score them against a simple checklist, and decide which one you would actually
use. The skill you are practising is judgement: knowing which tool did the
better job on a task you already understand.

## The task

You are the office manager at a small community centre in Leeds. Volunteers
sign in and out on a tablet, and once a month you export the log. This month's
export is a mess. Dates come in three formats. One volunteer appears twice
under two spellings. Hours are logged as "7:30", "half day" and "N/A". One row
says 40 hours and appears twice. The total at the bottom does not match
anything. Your trustees meet next week and want two numbers: total volunteer
hours for April, and the top three volunteers. You hand the export to two AI
tools and see which one gets you to a figure you could defend.

## The matchup

- **Claude**: Claude Opus 5, run on 26 July 2026 with no web search and no
  other tools.
- **ChatGPT**: OpenAI GPT-5.6 (model id gpt-5.6-sol), run on 26 July 2026 in
  its most careful answer mode. Search was available but it made none.

## The prompt (the same words to both)

Both tools were given this exact prompt, word for word.

```text
I am the office manager at a small community centre in Leeds. Our volunteers sign in and out on a tablet, and once a month I export the log as a spreadsheet. I have pasted the April export below exactly as it came out.

Date,Volunteer,Session,Hours,Notes
01/04/2026,Jane Smith,Lunch club,3.5,
2026-04-02,J. Smith,Lunch club,3.5,
02/04/2026,Ahmed Khan,Warm space,4,
3 Apr 26,Marta Nowak,Lunch club,7:30,
03/04/2026,ahmed khan,Warm space,4,
04/04/2026,Jane Smith,Admin,half day,
04/04/2026,Marta Nowak,Warm space,4,
07/04/2026,Ahmed Khan,Lunch club,,did not sign out
07/04/2026,Jane Smith,Lunch club,3.5,
08/04/2026,Marta Nowak,Admin,N/A,
09/04/2026,Ahmed Khan,Warm space,40,
09/04/2026,Ahmed Khan,Warm space,40,
10/04/2026,Marta Nowak,Lunch club,3.5,
11/04/2026,Jane Smith,Warm space,4,
14/04/2026,Dev Patel,Lunch club,3.5,new starter
15/04/2026,Marta Nowak,Lunch club,3.5,
16/04/2026,Dev Patel,Warm space,4,
17/04/2026,Jane Smith,Lunch club,3.5,
2026-03-31,Ahmed Khan,Warm space,4,
TOTAL,,,89.5,

I have to report two things to our trustees next week: the total volunteer hours we received in April 2026, and our top three volunteers by hours in April.

Please work them out for me. Then tell me plainly which of these numbers I should not fully trust, and what I would need to check or fix before I put them in front of the trustees. Use British English and write it for someone who is not confident with spreadsheets.
```

## The two answers

Both answers below are quoted exactly as each tool produced them. Nothing has
been tidied, shortened or corrected, so the spelling, punctuation and layout you
see are each tool's own, not ours.

### Claude's answer

```text
I can give you figures, but I want to be straight with you first: this export has five rows that cannot be read reliably, and one row that is simply wrong. So the honest answer is a range with a clear note attached, not a single confident number.

WHAT I CAN STAND BEHIND

Counting only rows dated in April 2026, and only where the Hours cell is a plain number:

  Jane Smith    18.0 hours   (5 sessions)
  Marta Nowak   11.0 hours   (3 sessions)
  Ahmed Khan     8.0 hours   (2 sessions)
  Dev Patel      7.5 hours   (2 sessions)
  ------------------------------------------
  Total         44.5 hours

If you also accept the 3 April entry for Marta Nowak, where the Hours cell reads "7:30" and almost certainly means seven and a half hours, the picture becomes:

  Marta Nowak   18.5 hours
  Jane Smith    18.0 hours
  Ahmed Khan     8.0 hours
  Dev Patel      7.5 hours
  ------------------------------------------
  Total         52.0 hours

TOP THREE VOLUNTEERS

Your top three are Marta Nowak, Jane Smith and Ahmed Khan, in some order. The three names are safe. The order is not, and I would not print a ranking until you have checked the rows below.

Marta and Jane are separated by half an hour, and that half hour depends entirely on how you read one cell. Ahmed is third on the countable rows, but he has three rows I could not use, and two of them read 40 hours, so his true total could be anything from 8 to 88.

WHAT I WOULD NOT TRUST, AND WHY

1. The TOTAL row at the bottom says 89.5. I cannot reproduce that figure under any reading of the data, so please do not use it. Exported total rows are also a common cause of double counting, because a spreadsheet will happily add the total row into your total. Delete it before you do anything else.

2. Two identical rows on 9 April: Ahmed Khan, Warm space, 40 hours, listed twice. Two things are wrong here. Forty hours in one warm space session is not plausible, and it looks like 4 typed with a stray zero. And the row appears twice, which usually means a double sign-in rather than two real sessions. I have left both out. If you count them at face value Ahmed becomes your top volunteer by a wide margin, which is why this one matters.

3. Marta Nowak, 3 April, Hours "7:30". I have read this as 7.5 hours. It could also be a start time somebody typed into the wrong box. Worth a two second check with Marta.

4. Jane Smith, 4 April, Hours "half day". Someone has typed words where a number should go. You will need to decide what a half day is worth at your centre, probably 3.5 or 4 hours, and apply it consistently.

5. Ahmed Khan, 7 April, Hours blank, note "did not sign out". Genuinely missing. Either ask him or leave it out and say so.

6. Marta Nowak, 8 April, Hours "N/A". Same problem as above. N/A is not zero, it means nobody recorded it.

7. The row dated 2026-03-31 for Ahmed Khan is in March, not April. I have excluded it. Do check that your March report did not also exclude it, or those four hours have disappeared from both reports.

8. Names are inconsistent. "Jane Smith" and "J. Smith" are almost certainly the same person, and "Ahmed Khan" and "ahmed khan" definitely are. A spreadsheet treats those as different people unless you tidy them, so any per person total done automatically will be wrong.

9. Dates are in three different formats: 01/04/2026, 2026-04-02 and 3 Apr 26. A spreadsheet will read some of those as dates and leave others as text, which quietly breaks any filter by month.

WHAT I WOULD DO BEFORE THE TRUSTEES MEETING

Fifteen minutes of checking would turn this into a number you can defend:

  1. Delete the TOTAL row.
  2. Ask Ahmed about 9 April. One session or two, and four hours or forty.
  3. Ask Marta about 3 April and 8 April, and Jane about 4 April.
  4. Agree what a half day means and write it down for next time.
  5. Make the names consistent, one spelling per person.
  6. Then total it again.

WHAT TO SAY IF YOU RUN OUT OF TIME

"In April 2026 we recorded 52 volunteer hours across four volunteers. Five entries were incomplete or unclear, so the real figure is a little higher. Our most active volunteers were Marta Nowak, Jane Smith and Ahmed Khan."

That is honest, it is defensible, and it quietly makes the case for tightening up the sign out process, which is the real story in this data.
```

### ChatGPT's answer

```text
My best provisional calculation is:

| Rank | Volunteer | April hours |
|---|---|---:|
| 1 | Marta Nowak | 18.5 |
| 2 | Jane Smith | 18.0 |
| 3 | Ahmed Khan | 12.0 |

**Provisional April total: 56.0 hours.**

This assumes that:

- “J. Smith” is Jane Smith.
- “7:30” means 7 hours 30 minutes, or 7.5 hours.
- One of Ahmed’s identical 9 April entries is a duplicate.
- The remaining “40” on 9 April should be 4.0 hours.
- Entries saying “half day”, blank or “N/A” are left out because they do not give a usable number.
- The 31 March entry and the “TOTAL” line are excluded.

### What you should not fully trust

Do **not** present the 56 hours or the ranking as final until these points are checked:

- Ask Ahmed, or check the tablet record, for his missing sign-out on 7 April.
- Confirm that Ahmed worked 4 hours—not 40—on 9 April, and that only one of the two identical entries is genuine.
- Find out how many hours Jane’s “half day” on 4 April represents.
- Find out what Marta’s “N/A” on 8 April means.
- Confirm that Marta’s “7:30” is a duration of 7½ hours, rather than a clock time or typing error.
- Confirm that “J. Smith” is Jane Smith.

The exported total of **89.5 hours should not be used**. It does not agree with the April entries, contains an out-of-month record, and appears to include unresolved errors.

For reassurance, the completely clear, ordinary April entries add up to **41.0 hours**. The final total must be at least that much, but it cannot be settled accurately until the questionable entries above have been corrected. Jane and Marta may also swap first and second place once their missing information is resolved.
```

## Score them yourself

Read both answers again and score each one against these 5 questions. There is
no right answer. You are scoring your own reading.

1. **Does it give you a number you could actually put in front of the
   trustees?** Good looks like a clear figure, with the assumptions behind it
   stated so you can argue with them.
2. **Did it spot the rows that cannot be trusted?** Good looks like it names
   the 40 hour rows, the blank, the "N/A", the "half day" and the March date.
3. **Does it warn you off the total at the bottom of the export?** Good looks
   like it says plainly that the 89.5 does not add up and should not be used.
4. **Could you follow it without being confident with spreadsheets?** Good
   looks like plain English, no formulas you would have to go and look up.
5. **Does it tell you what to check before the meeting?** Good looks like a
   short list of specific questions to ask specific people, not "clean your
   data".

## The verdict

This one is close, and the two answers are strong in different places.

ChatGPT gets to the point. It opens with a ranked table, commits to one
provisional total of 56 hours, and lists the six assumptions behind it plainly
enough that you could disagree with any of them. It also makes the judgement
Claude declined to make: that Ahmed's 40 hours on 9 April is a mistyped 4, and
that the second identical row is a duplicate. That is the call most office
managers would make, and saying it out loud is more useful than leaving it
open.

Claude catches more. It flags two problems ChatGPT does not mention at all: the
three different date formats, which quietly break any attempt to filter by
month, and the 31 March row, which may have been left out of the March report
as well, so those four hours could disappear from both. It also hands you a
sentence you could read out at the meeting. The cost is length. Claude's answer
is nearly three times longer, and the number the trustees actually want is
harder to find in it.

Both tell you not to use the exported total of 89.5, which is the single most
valuable thing either of them says.

Look closely at the two safe floor figures, because they look like a
contradiction and are not. Claude says 44.5 hours are beyond doubt, ChatGPT
says 41.0. The difference is one row: the 2 April entry logged as "J. Smith".
Claude counts it as Jane Smith, ChatGPT sets it aside until you confirm who it
is. Both are defensible, and you can check it yourself in a minute, which is
rather the point.

For a report you have to write this week, ChatGPT's is the answer you would
work from. Claude's is the one you would read before you sent it.

**Models change often, so this verdict is only true for these versions on this
date.** When newer models arrive we run the same prompt again and publish the
rematch. The archived version of this lab then shows how the tools compared in
July 2026, which is a useful record of how fast they are moving.

## Try it yourself

1. Take a real export you have to make sense of every month, and delete
   anything private first. Real names, email addresses and anything you would
   not put on a postcard.
2. Open claude.ai and chatgpt.com. Both have a free option and neither needs
   payment for this.
3. Paste the same data and the same question into both, word for word, so the
   test is fair. Ask for the numbers and for what you should not trust.
4. Score both answers against the five questions above.
5. Check one of their totals by hand. Whichever tool you preferred, this is the
   habit that keeps you out of trouble.
