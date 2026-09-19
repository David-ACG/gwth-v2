/**
 * The single source of truth for every UK fact and figure the public site
 * states about artificial intelligence.
 *
 * ## Why this module exists
 *
 * David's annotation a-20260914-210609-f7fdc8 on /about asked for the UK
 * thread to run through the whole site, not one page. Before that could
 * happen the figures had to stop living in the pages: /about held one set in
 * its component with the sources in a README, /why-gwth held a different set
 * inline (some of them stale, one attributed to a publisher that never
 * published it), and `components/marketing/data.ts` held a third. Spreading
 * the thread over eleven surfaces from three private copies would have put
 * contradictory numbers on the same website.
 *
 * So every UK research figure the site renders is declared here once, with
 * the publisher, the release date and the exact URL a reader can check it
 * against. A page writes its own words around the figure; it never carries
 * the figure itself. `src/__tests__/marketing/uk-thread.test.tsx` enforces
 * both halves of that rule.
 *
 * ## How to render a figure
 *
 * Put the value on an element carrying `data-uk-figure="<id>"`, and make sure
 * the page also links the figure's source. The test walks every marketing
 * surface, reads those attributes, and fails if a rendered value has drifted
 * from the value below or if its source is not cited on the same page.
 *
 * ## How to refresh a figure
 *
 * Change the value, the release date and the `checked` date here, in one
 * edit, and read the source again before you do. Never copy a number out of
 * this file into a component.
 *
 * All sources re-read on 2026-09-19.
 */

/** A published document the site is allowed to cite for a UK figure. */
export interface UkSource {
  /** Stable key used by {@link UkFigure.sourceId}. */
  id: string
  /** Title as the publisher prints it. */
  title: string
  /** The organisation that published it, spelled the way the site cites it. */
  publisher: string
  /** Canonical URL. This is the link a page must render beside the figure. */
  url: string
  /** Release date in ISO form, for sorting and for staleness checks. */
  released: string
  /** Release date as a reader should see it, for example "20 July 2026". */
  releasedLabel: string
  /** When an agent last opened the URL and confirmed the figures below. */
  checked: string
}

/** One statistic, owned by this module and rendered by the pages. */
export interface UkFigure {
  /** Stable key, used as the `data-uk-figure` attribute value. */
  id: string
  /** The value exactly as it should appear on screen, for example "35%". */
  value: string
  /** Neutral description of what the value counts. Pages may reword it. */
  label: string
  /** Key into {@link UK_AI_SOURCES}. */
  sourceId: string
  /**
   * Anything a reader needs in order not to misread the figure: the
   * population it covers, the fieldwork date when it differs from the
   * release date, or the comparison it is drawn against.
   */
  caveat?: string
}

/**
 * Every source the site cites for a UK AI figure. A figure without an entry
 * here cannot be rendered, which is the point.
 */
export const UK_AI_SOURCES: readonly UkSource[] = [
  {
    id: "dsit-action-plan",
    title: "AI Opportunities Action Plan",
    publisher: "Department for Science, Innovation and Technology",
    url: "https://www.gov.uk/government/publications/ai-opportunities-action-plan/ai-opportunities-action-plan",
    released: "2025-01-13",
    releasedLabel: "13 January 2025",
    checked: "2026-09-19",
  },
  {
    id: "dsit-sector-study-2024",
    title: "Artificial Intelligence sector study 2024",
    publisher: "Department for Science, Innovation and Technology",
    url: "https://www.gov.uk/government/publications/artificial-intelligence-sector-study-2024/artificial-intelligence-sector-study-2024",
    released: "2025-09-03",
    releasedLabel: "3 September 2025",
    checked: "2026-09-19",
  },
  {
    id: "dsit-ai-skills-public",
    title: "AI Skills for Life and Work: general public survey findings",
    publisher: "Ipsos for the Department for Science, Innovation and Technology",
    url: "https://www.gov.uk/government/publications/ai-skills-for-life-and-work-general-public-survey-findings/ai-skills-for-life-and-work-general-public-survey-findings",
    released: "2026-01-28",
    releasedLabel: "28 January 2026",
    checked: "2026-09-19",
  },
  {
    id: "ons-ai-in-business",
    title: "Artificial intelligence in UK businesses: 2023 to 2026",
    publisher: "Office for National Statistics",
    url: "https://www.ons.gov.uk/businessindustryandtrade/business/businessservices/articles/artificialintelligenceinukbusinesses/2023to2026",
    released: "2026-07-20",
    releasedLabel: "20 July 2026",
    checked: "2026-09-19",
  },
] as const

/**
 * Every UK statistic the public site is allowed to print. The `value` string
 * is what appears on screen; a page that shows something different fails the
 * site-wide test.
 */
export const UK_AI_FIGURES: readonly UkFigure[] = [
  {
    id: "worker-confidence",
    value: "21%",
    label: "of UK adults feel confident using AI at work",
    sourceId: "dsit-ai-skills-public",
    caveat:
      "Published 28 January 2026 from fieldwork carried out between 29 February and 7 March 2024, on a random probability sample of 1,189 adults. Confidence in day-to-day life was higher, at 28%. No later like-for-like survey exists, so both dates are given wherever the figure is used.",
  },
  {
    id: "business-adoption",
    value: "35%",
    label:
      "of UK businesses with ten or more staff reported using at least one AI technology in June 2026",
    sourceId: "ons-ai-in-business",
    caveat:
      "Against around 12% in late 2023. The ONS measures businesses with ten or more employees for this headline.",
  },
  {
    id: "business-adoption-2023",
    value: "12%",
    label:
      "of UK businesses with ten or more staff were using AI in late 2023",
    sourceId: "ons-ai-in-business",
    caveat:
      "The comparison point for `business-adoption`. Always given as a change over time, never on its own.",
  },
  {
    id: "adoption-depth",
    value: "1.6",
    label:
      "AI technologies used by the average adopting UK business, up from around 1.4 in late 2023",
    sourceId: "ons-ai-in-business",
    caveat:
      "The ONS calls adoption so far relatively shallow. This is the figure behind that word.",
  },
  {
    id: "smallest-vs-largest",
    value: "28% vs 49%",
    label:
      "of the smallest UK businesses use AI, against the largest firms",
    sourceId: "ons-ai-in-business",
    caveat:
      "Smallest means nought to nine employees; largest means 250 or more. Given as the raw pair rather than a ratio, because the ratio invites a question the source does not answer.",
  },
  {
    id: "ai-companies",
    value: "5,862",
    label: "AI companies counted in the UK in 2024",
    sourceId: "dsit-sector-study-2024",
    caveat: "Up from 3,713 in 2023.",
  },
  {
    id: "ai-company-sme-share",
    value: "95%",
    label: "of those UK AI companies are small or medium sized",
    sourceId: "dsit-sector-study-2024",
  },
  {
    id: "ai-employment",
    value: "86,139",
    label: "full-time equivalent people employed in UK AI work in 2024",
    sourceId: "dsit-sector-study-2024",
    caveat: "Up 33% on 2023.",
  },
  {
    id: "economy-2030",
    value: "£400 billion",
    label: "that AI adoption could add to the UK economy by 2030",
    sourceId: "dsit-action-plan",
    caveat:
      "The government's own estimate in the Action Plan, and a projection rather than a measurement. Always written as a possibility.",
  },
] as const

/**
 * Statements about the UK that come from a source but carry no number, so a
 * page can quote the argument without inventing a figure to hang it on.
 */
export const UK_AI_CONTEXT_CLAIMS = {
  /** The Action Plan's own description of the UK's position. */
  thirdLargestMarket:
    "Britain is the third largest AI market in the world, on the government's own assessment in the AI Opportunities Action Plan.",
  /** The frontier companies the Action Plan names as based here. */
  namedCompanies:
    "The Action Plan names Google DeepMind, Arm and Wayve among the companies based in the United Kingdom.",
  /** The warning the same document gives. */
  risksFallingBehind:
    "The same plan warns that the United Kingdom risks falling behind the advances made in the United States and China, and sets out to grow national champions at the frontier.",
} as const

/**
 * Things no page may say, with the reason each one is out.
 *
 * David asked, in good faith, for two of these: that the UK has no large AI
 * companies and no model providers of its own. Both are contradicted by the
 * government's own Action Plan, which names DeepMind, Arm and Wayve. The
 * third is a superlative nobody has measured. The site carries the accurate
 * version of his point instead, and this list exists so the inaccurate
 * version cannot come back in a later copy pass.
 *
 * Each pattern is tested against the rendered text of every marketing
 * surface, with whitespace normalised.
 */
export const UNSUPPORTED_UK_CLAIMS: readonly {
  id: string
  pattern: RegExp
  why: string
}[] = [
  {
    id: "no-large-ai-companies",
    pattern:
      /\b(no|not any|without any|lacks?|lacking)\b[^.]{0,60}\b(large|big|major|frontier)\b[^.]{0,30}\bAI (compan|firm|lab)/i,
    why: "The AI Opportunities Action Plan names Google DeepMind, Arm and Wayve as UK-based, and the 2024 sector study counts 5,862 AI companies here.",
  },
  {
    id: "no-model-providers",
    pattern:
      /\b(no|not any|without any|lacks?|lacking)\b[^.]{0,60}\b(LLM|large language model|model|foundation model)\b[^.]{0,30}\b(provider|maker|builder|developer|compan)/i,
    why: "Contradicted by the same source. Google DeepMind builds frontier models in the United Kingdom.",
  },
  {
    id: "cheapest-way-to-catch-up",
    pattern:
      /\b(cheapest|least expensive|lowest.cost|most cost.effective)\b[^.]{0,80}\b(catch up|close the gap|catching up)\b/i,
    why: "Nobody has measured the cost of the alternatives, so the superlative cannot be supported.",
  },
] as const

/** Look a source up by id, or throw if it is not declared. */
export function ukSource(id: string): UkSource {
  const source = UK_AI_SOURCES.find((s) => s.id === id)
  if (!source) {
    throw new Error(`uk-ai-context: no source with id "${id}"`)
  }
  return source
}

/** Look a figure up by id, or throw if it is not declared. */
export function ukFigure(id: string): UkFigure {
  const figure = UK_AI_FIGURES.find((f) => f.id === id)
  if (!figure) {
    throw new Error(`uk-ai-context: no figure with id "${id}"`)
  }
  return figure
}

/** The source behind a figure, resolved in one call. */
export function ukFigureSource(id: string): UkSource {
  return ukSource(ukFigure(id).sourceId)
}

/**
 * A short citation for a figure, for a mono source line beneath a stat:
 * "ONS, 20 July 2026".
 */
export function ukFigureCitation(id: string): string {
  const source = ukFigureSource(id)
  const short = source.publisher.includes("Office for National Statistics")
    ? "ONS"
    : "DSIT"
  return `${short}, ${source.releasedLabel}`
}
