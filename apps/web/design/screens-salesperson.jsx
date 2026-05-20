/* Salesperson journey screens for SalesArena. */

const { useState: useStateS, useEffect: useEffectS, useRef: useRefS, useMemo: useMemoS } = React;

/* =====================================================================
   1. LANDING
===================================================================== */
function LandingScreen({ go }) {
  return (
    <div data-screen-label="01 Landing" style={{ background: "var(--bg)", minHeight: "100%" }}>
      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 64px", borderBottom: "1px solid var(--border-soft)" }}>
        <Logo size={24} />
        <nav style={{ display: "flex", gap: 28, fontSize: 13.5, color: "var(--text-dim)" }}>
          <a style={navLink}>Challenges</a>
          <a style={navLink}>Leaderboard</a>
          <a style={navLink}>For Companies</a>
          <a style={navLink}>Pricing</a>
          <a style={navLink}>Learn</a>
        </nav>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn kind="ghost" size="sm">Log in</Btn>
          <Btn kind="primary" size="sm" onClick={() => go("signup")}>Sign up</Btn>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: "72px 64px 56px", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 48, alignItems: "center" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, background: "color-mix(in oklch, var(--gold) 12%, transparent)", border: "1px solid color-mix(in oklch, var(--gold) 30%, transparent)", color: "var(--gold)", fontSize: 12, fontWeight: 600, marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--gold)", animation: "pulseDot 1.6s infinite" }} />
            BETA · IT Sales vertical · Bangalore / Mumbai / Delhi NCR
          </div>
          <h1 className="display" style={{ fontSize: 76, fontWeight: 700, lineHeight: 0.95, letterSpacing: "-0.04em", margin: "0 0 20px" }}>
            Compete.<br/>Climb.<br/><span style={{ color: "var(--gold)" }}>Get hired.</span>
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-dim)", lineHeight: 1.5, maxWidth: 520, margin: "0 0 32px" }}>
            India's first sales talent leaderboard. Practice realistic AI-driven lead conversations, climb the ranks, and get discovered by hiring companies — all on merit.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <Btn kind="primary" size="lg" icon={<Icon.bolt />} onClick={() => go("signup")}>Start competing — free</Btn>
            <Btn kind="ghost" size="lg" icon={<Icon.briefcase />} onClick={() => go("co-dashboard")}>Hire top sales talent</Btn>
          </div>
          <div style={{ display: "flex", gap: 18, marginTop: 14, fontSize: 12, color: "var(--text-mute)", flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon.check /> No credit card</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon.check /> Free forever for salespersons</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon.check /> 5-min onboarding</span>
          </div>
          <div style={{ display: "flex", gap: 28, marginTop: 40, color: "var(--text-mute)", fontSize: 12.5 }}>
            <div><span className="display mono" style={{ color: "var(--text)", fontSize: 22, fontWeight: 700, marginRight: 6 }}>2,481</span>salespersons</div>
            <div><span className="display mono" style={{ color: "var(--text)", fontSize: 22, fontWeight: 700, marginRight: 6 }}>47</span>hiring partners</div>
            <div><span className="display mono" style={{ color: "var(--text)", fontSize: 22, fontWeight: 700, marginRight: 6 }}>12.5%</span>placement fee</div>
          </div>
        </div>

        {/* Leaderboard preview */}
        <Card padding={0} style={{ overflow: "hidden", boxShadow: "var(--shadow-md)", background: "var(--bg-2)" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-soft)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon.trophy /><span style={{ fontWeight: 600, fontSize: 13.5 }}>Weekly Leaderboard</span>
              <span style={{ fontSize: 11, color: "var(--text-mute)", fontFamily: "JetBrains Mono" }}>IT_SALES · IN</span>
            </div>
            <span style={{ fontSize: 11, color: "var(--text-mute)", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--emerald)", animation: "pulseDot 1.5s infinite" }} />
              Live · resets in 2d 14h
            </span>
          </div>
          {[
            { r: 1, name: "Aarav Sharma", city: "Bangalore", rank: "Master", pts: 38420, trend: "+842" },
            { r: 2, name: "Priya Iyer", city: "Mumbai", rank: "Master", pts: 36110, trend: "+512" },
            { r: 3, name: "Karan Mehta", city: "Pune", rank: "Diamond", pts: 28940, trend: "+1,204" },
            { r: 4, name: "Sneha Reddy", city: "Hyderabad", rank: "Diamond", pts: 22180, trend: "+318" },
            { r: 5, name: "Rohan Gupta", city: "Delhi NCR", rank: "Platinum", pts: 17850, trend: "+96" },
            { r: 6, name: "Anjali Nair", city: "Bangalore", rank: "Platinum", pts: 14210, trend: "+632" },
          ].map(row => (
            <div key={row.r} style={{ display: "grid", gridTemplateColumns: "32px 1fr auto auto auto", gap: 14, padding: "11px 18px", alignItems: "center", borderBottom: "1px solid var(--border-soft)" }}>
              <div className="mono" style={{ color: row.r <= 3 ? "var(--gold)" : "var(--text-mute)", fontSize: 13, fontWeight: 700 }}>#{row.r}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={row.name} size={28} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{row.name}</div>
                  <div style={{ fontSize: 10.5, color: "var(--text-mute)" }}>{row.city}</div>
                </div>
              </div>
              <RankBadge rank={row.rank} size={18} />
              <div className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{row.pts.toLocaleString()}</div>
              <div className="mono" style={{ fontSize: 11, color: "var(--emerald)", display: "inline-flex", alignItems: "center", gap: 2 }}>
                <Icon.trend /> {row.trend}
              </div>
            </div>
          ))}
        </Card>
      </section>

      {/* How it works */}
      <section style={{ padding: "56px 64px", borderTop: "1px solid var(--border-soft)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 32 }}>
          <h2 className="display" style={{ fontSize: 36, margin: 0, fontWeight: 700, letterSpacing: "-0.03em" }}>How it works</h2>
          <span style={{ color: "var(--text-mute)", fontSize: 13 }}>For salespersons</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
          {[
            { step: "01", title: "Practice", body: "Take on AI-simulated leads across difficulty tiers — from warm prospects to hostile decision-makers.", icon: <Icon.bolt /> },
            { step: "02", title: "Rank", body: "Earn points from a transparent rubric: discovery, objection handling, value, conversation, goal execution.", icon: <Icon.trophy /> },
            { step: "03", title: "Get hired", body: "Verified companies search the ranked talent pool. Top performers get interview requests directly.", icon: <Icon.briefcase /> },
          ].map(c => (
            <Card key={c.step} padding={24} hover>
              <div className="mono" style={{ color: "var(--gold)", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{c.step}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, color: "var(--gold)" }}>{c.icon}<h3 className="display" style={{ fontSize: 22, margin: 0, color: "var(--text)" }}>{c.title}</h3></div>
              <p style={{ color: "var(--text-dim)", margin: 0, fontSize: 14, lineHeight: 1.55 }}>{c.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* === Extended CTA sections === */}
      <ProductShowcase go={go} />
      <PersonaShowcase go={go} />
      <AudienceTabs go={go} />
      <OutcomesStrip />
      <SocialProofStrip />
      <FAQSection />
      <FinalCTABanner go={go} />

      {/* Footer */}
      <footer style={{ padding: "40px 64px", borderTop: "1px solid var(--border-soft)", display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 40, color: "var(--text-mute)", fontSize: 12.5 }}>
        <div>
          <Logo size={20} />
          <p style={{ marginTop: 12, lineHeight: 1.6, maxWidth: 280 }}>India's first sales talent leaderboard. Practice realistic AI leads, climb the ranks, get hired on merit.</p>
        </div>
        <div>
          <div style={footColH}>Salespersons</div>
          {["Challenges", "Leaderboard", "Learn", "Sign up free", "How scoring works"].map(l => <a key={l} style={footLink}>{l}</a>)}
        </div>
        <div>
          <div style={footColH}>Companies</div>
          {["Talent search", "Pricing", "Book a demo", "Case studies", "Placement guarantee"].map(l => <a key={l} style={footLink}>{l}</a>)}
        </div>
        <div>
          <div style={footColH}>Company</div>
          {["About", "Careers", "Privacy", "Terms", "Security · SOC2"].map(l => <a key={l} style={footLink}>{l}</a>)}
        </div>
      </footer>
      <div style={{ padding: "16px 64px", borderTop: "1px solid var(--border-soft)", color: "var(--text-mute)", fontSize: 11.5, display: "flex", justifyContent: "space-between" }}>
        <div>© 2026 SalesArena · GST: 29ABCDE1234F1Z5 · Made in Bangalore</div>
        <div>v0.7 beta · IT Sales vertical</div>
      </div>
    </div>
  );
}

const footColH = { fontSize: 11, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, fontWeight: 700 };
const footLink = { display: "block", padding: "4px 0", color: "var(--text-mute)", cursor: "pointer", fontSize: 12.5 };

/* -------- A. Difficulty tiers (rich section) -------- */
function DifficultyTiersSection() {
  const tiers = [
    {
      name: "Rookie",
      mood: "Warm & cooperative",
      desc: "The lead is curious and wants to be sold to. They ask helpful questions and share context freely.",
      goal: "Capture interest · qualify lightly",
      placeholder: "warm prospect — friendly tone",
    },
    {
      name: "Easy",
      mood: "Mildly curious",
      desc: "Polite engagement with one minor pushback. Open to your pitch but not yet committed.",
      goal: "Book a follow-up · share materials",
      placeholder: "curious prospect — neutral",
    },
    {
      name: "Medium",
      mood: "Skeptical, asks for proof",
      desc: "Throws two to three real objections. Wants data, case studies, or a clear differentiator.",
      goal: "Book a discovery call",
      placeholder: "skeptical buyer — guarded",
    },
    {
      name: "Hard",
      mood: "Busy & dismissive",
      desc: "Replies in one sentence. Acts like a gatekeeper. Has heard every pitch in your category.",
      goal: "Reach decision-maker · send proposal",
      placeholder: "busy executive — distracted",
    },
    {
      name: "Expert",
      mood: "Hostile, well-informed",
      desc: "Comparison-shopping. Knows your competitors better than you. Doesn't suffer hype or vague answers.",
      goal: "Close the deal against competitors",
      placeholder: "hostile DM — bring proof",
    },
  ];
  return (
    <section style={{ padding: "80px 64px", borderTop: "1px solid var(--border-soft)" }}>
      <div style={{ marginBottom: 36 }}>
        <div style={pill("var(--gold)")}>Five difficulty tiers · unlocked as you rank up</div>
        <h2 className="display" style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-0.03em", margin: "16px 0 8px", lineHeight: 1.05 }}>
          From warm prospect to <span style={{ color: "var(--d-expert)" }}>hostile decision-maker</span>.
        </h2>
        <p style={{ color: "var(--text-dim)", fontSize: 15.5, maxWidth: 640, margin: 0, lineHeight: 1.5 }}>
          Each tier shifts the lead's personality, objection density, and goal complexity. Your skill ceiling keeps moving — and so do the points on offer.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
        {tiers.map(t => {
          const d = DIFFICULTY[t.name];
          return (
            <Card key={t.name} padding={0} style={{
              overflow: "hidden",
              borderColor: `color-mix(in oklch, ${d.color} 30%, var(--border))`,
              display: "flex", flexDirection: "column",
            }}>
              <div style={{ height: 5, background: d.color }} />
              <div style={{ padding: 16, paddingBottom: 14, display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                <div className="stripe-ph" style={{
                  height: 110, borderRadius: 8,
                  border: `1px dashed color-mix(in oklch, ${d.color} 30%, var(--border-soft))`,
                  background: `repeating-linear-gradient(135deg, color-mix(in oklch, ${d.color} 8%, var(--surface)) 0 8px, color-mix(in oklch, ${d.color} 16%, var(--surface)) 8px 16px)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--text-mute)", fontSize: 10.5, fontFamily: "JetBrains Mono", textAlign: "center",
                  padding: "0 10px", lineHeight: 1.4,
                }}>{t.placeholder}</div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <DifficultyTag level={t.name} size="sm" />
                  <span className="display mono" style={{ fontSize: 22, fontWeight: 700, color: d.color, letterSpacing: "-0.02em" }}>{d.base}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: d.color, lineHeight: 1.3 }}>{t.mood}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-dim)", lineHeight: 1.5 }}>{t.desc}</div>
                <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px dashed var(--border-soft)" }}>
                  <div style={{ fontSize: 10, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Typical goal</div>
                  <div style={{ fontSize: 11.5, color: "var(--text)", marginTop: 4, lineHeight: 1.4 }}>{t.goal}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

/* -------- B. Product showcase (UI preview cards, static) -------- */
function ProductShowcase({ go }) {
  return (
    <section style={{ padding: "80px 64px", borderTop: "1px solid var(--border-soft)", background: "var(--bg-2)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "0.85fr 1.15fr", gap: 56, alignItems: "center" }}>
        <div>
          <div style={pill("var(--gold)")}>Inside the arena</div>
          <h2 className="display" style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.05, margin: "16px 0 18px" }}>
            See what an at-bat looks like.
          </h2>
          <p style={{ fontSize: 15.5, color: "var(--text-dim)", lineHeight: 1.55, margin: "0 0 14px" }}>
            Realistic chat with a dynamic AI lead. A transparent rubric that scores every message. A scoreboard companies actually watch. Daily streaks that compound into rank.
          </p>
          <ul style={{ margin: "0 0 24px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10, fontSize: 13.5, color: "var(--text-dim)" }}>
            {[
              "Live message-count, timer, and goal indicator on every challenge",
              "Five-dimension AI rubric with side-panel tracking",
              "Public profile · shareable rank URL · activity heatmap",
              "End-of-challenge feedback: strengths, gaps, next-best challenge",
            ].map(b => (
              <li key={b} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: "var(--gold)", marginTop: 2, flexShrink: 0 }}><Icon.check /></span>{b}
              </li>
            ))}
          </ul>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn kind="primary" size="md" icon={<Icon.bolt />} onClick={() => go("signup")}>Get started — free</Btn>
            <Btn kind="ghost" size="md" icon={<Icon.book />}>Watch 90-sec tour</Btn>
          </div>
        </div>

        {/* 2-column UI preview collage */}
        <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 14 }}>
          {/* Left column: tall chat preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <UIPreviewChat />
            <UIPreviewLeaderboard />
          </div>
          {/* Right column: score + heatmap */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <UIPreviewScore />
            <UIPreviewHeatmap />
          </div>
        </div>
      </div>
    </section>
  );
}

function UIFrame({ label, children, accent = "var(--gold)" }) {
  return (
    <Card padding={0} style={{ overflow: "hidden", boxShadow: "var(--shadow-md)" }}>
      <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border-soft)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--d-expert)", opacity: 0.5 }} />
          <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--d-medium)", opacity: 0.5 }} />
          <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--emerald)", opacity: 0.5 }} />
        </div>
        <span className="mono" style={{ fontSize: 9.5, color: "var(--text-mute)", letterSpacing: "0.08em" }}>{label}</span>
        <div style={{ width: 18 }} />
      </div>
      {children}
    </Card>
  );
}

function UIPreviewChat() {
  const msgs = [
    { side: "lead", text: "I've got 5 minutes. What's this about — and please don't pitch me a 'platform'." },
    { side: "me", text: "Fair. You're on Datadog right? What's your monthly log volume — the bit making your CFO nervous?" },
    { side: "lead", text: "Right question. ~$40K/mo. What are you proposing?" },
    { side: "me", text: "20-min Thursday demo. Three customers your size cut log spend 40% without losing trace fidelity." },
  ];
  return (
    <UIFrame label="SALESARENA · CONVERSATION">
      <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border-soft)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Avatar name="Meera Krishnan" size={26} color="oklch(0.55 0.14 290)" />
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700 }}>Meera Krishnan</div>
            <div style={{ fontSize: 9.5, color: "var(--text-mute)" }}>CTO · Vector Pay</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="mono" style={{ fontSize: 9, color: "var(--gold)", fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "color-mix(in oklch, var(--gold) 12%, transparent)" }}>GOAL · BOOK CALL</span>
          <span className="mono" style={{ fontSize: 9.5, color: "var(--text-mute)" }}>4/25</span>
        </div>
      </div>
      <div style={{ padding: "14px 14px 12px", display: "flex", flexDirection: "column", gap: 6, background: "var(--bg)" }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.side === "me" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "84%", padding: "6px 10px",
              borderRadius: m.side === "me" ? "10px 10px 3px 10px" : "10px 10px 10px 3px",
              background: m.side === "me" ? "var(--gold)" : "var(--surface)",
              color: m.side === "me" ? "oklch(0.18 0.02 75)" : "var(--text)",
              border: m.side === "me" ? "none" : "1px solid var(--border-soft)",
              fontSize: 10.5, lineHeight: 1.4,
            }}>{m.text}</div>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 9px", borderRadius: "10px 10px 10px 3px", background: "var(--surface)", border: "1px solid var(--border-soft)" }}>
            {[0,1,2].map(i => (
              <span key={i} style={{ width: 4, height: 4, borderRadius: 999, background: "var(--text-mute)", animation: `typing 1.4s ${i*0.2}s infinite` }} />
            ))}
          </div>
        </div>
      </div>
    </UIFrame>
  );
}

function UIPreviewScore() {
  return (
    <UIFrame label="SALESARENA · RESULT">
      <div style={{ padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 9.5, color: "var(--emerald)", fontWeight: 700, letterSpacing: "0.08em" }}>✓ GOAL ACHIEVED</div>
            <div style={{ fontSize: 10.5, color: "var(--text-mute)", marginTop: 2 }}>The Skeptical CTO · Hard</div>
          </div>
          <div className="display mono" style={{ fontSize: 32, fontWeight: 700, color: "var(--gold)", letterSpacing: "-0.02em", lineHeight: 1 }}>+522</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 10.5, marginBottom: 10 }}>
          {[
            { l: "Base × Goal × Quality", v: "422" },
            { l: "+ Speed bonus", v: "+40" },
            { l: "+ First-try", v: "+60" },
          ].map(r => (
            <div key={r.l} style={{ display: "flex", justifyContent: "space-between", color: "var(--text-dim)" }}>
              <span>{r.l}</span><span className="mono" style={{ color: "var(--text)", fontWeight: 600 }}>{r.v}</span>
            </div>
          ))}
        </div>
        <div style={{ paddingTop: 10, borderTop: "1px solid var(--border-soft)" }}>
          {[
            { l: "Discovery", v: 4 },
            { l: "Objection handling", v: 5 },
            { l: "Value articulation", v: 4 },
            { l: "Goal execution", v: 4 },
          ].map(d => (
            <div key={d.l} style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, marginBottom: 2 }}>
                <span style={{ color: "var(--text-mute)" }}>{d.l}</span>
                <span className="mono" style={{ color: "var(--gold)", fontWeight: 700 }}>{d.v}/5</span>
              </div>
              <div style={{ display: "flex", gap: 2 }}>
                {[1,2,3,4,5].map(n => <div key={n} style={{ flex: 1, height: 3, borderRadius: 2, background: n <= d.v ? "var(--gold)" : "var(--surface-2)" }} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </UIFrame>
  );
}

function UIPreviewLeaderboard() {
  const rows = [
    { r: 1, name: "Aarav Sharma", rank: "Master", pts: 38420 },
    { r: 2, name: "Priya Iyer",   rank: "Master", pts: 36110 },
    { r: 3, name: "Karan Mehta",  rank: "Diamond", pts: 28940 },
    { r: 4, name: "Sneha Reddy",  rank: "Diamond", pts: 22180 },
    { r: 5, name: "Rohan Gupta",  rank: "Platinum", pts: 17850 },
  ];
  return (
    <UIFrame label="SALESARENA · LEADERBOARD">
      <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border-soft)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface)" }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text)", display: "inline-flex", alignItems: "center", gap: 5 }}><Icon.trophy /> Weekly · IT Sales</span>
        <span style={{ fontSize: 9.5, color: "var(--emerald)", display: "inline-flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 5, height: 5, borderRadius: 999, background: "var(--emerald)" }} /> live
        </span>
      </div>
      <div style={{ padding: "8px 14px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
        {rows.map(row => (
          <div key={row.r} style={{ display: "grid", gridTemplateColumns: "22px 1fr auto auto", gap: 8, alignItems: "center", fontSize: 11 }}>
            <span className="mono" style={{ color: row.r <= 3 ? "var(--gold)" : "var(--text-mute)", fontWeight: 700 }}>#{row.r}</span>
            <span style={{ fontWeight: 500 }}>{row.name}</span>
            <RankBadge rank={row.rank} size={12} />
            <span className="mono" style={{ fontWeight: 700 }}>{row.pts.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </UIFrame>
  );
}

function UIPreviewHeatmap() {
  return (
    <UIFrame label="SALESARENA · ACTIVITY">
      <div style={{ padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <div>
            <div className="display mono" style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>148</div>
            <div style={{ fontSize: 10, color: "var(--text-mute)" }}>challenges · last 26 weeks</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "var(--gold)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Icon.fire /> 5-day streak
            </div>
            <div style={{ fontSize: 10, color: "var(--text-mute)", marginTop: 2 }}>longest: 12 days</div>
          </div>
        </div>
        <ActivityHeatmap weeks={20} compact showLabels={false} showLegend={false} />
      </div>
    </UIFrame>
  );
}

const pill = (color) => ({
  display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999,
  background: `color-mix(in oklch, ${color} 14%, transparent)`,
  border: `1px solid color-mix(in oklch, ${color} 35%, transparent)`,
  color, fontSize: 12, fontWeight: 600,
});

/* -------- B. Persona showcase -------- */
function PersonaShowcase({ go }) {
  const personas = [
    { e: "❄️", n: "The Cold Opener", desc: "First contact. Warm or shut down. Capture curiosity in 2 messages.", count: 18, level: "Rookie" },
    { e: "🛡️", n: "The Skeptic", desc: "Heard every pitch. Wants proof, data, and a reason to keep listening.", count: 14, level: "Hard" },
    { e: "🚪", n: "The Gatekeeper", desc: "Earn the warm intro to the actual decision-maker.", count: 9, level: "Hard" },
    { e: "💰", n: "The Pricing Pushback", desc: "Loves the product. Says 'you're 2x cheaper alternatives'.", count: 12, level: "Medium" },
    { e: "👻", n: "The Ghoster", desc: "60 days silent. Win the conversation back from the dead.", count: 7, level: "Medium" },
    { e: "🏛️", n: "The Committee", desc: "Procurement, security, and the champion — all in one room.", count: 5, level: "Expert" },
  ];
  return (
    <section style={{ padding: "80px 64px", borderTop: "1px solid var(--border-soft)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36 }}>
        <div>
          <div style={pill("var(--gold)")}>80+ scenarios · 6 persona archetypes</div>
          <h2 className="display" style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-0.03em", margin: "16px 0 8px" }}>Practice the leads that actually scare you.</h2>
          <p style={{ color: "var(--text-dim)", fontSize: 15.5, maxWidth: 580, margin: 0 }}>
            Every persona reacts dynamically — same scenario, different conversation, every time. Built from real call transcripts contributed by sales coaches.
          </p>
        </div>
        <Btn kind="ghost" size="md" icon={<Icon.arrow />} onClick={() => go("challenges")}>Browse all 80+</Btn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {personas.map(p => (
          <Card key={p.n} padding={22} hover onClick={() => go("signup")}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div style={{ fontSize: 40 }}>{p.e}</div>
              <DifficultyTag level={p.level} size="sm" />
            </div>
            <h3 className="display" style={{ fontSize: 19, fontWeight: 700, margin: "0 0 6px" }}>{p.n}</h3>
            <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5, margin: "0 0 14px" }}>{p.desc}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--border-soft)" }}>
              <span className="mono" style={{ fontSize: 11.5, color: "var(--text-mute)" }}>{p.count} variations</span>
              <span style={{ color: "var(--gold)", fontSize: 12.5, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                Practice this <Icon.arrow />
              </span>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

/* -------- C. Audience tabs (segmented CTAs) -------- */
function AudienceTabs({ go }) {
  const [tab, setTab] = useStateS("salesperson");
  const tabs = [
    {
      id: "salesperson", label: "I'm a Salesperson", color: "var(--gold)",
      head: "Get measured fairly. Get hired on merit.",
      body: "Stop relying on \"who you know\". Practice realistic leads, climb the public leaderboard, and let your numbers do the introducing to 47+ hiring partners.",
      bullets: [
        "Free forever in Phase 1. No paywalls.",
        "Public shareable profile · salesarena.com/u/yourname",
        "1-click apply with auto-attached rank + performance proof",
        "Replace the cold-cover-letter game with verified skill",
      ],
      ctaPrimary: { label: "Start competing — free", onClick: () => go("signup") },
      ctaSecondary: { label: "See how scoring works" },
      meta: "2,481 salespersons · avg first rank in 3 challenges",
    },
    {
      id: "company", label: "I'm Hiring", color: "var(--cool)",
      head: "Hire sales talent on objective performance.",
      body: "Stop reading the same 200 \"results-driven, dynamic SDR\" resumes. Search a pre-vetted, ranked pool. View live performance breakdowns. Hire with a 90-day replacement guarantee.",
      bullets: [
        "Free browse · paid plans from ₹4,999/mo",
        "12.5% placement fee on confirmed hires (10% for Scale subscribers)",
        "Filter by rank, win-rate, goal-type performance, location",
        "90-day replacement OR 50% refund guarantee",
      ],
      ctaPrimary: { label: "Browse talent · free", onClick: () => go("co-dashboard") },
      ctaSecondary: { label: "Book a 20-min demo" },
      meta: "47 hiring partners · avg 18 days to first hire · 312 candidates Gold+",
    },
    {
      id: "enablement", label: "I'm a Sales Enablement Lead", color: "var(--r-master)",
      head: "Train your team on leads they actually face.",
      body: "Run private team leagues. Upload your ICP, your objections, your competitive landscape. We turn it into customised scenarios with a rubric you control — and a leaderboard your reps actually want to top.",
      bullets: [
        "Private team workspace · ICP-tuned bots",
        "Custom rubric weights (SPIN / BANT / MEDDIC / Challenger)",
        "Team leaderboard + manager analytics dashboard",
        "From ₹39,999/mo · onboarding in 2 weeks",
      ],
      ctaPrimary: { label: "Request enablement demo", onClick: () => go("co-dashboard") },
      ctaSecondary: { label: "View enterprise pricing" },
      meta: "Phase 3 · early-access partners onboarding now",
    },
  ];
  const t = tabs.find(x => x.id === tab);

  return (
    <section style={{ padding: "80px 64px", borderTop: "1px solid var(--border-soft)", background: "var(--bg-2)" }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ ...pill("var(--text-dim)"), color: "var(--text-mute)" }}>Built for three audiences</div>
        <h2 className="display" style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-0.03em", margin: "16px 0 0" }}>One platform. Three different jobs to be done.</h2>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 24 }}>
        {tabs.map(x => (
          <button key={x.id} onClick={() => setTab(x.id)} style={{
            padding: "10px 18px", borderRadius: 10, fontSize: 13.5, fontWeight: 600,
            background: tab === x.id ? x.color : "transparent",
            color: tab === x.id ? "oklch(0.18 0.02 75)" : "var(--text-dim)",
            border: `1px solid ${tab === x.id ? "transparent" : "var(--border)"}`,
            cursor: "pointer",
          }}>{x.label}</button>
        ))}
      </div>

      <Card padding={0} style={{ maxWidth: 980, margin: "0 auto", overflow: "hidden", background: "var(--surface)" }}>
        <div style={{ height: 4, background: t.color }} />
        <div style={{ padding: 40, display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 40, alignItems: "center" }}>
          <div>
            <h3 className="display" style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.025em", margin: "0 0 14px", lineHeight: 1.15 }}>{t.head}</h3>
            <p style={{ fontSize: 15, color: "var(--text-dim)", lineHeight: 1.55, margin: "0 0 24px" }}>{t.body}</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={t.ctaPrimary.onClick} style={{
                padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600,
                background: t.color, color: "oklch(0.18 0.02 75)", border: "none", cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 8,
              }}>{t.ctaPrimary.label} <Icon.arrow /></button>
              <Btn kind="ghost" size="md">{t.ctaSecondary.label}</Btn>
            </div>
            <div style={{ marginTop: 18, fontSize: 11.5, color: "var(--text-mute)" }}>{t.meta}</div>
          </div>
          <div style={{ borderLeft: "1px solid var(--border-soft)", paddingLeft: 32 }}>
            <div style={{ fontSize: 11, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 14 }}>What you get</div>
            {t.bullets.map((b, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12, fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.5 }}>
                <span style={{ color: t.color, marginTop: 2, flexShrink: 0 }}><Icon.check /></span>
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </section>
  );
}

/* -------- D. Outcomes stat strip -------- */
function OutcomesStrip() {
  return (
    <section style={{ padding: "72px 64px", borderTop: "1px solid var(--border-soft)" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={pill("var(--emerald)")}>Outcomes — first 6 months of closed beta</div>
        <h2 className="display" style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-0.03em", margin: "16px 0 0" }}>Numbers that move careers and pipelines.</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0 }}>
        {[
          { n: "3.4x", l: "faster time to first interview", sub: "vs untracked LinkedIn applies", c: "var(--gold)" },
          { n: "18d", l: "average time to confirmed hire", sub: "across 47 hiring partners", c: "var(--cool)" },
          { n: "73%", l: "median challenge completion rate", sub: "industry avg: 41%", c: "var(--emerald)" },
          { n: "₹1.2L", l: "avg placement commission", sub: "12.5% of first-year CTC", c: "var(--r-master)" },
        ].map((s, i) => (
          <div key={i} style={{
            padding: "28px 24px",
            borderLeft: i === 0 ? "none" : "1px solid var(--border-soft)",
            textAlign: "left",
          }}>
            <div className="display mono" style={{ fontSize: 56, fontWeight: 700, color: s.c, letterSpacing: "-0.03em", lineHeight: 1 }}>{s.n}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginTop: 10 }}>{s.l}</div>
            <div style={{ fontSize: 11.5, color: "var(--text-mute)", marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------- E. Social proof / trust strip -------- */
function SocialProofStrip() {
  const logos = ["Razorpay", "Zoho", "Freshworks", "Postman", "Atlan", "Mindtickle", "Browserstack"];
  return (
    <section style={{ padding: "48px 64px", borderTop: "1px solid var(--border-soft)", background: "var(--bg-2)" }}>
      <div style={{ textAlign: "center", marginBottom: 24, fontSize: 11.5, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
        Hiring on SalesArena
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 48, flexWrap: "wrap", opacity: 0.7 }}>
        {logos.map(l => (
          <div key={l} className="display" style={{ fontSize: 22, fontWeight: 600, color: "var(--text-dim)", letterSpacing: "-0.01em" }}>
            {l}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 36, flexWrap: "wrap" }}>
        {[
          { e: "🔒", t: "SOC 2 Type II in progress" },
          { e: "🇮🇳", t: "GST + Indian payments" },
          { e: "✅", t: "90-day replacement guarantee" },
          { e: "⚡", t: "Razorpay + Stripe payments" },
        ].map(b => (
          <div key={b.t} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-mute)" }}>
            <span>{b.e}</span>{b.t}
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------- F. FAQ -------- */
function FAQSection() {
  const [open, setOpen] = useStateS(0);
  const faqs = [
    { q: "Is SalesArena really free for salespersons?", a: "Yes. Phase 1 is 100% free for salespersons — no paywalls, no premium tier, no \"unlock to apply\" tricks. Companies pay listing fees and a 12.5% placement commission on confirmed hires. That covers the AI compute, the platform, and the team." },
    { q: "How realistic are the AI leads, really?", a: "Each persona has a backstory, objection set, communication pattern, and decision criteria built from real call transcripts contributed by working sales coaches. The same scenario produces different conversations each time — the lead reacts to what you actually say, not a scripted branch." },
    { q: "Can companies trust the leaderboard as a hiring signal?", a: "The rubric is published and the formula is public. Every score is auditable. We run ML gaming-detection on copy-paste patterns and scripted plays, and salespersons can dispute scores for human review within 48 hours. Companies see the full performance breakdown, not just a top-line number." },
    { q: "Which sales verticals are supported?", a: "Phase 1 launches with IT Sales (Cloud, DevTools, Cybersecurity, IT Services, Hardware, Networking). SaaS, BFSI, FMCG, EdTech, Real Estate, Insurance, and Healthcare come in Phase 2 once we hit product-market fit in IT Sales." },
    { q: "What does it cost to hire someone?", a: "Free browse — view the leaderboard and limited profiles at no cost. Paid plans start at ₹4,999/mo (Starter) for one active posting. Placement commission is 12.5% of first-year fixed CTC on confirmed hires, with 10% for Scale subscribers and custom Enterprise rates. 90-day replacement OR 50% refund." },
    { q: "How long does it take to get hired?", a: "Median time from first profile view to a confirmed offer in our closed beta has been 18 days. The variance is wide — top-quartile candidates often get interview requests within 72 hours of switching their profile to \"open to work\"." },
  ];
  return (
    <section style={{ padding: "80px 64px", borderTop: "1px solid var(--border-soft)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 56 }}>
        <div>
          <div style={pill("var(--gold)")}>Questions</div>
          <h2 className="display" style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-0.03em", margin: "16px 0 16px", lineHeight: 1.1 }}>The things people ask before signing up.</h2>
          <p style={{ color: "var(--text-dim)", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 24px" }}>
            Didn't find your answer? We reply to every email personally.
          </p>
          <Btn kind="ghost" size="md">hello@salesarena.com</Btn>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {faqs.map((f, i) => (
            <div key={i} style={{ borderBottom: "1px solid var(--border-soft)" }}>
              <button onClick={() => setOpen(open === i ? -1 : i)} style={{
                width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14,
                padding: "18px 4px", background: "transparent", border: "none",
                cursor: "pointer", textAlign: "left",
              }}>
                <span className="display" style={{ fontSize: 16, fontWeight: 600, color: open === i ? "var(--gold)" : "var(--text)" }}>{f.q}</span>
                <span style={{ color: "var(--text-mute)", transform: open === i ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><Icon.chevDown /></span>
              </button>
              {open === i && (
                <div style={{ padding: "0 4px 18px", fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.6, animation: "fadeUp 0.2s ease" }}>
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------- G. Final CTA banner -------- */
function FinalCTABanner({ go }) {
  return (
    <section style={{ padding: "0 64px 64px" }}>
      <Card padding={0} style={{
        overflow: "hidden",
        background: "linear-gradient(135deg, color-mix(in oklch, var(--gold) 22%, var(--bg)) 0%, color-mix(in oklch, var(--gold) 8%, var(--bg-2)) 100%)",
        borderColor: "color-mix(in oklch, var(--gold) 35%, var(--border))",
        position: "relative",
      }}>
        {/* Decorative chevrons */}
        <svg style={{ position: "absolute", right: -40, top: -40, opacity: 0.08 }} width="400" height="400" viewBox="0 0 24 24" fill="none">
          <path d="M3 18 L9 18 L11 12 L13 18 L19 18 L15 6 L9 6 Z" fill="var(--gold)" />
        </svg>
        <div style={{ padding: "64px 56px", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 40, alignItems: "center", position: "relative" }}>
          <div>
            <div style={pill("var(--gold)")}>Founding cohort · 10 spots left</div>
            <h2 className="display" style={{ fontSize: 56, fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1, margin: "16px 0 18px" }}>
              The leaderboard is live.<br/><span style={{ color: "var(--gold)" }}>What's your rank?</span>
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.55, maxWidth: 540, margin: "0 0 28px" }}>
              First 100 sign-ups get a permanent <strong style={{ color: "var(--gold)" }}>Founding Member</strong> badge on their public profile and lifetime access to private leaderboards.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Btn kind="primary" size="lg" icon={<Icon.bolt />} onClick={() => go("signup")}>Start competing — free</Btn>
              <Btn kind="secondary" size="lg" icon={<Icon.briefcase />} onClick={() => go("co-dashboard")}>Hire top talent</Btn>
            </div>
            <div style={{ marginTop: 18, display: "flex", gap: 18, fontSize: 12, color: "var(--text-mute)" }}>
              <span>✓ No credit card</span>
              <span>✓ 5-min onboarding</span>
              <span>✓ Cancel anytime — but you won't want to</span>
            </div>
          </div>
          {/* Mini ranks ladder */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
            <div style={{ fontSize: 11, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 8 }}>The climb</div>
            {["Grandmaster","Master","Diamond","Platinum","Gold","Silver","Bronze","Rookie"].map((r, i) => (
              <div key={r} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 14px", borderRadius: 999, background: "color-mix(in oklch, var(--surface) 80%, transparent)", border: "1px solid var(--border-soft)", opacity: 1 - i * 0.06 }}>
                <RankBadge rank={r} size={18} />
                <span className="display" style={{ fontSize: 13, fontWeight: 600 }}>{r}</span>
                <span className="mono" style={{ fontSize: 10.5, color: "var(--text-mute)", marginLeft: 10 }}>{[70000,35000,18000,9000,4000,1500,500,0][i].toLocaleString()}+ pts</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </section>
  );
}

const navLink = { color: "var(--text-dim)", fontSize: 13.5, fontWeight: 500, cursor: "pointer", textDecoration: "none" };

/* =====================================================================
   2. SIGN UP
===================================================================== */
function SignupScreen({ go }) {
  const [tab, setTab] = useStateS("salesperson");
  return (
    <div data-screen-label="02 Sign Up" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100%" }}>
      {/* Left: pitch */}
      <div style={{ background: "var(--bg-2)", padding: "56px 56px", borderRight: "1px solid var(--border-soft)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <Logo size={22} />
        <div>
          <h1 className="display" style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.05, margin: "0 0 18px" }}>
            Join the arena.<br/><span style={{ color: "var(--gold)" }}>Get measured fairly.</span>
          </h1>
          <p style={{ color: "var(--text-dim)", fontSize: 15.5, lineHeight: 1.55, maxWidth: 420, margin: "0 0 32px" }}>
            Sign up free. Take your first calibration challenge in under 5 minutes. Get ranked. Stay ranked.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              "100% free for salespersons — no paywalls in Phase 1",
              "Public profile + shareable rank URL",
              "Eligible for 47+ active hiring partner roles",
            ].map(t => (
              <div key={t} style={{ display: "flex", gap: 10, alignItems: "center", color: "var(--text-dim)", fontSize: 13.5 }}>
                <span style={{ color: "var(--emerald)" }}><Icon.check /></span>{t}
              </div>
            ))}
          </div>
        </div>
        <div style={{ color: "var(--text-mute)", fontSize: 12 }}>By signing up you agree to SalesArena's <a style={{ color: "var(--text-dim)" }}>Terms</a> and <a style={{ color: "var(--text-dim)" }}>Privacy Policy</a>.</div>
      </div>

      {/* Right: form */}
      <div style={{ padding: "56px 56px", display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 540 }}>
        <div style={{ display: "inline-flex", background: "var(--bg-2)", padding: 4, borderRadius: 10, gap: 4, marginBottom: 28, border: "1px solid var(--border)", width: "fit-content" }}>
          {["salesperson", "company"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "8px 16px", borderRadius: 7, fontSize: 13, fontWeight: 600,
              background: tab === t ? "var(--gold)" : "transparent",
              color: tab === t ? "oklch(0.18 0.02 75)" : "var(--text-dim)",
              border: "none", textTransform: "capitalize",
            }}>I'm a {t}</button>
          ))}
        </div>

        <h2 className="display" style={{ fontSize: 28, margin: "0 0 24px", fontWeight: 700 }}>Create your salesperson account</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
          <Btn kind="secondary" full icon={<Icon.linkedin />}>Continue with LinkedIn</Btn>
          <Btn kind="secondary" full icon={<Icon.google />}>Continue with Google</Btn>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--text-mute)", fontSize: 11, margin: "8px 0 22px" }}>
          <div style={{ flex: 1, height: 1, background: "var(--border-soft)" }} /> OR <div style={{ flex: 1, height: 1, background: "var(--border-soft)" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 22 }}>
          <Field label="Work email" required>
            <TextInput placeholder="you@company.com" />
          </Field>
          <Field label="Password" required hint="At least 8 characters">
            <TextInput type="password" placeholder="••••••••" />
          </Field>
        </div>

        <Btn kind="primary" full size="lg" icon={<Icon.arrow />} onClick={() => go("onboarding")}>Create account & start onboarding</Btn>

        <div style={{ marginTop: 22, color: "var(--text-mute)", fontSize: 12.5 }}>Already a member? <a style={{ color: "var(--gold)", fontWeight: 600 }}>Log in</a></div>
      </div>
    </div>
  );
}

/* =====================================================================
   3. ONBOARDING
===================================================================== */
function OnboardingScreen({ go }) {
  const [step, setStep] = useStateS(1);
  const steps = ["Profile", "Specialization", "Self-assessment", "Resume"];

  return (
    <div data-screen-label="03 Onboarding" style={{ minHeight: "100%", padding: "32px 64px", display: "flex", flexDirection: "column", gap: 24 }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo size={20} />
        <span style={{ color: "var(--text-mute)", fontSize: 12 }}>Step {step} of 4 — takes 4 minutes</span>
      </header>

      {/* Stepper */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ height: 4, borderRadius: 999, background: i < step ? "var(--gold)" : "var(--surface-2)" }} />
            <div style={{ fontSize: 11.5, color: i < step ? "var(--gold)" : "var(--text-mute)", fontWeight: 600 }}>
              <span className="mono">{String(i+1).padStart(2,"0")} </span>{s}
            </div>
          </div>
        ))}
      </div>

      <Card padding={36} style={{ maxWidth: 760, alignSelf: "center", width: "100%" }}>
        {step === 1 && <>
          <h2 className="display" style={{ fontSize: 26, margin: "0 0 8px" }}>Tell us about yourself</h2>
          <p style={{ color: "var(--text-dim)", margin: "0 0 24px", fontSize: 14 }}>This will appear on your public profile and is visible to verified hiring companies.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Full name" required><TextInput placeholder="Shashank Khare" /></Field>
            <Field label="Display handle" hint="salesarena.com/u/shashank"><TextInput placeholder="shashank" /></Field>
            <Field label="City" required><TextInput placeholder="Bangalore" /></Field>
            <Field label="Years of sales experience" required><TextInput placeholder="4" /></Field>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Current company (optional)" hint="Visible only if you choose so"><TextInput placeholder="e.g. Freshworks" /></Field>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Short bio" hint="Max 240 characters">
                <textarea rows={3} style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 10, padding: 12, fontSize: 13.5, color: "var(--text)", resize: "vertical" }} placeholder="What kind of sales do you love? What makes you good at it?" />
              </Field>
            </div>
          </div>
        </>}

        {step === 2 && <>
          <h2 className="display" style={{ fontSize: 26, margin: "0 0 8px" }}>Pick your specializations</h2>
          <p style={{ color: "var(--text-dim)", margin: "0 0 24px", fontSize: 14 }}>Select up to 3. Phase 1 launches with IT Sales — others coming soon.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              { name: "IT Sales", active: true },
              { name: "SaaS", soon: true },
              { name: "BFSI", soon: true },
              { name: "FMCG", soon: true },
              { name: "EdTech", soon: true },
              { name: "Real Estate", soon: true },
              { name: "Insurance", soon: true },
              { name: "Healthcare", soon: true },
            ].map(t => (
              <button key={t.name} disabled={t.soon} style={{
                padding: "10px 16px", borderRadius: 999,
                background: t.active ? "color-mix(in oklch, var(--gold) 18%, transparent)" : "var(--bg-2)",
                border: `1px solid ${t.active ? "var(--gold)" : "var(--border)"}`,
                color: t.active ? "var(--gold)" : (t.soon ? "var(--text-mute)" : "var(--text)"),
                fontSize: 13, fontWeight: 600,
                opacity: t.soon ? 0.55 : 1, cursor: t.soon ? "not-allowed" : "pointer",
                display: "inline-flex", alignItems: "center", gap: 8,
              }}>
                {t.name}
                {t.active && <Icon.check />}
                {t.soon && <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "var(--surface-2)" }}>SOON</span>}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 24, padding: 14, borderRadius: 10, background: "var(--bg-2)", border: "1px solid var(--border-soft)", fontSize: 12.5, color: "var(--text-dim)" }}>
            <strong style={{ color: "var(--text)" }}>Sub-tags within IT Sales:</strong> Cloud / Infra · Cybersecurity · DevTools · IT Services · Hardware · Networking
          </div>
        </>}

        {step === 3 && <>
          <h2 className="display" style={{ fontSize: 26, margin: "0 0 8px" }}>Quick skill self-assessment</h2>
          <p style={{ color: "var(--text-dim)", margin: "0 0 24px", fontSize: 14 }}>Used to calibrate your starting difficulty. Doesn't affect your rank — only your first 3 recommended challenges.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {[
              { q: "Cold outreach (email + LinkedIn)", val: 3 },
              { q: "Discovery & qualification", val: 4 },
              { q: "Objection handling", val: 2 },
              { q: "Negotiation & closing", val: 3 },
              { q: "Multi-stakeholder deals", val: 2 },
            ].map(s => (
              <div key={s.q}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13.5 }}>
                  <span>{s.q}</span>
                  <span className="mono" style={{ color: "var(--gold)", fontWeight: 600 }}>{s.val} / 5</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[1,2,3,4,5].map(n => (
                    <div key={n} style={{ flex: 1, height: 8, borderRadius: 4, background: n <= s.val ? "var(--gold)" : "var(--surface-2)" }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>}

        {step === 4 && <>
          <h2 className="display" style={{ fontSize: 26, margin: "0 0 8px" }}>Upload your resume</h2>
          <p style={{ color: "var(--text-dim)", margin: "0 0 24px", fontSize: 14 }}>PDF or DOCX, max 5 MB. Used for company-side hiring only — never shown publicly without your consent.</p>
          <div style={{ padding: 32, border: "2px dashed var(--border)", borderRadius: 12, textAlign: "center", background: "var(--bg-2)" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "color-mix(in oklch, var(--gold) 15%, transparent)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--gold)", marginBottom: 12 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14"/></svg>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Drag your resume here</div>
            <div style={{ fontSize: 12, color: "var(--text-mute)", marginBottom: 16 }}>or</div>
            <Btn kind="secondary" size="sm">Browse files</Btn>
          </div>
          <div style={{ marginTop: 18, padding: 14, borderRadius: 10, background: "color-mix(in oklch, var(--gold) 8%, transparent)", border: "1px solid color-mix(in oklch, var(--gold) 25%, transparent)", display: "flex", gap: 10, alignItems: "center", fontSize: 12.5 }}>
            <Icon.bolt />
            <span>Next: a 5-minute walkthrough challenge to introduce the scoring rubric. <strong style={{ color: "var(--gold)" }}>+50 points</strong> on completion.</span>
          </div>
        </>}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
          <Btn kind="ghost" onClick={() => step > 1 ? setStep(step-1) : go("signup")}>Back</Btn>
          <Btn kind="primary" icon={<Icon.arrow />} onClick={() => step < 4 ? setStep(step+1) : go("dashboard")}>
            {step < 4 ? "Continue" : "Finish & start walkthrough"}
          </Btn>
        </div>
      </Card>
    </div>
  );
}

/* =====================================================================
   APP SHELL (sidebar) — used by dashboard, challenges, leaderboard etc.
===================================================================== */
function AppShell({ go, view, children }) {
  const nav = [
    { id: "dashboard", label: "Home", icon: <Icon.home /> },
    { id: "challenges", label: "Challenges", icon: <Icon.bolt /> },
    { id: "leaderboard", label: "Leaderboard", icon: <Icon.trophy /> },
    { id: "learn", label: "Learn", icon: <Icon.book />, soon: true },
    { id: "jobs", label: "Jobs", icon: <Icon.briefcase /> },
    { id: "profile", label: "Profile", icon: <Icon.user /> },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "100%" }}>
      <aside style={{ background: "var(--bg-2)", borderRight: "1px solid var(--border-soft)", padding: "20px 14px", display: "flex", flexDirection: "column", gap: 4, position: "sticky", top: 0, height: "100vh", overflow: "auto" }}>
        <div style={{ padding: "6px 8px 18px" }}><Logo size={20} /></div>
        {nav.map(n => {
          const active = view === n.id || (view === "challenge-detail" && n.id === "challenges") || (view === "conversation" && n.id === "challenges") || (view === "result" && n.id === "challenges");
          return (
            <button key={n.id} onClick={() => !n.soon && go(n.id)} disabled={n.soon} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 12px", borderRadius: 8, border: "none",
              background: active ? "color-mix(in oklch, var(--gold) 15%, transparent)" : "transparent",
              color: active ? "var(--gold)" : (n.soon ? "var(--text-mute)" : "var(--text-dim)"),
              fontSize: 13.5, fontWeight: 500, textAlign: "left",
              cursor: n.soon ? "not-allowed" : "pointer",
              opacity: n.soon ? 0.55 : 1,
            }}>
              {n.icon}{n.label}
              {n.soon && <span style={{ marginLeft: "auto", fontSize: 9, padding: "1px 5px", borderRadius: 3, background: "var(--surface-2)" }}>SOON</span>}
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <Card padding={14} style={{ background: "color-mix(in oklch, var(--gold) 10%, var(--surface))", borderColor: "color-mix(in oklch, var(--gold) 30%, transparent)" }}>
          <div style={{ fontSize: 11.5, color: "var(--gold)", fontWeight: 600, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}><Icon.fire /> 5-day streak</div>
          <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.45 }}>Complete 1 challenge today to keep your streak alive.</div>
        </Card>
      </aside>
      <main style={{ overflow: "auto" }}>
        <TopBar go={go} />
        {children}
      </main>
    </div>
  );
}

function TopBar({ go }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 32px", borderBottom: "1px solid var(--border-soft)", background: "var(--bg)", position: "sticky", top: 0, zIndex: 5 }}>
      <div style={{ position: "relative", flex: "0 1 420px" }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-mute)" }}><Icon.search /></span>
        <input placeholder="Search challenges, companies, salespersons…" style={{
          width: "100%", padding: "9px 12px 9px 36px", borderRadius: 9,
          background: "var(--bg-2)", border: "1px solid var(--border)", fontSize: 13, color: "var(--text)",
        }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button style={{ background: "transparent", border: "none", color: "var(--text-dim)", position: "relative" }}>
          <Icon.bell />
          <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: 999, background: "var(--d-expert)", border: "2px solid var(--bg)" }} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 10px 4px 4px", background: "var(--bg-2)", borderRadius: 999, border: "1px solid var(--border)", cursor: "pointer" }} onClick={() => go("profile")}>
          <Avatar name="Shashank Khare" size={28} />
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>Shashank</span>
          <RankBadge rank="Gold" size={16} />
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   4. DASHBOARD
===================================================================== */
function DashboardScreen({ go }) {
  return (
    <AppShell go={go} view="dashboard">
      <div data-screen-label="04 Dashboard" style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 22 }}>
        {/* Greeting */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 className="display" style={{ fontSize: 32, margin: 0, fontWeight: 700, letterSpacing: "-0.025em" }}>Welcome back, Shashank.</h1>
            <p style={{ color: "var(--text-dim)", margin: "6px 0 0", fontSize: 14 }}>You're <strong style={{ color: "var(--gold)" }}>624 points</strong> away from <RankBadge rank="Platinum" size={14} /> Platinum.</p>
          </div>
          <Btn kind="primary" icon={<Icon.bolt />} onClick={() => go("challenges")}>Take a challenge</Btn>
        </div>

        {/* Stats strip */}
        <Card padding={20}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={statLbl}>Current rank</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}><RankBadge rank="Gold" size={36} /><span className="display" style={{ fontSize: 22, fontWeight: 700, color: "var(--r-gold)" }}>Gold</span></div>
            </div>
            <Stat label="Total points" value="8,376" sub="+1,204 this week" accent="var(--text)" icon={<Icon.bolt />} />
            <Stat label="This week" value="1,204" sub="↑ 38% vs last" accent="var(--emerald)" icon={<Icon.trend />} />
            <Stat label="Streak" value="5 days" sub="Best: 12 days" accent="var(--gold)" icon={<Icon.fire />} />
            <Stat label="Weekly rank" value="#27" sub="of 2,481 in IT Sales" icon={<Icon.trophy />} />
          </div>
          {/* Progress to next rank */}
          <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--border-soft)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}>
              <span style={{ color: "var(--text-dim)" }}>Progress to Platinum</span>
              <span className="mono" style={{ color: "var(--text)" }}>8,376 / 9,000</span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: "var(--bg-2)", overflow: "hidden" }}>
              <div style={{ width: "93%", height: "100%", borderRadius: 999, background: "linear-gradient(90deg, var(--gold), var(--r-platinum))" }} />
            </div>
          </div>
        </Card>

        {/* Featured challenge */}
        <Card padding={0} style={{ background: "linear-gradient(135deg, color-mix(in oklch, var(--d-hard) 18%, var(--surface)) 0%, var(--surface) 60%)", borderColor: "color-mix(in oklch, var(--d-hard) 30%, var(--border))", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 0 }}>
            <div style={{ padding: 28 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <DifficultyTag level="Hard" />
                <span style={{ ...badgeBase, color: "var(--gold)", background: "color-mix(in oklch, var(--gold) 14%, transparent)", border: "1px solid color-mix(in oklch, var(--gold) 35%, transparent)" }}>⭐ Challenge of the Day</span>
              </div>
              <h2 className="display" style={{ fontSize: 26, margin: "0 0 8px", letterSpacing: "-0.02em" }}>The Skeptical CTO</h2>
              <p style={{ color: "var(--text-dim)", margin: "0 0 16px", fontSize: 14, lineHeight: 1.55 }}>
                You're pitching a DevOps observability platform to a busy CTO at a Series B fintech. She's used 2 competitors before and isn't impressed. Goal: <strong style={{ color: "var(--text)" }}>book a 30-min discovery call</strong>.
              </p>
              <div style={{ display: "flex", gap: 18, marginBottom: 20, fontSize: 12, color: "var(--text-dim)" }}>
                <span><Icon.bolt /> <strong style={{ color: "var(--text)" }}>400 base × 1.2 goal</strong></span>
                <span><Icon.clock /> 15 min limit</span>
                <span>💬 25 messages max</span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Btn kind="primary" icon={<Icon.arrow />} onClick={() => go("challenge-detail")}>View details</Btn>
                <Btn kind="ghost">Save for later</Btn>
              </div>
            </div>
            <div style={{ padding: 28, borderLeft: "1px solid var(--border-soft)" }}>
              <div style={{ fontSize: 11.5, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Lead persona</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
                <Avatar name="Meera Krishnan" size={48} color="oklch(0.55 0.14 290)" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>Meera Krishnan</div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)" }}>CTO · Vector Pay (Series B Fintech)</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: "var(--text-dim)" }}>
                <div>⏰ <strong style={{ color: "var(--text)" }}>Time-poor</strong> — replies in 1-2 sentences</div>
                <div>🛡️ <strong style={{ color: "var(--text)" }}>Has objections</strong> on pricing, integration time</div>
                <div>🔁 <strong style={{ color: "var(--text)" }}>Comparison shops</strong> — knows your top 2 competitors</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Activity heatmap */}
        <Card padding={22}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
            <div>
              <h3 className="display" style={{ fontSize: 16, margin: 0, fontWeight: 600 }}>Your challenge activity</h3>
              <p style={{ fontSize: 12, color: "var(--text-mute)", margin: "4px 0 0" }}>148 challenges in the last 26 weeks · longest streak: 12 days</p>
            </div>
            <div style={{ display: "flex", gap: 18, alignItems: "baseline" }}>
              <div style={{ textAlign: "right" }}>
                <div className="display mono" style={{ fontSize: 20, fontWeight: 700, color: "var(--gold)" }}>5 <span style={{ fontSize: 12, color: "var(--text-mute)", fontWeight: 500 }}>days</span></div>
                <div style={{ fontSize: 10, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Current streak</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="display mono" style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>26<span style={{ fontSize: 12, color: "var(--text-mute)", fontWeight: 500 }}>%</span></div>
                <div style={{ fontSize: 10, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Days active</div>
              </div>
            </div>
          </div>
          <ActivityHeatmap weeks={26} seed={101} />
        </Card>

        {/* Three columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 18 }}>
          <Card padding={20}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 className="display" style={{ fontSize: 16, margin: 0, fontWeight: 600 }}>Recommended for you</h3>
              <a style={{ fontSize: 12, color: "var(--gold)", cursor: "pointer" }} onClick={() => go("challenges")}>See all →</a>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {RECOMMENDED.map(c => (
                <div key={c.title} onClick={() => go("challenge-detail")} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-soft)", background: "var(--bg-2)", cursor: "pointer" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{c.title}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <DifficultyTag level={c.level} size="sm" />
                      <span style={{ fontSize: 11.5, color: "var(--text-mute)" }}>{c.goal}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="mono display" style={{ fontWeight: 700, color: "var(--gold)", fontSize: 16 }}>+{c.points}</div>
                    <div style={{ fontSize: 10.5, color: "var(--text-mute)" }}>{c.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card padding={20}>
            <h3 className="display" style={{ fontSize: 16, margin: "0 0 16px", fontWeight: 600 }}>Mini leaderboard · weekly</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { r: 25, name: "Tanvi Joshi", pts: 8612, you: false },
                { r: 26, name: "Vikram Singh", pts: 8488, you: false },
                { r: 27, name: "You (Shashank)", pts: 8376, you: true },
                { r: 28, name: "Arjun Pal", pts: 8201, you: false },
                { r: 29, name: "Pooja Verma", pts: 8095, you: false },
              ].map(row => (
                <div key={row.r} style={{ display: "grid", gridTemplateColumns: "28px 1fr auto", gap: 10, alignItems: "center", padding: "7px 9px", borderRadius: 8, background: row.you ? "color-mix(in oklch, var(--gold) 14%, transparent)" : "transparent" }}>
                  <div className="mono" style={{ fontSize: 12, fontWeight: 600, color: row.you ? "var(--gold)" : "var(--text-mute)" }}>#{row.r}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar name={row.name} size={22} />
                    <span style={{ fontSize: 12.5, fontWeight: row.you ? 700 : 500, color: row.you ? "var(--gold)" : "var(--text)" }}>{row.name}</span>
                  </div>
                  <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{row.pts.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card padding={20}>
            <h3 className="display" style={{ fontSize: 16, margin: "0 0 16px", fontWeight: 600 }}>Recent activity</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { t: "Cleared 'Cold call → demo'", time: "2h ago", color: "var(--emerald)", pts: "+312" },
                { t: "Profile viewed by Razorpay", time: "5h ago", color: "var(--cool)", pts: null },
                { t: "New job match: SDR @ Zoho", time: "1d ago", color: "var(--gold)", pts: null },
                { t: "Badge earned: 'First Objection'", time: "2d ago", color: "var(--r-master)", pts: null },
              ].map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 999, background: a.color, marginTop: 6, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5 }}>{a.t}</div>
                    <div style={{ fontSize: 11, color: "var(--text-mute)", marginTop: 2 }}>{a.time}</div>
                  </div>
                  {a.pts && <span className="mono" style={{ color: "var(--emerald)", fontWeight: 700, fontSize: 12 }}>{a.pts}</span>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

const statLbl = { color: "var(--text-mute)", fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 };
const badgeBase = { padding: "4px 10px", borderRadius: 999, fontSize: 11.5, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 };

const RECOMMENDED = [
  { title: "Email sequence: warm reply", level: "Easy", goal: "Book follow-up", points: 110, time: "8 min" },
  { title: "Gatekeeper bypass: enterprise IT", level: "Hard", goal: "Reach decision-maker", points: 480, time: "12 min" },
  { title: "Re-engage the ghosted prospect", level: "Medium", goal: "Revive lead", points: 240, time: "10 min" },
  { title: "Pricing pushback — defend value", level: "Medium", goal: "Send proposal", points: 256, time: "15 min" },
];

/* Continued in second registration call */
Object.assign(window, { LandingScreen, SignupScreen, OnboardingScreen, DashboardScreen, AppShell, RECOMMENDED });
