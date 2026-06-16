'use client';

import { useRequireAuth } from '@/lib/auth';

// Applications — Vikash dashboard redesign 2026-06-16.
// Visual port of the new HTML. Data is the static demo shipped in the
// prototype; the real-data wiring stays on the previous logic and gets layered
// in once Vikash signs off on the visuals.

export default function ApplicationsPage() {
  useRequireAuth('SALESPERSON');
  return (
    <div>
    
          <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "34px 40px 72px" }}>
    
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "24px", flexWrap: "wrap", marginBottom: "28px" }}>
              <h1 style={{ margin: "0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "33px", letterSpacing: "-0.03em", lineHeight: "1.05", color: "#0B0B0F" }}>My Applications <span style={{ color: "#B6B6C0" }}>(1)</span></h1>
              <a href="Closdex Jobs.dc.html" style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "14px", fontWeight: "600", color: "#3A2DC4", textDecoration: "none" }}>Browse jobs<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg></a>
            </div>
    
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "30px" }}>
              <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "7px 14px", borderRadius: "100px", border: "1px solid #0B0B0F", background: "#0B0B0F", textDecoration: "none", fontSize: "13px", fontWeight: "600", color: "#fff" }}>All<span style={{ fontFamily: "'Space Mono',monospace", fontSize: "10.5px", fontWeight: "700", color: "rgba(255,255,255,0.7)" }}>1</span></a>
              <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "7px 14px", borderRadius: "100px", border: "1px solid #E7E7EC", background: "#fff", textDecoration: "none", fontSize: "13px", fontWeight: "500", color: "#3A3A44" }}>Applied<span style={{ fontFamily: "'Space Mono',monospace", fontSize: "10.5px", fontWeight: "700", color: "#B6B6C0" }}>0</span></a>
              <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "7px 14px", borderRadius: "100px", border: "1px solid #E7E7EC", background: "#fff", textDecoration: "none", fontSize: "13px", fontWeight: "500", color: "#3A3A44" }}>Shortlisted<span style={{ fontFamily: "'Space Mono',monospace", fontSize: "10.5px", fontWeight: "700", color: "#B6B6C0" }}>0</span></a>
              <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "7px 14px", borderRadius: "100px", border: "1px solid #E7E7EC", background: "#fff", textDecoration: "none", fontSize: "13px", fontWeight: "500", color: "#3A3A44" }}>Interview<span style={{ fontFamily: "'Space Mono',monospace", fontSize: "10.5px", fontWeight: "700", color: "#B6B6C0" }}>0</span></a>
              <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "7px 14px", borderRadius: "100px", border: "1px solid #E7E7EC", background: "#fff", textDecoration: "none", fontSize: "13px", fontWeight: "500", color: "#3A3A44" }}>Offered<span style={{ fontFamily: "'Space Mono',monospace", fontSize: "10.5px", fontWeight: "700", color: "#B6B6C0" }}>0</span></a>
              <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "7px 14px", borderRadius: "100px", border: "1px solid #E7E7EC", background: "#fff", textDecoration: "none", fontSize: "13px", fontWeight: "500", color: "#3A3A44" }}>Hired<span style={{ fontFamily: "'Space Mono',monospace", fontSize: "10.5px", fontWeight: "700", color: "#B6B6C0" }}>1</span></a>
              <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "7px 14px", borderRadius: "100px", border: "1px solid #E7E7EC", background: "#fff", textDecoration: "none", fontSize: "13px", fontWeight: "500", color: "#3A3A44" }}>Rejected<span style={{ fontFamily: "'Space Mono',monospace", fontSize: "10.5px", fontWeight: "700", color: "#B6B6C0" }}>0</span></a>
            </div>
    
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "18px", padding: "20px 4px", borderTop: "1px solid #E7E7EC", borderBottom: "1px solid #E7E7EC" }}>
                <span style={{ width: "42px", height: "42px", borderRadius: "11px", background: "#0B0B0F", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "600", fontSize: "14px", flexShrink: "0" }}>CV</span>
                <div style={{ flex: "1", minWidth: "0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}><span style={{ fontSize: "15px", fontWeight: "600", color: "#0B0B0F" }}>Enterprise Account Executive</span><span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "2px 9px 2px 7px", borderRadius: "100px", background: "rgba(31,138,91,0.1)", color: "#1F8A5B", fontFamily: "'Space Mono',monospace", fontSize: "9.5px", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase" }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Hired</span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: "9px", fontFamily: "'Space Mono',monospace", fontSize: "11px", letterSpacing: "0.03em", color: "#7A7A86" }}><span style={{ fontWeight: "700", color: "#3A3A44" }}>CVS</span><span style={{ color: "#D8D8E0" }}>·</span><span>Remote</span></div>
                </div>
                <div style={{ textAlign: "right", flexShrink: "0" }}><div style={{ fontFamily: "'Space Mono',monospace", fontSize: "9.5px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A9AA4", marginBottom: "4px" }}>Applied</div><div style={{ fontFamily: "'Space Mono',monospace", fontSize: "12.5px", color: "#3A3A44" }}>Jun 2, 2026</div></div>
                <a href="Closdex Jobs.dc.html" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13.5px", fontWeight: "600", color: "#3A2DC4", textDecoration: "none", flexShrink: "0" }}>View job<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg></a>
              </div>
            </div>
    
          </div>
        
    </div>
  );
}
