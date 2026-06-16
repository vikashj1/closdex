'use client';

import { useRequireAuth } from '@/lib/auth';

// Challenges — Vikash dashboard redesign 2026-06-16.
// Visual port of the new HTML. Data is the static demo shipped in the
// prototype; the real-data wiring stays on the previous logic and gets layered
// in once Vikash signs off on the visuals.

export default function ChallengesPage() {
  useRequireAuth('SALESPERSON');
  return (
    <div>
    
          <div style={{ display: "flex", alignItems: "stretch", minHeight: "100%" }}>
    
            
            <aside style={{ width: "236px", flexShrink: "0", borderRight: "1px solid #E7E7EC", padding: "36px 26px 40px 40px" }}>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "10.5px", fontWeight: "700", letterSpacing: "0.14em", textTransform: "uppercase", color: "#7A7A86", marginBottom: "14px" }}>Difficulty</div>
              <nav style={{ display: "flex", flexDirection: "column", gap: "1px", marginBottom: "34px" }}>
    <a href="#" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 10px", borderRadius: "8px", textDecoration: "none", fontSize: "13.5px", fontWeight: "600", color: "#0B0B0F", background: "#FAFAF8" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#C2C2CC", display: "inline-block" }}></span>All
        </a>
    <a href="#" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 10px", borderRadius: "8px", textDecoration: "none", fontSize: "13.5px", fontWeight: "500", color: "#3A3A44", background: "transparent" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4F9D6C", display: "inline-block" }}></span>Rookie
        </a>
    <a href="#" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 10px", borderRadius: "8px", textDecoration: "none", fontSize: "13.5px", fontWeight: "500", color: "#3A3A44", background: "transparent" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6D9A4E", display: "inline-block" }}></span>Easy
        </a>
    <a href="#" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 10px", borderRadius: "8px", textDecoration: "none", fontSize: "13.5px", fontWeight: "500", color: "#3A3A44", background: "transparent" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#CC7E55", display: "inline-block" }}></span>Medium
        </a>
    <a href="#" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 10px", borderRadius: "8px", textDecoration: "none", fontSize: "13.5px", fontWeight: "500", color: "#3A3A44", background: "transparent" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#C2604A", display: "inline-block" }}></span>Hard
        </a>
    <a href="#" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 10px", borderRadius: "8px", textDecoration: "none", fontSize: "13.5px", fontWeight: "500", color: "#3A3A44", background: "transparent" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#A93F37", display: "inline-block" }}></span>Expert
        </a>
              </nav>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "10.5px", fontWeight: "700", letterSpacing: "0.14em", textTransform: "uppercase", color: "#7A7A86", marginBottom: "14px" }}>Goal type</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
    <a href="#" style={{ display: "inline-flex", alignItems: "center", padding: "6px 12px", border: "1px solid #E7E7EC", borderRadius: "100px", textDecoration: "none", fontSize: "12.5px", fontWeight: "500", color: "#3A3A44" }}>Qualify</a>
    <a href="#" style={{ display: "inline-flex", alignItems: "center", padding: "6px 12px", border: "1px solid #E7E7EC", borderRadius: "100px", textDecoration: "none", fontSize: "12.5px", fontWeight: "500", color: "#3A3A44" }}>Book call</a>
    <a href="#" style={{ display: "inline-flex", alignItems: "center", padding: "6px 12px", border: "1px solid #E7E7EC", borderRadius: "100px", textDecoration: "none", fontSize: "12.5px", fontWeight: "500", color: "#3A3A44" }}>Proposal</a>
    <a href="#" style={{ display: "inline-flex", alignItems: "center", padding: "6px 12px", border: "1px solid #E7E7EC", borderRadius: "100px", textDecoration: "none", fontSize: "12.5px", fontWeight: "500", color: "#3A3A44" }}>Decision-maker</a>
    <a href="#" style={{ display: "inline-flex", alignItems: "center", padding: "6px 12px", border: "1px solid #E7E7EC", borderRadius: "100px", textDecoration: "none", fontSize: "12.5px", fontWeight: "500", color: "#3A3A44" }}>Close</a>
    <a href="#" style={{ display: "inline-flex", alignItems: "center", padding: "6px 12px", border: "1px solid #E7E7EC", borderRadius: "100px", textDecoration: "none", fontSize: "12.5px", fontWeight: "500", color: "#3A3A44" }}>Win-back</a>
              </div>
            </aside>
    
            
            <div style={{ flex: "1", minWidth: "0", padding: "36px 40px 72px" }}>
    
              
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "24px", flexWrap: "wrap", marginBottom: "8px" }}>
                <div>
                  <h1 style={{ margin: "0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "30px", letterSpacing: "-0.03em", lineHeight: "1.05", color: "#0B0B0F" }}>Challenge library</h1>
                  <p style={{ margin: "9px 0 0", fontFamily: "'Space Mono',monospace", fontSize: "11.5px", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9AA4" }}>Showing 4 of 4 challenges</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ position: "relative", width: "230px" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9A9AA4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
                    <input placeholder="Search keywords…" style={{ width: "100%", height: "36px", padding: "0 12px 0 35px", border: "1px solid #E7E7EC", borderRadius: "10px", background: "#FAFAF8", fontFamily: "Inter,sans-serif", fontSize: "13px", color: "#0B0B0F", outline: "none" }} />
                  </div>
                  <button style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "36px", padding: "0 14px", border: "1px solid #E7E7EC", borderRadius: "10px", background: "#fff", fontFamily: "Inter,sans-serif", fontSize: "13px", fontWeight: "600", color: "#3A3A44", cursor: "pointer" }}>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "10px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9AA4" }}>Sort</span>
                    Trending
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                  </button>
                </div>
              </div>
    
              
              <div style={{ marginTop: "26px" }}>
    
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "32px", alignItems: "center", padding: "24px 4px", borderTop: "1px solid #E7E7EC" }}>
                  <div style={{ minWidth: "0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "10px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "'Space Mono',monospace", fontSize: "10.5px", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase", color: "#3A3A44" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#C2604A", display: "inline-block" }}></span>Hard</span>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "10.5px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9AA4" }}>IT Sales</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 9px 3px 7px", borderRadius: "100px", background: "rgba(91,75,245,0.08)", color: "#3A2DC4", fontFamily: "'Space Mono',monospace", fontSize: "10px", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Completed</span>
                    </div>
                    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "600", fontSize: "19px", letterSpacing: "-0.02em", color: "#0B0B0F", marginBottom: "7px" }}>The Skeptical CTO</div>
                    <div style={{ fontSize: "13.5px", lineHeight: "1.5", color: "#7A7A86", maxWidth: "560px", marginBottom: "15px" }}>A technical buyer who has seen every pitch. Earn credibility before you ask for anything.</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "26px" }}>
                      <div>
                        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "9.5px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A9AA4", marginBottom: "4px" }}>Goal</div>
                        <div style={{ fontSize: "13px", fontWeight: "500", color: "#0B0B0F" }}>Send proposal</div>
                      </div>
                      <div style={{ width: "1px", height: "26px", background: "#E7E7EC" }}></div>
                      <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                        <span style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#EFEFF3", color: "#3A3A44", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "600", fontSize: "11px" }}>R</span>
                        <div>
                          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "9.5px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A9AA4", marginBottom: "3px" }}>Persona</div>
                          <div style={{ fontSize: "13px", fontWeight: "500", color: "#0B0B0F" }}>Rajesh Iyer</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "14px" }}>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "24px", letterSpacing: "-0.02em", color: "#F5A524" }}>+420</span>
                      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "9.5px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A9AA4", marginTop: "1px" }}>Base points</div>
                    </div>
                    <button style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#fff", color: "#3A3A44", border: "1px solid #E7E7EC", borderRadius: "10px", padding: "9px 16px", fontFamily: "Inter,sans-serif", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5B4BF5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Done</button>
                  </div>
                </div>
    
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "32px", alignItems: "center", padding: "24px 4px", borderTop: "1px solid #E7E7EC" }}>
                  <div style={{ minWidth: "0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "10px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "'Space Mono',monospace", fontSize: "10.5px", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase", color: "#3A3A44" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#C2604A", display: "inline-block" }}></span>Hard</span>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "10.5px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9AA4" }}>SaaS</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 9px 3px 7px", borderRadius: "100px", background: "rgba(91,75,245,0.08)", color: "#3A2DC4", fontFamily: "'Space Mono',monospace", fontSize: "10px", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Completed</span>
                    </div>
                    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "600", fontSize: "19px", letterSpacing: "-0.02em", color: "#0B0B0F", marginBottom: "7px" }}>The Gatekeeper</div>
                    <div style={{ fontSize: "13.5px", lineHeight: "1.5", color: "#7A7A86", maxWidth: "560px", marginBottom: "15px" }}>An executive assistant stands between you and the economic buyer. Get past, gracefully.</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "26px" }}>
                      <div>
                        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "9.5px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A9AA4", marginBottom: "4px" }}>Goal</div>
                        <div style={{ fontSize: "13px", fontWeight: "500", color: "#0B0B0F" }}>Reach decision-maker</div>
                      </div>
                      <div style={{ width: "1px", height: "26px", background: "#E7E7EC" }}></div>
                      <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                        <span style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#EFEFF3", color: "#3A3A44", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "600", fontSize: "11px" }}>A</span>
                        <div>
                          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "9.5px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A9AA4", marginBottom: "3px" }}>Persona</div>
                          <div style={{ fontSize: "13px", fontWeight: "500", color: "#0B0B0F" }}>Anjali Desai</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "14px" }}>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "24px", letterSpacing: "-0.02em", color: "#F5A524" }}>+380</span>
                      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "9.5px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A9AA4", marginTop: "1px" }}>Base points</div>
                    </div>
                    <button style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#fff", color: "#3A3A44", border: "1px solid #E7E7EC", borderRadius: "10px", padding: "9px 16px", fontFamily: "Inter,sans-serif", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5B4BF5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Done</button>
                  </div>
                </div>
    
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "32px", alignItems: "center", padding: "24px 4px", borderTop: "1px solid #E7E7EC" }}>
                  <div style={{ minWidth: "0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "10px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "'Space Mono',monospace", fontSize: "10.5px", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase", color: "#3A3A44" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#CC7E55", display: "inline-block" }}></span>Medium</span>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "10.5px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9AA4" }}>SaaS</span>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "10px", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9AA4" }}>Not started</span>
                    </div>
                    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "600", fontSize: "19px", letterSpacing: "-0.02em", color: "#0B0B0F", marginBottom: "7px" }}>The Pricing Pushback</div>
                    <div style={{ fontSize: "13.5px", lineHeight: "1.5", color: "#7A7A86", maxWidth: "560px", marginBottom: "15px" }}>The deal is warm until the number lands. Defend value without caving on discount.</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "26px" }}>
                      <div>
                        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "9.5px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A9AA4", marginBottom: "4px" }}>Goal</div>
                        <div style={{ fontSize: "13px", fontWeight: "500", color: "#0B0B0F" }}>Defend value</div>
                      </div>
                      <div style={{ width: "1px", height: "26px", background: "#E7E7EC" }}></div>
                      <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                        <span style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#EFEFF3", color: "#3A3A44", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "600", fontSize: "11px" }}>V</span>
                        <div>
                          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "9.5px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A9AA4", marginBottom: "3px" }}>Persona</div>
                          <div style={{ fontSize: "13px", fontWeight: "500", color: "#0B0B0F" }}>Vikram Singh</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "14px" }}>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "24px", letterSpacing: "-0.02em", color: "#F5A524" }}>+300</span>
                      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "9.5px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A9AA4", marginTop: "1px" }}>Base points</div>
                    </div>
                    <button style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "#0B0B0F", color: "#fff", border: "none", borderRadius: "10px", padding: "10px 18px", fontFamily: "Inter,sans-serif", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
            Start<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg></button>
                  </div>
                </div>
    
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "32px", alignItems: "center", padding: "24px 4px", borderTop: "1px solid #E7E7EC", borderBottom: "1px solid #E7E7EC" }}>
                  <div style={{ minWidth: "0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "10px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "'Space Mono',monospace", fontSize: "10.5px", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase", color: "#3A3A44" }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#A93F37", display: "inline-block" }}></span>Expert</span>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "10.5px", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A9AA4" }}>IT Sales</span>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "10px", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9AA4" }}>Not started</span>
                    </div>
                    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "600", fontSize: "19px", letterSpacing: "-0.02em", color: "#0B0B0F", marginBottom: "7px" }}>The Committee</div>
                    <div style={{ fontSize: "13.5px", lineHeight: "1.5", color: "#7A7A86", maxWidth: "560px", marginBottom: "15px" }}>Five stakeholders, five agendas. Align the room and earn the next meeting.</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "26px" }}>
                      <div>
                        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "9.5px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A9AA4", marginBottom: "4px" }}>Goal</div>
                        <div style={{ fontSize: "13px", fontWeight: "500", color: "#0B0B0F" }}>Book discovery call</div>
                      </div>
                      <div style={{ width: "1px", height: "26px", background: "#E7E7EC" }}></div>
                      <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                        <span style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#EFEFF3", color: "#3A3A44", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "600", fontSize: "11px" }}>M</span>
                        <div>
                          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "9.5px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9A9AA4", marginBottom: "3px" }}>Persona</div>
                          <div style={{ fontSize: "13px", fontWeight: "500", color: "#0B0B0F" }}>Meera Krishnan</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "14px" }}>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "24px", letterSpacing: "-0.02em", color: "#F5A524" }}>+800</span>
                      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "9.5px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A9AA4", marginTop: "1px" }}>Base points</div>
                    </div>
                    <button style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "#0B0B0F", color: "#fff", border: "none", borderRadius: "10px", padding: "10px 18px", fontFamily: "Inter,sans-serif", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
            Start<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg></button>
                  </div>
                </div>
              </div>
    
            </div>
          </div>
        
    </div>
  );
}
