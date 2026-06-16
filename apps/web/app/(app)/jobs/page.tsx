'use client';

import { useRequireAuth } from '@/lib/auth';

// Jobs — Vikash dashboard redesign 2026-06-16.
// Visual port of the new HTML. Data is the static demo shipped in the
// prototype; the real-data wiring stays on the previous logic and gets layered
// in once Vikash signs off on the visuals.

export default function JobsPage() {
  useRequireAuth('SALESPERSON');
  return (
    <div>
    
          <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "34px 40px 72px" }}>
    
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "24px", flexWrap: "wrap", marginBottom: "30px" }}>
              <div>
                <h1 style={{ margin: "0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "33px", letterSpacing: "-0.03em", lineHeight: "1.05", color: "#0B0B0F" }}>Jobs for you</h1>
                <p style={{ margin: "10px 0 0", fontFamily: "'Space Mono',monospace", fontSize: "11.5px", letterSpacing: "0.06em", textTransform: "uppercase", color: "#9A9AA4" }}>5 listings</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "38px", padding: "0 15px", border: "1px solid #E7E7EC", borderRadius: "10px", background: "#fff", fontFamily: "Inter,sans-serif", fontSize: "13px", fontWeight: "600", color: "#3A3A44", cursor: "pointer" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="14" y1="4" y2="4" /><line x1="10" x2="3" y1="4" y2="4" /><line x1="21" x2="12" y1="12" y2="12" /><line x1="8" x2="3" y1="12" y2="12" /><line x1="21" x2="16" y1="20" y2="20" /><line x1="12" x2="3" y1="20" y2="20" /><line x1="14" x2="14" y1="2" y2="6" /><line x1="8" x2="8" y1="10" y2="14" /><line x1="16" x2="16" y1="18" y2="22" /></svg>Filters</button>
                <a href="Closdex Applications.dc.html" style={{ display: "inline-flex", alignItems: "center", gap: "9px", height: "38px", padding: "0 16px", border: "1px solid #E7E7EC", borderRadius: "10px", background: "#fff", fontFamily: "Inter,sans-serif", fontSize: "13px", fontWeight: "600", color: "#0B0B0F", textDecoration: "none" }}>Applications<span style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", fontWeight: "700", color: "#fff", background: "#5B4BF5", borderRadius: "7px", padding: "1px 7px" }}>1</span></a>
              </div>
            </div>
    
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", fontWeight: "700", letterSpacing: "0.14em", textTransform: "uppercase", color: "#7A7A86", marginBottom: "14px" }}>Application pipeline</div>
            <section style={{ display: "flex", alignItems: "center", padding: "24px 8px", borderTop: "1px solid #E7E7EC", borderBottom: "1px solid #E7E7EC", marginBottom: "40px" }}>
                <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "7px", padding: "0 6px" }}><span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "30px", letterSpacing: "-0.02em", color: "#0B0B0F" }}>1</span><span style={{ fontFamily: "'Space Mono',monospace", fontSize: "10px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#7A7A86" }}>Applied</span></div><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D8D8E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: "0" }}><path d="m9 18 6-6-6-6" /></svg>
                <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "7px", padding: "0 6px" }}><span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "30px", letterSpacing: "-0.02em", color: "#0B0B0F" }}>1</span><span style={{ fontFamily: "'Space Mono',monospace", fontSize: "10px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#7A7A86" }}>Viewed</span></div><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D8D8E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: "0" }}><path d="m9 18 6-6-6-6" /></svg>
                <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "7px", padding: "0 6px" }}><span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "30px", letterSpacing: "-0.02em", color: "#0B0B0F" }}>1</span><span style={{ fontFamily: "'Space Mono',monospace", fontSize: "10px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#7A7A86" }}>Shortlisted</span></div><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D8D8E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: "0" }}><path d="m9 18 6-6-6-6" /></svg>
                <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "7px", padding: "0 6px" }}><span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "30px", letterSpacing: "-0.02em", color: "#0B0B0F" }}>1</span><span style={{ fontFamily: "'Space Mono',monospace", fontSize: "10px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#7A7A86" }}>Interview</span></div><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D8D8E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: "0" }}><path d="m9 18 6-6-6-6" /></svg>
                <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "7px", padding: "0 6px" }}><span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "30px", letterSpacing: "-0.02em", color: "#F5A524" }}>1</span><span style={{ fontFamily: "'Space Mono',monospace", fontSize: "10px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#7A7A86" }}>Offer</span></div>
            </section>
    
            <nav style={{ display: "flex", alignItems: "center", gap: "26px", marginBottom: "8px" }}>
              <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "10px 2px", textDecoration: "none", fontSize: "14px", fontWeight: "600", color: "#0B0B0F", boxShadow: "inset 0 -2px 0 #0B0B0F" }}>All Jobs<span style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", fontWeight: "700", color: "#0B0B0F" }}>5</span></a>
              <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "10px 2px", textDecoration: "none", fontSize: "14px", fontWeight: "600", color: "#7A7A86" }}>Saved<span style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", fontWeight: "700", color: "#B6B6C0" }}>1</span></a>
            </nav>
    
            <div style={{ marginTop: "14px" }}>
    
                <div style={{ display: "flex", alignItems: "center", gap: "18px", padding: "20px 4px", borderTop: "1px solid #E7E7EC" }}>
                  <span style={{ width: "42px", height: "42px", borderRadius: "11px", background: "#0B0B0F", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "600", fontSize: "14px", flexShrink: "0" }}>CV</span>
                  <div style={{ flex: "1", minWidth: "0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}><span style={{ fontSize: "15px", fontWeight: "600", color: "#0B0B0F" }}>Enterprise Account Executive</span><span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "2px 9px 2px 7px", borderRadius: "100px", background: "rgba(31,138,91,0.1)", color: "#1F8A5B", fontFamily: "'Space Mono',monospace", fontSize: "9.5px", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase" }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Hired</span></div>
                    <div style={{ display: "flex", alignItems: "center", gap: "9px", fontFamily: "'Space Mono',monospace", fontSize: "11px", letterSpacing: "0.03em", color: "#7A7A86" }}><span style={{ fontWeight: "700", color: "#3A3A44" }}>CVS</span><span style={{ color: "#D8D8E0" }}>·</span><span>Remote</span><span style={{ color: "#D8D8E0" }}>·</span><span>IT Sales</span></div>
                  </div>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "13px", fontWeight: "700", color: "#0B0B0F", flexShrink: "0" }}>₹18–28 LPA</span>
                  <button style={{ width: "38px", height: "38px", borderRadius: "10px", border: "1px solid #E7E7EC", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: "0" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A7A86" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg></button>
                  <button style={{ height: "38px", padding: "0 16px", border: "1px solid #E7E7EC", borderRadius: "10px", background: "#fff", fontFamily: "Inter,sans-serif", fontSize: "13px", fontWeight: "600", color: "#3A3A44", cursor: "pointer", flexShrink: "0" }}>Details</button>
                  <button style={{ height: "38px", padding: "0 18px", border: "1px solid #E7E7EC", borderRadius: "10px", background: "#fff", fontFamily: "Inter,sans-serif", fontSize: "13px", fontWeight: "600", color: "#3A2DC4", cursor: "pointer", flexShrink: "0" }}>View status</button>
                </div>
    
                <div style={{ display: "flex", alignItems: "center", gap: "18px", padding: "20px 4px", borderTop: "1px solid #E7E7EC" }}>
                  <span style={{ width: "42px", height: "42px", borderRadius: "11px", background: "#0B0B0F", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "600", fontSize: "14px", flexShrink: "0" }}>CV</span>
                  <div style={{ flex: "1", minWidth: "0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}><span style={{ fontSize: "15px", fontWeight: "600", color: "#0B0B0F" }}>SaaS Sales Manager</span></div>
                    <div style={{ display: "flex", alignItems: "center", gap: "9px", fontFamily: "'Space Mono',monospace", fontSize: "11px", letterSpacing: "0.03em", color: "#7A7A86" }}><span style={{ fontWeight: "700", color: "#3A3A44" }}>CVS</span><span style={{ color: "#D8D8E0" }}>·</span><span>Mumbai</span><span style={{ color: "#D8D8E0" }}>·</span><span>IT Sales</span></div>
                  </div>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "13px", fontWeight: "700", color: "#0B0B0F", flexShrink: "0" }}>₹22–34 LPA</span>
                  <button style={{ width: "38px", height: "38px", borderRadius: "10px", border: "1px solid #E7E7EC", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: "0" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A7A86" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg></button>
                  <button style={{ height: "38px", padding: "0 16px", border: "1px solid #E7E7EC", borderRadius: "10px", background: "#fff", fontFamily: "Inter,sans-serif", fontSize: "13px", fontWeight: "600", color: "#3A3A44", cursor: "pointer", flexShrink: "0" }}>Details</button>
                  <button style={{ height: "38px", padding: "0 18px", border: "none", borderRadius: "10px", background: "#0B0B0F", color: "#fff", fontFamily: "Inter,sans-serif", fontSize: "13px", fontWeight: "600", cursor: "pointer", flexShrink: "0", display: "inline-flex", alignItems: "center", gap: "7px" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m13 2-3 7h4l-3 7" /><path d="M3 12h2" /><path d="M19 12h2" /></svg>Apply</button>
                </div>
    
                <div style={{ display: "flex", alignItems: "center", gap: "18px", padding: "20px 4px", borderTop: "1px solid #E7E7EC" }}>
                  <span style={{ width: "42px", height: "42px", borderRadius: "11px", background: "#0B0B0F", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "600", fontSize: "14px", flexShrink: "0" }}>CV</span>
                  <div style={{ flex: "1", minWidth: "0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}><span style={{ fontSize: "15px", fontWeight: "600", color: "#0B0B0F" }}>SDR Team Lead</span></div>
                    <div style={{ display: "flex", alignItems: "center", gap: "9px", fontFamily: "'Space Mono',monospace", fontSize: "11px", letterSpacing: "0.03em", color: "#7A7A86" }}><span style={{ fontWeight: "700", color: "#3A3A44" }}>CVS</span><span style={{ color: "#D8D8E0" }}>·</span><span>Bengaluru</span><span style={{ color: "#D8D8E0" }}>·</span><span>IT Sales</span></div>
                  </div>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "13px", fontWeight: "700", color: "#0B0B0F", flexShrink: "0" }}>₹12–18 LPA</span>
                  <button style={{ width: "38px", height: "38px", borderRadius: "10px", border: "1px solid #E7E7EC", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: "0" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A7A86" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg></button>
                  <button style={{ height: "38px", padding: "0 16px", border: "1px solid #E7E7EC", borderRadius: "10px", background: "#fff", fontFamily: "Inter,sans-serif", fontSize: "13px", fontWeight: "600", color: "#3A3A44", cursor: "pointer", flexShrink: "0" }}>Details</button>
                  <button style={{ height: "38px", padding: "0 18px", border: "none", borderRadius: "10px", background: "#0B0B0F", color: "#fff", fontFamily: "Inter,sans-serif", fontSize: "13px", fontWeight: "600", cursor: "pointer", flexShrink: "0", display: "inline-flex", alignItems: "center", gap: "7px" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m13 2-3 7h4l-3 7" /><path d="M3 12h2" /><path d="M19 12h2" /></svg>Apply</button>
                </div>
    
                <div style={{ display: "flex", alignItems: "center", gap: "18px", padding: "20px 4px", borderTop: "1px solid #E7E7EC" }}>
                  <span style={{ width: "42px", height: "42px", borderRadius: "11px", background: "#0B0B0F", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "600", fontSize: "14px", flexShrink: "0" }}>CV</span>
                  <div style={{ flex: "1", minWidth: "0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}><span style={{ fontSize: "15px", fontWeight: "600", color: "#0B0B0F" }}>Field Sales Executive</span></div>
                    <div style={{ display: "flex", alignItems: "center", gap: "9px", fontFamily: "'Space Mono',monospace", fontSize: "11px", letterSpacing: "0.03em", color: "#7A7A86" }}><span style={{ fontWeight: "700", color: "#3A3A44" }}>CVS</span><span style={{ color: "#D8D8E0" }}>·</span><span>Pune</span><span style={{ color: "#D8D8E0" }}>·</span><span>IT Sales</span></div>
                  </div>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "13px", fontWeight: "700", color: "#0B0B0F", flexShrink: "0" }}>₹9–14 LPA</span>
                  <button style={{ width: "38px", height: "38px", borderRadius: "10px", border: "1px solid #E7E7EC", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: "0" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A7A86" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg></button>
                  <button style={{ height: "38px", padding: "0 16px", border: "1px solid #E7E7EC", borderRadius: "10px", background: "#fff", fontFamily: "Inter,sans-serif", fontSize: "13px", fontWeight: "600", color: "#3A3A44", cursor: "pointer", flexShrink: "0" }}>Details</button>
                  <button style={{ height: "38px", padding: "0 18px", border: "none", borderRadius: "10px", background: "#0B0B0F", color: "#fff", fontFamily: "Inter,sans-serif", fontSize: "13px", fontWeight: "600", cursor: "pointer", flexShrink: "0", display: "inline-flex", alignItems: "center", gap: "7px" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m13 2-3 7h4l-3 7" /><path d="M3 12h2" /><path d="M19 12h2" /></svg>Apply</button>
                </div>
    
                <div style={{ display: "flex", alignItems: "center", gap: "18px", padding: "20px 4px", borderTop: "1px solid #E7E7EC", borderBottom: "1px solid #E7E7EC" }}>
                  <span style={{ width: "42px", height: "42px", borderRadius: "11px", background: "#0B0B0F", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "600", fontSize: "14px", flexShrink: "0" }}>CV</span>
                  <div style={{ flex: "1", minWidth: "0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}><span style={{ fontSize: "15px", fontWeight: "600", color: "#0B0B0F" }}>Inside Sales Specialist</span></div>
                    <div style={{ display: "flex", alignItems: "center", gap: "9px", fontFamily: "'Space Mono',monospace", fontSize: "11px", letterSpacing: "0.03em", color: "#7A7A86" }}><span style={{ fontWeight: "700", color: "#3A3A44" }}>CVS</span><span style={{ color: "#D8D8E0" }}>·</span><span>Hyderabad</span><span style={{ color: "#D8D8E0" }}>·</span><span>IT Sales</span></div>
                  </div>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "13px", fontWeight: "700", color: "#0B0B0F", flexShrink: "0" }}>₹8–12 LPA</span>
                  <button style={{ width: "38px", height: "38px", borderRadius: "10px", border: "1px solid #5B4BF5", background: "rgba(91,75,245,0.07)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: "0" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="#5B4BF5" stroke="#5B4BF5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg></button>
                  <button style={{ height: "38px", padding: "0 16px", border: "1px solid #E7E7EC", borderRadius: "10px", background: "#fff", fontFamily: "Inter,sans-serif", fontSize: "13px", fontWeight: "600", color: "#3A3A44", cursor: "pointer", flexShrink: "0" }}>Details</button>
                  <button style={{ height: "38px", padding: "0 18px", border: "none", borderRadius: "10px", background: "#0B0B0F", color: "#fff", fontFamily: "Inter,sans-serif", fontSize: "13px", fontWeight: "600", cursor: "pointer", flexShrink: "0", display: "inline-flex", alignItems: "center", gap: "7px" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m13 2-3 7h4l-3 7" /><path d="M3 12h2" /><path d="M19 12h2" /></svg>Apply</button>
                </div>
            </div>
    
          </div>
        
    </div>
  );
}
