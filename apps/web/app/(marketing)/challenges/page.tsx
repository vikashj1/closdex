// Marketing challenges page — ported from the prototype HTML.
export default function MarketingChallengesPage() {
  return (
    <main>
    
      
      <section className="phero">
        <div className="container" data-stagger="">
          <span className="tag tag--violet">The arena floor · 80+ live scenarios</span>
          <h1>Every lead you're afraid of. <span className="violet">On demand.</span></h1>
          <p className="lead phero__sub">Challenges are realistic, dynamic conversations with AI-simulated buyers. Same scenario, different conversation every time — the lead reacts to what you actually say. Pick a tier, hit your goal, get scored.</p>
          <div className="phero__ctas">
            <a className="btn btn--primary" href="#">Start your first challenge <span className="arrow">→</span></a>
            <a className="btn btn--secondary" href="Closdex Leaderboard.html">See the leaderboard</a>
          </div>
        </div>
      </section>
    
      
      <section className="section bg-tint">
        <div className="container">
          <div className="shead-row">
            <div className="shead">
              <span className="tag tag--violet">Six persona archetypes</span>
              <h2 className="display">Practice the leads that actually scare you.</h2>
              <p className="lead">Every persona reacts dynamically — built from real call transcripts contributed by working sales coaches.</p>
            </div>
            <a className="btn btn--secondary" href="#">Browse all 80+ <span className="arrow">→</span></a>
          </div>
          <div className="personas pindex">
            <div className="persona">
              <span className="persona__n">01</span><span className="persona__name">The Cold Opener</span>
              <span className="persona__meta"><span className="persona__diff diff--rookie">Rookie</span><span className="persona__var">· 18 variations</span></span>
              <a className="persona__cta" href="#">Practice this <span className="arrow">→</span></a>
            </div>
            <div className="persona">
              <span className="persona__n">02</span><span className="persona__name">The Skeptic</span>
              <span className="persona__meta"><span className="persona__diff diff--hard">Hard</span><span className="persona__var">· 14 variations</span></span>
              <a className="persona__cta" href="#">Practice this <span className="arrow">→</span></a>
            </div>
            <div className="persona">
              <span className="persona__n">03</span><span className="persona__name">The Gatekeeper</span>
              <span className="persona__meta"><span className="persona__diff diff--hard">Hard</span><span className="persona__var">· 9 variations</span></span>
              <a className="persona__cta" href="#">Practice this <span className="arrow">→</span></a>
            </div>
            <div className="persona">
              <span className="persona__n">04</span><span className="persona__name">The Pricing Pushback</span>
              <span className="persona__meta"><span className="persona__diff diff--medium">Medium</span><span className="persona__var">· 12 variations</span></span>
              <a className="persona__cta" href="#">Practice this <span className="arrow">→</span></a>
            </div>
            <div className="persona">
              <span className="persona__n">05</span><span className="persona__name">The Ghoster</span>
              <span className="persona__meta"><span className="persona__diff diff--medium">Medium</span><span className="persona__var">· 7 variations</span></span>
              <a className="persona__cta" href="#">Practice this <span className="arrow">→</span></a>
            </div>
            <div className="persona">
              <span className="persona__n">06</span><span className="persona__name">The Committee</span>
              <span className="persona__meta"><span className="persona__diff diff--expert">Expert</span><span className="persona__var">· 5 variations</span></span>
              <a className="persona__cta" href="#">Practice this <span className="arrow">→</span></a>
            </div>
          </div>
        </div>
      </section>
    
      
      <section className="section">
        <div className="container">
          <div className="shead">
            <span className="tag tag--violet">A peek at the library</span>
            <h2 className="display">Fresh challenges drop every week.</h2>
          </div>
          <div className="gate">
            <div className="egrid egrid--3 egrid--hair">
              <div className="eitem"><div className="difftier__top"><span className="difftier__tag" style={{ "--d": "var(--d-medium)", color: "var(--d-medium)" }}>Medium</span><span className="difftier__pts">+240</span></div><h3>Cold call → demo, mid-market SaaS</h3><p className="micro" style={{ display: "flex", justifyContent: "space-between" }}><span>◎ Book a demo</span><span>10 min</span></p></div>
              <div className="eitem"><div className="difftier__top"><span className="difftier__tag" style={{ "--d": "var(--d-hard)", color: "var(--d-hard)" }}>Hard</span><span className="difftier__pts">+480</span></div><h3>Gatekeeper bypass: enterprise IT</h3><p className="micro" style={{ display: "flex", justifyContent: "space-between" }}><span>◎ Reach decision-maker</span><span>12 min</span></p></div>
              <div className="eitem"><div className="difftier__top"><span className="difftier__tag" style={{ "--d": "var(--d-medium)", color: "var(--d-medium)" }}>Medium</span><span className="difftier__pts">+256</span></div><h3>Re-engage the ghosted prospect</h3><p className="micro" style={{ display: "flex", justifyContent: "space-between" }}><span>◎ Revive lead</span><span>10 min</span></p></div>
              <div className="eitem" style={{ opacity: ".45" }}><div className="difftier__top"><span className="difftier__tag" style={{ "--d": "var(--d-medium)", color: "var(--d-medium)" }}>Medium</span><span className="difftier__pts">+256</span></div><h3>Pricing pushback — defend value</h3><p className="micro" style={{ display: "flex", justifyContent: "space-between" }}><span>◎ Send proposal</span><span>15 min</span></p></div>
              <div className="eitem" style={{ opacity: ".45" }}><div className="difftier__top"><span className="difftier__tag" style={{ "--d": "var(--d-easy)", color: "var(--d-easy)" }}>Easy</span><span className="difftier__pts">+120</span></div><h3>Discovery with a curious CTO</h3><p className="micro" style={{ display: "flex", justifyContent: "space-between" }}><span>◎ Qualify need</span><span>8 min</span></p></div>
              <div className="eitem" style={{ opacity: ".45" }}><div className="difftier__top"><span className="difftier__tag" style={{ "--d": "var(--d-expert)", color: "var(--d-expert)" }}>Expert</span><span className="difftier__pts">+820</span></div><h3>Displace the incumbent vendor</h3><p className="micro" style={{ display: "flex", justifyContent: "space-between" }}><span>◎ Win the switch</span><span>18 min</span></p></div>
            </div>
            <div className="gate__fade" style={{ background: "linear-gradient(to bottom, transparent, var(--paper) 72%)" }}>
              <div className="gate__card">
                <h4>Sign up free to unlock all 80+ challenges</h4>
                <p>No credit card. No paywall. Take your calibration challenge and get your first rank in under five minutes.</p>
                <a className="btn btn--primary btn--sm" href="#">Create free account <span className="arrow">→</span></a>
              </div>
            </div>
          </div>
        </div>
      </section>
    
      
      <section className="section bg-tint">
        <div className="container">
          <div className="phero__grid" style={{ alignItems: "center" }}>
            <div>
              <span className="tag tag--cool">Scored on a published rubric</span>
              <h2 className="display" style={{ margin: "16px 0 14px" }}>Every message graded on five dimensions.</h2>
              <p className="lead" style={{ marginBottom: "24px" }}>Discovery, objection handling, value articulation, conversation control, and goal execution — each scored 1–5, totally auditable. We show our work, and so should you.</p>
              <a className="btn btn--secondary" href="Closdex Learn.html">See how scoring works</a>
            </div>
            <div className="rubric-list">
              <div className="rl"><div className="rl__top"><span>Discovery</span><span className="v">4/5</span></div><div className="rl__bar"><i className="on"></i><i className="on"></i><i className="on"></i><i className="on"></i><i></i></div></div>
              <div className="rl"><div className="rl__top"><span>Objection handling</span><span className="v">5/5</span></div><div className="rl__bar"><i className="on"></i><i className="on"></i><i className="on"></i><i className="on"></i><i className="on"></i></div></div>
              <div className="rl"><div className="rl__top"><span>Value articulation</span><span className="v">4/5</span></div><div className="rl__bar"><i className="on"></i><i className="on"></i><i className="on"></i><i className="on"></i><i></i></div></div>
              <div className="rl"><div className="rl__top"><span>Conversation control</span><span className="v">4/5</span></div><div className="rl__bar"><i className="on"></i><i className="on"></i><i className="on"></i><i className="on"></i><i></i></div></div>
              <div className="rl"><div className="rl__top"><span>Goal execution</span><span className="v">5/5</span></div><div className="rl__bar"><i className="on"></i><i className="on"></i><i className="on"></i><i className="on"></i><i className="on"></i></div></div>
            </div>
          </div>
        </div>
      </section>
    
      
      <section className="section">
        <div className="container">
          <div className="ctaband">
            <div className="ctaband__inner">
              <span className="tag tag--violet" style={{ background: "color-mix(in srgb, var(--violet) 22%, transparent)", color: "#fff" }}>Your first rank is 5 minutes away</span>
              <h2>Step into the <span className="violet">arena.</span></h2>
              <p>Free forever for salespersons. Pick a lead, have the conversation, and see where you land on the board.</p>
              <div className="ctaband__ctas">
                <a className="btn btn--light" href="#">Start competing — free <span className="arrow">→</span></a>
                <a className="btn btn--outline-light" href="Closdex Leaderboard.html">See the leaderboard</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    
    </main>
  );
}
