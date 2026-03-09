import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/api";
import { Card, Button, Input } from "../components/UI";

export default function Login({ onNavigate }) {
  const { login } = useAuth();
  const [email, setEmail]       = useState("doctor@clinic.com");
  const [password, setPassword] = useState("password123");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await loginUser(email, password);
      login(data.token, data.user);
      onNavigate("dashboard");
    } catch (e) {
      setError(e.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 50%, #f0f9ff 100%)",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }} className="animate-fade-in">
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              background: "var(--teal)",
              borderRadius: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 8px 24px rgba(13,148,136,0.3)",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="serif" style={{ fontSize: "32px", color: "var(--text-primary)", marginBottom: "6px" }}>
            DentalScript
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>AI-Powered Transcription System</p>
        </div>

        <Card>
          <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "24px" }}>Welcome back</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor@clinic.com"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              error={error}
            />

            {error && (
              <div
                style={{
                  background: "var(--red-light)",
                  border: "1px solid #fca5a5",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  fontSize: "14px",
                  color: "#991b1b",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {error}
              </div>
            )}

            <Button size="xl" onClick={handleLogin} loading={loading} disabled={!email || !password}>
              {!loading && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
                </svg>
              )}
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </div>

          <div
            style={{
              marginTop: "20px",
              padding: "12px 14px",
              background: "var(--surface-2)",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              fontSize: "13px",
              color: "var(--text-muted)",
            }}
          >
            <strong style={{ color: "var(--text-secondary)" }}>Demo credentials:</strong>
            <br />
            doctor@clinic.com / password123
          </div>
        </Card>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--text-muted)" }}>
          HIPAA Compliant · 256-bit Encrypted · SOC 2 Type II
        </p>
      </div>
    </div>
  );
}
