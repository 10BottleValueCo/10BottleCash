import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { Logo } from "@/components/logo";
import { useLang } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { findSupplierByName, addOrder, updateOrderInvoiceId } from "@/lib/auth";

type PaymentForm = { supplierName: string; orderNumber: string; amount: string };

function genOrderId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return "INV-" + s;
}

export function Home() {
  const { lang, setLang, tr } = useLang();
  const [, navigate] = useLocation();
  const { user: currentUser } = useAuth();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<PaymentForm>({
    defaultValues: { supplierName: "", orderNumber: "", amount: "" }
  });
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const lastSupplierRef = useRef("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onSubmit = async (data: PaymentForm) => {
    setSubmitError("");
    const gross = parseFloat(data.amount);
    if (!data.supplierName.trim() || !data.orderNumber.trim() || isNaN(gross) || gross <= 0) {
      setSubmitError(tr("fillAllFieldsValid"));
      return;
    }

    const supplier = await findSupplierByName(data.supplierName);
    if (!supplier) {
      setSubmitError(tr("supplierNotFound"));
      return;
    }

    // Create order in Supabase (Processing)
    setLoading(true);
    try {
      const order = await addOrder({
        supplierEmail: supplier.email,
        supplierName: supplier.name,
        orderNumber: data.orderNumber.trim(),
        amount: "$" + gross.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        status: "Processing",
        clientEmail: currentUser?.email,
      });

      // Create payment invoice via backend
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
          orderNumber: data.orderNumber.trim(),
          clientEmail: currentUser?.email ?? "",
          returnUrl,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string; detail?: string };
        throw new Error(err.detail ? `${err.error}: ${err.detail}` : (err.error ?? "Payment service unavailable"));
      }

      const { checkoutLink, invoiceId } = await res.json() as { checkoutLink: string; invoiceId: string };

      // Save invoiceId to the order so dashboard can poll status
      await updateOrderInvoiceId(order.id, invoiceId);

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
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Language toggle */}
          <div style={{ display: "flex", alignItems: "center", backgroundColor: "#111", border: "1px solid #2a2a2a", borderRadius: "4px", overflow: "hidden" }}>
            <button onClick={() => setLang("en")} style={{ padding: "5px 12px", fontSize: "11px", fontWeight: 700, border: "none", cursor: "pointer", backgroundColor: lang === "en" ? "#F5A623" : "transparent", color: lang === "en" ? "#000" : "#fff" }}>EN</button>
            <button onClick={() => setLang("zh")} style={{ padding: "5px 12px", fontSize: "20px", fontWeight: 700, border: "none", cursor: "pointer", backgroundColor: lang === "zh" ? "#F5A623" : "transparent", color: lang === "zh" ? "#000" : "#fff", fontFamily: "'Noto Sans SC', sans-serif" }}>中文</button>
          </div>
          {currentUser ? (
            <button
              onClick={() => navigate(currentUser.role === "admin" ? "/admin" : "/dashboard")}
              style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#F5A623", background: "none", border: "none", cursor: "pointer" }}
            >
              {currentUser.role === "admin" ? "ADMIN" : "DASHBOARD"} →
            </button>
          ) : (
            <>
              <Link href="/signup" style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#F5A623" }}>
                Sign Up
              </Link>
              <Link href="/signin" style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#ffffff" }}>
                {tr("signIn")}
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <form className="w-full flex flex-col gap-6" style={{ maxWidth: "340px" }} onSubmit={handleSubmit(onSubmit)}>
          {!currentUser && (
            <div style={{ backgroundColor: "#0d0d0d", border: "1px solid #F5A62344", borderRadius: "3px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ color: "#F5A623", fontSize: "14px" }}>🔒</span>
              <span style={{ fontSize: "11px", color: "#aaa", lineHeight: 1.5 }}>
                {tr("lang") === "zh" ? "付款前请先" : "To pay, please "}
                <Link href="/signup" style={{ color: "#F5A623", textDecoration: "none", fontWeight: 700 }}>
                  {tr("lang") === "zh" ? "注册" : "create an account"}
                </Link>
                {tr("lang") === "zh" ? "或" : " or "}
                <Link href="/signin" style={{ color: "#fff", textDecoration: "none", fontWeight: 700 }}>
                  {tr("lang") === "zh" ? "登录" : "sign in"}
                </Link>
              </span>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label style={labelStyle}>{tr("supplierName")}</label>
            <input
              {...register("supplierName", { required: true })}
              style={{ ...inputStyle, borderColor: errors.supplierName ? "#ef4444" : "#333333" }}
              placeholder={tr("enterSupplierPlaceholder")}
              onChange={async (e) => {
                const name = e.target.value.trim().toLowerCase();
                if (debounceRef.current) clearTimeout(debounceRef.current);
                if (!name) {
                  lastSupplierRef.current = "";
                  setValue("orderNumber", "");
                  return;
                }
                debounceRef.current = setTimeout(async () => {
                  if (name === lastSupplierRef.current) return;
                  lastSupplierRef.current = name;
                  const supplier = await findSupplierByName(name);
                  if (supplier) setValue("orderNumber", genOrderId());
                  else setValue("orderNumber", "");
                }, 400);
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label style={labelStyle}>ORDER ID</label>
            <input
              {...register("orderNumber", { required: true })}
              readOnly
              style={{
                ...inputStyle,
                borderColor: errors.orderNumber ? "#ef4444" : "#1e1e1e",
                backgroundColor: "#080808",
                color: "#F5A623",
                fontFamily: "'Space Mono', monospace",
                fontSize: "12px",
                letterSpacing: "0.08em",
                cursor: "default",
              }}
              placeholder={tr("enterSupplierFirst")}
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
                {...register("amount", {
                  required: true,
                  min: { value: 0.01, message: "Minimum amount is $0.01" },
                  validate: (v) => parseFloat(v) <= 999 || "Maximum amount is $999",
                })}
                onInput={(e) => {
                  const el = e.currentTarget;
                  if (parseFloat(el.value) > 999) el.value = "999";
                }}
                style={{ ...inputStyle, paddingLeft: "26px", fontFamily: "monospace", borderColor: errors.amount ? "#ef4444" : "#333333" }}
              />
            </div>
            {errors.amount && (
              <div style={{ fontSize: "11px", color: "#ef4444", fontFamily: "monospace", letterSpacing: "0.04em" }}>
                {errors.amount.type === "max" || errors.amount.type === "validate"
                  ? tr("maxAmountError")
                  : tr("minAmountError")}
              </div>
            )}
          </div>

          {submitError && (
            <div style={{ fontSize: "12px", color: "#ef4444", backgroundColor: "#ef444412", border: "1px solid #ef444433", borderRadius: "2px", padding: "8px 12px" }}>
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !currentUser}
            style={{ backgroundColor: (!currentUser || loading) ? "#4a4a4a" : "#F5A623", color: !currentUser ? "#888" : "#000000", padding: "14px", fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", border: "none", borderRadius: "2px", cursor: (!currentUser || loading) ? "not-allowed" : "pointer", width: "100%", marginTop: "4px", opacity: (!currentUser || loading) ? 0.5 : 1 }}
          >
            {loading ? tr("redirectingToCash") : tr("payWithCashApp")}
          </button>
        </form>
      </main>
    </div>
  );
}
