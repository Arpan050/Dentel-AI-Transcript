import { useState, useRef, useEffect } from "react";
import { Button, Badge } from "./UI";

const formatTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/**
 * Self-contained audio recorder.
 *
 * Props:
 *   onRecordingComplete(blob, durationSecs) — called when the user stops recording
 *   disabled — prevent starting until parent conditions are met
 */
export default function AudioRecorder({ onRecordingComplete, disabled = false }) {
  const [isRecording, setIsRecording]         = useState(false);
  const [audioBlob, setAudioBlob]             = useState(null);
  const [audioUrl, setAudioUrl]               = useState(null);
  const [timer, setTimer]                     = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError]                     = useState("");

  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);
  const timerRef         = useRef(null);
  const streamRef        = useRef(null);

  // Cleanup timer on unmount
  useEffect(() => () => clearInterval(timerRef.current), []);

  const startRecording = async () => {
    setError("");
    setPermissionDenied(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
        onRecordingComplete?.(blob, timer);
      };

      mr.start(100);
      setIsRecording(true);
      setTimer(0);
      setAudioBlob(null);
      setAudioUrl(null);
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } catch (err) {
      if (err.name === "NotAllowedError") setPermissionDenied(true);
      else setError("Could not access microphone: " + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setTimer(0);
    onRecordingComplete?.(null, 0);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Permission error */}
      {permissionDenied && (
        <div
          style={{
            background: "var(--red-light)",
            borderRadius: "10px",
            padding: "12px 16px",
            fontSize: "14px",
            color: "#991b1b",
            border: "1px solid #fca5a5",
          }}
        >
          ⚠️ Microphone access denied. Please enable microphone permissions in your browser settings.
        </div>
      )}

      {error && (
        <div
          style={{
            background: "var(--red-light)",
            borderRadius: "10px",
            padding: "12px 16px",
            fontSize: "14px",
            color: "#991b1b",
          }}
        >
          {error}
        </div>
      )}

      {/* Timer display */}
      <div
        style={{
          background: isRecording ? "linear-gradient(135deg, #fef2f2, #fee2e2)" : "var(--surface-2)",
          borderRadius: "16px",
          padding: "28px",
          textAlign: "center",
          border: `1px solid ${isRecording ? "#fca5a5" : "var(--border)"}`,
          transition: "all 0.3s",
        }}
      >
        {isRecording && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <span className="recording-dot" />
            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--red)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Recording
            </span>
          </div>
        )}

        <div
          style={{
            fontSize: "52px",
            fontWeight: 300,
            color: isRecording ? "var(--red)" : "var(--text-muted)",
            letterSpacing: "0.05em",
            lineHeight: 1,
          }}
        >
          {formatTime(timer)}
        </div>

        {!isRecording && !audioBlob && (
          <p style={{ marginTop: "8px", fontSize: "14px", color: "var(--text-muted)" }}>
            {disabled ? "Complete patient info to start" : "Ready to record"}
          </p>
        )}
      </div>

      {/* Control buttons */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
        {!isRecording && !audioBlob && (
          <Button size="lg" onClick={startRecording} disabled={disabled}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
            </svg>
            Start Recording
          </Button>
        )}

        {isRecording && (
          <Button size="lg" variant="danger" onClick={stopRecording}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect width="16" height="16" x="4" y="4" rx="2" />
            </svg>
            Stop Recording
          </Button>
        )}

        {audioBlob && !isRecording && (
          <Button size="sm" variant="secondary" onClick={resetRecording}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-4.88" />
            </svg>
            Re-record
          </Button>
        )}
      </div>

      {/* Audio preview */}
      {audioUrl && (
        <div className="animate-slide-in">
          <audio controls src={audioUrl} style={{ width: "100%", borderRadius: "8px" }} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              background: "var(--surface-2)",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              marginTop: "10px",
            }}
          >
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              {formatTime(timer)} · {(audioBlob.size / 1024).toFixed(0)} KB
            </span>
            <Badge color="teal">Ready to upload</Badge>
          </div>
        </div>
      )}
    </div>
  );
}
