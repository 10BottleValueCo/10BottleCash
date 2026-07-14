import { useState } from "react";
import { Link, useLocation } from "wouter";
import { login, initAuth } from "@/lib/auth";

initAuth();

const inputStyle: React.CSSProperties = {
  backgroundColor: "#111111", border: "1px solid #333333", color: "#ffffff",
  padding: "10px 12px", fontSize: "13px", borderRadius: "2px", outline: "none", width: "100%",
};

const labelStyle: React.CSSProperties = {
  fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em",
  textTransform: "uppercase", color: "#cccccc",
};

export function SignIn() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const user = login(email, password);
    if (!user) { setError("Неверный email или пароль"); return; }
    navigate(user.role === "admin" ? "/admin" : "/dashboard");
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col" style={{ padding: "24px" }}>
      <Link href="/" style={{ color: "#888888", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: "6px", width: "fit-content" }}>
        ← Back
      </Link>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div style={{ width: "100%", maxWidth: "300px", display: "flex", flexDirection: "column", gap: "32px" }}>
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "8px" }}>
            <h1 style={{ fontSize: "20px", fontWeight: 600, letterSpacing: "0.04em" }}>
              Sign in to your account
            </h1>
            <p style={{ color: "#888888", fontSize: "13px" }}>Welcome back to 10BottleCash</p>
          </div>

          <form style={{ display: "flex", flexDirection: "column", gap: "20px" }} onSubmit={onSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={labelStyle}>Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
            </div>
            {error && <div style={{ fontSize: "12px", color: "#ef4444" }}>{error}</div>}
            <button type="submit" style={{ backgroundColor: "#F5A623", color: "#000000", padding: "14px", fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", border: "none", borderRadius: "2px", cursor: "pointer", width: "100%", marginTop: "4px" }}>
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
