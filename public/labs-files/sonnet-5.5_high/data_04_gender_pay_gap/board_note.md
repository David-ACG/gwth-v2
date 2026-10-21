# Gender pay gap, snapshot 5 April 2026

## Must we publish? Yes.
The 250 threshold counts **employees (headcount)**, not full-time equivalents. Part-timers and people on leave each count as one. On 5 April 2026 we had **262 relevant employees**, so we must publish. The "about 210 FTE" figure is the wrong measure. Excluded: 14 agency workers, 18 leavers before the snapshot and 5 people who joined after it.

## Figures (positive gap = men paid more)
248 of the 262 are on full pay. The other 14 were on maternity, sick or unpaid leave in April and are left out of the pay figures.

| Measure | Result |
|---|---|
| Mean hourly pay | Men £19.37, women £15.50 |
| Mean gap | **20.0%** |
| Median gap | **5.0%** |
| Mean bonus gap | **78.1%** |
| Median bonus gap | **73.5%** |
| Received a bonus | Men 34.2%, women 28.4% |

Women in each pay quartile, lowest to highest: **77.4%, 71.0%, 74.2%, 53.2%** (chart: `chart.svg`).

**What this means:** the mean gap is much bigger than the median gap, so a few very highly paid men pull the men's average up. A typical man and woman are paid similarly, but women are under-represented in the top quartile. Bonus gaps are larger because the biggest annual bonuses went to a small group of senior staff, and more men than women received a bonus.

## Data corrected
- **15 payroll lines were exact duplicates** (12 in the April run, 3 bonuses) and were counted once.
- **Sex** was recorded in eight formats and was standardised to M/F.
- A £1,500 bonus paid in November was reversed in December, so it counts as nil.
- Bonuses paid before 6 April 2025 (including March 2025 and the 4 April 2025 off-cycle run) are outside the 12 months. The 2 April 2026 off-cycle payments are inside it.
- Contract-hour changes dated after 5 April 2026 were ignored.

## Could not be worked out
- **Ethnicity pay gap:** none of the files holds ethnicity data, so I have left it blank (`null`) rather than invent a figure. It would need an ethnicity field from HR, and small groups may be too few to report safely.
