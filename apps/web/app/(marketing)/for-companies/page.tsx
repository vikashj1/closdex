// Marketing for-companies page — ported from the prototype HTML.
export default function CompanyPage() {
  return (
    <main>
    
      
      <section className="phero">
        <div className="container" data-stagger="">
          <span className="tag tag--cool">For hiring teams · IT Sales vertical</span>
          <h1>Hire sales talent on <span className="violet">objective performance.</span></h1>
          <p className="lead phero__sub">Stop reading the same 200 "results-driven, dynamic SDR" resumes. Search a pre-vetted, ranked talent pool, view live performance breakdowns, and hire with a 90-day replacement guarantee.</p>
          <div className="phero__ctas">
            <a className="btn btn--primary" href="#">Book a 20-min demo <span className="arrow">→</span></a>
            <a className="btn btn--secondary" href="#">Browse talent — free</a>
          </div>
        </div>
      </section>
    
      
      <section className="section bg-tint">
        <div className="container">
          <div className="versus">
            <div className="vcol" style={{ "--vc": "var(--d-hard)" }}>
              <div className="vcol__h">The old way</div>
              <ul>
                <li><span className="m">✕</span>Resumes optimised for keywords, not skill</li>
                <li><span className="m">✕</span>Interviews that reward confidence over competence</li>
                <li><span className="m">✕</span>Weeks of screening calls to find one closer</li>
                <li><span className="m">✕</span>No way to verify a "120% of quota" claim</li>
              </ul>
            </div>
            <div className="vcol" style={{ "--vc": "var(--violet)" }}>
              <div className="vcol__h">With Closdex</div>
              <ul>
                <li><span className="m">✓</span>A ranked pool where skill is measured, not claimed</li>
                <li><span className="m">✓</span>Full performance breakdown before you ever call</li>
                <li><span className="m">✓</span>Filter to your exact ICP in seconds</li>
                <li><span className="m">✓</span>Verified, auditable scores on a published rubric</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    
      
      <section className="section">
        <div className="container">
          <div className="shead">
            <span className="tag tag--cool">Three steps to a confirmed hire</span>
            <h2 className="display">Search. Evaluate. Hire.</h2>
          </div>
          <div className="egrid egrid--3">
            <div className="eitem">
              <div className="eitem__n">01</div>
              <h3>Search the ranked pool</h3>
              <p>Filter 2,481 salespersons by rank, win-rate, goal-type performance, vertical, and city. Shortlist in one click.</p>
            </div>
            <div className="eitem">
              <div className="eitem__n">02</div>
              <h3>Evaluate real performance</h3>
              <p>Open a candidate to see their rubric scores, conversation replays, activity heatmap, and rank history — not just a CV.</p>
            </div>
            <div className="eitem">
              <div className="eitem__n">03</div>
              <h3>Hire with a guarantee</h3>
              <p>Send an interview request, make the offer, and pay only on a confirmed hire — backed by 90-day replacement.</p>
            </div>
          </div>
        </div>
      </section>
    
      
      <section className="section bg-tint">
        <div className="container">
          <div className="shead">
            <span className="tag tag--cool">Everything in the hiring console</span>
            <h2 className="display">Built for sales-hiring decisions.</h2>
          </div>
          <div className="egrid egrid--3 egrid--hair">
            <div className="eitem"><h4>Pre-vetted ranked pool</h4><p>Every candidate has cleared real challenges. Rank is the floor of the conversation, not a self-reported guess.</p></div>
            <div className="eitem"><h4>Performance breakdowns</h4><p>Five-dimension rubric scores, win-rate by difficulty, and goal-type strengths on every profile.</p></div>
            <div className="eitem"><h4>Precision skill filters</h4><p>Slice by objection-handling, discovery, or closing performance — not just years of experience.</p></div>
            <div className="eitem"><h4>One-click shortlists</h4><p>Build shared shortlists your whole hiring panel can review, comment on, and rank.</p></div>
            <div className="eitem"><h4>90-day guarantee</h4><p>If a hire doesn't work out in 90 days, we replace them — or refund 50% of the placement fee.</p></div>
            <div className="eitem"><h4>Indian-first payments</h4><p>GST invoicing, Razorpay + Stripe, and INR pricing built for Indian finance teams.</p></div>
          </div>
        </div>
      </section>
    
      
      <section className="section">
        <div className="container">
          <div className="shead-row">
            <div className="shead">
              <span className="tag tag--cool">A glimpse of the pool</span>
              <h2 className="display">Talent you could be talking to today.</h2>
            </div>
            <a className="btn btn--secondary" href="#">Open talent search <span className="arrow">→</span></a>
          </div>
          <div className="egrid egrid--3 egrid--hair">
            <div className="eitem">
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <span className="av" style={{ width: "44px", height: "44px", background: "var(--violet)" }}>AS</span>
                <div style={{ flex: "1" }}><div style={{ fontWeight: "600", fontSize: "15px" }}>Aarav Sharma</div><div className="micro">Enterprise AE · 6 yrs</div></div>
                <span className="tier tier--master" style={{ fontSize: "12px" }}><i></i>Master</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "14px", borderTop: "0.5px solid var(--hairline)" }}>
                <div style={{ display: "flex", gap: "18px" }}><div><div className="mono" style={{ fontSize: "15px", fontWeight: "700", color: "var(--violet)" }}>94%</div><div className="micro">win rate</div></div><div><div className="mono" style={{ fontSize: "15px", fontWeight: "700" }}>Bangalore</div><div className="micro">location</div></div></div>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--positive)", display: "inline-flex", alignItems: "center", gap: "5px" }}><span className="livedot"></span>Open to work</span>
              </div>
            </div>
            <div className="eitem">
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <span className="av" style={{ width: "44px", height: "44px", background: "#7A7A86" }}>SR</span>
                <div style={{ flex: "1" }}><div style={{ fontWeight: "600", fontSize: "15px" }}>Sneha Reddy</div><div className="micro">SDR → AE · 3 yrs</div></div>
                <span className="tier tier--diamond" style={{ fontSize: "12px" }}><i></i>Diamond</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "14px", borderTop: "0.5px solid var(--hairline)" }}>
                <div style={{ display: "flex", gap: "18px" }}><div><div className="mono" style={{ fontSize: "15px", fontWeight: "700", color: "var(--violet)" }}>87%</div><div className="micro">win rate</div></div><div><div className="mono" style={{ fontSize: "15px", fontWeight: "700" }}>Hyderabad</div><div className="micro">location</div></div></div>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--positive)", display: "inline-flex", alignItems: "center", gap: "5px" }}><span className="livedot"></span>Open to work</span>
              </div>
            </div>
            <div className="eitem">
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <span className="av" style={{ width: "44px", height: "44px", background: "#7A7A86" }}>RG</span>
                <div style={{ flex: "1" }}><div style={{ fontWeight: "600", fontSize: "15px" }}>Rohan Gupta</div><div className="micro">Inside Sales · 4 yrs</div></div>
                <span className="tier tier--platinum" style={{ fontSize: "12px" }}><i></i>Platinum</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "14px", borderTop: "0.5px solid var(--hairline)" }}>
                <div style={{ display: "flex", gap: "18px" }}><div><div className="mono" style={{ fontSize: "15px", fontWeight: "700", color: "var(--violet)" }}>84%</div><div className="micro">win rate</div></div><div><div className="mono" style={{ fontSize: "15px", fontWeight: "700" }}>Delhi NCR</div><div className="micro">location</div></div></div>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--muted)" }}>Passive</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    
      
      <section className="section bg-tint">
        <div className="container">
          <div className="phero__grid" style={{ gridTemplateColumns: "1.2fr 1fr", alignItems: "center" }}>
            <div>
              <span className="tag tag--cool">Simple, outcome-aligned pricing</span>
              <h2 className="display" style={{ margin: "16px 0 14px" }}>Browse free. Pay on results.</h2>
              <p className="lead" style={{ marginBottom: "24px" }}>Plans start at ₹4,999/mo for one active posting. Placement fee is 12.5% of first-year fixed CTC on confirmed hires — 10% for Scale subscribers — with a 90-day replacement or 50% refund.</p>
              <a className="btn btn--primary" href="Closdex Pricing.html">See full pricing <span className="arrow">→</span></a>
            </div>
            <div className="egrid egrid--2" style={{ gap: "0" }}>
              <div className="eitem" style={{ borderTop: "none" }}><div className="pstat__n" style={{ color: "var(--violet)" }}>Free</div><div className="micro">browse the board</div></div>
              <div className="eitem" style={{ borderTop: "none" }}><div className="pstat__n" style={{ color: "var(--violet)" }}>₹4,999</div><div className="micro">/mo · Starter</div></div>
              <div className="eitem"><div className="pstat__n" style={{ color: "var(--violet)" }}>12.5%</div><div className="micro">placement fee</div></div>
              <div className="eitem"><div className="pstat__n" style={{ color: "var(--violet)" }}>90 days</div><div className="micro">replacement</div></div>
            </div>
          </div>
        </div>
      </section>
    
      
      <section className="section">
        <div className="container">
          <div className="ctaband">
            <div className="ctaband__inner">
              <span className="tag tag--violet" style={{ background: "color-mix(in srgb, var(--violet) 22%, transparent)", color: "#fff" }}>Free to browse · pay on confirmed hires</span>
              <h2>Meet your next <span className="violet">closer.</span></h2>
              <p>Book a 20-minute demo and we'll walk your hiring panel through the ranked pool with your exact ICP loaded.</p>
              <div className="ctaband__ctas">
                <a className="btn btn--light" href="#">Book a demo <span className="arrow">→</span></a>
                <a className="btn btn--outline-light" href="#">Browse talent free</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    
    </main>
  );
}
