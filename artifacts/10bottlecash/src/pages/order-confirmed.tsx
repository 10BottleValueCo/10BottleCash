import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Logo } from "@/components/logo";
import { useLang } from "@/lib/i18n";

export function OrderConfirmed() {
  const [, navigate] = useLocation();
  const { tr } = useLang();
  const params = new URLSearchParams(window.location.search);
  const orderNumber = params.get("orderNumber") ?? "";
  const amount = params.get("amount") ?? "";
  const supplierName = params.get("supplier") ?? "";

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

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
          {/* Check circle */}
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              backgroundColor: "#22c55e10",
              border: "1.5px solid #22c55e60",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <polyline
                points="6,16 13,23 26,9"
                stroke="#22c55e"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Title */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#22c55e",
                letterSpacing: "0.04em",
                marginBottom: "8px",
              }}
            >
              {tr("paymentConfirmed")}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#555",
                fontFamily: "'Space Mono', monospace",
                letterSpacing: "0.08em",
              }}
            >
              {tr("txComplete")}
            </div>
          </div>

          {/* Order details card */}
          <div
            style={{
              width: "100%",
              backgroundColor: "#0a0a0a",
              border: "1px solid #1a1a1a",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div style={{ height: "2px", backgroundColor: "#F5A623", width: "100%" }} />
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <Row label={tr("orderId")} value={orderNumber} mono highlight />
              {supplierName && <Row label={tr("supplierLabel")} value={supplierName} />}
              {amount && <Row label={tr("amountCol")} value={amount} mono />}
              <Row label={tr("statusCol")} value={tr("statusCompleted")} green />
            </div>
          </div>

          <div
            style={{
              fontSize: "12px",
              color: "#555",
              textAlign: "center",
              lineHeight: "1.7",
            }}
          >
            {tr("supplierNotified")}
          </div>

          <button
            onClick={() => navigate("/")}
            style={{
              backgroundColor: "#F5A623",
              color: "#000",
              padding: "14px 40px",
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
            {tr("makeAnotherPayment")}
          </button>
        </div>
      </main>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  highlight,
  green,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
  green?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <span
        style={{
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#555",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: mono ? "12px" : "13px",
          fontFamily: mono ? "'Space Mono', monospace" : undefined,
          color: green ? "#22c55e" : highlight ? "#F5A623" : "#ffffff",
          fontWeight: highlight || green ? 700 : 500,
          letterSpacing: mono ? "0.06em" : undefined,
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}
