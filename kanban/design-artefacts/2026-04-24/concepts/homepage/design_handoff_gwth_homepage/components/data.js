/* Shared content data — verbatim from brand brief §2b + §2c */

const JOURNEYS = [
  {
    n: '01',
    tag: 'Worried',
    title: 'You are worried AI will take your job',
    body: 'Someone who knows how to use AI will be more productive than you. This course makes you that person. In three months, you will be the one your team asks for help.',
    accent: 'mint',
  },
  {
    n: '02',
    tag: 'Reskilling',
    title: 'You have been made redundant and need to reskill',
    body: 'Five hours a week for three months. Every project you build goes in your portfolio. Every score is verifiable. UK employers are hiring for exactly these skills — and only 21% of UK workers feel confident using AI. That gap is your opportunity.',
    accent: 'aqua',
    stat: { value: '21%', label: 'of UK workers feel confident using AI' },
  },
  {
    n: '03',
    tag: 'Small business',
    title: 'You run a small business',
    body: 'UK micro businesses are 45% less likely to adopt AI than large companies. That is about to change. Five hours a week for three months, and you will not need to hire a developer or pay a consultant — you will be able to do it all yourself.',
    accent: 'mint',
    stat: { value: '45%', label: 'less likely to adopt AI than large companies' },
  },
  {
    n: '04',
    tag: 'Parent',
    title: 'You are a parent thinking about the future',
    body: 'AI fluency will not be a nice-to-have — it will be table stakes. No coding required. If your teenager can describe what they want, they can build with AI.',
    accent: 'aqua',
  },
  {
    n: '05',
    tag: 'Upgrading',
    title: 'You already use AI but know there is more',
    body: "ChatGPT for emails. Claude for first drafts. You suspect you're scratching the surface — and you are. The gap between casual user and capable practitioner is bigger than it looks. Five hours a week for three months, and you will not just use AI — you will design with it, automate with it, ship with it.",
    accent: 'mint',
  },
  {
    n: '06',
    tag: 'Income',
    title: 'You know AI fluency is now worth more',
    body: 'AI is one of the highest-premium skill sets in the UK job market right now. Three months, every project in your portfolio, every score on your verifiable Dynamic Score. Show up to your next salary conversation — or your next interview — with proof.',
    accent: 'aqua',
  },
  {
    n: '07',
    tag: 'Team lead',
    title: 'You lead a team and your competitors are moving faster',
    body: 'The bottleneck is not the tools — it is whether your team can actually use them well. The course works for individual employees and for whole teams ready to upskill together. Get in touch about cohort enrolment.',
    accent: 'mint',
    cta: 'Talk about cohorts',
  },
];

const PRODUCT_PILLARS = [
  {
    n: '01',
    label: '3-month curriculum',
    title: 'Three months. Three modules. Built for working adults.',
    body: 'Five hours a week. Async-first, so it works around the day job. Every module ends with a project that goes straight in your portfolio.',
  },
  {
    n: '02',
    label: 'Dynamic Score',
    title: 'A verifiable credential, not a certificate of attendance.',
    body: 'Your Dynamic Score updates as you build, and decays if you stop. Share it on LinkedIn. Employers can verify it on the spot — no PDFs, no faked completion dates.',
  },
  {
    n: '03',
    label: 'No coding required',
    title: 'If you can describe what you want, you can build it.',
    body: 'Plain English in, working AI tools out. We assume zero Python. We expect curiosity, not credentials.',
  },
];

const PROOF_LOGOS = ['CIPD', 'BCS', 'Tech UK', 'FT Future Skills', 'TechNation', 'Innovate UK'];

const FAQS = [
  { q: 'What if I have never used AI before?', a: 'Module one assumes nothing. By the end of week two, you will be using AI tools in your day-to-day work.' },
  { q: 'Will my score really stay current after the course?', a: 'Yes — that is the point. The Dynamic Score reflects what you can do today, not what you finished a year ago.' },
];

window.GWTH_DATA = { JOURNEYS, PRODUCT_PILLARS, PROOF_LOGOS, FAQS };
