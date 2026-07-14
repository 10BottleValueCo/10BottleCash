import { useState } from "react";
import { Link, useLocation } from "wouter";
import { login, initAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";

initAuth();

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

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const user = login(email, password);
    if (!user) { setError(tr("wrongCredentials")); return; }
    navigate(user.role === "admin" ? "/admin" : "/dashboard");
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
            <button type="submit" style={{ backgroundColor: "#F5A623", color: "#000000", padding: "14px", fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", border: "none", borderRadius: "2px", cursor: "pointer", width: "100%", marginTop: "4px" }}>
              {tr("signIn")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
