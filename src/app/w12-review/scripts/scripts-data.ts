/**
 * The 8 script bake-off options for W12 (populated after generation).
 * Two writers x four lengths: Claude Fable, and Fable refined by ChatGPT 5.5
 * Extra High. Review-only data; deleted with the rest of the scaffolding once
 * David picks the winning script. Generated from the source files, do not
 * hand-edit the array below.
 */
export type ScriptSource = "fable" | "fable-gpt"

export interface ScriptOption {
  /** Target length in seconds. */
  seconds: number
  /** Which writer produced this version. */
  source: ScriptSource
  /** Exact word count of `text`. */
  words: number
  /** The spoken voiceover, plain text. */
  text: string
}

/** Human label for each writer. */
export const SOURCE_LABELS: Record<ScriptSource, string> = {
  fable: "Claude Fable",
  "fable-gpt": "Fable + ChatGPT 5.5 Extra High",
}

/** Natural narration pace used to estimate read time. */
export const WORDS_PER_MINUTE = 135

/** Estimated spoken seconds for a word count at {@link WORDS_PER_MINUTE}. */
export function estimateSeconds(words: number): number {
  return Math.round((words / WORDS_PER_MINUTE) * 60)
}

export const SCRIPT_OPTIONS: ScriptOption[] = [
  {
    seconds: 60,
    source: "fable",
    words: 140,
    text: "Most people use ChatGPT like a search box. Ask a question, get an answer, move on. It can do far more than that, and you don't need to be technical to reach it.\n\nGWTH is a UK applied AI course. Three months, about five hours a week, starting in plain English. No jargon, no coding to begin. You build small apps, automate the work you're tired of repeating, research faster, and make sense of your own data. Every lesson leaves real work behind, evidence you can show, not a certificate going stale in a drawer. And it's independent. No sponsors, no vendor deals, just the work.\n\nThe whole course rests on one idea. If you can describe what you want, you can begin to build it.\n\nStart free, with real labs and no card needed. Have a look at gwth.ai.",
  },
  {
    seconds: 60,
    source: "fable-gpt",
    words: 150,
    text: "Most people use ChatGPT like a search box. Ask, get an answer, move on. GWTH is for people who know there is more.\n\nGWTH is a UK-focused applied AI course for adults across the AI spectrum: reskillers, small-business owners, parents, team leads, and ChatGPT users.\n\nOver three months, about five hours a week, it moves from plain English into applied work. No jargon. No coding required to begin. As you go, building and AI-assisted coding become the spine.\n\nYou build small apps, automate repetitive work, research faster, and make sense of your own data. Every lesson and project leaves real work behind. Portfolio evidence you can show. The credential is verifiable and stays current, not a stale PDF. Independent. No sponsors. No vendor partnerships.\n\nIf you can describe what you want, you can begin to build it.\n\nStart free, with real labs. No card needed. Have a look at gwth.ai.",
  },
  {
    seconds: 90,
    source: "fable",
    words: 212,
    text: "Most people use AI like a search box. Type a question, get an answer, move on. That is barely the start of what it can do.\n\nGWTH is an applied AI course for UK adults, beginner to advanced, over three months at about five hours a week. It starts in plain English. No jargon, no coding needed to begin. As you go, building becomes the spine of the course, and the AI helps you write the code.\n\nYou will not sit through theory. You build small apps. You automate the work that eats your week. You research faster, and you make sense of your own data. Every lesson leaves real work behind, evidence you can actually show.\n\nThat matters, because the internet is full of certificates that prove nothing. Ours is verifiable, and it stays current, not a stale PDF.\n\nWe are independent. No sponsors, no vendor deals. Just one idea, taught properly. If you can describe what you want, you can begin to build it.\n\nYou can start free, with real labs and no card. After that it is twenty-nine pounds a month, paid a month at a time, and you stop whenever you like.\n\nIf that sounds like the serious one, come and take a look. We are at gwth.ai.",
  },
  {
    seconds: 90,
    source: "fable-gpt",
    words: 221,
    text: "Most people use AI like a search box. Type a question, get an answer, move on. That is useful, but it is only the start.\n\nGWTH is a UK-focused applied AI course for adults, from beginner to advanced. It is for reskillers, small-business owners, parents, team leads, and people already using ChatGPT who know they are only scratching the surface.\n\nThe course runs over three months, about five hours a week, in monthly parts. It starts in plain English, with no jargon and no coding required to begin. As you go, building and AI-assisted coding become the spine.\n\nYou build small apps. You automate repetitive work. You research faster, and make sense of your own data. Real artefacts, not theory.\n\nEvery lesson and project leaves evidence you can show. GWTH is built against certificate mills. The credential is verifiable and stays current, rather than becoming a stale PDF.\n\nWe are independent. No sponsors. No vendor partnerships. UK-grounded, and taught plainly.\n\nIf you can describe what you want, you can begin to build it.\n\nYou can start free, with real labs and no card. Course access is £29 a month, paid a month at a time, and you can stop whenever. After the course, staying current is optional at £7.50 a month.\n\nTake a quiet look when you are ready, at gwth.ai.",
  },
  {
    seconds: 100,
    source: "fable",
    words: 226,
    text: "Most people use ChatGPT like a search box. Type a question, get an answer, move on. That works, but it barely scratches the surface of what these tools can do.\n\nGWTH is an applied AI course for UK adults, built to take you from that first prompt to serious, useful work. It runs for three months, about five hours a week, in monthly parts. It starts in plain English. No jargon, and no coding needed to begin. Building comes later, and by the end it is the spine of the course.\n\nYou do not sit through theory. You build small apps. You automate the jobs you repeat every week. You research faster, and you make sense of your own data. Every lesson leaves real work behind, evidence you can actually show, not a certificate that goes stale in a drawer. The credential is verifiable, and it stays current.\n\nWe are independent. No sponsors, no vendor deals, just what works.\n\nYou can start free, with real labs and no card. If it suits you, course access is £29 a month, paid a month at a time, and you can stop whenever you like.\n\nHere is the promise the whole course rests on. If you can describe what you want, you can begin to build it.\n\nIf that sounds like you, come and take a look at gwth.ai.",
  },
  {
    seconds: 100,
    source: "fable-gpt",
    words: 243,
    text: "Most people use ChatGPT like a search box. Ask a question, get an answer, move on.\n\nThat is useful. It is not the real shift.\n\nGWTH is a UK-focused applied AI course for adults who want to do serious, practical work with these tools. It is for reskillers, small-business owners, parents, team leads, and people already using ChatGPT who know they are only scratching the surface.\n\nThe course runs over three months, about five hours a week, in monthly parts. It starts in plain English, with no jargon and no coding required to begin. As you go, building and AI-assisted coding become the spine of the work.\n\nYou build small apps. You automate repetitive workflows. You research faster. You make sense of your own data.\n\nThe point is not to collect theory. It is to leave with real artefacts, real evidence, and work you can show.\n\nGWTH is built against certificate mills. Every lesson and project leaves something behind. The credential is verifiable, and it stays current rather than becoming a stale PDF.\n\nWe are independent. No sponsors. No vendor partnerships. UK-grounded, and focused on what works.\n\nYou can start free, with real labs and no card. Course access is £29 a month, paid month by month, and you can stop whenever you like. After the course, staying current is optional.\n\nIf you can describe what you want, you can begin to build it.\n\nTake a look, when you are ready, at gwth.ai.",
  },
  {
    seconds: 120,
    source: "fable",
    words: 270,
    text: "Most people I know use AI the same way. They open ChatGPT, type a question, get an answer, and close the tab. It works, more or less. But it is a small fraction of what these tools can do.\n\nGWTH is for people who suspect exactly that. It is a UK course in applied AI, for adults at every level. Reskillers, small-business owners, parents, team leads, and people who use ChatGPT every day but sense they are only scratching the surface.\n\nIt runs for three months, about five hours a week, in monthly parts. It starts in plain English, no jargon, and no coding to begin. As you go, building becomes the spine of the course, with AI-assisted coding alongside.\n\nAnd you do build. Small apps. Automations for the repetitive work that eats your week. Faster research. Real sense of your own data. Every lesson leaves something behind that you can show. Not notes, not theory. Evidence.\n\nThat matters, because the internet is full of certificates that mean very little. Ours is verifiable, and it stays current rather than becoming a stale PDF. We are independent too. No sponsors, no vendor partnerships. Just the work.\n\nThe whole course rests on one idea, and you meet it in the very first lesson. If you can describe what you want, you can begin to build it.\n\nYou can start free, with real labs and no card. After that it is £29 a month, paid a month at a time, and you can stop whenever you like.\n\nIf that sounds like the way you want to learn, come and see us at gwth.ai.",
  },
  {
    seconds: 120,
    source: "fable-gpt",
    words: 282,
    text: "Most people start with AI in the same place. They open ChatGPT, type a question, get an answer, and close the tab. That can be useful. But it is not yet serious applied work.\n\nGWTH is built for people who feel that gap. It is a UK-focused applied AI course, for beginners through to people who already use the tools and want to go further. Reskillers, small-business owners, parents, team leads, and adults who suspect they are only scratching the surface.\n\nThe course runs over three months, about five hours a week, in monthly parts. It starts in plain English. No jargon. No coding required to begin. Then building becomes the spine of the work, with AI-assisted coding alongside you as you go.\n\nYou build small apps. You automate repetitive workflows. You research faster. You make sense of your own data. Not as theory, and not as a set of notes you forget later. Each lesson and project leaves real work behind, with portfolio evidence you can show.\n\nThat is why GWTH is built against certificate mills. The credential is verifiable, and it stays current rather than sitting there as a stale PDF. GWTH is independent too. No sponsors. No vendor partnerships. UK-grounded, and focused on the work.\n\nThe promise is simple. If you can describe what you want, you can begin to build it.\n\nYou can start free, with real labs and no card. Course access is £29 a month, paid month by month, and you can stop whenever. After the course, there is an optional £7.50 a month if you want to stay current.\n\nIf this feels like the way you want to learn, come and see GWTH at gwth.ai.",
  },
]
