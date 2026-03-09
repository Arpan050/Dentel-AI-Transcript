import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getRecordings } from "../services/api";
import { Card, Button, Badge } from "../components/UI";

const ICON_PATHS = {
  mic:   <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />,
  clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
  check: <polyline points="20 6 9 17 4 12" />,
  zap:   <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
};
const ICON_COLORS = { teal: "var(--teal)", amber: "var(--amber)", green: "var(--green)", blue: "var(--blue)" };
const BG_COLORS   = { teal: "var(--teal-light)", amber: "var(--amber-light)", green: "var(--green-light)", blue: "var(--blue-light)" };

function formatDate(dateStr) {
  const date  = new Date(dateStr);
  const now   = new Date();
  const diff  = now - date;
  const hours = diff / (1000 * 60 * 60);

  if (hours < 24)  return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  if (hours < 48)  return `Yesterday, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDuration(secs) {
  if (!secs) return "—";
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
}

export default function Dashboard({ onNavigate, setRecordingData }) {
  const { user } = useAuth();
  const [recordings, setRecordings]   = useState([]);
  const [loadingRec, setLoadingRec]   = useState(true);

  // Fetch real recordings from backend
  useEffect(() => {
    getRecordings()
      .then(({ data }) => {
        setRecordings(data.recordings || []);
      })
      .catch((err) => {
        console.error("Failed to load recordings:", err);
      })
      .finally(() => setLoadingRec(false));
  }, []);

  // Compute real stats from recordings
  const today         = new Date().toDateString();
  const todayCount    = recordings.filter(r => new Date(r.created_at).toDateString() === today).length;
  const pendingCount  = recordings.filter(r => r.status === "transcribed").length;
  const approvedCount = recordings.filter(r => r.status === "approved").length;

  const STATS = [
    { label: "Recordings Today",   value: String(todayCount),    icon: "mic",   color: "teal"  },
    { label: "Pending Review",     value: String(pendingCount),  icon: "clock", color: "amber" },
    { label: "Approved",           value: String(approvedCount), icon: "check", color: "green" },
    { label: "Total Recordings",   value: String(recordings.length), icon: "zap", color: "blue" },
  ];

  const handleRecordingClick = (recording) => {
    if (recording.status === "transcribed" || recording.status === "approved") {
      setRecordingData({
        audioId:     recording.id,
        patientName: recording.patient_name,
        date:        recording.created_at,
      });
      onNavigate(recording.status === "approved" ? "output" : "transcription");
    }
  };

  return (
    <div style={{ padding: "36px 32px", maxWidth: "1100px", margin: "0 auto" }} className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 className="serif" style={{ fontSize: "34px", marginBottom: "6px" }}>
          Good morning,{" "}
          <span style={{ color: "var(--teal)" }}>{user?.name?.split(" ")[1]}</span>
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "16px" }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
        {STATS.map((s, i) => (
          <div key={i} style={{
            background: "var(--surface)", borderRadius: "var(--radius)",
            border: "1px solid var(--border)", padding: "20px",
            boxShadow: "var(--shadow-sm)", animation: `fadeIn 0.4s ease ${i * 0.08}s both`,
          }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "10px",
              background: BG_COLORS[s.color], display: "flex",
              alignItems: "center", justifyContent: "center", marginBottom: "12px",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ICON_COLORS[s.color]} strokeWidth="2.2">
                {ICON_PATHS[s.icon]}
              </svg>
            </div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "24px" }}>

        {/* Recent recordings */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600 }}>Recent Recordings</h2>
            <Badge color="teal">{recordings.length} total</Badge>
          </div>

          {/* Loading state */}
          {loadingRec && (
            <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
              <div className="spinner spinner-teal" style={{ margin: "0 auto 12px" }} />
              Loading recordings…
            </div>
          )}

          {/* Empty state */}
          {!loadingRec && recordings.length === 0 && (
            <div style={{
              textAlign: "center", padding: "40px 20px",
              color: "var(--text-muted)", border: "1px dashed var(--border)",
              borderRadius: "12px",
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 12px", display: "block", opacity: 0.4 }}>
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              </svg>
              <p style={{ fontSize: "14px" }}>No recordings yet</p>
              <p style={{ fontSize: "13px", marginTop: "4px" }}>Start your first recording to see it here</p>
            </div>
          )}

          {/* Recording list */}
          {!loadingRec && recordings.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {recordings.slice(0, 8).map((r) => (
                <div key={r.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 14px", borderRadius: "10px",
                  cursor: r.status === "uploaded" || r.status === "processing" ? "default" : "pointer",
                  transition: "background 0.15s",
                }}
                  onMouseEnter={(e) => { if (r.status !== "uploaded") e.currentTarget.style.background = "var(--surface-2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  onClick={() => handleRecordingClick(r)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "10px",
                      background: r.status === "approved" ? "var(--green-light)"
                        : r.status === "transcribed" ? "var(--blue-light)"
                        : r.status === "processing" ? "var(--amber-light)"
                        : "var(--surface-2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke={r.status === "approved" ? "var(--green)"
                          : r.status === "transcribed" ? "var(--blue)"
                          : r.status === "processing" ? "var(--amber)"
                          : "var(--text-muted)"}
                        strokeWidth="2.5">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 500 }}>{r.patient_name}</div>
                      <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                        {formatDate(r.created_at)} · {formatDuration(r.duration_secs)}
                      </div>
                    </div>
                  </div>
                  <Badge color={
                    r.status === "approved"    ? "green"
                    : r.status === "transcribed" ? "blue"
                    : r.status === "processing"  ? "amber"
                    : r.status === "failed"      ? "red"
                    : "teal"
                  }>
                    {r.status === "transcribed" ? "Review" : r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* CTA + tips */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{
            background: "linear-gradient(135deg, var(--teal) 0%, #0f766e 100%)",
            borderRadius: "var(--radius-lg)", padding: "28px", color: "white",
            boxShadow: "0 8px 32px rgba(13,148,136,0.25)",
          }}>
            <div style={{ marginBottom: "20px" }}>
              <div style={{
                width: "52px", height: "52px", background: "rgba(255,255,255,0.2)",
                borderRadius: "14px", display: "flex", alignItems: "center",
                justifyContent: "center", marginBottom: "14px",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8"  y1="23" x2="16" y2="23"/>
                </svg>
              </div>
              <h3 className="serif" style={{ fontSize: "22px", marginBottom: "8px" }}>New Recording</h3>
              <p style={{ fontSize: "14px", opacity: 0.85, lineHeight: 1.5 }}>
                Start a new consultation recording with AI transcription
              </p>
            </div>
            <button onClick={() => onNavigate("recording")} style={{
              width: "100%", padding: "13px", background: "white",
              color: "var(--teal-dark)", border: "none", borderRadius: "10px",
              fontSize: "15px", fontWeight: 600, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", transition: "opacity 0.15s",
            }}
              onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.target.style.opacity = "1")}
            >
              Start Recording →
            </button>
          </div>

          <Card>
            <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "14px" }}>Quick Tips</h3>
            {[
              "Ensure quiet environment for best accuracy",
              "Speak clearly and at normal pace",
              "Obtain patient consent before recording",
            ].map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", marginBottom: i < 2 ? "10px" : 0 }}>
                <div style={{
                  width: "20px", height: "20px", background: "var(--teal-light)",
                  borderRadius: "50%", display: "flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0, marginTop: "1px",
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>{tip}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}