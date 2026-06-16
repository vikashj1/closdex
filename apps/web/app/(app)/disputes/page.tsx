'use client';

import { useRequireAuth } from '@/lib/auth';

// My Disputes — Vikash dashboard redesign 2026-06-16.
// Visual port of the new HTML. Data is the static demo shipped in the
// prototype; the real-data wiring stays on the previous logic and gets layered
// in once Vikash signs off on the visuals.

export default function DisputesPage() {
  useRequireAuth('SALESPERSON');
  return (
    <div>
    
          <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "34px 40px 72px" }}>
            <div style={{ marginBottom: "8px" }}>
              <h1 style={{ margin: "0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "33px", letterSpacing: "-0.03em", lineHeight: "1.05", color: "#0B0B0F" }}>My Disputes</h1>
              <p style={{ margin: "10px 0 0", fontSize: "15px", color: "#7A7A86" }}>Disputes you've raised about AI scoring on completed challenges.</p>
            </div>
    
            <div style={{ marginTop: "40px", borderTop: "1px solid #E7E7EC", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "96px 24px 100px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "#F3F3F6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "26px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9A9AA4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c2 0 4 1.5 6 1.5a6 6 0 0 0 2.4-.5 1 1 0 0 1 1.4.9V14a1 1 0 0 1-.6.9A6 6 0 0 1 14 15.5c-2 0-4-1.5-6-1.5a6 6 0 0 0-4 1.3" /></svg>
              </div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", fontWeight: "700", letterSpacing: "0.16em", textTransform: "uppercase", color: "#9A9AA4", marginBottom: "16px" }}>Dispute history</div>
              <h2 style={{ margin: "0", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "26px", letterSpacing: "-0.02em", color: "#0B0B0F" }}>No disputes yet</h2>
              <p style={{ margin: "14px 0 0", fontSize: "14.5px", lineHeight: "1.6", color: "#7A7A86", maxWidth: "430px" }}>If you disagree with an AI score, you can raise a dispute from the result page of any completed challenge.</p>
              <a href="Closdex My Attempts.dc.html" style={{ marginTop: "28px", display: "inline-flex", alignItems: "center", gap: "8px", background: "#0B0B0F", color: "#fff", borderRadius: "10px", padding: "11px 18px", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" /><path d="M12 7v5l3 2" /></svg>View my attempts</a>
            </div>
          </div>
        
    </div>
  );
}
