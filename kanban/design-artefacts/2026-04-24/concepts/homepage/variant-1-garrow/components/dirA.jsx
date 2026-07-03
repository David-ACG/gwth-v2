/* ===========================================================
   DIRECTION A — Editorial precision
   Linear/Vercel-flavoured: dense type, mono labels, single
   accent stroke, journeys as a numbered editorial list,
   trust over decoration.
   =========================================================== */

const DirA = ({ theme = 'light', viewport = 'desktop' }) => {
  const isMobile = viewport === 'mobile';
  return (
    <div className={`gwth dirA theme-${theme} ${isMobile ? 'is-mobile' : ''}`}>
      <DirA_Nav isMobile={isMobile} />
      <DirA_Hero isMobile={isMobile} />
      <DirA_Strip isMobile={isMobile} />
      <DirA_Journeys isMobile={isMobile} />
      <DirA_ProductStory isMobile={isMobile} />
      <DirA_Proof isMobile={isMobile} />
      <DirA_Pricing isMobile={isMobile} />
      <DirA_CTA isMobile={isMobile} />
      <DirA_Footer isMobile={isMobile} />
    </div>
  );
};

/* -- NAV -- */
const DirA_Nav = ({ isMobile }) => (
  <header className="dirA-nav">
    <div className="dirA-container nav-row">
      <div className="nav-brand">
        <GwthWordmark height={22} />
      </div>
      {!isMobile && (
        <nav className="nav-links">
          <a href="#course">Course</a>
          <a href="#score">Dynamic Score</a>
          <a href="#audience">Who it's for</a>
          <a href="#pricing">Pricing</a>
          <a href="#about">About</a>
        </nav>
      )}
      <div className="nav-cta">
        {!isMobile && <a className="nav-link-quiet" href="#login">Sign in</a>}
        <a className="btn btn--sm btn--primary" href="#start">Start the course</a>
        {isMobile && <button className="nav-burger" aria-label="Menu"><span /><span /></button>}
      </div>
    </div>
  </header>
);

/* -- HERO -- */
const DirA_Hero = ({ isMobile }) => (
  <section className="dirA-hero">
    <div className="dirA-container">
      <div className="hero-meta">
        <span className="mono">UK · 3-month programme · Cohort opens June 2026</span>
      </div>
      <h1 className="hero-title">
        Stop watching AI<br />change the world.<br />
        <span className="hero-accent">Start building with it.</span>
      </h1>
      <p className="hero-sub">
        A 3-month applied programme for working UK adults. Five hours a week. Every project in your portfolio. A continuously-updated Dynamic Score employers can verify. No coding required.
      </p>
      <div className="hero-actions">
        <a className="btn btn--lg btn--primary" href="#start">
          Start the course
          <svg className="arrow" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="square"/></svg>
        </a>
        <a className="btn btn--lg btn--ghost" href="#syllabus">View the syllabus</a>
      </div>
      <div className="hero-rule"></div>
      <div className="hero-facts">
        <div className="fact">
          <span className="fact-num">3</span>
          <span className="fact-lbl">months,<br />not years</span>
        </div>
        <div className="fact">
          <span className="fact-num">5<span className="fact-unit">h</span></span>
          <span className="fact-lbl">a week,<br />async-first</span>
        </div>
        <div className="fact">
          <span className="fact-num">21<span className="fact-unit">%</span></span>
          <span className="fact-lbl">of UK workers feel<br />confident using AI</span>
        </div>
        <div className="fact">
          <span className="fact-num">∞</span>
          <span className="fact-lbl">verifiable score,<br />kept current</span>
        </div>
      </div>
    </div>
  </section>
);

/* -- LOGO STRIP -- */
const DirA_Strip = ({ isMobile }) => (
  <section className="dirA-strip">
    <div className="dirA-container">
      <span className="mono strip-label">Built around UK employer signal</span>
      <div className="strip-logos">
        {GWTH_DATA.PROOF_LOGOS.map(l => <span key={l} className="strip-logo">{l}</span>)}
      </div>
    </div>
  </section>
);

/* -- JOURNEYS — editorial numbered list -- */
const DirA_Journeys = ({ isMobile }) => (
  <section className="dirA-journeys" id="audience">
    <div className="dirA-container">
      <div className="section-head">
        <span className="mono">§ Audience — seven journeys</span>
        <h2 className="section-title">
          One course. Seven reasons<br />you might be reading this.
        </h2>
        <p className="section-sub">
          The work is the same. The motivation isn't. Find the line that fits — they all end at the same Dynamic Score.
        </p>
      </div>

      <ol className="journey-list">
        {GWTH_DATA.JOURNEYS.map((j, i) => (
          <li key={j.n} className={`journey-row accent-${j.accent}`}>
            <div className="j-num"><span className="mono">{j.n}</span></div>
            <div className="j-tag"><span className="mono j-tag-pill">{j.tag}</span></div>
            <h3 className="j-title">{j.title}</h3>
            <p className="j-body">{j.body}</p>
            <div className="j-meta">
              {j.stat && (
                <div className="j-stat">
                  <span className="j-stat-val">{j.stat.value}</span>
                  <span className="j-stat-lbl">{j.stat.label}</span>
                </div>
              )}
              <a className="j-cta" href="#start">
                {j.cta || 'Read the syllabus'}
                <svg className="arrow" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="square"/></svg>
              </a>
            </div>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

/* -- PRODUCT STORY (3 pillars) -- */
const DirA_ProductStory = ({ isMobile }) => (
  <section className="dirA-product" id="course">
    <div className="dirA-container">
      <div className="section-head">
        <span className="mono">§ The product</span>
        <h2 className="section-title">
          Three months. A score employers<br />can check. Plain English in.
        </h2>
      </div>
      <div className="pillar-grid">
        {GWTH_DATA.PRODUCT_PILLARS.map(p => (
          <div key={p.n} className="pillar">
            <div className="pillar-head">
              <span className="mono">{p.n} / {p.label}</span>
            </div>
            <h3 className="pillar-title">{p.title}</h3>
            <p className="pillar-body">{p.body}</p>
            {p.n === '02' && <DirA_ScoreCard />}
            {p.n === '01' && <DirA_TimelineCard />}
            {p.n === '03' && <DirA_PromptCard />}
          </div>
        ))}
      </div>
    </div>
  </section>
);

const DirA_TimelineCard = () => (
  <div className="device device--timeline">
    <div className="dev-head">
      <span className="mono">curriculum.gwth.ai</span>
    </div>
    <div className="timeline">
      {[
        { m: 'M1', t: 'Foundations', d: 'Prompting, agents, tooling' },
        { m: 'M2', t: 'Build', d: 'Automations, document AI, ship' },
        { m: 'M3', t: 'Portfolio', d: 'Capstone, score, defence' },
      ].map((s, i) => (
        <div key={s.m} className="t-row">
          <span className="t-marker">{s.m}</span>
          <div className="t-body">
            <span className="t-title">{s.t}</span>
            <span className="t-desc">{s.d}</span>
          </div>
          <span className="t-bar"><span className="t-fill" style={{ width: `${[100, 60, 12][i]}%` }} /></span>
        </div>
      ))}
    </div>
  </div>
);

const DirA_ScoreCard = () => (
  <div className="device device--score">
    <div className="dev-head">
      <span className="mono">linkedin.com/in/sam-osman</span>
    </div>
    <div className="score-row">
      <div className="score-avatar">SO</div>
      <div className="score-meta">
        <span className="score-name">Sam Osman</span>
        <span className="score-role">Operations · London</span>
      </div>
    </div>
    <div className="score-card">
      <div className="score-card-head">
        <span className="score-badge"><GwthIcon size={14} mintColor="#1CBA93" /> Verified by GWTH.ai</span>
        <span className="mono score-update">updated 2d ago</span>
      </div>
      <div className="score-num-row">
        <span className="score-num">782</span>
        <span className="score-trend">▲ 14</span>
      </div>
      <div className="score-meter">
        <span className="score-meter-fill" style={{ width: '78%' }} />
      </div>
      <div className="score-tags">
        <span className="score-tag">Prompting</span>
        <span className="score-tag">Agents</span>
        <span className="score-tag">Doc AI</span>
        <span className="score-tag">Automation</span>
      </div>
    </div>
  </div>
);

const DirA_PromptCard = () => (
  <div className="device device--prompt">
    <div className="dev-head">
      <span className="mono">prompt — week 6</span>
    </div>
    <div className="prompt-body">
      <span className="prompt-line"><span className="prompt-caret">{'>'}</span> Take last quarter's invoices,</span>
      <span className="prompt-line"><span className="prompt-caret">{'>'}</span> flag anything over £2,000,</span>
      <span className="prompt-line"><span className="prompt-caret">{'>'}</span> and draft a chase email.</span>
      <span className="prompt-out"><span className="ok">●</span> 12 invoices flagged · drafts ready</span>
    </div>
  </div>
);

/* -- PROOF / TESTIMONIAL -- */
const DirA_Proof = ({ isMobile }) => (
  <section className="dirA-proof">
    <div className="dirA-container">
      <div className="proof-grid">
        <blockquote className="proof-quote">
          <span className="mono">— Testimonial · cohort 0 alumni</span>
          <p>"Six weeks in I rebuilt our quoting workflow on my own. The Dynamic Score in my LinkedIn was the thing recruiters actually clicked on. I'm a quantity surveyor — I do not write code."</p>
          <footer>
            <span className="proof-name">Hannah Pierce</span>
            <span className="proof-role">Quantity surveyor · Manchester</span>
          </footer>
        </blockquote>
        <div className="proof-stats">
          <div className="proof-stat">
            <span className="ps-num">94%</span>
            <span className="ps-lbl">finish all three modules</span>
          </div>
          <div className="proof-stat">
            <span className="ps-num">£28k</span>
            <span className="ps-lbl">average pay rise within 12 months (self-reported, n=126)</span>
          </div>
          <div className="proof-stat">
            <span className="ps-num">3.4×</span>
            <span className="ps-lbl">more LinkedIn profile views with Score attached</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* -- PRICING -- */
const DirA_Pricing = ({ isMobile }) => (
  <section className="dirA-pricing" id="pricing">
    <div className="dirA-container">
      <div className="section-head section-head--center">
        <span className="mono">§ Pricing</span>
        <h2 className="section-title">
          One course. One price.<br />Less than an hour with a consultant.
        </h2>
      </div>
      <div className="pricing-card">
        <div className="pc-left">
          <span className="mono">GWTH — Applied AI Skills</span>
          <div className="pc-price">
            <span className="pc-amount">£29</span>
            <span className="pc-per">/ month · 3 months</span>
          </div>
          <span className="pc-total">£87 total · cancel anytime · UK VAT included</span>
          <ul className="pc-list">
            <li><svg viewBox="0 0 16 16" className="tick"><path d="M3 8l3.5 3.5L13 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square"/></svg>3 monthly modules · 12 weekly labs</li>
            <li><svg viewBox="0 0 16 16" className="tick"><path d="M3 8l3.5 3.5L13 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square"/></svg>Portfolio-grade projects, yours to keep</li>
            <li><svg viewBox="0 0 16 16" className="tick"><path d="M3 8l3.5 3.5L13 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square"/></svg>Dynamic Score on LinkedIn — kept current</li>
            <li><svg viewBox="0 0 16 16" className="tick"><path d="M3 8l3.5 3.5L13 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square"/></svg>UK-time async community + monthly office hours</li>
          </ul>
          <div className="pc-actions">
            <a className="btn btn--lg btn--primary" href="#start">Start the course
              <svg className="arrow" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="square"/></svg>
            </a>
            <a className="btn btn--lg btn--ghost" href="#teams">Talk about teams</a>
          </div>
        </div>
        <div className="pc-right">
          <div className="pc-compare">
            <span className="mono">For comparison</span>
            <div className="pc-compare-row">
              <span>One hour with an AI consultant</span>
              <span className="pc-strike">£300+</span>
            </div>
            <div className="pc-compare-row">
              <span>One MBA module</span>
              <span className="pc-strike">£2,400+</span>
            </div>
            <div className="pc-compare-row pc-us">
              <span><strong>GWTH · 3 months</strong></span>
              <span className="pc-ours">£87</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* -- CLOSING CTA -- */
const DirA_CTA = ({ isMobile }) => (
  <section className="dirA-cta">
    <div className="dirA-container">
      <div className="cta-block">
        <h2 className="cta-title">
          The best time to learn AI was six months ago.<br />
          <span className="cta-em">The second best time is right now.</span>
        </h2>
        <div className="cta-actions">
          <a className="btn btn--lg btn--accent" href="#start">Start the course
            <svg className="arrow" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="square"/></svg>
          </a>
          <a className="btn btn--lg btn--ghost" href="#sample">Try a free lab</a>
        </div>
        <span className="mono cta-foot">No card to start a sample lab · UK VAT included on subscription</span>
      </div>
    </div>
  </section>
);

/* -- FOOTER -- */
const DirA_Footer = ({ isMobile }) => (
  <footer className="dirA-footer">
    <div className="dirA-container">
      <div className="ft-top">
        <div className="ft-brand">
          <p>Growth With Tech and Humans. A UK-first applied AI programme for working adults.</p>
        </div>
        <div className="ft-cols">
          <div className="ft-col">
            <span className="mono">Course</span>
            <a href="#">Syllabus</a>
            <a href="#">Dynamic Score</a>
            <a href="#">Sample lab</a>
            <a href="#">Pricing</a>
          </div>
          <div className="ft-col">
            <span className="mono">Audience</span>
            <a href="#">Individuals</a>
            <a href="#">Teams</a>
            <a href="#">Parents</a>
            <a href="#">Founders</a>
          </div>
          <div className="ft-col">
            <span className="mono">Company</span>
            <a href="#">About</a>
            <a href="#">Why GWTH</a>
            <a href="#">Press</a>
            <a href="#">Contact</a>
          </div>
          <div className="ft-col">
            <span className="mono">Legal</span>
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Cookies</a>
            <a href="#">Accessibility</a>
          </div>
        </div>
      </div>
      <div className="ft-bottom">
        <span>© 2026 GWTH Ltd · Registered in England & Wales · No. 14872910</span>
        <span className="mono">v1.0 · London · Made with no nonsense</span>
      </div>
    </div>
  </footer>
);

window.DirA = DirA;
