/* Company-side journey screens for SalesArena. */

const { useState: useStateC, useEffect: useEffectC } = React;

/* =====================================================================
   COMPANY APP SHELL
===================================================================== */
function CompanyShell({ go, view, children }) {
  const nav = [
    { id: "co-dashboard", label: "Home", icon: <Icon.home /> },
    { id: "co-talent", label: "Talent Search", icon: <Icon.search /> },
    { id: "co-jobs", label: "Job Postings", icon: <Icon.briefcase /> },
    { id: "co-shortlist", label: "Shortlists", icon: <Icon.target />, count: 12 },
    { id: "co-hires", label: "Hires & Billing", icon: <Icon.trophy /> },
    { id: "co-profile", label: "Company Profile", icon: <Icon.user /> },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "100%" }}>
      <aside style={{ background: "var(--bg-2)", borderRight: "1px solid var(--border-soft)", padding: "20px 14px", display: "flex", flexDirection: "column", gap: 4, position: "sticky", top: 0, height: "100vh", overflow: "auto" }}>
        <div style={{ padding: "6px 8px 18px" }}><Logo size={20} /></div>
        {/* Company switcher */}
        <div style={{ padding: "10px 12px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border-soft)", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, oklch(0.55 0.15 240), oklch(0.45 0.12 200))", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontFamily: "Space Grotesk", fontSize: 13 }}>RP</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Razorpay</div>
            <div style={{ fontSize: 10.5, color: "var(--text-mute)" }}>Growth · ₹14,999/mo</div>
          </div>
          <Icon.chevDown />
        </div>
        {nav.map(n => {
          const active = view === n.id;
          return (
            <button key={n.id} onClick={() => go(n.id)} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 12px", borderRadius: 8, border: "none",
              background: active ? "color-mix(in oklch, var(--cool) 18%, transparent)" : "transparent",
              color: active ? "var(--cool)" : "var(--text-dim)",
              fontSize: 13.5, fontWeight: 500, textAlign: "left", cursor: "pointer",
            }}>
              {n.icon}{n.label}
              {n.count && <span style={{ marginLeft: "auto", fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "var(--surface-2)", color: "var(--text-dim)" }}>{n.count}</span>}
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <div style={{ padding: 10, fontSize: 11, color: "var(--text-mute)" }}>
          <div>Plan: <strong style={{ color: "var(--text)" }}>Growth</strong></div>
          <div>5 / 5 active postings used</div>
          <a style={{ color: "var(--cool)", fontSize: 11.5, marginTop: 4, display: "inline-block" }}>Upgrade to Scale →</a>
        </div>
      </aside>
      <main style={{ overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 32px", borderBottom: "1px solid var(--border-soft)", background: "var(--bg)", position: "sticky", top: 0, zIndex: 5 }}>
          <div style={{ position: "relative", flex: "0 1 420px" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-mute)" }}><Icon.search /></span>
            <input placeholder="Search talent by skill, rank, location…" style={{ width: "100%", padding: "9px 12px 9px 36px", borderRadius: 9, background: "var(--bg-2)", border: "1px solid var(--border)", fontSize: 13, color: "var(--text)" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button style={{ background: "transparent", border: "none", color: "var(--text-dim)" }}><Icon.bell /></button>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 10px 4px 4px", background: "var(--bg-2)", borderRadius: 999, border: "1px solid var(--border)" }}>
              <Avatar name="Anika Verma" size={28} color="oklch(0.55 0.14 220)" />
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>Anika · Recruiter</span>
            </div>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}

/* =====================================================================
   C1. COMPANY DASHBOARD
===================================================================== */
function CompanyDashboardScreen({ go }) {
  return (
    <CompanyShell go={go} view="co-dashboard">
      <div data-screen-label="C1 Company Dashboard" style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 className="display" style={{ fontSize: 30, margin: 0, fontWeight: 700 }}>Razorpay · Talent Hub</h1>
            <p style={{ color: "var(--text-dim)", margin: "6px 0 0", fontSize: 13.5 }}>5 active roles · 312 applicants this month · 2 placements YTD</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn kind="secondary" size="md">Browse leaderboard</Btn>
            <Btn kind="primary" size="md" icon={<Icon.briefcase />} onClick={() => go("co-jobpost")}>Post a job</Btn>
          </div>
        </div>

        {/* KPI strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {[
            { l: "Active job postings", v: "5", sub: "of 5 in Growth plan", c: "var(--text)" },
            { l: "New applications", v: "47", sub: "this week", c: "var(--cool)" },
            { l: "Shortlisted candidates", v: "12", sub: "across all roles", c: "var(--gold)" },
            { l: "Hires this quarter", v: "2", sub: "₹1.5L commission paid", c: "var(--emerald)" },
          ].map(k => (
            <Card key={k.l} padding={18}>
              <div style={{ fontSize: 11.5, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{k.l}</div>
              <div className="display mono" style={{ fontSize: 30, fontWeight: 700, color: k.c, marginTop: 4 }}>{k.v}</div>
              <div style={{ fontSize: 11.5, color: "var(--text-dim)" }}>{k.sub}</div>
            </Card>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
          {/* Recommended candidates */}
          <Card padding={22}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 className="display" style={{ fontSize: 16, margin: 0, fontWeight: 600 }}>Top recommended candidates</h3>
              <span style={{ fontSize: 11.5, color: "var(--text-mute)" }}>Matched to "Senior AE — IT Sales"</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { name: "Aarav Sharma", city: "Bangalore", rank: "Master", pts: 38420, win: 81, fit: 96 },
                { name: "Priya Iyer", city: "Mumbai", rank: "Master", pts: 36110, win: 76, fit: 91 },
                { name: "Karan Mehta", city: "Pune", rank: "Diamond", pts: 28940, win: 72, fit: 88, open: true },
                { name: "Sneha Reddy", city: "Hyderabad", rank: "Diamond", pts: 22180, win: 79, fit: 82, open: true },
                { name: "Shashank Khare", city: "Bangalore", rank: "Gold", pts: 8376, win: 73, fit: 78, open: true },
              ].map(c => (
                <div key={c.name} onClick={() => go("co-candidate")} style={{ display: "grid", gridTemplateColumns: "40px 1.5fr 80px auto auto 100px", gap: 12, alignItems: "center", padding: "10px 12px", borderRadius: 10, background: "var(--bg-2)", border: "1px solid var(--border-soft)", cursor: "pointer" }}>
                  <Avatar name={c.name} size={36} />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600 }}>{c.name}</span>
                      {c.open && <span style={{ fontSize: 9.5, padding: "2px 6px", borderRadius: 4, background: "color-mix(in oklch, var(--emerald) 18%, transparent)", color: "var(--emerald)", fontWeight: 700 }}>OPEN</span>}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--text-mute)" }}>{c.city}</div>
                  </div>
                  <RankBadge rank={c.rank} size={18} showLabel />
                  <span className="mono" style={{ fontSize: 12.5, fontWeight: 700 }}>{c.pts.toLocaleString()}</span>
                  <span className="mono" style={{ fontSize: 12, color: "var(--text-dim)" }}>{c.win}% win</span>
                  <FitBar v={c.fit} />
                </div>
              ))}
            </div>
          </Card>

          {/* Activity */}
          <Card padding={22}>
            <h3 className="display" style={{ fontSize: 16, margin: "0 0 16px", fontWeight: 600 }}>Recent activity</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { t: "Karan Mehta applied", role: "Senior AE — IT Sales", time: "23m ago", c: "var(--cool)" },
                { t: "You shortlisted Priya Iyer", role: "Enterprise AE", time: "2h ago", c: "var(--gold)" },
                { t: "Interview scheduled with Aarav", role: "Senior AE — IT Sales · Fri 4pm", time: "5h ago", c: "var(--emerald)" },
                { t: "Sneha Reddy declined offer", role: "Mid-Market AE", time: "1d ago", c: "var(--d-expert)" },
                { t: "Job posted: SDR Manager", role: "₹2,499/wk Featured tier", time: "2d ago", c: "var(--text-dim)" },
              ].map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 999, background: a.c, marginTop: 6, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{a.t}</div>
                    <div style={{ fontSize: 11, color: "var(--text-mute)", marginTop: 2 }}>{a.role}</div>
                    <div style={{ fontSize: 10.5, color: "var(--text-mute)" }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </CompanyShell>
  );
}

function FitBar({ v }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
      <span className="mono" style={{ fontSize: 11.5, color: "var(--cool)", fontWeight: 700 }}>{v}% fit</span>
      <div style={{ width: 70, height: 5, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden" }}>
        <div style={{ width: v + "%", height: "100%", background: "var(--cool)", borderRadius: 999 }} />
      </div>
    </div>
  );
}

/* =====================================================================
   C2. TALENT SEARCH
===================================================================== */
function TalentSearchScreen({ go }) {
  const [minRank, setMinRank] = useStateC("Gold");
  const candidates = [
    { name: "Aarav Sharma", city: "Bangalore", rank: "Master", pts: 38420, exp: 6, win: 81, top: "Discovery, Closing", ctc: "₹28-36 LPA" },
    { name: "Priya Iyer", city: "Mumbai", rank: "Master", pts: 36110, exp: 7, win: 76, top: "Enterprise, MEDDIC", ctc: "₹32-42 LPA" },
    { name: "Karan Mehta", city: "Pune", rank: "Diamond", pts: 28940, exp: 5, win: 72, top: "Discovery, Objection", ctc: "₹22-28 LPA", open: true },
    { name: "Sneha Reddy", city: "Hyderabad", rank: "Diamond", pts: 22180, exp: 4, win: 79, top: "SaaS, Cold outbound", ctc: "₹18-24 LPA", open: true },
    { name: "Rohan Gupta", city: "Delhi NCR", rank: "Platinum", pts: 17850, exp: 5, win: 68, top: "Negotiation, Closing", ctc: "₹20-26 LPA" },
    { name: "Anjali Nair", city: "Bangalore", rank: "Platinum", pts: 14210, exp: 3, win: 71, top: "Cybersec, Mid-mkt", ctc: "₹16-22 LPA", open: true },
    { name: "Shashank Khare", city: "Bangalore", rank: "Gold", pts: 8376, exp: 4, win: 73, top: "Discovery, IT Services", ctc: "₹16-22 LPA", open: true },
    { name: "Tanvi Joshi", city: "Pune", rank: "Gold", pts: 8612, exp: 3, win: 69, top: "DevTools, SDR", ctc: "₹12-16 LPA", open: true },
  ];

  return (
    <CompanyShell go={go} view="co-talent">
      <div data-screen-label="C2 Talent Search" style={{ display: "grid", gridTemplateColumns: "260px 1fr" }}>
        {/* Filters */}
        <aside style={{ borderRight: "1px solid var(--border-soft)", padding: "24px 22px", display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 className="display" style={{ fontSize: 14, margin: 0, fontWeight: 700 }}>Filters</h3>
            <a style={{ fontSize: 11, color: "var(--cool)" }}>Save search</a>
          </div>

          <div>
            <div style={filterLblC}>Min rank</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
              {["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master"].map(r => (
                <label key={r} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 8px", borderRadius: 7, cursor: "pointer", background: minRank === r ? "var(--surface-2)" : "transparent" }}>
                  <input type="radio" checked={minRank === r} onChange={() => setMinRank(r)} style={{ accentColor: "var(--cool)" }} />
                  <RankBadge rank={r} size={14} />
                  <span style={{ fontSize: 12.5 }}>{r}+</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div style={filterLblC}>Win rate</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-mute)", marginTop: 10 }}>
              <span>0%</span><span style={{ color: "var(--cool)", fontWeight: 700 }}>≥ 60%</span><span>100%</span>
            </div>
            <input type="range" min="0" max="100" defaultValue="60" style={{ width: "100%", accentColor: "var(--cool)" }} />
          </div>

          <div>
            <div style={filterLblC}>Location</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              {["Bangalore", "Mumbai", "Delhi NCR", "Pune", "Hyderabad", "Remote"].map(l => (
                <Chip key={l} active={l === "Bangalore"} color="var(--cool)">{l}</Chip>
              ))}
            </div>
          </div>

          <div>
            <div style={filterLblC}>Experience</div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <TextInput placeholder="Min" style={{ width: "100%" }} />
              <TextInput placeholder="Max" style={{ width: "100%" }} />
            </div>
          </div>

          <div>
            <div style={filterLblC}>Goal performance</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              {["Discovery", "Book Call", "Proposal", "Close"].map(g => (
                <Chip key={g} active={g === "Discovery"} color="var(--cool)">{g}</Chip>
              ))}
            </div>
          </div>

          <div>
            <div style={filterLblC}>Availability</div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, marginTop: 8 }}>
              <input type="checkbox" defaultChecked style={{ accentColor: "var(--cool)" }} /> Open to work only
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, marginTop: 6 }}>
              <input type="checkbox" style={{ accentColor: "var(--cool)" }} /> Notice ≤ 30 days
            </label>
          </div>
        </aside>

        {/* Results */}
        <div style={{ padding: "24px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
            <div>
              <h1 className="display" style={{ fontSize: 26, margin: 0, fontWeight: 700 }}>Talent search</h1>
              <p style={{ color: "var(--text-mute)", fontSize: 12.5, margin: "4px 0 0" }}>
                Showing <strong style={{ color: "var(--text)" }}>{candidates.length}</strong> of 312 matching candidates · {minRank}+ · Bangalore · 60%+ win rate
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <select style={selectStyleC}><option>Sort: Points (high → low)</option><option>Sort: Win rate</option><option>Sort: Recent activity</option></select>
              <Btn kind="ghost" size="sm">Export CSV</Btn>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {candidates.map(c => (
              <Card key={c.name} hover onClick={() => go("co-candidate")} padding={18}>
                <div style={{ display: "grid", gridTemplateColumns: "auto 1.6fr 0.9fr 0.9fr 0.9fr auto", gap: 16, alignItems: "center" }}>
                  <Avatar name={c.name} size={48} />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 700 }}>{c.name}</span>
                      <RankBadge rank={c.rank} size={16} showLabel />
                      {c.open && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "color-mix(in oklch, var(--emerald) 18%, transparent)", color: "var(--emerald)", fontWeight: 700 }}>● OPEN TO WORK</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{c.city} · {c.exp} yrs experience · expects {c.ctc}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-mute)", marginTop: 4 }}>Strong in: <span style={{ color: "var(--text-dim)" }}>{c.top}</span></div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div className="display mono" style={{ fontSize: 18, fontWeight: 700, color: "var(--gold)" }}>{c.pts.toLocaleString()}</div>
                    <div style={{ fontSize: 10.5, color: "var(--text-mute)" }}>total pts</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div className="display mono" style={{ fontSize: 18, fontWeight: 700, color: c.win >= 75 ? "var(--emerald)" : "var(--text)" }}>{c.win}%</div>
                    <div style={{ fontSize: 10.5, color: "var(--text-mute)" }}>win rate</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div className="display mono" style={{ fontSize: 18, fontWeight: 700, color: "var(--cool)" }}>#{Math.floor(2500 - c.pts/16)}</div>
                    <div style={{ fontSize: 10.5, color: "var(--text-mute)" }}>weekly rank</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <Btn kind="primary" size="sm">View profile</Btn>
                    <Btn kind="ghost" size="sm">Save</Btn>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 22 }}>
            {[1,2,3,4,5,"…",24].map((p, i) => (
              <button key={i} style={{ padding: "6px 11px", borderRadius: 6, background: p === 1 ? "var(--cool)" : "var(--bg-2)", color: p === 1 ? "white" : "var(--text-dim)", border: "1px solid var(--border-soft)", fontSize: 12, fontWeight: 600 }}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </CompanyShell>
  );
}

const filterLblC = { fontSize: 11, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 };
const selectStyleC = { padding: "7px 12px", borderRadius: 8, background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12 };

/* =====================================================================
   C3. JOB POSTING (multi-step form)
===================================================================== */
function JobPostScreen({ go }) {
  const [step, setStep] = useStateC(1);
  const steps = ["Job details", "Requirements", "Listing tier", "Review"];

  return (
    <CompanyShell go={go} view="co-jobs">
      <div data-screen-label="C3 Job Post" style={{ padding: "28px 32px" }}>
        <div style={{ marginBottom: 22 }}>
          <h1 className="display" style={{ fontSize: 28, margin: 0, fontWeight: 700 }}>Post a new role</h1>
          <p style={{ color: "var(--text-mute)", fontSize: 13, margin: "4px 0 0" }}>Step {step} of 4 — your Growth plan includes 5 active postings (0 used)</p>
        </div>

        {/* Stepper */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 22 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ height: 4, borderRadius: 999, background: i < step ? "var(--cool)" : "var(--surface-2)" }} />
              <div style={{ fontSize: 11.5, color: i < step ? "var(--cool)" : "var(--text-mute)", fontWeight: 600 }}>
                <span className="mono">{String(i+1).padStart(2,"0")} </span>{s}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 22 }}>
          <Card padding={28}>
            {step === 1 && <>
              <h2 className="display" style={{ fontSize: 22, margin: "0 0 6px", fontWeight: 700 }}>Job details</h2>
              <p style={{ color: "var(--text-dim)", margin: "0 0 22px", fontSize: 13 }}>Be specific. Salespersons filter aggressively on title and CTC.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ gridColumn: "1 / -1" }}><Field label="Job title" required><TextInput placeholder="Senior Account Executive — IT Sales" /></Field></div>
                <Field label="Location" required><TextInput placeholder="Bangalore" /></Field>
                <Field label="Employment type" required>
                  <select style={inputStyle}><option>Full-time</option><option>Contract</option><option>Part-time</option></select>
                </Field>
                <Field label="Min CTC (LPA)"><TextInput placeholder="18" /></Field>
                <Field label="Max CTC (LPA)"><TextInput placeholder="24" /></Field>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="Variable / OTE" hint="Helps Sales talent assess earning ceiling"><TextInput placeholder="30% of fixed, uncapped" /></Field>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="Job description" required>
                    <textarea rows={5} style={{ ...inputStyle, resize: "vertical" }} placeholder="What will this person do? Who will they sell to? What's the team like?" />
                  </Field>
                </div>
              </div>
            </>}

            {step === 2 && <>
              <h2 className="display" style={{ fontSize: 22, margin: "0 0 6px", fontWeight: 700 }}>Requirements</h2>
              <p style={{ color: "var(--text-dim)", margin: "0 0 22px", fontSize: 13 }}>Set minimum rank threshold to filter your pipeline up-front.</p>
              <Field label="Minimum rank threshold" required hint="Only candidates at this rank or above can apply">
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                  {["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master"].map(r => (
                    <button key={r} style={{
                      padding: "10px 14px", borderRadius: 10,
                      background: r === "Gold" ? "color-mix(in oklch, var(--cool) 18%, transparent)" : "var(--bg-2)",
                      border: `1px solid ${r === "Gold" ? "var(--cool)" : "var(--border)"}`,
                      color: r === "Gold" ? "var(--cool)" : "var(--text)",
                      display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 600,
                    }}>
                      <RankBadge rank={r} size={14} />{r}+
                    </button>
                  ))}
                </div>
              </Field>
              <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Experience required" required><TextInput placeholder="3-6 years" /></Field>
                <Field label="Specializations" required>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {["IT Sales", "Cloud", "DevTools", "Cybersec"].map((s, i) => (
                      <Chip key={s} active={i < 2} color="var(--cool)">{s} {i < 2 && "✕"}</Chip>
                    ))}
                    <Chip>+ Add</Chip>
                  </div>
                </Field>
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="Required goal-type performance" hint="Candidate must have completed challenges of this type">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {["Book Discovery Call", "Send Proposal", "Reach Decision-Maker"].map((g, i) => (
                        <Chip key={g} active={i === 0} color="var(--cool)">{g} {i === 0 && "✕"}</Chip>
                      ))}
                    </div>
                  </Field>
                </div>
              </div>
            </>}

            {step === 3 && <>
              <h2 className="display" style={{ fontSize: 22, margin: "0 0 6px", fontWeight: 700 }}>Choose your listing tier</h2>
              <p style={{ color: "var(--text-dim)", margin: "0 0 22px", fontSize: 13 }}>Featured postings get 4x more qualified applicants on average.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {[
                  { name: "Basic", price: "Included", desc: "Standard placement in jobs feed. Filtered by rank match only.", apps: "8-15 / week" },
                  { name: "Featured", price: "₹2,499/wk", desc: "Pinned to top of jobs feed for 7 days. Spotlight badge.", apps: "30-50 / week", best: true },
                  { name: "Premium", price: "₹9,999/wk", desc: "Featured + Email blast to matched salespersons + Talent reports.", apps: "60-100 / week" },
                ].map(t => (
                  <Card key={t.name} padding={18} style={{ borderColor: t.best ? "var(--cool)" : "var(--border-soft)", background: t.best ? "color-mix(in oklch, var(--cool) 8%, var(--surface))" : "var(--surface)" }}>
                    {t.best && <div style={{ fontSize: 10, color: "var(--cool)", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>★ RECOMMENDED</div>}
                    <h4 className="display" style={{ fontSize: 17, margin: 0, fontWeight: 700 }}>{t.name}</h4>
                    <div className="display mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--cool)", margin: "8px 0" }}>{t.price}</div>
                    <p style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5, margin: "0 0 12px" }}>{t.desc}</p>
                    <div style={{ fontSize: 11.5, color: "var(--text-mute)" }}>Est. applicants: <strong style={{ color: "var(--text)" }}>{t.apps}</strong></div>
                  </Card>
                ))}
              </div>
            </>}

            {step === 4 && <>
              <h2 className="display" style={{ fontSize: 22, margin: "0 0 6px", fontWeight: 700 }}>Preview & publish</h2>
              <p style={{ color: "var(--text-dim)", margin: "0 0 22px", fontSize: 13 }}>This is what salespersons will see.</p>
              <Card padding={18} style={{ background: "var(--bg-2)" }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(135deg, oklch(0.55 0.15 240), oklch(0.45 0.12 200))", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontFamily: "Space Grotesk" }}>RP</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                      <h4 className="display" style={{ fontSize: 16, margin: 0, fontWeight: 600 }}>Senior Account Executive — IT Sales</h4>
                      <span style={{ ...badgeBase2, color: "var(--gold)", background: "color-mix(in oklch, var(--gold) 14%, transparent)", border: "1px solid color-mix(in oklch, var(--gold) 35%, transparent)" }}>★ Featured</span>
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--text-dim)" }}>Razorpay · Bangalore · Full-time · 3-6 yrs</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <span style={{ ...badgeBase2, color: "var(--emerald)", background: "color-mix(in oklch, var(--emerald) 12%, transparent)", border: "1px solid color-mix(in oklch, var(--emerald) 30%, transparent)" }}>₹18-24 LPA + 30% OTE</span>
                      <span style={{ ...badgeBase2, color: "var(--text-dim)", background: "var(--bg)", border: "1px solid var(--border-soft)" }}><RankBadge rank="Gold" size={12} /> Gold+ required</span>
                    </div>
                  </div>
                </div>
              </Card>
              <div style={{ marginTop: 18, padding: 14, borderRadius: 10, background: "color-mix(in oklch, var(--cool) 10%, transparent)", border: "1px solid color-mix(in oklch, var(--cool) 25%, transparent)", fontSize: 12.5, color: "var(--text-dim)" }}>
                <strong style={{ color: "var(--cool)" }}>Listing tier:</strong> Featured (₹2,499/wk) · Charged to card ending in 4242 on publish.
              </div>
            </>}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
              <Btn kind="ghost" onClick={() => step > 1 ? setStep(step-1) : go("co-jobs")}>Back</Btn>
              <Btn kind="primary" icon={<Icon.arrow />} onClick={() => step < 4 ? setStep(step+1) : go("co-jobs")} style={{ background: "var(--cool)", color: "white" }}>
                {step < 4 ? "Continue" : "Publish job (₹2,499)"}
              </Btn>
            </div>
          </Card>

          {/* Side preview */}
          <div style={{ position: "sticky", top: 80, alignSelf: "flex-start" }}>
            <Card padding={22}>
              <h3 className="display" style={{ fontSize: 14, margin: "0 0 14px", fontWeight: 700 }}>Estimated reach</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Stat label="Matching candidates" value="312" accent="var(--cool)" sub="Gold+ in Bangalore" />
                <Stat label="Currently 'Open to work'" value="89" accent="var(--emerald)" sub="of matching pool" />
                <Stat label="Avg time to first applicant" value="4h" sub="for Featured tier" />
                <Stat label="Avg time to first hire" value="18 days" sub="across Growth tier customers" />
              </div>
            </Card>
            <Card padding={18} style={{ marginTop: 14, background: "var(--bg-2)" }}>
              <div style={{ fontSize: 11.5, color: "var(--text-dim)", lineHeight: 1.55 }}>
                <strong style={{ color: "var(--text)" }}>Placement commission:</strong> 10% of first-year CTC on confirmed hires (Growth subscriber rate). 90-day replacement guarantee.
              </div>
            </Card>
          </div>
        </div>
      </div>
    </CompanyShell>
  );
}

const inputStyle = { background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px", fontSize: 13.5, color: "var(--text)", width: "100%" };

/* =====================================================================
   C4. CANDIDATE PROFILE (company view)
===================================================================== */
function CandidateProfileScreen({ go }) {
  return (
    <CompanyShell go={go} view="co-talent">
      <div data-screen-label="C4 Candidate Profile">
        <button onClick={() => go("co-talent")} style={{ margin: "20px 32px 0", background: "transparent", border: "none", color: "var(--text-dim)", fontSize: 12.5, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ transform: "rotate(180deg)", display: "inline-flex" }}><Icon.arrow /></span> Back to talent search
        </button>

        <div style={{ height: 120, background: "linear-gradient(135deg, color-mix(in oklch, var(--cool) 30%, var(--bg-2)) 0%, var(--bg-2) 100%)", position: "relative", marginTop: 14 }}>
          <div className="stripe-ph" style={{ position: "absolute", inset: 0, opacity: 0.4 }} />
        </div>

        <div style={{ padding: "0 32px 40px" }}>
          <div style={{ display: "flex", gap: 24, alignItems: "flex-end", marginTop: -48 }}>
            <div style={{ position: "relative" }}>
              <Avatar name="Karan Mehta" size={104} color="oklch(0.55 0.16 30)" />
              <div style={{ position: "absolute", bottom: -4, right: -4 }}>
                <RankBadge rank="Diamond" size={40} />
              </div>
            </div>
            <div style={{ flex: 1, paddingBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <h1 className="display" style={{ fontSize: 28, margin: 0, fontWeight: 700 }}>Karan Mehta</h1>
                <span style={{ padding: "3px 8px", borderRadius: 999, background: "color-mix(in oklch, var(--emerald) 18%, transparent)", color: "var(--emerald)", fontSize: 11, fontWeight: 700 }}>● OPEN TO WORK</span>
                <span style={{ fontSize: 11, color: "var(--cool)", padding: "3px 8px", borderRadius: 999, background: "color-mix(in oklch, var(--cool) 14%, transparent)", border: "1px solid color-mix(in oklch, var(--cool) 30%, transparent)", fontWeight: 700 }}>88% FIT to your "Senior AE — IT Sales"</span>
              </div>
              <div style={{ color: "var(--text-dim)", fontSize: 13.5 }}>
                <strong style={{ color: "var(--r-diamond)" }}>Diamond tier · #3 weekly</strong> · Pune · 5 yrs · IT Sales / Cloud Infra
              </div>
              <div style={{ fontSize: 12, color: "var(--text-mute)", marginTop: 6 }}>Expects ₹22-28 LPA · 30-day notice · last active 2h ago</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn kind="ghost" size="md">Save to shortlist</Btn>
              <Btn kind="secondary" size="md">Message</Btn>
              <Btn kind="primary" size="md" icon={<Icon.briefcase />} style={{ background: "var(--cool)", color: "white" }}>Invite to apply</Btn>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginTop: 28, padding: "20px 0", borderTop: "1px solid var(--border-soft)", borderBottom: "1px solid var(--border-soft)" }}>
            <Stat label="Total points" value="28,940" accent="var(--gold)" />
            <Stat label="Weekly rank" value="#3" sub="of 2,481" accent="var(--cool)" />
            <Stat label="Challenges" value="142" sub="49 hard+ tier" />
            <Stat label="Win rate" value="72%" sub="avg goal achieved" accent="var(--emerald)" />
            <Stat label="Best dimension" value="Discovery" sub="avg 4.6/5" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18, marginTop: 22 }}>
            <Card padding={22}>
              <h3 className="display" style={{ fontSize: 15, margin: "0 0 14px", fontWeight: 600 }}>Verified performance · last 90 days</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { l: "Discovery & Listening", v: 4.6, c: "var(--emerald)" },
                  { l: "Objection Handling", v: 4.2, c: "var(--emerald)" },
                  { l: "Value Articulation", v: 4.0, c: "var(--gold)" },
                  { l: "Conversational Quality", v: 4.4, c: "var(--emerald)" },
                  { l: "Goal Execution", v: 3.8, c: "var(--gold)" },
                ].map(d => (
                  <div key={d.l}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12.5 }}>
                      <span>{d.l}</span>
                      <span className="mono" style={{ color: d.c, fontWeight: 700 }}>{d.v.toFixed(1)} / 5.0</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 999, background: "var(--bg-2)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: (d.v / 5 * 100) + "%", background: d.c, borderRadius: 999 }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--border-soft)" }}>
                <h4 className="display" style={{ fontSize: 13, margin: "0 0 12px", fontWeight: 600, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Notable wins</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { t: "Renewal under pressure", level: "Expert", s: 1480, ach: true, when: "1d ago" },
                    { t: "Multi-stakeholder demo close", level: "Expert", s: 1322, ach: true, when: "3d ago" },
                    { t: "Cybersec to non-tech buyer", level: "Hard", s: 612, ach: true, when: "5d ago" },
                  ].map((c, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 12, alignItems: "center", padding: "8px 10px", borderRadius: 8, background: "var(--bg-2)" }}>
                      <DifficultyTag level={c.level} size="sm" />
                      <span style={{ fontSize: 12.5 }}>{c.t}</span>
                      <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>+{c.s}</span>
                      <span style={{ fontSize: 11, color: "var(--text-mute)" }}>{c.when}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <Card padding={22}>
                <h3 className="display" style={{ fontSize: 15, margin: "0 0 14px", fontWeight: 600 }}>Career intent</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 12.5 }}>
                  <Row k="Status" v="Open to work" vc="var(--emerald)" />
                  <Row k="Locations" v="Pune, Bangalore, Remote" />
                  <Row k="Expected CTC" v="₹22-28 LPA" />
                  <Row k="Notice" v="30 days" />
                  <Row k="Sectors" v="SaaS, Cloud, DevTools" />
                  <Row k="Avoid" v="Cold-call only roles" />
                </div>
              </Card>
              <Card padding={22}>
                <h3 className="display" style={{ fontSize: 15, margin: "0 0 14px", fontWeight: 600 }}>Resume & contact</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <a style={resumeLink}>📄 karan_mehta_resume.pdf</a>
                  <a style={resumeLink}>🔗 linkedin.com/in/karan-mehta</a>
                  <a style={resumeLink}>✉️ Unlocked on shortlist</a>
                </div>
                <div style={{ marginTop: 14, padding: 12, borderRadius: 8, background: "color-mix(in oklch, var(--cool) 10%, transparent)", border: "1px solid color-mix(in oklch, var(--cool) 25%, transparent)", fontSize: 11.5, color: "var(--text-dim)" }}>
                  Contact details unlock when you shortlist or message. Profile view consumed: <strong style={{ color: "var(--cool)" }}>1 of 250/month</strong>.
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </CompanyShell>
  );
}

function Row({ k, v, vc }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: "var(--text-mute)" }}>{k}</span>
      <span style={{ color: vc || "var(--text)", fontWeight: 500, textAlign: "right" }}>{v}</span>
    </div>
  );
}

const resumeLink = { display: "block", padding: "10px 12px", borderRadius: 8, background: "var(--bg-2)", fontSize: 12.5, color: "var(--text-dim)", cursor: "pointer", border: "1px solid var(--border-soft)" };

Object.assign(window, { CompanyDashboardScreen, TalentSearchScreen, JobPostScreen, CandidateProfileScreen });
