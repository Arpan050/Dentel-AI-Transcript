// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = "" }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow)",
        border: "1px solid var(--border)",
        padding: "28px",
      }}
      className={className}
    >
      {children}
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  loading,
  size = "md",
  className = "",
  type = "button",
}) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    cursor: disabled || loading ? "not-allowed" : "pointer",
    border: "none",
    transition: "all 0.15s ease",
    letterSpacing: "-0.01em",
    opacity: disabled || loading ? 0.6 : 1,
  };

  const sizes = {
    sm: { padding: "8px 16px",  fontSize: "13px", borderRadius: "8px"  },
    md: { padding: "12px 22px", fontSize: "15px", borderRadius: "10px" },
    lg: { padding: "16px 28px", fontSize: "16px", borderRadius: "12px" },
    xl: { padding: "18px 32px", fontSize: "17px", borderRadius: "14px", width: "100%" },
  };

  const variants = {
    primary:   { background: "var(--teal)",     color: "white" },
    secondary: { background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" },
    danger:    { background: "var(--red)",       color: "white" },
    ghost:     { background: "transparent",      color: "var(--teal)", border: "1px solid var(--teal)" },
    blue:      { background: "var(--blue)",      color: "white" },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{ ...base, ...sizes[size], ...variants[variant] }}
      className={className}
      onMouseEnter={(e) => { if (!disabled && !loading) e.currentTarget.style.filter = "brightness(0.92)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.filter = ""; }}
    >
      {loading && <span className="spinner" />}
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, type = "text", value, onChange, placeholder, error, ...rest }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && (
        <label
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--text-secondary)",
            letterSpacing: "0.02em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          padding: "12px 16px",
          borderRadius: "10px",
          border: `1px solid ${error ? "var(--red)" : "var(--border)"}`,
          fontSize: "15px",
          fontFamily: "'DM Sans', sans-serif",
          outline: "none",
          background: "var(--surface)",
          color: "var(--text-primary)",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--border-focus)")}
        onBlur={(e)  => (e.target.style.borderColor = error ? "var(--red)" : "var(--border)")}
        {...rest}
      />
      {error && <span style={{ fontSize: "12px", color: "var(--red)" }}>{error}</span>}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, color = "teal" }) {
  const colors = {
    teal:  { bg: "var(--teal-light)",  text: "var(--teal-dark)" },
    blue:  { bg: "var(--blue-light)",  text: "#1e40af"          },
    amber: { bg: "var(--amber-light)", text: "#92400e"          },
    green: { bg: "var(--green-light)", text: "#065f46"          },
    red:   { bg: "var(--red-light)",   text: "#991b1b"          },
  };
  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: 600,
        background: colors[color].bg,
        color: colors[color].text,
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </span>
  );
}
