'use client';

import { useRequireAuth } from '@/lib/auth';

// Learn — Vikash dashboard redesign 2026-06-16.
// Visual port of the new HTML. Data is the static demo shipped in the
// prototype; the real-data wiring stays on the previous logic and gets layered
// in once Vikash signs off on the visuals.

export default function LearnPage() {
  useRequireAuth('SALESPERSON');
  return (
    <div>
    
          <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "34px 40px 72px" }}>
            <div style={{ marginBottom: "8px" }}>
              <h1 style={{ margin: "0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "33px", letterSpacing: "-0.03em", lineHeight: "1.05", color: "#0B0B0F" }}>Learning Hub</h1>
              <p style={{ margin: "10px 0 0", fontSize: "15px", color: "#7A7A86" }}>Improve your sales craft. Earn points for every quiz you pass.</p>
            </div>
    
            <div style={{ marginTop: "40px", borderTop: "1px solid #E7E7EC", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "96px 24px 100px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "rgba(91,75,245,0.07)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "26px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5B4BF5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 7v14" /><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" /></svg>
              </div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", fontWeight: "700", letterSpacing: "0.16em", textTransform: "uppercase", color: "#9A9AA4", marginBottom: "16px" }}>Learning tracks</div>
              <h2 style={{ margin: "0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "26px", letterSpacing: "-0.02em", color: "#0B0B0F" }}>No learning tracks yet</h2>
              <p style={{ margin: "14px 0 0", fontSize: "14.5px", lineHeight: "1.6", color: "#7A7A86", maxWidth: "420px" }}>New tracks drop every week — discovery, objection handling, and closing modules are on the way. Check back soon.</p>
              <a href="Closdex Challenges.dc.html" style={{ marginTop: "28px", display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "14px", fontWeight: "600", color: "#3A2DC4", textDecoration: "none" }}>Earn points with a challenge instead<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg></a>
            </div>
          </div>
        
    </div>
  );
}
