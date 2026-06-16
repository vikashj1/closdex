'use client';

import { useRequireAuth } from '@/lib/auth';
import { useAuth } from '@/lib/auth';

// Profile — Vikash dashboard redesign 2026-06-16.
// Visual port of the new HTML. Data is the static demo shipped in the
// prototype; the real-data wiring stays on the previous logic and gets layered
// in once Vikash signs off on the visuals.

// Seeded random heatmap data so the visual matches the prototype exactly. A
// later pass should swap this for real attempt-density data from the API.
function buildHeatmapWeeks() {
  const ramp = ['#EFEFF3', '#D8D4FB', '#B0A8F6', '#7E72F1', '#5B4BF5'];
  let s = 1779;
  const rnd = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  const weeks: { days: { bg: string }[] }[] = [];
  for (let w = 0; w < 26; w++) {
    const days: { bg: string }[] = [];
    for (let d = 0; d < 7; d++) {
      const r = rnd();
      const lvl = r < 0.46 ? 0 : r < 0.68 ? 1 : r < 0.84 ? 2 : r < 0.94 ? 3 : 4;
      days.push({ bg: ramp[lvl] });
    }
    weeks.push({ days });
  }
  return weeks;
}

export default function ProfilePage() {
  useRequireAuth('SALESPERSON');
  const { user } = useAuth();
  const userName = user?.name ?? 'there';
  const weeks = buildHeatmapWeeks();
  return (
    <div>
    
          <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "34px 40px 72px" }}>
    
            
            <div style={{ display: "flex", alignItems: "flex-start", gap: "22px", flexWrap: "wrap", marginBottom: "30px" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#0B0B0F", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "600", fontSize: "32px", flexShrink: "0" }}>t</div>
              <div style={{ flex: "1", minWidth: "0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <h1 style={{ margin: "0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "30px", letterSpacing: "-0.03em", color: "#0B0B0F" }}>test user</h1>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 11px", borderRadius: "100px", background: "rgba(31,138,91,0.1)", color: "#1F8A5B", fontFamily: "'Space Mono',monospace", fontSize: "10px", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#1F8A5B" }}></span>Open to work</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "9px", fontSize: "14px", color: "#7A7A86", marginBottom: "12px" }}><span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#8A6A1A", fontWeight: "600" }}><span style={{ width: "11px", height: "13px", background: "#F5A524", display: "inline-block", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)" }}></span>Bronze tier</span><span style={{ color: "#D8D8E0" }}>·</span><span>0 yrs exp</span><span style={{ color: "#D8D8E0" }}>·</span><span>IT Sales</span></div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "9px", padding: "7px 9px 7px 13px", border: "1px solid #E7E7EC", borderRadius: "10px", background: "#FAFAF8" }}>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "12.5px", color: "#3A3A44" }}>closdex.com/u/test-user-9yjj</span>
                  <button style={{ width: "28px", height: "28px", borderRadius: "7px", border: "none", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 0 0 1px #E7E7EC" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5B4BF5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg></button>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "11px", flexShrink: "0" }}>
                <button style={{ height: "40px", padding: "0 16px", border: "1px solid #E7E7EC", borderRadius: "10px", background: "#fff", fontFamily: "Inter,sans-serif", fontSize: "13.5px", fontWeight: "600", color: "#3A3A44", cursor: "pointer" }}>Remove open to work</button>
                <button style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "40px", padding: "0 18px", border: "none", borderRadius: "10px", background: "#0B0B0F", color: "#fff", fontFamily: "Inter,sans-serif", fontSize: "13.5px", fontWeight: "600", cursor: "pointer" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" x2="12" y1="2" y2="15" /></svg>Share profile</button>
              </div>
            </div>
    
            
            <section style={{ display: "flex", alignItems: "stretch", gap: "30px", flexWrap: "wrap", padding: "24px 0 28px", borderTop: "1px solid #E7E7EC", borderBottom: "1px solid #E7E7EC", marginBottom: "42px" }}>
    
                <div style={{ display: "flex", alignItems: "stretch", gap: "30px" }}>
                  
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      
                      <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "38px", letterSpacing: "-0.03em", lineHeight: "0.95", color: "#F5A524" }}>1,397</span>
                    </div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "10px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A9AA4", marginTop: "10px" }}>Total points</div>
                  </div>
                </div>
    
                <div style={{ display: "flex", alignItems: "stretch", gap: "30px" }}>
                  <div style={{ width: "1px", background: "#E7E7EC" }}></div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "15px", height: "18px", background: "#F5A524", display: "inline-block", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)" }}></span>
                      <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "38px", letterSpacing: "-0.03em", lineHeight: "0.95", color: "#F5A524" }}>Bronze</span>
                    </div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "10px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A9AA4", marginTop: "10px" }}>Global rank</div>
                  </div>
                </div>
    
                <div style={{ display: "flex", alignItems: "stretch", gap: "30px" }}>
                  <div style={{ width: "1px", background: "#E7E7EC" }}></div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      
                      <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "38px", letterSpacing: "-0.03em", lineHeight: "0.95", color: "#0B0B0F" }}>5</span>
                    </div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "10px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A9AA4", marginTop: "10px" }}>Completed</div>
                  </div>
                </div>
    
                <div style={{ display: "flex", alignItems: "stretch", gap: "30px" }}>
                  <div style={{ width: "1px", background: "#E7E7EC" }}></div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      
                      <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "38px", letterSpacing: "-0.03em", lineHeight: "0.95", color: "#0B0B0F" }}>100%</span>
                    </div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "10px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A9AA4", marginTop: "10px" }}>Goal achieved</div>
                  </div>
                </div>
    
                <div style={{ display: "flex", alignItems: "stretch", gap: "30px" }}>
                  <div style={{ width: "1px", background: "#E7E7EC" }}></div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      
                      <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "38px", letterSpacing: "-0.03em", lineHeight: "0.95", color: "#0B0B0F" }}>103</span>
                    </div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "10px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A9AA4", marginTop: "10px" }}>Until Silver</div>
                  </div>
                </div>
            </section>
    
            
            <section style={{ marginBottom: "46px" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "18px" }}>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", fontWeight: "700", letterSpacing: "0.14em", textTransform: "uppercase", color: "#7A7A86" }}>Challenge activity</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9AA4" }}>8 attempts total · last 26 weeks</div>
              </div>
              <div style={{ display: "flex", gap: "3px" }}>
                {(weeks).map((week, _idx) => (<>
                  <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                    {(week.days).map((d, _idx) => (<>
                      <div style={{ width: "13px", height: "13px", borderRadius: "3px", background: `${d.bg}` }}></div>
                    </>))}
                  </div>
                </>))}
              </div>
            </section>
    
            
            <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: "44px", alignItems: "start" }}>
              <section>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", fontWeight: "700", letterSpacing: "0.14em", textTransform: "uppercase", color: "#7A7A86", marginBottom: "4px" }}>Recent challenges</div>
    
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "15px 4px", borderTop: "1px solid #E7E7EC" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "'Space Mono',monospace", fontSize: "10px", fontWeight: "700", letterSpacing: "0.05em", textTransform: "uppercase", color: "#3A3A44", width: "74px", flexShrink: "0" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#A93F37", display: "inline-block", flexShrink: "0" }}></span>Expert</span>
                    <div style={{ flex: "1", minWidth: "0" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#0B0B0F", marginBottom: "4px" }}>The Committee</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#7A7A86" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1F8A5B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Book discovery call</div>
                    </div>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "13px", fontWeight: "700", color: "#F5A524", flexShrink: "0" }}>+800</span>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", color: "#9A9AA4", flexShrink: "0", width: "60px", textAlign: "right" }}>2d ago</span>
                  </div>
    
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "15px 4px", borderTop: "1px solid #E7E7EC" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "'Space Mono',monospace", fontSize: "10px", fontWeight: "700", letterSpacing: "0.05em", textTransform: "uppercase", color: "#3A3A44", width: "74px", flexShrink: "0" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#A93F37", display: "inline-block", flexShrink: "0" }}></span>Expert</span>
                    <div style={{ flex: "1", minWidth: "0" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#0B0B0F", marginBottom: "4px" }}>Procurement Maze</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#7A7A86" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1F8A5B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Send proposal</div>
                    </div>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "13px", fontWeight: "700", color: "#F5A524", flexShrink: "0" }}>+761</span>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", color: "#9A9AA4", flexShrink: "0", width: "60px", textAlign: "right" }}>5d ago</span>
                  </div>
    
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "15px 4px", borderTop: "1px solid #E7E7EC" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "'Space Mono',monospace", fontSize: "10px", fontWeight: "700", letterSpacing: "0.05em", textTransform: "uppercase", color: "#3A3A44", width: "74px", flexShrink: "0" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#C2604A", display: "inline-block", flexShrink: "0" }}></span>Hard</span>
                    <div style={{ flex: "1", minWidth: "0" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#0B0B0F", marginBottom: "4px" }}>The Skeptical CTO</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#7A7A86" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1F8A5B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Send proposal</div>
                    </div>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "13px", fontWeight: "700", color: "#F5A524", flexShrink: "0" }}>+420</span>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", color: "#9A9AA4", flexShrink: "0", width: "60px", textAlign: "right" }}>7d ago</span>
                  </div>
    
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "15px 4px", borderTop: "1px solid #E7E7EC" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "'Space Mono',monospace", fontSize: "10px", fontWeight: "700", letterSpacing: "0.05em", textTransform: "uppercase", color: "#3A3A44", width: "74px", flexShrink: "0" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#C2604A", display: "inline-block", flexShrink: "0" }}></span>Hard</span>
                    <div style={{ flex: "1", minWidth: "0" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#0B0B0F", marginBottom: "4px" }}>The Gatekeeper</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#7A7A86" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1F8A5B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Reach decision-maker</div>
                    </div>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "13px", fontWeight: "700", color: "#F5A524", flexShrink: "0" }}>+380</span>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", color: "#9A9AA4", flexShrink: "0", width: "60px", textAlign: "right" }}>11d ago</span>
                  </div>
    
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "15px 4px", borderTop: "1px solid #E7E7EC", borderBottom: "1px solid #E7E7EC" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "'Space Mono',monospace", fontSize: "10px", fontWeight: "700", letterSpacing: "0.05em", textTransform: "uppercase", color: "#3A3A44", width: "74px", flexShrink: "0" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6D9A4E", display: "inline-block", flexShrink: "0" }}></span>Easy</span>
                    <div style={{ flex: "1", minWidth: "0" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#0B0B0F", marginBottom: "4px" }}>Cold Open</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#7A7A86" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1F8A5B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Open the call</div>
                    </div>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "13px", fontWeight: "700", color: "#F5A524", flexShrink: "0" }}>+150</span>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", color: "#9A9AA4", flexShrink: "0", width: "60px", textAlign: "right" }}>14d ago</span>
                  </div>
              </section>
    
              <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
                <section>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", fontWeight: "700", letterSpacing: "0.14em", textTransform: "uppercase", color: "#7A7A86", marginBottom: "18px" }}>Badges</div>
                  <div style={{ borderTop: "1px solid #E7E7EC", borderBottom: "1px solid #E7E7EC", padding: "34px 16px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                    <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "#F3F3F6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B6B6C0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg></div>
                    <div style={{ fontSize: "13.5px", fontWeight: "600", color: "#3A3A44", marginBottom: "4px" }}>No badges yet</div>
                    <div style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#9A9AA4", maxWidth: "220px" }}>Complete challenges to earn them.</div>
                  </div>
                </section>
    
                <section>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "6px" }}>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", fontWeight: "700", letterSpacing: "0.14em", textTransform: "uppercase", color: "#7A7A86" }}>Career preferences</div>
                    <a href="Closdex Settings.dc.html" style={{ fontSize: "12.5px", fontWeight: "600", color: "#3A2DC4", textDecoration: "none" }}>Edit</a>
                  </div>
    
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 2px", borderTop: "1px solid #E7E7EC" }}>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "10.5px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9AA4" }}>Open to work</span>
                      <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0B0B0F" }}>Yes</span>
                    </div>
    
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 2px", borderTop: "1px solid #E7E7EC" }}>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "10.5px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9AA4" }}>Experience</span>
                      <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0B0B0F" }}>0 years</span>
                    </div>
    
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 2px", borderTop: "1px solid #E7E7EC", borderBottom: "1px solid #E7E7EC" }}>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "10.5px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9AA4" }}>Specialization</span>
                      <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0B0B0F" }}>IT Sales</span>
                    </div>
                </section>
              </div>
            </div>
    
          </div>
        
    </div>
  );
}
