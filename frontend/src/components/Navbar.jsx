import { useAuth } from "../context/AuthContext";
import { Badge } from "./UI";

export default function Navbar({ onNavigate }) {
  const { user, logout } = useAuth();

  return (
    <nav
      style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "0 32px",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Logo */}
      <div
        style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
        onClick={() => onNavigate("dashboard")}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            background: "var(--teal)",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="serif" style={{ fontSize: "20px", color: "var(--text-primary)" }}>
          DentalScript
        </span>
        <Badge color="teal">AI</Badge>
      </div>

      {/* User info + logout */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                background: "var(--teal-light)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--teal-dark)",
              }}
            >
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, lineHeight: 1.2 }}>{user.name}</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{user.role}</div>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          style={{
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "7px 14px",
            fontSize: "13px",
            cursor: "pointer",
            color: "var(--text-secondary)",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
          }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
