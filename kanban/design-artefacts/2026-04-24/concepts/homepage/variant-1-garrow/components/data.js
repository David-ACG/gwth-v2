/* Shared content data — verbatim from brand brief §2b + §2c, augmented
   2026-04-27 with real curriculum + pricing pulled from the live site
   source (src/app/(public)/* in this repo). No fabricated proof. */

const JOURNEYS = [
  {
    n: '01',
    tag: 'Worried',
    title: 'You are worried AI will take your job',
    body: 'Someone who knows how to use AI will be more productive than you. This course makes you that person. In three months, you will be the one your team asks for help.',
    accent: 'mint',
    cta: 'See pricing',
    href: '/pricing',
  },
  {
    n: '02',
    tag: 'Reskilling',
    title: 'You have been made redundant and need to reskill',
    body: 'Five hours a week for three months. Every project you build goes in your portfolio. Every score is verifiable. UK employers are hiring for exactly these skills — and only 21% of UK workers feel confident using AI. That gap is your opportunity.',
    accent: 'aqua',
    stat: { value: '21%', label: 'of UK workers feel confident using AI' },
    cta: 'See pricing',
    href: '/pricing',
  },
  {
    n: '03',
    tag: 'Small business',
    title: 'You run a small business',
    body: 'UK micro businesses are 45% less likely to adopt AI than large companies. That is about to change. Five hours a week for three months, and you will not need to hire a developer or pay a consultant — you will be able to do it all yourself.',
    accent: 'mint',
    stat: { value: '45%', label: 'less likely to adopt AI than large companies' },
    cta: 'See pricing',
    href: '/pricing',
  },
  {
    n: '04',
    tag: 'Parent',
    title: 'You are a parent thinking about the future',
    body: 'AI fluency will not be a nice-to-have — it will be table stakes. No coding required. If your teenager can describe what they want, they can build with AI.',
    accent: 'aqua',
    cta: 'Try a free lab',
    href: '/labs',
  },
  {
    n: '05',
    tag: 'Upgrading',
    title: 'You already use AI but know there is more',
    body: "ChatGPT for emails. Claude for first drafts. You suspect you're scratching the surface — and you are. The gap between casual user and capable practitioner is bigger than it looks. Five hours a week for three months, and you will not just use AI — you will design with it, automate with it, ship with it.",
    accent: 'mint',
    cta: 'See pricing',
    href: '/pricing',
  },
  {
    n: '06',
    tag: 'Income',
    title: 'You know AI fluency is now worth more',
    body: 'AI is one of the highest-premium skill sets in the UK job market right now. Three months, every project in your portfolio, every score on your verifiable Dynamic Score. Show up to your next salary conversation — or your next interview — with proof.',
    accent: 'aqua',
    cta: 'See pricing',
    href: '/pricing',
  },
  {
    n: '07',
    tag: 'Team lead',
    title: 'You lead a team and your competitors are moving faster',
    body: 'The bottleneck is not the tools — it is whether your team can actually use them well. The course works for individual employees and for whole teams ready to upskill together. Visit For Teams for syllabus control, admin dashboards, and bespoke modules for 100+.',
    accent: 'mint',
    cta: 'For Teams →',
    href: '/for-teams',
  },
];

/* Three product pillars — wording matches the live site's most-emphasised
   differentiators so the homepage tells one consistent story. */
const PRODUCT_PILLARS = [
  {
    n: '01',
    label: '94 hands-on projects',
    title: 'Three months. Three modules. 94 things you actually build.',
    body: 'Five hours a week. Async-first, so it works around the day job. Every lesson ends with a step-by-step video walkthrough where the instructor builds the project alongside you.',
  },
  {
    n: '02',
    label: 'Dynamic Score',
    title: 'A verifiable credential that updates as you build.',
    body: 'Your Dynamic Score updates as you complete projects, and decays if you stop. Share it on LinkedIn. Employers can verify it on the spot — no PDFs, no faked completion dates.',
  },
  {
    n: '03',
    label: 'No coding required',
    title: 'If you can describe what you want, you can build it.',
    body: 'Plain English in, working AI tools out. We assume zero Python. Tools you already pay for — Claude, ChatGPT, n8n, Zapier — used the way professionals actually use them.',
  },
];

/* Research bodies whose published research GWTH cites. NOT partnerships,
   sponsorships, or affiliations. The strip label is "Built around UK
   research" — these are the sources, not endorsers. */
const RESEARCH_SOURCES = ['DSIT', 'ONS', 'CIPD', 'BCS', 'Tech UK', 'Innovate UK'];

/* Real UK research stats — sourced from UK Government / DSIT research
   alongside the AI Skills Boost programme (Jan 2026). Same stats used on
   the live For Teams page. */
const UK_STATS = [
  { value: '21%', label: 'of UK workers feel confident using AI at work' },
  { value: '1 in 6', label: 'UK businesses were using AI as of mid-2025' },
  { value: '45%', label: 'less likely for micro businesses to adopt AI vs large firms' },
];

/* Real curriculum — from src/lib/config.ts MONTH_CONFIGS via the live
   homepage. 24 + 35 + 35 = 94 total lessons / projects. */
const CURRICULUM = [
  {
    m: 'Month 1',
    t: 'Personal AI Mastery',
    d: '24 lessons · 24 projects',
    capstone: 'Family AI Bot',
    capstoneSub: 'Transcription · task extraction · meal planning · shopping lists',
  },
  {
    m: 'Month 2',
    t: 'Professional & Industry',
    d: '20 mandatory + 15 optional · industry tracks',
    capstone: 'AI Customer-Support Chatbot',
    capstoneSub: 'Production-grade · trained on real business data',
  },
  {
    m: 'Month 3',
    t: 'Enterprise Transformation',
    d: '20 mandatory + 15 optional · multi-agent + governance',
    capstone: 'AI Readiness Assessment Tool',
    capstoneSub: 'Maturity evaluation · roadmap generation',
  },
];

/* Three pricing tiers — exactly matching live /pricing page. */
const PRICING = [
  {
    id: 'free',
    badge: 'Free Labs',
    price: '£0',
    per: 'forever — no card required',
    features: [
      'Access to all free labs',
      'Build real projects with AI',
      'No credit card required',
      'No time limit — free forever',
    ],
    cta: { label: 'Try a Free Lab', href: '/labs', style: 'ghost' },
  },
  {
    id: 'course',
    badge: 'The Course',
    flag: 'Most Popular',
    price: '£29',
    per: '/mo for 3 months · £87 total',
    features: [
      '94 hands-on projects with video walkthroughs',
      '3 portfolio-ready capstone projects',
      'Industry-specific modules for your field',
      'Dynamic scores employers can verify',
      'Content updated every day — never stale',
      'Tech Radar — 60+ tools tracked daily',
      'No ads, no upsells, no hidden tier',
    ],
    cta: { label: 'Join the Waitlist', href: '/signup', style: 'accent2' },
  },
  {
    id: 'stay',
    badge: 'Stay Current',
    price: '£7.50',
    per: '/mo after the course',
    features: [
      'Keep your Dynamic Score current — scores decay if you stop',
      '~5 hours of new content every month',
      'Work through the optional lessons you skipped',
      'New tools added to Tech Radar as they launch',
      'Score history and progression analytics',
      'Cancel anytime — no lock-in',
    ],
    cta: { label: 'Included after course', href: '#', style: 'disabled' },
  },
];

/* Score categories — placeholder, aligned with curriculum modules so it
   does not invent a scoring scheme that does not exist yet. The actual
   scoring system is still TBD. */
const SCORE_CATEGORIES = [
  { l: 'Personal AI', v: 92 },
  { l: 'Professional', v: 78 },
  { l: 'Enterprise', v: 64 },
  { l: 'Tech Radar', v: 71 },
];

const NAV_LINKS = [
  { label: 'Free Labs', href: '/labs' },
  { label: 'Lessons', href: '/lessons' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'For Teams', href: '/for-teams' },
  { label: 'About', href: '/about' },
];

const FOOTER_COLS = [
  {
    title: 'Course',
    links: [
      { label: 'Lessons', href: '/lessons' },
      { label: 'Free Labs', href: '/labs' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Tech Radar', href: '/tech-radar' },
      { label: 'For Teams', href: '/for-teams' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About GWTH', href: '/about' },
      { label: 'Why GWTH', href: '/why-gwth' },
      { label: 'Newsletter', href: '/newsletter' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
];

window.GWTH_DATA = {
  JOURNEYS, PRODUCT_PILLARS, RESEARCH_SOURCES, UK_STATS,
  CURRICULUM, PRICING, SCORE_CATEGORIES, NAV_LINKS, FOOTER_COLS,
};
