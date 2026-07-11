#!/usr/bin/env python3
"""Generate src/lib/data/m1-labs.ts from the pipeline lab.md sources.

Faithful, deterministic conversion of the 30 real Month-1 lab.md files
(1_gwthpipeline520/data/generated_lessons/labs) into the GWTH_V2 `Lab` shape,
then wires mockLabs -> m1Labs so /labs renders real content. No Supabase, no
new DB table (that DB-backed path is W3/W7). This becomes the accurate fallback.
"""
import re, glob, os, json, yaml

LAB_DIR = "/home/david/projects/1_gwthpipeline520/data/generated_lessons/labs"
GV2 = "/home/david/projects/GWTH_V2"
OUT = f"{GV2}/src/lib/data/m1-labs.ts"
MOCK = f"{GV2}/src/lib/data/mock-data.ts"

# category(lower) -> (Title, projectType, color(oklch), lucide icon)
CAT = {
  "prompting":   ("Prompting", "Prompt Practice", "oklch(0.7 0.18 220)", "MessageCircle"),
  "research":    ("Research", "Research Project", "oklch(0.627 0.265 303.9)", "Search"),
  "data":        ("Data & Analysis", "Data Analysis", "oklch(0.75 0.15 75)", "BarChart3"),
  "building":    ("Building", "Web Application", "oklch(0.65 0.16 165)", "Rocket"),
  "career":      ("Career", "Career Toolkit", "oklch(0.65 0.18 50)", "Briefcase"),
  "productivity":("Productivity", "Workflow", "oklch(0.65 0.16 165)", "Zap"),
  "design":      ("Design", "Creative Project", "oklch(0.627 0.265 303.9)", "Palette"),
  "writing":     ("Writing", "Writing Project", "oklch(0.65 0.18 50)", "PenLine"),
  "agents":      ("AI Agents", "Agent Build", "oklch(0.7 0.18 220)", "Bot"),
  "study":       ("Study", "Study Tool", "oklch(0.75 0.15 75)", "GraduationCap"),
}
DEFAULT = ("Foundations", "Hands-on Exercise", "oklch(0.7 0.18 220)", "Sparkles")
ALLOWED_DIFF = {"beginner", "intermediate", "advanced"}

# --- Picks filter (bead gwth-launch-9u6) --------------------------------------
# Serve ONLY the labs David picked in his 2026-06-16 review, and additionally
# drop the stub-triage removals (STUB_TRIAGE.md, 2026-07-11) so skipped labs,
# drops, folds and test fixtures never reach prod. Picks come from
# _review_picks.json (index -> pick/skip); indices map to dir slugs via the LABS
# array in _review.html. Folds (familybot/family-brain-dump/portfolio) land in
# lessons later (Wave 5) but must stop being served now.
REVIEW_DIR = "/home/david/gwth-dashboard/generated_lessons/labs"
PICKS_JSON = f"{REVIEW_DIR}/_review_picks.json"
REVIEW_HTML = f"{REVIEW_DIR}/_review.html"

# Stub-triage removals: DROP (no fold target) + FOLD (fold lands later) + fixtures.
EXCLUDE_SLUGS = {
    # DROP
    "a-developer-toolkit-for-nothing",
    "cursor-vs-claude-code-vs-codex-vs-antigravity",
    "fix-my-page",
    "ship-it-publish-a-real-web-page",
    # FOLD-INTO-LESSON (stop serving now; content folds into lessons in Wave 5)
    "familybot-prototype-gem",
    "the-family-brain-dump",
    "month-1-portfolio-page",
    # test fixtures
    "api-test-lab",
    "status-test-lab",
}

def load_allowed_slugs():
    picks = json.load(open(PICKS_JSON))["picks"]
    html = open(REVIEW_HTML).read()
    m = re.search(r"const LABS = (\[.*?\]);", html, re.S)
    labs = json.loads(m.group(1))
    idx_to_slug = {str(l["n"]): l["slug"] for l in labs}
    picked = {idx_to_slug[i] for i, v in picks.items()
              if v == "pick" and i in idx_to_slug}
    return picked - EXCLUDE_SLUGS

ALLOWED_SLUGS = load_allowed_slugs()

def clean(s): return re.sub(r"\s+", " ", str(s)).strip()
def strip_md(s): return re.sub(r"[*_`#>]", "", s)

def fm_parse(txt):
    m = re.match(r"^---\n(.*?)\n---\n", txt, re.S)
    if not m: return {}, txt
    try: fm = yaml.safe_load(m.group(1)) or {}
    except Exception: fm = {}
    return fm, txt[m.end():]

def lesson_num(rl):
    m = re.search(r"m1_l(\d+)", str(rl))
    return int(m.group(1)) if m else 999

def description(body, fm):
    m = re.search(r">\s*\*\*What you.{0,3}ll build:\*\*\s*(.+)", body, re.I)
    if m: return clean(strip_md(m.group(1)))[:300]
    if fm.get("outcome"): return clean(fm["outcome"])[:300]
    for para in re.split(r"\n\n+", body):
        p = para.strip()
        if p and not p.startswith(("#", ">", "---", "|", "-", "*")):
            return clean(strip_md(p))[:300]
    return clean(fm.get("title", ""))

def outcomes(fm):
    o = fm.get("outcome", "")
    if not o: return ["Complete the lab's hands-on exercise and capture the result."]
    parts = re.split(r",\s+(?:and\s+)?|\.\s+|;\s+", o)
    parts = [clean(p).rstrip(".") for p in parts if len(clean(p)) > 15]
    parts = [(p[0].upper() + p[1:]) for p in parts][:4]
    return parts or [clean(o)]

def prereq(body, fm):
    m = re.search(r"\*\*Prerequisites?:\*\*\s*(.+)", body)
    if m: return clean(strip_md(m.group(1)))[:220]
    return None

def split_steps(body):
    steps = list(re.finditer(r"^##\s+Step\s+\d+[:.—-]?\s*(.*)$", body, re.M))
    use = steps
    if not steps:
        use = list(re.finditer(r"^##\s+(.+)$", body, re.M))
    if not use:
        return body.strip(), []
    intro = body[:use[0].start()].strip()
    items = []
    for i, mm in enumerate(use):
        start = mm.end()
        end = use[i + 1].start() if i + 1 < len(use) else len(body)
        title = clean(strip_md(mm.group(1))) or f"Step {i + 1}"
        content = body[start:end].strip()
        items.append((i + 1, title, content))
    return intro, items

def category(fm):
    c = str(fm.get("category", "")).strip().lower()
    if c in CAT: return CAT[c]
    for t in (fm.get("tags") or []):
        if str(t).lower() in CAT: return CAT[str(t).lower()]
    return DEFAULT

entries = []
files = sorted(glob.glob(f"{LAB_DIR}/LAB_*/lab.md"))
for f in files:
    txt = open(f).read()
    fm, body = fm_parse(txt)
    tags = [str(t).lower() for t in (fm.get("tags") or [])]
    rl = str(fm.get("related_lesson", ""))
    if not ("month-1" in tags or rl.startswith("m1")):
        continue  # M1 only (beta scope)
    slug = os.path.basename(os.path.dirname(f)).replace("LAB_", "")
    if slug not in ALLOWED_SLUGS:
        continue  # picks-only + stub-triage removals (bead gwth-launch-9u6)
    diff = str(fm.get("difficulty", "beginner")).strip().lower()
    if diff not in ALLOWED_DIFF: diff = "beginner"
    dm = re.search(r"\d+", str(fm.get("duration", "60")))
    dur = int(dm.group(0)) if dm else 60
    cat, ptype, color, icon = category(fm)
    intro, steps = split_steps(body)
    if not steps:  # no parseable sections -> one walkthrough step holds the body
        steps = [(1, "Lab Walkthrough", body.strip())]
    entries.append({
        "slug": slug, "title": clean(fm.get("title", slug)),
        "description": description(body, fm), "difficulty": diff, "duration": dur,
        "technologies": [clean(t) for t in (fm.get("tools") or [])],
        "learningOutcomes": outcomes(fm), "prerequisites": prereq(body, fm),
        "content": intro or body.strip(), "instructions": steps,
        "category": cat, "projectType": ptype, "color": color, "icon": icon,
        "lnum": lesson_num(rl),
    })

entries.sort(key=lambda e: (e["lnum"], e["title"]))
for i, e in enumerate(entries, 1):
    e["id"] = f"lab_{i:03d}"

def s(x): return json.dumps(x, ensure_ascii=False)
def arr(xs): return "[" + ", ".join(s(x) for x in xs) + "]"

def emit(e):
    instr = ", ".join(
        "{ step: %d, title: %s, content: %s }" % (st, s(t), s(c))
        for (st, t, c) in e["instructions"]
    )
    return "\n".join([
        "  {",
        f"    id: {s(e['id'])},",
        f"    slug: {s(e['slug'])},",
        f"    title: {s(e['title'])},",
        f"    description: {s(e['description'])},",
        f"    difficulty: {s(e['difficulty'])},",
        f"    duration: {e['duration']},",
        f"    technologies: {arr(e['technologies'])},",
        f"    learningOutcomes: {arr(e['learningOutcomes'])},",
        f"    prerequisites: {s(e['prerequisites']) if e['prerequisites'] else 'null'},",
        f"    content: {s(e['content'])},",
        f"    instructions: [{instr}],",
        f"    category: {s(e['category'])},",
        f"    projectType: {s(e['projectType'])},",
        f"    color: {s(e['color'])},",
        f"    icon: {s(e['icon'])},",
        "    isPremium: false,",
        '    createdAt: new Date("2026-06-13"),',
        '    updatedAt: new Date("2026-06-17"),',
        "  },",
    ])

header = (
    "import type { Lab } from \"@/lib/types\"\n\n"
    "// AUTO-GENERATED — the real Month-1 labs, converted from the pipeline\n"
    "// lab.md sources (1_gwthpipeline520/data/generated_lessons/labs). Regenerate\n"
    "// via scripts/gen_m1_labs.py. This is the content-layer source for /labs;\n"
    "// the DB-backed path (Drizzle / self-hosted Postgres) remains W3/W7 work and\n"
    "// will use these as the fallback set. Do not hand-edit — edit the lab.md + regen.\n\n"
    f"export const m1Labs: Lab[] = [\n"
)
with open(OUT, "w") as fh:
    fh.write(header + "\n".join(emit(e) for e in entries) + "\n]\n")

print(f"M1 labs generated: {len(entries)}")
print("with instructions:", sum(1 for e in entries if e["instructions"]))
print("categories:", sorted(set(e["category"] for e in entries)))
miss_desc = [e["id"] for e in entries if len(e["description"]) < 20]
print("short descriptions:", miss_desc or "none")
print("wrote", OUT)

# --- wire into mock-data.ts: mockLabs -> m1Labs (idempotent) ---
# Once mockLabs is a reference to m1Labs there is nothing left to patch; re-running
# the array-replacement below would be destructive (its end-of-array search would
# swallow the following export), so skip it when the wiring is already in place.
mock_src = open(MOCK).read()
if "export const mockLabs: Lab[] = m1Labs" in mock_src:
    print("mock-data.ts already wired to m1Labs; no patch needed")
    raise SystemExit(0)
lines = mock_src.split("\n")
# 1) insert import after the first top-level import statement block
imp = 'import { m1Labs } from "./m1-labs"'
if imp not in "\n".join(lines):
    ins = None
    for i, ln in enumerate(lines):
        if re.match(r'^\}\s+from\s+"', ln) or (ln.startswith("import ") and ln.rstrip().endswith('"')):
            ins = i + 1
            break
    if ins is None: ins = 10
    lines[ins:ins] = ["", imp]
# 2) replace the mockLabs array block with a reference
start = next(i for i, ln in enumerate(lines) if ln.startswith("export const mockLabs"))
end = next(i for i in range(start + 1, len(lines)) if lines[i].startswith("]"))
lines[start:end + 1] = ["export const mockLabs: Lab[] = m1Labs"]
open(MOCK, "w").write("\n".join(lines))
print("patched", MOCK)
