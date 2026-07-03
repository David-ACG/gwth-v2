/* ===========================================================
   DIRECTION B — Confident product
   Stripe/Supabase-flavoured: layered cards, visible Score
   product surface, 7-card adaptive grid, gradient depth.

   2026-04-27 iteration: stripped fabricated proof, swapped in
   real curriculum / pricing / nav from the live gwth.ai source
   (src/app/(public)/*). Direction-B layout intact.
   =========================================================== */

const DirB = ({ theme = 'light', viewport = 'desktop' }) => {
  const isMobile = viewport === 'mobile';
  return (
    <div className={`gwth dirB theme-${theme} ${isMobile ? 'is-mobile' : ''}`}>
      <DirB_Nav isMobile={isMobile} />
      <DirB_Hero isMobile={isMobile} />
      <DirB_Strip isMobile={isMobile} />
      <DirB_Journeys isMobile={isMobile} />
      <DirB_Product isMobile={isMobile} />
      <DirB_Research isMobile={isMobile} />
      <DirB_Pricing isMobile={isMobile} />
      <DirB_CTA isMobile={isMobile} />
      <DirB_Footer isMobile={isMobile} />
    </div>);

};

const DirB_Nav = ({ isMobile }) =>
<header className="dirB-nav">
    <div className="dirB-container nav-row">
      <div className="nav-brand"><GwthWordmark height={22} /></div>
      {!isMobile &&
    <nav className="nav-links">
          {GWTH_DATA.NAV_LINKS.map((l) =>
        <a key={l.href} href={l.href}>{l.label}</a>
        )}
        </nav>
    }
      <div className="nav-cta">
        {!isMobile && <a className="nav-link-quiet" href="/login">Sign in</a>}
        <a className="btn btn--sm btn--accent2" href="/signup">Join the Waitlist →</a>
        {isMobile && <button className="nav-burger" aria-label="Menu"><span /><span /></button>}
      </div>
    </div>
  </header>;


/* HERO — split layout w/ live Score card on the right */
const DirB_Hero = ({ isMobile }) =>
<section className="dirB-hero">
    <div className="dirB-container hero-grid">
      <div className="hero-copy">
        <span className="hero-pill">
          <span className="dot" /> Built in the UK · For the world
        </span>
        <h1 className="hero-title">
          Stop watching AI change the world.<br />
          <span className="hero-accent">Start building with it.</span>
        </h1>
        <p className="hero-sub">
          Learn to build apps, automate workflows, research faster, create content, analyse data, and solve real problems using AI — all in plain English. Built in the UK by practitioners, not marketers. Independent of any vendor or government programme.
        </p>
        <div className="hero-actions">
          <a className="btn btn--lg btn--accent2" href="/signup">
            Join the Waitlist
            <svg className="arrow" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>
          </a>
          <a className="btn btn--lg btn--ghost" href="/labs">Try a free lab</a>
        </div>
        <div className="hero-stats">
          <div><strong>94</strong> hands-on projects</div>
          <div><strong>60+</strong> AI tools tracked daily</div>
          <div><strong>3</strong> months · 5 hrs/week</div>
        </div>
      </div>

      <div className="hero-visual">
        <DirB_HeroDevice />
      </div>
    </div>
  </section>;


/* The hero device — a stacked LinkedIn + Score card mock.
   Score categories aligned with curriculum modules; numbers are
   placeholders until the real scoring scheme is finalised. */
const DirB_HeroDevice = () =>
<div className="hero-device">
    <div className="hd-glow" />
    <div className="hd-card hd-card--linkedin">
      <div className="hd-li-head">
        <span className="hd-li-logo">in</span>
        <span className="hd-li-url">linkedin.com / in / sample-profile</span>
        <span className="hd-li-dot" /><span className="hd-li-dot" /><span className="hd-li-dot" />
      </div>
      <div className="hd-li-profile">
        <div className="hd-avatar">EM</div>
        <div className="hd-li-meta">
          <span className="hd-li-name">Sample profile</span>
          <span className="hd-li-role">Operations Lead · UK · she/her</span>
          <span className="hd-li-tag">📍 Open to AI ops & automation roles</span>
        </div>
      </div>
      <div className="hd-li-section">
        <span className="hd-li-section-title">Featured</span>
        <div className="hd-score-card">
          <div className="hd-sc-head">
            <div className="hd-sc-brand">
              <span className="hd-sc-icon"><GwthIcon size={16} mintColor="#1CBA93" /></span>
              <div>
                <span className="hd-sc-label">GWTH Dynamic Score</span>
                <span className="hd-sc-verified">● Verified · live</span>
              </div>
            </div>
            <span className="hd-sc-update">updated today</span>
          </div>
          <div className="hd-sc-num-row">
            <span className="hd-sc-num">B+</span>
            <div className="hd-sc-trend">
              <span className="hd-sc-arrow">▲</span> 4
              <span className="hd-sc-period">past 30d</span>
            </div>
          </div>
          <div className="hd-sc-bars">
            {GWTH_DATA.SCORE_CATEGORIES.map((s) =>
          <div key={s.l} className="hd-sc-bar">
                <span className="hd-sc-bar-l">{s.l}</span>
                <span className="hd-sc-bar-track">
                  <span className="hd-sc-bar-fill" style={{ width: `${s.v}%` }} />
                </span>
                <span className="hd-sc-bar-v">{s.v}</span>
              </div>
          )}
          </div>
          <div className="hd-sc-foot">
            <span className="hd-sc-foot-l">Verify at gwth.ai/v/sample</span>
            <span className="hd-sc-foot-r">8 portfolio projects →</span>
          </div>
        </div>
      </div>
    </div>
  </div>;


/* Research strip — sources, not partnerships. */
const DirB_Strip = ({ isMobile }) =>
<section className="dirB-strip">
    <div className="dirB-container">
      <span className="mono strip-label">Built around UK research</span>
      <div className="strip-logos">
        {GWTH_DATA.RESEARCH_SOURCES.map((l) => <span key={l} className="strip-logo">{l}</span>)}
      </div>
    </div>
  </section>;


/* JOURNEYS — 7-card adaptive grid (3+3+1 on desktop, 1 col mobile) */
const DirB_Journeys = ({ isMobile }) =>
<section className="dirB-journeys" id="audience">
    <div className="dirB-container">
      <div className="section-head">
        <span className="kicker"><span /> Who it's for</span>
        <h2 className="section-title">Whichever line you're standing on,<br />the work is the same.</h2>
        <p className="section-sub">Seven journeys, one course, one Dynamic Score. Pick the row that fits — they all end up at the same proof.</p>
      </div>

      <div className="journey-grid">
        {GWTH_DATA.JOURNEYS.slice(0, 6).map((j) =>
      <DirB_JourneyCard key={j.n} j={j} />
      )}
        <DirB_JourneyCard j={GWTH_DATA.JOURNEYS[6]} wide />
      </div>
    </div>
  </section>;


const DirB_JourneyCard = ({ j, wide }) =>
<article className={`j-card accent-${j.accent} ${wide ? 'j-card--wide' : ''}`}>
    <div className="jc-top">
      <span className="jc-num">{j.n}</span>
      <span className={`jc-tag tag-${j.accent}`}>{j.tag}</span>
    </div>
    <h3 className="jc-title">{j.title}</h3>
    <p className="jc-body">{j.body}</p>
    <div className="jc-foot">
      {j.stat ?
    <span className="jc-stat">
          <strong>{j.stat.value}</strong>
          <span>{j.stat.label}</span>
        </span> :
    <span className="jc-spacer" />}
      <a className="jc-link" href={j.href}>
        {j.cta}
        <svg viewBox="0 0 16 16" className="arrow"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>
      </a>
    </div>
  </article>;


/* PRODUCT STORY — 3 large blocks alternating w/ visuals. The pillars
   match the live homepage's most-emphasised differentiators. */
const DirB_Product = ({ isMobile }) =>
<section className="dirB-product" id="course">
    <div className="dirB-container">
      <div className="section-head section-head--center">
        <span className="kicker kicker--center"><span /> The product</span>
        <h2 className="section-title">94 projects. One score.<br />Plain English in.</h2>
      </div>

      <div className="prod-rows">
        <div className="prod-row">
          <div className="prod-copy">
            <span className="mono">{GWTH_DATA.PRODUCT_PILLARS[0].n} / {GWTH_DATA.PRODUCT_PILLARS[0].label}</span>
            <h3>{GWTH_DATA.PRODUCT_PILLARS[0].title}</h3>
            <p>{GWTH_DATA.PRODUCT_PILLARS[0].body}</p>
            <ul className="prod-list">
              <li><svg viewBox="0 0 16 16" className="tick"><path d="M3 8l3.5 3.5L13 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>Personal AI · Professional · Enterprise</li>
              <li><svg viewBox="0 0 16 16" className="tick"><path d="M3 8l3.5 3.5L13 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>3 portfolio-ready capstones</li>
              <li><svg viewBox="0 0 16 16" className="tick"><path d="M3 8l3.5 3.5L13 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>Step-by-step video for every project</li>
            </ul>
            <a className="prod-link" href="/lessons">View the curriculum →</a>
          </div>
          <div className="prod-vis prod-vis--curriculum">
            <DirB_CurriculumVis />
          </div>
        </div>

        <div className="prod-row prod-row--reverse">
          <div className="prod-copy">
            <span className="mono">{GWTH_DATA.PRODUCT_PILLARS[1].n} / {GWTH_DATA.PRODUCT_PILLARS[1].label}</span>
            <h3>{GWTH_DATA.PRODUCT_PILLARS[1].title}</h3>
            <p>{GWTH_DATA.PRODUCT_PILLARS[1].body}</p>
            <ul className="prod-list">
              <li><svg viewBox="0 0 16 16" className="tick"><path d="M3 8l3.5 3.5L13 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>One-click LinkedIn embed</li>
              <li><svg viewBox="0 0 16 16" className="tick"><path d="M3 8l3.5 3.5L13 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>Public verify URL · no PDFs</li>
              <li><svg viewBox="0 0 16 16" className="tick"><path d="M3 8l3.5 3.5L13 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>Decays — keeps it honest</li>
            </ul>
          </div>
          <div className="prod-vis prod-vis--score">
            <DirB_ScoreVis />
          </div>
        </div>

        <div className="prod-row">
          <div className="prod-copy">
            <span className="mono">{GWTH_DATA.PRODUCT_PILLARS[2].n} / {GWTH_DATA.PRODUCT_PILLARS[2].label}</span>
            <h3>{GWTH_DATA.PRODUCT_PILLARS[2].title}</h3>
            <p>{GWTH_DATA.PRODUCT_PILLARS[2].body}</p>
            <ul className="prod-list">
              <li><svg viewBox="0 0 16 16" className="tick"><path d="M3 8l3.5 3.5L13 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>Use Claude, ChatGPT, n8n, Zapier</li>
              <li><svg viewBox="0 0 16 16" className="tick"><path d="M3 8l3.5 3.5L13 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>Tools you already pay for</li>
              <li><svg viewBox="0 0 16 16" className="tick"><path d="M3 8l3.5 3.5L13 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>Write a brief, ship a workflow</li>
            </ul>
          </div>
          <div className="prod-vis prod-vis--prompt">
            <DirB_PromptVis />
          </div>
        </div>
      </div>
    </div>
  </section>;


const DirB_CurriculumVis = () =>
<div className="curr-card">
    <div className="curr-head">
      <span className="mono">curriculum.gwth.ai · sample plan</span>
      <span className="curr-pill">Locked · sign up to view</span>
    </div>
    <div className="curr-modules">
      {GWTH_DATA.CURRICULUM.map((m, i) =>
    <div key={m.m} className="curr-mod">
          <div className="curr-mod-head">
            <div>
              <span className="curr-mod-m mono">{m.m}</span>
              <span className="curr-mod-t">{m.t}</span>
            </div>
            <span className="curr-mod-status">{m.d}</span>
          </div>
          <div className="curr-mod-capstone">
            <span className="mono">Capstone</span>
            <strong>{m.capstone}</strong>
            <span>{m.capstoneSub}</span>
          </div>
        </div>
    )}
    </div>
    <div className="curr-foot mono">
      Full syllabus revealed one month at a time after enrolment.
    </div>
  </div>;


const DirB_ScoreVis = () =>
<div className="scorev-card">
    <div className="scorev-stage">
      <div className="scorev-li">
        <span className="scorev-li-logo">in</span>
        <span className="scorev-li-text">Featured on your profile</span>
      </div>
      <div className="scorev-card2">
        <div className="scorev-card-head">
          <span className="scorev-badge"><GwthIcon size={14} mintColor="#1CBA93" /> GWTH · Verified</span>
          <span className="mono scorev-update">live · updated today</span>
        </div>
        <div className="scorev-num">
          <span className="scorev-big">B+</span>
          <span className="scorev-sub">live grade</span>
          <span className="scorev-trend">▲ 4</span>
        </div>
        <div className="scorev-ring-row">
          <div className="scorev-ring">
            <svg viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" stroke="var(--bg-inset)" strokeWidth="6" fill="none" />
              <circle cx="40" cy="40" r="34" stroke="url(#gv1)" strokeWidth="6" fill="none"
            strokeDasharray="213" strokeDashoffset="46" strokeLinecap="round"
            transform="rotate(-90 40 40)" />
              <defs>
                <linearGradient id="gv1" x1="0" x2="1">
                  <stop offset="0%" stopColor="#33BBFF" />
                  <stop offset="100%" stopColor="#1CBA93" />
                </linearGradient>
              </defs>
            </svg>
            <span className="scorev-ring-num">78%</span>
          </div>
          <div className="scorev-ring-meta">
            <span>Module 2 · Professional</span>
            <span className="scorev-ring-foot">Decays if you stop · keeps it honest</span>
          </div>
        </div>
      </div>
    </div>
  </div>;


const DirB_PromptVis = () =>
<div className="promptv-card">
    <div className="promptv-head">
      <span className="promptv-dots"><span /><span /><span /></span>
      <span className="mono promptv-title">lab 06 · invoice triage</span>
    </div>
    <div className="promptv-body">
      <div className="promptv-msg promptv-user">
        <span className="mono">You</span>
        <p>Take last quarter's invoices, flag anything over £2,000, and draft a chase email to suppliers we've not paid in 30 days.</p>
      </div>
      <div className="promptv-msg promptv-ai">
        <span className="mono">Workflow</span>
        <ol className="promptv-steps">
          <li><span className="step-i">●</span> Loaded 247 invoices from /Q1-2026</li>
          <li><span className="step-i">●</span> 12 flagged over £2,000 threshold</li>
          <li><span className="step-i">●</span> 4 suppliers past 30-day terms</li>
          <li><span className="step-i step-i--done">●</span> 4 chase emails drafted · ready to review</li>
        </ol>
      </div>
    </div>
    <div className="promptv-foot">
      <span className="mono">Plain English in · no Python</span>
      <span className="promptv-time">2m 14s</span>
    </div>
  </div>;


/* RESEARCH — real UK stats, no fake testimonials. */
const DirB_Research = ({ isMobile }) =>
<section className="dirB-proof">
    <div className="dirB-container">
      <div className="section-head section-head--center">
        <span className="kicker kicker--center"><span /> Why this matters now</span>
        <h2 className="section-title">UK workers and businesses are<br />falling behind on AI.</h2>
      </div>
      <div className="research-grid">
        {GWTH_DATA.UK_STATS.map((s) =>
      <div key={s.value} className="rstat">
            <span className="rstat-num">{s.value}</span>
            <span className="rstat-lbl">{s.label}</span>
          </div>
      )}
      </div>
      <p className="research-source mono">
        Source: UK Government / DSIT research, published alongside the AI Skills Boost programme (January 2026).
      </p>
    </div>
  </section>;


/* PRICING — three tiers matching the live /pricing page exactly. */
const DirB_Pricing = ({ isMobile }) =>
<section className="dirB-pricing" id="pricing">
    <div className="dirB-container">
      <div className="section-head section-head--center">
        <span className="kicker kicker--center"><span /> Pricing</span>
        <h2 className="section-title">Less than the cost of one hour with an AI consultant.</h2>
        <p className="section-sub">Start free. Learn everything in 3 months. Stay current for less than a flat white.</p>
      </div>
      <div className="pricing-row pricing-row--three">
        {GWTH_DATA.PRICING.map((p) =>
      <div key={p.id} className={`pcard pcard--${p.id} ${p.flag ? 'pcard--featured' : ''}`}>
            {p.flag && <span className="pcard-flag">{p.flag}</span>}
            <div className="pcard-tag">{p.badge}</div>
            <div className="pcard-price">
              <span className="pcard-amount">{p.price}</span>
              <span className="pcard-per">{p.per}</span>
            </div>
            <ul className="pcard-list">
              {p.features.map((f) =>
          <li key={f}>
                  <span className="tick-bg"><svg viewBox="0 0 12 12"><path d="M2 6l3 3 5-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></span>
                  {f}
                </li>
          )}
            </ul>
            <a className={`btn btn--lg pcard-btn ${p.cta.style === 'accent2' ? 'btn--accent2' : p.cta.style === 'ghost' ? 'btn--ghost' : 'btn--ghost btn--disabled'}`}
          href={p.cta.href}
          aria-disabled={p.cta.style === 'disabled' ? 'true' : undefined}>
              {p.cta.label}
            </a>
          </div>
      )}
      </div>
      <p className="pricing-foot mono">
        No yearly price · Cancel anytime · No lock-in · Same per-person price for teams (
        <a href="/for-teams">For Teams</a>)
      </p>
    </div>
  </section>;


/* CTA */
const DirB_CTA = ({ isMobile }) =>
<section className="dirB-cta">
    <div className="dirB-container">
      <div className="cta-block">
        <h2 className="cta-title">
          The best time to learn AI was six months ago.<br />
          <span className="cta-em">The second best time is right now.</span>
        </h2>
        <div className="cta-actions">
          <a className="btn btn--lg btn--accent2" href="/signup">
            Join the Waitlist
            <svg className="arrow" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>
          </a>
          <a className="btn btn--lg btn--ghost-light" href="/labs">Try a free lab</a>
        </div>
        <span className="cta-foot">No card required for free labs · UK VAT included on subscription</span>
      </div>
    </div>
  </section>;


const DirB_Footer = ({ isMobile }) =>
<footer className="dirB-footer">
    <div className="dirB-container">
      <div className="ft-top">
        <div className="ft-brand">
          <p>Growth With Tech and Humans. A UK-first applied AI programme for working adults. Independent. UK-based. No sponsors. No ads. No vendor partnerships.</p>
          <div className="ft-social">
            <a href="#" aria-label="LinkedIn">in</a>
            <a href="#" aria-label="X">𝕏</a>
            <a href="#" aria-label="YouTube">▶</a>
          </div>
        </div>
        <div className="ft-cols">
          {GWTH_DATA.FOOTER_COLS.map((col) =>
        <div key={col.title} className="ft-col">
              <span className="mono">{col.title}</span>
              {col.links.map((l) =>
          <a key={l.href} href={l.href}>{l.label}</a>
          )}
            </div>
        )}
        </div>
      </div>
      <div className="ft-bottom">
        <span>© 2026 GWTH.ai · Based in the United Kingdom 🇬🇧 · Built in the UK. For the world.</span>
        <span className="mono">v1.0</span>
      </div>
    </div>
  </footer>;


window.DirB = DirB;
