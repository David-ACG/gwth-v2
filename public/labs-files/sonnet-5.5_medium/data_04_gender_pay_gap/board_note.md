# Gender pay gap, snapshot 5 April 2026

**Must we publish? Yes.** The 250 threshold is a count of people (headcount), not full-time equivalents. On 5 April 2026 we had **262 relevant employees** (agency workers, leavers before that date and people who joined later are excluded). The 210 FTE figure is the wrong measure, so the chair's statement should be corrected.

## Figures (positive = men paid more)
- **Mean hourly pay:** men £19.37, women £15.50, a **20.0%** gap.
- **Median gap:** **5.0%**. The mean is pulled up by five directors, all men, who are the highest paid.
- **Bonus gap:** mean **78.1%**, median **73.5%**.
- **Receiving a bonus:** 34.2% of men, 28.4% of women.
- **Women by quartile (lowest to highest paid):** 77.4%, 71.0%, 74.2%, 53.2%. Women are 70% of the workforce but under-represented in the top quartile.

Pay figures use the 248 employees on full pay in April 2026; the 14 on maternity, sick (statutory or half pay) or unpaid leave are excluded from them but included in bonus figures.

## Ethnicity pay gap: not calculated
The files contain no ethnicity data, so this is `null` in the answers file. We would need ethnicity from HR records, ideally with a note on how many staff have declined to say.

## Data corrected or uncertain
- 15 payroll lines appeared twice (same line number and content), including three annual bonuses and several April basic pay lines. I counted each once.
- Sex was recorded in eight different formats (e.g. F, Woman, female, "male "); I standardised to M/F. It is a binary field, so it can't show anyone whose recorded sex differs.
- A £1,500 bonus to one employee was reversed in December, so it counts as zero and they are not a recipient.
- Two off-cycle bonus runs (April 2025 and 2 April 2026) fall inside the bonus year and were counted; they are not in ordinary pay.
- Contract hours changes dated after 5 April 2026 were ignored.
- Six people counted as relevant have leave dates after the snapshot, so were still employed.
