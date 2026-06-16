'use client';

import { useRequireAuth } from '@/lib/auth';

// Settings — Vikash dashboard redesign 2026-06-16.
// Visual port of the new HTML. Data is the static demo shipped in the
// prototype; the real-data wiring stays on the previous logic and gets layered
// in once Vikash signs off on the visuals.

export default function SettingsPage() {
  useRequireAuth('SALESPERSON');
  return (
    <div>
    
          <div style={{ maxWidth: "760px", margin: "0 auto", padding: "34px 40px 72px" }}>
    
            <h1 style={{ margin: "0 0 22px", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "33px", letterSpacing: "-0.03em", color: "#0B0B0F" }}>Settings</h1>
    
            <nav style={{ display: "flex", alignItems: "center", gap: "26px", borderBottom: "1px solid #E7E7EC", marginBottom: "36px" }}>
              <a href="#" style={{ padding: "12px 2px", textDecoration: "none", fontSize: "14px", fontWeight: "600", color: "#0B0B0F", boxShadow: "inset 0 -2px 0 #0B0B0F" }}>Profile</a>
              <a href="#" style={{ padding: "12px 2px", textDecoration: "none", fontSize: "14px", fontWeight: "600", color: "#7A7A86" }}>Security</a>
            </nav>
    
            <div style={{ display: "flex", flexDirection: "column", gap: "26px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "26px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                  <label style={{ fontSize: "13.5px", fontWeight: "600", color: "#0B0B0F" }}>Display name</label>
                  
                  <input defaultValue="test user" placeholder="" style={{ height: "44px", padding: "0 14px", border: "1px solid #E7E7EC", borderRadius: "10px", background: "#fff", fontFamily: "Inter,sans-serif", fontSize: "14px", color: "#0B0B0F", outline: "none", width: "100%" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                  <label style={{ fontSize: "13.5px", fontWeight: "600", color: "#0B0B0F" }}>Location</label>
                  
                  <input defaultValue="Bengaluru, India" placeholder="" style={{ height: "44px", padding: "0 14px", border: "1px solid #E7E7EC", borderRadius: "10px", background: "#fff", fontFamily: "Inter,sans-serif", fontSize: "14px", color: "#0B0B0F", outline: "none", width: "100%" }} />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                  <label style={{ fontSize: "13.5px", fontWeight: "600", color: "#0B0B0F" }}>Resume URL</label>
                  
                  <input defaultValue="https://drive.google.com/file/d/…" placeholder="Link to your resume or portfolio" style={{ height: "44px", padding: "0 14px", border: "1px solid #E7E7EC", borderRadius: "10px", background: "#fff", fontFamily: "Inter,sans-serif", fontSize: "14px", color: "#0B0B0F", outline: "none", width: "100%" }} />
                </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "26px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                  <label style={{ fontSize: "13.5px", fontWeight: "600", color: "#0B0B0F" }}>Profile visibility</label>
                  <span style={{ fontSize: "12px", color: "#9A9AA4", marginTop: "-5px" }}>Who can see your public profile</span>
                  <div style={{ position: "relative" }}>
                  <select defaultValue="Public" style={{ appearance: "none", WebkitAppearance: "none", height: "44px", padding: "0 38px 0 14px", border: "1px solid #E7E7EC", borderRadius: "10px", background: "#fff", fontFamily: "Inter,sans-serif", fontSize: "14px", color: "#0B0B0F", outline: "none", width: "100%", cursor: "pointer" }}><option>Public</option><option>Unlisted</option><option>Private</option></select>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7A7A86" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><path d="m6 9 6 6 6-6" /></svg>
                </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                  <label style={{ fontSize: "13.5px", fontWeight: "600", color: "#0B0B0F" }}>Expected CTC (₹ LPA)</label>
                  
                  <input defaultValue="18" placeholder="" style={{ height: "44px", padding: "0 14px", border: "1px solid #E7E7EC", borderRadius: "10px", background: "#fff", fontFamily: "Inter,sans-serif", fontSize: "14px", color: "#0B0B0F", outline: "none", width: "100%" }} />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                  <label style={{ fontSize: "13.5px", fontWeight: "600", color: "#0B0B0F" }}>Preferred locations</label>
                  
                  <input defaultValue="Bengaluru, Remote, Mumbai" placeholder="Comma-separated" style={{ height: "44px", padding: "0 14px", border: "1px solid #E7E7EC", borderRadius: "10px", background: "#fff", fontFamily: "Inter,sans-serif", fontSize: "14px", color: "#0B0B0F", outline: "none", width: "100%" }} />
                </div>
    
              <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer", padding: "4px 0" }}>
                <span style={{ width: "20px", height: "20px", borderRadius: "6px", background: "#5B4BF5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0", marginTop: "1px" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>
                <span><span style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#0B0B0F" }}>Open to new opportunities</span><span style={{ display: "block", fontSize: "12.5px", color: "#9A9AA4", marginTop: "3px" }}>Show recruiters you're available and surface matching jobs.</span></span>
              </label>
    
              <div style={{ display: "flex", paddingTop: "8px", borderTop: "1px solid #E7E7EC", marginTop: "6px" }}>
                <button style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "44px", padding: "0 22px", border: "none", borderRadius: "10px", background: "#0B0B0F", color: "#fff", fontFamily: "Inter,sans-serif", fontSize: "14px", fontWeight: "600", cursor: "pointer", marginTop: "22px" }}>Save changes</button>
              </div>
            </div>
    
          </div>
        
    </div>
  );
}
