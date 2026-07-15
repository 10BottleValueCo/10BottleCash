import { useState } from "react";
import { Link, useLocation } from "wouter";
import { login } from "@/lib/auth";
import { useLang } from "@/lib/i18n";

const inputStyle: React.CSSProperties = {
  backgroundColor: "#111111", border: "1px solid #333333", color: "#ffffff",
  padding: "10px 12px", fontSize: "13px", borderRadius: "2px", outline: "none", width: "100%",
};

export function SignIn() {
  const [, navigate] = useLocation();
  const { tr } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      if (!user) { setError(tr("wrongCredentials")); return; }
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch {
      setError(tr("wrongCredentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col" style={{ padding: "24px" }}>
      <Link href="/" style={{ color: "#888888", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: "6px", width: "fit-content" }}>
        {tr("back")}
      </Link>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div style={{ width: "100%", maxWidth: "300px", display: "flex", flexDirection: "column", gap: "32px" }}>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "20px", fontWeight: 600, letterSpacing: "0.04em", marginBottom: "8px" }}>{tr("signInTitle")}</h1>
            <p style={{ color: "#888888", fontSize: "13px" }}>{tr("signInSub")}</p>
          </div>

          <form style={{ display: "flex", flexDirection: "column", gap: "20px" }} onSubmit={onSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#cccccc" }}>{tr("emailAddress")}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#cccccc" }}>{tr("password")}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
            </div>
            {error && <div style={{ fontSize: "12px", color: "#ef4444" }}>{error}</div>}
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: loading ? "#b37a1a" : "#F5A623", color: "#000000", padding: "14px", fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", border: "none", borderRadius: "2px", cursor: loading ? "not-allowed" : "pointer", width: "100%", marginTop: "4px", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Signing in…" : tr("signIn")}
            </button>
          </form>

          <div style={{ textAlign: "center" }}>
            <Link href="/signup" style={{ color: "#888888", fontSize: "13px" }}>
              Don't have an account?{" "}
              <span style={{ color: "#F5A623" }}>Sign up</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
