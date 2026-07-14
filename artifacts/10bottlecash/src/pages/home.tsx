import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { Logo } from "@/components/logo";
import { useLang } from "@/lib/i18n";
import { findSupplierByName, addOrder, getCurrentUser } from "@/lib/auth";

type PaymentForm = { supplierName: string; orderNumber: string; amount: string };

function genOrderId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return "INV-" + s;
}

export function Home() {
  const { tr } = useLang();
  const [, navigate] = useLocation();
  const currentUser = getCurrentUser();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<PaymentForm>({
    defaultValues: { supplierName: "", orderNumber: "", amount: "" }
  });
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: PaymentForm) => {
    setSubmitError("");
    const gross = parseFloat(data.amount);
    if (!data.supplierName.trim() || !data.orderNumber.trim() || isNaN(gross) || gross <= 0) {
      setSubmitError("Please fill in all fields with valid values.");
      return;
    }
    const supplier = findSupplierByName(data.supplierName);
    if (!supplier) {
      setSubmitError("Supplier not found. Please check the supplier name.");
      return;
    }

    // Create order in localStorage (Processing)
    const order = addOrder({
      supplierEmail: supplier.email,
      supplierName: supplier.name,
      orderNumber: data.orderNumber.trim(),
      amount: "$" + gross.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      status: "Processing",
    });

    // Create payment invoice via backend
    setLoading(true);
    try {
      const returnUrl =
        window.location.origin +
        import.meta.env.BASE_URL +
        "payment-return";

      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: gross.toFixed(2),
          orderId: order.id,
          returnUrl,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? "Payment service unavailable");
      }

      const { checkoutLink, invoiceId } = await res.json() as { checkoutLink: string; invoiceId: string };
      // Save invoiceId to the order so dashboard can poll status
      const { getOrders, saveOrders } = await import("@/lib/auth");
      const orders = getOrders();
      const idx = orders.findIndex(o => o.id === order.id);
      if (idx !== -1) { orders[idx].invoiceId = invoiceId; saveOrders(orders); }
      // Redirect customer to CatalystPay checkout
      window.location.href = checkoutLink;
    } catch (err: unknown) {
      setLoading(false);
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setSubmitError(msg);
    }
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: "#111111", border: "1px solid #333333", color: "#ffffff",
    padding: "10px 12px", fontSize: "13px", borderRadius: "2px", outline: "none", width: "100%",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em",
    textTransform: "uppercase", color: "#ffffff",
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col">
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Logo className="w-20 h-20" />
          <span style={{ fontFamily: "'Space Mono', monospace", letterSpacing: "0.18em", fontSize: "15px", color: "#c8c8c8", fontWeight: 400, textTransform: "uppercase", marginLeft: "-14px" }}>
            10BOTTLECASH
          </span>
        </div>
        {currentUser ? (
          <button
            onClick={() => navigate(currentUser.role === "admin" ? "/admin" : "/dashboard")}
            style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#F5A623", background: "none", border: "none", cursor: "pointer" }}
          >
            {currentUser.role === "admin" ? "ADMIN" : "DASHBOARD"} →
          </button>
        ) : (
          <Link href="/signin" style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#ffffff" }}>
            {tr("signIn")}
          </Link>
        )}
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
          {/* ── Payment form ── */}
          <form className="w-full flex flex-col gap-6" style={{ maxWidth: "340px" }} onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-2">
              <label style={labelStyle}>{tr("supplierName")}</label>
              <input
                {...register("supplierName", { required: true })}
                style={{ ...inputStyle, borderColor: errors.supplierName ? "#ef4444" : "#333333" }}
                placeholder="Enter supplier name"
                onBlur={(e) => {
                  const name = e.target.value.trim();
                  if (name && findSupplierByName(name)) setValue("orderNumber", genOrderId());
                  else if (name) setValue("orderNumber", "");
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label style={labelStyle}>ORDER ID</label>
              <input
                {...register("orderNumber", { required: true })}
                style={{ ...inputStyle, borderColor: errors.orderNumber ? "#ef4444" : "#333333" }}
                placeholder="e.g. ORD-1234"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label style={labelStyle}>{tr("amount")}</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#888888", fontFamily: "monospace", fontSize: "13px" }}>$</span>
                <input
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...register("amount", { required: true, min: 0.01 })}
                  style={{ ...inputStyle, paddingLeft: "26px", fontFamily: "monospace", borderColor: errors.amount ? "#ef4444" : "#333333" }}
                />
              </div>
            </div>

            {submitError && (
              <div style={{ fontSize: "12px", color: "#ef4444", backgroundColor: "#ef444412", border: "1px solid #ef444433", borderRadius: "2px", padding: "8px 12px" }}>
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: loading ? "#b37a1a" : "#F5A623", color: "#000000", padding: "14px", fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", border: "none", borderRadius: "2px", cursor: loading ? "not-allowed" : "pointer", width: "100%", marginTop: "4px", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Redirecting to Cash App…" : tr("payWithCashApp")}
            </button>
          </form>
      </main>
    </div>
  );
}
