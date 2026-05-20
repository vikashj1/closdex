/* Salesperson journey screens (part 2) for SalesArena. */

const { useState: useStateS2, useEffect: useEffectS2, useRef: useRefS2 } = React;

const ALL_CHALLENGES = [
  { id: 1, title: "The Skeptical CTO", level: "Hard", goal: "Book Discovery Call", goalMult: 1.2, points: 480, time: "15 min", featured: true, brief: "Pitch DevOps observability to a busy Series B fintech CTO." },
  { id: 2, title: "Email sequence: warm reply", level: "Easy", goal: "Book follow-up", goalMult: 1.0, points: 110, time: "8 min", brief: "Marketing-qualified lead replied positively. Convert to a meeting." },
  { id: 3, title: "Gatekeeper bypass: enterprise IT", level: "Hard", goal: "Reach decision-maker", goalMult: 1.5, points: 600, time: "12 min", brief: "EA blocks every direct ask. Earn a warm intro to the VP IT." },
  { id: 4, title: "Re-engage the ghosted prospect", level: "Medium", goal: "Win-back", goalMult: 1.6, points: 320, time: "10 min", brief: "Lost in 'we'll circle back next quarter' limbo for 60 days." },
  { id: 5, title: "Pricing pushback — defend value", level: "Medium", goal: "Send Proposal", goalMult: 1.4, points: 280, time: "15 min", brief: "Prospect loves the product but says 'you're 2x competitor X'." },
  { id: 6, title: "Multi-stakeholder demo close", level: "Expert", goal: "Close the Deal", goalMult: 2.0, points: 1600, time: "20 min", brief: "Procurement, security, and the user-champion all in one room." },
  { id: 7, title: "Cold outbound: SMB SaaS", level: "Rookie", goal: "Qualify Lead", goalMult: 1.0, points: 50, time: "5 min", brief: "First contact. Build curiosity, capture pain, qualify lightly." },
  { id: 8, title: "Renewal under pressure", level: "Expert", goal: "Close the Deal", goalMult: 2.0, points: 1600, time: "18 min", brief: "Anchor customer threatening churn. Save it or lose 18% of ARR." },
  { id: 9, title: "Cybersecurity sale to non-technical buyer", level: "Hard", goal: "Send Proposal", goalMult: 1.4, points: 560, time: "14 min", brief: "Buyer doesn't understand EDR vs MDR vs XDR. Don't lose them." },
];

/* =====================================================================
   5. CHALLENGE BROWSE
===================================================================== */
function ChallengesScreen({ go }) {
  const [diff, setDiff] = useStateS2("All");
  const [status, setStatus] = useStateS2("All");

  return (
    <AppShell go={go} view="challenges">
      <div data-screen-label="05 Challenge Browse" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 0, minHeight: "calc(100vh - 60px)" }}>
        {/* Filter sidebar */}
        <aside style={{ borderRight: "1px solid var(--border-soft)", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 22, background: "var(--bg)" }}>
          <div>
            <div style={filterLbl}><Icon.filter /> Difficulty</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
              {["All", "Rookie", "Easy", "Medium", "Hard", "Expert"].map(d => (
                <button key={d} onClick={() => setDiff(d)} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "7px 10px", borderRadius: 7, border: "none",
                  background: diff === d ? "var(--surface-2)" : "transparent",
                  color: "var(--text)", fontSize: 12.5, textAlign: "left", cursor: "pointer",
                }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {d !== "All" && <span style={{ width: 6, height: 6, borderRadius: 999, background: DIFFICULTY[d].color }} />}
                    {d}
                  </span>
                  <span className="mono" style={{ fontSize: 10.5, color: "var(--text-mute)" }}>
                    {d === "All" ? ALL_CHALLENGES.length : ALL_CHALLENGES.filter(c => c.level === d).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={filterLbl}>Status</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
              {["All", "Not attempted", "In progress", "Completed", "Locked"].map(s => (
                <button key={s} onClick={() => setStatus(s)} style={{
                  padding: "7px 10px", borderRadius: 7, border: "none",
                  background: status === s ? "var(--surface-2)" : "transparent",
                  color: "var(--text)", fontSize: 12.5, textAlign: "left", cursor: "pointer",
                }}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={filterLbl}>Goal type</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              {["Qualify", "Book call", "Proposal", "Decision-maker", "Close", "Win-back"].map(g => (
                <Chip key={g}>{g}</Chip>
              ))}
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div style={{ padding: "24px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <div>
              <h1 className="display" style={{ fontSize: 28, margin: 0, fontWeight: 700 }}>Challenge library</h1>
              <p style={{ color: "var(--text-mute)", fontSize: 13, margin: "4px 0 0" }}>
                Showing {ALL_CHALLENGES.length} challenges · IT Sales vertical
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--text-mute)" }}>Sort by</span>
              <button style={{ ...sortBtn }}>Trending <Icon.chevDown /></button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {ALL_CHALLENGES.map(c => (
              <Card key={c.id} hover onClick={() => go("challenge-detail")} padding={0} style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
                {/* Color band */}
                <div style={{ height: 4, background: DIFFICULTY[c.level].color }} />
                <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <DifficultyTag level={c.level} size="sm" />
                    {c.featured && <span style={{ fontSize: 10, color: "var(--gold)", fontWeight: 700, letterSpacing: "0.06em" }}>★ FEATURED</span>}
                  </div>
                  <div>
                    <h3 className="display" style={{ fontSize: 17, margin: "0 0 6px", fontWeight: 600, letterSpacing: "-0.01em" }}>{c.title}</h3>
                    <p style={{ fontSize: 12.5, color: "var(--text-dim)", margin: 0, lineHeight: 1.5 }}>{c.brief}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 8, borderTop: "1px solid var(--border-soft)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--text-mute)" }}>
                      <span><Icon.target /> Goal</span><span style={{ color: "var(--text-dim)" }}>{c.goal}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--text-mute)" }}>
                      <span><Icon.clock /> Duration</span><span style={{ color: "var(--text-dim)" }}>{c.time}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                    <div>
                      <div className="display mono" style={{ fontWeight: 700, color: "var(--gold)", fontSize: 22 }}>+{c.points}</div>
                      <div style={{ fontSize: 10.5, color: "var(--text-mute)" }}>max points</div>
                    </div>
                    <Btn kind="secondary" size="sm" icon={<Icon.arrow />}>Start</Btn>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

const filterLbl = { fontSize: 11, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 };
const sortBtn = { display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 8, background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12.5, fontWeight: 600 };

/* =====================================================================
   6. CHALLENGE DETAIL
===================================================================== */
function ChallengeDetailScreen({ go }) {
  return (
    <AppShell go={go} view="challenges">
      <div data-screen-label="06 Challenge Detail" style={{ padding: "24px 32px" }}>
        <button onClick={() => go("challenges")} style={{ background: "transparent", border: "none", color: "var(--text-dim)", fontSize: 12.5, marginBottom: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ transform: "rotate(180deg)", display: "inline-flex" }}><Icon.arrow /></span> Back to challenges
        </button>

        {/* Header strip */}
        <Card padding={0} style={{ overflow: "hidden", marginBottom: 18 }}>
          <div style={{ height: 5, background: DIFFICULTY.Hard.color }} />
          <div style={{ padding: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                <DifficultyTag level="Hard" />
                <span style={{ ...badgeBase2, color: "var(--gold)", background: "color-mix(in oklch, var(--gold) 14%, transparent)", border: "1px solid color-mix(in oklch, var(--gold) 35%, transparent)" }}>★ Challenge of the Day</span>
                <span style={{ fontSize: 11.5, color: "var(--text-mute)", fontFamily: "JetBrains Mono" }}>CHL-104 · IT_SALES</span>
              </div>
              <h1 className="display" style={{ fontSize: 32, margin: "0 0 8px", fontWeight: 700, letterSpacing: "-0.025em" }}>The Skeptical CTO</h1>
              <p style={{ color: "var(--text-dim)", margin: 0, fontSize: 14.5, lineHeight: 1.5, maxWidth: 720 }}>
                You're an Account Executive at LumenLogs, a DevOps observability platform. Your task: convince Meera Krishnan, CTO at Vector Pay, to commit to a 30-minute discovery call this week. She's burned by two previous tools.
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="display mono" style={{ fontSize: 38, fontWeight: 700, color: "var(--gold)", letterSpacing: "-0.02em" }}>+480</div>
              <div style={{ fontSize: 11, color: "var(--text-mute)" }}>base × goal mult</div>
            </div>
          </div>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Card padding={22}>
              <h3 className="display" style={detH}><Icon.user /> Lead persona</h3>
              <div style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--border-soft)" }}>
                <Avatar name="Meera Krishnan" size={56} color="oklch(0.55 0.14 290)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>Meera Krishnan</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-dim)" }}>CTO · Vector Pay (Series B Fintech, 180 engineers)</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 16, fontSize: 12.5, color: "var(--text-dim)" }}>
                <div><strong style={{ color: "var(--text)" }}>Personality:</strong> Direct, time-poor, comparison-shopping. Replies in 1-2 sentences. Doesn't suffer hype.</div>
                <div><strong style={{ color: "var(--text)" }}>Pain points:</strong> Last tool flooded with alerts. Eng wasted 14 hours on tuning. Compliance audit due in 8 weeks.</div>
                <div><strong style={{ color: "var(--text)" }}>Likely objections:</strong> Pricing vs Datadog, migration effort, vendor lock-in, log volume cost.</div>
                <div><strong style={{ color: "var(--text)" }}>Decision criteria:</strong> Time-to-value, integration speed, predictable pricing, SOC2.</div>
              </div>
            </Card>

            <Card padding={22}>
              <h3 className="display" style={detH}><Icon.target /> Your goal</h3>
              <div style={{ padding: "14px 16px", background: "color-mix(in oklch, var(--gold) 10%, transparent)", border: "1px solid color-mix(in oklch, var(--gold) 30%, transparent)", borderRadius: 10, marginTop: 8 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--gold)", marginBottom: 6 }}>Book a 30-minute discovery call.</div>
                <div style={{ fontSize: 12, color: "var(--text-dim)" }}>Lead must explicitly agree to a specific time slot. Vague "let me think about it" doesn't count.</div>
              </div>
              <div style={{ marginTop: 14, fontSize: 12, color: "var(--text-dim)" }}>
                <strong style={{ color: "var(--text)" }}>Success criteria (evaluated by AI):</strong>
                <ul style={{ margin: "8px 0 0", paddingLeft: 18, lineHeight: 1.7 }}>
                  <li>Uncovers at least 2 pain points through open-ended questions</li>
                  <li>Addresses pricing objection with empathy + evidence</li>
                  <li>Differentiates from named competitors without disparaging</li>
                  <li>Proposes specific time options, not "when works for you?"</li>
                </ul>
              </div>
            </Card>

            <Card padding={22}>
              <h3 className="display" style={detH}><Icon.clock /> Constraints</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 8 }}>
                {[
                  { lbl: "Time limit", val: "15 minutes", sub: "Soft timer" },
                  { lbl: "Message limit", val: "25 messages", sub: "Pre-counted in UI" },
                  { lbl: "Attempts allowed", val: "3", sub: "Decay 100% / 70% / 49%" },
                ].map(c => (
                  <div key={c.lbl}>
                    <div style={{ fontSize: 11, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{c.lbl}</div>
                    <div className="display" style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{c.val}</div>
                    <div style={{ fontSize: 11, color: "var(--text-mute)" }}>{c.sub}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Card padding={22}>
              <h3 className="display" style={detH}><Icon.bolt /> Scoring breakdown</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                {[
                  { l: "Base points", v: "400", note: "Hard tier" },
                  { l: "× Goal multiplier", v: "1.2x", note: "Book Discovery Call" },
                  { l: "× Quality multiplier", v: "0.0 – 1.0", note: "5-dimension AI rubric" },
                  { l: "+ Speed bonus", v: "+10% base", note: "If < 60% messages used" },
                  { l: "+ First-try bonus", v: "+15% base", note: "Cleared on attempt 1" },
                  { l: "− Spam penalty", v: "−50", note: "Pushy/unsolicited" },
                ].map(r => (
                  <div key={r.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: 8, borderBottom: "1px dashed var(--border-soft)" }}>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 500 }}>{r.l}</div>
                      <div style={{ fontSize: 11, color: "var(--text-mute)" }}>{r.note}</div>
                    </div>
                    <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>{r.v}</span>
                  </div>
                ))}
              </div>
              <div style={{ paddingTop: 14, display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: 12, color: "var(--text-mute)" }}>Max possible</div>
                <div className="display mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--gold)" }}>~622 pts</div>
              </div>
            </Card>

            <Card padding={22}>
              <h3 className="display" style={detH}><Icon.book /> Related tutorials</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                {[
                  "MEDDIC for SaaS discovery calls",
                  "Handling pricing objections without flinching",
                  "Differentiation patterns vs Datadog/New Relic",
                ].map(t => (
                  <a key={t} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, background: "var(--bg-2)", fontSize: 12.5, color: "var(--text-dim)", cursor: "pointer", border: "1px solid var(--border-soft)" }}>
                    <Icon.book />{t}<span style={{ marginLeft: "auto", color: "var(--text-mute)" }}>→</span>
                  </a>
                ))}
              </div>
            </Card>

            <Card padding={20} style={{ background: "color-mix(in oklch, var(--gold) 12%, var(--surface))", borderColor: "color-mix(in oklch, var(--gold) 30%, transparent)" }}>
              <Btn kind="primary" full size="lg" icon={<Icon.bolt />} onClick={() => go("conversation")}>Start challenge</Btn>
              <Btn kind="ghost" full size="md" style={{ marginTop: 10 }}>Save for later</Btn>
              <div style={{ fontSize: 11, color: "var(--text-mute)", textAlign: "center", marginTop: 12 }}>
                Once started, abandoning costs −25 pts.
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

const detH = { fontSize: 13, margin: "0 0 4px", fontWeight: 600, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: "0.08em", display: "inline-flex", alignItems: "center", gap: 8 };
const badgeBase2 = { padding: "4px 10px", borderRadius: 999, fontSize: 11.5, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 };

/* =====================================================================
   7. LEAD CONVERSATION (interactive chat)
===================================================================== */
const SCRIPTED_LEAD = [
  "I've got 5 minutes. What's this about — and please don't pitch me a 'platform'.",
  "Datadog's already eating my budget. Why are you different in a way that isn't marketing slop?",
  "Fair. What does onboarding look like? My SREs spent 3 weeks fighting our last tool.",
  "Send me a one-pager. I'll look when I look.",
  "...okay, Thursday 4pm IST. 20 minutes. Don't waste it.",
];

function ConversationScreen({ go }) {
  const [messages, setMessages] = useStateS2([
    { from: "lead", text: "Hi — got your note. Caught me on the way to a board call.", time: "10:02" },
  ]);
  const [input, setInput] = useStateS2("");
  const [leadIdx, setLeadIdx] = useStateS2(0);
  const [typing, setTyping] = useStateS2(false);
  const [time, setTime] = useStateS2(540); // seconds remaining
  const scrollRef = useRefS2(null);

  useEffectS2(() => {
    const id = setInterval(() => setTime(t => Math.max(0, t-1)), 1000);
    return () => clearInterval(id);
  }, []);

  useEffectS2(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { from: "me", text: input, time: fmtClock() };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const reply = SCRIPTED_LEAD[leadIdx] || "I'll review and revert. Got to go.";
      setMessages(m => [...m, { from: "lead", text: reply, time: fmtClock() }]);
      setLeadIdx(i => i + 1);
      setTyping(false);
      if (leadIdx >= SCRIPTED_LEAD.length - 1) {
        setTimeout(() => go("result"), 1200);
      }
    }, 1400);
  };

  const userMsgCount = messages.filter(m => m.from === "me").length;
  const totalMsgs = messages.length;

  return (
    <div data-screen-label="07 Lead Conversation" style={{ display: "grid", gridTemplateColumns: "1fr 320px", height: "100vh", background: "var(--bg)" }}>
      <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid var(--border-soft)" }}>
        {/* Top bar */}
        <div style={{ padding: "12px 22px", borderBottom: "1px solid var(--border-soft)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => go("challenge-detail")} style={{ background: "transparent", border: "none", color: "var(--text-mute)", cursor: "pointer" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m6 6-6-6 6-6"/></svg>
            </button>
            <Avatar name="Meera Krishnan" size={36} color="oklch(0.55 0.14 290)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Meera Krishnan <span style={{ fontWeight: 400, color: "var(--text-dim)" }}>· CTO, Vector Pay</span></div>
              <div style={{ fontSize: 11.5, color: "var(--emerald)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--emerald)" }} />Online
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <Pill label="Goal" value="Book Discovery Call" color="var(--gold)" />
            <Pill label="Messages" value={`${userMsgCount}/25`} color={userMsgCount > 18 ? "var(--d-hard)" : "var(--text)"} />
            <Pill label="Time" value={fmtMin(time)} color={time < 60 ? "var(--d-expert)" : "var(--text)"} mono />
            <Btn kind="danger" size="sm" onClick={() => go("result")}>End conversation</Btn>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "24px 80px", display: "flex", flexDirection: "column", gap: 14, background: "var(--bg)" }}>
          {messages.map((m, i) => (
            <ChatBubble key={i} m={m} />
          ))}
          {typing && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", background: "var(--surface)", borderRadius: "14px 14px 14px 4px", width: "fit-content", border: "1px solid var(--border-soft)" }}>
              {[0,1,2].map(i => (
                <span key={i} style={{ width: 6, height: 6, borderRadius: 999, background: "var(--text-mute)", animation: `typing 1.4s ${i*0.2}s infinite` }} />
              ))}
            </div>
          )}
        </div>

        {/* Action toolbar */}
        <div style={{ padding: "10px 22px", borderTop: "1px solid var(--border-soft)", background: "var(--bg-2)", display: "flex", gap: 8 }}>
          {[
            { icon: "📅", label: "Calendar link" },
            { icon: "📎", label: "Share doc" },
            { icon: "💰", label: "Pricing" },
            { icon: "💡", label: "Hint", note: "−10 pts" },
          ].map(a => (
            <button key={a.label} style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 10px", borderRadius: 7, background: "transparent",
              border: "1px solid var(--border)", color: "var(--text-dim)", fontSize: 12, fontWeight: 500,
            }}>
              <span>{a.icon}</span>{a.label}
              {a.note && <span style={{ fontSize: 9.5, color: "var(--d-expert)", marginLeft: 4 }}>{a.note}</span>}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: "12px 22px 22px", background: "var(--bg-2)" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 14px" }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Type your reply… (Enter to send · Shift+Enter for newline)"
              rows={2}
              style={{ flex: 1, resize: "none", fontSize: 14, color: "var(--text)" }}
            />
            <Btn kind="primary" icon={<Icon.send />} onClick={send}>Send</Btn>
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: "var(--text-mute)", display: "flex", justifyContent: "space-between" }}>
            <span>{input.length} chars · auto-saved</span>
            <span>↩ to send · use ⇧↩ for new line</span>
          </div>
        </div>
      </div>

      {/* Side panel */}
      <aside style={{ padding: "20px 22px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, fontWeight: 600 }}>Your goal</div>
          <Card padding={14} style={{ background: "color-mix(in oklch, var(--gold) 10%, transparent)", borderColor: "color-mix(in oklch, var(--gold) 25%, transparent)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gold)" }}>Book a 30-min discovery call</div>
            <div style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 4 }}>Specific time slot. Vague "let me think" doesn't count.</div>
          </Card>
        </div>

        <div>
          <div style={{ fontSize: 11, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, fontWeight: 600 }}>Lead refresher</div>
          <div style={{ fontSize: 12.5, color: "var(--text-dim)", lineHeight: 1.55 }}>
            CTO at <strong style={{ color: "var(--text)" }}>Vector Pay</strong>, 180 engineers, Series B fintech. Last tool flooded alerts; SOC2 audit in 8 weeks. Comparison-shops vs Datadog.
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, fontWeight: 600 }}>Live rubric tracking</div>
          {[
            { l: "Discovery", v: 3 },
            { l: "Objection handling", v: 2 },
            { l: "Value articulation", v: 3 },
            { l: "Conversational quality", v: 4 },
            { l: "Goal execution", v: 1 },
          ].map(d => (
            <div key={d.l} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 }}>
                <span style={{ color: "var(--text-dim)" }}>{d.l}</span>
                <span className="mono" style={{ color: "var(--text-mute)" }}>{d.v}/5</span>
              </div>
              <div style={{ display: "flex", gap: 3 }}>
                {[1,2,3,4,5].map(n => (
                  <div key={n} style={{ flex: 1, height: 5, borderRadius: 4, background: n <= d.v ? "var(--gold)" : "var(--surface-2)" }} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <Card padding={12} style={{ background: "var(--bg-2)" }}>
          <div style={{ fontSize: 11.5, color: "var(--text-dim)", lineHeight: 1.55 }}>
            <strong style={{ color: "var(--gold)" }}>💡 Tip:</strong> Meera responds to specific, data-backed claims. Avoid the word "revolutionary".
          </div>
        </Card>
      </aside>
    </div>
  );
}

function Pill({ label, value, color, mono }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <span style={{ fontSize: 9.5, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>{label}</span>
      <span className={mono ? "mono" : ""} style={{ fontSize: 14, fontWeight: 700, color: color || "var(--text)" }}>{value}</span>
    </div>
  );
}

function ChatBubble({ m }) {
  const isMe = m.from === "me";
  return (
    <div style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", animation: "fadeUp 0.25s ease" }}>
      <div style={{
        maxWidth: "62%",
        background: isMe ? "var(--gold)" : "var(--surface)",
        color: isMe ? "oklch(0.18 0.02 75)" : "var(--text)",
        padding: "10px 14px",
        borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
        border: isMe ? "none" : "1px solid var(--border-soft)",
        fontSize: 13.5, lineHeight: 1.45,
      }}>
        {m.text}
        <div style={{ fontSize: 10, color: isMe ? "oklch(0.18 0.02 75 / 0.6)" : "var(--text-mute)", marginTop: 4, textAlign: "right" }}>{m.time}</div>
      </div>
    </div>
  );
}

function fmtClock() {
  const d = new Date(); return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}
function fmtMin(s) { return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`; }

/* =====================================================================
   8. RESULT
===================================================================== */
function ResultScreen({ go }) {
  const dims = [
    { l: "Discovery & Listening", v: 4 },
    { l: "Objection Handling", v: 5 },
    { l: "Value Articulation", v: 4 },
    { l: "Conversational Quality", v: 5 },
    { l: "Goal Execution", v: 4 },
  ];
  const total = dims.reduce((s, d) => s + d.v, 0);
  const qMult = (total / 25);
  const baseScore = Math.round(400 * 1.2 * qMult);
  const speedBonus = 40;
  const firstTryBonus = 60;
  const final = baseScore + speedBonus + firstTryBonus;

  return (
    <AppShell go={go} view="challenges">
      <div data-screen-label="08 Challenge Result" style={{ padding: "32px 32px", maxWidth: 1100, margin: "0 auto" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", padding: "16px 0 36px", animation: "fadeUp 0.4s ease" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, background: "color-mix(in oklch, var(--emerald) 18%, transparent)", color: "var(--emerald)", fontSize: 12, fontWeight: 700, marginBottom: 18, border: "1px solid color-mix(in oklch, var(--emerald) 35%, transparent)" }}>
            <Icon.check /> GOAL ACHIEVED
          </div>
          <div className="display" style={{ fontSize: 96, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1, color: "var(--gold)" }}>
            +{final}
          </div>
          <div style={{ fontSize: 14, color: "var(--text-dim)", marginTop: 8 }}>points earned · pushes you from #34 → #27 weekly</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
          {/* Breakdown */}
          <Card padding={24}>
            <h3 className="display" style={{ fontSize: 16, margin: "0 0 16px", fontWeight: 600 }}>Score breakdown</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13.5 }}>
              {[
                { l: "Base (Hard)", v: 400 },
                { l: "× Goal multiplier (Book Call)", v: "1.2x" },
                { l: "× Quality multiplier", v: qMult.toFixed(2) + "x" },
                { l: "= Base score", v: baseScore, em: true },
                { l: "+ Speed bonus (12/25 msgs)", v: "+" + speedBonus },
                { l: "+ First-try bonus", v: "+" + firstTryBonus },
                { l: "− Penalties", v: "0" },
              ].map(r => (
                <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed var(--border-soft)" }}>
                  <span style={{ color: r.em ? "var(--text)" : "var(--text-dim)", fontWeight: r.em ? 700 : 400 }}>{r.l}</span>
                  <span className="mono" style={{ fontWeight: 700, color: r.em ? "var(--gold)" : "var(--text)" }}>{r.v}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10 }}>
                <span style={{ fontWeight: 700 }}>Final score</span>
                <span className="display mono" style={{ fontWeight: 700, color: "var(--gold)", fontSize: 22 }}>{final}</span>
              </div>
            </div>
          </Card>

          {/* Radar */}
          <Card padding={24}>
            <h3 className="display" style={{ fontSize: 16, margin: "0 0 16px", fontWeight: 600 }}>Quality radar</h3>
            <RubricRadar dims={dims} />
          </Card>
        </div>

        {/* AI feedback */}
        <Card padding={24}>
          <h3 className="display" style={{ fontSize: 16, margin: "0 0 18px", fontWeight: 600 }}>AI coach feedback</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--emerald)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>What went well</div>
              {[
                "Strong open: led with a specific pain (alert fatigue) instead of feature talk.",
                "Handled the 'why not Datadog' objection with a concrete data point (log volume cost), no disparagement.",
                "Proposed two specific time slots — exactly what Meera responds to.",
              ].map(t => (
                <div key={t} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5 }}>
                  <span style={{ color: "var(--emerald)", marginTop: 2 }}><Icon.check /></span>{t}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--d-hard)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Gaps to close</div>
              {[
                "Missed an opening to dig into the SOC2 timeline — that's a procurement hook.",
                "Used 'platform' twice. Meera explicitly flagged this. Watch for prospect-allergic words.",
                "Didn't ask about her team's existing tool budget cycle — affects deal sizing later.",
              ].map(t => (
                <div key={t} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5 }}>
                  <span style={{ color: "var(--d-hard)", marginTop: 2 }}>→</span>{t}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 28 }}>
          <Btn kind="primary" size="lg" icon={<Icon.bolt />} onClick={() => go("challenges")}>Next recommended</Btn>
          <Btn kind="secondary" size="lg" onClick={() => go("dashboard")}>Back to dashboard</Btn>
          <Btn kind="ghost" size="lg" icon={<Icon.linkedin />}>Share on LinkedIn</Btn>
        </div>
      </div>
    </AppShell>
  );
}

function RubricRadar({ dims }) {
  const cx = 130, cy = 130, r = 90;
  const n = dims.length;
  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i, v) => [cx + Math.cos(angle(i)) * r * (v/5), cy + Math.sin(angle(i)) * r * (v/5)];
  const poly = dims.map((d, i) => pt(i, d.v).join(",")).join(" ");
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <svg width="260" height="260" viewBox="0 0 260 260">
        {[1,2,3,4,5].map(lvl => (
          <polygon key={lvl}
            points={dims.map((d, i) => pt(i, lvl).join(",")).join(" ")}
            fill="none" stroke="var(--border-soft)" strokeWidth="0.8" />
        ))}
        {dims.map((d, i) => {
          const [x, y] = pt(i, 5);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border-soft)" strokeWidth="0.8" />;
        })}
        <polygon points={poly} fill="color-mix(in oklch, var(--gold) 30%, transparent)" stroke="var(--gold)" strokeWidth="2" />
        {dims.map((d, i) => {
          const [x, y] = pt(i, d.v);
          return <circle key={i} cx={x} cy={y} r="4" fill="var(--gold)" />;
        })}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {dims.map(d => (
          <div key={d.l} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--text-dim)" }}>
            <span>{d.l}</span>
            <span className="mono" style={{ color: "var(--gold)", fontWeight: 700 }}>{d.v}/5</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =====================================================================
   9. LEADERBOARD
===================================================================== */
function LeaderboardScreen({ go }) {
  const [period, setPeriod] = useStateS2("Weekly");
  const periods = ["Daily", "Weekly", "Monthly", "All-time"];

  const top3 = [
    { r: 2, name: "Priya Iyer", city: "Mumbai", rank: "Master", pts: 36110 },
    { r: 1, name: "Aarav Sharma", city: "Bangalore", rank: "Master", pts: 38420 },
    { r: 3, name: "Karan Mehta", city: "Pune", rank: "Diamond", pts: 28940 },
  ];
  const rest = Array.from({ length: 12 }, (_, i) => ({
    r: i + 4,
    name: ["Sneha Reddy", "Rohan Gupta", "Anjali Nair", "Vivaan Kapoor", "Tanvi Joshi", "Vikram Singh", "You (Shashank)", "Arjun Pal", "Pooja Verma", "Nikhil Rao", "Aditi Bose", "Ishaan Roy"][i],
    city: ["Hyderabad", "Delhi NCR", "Bangalore", "Mumbai", "Pune", "Bangalore", "Bangalore", "Delhi NCR", "Chennai", "Bangalore", "Kolkata", "Mumbai"][i],
    rank: ["Diamond", "Platinum", "Platinum", "Platinum", "Gold", "Gold", "Gold", "Gold", "Gold", "Gold", "Gold", "Silver"][i],
    pts: [22180, 17850, 14210, 11340, 8612, 8488, 8376, 8201, 8095, 7842, 7560, 7320][i],
    you: i === 6,
  }));

  return (
    <AppShell go={go} view="leaderboard">
      <div data-screen-label="09 Leaderboard" style={{ padding: "28px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
          <div>
            <h1 className="display" style={{ fontSize: 32, margin: 0, fontWeight: 700 }}>Leaderboard</h1>
            <p style={{ color: "var(--text-mute)", fontSize: 13, margin: "4px 0 0" }}>IT Sales · India · weekly resets every Monday 00:00 IST</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <select style={selectStyle}><option>All categories</option><option>IT Sales</option></select>
            <select style={selectStyle}><option>All India</option><option>Bangalore</option><option>Mumbai</option></select>
          </div>
        </div>

        {/* Period tabs */}
        <div style={{ display: "inline-flex", background: "var(--bg-2)", padding: 4, borderRadius: 10, gap: 4, marginBottom: 24, border: "1px solid var(--border)" }}>
          {periods.map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: "8px 16px", borderRadius: 7, fontSize: 13, fontWeight: 600,
              background: period === p ? "var(--gold)" : "transparent",
              color: period === p ? "oklch(0.18 0.02 75)" : "var(--text-dim)", border: "none",
            }}>{p}</button>
          ))}
        </div>

        {/* Podium */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: 16, alignItems: "end", marginBottom: 24 }}>
          {top3.map(p => (
            <PodiumCard key={p.r} {...p} height={p.r === 1 ? 240 : (p.r === 2 ? 200 : 180)} />
          ))}
        </div>

        {/* Table */}
        <Card padding={0}>
          <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 130px 100px 130px 80px", padding: "12px 18px", fontSize: 11, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, borderBottom: "1px solid var(--border-soft)" }}>
            <div>Rank</div><div>Salesperson</div><div>City</div><div>Tier</div><div>Points</div><div>Trend</div>
          </div>
          {rest.map(row => (
            <div key={row.r} style={{
              display: "grid", gridTemplateColumns: "60px 1fr 130px 100px 130px 80px",
              padding: "12px 18px", alignItems: "center",
              borderBottom: "1px solid var(--border-soft)",
              background: row.you ? "color-mix(in oklch, var(--gold) 10%, transparent)" : "transparent",
            }}>
              <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: row.you ? "var(--gold)" : "var(--text-mute)" }}>#{row.r}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar name={row.name} size={32} />
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: row.you ? 700 : 500, color: row.you ? "var(--gold)" : "var(--text)" }}>{row.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-mute)" }}>{row.r === 11 ? "Open to work" : ""}</div>
                </div>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-dim)" }}>{row.city}</div>
              <RankBadge rank={row.rank} size={18} showLabel />
              <div className="mono" style={{ fontSize: 13.5, fontWeight: 600 }}>{row.pts.toLocaleString()}</div>
              <div className="mono" style={{ fontSize: 11.5, color: row.r % 4 === 0 ? "var(--d-expert)" : "var(--emerald)" }}>
                {row.r % 4 === 0 ? "↓ -2" : "↑ +" + (3 + row.r % 5)}
              </div>
            </div>
          ))}
        </Card>

        {/* Sticky bottom (your row) — illustrative */}
        <div style={{ position: "sticky", bottom: 16, marginTop: 16 }}>
          <Card padding={14} style={{ display: "grid", gridTemplateColumns: "60px 1fr 130px 100px 130px 80px", alignItems: "center", borderColor: "var(--gold)", background: "color-mix(in oklch, var(--gold) 14%, var(--surface))" }}>
            <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>#27</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar name="Shashank Khare" size={32} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>You · Shashank Khare</div>
                <div style={{ fontSize: 11, color: "var(--text-dim)" }}>624 pts to Platinum</div>
              </div>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--text-dim)" }}>Bangalore</div>
            <RankBadge rank="Gold" size={18} showLabel />
            <div className="mono" style={{ fontSize: 13.5, fontWeight: 700 }}>8,376</div>
            <div className="mono" style={{ fontSize: 11.5, color: "var(--emerald)" }}>↑ +7</div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

const selectStyle = { padding: "8px 12px", borderRadius: 8, background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 12.5 };

function PodiumCard({ r, name, city, rank, pts, height }) {
  const colors = { 1: "var(--r-gold)", 2: "var(--r-silver)", 3: "var(--r-bronze)" };
  const medal = { 1: "🥇", 2: "🥈", 3: "🥉" };
  return (
    <Card padding={20} style={{ borderColor: `color-mix(in oklch, ${colors[r]} 40%, var(--border))`, background: `linear-gradient(180deg, color-mix(in oklch, ${colors[r]} 12%, var(--surface)) 0%, var(--surface) 70%)`, textAlign: "center", height, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 12 }}>
      <div style={{ fontSize: 32 }}>{medal[r]}</div>
      <Avatar name={name} size={56} />
      <div>
        <div className="display" style={{ fontSize: 17, fontWeight: 700 }}>{name}</div>
        <div style={{ fontSize: 11.5, color: "var(--text-mute)" }}>{city}</div>
      </div>
      <RankBadge rank={rank} size={22} showLabel />
      <div className="display mono" style={{ fontSize: 22, fontWeight: 700, color: colors[r] }}>{pts.toLocaleString()}</div>
    </Card>
  );
}

/* =====================================================================
   10. PROFILE
===================================================================== */
function ProfileScreen({ go }) {
  return (
    <AppShell go={go} view="profile">
      <div data-screen-label="10 Profile">
        {/* Cover band */}
        <div style={{ height: 140, background: "linear-gradient(135deg, color-mix(in oklch, var(--gold) 30%, var(--bg-2)) 0%, var(--bg-2) 100%)", position: "relative" }}>
          <div className="stripe-ph" style={{ position: "absolute", inset: 0, opacity: 0.4 }} />
        </div>
        <div style={{ padding: "0 32px 32px" }}>
          <div style={{ display: "flex", gap: 24, alignItems: "flex-end", marginTop: -56 }}>
            <div style={{ position: "relative" }}>
              <Avatar name="Shashank Khare" size={120} />
              <div style={{ position: "absolute", bottom: -4, right: -4 }}>
                <RankBadge rank="Gold" size={44} />
              </div>
            </div>
            <div style={{ flex: 1, paddingBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <h1 className="display" style={{ fontSize: 30, margin: 0, fontWeight: 700 }}>Shashank Khare</h1>
                <span style={{ padding: "3px 8px", borderRadius: 999, background: "color-mix(in oklch, var(--emerald) 18%, transparent)", color: "var(--emerald)", fontSize: 11, fontWeight: 700, border: "1px solid color-mix(in oklch, var(--emerald) 35%, transparent)" }}>● OPEN TO WORK</span>
              </div>
              <div style={{ color: "var(--text-dim)", fontSize: 13.5 }}>
                <strong style={{ color: "var(--r-gold)" }}>Gold tier</strong> · Bangalore, India · 4 years sales experience · IT Sales / SaaS
              </div>
              <div className="mono" style={{ fontSize: 11.5, color: "var(--text-mute)", marginTop: 6 }}>salesarena.com/u/shashank</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn kind="secondary" size="sm">Edit profile</Btn>
              <Btn kind="primary" size="sm">Share profile</Btn>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginTop: 28, padding: "20px 0", borderTop: "1px solid var(--border-soft)", borderBottom: "1px solid var(--border-soft)" }}>
            <Stat label="Total points" value="8,376" accent="var(--gold)" />
            <Stat label="Global rank" value="#27" sub="of 2,481" />
            <Stat label="Challenges" value="48" sub="completed" />
            <Stat label="Win rate" value="73%" sub="goal achieved" accent="var(--emerald)" />
            <Stat label="Best category" value="Discovery" sub="avg 4.3/5" />
          </div>

          {/* Activity heatmap — full width */}
          <Card padding={22} style={{ marginTop: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
              <div>
                <h3 className="display" style={{ fontSize: 16, margin: 0, fontWeight: 600 }}>Challenge activity</h3>
                <p style={{ fontSize: 12.5, color: "var(--text-mute)", margin: "4px 0 0" }}>
                  <span style={{ color: "var(--text)", fontWeight: 600 }}>148 challenges</span> in the last 26 weeks · public profile shows last 12 weeks
                </p>
              </div>
              <div style={{ display: "flex", gap: 24 }}>
                <div>
                  <div className="display mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--gold)" }}>5</div>
                  <div style={{ fontSize: 10.5, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Current streak (days)</div>
                </div>
                <div>
                  <div className="display mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>12</div>
                  <div style={{ fontSize: 10.5, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Longest streak</div>
                </div>
                <div>
                  <div className="display mono" style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>26%</div>
                  <div style={{ fontSize: 10.5, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Days active</div>
                </div>
              </div>
            </div>
            <ActivityHeatmap weeks={26} seed={101} />
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18, marginTop: 22 }}>
            {/* Performance + activity */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <Card padding={22}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <h3 className="display" style={{ fontSize: 16, margin: 0, fontWeight: 600 }}>Performance by goal type</h3>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["Overall", "Category", "Goal"].map((t, i) => (
                      <button key={t} style={{ padding: "5px 11px", borderRadius: 6, background: i === 2 ? "var(--surface-2)" : "transparent", border: "1px solid var(--border-soft)", color: "var(--text)", fontSize: 11.5, fontWeight: 500 }}>{t}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { l: "Qualify Lead", v: 84, count: 16 },
                    { l: "Book Discovery Call", v: 71, count: 14 },
                    { l: "Send Proposal", v: 65, count: 9 },
                    { l: "Reach Decision Maker", v: 48, count: 5 },
                    { l: "Close the Deal", v: 33, count: 3 },
                    { l: "Win-back", v: 50, count: 1 },
                  ].map(g => (
                    <div key={g.l}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12.5 }}>
                        <span>{g.l} <span style={{ color: "var(--text-mute)" }}>({g.count} attempts)</span></span>
                        <span className="mono" style={{ color: "var(--gold)", fontWeight: 700 }}>{g.v}%</span>
                      </div>
                      <div style={{ height: 7, borderRadius: 999, background: "var(--bg-2)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: g.v + "%", background: "linear-gradient(90deg, color-mix(in oklch, var(--gold) 60%, var(--d-hard) 40%), var(--gold))", borderRadius: 999 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card padding={22}>
                <h3 className="display" style={{ fontSize: 16, margin: "0 0 14px", fontWeight: 600 }}>Recent challenges</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { t: "The Skeptical CTO", level: "Hard", s: 522, ach: true, when: "2h ago" },
                    { t: "Cold call → demo", level: "Medium", s: 312, ach: true, when: "1d ago" },
                    { t: "Pricing pushback", level: "Medium", s: 184, ach: false, when: "3d ago" },
                    { t: "Gatekeeper bypass", level: "Hard", s: 410, ach: true, when: "4d ago" },
                    { t: "Cybersecurity to non-tech", level: "Hard", s: 0, ach: false, when: "5d ago" },
                  ].map((c, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto auto", gap: 12, alignItems: "center", padding: "8px 10px", borderRadius: 8, background: "var(--bg-2)" }}>
                      <DifficultyTag level={c.level} size="sm" />
                      <span style={{ fontSize: 12.5, fontWeight: 500 }}>{c.t}</span>
                      <span style={{ fontSize: 11, color: c.ach ? "var(--emerald)" : "var(--d-expert)" }}>{c.ach ? "✓ Goal" : "✗ Missed"}</span>
                      <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: c.ach ? "var(--gold)" : "var(--text-mute)" }}>{c.s > 0 ? "+" + c.s : "0"}</span>
                      <span style={{ fontSize: 11, color: "var(--text-mute)" }}>{c.when}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Badges */}
              <Card padding={22}>
                <h3 className="display" style={{ fontSize: 16, margin: "0 0 14px", fontWeight: 600 }}>Badges · 8 earned</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                  {[
                    { e: "🎯", n: "First Goal", on: true },
                    { e: "🛡️", n: "Objection Pro", on: true },
                    { e: "⚡", n: "Speed Demon", on: true },
                    { e: "🔥", n: "5-day Streak", on: true },
                    { e: "💎", n: "Diamond", on: false },
                    { e: "👑", n: "Top 10", on: false },
                    { e: "🤝", n: "First Hire", on: false },
                    { e: "🚀", n: "Founding", on: true },
                  ].map(b => (
                    <div key={b.n} style={{
                      padding: 10, borderRadius: 10,
                      background: b.on ? "color-mix(in oklch, var(--gold) 10%, var(--bg-2))" : "var(--bg-2)",
                      border: `1px solid ${b.on ? "color-mix(in oklch, var(--gold) 30%, transparent)" : "var(--border-soft)"}`,
                      textAlign: "center", opacity: b.on ? 1 : 0.5,
                    }}>
                      <div style={{ fontSize: 22 }}>{b.e}</div>
                      <div style={{ fontSize: 10.5, color: b.on ? "var(--text)" : "var(--text-mute)", marginTop: 4, fontWeight: 500 }}>{b.n}</div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Career / open to work */}
              <Card padding={22}>
                <h3 className="display" style={{ fontSize: 16, margin: "0 0 14px", fontWeight: 600 }}>Career preferences</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 12.5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-mute)" }}>Open to work</span>
                    <span style={{ color: "var(--emerald)", fontWeight: 600 }}>● Yes</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-mute)" }}>Preferred locations</span>
                    <span>Bangalore, Remote</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-mute)" }}>Expected CTC</span>
                    <span>₹16-22 LPA</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-mute)" }}>Notice period</span>
                    <span>30 days</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-mute)" }}>Resume</span>
                    <a style={{ color: "var(--gold)", textDecoration: "underline" }}>shashank_resume_v3.pdf</a>
                  </div>
                </div>
              </Card>

              {/* Recent profile viewers */}
              <Card padding={22}>
                <h3 className="display" style={{ fontSize: 16, margin: "0 0 14px", fontWeight: 600 }}>Companies viewing you</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { co: "Razorpay", role: "Senior AE — IT Sales", time: "5h ago" },
                    { co: "Zoho", role: "SDR Manager", time: "1d ago" },
                    { co: "Freshworks", role: "Account Executive", time: "2d ago" },
                  ].map(v => (
                    <div key={v.co} style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", borderRadius: 8, background: "var(--bg-2)" }}>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 600 }}>{v.co}</div>
                        <div style={{ fontSize: 11, color: "var(--text-mute)" }}>{v.role}</div>
                      </div>
                      <span style={{ fontSize: 10.5, color: "var(--text-mute)" }}>{v.time}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/* =====================================================================
   11. JOBS
===================================================================== */
function JobsScreen({ go }) {
  const jobs = [
    { id: 1, co: "Razorpay", logo: "RP", role: "Senior Account Executive — IT Sales", loc: "Bangalore", type: "Full-time", ctc: "₹18-24 LPA + 30% OTE", minRank: "Gold", posted: "2d", featured: true, applicants: 47, status: null },
    { id: 2, co: "Zoho", logo: "ZH", role: "SDR Lead — Mid-Market SaaS", loc: "Chennai / Remote", type: "Full-time", ctc: "₹14-18 LPA + commissions", minRank: "Silver", posted: "4d", applicants: 124, status: "Applied" },
    { id: 3, co: "Freshworks", logo: "FW", role: "Account Executive — Enterprise IT", loc: "Bangalore", type: "Full-time", ctc: "₹22-32 LPA + OTE", minRank: "Gold", posted: "1w", applicants: 89, status: null },
    { id: 4, co: "Postman", logo: "PM", role: "Inside Sales Representative", loc: "Remote (India)", type: "Full-time", ctc: "₹12-16 LPA", minRank: "Bronze", posted: "3d", applicants: 211, status: "Shortlisted" },
    { id: 5, co: "Atlan", logo: "AT", role: "Sales Development Rep — Data", loc: "Delhi NCR / Remote", type: "Full-time", ctc: "₹10-14 LPA", minRank: "Silver", posted: "1w", applicants: 156, status: null },
    { id: 6, co: "Mindtickle", logo: "MT", role: "Senior Enterprise AE", loc: "Pune", type: "Full-time", ctc: "₹28-38 LPA + OTE", minRank: "Platinum", posted: "2w", applicants: 34, locked: true, status: null },
  ];

  return (
    <AppShell go={go} view="jobs">
      <div data-screen-label="11 Jobs" style={{ padding: "28px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22 }}>
          <div>
            <h1 className="display" style={{ fontSize: 32, margin: 0, fontWeight: 700 }}>Jobs for you</h1>
            <p style={{ color: "var(--text-mute)", fontSize: 13, margin: "4px 0 0" }}>47 active listings · matched to your <RankBadge rank="Gold" size={12} /> Gold tier & IT Sales specialization</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn kind="ghost" size="sm" icon={<Icon.filter />}>Filters</Btn>
            <Btn kind="ghost" size="sm">Saved (4)</Btn>
            <Btn kind="ghost" size="sm">Applications (3)</Btn>
          </div>
        </div>

        {/* Status pipeline */}
        <Card padding={18} style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 12, color: "var(--text-mute)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Your application pipeline</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
            {[
              { l: "Applied", v: 3, c: "var(--cool)" },
              { l: "Viewed", v: 7, c: "var(--text-dim)" },
              { l: "Shortlisted", v: 1, c: "var(--gold)" },
              { l: "Interview", v: 0, c: "var(--text-mute)" },
              { l: "Offer", v: 0, c: "var(--emerald)" },
            ].map(s => (
              <div key={s.l} style={{ padding: 12, borderRadius: 8, background: "var(--bg-2)", borderLeft: `3px solid ${s.c}` }}>
                <div className="display mono" style={{ fontSize: 22, fontWeight: 700, color: s.c }}>{s.v}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-dim)" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Job list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {jobs.map(j => (
            <Card key={j.id} padding={20} hover>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 18, alignItems: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Space Grotesk", fontWeight: 700, fontSize: 18, color: "var(--text)", border: "1px solid var(--border-soft)" }}>
                  {j.logo}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <h3 className="display" style={{ fontSize: 17, margin: 0, fontWeight: 600 }}>{j.role}</h3>
                    {j.featured && <span style={{ ...badgeBase2, color: "var(--gold)", background: "color-mix(in oklch, var(--gold) 14%, transparent)", border: "1px solid color-mix(in oklch, var(--gold) 35%, transparent)" }}>★ Featured</span>}
                    {j.status && <span style={{ ...badgeBase2, color: j.status === "Shortlisted" ? "var(--gold)" : "var(--cool)", background: `color-mix(in oklch, ${j.status === "Shortlisted" ? "var(--gold)" : "var(--cool)"} 14%, transparent)`, border: `1px solid color-mix(in oklch, ${j.status === "Shortlisted" ? "var(--gold)" : "var(--cool)"} 35%, transparent)` }}>{j.status}</span>}
                  </div>
                  <div style={{ display: "flex", gap: 14, fontSize: 12.5, color: "var(--text-dim)", flexWrap: "wrap", marginBottom: 8 }}>
                    <span><strong style={{ color: "var(--text)" }}>{j.co}</strong></span>
                    <span>• {j.loc}</span>
                    <span>• {j.type}</span>
                    <span>• Posted {j.posted} ago</span>
                    <span>• {j.applicants} applicants</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ ...badgeBase2, color: "var(--emerald)", background: "color-mix(in oklch, var(--emerald) 12%, transparent)", border: "1px solid color-mix(in oklch, var(--emerald) 30%, transparent)" }}>{j.ctc}</span>
                    <span style={{ ...badgeBase2, color: "var(--text-dim)", background: "var(--bg-2)", border: "1px solid var(--border-soft)" }}>
                      <RankBadge rank={j.minRank} size={12} /> {j.minRank}+ required
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                  {j.locked ? (
                    <>
                      <span style={{ fontSize: 11, color: "var(--text-mute)" }}>🔒 Reach Platinum to unlock</span>
                      <Btn kind="ghost" size="sm" style={{ opacity: 0.6 }}>Locked</Btn>
                    </>
                  ) : j.status ? (
                    <Btn kind="secondary" size="sm">View status</Btn>
                  ) : (
                    <>
                      <Btn kind="primary" size="sm" icon={<Icon.arrow />}>Apply 1-click</Btn>
                      <Btn kind="ghost" size="sm">Save</Btn>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

Object.assign(window, { ChallengesScreen, ChallengeDetailScreen, ConversationScreen, ResultScreen, LeaderboardScreen, ProfileScreen, JobsScreen });
