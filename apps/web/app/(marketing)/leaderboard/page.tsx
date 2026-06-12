// Marketing leaderboard page — ported from the prototype HTML.
export default function MarketingLeaderboardPage() {
  return (
    <main>
    
      
      <section className="phero">
        <div className="container" data-stagger="">
          <span className="tag tag--violet"><span className="livedot"></span>Live · IT Sales · India · resets in 2d 14h</span>
          <h1>The board companies <span className="violet">actually watch.</span></h1>
          <p className="lead phero__sub">2,481 salespersons ranked purely on performance — no resumes, no referrals, no inflated titles. Every point is earned in the arena and auditable on a published rubric.</p>
        </div>
      </section>
    
      
      <section className="container" style={{ paddingTop: "24px" }}>
        <div className="gate">
          <div className="table table--lb" role="table" aria-label="Leaderboard">
            <div className="thead" role="row">
              <span>Rank</span><span>Salesperson</span><span>Tier</span><span className="num">Points</span><span className="num">Win rate</span><span className="num">Trend</span>
            </div>
            <div className="trow" role="row"><span className="trow__rank" role="cell">#1</span><span className="trow__name" role="cell"><span className="av" style={{ background: "var(--violet)" }}>AS</span>Aarav Sharma <span style={{ display: "inline" }}>Bangalore</span></span><span role="cell"><span className="tier tier--master"><i></i>Master</span></span><span className="trow__pts num" role="cell">38,420</span><span className="trow__win num" role="cell">94%</span><span className="trow__chg num" role="cell">▲ 842</span></div>
            <div className="trow" role="row"><span className="trow__rank" role="cell">#2</span><span className="trow__name" role="cell"><span className="av" style={{ background: "var(--violet)" }}>PI</span>Priya Iyer <span style={{ display: "inline" }}>Mumbai</span></span><span role="cell"><span className="tier tier--master"><i></i>Master</span></span><span className="trow__pts num" role="cell">36,110</span><span className="trow__win num" role="cell">92%</span><span className="trow__chg num" role="cell">▲ 512</span></div>
            <div className="trow" role="row"><span className="trow__rank" role="cell">#3</span><span className="trow__name" role="cell"><span className="av" style={{ background: "var(--violet)" }}>KM</span>Karan Mehta <span style={{ display: "inline" }}>Pune</span></span><span role="cell"><span className="tier tier--diamond"><i></i>Diamond</span></span><span className="trow__pts num" role="cell">28,940</span><span className="trow__win num" role="cell">89%</span><span className="trow__chg num" role="cell">▲ 1,204</span></div>
            <div className="trow" role="row"><span className="trow__rank" role="cell">#4</span><span className="trow__name" role="cell"><span className="av" style={{ background: "#7A7A86" }}>SR</span>Sneha Reddy <span style={{ display: "inline" }}>Hyderabad</span></span><span role="cell"><span className="tier tier--diamond"><i></i>Diamond</span></span><span className="trow__pts num" role="cell">22,180</span><span className="trow__win num" role="cell">87%</span><span className="trow__chg num" role="cell">▲ 318</span></div>
            <div className="trow" role="row"><span className="trow__rank" role="cell">#5</span><span className="trow__name" role="cell"><span className="av" style={{ background: "#7A7A86" }}>RG</span>Rohan Gupta <span style={{ display: "inline" }}>Delhi NCR</span></span><span role="cell"><span className="tier tier--platinum"><i></i>Platinum</span></span><span className="trow__pts num" role="cell">17,850</span><span className="trow__win num" role="cell">84%</span><span className="trow__chg num" role="cell">▲ 96</span></div>
            <div className="trow" role="row"><span className="trow__rank" role="cell">#6</span><span className="trow__name" role="cell"><span className="av" style={{ background: "#7A7A86" }}>AN</span>Anjali Nair <span style={{ display: "inline" }}>Bangalore</span></span><span role="cell"><span className="tier tier--platinum"><i></i>Platinum</span></span><span className="trow__pts num" role="cell">14,210</span><span className="trow__win num" role="cell">83%</span><span className="trow__chg num" role="cell">▲ 632</span></div>
            <div className="trow" role="row"><span className="trow__rank" role="cell">#7</span><span className="trow__name" role="cell"><span className="av" style={{ background: "#7A7A86" }}>VD</span>Vikram Desai <span style={{ display: "inline" }}>Mumbai</span></span><span role="cell"><span className="tier tier--platinum"><i></i>Platinum</span></span><span className="trow__pts num" role="cell">12,740</span><span className="trow__win num" role="cell">81%</span><span className="trow__chg num" role="cell">▲ 204</span></div>
            <div className="trow" role="row"><span className="trow__rank" role="cell">#8</span><span className="trow__name" role="cell"><span className="av" style={{ background: "#7A7A86" }}>MJ</span>Meera Joshi <span style={{ display: "inline" }}>Chennai</span></span><span role="cell"><span className="tier" style={{ fontFamily: "var(--mono)", fontSize: "13px" }}><i style={{ width: "8px", height: "8px", borderRadius: "2px", transform: "rotate(45deg)", display: "inline-block", background: "var(--gold)", marginRight: "9px" }}></i>Gold</span></span><span className="trow__pts num" role="cell">9,880</span><span className="trow__win num" role="cell">79%</span><span className="trow__chg num" role="cell">▲ 440</span></div>
            <div className="trow" role="row"><span className="trow__rank" role="cell">#9</span><span className="trow__name" role="cell"><span className="av" style={{ background: "#7A7A86" }}>AR</span>Arjun Rao <span style={{ display: "inline" }}>Bangalore</span></span><span role="cell"><span className="tier" style={{ fontFamily: "var(--mono)", fontSize: "13px" }}><i style={{ width: "8px", height: "8px", borderRadius: "2px", transform: "rotate(45deg)", display: "inline-block", background: "var(--gold)", marginRight: "9px" }}></i>Gold</span></span><span className="trow__pts num" role="cell">8,120</span><span className="trow__win num" role="cell">77%</span><span className="trow__chg num" role="cell">▲ 118</span></div>
            <div className="trow" role="row" style={{ opacity: ".45" }}><span className="trow__rank" role="cell">#10</span><span className="trow__name" role="cell"><span className="av" style={{ background: "#7A7A86" }}>DM</span>Divya Menon <span style={{ display: "inline" }}>Kochi</span></span><span role="cell"><span className="tier" style={{ fontFamily: "var(--mono)", fontSize: "13px" }}><i style={{ width: "8px", height: "8px", borderRadius: "2px", transform: "rotate(45deg)", display: "inline-block", background: "var(--gold)", marginRight: "9px" }}></i>Gold</span></span><span className="trow__pts num" role="cell">6,540</span><span className="trow__win num" role="cell">75%</span><span className="trow__chg num" role="cell">▲ 512</span></div>
            <div className="trow" role="row" style={{ opacity: ".25" }}><span className="trow__rank" role="cell">#11</span><span className="trow__name" role="cell"><span className="av" style={{ background: "#7A7A86" }}>SK</span>Sahil Khanna <span style={{ display: "inline" }}>Delhi NCR</span></span><span role="cell"><span className="tier" style={{ fontFamily: "var(--mono)", fontSize: "13px" }}><i style={{ width: "8px", height: "8px", borderRadius: "2px", transform: "rotate(45deg)", display: "inline-block", background: "var(--gold)", marginRight: "9px" }}></i>Gold</span></span><span className="trow__pts num" role="cell">5,310</span><span className="trow__win num" role="cell">73%</span><span className="trow__chg num" role="cell">▲ 88</span></div>
          </div>
          <div className="gate__fade" style={{ background: "linear-gradient(to bottom, transparent, var(--paper) 70%)" }}>
            <div className="gate__card">
              <h4>2,469 more ranked salespersons below</h4>
              <p>Sign up free to see the full board, filter by skill, win-rate and goal-type, and track where <em>you</em> land.</p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <a className="btn btn--primary btn--sm" href="#">See the full board <span className="arrow">→</span></a>
                <a className="btn btn--secondary btn--sm" href="Closdex Learn.html">How ranking works</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    
      
      <section className="section bg-tint">
        <div className="container">
          <div className="phero__grid" style={{ gridTemplateColumns: "0.9fr 1.1fr", alignItems: "center", gap: "clamp(40px,5vw,64px)" }}>
            <div>
              <span className="tag tag--violet">Eight ranks · one ladder</span>
              <h2 className="display" style={{ margin: "18px 0 16px" }}>Everyone starts at Rookie. The rest you earn.</h2>
              <p className="lead" style={{ marginBottom: "22px" }}>Points accumulate from every challenge you clear. Cross a threshold and you rank up — unlocking harder tiers, more visibility to companies, and a brighter badge on your public profile.</p>
              <a className="btn btn--secondary" href="Closdex Learn.html">Read the scoring guide</a>
            </div>
            <div className="ranklist">
              <div className="rankrow"><span className="rankrow__ico"><span style={{ width: "16px", height: "16px", background: "var(--violet)", transform: "rotate(45deg)", borderRadius: "3px", display: "inline-block" }}></span></span><span className="rankrow__name">Grandmaster</span><span className="rankrow__pts">70,000+ pts</span></div>
              <div className="rankrow"><span className="rankrow__ico"><span style={{ width: "16px", height: "16px", background: "var(--violet)", transform: "rotate(45deg)", borderRadius: "3px", display: "inline-block", opacity: ".8" }}></span></span><span className="rankrow__name">Master</span><span className="rankrow__pts">35,000+ pts</span></div>
              <div className="rankrow"><span className="rankrow__ico"><span style={{ width: "16px", height: "16px", background: "#57C5E8", transform: "rotate(45deg)", borderRadius: "3px", display: "inline-block" }}></span></span><span className="rankrow__name">Diamond</span><span className="rankrow__pts">18,000+ pts</span></div>
              <div className="rankrow"><span className="rankrow__ico"><span style={{ width: "16px", height: "16px", background: "#9AA0AE", transform: "rotate(45deg)", borderRadius: "3px", display: "inline-block" }}></span></span><span className="rankrow__name">Platinum</span><span className="rankrow__pts">9,000+ pts</span></div>
              <div className="rankrow"><span className="rankrow__ico"><span style={{ width: "16px", height: "16px", background: "var(--gold)", transform: "rotate(45deg)", borderRadius: "3px", display: "inline-block" }}></span></span><span className="rankrow__name">Gold</span><span className="rankrow__pts">4,000+ pts</span></div>
              <div className="rankrow"><span className="rankrow__ico"><span style={{ width: "16px", height: "16px", background: "#9AA0AE", transform: "rotate(45deg)", borderRadius: "3px", display: "inline-block", opacity: ".7" }}></span></span><span className="rankrow__name">Silver</span><span className="rankrow__pts">1,500+ pts</span></div>
              <div className="rankrow"><span className="rankrow__ico"><span style={{ width: "16px", height: "16px", background: "#B0763C", transform: "rotate(45deg)", borderRadius: "3px", display: "inline-block" }}></span></span><span className="rankrow__name">Bronze</span><span className="rankrow__pts">500+ pts</span></div>
              <div className="rankrow"><span className="rankrow__ico"><span style={{ width: "16px", height: "16px", background: "var(--muted)", transform: "rotate(45deg)", borderRadius: "3px", display: "inline-block", opacity: ".6" }}></span></span><span className="rankrow__name" style={{ color: "var(--muted)" }}>Rookie</span><span className="rankrow__pts">0+ pts</span></div>
            </div>
          </div>
        </div>
      </section>
    
      
      <section className="section">
        <div className="container">
          <div className="shead shead--center">
            <span className="tag tag--pos" style={{ marginInline: "auto" }}><span className="livedot"></span>Built to be trusted</span>
            <h2 className="display">Why companies treat this as a hiring signal.</h2>
          </div>
          <div className="egrid egrid--3">
            <div className="eitem"><h3>Published rubric</h3><p>The scoring formula is public and every point is auditable. No black box — companies see the full performance breakdown, not just a number.</p></div>
            <div className="eitem"><h3>Gaming detection</h3><p>ML flags copy-paste patterns and scripted plays. Scores that look engineered are reviewed and removed before they ever rank.</p></div>
            <div className="eitem"><h3>Dispute window</h3><p>Salespersons can dispute any score for human review within 48 hours, keeping the board accurate and fair on both sides.</p></div>
          </div>
        </div>
      </section>
    
      
      <section className="section">
        <div className="container">
          <div className="ctaband">
            <div className="ctaband__inner">
              <span className="tag tag--violet" style={{ background: "color-mix(in srgb, var(--violet) 22%, transparent)", color: "#fff" }}>Claim your spot</span>
              <h2>Where will <span className="violet">you</span> land?</h2>
              <p>Sign up free, clear a few challenges, and watch your name climb the board the companies are already watching.</p>
              <div className="ctaband__ctas">
                <a className="btn btn--light" href="#">Start competing — free <span className="arrow">→</span></a>
                <a className="btn btn--outline-light" href="Closdex For Companies.html">Hire from the board</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    
    </main>
  );
}
