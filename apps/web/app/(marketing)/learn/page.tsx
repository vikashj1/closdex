// Marketing learn page — ported from the prototype HTML.
export default function MarketingLearnPage() {
  return (
    <main>
    
      
      <section className="phero phero--center">
        <div className="container" data-stagger="">
          <span className="tag tag--violet">Learn · scoring, ranks &amp; sales craft</span>
          <h1>Learn the game. <span className="violet">Then go win it.</span></h1>
          <p className="lead phero__sub">Exactly how scoring works, how ranks are earned, and the sales craft behind every challenge — all out in the open. No black box, no gatekeeping.</p>
        </div>
      </section>
    
      
      <section className="section bg-tint">
        <div className="container">
          <div className="shead">
            <span className="tag tag--violet">How scoring works</span>
            <h2 className="display">Five dimensions, one transparent formula.</h2>
            <p className="lead">Every challenge is graded 1–5 across five dimensions. Those combine with your goal outcome and difficulty to produce the points that move your rank.</p>
          </div>
          <div className="egrid egrid--5" style={{ marginBottom: "28px" }}>
            <div className="eitem"><div className="eitem__n">01</div><h4>Discovery</h4><p>Did you uncover real need, budget, and decision process — or just pitch?</p></div>
            <div className="eitem"><div className="eitem__n">02</div><h4>Objection handling</h4><p>How well you acknowledged, reframed, and resolved pushback under pressure.</p></div>
            <div className="eitem"><div className="eitem__n">03</div><h4>Value articulation</h4><p>Tying your solution to the buyer's specific pain, in their language.</p></div>
            <div className="eitem"><div className="eitem__n">04</div><h4>Conversation control</h4><p>Pace, question quality, and keeping the exchange moving toward the goal.</p></div>
            <div className="eitem"><div className="eitem__n">05</div><h4>Goal execution</h4><p>Did you actually achieve the scenario's objective — the call, the proposal, the close?</p></div>
          </div>
          <div style={{ border: "0.5px solid var(--hairline)", borderRadius: "16px", padding: "clamp(22px,3vw,32px)", background: "var(--paper)" }}>
            <p className="micro" style={{ textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>The points formula</p>
            <div className="formula">
              <span className="fchip fchip--d">Base (difficulty)</span>
              <span className="formula__op">×</span>
              <span className="fchip fchip--g">Goal multiplier</span>
              <span className="formula__op">×</span>
              <span className="fchip fchip--q">Quality (rubric avg)</span>
              <span className="formula__op">+</span>
              <span className="fchip fchip--b">Bonuses</span>
              <span className="formula__op">=</span>
              <span className="fchip fchip--out">Points earned</span>
            </div>
            <div className="bonuses">
              <span><b>Speed bonus</b> — hit the goal in fewer messages.</span>
              <span><b>First-try bonus</b> — clear it without a retry.</span>
              <span><b>Streak bonus</b> — compounds with daily play.</span>
            </div>
          </div>
        </div>
      </section>
    
      
      <section className="section">
        <div className="container">
          <div className="shead">
            <span className="tag tag--violet">The rank system</span>
            <h2 className="display">Eight ranks. Points are the only currency.</h2>
            <p className="lead">Cross a threshold and you rank up for good — unlocking harder tiers and more visibility to hiring partners.</p>
          </div>
          <div className="egrid egrid--4" style={{ gap: "18px" }}>
            <div className="eitem" style={{ borderTop: "none", paddingTop: "0", display: "flex", alignItems: "center", gap: "14px" }}><span style={{ width: "16px", height: "16px", background: "var(--muted)", opacity: ".6", transform: "rotate(45deg)", borderRadius: "3px" }}></span><div><div style={{ fontFamily: "var(--display)", fontWeight: "700", fontSize: "16px" }}>Rookie</div><div className="micro">0+ pts</div></div></div>
            <div className="eitem" style={{ borderTop: "none", paddingTop: "0", display: "flex", alignItems: "center", gap: "14px" }}><span style={{ width: "16px", height: "16px", background: "#B0763C", transform: "rotate(45deg)", borderRadius: "3px" }}></span><div><div style={{ fontFamily: "var(--display)", fontWeight: "700", fontSize: "16px" }}>Bronze</div><div className="micro">500+ pts</div></div></div>
            <div className="eitem" style={{ borderTop: "none", paddingTop: "0", display: "flex", alignItems: "center", gap: "14px" }}><span style={{ width: "16px", height: "16px", background: "#9AA0AE", opacity: ".7", transform: "rotate(45deg)", borderRadius: "3px" }}></span><div><div style={{ fontFamily: "var(--display)", fontWeight: "700", fontSize: "16px" }}>Silver</div><div className="micro">1,500+ pts</div></div></div>
            <div className="eitem" style={{ borderTop: "none", paddingTop: "0", display: "flex", alignItems: "center", gap: "14px" }}><span style={{ width: "16px", height: "16px", background: "var(--gold)", transform: "rotate(45deg)", borderRadius: "3px" }}></span><div><div style={{ fontFamily: "var(--display)", fontWeight: "700", fontSize: "16px" }}>Gold</div><div className="micro">4,000+ pts</div></div></div>
            <div className="eitem" style={{ display: "flex", alignItems: "center", gap: "14px" }}><span style={{ width: "16px", height: "16px", background: "#9AA0AE", transform: "rotate(45deg)", borderRadius: "3px" }}></span><div><div style={{ fontFamily: "var(--display)", fontWeight: "700", fontSize: "16px" }}>Platinum</div><div className="micro">9,000+ pts</div></div></div>
            <div className="eitem" style={{ display: "flex", alignItems: "center", gap: "14px" }}><span style={{ width: "16px", height: "16px", background: "#57C5E8", transform: "rotate(45deg)", borderRadius: "3px" }}></span><div><div style={{ fontFamily: "var(--display)", fontWeight: "700", fontSize: "16px" }}>Diamond</div><div className="micro">18,000+ pts</div></div></div>
            <div className="eitem" style={{ display: "flex", alignItems: "center", gap: "14px" }}><span style={{ width: "16px", height: "16px", background: "var(--violet)", opacity: ".85", transform: "rotate(45deg)", borderRadius: "3px" }}></span><div><div style={{ fontFamily: "var(--display)", fontWeight: "700", fontSize: "16px" }}>Master</div><div className="micro">35,000+ pts</div></div></div>
            <div className="eitem" style={{ display: "flex", alignItems: "center", gap: "14px" }}><span style={{ width: "16px", height: "16px", background: "var(--violet)", transform: "rotate(45deg)", borderRadius: "3px" }}></span><div><div style={{ fontFamily: "var(--display)", fontWeight: "700", fontSize: "16px" }}>Grandmaster</div><div className="micro">70,000+ pts</div></div></div>
          </div>
        </div>
      </section>
    
      
      <section className="section bg-tint">
        <div className="container">
          <div className="shead-row">
            <div className="shead">
              <span className="tag tag--violet">Guides &amp; playbooks</span>
              <h2 className="display">Sharpen the craft between challenges.</h2>
            </div>
            <a className="btn btn--secondary" href="#">All guides <span className="arrow">→</span></a>
          </div>
          <div className="guides">
            <div className="guide"><div className="guide__meta"><span className="guide__cat">Discovery</span><span className="guide__lvl">Foundational</span></div><h3>The five questions that qualify any IT-sales lead</h3><div className="guide__foot"><span>6 min read</span><span style={{ color: "var(--violet-deep)", fontWeight: "600" }}>Read →</span></div></div>
            <div className="guide"><div className="guide__meta"><span className="guide__cat">Objections</span><span className="guide__lvl">Intermediate</span></div><h3>Reframing "you're too expensive" without dropping price</h3><div className="guide__foot"><span>8 min read</span><span style={{ color: "var(--violet-deep)", fontWeight: "600" }}>Read →</span></div></div>
            <div className="guide"><div className="guide__meta"><span className="guide__cat">Cold outreach</span><span className="guide__lvl">Intermediate</span></div><h3>Earning a reply from a CTO who's heard every pitch</h3><div className="guide__foot"><span>7 min read</span><span style={{ color: "var(--violet-deep)", fontWeight: "600" }}>Read →</span></div></div>
            <div className="guide"><div className="guide__meta"><span className="guide__cat">Closing</span><span className="guide__lvl">Advanced</span></div><h3>Creating urgency that survives procurement</h3><div className="guide__foot"><span>9 min read</span><span style={{ color: "var(--violet-deep)", fontWeight: "600" }}>Read →</span></div></div>
            <div className="guide"><div className="guide__meta"><span className="guide__cat">Methodology</span><span className="guide__lvl">Foundational</span></div><h3>SPIN vs MEDDIC: when each one wins</h3><div className="guide__foot"><span>10 min read</span><span style={{ color: "var(--violet-deep)", fontWeight: "600" }}>Read →</span></div></div>
            <div className="guide"><div className="guide__meta"><span className="guide__cat">Career</span><span className="guide__lvl">Foundational</span></div><h3>Turning your rank into interview requests</h3><div className="guide__foot"><span>5 min read</span><span style={{ color: "var(--violet-deep)", fontWeight: "600" }}>Read →</span></div></div>
          </div>
        </div>
      </section>
    
      
      <section className="section">
        <div className="container">
          <div className="shead">
            <span className="tag tag--cool">Methodology primers</span>
            <h2 className="display">The frameworks behind the rubric.</h2>
            <p className="lead">Our scenarios and scoring draw on the methodologies working teams actually use. Enablement customers can weight the rubric to any of them.</p>
          </div>
          <div className="methods">
            <div className="method"><div className="method__k">SPIN</div><p>Situation, Problem, Implication, Need-payoff — question-led discovery.</p></div>
            <div className="method"><div className="method__k">BANT</div><p>Budget, Authority, Need, Timeline — fast lead qualification.</p></div>
            <div className="method"><div className="method__k">MEDDIC</div><p>Metrics, Economic buyer, Decision criteria, and more — enterprise deals.</p></div>
            <div className="method"><div className="method__k">Challenger</div><p>Teach, Tailor, Take control — reframe the buyer's thinking.</p></div>
          </div>
        </div>
      </section>
    
      
      <section className="section">
        <div className="container">
          <div className="ctaband">
            <div className="ctaband__inner">
              <span className="tag tag--violet" style={{ background: "color-mix(in srgb, var(--violet) 22%, transparent)", color: "#fff" }}>Theory's nice. Reps are better.</span>
              <h2>Put the playbook to <span className="violet">work.</span></h2>
              <p>You've seen exactly how it's scored. Now take a challenge and earn your first points.</p>
              <div className="ctaband__ctas">
                <a className="btn btn--light" href="#">Start a challenge — free <span className="arrow">→</span></a>
                <a className="btn btn--outline-light" href="Closdex Leaderboard.html">See the leaderboard</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    
    </main>
  );
}
