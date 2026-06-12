// Marketing pricing page — ported from the prototype HTML.
export default function PricingPage() {
  return (
    <main>
    
      
      <section className="phero phero--center">
        <div className="container" data-stagger="">
          <span className="tag tag--violet">Pricing · IT Sales vertical</span>
          <h1>Free to compete. <span className="violet">Aligned to outcomes.</span></h1>
          <p className="lead phero__sub">Salespersons never pay. Companies browse for free and pay on results. No hidden seats, no surprise overages.</p>
          <div className="billing" role="tablist" aria-label="Billing period">
            <button className="billing__btn" data-annual="false" aria-selected="true">Monthly</button>
            <button className="billing__btn" data-annual="true" aria-selected="false">Annual · 2 months free</button>
          </div>
        </div>
      </section>
    
      
      <section className="container" style={{ paddingBottom: "8px" }}>
        <div className="freebanner">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px", flexWrap: "wrap" }}>
              <h3>Salespersons</h3>
              <span className="tag tag--violet">Free forever in Phase 1</span>
            </div>
            <p className="lead" style={{ fontSize: "15px", margin: "0" }}>Unlimited challenges, public profile, shareable rank URL, and eligibility for 47+ hiring-partner roles. No credit card, ever.</p>
            <div className="freebanner__feats">
              <span><span className="ck">✓</span>Unlimited challenges</span>
              <span><span className="ck">✓</span>Public ranked profile</span>
              <span><span className="ck">✓</span>1-click apply with proof</span>
              <span><span className="ck">✓</span>Activity heatmap &amp; badges</span>
            </div>
          </div>
          <div className="freebanner__price">
            <div className="n">₹0</div>
            <div className="l">forever</div>
            <a className="btn btn--primary" href="#">Start free <span className="arrow">→</span></a>
          </div>
        </div>
      </section>
    
      
      <section className="section">
        <div className="container">
          <div className="shead shead--center">
            <span className="tag tag--cool" style={{ marginInline: "auto" }}>For companies</span>
            <h2 className="display">Plans that scale with your hiring.</h2>
          </div>
          <div className="pricing">
            <div className="ptier" style={{ "--pa": "var(--muted)" }}>
              <div className="ptier__bar"></div>
              <h3>Starter</h3>
              <p className="ptier__blurb">For a first role or a small team.</p>
              <div className="ptier__price"><span className="n" data-mo="4999">₹4,999</span><span className="per">/mo</span></div>
              <div className="ptier__fee">12.5% placement fee on confirmed hires</div>
              <a className="btn btn--secondary" href="#" style={{ width: "100%" }}>Choose Starter</a>
              <ul className="ptier__feats">
                <li><span className="ck">✓</span>1 active job posting</li>
                <li><span className="ck">✓</span>Browse + shortlist the full board</li>
                <li><span className="ck">✓</span>Performance breakdowns</li>
                <li><span className="ck">✓</span>Email support</li>
              </ul>
            </div>
            <div className="ptier ptier--pop" style={{ "--pa": "var(--violet)" }}>
              <span className="ptier__pop">Most popular</span>
              <div className="ptier__bar"></div>
              <h3>Growth</h3>
              <p className="ptier__blurb">For teams hiring continuously.</p>
              <div className="ptier__price"><span className="n" data-mo="14999">₹14,999</span><span className="per">/mo</span></div>
              <div className="ptier__fee">12.5% placement fee on confirmed hires</div>
              <a className="btn btn--primary" href="#" style={{ width: "100%" }}>Choose Growth</a>
              <ul className="ptier__feats">
                <li><span className="ck">✓</span>5 active job postings</li>
                <li><span className="ck">✓</span>Team shortlists &amp; panel comments</li>
                <li><span className="ck">✓</span>Advanced skill filters</li>
                <li><span className="ck">✓</span>Priority support</li>
                <li><span className="ck">✓</span>ATS export</li>
              </ul>
            </div>
            <div className="ptier" style={{ "--pa": "var(--violet-deep)" }}>
              <div className="ptier__bar"></div>
              <h3>Scale</h3>
              <p className="ptier__blurb">For high-volume sales orgs.</p>
              <div className="ptier__price"><span className="n" data-mo="39999">₹39,999</span><span className="per">/mo</span></div>
              <div className="ptier__fee">10% placement fee on confirmed hires</div>
              <a className="btn btn--secondary" href="#" style={{ width: "100%" }}>Choose Scale</a>
              <ul className="ptier__feats">
                <li><span className="ck">✓</span>Unlimited job postings</li>
                <li><span className="ck">✓</span>Dedicated talent advisor</li>
                <li><span className="ck">✓</span>Custom analytics dashboard</li>
                <li><span className="ck">✓</span>Reduced 10% placement fee</li>
                <li><span className="ck">✓</span>SSO + audit logs</li>
              </ul>
            </div>
          </div>
          <p style={{ textAlign: "center", marginTop: "18px", fontSize: "14px", color: "var(--muted)" }}>Need more than Scale? <a href="#" style={{ color: "var(--violet-deep)", fontWeight: "600" }}>Talk to us about Enterprise →</a></p>
        </div>
      </section>
    
      
      <section className="section bg-tint">
        <div className="container">
          <div className="phero__grid" style={{ gridTemplateColumns: "1fr 1.1fr", alignItems: "center" }}>
            <div>
              <span className="tag tag--pos">How the placement fee works</span>
              <h2 className="display" style={{ margin: "16px 0 14px" }}>You only pay when you actually hire.</h2>
              <p className="lead">Your subscription covers postings and access. The placement fee — 12.5% of first-year fixed CTC, or 10% on Scale — is charged once, on a confirmed hire, and is fully covered by the 90-day replacement guarantee.</p>
            </div>
            <div className="ranklist">
              <div className="rankrow" style={{ gridTemplateColumns: "34px 1fr" }}><span style={{ width: "30px", height: "30px", borderRadius: "50%", background: "var(--positive)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--display)", fontWeight: "700", fontSize: "14px" }}>1</span><div><div style={{ fontWeight: "600" }}>Subscribe &amp; post</div><div className="micro" style={{ marginTop: "2px" }}>Pick a plan, post your role, and start browsing the ranked pool.</div></div></div>
              <div className="rankrow" style={{ gridTemplateColumns: "34px 1fr" }}><span style={{ width: "30px", height: "30px", borderRadius: "50%", background: "var(--positive)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--display)", fontWeight: "700", fontSize: "14px" }}>2</span><div><div style={{ fontWeight: "600" }}>Shortlist &amp; interview</div><div className="micro" style={{ marginTop: "2px" }}>Evaluate performance breakdowns and interview your favourites — no charge.</div></div></div>
              <div className="rankrow" style={{ gridTemplateColumns: "34px 1fr" }}><span style={{ width: "30px", height: "30px", borderRadius: "50%", background: "var(--positive)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--display)", fontWeight: "700", fontSize: "14px" }}>3</span><div><div style={{ fontWeight: "600" }}>Hire &amp; pay once</div><div className="micro" style={{ marginTop: "2px" }}>On a confirmed hire, pay 12.5% of first-year fixed CTC. Backed 90 days.</div></div></div>
            </div>
          </div>
        </div>
      </section>
    
      
      <section className="section">
        <div className="container">
          <div className="freebanner" style={{ background: "linear-gradient(120deg, color-mix(in srgb, var(--violet-deep) 8%, var(--paper)), var(--paper))", borderColor: "color-mix(in srgb, var(--violet-deep) 26%, transparent)" }}>
            <div>
              <span className="tag tag--cool" style={{ marginBottom: "12px" }}>Sales enablement · private team leagues</span>
              <h3 style={{ marginTop: "6px" }}>Train your own team on your own leads.</h3>
              <p className="lead" style={{ fontSize: "15px", margin: "10px 0 0" }}>Upload your ICP, objections, and competitive landscape. We turn them into custom scenarios with a rubric you control (SPIN / BANT / MEDDIC / Challenger), plus a team leaderboard and manager analytics.</p>
            </div>
            <div className="freebanner__price">
              <div className="l" style={{ margin: "0 0 2px" }}>from</div>
              <div className="n">₹39,999</div>
              <div className="l">/mo</div>
              <a className="btn btn--secondary" href="#">Request demo</a>
            </div>
          </div>
        </div>
      </section>
    
      
      <section className="section bg-tint">
        <div className="container">
          <div className="shead shead--center">
            <span className="tag tag--ghost" style={{ marginInline: "auto" }}>Compare company plans</span>
            <h2 className="display">Every feature, side by side.</h2>
          </div>
          <div className="compare">
            <div className="crow crow--head">
              <div className="crow__feat">Feature</div>
              <div className="crow__cell">Starter</div>
              <div className="crow__cell pop">Growth</div>
              <div className="crow__cell">Scale</div>
            </div>
            <div className="crow"><div className="crow__feat">Active job postings</div><div className="crow__cell">1</div><div className="crow__cell pop">5</div><div className="crow__cell">Unlimited</div></div>
            <div className="crow"><div className="crow__feat">Browse full leaderboard</div><div className="crow__cell yes">✓</div><div className="crow__cell yes pop">✓</div><div className="crow__cell yes">✓</div></div>
            <div className="crow"><div className="crow__feat">Performance breakdowns</div><div className="crow__cell yes">✓</div><div className="crow__cell yes pop">✓</div><div className="crow__cell yes">✓</div></div>
            <div className="crow"><div className="crow__feat">Team shortlists &amp; comments</div><div className="crow__cell no">—</div><div className="crow__cell yes pop">✓</div><div className="crow__cell yes">✓</div></div>
            <div className="crow"><div className="crow__feat">Advanced skill filters</div><div className="crow__cell no">—</div><div className="crow__cell yes pop">✓</div><div className="crow__cell yes">✓</div></div>
            <div className="crow"><div className="crow__feat">Custom analytics dashboard</div><div className="crow__cell no">—</div><div className="crow__cell no pop">—</div><div className="crow__cell yes">✓</div></div>
            <div className="crow"><div className="crow__feat">Dedicated talent advisor</div><div className="crow__cell no">—</div><div className="crow__cell no pop">—</div><div className="crow__cell yes">✓</div></div>
            <div className="crow"><div className="crow__feat">Placement fee</div><div className="crow__cell">12.5%</div><div className="crow__cell pop">12.5%</div><div className="crow__cell">10%</div></div>
            <div className="crow"><div className="crow__feat">SSO + audit logs</div><div className="crow__cell no">—</div><div className="crow__cell no pop">—</div><div className="crow__cell yes">✓</div></div>
          </div>
        </div>
      </section>
    
      
      <section className="section">
        <div className="container">
          <div className="faq__grid">
            <div className="shead" style={{ marginBottom: "0" }}>
              <span className="tag tag--violet">Pricing questions</span>
              <h2 className="display" style={{ margin: "18px 0 12px" }}>Before you commit.</h2>
              <p className="lead" style={{ fontSize: "15px" }}>Still unsure which plan fits? We answer every email personally.</p>
              <p className="faq__contact" style={{ marginTop: "16px" }}><a href="mailto:hello@closdex.com">hello@closdex.com</a></p>
            </div>
            <div className="qa">
              <div className="qa__item"><h4 className="qa__q">Is it really free for salespersons?</h4><p className="qa__a">Yes — 100% free in Phase 1. No paywalls, no premium tier, no "unlock to apply" tricks. Companies fund the platform through subscriptions and placement fees.</p></div>
              <div className="qa__item"><h4 className="qa__q">How does the placement fee work?</h4><p className="qa__a">You pay 12.5% of the hire's first-year fixed CTC only when a hire is confirmed (10% on the Scale plan). Browsing, shortlisting, and interviewing cost nothing beyond your subscription.</p></div>
              <div className="qa__item"><h4 className="qa__q">What's the 90-day guarantee?</h4><p className="qa__a">If a placed hire leaves or doesn't work out within 90 days, we either replace them at no extra placement fee or refund 50% of the fee — your choice.</p></div>
              <div className="qa__item"><h4 className="qa__q">Can I change or cancel plans?</h4><p className="qa__a">Yes. Upgrade, downgrade, or cancel anytime from billing. Annual plans are billed for ten months — two months free versus paying monthly.</p></div>
            </div>
          </div>
        </div>
      </section>
    
      
      <section className="section">
        <div className="container">
          <div className="ctaband">
            <div className="ctaband__inner">
              <span className="tag tag--violet" style={{ background: "color-mix(in srgb, var(--violet) 22%, transparent)", color: "#fff" }}>No credit card to start</span>
              <h2>Start free, on either side of the <span className="violet">board.</span></h2>
              <p>Salespersons compete for free. Companies browse for free and pay only on confirmed hires.</p>
              <div className="ctaband__ctas">
                <a className="btn btn--light" href="#">Start competing — free <span className="arrow">→</span></a>
                <a className="btn btn--outline-light" href="Closdex For Companies.html">Browse talent free</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    
    </main>
  );
}
