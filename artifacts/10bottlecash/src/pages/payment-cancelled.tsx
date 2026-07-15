import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { useLang } from "@/lib/i18n";

export function PaymentCancelled() {
  const [, navigate] = useLocation();
  const { tr } = useLang();
  const params = new URLSearchParams(window.location.search);
  const reason = params.get("reason") ?? "cancelled"; // "cancelled" | "expired" | "failed"

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const title =
    reason === "expired"
      ? tr("paymentExpiredTitle")
      : reason === "failed"
      ? tr("paymentFailedTitle")
      : tr("paymentCancelledTitle");

  const message =
    reason === "expired"
      ? tr("paymentExpiredMsg")
      : reason === "failed"
      ? tr("paymentFailedMsg")
      : tr("paymentCancelledMsg");

  return (
    <div
      style={{
        minHeight: "100dvh",
        backgroundColor: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          padding: "12px 24px",
          borderBottom: "1px solid #151515",
        }}
      >
        <Logo className="w-20 h-20" />
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            letterSpacing: "0.18em",
            fontSize: "15px",
            color: "#c8c8c8",
            textTransform: "uppercase",
            marginLeft: "-14px",
          }}
        >
          10BOTTLECASH
        </span>
      </header>

      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: "400px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "28px",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.4s ease, transform 0.4s ease",
          }}
        >
          {/* X circle */}
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              backgroundColor: "#ef444410",
              border: "1.5px solid #ef444440",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <line x1="9" y1="9" x2="23" y2="23" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="23" y1="9" x2="9" y2="23" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Title */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#ef4444",
                letterSpacing: "0.04em",
                marginBottom: "8px",
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "#888",
                lineHeight: "1.7",
                maxWidth: "300px",
              }}
            >
              {message}
            </div>
          </div>

          {/* Info box */}
          <div
            style={{
              width: "100%",
              backgroundColor: "#0a0a0a",
              border: "1px solid #1a1a1a",
              borderRadius: "4px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#ef4444",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: "12px", color: "#666", lineHeight: "1.6" }}>
              {tr("noFundsCharged")}{" "}
              <span style={{ color: "#ef4444", fontWeight: 600 }}>{tr("unpaidLabel")}</span>.
            </span>
          </div>

          {/* Buttons */}
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
            <button
              onClick={() => navigate("/")}
              style={{
                backgroundColor: "#F5A623",
                color: "#000",
                padding: "14px",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                border: "none",
                borderRadius: "2px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              {tr("tryAgainBtn")}
            </button>
            <button
              onClick={() => navigate("/")}
              style={{
                backgroundColor: "transparent",
                color: "#555",
                padding: "12px",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                border: "1px solid #222",
                borderRadius: "2px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              {tr("backToHomeBtn")}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
