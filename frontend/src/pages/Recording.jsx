import { useState } from "react";
import { uploadAudio } from "../services/api";
import AudioRecorder from "../components/AudioRecorder";
import { Card, Button, Input } from "../components/UI";

export default function Recording({ onNavigate, setRecordingData }) {
  const [patientName, setPatientName]         = useState("");
  const [consent, setConsent]                 = useState(false);
  const [audioBlob, setAudioBlob]             = useState(null);
  const [uploading, setUploading]             = useState(false);
  const [uploadError, setUploadError]         = useState("");

  const canRecord = patientName.trim() && consent;

  const handleRecordingComplete = (blob) => {
    setAudioBlob(blob);
  };

  const handleUpload = async () => {
    if (!audioBlob) return;
    setUploading(true);
    setUploadError("");
    try {
      const { data } = await uploadAudio(audioBlob, patientName);
      setRecordingData({ audioId: data.audioId, patientName, date: new Date().toISOString() });
      onNavigate("transcription");
    } catch (e) {
      setUploadError("Upload failed: " + (e.message || "Unknown error"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: "36px 32px", maxWidth: "720px", margin: "0 auto" }} className="animate-fade-in">
      {/* Back button */}
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

      <div style={{ marginBottom: "28px" }}>
        <h1 className="serif" style={{ fontSize: "30px", marginBottom: "6px" }}>New Recording</h1>
        <p style={{ color: "var(--text-muted)" }}>Record your patient consultation for AI transcription</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Step 1 — Patient info */}
        <Card>
          <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <StepBadge>1</StepBadge>
            Patient Information
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Input
              label="Patient Name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Full name of patient"
            />

            {/* Consent checkbox */}
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                cursor: "pointer",
                padding: "14px",
                background: consent ? "var(--teal-light)" : "var(--surface-2)",
                borderRadius: "10px",
                border: `1px solid ${consent ? "var(--teal)" : "var(--border)"}`,
                transition: "all 0.15s",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "5px",
                  border: `2px solid ${consent ? "var(--teal)" : "var(--border)"}`,
                  background: consent ? "var(--teal)" : "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "1px",
                  transition: "all 0.15s",
                }}
              >
                {consent && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ display: "none" }} />
              <div>
                <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>
                  Patient consent obtained
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                  I confirm the patient has been informed and has consented to this recording
                </div>
              </div>
            </label>
          </div>
        </Card>

        {/* Step 2 — Record */}
        <Card>
          <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <StepBadge>2</StepBadge>
            Record Consultation
          </h3>
          <AudioRecorder disabled={!canRecord} onRecordingComplete={handleRecordingComplete} />
        </Card>

        {/* Step 3 — Upload (only when audio is ready) */}
        {audioBlob && (
          <Card className="animate-slide-in">
            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <StepBadge>3</StepBadge>
              Upload for Transcription
            </h3>

            {uploadError && (
              <div
                style={{
                  background: "var(--red-light)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  marginBottom: "16px",
                  fontSize: "14px",
                  color: "#991b1b",
                }}
              >
                {uploadError}
              </div>
            )}

            <Button size="xl" onClick={handleUpload} loading={uploading}>
              {!uploading && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="16 16 12 12 8 16" />
                  <line x1="12" y1="12" x2="12" y2="21" />
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                </svg>
              )}
              {uploading ? "Uploading & Processing…" : "Upload for Transcription"}
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}

// Small numbered circle badge used for step headers
function StepBadge({ children }) {
  return (
    <span
      style={{
        width: "24px",
        height: "24px",
        background: "var(--teal-light)",
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: 700,
        color: "var(--teal)",
      }}
    >
      {children}
    </span>
  );
}
