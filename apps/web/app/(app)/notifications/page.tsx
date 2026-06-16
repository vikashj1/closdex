'use client';

import { useRequireAuth } from '@/lib/auth';

// Notifications — Vikash dashboard redesign 2026-06-16.
// Visual port of the new HTML. Data is the static demo shipped in the
// prototype; the real-data wiring stays on the previous logic and gets layered
// in once Vikash signs off on the visuals.

export default function NotificationsPage() {
  useRequireAuth('SALESPERSON');
  return (
    <div>
    
          <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "34px 40px 72px" }}>
    
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", flexWrap: "wrap", marginBottom: "30px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "14px" }}>
                <h1 style={{ margin: "0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "33px", letterSpacing: "-0.03em", lineHeight: "1.05", color: "#0B0B0F" }}>Notifications</h1>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "11.5px", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase", color: "#3A2DC4" }}>2 unread</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "9px", cursor: "pointer", fontSize: "13.5px", fontWeight: "500", color: "#3A3A44" }}>Unread only<span style={{ position: "relative", width: "38px", height: "22px", borderRadius: "100px", background: "#E7E7EC", display: "inline-block" }}><span style={{ position: "absolute", top: "3px", left: "3px", width: "16px", height: "16px", borderRadius: "50%", background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }}></span></span></label>
                <button style={{ display: "inline-flex", alignItems: "center", gap: "7px", height: "36px", padding: "0 14px", border: "1px solid #E7E7EC", borderRadius: "10px", background: "#fff", fontFamily: "Inter,sans-serif", fontSize: "13px", fontWeight: "600", color: "#3A3A44", cursor: "pointer" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>Mark all read</button>
              </div>
            </div>
    
            <div>
    
              <div style={{ display: "flex", alignItems: "flex-start", gap: "15px", padding: "20px 6px", borderTop: "1px solid #E7E7EC", background: "rgba(91,75,245,0.025)" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#5B4BF5", marginTop: "6px", flexShrink: "0" }}></span>
                <div style={{ flex: "1", minWidth: "0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "5px" }}><span style={{ fontSize: "14.5px", fontWeight: "600", color: "#0B0B0F" }}>You're hired — Enterprise Account Executive</span><span style={{ fontFamily: "'Space Mono',monospace", fontSize: "9px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "#3A2DC4", background: "rgba(91,75,245,0.1)", padding: "2px 6px", borderRadius: "5px" }}>New</span></div>
                  <div style={{ fontSize: "13.5px", lineHeight: "1.5", color: "#7A7A86" }}>CVS marked your application as Hired. Congratulations on the offer.</div>
                </div>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", letterSpacing: "0.04em", color: "#9A9AA4", flexShrink: "0", marginTop: "2px" }}>13d ago</span>
              </div>
    
              <div style={{ display: "flex", alignItems: "flex-start", gap: "15px", padding: "20px 6px", borderTop: "1px solid #E7E7EC", background: "rgba(91,75,245,0.025)" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#5B4BF5", marginTop: "6px", flexShrink: "0" }}></span>
                <div style={{ flex: "1", minWidth: "0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "5px" }}><span style={{ fontSize: "14.5px", fontWeight: "600", color: "#0B0B0F" }}>Offer extended</span><span style={{ fontFamily: "'Space Mono',monospace", fontSize: "9px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "#3A2DC4", background: "rgba(91,75,245,0.1)", padding: "2px 6px", borderRadius: "5px" }}>New</span></div>
                  <div style={{ fontSize: "13.5px", lineHeight: "1.5", color: "#7A7A86" }}>CVS sent you an offer for Enterprise Account Executive.</div>
                </div>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", letterSpacing: "0.04em", color: "#9A9AA4", flexShrink: "0", marginTop: "2px" }}>14d ago</span>
              </div>
    
              <div style={{ display: "flex", alignItems: "flex-start", gap: "15px", padding: "20px 6px", borderTop: "1px solid #E7E7EC", background: "transparent" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "transparent", marginTop: "6px", flexShrink: "0" }}></span>
                <div style={{ flex: "1", minWidth: "0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "5px" }}><span style={{ fontSize: "14.5px", fontWeight: "600", color: "#0B0B0F" }}>Interview scheduled</span></div>
                  <div style={{ fontSize: "13.5px", lineHeight: "1.5", color: "#7A7A86" }}>Your interview with the CVS hiring team is confirmed.</div>
                </div>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", letterSpacing: "0.04em", color: "#9A9AA4", flexShrink: "0", marginTop: "2px" }}>16d ago</span>
              </div>
    
              <div style={{ display: "flex", alignItems: "flex-start", gap: "15px", padding: "20px 6px", borderTop: "1px solid #E7E7EC", background: "transparent" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "transparent", marginTop: "6px", flexShrink: "0" }}></span>
                <div style={{ flex: "1", minWidth: "0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "5px" }}><span style={{ fontSize: "14.5px", fontWeight: "600", color: "#0B0B0F" }}>Application shortlisted</span></div>
                  <div style={{ fontSize: "13.5px", lineHeight: "1.5", color: "#7A7A86" }}>CVS shortlisted you for Enterprise Account Executive.</div>
                </div>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", letterSpacing: "0.04em", color: "#9A9AA4", flexShrink: "0", marginTop: "2px" }}>18d ago</span>
              </div>
    
              <div style={{ display: "flex", alignItems: "flex-start", gap: "15px", padding: "20px 6px", borderTop: "1px solid #E7E7EC", borderBottom: "1px solid #E7E7EC", background: "transparent" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "transparent", marginTop: "6px", flexShrink: "0" }}></span>
                <div style={{ flex: "1", minWidth: "0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "5px" }}><span style={{ fontSize: "14.5px", fontWeight: "600", color: "#0B0B0F" }}>Application viewed</span></div>
                  <div style={{ fontSize: "13.5px", lineHeight: "1.5", color: "#7A7A86" }}>A recruiter at CVS viewed your application.</div>
                </div>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", letterSpacing: "0.04em", color: "#9A9AA4", flexShrink: "0", marginTop: "2px" }}>20d ago</span>
              </div>
            </div>
    
          </div>
        
    </div>
  );
}
