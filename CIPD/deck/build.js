// GWTH x CIPD deck for the 20 Aug 2026 call with Lizzie Crowley.
// Palette = the GWTH style bible (bible/bible.yaml, item "cutout-image-register").
const pptxgen = require("pptxgenjs");
const fs = require("fs");

const TEAL = "2C4A47", MOSS = "2A4530", RUST = "A94C2E", MUSTARD = "C08A36";
const INK = "201C17", CREAM = "FAF6EF", PAPER = "ECE8D2", MUTED = "63655F", WHITE = "FFFFFF", LINE = "DDD8CB";
const HEAD = "Cambria", BODY = "Calibri";

const logo = "image/png;base64," + fs.readFileSync("/home/david/projects/GWTH_V2/public/logo-email.png").toString("base64");
const logoDark = "image/png;base64," + fs.readFileSync("/home/david/projects/GWTH_V2/CIPD/deck/logo-dark-transparent.png").toString("base64");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.author = "David Uccelli";
pres.title = "GWTH x CIPD";

const W = 13.33;

function chrome(slide, n, dark) {
  slide.background = { color: dark ? TEAL : WHITE };
  slide.addImage({ data: dark ? logoDark : logo, x: 0.6, y: 6.85, w: 1.3, h: 0.23 });
  slide.addText(`${n} / 10`, { x: W - 1.6, y: 6.8, w: 1.0, h: 0.3, fontFace: BODY, fontSize: 10, color: dark ? PAPER : MUTED, align: "right", margin: 0 });
}
function title(slide, t, dark, sub) {
  slide.addText(t, { x: 0.6, y: 0.45, w: W - 1.2, h: 0.8, fontFace: HEAD, fontSize: 30, bold: true, color: dark ? CREAM : INK, margin: 0, valign: "top" });
  if (sub) slide.addText(sub, { x: 0.6, y: 1.2, w: W - 1.2, h: 0.45, fontFace: BODY, fontSize: 15, italic: true, color: dark ? PAPER : MUTED, margin: 0, valign: "top" });
}
function card(slide, x, y, w, h, fill) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill || CREAM }, line: { color: LINE, width: 0.75 }, rectRadius: 0.08 });
}
function dot(slide, x, y, color, label) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: 0.42, h: 0.42, fill: { color }, line: { color, width: 0 } });
  slide.addText(label, { x, y, w: 0.42, h: 0.42, fontFace: BODY, fontSize: 14, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
}
function bullets(slide, items, o) {
  slide.addText(items.map((t, i) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: i < items.length - 1, paraSpaceAfter: o.gap ?? 6 } })),
    { x: o.x, y: o.y, w: o.w, h: o.h, fontFace: BODY, fontSize: o.size || 14, color: o.color || INK, valign: "top", margin: 0 });
}

// ---------- 1 Title ----------
{
  const s = pres.addSlide();
  s.background = { color: TEAL };
  s.addImage({ data: logoDark, x: 0.8, y: 0.8, w: 3.2, h: 0.56 });
  s.addText("A foundation layer for the HR profession, and the people it supports", { x: 0.8, y: 2.1, w: 9.2, h: 2.3, fontFace: HEAD, fontSize: 38, bold: true, color: CREAM, margin: 0, valign: "top" });
  s.addText("Growth With Tech and Humans. AI suggests, humans decide.", { x: 0.8, y: 4.55, w: 10, h: 0.5, fontFace: BODY, fontSize: 20, italic: true, color: MUSTARD, margin: 0 });
  s.addText([
    { text: "Conversation with Lizzie Crowley, CIPD skills adviser", options: { breakLine: true } },
    { text: "Thursday 20 August 2026, 11:00   |   David Uccelli, founder, gwth.ai", options: {} },
  ], { x: 0.8, y: 5.7, w: 10, h: 0.8, fontFace: BODY, fontSize: 14, color: PAPER, margin: 0 });
  s.addShape(pres.shapes.OVAL, { x: 11.4, y: 0.9, w: 1.2, h: 1.2, fill: { color: RUST }, line: { color: RUST, width: 0 } });
  s.addShape(pres.shapes.OVAL, { x: 10.6, y: 4.4, w: 2.0, h: 2.0, fill: { color: MUSTARD }, line: { color: MUSTARD, width: 0 } });
  s.addShape(pres.shapes.OVAL, { x: 12.2, y: 3.2, w: 0.6, h: 0.6, fill: { color: MOSS }, line: { color: MOSS, width: 0 } });
  s.addNotes("Thank Lizzie for the time; Ben says she has been through the government AI skills hub courses and was not impressed. Two aims for the call: (1) an objective benchmark of GWTH against what the hub offers, (2) test the CIPD-curated edition idea that Ben raised on WhatsApp, so it can be built and shown the week after.");
}

// ---------- 2 What GWTH is ----------
{
  const s = pres.addSlide(); chrome(s, 2);
  title(s, "What GWTH is", false, "A three-month, practical AI course for working adults in the UK. Built to be done in five hours a week, with a project in every lesson.");
  const stats = [["3", "months,\n5 hrs a week"], ["96", "lessons: 66 core,\n30 optional by role"], ["1", "practical project\nin every lesson"], ["3", "capstone apps\nyou keep"]];
  stats.forEach((st, i) => {
    const x = 0.6 + i * 3.08;
    card(s, x, 1.85, 2.85, 1.55);
    s.addText(st[0], { x: x + 0.2, y: 1.9, w: 1.1, h: 1.4, fontFace: HEAD, fontSize: 48, bold: true, color: RUST, margin: 0, valign: "middle" });
    s.addText(st[1], { x: x + 1.3, y: 1.95, w: 1.5, h: 1.35, fontFace: BODY, fontSize: 13, color: INK, margin: 0, valign: "middle" });
  });
  const months = [
    ["Month 1", "From zero to building", "AI for your own life and job. The six things AI is good at: research, content, thinking, building, data, automation. Capstone: Family AI Bot.", TEAL],
    ["Month 2", "Building real apps", "Work and small-business use: apps, workflows, consulting. Optional lessons by role (HR, finance, building). Capstone: AI customer-support chatbot.", MOSS],
    ["Month 3", "Enterprise AI and agents", "Transformation, governance, change management, team structures, managing agents. Capstone: AI readiness assessment tool for a whole organisation.", RUST],
  ];
  months.forEach((m, i) => {
    const x = 0.6 + i * 4.1;
    card(s, x, 3.7, 3.9, 2.15, WHITE);
    s.addShape(pres.shapes.RECTANGLE, { x: x + 0.25, y: 3.95, w: 0.9, h: 0.32, fill: { color: m[3] }, line: { color: m[3], width: 0 } });
    s.addText(m[0], { x: x + 0.25, y: 3.95, w: 0.9, h: 0.32, fontFace: BODY, fontSize: 11, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
    s.addText(m[1], { x: x + 1.3, y: 3.88, w: 2.5, h: 0.45, fontFace: HEAD, fontSize: 14, bold: true, color: INK, margin: 0, valign: "middle" });
    s.addText(m[2], { x: x + 0.25, y: 4.4, w: 3.45, h: 1.4, fontFace: BODY, fontSize: 12, color: INK, margin: 0, valign: "top" });
  });
  s.addText([
    { text: "Also: ", options: { bold: true } },
    { text: "Model Arena labs (live side-by-side model comparisons, free). A verifiable record of what you built, which decays if you stop keeping current. UK examples throughout. No coding required. £29 a month for three months, then £7.50 a month to stay current. Beta is free." },
  ], { x: 0.6, y: 6.0, w: W - 1.2, h: 0.7, fontFace: BODY, fontSize: 12.5, color: MUTED, margin: 0, valign: "top" });
  s.addNotes("Keep to two minutes; Lizzie has not seen the site. Lesson counts come from the live course config (66 core + 30 optional). No coding is written anywhere in the course: it is about the principles and habits of using AI well, not a particular tool. Steve liked exactly that: it does not matter whether someone uses Claude, ChatGPT or Copilot.");
}

// ---------- 3 Why it was set up ----------
{
  const s = pres.addSlide(); chrome(s, 3);
  title(s, "Why I set it up", false, "It started two years ago as the course I wanted for myself. People kept asking for it, so it became a real one.");
  card(s, 0.6, 1.85, 6.2, 4.8);
  s.addText("The gap I kept running into", { x: 0.9, y: 2.0, w: 5.7, h: 0.45, fontFace: HEAD, fontSize: 18, bold: true, color: TEAL, margin: 0 });
  bullets(s, [
    "Most of what is on offer is one of two things: a 20-minute awareness video from a US vendor, or a university course on how to build a large language model. Almost nobody needs either.",
    "Much of it is one to three years old, and in AI that is a different era. Anything that is not updated continuously is teaching the wrong thing.",
    "Little of it is written from a UK point of view: UK tax, UK law, UK employers, UK public services.",
    "Hardly any of it asks you to build something, and none of it gives you proof that still means something six months later.",
  ], { x: 0.9, y: 2.55, w: 5.7, h: 3.9, size: 13, gap: 8 });
  card(s, 7.1, 1.85, 5.63, 4.8, WHITE);
  s.addText("So GWTH was built to be", { x: 7.4, y: 2.0, w: 5.1, h: 0.45, fontFace: HEAD, fontSize: 18, bold: true, color: RUST, margin: 0 });
  const ps = [["Affordable for everyone", "You know what you pay and what you get. The price drops once the teaching is done."],
    ["Practical and proven", "You build in every lesson, keep what you build, and the record is verifiable by an employer."],
    ["Kept current", "Around ten lessons refreshed every month. The record decays if you do not keep up, on purpose."],
    ["Independent and plain-spoken", "No sponsors, no vendor curriculum, British English, no hype. Built by a UK solution architect with 25 years in enterprise software."]];
  ps.forEach((p, i) => {
    const y = 2.6 + i * 0.98;
    dot(s, 7.4, y + 0.02, [TEAL, MOSS, MUSTARD, RUST][i], String(i + 1));
    s.addText(p[0], { x: 7.95, y, w: 4.6, h: 0.3, fontFace: BODY, fontSize: 14, bold: true, color: INK, margin: 0 });
    s.addText(p[1], { x: 7.95, y: y + 0.3, w: 4.6, h: 0.62, fontFace: BODY, fontSize: 12, color: MUTED, margin: 0, valign: "top" });
  });
  s.addNotes("Origin: started about two years ago, lightly, only to learn AI myself; people asked for it, so it became a proper course. Background: 25 years as an enterprise solution architect (currently at Amazon), building real systems and explaining hard things plainly. The government hub and most vendor content was exactly what this was meant to compete with: affordable, you know the level you reach, constantly updated, and it does not go into building LLMs because only a few hundred people in the UK want that.");
}

// ---------- 4 Benchmark vs the government hub ----------
{
  const s = pres.addSlide(); chrome(s, 4);
  title(s, "How it benchmarks against the government AI hub", false, "Your honest view on this is the thing I most want from today. Here is how I see it.");
  const rows = [
    ["", "AI Skills Hub (Boost + Marketplace)", "GWTH"],
    ["Who made it", "Mostly US vendors: Google, Microsoft, Amazon, IBM", "Independent, UK-built, vendor-neutral"],
    ["Depth", "20 minutes to 9 hours per course", "120+ hours over three months"],
    ["Hands-on", "Mostly watch-and-click", "A project in every lesson, three capstone apps"],
    ["Currency", "Some content years old", "Continuous updates; the record decays if you stop"],
    ["Proof", "Completion badge", "Verifiable record of work, currentness built in"],
    ["UK context", "Generic", "UK examples, law, tax, public services"],
    ["Finding it", "600+ listings to choose from", "One path, with optional lessons by role"],
  ];
  const colW = [2.2, 4.85, 4.85];
  const tbl = rows.map((r, ri) => r.map((c, ci) => ({
    text: c,
    options: {
      fontFace: BODY, fontSize: ri === 0 ? 13 : 12.5, bold: ri === 0 || ci === 0, color: ri === 0 ? WHITE : (ci === 2 ? TEAL : INK),
      fill: { color: ri === 0 ? TEAL : (ri % 2 ? WHITE : CREAM) }, valign: "middle", margin: [4, 8, 4, 8],
    },
  })));
  s.addTable(tbl, { x: 0.6, y: 1.85, w: 11.9, colW, rowH: 0.48, border: { type: "solid", color: LINE, pt: 0.75 } });
  s.addText([
    { text: "Context: ", options: { bold: true } },
    { text: "21% of UK workers feel confident using AI at work (DSIT, published Jan 2026, fieldwork 2024). 29% of UK businesses used at least one AI technology in June 2026 (ONS, July 2026). The hub has the reach; the question is whether the content changes either number." },
  ], { x: 0.6, y: 6.0, w: W - 1.2, h: 0.7, fontFace: BODY, fontSize: 12, color: MUTED, margin: 0, valign: "top" });
  s.addNotes("Ask Lizzie to correct anything here: she has actually been through the hub courses, I have only benchmarked them from the outside. Ask what the hub's listing criteria are and whether a UK independent course could be listed. Ben's read on the call: the hub promotes the big-vendor courses, and a CIPD link would be a trusted filter for members amid 'so much out there'.");
}

// ---------- 5 What we heard on 27 July ----------
{
  const s = pres.addSlide(); chrome(s, 5, true);
  title(s, "What I took from the 27 July call with CIPD", true, "CIPD is rebuilding its AI learning around 14 products, mostly virtual classroom and face-to-face. The gap is underneath them.");
  const quotes = [
    ["“We're getting people coming in thinking they're better than they are, or with different fundamental understandings to other people in the room.”", "The baseline problem before any classroom course"],
    ["“Something like what you've shown here could be a fantastic precursor to people going on some of those courses.”", "GWTH as the foundation layer"],
    ["“It's a real danger that we miss that building block, that foundational skill level and thinking level that needs to underpin all that practice.”", "The risk Steve is taking into his October plan"],
    ["“The reason you're a CIPD member is because we can lift you up with really trusted, high quality support.”", "Ben, on why a member benefit could fit"],
  ];
  quotes.forEach((q, i) => {
    const x = 0.6 + (i % 2) * 6.15, y = 1.85 + Math.floor(i / 2) * 2.25;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 5.95, h: 2.1, fill: { color: "3A5C58" }, line: { color: "3A5C58", width: 0 }, rectRadius: 0.08 });
    s.addText(q[0], { x: x + 0.3, y: y + 0.2, w: 5.35, h: 1.3, fontFace: HEAD, fontSize: 14.5, italic: true, color: CREAM, margin: 0, valign: "top" });
    s.addText(q[1], { x: x + 0.3, y: y + 1.5, w: 5.35, h: 0.45, fontFace: BODY, fontSize: 12, bold: true, color: MUSTARD, margin: 0, valign: "top" });
  });
  s.addText("Also agreed: CIPD does not promote other organisations' work, but a member benefit is a membership decision; Steve and I reconvene late October / early November once the new CEO has set direction; NDA plus a demo account for Steve to review the full syllabus.", { x: 0.6, y: 6.3, w: W - 1.2, h: 0.5, fontFace: BODY, fontSize: 11.5, color: PAPER, margin: 0, valign: "top" });
  s.addNotes("Steve's own list of their suite: a one-day Foundations of AI for HR plus literacy day (public sector demand), a generic generative AI course with an assistants-and-agents follow-on, seven specialist courses (recruitment, analytics, performance management, people management and so on), two senior leadership courses (AI strategy, leading implementation), and a responsible-use satellite in January. Their two-day intro with prompt engineering has 'dropped off a cliff'. Their two self-directed courses get very low uptake. Delivery is via about 60 associates who refresh content just before they teach. So: the self-directed foundation, kept current automatically, is the piece they do not have.");
}

// ---------- 6 Ben's four objectives ----------
{
  const s = pres.addSlide(); chrome(s, 6);
  title(s, "Ben's four objectives, mapped to the course", false, "From Ben's message of 12 August. The content is there; what changes is the framing and the path through it.");
  const rows = [
    ["CIPD wants to help…", "Where it lives in GWTH today", "What a CIPD edition adds"],
    ["members use AI to do their HR roles better", "Month 1: the six things AI is good at, applied to your own job; every lesson ends in a built, kept artefact", "HR-flavoured examples and projects chosen from the existing bank; the first lab is already 'Write a job advert: Claude vs ChatGPT'"],
    ["HR functions become more efficient while managing people risks such as discrimination, as operating models change", "Months 2 and 3: workflows and apps for the function; governance, change management, how teams and managers change when people manage agents", "A CIPD-curated 'responsible use and people risk' strand written with CIPD guidance, kept current on the same monthly cycle"],
    ["HR directors and OD lead responsible, integrated AI adoption across the business", "Month 3: enterprise AI, agents, self-hosted AI, ROI; capstone is an AI readiness assessment of a whole organisation", "A senior-leader path: the Month 3 core as the pre-read before CIPD's strategy and leading-implementation courses"],
    ["organisations upskill their whole workforce to use AI in their jobs", "The whole course is role-agnostic by design; the Teams dashboard assigns optional lessons per role and tracks completion", "Members and their employers join through CIPD; each record shows the level reached before a classroom course"],
  ];
  const tbl = rows.map((r, ri) => r.map((c, ci) => ({
    text: c,
    options: { fontFace: BODY, fontSize: ri === 0 ? 13 : 11.5, bold: ri === 0 || ci === 0, color: ri === 0 ? WHITE : (ci === 2 ? RUST : INK),
      fill: { color: ri === 0 ? TEAL : (ci === 1 ? CREAM : WHITE) }, valign: "middle", margin: [5, 9, 5, 9] },
  })));
  s.addTable(tbl, { x: 0.6, y: 1.85, w: 12.1, colW: [3.2, 4.45, 4.45], rowH: [0.45, 0.98, 1.08, 0.98, 0.98], border: { type: "solid", color: LINE, pt: 0.75 } });
  s.addNotes("Do not oversell the third column: the left two columns exist today, the right column is what I would build for a CIPD edition. Steve specifically named the responsible-use gap alongside the baseline gap as the two risks to his portfolio, so the 'people risk' strand is worth drawing out. Month 1 is where the 'do your own job better' promise lands; Steve agreed it applies to HR practitioners without a separate course per role.");
}

// ---------- 7 From Teams to Curated ----------
{
  const s = pres.addSlide(); chrome(s, 7);
  title(s, "The idea: from 'Teams' to 'Curated by CIPD'", false, "Teams already gives an employer its own dashboard and a choice of optional lessons. A curated edition turns that into a co-branded path a partner shapes.");
  // left: layered diagram
  const lx = 0.6, ly = 1.9;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: lx, y: ly, w: 5.6, h: 4.6, fill: { color: CREAM }, line: { color: LINE, width: 0.75 }, rectRadius: 0.1 });
  s.addText("CIPD edition (wrapper)", { x: lx + 0.25, y: ly + 0.15, w: 5.1, h: 0.35, fontFace: BODY, fontSize: 13, bold: true, color: RUST, margin: 0 });
  s.addText("Co-branded GWTH and CIPD. CIPD framing pages, CIPD research woven in, member pricing.", { x: lx + 0.25, y: ly + 0.5, w: 5.1, h: 0.55, fontFace: BODY, fontSize: 11, color: MUTED, margin: 0, valign: "top" });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: lx + 0.25, y: ly + 1.15, w: 5.1, h: 3.2, fill: { color: WHITE }, line: { color: LINE, width: 0.75 }, rectRadius: 0.1 });
  s.addText("Curated paths (Teams engine)", { x: lx + 0.5, y: ly + 1.28, w: 4.6, h: 0.35, fontFace: BODY, fontSize: 13, bold: true, color: TEAL, margin: 0 });
  s.addText("Which lessons are core for an HR practitioner, an HRD, a recruiter; which optional lessons are switched on; the record shows the baseline reached.", { x: lx + 0.5, y: ly + 1.63, w: 4.6, h: 0.6, fontFace: BODY, fontSize: 11, color: MUTED, margin: 0, valign: "top" });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: lx + 0.5, y: ly + 2.3, w: 4.6, h: 1.8, fill: { color: TEAL }, line: { color: TEAL, width: 0 }, rectRadius: 0.1 });
  s.addText("GWTH core", { x: lx + 0.75, y: ly + 2.42, w: 4.1, h: 0.35, fontFace: BODY, fontSize: 13, bold: true, color: CREAM, margin: 0 });
  s.addText("96 lessons, labs, projects, the record, monthly updates. One body of content, maintained once, served through every wrapper.", { x: lx + 0.75, y: ly + 2.78, w: 4.1, h: 1.2, fontFace: BODY, fontSize: 11, color: PAPER, margin: 0, valign: "top" });
  // right: what CIPD controls
  s.addText("What CIPD would control", { x: 6.7, y: 1.9, w: 6.0, h: 0.4, fontFace: HEAD, fontSize: 18, bold: true, color: INK, margin: 0 });
  const items = [
    ["Look", "Co-branded so it reads as CIPD-curated"],
    ["Path", "Which lessons are core per HR role, which are optional; a senior-leader path"],
    ["Voice", "CIPD framing at the start of each month, CIPD research and guidance cited inside lessons"],
    ["People", "Member access and pricing"],
    ["Proof", "The certificate says the student took the CIPD pathway"],
    ["Hand-off", "Each path ends by pointing to the matching CIPD or partner course"],
  ];
  items.forEach((it, i) => {
    const y = 2.4 + i * 0.68;
    s.addShape(pres.shapes.OVAL, { x: 6.7, y: y + 0.04, w: 0.34, h: 0.34, fill: { color: [TEAL, MOSS, MUSTARD, RUST, TEAL, MOSS][i] }, line: { width: 0 } });
    s.addText(it[0], { x: 7.2, y, w: 1.1, h: 0.42, fontFace: BODY, fontSize: 13, bold: true, color: INK, margin: 0, valign: "middle" });
    s.addText(it[1], { x: 8.3, y, w: 4.4, h: 0.6, fontFace: BODY, fontSize: 11.5, color: MUTED, margin: 0, valign: "top" });
  });
  s.addNotes("This is the 'different wrapper' Ben suggested on 12 August. Be clear what exists: the Teams page promises a dashboard, per-role optional lessons and bespoke lessons for 100+ seats; the curated-edition layer on top (co-branding, paths, the CIPD pathway on the certificate, hand-offs) is what I will build and show the week after this call. Not white-labelled: it stays visibly GWTH, co-branded with CIPD. No cohorts in the first version (too much to manage); the tooling for employer cohorts with a dashboard could be built later if CIPD wants it. The whole point is that CIPD does not write or maintain the lessons: one core, updated monthly, many wrappers.");
}

// ---------- 8 Foundation flow ----------
{
  const s = pres.addSlide(); chrome(s, 8);
  title(s, "A foundation for CIPD and partner courses", false, "The flow Steve described: people arrive on a classroom course at a known level, and stay current afterwards.");
  const steps = [
    ["1", "Member joins the CIPD edition", "Self-directed, five hours a week, from anywhere. Starts with the Month 1 foundation or a CIPD-chosen path.", TEAL],
    ["2", "Builds and banks proof", "A project in every lesson; the record shows what was built and how current it is.", MOSS],
    ["3", "Baseline visible to the tutor", "Before a CIPD virtual-classroom or specialist course, each student's record shows the level reached. No more mixed rooms.", MUSTARD],
    ["4", "Specialist and leadership courses", "CIPD's 14 products and partner courses build on the foundation instead of re-teaching it.", RUST],
    ["5", "Stays current", "£7.50 a month keeps the updates coming; the record decays if they stop. Currency becomes visible.", TEAL],
  ];
  steps.forEach((st, i) => {
    const x = 0.6 + i * 2.46;
    card(s, x, 2.1, 2.3, 3.3, i === 3 ? CREAM : WHITE);
    dot(s, x + 0.25, 2.3, st[3], st[0]);
    s.addText(st[1], { x: x + 0.25, y: 2.85, w: 1.85, h: 0.7, fontFace: BODY, fontSize: 13.5, bold: true, color: INK, margin: 0, valign: "top" });
    s.addText(st[2], { x: x + 0.25, y: 3.6, w: 1.85, h: 1.7, fontFace: BODY, fontSize: 11.5, color: MUTED, margin: 0, valign: "top" });
    if (i < 4) s.addText("›", { x: x + 2.27, y: 3.4, w: 0.25, h: 0.5, fontFace: BODY, fontSize: 28, color: LINE, align: "center", margin: 0 });
  });
  s.addText([
    { text: "Why this works for CIPD: ", options: { bold: true, color: TEAL } },
    { text: "CIPD keeps its market (classroom, face-to-face, associates who stay current) and plugs the two gaps Steve named, the baseline and responsible use, without building and maintaining self-directed content. Why it works for GWTH: distribution to the profession that most needs it, and a trusted name on the door." },
  ], { x: 0.6, y: 5.7, w: W - 1.2, h: 0.95, fontFace: BODY, fontSize: 12.5, color: INK, margin: 0, valign: "top" });
  s.addNotes("Ben: 'I thought about what Steve said and will lean into being the foundation for other AI courses, mainly as it would be great marketing.' This slide is that. The hand-off at the end of each path can point at CIPD's own courses or partner courses, and a visible per-student baseline is the thing Steve does not have today.");
}

// ---------- 9 Asks ----------
{
  const s = pres.addSlide(); chrome(s, 9);
  title(s, "What I would value from you", false, "Ben said you know the hub well and are well connected in skills policy. Four things I would like to ask.");
  const asks = [
    ["An objective benchmark", "Where does GWTH sit against the hub's courses, honestly? What is missing, what is wrong, what would you cut?", TEAL],
    ["The route onto the hub", "Who lists courses on the government AI skills hub, on what criteria, and is there room for a UK independent course?", MOSS],
    ["Policy contacts", "Anyone in the skills-policy world who should see a UK, affordable, practical, continuously updated course, including around CIPD's AI adoption research.", MUSTARD],
    ["A member-benefit view", "If the CIPD edition were ready, what would the membership team need to see to consider it?", RUST],
  ];
  asks.forEach((a, i) => {
    const x = 0.6 + (i % 2) * 6.15, y = 1.9 + Math.floor(i / 2) * 2.3;
    card(s, x, y, 5.95, 2.1, i % 3 === 0 ? CREAM : WHITE);
    dot(s, x + 0.3, y + 0.3, a[2], String(i + 1));
    s.addText(a[0], { x: x + 0.9, y: y + 0.28, w: 4.8, h: 0.45, fontFace: HEAD, fontSize: 17, bold: true, color: INK, margin: 0, valign: "middle" });
    s.addText(a[1], { x: x + 0.9, y: y + 0.85, w: 4.8, h: 1.1, fontFace: BODY, fontSize: 12.5, color: MUTED, margin: 0, valign: "top" });
  });
  s.addText("In return: beta access is free, and a full demo account under NDA is yours and Steve's to go through the whole syllabus.", { x: 0.6, y: 6.45, w: W - 1.2, h: 0.35, fontFace: BODY, fontSize: 12, italic: true, color: MUTED, margin: 0 });
  s.addNotes("Ben's WhatsApp: 'She is also very well connected in skills policy circles on AI adoption so might be able to connect you to some useful contacts.' He also mentioned CIPD's upcoming meeting with the new business secretary on AI adoption research. Listen more than talk on this slide.");
}

// ---------- 10 Next steps ----------
{
  const s = pres.addSlide(); chrome(s, 10, true);
  title(s, "Possible next steps", true, "Fast and concrete. Nothing here needs a decision from CIPD today.");
  const steps = [
    ["Step 1", "Build the CIPD-curated edition prototype: co-branding, an HR path, a senior-leader path, the CIPD pathway on the certificate."],
    ["Step 2", "Show it to Ben and Lizzie; fold in today's benchmark feedback; NDA and demo account for Steve to review the full syllabus."],
    ["Step 3", "Soft launch with friends, then the waitlist. Feedback from real use before anything is promoted."],
    ["Step 4", "Late October / early November: reconvene with Steve once the new CEO has set direction; the baseline gap is in his October plan."],
  ];
  steps.forEach((st, i) => {
    const y = 1.9 + i * 1.05;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y, w: 2.6, h: 0.85, fill: { color: [RUST, MUSTARD, MOSS, "3A5C58"][i] }, line: { width: 0 }, rectRadius: 0.08 });
    s.addText(st[0], { x: 0.75, y, w: 2.35, h: 0.85, fontFace: BODY, fontSize: 14, bold: true, color: WHITE, margin: 0, valign: "middle" });
    s.addText(st[1], { x: 3.45, y, w: 9.2, h: 0.85, fontFace: BODY, fontSize: 14, color: CREAM, margin: 0, valign: "middle" });
  });
  s.addText("gwth.ai   |   david@agilecommercegroup.com", { x: 0.6, y: 6.2, w: 8, h: 0.4, fontFace: BODY, fontSize: 13, color: MUSTARD, margin: 0 });
  s.addNotes("Close by agreeing the follow-up date for showing the wrapper. Do not talk pricing beyond 'beta is free' and the £29 then £7.50 model if asked.");
}

pres.writeFile({ fileName: "/home/david/projects/GWTH_V2/CIPD/deck/GWTH-CIPD-2026-08-20.pptx" }).then(f => console.log("wrote", f));
