// Marketing landing page — ported from the prototype HTML.
export default function LandingPage() {
  return (
    <main id="top">
    
      
      <section className="hero" id="hero">
        <div className="hero__top container" data-stagger="">
          <p className="eyebrow">Beta · IT Sales vertical · Bangalore / Mumbai / Delhi NCR</p>
          <h1 className="hero__h1">Compete. <span className="violet">Climb.</span> Get hired.</h1>
          <p className="lead hero__sub">Practice realistic AI sales leads, get scored on a transparent rubric, and climb a public leaderboard that hiring companies actually watch. Rank on merit — not on who you know.</p>
          <div className="hero__ctas">
            <a className="btn btn--primary" href="#">Start competing — free <span className="arrow">→</span></a>
            <a className="btn btn--secondary" href="#audiences">Hire top sales talent</a>
          </div>
          <p className="micro hero__micro">No credit card · Free forever for salespersons · 5-min onboarding</p>
        </div>
    
        
        <div className="glow">
          <div className="glow__horizon" aria-hidden="true"></div>
          <div className="etch" aria-hidden="true">
            <span>Bronze</span>
            <span>Gold</span>
            <span>Diamond</span>
            <span>Master</span>
            <span>Grandmaster</span>
          </div>
          <div className="glow__inner">
            <div className="container">
              <div className="glow__copy">
                <h2 className="display">The leaderboard is live right now.</h2>
                <p>Eight tiers from Rookie to Grandmaster. Every point is earned in a scored conversation. This is the live top of the IT Sales board.</p>
              </div>
              <aside className="board" aria-label="Live leaderboard preview">
                <div className="board__head">
                  <span>IT_SALES</span><span className="sep">·</span><span>IN</span>
                  <span className="live"><span className="dot"></span>Live</span>
                </div>
                <div className="board__row">
                  <span className="board__rank">01</span>
                  <span className="board__name">Aarav Sharma <span>Bangalore · Master</span></span>
                  <span className="board__pts">38,420</span>
                </div>
                <div className="board__row">
                  <span className="board__rank">02</span>
                  <span className="board__name">Priya Iyer <span>Mumbai · Master</span></span>
                  <span className="board__pts">36,110</span>
                </div>
                <div className="board__row">
                  <span className="board__rank">03</span>
                  <span className="board__name">Karan Mehta <span>Pune · Diamond</span></span>
                  <span className="board__pts">28,940</span>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    
      
      <section className="section" id="leaderboard">
        <div className="container">
          <div className="lb__head">
            <div className="section-head">
              <p className="eyebrow">Weekly leaderboard</p>
              <h2 className="display">This week's climb.</h2>
            </div>
            <div className="lb__meta">
              <span className="tag tag--ghost">IT_SALES</span>
              <span className="tag tag--ghost">IN</span>
              <span className="tag tag--violet"><span className="dot"></span>Live · resets in 2d 14h</span>
            </div>
          </div>
    
          <div className="table" role="table" aria-label="Weekly leaderboard">
            <div className="thead" role="row">
              <span role="columnheader">Rank</span>
              <span role="columnheader">Salesperson</span>
              <span role="columnheader">Tier</span>
              <span className="num" role="columnheader">Points</span>
              <span className="num" role="columnheader">Change</span>
            </div>
    
            <div className="trow" role="row">
              <span className="trow__rank" role="cell">01</span>
              <span className="trow__name" role="cell">Aarav Sharma <span>Bangalore</span><span className="tier tier--master tier-m tier-m"><i></i>Master</span></span>
              <span className="trow__tier" role="cell"><span className="tier tier--master"><i></i>Master</span></span>
              <span className="trow__pts num" role="cell">38,420</span>
              <span className="trow__chg num trow__chgwrap" role="cell">▲ 842</span>
            </div>
            <div className="trow" role="row">
              <span className="trow__rank" role="cell">02</span>
              <span className="trow__name" role="cell">Priya Iyer <span>Mumbai</span><span className="tier tier--master tier-m"><i></i>Master</span></span>
              <span className="trow__tier" role="cell"><span className="tier tier--master"><i></i>Master</span></span>
              <span className="trow__pts num" role="cell">36,110</span>
              <span className="trow__chg num trow__chgwrap" role="cell">▲ 512</span>
            </div>
            <div className="trow" role="row">
              <span className="trow__rank" role="cell">03</span>
              <span className="trow__name" role="cell">Karan Mehta <span>Pune</span><span className="tier tier--diamond tier-m"><i></i>Diamond</span></span>
              <span className="trow__tier" role="cell"><span className="tier tier--diamond"><i></i>Diamond</span></span>
              <span className="trow__pts num" role="cell">28,940</span>
              <span className="trow__chg num trow__chgwrap" role="cell">▲ 1,204</span>
            </div>
            <div className="trow" role="row">
              <span className="trow__rank" role="cell">04</span>
              <span className="trow__name" role="cell">Sneha Reddy <span>Hyderabad</span><span className="tier tier--diamond tier-m"><i></i>Diamond</span></span>
              <span className="trow__tier" role="cell"><span className="tier tier--diamond"><i></i>Diamond</span></span>
              <span className="trow__pts num" role="cell">22,180</span>
              <span className="trow__chg num trow__chgwrap" role="cell">▲ 318</span>
            </div>
            <div className="trow" role="row">
              <span className="trow__rank" role="cell">05</span>
              <span className="trow__name" role="cell">Rohan Gupta <span>Delhi NCR</span><span className="tier tier--platinum tier-m"><i></i>Platinum</span></span>
              <span className="trow__tier" role="cell"><span className="tier tier--platinum"><i></i>Platinum</span></span>
              <span className="trow__pts num" role="cell">17,850</span>
              <span className="trow__chg num trow__chgwrap" role="cell">▲ 96</span>
            </div>
            <div className="trow" role="row">
              <span className="trow__rank" role="cell">06</span>
              <span className="trow__name" role="cell">Anjali Nair <span>Bangalore</span><span className="tier tier--platinum tier-m"><i></i>Platinum</span></span>
              <span className="trow__tier" role="cell"><span className="tier tier--platinum"><i></i>Platinum</span></span>
              <span className="trow__pts num" role="cell">14,210</span>
              <span className="trow__chg num trow__chgwrap" role="cell">▲ 632</span>
            </div>
          </div>
        </div>
      </section>
    
      
      <section className="section" id="how">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">How it works · for salespersons</p>
            <h2 className="display">Three steps from cold start to <span className="violet">hired.</span></h2>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step__num">0<em>1</em></div>
              <div className="step__body">
                <h3 className="display">Practice</h3>
                <p>Jump into realistic AI-driven lead conversations — the skeptics, the gatekeepers, the ghosters. Every challenge has a goal, a timer, and a brief. No scripts, no easy wins.</p>
              </div>
            </div>
            <div className="step">
              <div className="step__num">0<em>2</em></div>
              <div className="step__body">
                <h3 className="display">Rank</h3>
                <p>Every conversation is scored on a transparent five-dimension rubric. Points roll up into a public rank, and you climb the eight tiers from Rookie to Grandmaster on merit alone.</p>
              </div>
            </div>
            <div className="step">
              <div className="step__num">0<em>3</em></div>
              <div className="step__body">
                <h3 className="display">Get hired</h3>
                <p>Hiring companies search the leaderboard for proven closers. Your rank is your résumé — share your profile URL and apply in one click with your score attached.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    
      
      <section className="section" id="arena">
        <div className="container arena__grid">
          <div>
            <div className="section-head">
              <p className="eyebrow">Inside the arena</p>
              <h2 className="display">See what an at-bat looks like.</h2>
            </div>
            <div className="feat">
              <div className="feat__item">
                <span className="feat__n">01</span>
                <div>
                  <h4>A live brief you can read at a glance</h4>
                  <p>Message count, timer, and the goal indicator stay pinned at the top — so you always know what you're closing toward.</p>
                </div>
              </div>
              <div className="feat__item">
                <span className="feat__n">02</span>
                <div>
                  <h4>A five-dimension AI rubric</h4>
                  <p>Scored across discovery, objection handling, value framing, rapport, and the close — with a side-panel that shows exactly where points came from.</p>
                </div>
              </div>
              <div className="feat__item">
                <span className="feat__n">03</span>
                <div>
                  <h4>A public profile that does the talking</h4>
                  <p>A shareable rank URL and an activity heatmap that proves consistency, not just a single lucky run.</p>
                </div>
              </div>
              <div className="feat__item">
                <span className="feat__n">04</span>
                <div>
                  <h4>End-of-challenge feedback</h4>
                  <p>Every at-bat closes with specific, actionable notes — what worked, what cost you points, what to try next time.</p>
                </div>
              </div>
            </div>
            <div className="arena__ctas">
              <a className="btn btn--primary" href="#">Get started — free <span className="arrow">→</span></a>
              <a className="btn btn--secondary" href="#">Watch 90-sec tour</a>
            </div>
          </div>
    
          
          <div className="shots">
            <div className="frame" aria-label="Arena conversation">
              <div className="frame__bar">
                <span className="tl"><i></i><i></i><i></i></span>
                <span className="frame__url">closdex.com/arena/the-skeptical-cto</span>
              </div>
              <div className="conv__top">
                <span className="conv__goal">GOAL · <b>BOOK CALL</b></span>
                <span className="conv__stat"><span>4 / 25 msgs</span><span>03:12</span></span>
              </div>
              <div className="conv__body">
                <div className="msg msg--lead">
                  <div className="msg__who">Meera Krishnan · VP Eng, Vector Pay</div>
                  <div className="msg__bubble">We already have a payments stack that works. I get three of these pitches a week — why should I give you fifteen minutes?</div>
                </div>
                <div className="msg msg--me">
                  <div className="msg__who">You</div>
                  <div className="msg__bubble">Totally fair. Most of those three aren't reconciling failed UPI mandates in real time — that's the fifteen minutes. If it's not a problem for Vector Pay, I'll happily get off your calendar.</div>
                </div>
                <div className="msg msg--lead">
                  <div className="msg__who">Meera Krishnan</div>
                  <div className="msg__bubble">…the mandate failures are a real headache, actually. What does the call look like?</div>
                </div>
              </div>
              <div className="conv__input">
                <span>Type your reply…</span>
                <span className="send">⏎ SEND</span>
              </div>
            </div>
    
            <div className="shots__row">
              <div className="frame result" aria-label="Result card">
                <div className="result__head">
                  <div className="result__title">The Skeptical CTO <span>Hard · scored</span></div>
                  <div className="result__score">+522</div>
                </div>
                <div className="rubric">
                  <div className="rubric__row"><span className="rubric__label">Discovery</span><span className="rubric__bar"><i style={{ width: "80%" }}></i></span><span className="rubric__val">4/5</span></div>
                  <div className="rubric__row"><span className="rubric__label">Objection handling</span><span className="rubric__bar"><i style={{ width: "100%" }}></i></span><span className="rubric__val">5/5</span></div>
                  <div className="rubric__row"><span className="rubric__label">Value framing</span><span className="rubric__bar"><i style={{ width: "80%" }}></i></span><span className="rubric__val">4/5</span></div>
                  <div className="rubric__row"><span className="rubric__label">Rapport</span><span className="rubric__bar"><i style={{ width: "80%" }}></i></span><span className="rubric__val">4/5</span></div>
                </div>
              </div>
    
              <div className="frame activity" aria-label="Activity card">
                <div className="activity__stats">
                  <div className="activity__stat"><div className="n">148</div><div className="l">Challenges</div></div>
                  <div className="activity__stat"><div className="n">5</div><div className="l">Day streak</div></div>
                  <div className="activity__stat"><div className="n">12</div><div className="l">Longest</div></div>
                </div>
                <div className="heat" aria-hidden="true"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    
      
      <section className="section" id="personas">
        <div className="container">
          <div className="lb__head">
            <div className="section-head">
              <p className="eyebrow">Persona archetypes</p>
              <h2 className="display">Practice the leads that actually <span className="violet">scare you.</span></h2>
            </div>
            <div className="lb__meta">
              <span className="tag tag--ghost">80+ scenarios</span>
              <span className="tag tag--ghost">6 archetypes</span>
            </div>
          </div>
    
          <div className="personas">
            <div className="persona">
              <span className="persona__n">01</span>
              <span className="persona__name">The Cold Opener</span>
              <span className="persona__meta"><span className="persona__diff diff--rookie">Rookie</span><span className="persona__var">· 18 variations</span></span>
              <a className="persona__cta" href="#">Practice this <span className="arrow">→</span></a>
            </div>
            <div className="persona">
              <span className="persona__n">02</span>
              <span className="persona__name">The Skeptic</span>
              <span className="persona__meta"><span className="persona__diff diff--hard">Hard</span><span className="persona__var">· 14 variations</span></span>
              <a className="persona__cta" href="#">Practice this <span className="arrow">→</span></a>
            </div>
            <div className="persona">
              <span className="persona__n">03</span>
              <span className="persona__name">The Gatekeeper</span>
              <span className="persona__meta"><span className="persona__diff diff--hard">Hard</span><span className="persona__var">· 9 variations</span></span>
              <a className="persona__cta" href="#">Practice this <span className="arrow">→</span></a>
            </div>
            <div className="persona">
              <span className="persona__n">04</span>
              <span className="persona__name">The Pricing Pushback</span>
              <span className="persona__meta"><span className="persona__diff diff--medium">Medium</span><span className="persona__var">· 12 variations</span></span>
              <a className="persona__cta" href="#">Practice this <span className="arrow">→</span></a>
            </div>
            <div className="persona">
              <span className="persona__n">05</span>
              <span className="persona__name">The Ghoster</span>
              <span className="persona__meta"><span className="persona__diff diff--medium">Medium</span><span className="persona__var">· 7 variations</span></span>
              <a className="persona__cta" href="#">Practice this <span className="arrow">→</span></a>
            </div>
            <div className="persona">
              <span className="persona__n">06</span>
              <span className="persona__name">The Committee</span>
              <span className="persona__meta"><span className="persona__diff diff--expert">Expert</span><span className="persona__var">· 5 variations</span></span>
              <a className="persona__cta" href="#">Practice this <span className="arrow">→</span></a>
            </div>
          </div>
          <div className="personas__foot">
            <a className="btn btn--secondary" href="#">Browse all 80+ <span className="arrow">→</span></a>
          </div>
        </div>
      </section>
    
      
      <section className="section" id="audiences">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Who it's for</p>
            <h2 className="display">One platform. Three different jobs to be done.</h2>
          </div>
    
          <div className="seg" role="tablist" aria-label="Choose your role">
            <button role="tab" aria-selected="true" data-tab="sales">I'm a Salesperson</button>
            <button role="tab" aria-selected="false" data-tab="hiring">I'm Hiring</button>
            <button role="tab" aria-selected="false" data-tab="enable">I'm a Sales Enablement Lead</button>
          </div>
    
          
          <div className="panel" data-active="true" data-panel="sales">
            <div className="panel__grid">
              <div>
                <h3 className="display">Get measured fairly. <span className="violet">Get hired on merit.</span></h3>
                <p>Stop fighting to get noticed. Put up a rank that speaks for itself, then let companies come to you. Free forever — your climb is yours to keep.</p>
                <div className="panel__ctas">
                  <a className="btn btn--primary" href="#">Start competing — free <span className="arrow">→</span></a>
                  <a className="btn btn--secondary" href="#">See how scoring works</a>
                </div>
                <p className="panel__stat"><span className="dot"></span><b>2,481 salespersons · avg first rank in 3 challenges</b></p>
              </div>
              <div>
                <p className="getlist__h">What you get</p>
                <ul className="getlist">
                  <li><span className="ck">→</span><span>A public, shareable profile at <code>closdex.com/u/yourname</code></span></li>
                  <li><span className="ck">→</span><span>1-click apply with your rank auto-attached to every application</span></li>
                  <li><span className="ck">→</span><span>A way to replace the cold-cover-letter game with proof of skill</span></li>
                </ul>
              </div>
            </div>
          </div>
    
          
          <div className="panel" data-active="false" data-panel="hiring">
            <div className="panel__grid">
              <div>
                <h3 className="display">Hire proven closers. <span className="violet">Skip the guesswork.</span></h3>
                <p>Search a live leaderboard of salespersons ranked on the same transparent rubric. Filter by tier, vertical, and city — and reach out to talent that's already proven it can close.</p>
                <div className="panel__ctas">
                  <a className="btn btn--primary" href="#">Hire top sales talent <span className="arrow">→</span></a>
                  <a className="btn btn--secondary" href="#pricing">View pricing</a>
                </div>
                <p className="panel__stat"><span className="dot"></span><b>Ranked on merit · search by tier, vertical &amp; city</b></p>
              </div>
              <div>
                <p className="getlist__h">What you get</p>
                <ul className="getlist">
                  <li><span className="ck">→</span><span>Talent search across the live leaderboard, filtered by rank and vertical</span></li>
                  <li><span className="ck">→</span><span>Every candidate carries a transparent, comparable score breakdown</span></li>
                  <li><span className="ck">→</span><span>A placement guarantee so you only pay for hires that stick</span></li>
                </ul>
              </div>
            </div>
          </div>
    
          
          <div className="panel" data-active="false" data-panel="enable">
            <div className="panel__grid">
              <div>
                <h3 className="display">Train your team on reps that <span className="violet">actually bite.</span></h3>
                <p>Give your reps unlimited at-bats against the leads that lose deals, and track who's climbing on the same rubric you'd score them on. Coaching that's grounded in real reps, not vibes.</p>
                <div className="panel__ctas">
                  <a className="btn btn--primary" href="#">Book a demo <span className="arrow">→</span></a>
                  <a className="btn btn--secondary" href="#">See how scoring works</a>
                </div>
                <p className="panel__stat"><span className="dot"></span><b>80+ scenarios · scored on one transparent rubric</b></p>
              </div>
              <div>
                <p className="getlist__h">What you get</p>
                <ul className="getlist">
                  <li><span className="ck">→</span><span>Unlimited practice reps across 6 archetypes and 80+ scenarios</span></li>
                  <li><span className="ck">→</span><span>Team standings on the same five-dimension rubric you coach to</span></li>
                  <li><span className="ck">→</span><span>Per-rep feedback you can turn straight into a coaching plan</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    
      
      <section className="section" id="tiers">
        <div className="container climb__grid">
    
          
          <div className="climb__lead">
            <span className="tag tag--ghost climb__eyebrow">THE CLIMB</span>
            <h2 className="display climb__h2">Eight tiers. <span className="violet">Every point</span> earned.</h2>
            <p className="lead climb__copy">Master the ascent from a newcomer to a global legend. Your progression is measured by precision, dedication, and the relentless pursuit of excellence.</p>
    
            <div className="rewards">
              <h3 className="rewards__h">Milestone Rewards</h3>
              <ul className="rewards__list">
                <li><span className="rewards__ck" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"></circle><path d="M8.5 12.2l2.3 2.3 4.6-4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"></path></svg></span>Unlock exclusive challenges at Gold tier.</li>
                <li><span className="rewards__ck" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"></circle><path d="M8.5 12.2l2.3 2.3 4.6-4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"></path></svg></span>Priority support and private events for Masters.</li>
                <li><span className="rewards__ck" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"></circle><path d="M8.5 12.2l2.3 2.3 4.6-4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"></path></svg></span>Custom profile vanity URL for Grandmasters.</li>
              </ul>
            </div>
    
            <a className="btn btn--primary climb__cta" href="#">Begin your ascent <span className="arrow">→</span></a>
          </div>
    
          
          <div className="climb__ladder">
            <div className="rail" aria-hidden="true"><span className="rail__dot rail__dot--top"></span><span className="rail__dot rail__dot--bot"></span></div>
    
            <div className="tier-row tier-row--top">
              <span className="tier-ico tier-ico--gm" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="9" r="4.4" stroke="currentColor" strokeWidth="1.6"></circle><circle cx="12" cy="9" r="1.5" fill="currentColor"></circle><path d="M9.6 12.6L8.4 18l3.6-2 3.6 2-1.2-5.4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"></path></svg>
              </span>
              <div className="tier-row__name"><span className="tier-row__tier">Grandmaster</span><span className="tier-row__sub">Elite performance</span></div>
              <div className="tier-row__pts"><span className="tier-row__num">70,000+</span><span className="tier-row__lbl">Total points</span></div>
            </div>
    
            <div className="tier-row">
              <span className="tier-ico tier-ico--fill" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 4l5 5-5 11-5-11 5-5z" fill="currentColor"></path><path d="M7 9h10M12 4l-5 5M12 4l5 5" stroke="rgba(255,255,255,.45)" strokeWidth="1"></path></svg>
              </span>
              <div className="tier-row__name"><span className="tier-row__tier">Master</span><span className="tier-row__sub">Expert command</span></div>
              <div className="tier-row__pts"><span className="tier-row__num">35,000+</span></div>
            </div>
    
            <div className="tier-row">
              <span className="tier-ico tier-ico--fill" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 4.5l6.2 4.5-2.37 7.3H8.17L5.8 9 12 4.5z" fill="currentColor"></path></svg>
              </span>
              <div className="tier-row__name"><span className="tier-row__tier">Diamond</span></div>
              <div className="tier-row__pts"><span className="tier-row__num">18,000+</span></div>
            </div>
    
            <div className="tier-row">
              <span className="tier-ico tier-ico--outline" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 4.5l6.5 3.75v7.5L12 19.5 5.5 15.75v-7.5L12 4.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"></path></svg>
              </span>
              <div className="tier-row__name"><span className="tier-row__tier">Platinum</span></div>
              <div className="tier-row__pts"><span className="tier-row__num">9,000+</span></div>
            </div>
    
            <div className="tier-row">
              <span className="tier-ico tier-ico--accent" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 5l1.9 3.85 4.25.62-3.07 3 .72 4.23L12 17.7l-3.8 2 .72-4.23-3.07-3 4.25-.62L12 5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"></path></svg>
              </span>
              <div className="tier-row__name"><span className="tier-row__tier">Gold</span></div>
              <div className="tier-row__pts"><span className="tier-row__num">4,000+</span></div>
            </div>
    
            <div className="tier-row">
              <span className="tier-ico tier-ico--bare" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 4l6 2.2v5.1c0 4-2.7 6.3-6 7.7-3.3-1.4-6-3.7-6-7.7V6.2L12 4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"></path></svg>
              </span>
              <div className="tier-row__name"><span className="tier-row__tier">Silver</span></div>
              <div className="tier-row__pts"><span className="tier-row__num">1,500+</span></div>
            </div>
    
            <div className="tier-row">
              <span className="tier-ico tier-ico--bare" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.6"></rect></svg>
              </span>
              <div className="tier-row__name"><span className="tier-row__tier">Bronze</span></div>
              <div className="tier-row__pts"><span className="tier-row__num">500+</span></div>
            </div>
    
            <div className="tier-row tier-row--muted">
              <span className="tier-ico tier-ico--bare" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.6"></circle></svg>
              </span>
              <div className="tier-row__name"><span className="tier-row__tier">Rookie</span></div>
              <div className="tier-row__pts"><span className="tier-row__num">0+</span></div>
            </div>
          </div>
        </div>
      </section>
    
      
      <section className="section" id="faq">
        <div className="container faq__grid">
          <div className="section-head">
            <p className="eyebrow">FAQ</p>
            <h2 className="display">The things people ask before signing up.</h2>
            <p className="faq__contact">Still curious? <a href="mailto:hello@closdex.com">hello@closdex.com</a></p>
          </div>
          <div className="acc">
            <div className="acc__item" aria-expanded="true">
              <button className="acc__q">Is Closdex really free for salespersons?<span className="plus"></span></button>
              <div className="acc__a"><p>Yes — free forever. Salespersons can practice, get scored, and climb the leaderboard without ever paying or entering a card. We make money from hiring companies, not from the talent.</p></div>
            </div>
            <div className="acc__item" aria-expanded="false">
              <button className="acc__q">How realistic are the AI leads?<span className="plus"></span></button>
              <div className="acc__a"><p>Each archetype is built from real IT-sales objections and behaviours — skeptics push back on substance, gatekeepers block, ghosters go quiet. They adapt to what you say, so there's no script to memorise and no easy win.</p></div>
            </div>
            <div className="acc__item" aria-expanded="false">
              <button className="acc__q">Can companies trust the leaderboard?<span className="plus"></span></button>
              <div className="acc__a"><p>Every rank is built from scored conversations on one transparent five-dimension rubric — the same for everyone. Points can't be bought, and a profile shows the full activity history behind a rank, not just a headline number.</p></div>
            </div>
            <div className="acc__item" aria-expanded="false">
              <button className="acc__q">Which sales verticals are supported?<span className="plus"></span></button>
              <div className="acc__a"><p>We're in beta with the IT Sales vertical across Bangalore, Mumbai, and Delhi NCR. More verticals and cities are rolling out as the leaderboard grows.</p></div>
            </div>
            <div className="acc__item" aria-expanded="false">
              <button className="acc__q">What does it cost to hire someone?<span className="plus"></span></button>
              <div className="acc__a"><p>Hiring companies pay for access to talent search and placements — see the pricing page for current plans. Salespersons are always free.</p></div>
            </div>
            <div className="acc__item" aria-expanded="false">
              <button className="acc__q">How long does it take to get hired?<span className="plus"></span></button>
              <div className="acc__a"><p>It depends on your rank and your vertical, but most salespersons reach a shareable first rank within three challenges — and the higher you climb, the more inbound you'll see from hiring companies watching the board.</p></div>
            </div>
          </div>
        </div>
      </section>
    
      
      <section className="final" id="pricing">
        <div className="final__horizon" aria-hidden="true"></div>
        <div className="final__inner container">
          <span className="final__badge">Founding cohort · 10 spots left</span>
          <h2 className="display">The leaderboard is live. <span className="violet">What's your rank?</span></h2>
          <div className="final__ctas">
            <a className="btn btn--light" href="#">Start competing — free <span className="arrow">→</span></a>
            <a className="btn btn--outline-light" href="#">Hire top talent</a>
          </div>
          <div className="final__checks">
            <span><span className="ck">✓</span> No credit card</span>
            <span><span className="ck">✓</span> 5-min onboarding</span>
            <span><span className="ck">✓</span> Cancel anytime — but you won't want to</span>
          </div>
        </div>
      </section>
    
    </main>
  );
}
