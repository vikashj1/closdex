'use client';

import { useRequireAuth } from '@/lib/auth';
import { useAuth } from '@/lib/auth';

// Dashboard — Vikash dashboard redesign 2026-06-16.
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

export default function DashboardPage() {
  useRequireAuth('SALESPERSON');
  const { user } = useAuth();
  const userName = user?.name ?? 'there';
  const weeks = buildHeatmapWeeks();
  return (
    <div>
    
          <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "34px 40px 72px" }}>
    
            
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "24px", marginBottom: "30px" }}>
              <div>
                <h1 style={{ margin: "0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "33px", letterSpacing: "-0.03em", lineHeight: "1.05", color: "#0B0B0F" }}>Welcome back, {userName}.</h1>
                <p style={{ margin: "9px 0 0", fontSize: "15px", color: "#7A7A86" }}>You're <span style={{ color: "#0B0B0F", fontWeight: "600" }}>103 points</span> away from Silver.</p>
              </div>
              <button style={{ flexShrink: "0", display: "flex", alignItems: "center", gap: "8px", background: "#0B0B0F", color: "#fff", border: "none", borderRadius: "10px", padding: "11px 18px", fontFamily: "Inter,sans-serif", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" /></svg>
                Take a challenge
              </button>
            </div>
    
            
            <section style={{ position: "relative", borderRadius: "16px", overflow: "hidden", background: "radial-gradient(130% 150% at 0% 0%, #4A3AD9 0%, #2C2256 40%, #14101F 72%, #0B0B0F 100%)", padding: "32px 36px", marginBottom: "40px" }}>
              <div style={{ position: "absolute", top: "-60px", right: "-40px", width: "340px", height: "340px", borderRadius: "50%", background: "radial-gradient(circle, rgba(91,75,245,0.32) 0%, rgba(91,75,245,0) 68%)", pointerEvents: "none" }}></div>
              <div style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: "40px", alignItems: "flex-end" }}>
    
                
                <div style={{ flexShrink: "0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ width: "13px", height: "15px", background: "#F5A524", display: "inline-block", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)" }}></span>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "12px", fontWeight: "700", letterSpacing: "0.16em", textTransform: "uppercase", color: "#F5A524" }}>Bronze</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                    <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "78px", lineHeight: "0.9", letterSpacing: "-0.04em", color: "#F5A524" }}>1,397</span>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", paddingBottom: "8px" }}>points</span>
                  </div>
                </div>
    
                
                <div style={{ display: "flex", gap: "34px", paddingBottom: "6px" }}>
                  <div>
                    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "600", fontSize: "26px", letterSpacing: "-0.02em", color: "#F5A524" }}>+2,305</div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "10.5px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>This week · 7d</div>
                  </div>
                  <div style={{ width: "1px", background: "rgba(255,255,255,0.12)" }}></div>
                  <div>
                    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "600", fontSize: "26px", letterSpacing: "-0.02em", color: "#FFFFFF" }}>5</div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "10.5px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>Challenges</div>
                  </div>
                  <div style={{ width: "1px", background: "rgba(255,255,255,0.12)" }}></div>
                  <div>
                    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "600", fontSize: "26px", letterSpacing: "-0.02em", color: "#FFFFFF" }}>1d</div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "10.5px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>Day streak</div>
                  </div>
                </div>
    
                
                <div style={{ flex: "1", minWidth: "240px", paddingBottom: "4px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "9px" }}>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>Progress to Silver</span>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "12px", color: "#F5A524" }}><span style={{ fontWeight: "700" }}>1,397</span><span style={{ color: "rgba(255,255,255,0.45)" }}> / 1,500</span></span>
                  </div>
                  <div style={{ height: "8px", borderRadius: "100px", background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
                    <div style={{ width: "93%", height: "100%", borderRadius: "100px", background: "linear-gradient(90deg,#F5A524,#F7B948)" }}></div>
                  </div>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "10.5px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginTop: "9px" }}>103 points to go</div>
                </div>
    
              </div>
            </section>
    
            
            <section style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0", borderTop: "1px solid #E7E7EC", borderBottom: "1px solid #E7E7EC", marginBottom: "42px" }}>
    
              
              <div style={{ padding: "20px 24px 20px 0", borderRight: "1px solid #E7E7EC", display: "flex", flexDirection: "column" }}>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "10.5px", fontWeight: "700", letterSpacing: "0.14em", textTransform: "uppercase", color: "#7A7A86", marginBottom: "12px" }}>Daily quest</div>
                <div style={{ fontSize: "15px", fontWeight: "600", color: "#0B0B0F", marginBottom: "6px" }}>Procurement Maze</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "10px", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase", color: "#3A3A44", display: "flex", alignItems: "center", gap: "5px" }}><span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#A93F37" }}></span>Expert</span>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "12px", fontWeight: "700", color: "#F5A524" }}>+800</span>
                </div>
                <a href="#" style={{ marginTop: "auto", display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "13px", fontWeight: "600", color: "#3A2DC4", textDecoration: "none" }}>Start<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg></a>
              </div>
    
              
              <div style={{ padding: "20px 24px", borderRight: "1px solid #E7E7EC", display: "flex", flexDirection: "column" }}>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "10.5px", fontWeight: "700", letterSpacing: "0.14em", textTransform: "uppercase", color: "#7A7A86", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F5A524" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5" /></svg>Streak at risk</div>
                <div style={{ fontSize: "14.5px", lineHeight: "1.4", color: "#0B0B0F", marginBottom: "4px" }}><span style={{ fontFamily: "'Space Mono',monospace", fontWeight: "700" }}>1d</span> · Ends in ~22h.</div>
                <div style={{ fontSize: "12.5px", lineHeight: "1.4", color: "#7A7A86", marginBottom: "14px" }}>One quick challenge saves it.</div>
                <button style={{ marginTop: "auto", alignSelf: "flex-start", background: "#0B0B0F", color: "#fff", border: "none", borderRadius: "10px", padding: "8px 14px", fontFamily: "Inter,sans-serif", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Save streak</button>
              </div>
    
              
              <div style={{ padding: "20px 24px", borderRight: "1px solid #E7E7EC", display: "flex", flexDirection: "column" }}>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "10.5px", fontWeight: "700", letterSpacing: "0.14em", textTransform: "uppercase", color: "#7A7A86", marginBottom: "12px" }}>Coach tip</div>
                <div style={{ fontSize: "14.5px", fontWeight: "600", color: "#0B0B0F", marginBottom: "7px" }}>Work on: objection handling</div>
                <div style={{ fontSize: "12.5px", lineHeight: "1.5", color: "#7A7A86" }}>Lead with a question before you pitch — let the buyer name the pain first.</div>
              </div>
    
              
              <div style={{ padding: "20px 0 20px 24px", display: "flex", flexDirection: "column" }}>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "10.5px", fontWeight: "700", letterSpacing: "0.14em", textTransform: "uppercase", color: "#7A7A86", marginBottom: "12px" }}>Next rank</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ width: "13px", height: "15px", background: "#C0C0C8", display: "inline-block", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)" }}></span>
                  <span style={{ fontSize: "15px", fontWeight: "600", color: "#0B0B0F" }}>Silver</span>
                </div>
                <div style={{ fontSize: "12.5px", color: "#7A7A86", marginBottom: "13px" }}><span style={{ fontFamily: "'Space Mono',monospace", fontWeight: "700", color: "#3A3A44" }}>103</span> points away</div>
                <div style={{ marginTop: "auto", height: "6px", borderRadius: "100px", background: "#EFEFF3", overflow: "hidden" }}>
                  <div style={{ width: "93%", height: "100%", borderRadius: "100px", background: "#5B4BF5" }}></div>
                </div>
              </div>
    
            </section>
    
            
            <section style={{ display: "flex", gap: "48px", alignItems: "stretch", marginBottom: "46px" }}>
    
              
              <div style={{ flexShrink: "0" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "24px", marginBottom: "18px" }}>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", fontWeight: "700", letterSpacing: "0.14em", textTransform: "uppercase", color: "#7A7A86" }}>Your challenge activity</div>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9AA4" }}>Last 26 weeks</div>
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
                <div style={{ display: "flex", alignItems: "center", gap: "7px", marginTop: "14px" }}>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "10.5px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A9AA4" }}>Less</span>
                  <span style={{ width: "13px", height: "13px", borderRadius: "3px", background: "#EFEFF3" }}></span>
                  <span style={{ width: "13px", height: "13px", borderRadius: "3px", background: "#D8D4FB" }}></span>
                  <span style={{ width: "13px", height: "13px", borderRadius: "3px", background: "#B0A8F6" }}></span>
                  <span style={{ width: "13px", height: "13px", borderRadius: "3px", background: "#7E72F1" }}></span>
                  <span style={{ width: "13px", height: "13px", borderRadius: "3px", background: "#5B4BF5" }}></span>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "10.5px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A9AA4" }}>More</span>
                </div>
              </div>
    
              
              <div style={{ flex: "1", minWidth: "0", paddingLeft: "48px", borderLeft: "1px solid #E7E7EC", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "24px", marginBottom: "18px" }}>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", fontWeight: "700", letterSpacing: "0.14em", textTransform: "uppercase", color: "#7A7A86" }}>Collected badges</div>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9AA4" }}>4 of 12</div>
                </div>
    
                <div style={{ display: "flex", flexWrap: "wrap", gap: "26px 30px", alignContent: "flex-start" }}>
    
                  
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "9px", width: "64px" }}>
                    <span style={{ position: "relative", width: "54px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg,#2C2256,#14101F)", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)" }}>
                      <span style={{ position: "absolute", inset: "2px", background: "linear-gradient(160deg,#FFFBF2,#F4E4C4)", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)" }}></span>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8A6A1A" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative" }}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#3A3A44", textAlign: "center", lineHeight: "1.25" }}>First Win</span>
                  </div>
    
                  
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "9px", width: "64px" }}>
                    <span style={{ position: "relative", width: "54px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg,#2C2256,#14101F)", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)" }}>
                      <span style={{ position: "absolute", inset: "2px", background: "linear-gradient(160deg,#6E5FF7,#4A3AD9)", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)" }}></span>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative" }}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z" /><path d="m9 12 2 2 4-4" /></svg>
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#3A3A44", textAlign: "center", lineHeight: "1.25" }}>Objection Slayer</span>
                  </div>
    
                  
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "9px", width: "64px" }}>
                    <span style={{ position: "relative", width: "54px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg,#2C2256,#14101F)", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)" }}>
                      <span style={{ position: "absolute", inset: "2px", background: "linear-gradient(160deg,#FFFBF2,#F4E4C4)", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)" }}></span>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8A6A1A" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative" }}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5" /></svg>
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#3A3A44", textAlign: "center", lineHeight: "1.25" }}>Streak Keeper</span>
                  </div>
    
                  
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "9px", width: "64px" }}>
                    <span style={{ position: "relative", width: "54px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg,#2C2256,#14101F)", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)" }}>
                      <span style={{ position: "absolute", inset: "2px", background: "linear-gradient(160deg,#6E5FF7,#4A3AD9)", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)" }}></span>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative" }}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" /></svg>
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#3A3A44", textAlign: "center", lineHeight: "1.25" }}>Sharpshooter</span>
                  </div>
    
                  
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "9px", width: "64px" }}>
                    <span style={{ position: "relative", width: "54px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center", background: "#F3F3F6", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C2C2CC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#B6B6C0", textAlign: "center", lineHeight: "1.25" }}>Locked</span>
                  </div>
    
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "9px", width: "64px" }}>
                    <span style={{ position: "relative", width: "54px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center", background: "#F3F3F6", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C2C2CC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#B6B6C0", textAlign: "center", lineHeight: "1.25" }}>Locked</span>
                  </div>
    
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "9px", width: "64px" }}>
                    <span style={{ position: "relative", width: "54px", height: "60px", display: "flex", alignItems: "center", justifyContent: "center", background: "#F3F3F6", clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C2C2CC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#B6B6C0", textAlign: "center", lineHeight: "1.25" }}>Locked</span>
                  </div>
    
                </div>
              </div>
    
            </section>
    
            
            <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: "44px", alignItems: "start" }}>
    
              
              <section>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "4px" }}>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", fontWeight: "700", letterSpacing: "0.14em", textTransform: "uppercase", color: "#7A7A86" }}>Recommended for you</div>
                  <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12.5px", fontWeight: "600", color: "#3A2DC4", textDecoration: "none" }}>See all<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg></a>
                </div>
    
                <a href="#" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "15px 4px", borderTop: "1px solid #E7E7EC", textDecoration: "none" }}>
                  <div style={{ flex: "1", minWidth: "0" }}>
                    <div style={{ fontSize: "14.5px", fontWeight: "600", color: "#0B0B0F", marginBottom: "7px" }}>The Skeptical CTO</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", fontFamily: "'Space Mono',monospace", fontSize: "10.5px", letterSpacing: "0.05em", textTransform: "uppercase", color: "#7A7A86" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#3A3A44", fontWeight: "700" }}><span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#C2604A" }}></span>Hard</span>
                      <span>Objection handling</span>
                    </div>
                  </div>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "13px", fontWeight: "700", color: "#F5A524", flexShrink: "0" }}>+420</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "'Space Mono',monospace", fontSize: "11px", color: "#9A9AA4", flexShrink: "0", width: "52px", justifyContent: "flex-end" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>12</span>
                </a>
    
                <a href="#" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "15px 4px", borderTop: "1px solid #E7E7EC", textDecoration: "none" }}>
                  <div style={{ flex: "1", minWidth: "0" }}>
                    <div style={{ fontSize: "14.5px", fontWeight: "600", color: "#0B0B0F", marginBottom: "7px" }}>The Gatekeeper</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", fontFamily: "'Space Mono',monospace", fontSize: "10.5px", letterSpacing: "0.05em", textTransform: "uppercase", color: "#7A7A86" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#3A3A44", fontWeight: "700" }}><span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#C2604A" }}></span>Hard</span>
                      <span>Discovery</span>
                    </div>
                  </div>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "13px", fontWeight: "700", color: "#F5A524", flexShrink: "0" }}>+380</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "'Space Mono',monospace", fontSize: "11px", color: "#9A9AA4", flexShrink: "0", width: "52px", justifyContent: "flex-end" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>9</span>
                </a>
    
                <a href="#" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "15px 4px", borderTop: "1px solid #E7E7EC", textDecoration: "none" }}>
                  <div style={{ flex: "1", minWidth: "0" }}>
                    <div style={{ fontSize: "14.5px", fontWeight: "600", color: "#0B0B0F", marginBottom: "7px" }}>The Pricing Pushback</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", fontFamily: "'Space Mono',monospace", fontSize: "10.5px", letterSpacing: "0.05em", textTransform: "uppercase", color: "#7A7A86" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#3A3A44", fontWeight: "700" }}><span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#CC7E55" }}></span>Medium</span>
                      <span>Value framing</span>
                    </div>
                  </div>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "13px", fontWeight: "700", color: "#F5A524", flexShrink: "0" }}>+300</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "'Space Mono',monospace", fontSize: "11px", color: "#9A9AA4", flexShrink: "0", width: "52px", justifyContent: "flex-end" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>14</span>
                </a>
    
                <a href="#" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "15px 4px", borderTop: "1px solid #E7E7EC", borderBottom: "1px solid #E7E7EC", textDecoration: "none" }}>
                  <div style={{ flex: "1", minWidth: "0" }}>
                    <div style={{ fontSize: "14.5px", fontWeight: "600", color: "#0B0B0F", marginBottom: "7px" }}>The Committee</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", fontFamily: "'Space Mono',monospace", fontSize: "10.5px", letterSpacing: "0.05em", textTransform: "uppercase", color: "#7A7A86" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#3A3A44", fontWeight: "700" }}><span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#A93F37" }}></span>Expert</span>
                      <span>Closing</span>
                    </div>
                  </div>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "13px", fontWeight: "700", color: "#F5A524", flexShrink: "0" }}>+800</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "'Space Mono',monospace", fontSize: "11px", color: "#9A9AA4", flexShrink: "0", width: "52px", justifyContent: "flex-end" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>20</span>
                </a>
              </section>
    
              
              <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
    
                
                <section>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", fontWeight: "700", letterSpacing: "0.14em", textTransform: "uppercase", color: "#7A7A86", marginBottom: "4px" }}>Leaderboard</div>
    
                  <div style={{ display: "flex", alignItems: "center", gap: "13px", padding: "13px 12px", borderTop: "1px solid #E7E7EC", borderRadius: "8px 8px 0 0", background: "rgba(91,75,245,0.07)", boxShadow: "inset 2px 0 0 #5B4BF5" }}>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "12px", fontWeight: "700", color: "#3A2DC4", width: "20px" }}>01</span>
                    <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#0B0B0F", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "600", fontSize: "11px" }}>t</div>
                    <div style={{ flex: "1", minWidth: "0" }}>
                      <div style={{ fontSize: "13.5px", fontWeight: "600", color: "#0B0B0F" }}>You</div>
                      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "10px", letterSpacing: "0.06em", textTransform: "uppercase", color: "#7A7A86" }}>test</div>
                    </div>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "13px", fontWeight: "700", color: "#F5A524" }}>1,397</span>
                  </div>
    
                  <div style={{ display: "flex", alignItems: "center", gap: "13px", padding: "13px 12px", borderTop: "1px solid #E7E7EC" }}>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "12px", fontWeight: "700", color: "#9A9AA4", width: "20px" }}>02</span>
                    <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#EFEFF3", color: "#3A3A44", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "600", fontSize: "11px" }}>S</div>
                    <div style={{ flex: "1", minWidth: "0", fontSize: "13.5px", fontWeight: "500", color: "#0B0B0F" }}>Shashank Singh</div>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "13px", fontWeight: "700", color: "#0B0B0F" }}>222</span>
                  </div>
    
                  <div style={{ display: "flex", alignItems: "center", gap: "13px", padding: "13px 12px", borderTop: "1px solid #E7E7EC", borderBottom: "1px solid #E7E7EC" }}>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "12px", fontWeight: "700", color: "#9A9AA4", width: "20px" }}>03</span>
                    <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#EFEFF3", color: "#3A3A44", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "600", fontSize: "11px" }}>V</div>
                    <div style={{ flex: "1", minWidth: "0", fontSize: "13.5px", fontWeight: "500", color: "#0B0B0F" }}>Vikash</div>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "13px", fontWeight: "700", color: "#0B0B0F" }}>0</span>
                  </div>
                </section>
    
                
                <section>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", fontWeight: "700", letterSpacing: "0.14em", textTransform: "uppercase", color: "#7A7A86", marginBottom: "4px" }}>Recent activity</div>
    
                  <div style={{ display: "flex", alignItems: "center", gap: "13px", padding: "14px 4px", borderTop: "1px solid #E7E7EC" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5B4BF5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: "0" }}><path d="M20 6 9 17l-5-5" /></svg>
                    <div style={{ flex: "1", minWidth: "0" }}>
                      <div style={{ fontSize: "13.5px", color: "#0B0B0F" }}>Cleared <span style={{ fontWeight: "600" }}>'The Skeptical CTO'</span></div>
                      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "10px", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9AA4", marginTop: "3px" }}>2d ago</div>
                    </div>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "12.5px", fontWeight: "700", color: "#F5A524" }}>+354</span>
                  </div>
    
                  <div style={{ display: "flex", alignItems: "center", gap: "13px", padding: "14px 4px", borderTop: "1px solid #E7E7EC" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5B4BF5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: "0" }}><path d="M20 6 9 17l-5-5" /></svg>
                    <div style={{ flex: "1", minWidth: "0" }}>
                      <div style={{ fontSize: "13.5px", color: "#0B0B0F" }}>Challenge cleared</div>
                      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "10px", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9AA4", marginTop: "3px" }}>2d ago</div>
                    </div>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "12.5px", fontWeight: "700", color: "#F5A524" }}>+585</span>
                  </div>
    
                  <div style={{ display: "flex", alignItems: "center", gap: "13px", padding: "14px 4px", borderTop: "1px solid #E7E7EC", borderBottom: "1px solid #E7E7EC" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5B4BF5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: "0" }}><path d="M20 6 9 17l-5-5" /></svg>
                    <div style={{ flex: "1", minWidth: "0" }}>
                      <div style={{ fontSize: "13.5px", color: "#0B0B0F" }}>Cleared <span style={{ fontWeight: "600" }}>'Procurement Maze'</span></div>
                      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "10px", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9AA4", marginTop: "3px" }}>5d ago</div>
                    </div>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "12.5px", fontWeight: "700", color: "#F5A524" }}>+1,261</span>
                  </div>
                </section>
    
              </div>
            </div>
    
          </div>
        
    </div>
  );
}
