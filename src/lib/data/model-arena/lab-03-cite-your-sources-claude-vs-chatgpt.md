# Find the figure and prove it: Claude vs ChatGPT

**Lab · Research** · Tested on 26 July 2026

Two AI tools, one real task, the same prompt to both. You read both answers,
score them against a simple checklist, and decide which one you would actually
use. The skill you are practising is judgement: knowing which tool did the
better job on a task you already understand.

## The task

You look after payroll and HR admin for a small company in England with
eighteen staff. You need three current figures: the National Living Wage, the
weekly rate of Statutory Sick Pay, and the weekly pay cap used for statutory
redundancy pay. Your finance director will want to see where each one comes
from. This is the task AI tools are most likely to quietly get wrong, because a
confident wrong figure with a broken link looks exactly like a confident right
one. So you ask two tools the same thing, and then you click every link.

## The matchup

- **Claude**: Claude Opus 5, run on 26 July 2026 with web search switched on.
- **ChatGPT**: OpenAI GPT-5.6 (model id gpt-5.6-sol), run on 26 July 2026 in
  its most careful answer mode, with web search switched on.

## The prompt (the same words to both)

Both tools were given this exact prompt, word for word.

```text
I look after payroll and HR admin for a small company in England with eighteen staff. I need three current figures, and I need to be able to show my finance director exactly where each one comes from.

1. The National Living Wage hourly rate for a worker aged 21 or over.
2. The standard weekly rate of Statutory Sick Pay.
3. The maximum weekly pay figure used when working out statutory redundancy pay.

For each one, give me the figure, the date it applies from, and a link to the official GOV.UK page I can check it on myself. If you are not certain a figure is current, say so plainly rather than guessing. Use British English and keep it short enough to paste into an email.
```

## The two answers

Both answers below are quoted exactly as each tool produced them. Nothing has
been tidied, shortened or corrected, so the spelling, punctuation and layout you
see are each tool's own, not ours.

### Claude's answer

```text
I have checked all three on GOV.UK just now. Here they are, ready to paste.

1. National Living Wage, 21 and over
£12.71 an hour, from 1 April 2026.
Source: https://www.gov.uk/national-minimum-wage-rates

2. Statutory Sick Pay, standard weekly rate
£123.25 a week, or 80% of the employee's normal weekly earnings, whichever is lower. This is the 2026 to 2027 tax year rate.
Source: https://www.gov.uk/statutory-sick-pay/what-youll-get

3. Maximum weekly pay for statutory redundancy pay
£751 a week, for redundancies on or after 6 April 2026. That caps a statutory redundancy payment at £22,530.
Source: https://www.gov.uk/redundancy-your-rights/redundancy-pay

Two things worth flagging to your finance director, because they are easy to miss.

The SSP figure is no longer a simple flat rate. From 6 April 2026 it is the lower of £123.25 and 80% of the employee's normal weekly earnings, so for your lower paid staff the answer will often be less than £123.25. If your payroll software has not been updated, check it.

The two dates are different. The wage rate changed on 1 April 2026, the redundancy cap on 6 April 2026. Anyone made redundant between those dates falls under the previous cap.

One page that has all three in one place, if your finance director would rather have a single link:
https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027

I have quoted the figures as GOV.UK states them today, 26 July 2026. These rates normally change each April, so it is worth re-checking the pages rather than reusing this email next spring.
```

### ChatGPT's answer

```text
Checked against GOV.UK on 26 July 2026:

1. **National Living Wage (age 21+)**: **£12.71 per hour**, from **1 April 2026**. [GOV.UK rates](https://www.gov.uk/national-minimum-wage-rates)

2. **Statutory Sick Pay**: **£123.25 per week**, from **6 April 2026**. The amount payable is the lower of £123.25 and 80% of average weekly earnings. [GOV.UK SSP guidance](https://www.gov.uk/guidance/statutory-sick-pay-manually-calculate-your-employees-payments)

3. **Statutory redundancy pay weekly-pay cap**: **£751 per week**, for redundancies on or after **6 April 2026**. [GOV.UK redundancy guidance](https://www.gov.uk/redundancy-your-rights/redundancy-pay)
```

## Score them yourself

Read both answers again and score each one against these 5 questions. There is
no right answer. You are scoring your own reading.

1. **Does every figure come with a link you can click?** Good looks like three
   figures, three links, no figure left floating on its own.
2. **Do the links go to GOV.UK itself, rather than to a payroll blog?** Good
   looks like every address starts with gov.uk, because that is the one your
   finance director will accept.
3. **Does the page it links to actually show the figure and the date?** Good
   looks like you open the link and the number is there, with the date it
   applies from.
4. **Does it flag anything that has recently changed?** Good looks like it
   tells you which rule moved, not just what today's number is.
5. **Could you paste it into an email without editing it?** Good looks like
   short, plain, and no waffle you would have to cut first.

## The verdict

Both tools got all three figures right. Every one was checked against GOV.UK on
the day of the test: the National Living Wage for a worker aged 21 or over is
£12.71 an hour from 1 April 2026, Statutory Sick Pay is £123.25 a week or 80%
of normal weekly earnings, whichever is lower, and the redundancy cap is £751 a
week for redundancies on or after 6 April 2026. Every link in both answers is a
real GOV.UK page that opens. Neither tool invented a source, which is worth
saying plainly, because inventing sources is exactly what tools like these used
to do.

The difference is what each chose to link to. ChatGPT's sick pay link goes to
the HMRC guidance on working out payments manually, which states the rate and
the exact period it runs for, 6 April 2026 to 5 April 2027. That is the page
you want when someone asks where the date comes from. Claude linked the
employee-facing sick pay page instead, which gives the amount but not the date
it applies from, so its "2026 to 2027 tax year" claim is not proved by the page
it cites. Claude does add a single link at the end that covers all three
figures, which partly makes up for it.

Claude is more useful on what has changed. It flags that sick pay is no longer
a flat rate, so lower paid staff will often get less than £123.25, and that the
wage rate changed on 1 April while the redundancy cap changed on 6 April, which
matters for anyone made redundant in that gap. ChatGPT mentions the 80% rule in
passing and says nothing about the date gap.

Neither said "I am not sure", because neither needed to. Both searched, and
both landed on current pages.

For an email you have to send today, ChatGPT's answer is tighter and its sick
pay citation is the better one. If you are the person who gets blamed when a
figure turns out to be out of date, Claude's warnings are the part you would
miss.

**Models change often, so this verdict is only true for these versions on this
date.** When newer models arrive we run the same prompt again and publish the
rematch. The archived version of this lab then shows how the tools compared in
July 2026, which is a useful record of how fast they are moving.

## Try it yourself

1. Pick three figures you have to be right about in your own job. A rate, a
   threshold, a deadline.
2. Open claude.ai and chatgpt.com, and give both the same wording: the figure,
   the date it applies from, and an official link you can check.
3. Click every link. This is the whole test. A link that does not open, or that
   goes to a consultancy blog rather than the official source, is a fail
   however confident the answer sounds.
4. Check that the figure on the page matches the figure in the answer. They do
   not always.
5. Score both against the five questions above, then decide which one you would
   trust without checking. The honest answer is neither, and that is the habit
   worth keeping.
