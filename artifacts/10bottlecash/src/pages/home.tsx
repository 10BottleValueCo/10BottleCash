import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { Logo } from "@/components/logo";
import { useLang } from "@/lib/i18n";
import { findSupplierByName, addOrder } from "@/lib/auth";

type PaymentForm = { supplierName: string; orderNumber: string; amount: string };

export function Home() {
  const { tr } = useLang();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PaymentForm>({
    defaultValues: { supplierName: "", orderNumber: "", amount: "" }
  });
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (data: PaymentForm) => {
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
    addOrder({
      supplierEmail: supplier.email,
      supplierName: supplier.name,
      orderNumber: data.orderNumber.trim(),
      amount: "$" + gross.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      status: "Processing",
    });
    setSubmitted(true);
    reset();
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
        <Link href="/signin" style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#ffffff" }}>
          {tr("signIn")}
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        {submitted ? (
          /* ── Success state ── */
          <div style={{ maxWidth: "340px", width: "100%", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#22c55e18", border: "1px solid #22c55e44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px" }}>
              ✓
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#22c55e", marginBottom: "8px" }}>Payment submitted</div>
              <div style={{ fontSize: "13px", color: "#888", lineHeight: "1.6" }}>
                Your order has been created with status <span style={{ color: "#60a5fa", fontWeight: 600 }}>Processing</span>. The supplier will confirm receipt shortly.
              </div>
            </div>
            <button
              onClick={() => setSubmitted(false)}
              style={{ backgroundColor: "#F5A623", color: "#000", padding: "12px 32px", fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", border: "none", borderRadius: "2px", cursor: "pointer" }}
            >
              New Payment
            </button>
          </div>
        ) : (
          /* ── Payment form ── */
          <form className="w-full flex flex-col gap-6" style={{ maxWidth: "340px" }} onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-2">
              <label style={labelStyle}>{tr("supplierName")}</label>
              <input
                {...register("supplierName", { required: true })}
                style={{ ...inputStyle, borderColor: errors.supplierName ? "#ef4444" : "#333333" }}
                placeholder="Enter supplier name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label style={labelStyle}>ORDER NUMBER</label>
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
              style={{ backgroundColor: "#F5A623", color: "#000000", padding: "14px", fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", border: "none", borderRadius: "2px", cursor: "pointer", width: "100%", marginTop: "4px" }}
            >
              {tr("payWithCashApp")}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
