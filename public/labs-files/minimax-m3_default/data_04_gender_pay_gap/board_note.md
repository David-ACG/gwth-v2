# Gender pay gap, 5 April 2026 snapshot

## Do we have to publish?

Yes. The chair's earlier advice was based on an estimate of about 210 staff. The HR export shows **262 relevant employees** on the snapshot date (183 women, 79 men) — above the 250 threshold, so we must publish.

The full-pay relevant headcount (used for hourly pay and quartiles) is **248**.

## Headline figures

- Mean hourly rate: **£20.07 (men)** vs **£15.91 (women)** — mean gap **20.8%**.
- Median hourly rate: **£14.68 (men)** vs **£14.08 (women)** — median gap **4.1%**.
- Mean bonus: **£3,944 (men)** vs **£889 (women)** — mean bonus gap **77.5%**.
- Median bonus: **£2,000 (men)** vs **£450 (women)** — median bonus gap **77.5%**.
- Receiving a bonus in the 12 months to 5 April 2026: **34.2% of men**, **28.4% of women**.

## What that tells us

The mean gap is much larger than the median because a small number of men sit on very high hourly rates; most men and most women are clustered near the median. The quartile chart shows the same point: women are over-represented in the lower quartile (79.0%) and under-represented in the upper quartile (58.1% women vs 41.9% men). The bonus gap reflects both fewer women receiving any bonus and lower amounts when they do.

## What I had to fix or could not work out

- The `sex` column came in eight spellings (`F`, `female`, `Woman`, `Male ` with a trailing space, etc.). I normalised them.
- The payroll file uses bare numeric `payroll_id`; the HR system uses `TC-0xxx`. I joined by stripping `TC-` and leading zeros.
- The payroll file has a `2026-04 OFF-CYCLE` run of long-service bonuses. Per the method note the relevant pay period for ordinary pay is the April 2026 monthly run, so I excluded those lines from ordinary pay; the bonuses are still counted because their pay date is inside the bonus window.
- **Ethnicity pay gap: not calculated.** The HR export has no ethnicity field. `ethnicity_pay_gap_pct` in `answers.json` is `null`; the board will need an ethnicity field added before this can be reported.
