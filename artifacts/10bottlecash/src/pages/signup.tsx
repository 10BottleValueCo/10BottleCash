import { useState } from "react";
import { Link, useLocation } from "wouter";
import { registerClient, registerSupplier } from "@/lib/auth";
import { useLang } from "@/lib/i18n";

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
  const { tr, lang, setLang } = useLang();
  const [role, setRole] = useState<"client" | "supplier">("client");
  const [form, setForm] = useState({ email: "", password: "", confirm: "", code: "", company: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password || !form.confirm) {
      setError(tr("fillAllFields")); return;
    }
    if (form.password !== form.confirm) {
      setError(tr("passwordMismatch")); return;
    }
    if (form.password.length < 6) {
      setError(tr("passwordTooShort")); return;
    }

    setLoading(true);
    try {
      if (role === "client") {
        const result = await registerClient(form.email, form.password, form.email.split("@")[0]);
        if (result === "emailTaken") { setError(tr("emailTakenMsg")); return; }
        if (result === "error") { setError(tr("somethingWrong")); return; }
        navigate("/dashboard");
      } else {
        if (!form.company.trim()) { setError(tr("enterCompanyName")); return; }
        if (!form.code.trim()) { setError(tr("enterInviteCode")); return; }
        const result = await registerSupplier(form.email, form.password, form.company.trim(), form.code);
        if (result === "badCode") { setError(tr("badCodeMsg")); return; }
        if (result === "emailTaken") { setError(tr("emailTakenMsg")); return; }
        if (result === "error") { setError(tr("somethingWrong")); return; }
        navigate("/dashboard");
      }
    } finally {
      setLoading(false);
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link
          href="/"
          style={{
            color: "#888888", fontSize: "12px", letterSpacing: "0.1em",
            textTransform: "uppercase", display: "inline-flex", alignItems: "center",
            gap: "6px", width: "fit-content",
          }}
        >
          {tr("back")}
        </Link>
        <div style={{ display: "flex", alignItems: "center", backgroundColor: "#111", border: "1px solid #2a2a2a", borderRadius: "4px", overflow: "hidden" }}>
          <button onClick={() => setLang("en")} style={{ padding: "4px 10px", fontSize: "11px", fontWeight: 700, border: "none", cursor: "pointer", backgroundColor: lang === "en" ? "#F5A623" : "transparent", color: lang === "en" ? "#000" : "#666" }}>EN</button>
          <button onClick={() => setLang("zh")} style={{ padding: "4px 10px", fontSize: "12px", fontWeight: 700, border: "none", cursor: "pointer", backgroundColor: lang === "zh" ? "#F5A623" : "transparent", color: lang === "zh" ? "#000" : "#888", fontFamily: "'Noto Sans SC', sans-serif" }}>中文</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div style={{ width: "100%", maxWidth: "320px", display: "flex", flexDirection: "column", gap: "28px" }}>

          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "20px", fontWeight: 600, letterSpacing: "0.04em", marginBottom: "6px" }}>
              {tr("createAccountTitle")}
            </h1>
            <p style={{ color: "#888", fontSize: "13px" }}>{tr("joinSub")}</p>
          </div>

          {/* Role toggle */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button style={roleBtn("client")} onClick={() => setRole("client")} type="button">{tr("roleClient")}</button>
            <button style={roleBtn("supplier")} onClick={() => setRole("supplier")} type="button">{tr("roleSupplier")}</button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={lbl}>{tr("emailAddress")}</label>
              <input style={inp} type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" autoComplete="email" />
            </div>

            <div>
              <label style={lbl}>{tr("password")}</label>
              <input style={inp} type="password" value={form.password} onChange={set("password")} placeholder={tr("atLeast6Chars")} autoComplete="new-password" />
            </div>

            <div>
              <label style={lbl}>{tr("confirmPassword")}</label>
              <input style={inp} type="password" value={form.confirm} onChange={set("confirm")} placeholder={tr("repeatPassword")} autoComplete="new-password" />
            </div>

            {role === "supplier" && (
              <div>
                <label style={lbl}>{tr("companyName")}</label>
                <input style={inp} type="text" value={form.company} onChange={set("company")} placeholder="Valley Distributors" autoComplete="organization" />
              </div>
            )}

            {role === "supplier" && (
              <div>
                <label style={lbl}>{tr("supplierInviteCodeLabel")}</label>
                <input
                  style={{ ...inp, letterSpacing: "0.12em", fontFamily: "monospace" }}
                  type="text"
                  value={form.code}
                  onChange={set("code")}
                  placeholder={tr("tenLetterCode")}
                  maxLength={10}
                  autoComplete="off"
                />
                <p style={{ fontSize: "11px", color: "#555", marginTop: "6px" }}>
                  {tr("inviteCodeHint").split("support@10bottlevalue.co")[0]}
                  <span style={{ color: "#F5A623" }}>support@10bottlevalue.co</span>
                  {tr("inviteCodeHint").split("support@10bottlevalue.co")[1]}
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
              disabled={loading}
              style={{
                backgroundColor: loading ? "#b37a1a" : "#F5A623",
                color: "#000", padding: "14px",
                fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase", border: "none", borderRadius: "2px",
                cursor: loading ? "not-allowed" : "pointer",
                width: "100%", marginTop: "4px",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? tr("creatingAccount") : role === "client" ? tr("createAccountBtn") : tr("joinAsSupplierBtn")}
            </button>
          </form>

          <div style={{ textAlign: "center" }}>
            <Link href="/signin" style={{ color: "#888", fontSize: "13px" }}>
              {tr("alreadyHaveAccount")}{" "}
              <span style={{ color: "#F5A623" }}>{tr("signInNow")}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
