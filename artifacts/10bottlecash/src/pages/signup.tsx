import { useState } from "react";
import { Link, useLocation } from "wouter";
import { registerClient, registerSupplier } from "@/lib/auth";

const inp: React.CSSProperties = {
  backgroundColor: "#111111",
  border: "1px solid #333333",
  color: "#ffffff",
  padding: "10px 12px",
  fontSize: "13px",
  borderRadius: "2px",
  outline: "none",
  width: "100%",
};

const lbl: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#cccccc",
  display: "block",
  marginBottom: "6px",
};

export function SignUp() {
  const [, navigate] = useLocation();
  const [role, setRole] = useState<"client" | "supplier">("client");
  const [form, setForm] = useState({ email: "", password: "", confirm: "", code: "" });
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password || !form.confirm) {
      setError("Please fill in all fields."); return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match."); return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters."); return;
    }

    if (role === "client") {
      const ok = registerClient(form.email, form.password, form.email.split("@")[0]);
      if (!ok) { setError("This email is already registered."); return; }
      navigate("/signin");
    } else {
      if (!form.code.trim()) { setError("Please enter the supplier invite code."); return; }
      const result = registerSupplier(form.email, form.password, form.email.split("@")[0], form.code);
      if (result === "badCode") { setError("Invalid supplier code. Please contact support@10bottlevalue.co"); return; }
      if (result === "emailTaken") { setError("This email is already registered."); return; }
      navigate("/dashboard");
    }
  };

  const roleBtn = (r: "client" | "supplier"): React.CSSProperties => ({
    flex: 1,
    padding: "10px",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    border: "1px solid " + (role === r ? "#F5A623" : "#2a2a2a"),
    borderRadius: "2px",
    cursor: "pointer",
    backgroundColor: role === r ? "#F5A62320" : "transparent",
    color: role === r ? "#F5A623" : "#666",
    transition: "all 0.15s",
  });

  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col" style={{ padding: "24px" }}>
      <Link
        href="/"
        style={{
          color: "#888888", fontSize: "12px", letterSpacing: "0.1em",
          textTransform: "uppercase", display: "inline-flex", alignItems: "center",
          gap: "6px", width: "fit-content",
        }}
      >
        ← Back
      </Link>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div style={{ width: "100%", maxWidth: "320px", display: "flex", flexDirection: "column", gap: "28px" }}>

          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "20px", fontWeight: 600, letterSpacing: "0.04em", marginBottom: "6px" }}>
              Create account
            </h1>
            <p style={{ color: "#888", fontSize: "13px" }}>Join 10BottleCash</p>
          </div>

          {/* Role toggle */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button style={roleBtn("client")} onClick={() => setRole("client")} type="button">
              Client
            </button>
            <button style={roleBtn("supplier")} onClick={() => setRole("supplier")} type="button">
              Supplier
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            <div>
              <label style={lbl}>Email address</label>
              <input style={inp} type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" autoComplete="email" />
            </div>

            <div>
              <label style={lbl}>Password</label>
              <input style={inp} type="password" value={form.password} onChange={set("password")} placeholder="At least 6 characters" autoComplete="new-password" />
            </div>

            <div>
              <label style={lbl}>Confirm password</label>
              <input style={inp} type="password" value={form.confirm} onChange={set("confirm")} placeholder="Repeat your password" autoComplete="new-password" />
            </div>

            {role === "supplier" && (
              <div>
                <label style={lbl}>Supplier invite code</label>
                <input
                  style={{ ...inp, letterSpacing: "0.12em", fontFamily: "monospace" }}
                  type="text"
                  value={form.code}
                  onChange={set("code")}
                  placeholder="10-letter code"
                  maxLength={10}
                  autoComplete="off"
                />
                <p style={{ fontSize: "11px", color: "#555", marginTop: "6px" }}>
                  Contact <span style={{ color: "#F5A623" }}>support@10bottlevalue.co</span> to get the code.
                </p>
              </div>
            )}

            {error && (
              <p style={{ fontSize: "12px", color: "#ef4444", padding: "8px 12px", backgroundColor: "#ef444410", border: "1px solid #ef444430", borderRadius: "2px" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              style={{
                backgroundColor: "#F5A623", color: "#000", padding: "14px",
                fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase", border: "none", borderRadius: "2px",
                cursor: "pointer", width: "100%", marginTop: "4px",
              }}
            >
              {role === "client" ? "Create Account" : "Join as Supplier"}
            </button>
          </form>

          <div style={{ textAlign: "center" }}>
            <Link href="/signin" style={{ color: "#888", fontSize: "13px" }}>
              Already have an account?{" "}
              <span style={{ color: "#F5A623" }}>Sign in</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
