'use client';

import { useRequireAuth } from '@/lib/auth';

// My Attempts — Vikash dashboard redesign 2026-06-16.
// Visual port of the new HTML. Data is the static demo shipped in the
// prototype; the real-data wiring stays on the previous logic and gets layered
// in once Vikash signs off on the visuals.

export default function AttemptsPage() {
  useRequireAuth('SALESPERSON');
  return (
    <div>
    
          <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "34px 40px 72px" }}>
    
            
            <div style={{ marginBottom: "34px" }}>
              <h1 style={{ margin: "0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "33px", letterSpacing: "-0.03em", lineHeight: "1.05", color: "#0B0B0F" }}>My Attempts</h1>
              <p style={{ margin: "9px 0 0", fontSize: "15px", color: "#7A7A86" }}>Full history of your challenge attempts.</p>
            </div>
    
            
            <section style={{ display: "flex", alignItems: "stretch", gap: "34px", padding: "24px 0 30px", borderTop: "1px solid #E7E7EC", borderBottom: "1px solid #E7E7EC", marginBottom: "34px" }}>
    
                <div style={{ display: "flex", alignItems: "stretch", gap: "34px" }}>
                  
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                      <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "42px", letterSpacing: "-0.03em", lineHeight: "0.95", color: "#0B0B0F" }}>8</span>
                      
                    </div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "10.5px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A9AA4", marginTop: "9px" }}>Total attempts</div>
                  </div>
                </div>
    
                <div style={{ display: "flex", alignItems: "stretch", gap: "34px" }}>
                  <div style={{ width: "1px", background: "#E7E7EC" }}></div>
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                      <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "42px", letterSpacing: "-0.03em", lineHeight: "0.95", color: "#0B0B0F" }}>5</span>
                      
                    </div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "10.5px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A9AA4", marginTop: "9px" }}>Completed</div>
                  </div>
                </div>
    
                <div style={{ display: "flex", alignItems: "stretch", gap: "34px" }}>
                  <div style={{ width: "1px", background: "#E7E7EC" }}></div>
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                      <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "42px", letterSpacing: "-0.03em", lineHeight: "0.95", color: "#F5A524" }}>2,311</span>
                      
                    </div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "10.5px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A9AA4", marginTop: "9px" }}>Points earned</div>
                  </div>
                </div>
    
                <div style={{ display: "flex", alignItems: "stretch", gap: "34px" }}>
                  <div style={{ width: "1px", background: "#E7E7EC" }}></div>
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                      <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "42px", letterSpacing: "-0.03em", lineHeight: "0.95", color: "#0B0B0F" }}>82</span>
                      <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "600", fontSize: "18px", color: "#B6B6C0" }}>/100</span>
                    </div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "10.5px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A9AA4", marginTop: "9px" }}>Avg score</div>
                  </div>
                </div>
            </section>
    
            
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", flexWrap: "wrap", marginBottom: "6px" }}>
              <nav style={{ display: "flex", alignItems: "center", gap: "26px" }}>
    
                <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "10px 2px", textDecoration: "none", fontSize: "14px", fontWeight: "600", color: "#0B0B0F", boxShadow: "inset 0 -2px 0 #0B0B0F" }}>
                  All
                </a>
    
                <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "10px 2px", textDecoration: "none", fontSize: "14px", fontWeight: "600", color: "#7A7A86", boxShadow: "none" }}>
                  Completed<span style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", fontWeight: "700", color: "#B6B6C0" }}>5</span>
                </a>
    
                <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "10px 2px", textDecoration: "none", fontSize: "14px", fontWeight: "600", color: "#7A7A86", boxShadow: "none" }}>
                  In Progress<span style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", fontWeight: "700", color: "#B6B6C0" }}>0</span>
                </a>
    
                <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "10px 2px", textDecoration: "none", fontSize: "14px", fontWeight: "600", color: "#7A7A86", boxShadow: "none" }}>
                  Abandoned<span style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", fontWeight: "700", color: "#B6B6C0" }}>3</span>
                </a>
              </nav>
              <div style={{ position: "relative", width: "250px" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9A9AA4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
                <input placeholder="Search attempts…" style={{ width: "100%", height: "36px", padding: "0 12px 0 35px", border: "1px solid #E7E7EC", borderRadius: "10px", background: "#FAFAF8", fontFamily: "Inter,sans-serif", fontSize: "13px", color: "#0B0B0F", outline: "none" }} />
              </div>
            </div>
    
            
            <div style={{ marginTop: "18px" }}>
    
                <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 150px 100px 96px 90px", gap: "20px", alignItems: "center", padding: "0 4px 12px", borderBottom: "1px solid #E7E7EC" }}>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "10px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A9AA4" }}>Challenge</div><div style={{ fontFamily: "'Space Mono',monospace", fontSize: "10px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A9AA4" }}>Difficulty</div><div style={{ fontFamily: "'Space Mono',monospace", fontSize: "10px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A9AA4" }}>Status</div><div style={{ fontFamily: "'Space Mono',monospace", fontSize: "10px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A9AA4", textAlign: "right" }}>Points</div><div style={{ fontFamily: "'Space Mono',monospace", fontSize: "10px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A9AA4", textAlign: "right" }}>Score</div><div style={{ fontFamily: "'Space Mono',monospace", fontSize: "10px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A9AA4", textAlign: "right" }}>Date</div>
                </div>
    
                <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 150px 100px 96px 90px", gap: "20px", alignItems: "center", padding: "17px 4px", borderBottom: "1px solid #E7E7EC" }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#0B0B0F", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>The Committee</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", fontFamily: "'Space Mono',monospace", fontSize: "11px", fontWeight: "700", letterSpacing: "0.04em", textTransform: "uppercase", color: "#3A3A44" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#A93F37", display: "inline-block" }}></span>Expert</div>
                  <div><span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "500", color: "#0B0B0F" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5B4BF5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Done</span></div>
                  <div style={{ textAlign: "right", fontFamily: "'Space Mono',monospace", fontSize: "13px", fontWeight: "700", color: "#F5A524" }}>+800</div>
                  <div style={{ textAlign: "right", fontFamily: "'Space Mono',monospace", fontSize: "13px", color: "#0B0B0F" }}><span style={{ fontWeight: "700" }}>91</span><span style={{ color: "#B6B6C0" }}>/100</span></div>
                  <div style={{ textAlign: "right", fontFamily: "'Space Mono',monospace", fontSize: "12px", color: "#7A7A86" }}>Jun 14</div>
                </div>
    
                <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 150px 100px 96px 90px", gap: "20px", alignItems: "center", padding: "17px 4px", borderBottom: "1px solid #E7E7EC" }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#0B0B0F", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Procurement Maze</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", fontFamily: "'Space Mono',monospace", fontSize: "11px", fontWeight: "700", letterSpacing: "0.04em", textTransform: "uppercase", color: "#3A3A44" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#A93F37", display: "inline-block" }}></span>Expert</div>
                  <div><span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "500", color: "#0B0B0F" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5B4BF5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Done</span></div>
                  <div style={{ textAlign: "right", fontFamily: "'Space Mono',monospace", fontSize: "13px", fontWeight: "700", color: "#F5A524" }}>+761</div>
                  <div style={{ textAlign: "right", fontFamily: "'Space Mono',monospace", fontSize: "13px", color: "#0B0B0F" }}><span style={{ fontWeight: "700" }}>88</span><span style={{ color: "#B6B6C0" }}>/100</span></div>
                  <div style={{ textAlign: "right", fontFamily: "'Space Mono',monospace", fontSize: "12px", color: "#7A7A86" }}>Jun 11</div>
                </div>
    
                <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 150px 100px 96px 90px", gap: "20px", alignItems: "center", padding: "17px 4px", borderBottom: "1px solid #E7E7EC" }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#0B0B0F", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>The Skeptical CTO</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", fontFamily: "'Space Mono',monospace", fontSize: "11px", fontWeight: "700", letterSpacing: "0.04em", textTransform: "uppercase", color: "#3A3A44" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#C2604A", display: "inline-block" }}></span>Hard</div>
                  <div><span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "500", color: "#0B0B0F" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5B4BF5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Done</span></div>
                  <div style={{ textAlign: "right", fontFamily: "'Space Mono',monospace", fontSize: "13px", fontWeight: "700", color: "#F5A524" }}>+420</div>
                  <div style={{ textAlign: "right", fontFamily: "'Space Mono',monospace", fontSize: "13px", color: "#0B0B0F" }}><span style={{ fontWeight: "700" }}>84</span><span style={{ color: "#B6B6C0" }}>/100</span></div>
                  <div style={{ textAlign: "right", fontFamily: "'Space Mono',monospace", fontSize: "12px", color: "#7A7A86" }}>Jun 9</div>
                </div>
    
                <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 150px 100px 96px 90px", gap: "20px", alignItems: "center", padding: "17px 4px", borderBottom: "1px solid #E7E7EC" }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#0B0B0F", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>The Gatekeeper</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", fontFamily: "'Space Mono',monospace", fontSize: "11px", fontWeight: "700", letterSpacing: "0.04em", textTransform: "uppercase", color: "#3A3A44" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#C2604A", display: "inline-block" }}></span>Hard</div>
                  <div><span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "500", color: "#0B0B0F" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5B4BF5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Done</span></div>
                  <div style={{ textAlign: "right", fontFamily: "'Space Mono',monospace", fontSize: "13px", fontWeight: "700", color: "#F5A524" }}>+380</div>
                  <div style={{ textAlign: "right", fontFamily: "'Space Mono',monospace", fontSize: "13px", color: "#0B0B0F" }}><span style={{ fontWeight: "700" }}>79</span><span style={{ color: "#B6B6C0" }}>/100</span></div>
                  <div style={{ textAlign: "right", fontFamily: "'Space Mono',monospace", fontSize: "12px", color: "#7A7A86" }}>Jun 6</div>
                </div>
    
                <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 150px 100px 96px 90px", gap: "20px", alignItems: "center", padding: "17px 4px", borderBottom: "1px solid #E7E7EC" }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#0B0B0F", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>The Pricing Pushback</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", fontFamily: "'Space Mono',monospace", fontSize: "11px", fontWeight: "700", letterSpacing: "0.04em", textTransform: "uppercase", color: "#3A3A44" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#CC7E55", display: "inline-block" }}></span>Medium</div>
                  <div><span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "500", color: "#9A9AA4" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C2C2CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>Abandoned</span></div>
                  <div style={{ textAlign: "right", fontFamily: "'Space Mono',monospace", fontSize: "13px", fontWeight: "700", color: "#C2C2CC" }}>—</div>
                  <div style={{ textAlign: "right", fontFamily: "'Space Mono',monospace", fontSize: "13px", color: "#0B0B0F" }}><span style={{ color: "#C2C2CC" }}>—</span></div>
                  <div style={{ textAlign: "right", fontFamily: "'Space Mono',monospace", fontSize: "12px", color: "#7A7A86" }}>Jun 4</div>
                </div>
    
                <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 150px 100px 96px 90px", gap: "20px", alignItems: "center", padding: "17px 4px", borderBottom: "1px solid #E7E7EC" }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#0B0B0F", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Cold Open</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", fontFamily: "'Space Mono',monospace", fontSize: "11px", fontWeight: "700", letterSpacing: "0.04em", textTransform: "uppercase", color: "#3A3A44" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6D9A4E", display: "inline-block" }}></span>Easy</div>
                  <div><span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "500", color: "#0B0B0F" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5B4BF5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Done</span></div>
                  <div style={{ textAlign: "right", fontFamily: "'Space Mono',monospace", fontSize: "13px", fontWeight: "700", color: "#F5A524" }}>+150</div>
                  <div style={{ textAlign: "right", fontFamily: "'Space Mono',monospace", fontSize: "13px", color: "#0B0B0F" }}><span style={{ fontWeight: "700" }}>73</span><span style={{ color: "#B6B6C0" }}>/100</span></div>
                  <div style={{ textAlign: "right", fontFamily: "'Space Mono',monospace", fontSize: "12px", color: "#7A7A86" }}>Jun 2</div>
                </div>
    
                <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 150px 100px 96px 90px", gap: "20px", alignItems: "center", padding: "17px 4px", borderBottom: "1px solid #E7E7EC" }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#0B0B0F", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>The Ghosted Deal</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", fontFamily: "'Space Mono',monospace", fontSize: "11px", fontWeight: "700", letterSpacing: "0.04em", textTransform: "uppercase", color: "#3A3A44" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#C2604A", display: "inline-block" }}></span>Hard</div>
                  <div><span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "500", color: "#9A9AA4" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C2C2CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>Abandoned</span></div>
                  <div style={{ textAlign: "right", fontFamily: "'Space Mono',monospace", fontSize: "13px", fontWeight: "700", color: "#C2C2CC" }}>—</div>
                  <div style={{ textAlign: "right", fontFamily: "'Space Mono',monospace", fontSize: "13px", color: "#0B0B0F" }}><span style={{ color: "#C2C2CC" }}>—</span></div>
                  <div style={{ textAlign: "right", fontFamily: "'Space Mono',monospace", fontSize: "12px", color: "#7A7A86" }}>May 30</div>
                </div>
    
                <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 150px 100px 96px 90px", gap: "20px", alignItems: "center", padding: "17px 4px" }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#0B0B0F", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Renewal Risk</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", fontFamily: "'Space Mono',monospace", fontSize: "11px", fontWeight: "700", letterSpacing: "0.04em", textTransform: "uppercase", color: "#3A3A44" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#CC7E55", display: "inline-block" }}></span>Medium</div>
                  <div><span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "500", color: "#9A9AA4" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C2C2CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>Abandoned</span></div>
                  <div style={{ textAlign: "right", fontFamily: "'Space Mono',monospace", fontSize: "13px", fontWeight: "700", color: "#C2C2CC" }}>—</div>
                  <div style={{ textAlign: "right", fontFamily: "'Space Mono',monospace", fontSize: "13px", color: "#0B0B0F" }}><span style={{ color: "#C2C2CC" }}>—</span></div>
                  <div style={{ textAlign: "right", fontFamily: "'Space Mono',monospace", fontSize: "12px", color: "#7A7A86" }}>May 28</div>
                </div>
            </div>
    
          </div>
        
    </div>
  );
}
