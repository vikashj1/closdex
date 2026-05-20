/* SalesArena root: journey navigator + view router. */

const { useState: useStateA, useEffect: useEffectA } = React;

const SALESPERSON_JOURNEY = [
  { id: "landing", label: "Landing", phase: "Acquisition" },
  { id: "signup", label: "Sign Up", phase: "Acquisition" },
  { id: "onboarding", label: "Onboarding", phase: "Acquisition" },
  { id: "dashboard", label: "Dashboard", phase: "Engagement" },
  { id: "challenges", label: "Challenges", phase: "Engagement" },
  { id: "challenge-detail", label: "Challenge", phase: "Engagement" },
  { id: "conversation", label: "Conversation", phase: "Engagement" },
  { id: "result", label: "Result", phase: "Engagement" },
  { id: "leaderboard", label: "Leaderboard", phase: "Status" },
  { id: "profile", label: "Profile", phase: "Status" },
  { id: "jobs", label: "Jobs", phase: "Outcome" },
];

const COMPANY_JOURNEY = [
  { id: "co-dashboard", label: "Dashboard", phase: "Discovery" },
  { id: "co-talent", label: "Talent Search", phase: "Discovery" },
  { id: "co-candidate", label: "Candidate", phase: "Evaluate" },
  { id: "co-jobpost", label: "Post a Job", phase: "Hire" },
];

function App() {
  // Read view from URL hash so refresh persists position
  const initial = (typeof window !== "undefined" && window.location.hash.replace(/^#/, "")) || "landing";
  const [view, setView] = useStateA(initial);
  const [side, setSide] = useStateA(initial.startsWith("co-") ? "company" : "salesperson");
  const [navHidden, setNavHidden] = useStateA(false);

  const go = (id) => {
    setView(id);
    setSide(id.startsWith("co-") ? "company" : "salesperson");
    if (typeof window !== "undefined") window.location.hash = id;
  };

  useEffectA(() => {
    const onHash = () => {
      const v = window.location.hash.replace(/^#/, "") || "landing";
      setView(v);
      setSide(v.startsWith("co-") ? "company" : "salesperson");
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // immersive screens hide the journey nav by default
  const immersive = view === "conversation";

  // Map of view -> component
  const screens = {
    landing: LandingScreen,
    signup: SignupScreen,
    onboarding: OnboardingScreen,
    dashboard: DashboardScreen,
    challenges: ChallengesScreen,
    "challenge-detail": ChallengeDetailScreen,
    conversation: ConversationScreen,
    result: ResultScreen,
    leaderboard: LeaderboardScreen,
    profile: ProfileScreen,
    jobs: JobsScreen,
    "co-dashboard": CompanyDashboardScreen,
    "co-talent": TalentSearchScreen,
    "co-candidate": CandidateProfileScreen,
    "co-jobpost": JobPostScreen,
  };

  const Screen = screens[view] || LandingScreen;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Journey nav bar (toggleable) */}
      {!navHidden && <JourneyNav view={view} side={side} setSide={setSide} go={go} setNavHidden={setNavHidden} />}

      {/* Floating reopen */}
      {navHidden && (
        <button onClick={() => setNavHidden(false)} style={{
          position: "fixed", top: 14, left: "50%", transform: "translateX(-50%)",
          zIndex: 50, padding: "6px 14px", borderRadius: 999,
          background: "var(--surface)", border: "1px solid var(--border)",
          color: "var(--text-dim)", fontSize: 11.5, fontWeight: 600,
          display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
        }}>
          <Icon.target /> Show journey nav
        </button>
      )}

      {/* Screen content */}
      <div style={{ minHeight: navHidden ? "100vh" : "calc(100vh - 64px)" }}>
        <Screen go={go} />
      </div>
    </div>
  );
}

function JourneyNav({ view, side, setSide, go, setNavHidden }) {
  const steps = side === "salesperson" ? SALESPERSON_JOURNEY : COMPANY_JOURNEY;
  const currentIdx = steps.findIndex(s => s.id === view);
  const phases = [...new Set(steps.map(s => s.phase))];

  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 40,
      background: "color-mix(in oklch, var(--bg) 92%, transparent)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border-soft)",
      padding: "10px 24px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
        {/* Left: brand + side toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span className="mono" style={{ fontSize: 10, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: "0.1em" }}>SalesArena prototype</span>
            <span style={{ fontSize: 10.5, color: "var(--text-dim)" }}>· user journey</span>
          </div>
          <div style={{ display: "inline-flex", background: "var(--bg-2)", padding: 3, borderRadius: 8, gap: 3, border: "1px solid var(--border)" }}>
            {[
              { id: "salesperson", label: "Salesperson", color: "var(--gold)" },
              { id: "company", label: "Company", color: "var(--cool)" },
            ].map(t => (
              <button key={t.id} onClick={() => { setSide(t.id); go(t.id === "company" ? "co-dashboard" : "landing"); }}
                style={{
                  padding: "5px 12px", borderRadius: 6, fontSize: 11.5, fontWeight: 600,
                  background: side === t.id ? t.color : "transparent",
                  color: side === t.id ? "oklch(0.18 0.02 75)" : "var(--text-dim)",
                  border: "none",
                }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* Middle: step ribbon */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, overflowX: "auto", flex: 1, justifyContent: "center" }}>
          {steps.map((s, i) => {
            const active = i === currentIdx;
            const past = i < currentIdx;
            return (
              <React.Fragment key={s.id}>
                <button onClick={() => go(s.id)} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "6px 10px", borderRadius: 7, border: "none",
                  background: active ? (side === "company" ? "color-mix(in oklch, var(--cool) 22%, transparent)" : "color-mix(in oklch, var(--gold) 22%, transparent)") : "transparent",
                  color: active ? (side === "company" ? "var(--cool)" : "var(--gold)") : (past ? "var(--text-dim)" : "var(--text-mute)"),
                  fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap", cursor: "pointer",
                  border: active ? `1px solid ${side === "company" ? "color-mix(in oklch, var(--cool) 40%, transparent)" : "color-mix(in oklch, var(--gold) 40%, transparent)"}` : "1px solid transparent",
                }}>
                  <span className="mono" style={{ fontSize: 9.5, opacity: 0.7 }}>{String(i+1).padStart(2,"0")}</span>
                  {s.label}
                </button>
                {i < steps.length - 1 && (
                  <span style={{ color: past ? (side === "company" ? "var(--cool)" : "var(--gold)") : "var(--text-mute)", fontSize: 10, opacity: 0.5 }}>›</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Right: collapse */}
        <div style={{ flexShrink: 0, display: "flex", gap: 8, alignItems: "center" }}>
          <span className="mono" style={{ fontSize: 10.5, color: "var(--text-mute)" }}>{currentIdx + 1} / {steps.length}</span>
          <button onClick={() => setNavHidden(true)} title="Hide nav" style={{
            background: "transparent", border: "1px solid var(--border)", color: "var(--text-mute)",
            borderRadius: 6, padding: "4px 8px", fontSize: 11, cursor: "pointer",
          }}>Hide</button>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
