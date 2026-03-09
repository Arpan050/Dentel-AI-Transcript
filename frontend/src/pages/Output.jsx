import { useState } from "react";
import { Button } from "../components/UI";

const buildSummaryText = (recordingData) => `DENTAL CONSULTATION SUMMARY
${"─".repeat(40)}
Patient:   ${recordingData?.patientName || "N/A"}
Date:      ${new Date(recordingData?.date || Date.now()).toLocaleString()}
Clinician: Dr. Sarah Chen
${"─".repeat(40)}

CLINICAL SUMMARY
Patient presented with cold sensitivity on upper right quadrant. Diagnosis: enamel erosion on tooth #3 with mesial surface involvement. Treatment plan: fluoride application + composite restoration. Patient education provided on dietary modifications and oral hygiene.

POST-VISIT INSTRUCTIONS
1. Avoid cold beverages for 48 hours
2. Use sensitivity toothpaste (Sensodyne) twice daily
3. Avoid acidic foods and drinks (citrus, soda) for 2 weeks
4. Use soft-bristled toothbrush only
5. Schedule follow-up in 2 weeks for composite restoration
6. Call clinic if pain worsens or swelling occurs

NEXT APPOINTMENT
Follow-up in 2 weeks for composite restoration on tooth #3`;

export default function Output({ onNavigate, recordingData }) {
  const [copied, setCopied] = useState(null);

  const summaryText = buildSummaryText(recordingData);

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadSummary = () => {
    const blob = new Blob([summaryText], { type: "text/plain" });
    const a    = document.createElement("a");
    a.href     = URL.createObjectURL(blob);
    a.download = `${(recordingData?.patientName || "patient").replace(/\s+/g, "_")}_visit_summary.txt`;
    a.click();
  };

  const INSTRUCTIONS = [
    "Avoid cold beverages for 48 hours",
    "Use sensitivity toothpaste (Sensodyne) twice daily",
    "Avoid acidic foods and drinks (citrus, soda) for 2 weeks",
    "Use soft-bristled toothbrush only",
    "Schedule follow-up in 2 weeks for composite restoration",
    "Call clinic if pain worsens or swelling occurs",
  ];

  const PATIENT_FIELDS = [
    ["Patient",    recordingData?.patientName || "N/A"],
    ["Date",       new Date(recordingData?.date || Date.now()).toLocaleDateString()],
    ["Time",       new Date(recordingData?.date || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })],
    ["Clinician",  "Dr. Sarah Chen"],
    ["Tooth",      "#3 (Upper Right)"],
    ["Status",     "Approved ✓"],
  ];

  return (
    <div style={{ padding: "36px 32px", maxWidth: "860px", margin: "0 auto" }} className="animate-fade-in">

      {/* Success banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
          border: "1px solid #86efac",
          borderRadius: "var(--radius-lg)",
          padding: "20px 24px",
          marginBottom: "28px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            background: "var(--green)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div>
          <h3 style={{ fontSize: "17px", fontWeight: 600, color: "#065f46", marginBottom: "3px" }}>
            Transcription Approved
          </h3>
          <p style={{ fontSize: "14px", color: "#047857" }}>
            The consultation has been transcribed, reviewed, and added to patient records.
          </p>
        </div>
      </div>

      {/* Title + actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1 className="serif" style={{ fontSize: "30px", marginBottom: "4px" }}>Visit Output</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
            {recordingData?.patientName} · {new Date(recordingData?.date || Date.now()).toLocaleDateString()}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Button variant="secondary" size="sm" onClick={() => copyText(summaryText, "all")}>
            {copied === "all" ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy All
              </>
            )}
          </Button>

          <Button size="sm" onClick={downloadSummary}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download
          </Button>
        </div>
      </div>

      {/* Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Patient details */}
        <Section
          title="Patient Details"
          icon={
            <>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </>
          }
          iconColor="var(--teal)"
          iconBg="var(--teal-light)"
          delay={0}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {PATIENT_FIELDS.map(([k, v]) => (
              <div
                key={k}
                style={{ padding: "10px 14px", background: "var(--surface-2)", borderRadius: "8px", border: "1px solid var(--border)" }}
              >
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: "3px" }}>
                  {k}
                </div>
                <div style={{ fontSize: "14px", fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Clinical summary */}
        <Section
          title="Clinical Summary"
          icon={
            <>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </>
          }
          iconColor="var(--blue)"
          iconBg="var(--blue-light)"
          delay={0.1}
          copyKey="summary"
          copyContent="Patient presented with cold sensitivity on upper right quadrant. Diagnosis: enamel erosion on tooth #3 with mesial surface involvement. Treatment plan: fluoride application + composite restoration."
          onCopy={copyText}
          copied={copied}
        >
          <p style={{ fontSize: "14.5px", lineHeight: 1.75, color: "var(--text-secondary)" }}>
            Patient presented with cold sensitivity on upper right quadrant. Diagnosis: enamel erosion on tooth #3
            with mesial surface involvement. Treatment plan: fluoride application + composite restoration. Patient
            education provided on dietary modifications and oral hygiene.
          </p>
        </Section>

        {/* Patient instructions */}
        <Section
          title="Patient Instructions"
          icon={
            <>
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </>
          }
          iconColor="var(--green)"
          iconBg="var(--green-light)"
          delay={0.2}
          copyKey="instructions"
          copyContent={INSTRUCTIONS.map((item, i) => `${i + 1}. ${item}`).join("\n")}
          onCopy={copyText}
          copied={copied}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {INSTRUCTIONS.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "12px",
                  padding: "10px 14px",
                  background: "var(--surface-2)",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    background: "var(--green-light)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--green)",
                  }}
                >
                  {i + 1}
                </div>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.5, paddingTop: "2px" }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Bottom actions */}
      <div style={{ display: "flex", gap: "12px", marginTop: "24px", flexWrap: "wrap" }}>
        <Button variant="secondary" onClick={() => onNavigate("recording")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          </svg>
          New Recording
        </Button>
        <Button onClick={() => onNavigate("dashboard")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="3"  y="3"  width="7" height="7" />
            <rect x="14" y="3"  width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3"  y="14" width="7" height="7" />
          </svg>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

// ── Reusable section card ─────────────────────────────────────────────────────
function Section({ title, icon, iconColor, iconBg, delay = 0, copyKey, copyContent, onCopy, copied, children }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border)",
        padding: "24px",
        boxShadow: "var(--shadow-sm)",
        animation: `fadeIn 0.4s ease ${delay}s both`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", background: iconBg, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
              {icon}
            </svg>
          </div>
          <h3 style={{ fontSize: "16px", fontWeight: 600 }}>{title}</h3>
        </div>

        {copyKey && (
          <button
            onClick={() => onCopy(copyContent, copyKey)}
            style={{
              background: "none",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "12px",
              cursor: "pointer",
              color: "var(--text-muted)",
              fontFamily: "'DM Sans', sans-serif",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {copied === copyKey ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </>
            )}
          </button>
        )}
      </div>

      {children}
    </div>
  );
}
