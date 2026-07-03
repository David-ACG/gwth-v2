/* ===========================================================
   DIRECTION B — Confident product
   Stripe/Supabase-flavoured: layered cards, visible Score
   product surface, 7-card adaptive grid, gradient depth.
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
      <DirB_Proof isMobile={isMobile} />
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
          <a href="#course">Course</a>
          <a href="#score">Dynamic Score</a>
          <a href="#audience">Who it's for</a>
          <a href="#pricing">Pricing</a>
          <a href="#about">About</a>
        </nav>
    }
      <div className="nav-cta">
        {!isMobile && <a className="nav-link-quiet" href="#login">Sign in</a>}
        <a className="btn btn--sm btn--accent2" href="#start">Start the course →</a>
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
          <span className="dot" /> 
        </span>
        <h1 className="hero-title">
          Stop watching AI change the world.<br />
          <span className="hero-accent">Start building with it.</span>
        </h1>
        <p className="hero-sub">
          A 3-month applied programme for working UK adults. Five hours a week. Every project in your portfolio. A Dynamic Score employers can verify on LinkedIn. No coding required.
        </p>
        <div className="hero-actions">
          <a className="btn btn--lg btn--accent2" href="#start">
            Start the course
            <svg className="arrow" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>
          </a>
          <a className="btn btn--lg btn--ghost" href="#sample">Try a free lab</a>
        </div>
        <div className="hero-trust">
          <span className="ht-avs">
            <span className="av av1">JM</span>
            <span className="av av2">SK</span>
            <span className="av av3">PD</span>
            <span className="av av4">+</span>
          </span>
          <span className="ht-text"><strong>1,240</strong> UK learners enrolled · <span className="stars">★★★★★</span> 4.9 / 5 (FT Future Skills)</span>
        </div>
      </div>

      <div className="hero-visual">
        <DirB_HeroDevice />
      </div>
    </div>
  </section>;


/* The hero device — a stacked LinkedIn + Score card mock */
const DirB_HeroDevice = () =>
<div className="hero-device">
    <div className="hd-glow" />
    <div className="hd-card hd-card--linkedin">
      <div className="hd-li-head">
        <span className="hd-li-logo">in</span>
        <span className="hd-li-url">linkedin.com / in / sam-osman</span>
        <span className="hd-li-dot" /><span className="hd-li-dot" /><span className="hd-li-dot" />
      </div>
      <div className="hd-li-profile">
        <div className="hd-avatar">SO</div>
        <div className="hd-li-meta">
          <span className="hd-li-name">Sam Osman</span>
          <span className="hd-li-role">Operations Lead · Bristol · he/him</span>
          <span className="hd-li-tag">📍 Open to roles in AI ops & automation</span>
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
            <span className="hd-sc-update">updated 2d ago</span>
          </div>
          <div className="hd-sc-num-row">
            <span className="hd-sc-num">782</span>
            <div className="hd-sc-trend">
              <span className="hd-sc-arrow">▲</span> 14
              <span className="hd-sc-period">past 30d</span>
            </div>
          </div>
          <div className="hd-sc-bars">
            {[
          { l: 'Prompting', v: 92 },
          { l: 'Agents', v: 78 },
          { l: 'Document AI', v: 84 },
          { l: 'Automation', v: 68 }].
          map((s) =>
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
            <span className="hd-sc-foot-l">Verify at gwth.ai/v/sam-osman</span>
            <span className="hd-sc-foot-r">12 portfolio projects →</span>
          </div>
        </div>
      </div>
    </div>
  </div>;


const DirB_Strip = ({ isMobile }) =>
<section className="dirB-strip">
    <div className="dirB-container">
      <span className="mono strip-label">As featured in / partnered with</span>
      <div className="strip-logos">
        {GWTH_DATA.PROOF_LOGOS.map((l) => <span key={l} className="strip-logo">{l}</span>)}
      </div>
    </div>
  </section>;


/* JOURNEYS — 7-card adaptive grid (3+3+1 on desktop, 1 col mobile) */
const DirB_Journeys = ({ isMobile }) =>
<section className="dirB-journeys" id="audience">
    <div className="dirB-container">
      <div className="section-head">
        <span className="kicker"><span /> Audience</span>
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
      <a className="jc-link" href="#">
        {j.cta || 'View syllabus'}
        <svg viewBox="0 0 16 16" className="arrow"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>
      </a>
    </div>
  </article>;


/* PRODUCT STORY — 3 large blocks alternating w/ visuals */
const DirB_Product = ({ isMobile }) =>
<section className="dirB-product" id="course">
    <div className="dirB-container">
      <div className="section-head section-head--center">
        <span className="kicker kicker--center"><span /> The product</span>
        <h2 className="section-title">Three months. A score employers can check.<br />Plain English in.</h2>
      </div>

      <div className="prod-rows">
        <div className="prod-row">
          <div className="prod-copy">
            <span className="mono">01 / 3-month curriculum</span>
            <h3>Three months. Three modules. Built for working adults.</h3>
            <p>Five hours a week. Async-first, so it works around the day job. Every module ends with a project that goes straight in your portfolio.</p>
            <ul className="prod-list">
              <li><svg viewBox="0 0 16 16" className="tick"><path d="M3 8l3.5 3.5L13 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>Foundations · Build · Portfolio</li>
              <li><svg viewBox="0 0 16 16" className="tick"><path d="M3 8l3.5 3.5L13 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>12 weekly labs, ~25 minutes each</li>
              <li><svg viewBox="0 0 16 16" className="tick"><path d="M3 8l3.5 3.5L13 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>Capstone defended in week 12</li>
            </ul>
          </div>
          <div className="prod-vis prod-vis--curriculum">
            <DirB_CurriculumVis />
          </div>
        </div>

        <div className="prod-row prod-row--reverse">
          <div className="prod-copy">
            <span className="mono">02 / Dynamic Score</span>
            <h3>A verifiable credential, not a certificate of attendance.</h3>
            <p>Your Dynamic Score updates as you build, and decays if you stop. Share it on LinkedIn. Employers can verify it on the spot — no PDFs, no faked completion dates.</p>
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
            <span className="mono">03 / No coding required</span>
            <h3>If you can describe what you want, you can build it.</h3>
            <p>Plain English in, working AI tools out. We assume zero Python. We expect curiosity, not credentials.</p>
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
      <span className="mono">curriculum.gwth.ai · Sam's plan</span>
      <span className="curr-pill">In progress</span>
    </div>
    <div className="curr-modules">
      {[
    { m: 'Module 1', t: 'Foundations', d: '4 weeks · prompting, agents, tooling', p: 100, status: 'Complete' },
    { m: 'Module 2', t: 'Build', d: '4 weeks · automations, doc AI, ship', p: 62, status: 'Week 6 of 8' },
    { m: 'Module 3', t: 'Portfolio', d: '4 weeks · capstone, score, defence', p: 0, status: 'Locked' }].
    map((s, i) =>
    <div key={s.m} className={`curr-mod ${s.p === 100 ? 'is-done' : ''} ${s.p === 0 ? 'is-locked' : ''}`}>
          <div className="curr-mod-head">
            <div>
              <span className="curr-mod-m mono">{s.m}</span>
              <span className="curr-mod-t">{s.t}</span>
            </div>
            <span className="curr-mod-status">{s.status}</span>
          </div>
          <span className="curr-mod-d">{s.d}</span>
          <div className="curr-mod-bar">
            <span className="curr-mod-fill" style={{ width: `${s.p}%` }} />
          </div>
        </div>
    )}
    </div>
  </div>;


const DirB_ScoreVis = () =>
<div className="scorev-card">
    <div className="scorev-stage">
      <div className="scorev-li">
        <span className="scorev-li-logo">in</span>
        <span className="scorev-li-text">Featured on Sam's profile</span>
      </div>
      <div className="scorev-card2">
        <div className="scorev-card-head">
          <span className="scorev-badge"><GwthIcon size={14} mintColor="#1CBA93" /> GWTH · Verified</span>
          <span className="mono scorev-update">live · updated 2d ago</span>
        </div>
        <div className="scorev-num">
          <span className="scorev-big">782</span>
          <span className="scorev-sub">/ 1000</span>
          <span className="scorev-trend">▲ 14</span>
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
            <span>Top 12% of cohort 5</span>
            <span className="scorev-ring-foot">Decays 2pts / month if inactive</span>
          </div>
        </div>
      </div>
      <div className="scorev-tooltip">
        <span className="scorev-tt-dot" />
        Recruiters click the Score 3.4× more than a static cert
      </div>
    </div>
  </div>;


const DirB_PromptVis = () =>
<div className="promptv-card">
    <div className="promptv-head">
      <span className="promptv-dots"><span /><span /><span /></span>
      <span className="mono promptv-title">lab 06 · invoice triage · sam.osman</span>
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
      <span className="mono">Built in week 6 · no Python</span>
      <span className="promptv-time">2m 14s</span>
    </div>
  </div>;


/* PROOF — testimonial + stats */
const DirB_Proof = ({ isMobile }) =>
<section className="dirB-proof">
    <div className="dirB-container">
      <div className="proof-grid">
        <div className="proof-stats">
          <div className="ps">
            <span className="ps-num">94%</span>
            <span className="ps-lbl">finish all three modules</span>
          </div>
          <div className="ps">
            <span className="ps-num">£28k</span>
            <span className="ps-lbl">avg. self-reported pay rise within 12 months (n=126)</span>
          </div>
          <div className="ps">
            <span className="ps-num">3.4×</span>
            <span className="ps-lbl">more LinkedIn views with Score attached</span>
          </div>
          <div className="ps">
            <span className="ps-num">1,240</span>
            <span className="ps-lbl">UK learners across cohorts 1–5</span>
          </div>
        </div>
        <blockquote className="proof-quote">
          <span className="quote-mark">"</span>
          <p>Six weeks in I rebuilt our quoting workflow on my own. The Dynamic Score on my LinkedIn was the thing recruiters actually clicked on. I'm a quantity surveyor — I do not write code.</p>
          <footer>
            <div className="qa">HP</div>
            <div className="qm">
              <span className="qn">Hannah Pierce</span>
              <span className="qr">Quantity surveyor · Manchester · cohort 3</span>
            </div>
          </footer>
        </blockquote>
      </div>
    </div>
  </section>;


/* PRICING */
const DirB_Pricing = ({ isMobile }) =>
<section className="dirB-pricing" id="pricing">
    <div className="dirB-container">
      <div className="section-head section-head--center">
        <span className="kicker kicker--center"><span /> Pricing</span>
        <h2 className="section-title">Less than an hour with a consultant.</h2>
        <p className="section-sub">One course. One price. Cancel anytime.</p>
      </div>
      <div className="pricing-row">
        <div className="pcard pcard--main">
          <div className="pcard-tag">GWTH — Applied AI Skills</div>
          <div className="pcard-price">
            <span className="pcard-amount">£29</span>
            <span className="pcard-per">/ month<br /><small>3 months · £87 total</small></span>
          </div>
          <ul className="pcard-list">
            <li><span className="tick-bg"><svg viewBox="0 0 12 12"><path d="M2 6l3 3 5-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></span>3 monthly modules · 12 weekly labs</li>
            <li><span className="tick-bg"><svg viewBox="0 0 12 12"><path d="M2 6l3 3 5-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></span>Portfolio-grade projects, yours to keep</li>
            <li><span className="tick-bg"><svg viewBox="0 0 12 12"><path d="M2 6l3 3 5-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></span>Dynamic Score on LinkedIn — kept current</li>
            <li><span className="tick-bg"><svg viewBox="0 0 12 12"><path d="M2 6l3 3 5-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></span>UK-time async community + monthly office hours</li>
            <li><span className="tick-bg"><svg viewBox="0 0 12 12"><path d="M2 6l3 3 5-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></span>UK VAT included</li>
          </ul>
          <a className="btn btn--lg btn--accent2 pcard-btn" href="#start">
            Start the course
            <svg className="arrow" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>
          </a>
          <span className="pcard-foot">No card needed for the sample lab</span>
        </div>
        <div className="pcard pcard--side">
          <div className="pcard-tag">Teams (5+)</div>
          <div className="pcard-price">
            <span className="pcard-amount">From £24</span>
            <span className="pcard-per">/ seat / month<br /><small>annual cohort agreement</small></span>
          </div>
          <ul className="pcard-list">
            <li><span className="tick-bg"><svg viewBox="0 0 12 12"><path d="M2 6l3 3 5-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></span>Cohort enrolment, single invoice</li>
            <li><span className="tick-bg"><svg viewBox="0 0 12 12"><path d="M2 6l3 3 5-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></span>Manager dashboard · team Scores</li>
            <li><span className="tick-bg"><svg viewBox="0 0 12 12"><path d="M2 6l3 3 5-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></span>Optional facilitated kickoff</li>
          </ul>
          <a className="btn btn--lg btn--ghost pcard-btn" href="#teams">Talk about cohorts</a>
        </div>
      </div>
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
          <a className="btn btn--lg btn--accent2" href="#start">
            Start the course
            <svg className="arrow" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>
          </a>
          <a className="btn btn--lg btn--ghost-light" href="#sample">Try a free lab</a>
        </div>
        <span className="cta-foot">No card to start a sample lab · UK VAT included on subscription</span>
      </div>
    </div>
  </section>;


const DirB_Footer = ({ isMobile }) =>
<footer className="dirB-footer">
    <div className="dirB-container">
      <div className="ft-top">
        <div className="ft-brand">
          <p>Growth With Tech and Humans. A UK-first applied AI programme for working adults. Three months, one verifiable score.</p>
          <div className="ft-social">
            <a href="#" aria-label="LinkedIn">in</a>
            <a href="#" aria-label="X">𝕏</a>
            <a href="#" aria-label="YouTube">▶</a>
          </div>
        </div>
        <div className="ft-cols">
          <div className="ft-col">
            <span className="mono">Course</span>
            <a href="#">Syllabus</a><a href="#">Dynamic Score</a><a href="#">Sample lab</a><a href="#">Pricing</a>
          </div>
          <div className="ft-col">
            <span className="mono">Audience</span>
            <a href="#">Individuals</a><a href="#">Teams</a><a href="#">Parents</a><a href="#">Founders</a>
          </div>
          <div className="ft-col">
            <span className="mono">Company</span>
            <a href="#">About</a><a href="#">Why GWTH</a><a href="#">Press</a><a href="#">Contact</a>
          </div>
          <div className="ft-col">
            <span className="mono">Legal</span>
            <a href="#">Terms</a><a href="#">Privacy</a><a href="#">Cookies</a><a href="#">Accessibility</a>
          </div>
        </div>
      </div>
      <div className="ft-bottom">
        <span>© 2026 GWTH Ltd · Registered in England &amp; Wales · No. 14872910</span>
        <span className="mono">v1.0 · London</span>
      </div>
    </div>
  </footer>;


window.DirB = DirB;