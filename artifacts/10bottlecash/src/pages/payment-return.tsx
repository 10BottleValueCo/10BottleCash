import { useEffect } from "react";
import { useLocation } from "wouter";
import { Logo } from "@/components/logo";
import { useLang } from "@/lib/i18n";
import { updateOrderStatus, getOrders } from "@/lib/auth";

export function PaymentReturn() {
  const [, navigate] = useLocation();
  const { tr } = useLang();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invoiceId = params.get("invoiceId");

    if (!invoiceId) {
      navigate("/payment-cancelled?reason=failed");
      return;
    }

    let attempts = 0;
    const MAX_ATTEMPTS = 20; // ~60 seconds

    const check = async () => {
      try {
        const res = await fetch(`/api/payments/status/${invoiceId}`);
        if (!res.ok) throw new Error("status fetch failed");
        const data = (await res.json()) as {
          status: string;
          orderId: string | null;
        };

        const settled =
          data.status === "Settled" ||
          data.status === "Complete" ||
          data.status === "settled";
        const failed =
          data.status === "Expired" ||
          data.status === "Invalid" ||
          data.status === "expired" ||
          data.status === "invalid";

        if (settled) {
          if (data.orderId) {
            await updateOrderStatus(data.orderId, "Completed");
          }

          let orderNumber = "";
          let amount = "";
          let supplierName = "";
          try {
            const orders = await getOrders();
            const order = data.orderId
              ? orders.find((o) => o.id === data.orderId)
              : orders.find((o) => o.invoiceId === invoiceId);
            if (order) {
              orderNumber = order.orderNumber;
              amount = order.amount;
              supplierName = order.supplierName;
            }
          } catch {
            // non-critical
          }

          const qs = new URLSearchParams({ orderNumber, amount, supplier: supplierName }).toString();
          navigate(`/order-confirmed?${qs}`);
        } else if (failed) {
          if (data.orderId) {
            await updateOrderStatus(data.orderId, "Unpaid");
          } else {
            try {
              const orders = await getOrders();
              const o = orders.find((ord) => ord.invoiceId === invoiceId);
              if (o) await updateOrderStatus(o.id, "Unpaid");
            } catch {
              // non-critical
            }
          }
          navigate("/payment-cancelled?reason=expired");
        } else {
          attempts++;
          if (attempts >= MAX_ATTEMPTS) {
            navigate("/payment-cancelled?reason=failed");
          } else {
            setTimeout(check, 3000);
          }
        }
      } catch {
        attempts++;
        if (attempts >= MAX_ATTEMPTS) {
          navigate("/payment-cancelled?reason=failed");
        } else {
          setTimeout(check, 3000);
        }
      }
    };

    setTimeout(check, 1500);
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
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "2px solid #1a1a1a",
              borderTopColor: "#F5A623",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#555",
              fontFamily: "'Space Mono', monospace",
            }}
          >
            {tr("verifyingPayment")}
          </div>
        </div>
      </main>
    </div>
  );
}
