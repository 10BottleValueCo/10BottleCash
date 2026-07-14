import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { Logo } from "@/components/logo";

type PaymentForm = {
  supplierName: string;
  orderNumber: string;
  amount: string;
};

export function Home() {
  const { register, handleSubmit } = useForm<PaymentForm>({
    defaultValues: { supplierName: "", orderNumber: "", amount: "" }
  });

  const onSubmit = (data: PaymentForm) => {
    console.log("Payment data:", data);
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
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link href="/signin" style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#ffffff" }}>
            Sign In
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <form className="w-full flex flex-col gap-6" style={{ maxWidth: "340px" }} onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <label htmlFor="supplierName" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#ffffff" }}>
              Supplier Name
            </label>
            <input id="supplierName" {...register("supplierName")} style={{ backgroundColor: "#111111", border: "1px solid #333333", color: "#ffffff", padding: "10px 12px", fontSize: "13px", borderRadius: "2px", outline: "none", width: "100%" }} />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="orderNumber" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#ffffff" }}>
              Order Number
            </label>
            <input id="orderNumber" {...register("orderNumber")} style={{ backgroundColor: "#111111", border: "1px solid #333333", color: "#ffffff", padding: "10px 12px", fontSize: "13px", borderRadius: "2px", outline: "none", width: "100%" }} />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="amount" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#ffffff" }}>
              Amount
            </label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#888888", fontFamily: "monospace", fontSize: "13px" }}>$</span>
              <input id="amount" placeholder="0.00" {...register("amount")} style={{ backgroundColor: "#111111", border: "1px solid #333333", color: "#ffffff", padding: "10px 12px 10px 26px", fontSize: "13px", borderRadius: "2px", outline: "none", width: "100%", fontFamily: "monospace" }} />
            </div>
          </div>

          <button type="submit" style={{ backgroundColor: "#F5A623", color: "#000000", padding: "14px", fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", border: "none", borderRadius: "2px", cursor: "pointer", width: "100%", marginTop: "4px" }}>
            $ Pay With Cash App
          </button>
        </form>
      </main>
    </div>
  );
}
