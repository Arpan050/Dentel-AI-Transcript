import { useState, useEffect } from "react";
import { getTranscription, saveTranscription, approveTranscription } from "../services/api";
import { Card, Button, Badge } from "../components/UI";

export default function Transcription({ onNavigate, recordingData }) {
  const [transcription, setTranscription] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [approving, setApproving]         = useState(false);
  const [editedText, setEditedText]       = useState("");
  const [saved, setSaved]                 = useState(false);

  useEffect(() => {
    if (!recordingData?.audioId) return;
    getTranscription(recordingData.audioId)
      .then(({ data }) => {
        // Real backend wraps in data.transcription; mock returns data directly
        const t = data.transcription || data;
        setTranscription(t);
        // Real backend field is edited_text; mock uses text
        setEditedText(t.edited_text || t.text || "");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Transcription error:", err);
        setLoading(false);
      });
  }, [recordingData]);

  const handleSave = async () => {
    setSaving(true);
    await saveTranscription(recordingData.audioId, editedText);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleApprove = async () => {
    setApproving(true);
    await approveTranscription(recordingData.audioId);
    onNavigate("output");
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "24px",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            background: "var(--teal-light)",
            borderRadius: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: "32px", height: "32px" }} className="spinner spinner-teal" />
        </div>

        <div style={{ textAlign: "center" }}>
          <h2 className="serif" style={{ fontSize: "24px", marginBottom: "8px" }}>AI is transcribing…</h2>
          <p style={{ color: "var(--text-muted)" }}>This usually takes 30–60 seconds</p>
        </div>

        {/* Progress bar */}
        <div style={{ width: "240px", height: "4px", background: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
          <div
            style={{ height: "100%", background: "var(--teal)", borderRadius: "2px", animation: "progress-bar 3s ease forwards" }}
          />
        </div>

        {["Uploading audio...", "Analyzing speech...", "Generating transcription..."].map((step, i) => (
          <div
            key={i}
            style={{ fontSize: "13px", color: "var(--text-muted)", animation: `fadeIn 0.5s ease ${i * 0.8}s both` }}
          >
            {step}
          </div>
        ))}
      </div>
    );
  }

  // ── Main review view ───────────────────────────────────────────────────────
  return (
    <div style={{ padding: "36px 32px", maxWidth: "900px", margin: "0 auto" }} className="animate-fade-in">
      {/* Back */}
      <button
        onClick={() => onNavigate("dashboard")}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          color: "var(--text-muted)",
          fontSize: "14px",
          fontFamily: "'DM Sans', sans-serif",
          marginBottom: "24px",
          padding: 0,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Dashboard
      </button>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "28px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1 className="serif" style={{ fontSize: "30px", marginBottom: "6px" }}>Transcription Review</h1>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <MetaChip icon="user">{recordingData?.patientName}</MetaChip>
            <MetaChip icon="calendar">
              {new Date(recordingData?.date).toLocaleString()}
            </MetaChip>
          </div>
        </div>
        <Badge color="blue">AI Generated</Badge>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px" }}>

        {/* Editor column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 600 }}>Conversation Transcript</h3>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Click to edit</span>
            </div>

            <textarea
              value={editedText}
              onChange={(e) => { setEditedText(e.target.value); setSaved(false); }}
              style={{
                width: "100%",
                minHeight: "380px",
                padding: "16px",
                borderRadius: "10px",
                border: "1px solid var(--border)",
                fontSize: "14px",
                lineHeight: 1.7,
                fontFamily: "'DM Sans', sans-serif",
                color: "var(--text-primary)",
                background: "var(--surface-2)",
                resize: "vertical",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--border-focus)")}
              onBlur={(e)  => (e.target.style.borderColor = "var(--border)")}
            />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "14px" }}>
              <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                {(editedText || "").split(" ").filter(Boolean).length} words
              </span>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                {saved && (
                  <span style={{ fontSize: "13px", color: "var(--green)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Saved
                  </span>
                )}
                <Button variant="secondary" size="sm" onClick={handleSave} loading={saving}>
                  Save changes
                </Button>
              </div>
            </div>
          </Card>

          <Button size="xl" onClick={handleApprove} loading={approving}>
            {!approving && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            )}
            {approving ? "Approving…" : "Approve & Generate Output"}
          </Button>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Card>
            <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Clinical Summary
            </h3>
            <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.65 }}>
              {transcription?.summary || transcription?.transcription?.summary || "Processing..."}
            </p>
          </Card>

          <Card>
            <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2.2">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              Instructions Preview
            </h3>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-line" }}>
              {transcription?.instructions || transcription?.transcription?.instructions || "Processing..."}
            </div>
          </Card>

          {/* Warning */}
          <div
            style={{
              background: "var(--amber-light)",
              borderRadius: "var(--radius)",
              padding: "14px 16px",
              border: "1px solid #fde68a",
              display: "flex",
              gap: "10px",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2" style={{ flexShrink: 0, marginTop: "1px" }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8"  x2="12"   y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p style={{ fontSize: "13px", color: "#92400e", lineHeight: 1.5 }}>
              Please review the transcription carefully before approving. Once approved, it will be added to the patient's record.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Small helper ──────────────────────────────────────────────────────────────
function MetaChip({ icon, children }) {
  const paths = {
    user: (
      <>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8"  y1="2" x2="8"  y2="6" />
        <line x1="3"  y1="10" x2="21" y2="10" />
      </>
    ),
  };
  return (
    <span style={{ fontSize: "14px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {paths[icon]}
      </svg>
      {children}
    </span>
  );
}