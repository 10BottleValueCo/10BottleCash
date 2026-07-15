import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Logo } from "@/components/logo";
import { updateOrderStatus, getOrders } from "@/lib/auth";

type State = "checking" | "settled" | "pending" | "error";

export function PaymentReturn() {
  const [, navigate] = useLocation();
  const [state, setState] = useState<State>("checking");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invoiceId = params.get("invoiceId");

    if (!invoiceId) {
      setState("error");
      return;
    }

    const check = async () => {
      try {
        const res = await fetch(`/api/payments/status/${invoiceId}`);
        if (!res.ok) throw new Error("status fetch failed");
        const data = (await res.json()) as { status: string; orderId: string | null };

        if (data.status === "Settled" || data.status === "Complete" || data.status === "settled") {
          if (data.orderId) {
            await updateOrderStatus(data.orderId, "Completed");
            setOrderId(data.orderId);
          }
          setState("settled");
        } else if (data.status === "Expired" || data.status === "Invalid") {
          if (data.orderId) {
            await updateOrderStatus(data.orderId, "Unpaid");
          } else {
            const orders = await getOrders();
            const o = orders.find(ord => ord.invoiceId === invoiceId);
            if (o) await updateOrderStatus(o.id, "Unpaid");
          }
          setState("error");
        } else {
          setState("pending");
          setTimeout(check, 3000);
        }
      } catch {
        setState("error");
      }
    };

    check();
  }, []);

  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#000", color: "#fff", display: "flex", flexDirection: "column" }}>
      <header style={{ display: "flex", alignItems: "center", padding: "12px 24px", borderBottom: "1px solid #151515" }}>
        <Logo className="w-20 h-20" />
        <span style={{ fontFamily: "'Space Mono', monospace", letterSpacing: "0.18em", fontSize: "15px", color: "#c8c8c8", textTransform: "uppercase", marginLeft: "-14px" }}>
          10BOTTLECASH
        </span>
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        {state === "checking" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "28px", marginBottom: "16px" }}>⏳</div>
            <div style={{ fontSize: "14px", color: "#aaa" }}>Checking payment status…</div>
          </div>
        )}

        {state === "pending" && (
          <div style={{ textAlign: "center", maxWidth: "340px" }}>
            <div style={{ fontSize: "28px", marginBottom: "16px" }}>🔄</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#F5A623", marginBottom: "8px" }}>Payment processing</div>
            <div style={{ fontSize: "13px", color: "#888", lineHeight: "1.6", marginBottom: "24px" }}>
              Your payment is being confirmed. This may take a moment.
            </div>
            <div style={{ fontSize: "12px", color: "#555" }}>Checking automatically…</div>
          </div>
        )}

        {state === "settled" && (
          <div style={{ textAlign: "center", maxWidth: "340px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#22c55e18", border: "1px solid #22c55e44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>✓</div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#22c55e", marginBottom: "8px" }}>Payment Confirmed!</div>
              {orderId && <div style={{ fontSize: "12px", color: "#555", fontFamily: "monospace", marginBottom: "8px" }}>{orderId}</div>}
              <div style={{ fontSize: "13px", color: "#888", lineHeight: "1.6" }}>
                Your order has been marked as <span style={{ color: "#22c55e", fontWeight: 600 }}>Completed</span>. The supplier has been notified.
              </div>
            </div>
            <button onClick={() => navigate("/")} style={{ backgroundColor: "#F5A623", color: "#000", padding: "12px 32px", fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", border: "none", borderRadius: "2px", cursor: "pointer" }}>
              New Payment
            </button>
          </div>
        )}

        {state === "error" && (
          <div style={{ textAlign: "center", maxWidth: "340px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#ef444418", border: "1px solid #ef444444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>✗</div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#ef4444", marginBottom: "8px" }}>Payment not completed</div>
              <div style={{ fontSize: "13px", color: "#888", lineHeight: "1.6" }}>
                The payment was not confirmed. Your order remains in <span style={{ color: "#60a5fa", fontWeight: 600 }}>Processing</span> status.
              </div>
            </div>
            <button onClick={() => navigate("/")} style={{ backgroundColor: "#1a1a1a", color: "#fff", padding: "12px 32px", fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", border: "1px solid #333", borderRadius: "2px", cursor: "pointer" }}>
              Try Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
